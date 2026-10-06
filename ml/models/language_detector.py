import os
import pickle
import re
from typing import List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "lang_model.pkl")

# Built-in robust multilingual language classifier trained on character and word n-grams
_pipeline = None

def get_or_train_language_model():
    global _pipeline
    if _pipeline is not None:
        return _pipeline
        
    if os.path.exists(MODEL_SAVE_PATH):
        with open(MODEL_SAVE_PATH, "rb") as f:
            _pipeline = pickle.load(f)
            return _pipeline
            
    # Train high-accuracy character n-gram and subword language classifier
    training_data = [
        # Hindi Devanagari
        ("आज का दिन बहुत अच्छा रहा मुझे बहुत खुशी हुई", "Hindi (Devanagari)"),
        ("मुझे बहुत चिंता और घबराहट महसूस हो रही है", "Hindi (Devanagari)"),
        ("काम का बहुत तनाव है और सिर दर्द हो रहा है", "Hindi (Devanagari)"),
        ("मुश्किल समय में भी उम्मीद की किरण दिखाई देती है", "Hindi (Devanagari)"),
        ("मन में बहुत शांति और सुकून है कोई हड़बड़ी नहीं", "Hindi (Devanagari)"),
        
        # Tamil Script
        ("இன்று கல்லூரி மிகவும் மகிழ்ச்சியாக இருந்தது", "Tamil"),
        ("இன்று வேலை அழுத்தம் தாங்க முடியவில்லை", "Tamil"),
        ("மனதில் பெரும் சோகமும் வலியும் உள்ளது", "Tamil"),
        ("கடினமான சூழலிலும் நல்ல நம்பிக்கை பிறக்கிறது", "Tamil"),
        ("மனம் மிகவும் அமைதியாகவும் நிம்மதியாகவும் உள்ளது", "Tamil"),
        
        # Telugu Script
        ("ఈ రోజు నాకు చాలా సంతోషంగా ఉంది", "Telugu"),
        ("ఆఫీసులో పని ఒత్తిడి చాలా ఎక్కువగా ఉంది", "Telugu"),
        ("ఈ రోజు చాలా బాధగా మరియు ఒంటరిగా ఉంది", "Telugu"),
        ("భవిష్యత్తుపై ఆశ మరియు నమ్మకం ఉంది", "Telugu"),
        ("మనసు చాలా ప్రశాంతంగా మరియు నిశ్శబ్దంగా ఉంది", "Telugu"),
        
        # Malayalam Script
        ("ഇന്ന് എനിക്ക് വളരെ സന്തോഷം തോന്നി", "Malayalam"),
        ("ജോലിയിലെ അമിത ജോലിഭാരം കാരണം തളർന്നുപോയി", "Malayalam"),
        ("ഹൃദയം നുറുങ്ങുന്ന വേദന തോന്നുന്നു", "Malayalam"),
        ("നല്ലൊരു പ്രതീക്ഷ മനസ്സിലുണ്ട്", "Malayalam"),
        ("മനസ്സിന് നല്ലൊരു ശാന്തിയും സമാധാനവും അനുഭവപ്പെടുന്നു", "Malayalam"),
        
        # Hinglish (Hindi Latin / Code-Mixed)
        ("ye ho kya rha h", "Hindi (Hinglish)"),
        ("aaj mood bahut kharab hai kuch samajh nahi aa raha kya karu", "Hindi (Hinglish)"),
        ("mujhe future ko lekar bahut anxiety aur tension ho rahi hai", "Hindi (Hinglish)"),
        ("aaj office me bohot jyada stress tha manager ne daanta", "Hindi (Hinglish)"),
        ("bohot khush hu aaj doston ke sath maza aaya", "Hindi (Hinglish)"),
        ("subah meditation kiya man me bohot sukoon aur shanti hai", "Hindi (Hinglish)"),
        ("thoda time lagega par sab theek ho jayega mujhe bharosa hai", "Hindi (Hinglish)"),
        ("kya chal raha hai kuch pata nahi chal raha", "Hindi (Hinglish)"),
        ("dil me ajeeb si bechaini aur dar lag raha hai", "Hindi (Hinglish)"),
        ("aaj pura din waste ho gaya bohot guilty feel ho raha hai", "Hindi (Hinglish)"),
        ("ghar walo ke sath baith kar achi baat hui", "Hindi (Hinglish)"),
        ("itni mehnat ke baad bhi result nahi mila bohot dukhi hu", "Hindi (Hinglish)"),
        ("kya hoga aage koi idea nahi hai", "Hindi (Hinglish)"),
        
        # Tanglish (Tamil Latin / Code-Mixed)
        ("Today college la romba stressful ah irundhuchu but friends kooda pesina apram konjam better feel panninen", "Tamil (Tanglish)"),
        ("inniku office la work load romba athigam mudiyala thala vali", "Tamil (Tanglish)"),
        ("exam pathi nenachaale romba bayama irukku onnum padikala", "Tamil (Tanglish)"),
        ("inniku semma happy ah irukku outing ponen full fun", "Tamil (Tanglish)"),
        ("weekend nalla relax panni meditate panninen manasu nimmathi", "Tamil (Tanglish)"),
        ("romba kashtama irukku yaarum kooda illa thoniya iruken", "Tamil (Tanglish)"),
        ("starting la kashtam dhaan aana ippo nalla improve aagudhu", "Tamil (Tanglish)"),
        ("enna nadakuthu inga onnum puriyala", "Tamil (Tanglish)"),
        ("manasula periya bayam vandhudhu", "Tamil (Tanglish)"),
        ("enaku inniki edhume pudikala", "Tamil (Tanglish)"),
        ("enakku edhuvum pudikkala", "Tamil (Tanglish)"),
        
        # Tenglish (Telugu Latin / Code-Mixed)
        ("naaku chaala", "Telugu (Tenglish)"),
        ("naku chala", "Telugu (Tenglish)"),
        ("naaku chala bagundi", "Telugu (Tenglish)"),
        ("chaala manchi roju", "Telugu (Tenglish)"),
        ("eroju office lo chala work load undi chala alasipoyanu", "Telugu (Tenglish)"),
        ("future gurinchi chala bhayam ga undi emi cheyalo telidu", "Telugu (Tenglish)"),
        ("eroju chala santhosham ga undi full enjoy chesamu", "Telugu (Tenglish)"),
        ("eeroju manasulo chala prashantham ga undi shanti ga unnanu", "Telugu (Tenglish)"),
        ("chala badhaga undi manasu antha baram ga anipisthondi", "Telugu (Tenglish)"),
        ("starting lo kastam ga anipinchindi kani ipudu baga improve ayyindi", "Telugu (Tenglish)"),
        ("emi jaruguthundo asalu ardam kavatledu", "Telugu (Tenglish)"),
        ("naaku assalu nachatledu", "Telugu (Tenglish)"),
        ("naaku ee roju em nachaledhu", "Telugu (Tenglish)"),
        
        # Manglish (Malayalam Latin / Code-Mixed)
        ("njan innale valare santhoshavan aayirunnu friendsine kandu", "Malayalam (Manglish)"),
        ("innu joliyil bhayangara stress aayirunnu ottum samayam kittiyilla", "Malayalam (Manglish)"),
        ("naalathe kaaryam orthu valare pedi aavunnu", "Malayalam (Manglish)"),
        ("valare dukkham thonnunnu manassu thakarnnu poyi", "Malayalam (Manglish)"),
        ("kure issues undayirunnu ennalum nalla oru pratheeksha undu", "Malayalam (Manglish)"),
        ("nalla oru shanthamaya divasam aayirunnu ashwasam thonnunnu", "Malayalam (Manglish)"),
        ("enthanu ivide sambhavikkunnathu ennu oru manassilavilla", "Malayalam (Manglish)"),
        ("enikku innu onnum ishtamayilla", "Malayalam (Manglish)"),
        
        # Standard English
        ("Today was good", "English"),
        ("Today was a good and productive day", "English"),
        ("I am feeling really peaceful and relaxed today after my walk.", "English"),
        ("Exhausted from back to back meetings and relentless project deadlines.", "English"),
        ("Feeling overwhelming anxiety and dread about tomorrow's presentation.", "English"),
        ("Had an amazing celebration with family and close friends.", "English"),
        ("Feeling heartbroken, lonely, and crying quietly in my room.", "English"),
        ("Today had rough moments, but I am remaining hopeful for the future.", "English"),
        ("What a productive and joyful morning with beautiful sunshine.", "English")
    ]
    
    texts = [t[0] for t in training_data]
    labels = [t[1] for t in training_data]
    
    _pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), min_df=1)),
        ("clf", LogisticRegression(C=5.0, max_iter=500, class_weight="balanced"))
    ])
    _pipeline.fit(texts, labels)
    
    with open(MODEL_SAVE_PATH, "wb") as f:
        pickle.dump(_pipeline, f)
        
    return _pipeline

