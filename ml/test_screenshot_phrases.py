import sys
import os
sys.path.insert(0, os.path.abspath("backend"))
from app.services.ml_pipeline import analyze_text

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

phrases = [
    "i am angry",
    "i was having happy tears",
    "the sun was perfect today , i felt soo energic thought the day",
    "i was walking to college today and a cat scratched my shoes and my mum scolded me "
]

print("=== SCREENSHOT PHRASES INFERENCE VERIFICATION ===")
for p in phrases:
    res = analyze_text(p)
    print(f"\nText: \"{p}\"")
    print(f"  -> Emotion:   {res['primary_emotion'].upper()} ({res['confidence']*100:.1f}%)")
    print(f"  -> Sentiment: {res['sentiment'].upper()} ({res['sentiment_score']:+.2f})")
    print(f"  -> Language:  {res['languages_detected']}")
