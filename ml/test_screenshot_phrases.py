import sys
import os
sys.path.insert(0, os.path.abspath("backend"))
from app.services.ml_pipeline import analyze_text

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

phrases = [
    "i am angry",
    "i was gooning but my dih fell off and i feel happy af",
    "my name is saketh and I LOVE gooning at 12am specifically",
    "i was walking to college today and a cat pissed all over my shoes and my pants and my hair lil bit"
]

print("=== SCREENSHOT PHRASES INFERENCE VERIFICATION ===")
for p in phrases:
    res = analyze_text(p)
    print(f"\nText: \"{p}\"")
    print(f"  -> Emotion:   {res['primary_emotion'].upper()} ({res['confidence']*100:.1f}%)")
    print(f"  -> Sentiment: {res['sentiment'].upper()} ({res['sentiment_score']:+.2f})")
    print(f"  -> Language:  {res['languages_detected']}")
