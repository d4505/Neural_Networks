import os
import sys

sys.path.insert(0, os.path.abspath("backend"))

from app.services.ml_pipeline import analyze_text

queries = [
    "ye ho kya rha h",
    "Today college la romba stressful ah irundhuchu but friends kooda pesina apram konjam better feel panninen.",
    "aaj mood bahut kharab hai kuch samajh nahi aa raha kya karu",
    "njan innale valare santhoshavan aayirunnu",
    "eroju chala alasipoyanu and office lo chala stress undindi",
    "I am feeling very happy and energetic today!"
]

for q in queries:
    res = analyze_text(q)
    print(f"=== Text: {q} ===")
    print(f"Languages: {res['languages_detected']}")
    print(f"Primary Emotion: {res['primary_emotion']}, Sentiment: {res['sentiment']}, Valence: {res['emotion_score']}")
    print(f"Confidence: {res['confidence']}, Intensity: {res['intensity']}")
    print(f"Salient Tokens: {res['salient_tokens']}")
    print(f"Explanation: {res['explanation']}\n")
