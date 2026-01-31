import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartPulse, Home, Brain, Activity, Phone, Moon, Sun, BarChart, MessageSquare, LogOut, User, History as HistoryIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Don't show navbar on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: '1rem 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        padding: '0.75rem 1.5rem',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--glass-border)'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '12px', color: 'white' }}>
            <HeartPulse size={24} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)' }}>HealthAI</span>
        </Link>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="hidden-mobile">
          <NavLink to="/" icon={<Home size={20} />} text="Home" active={isActive('/')} />
          <NavLink to="/symptoms" icon={<Activity size={20} />} text="Analyzer" active={isActive('/symptoms')} />
          <NavLink to="/chatbot" icon={<MessageSquare size={20} />} text="Chatbot" active={isActive('/chatbot')} />
          <NavLink to="/mental-health" icon={<Brain size={20} />} text="Mental Health" active={isActive('/mental-health')} />
          <NavLink to="/analytics" icon={<BarChart size={20} />} text="Analytics" active={isActive('/analytics')} />
          <NavLink to="/history" icon={<HistoryIcon size={20} />} text="History" active={isActive('/history')} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-main)', padding: '0.5rem', display: 'flex'
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link to="/emergency" className="btn btn-danger" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <Phone size={18} />
            <span>Emergency</span>
          </Link>

          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(14, 165, 233, 0.1)',
                borderRadius: '12px'
              }}>
                <User size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#ef4444';
                  e.target.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--glass-border)';
                  e.target.style.color = 'var(--text-muted)';
                }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, text, active }) => (
  <Link to={to} style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    fontWeight: active ? 600 : 400,
    transition: 'color 0.2s',
    padding: '0.5rem',
    borderRadius: '12px',
    background: active ? 'rgba(14, 165, 233, 0.1)' : 'transparent'
  }}>
    {icon}
    <span>{text}</span>
  </Link>
);

export default Navbar;
