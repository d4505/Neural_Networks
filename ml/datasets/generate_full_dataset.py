import json
import os
import re
import pandas as pd
import numpy as np

# 1. Base Core Template Banks for each Language & Emotion
BASE_TEMPLATES = {
    "Tamil": {
        "anxiety": [
            ("enna nadakuthu inga onnum puriyala romba bayama irukku", "Tamil (Tanglish)", "negative", -0.55),
            ("exam pathi nenachaale romba bayama irukku onnum padikala", "Tamil (Tanglish)", "negative", -0.60),
            ("future enna aagumo nu romba bayama iruku", "Tamil (Tanglish)", "negative", -0.65),
            ("manasula oru periya bayam vandhudhu eppodhum overthinking", "Tamil (Tanglish)", "negative", -0.50),
            ("interview attend panna romba nervous ah irundhuchu", "Tamil (Tanglish)", "negative", -0.55),
            ("enna panna poren nu theriyama thinaruren romba panic", "Tamil (Tanglish)", "negative", -0.60),
            ("night thookame varama bayama irukku mind full ah running", "Tamil (Tanglish)", "negative", -0.55),
            ("oru maadhiri tension and anxiety ah irukku enaku", "Tamil (Tanglish)", "negative", -0.50),
            ("bayama irukku manasula full ah anxiety panic", "Tamil (Tanglish)", "negative", -0.60),
            ("தேர்வு முடிவுகளை நினைத்தால் மிகவும் பயமாக உள்ளது.", "Tamil", "negative", -0.60),
            ("மனதில் இனம் புரியாத பயமும் பதற்றமும் நிறைந்துள்ளது.", "Tamil", "negative", -0.55),
        ],
        "stress": [
            ("semma gaand aagudhu romba kovam", "Tamil (Tanglish)", "negative", -0.80),
            ("romba kovama irukku manasula", "Tamil (Tanglish)", "negative", -0.80),
            ("Inniku romba frustrating ah irundhuchu work mudiyala full energy poiduchu", "Tamil (Tanglish)", "negative", -0.70),
            ("Naan work complete panna try pannitu irundhen, but every time some new problem vandhuchu full energy poiduchu", "Tamil (Tanglish)", "negative", -0.70),
            ("Today college la romba stressful ah irundhuchu work mudiyala", "Tamil (Tanglish)", "negative", -0.60),
            ("inniku office la work load romba athigam mudiyala thala vali", "Tamil (Tanglish)", "negative", -0.65),
            ("Continuous deadlines nala thala vali edukuthu romba stress", "Tamil (Tanglish)", "negative", -0.70),
            ("Project delivery pressure thanga mudiyala semma tiredness", "Tamil (Tanglish)", "negative", -0.65),
            ("Full day busy ah irundhu romba exhausted aayiten", "Tamil (Tanglish)", "negative", -0.55),
            ("assignment submission time la romba stress aagudhu", "Tamil (Tanglish)", "negative", -0.60),
            ("semma gaandu and irritated ah irukku", "Tamil (Tanglish)", "negative", -0.75),
            ("kovam varudhu ellarum mela tension aaguthu", "Tamil (Tanglish)", "negative", -0.80),
            ("semma tired and exhausted ah irukku work pressure", "Tamil (Tanglish)", "negative", -0.70),
            ("இன்று வேலை அழுத்தம் தாங்க முடியவில்லை, மிகவும் சிரமமாக உள்ளது.", "Tamil", "negative", -0.65),
            ("அதிகப்படியான வேலைப்பளு காரணமாக தலைவலியும் சோர்வும் ஏற்பட்டுள்ளது.", "Tamil", "negative", -0.60),
        ],
        "sadness": [
            ("enaku inniki sogam aa iruku", "Tamil (Tanglish)", "negative", -0.80),
            ("enaku inniki sogama iruku", "Tamil (Tanglish)", "negative", -0.80),
            ("enaku inniki sogama irukku", "Tamil (Tanglish)", "negative", -0.80),
            ("enakku romba sogam aa iruku", "Tamil (Tanglish)", "negative", -0.80),
            ("enakku sogam aa irukku", "Tamil (Tanglish)", "negative", -0.80),
            ("inniki romba sogama iruku", "Tamil (Tanglish)", "negative", -0.80),
            ("manasu fulla sogam thonudhu", "Tamil (Tanglish)", "negative", -0.80),
            ("sogama iruken yaarum kooda illa", "Tamil (Tanglish)", "negative", -0.80),
            ("enaku inniki edhume pudikala romba kashtama irukku", "Tamil (Tanglish)", "negative", -0.75),
            ("enakku edhuvum pudikkala manasu full ah valikudhu", "Tamil (Tanglish)", "negative", -0.80),
            ("romba kashtama irukku yaarum kooda illa thoniya iruken", "Tamil (Tanglish)", "negative", -0.75),
            ("inniku manasula periya sogam rona vandhudhu", "Tamil (Tanglish)", "negative", -0.85),
            ("ellam pochu nu thonudhu enna panna poren", "Tamil (Tanglish)", "negative", -0.70),
            ("azhugaiya varudhu manasu romba valikudhu", "Tamil (Tanglish)", "negative", -0.85),
            ("varuthama irukku romba alone ah feel panren", "Tamil (Tanglish)", "negative", -0.75),
            ("மனதில் பெரும் சோகமும் வலியும் உள்ளது, தனிமையாக உணர்கிறேன்.", "Tamil", "negative", -0.80),
            ("இன்று எதிலும் மனம் ஈடுபடவில்லை, அழுகையாக வருகிறது.", "Tamil", "negative", -0.75),
            ("எனக்கு இன்று மிகவும் சோகமாக இருக்கிறது.", "Tamil", "negative", -0.80),
        ],
        "hopeful": [
            ("starting la kashtam dhaan aana ippo nalla improve aagudhu", "Tamil (Tanglish)", "mixed", 0.45),
            ("konjam tough time dhaan aana kandippa nalla mudiyum nambikai irukku", "Tamil (Tanglish)", "positive", 0.55),
            ("future pathi positive ah ninaikiren nalla nadakkum", "Tamil (Tanglish)", "positive", 0.60),
            ("hard work pannina kandippa success kedaikkum namburan", "Tamil (Tanglish)", "positive", 0.50),
            ("nambikkai irukku seekiram ellam seri aagum", "Tamil (Tanglish)", "positive", 0.60),
            ("கடினமான சூழலிலும் ஒரு நல்ல நம்பிக்கை மனதில் பிறக்கிறது.", "Tamil", "positive", 0.55),
            ("நாளைய நாள் சிறப்பாக அமையும் என்ற நம்பிக்கை உள்ளது.", "Tamil", "positive", 0.60),
        ],
        "calm": [
            ("weekend nalla relax panni meditate panninen manasu nimmathi", "Tamil (Tanglish)", "positive", 0.60),
            ("beach la silent ah kaathula ukaandhen romba amaidhi", "Tamil (Tanglish)", "positive", 0.65),
            ("manasu amaidhiyaaga irukku oru tension um illa", "Tamil (Tanglish)", "positive", 0.55),
            ("chai kudichutu peaceful ah book padichen", "Tamil (Tanglish)", "positive", 0.60),
            ("nimmathiya irukku manasu romba relaxed", "Tamil (Tanglish)", "positive", 0.65),
            ("இன்று மனம் மிகவும் அமைதியாகவும் நிம்மதியாகவும் உள்ளது.", "Tamil", "positive", 0.60),
            ("இயற்கையின் மடியில் அமைதியான மற்றும் தெளிவான தருணம்.", "Tamil", "positive", 0.65),
        ],
        "joy": [
            ("inniku semma happy ah irukku outing ponen full fun", "Tamil (Tanglish)", "positive", 0.85),
            ("friends kooda outing poitu vandhom semma enjoy pannom", "Tamil (Tanglish)", "positive", 0.80),
            ("project pass aayiduchu romba santhosham", "Tamil (Tanglish)", "positive", 0.90),
            ("family kooda time spend panninen manasuku romba happy", "Tamil (Tanglish)", "positive", 0.85),
            ("sema jolly ah irundhuchu vera level day", "Tamil (Tanglish)", "positive", 0.85),
            ("இன்று மிகவும் மகிழ்ச்சியான நாள், எல்லோருடனும் கொண்டாடினோம்.", "Tamil", "positive", 0.85),
            ("வெற்றி கிடைத்ததால் அளவில்லாத மகிழ்ச்சி அடைந்தேன்.", "Tamil", "positive", 0.90),
        ],
        "neutral": [
            ("inniku normal day dhaan onnum perisa nadakala", "Tamil (Tanglish)", "neutral", 0.0),
            ("grocery vaangitu vandhu dinner saaptom", "Tamil (Tanglish)", "neutral", 0.0),
            ("naalaiku meeting schedule aagirukku 3 manikku", "Tamil (Tanglish)", "neutral", 0.0),
            ("weather normal ah cloudy ah irundhuchu", "Tamil (Tanglish)", "neutral", 0.0),
            ("just daily task update note panren", "Tamil (Tanglish)", "neutral", 0.0),
            ("routine velai ella mudinjidhu", "Tamil (Tanglish)", "neutral", 0.0),
            ("இன்று ஒரு சாதாரண நாள், வழக்கமான வேலைகள் முடிந்தன.", "Tamil", "neutral", 0.0),
            ("காலையில் நடைப்பயிற்சி சென்று விட்டு மளிகை பொருட்கள் வாங்கினேன்.", "Tamil", "neutral", 0.0),
        ]
    },
    "Telugu": {
        "anxiety": [
            ("emi jaruguthundo asalu ardam kavatledu chala tension", "Telugu (Tenglish)", "negative", -0.55),
            ("future gurinchi chala bhayam ga undi emi cheyalo telidu", "Telugu (Tenglish)", "negative", -0.60),
            ("results ela vasthayo ani chala tension paduthunna", "Telugu (Tenglish)", "negative", -0.55),
            ("manasulo chala aashanthi ga ghabrahat ga undi night sleep ledu", "Telugu (Tenglish)", "negative", -0.50),
            ("interview mundhu chala panic ayyanu heartbeat fast ga undi", "Telugu (Tenglish)", "negative", -0.60),
            ("evaritho matladali anna bhayam vestondi nervous ga undi", "Telugu (Tenglish)", "negative", -0.50),
            ("భవిష్యత్తు గురించి ఆలోచిస్తుంటే చాలా భయం మరియు ఆందోళన వేస్తుంది.", "Telugu", "negative", -0.60),
            ("నాడీ కొట్టుకోవడం ఎక్కువై చాలా ఆందోళనగా ఉంది.", "Telugu", "negative", -0.65),
        ],
        "stress": [
            ("pichi lesthondi chala kopam ga undi", "Telugu (Tenglish)", "negative", -0.80),
            ("chala kopam vasthondi naaku andhari meeda", "Telugu (Tenglish)", "negative", -0.80),
            ("eroju chala frustrating ga undi work lo problems vachi full energy aypoyindi", "Telugu (Tenglish)", "negative", -0.70),
            ("eroju office lo chala work load undi chala alasipoyanu", "Telugu (Tenglish)", "negative", -0.60),
            ("panulu anni okesari vachi chala pressure ga anipinchindi", "Telugu (Tenglish)", "negative", -0.65),
            ("deadlines deggarapaduthunnai chala stress ga thala noppi undi", "Telugu (Tenglish)", "negative", -0.70),
            ("rojantha kashtapadi body motham alasata ga noppulu ga undi", "Telugu (Tenglish)", "negative", -0.55),
            ("continuous meetings valla chala burnout aypoyanu", "Telugu (Tenglish)", "negative", -0.65),
            ("ఆఫీసులో పని ఒత్తిడి చాలా ఎక్కువగా ఉంది, నిద్ర కూడా పట్టడం లేదు.", "Telugu", "negative", -0.70),
            ("పనుల భారం ఎక్కువై బాగా అలసిపోయాను.", "Telugu", "negative", -0.60),
        ],
        "sadness": [
            ("naaku assalu nachatledu chala badhaga undi", "Telugu (Tenglish)", "negative", -0.75),
            ("naaku ee roju em nachaledhu manasu antha baram ga undi", "Telugu (Tenglish)", "negative", -0.80),
            ("chala badhaga undi manasu antha dukham tho nindi poyindi", "Telugu (Tenglish)", "negative", -0.75),
            ("naaku chala badhaga undi", "Telugu (Tenglish)", "negative", -0.80),
            ("naaku chala badha ga undi", "Telugu (Tenglish)", "negative", -0.80),
            ("eeroju naaku chala baadha ga undi", "Telugu (Tenglish)", "negative", -0.80),
            ("ontariga anipistondi andharu dooram aypoyaru", "Telugu (Tenglish)", "negative", -0.70),
            ("kallalo neellu aagadam ledu chala baadha", "Telugu (Tenglish)", "negative", -0.85),
            ("ఈ రోజు చాలా బాధగా మరియు ఒంటరిగా ఉంది, మనసంతా భారంగా ఉంది.", "Telugu", "negative", -0.80),
            ("హృదయం ముక్కలైపోయినట్లు అనిపిస్తుంది, ఏమీ తోచడం లేదు.", "Telugu", "negative", -0.85),
        ],
        "hopeful": [
            ("starting lo kastam ga anipinchindi kani ipudu baga improve ayyindi", "Telugu (Tenglish)", "mixed", 0.45),
            ("konchem tough situation kani mundhu manchi rojulu vasthai", "Telugu (Tenglish)", "positive", 0.55),
            ("future gurinchi chala positive aashaga unnanu", "Telugu (Tenglish)", "positive", 0.60),
            ("nammakam undi anni set aypothai", "Telugu (Tenglish)", "positive", 0.50),
            ("భవిష్యత్తుపై గొప్ప ఆశ మరియు నమ్మకం ఉన్నాయి.", "Telugu", "positive", 0.60),
            ("కష్టాలు దాటి మంచి రోజులు వస్తాయని ఆశిస్తున్నాను.", "Telugu", "positive", 0.55),
        ],
        "calm": [
            ("eeroju manasulo chala prashantham ga undi shanti ga unnanu", "Telugu (Tenglish)", "positive", 0.60),
            ("morning walk chesaka mind chala fresh ga calm ga undi", "Telugu (Tenglish)", "positive", 0.65),
            ("manasuki chala shanti ga anipinchindi silent evening", "Telugu (Tenglish)", "positive", 0.55),
            ("coffee thaguthu balcony lo relax ayyanu", "Telugu (Tenglish)", "positive", 0.60),
            ("ఈ రోజు మనసు చాలా ప్రశాంతంగా మరియు నిశ్శబ్దంగా ఉంది.", "Telugu", "positive", 0.60),
            ("ప్రకృతి మధ్యలో ప్రశాంతమైన క్షణాలు గడిపాను.", "Telugu", "positive", 0.65),
        ],
        "joy": [
            ("naaku chaala bagundi", "Telugu (Tenglish)", "positive", 0.85),
            ("naaku chala bagundi", "Telugu (Tenglish)", "positive", 0.85),
            ("chala bagundi eeroju", "Telugu (Tenglish)", "positive", 0.85),
            ("eroju chala bagundi chala santhosham ga unnanu", "Telugu (Tenglish)", "positive", 0.80),
            ("naaku chaala bagundi super happy day", "Telugu (Tenglish)", "positive", 0.85),
            ("eroju chala santhosham ga undi full enjoy chesamu", "Telugu (Tenglish)", "positive", 0.85),
            ("project complete ayindi chala aanandam ga undi", "Telugu (Tenglish)", "positive", 0.80),
            ("family tho kalisi chala happy time spend chesamu", "Telugu (Tenglish)", "positive", 0.85),
            ("ఈ రోజు నాకు చాలా సంతోషంగా మరియు ఉల్లాసంగా ఉంది.", "Telugu", "positive", 0.85),
            ("అనుకున్న విజయం సాధించినందుకు ఎంతో ఆనందంగా ఉంది.", "Telugu", "positive", 0.90),
        ],
        "neutral": [
            ("eroju regular ga gadichindi routine pani", "Telugu (Tenglish)", "neutral", 0.0),
            ("eroju normal ga gadichindi peddaga em ledu", "Telugu (Tenglish)", "neutral", 0.0),
            ("groceries thechi dinner chesukuni padukunna", "Telugu (Tenglish)", "neutral", 0.0),
            ("repu office lo meeting undi time ki vellali", "Telugu (Tenglish)", "neutral", 0.0),
            ("weather normal ga undi routine panulu aypoyai", "Telugu (Tenglish)", "neutral", 0.0),
            ("just regular daily note rastunnanu", "Telugu (Tenglish)", "neutral", 0.0),
            ("ఈ రోజు సాధారణంగా గడిచింది, రోజువారీ పనులు పూర్తయ్యాయి.", "Telugu", "neutral", 0.0),
            ("సరుకులు కొని రాత్రి భోజనం పూర్తి చేశాను.", "Telugu", "neutral", 0.0),
        ]
    },
    "Malayalam": {
        "anxiety": [
            ("enthanu ivide sambhavikkunnathu ennu oru manassilavilla", "Malayalam (Manglish)", "negative", -0.50),
            ("naalathe kaaryam orthu valare pedi aavunnu", "Malayalam (Manglish)", "negative", -0.60),
            ("exam orthu manassil aakulam thonnikunnu night sleep illa", "Malayalam (Manglish)", "negative", -0.55),
            ("interview orthu chankidikkunnu tension aavunnu", "Malayalam (Manglish)", "negative", -0.50),
            ("manassil oru nalla aashanka undu overthinking", "Malayalam (Manglish)", "negative", -0.45),
            ("valare pedi aavunnu aashanka aakulam undu", "Malayalam (Manglish)", "negative", -0.60),
            ("നാളെ എന്ത് സംഭവിക്കും എന്നോർത്ത് വലിയ പേടിയാണ്.", "Malayalam", "negative", -0.60),
            ("മനസ്സിൽ വലിയ ആകുലതയും ഭയവും നിറഞ്ഞുനിൽക്കുന്നു.", "Malayalam", "negative", -0.55),
        ],
        "stress": [
            ("innu joliyil bhayangara stress aayirunnu ottum samayam kittiyilla", "Malayalam (Manglish)", "negative", -0.65),
            ("innu valare frustrating aayirunnu pani theerkaan pattiyilla full energy theernnu", "Malayalam (Manglish)", "negative", -0.70),
            ("kure pani koodi kidakkunnu thala vedhana edukkunnu", "Malayalam (Manglish)", "negative", -0.60),
            ("deadline eppol theerkkum ennu orthu valare vishamam", "Malayalam (Manglish)", "negative", -0.55),
            ("full day busy aayirunnu thalarnnu poyi", "Malayalam (Manglish)", "negative", -0.60),
            ("bhayangara deshyam varunnu kali aavunnu", "Malayalam (Manglish)", "negative", -0.75),
            ("ജോലിയിലെ അമിത ജോലിഭാരം കാരണം തളർന്നുപോയി.", "Malayalam", "negative", -0.65),
            ("തുടർച്ചയായ ജോലികൾ കാരണം തലവേദനയും ക്ഷീണവും അനുഭവപ്പെടുന്നു.", "Malayalam", "negative", -0.60),
        ],
        "sadness": [
            ("enikku innu onnum ishtamayilla manassu thakarnnu", "Malayalam (Manglish)", "negative", -0.75),
            ("valare dukkham thonnunnu manassu thakarnnu poyi", "Malayalam (Manglish)", "negative", -0.80),
            ("innu valare sankadam thonnunnu", "Malayalam (Manglish)", "negative", -0.80),
            ("enikku innu sankadamaanu valare vishamam", "Malayalam (Manglish)", "negative", -0.80),
            ("aarum koode illa ottakkaya pole thonnunnu", "Malayalam (Manglish)", "negative", -0.70),
            ("innu manassil valare vishamam aayirunnu kannuneer vannu", "Malayalam (Manglish)", "negative", -0.85),
            ("ഹൃദയം നുറുങ്ങുന്ന വേദന തോന്നുന്നു, ആരും കൂടെയില്ല.", "Malayalam", "negative", -0.80),
            ("ഇന്ന് വളരെ ദുഃഖം നിറഞ്ഞ ദിവസമായിരുന്നു.", "Malayalam", "negative", -0.75),
        ],
        "hopeful": [
            ("kure issues undayirunnu ennalum nalla oru pratheeksha undu", "Malayalam (Manglish)", "positive", 0.55),
            ("ithu maarum ennu vishwasam undu future nannavum", "Malayalam (Manglish)", "positive", 0.60),
            ("nalathe divasam nallathavum ennu njan aashikkunnu", "Malayalam (Manglish)", "positive", 0.50),
            ("നല്ലൊരു പ്രതീക്ഷ മനസ്സിലുണ്ട്, കാര്യങ്ങൾ നന്നായി വരും.", "Malayalam", "positive", 0.55),
            ("പ്രതിസന്ധികൾക്കിടയിലും പുതിയൊരു പ്രത്യാശ തോന്നുന്നു.", "Malayalam", "positive", 0.60),
        ],
        "calm": [
            ("nalla oru shanthamaya divasam aayirunnu ashwasam thonnunnu", "Malayalam (Manglish)", "positive", 0.60),
            ("manassil valare aashwasam thonnunnu silent day", "Malayalam (Manglish)", "positive", 0.55),
            ("ravile meditation cheythu mind fresh aayi", "Malayalam (Manglish)", "positive", 0.65),
            ("മനസ്സിന് നല്ലൊരു ശാന്തിയും സമാധാനവും അനുഭവപ്പെടുന്നു.", "Malayalam", "positive", 0.60),
            ("നിശ്ശബ്ദമായ പ്രഭാതം മനസ്സിന് കുളിർമ നൽകി.", "Malayalam", "positive", 0.65),
        ],
        "joy": [
            ("innathe divasam valare nallathayirunnu santhosham thonni", "Malayalam (Manglish)", "positive", 0.80),
            ("njan innale valare santhoshavan aayirunnu friendsine kandu", "Malayalam (Manglish)", "positive", 0.85),
            ("kudumbathodu koode nalla santhosha nimisham aayirunnu", "Malayalam (Manglish)", "positive", 0.80),
            ("adipoli divasam aayirunnu full polichu", "Malayalam (Manglish)", "positive", 0.85),
            ("ഇന്ന് എനിക്ക് വളരെ സന്തോഷം തോന്നി, എല്ലാം നല്ല രീതിയിൽ നടന്നു.", "Malayalam", "positive", 0.85),
            ("കൂട്ടുകാരോടൊപ്പം ചെലവഴിച്ച സമയം വളരെ ആനന്ദകരമായിരുന്നു.", "Malayalam", "positive", 0.90),
        ],
        "neutral": [
            ("innu sadharana divasam aayirunnu vishashangal onnum illa", "Malayalam (Manglish)", "neutral", 0.0),
            ("naale meeting undu athinte kaaryangal nokki", "Malayalam (Manglish)", "neutral", 0.0),
            ("grocery vaangi veettil ethi dinner kazhichu", "Malayalam (Manglish)", "neutral", 0.0),
            ("weather cloudy aayirunnu routine poyikkoondirikkunnu", "Malayalam (Manglish)", "neutral", 0.0),
            ("just casual note ezhuthukayanu", "Malayalam (Manglish)", "neutral", 0.0),
            ("ഇന്ന് ഒരു സാധാരണ ദിവസമായിരുന്നു, വലിയ വിശേഷങ്ങളൊന്നുമില്ല.", "Malayalam", "neutral", 0.0),
            ("സാധനങ്ങൾ വാങ്ങി വീട്ടിലെത്തി ഭക്ഷണം കഴിച്ചു.", "Malayalam", "neutral", 0.0),
        ]
    },
    "English": {
        "anxiety": [
            ("What is even happening right now, I feel so lost and confused.", "English", "negative", -0.50),
            ("Feeling overwhelming anxiety and dread about tomorrow's presentation.", "English", "negative", -0.65),
            ("My chest feels tight and I cannot stop overthinking every little detail.", "English", "negative", -0.70),
            ("Constantly dreading what tomorrow might bring, cannot sleep at all.", "English", "negative", -0.60),
            ("Woke up with an intense wave of panic and unease.", "English", "negative", -0.75),
            ("So nervous and anxious about the interview results.", "English", "negative", -0.55),
            ("Cannot shake off this constant sense of worry and tension.", "English", "negative", -0.50),
            ("tweaking over these deadlines so nervous and stressed", "English", "negative", -0.65),
        ],
        "stress": [
            ("Today was so frustrating trying to complete work but ran into non stop problems and energy is completely drained", "English", "negative", -0.75),
            ("Inniku romba frustrating ah irundhuchu work complete panna try pannitu irundhen full energy poiduchu", "English", "negative", -0.75),
            ("i am angry", "English", "negative", -0.80),
            ("i am so angry and pissed off today", "English", "negative", -0.85),
            ("feeling furious, irritated and mad at everyone", "English", "negative", -0.80),
            ("so annoying and frustrating everything went wrong", "English", "negative", -0.75),
            ("a cat pissed all over my shoes and clothes so annoying and exhausted", "English", "negative", -0.75),
            ("i am cooked bro everything is falling apart", "English", "negative", -0.75),
            ("literally crashing out right now so mad and overwhelmed", "English", "negative", -0.85),
            ("crashed out over this bullshit situation ffs", "English", "negative", -0.85),
            ("sick of this fucking bullshit happening every day", "English", "negative", -0.85),
            ("deadass exhausted and overstimulated right now", "English", "negative", -0.70),
            ("Exhausted from back to back meetings and relentless deadlines.", "English", "negative", -0.65),
            ("Drowning under mountains of urgent coursework today.", "English", "negative", -0.70),
            ("Too much pressure at workplace, burning out quickly and head is pounding.", "English", "negative", -0.75),
            ("Overloaded with work and feel utterly stressed and fatigued.", "English", "negative", -0.65),
            ("Chasing endless tasks all day without a single break.", "English", "negative", -0.60),
        ],
        "sadness": [
            ("i am sad", "English", "negative", -0.80),
            ("i feel so sad and lonely today", "English", "negative", -0.80),
            ("Feeling heartbroken, lonely, and crying quietly in my room.", "English", "negative", -0.80),
            ("Deep sense of emptiness and gloom lingering today.", "English", "negative", -0.75),
            ("Feeling so isolated and unvalued by people around me.", "English", "negative", -0.70),
            ("Heavy chest and unable to find joy in anything today.", "English", "negative", -0.85),
            ("Everything feels sorrowful and difficult to endure.", "English", "negative", -0.80),
            ("feeling down bad and completely heartbroken", "English", "negative", -0.85),
            ("down horrendous nobody cares about me fml", "English", "negative", -0.85),
            ("it is so over for me nothing works out", "English", "negative", -0.80),
            ("got ghosted and fumbled everything feels miserable", "English", "negative", -0.80),
            ("crying quietly because everything is so shitty", "English", "negative", -0.80),
        ],
        "hopeful": [
            ("Today had rough moments, but I am remaining hopeful for the future.", "English", "positive", 0.55),
            ("Stepping forward with quiet optimism that things will get better.", "English", "positive", 0.60),
            ("Believing in my capacity to grow and overcome these hurdles.", "English", "positive", 0.50),
            ("A fresh start and positive expectations for the coming days.", "English", "positive", 0.65),
            ("locked in for the comeback we got this", "English", "positive", 0.65),
            ("a little delulu but staying positive and moving forward", "English", "positive", 0.55),
            ("standing on business and focusing on my future", "English", "positive", 0.60),
        ],
        "calm": [
            ("I am feeling really peaceful and relaxed today after my walk.", "English", "positive", 0.60),
            ("Today was calm and quiet, enjoyed a slow peaceful morning.", "English", "positive", 0.55),
            ("Feeling grounded, mindful, and completely at peace with myself.", "English", "positive", 0.70),
            ("Gentle rain outside, feeling tranquil and centered.", "English", "positive", 0.65),
            ("unbothered, moisturized, in my lane and peaceful", "English", "positive", 0.70),
            ("mewing in silence enjoying pure peace and solitude", "English", "positive", 0.60),
        ],
        "joy": [
            ("i feel happy af today", "English", "positive", 0.85),
            ("i feel very happy today", "English", "positive", 0.85),
            ("i feel really happy today", "English", "positive", 0.85),
            ("i feel so happy today", "English", "positive", 0.85),
            ("feeling super happy and energized today", "English", "positive", 0.90),
            ("i was doing my thing and i feel happy af", "English", "positive", 0.85),
            ("i was doing my thing and i feel very happy", "English", "positive", 0.85),
            ("i LOVE this so much specifically", "English", "positive", 0.85),
            ("we are so back huge w celebration today", "English", "positive", 0.90),
            ("slayed that presentation left no crumbs feeling goated", "English", "positive", 0.95),
            ("everything is bussin and so much fun", "English", "positive", 0.85),
            ("Had an amazing celebration with family and close friends.", "English", "positive", 0.85),
            ("Today was good and productive, feeling very happy and energetic!", "English", "positive", 0.80),
            ("What a productive and joyful morning with beautiful sunshine.", "English", "positive", 0.85),
            ("Celebrated a huge personal milestone today, ecstatic and grateful!", "English", "positive", 0.90),
            ("Smiled all day long, surrounded by love and warmth.", "English", "positive", 0.85),
        ],
        "neutral": [
            ("The weather was cloudy and normal today.", "English", "neutral", 0.0),
            ("Meeting scheduled for 3 PM tomorrow afternoon.", "English", "neutral", 0.0),
            ("Bought groceries, cooked dinner, and organized my desk.", "English", "neutral", 0.0),
            ("Just writing a quick factual note for today.", "English", "neutral", 0.0),
            ("Completed the daily routine tasks and logged off.", "English", "neutral", 0.0),
            ("my name is saketh and I LOVE gaming at 12am specifically", "English", "neutral", 0.0),
            ("When i when the when when I when, my whens become whats and my whats become when. Fein", "English", "neutral", 0.0),
            ("hehehhe iima hold gold reoopemdx", "English", "neutral", 0.0),
            ("gugu gaga", "English", "neutral", 0.0),
            ("blah blah blah nothing much to report just testing", "English", "neutral", 0.0),
            ("asdfghjkl qwertyuiop random keyboard test", "English", "neutral", 0.0),
            ("just random text nonsense wordplay and testing notes", "English", "neutral", 0.0),
        ]
    },
    "Hindi": {
        "anxiety": [
            ("ye ho kya rha h kuch samajh nahi aa raha", "Hindi (Hinglish)", "negative", -0.50),
            ("mujhe future ko lekar bahut anxiety aur tension ho rahi hai", "Hindi (Hinglish)", "negative", -0.60),
            ("dil me ajeeb si bechaini aur ghabrahat ho rahi hai", "Hindi (Hinglish)", "negative", -0.55),
            ("results ka soch kar ghabrahat ho rahi hai neend nahi aa rahi", "Hindi (Hinglish)", "negative", -0.55),
            ("mujhe bhavishya ko lekar bohot chinta hai", "Hindi (Hinglish)", "negative", -0.60),
            ("मुझे भविष्य को लेकर बहुत चिंता और घबराहट हो रही है।", "Hindi", "negative", -0.60),
            ("मन में बहुत बेचैनी है, समझ नहीं आ रहा क्या करूं।", "Hindi", "negative", -0.50),
        ],
        "stress": [
            ("aaj bohot frustrating din tha kaam karte karte full energy khatam ho gayi", "Hindi (Hinglish)", "negative", -0.75),
            ("aaj office me bahut jyada stress tha kaam ka bojh badh gaya", "Hindi (Hinglish)", "negative", -0.65),
            ("dimag bilkul kharab ho chuka hai itni tension me", "Hindi (Hinglish)", "negative", -0.70),
            ("itne saare assignments ek sath aa gaye sir dard ho raha hai", "Hindi (Hinglish)", "negative", -0.60),
            ("deadlines meet nahi ho pa rahi manager pressure daal raha hai", "Hindi (Hinglish)", "negative", -0.65),
            ("bohot gussa aa raha hai dimag phat raha hai", "Hindi (Hinglish)", "negative", -0.80),
            ("आज ऑफिस में काम का बहुत दबाव था, सिर दर्द हो रहा है।", "Hindi", "negative", -0.65),
        ],
        "sadness": [
            ("aaj bohot udas hu", "Hindi (Hinglish)", "negative", -0.80),
            ("aaj mood bahut kharab hai dil bohot dukhi hai", "Hindi (Hinglish)", "negative", -0.75),
            ("akela pan bohot sata raha hai koi baat karne wala nahi", "Hindi (Hinglish)", "negative", -0.70),
            ("aaj phir se rona aa gaya sab kuch chhoot gaya", "Hindi (Hinglish)", "negative", -0.85),
            ("dil toot sa gaya hai kuch accha nahi lag raha", "Hindi (Hinglish)", "negative", -0.80),
            ("bohot dukh ho raha hai rona aa raha hai", "Hindi (Hinglish)", "negative", -0.80),
            ("मन में बहुत उदासी और अकेलापन है, रोना आ रहा है।", "Hindi", "negative", -0.80),
        ],
        "hopeful": [
            ("thoda time lagega par sab theek ho jayega mujhe pura bharosa hai", "Hindi (Hinglish)", "positive", 0.55),
            ("mushkil waqt hai par umeed ki kiran hamesha rehti hai", "Hindi (Hinglish)", "positive", 0.60),
            ("kal ka din behtar hoga aisi aasha hai", "Hindi (Hinglish)", "positive", 0.50),
            ("मुश्किल समय में भी उम्मीद की किरण दिखाई देती है।", "Hindi", "positive", 0.60),
        ],
        "calm": [
            ("aaj man me bohot sukoon aur shanti mehsoos ho rahi hai", "Hindi (Hinglish)", "positive", 0.60),
            ("subah meditation kiya mind bilkul relaxed ho gaya", "Hindi (Hinglish)", "positive", 0.65),
            ("chai pite huye shanti se baithe the", "Hindi (Hinglish)", "positive", 0.55),
            ("आज मन में बहुत शांति और सुकून है, कोई हड़बड़ी नहीं।", "Hindi", "positive", 0.60),
        ],
        "joy": [
            ("bohot khush hu aaj doston ke sath maza aaya", "Hindi (Hinglish)", "positive", 0.85),
            ("aaj ka din bohot accha raha celebration hua", "Hindi (Hinglish)", "positive", 0.80),
            ("family ke sath time spend kiya bohot khushi hui", "Hindi (Hinglish)", "positive", 0.85),
            ("आज का दिन बहुत शानदार रहा, परिवार के साथ बहुत खुशी मिली।", "Hindi", "positive", 0.85),
        ],
        "neutral": [
            ("aaj ka din bas normal raha koi khaas baat nahi", "Hindi (Hinglish)", "neutral", 0.0),
            ("grocery kharid ke laya aur kaam kiya", "Hindi (Hinglish)", "neutral", 0.0),
            ("kal subah 10 baje meeting scheduled hai", "Hindi (Hinglish)", "neutral", 0.0),
            ("weather normal hai thodi thand hai", "Hindi (Hinglish)", "neutral", 0.0),
            ("आज का दिन सामान्य रहा, कोई खास बात नहीं हुई।", "Hindi", "neutral", 0.0),
        ]
    }
}

