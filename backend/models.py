from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    loans = relationship("Loan", back_populates="owner")
    profile = relationship("FinancialProfile", back_populates="owner", uselist=False)
    settlements = relationship("SettlementPrediction", back_populates="owner")
    ai_history = relationship("AIHistory", back_populates="owner")

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"
    profile_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True)
    monthly_income = Column(Float)
    monthly_expenses = Column(Float)
    emi_ratio = Column(Float, default=0.0)
    dti_ratio = Column(Float, default=0.0)
    monthly_surplus = Column(Float, default=0.0)
    stress_level = Column(String, default="Low")

    owner = relationship("User", back_populates="profile")

class Loan(Base):
    __tablename__ = "loans"
    loan_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    lender_name = Column(String)
    loan_type = Column(String)
    outstanding_amount = Column(Float)
    interest_rate = Column(Float)
    emi = Column(Float)
    overdue_months = Column(Integer, default=0)

    owner = relationship("User", back_populates="loans")
    settlements = relationship("SettlementPrediction", back_populates="loan")

class SettlementPrediction(Base):
    __tablename__ = "settlement_predictions"
    settlement_id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.loan_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    suggested_settlement = Column(Float)
    risk_category = Column(String)
    predicted_amount = Column(Float)

    owner = relationship("User", back_populates="settlements")
    loan = relationship("Loan", back_populates="settlements")

class AIHistory(Base):
    __tablename__ = "ai_history"
    history_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    generated_content = Column(String)
    query_type = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="ai_history")