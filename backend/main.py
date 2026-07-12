from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

from database import engine, Base, get_db
from models import User, FinancialProfile, Loan, SettlementPrediction, AIHistory
from financial_engine import calculate_financial_health, calculate_settlement
from ai_engine import generate_negotiation_letter
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()

# Create database tables
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
# Serve Frontend Static Files
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

# SPA Fallback Route
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Skip API routes and docs
    if full_path.startswith("api/") or full_path in ["docs", "openapi.json", "redoc"]:
        return {"detail": "Not Found"}
    
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not built"}
# JWT Configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

# Pydantic Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    monthly_income: float
    monthly_expenses: float

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoanCreate(BaseModel):
    lender_name: str
    loan_type: str
    outstanding_amount: float
    interest_rate: float
    emi: float
    overdue_months: int = 0

# Authentication Endpoints
@app.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = generate_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create financial profile
    profile = FinancialProfile(
        user_id=new_user.user_id,
        monthly_income=user.monthly_income,
        monthly_expenses=user.monthly_expenses
    )
    db.add(profile)
    db.commit()
    
    return {"message": "User registered successfully", "user_id": new_user.user_id}

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not check_password_hash(user.hashed_password, form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt.encode(
        {"sub": user.email, "exp": datetime.utcnow() + access_token_expires},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Helper function to get current user
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

# Dashboard Endpoint
@app.get("/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get user's financial profile
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.user_id).first()
    
    # Get user's loans
    loans = db.query(Loan).filter(Loan.user_id == current_user.user_id).all()
    
    # Calculate total EMI
    total_emi = sum(loan.emi for loan in loans)
    
    # Calculate financial health metrics
    metrics = calculate_financial_health(
        profile.monthly_income,
        profile.monthly_expenses,
        total_emi
    )
    
    # Update profile with calculated metrics
    profile.emi_ratio = metrics["emi_ratio"]
    profile.dti_ratio = metrics["dti_ratio"]
    profile.monthly_surplus = metrics["monthly_surplus"]
    profile.stress_level = metrics["stress_level"]
    db.commit()
    
    # Format loans for response
    loans_data = [
        {
            "loan_id": loan.loan_id,
            "lender_name": loan.lender_name,
            "loan_type": loan.loan_type,
            "outstanding_amount": loan.outstanding_amount,
            "interest_rate": loan.interest_rate,
            "emi": loan.emi,
            "overdue_months": loan.overdue_months
        }
        for loan in loans
    ]
    
    return {
        "user": {
            "name": current_user.name,
            "email": current_user.email
        },
        "metrics": metrics,
        "loans": loans_data
    }

# Add Loan Endpoint
@app.post("/add-loan")
async def add_loan(loan: LoanCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_loan = Loan(
        user_id=current_user.user_id,
        lender_name=loan.lender_name,
        loan_type=loan.loan_type,
        outstanding_amount=loan.outstanding_amount,
        interest_rate=loan.interest_rate,
        emi=loan.emi,
        overdue_months=loan.overdue_months
    )
    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)
    
    return {"message": "Loan added successfully", "loan_id": new_loan.loan_id}

# Predict Settlement Endpoint
@app.post("/predict-settlement/{loan_id}")
async def predict_settlement(loan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(
        Loan.loan_id == loan_id,
        Loan.user_id == current_user.user_id
    ).first()
    
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    # Calculate settlement prediction
    prediction = calculate_settlement(
        loan.outstanding_amount,
        loan.overdue_months,
        loan.loan_type
    )
    
    # Save prediction to database
    settlement_record = SettlementPrediction(
        loan_id=loan.loan_id,
        user_id=current_user.user_id,
        suggested_settlement=prediction["suggested_settlement"],
        risk_category=prediction["risk_category"],
        predicted_amount=prediction["predicted_amount"]
    )
    db.add(settlement_record)
    db.commit()
    
    return prediction

# Generate Negotiation Letter Endpoint
@app.post("/generate-negotiation/{loan_id}")
async def generate_negotiation(loan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get loan details
    loan = db.query(Loan).filter(
        Loan.loan_id == loan_id,
        Loan.user_id == current_user.user_id
    ).first()
    
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    # Get user's financial profile
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == current_user.user_id
    ).first()
    
    # Calculate suggested settlement (70% of outstanding)
    suggested_settlement = loan.outstanding_amount * 0.7
    
    # Generate negotiation letter using AI engine
    letter = generate_negotiation_letter(
        user_name=current_user.name,
        lender_name=loan.lender_name,
        loan_type=loan.loan_type or "Personal",
        outstanding_amount=loan.outstanding_amount,
        suggested_settlement=suggested_settlement,
        monthly_income=profile.monthly_income if profile else 50000,
        monthly_expenses=profile.monthly_expenses if profile else 30000
    )
    
    # Save to AI history
    ai_history = AIHistory(
        user_id=current_user.user_id,
        generated_content=letter,
        query_type="negotiation_letter"
    )
    db.add(ai_history)
    db.commit()
    
    return {"negotiation_letter": letter}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to FinRelief AI API"}