import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import { getSchedules, updateSchedule, getSessionData } from '../services/api';
import StatusBadge from '../components/Shared/StatusBadge';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import './Dashboard.css';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function CrewDashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [demoMode, setDemoMode]   = useState(false);
  const cardsRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        /* Phase 2 — real API:
        const res = await getSchedules();
        setSchedules(res.data);
        */
        await new Promise(r => setTimeout(r, 700));
        setSchedules(getSessionData().schedules);
        setDemoMode(true);
      } catch {
        setSchedules(getSessionData().schedules);
        setDemoMode(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading && schedules.length > 0 && cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.querySelectorAll('.schedule-card'),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [loading, schedules]);

  const markCompleted = async (id) => {
    try {
      /* Phase 2:
      await updateSchedule(id, { status: 'COMPLETED' });
      */
      setSchedules(prev =>
        prev.map(s => s.schedule_id === id ? { ...s, status: 'COMPLETED' } : s)
      );
    } catch {}
  };

  const markMissed = async (id, reason) => {
    if (!reason.trim()) return false;
    try {
      /* Phase 2:
      await updateSchedule(id, { status: 'MISSED', delay_reason: reason });
      */
      setSchedules(prev =>
        prev.map(s => s.schedule_id === id ? { ...s, status: 'MISSED', delay_reason: reason } : s)
      );
      return true;
    } catch { return false; }
  };

  return (
    <div className="page-wrapper page-enter">
      <div className="grid-overlay" />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="dash-header">
          <div>
            <div className="section-label">Crew Portal</div>
            <h1 className="section-title">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple-light)" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }}>
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              Today's Pickup <span className="accent">Route</span>
            </h1>
            {user && (
              <p style={{ color: 'var(--color-grey)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Supervisor: <span style={{ color: 'var(--color-purple-light)' }}>{user.name || user.email}</span>
              </p>
            )}
          </div>
        </div>

        {demoMode && (
          <div className="demo-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            Demo mode — connect Django backend to fetch real crew schedules
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading your route..." />
        ) : (
          <div ref={cardsRef} className="schedule-grid">
            {schedules.map(s => (
              <CrewScheduleCard
                key={s.schedule_id}
                schedule={s}
                onComplete={markCompleted}
                onMiss={markMissed}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CrewScheduleCard({ schedule: s, onComplete, onMiss }) {
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason]         = useState('');
  const [reasonErr, setReasonErr]   = useState(false);
  const [updating, setUpdating]     = useState(false);

  const handleComplete = async () => {
    setUpdating(true);
    await onComplete(s.schedule_id);
    setUpdating(false);
  };

  const handleMissSubmit = async () => {
    if (!reason.trim()) { setReasonErr(true); return; }
    setReasonErr(false);
    setUpdating(true);
    const ok = await onMiss(s.schedule_id, reason);
    if (ok) setShowReason(false);
    setUpdating(false);
  };

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
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{formatDateTime(s.scheduled_time)}</span>
        </div>
      </div>

      {s.delay_reason && (
        <div className="delay-box"><strong>Delay Reason:</strong> {s.delay_reason}</div>
      )}

      {/* Action buttons for PENDING */}
      {s.status === 'PENDING' && !showReason && (
        <div className="sc-actions">
          <button
            className="btn btn-success btn-sm"
            onClick={handleComplete}
            disabled={updating}
            id={`complete-btn-${s.schedule_id}`}
          >
            {updating ? <span className="spinner spinner-sm" /> : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Mark Collected
              </>
            )}
          </button>
          <button
            className="btn btn-sm"
            style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-red)', border: '1px solid rgba(239,68,68,0.3)' }}
            onClick={() => setShowReason(true)}
            disabled={updating}
            id={`miss-btn-${s.schedule_id}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Mark Missed
          </button>
        </div>
      )}

      {/* Reason input for missed */}
      {s.status === 'PENDING' && showReason && (
        <div className="sc-reason-wrap">
          <input
            className={`input-field ${reasonErr ? 'error' : ''}`}
            placeholder="Enter reason (required)..."
            value={reason}
            onChange={e => { setReason(e.target.value); setReasonErr(false); }}
          />
          {reasonErr && <span style={{ fontSize: '0.8rem', color: 'var(--color-red)' }}>Reason is required</span>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-danger btn-sm" onClick={handleMissSubmit} disabled={updating}>
              {updating ? <span className="spinner spinner-sm" /> : 'Submit'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowReason(false); setReason(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
