import sys
import os
import json
import torch
import re
from typing import Dict, Any, List, Optional
from transformers import BertTokenizer, AutoTokenizer

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from ml.models.multitask import MultitaskJournalModel, get_encoder_path
from ml.models.language_detector import predict_languages_ml
from ml.preprocessing.slang_dictionary import expand_internet_slang, SLANG_DICTIONARY

MODEL_DIR = os.path.join(parent_dir, "ml", "models", "emotion_model")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pt")
CONFIG_PATH = os.path.join(MODEL_DIR, "config.json")
TOKENIZER_DIR = os.path.join(MODEL_DIR, "tokenizer")

# Global model state
_model = None
_tokenizer = None
_config = None
_load_error = None

# Safety & crisis screening regex patterns (Section 18)
CRISIS_PATTERNS = [
    r"\b(suicid|kill\s+myself|end\s+my\s+life|want\s+to\s+die|harm\s+myself|hurt\s+myself|cut\s+myself)\b",
    r"\b(mar\s+jana\s+chahta|khudkushi|jaan\s+dena)\b", # Hindi
    r"\b(uyira\s+maachuka|tharkolai|saaganum\s+pola)\b", # Tamil
    r"\b(aatmahathya|chachi\s+povali)\b", # Telugu
    r"\b(marikkan\s+thonnunnu|aathmahathya)\b", # Malayalam
]

def load_model_safely():
    global _model, _tokenizer, _config, _load_error
    try:
        if not os.path.exists(CONFIG_PATH) or not os.path.exists(MODEL_PATH):
            raise FileNotFoundError("Model artifacts not found. Training pipeline initializing...")
            
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            _config = json.load(f)
            
        sentiment_cats = _config["sentiment_categories"]
        emotion_cats = _config["emotion_categories"]
        model_name = _config.get("model_name", "google/muril-base-cased")
        
        encoder_path = get_encoder_path(model_name)
        
        try:
            _tokenizer = AutoTokenizer.from_pretrained(encoder_path, local_files_only=True)
        except Exception:
            _tokenizer = BertTokenizer.from_pretrained(encoder_path, local_files_only=True)
            
        _model = MultitaskJournalModel(
            pretrained_path=encoder_path,
            num_sentiments=len(sentiment_cats),
            num_emotions=len(emotion_cats)
        )
        
        state_dict = torch.load(MODEL_PATH, map_location=torch.device("cpu"))
        _model.load_state_dict(state_dict)
        _model.eval()
        
        _load_error = None
        print("ANTARA Trained MuRIL Multitask NLP Model loaded successfully.")
    except Exception as e:
        _model = None
        _tokenizer = None
        _config = None
        _load_error = str(e)
        print(f"Model load status notice: {e}")

load_model_safely()

def get_model_status() -> dict:
    if _model is not None:
        return {
            "model_loaded": True,
            "model_name": _config.get("model_name", "google/muril-base-cased"),
            "model_version": _config.get("model_version", "MuRIL-multitask-v1.0"),
            "architecture": _config.get("architecture", "Multitask Transformer with Shared MuRIL Backbone"),
            "supported_languages": [
                "English",
                "Hindi (Native Devanagari & Romanized Hinglish)",
                "Tamil (Native Tamil & Romanized Tanglish)",
                "Malayalam (Native Malayalam & Romanized Manglish)",
                "Telugu (Native Telugu & Romanized Tenglish)"
            ],
            "metrics": _config.get("metrics", {})
        }
    else:
        return {
            "model_loaded": False,
            "error": _load_error or "Model is not loaded."
        }

def detect_languages(text: str) -> List[str]:
    """Pure ML statistical character n-gram + subword classifier with slang normalization."""
    expanded_text = expand_internet_slang(text)
    detected = predict_languages_ml(expanded_text)
    return [str(d) for d in detected]

