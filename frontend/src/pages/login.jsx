import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', income: '', expenses: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await api.post('/register', {
          name: formData.name, email: formData.email, password: formData.password,
          monthly_income: parseFloat(formData.income), monthly_expenses: parseFloat(formData.expenses)
        });
        alert('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        const res = await api.post('/token', `username=${formData.email}&password=${formData.password}`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        localStorage.setItem('token', res.data.access_token);
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? 'Register' : 'Login'} to FinRelief AI</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && <input placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />}
        <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
        {isRegister && (
          <>
            <input type="number" placeholder="Monthly Income" value={formData.income} onChange={e => setFormData({...formData, income: e.target.value})} required />
            <input type="number" placeholder="Monthly Expenses" value={formData.expenses} onChange={e => setFormData({...formData, expenses: e.target.value})} required />
          </>
        )}
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <p onClick={() => setIsRegister(!isRegister)} className="toggle-link">
        {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
      </p>
    </div>
  );
}