import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [letter, setLetter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get('/dashboard');
    setData(res.data);
  };

  const handleSettlement = async (loanId) => {
    const res = await api.post(`/predict-settlement/${loanId}`);
    alert(`Predicted Settlement: $${res.data.suggested_settlement} | Risk: ${res.data.risk_category}`);
  };

  const handleNegotiation = async (loanId) => {
    const res = await api.post(`/generate-negotiation/${loanId}`);
    setLetter(res.data.negotiation_letter);
  };

  if (!data) return <div className="loading">Loading Financial Data...</div>;

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {data.user.name}</h1>
        <button onClick={() => { localStorage.removeItem('token'); window.location.href='/login'; }}>Logout</button>
      </header>

      <div className="metrics-grid">
        <div className="card">
          <h3>Stress Level</h3>
          <p className={`stress-${data.metrics.stress_level.toLowerCase()}`}>{data.metrics.stress_level}</p>
        </div>
        <div className="card">
          <h3>Monthly Surplus</h3>
          <p>${data.metrics.monthly_surplus.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>EMI Ratio</h3>
          <p>{data.metrics.emi_ratio}%</p>
        </div>
      </div>

      <div className="loans-section">
        <h2>Your Loans</h2>
        {data.loans.map(loan => (
          <div key={loan.loan_id} className="loan-card">
            <h3>{loan.lender_name}</h3>
            <p>Outstanding: ${loan.outstanding_amount}</p>
            <p>EMI: ${loan.emi}</p>
            <div className="actions">
              <button onClick={() => handleSettlement(loan.loan_id)}>Predict Settlement</button>
              <button onClick={() => handleNegotiation(loan.loan_id)}>Generate Letter</button>
            </div>
          </div>
        ))}
      </div>

      {letter && (
        <div className="letter-modal">
          <h2>AI Negotiation Letter</h2>
          <pre>{letter}</pre>
          <button onClick={() => setLetter('')}>Close</button>
        </div>
      )}
    </div>
  );
}