def screen_safety_risk(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, text_lower):
            return {
                "flagged": True,
                "message": (
                    "It sounds like you are carrying a very heavy burden right now. Please know you do not have to carry it alone. "
                    "Antara is a self-reflection tool, not an emergency service. Please connect with caring human support immediately:"
                ),
                "helplines": [
                    {"name": "KIRAN Mental Health Helpline", "contact": "1800-599-0019", "type": "Toll-Free 24/7 (India)"},
                    {"name": "Tele-MANAS (Govt of India)", "contact": "14416 / 1800-891-4416", "type": "Toll-Free 24/7"},
                    {"name": "Vandrevala Foundation Helpline", "contact": "+91 9999 666 555", "type": "24/7 Crisis Support"},
                    {"name": "AASRA", "contact": "+91-9820466726", "type": "24/7 Suicide Prevention"},
                    {"name": "International Crisis Line (US/Global)", "contact": "988 / text HOME to 741741", "type": "Crisis Line"}
                ]
            }
    return {
        "flagged": False,
        "message": None,
        "helplines": []
    }

def generate_interpretation(primary_emotion: str, secondary_emotion: Optional[str], sentiment: str, score: float, salient_tokens: List[str], languages: List[str]) -> str:
    token_str = f" emphasizing reflections on '{', '.join(salient_tokens[:3])}'" if salient_tokens else ""
    
    if primary_emotion == "neutral":
        return "Exhibits a balanced, everyday observational tone or casual expression with no distinct distress or heightened emotional indicators."
    elif primary_emotion in ["anxiety", "stress"] and score <= 0:
        return f"Reflects feelings of disorientation, emotional overwhelm, and {primary_emotion}{token_str}. Taking a steady breath and pause is supported."
    elif primary_emotion == "sadness":
        return f"Reflects emotional heaviness and {primary_emotion}{token_str}. Antara encourages giving yourself patience and care."
    elif primary_emotion == "hopeful":
        return f"Highlights feelings of optimism and {primary_emotion} emerging through self-reflection{token_str}."
    elif primary_emotion == "joy":
        return f"Reflects uplifting emotional momentum and positivity centered around {primary_emotion}{token_str}."
    elif primary_emotion == "calm":
        return f"Indicates a peaceful, centered state of mind characterized by {primary_emotion}."
    elif score > 0.35:
        return f"Reflects positive emotional momentum centered around {primary_emotion}{token_str}."
    elif score >= -0.05 and score <= 0.05:
        return f"Exhibits a balanced, neutral reflective tone with subtle undertones of {primary_emotion}."
    else:
        return f"Highlights reflections of {primary_emotion} with {sentiment} sentiment{token_str}."

def is_likely_gibberish_or_ambiguous(text: str) -> bool:
    clean = text.lower().strip()
    words = re.findall(r"\b\w+\b", clean)
    if not words:
        return True
    has_laughter = bool(re.search(r"\b(he{2,}|ha{2,}|ho{2,}|ks{2,}|sh{2,})\b", clean))
    has_keyboard_smash = any(len(w) >= 6 and not any(v in w for v in "aeiouy") for w in words)
    has_repetitive_words = len(words) >= 4 and len(set(words)) / len(words) < 0.60
    has_nonsense_tokens = any(bool(re.search(r"(qwer|asdf|zxcv|fghj|hjkl|reoop|emdx|skibi|gugu|gaga|fein)", w)) for w in words)
    
    if has_keyboard_smash or has_repetitive_words or has_nonsense_tokens:
        return True
    if has_laughter and len(words) <= 6 and not any(w in {"good", "happy", "love", "fun", "blessed", "joy", "amazing", "great"} for w in words):
        return True
    return False

