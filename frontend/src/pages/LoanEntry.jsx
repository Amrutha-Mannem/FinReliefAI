import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function LoanEntry() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loanData, setLoanData] = useState({
    lender_name: '',
    loan_type: 'Personal',
    outstanding_amount: '',
    interest_rate: '',
    emi: '',
    overdue_months: '0'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/add-loan', {
        lender_name: loanData.lender_name,
        loan_type: loanData.loan_type,
        outstanding_amount: parseFloat(loanData.outstanding_amount),
        interest_rate: parseFloat(loanData.interest_rate),
        emi: parseFloat(loanData.emi),
        overdue_months: parseInt(loanData.overdue_months) || 0
      });
      
      alert('🎯 Loan added successfully! Let me analyze this for you...');
      navigate('/advisor');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || 'Failed to add loan'));
    }
  };

  const getStepMessage = () => {
    switch(step) {
      case 1:
        return {
          title: "Let's talk about your loan 🏦",
          message: "Who gave you this loan? Bank? NBFC? Friend? (No judgment, we've all been there!)",
          field: "lender_name",
          placeholder: "e.g., HDFC Bank, SBI, ICICI..."
        };
      case 2:
        return {
          title: "What type of loan is it? 📋",
          message: "This helps me understand how to negotiate better. Different loans = different strategies!",
          field: "loan_type",
          type: "select",
          options: ["Personal", "Home", "Car", "Education", "Business", "Credit Card", "Other"]
        };
      case 3:
        return {
          title: "How much is still pending? 💰",
          message: "Be honest with me - I'm here to help, not to judge! This is the outstanding amount.",
          field: "outstanding_amount",
          placeholder: "e.g., 500000"
        };
      case 4:
        return {
          title: "What's the interest rate? 📊",
          message: "This is where the magic (or tragedy) happens. High interest = more reason to negotiate!",
          field: "interest_rate",
          placeholder: "e.g., 12.5 (in percentage)"
        };
      case 5:
        return {
          title: "Monthly EMI amount 📅",
          message: "How much are you paying every month? Let's see if we can reduce this burden.",
          field: "emi",
          placeholder: "e.g., 15000"
        };
      case 6:
        return {
          title: "Any overdue months? ⚠️",
          message: "If you've missed payments, don't worry! This actually helps in negotiation. Enter 0 if all payments are up to date.",
          field: "overdue_months",
          placeholder: "e.g., 0, 1, 2, 3..."
        };
      default:
        return {};
    }
  };

  const currentStep = getStepMessage();
  const progress = (step / 6) * 100;

  return (
    <div className="form-page">
      <h2>{currentStep.title}</h2>
      <p className="form-subtitle">{currentStep.message}</p>

      {/* Progress Bar */}
      <div style={{ 
        width: '100%', 
        height: '8px', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '10px',
        marginBottom: '40px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'var(--primary-gradient)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        if (step < 6) {
          setStep(step + 1);
        } else {
          handleSubmit(e);
        }
      }}>
        <div className="form-group">
          {currentStep.type === 'select' ? (
            <select
              value={loanData[currentStep.field]}
              onChange={(e) => setLoanData({...loanData, [currentStep.field]: e.target.value})}
              required
            >
              {currentStep.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              step="0.01"
              placeholder={currentStep.placeholder}
              value={loanData[currentStep.field]}
              onChange={(e) => setLoanData({...loanData, [currentStep.field]: e.target.value})}
              required
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          {step > 1 && (
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(step - 1)}
              style={{ flex: 1 }}
            >
              ← Back
            </button>
          )}
          <button 
            type="submit"
            className="btn btn-primary"
            style={{ flex: step === 1 ? 2 : 1 }}
          >
            {step === 6 ? "Analyze My Loan 🎯" : "Next Step →"}
          </button>
        </div>
      </form>

      <div style={{ textAlign: 'center', marginTop: '30px', color: 'var(--text-secondary)' }}>
        <p>Step {step} of 6</p>
      </div>
    </div>
  );
}