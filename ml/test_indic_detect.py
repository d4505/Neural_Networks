import re

INDIC_LEXICON = {
    "Hindi (Hinglish)": {
        "keywords": {
            "ye", "yeh", "wo", "woh", "mera", "meri", "mere", "tera", "teri", "tere", "uska", "uski", "uske",
            "hum", "humein", "mujhe", "mujhko", "tujhe", "aap", "tum", "apna", "apni", "apne", "kisi", "sab",
            "kya", "kyu", "kyun", "kisko", "kisse", "kaisa", "kaisi", "kaise", "kab", "kaha", "kahan", "kidhar",
            "kitna", "kitni", "kitne", "hai", "hain", "h", "ho", "hu", "hoon", "tha", "thi", "the", "hoga", "hogi",
            "honge", "raha", "rahi", "rahe", "rha", "rhi", "rhe", "kare", "karna", "kar", "kr", "krna", "karu",
            "karoon", "karega", "karegi", "hua", "hui", "hue", "gaya", "gayi", "gaye", "gya", "gyi", "aaya", "aayi",
            "aaye", "bhi", "toh", "to", "lekin", "par", "magar", "aur", "ya", "nahi", "nhi", "na", "mat", "se",
            "me", "mein", "ko", "ka", "ki", "ke", "pe", "batao", "bolo", "bol", "samajh", "smjh", "pata", "pta",
            "chal", "lag", "lagta", "lagti", "lagte", "dekh", "sun", "aaj", "bahut", "bohot", "accha", "theek",
            "khush", "dukhi", "pareshan", "tension", "dimag", "pyar", "sukoon", "shanti", "bekaar", "kharab",
            "pagal", "chinta", "darr", "dar", "akela", "akeli", "zindagi", "ghar", "kaam", "baat", "kuch", "kuchh"
        }
    },
    "Tamil (Tanglish)": {
        "keywords": {
            "naan", "enakku", "enaku", "unaku", "unnakku", "avaru", "avan", "aval", "namma", "inga", "anga",
            "eppadi", "eppo", "engae", "edhuku", "edhu", "yaar", "yen", "yean", "irukku", "irundhuchu", "iruku",
            "irukan", "iruken", "kooda", "pesina", "pesa", "apram", "appuram", "konjam", "romba", "panninen",
            "panna", "pannu", "panrom", "vandhadhu", "vandhen", "paathen", "theriyum", "therila", "mudiyala",
            "mudiyum", "aachu", "aagala", "poiduchu", "illai", "illa", "dhaan", "than", "seri", "paravala",
            "kashtam", "kashtama", "bayama", "bayam", "sogam", "azhugai", "azha", "kaduppu", "kovam", "erichal",
            "santhosham", "sandhosham", "nimmathi", "nimmadhi", "nalla", "manasu", "valkkai", "thookam", "prachanai",
            "inniku", "naalaiku", "velai", "kannu", "la", "ah"
        }
    },
    "Telugu (Tenglish)": {
        "keywords": {
            "nenu", "naaku", "naku", "neeku", "meeku", "atanu", "aame", "manamu", "ikkada", "akkada", "ela",
            "elaga", "eppudu", "enduku", "enti", "emiti", "yevaru", "undi", "unnadi", "unnanu", "chesanu",
            "chesamu", "chesi", "anipinchindi", "anipisthondi", "paduthunna", "ippudu", "eroju", "repu", "kadu",
            "ledu", "ayindi", "raaledu", "chusthunna", "cheppanu", "kuda", "kani", "mari", "aithe", "chala",
            "bagundi", "bagundhi", "badhaga", "badha", "edupu", "kopam", "bhayam", "bhayangaram", "alupu",
            "alasipoya", "alasipoyanu", "prashantham", "santhosham", "aanandam", "aashaga", "prema", "panulu", "manasulo"
        }
    },
    "Malayalam (Manglish)": {
        "keywords": {
            "njan", "enikku", "eniku", "ninakku", "avarkku", "ivide", "avide", "engane", "eppol", "entha",
            "enthoke", "enthine", "aaranu", "aanu", "aayirunnu", "undayirunnu", "aavunnu", "cheythu", "cheyyunnu",
            "orthu", "ariyilla", "ariyam", "patti", "pattilla", "pokunnu", "vannu", "kandu", "ennal", "engilum",
            "koode", "pakshe", "valare", "santhosham", "santhoshavan", "dukkham", "visamam", "vishamam", "karayuka",
            "pedi", "deshyam", "theercha", "samadhanam", "pratheeksha", "manassu", "nannayi", "innathe", "divasam", "innale"
        }
    }
}

test_queries = [
    "ye ho kya rha h",
    "Today college la romba stressful ah irundhuchu but friends kooda pesina apram konjam better feel panninen.",
    "aaj mood bahut kharab hai kuch samajh nahi aa raha kya karu",
    "njan innale valare santhoshavan aayirunnu",
    "eroju chala alasipoyanu and office lo chala stress undindi",
    "I am feeling really peaceful and relaxed today."
]

for q in test_queries:
    words = set(re.findall(r"\b\w+\b", q.lower()))
    detected = []
    
    # Check Indic code-mix
    for lang, data in INDIC_LEXICON.items():
        if len(words.intersection(data["keywords"])) >= 1:
            detected.append(lang)
            
    # Check English content words
    eng_words = words.intersection({"today", "college", "friends", "better", "feel", "stress", "stressful", "office", "and", "but", "was", "very", "i", "am", "feeling", "really", "peaceful", "relaxed", "happy"})
    if eng_words and ("English" not in detected):
        detected.append("English")
    elif not detected:
        detected.append("English")
        
    print(f"Text: '{q}' => Detected: {detected}")
