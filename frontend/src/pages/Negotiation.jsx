import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Negotiation() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loanDetails, setLoanDetails] = useState(null);

  useEffect(() => {
    fetchLetter();
  }, [loanId]);

  const fetchLetter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get the loan details
      const dashboardRes = await api.get('/dashboard');
      const loan = dashboardRes.data.loans.find(l => l.loan_id === parseInt(loanId));
      setLoanDetails(loan);

      // Generate the negotiation letter
      const res = await api.post(`/generate-negotiation/${loanId}`);
      
      if (res.data && res.data.negotiation_letter) {
        setLetter(res.data.negotiation_letter);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.detail || 'Failed to generate negotiation letter. Please try again.');
      
      // Show fallback letter if API fails
      setLetter(generateFallbackLetter());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackLetter = () => {
    if (!loanDetails) return 'Loading...';
    
    return `Subject: Settlement Proposal for ${loanDetails.loan_type || 'Loan'} Account

Dear ${loanDetails.lender_name} Management,

I hope this letter finds you well. I am writing to formally propose a settlement for my loan account.

Due to unforeseen financial circumstances, I am currently unable to repay the full outstanding amount of ₹${loanDetails.outstanding_amount?.toLocaleString('en-IN')}. However, I am committed to resolving this debt responsibly.

I would like to propose a one-time lump sum settlement at a mutually agreeable amount. I request you to kindly consider my proposal and provide:

1. Settlement amount confirmation
2. No Dues Certificate upon payment
3. Credit bureau update to reflect "Settled" status

I believe this proposal is in the mutual interest of both parties. I request your prompt consideration.

Thank you for your understanding.

Sincerely,
[Your Name]
Date: ${new Date().toLocaleDateString('en-IN')}`;
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([letter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Negotiation_Letter_Loan_${loanId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letter);
    alert('📋 Letter copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="loading">
        Crafting your negotiation letter... ✍️
      </div>
    );
  }

  return (
    <div className="letter-container">
      <h2>📝 Your Negotiation Letter</h2>
      
      {error && (
        <div className="error-message">
          ⚠️ {error}<br/>
          <small>Showing fallback letter (AI service unavailable)</small>
        </div>
      )}

      <div className="letter-content">
        {letter}
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={handleDownload}>
          📥 Download Letter
        </button>
        <button className="btn btn-secondary" onClick={handleCopy}>
          📋 Copy to Clipboard
        </button>
        <button className="btn btn-danger" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: 'var(--glass-bg)',
        borderRadius: '15px',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>
           <strong>Pro Tip:</strong> Send this letter via registered post or email for official records.
        </p>
      </div>
    </div>
  );
}