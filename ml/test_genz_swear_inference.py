import sys
import os
sys.path.insert(0, os.path.abspath("backend"))
from app.services.ml_pipeline import analyze_text

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

tests = [
    ("i am cooked bro everything is falling apart", "Gen Z Stress/Panic"),
    ("crashing out over this bullshit", "Gen Z Anger/Stress"),
    ("feeling down bad and completely heartbroken", "Gen Z Sadness/Grief"),
    ("we are so back huge w celebration", "Gen Z Joy/Triumph"),
    ("slayed that presentation left no crumbs feeling goated", "Gen Z Joy/Achievement"),
    ("i am so fucking angry", "Swear word emotional venting"),
    ("sick of this fucking bullshit happening every day", "Swear word frustration"),
    ("pichi lesthondi chala kopam ga undi", "Telugu Gen Z Anger/Stress"),
    ("semma gaand aagudhu romba kovam", "Tamil Gen Z Anger/Stress"),
    ("locked in for the comeback we got this", "Gen Z Hopeful/Determined")
]

print("=== GEN Z, GEN ALPHA & SWEAR WORDS INFERENCE TEST ===")
for text, desc in tests:
    res = analyze_text(text)
    print(f"\n[{desc}]")
    print(f"Text: \"{text}\"")
    print(f"  -> Emotion:   {res['primary_emotion'].upper()} ({res['confidence']*100:.1f}%)")
    print(f"  -> Sentiment: {res['sentiment'].upper()} ({res['sentiment_score']:+.2f})")
    print(f"  -> Languages: {res['languages_detected']}")
