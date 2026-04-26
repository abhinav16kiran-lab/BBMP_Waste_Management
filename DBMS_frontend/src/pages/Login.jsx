import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authLogin } from '../services/api';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const formRef    = useRef(null);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      /* Phase 2 — real API:
      const res = await authLogin({ email: form.email, password: form.password });
      login({ email: form.email, name: form.email.split('@')[0] }, res.data.access);
      navigate('/citizen/dashboard');
      */

      // Phase 1 — mock login (accepts any credentials)
      if (!form.email || !form.password) throw new Error('Fill in all fields');
      await new Promise(r => setTimeout(r, 800)); // simulate network
      login(
        { email: form.email, name: form.email.split('@')[0] },
        'mock-jwt-token-' + Date.now()
      );
      navigate('/citizen/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Invalid credentials';
      setError(msg);
      // shake animation
      formRef.current?.classList.remove('shake');
      void formRef.current?.offsetWidth;
      formRef.current?.classList.add('shake');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-grid" />
      <div className="auth-card-wrap">
        <div ref={formRef} className="auth-card card">
          {/* Logo */}
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="8" width="24" height="16" rx="3" stroke="#7C3AED" strokeWidth="2"/>
              <path d="M9 8V6a5 5 0 0 1 10 0v2" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 14v4M12 16h4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>BBMP Waste</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your citizen account</p>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`input-field ${error ? 'error' : ''}`}
                placeholder="citizen@bangalore.in"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className={`input-field ${error ? 'error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading
                ? <><span className="spinner spinner-sm" /> Signing in...</>
                : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Register here</Link>
          </p>

          <div className="auth-demo-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            Demo mode: any email + password will work
          </div>
        </div>
      </div>
    </div>
  );
}