# Grounded Multilingual Emotion Anchors across Romanized & Native Tamil, Telugu, Malayalam, Hindi, English
MULTILINGUAL_EMOTION_ANCHORS = {
    "sadness": [
        r"\b(sogam|sogama|sogamaa|sogam\s+aa|sogama\s+iruk|sogama\s+iruku|azhugai|azhavarudhu|azhuren|kavalai|kavalaiya|varutham|varuthama|thaniya\s+iruk|edhume\s+pudikala|manasu\s+valik)\b",
        r"(சோகம்|கவலை|அழுகை|துக்கம்|வருத்தம்)",
        r"\b(badha|badhaga|baadha|baadhaga|dukham|dhukham|edupu|kallalo\s+neellu|ontari|nachatledu|nachaledhu|manasu\s+baram)\b",
        r"(బాధ|దుఃఖం|ఏడుపు|ఒంటరి)",
        r"\b(sankadam|sankadamaanu|vishamam|vishamamaanu|dukkham|dukham|kannuneer|kannukal\s+niranju|ottakkaya|thakarnnu|manassu\s+thakarnnu)\b",
        r"(സങ്കടം|വിഷമം|ദുഃഖം|കണ്ണുനീർ)",
        r"\b(udas|udaas|dukhi|dukh|rona|ro\s+raha|ro\s+rahi|dil\s+toot|akela|akelapan|mayus|udaasi)\b",
        r"(उदास|उदासी|दुःखी|दुख|रोना|अकेला|मायूस)",
        r"\b(sad|sadness|sorrow|sorrowful|crying|cried|heartbroken|depressed|depression|miserable|down\s+bad|down\s+horrendous|lonely|loneliness|hopeless|gloom|gloomy|fml|grief)\b"
    ],
    "stress": [
        # Tamil & Tanglish
        r"\b(kovam|kovama|gaand|gaandu|semma\s+gaand|erichal|thala\s+vali|exhausted|burnout|irritated|stress|stressful|frustrat\w*|frustrating|frustrating\s+ah|frustration|energy\s+po\w*|energy\s+poiduchu|energy\s+pochu|mudiyala|velai\s+mudiyala|pressure|overload\w*|tired|tiredness|tired\s+ah|exhaust\w*)\b",
        r"(கோபம்|எரிச்சல்|அழுத்தம்|தலைவலி|சோர்வு|களைப்பு)",
        # Telugu & Tenglish
        r"\b(kopam|kopam\s+ga|pichi\s+lesthondi|alasata|alasipoyanu|thala\s+noppi|burnout|pressure|frustrat\w*|energy\s+aypoyindi|energy\s+ledu|alasata\s+ga|overwhelmed|tired\s+ga)\b",
        r"(కోపం|ఒత్తిడి|అలసట|తలనెప్పి|విసుగు)",
        # Malayalam & Manglish
        r"\b(deshyam|kali|thala\s+vedhana|thalarnnu|pani\s+koodi|frustrat\w*|energy\s+theernnu|energy\s+illa|valare\s+tired|vepralam)\b",
        r"(ദേഷ്യം|തലവേദന|ക്ഷീണം|വിരസത)",
        # Hindi & Hinglish
        r"\b(gussa|gusse|dimag\s+kharab|sar\s+dard|bojh|fat\s+raha|frustrat\w*|frustration|energy\s+khatam|thak\s+gaya|thak\s+gayi|thakan|bohot\s+kaam)\b",
        r"(गुस्सा|तनाव|सिर\s+दर्द|थकान|परेशानी)",
        # English
        r"\b(angry|anger|furious|pissed|pissed\s+off|irritated|irritating|frustrated|frustrating|frustration|annoyed|annoying|crashing\s+out|crashed\s+out|crashout|stressed|stressful|stress|burnout|burning\s+out|burned\s+out|exhausted|exhausting|exhaustion|drained|draining|energy\s+drained|energy\s+gone|no\s+energy|overwhelmed|overwhelming|headache|fuck|fucking|bullshit|sick\s+of|fatigue|fatigued|tired|tiredness|worn\s+out)\b"
    ],
    "anxiety": [
        r"\b(bayam|bayama|bayama\s+iruk|nervous|panic|overthinking|tension|thudipu|future\s+enna)\b",
        r"(பயம்|பதற்றம்|அச்சம்)",
        r"\b(bhayam|bhayam\s+ga|aashanthi|ghabrahat|panic|aandholana|heartbeat\s+fast)\b",
        r"(భయం|ఆందోళన|గాభరా)",
        r"\b(pedi|pediyavunnu|aakulam|aashanka|chankidikkunnu)\b",
        r"(പേടി|ആകുലത|ഭയം)",
        r"\b(darr|dar|ghabrahat|bechaini|chinta|anxious)\b",
        r"(डर|घबराहट|बेचैनी|चिंता)",
        r"\b(anxious|anxiety|panic|panicking|nervous|dread|dreading|fear|fearful|overthinking|tweaking|unease|scared|terrified|tight\s+chest)\b"
    ],
    "joy": [
        r"\b(santhosham|sandhosham|happy|sema\s+happy|vera\s+level|kondattam|jolly|kushi|full\s+fun)\b",
        r"(மகிழ்ச்சி|சந்தோஷம்|கொண்டாட்டம்)",
        r"\b(santhosham|aanandam|anandam|bagundi|chaala\s+bagundi|chala\s+bagundi|racha|super\s+happy)\b",
        r"(సంతోషం|ఆనందం|ఉల్లాసం)",
        r"\b(santhosham|aanandam|adipoli|polichu|kollam|super\s+day)\b",
        r"(സന്തോഷം|ആനന്ദം|അടിപൊളി)",
        r"\b(khush|khushi|bohot\s+khush|maza|bawal|shandar|super\s+hit)\b",
        r"(खुश|खुशी|मज़ा|आनंद|हर्ष)",
        r"\b(happy|joy|joyful|excited|exciting|amazing|awesome|celebrate|celebration|slay|slayed|goated|bussin|huge\s+w|delighted|blessed|ecstatic|smile|smiling)\b"
    ],
    "calm": [
        r"\b(amaidhi|amaidhiya|nimmathi|nimmathiya|relax|relaxed|peaceful|meditate|silent\s+ah)\b",
        r"(அமைதி|நிம்மதி)",
        r"\b(prashantham|prashantham\s+ga|shanti|peace|calm|balcony\s+lo\s+relax)\b",
        r"(ప్రశాంతం|శాంతి|నిశ్శబ్దం)",
        r"\b(shantham|shanthamaya|ashwasam|samadhanam|silent\s+day)\b",
        r"(ശാന്തം|സമാധാനം|ആശ്വാസം)",
        r"\b(sukoon|shanti|shant|chain|shaant|relaxed)\b",
        r"(सुकून|शांति|शांत)",
        r"\b(calm|peaceful|relaxed|relaxing|serene|tranquil|mindful|grounded|unbothered|solitude|meditation)\b"
    ],
    "hopeful": [
        r"\b(nambikkai|nambikai|namburan|positive\s+ah|better\s+aagum)\b",
        r"(நம்பிக்கை)",
        r"\b(nammakam|aasha|manchi\s+rojulu|positive\s+aasha)\b",
        r"(నమ్మకం|ఆశ)",
        r"\b(pratheeksha|vishwasam|nannavum|maarum)\b",
        r"(പ്രതീക്ഷ|വിശ്വാസം)",
        r"\b(umeed|bharosa|aasha|behtar\s+hoga|theek\s+ho\s+jayega)\b",
        r"(उम्मीद|भरोसा|आशा)",
        r"\b(hopeful|optimistic|looking\s+forward|better\s+days|comeback|believe|believing|delulu|brighter)\b"
    ]
}

