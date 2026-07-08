import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LoanEntry from './pages/LoanEntry';
import FinancialAdvisor from './pages/FinancialAdvisor';
import Negotiation from './pages/Negotiation';
import './App.css';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/loan-entry" element={<PrivateRoute><LoanEntry /></PrivateRoute>} />
          <Route path="/advisor" element={<PrivateRoute><FinancialAdvisor /></PrivateRoute>} />
          <Route path="/negotiation/:loanId" element={<PrivateRoute><Negotiation /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;