import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    income: '', 
    expenses: '' 
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await api.post('/register', {
          name: formData.name, 
          email: formData.email, 
          password: formData.password,
          monthly_income: parseFloat(formData.income), 
          monthly_expenses: parseFloat(formData.expenses)
        });
        alert('🎉 Awesome! Your account is ready. Now let\'s login!');
        setIsRegister(false);
      } else {
        const res = await api.post('/token', 
          `username=${formData.email}&password=${formData.password}`, 
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }
        );
        localStorage.setItem('token', res.data.access_token);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Oops! ' + (err.response?.data?.detail || 'Something went wrong. Check console for details.'));
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? "Join the Club! 🎉" : "Welcome Back! 👋"}</h2>
      <p className="auth-subtitle">
        {isRegister 
          ? "Ready to take control of your finances? Let's set you up!" 
          : "Hi! Ready to know about your financial health? (Don't worry, I don't judge 😄)"}
      </p>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div className="form-group">
            <label>What should I call you? 👤</label>
            <input 
              placeholder="Your Full Name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
        )}
        
        <div className="form-group">
          <label>Your Email 📧</label>
          <input 
            type="email" 
            placeholder="you@example.com" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Secret Password 🔐</label>
          <input 
            type="password" 
            placeholder="Make it strong!" 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required 
          />
        </div>

        {isRegister && (
          <>
            <div className="form-group">
              <label>Monthly Income (₹) </label>
              <input 
                type="number" 
                placeholder="e.g., 75000" 
                value={formData.income} 
                onChange={e => setFormData({...formData, income: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Monthly Expenses (₹) 💸</label>
              <input 
                type="number" 
                placeholder="e.g., 35000" 
                value={formData.expenses} 
                onChange={e => setFormData({...formData, expenses: e.target.value})} 
                required 
              />
            </div>
          </>
        )}

        <button type="submit">
          {isRegister ? "Create My Account 🚀" : "Login to Dashboard 🔓"}
        </button>
      </form>

      <div className="toggle-auth">
        <p>
          {isRegister ? 'Already have an account?' : "First time here?"}{' '}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Sign In' : 'Create Account'}
          </span>
        </p>
      </div>
    </div>
  );
}