from ml.preprocessing.slang_dictionary import expand_internet_slang

# 2. Rich Variation Modifiers and Augmenters to Generate 500+ rows per Language
PREFIXES = {
    "Tamil": ["", "inniku enaku thonuchu ", "unmaiya sollanum na ", "kaalaila irundhe ", "overall ah paatha ", "sathiyama solren ", "friends kooda pesumpodhu ", "office mudichutu ", "night time la ", "starting la "],
    "Telugu": ["", "eeroju naaku anipinchindi ", "nijanga cheppalante ", "udayam nunchi ", "overall ga chusthe ", "asalu cheppalante ", "friends tho matladinapudu ", "office aypoyaka ", "night padukune mundhu ", "starting lo "],
    "Malayalam": ["", "innu enikku thonni ", "sathyam paranjal ", "ravile muthal ", "overall aayi nokkiyaal ", "sathyam paranjaal ", "friendsine kandappol ", "joli kazhinju ", "raathri aayappol ", "aarambathil "],
    "English": ["", "Reflecting on today, ", "Honestly speaking, ", "From the morning, ", "To be honest, ", "Overall feeling, ", "Looking back at the day, ", "Sitting quietly right now, ", "In all fairness, ", "Just realized that ", "All things considered, ", "Truth be told, ", "Right now, ", "Lately, ", "At the end of the day, "],
    "Hindi": ["", "aaj mujhe aisa laga ki ", "such bolu toh ", "subah se hi ", "overall dekha jaye toh ", "such me bolu toh ", "doston ke sath baat karke ", "office ke baad ", "raat ko sochte huye ", "shuruat me "]
}

