import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authRegister, getWards, MOCK_WARDS } from '../services/api';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', ward: '' });
  const [wards, setWards]   = useState([]);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    /* Phase 2 — real API:
    getWards().then(r => setWards(r.data)).catch(() => setWards(MOCK_WARDS));
    */
    // Phase 1 — mock wards
    setWards(MOCK_WARDS);
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      /* Phase 2:
      await authRegister({ ...form, ward_id: form.ward });
      */
      await new Promise(r => setTimeout(r, 800));
      if (!form.name || !form.email || !form.password || !form.ward) throw new Error('All fields required');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Email may already be in use');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="auth-page">
      <div className="auth-bg-grid" />
      <div className="auth-card-wrap">
        <div className="auth-card card" style={{ textAlign: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '3rem' }}>✅</div>
          <h2 className="auth-title" style={{ color: 'var(--color-green)' }}>Registered!</h2>
          <p className="auth-subtitle">Redirecting to login...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-bg-grid" />
      <div className="auth-card-wrap">
        <div className="auth-card card">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="8" width="24" height="16" rx="3" stroke="#7C3AED" strokeWidth="2"/>
              <path d="M9 8V6a5 5 0 0 1 10 0v2" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>BBMP Waste</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register as a Bangalore citizen</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" name="name" type="text" className="input-field"
                placeholder="Rahul Sharma" value={form.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" name="email" type="email" className="input-field"
                placeholder="rahul@gmail.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-phone">Phone Number</label>
              <input id="reg-phone" name="phone" type="tel" className="input-field"
                placeholder="9876543210" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-ward">Ward</label>
              <select id="reg-ward" name="ward" className="input-field" value={form.ward} onChange={handleChange} required>
                <option value="">Select your ward...</option>
                {wards.map(w => (
                  <option key={w.ward_id} value={w.ward_id}>
                    {w.ward_name} ({w.zone})
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" className="input-field"
                placeholder="Create a strong password" value={form.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="register-submit-btn">
              {loading ? <><span className="spinner spinner-sm" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login" className="auth-link">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
