import os
import torch
import torch.nn as nn
from transformers import BertModel, AutoModel

def get_encoder_path(model_name="google/muril-base-cased"):
    snapshot = os.path.expanduser(
        "~/.cache/huggingface/hub/models--google--muril-base-cased/snapshots/afd9f36c7923d54e97903922ff1b260d091d202f"
    )
    if os.path.exists(snapshot):
        return snapshot
    return model_name

class MultitaskJournalModel(nn.Module):
    def __init__(self, model_name="google/muril-base-cased", num_sentiments=4, num_emotions=7, pretrained_path=None):
        super(MultitaskJournalModel, self).__init__()
        target_path = pretrained_path or get_encoder_path(model_name)
        
        try:
            self.encoder = BertModel.from_pretrained(target_path)
        except Exception:
            self.encoder = AutoModel.from_pretrained(target_path)
            
        # Freeze initial encoder layers
        for param in self.encoder.parameters():
            param.requires_grad = False

        hidden_size = self.encoder.config.hidden_size
        
        # Classification Heads
        self.sentiment_head = nn.Sequential(
            nn.Linear(hidden_size, 128),
            nn.LayerNorm(128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_sentiments)
        )
        
        self.emotion_head = nn.Sequential(
            nn.Linear(hidden_size, 128),
            nn.LayerNorm(128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_emotions)
        )
        
        self.valence_head = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.LayerNorm(64),
            nn.ReLU(),
            nn.Linear(64, 1)
        )

    def extract_features(self, input_ids, attention_mask):
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        return outputs.last_hidden_state[:, 0, :]

    def forward(self, input_ids, attention_mask):
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        sequence_output = outputs.last_hidden_state # (batch, seq_len, hidden)
        cls_repr = sequence_output[:, 0, :] # [CLS] embedding
        
        sentiment_logits = self.sentiment_head(cls_repr)
        emotion_logits = self.emotion_head(cls_repr)
        valence_score = torch.tanh(self.valence_head(cls_repr)) # range [-1.0, 1.0]
        
        # Compute token saliency for explanation
        token_norms = torch.norm(sequence_output, dim=-1) * attention_mask.float()
        token_weights = token_norms / (torch.sum(token_norms, dim=-1, keepdim=True) + 1e-9)
        
        return {
            "sentiment_logits": sentiment_logits,
            "emotion_logits": emotion_logits,
            "valence": valence_score,
            "attention_weights": token_weights
        }