SUFFIXES = {
    "Tamil": ["", " aana enna panna", " kandippa nalladhu nadakkum", " romba mukkiyam", " manasula irukku", " ennala mudiyala", " ippadiye poitu irukku"],
    "Telugu": ["", " kani em chestham", " kachithanga manchidi jaruguthundi", " chala important", " manasulo undi", " nenu thaluchukuntunna", " ilaane saaguthundi"],
    "Malayalam": ["", " ennalum enthu cheyyaan", " theerchayayum nallathu sambhavikkum", " valare pradhaanamaanu", " manassilund", " njan orkkunnu"],
    "English": ["", " and that is how it feels.", " taking one step at a time.", " keeping this in mind.", " trying to process it all.", " hoping for the best.", " just putting thoughts into words.", " moving forward regardless.", " as time goes by."],
    "Hindi": ["", " par kya hi kar sakte hai", " zaroor accha hoga", " bohot zaroori hai", " dil me chal raha hai", " aage dekhte hai"]
}

def generate_balanced_synthetic_dataset():
    all_rows = []
    
    # Target: ~500 rows per language (Tamil, Telugu, Malayalam, English, Hindi)
    for lang, emotion_dict in BASE_TEMPLATES.items():
        lang_prefixes = PREFIXES[lang]
        lang_suffixes = SUFFIXES[lang]
        
        for emo, samples in emotion_dict.items():
            sent_val = "positive" if emo in ["joy", "calm"] else ("mixed" if emo == "hopeful" else ("neutral" if emo == "neutral" else "negative"))
            
            # Base items
            for text, dialect_lang, sent, val in samples:
                all_rows.append({
                    "text": text,
                    "language": dialect_lang,
                    "sentiment": sent,
                    "emotion": emo,
                    "valence_score": float(val)
                })
                
                exp_base = expand_internet_slang(text)
                if exp_base != text:
                    all_rows.append({
                        "text": exp_base,
                        "language": dialect_lang,
                        "sentiment": sent,
                        "emotion": emo,
                        "valence_score": float(val)
                    })
                
                # Synthetic cross-product expansion
                for p in lang_prefixes:
                    for s in lang_suffixes:
                        if not p and not s:
                            continue
                        combined_text = f"{p}{text}{s}".strip()
                        all_rows.append({
                            "text": combined_text,
                            "language": dialect_lang,
                            "sentiment": sent,
                            "emotion": emo,
                            "valence_score": float(val)
                        })
                        
                        exp_comb = expand_internet_slang(combined_text)
                        if exp_comb != combined_text:
                            all_rows.append({
                                "text": exp_comb,
                                "language": dialect_lang,
                                "sentiment": sent,
                                "emotion": emo,
                                "valence_score": float(val)
                            })

    # Ingest user downloaded Excel file: C:\Users\divij\Downloads\telugu-english-test-data-with-labels.xlsx
    excel_path = "C:/Users/divij/Downloads/telugu-english-test-data-with-labels.xlsx"
    if os.path.exists(excel_path):
        try:
            df_user = pd.read_excel(excel_path)
            print(f"Loaded {len(df_user)} rows from user Excel file: {excel_path}")
            
            for _, row in df_user.iterrows():
                raw_text = str(row.get("Comments", "")).strip()
                label = str(row.get("Label", "")).strip().lower()
                if len(raw_text) < 3:
                    continue
                    
                # Map non-hate -> neutral/joy/hopeful, hate -> negative/stress/sadness
                if label == "non-hate":
                    all_rows.append({
                        "text": raw_text,
                        "language": "Telugu",
                        "sentiment": "positive" if any(w in raw_text for w in ["సూపర్", "బాగుంది", "మంచి", "గ్రేట్"]) else "neutral",
                        "emotion": "joy" if "సూపర్" in raw_text else ("hopeful" if "రావాలని" in raw_text else "neutral"),
                        "valence_score": 0.65 if "సూపర్" in raw_text else 0.0
                    })
                else:
                    all_rows.append({
                        "text": raw_text,
                        "language": "Telugu",
                        "sentiment": "negative",
                        "emotion": "stress",
                        "valence_score": -0.60
                    })
        except Exception as e:
            print(f"Notice loading user Excel: {e}")

    df_full = pd.DataFrame(all_rows)
    df_full = df_full.drop_duplicates(subset=["text"]).reset_index(drop=True)
    
    # Balance each of the 4 key target languages + Hindi to ~500+ samples per language
    final_dfs = []
    for lang_group in ["Tamil", "Telugu", "Malayalam", "English", "Hindi"]:
        lang_mask = df_full["language"].str.contains(lang_group, case=False, na=False)
        sub_df = df_full[lang_mask]
        
        if len(sub_df) > 550:
            sub_df = sub_df.sample(n=500, random_state=42)
        final_dfs.append(sub_df)
        
    df_balanced = pd.concat(final_dfs, ignore_index=True)
    df_balanced = df_balanced.sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    out_path = os.path.join(os.path.dirname(__file__), "multilingual_journal_dataset.csv")
    df_balanced.to_csv(out_path, index=False, encoding="utf-8")
    
    print(f"\n=======================================================")
    print(f"Generated {len(df_balanced)} balanced samples to: {out_path}")
    print(f"=======================================================")
    print("\n--- Emotion Distribution ---")
    print(df_balanced["emotion"].value_counts())
    print("\n--- Language Distribution ---")
    print(df_balanced["language"].value_counts())
    
    return df_balanced

if __name__ == "__main__":
    generate_balanced_synthetic_dataset()