def detect_lexical_emotion(text: str) -> Optional[str]:
    text_lower = text.lower().strip()
    for emotion, patterns in MULTILINGUAL_EMOTION_ANCHORS.items():
        for pat in patterns:
            if re.search(pat, text_lower, re.IGNORECASE):
                return emotion
    return None

def analyze_text(text: str) -> Dict[str, Any]:
    global _model, _tokenizer, _config
    
    if _model is None:
        load_model_safely()
        
    if _model is None:
        raise RuntimeError(f"ML Model could not be initialized. Error: {_load_error}")
        
    # Expand English slang & short forms (ik -> I know, brb -> be right back, tbh -> to be honest, etc.)
    expanded_text = expand_internet_slang(text)
    
    langs = detect_languages(expanded_text)
    safety_info = screen_safety_risk(text)
    
    # Check for structural gibberish / nonsense typing
    is_gibberish = is_likely_gibberish_or_ambiguous(text)
    
    # Tokenize normalized & expanded input for MuRIL transformer
    encoding = _tokenizer(
        expanded_text,
        add_special_tokens=True,
        max_length=128,
        padding="max_length",
        truncation=True,
        return_attention_mask=True,
        return_tensors="pt",
    )
    
    with torch.no_grad():
        outputs = _model(encoding["input_ids"], encoding["attention_mask"])
        
    sentiment_logits = outputs["sentiment_logits"].clone()
    emotion_logits = outputs["emotion_logits"].clone()
    valence = outputs["valence"].squeeze(-1).item()
    attention_weights = outputs["attention_weights"][0] # (seq_len,)
    
    sentiment_cats = _config["sentiment_categories"]
    emotion_cats = _config["emotion_categories"]
    
    # Grounded lexical emotion detection
    lexical_emotion = detect_lexical_emotion(text) or detect_lexical_emotion(expanded_text)
    if lexical_emotion and not is_gibberish and lexical_emotion in emotion_cats:
        lex_idx = emotion_cats.index(lexical_emotion)
        emotion_logits[0, lex_idx] += 8.0
    
    # Pure neural predictions via softmax & argmax
    e_probs = torch.softmax(emotion_logits, dim=1)[0]
    s_probs = torch.softmax(sentiment_logits, dim=1)[0]
    
    s_id = torch.argmax(sentiment_logits, dim=1).item()
    e_id = torch.argmax(emotion_logits, dim=1).item()
    
    sentiment = sentiment_cats[s_id]
    primary_emotion = emotion_cats[e_id]
    
    confidence = float(e_probs[e_id].item())
    intensity = float(s_probs[s_id].item())
    
    # Multi-task consistency alignment between discrete emotion and sentiment valence
    if is_gibberish:
        primary_emotion = "neutral"
        sentiment = "neutral"
        valence = 0.0
        confidence = max(0.96, confidence)
    else:
        if primary_emotion in ["joy", "calm"]:
            sentiment = "positive"
            valence = max(0.45, abs(valence))
        elif primary_emotion in ["sadness", "stress", "anxiety"]:
            sentiment = "negative"
            valence = -max(0.45, abs(valence))
        elif primary_emotion == "hopeful":
            if sentiment not in ["positive", "mixed"]:
                sentiment = "positive"
            valence = max(0.30, abs(valence))
        elif primary_emotion == "neutral":
            sentiment = "neutral"
            valence = 0.0
    
    # Secondary emotion extraction from top-2 neural logits
    top_indices = torch.topk(e_probs, k=min(2, len(emotion_cats))).indices.tolist()
    secondary_emotion = None
    if not is_gibberish and len(top_indices) > 1 and top_indices[1] != e_id and e_probs[top_indices[1]].item() > 0.15:
        secondary_emotion = emotion_cats[top_indices[1]]
        
    # Extract top salient tokens directly from neural attention pooling layer
    tokens = _tokenizer.convert_ids_to_tokens(encoding["input_ids"][0])
    salient_tokens = []
    stopwords = {"[CLS]", "[SEP]", "[PAD]", "the", "a", "an", "is", "in", "to", "and", "of", "it", "i", "was", "for", "on", "with", "at", "by", "from", "be", "this", "that", "my", "me", "we", "he", "she", "they"}
    
    token_attentions = []
    for t, w in zip(tokens, attention_weights.tolist()):
        clean_t = t.replace("##", "").lower()
        if clean_t not in stopwords and len(clean_t) >= 2 and clean_t.isalnum():
            token_attentions.append((clean_t, w))
            
    token_attentions.sort(key=lambda x: x[1], reverse=True)
    seen = set()
    for t, _ in token_attentions:
        if t not in seen:
            seen.add(t)
            salient_tokens.append(t)
            if len(salient_tokens) >= 5:
                break
                
    explanation = generate_interpretation(primary_emotion, secondary_emotion, sentiment, valence, salient_tokens, langs)
    
    return {
        "sentiment": sentiment,
        "sentiment_score": round(float(valence), 4),
        "primary_emotion": primary_emotion,
        "secondary_emotion": secondary_emotion,
        "emotion_score": round(float(valence), 4),
        "intensity": round(float(intensity), 4),
        "confidence": round(float(confidence), 4),
        "languages_detected": json.dumps(langs),
        "model_version": _config.get("model_version", "MuRIL-multitask-v1.0"),
        "explanation": explanation,
        "salient_tokens": salient_tokens,
        "safety": safety_info
    }
