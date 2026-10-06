import sys
import os
sys.path.insert(0, os.path.abspath("backend"))
import json
from app.services.ml_pipeline import analyze_text

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

test_samples = [
    # Telugu / Tenglish
    ("naaku chaala", "Telugu / Tenglish (Neutral)"),
    ("naaku chaala bagundi", "Telugu / Tenglish (Joy)"),
    ("eroju office lo chala work load undi chala alasipoyanu", "Telugu / Tenglish (Stress)"),
    ("naaku assalu nachatledu", "Telugu / Tenglish (Sadness/Negative)"),
    
    # Tamil / Tanglish
    ("enaku inniki edhume pudikala", "Tamil / Tanglish (Sadness)"),
    ("inniku semma happy ah irukku outing ponen full fun", "Tamil / Tanglish (Joy)"),
    ("exam pathi nenachaale romba bayama irukku", "Tamil / Tanglish (Anxiety)"),
    
    # Malayalam / Manglish
    ("innu joliyil bhayangara stress aayirunnu ottum samayam kittiyilla", "Malayalam / Manglish (Stress)"),
    ("innathe divasam valare nallathayirunnu santhosham thonni", "Malayalam / Manglish (Joy)"),
    
    # English
    ("Today was a good and productive day, feeling peaceful", "English (Joy/Calm)"),
    ("Feeling overwhelming anxiety and dread about tomorrow presentation", "English (Anxiety)"),
    
    # Wordplay / Gibberish / Neutral
    ("When i when the when when I when, my whens become whats and my whats become when. Fein", "Wordplay (Neutral)"),
    ("hehehhe iima hold gold reoopemdx", "Keystroke / Laughter smash (Neutral)")
]

print("=== MULTILINGUAL INFERENCE TEST SUITE ===")
for text, description in test_samples:
    res = analyze_text(text)
    print(f"\n[Input: {description}]")
    print(f"Text: \"{text}\"")
    print(f"  -> Emotion:     {res['primary_emotion'].upper()} (Confidence: {res['confidence']*100:.1f}%)")
    print(f"  -> Sentiment:   {res['sentiment'].upper()} (Score: {res['sentiment_score']:+.2f})")
    print(f"  -> Language:    {res['languages_detected']}")
    print(f"  -> Explanation: {res['explanation']}")
