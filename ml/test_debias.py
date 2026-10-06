import os
import sys
import torch

sys.path.insert(0, os.path.abspath("backend"))
from app.services.ml_pipeline import _model, _tokenizer, _config, load_model_safely

load_model_safely()

# Compute empirical empty string baseline to de-bias the head dynamically
enc_empty = _tokenizer("", return_tensors="pt", padding="max_length", max_length=128, truncation=True)
with torch.no_grad():
    out_empty = _model(enc_empty["input_ids"], enc_empty["attention_mask"])
    baseline_e = out_empty["emotion_logits"]
    baseline_s = out_empty["sentiment_logits"]

phrases = [
    "ye ho kya rha h",
    "Today college la romba stressful ah irundhuchu but friends kooda pesina apram konjam better feel panninen.",
    "aaj mood bahut kharab hai kuch samajh nahi aa raha kya karu",
    "bohot khush hu aaj doston ke sath maza aaya",
    "njan innale valare santhoshavan aayirunnu",
    "eroju chala alasipoyanu and office lo chala stress undindi",
    "I am feeling very peaceful and calm today."
]

for phrase in phrases:
    enc = _tokenizer(phrase, return_tensors="pt", padding="max_length", max_length=128, truncation=True)
    with torch.no_grad():
        out = _model(enc["input_ids"], enc["attention_mask"])
        e_logits = out["emotion_logits"] - baseline_e
        s_logits = out["sentiment_logits"] - baseline_s
        
        e_id = torch.argmax(e_logits, dim=1).item()
        s_id = torch.argmax(s_logits, dim=1).item()
        
        print(f"Phrase: '{phrase}'")
        print(f"  -> Emotion: {_config['emotion_categories'][e_id]} | Sentiment: {_config['sentiment_categories'][s_id]}\n")