def predict_languages_ml(text: str) -> List[str]:
    pipeline = get_or_train_language_model()
    
    # Check for Unicode scripts directly
    scripts = []
    if any("\u0900" <= c <= "\u097f" for c in text):
        scripts.append("Hindi (Devanagari)")
    if any("\u0b80" <= c <= "\u0bff" for c in text):
        scripts.append("Tamil")
    if any("\u0c00" <= c <= "\u0c7f" for c in text):
        scripts.append("Telugu")
    if any("\u0d00" <= c <= "\u0d7f" for c in text):
        scripts.append("Malayalam")
        
    if scripts:
        return scripts
        
    # ML model prediction over character n-grams
    probs = pipeline.predict_proba([text])[0]
    classes = pipeline.classes_
    
    top_class_idx = probs.argmax()
    top_class = classes[top_class_idx]
    top_prob = probs[top_class_idx]
    
    results = [top_class]
    
    # Check for code-mixed English elements (bilingual detection)
    text_words = set(re.findall(r"\b\w+\b", text.lower()))
    common_english = {"today", "college", "friends", "better", "feel", "feeling", "stress", "stressful", "work", "office", "and", "but", "was", "happy", "project", "life"}
    if text_words.intersection(common_english) and "English" not in results:
        results.append("English")
        
    return results
