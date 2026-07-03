import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function FinancialAdvisor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
      generateAdvice(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAdvice = (data) => {
    const tips = [];
    const metrics = data.metrics;
    const loans = data.loans;

    // Income & Expenses Analysis
    if (metrics.monthly_surplus > 0) {
      tips.push({
        type: 'positive',
        message: `Great news! You have a monthly surplus of ₹${metrics.monthly_surplus.toLocaleString('en-IN')}. This is your power to negotiate! 💪`
      });
    } else {
      tips.push({
        type: 'warning',
        message: `Your monthly surplus is ₹${metrics.monthly_surplus.toLocaleString('en-IN')}. Let's work on reducing your EMIs through settlement. 📉`
      });
    }

    // EMI Ratio Analysis
    if (metrics.emi_ratio > 40) {
      tips.push({
        type: 'critical',
        message: `⚠️ Your EMI-to-income ratio is ${metrics.emi_ratio}% - that's HIGH! You should ideally keep it below 30%. Time to negotiate those loans!`
      });
    } else if (metrics.emi_ratio > 20) {
      tips.push({
        type: 'moderate',
        message: `Your EMI ratio is ${metrics.emi_ratio}%. It's manageable, but we can do better. Let's optimize! 📊`
      });
    } else {
      tips.push({
        type: 'positive',
        message: `Awesome! Your EMI ratio is ${metrics.emi_ratio}% - well within healthy limits. Keep it up! 🎉`
      });
    }

    // DTI Analysis
    if (metrics.dti_ratio > 50) {
      tips.push({
        type: 'critical',
        message: `Your debt-to-income ratio is ${metrics.dti_ratio}% - this is concerning. Consider debt consolidation or settlement. 🚨`
      });
    }

    // Loan-specific advice
    loans.forEach(loan => {
      const yearsToPayoff = loan.outstanding_amount / (loan.emi * 12);
      const totalInterest = (loan.emi * 12 * yearsToPayoff) - loan.outstanding_amount;
      
      if (yearsToPayoff > 5) {
        tips.push({
          type: 'info',
          message: `For your ${loan.lender_name} loan: At current EMI of ₹${loan.emi.toLocaleString('en-IN')}, you'll pay for ${yearsToPayoff.toFixed(1)} years with ₹${totalInterest.toLocaleString('en-IN')} in interest. If you double your EMI for 3 years, you'll save lakhs! 💡`
        });
      }

      if (loan.overdue_months > 0) {
        tips.push({
          type: 'warning',
          message: `Your ${loan.lender_name} loan is ${loan.overdue_months} months overdue. This actually gives us NEGOTIATION POWER! Lenders prefer partial payment over nothing. Let's use this! 🎯`
        });
      }
    });

    // General advice
    if (loans.length > 0) {
      const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding_amount, 0);
      const avgSettlementDiscount = 0.25; // 25% average discount
      const potentialSavings = totalOutstanding * avgSettlementDiscount;
      
      tips.push({
        type: 'opportunity',
        message: `💰 Based on your total outstanding of ₹${totalOutstanding.toLocaleString('en-IN')}, you could potentially save ₹${potentialSavings.toLocaleString('en-IN')} through strategic settlements. That's real money back in your pocket!`
      });
    }

    setAdvice(tips);
  };

  if (loading) return <div className="loading">Analyzing your finances... 🔍</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Your Financial Health Report 📊</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
            AI-Powered Analysis & Recommendations
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Quick Metrics */}
      <div className="metrics-grid" style={{ marginBottom: '40px' }}>
        <div className="metric-card">
          <h3>Monthly Income</h3>
          <div className="value">₹{((data.metrics.monthly_surplus + (data.loans.reduce((sum, l) => sum + l.emi, 0))) + 20000).toLocaleString('en-IN')}</div>
        </div>
        <div className="metric-card">
          <h3>Financial Stress</h3>
          <div className={`value ${data.metrics.stress_level === 'High' ? 'critical' : data.metrics.stress_level === 'Medium' ? 'high-stress' : ''}`}>
            {data.metrics.stress_level}
          </div>
        </div>
        <div className="metric-card">
          <h3>Total Active Loans</h3>
          <div className="value">{data.loans.length}</div>
        </div>
      </div>

      {/* AI Advisor Section */}
      <div className="advisor-container">
        <div className="advisor-header">
          <h2>🤖 Your AI Financial Advisor</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Here's what I found after analyzing your profile:
          </p>
        </div>

        {advice.map((tip, index) => (
          <div 
            key={index}
            className="advisor-message"
            style={{
              borderLeftColor: 
                tip.type === 'positive' ? 'var(--accent-green)' :
                tip.type === 'warning' ? 'var(--accent-pink)' :
                tip.type === 'critical' ? '#ee5a6f' :
                tip.type === 'opportunity' ? 'var(--accent-cyan)' :
                'var(--accent-purple)'
            }}
          >
            {tip.message}
          </div>
        ))}

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/loan-entry'}
            style={{ marginRight: '15px' }}
          >
            + Add Another Loan
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}