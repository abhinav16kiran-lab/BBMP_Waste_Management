import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  getScheduleStats, getSchedules, getComplaints, getVehicles, getCrews,
  getWards,
  getSessionData,
} from '../services/api';
import StatusBadge from '../components/Shared/StatusBadge';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import './AdminDashboard.css';
import './Dashboard.css';

/* ── Animated counter ─────────────────────────────────────────── */
function useCountUp(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || !target) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(cur);
    }, 20);
    return () => clearInterval(t);
  }, [active, target]);
  return val;
}

/* ── SQL Syntax Highlighter ──────────────────────────────────── */
function SqlBlock({ sql }) {
  const keywords  = ['SELECT', 'FROM', 'JOIN', 'WHERE', 'GROUP BY', 'ORDER BY', 'COUNT', 'SUM', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ON', 'AND', 'AS', 'BY', 'INTERVAL', 'DATE', 'NOW'];
  let highlighted = sql
    .replace(/--[^\n]*/g, m => `<span class="sql-comment">${m}</span>`)
    .replace(/'[^']*'/g, m => `<span class="sql-string">${m}</span>`);
  keywords.forEach(k => {
    highlighted = highlighted.replace(new RegExp(`\\b${k}\\b`, 'g'), `<span class="sql-keyword">${k}</span>`);
  });
  return <pre className="code-block" dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

/* ── Query Definitions ────────────────────────────────────────── */
const QUERIES = [
  {
    id: 'missed',
    label: 'Missed Pickups Today',
    desc: 'Households that missed pickup today',
    sql: `SELECT h.address_line, w.ward_name, s.scheduled_time, s.delay_reason
FROM schedules_schedule s
JOIN households_ward w ON s.ward_id = w.ward_id
JOIN households_household h ON h.ward_id = w.ward_id
WHERE s.status = 'MISSED'
  AND DATE(s.scheduled_time) = CURRENT_DATE;`,
    columns: ['Ward', 'Scheduled Time', 'Delay Reason'],
    fetch: async () => {
      /* Phase 2: const r = await getSchedules({ status: 'MISSED' }); return r.data; */
      return getSessionData().schedules.filter(s => s.status === 'MISSED');
    },
    render: row => [
      row.ward_detail?.ward_name,
      new Date(row.scheduled_time).toLocaleString('en-IN'),
      row.delay_reason || '—',
    ],
  },
  {
    id: 'completion',
    label: 'Ward Completion Rate',
    desc: 'Pickup completion rate per ward this week',
    sql: `SELECT w.ward_name,
       COUNT(*) AS total,
       SUM(CASE WHEN s.status='COMPLETED' THEN 1 ELSE 0 END) AS completed
FROM schedules_schedule s
JOIN households_ward w ON s.ward_id = w.ward_id
WHERE s.scheduled_time >= NOW() - INTERVAL '7 days'
GROUP BY w.ward_name;`,
    columns: ['Ward', 'Total', 'Completed', 'Missed'],
    fetch: async () => {
      /* Phase 2: const [stats, wards] = await Promise.all([getScheduleStats(), getWards()]); */
      return getSessionData().schedules.map(s => s.ward_detail).filter((w,i,a)=>
        a.findIndex(x=>x.ward_name===w.ward_name)===i
      ).map(w => {
        const wSched = getSessionData().schedules.filter(s=>s.ward_detail.ward_name===w.ward_name);
        return {
          ward_name: w.ward_name,
          total:     wSched.length,
          completed: wSched.filter(s=>s.status==='COMPLETED').length,
          missed:    wSched.filter(s=>s.status==='MISSED').length,
        };
      });
    },
    render: row => [row.ward_name, row.total, row.completed, row.missed],
  },
  {
    id: 'complaints',
    label: 'Open Complaints',
    desc: 'All open complaints with citizen info',
    sql: `SELECT c.complaint_id, cit.citizen_name, c.latitude,
       c.longitude, c.reported_at
FROM complaints_complaint c
JOIN accounts_citizen cit ON c.citizen_id = cit.citizen_id
WHERE c.status = 'OPEN'
ORDER BY c.reported_at ASC;`,
    columns: ['Complaint ID', 'Latitude', 'Longitude', 'Reported At', 'Status'],
    fetch: async () => {
      /* Phase 2: const r = await getComplaints({ status: 'OPEN' }); return r.data; */
      return getSessionData().complaints;
    },
    render: row => [
      `#${row.complaint_id}`,
      row.latitude,
      row.longitude,
      new Date(row.reported_at).toLocaleString('en-IN'),
      <StatusBadge status={row.status} />,
    ],
  },
  {
    id: 'vehicles',
    label: 'Active Vehicles',
    desc: 'All active vehicles with GPS coordinates',
    sql: `SELECT vehicle_number, vehicle_type, status,
       current_latitude, current_longitude
FROM vehicles_vehicle
WHERE status = 'Active';`,
    columns: ['Vehicle #', 'Type', 'Status', 'Latitude', 'Longitude'],
    fetch: async () => {
      /* Phase 2: const r = await getVehicles(); return r.data; */
      return getSessionData().vehicles;
    },
    render: row => [
      row.vehicle_number,
      row.vehicle_type,
      <StatusBadge status={row.status === 'Active' ? 'COMPLETED' : 'MISSED'} />,
      row.current_latitude ?? '—',
      row.current_longitude ?? '—',
    ],
  },
  {
    id: 'crew',
    label: 'Crew Performance',
    desc: 'Crew performance — pickups done vs assigned',
    sql: `SELECT cr.supervisor_name, w.ward_name,
       COUNT(pl.log_id) AS total_pickups
FROM vehicles_crew cr
JOIN households_ward w ON cr.ward_id = w.ward_id
LEFT JOIN schedules_pickuplog pl ON pl.crew_id = cr.crew_id
GROUP BY cr.supervisor_name, w.ward_name;`,
    columns: ['Supervisor', 'Ward', 'Contact', 'Total Pickups'],
    fetch: async () => {
      /* Phase 2: const r = await getCrews(); return r.data; */
      return getSessionData().crews;
    },
    render: row => [row.supervisor_name, row.ward_name, row.contact, row.total_pickups],
  },
];

/* ── Sortable Table ───────────────────────────────────────────── */
function SortableTable({ columns, rows, loading: qLoading, success, tableRef }) {
  const [sortCol, setSortCol]   = useState(null);
  const [sortDir, setSortDir]   = useState('asc');

  const handleSort = (idx) => {
    if (sortCol === idx) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(idx); setSortDir('asc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    if (sortCol === null) return 0;
    const av = typeof a[sortCol] === 'object' ? String(a[sortCol]) : a[sortCol];
    const bv = typeof b[sortCol] === 'object' ? String(b[sortCol]) : b[sortCol];
    return sortDir === 'asc' ? String(av).localeCompare(String(bv), undefined, { numeric: true })
                              : String(bv).localeCompare(String(av), undefined, { numeric: true });
  });

  return (
    <div className={`data-table-wrapper results-card ${success ? 'result-success' : ''}`} ref={tableRef}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={c} onClick={() => handleSort(i)}>
                {c}
                {sortCol === i && <span className="sort-icon">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {qLoading ? (
            <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
              <LoadingSpinner text="Querying PostgreSQL..." />
            </td></tr>
          ) : sorted.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-grey)' }}>No results</td></tr>
          ) : (
            sorted.map((row, ri) => (
              <tr key={ri} className="table-row-enter" style={{ animationDelay: `${ri * 50}ms` }}>
                {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── Download CSV ─────────────────────────────────────────────── */
function downloadCSV(columns, rows) {
  const header = columns.join(',');
  const body   = rows.map(r => r.map(c => `"${typeof c === 'object' ? '' : c}"`).join(',')).join('\n');
  const blob   = new Blob([header + '\n' + body], { type: 'text/csv' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href = url; a.download = 'bbmp_query_results.csv';
  a.click(); URL.revokeObjectURL(url);
}

/* ── Admin Dashboard ──────────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats, setStats]           = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);

  const [selectedQuery, setSelectedQuery] = useState(QUERIES[0]);
  const [qLoading, setQLoading]     = useState(false);
  const [qRows, setQRows]           = useState([]);
  const [qCols, setQCols]           = useState([]);
  const [qSuccess, setQSuccess]     = useState(false);
  const [qError, setQError]         = useState('');
  const [flowActive, setFlowActive] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [vehicles, setVehicles]     = useState([]);
  const tableRef = useRef(null);
  const statsRef = useRef(null);

  /* Load stats */
  useEffect(() => {
    (async () => {
      try {
        /* Phase 2: const r = await getScheduleStats(); setStats(r.data); */
        await new Promise(r => setTimeout(r, 500));
        setStats(getSessionData().stats);
      } catch { setStats(getSessionData().stats); }
      finally { setStatsLoading(false); setStatsVisible(true); }
    })();
  }, []);

  /* Load complaints and vehicles */
  useEffect(() => {
    (async () => {
      try {
        /* Phase 2:
        const [cr, vr] = await Promise.all([getComplaints({ status: 'OPEN' }), getVehicles()]);
        setComplaints(cr.data); setVehicles(vr.data);
        */
        await new Promise(r => setTimeout(r, 300));
        setComplaints(getSessionData().complaints);
        setVehicles(getSessionData().vehicles);
      } catch {
        setComplaints(getSessionData().complaints);
        setVehicles(getSessionData().vehicles);
      }
    })();
  }, []);

  /* Stat card values */
  const completed = stats.find(s => s.status === 'COMPLETED')?.count || 0;
  const missed    = stats.find(s => s.status === 'MISSED')?.count    || 0;
  const pending   = stats.find(s => s.status === 'PENDING')?.count   || 0;
  const cComp = useCountUp(completed, statsVisible);
  const cMiss = useCountUp(missed,    statsVisible);
  const cPend = useCountUp(pending,   statsVisible);

  /* 3D tilt on stat cards */
  useEffect(() => {
    const cards = document.querySelectorAll('.stat-card');
    const handlers = [];
    cards.forEach(card => {
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * -12;
        card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
      };
      const onLeave = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      handlers.push({ card, onMove, onLeave });
    });
    return () => handlers.forEach(({ card, onMove, onLeave }) => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    });
  }, [statsVisible]);

  /* Run query */
  const runQuery = async () => {
    setQLoading(true);
    setQSuccess(false);
    setQError('');
    setQRows([]);
    setFlowActive(true);
    try {
      const data = await selectedQuery.fetch();
      const rendered = data.map(selectedQuery.render);
      setQCols(selectedQuery.columns);
      setQRows(rendered);
      setQSuccess(true);
      // stagger rows
      setTimeout(() => {
        const rows = tableRef.current?.querySelectorAll('.table-row-enter');
        if (rows) gsap.fromTo(rows, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.05 });
      }, 100);
    } catch {
      setQError('Backend not connected — showing session demo data');
      const data = selectedQuery.id === 'missed'
        ? getSessionData().schedules.filter(s => s.status === 'MISSED')
        : getSessionData().schedules;
      setQCols(selectedQuery.columns);
      setQRows(data.map(selectedQuery.render));
    } finally {
      setQLoading(false);
      setTimeout(() => setFlowActive(false), 2000);
    }
  };

  return (
    <div className="page-wrapper page-enter">
      <div className="grid-overlay" />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="section-label">Admin Portal</div>
        <h1 className="section-title">Operations <span className="accent">Command Centre</span></h1>
        <p className="section-subtitle">Live statistics, DBMS query visualizer, fleet status, and complaint board.</p>

        {/* ── Section A: Stats ──────────────────────────────────── */}
        <div className="admin-section-title">
          <span className="section-tag">Section A</span>
          Live Schedule Statistics
        </div>
        {statsLoading ? <LoadingSpinner text="Loading stats..." /> : (
          <div className="stat-cards-row" ref={statsRef}>
            <div className="stat-card stat-card-completed">
              <span className="stat-number">{cComp}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-card stat-card-missed">
              <span className="stat-number">{cMiss}</span>
              <span className="stat-label">Missed</span>
            </div>
            <div className="stat-card stat-card-pending">
              <span className="stat-number">{cPend}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        )}

        <div className="glow-divider" />

        {/* ── Section B: DBMS Visualizer ────────────────────────── */}
        <div className="admin-section-title">
          <span className="section-tag">Section B</span>
          DBMS Live Query Visualizer
        </div>
        <p style={{ color: 'var(--color-grey)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Select a preset SQL query, inspect the generated SQL, then run it against the PostgreSQL database through the Django REST API.
        </p>

        {/* Data flow diagram */}
        <div className={`flow-diagram ${flowActive ? 'active' : ''}`}>
          <div className="flow-node flow-node--react">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4"/>
            </svg>
            React Frontend
          </div>
          <div className="flow-arrow">
            <div className="flow-line" />
            <span className="flow-label">HTTP GET</span>
          </div>
          <div className="flow-node flow-node--django">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Django API
          </div>
          <div className="flow-arrow">
            <div className="flow-line" />
            <span className="flow-label">SQL Query</span>
          </div>
          <div className="flow-node flow-node--pg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            PostgreSQL DB
          </div>
        </div>

        <div className="dbms-layout">
          {/* Left: selector + SQL */}
          <div className="dbms-left">
            <div className="input-group" style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" htmlFor="query-select">Select Query</label>
              <select
                id="query-select"
                className="input-field"
                value={selectedQuery.id}
                onChange={e => {
                  const q = QUERIES.find(q => q.id === e.target.value);
                  setSelectedQuery(q);
                  setQRows([]); setQCols([]); setQSuccess(false); setQError('');
                }}
              >
                {QUERIES.map(q => (
                  <option key={q.id} value={q.id}>{q.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <div className="input-label" style={{ marginBottom: '0.5rem' }}>Query Description</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-grey)' }}>{selectedQuery.desc}</p>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="input-label" style={{ marginBottom: '0.5rem' }}>Generated SQL</div>
              <SqlBlock sql={selectedQuery.sql} />
            </div>
            <button className="btn btn-primary btn-full" onClick={runQuery} disabled={qLoading} id="run-query-btn">
              {qLoading ? (
                <><span className="spinner spinner-sm" /> Querying PostgreSQL...</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Run Query
                </>
              )}
            </button>
          </div>

          {/* Right: results */}
          <div className="dbms-right">
            <div className="dbms-result-header">
              <div className="input-label">Query Results</div>
              {qRows.length > 0 && !qLoading && (
                <button className="btn btn-outline btn-sm" onClick={() => downloadCSV(qCols, qRows)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download CSV
                </button>
              )}
            </div>
            {qError && <div className="alert alert-warn" style={{ marginBottom: '1rem' }}>{qError}</div>}
            {qCols.length > 0 ? (
              <SortableTable
                columns={qCols}
                rows={qRows}
                loading={qLoading}
                success={qSuccess}
                tableRef={tableRef}
              />
            ) : (
              <div className="dbms-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="1">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
                <p>Select a query and click "Run Query" to see results</p>
              </div>
            )}
          </div>
        </div>

        <div className="glow-divider" />

        {/* ── Section C: Complaints ─────────────────────────────── */}
        <div className="admin-section-title">
          <span className="section-tag">Section C</span>
          Open Complaints Board
        </div>
        <div className="grid-3">
          {complaints.map(c => (
            <div key={c.complaint_id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-purple-light)' }}>
                  #{c.complaint_id}
                </span>
                <StatusBadge status={c.status} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-grey)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {c.ward || 'Unknown Ward'} &nbsp;·&nbsp; {c.latitude}, {c.longitude}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-grey)' }}>
                  {new Date(c.reported_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {c.assigned_vehicle && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    <strong>{c.assigned_vehicle}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="glow-divider" />

        {/* ── Section D: Vehicle Fleet ──────────────────────────── */}
        <div className="admin-section-title">
          <span className="section-tag">Section D</span>
          Vehicle Fleet Status
        </div>
        <div className="scroll-row">
          {vehicles.map(v => (
            <div key={v.vehicle_id} className="vehicle-card card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-white)' }}>
                  {v.vehicle_number}
                </div>
                <StatusBadge status={v.status === 'Active' ? 'COMPLETED' : 'MISSED'} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-grey)' }}>{v.vehicle_type}</div>
                {v.current_latitude && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-grey-dim)', fontFamily: 'var(--font-mono)' }}>
                    {v.current_latitude}, {v.current_longitude}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
