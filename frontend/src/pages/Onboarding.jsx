import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Hey there, Financial Warrior! 💪",
      message: "First time here? Let me show you around! I'm your AI-powered financial sidekick, ready to help you crush those debts and negotiate like a pro.",
      color: "#667eea"
    },
    {
      title: "Smart Settlement Predictions 🎯",
      message: "I'll analyze your loans and tell you exactly how much you can negotiate. No more guessing games - just data-driven savings!",
      color: "#f5576c"
    },
    {
      title: "AI Negotiation Letters ✉️",
      message: "Watch me craft professional negotiation letters that actually work. I talk to lenders so you don't have to!",
      color: "#4facfe"
    },
    {
      title: "Your Financial Health Checkup 🏥",
      message: "I'll track your EMI ratios, debt levels, and give you personalized advice to get debt-free faster. Think of me as your money doctor!",
      color: "#34d399"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1>💰 FinRelief AI</h1>
        <p>Your Smart Financial Supporter</p>
      </div>

      <div 
        className="welcome-message"
        style={{ borderLeftColor: slides[currentSlide].color }}
      >
        <h2 style={{ color: slides[currentSlide].color, marginBottom: '15px' }}>
          {slides[currentSlide].title}
        </h2>
        <p>{slides[currentSlide].message}</p>
      </div>

      {/* Slide Indicators */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
        {slides.map((_, index) => (
          <div
            key={index}
            style={{
              width: currentSlide === index ? '40px' : '10px',
              height: '10px',
              background: currentSlide === index ? slides[index].color : 'rgba(255,255,255,0.2)',
              borderRadius: '5px',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      <button 
        onClick={() => navigate('/login')}
        style={{
          background: `linear-gradient(135deg, ${slides[currentSlide].color} 0%, ${slides[(currentSlide + 1) % slides.length].color} 100%)`,
        }}
      >
        {currentSlide === slides.length - 1 ? "Let's Get Started! 🚀" : "Skip to Login →"}
      </button>

      <div className="toggle-auth">
        <p>
          Already have an account? <span onClick={() => navigate('/login')}>Sign In</span>
        </p>
      </div>
    </div>
  );
}