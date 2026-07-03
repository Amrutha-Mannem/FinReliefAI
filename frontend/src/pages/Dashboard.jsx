import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading your financial dashboard... 💫</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {data?.user?.name || 'User'}! 👋</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
            {data?.user?.email}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/loan-entry')}>
            + Add Loan
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/advisor')}>
            📊 Financial Advisor
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Financial Stress Level</h3>
          <div className={`value ${
            data?.metrics?.stress_level === 'High' ? 'critical' : 
            data?.metrics?.stress_level === 'Medium' ? 'high-stress' : ''
          }`}>
            {data?.metrics?.stress_level || 'N/A'}
          </div>
        </div>
        <div className="metric-card">
          <h3>Monthly Surplus</h3>
          <div className="value">
            ₹{data?.metrics?.monthly_surplus?.toLocaleString('en-IN') || '0'}
          </div>
        </div>
        <div className="metric-card">
          <h3>EMI-to-Income Ratio</h3>
          <div className="value">{data?.metrics?.emi_ratio || '0'}%</div>
        </div>
        <div className="metric-card">
          <h3>Debt-to-Income Ratio</h3>
          <div className="value">{data?.metrics?.dti_ratio || '0'}%</div>
        </div>
      </div>

      {/* Loans Section */}
      <div className="loans-section">
        <h2 className="section-title">Your Active Loans 💳</h2>
        
        {data?.loans && data.loans.length > 0 ? (
          data.loans.map((loan) => (
            <div key={loan.loan_id} className="loan-card">
              <h3>{loan.lender_name}</h3>
              
              <div className="loan-details">
                <div className="loan-detail">
                  <div className="loan-detail-label">Loan Type</div>
                  <div className="loan-detail-value">{loan.loan_type || 'N/A'}</div>
                </div>
                <div className="loan-detail">
                  <div className="loan-detail-label">Outstanding Amount</div>
                  <div className="loan-detail-value">₹{loan.outstanding_amount?.toLocaleString('en-IN') || '0'}</div>
                </div>
                <div className="loan-detail">
                  <div className="loan-detail-label">Monthly EMI</div>
                  <div className="loan-detail-value">₹{loan.emi?.toLocaleString('en-IN') || '0'}</div>
                </div>
                <div className="loan-detail">
                  <div className="loan-detail-label">Interest Rate</div>
                  <div className="loan-detail-value">{loan.interest_rate || 'N/A'}%</div>
                </div>
              </div>

              {loan.overdue_months > 0 && (
                <div style={{ 
                  padding: '15px', 
                  background: 'rgba(238, 90, 111, 0.1)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  color: '#ee5a6f',
                  fontWeight: '600'
                }}>
                  ⚠️ Overdue: {loan.overdue_months} {loan.overdue_months === 1 ? 'month' : 'months'}
                </div>
              )}

              <div className="loan-actions">
                <button 
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      const res = await api.post(`/predict-settlement/${loan.loan_id}`);
                      alert(
                        ` Settlement Prediction:\n\n` +
                        `Suggested Settlement: ₹${res.data.suggested_settlement.toLocaleString('en-IN')}\n` +
                        `Risk Category: ${res.data.risk_category}\n` +
                        `You Could Save: ₹${res.data.predicted_amount.toLocaleString('en-IN')}`
                      );
                    } catch (err) {
                      alert('Error generating prediction');
                    }
                  }}
                >
                  📊 Predict Settlement
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate(`/negotiation/${loan.loan_id}`)}
                >
                  ✉️ Generate Negotiation Letter
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="metric-card" style={{ textAlign: 'center', padding: '60px' }}>
            <h3 style={{ marginBottom: '20px' }}>No loans yet! 🎉</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
              Add your first loan to start tracking and negotiating
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/loan-entry')}>
              + Add Your First Loan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}