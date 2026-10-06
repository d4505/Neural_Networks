import os
import json
import torch
import pandas as pd
import numpy as np
from transformers import BertTokenizer, AutoTokenizer
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score, mean_squared_error

from ml.models.multitask import MultitaskJournalModel, get_encoder_path

def evaluate_all():
    print("=== ANTARA NLP Multilingual & Code-Mixed Evaluation Pipeline ===")
    model_dir = "ml/models/emotion_model"
    model_path = os.path.join(model_dir, "model.pt")
    config_path = os.path.join(model_dir, "config.json")
    tokenizer_dir = os.path.join(model_dir, "tokenizer")
    
    if not os.path.exists(model_path) or not os.path.exists(config_path):
        print("Model artifacts not found. Please ensure training is finished.")
        return
        
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)
        
    sentiment_categories = config["sentiment_categories"]
    emotion_categories = config["emotion_categories"]
    
    sentiment_to_id = {cat: i for i, cat in enumerate(sentiment_categories)}
    emotion_to_id = {cat: i for i, cat in enumerate(emotion_categories)}
    
    encoder_path = get_encoder_path()
    try:
        tokenizer = BertTokenizer.from_pretrained(tokenizer_dir)
    except Exception:
        tokenizer = AutoTokenizer.from_pretrained(encoder_path)
        
    model = MultitaskJournalModel(
        pretrained_path=encoder_path,
        num_sentiments=len(sentiment_categories),
        num_emotions=len(emotion_categories)
    )
    state_dict = torch.load(model_path, map_location=torch.device("cpu"))
    model.load_state_dict(state_dict)
    model.eval()
    
    # 1. Evaluate on Supplementary Dataset (Section 9 requirement)
    supp_path = "ml/datasets/supplementary.json"
    supp_results = []
    if os.path.exists(supp_path):
        with open(supp_path, "r", encoding="utf-8") as f:
            supp_data = json.load(f)
            
        print(f"\nEvaluating Supplementary Code-Mixed & Multilingual Set ({len(supp_data)} samples):")
        for item in supp_data:
            text = item["text"]
            enc = tokenizer(text, max_length=128, padding="max_length", truncation=True, return_tensors="pt")
            with torch.no_grad():
                out = model(enc["input_ids"], enc["attention_mask"])
            
            s_pred_id = torch.argmax(out["sentiment_logits"], dim=1).item()
            e_pred_id = torch.argmax(out["emotion_logits"], dim=1).item()
            valence = out["valence"].item()
            
            pred_sent = sentiment_categories[s_pred_id]
            pred_emot = emotion_categories[e_pred_id]
            
            supp_results.append({
                "text": text,
                "language": item.get("language", "Unknown"),
                "true_sentiment": item.get("sentiment"),
                "predicted_sentiment": pred_sent,
                "true_emotion": item.get("emotion"),
                "predicted_emotion": pred_emot,
                "valence_score": round(valence, 3)
            })
            
    # Compute per-language accuracy
    df_supp_res = pd.DataFrame(supp_results)
    if not df_supp_res.empty:
        print("\n--- Supplementary Test Results by Language ---")
        for lang, grp in df_supp_res.groupby("language"):
            sent_match = (grp["true_sentiment"] == grp["predicted_sentiment"]).mean() * 100
            print(f"Language: {lang:20s} | Samples: {len(grp):2d} | Sentiment Match: {sent_match:5.1f}%")
            
    # 2. Evaluate on 15% Unseen Test Set
    test_set_path = "ml/datasets/test_set.csv"
    test_metrics = {}
    if os.path.exists(test_set_path):
        test_df = pd.read_csv(test_set_path).dropna(subset=["text"])
        test_s_trues = []
        test_s_preds = []
        test_e_trues = []
        test_e_preds = []
        test_v_trues = []
        test_v_preds = []
        
        for _, row in test_df.iterrows():
            text = str(row["text"])
            enc = tokenizer(text, max_length=128, padding="max_length", truncation=True, return_tensors="pt")
            with torch.no_grad():
                out = model(enc["input_ids"], enc["attention_mask"])
                
            s_pred = torch.argmax(out["sentiment_logits"], dim=1).item()
            e_pred = torch.argmax(out["emotion_logits"], dim=1).item()
            v_pred = out["valence"].item()
            
            test_s_preds.append(s_pred)
            test_s_trues.append(int(row["sentiment_label"]))
            test_e_preds.append(e_pred)
            test_e_trues.append(int(row["emotion_label"]))
            test_v_preds.append(v_pred)
            test_v_trues.append(float(row["mapped_valence"]))
            
        test_metrics = {
            "sentiment_accuracy": round(float(accuracy_score(test_s_trues, test_s_preds)), 4),
            "sentiment_macro_f1": round(float(f1_score(test_s_trues, test_s_preds, average="macro")), 4),
            "sentiment_weighted_f1": round(float(f1_score(test_s_trues, test_s_preds, average="weighted")), 4),
            "emotion_accuracy": round(float(accuracy_score(test_e_trues, test_e_preds)), 4),
            "emotion_weighted_f1": round(float(f1_score(test_e_trues, test_e_preds, average="weighted")), 4),
            "valence_mse": round(float(mean_squared_error(test_v_trues, test_v_preds)), 4),
            "test_samples_count": len(test_df)
        }
        
        print("\n--- Unseen Test Set Metrics ---")
        print(json.dumps(test_metrics, indent=2))
        
    # Save complete evaluation report
    report = {
        "model_architecture": "Google MuRIL Multitask Shared Encoder",
        "supported_languages": config.get("supported_languages", []),
        "test_metrics": test_metrics,
        "supplementary_test_samples": supp_results
    }
    
    os.makedirs("ml/evaluation", exist_ok=True)
    report_file = "ml/evaluation/evaluation_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=4, ensure_ascii=False)
        
    print(f"\nFull evaluation report saved to {report_file}")

if __name__ == "__main__":
    evaluate_all()
