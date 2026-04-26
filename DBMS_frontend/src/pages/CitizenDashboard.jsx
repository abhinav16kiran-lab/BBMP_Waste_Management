import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import { getSchedules, getSessionData } from '../services/api';
import StatusBadge from '../components/Shared/StatusBadge';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import './Dashboard.css';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [demoMode, setDemoMode]   = useState(false);
  const cardsRef = useRef(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        /* Phase 2 — real API:
        const res = await getSchedules({ ward: user?.ward_id });
        setSchedules(res.data);
        */
        // Phase 1 — randomised per-session data
        await new Promise(r => setTimeout(r, 700));
        setSchedules(getSessionData().schedules);
        setDemoMode(true);
      } catch {
        setSchedules(getSessionData().schedules);
        setDemoMode(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  /* Staggered card entrance */
  useEffect(() => {
    if (!loading && schedules.length > 0 && cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.schedule-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [loading, schedules]);

  return (
    <div className="page-wrapper page-enter">
      <div className="grid-overlay" />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Header */}
        <div className="dash-header">
          <div>
            <div className="section-label">Citizen Portal</div>
            <h1 className="section-title">
              Your Pickup <span className="accent">Schedule</span>
            </h1>
            <p style={{ color: 'var(--color-grey)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {user && <span style={{ marginLeft: '0.75rem', color: 'var(--color-purple-light)' }}>· {user.name || user.email}</span>}
            </p>
          </div>
          <Link to="/citizen/report" className="btn btn-danger" style={{ alignSelf: 'flex-start', animation: 'pulseGlowRed 2s ease-in-out infinite' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Report Illegal Dump
          </Link>
        </div>

        {demoMode && (
          <div className="demo-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            Backend not connected — showing demo data. Connect Django to see live schedules.
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Fetching your schedule..." />
        ) : schedules.length === 0 ? (
          <div className="empty-state card">
            <div style={{ fontSize: '3rem' }}>✅</div>
            <h3>All Clear!</h3>
            <p>No pickups currently scheduled for your ward.</p>
          </div>
        ) : (
          <div ref={cardsRef} className="schedule-grid">
            {schedules.map(s => (
              <ScheduleCard key={s.schedule_id} schedule={s} />
            ))}
          </div>
        )}

        {/* Big report button at bottom */}
        <div className="report-cta">
          <Link to="/citizen/report" className="btn btn-danger btn-lg"
            style={{ animation: 'pulseGlowRed 2s ease-in-out infinite' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            Report an Illegal Garbage Dump
          </Link>
        </div>
      </div>
    </div>
  );
}

function ScheduleCard({ schedule: s }) {
  return (
    <div className="schedule-card card">
      <div className="sc-header">
        <div className="sc-ward">{s.ward_detail?.ward_name}</div>
        <StatusBadge status={s.status} />
      </div>
      <div className="sc-meta">
        <div className="sc-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <span>{s.vehicle_detail?.vehicle_number}</span>
          <span className="sc-tag">{s.vehicle_detail?.vehicle_type}</span>
        </div>
        <div className="sc-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>{s.crew_detail?.supervisor_name}</span>
        </div>
        <div className="sc-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{formatDateTime(s.scheduled_time)}</span>
        </div>
      </div>
      {s.delay_reason && (
        <div className="delay-box">
          <strong>Delay Reason:</strong> {s.delay_reason}
        </div>
      )}
    </div>
  );
}
