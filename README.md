# 💰 FinRelief AI - AI-Powered Debt Relief & Financial Recovery Platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://react.dev/)

**FinRelief AI** is an intelligent financial recovery platform that helps borrowers negotiate loan settlements using AI-powered negotiation strategies, settlement predictions, and personalized financial advice.

---

## 🌟 Features
## 💡 Project Idea

Managing debt and negotiating loan settlements with financial institutions is a highly stressful and complex process for borrowers. Many individuals struggle with high-interest loans, multiple outstanding EMIs, and a lack of clarity regarding their actual financial health. Furthermore, manually drafting professional settlement requests or negotiating with banks requires specialized financial knowledge that most borrowers do not possess. 

**FinRelief AI** was conceptualized to bridge this gap. The core idea is to build an intelligent, AI-powered digital platform that acts as a personal financial advocate for borrowers. By analyzing a user's income, expenses, and loan portfolio, the system aims to provide data-driven debt recovery strategies, predict optimal settlement amounts, and automate the creation of professional negotiation letters, thereby empowering users to regain control of their financial future.

---

## 🚀 Proposed Solution

To solve the challenges of modern debt management, we propose **FinRelief AI**, a comprehensive full-stack web application that combines real-time financial analytics with Generative AI. 

Our solution includes the following key components:

1. **Intelligent Financial Health Engine:** 
   A dedicated backend module that instantly calculates critical financial metrics such as EMI-to-Income ratio, Debt-to-Income (DTI) ratio, and monthly surplus. It classifies the borrower's financial stress level (Low, Medium, High) to provide immediate clarity on their financial standing.

2. **AI-Powered Negotiation & Settlement Strategy:** 
   By integrating the **Google Gemini API**, the platform analyzes the borrower's complete financial profile and loan details to generate personalized, lender-specific negotiation letters. If the AI API is unavailable, a robust **rule-based fallback engine** ensures the system continues to generate professional settlement requests without interruption.

3. **Data-Driven Settlement Predictions:** 
   The system evaluates outstanding loan amounts, overdue durations, and loan types to calculate the highest probability settlement percentages. It assigns priority levels to loans, helping borrowers focus on the most critical debts first.

4. **Modern, User-Centric Interface:** 
   A responsive, GenZ-inspired dark-themed dashboard built with **React.js** and **Vite**. It provides real-time data visualization, interactive financial cards, and a seamless user experience across desktop and mobile devices.

5. **Secure & Scalable Architecture:** 
   Built on a modular **FastAPI (Python)** backend with **SQLite** (easily scalable to cloud databases like PostgreSQL), the platform ensures secure data handling. It features **JWT-based authentication**, **Werkzeug password hashing**, and structured environment variable management to guarantee enterprise-grade security and scalability.
### Core Functionalities
- 🔐 **Secure User Authentication** - JWT-based authentication with password hashing
- 📊 **Financial Health Dashboard** - Real-time EMI ratio, debt-to-income ratio, and stress level analysis
- 🎯 **Settlement Prediction** - AI-powered settlement amount recommendations based on loan type and overdue period
- ✉️ **AI Negotiation Letters** - Automated generation of professional negotiation letters using Google Gemini AI
- 📈 **Loan Priority Analysis** - Intelligent loan sorting based on financial urgency
- 💡 **Personalized Financial Advice** - AI-driven recommendations for debt management
- 📱 **Responsive Design** - Modern, GenZ-style UI optimized for all devices

### Key Highlights
- **Smart Financial Metrics**: Monthly surplus, EMI-to-income ratio, debt stress classification
- **Rule-Based Fallback**: Continues to work even without Google Gemini API key
- **Secure Data Storage**: SQLite database with encrypted passwords
- **Real-time Analytics**: Dynamic dashboard with interactive visualizations
- **Multi-Loan Management**: Track and negotiate multiple loans simultaneously

---

## 🛠️ Tech Stack

### **Backend**
- **Python 3.11+** - Core programming language
- **FastAPI** - High-performance REST API framework
- **SQLAlchemy ORM** - Database management and ORM
- **SQLite** - Lightweight relational database
- **JWT** - Secure authentication
- **Werkzeug** - Password hashing
- **Google Gemini API** - AI-powered negotiation generation

### **Frontend**
- **React.js 18+** - Modern UI library
- **Vite** - Fast build tool with hot reload
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing
- **Custom CSS** - Dark-themed professional UI

### **Development Tools**
- **Git & GitHub** - Version control
- **VS Code** - Development environment
- **Python venv** - Virtual environment isolation

---

## 📦 Installation & Setup

### **Prerequisites**
- Python 3.11 or higher
- Node.js 16+ and npm
- Git
## 🚀 Project Workflow & Development Epics

The project was developed using a structured Agile methodology, divided into 6 core Epics:

1. **Epic 1: System Setup & Architecture** - Python backend environment, React.js frontend setup, and modular full-stack directory organization.
2. **Epic 2: AI Integration & Financial Processing** - FastAPI endpoints, Financial Engine module, Settlement Prediction system, and Google Gemini AI negotiation strategy engine with rule-based fallback logic.
3. **Epic 3: Database Management** - Secure SQLite storage, SQLAlchemy ORM implementation, JWT authentication, and structured data handling for loans and settlements.
4. **Epic 4: Frontend Integration & UI** - React.js dashboard development, Axios API communication, real-time financial data visualization, and modern dark-themed UI enhancements.
5. **Epic 5: Testing & Optimization** - System testing across multiple financial scenarios, backend error handling, AI fallback management, and secure session optimization.
6. **Epic 6: Finalization & Deployment** - GitHub version control management, project cleanup, modular folder organization, and production readiness configuration.
---

## 🎯 Project Conclusion

**FinRelief AI** successfully demonstrates the application of modern full-stack web technologies and intelligent AI-powered negotiation systems in improving the efficiency of debt management. By integrating Google Gemini AI, the system enhances the borrower experience by providing dynamic, personalized settlement recommendations based on financial profiles and debt stress levels. 

With structured input validation, robust rule-based fallback handling, JWT-based authentication, and a modular architecture, FinRelief AI simplifies debt negotiation, reduces manual effort in settlement letter preparation, and empowers borrowers with AI-driven financial insights for a faster path to financial freedom.
