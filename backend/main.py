from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os

from database import engine, Base, get_db
from models import User, FinancialProfile, Loan, SettlementPrediction, AIHistory
from financial_engine import calculate_financial_health, calculate_settlement
from ai_engine import generate_negotiation_letter
from pydantic import BaseModel
from typing import List, Optional

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinRelief AI API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret")
ALGORITHM = "HS256"

# --- Pydantic Schemas ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    monthly_income: float
    monthly_expenses: float

class LoanCreate(BaseModel):
    lender_name: str
    loan_type: str
    outstanding_amount: float
    interest_rate: float
    emi: float
    overdue_months: int = 0

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Auth Endpoints ---
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = generate_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create initial financial profile
    profile = FinancialProfile(
        user_id=new_user.user_id,
        monthly_income=user.monthly_income,
        monthly_expenses=user.monthly_expenses
    )
    db.add(profile)
    db.commit()
    return {"msg": "User registered successfully", "user_id": new_user.user_id}

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not check_password_hash(user.hashed_password, form_data.password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    token = jwt.encode({"sub": user.email, "exp": datetime.utcnow() + timedelta(hours=2)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- Core Endpoints ---
@app.get("/dashboard")
def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.user_id).first()
    loans = db.query(Loan).filter(Loan.user_id == user.user_id).all()
    
    total_emi = sum(loan.emi for loan in loans)
    metrics = calculate_financial_health(profile.monthly_income, profile.monthly_expenses, total_emi)
    
    # Update profile with calculated metrics
    profile.emi_ratio = metrics["emi_ratio"]
    profile.dti_ratio = metrics["dti_ratio"]
    profile.monthly_surplus = metrics["monthly_surplus"]
    profile.stress_level = metrics["stress_level"]
    db.commit()
    
    return {
        "user": {"name": user.name, "email": user.email},
        "metrics": metrics,
        "loans": [{"loan_id": l.loan_id, "lender_name": l.lender_name, "outstanding_amount": l.outstanding_amount, "emi": l.emi} for l in loans]
    }

@app.post("/add-loan")
def add_loan(loan: LoanCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_loan = Loan(user_id=user.user_id, **loan.dict())
    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)
    return {"msg": "Loan added", "loan_id": new_loan.loan_id}

@app.post("/predict-settlement/{loan_id}")
def predict_settlement(loan_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.loan_id == loan_id, Loan.user_id == user.user_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    prediction = calculate_settlement(loan.outstanding_amount, loan.overdue_months, loan.loan_type)
    
    record = SettlementPrediction(
        loan_id=loan.loan_id, user_id=user.user_id,
        suggested_settlement=prediction["suggested_settlement"],
        risk_category=prediction["risk_category"],
        predicted_amount=prediction["predicted_amount"]
    )
    db.add(record)
    db.commit()
    return prediction

@app.post("/generate-negotiation/{loan_id}")
def generate_negotiation(loan_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.loan_id == loan_id, Loan.user_id == user.user_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    prediction = db.query(SettlementPrediction).filter(SettlementPrediction.loan_id == loan_id).order_by(SettlementPrediction.settlement_id.desc()).first()
    settlement_amount = prediction.suggested_settlement if prediction else loan.outstanding_amount * 0.8
    
    letter = generate_negotiation_letter(user.name, loan.lender_name, loan.loan_type, loan.outstanding_amount, settlement_amount)
    
    history = AIHistory(
        user_id=user.user_id,
        generated_content=letter,
        query_type="Negotiation Letter"
    )
    db.add(history)
    db.commit()
    
    return {"negotiation_letter": letter}