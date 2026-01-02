import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartPulse, Home, Brain, Activity, Phone, Moon, Sun, BarChart } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  const isActive = (path) => location.pathname === path;

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
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        padding: '0.75rem 1.5rem',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
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
          <NavLink to="/mental-health" icon={<Brain size={20} />} text="Mental Health" active={isActive('/mental-health')} />
          <NavLink to="/analytics" icon={<BarChart size={20} />} text="Analytics" active={isActive('/analytics')} />
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
