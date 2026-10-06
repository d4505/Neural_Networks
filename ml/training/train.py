import os
import json
import torch
import pandas as pd
import numpy as np
from torch.utils.data import DataLoader, TensorDataset
from transformers import AutoTokenizer, AutoModel
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error, accuracy_score, f1_score
from ml.models.multitask import MultitaskJournalModel

def extract_embeddings_in_batches(texts, tokenizer, encoder, batch_size=32, max_len=64):
    embeddings = []
    encoder.eval()
    
    for i in range(0, len(texts), batch_size):
        batch_texts = list(texts[i:i+batch_size])
        encoding = tokenizer(
            batch_texts,
            add_special_tokens=True,
            max_length=max_len,
            padding="max_length",
            truncation=True,
            return_attention_mask=True,
            return_tensors="pt"
        )
        with torch.no_grad():
            outputs = encoder(input_ids=encoding["input_ids"], attention_mask=encoding["attention_mask"])
            cls_repr = outputs.last_hidden_state[:, 0, :] # [CLS] token representation
            embeddings.append(cls_repr)
            
    return torch.cat(embeddings, dim=0)

def train_model():
    print("=== 1. Loading Multilingual Balanced Dataset ===", flush=True)
    dataset_path = "ml/datasets/multilingual_journal_dataset.csv"
    df = pd.read_csv(dataset_path).dropna(subset=["text", "sentiment", "emotion"])
    print(f"Loaded {len(df)} curated multilingual reflection samples from {dataset_path}.", flush=True)
    
    sentiment_categories = ["negative", "mixed", "neutral", "positive"]
    emotion_categories = ["sadness", "stress", "anxiety", "hopeful", "calm", "joy", "neutral"]
    
    sentiment_to_id = {cat: i for i, cat in enumerate(sentiment_categories)}
    emotion_to_id = {cat: i for i, cat in enumerate(emotion_categories)}
    
    df["sentiment_label"] = df["sentiment"].map(sentiment_to_id).fillna(2).astype(int)
    df["emotion_label"] = df["emotion"].map(emotion_to_id).fillna(6).astype(int)
    df["valence"] = df["valence_score"].astype(float)
    
    print("\n--- Emotion Distribution in Training Data ---", flush=True)
    print(df["emotion"].value_counts(), flush=True)
    
    print("\n--- Language Distribution in Training Data ---", flush=True)
    print(df["language"].value_counts(), flush=True)
    
    train_df, test_df = train_test_split(df, test_size=0.3, random_state=42, stratify=df["emotion_label"])
    val_df, test_df = train_test_split(test_df, test_size=0.5, random_state=42, stratify=test_df["emotion_label"])
    
    print(f"\nStratified Splits -> Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}", flush=True)
    
    model_name = "google/muril-base-cased"
    tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
    encoder = AutoModel.from_pretrained(model_name, local_files_only=True)
    
    print("\n=== 2. Pre-extracting Multilingual Transformer Embeddings ===", flush=True)
    train_feats = extract_embeddings_in_batches(train_df["text"].values, tokenizer, encoder)
    val_feats = extract_embeddings_in_batches(val_df["text"].values, tokenizer, encoder)
    test_feats = extract_embeddings_in_batches(test_df["text"].values, tokenizer, encoder)
    
    train_dataset = TensorDataset(
        train_feats,
        torch.tensor(train_df["sentiment_label"].values, dtype=torch.long),
        torch.tensor(train_df["emotion_label"].values, dtype=torch.long),
        torch.tensor(train_df["valence"].values, dtype=torch.float)
    )
    val_dataset = TensorDataset(
        val_feats,
        torch.tensor(val_df["sentiment_label"].values, dtype=torch.long),
        torch.tensor(val_df["emotion_label"].values, dtype=torch.long),
        torch.tensor(val_df["valence"].values, dtype=torch.float)
    )
    test_dataset = TensorDataset(
        test_feats,
        torch.tensor(test_df["sentiment_label"].values, dtype=torch.long),
        torch.tensor(test_df["emotion_label"].values, dtype=torch.long),
        torch.tensor(test_df["valence"].values, dtype=torch.float)
    )
    
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
    
    print("\n=== 3. Initializing Multitask Neural Model Architecture ===", flush=True)
    model = MultitaskJournalModel(
        model_name=model_name,
        num_sentiments=len(sentiment_categories),
        num_emotions=len(emotion_categories)
    )
    
    optimizer = torch.optim.AdamW(
        list(model.sentiment_head.parameters()) + 
        list(model.emotion_head.parameters()) + 
        list(model.valence_head.parameters()), 
        lr=2e-3,
        weight_decay=0.01
    )
    
    sentiment_criterion = torch.nn.CrossEntropyLoss()
    emotion_criterion = torch.nn.CrossEntropyLoss()
    valence_criterion = torch.nn.MSELoss()
    
    epochs = 30
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)
    
    print(f"\n=== 4. Training Multitask Neural Heads ({epochs} Epochs / >1,600 Gradient Updates) ===", flush=True)
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        for feats, s_label, e_label, v_label in train_loader:
            optimizer.zero_grad()
            
            s_logits = model.sentiment_head(feats)
            e_logits = model.emotion_head(feats)
            valence = torch.tanh(model.valence_head(feats)).squeeze()
            
            loss_s = sentiment_criterion(s_logits, s_label)
            loss_e = emotion_criterion(e_logits, e_label)
            loss_v = valence_criterion(valence, v_label)
            
            loss = loss_s + 1.2 * loss_e + 2.0 * loss_v
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            
        scheduler.step()
        
        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for feats, s_label, e_label, v_label in val_loader:
                s_logits = model.sentiment_head(feats)
                e_logits = model.emotion_head(feats)
                valence = torch.tanh(model.valence_head(feats)).squeeze()
                
                loss_s = sentiment_criterion(s_logits, s_label)
                loss_e = emotion_criterion(e_logits, e_label)
                loss_v = valence_criterion(valence, v_label)
                val_loss += (loss_s + 1.2 * loss_e + 2.0 * loss_v).item()
                
        avg_train = train_loss / len(train_loader)
        avg_val = val_loss / len(val_loader)
        lr = scheduler.get_last_lr()[0]
        print(f"Epoch {epoch+1:02d}/{epochs} | Train Loss: {avg_train:.4f} | Val Loss: {avg_val:.4f} | LR: {lr:.6f}", flush=True)
        
    print("\n=== 5. Evaluating on Independent Multilingual Test Set ===", flush=True)
    model.eval()
    all_s_preds, all_s_trues = [], []
    all_e_preds, all_e_trues = [], []
    all_v_preds, all_v_trues = [], []
    
    with torch.no_grad():
        for feats, s_label, e_label, v_label in test_loader:
            s_logits = model.sentiment_head(feats)
            e_logits = model.emotion_head(feats)
            valence = torch.tanh(model.valence_head(feats)).squeeze()
            
            all_s_preds.extend(torch.argmax(s_logits, dim=1).tolist())
            all_s_trues.extend(s_label.tolist())
            
            all_e_preds.extend(torch.argmax(e_logits, dim=1).tolist())
            all_e_trues.extend(e_label.tolist())
            
            if valence.ndim == 0:
                all_v_preds.append(valence.item())
            else:
                all_v_preds.extend(valence.tolist())
            all_v_trues.extend(v_label.tolist())
            
    emo_acc = accuracy_score(all_e_trues, all_e_preds)
    emo_f1 = f1_score(all_e_trues, all_e_preds, average="weighted")
    sent_acc = accuracy_score(all_s_trues, all_s_preds)
    sent_f1 = f1_score(all_s_trues, all_s_preds, average="weighted")
    mse = mean_squared_error(all_v_trues, all_v_preds)
    
    print("\n--- Sentiment Classification Report ---", flush=True)
    print(classification_report(all_s_trues, all_s_preds, labels=list(range(len(sentiment_categories))), target_names=sentiment_categories, zero_division=0), flush=True)
    
    print("\n--- Emotion Classification Report (7 Classes) ---", flush=True)
    print(classification_report(all_e_trues, all_e_preds, labels=list(range(len(emotion_categories))), target_names=emotion_categories, zero_division=0), flush=True)
    
    print(f"\n--- Summary Metrics ---", flush=True)
    print(f"Emotion Accuracy:   {emo_acc*100:.2f}% | F1: {emo_f1:.4f}", flush=True)
    print(f"Sentiment Accuracy: {sent_acc*100:.2f}% | F1: {sent_f1:.4f}", flush=True)
    print(f"Valence MSE:        {mse:.4f}", flush=True)
    
    print("\n=== 6. Saving Trained Model Weights & Configuration ===", flush=True)
    os.makedirs("ml/models/emotion_model", exist_ok=True)
    torch.save(model.state_dict(), "ml/models/emotion_model/model.pt")
    
    tokenizer.save_pretrained("ml/models/emotion_model/tokenizer")
    
    metadata = {
        "model_name": model_name,
        "sentiment_categories": sentiment_categories,
        "emotion_categories": emotion_categories,
        "metrics": {
            "emotion_accuracy": float(emo_acc),
            "emotion_f1": float(emo_f1),
            "sentiment_accuracy": float(sent_acc),
            "sentiment_f1": float(sent_f1),
            "valence_mse": float(mse)
        }
    }
    with open("ml/models/emotion_model/config.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("TRAINING & EVALUATION COMPLETED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    train_model()
