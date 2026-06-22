import re
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    password_confirmation: Optional[str] = None
    consent_model_training: Optional[bool] = False

    @validator("password")
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @validator("password_confirmation")
    def validate_passwords_match(cls, v, values):
        if v is not None and "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserConsentUpdate(BaseModel):
    consent: bool

class ThemePreferenceUpdate(BaseModel):
    theme: str # light, dark, system

class User(UserBase):
    id: int
    consent_model_training: bool = False
    theme_preference: str = "system"
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[User] = None

class TokenData(BaseModel):
    email: Optional[str] = None
