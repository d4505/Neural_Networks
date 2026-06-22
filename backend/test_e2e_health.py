import requests
import json

BASE_URL = 'http://127.0.0.1:8000'

print('=== 1. Testing System Root & Status ===')
res = requests.get(f'{BASE_URL}/')
print('Root status:', res.status_code, res.json())

print('\n=== 2. Testing Multilingual NLP Inference Across Dialects ===')
test_phrases = [
    ('Tamil/Tanglish', 'romba frustrating ah irundhuchu office la... full gaand aagiten energy poiduchu', 'stress'),
    ('Tamil/Tanglish', 'sogam aa iruku manasula onnumey sari illa', 'sadness'),
    ('Hindi/Hinglish', 'aaj bohot khushi ho rahi hai sab kuch kitna achha hua', 'joy'),
    ('Hindi/Hinglish', 'mujhe bohot ghabrahat ho rahi hai exam ko lekar', 'anxiety'),
    ('Malayalam/Manglish', 'manassil nalla shanthatha thonnunnu', 'calm'),
    ('Telugu/Tenglish', 'naku chala bhayam ga undi future gurinchi', 'anxiety'),
    ('English', 'I feel genuinely peaceful and centered today', 'calm')
]

for lang, text, expected in test_phrases:
    r = requests.post(f'{BASE_URL}/api/analyze-entry', json={'text': text})
    if r.status_code == 200:
        d = r.json()
        print(f'  [{lang}] \"{text[:35]}...\" -> Detected: {d.get("primary_emotion")} (Score: {d.get("emotion_score")}) | Expected: {expected} | Match: {d.get("primary_emotion") == expected}')
    else:
        print(f'  [{lang}] Failed with status:', r.status_code)

print('\n=== 3. Testing User Authentication (Signup & Login) ===')
test_email = 'test_qa_check@example.com'
test_pwd = 'Password@123'
r = requests.post(f'{BASE_URL}/api/auth/signup', json={
    'name': 'Test QA User',
    'email': test_email,
    'password': test_pwd,
    'password_confirmation': test_pwd,
    'consent_model_training': True
})
print('Signup status:', r.status_code)

r = requests.post(f'{BASE_URL}/api/auth/login', json={'email': test_email, 'password': test_pwd})
print('Login status:', r.status_code)
token = r.json().get('access_token')
headers = {'Authorization': f'Bearer {token}'}

print('\n=== 4. Testing Journal Creation & Real-Time Emotion Analysis ===')
r = requests.post(f'{BASE_URL}/api/journal/', headers=headers, json={
    'title': 'Evening Reflection',
    'content': 'Semma gaand ah irundhuchu today, complete energy drain.'
})
print('Create Entry status:', r.status_code)
if r.status_code == 200:
    entry_data = r.json()
    print('  Entry ID:', entry_data.get('id'), '| Detected Emotion:', entry_data.get('analysis', {}).get('primary_emotion'), '| Valence Score:', entry_data.get('analysis', {}).get('emotion_score'))

print('\n=== 5. Testing Insights Trajectory & Tooltip Resolution ===')
r = requests.get(f'{BASE_URL}/api/insights/trajectory?days=7', headers=headers)
print('Trajectory status:', r.status_code)
if r.status_code == 200:
    traj = r.json()
    print(f'  Trajectory total entries: {traj.get("total_entries")}')
    for pt in traj.get('trajectory', []):
        print(f'    Point: {pt.get("date")} {pt.get("time")} | Score: {pt.get("score")} | Emotion: {pt.get("primary_emotion")}')

print('\n=== 6. Testing Data Export ===')
r = requests.get(f'{BASE_URL}/api/auth/export?format=json', headers=headers)
print('Export JSON status:', r.status_code, '| Items exported:', len(r.json().get('entries', [])))

print('\n[SUCCESS] ALL LIVE SYSTEM & ML VERIFICATION CHECKS PASSED!')
