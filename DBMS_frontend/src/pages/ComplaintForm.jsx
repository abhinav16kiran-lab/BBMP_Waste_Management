import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { submitComplaint } from '../services/api';
import './ComplaintForm.css';

/* ── Confetti burst ──────────────────────────────────────────────── */
function spawnConfetti() {
  const colors = ['#7C3AED', '#A855F7', '#FBBF24', '#10B981', '#F8F8FF'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left:${Math.random()*100}vw;
      top:${Math.random()*60 + 20}vh;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${6+Math.random()*8}px;
      height:${6+Math.random()*8}px;
      border-radius:${Math.random()>0.5?'50%':'2px'};
      animation-delay:${Math.random()*0.6}s;
      animation-duration:${1.5+Math.random()}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

export default function ComplaintForm() {
  const [coords, setCoords]       = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError]   = useState('');
  const [photo, setPhoto]         = useState(null);
  const [preview, setPreview]     = useState(null);
  const [desc, setDesc]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null); // { complaint_id, assigned_vehicle }
  const gpsRef = useRef(null);

  const handleGps = () => {
    setGpsError('');
    setGpsLoading(true);
    // Ripple effect
    const btn = gpsRef.current;
    if (btn) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) });
        setGpsLoading(false);
      },
      () => {
        setGpsError('Enable location access in browser settings');
        setGpsLoading(false);
      }
    );
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coords) return;
    setLoading(true);
    try {
      /* Phase 2 — real API:
      const fd = new FormData();
      fd.append('latitude',  coords.lat);
      fd.append('longitude', coords.lng);
      if (photo) fd.append('photo', photo);
      fd.append('resolution_notes', desc);
      const res = await submitComplaint(fd);
      setResult({ complaint_id: res.data.complaint_id, assigned_vehicle: res.data.assigned_vehicle });
      */
      // Phase 1 — mock
      await new Promise(r => setTimeout(r, 1200));
      setResult({ complaint_id: Math.floor(Math.random()*900)+100, assigned_vehicle: 'KA01AB1234' });
      spawnConfetti();
    } catch {
      setResult({ complaint_id: 999, assigned_vehicle: null });
      spawnConfetti();
    } finally {
      setLoading(false);
    }
  };

  if (result) return (
    <div className="success-overlay">
      <div className="truck-icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="1.5">
          <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      </div>
      <h2>Complaint <span style={{ color: 'var(--color-purple-light)' }}>#{result.complaint_id}</span> Submitted</h2>
      {result.assigned_vehicle ? (
        <div className="dispatch-badge">
          <div className="dispatch-pulse" />
          Nearest truck dispatched: <strong style={{ color: 'var(--color-white)' }}>{result.assigned_vehicle}</strong>
        </div>
      ) : (
        <p style={{ color: 'var(--color-grey)' }}>We'll assign the nearest truck shortly.</p>
      )}
      <p style={{ color: 'var(--color-grey)', fontSize: '0.9rem', maxWidth: '400px', textAlign: 'center' }}>
        Team alerted. The <strong style={{ color: 'var(--color-yellow)' }}>Haversine algorithm</strong> calculated the nearest active vehicle.
      </p>
      <Link to="/citizen/dashboard" className="btn btn-primary">Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="page-wrapper page-enter">
      <div className="grid-overlay" />
      <div className="container complaint-wrap">
        <div className="section-label">Citizen Portal</div>
        <h1 className="section-title" style={{ color: 'var(--color-red)', marginBottom: '0.25rem' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }}>
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Report Illegal Garbage Dump
        </h1>
        <p className="section-subtitle">Submit GPS-tagged evidence and we'll dispatch the nearest crew immediately.</p>

        <div className="complaint-card card">
          <form onSubmit={handleSubmit} className="complaint-form">

            {/* Step 1 — GPS */}
            <div className="step-section">
              <div className="step-badge">Step 1</div>
              <h3 className="step-title">Capture Location</h3>
              <button
                ref={gpsRef}
                type="button"
                className="btn btn-gps"
                onClick={handleGps}
                disabled={gpsLoading}
                id="gps-capture-btn"
              >
                {gpsLoading ? (
                  <><span className="spinner spinner-sm" /> Detecting...</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                    </svg>
                    Use My Current Location
                  </>
                )}
              </button>
              {coords && (
                <div className="gps-success">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Location captured: <code>{coords.lat}, {coords.lng}</code>
                </div>
              )}
              {gpsError && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>{gpsError}</div>}
            </div>

            {/* Step 2 — Photo */}
            <div className="step-section">
              <div className="step-badge">Step 2</div>
              <h3 className="step-title">Upload Photo Evidence</h3>
              <label className="photo-upload-label" htmlFor="photo-input">
                {preview ? (
                  <img src={preview} alt="Preview" className="photo-preview" />
                ) : (
                  <div className="photo-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Click to upload photo</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-grey-dim)' }}>JPG, PNG, WebP</span>
                  </div>
                )}
              </label>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhoto}
              />
            </div>

            {/* Step 3 — Description */}
            <div className="step-section">
              <div className="step-badge">Step 3</div>
              <h3 className="step-title">Description <span style={{ color: 'var(--color-grey)', fontWeight: 400 }}>(optional)</span></h3>
              <div className="input-group">
                <textarea
                  className="input-field"
                  placeholder="Describe the issue — e.g. large pile of construction waste blocking the sidewalk near..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-danger btn-full btn-lg"
              disabled={!coords || loading}
              id="submit-complaint-btn"
            >
              {loading ? (
                <><span className="spinner spinner-sm" /> Submitting...</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Submit Complaint
                </>
              )}
            </button>
            {!coords && <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-grey-dim)', marginTop: '0.5rem' }}>Capture your GPS location first to enable submission</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
