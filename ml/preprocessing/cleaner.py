import os
import json
import unicodedata
import pandas as pd

def normalize_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = unicodedata.normalize("NFKC", text)
    # Strip excessive spaces while keeping unicode characters
    text = " ".join(text.split())
    return text

def load_and_standardize():
    base_dir = "ml/data/DravidianCodeMix-Dataset/extracted/DravidianCodeMix"
    
    records = []
    
    # 1. Load Tamil Sentiment
    tamil_path = os.path.join(base_dir, "tamil_sentiment_full_train.csv")
    if os.path.exists(tamil_path):
        df_tamil = pd.read_csv(tamil_path, names=["text", "sentiment"], sep="\t", header=None, on_bad_lines="skip")
        df_tamil["language"] = "Tamil"
        records.append(df_tamil)
        
    # 2. Load Malayalam Sentiment
    mal_path = os.path.join(base_dir, "mal_full_sentiment_train.csv")
    if os.path.exists(mal_path):
        df_mal = pd.read_csv(mal_path, names=["text", "sentiment"], sep="\t", header=None, on_bad_lines="skip")
        df_mal["language"] = "Malayalam"
        records.append(df_mal)
        
    # 3. Load Supplementary Multilingual Dataset
    supp_path = "ml/datasets/supplementary.json"
    if os.path.exists(supp_path):
        with open(supp_path, "r", encoding="utf-8") as f:
            supp_data = json.load(f)
        df_supp = pd.DataFrame(supp_data)
        records.append(df_supp)
        
    if records:
        df_combined = pd.concat(records, ignore_index=True)
    else:
        df_combined = pd.DataFrame(columns=["text", "language", "sentiment", "emotion"])
        
    # Standardize sentiment labels
    sentiment_map = {
        "Positive": "positive",
        "positive": "positive",
        "Negative": "negative",
        "negative": "negative",
        "Mixed_feelings": "mixed",
        "Mixed": "mixed",
        "mixed": "mixed",
        "unknown_state": "neutral",
        "Neutral": "neutral",
        "neutral": "neutral",
        "not-Tamil": "neutral",
        "not-malayalam": "neutral"
    }
    df_combined["sentiment"] = df_combined["sentiment"].astype(str).str.strip().map(lambda x: sentiment_map.get(x, "neutral"))
    
    # Normalize text
    df_combined["text"] = df_combined["text"].apply(normalize_text)
    df_combined = df_combined[df_combined["text"].str.len() > 3].dropna(subset=["text", "sentiment"])
    
    # Remove duplicates
    df_combined = df_combined.drop_duplicates(subset=["text"]).reset_index(drop=True)
    
    df_combined["id"] = range(1, len(df_combined) + 1)
    if "emotion" not in df_combined.columns:
        df_combined["emotion"] = "calm"
    else:
        df_combined["emotion"] = df_combined["emotion"].fillna("calm")
        
    output_path = "ml/datasets/standardized_dataset.csv"
    os.makedirs("ml/datasets", exist_ok=True)
    df_combined.to_csv(output_path, index=False, encoding="utf-8")
    print(f"Standardized dataset saved to {output_path} with {len(df_combined)} rows.")
    return df_combined

if __name__ == "__main__":
    load_and_standardize()
