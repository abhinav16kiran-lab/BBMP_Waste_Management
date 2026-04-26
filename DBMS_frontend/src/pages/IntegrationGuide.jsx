import { useState } from 'react';
import './IntegrationGuide.css';

/* ─── Integration point data ────────────────────────────────────── */
const INTEGRATIONS = [
  {
    id: 'auth-login',
    owner: 'Harsh',
    ownerColor: '#10B981',
    category: 'Authentication',
    endpoint: 'POST /api/auth/login/',
    file: 'src/pages/Login.jsx',
    line: '~41',
    description: 'Exchanges email + password for JWT access & refresh tokens. The access token is stored in localStorage and auto-attached to every subsequent request by the Axios interceptor.',
    phase1: `// Phase 1 — mock login (any credentials work)
await new Promise(r => setTimeout(r, 800));
login(
  { email: form.email, name: form.email.split('@')[0] },
  'mock-jwt-token-' + Date.now()
);
navigate('/citizen/dashboard');`,
    phase2: `// Phase 2 — UNCOMMENT when Django is ready
const res = await authLogin({
  email: form.email,
  password: form.password
});
// res.data = { access: "eyJ...", refresh: "eyJ..." }
login(
  { email: form.email, name: res.data.user?.name },
  res.data.access   // ← stored in localStorage as 'token'
);
navigate('/citizen/dashboard');`,
    requestBody: `{ "email": "citizen@bangalore.in", "password": "••••••" }`,
    responseBody: `{ "access": "eyJhbGci...", "refresh": "eyJhbGci..." }`,
  },
  {
    id: 'auth-register',
    owner: 'Harsh',
    ownerColor: '#10B981',
    category: 'Authentication',
    endpoint: 'POST /api/auth/register/',
    file: 'src/pages/Register.jsx',
    line: '~35',
    description: 'Creates a new citizen account. The ward dropdown is populated from a separate public endpoint before the form is submitted.',
    phase1: `// Phase 1 — mock registration
await new Promise(r => setTimeout(r, 800));
setSuccess(true);
setTimeout(() => navigate('/login'), 2000);`,
    phase2: `// Phase 2 — UNCOMMENT when Django is ready
await authRegister({
  name:     form.name,
  email:    form.email,
  phone:    form.phone,
  password: form.password,
  ward_id:  Number(form.ward),
});
setSuccess(true);
setTimeout(() => navigate('/login'), 2000);`,
    requestBody: `{
  "name": "Rahul Sharma",
  "email": "rahul@gmail.com",
  "phone": "9876543210",
  "password": "secure123",
  "ward_id": 3
}`,
    responseBody: `{ "citizen_id": 42, "email": "rahul@gmail.com", "name": "Rahul Sharma" }`,
  },
  {
    id: 'wards-list',
    owner: 'Harsh',
    ownerColor: '#10B981',
    category: 'Households & Wards',
    endpoint: 'GET /api/households/wards/',
    file: 'src/pages/Register.jsx',
    line: '~20',
    description: 'Public endpoint — no auth token needed. Populates the ward dropdown in the Register form. Shows ward name + zone.',
    phase1: `// Phase 1 — mock wards (6 → now 14 Bangalore wards)
setWards(MOCK_WARDS);`,
    phase2: `// Phase 2 — UNCOMMENT when Django is ready
getWards()
  .then(r => setWards(r.data))
  .catch(() => setWards(MOCK_WARDS)); // fallback to mock`,
    requestBody: `(no body — GET request, no auth required)`,
    responseBody: `[
  { "ward_id": 1, "ward_name": "Koramangala", "zone": "South" },
  { "ward_id": 2, "ward_name": "Indiranagar",  "zone": "East"  },
  ...14 wards total
]`,
  },
  {
    id: 'schedules-citizen',
    owner: 'Aditya',
    ownerColor: '#3B82F6',
    category: 'Schedules',
    endpoint: 'GET /api/schedules/?ward=X',
    file: 'src/pages/CitizenDashboard.jsx',
    line: '~23',
    description: 'Returns all pickup schedules filtered by the citizen\'s ward ID. Each schedule includes status (COMPLETED / MISSED / PENDING / DELAYED), crew details, and vehicle info.',
    phase1: `// Phase 1 — 12 mock schedules across 12 Bangalore wards
await new Promise(r => setTimeout(r, 900));
setSchedules(MOCK_SCHEDULES);
setDemoMode(true);`,
    phase2: `// Phase 2 — UNCOMMENT when Django is ready
const res = await getSchedules({ ward: user?.ward_id });
setSchedules(res.data);
// Each item: { schedule_id, ward_detail, crew_detail,
//              vehicle_detail, scheduled_time, status,
//              delay_reason }`,
    requestBody: `(no body — GET /api/schedules/?ward=3)`,
    responseBody: `[
  {
    "schedule_id": 7,
    "ward_detail": { "ward_name": "Jayanagar", "zone": "South" },
    "crew_detail":    { "supervisor_name": "Ravi K" },
    "vehicle_detail": { "vehicle_number": "KA01EF9012" },
    "scheduled_time": "2025-04-12T07:30:00",
    "status": "PENDING",
    "delay_reason": ""
  }
]`,
  },
  {
    id: 'schedules-crew',
    owner: 'Aditya',
    ownerColor: '#3B82F6',
    category: 'Schedules',
    endpoint: 'PATCH /api/schedules/{id}/',
    file: 'src/pages/CrewDashboard.jsx',
    line: '~44',
    description: 'Crew marks a schedule as COMPLETED or MISSED. For MISSED, a delay_reason is required. The frontend optimistically updates the card immediately.',
    phase1: `// Phase 1 — optimistic local state update only
setSchedules(prev =>
  prev.map(s => s.schedule_id === id
    ? { ...s, status: 'COMPLETED' }
    : s
  )
);`,
    phase2: `// Phase 2 — UNCOMMENT when Django is ready

// Mark collected:
await updateSchedule(id, { status: 'COMPLETED' });

// Mark missed (requires reason string):
await updateSchedule(id, {
  status: 'MISSED',
  delay_reason: reason,  // ← validated non-empty in UI
});`,
    requestBody: `// Collected:
{ "status": "COMPLETED" }

// Missed:
{ "status": "MISSED", "delay_reason": "Vehicle breakdown" }`,
    responseBody: `{ "schedule_id": 7, "status": "COMPLETED", "delay_reason": "" }`,
  },
  {
    id: 'schedules-stats',
    owner: 'Aditya',
    ownerColor: '#3B82F6',
    category: 'Schedules',
    endpoint: 'GET /api/schedules/stats/',
    file: 'src/pages/AdminDashboard.jsx',
    line: '~91',
    description: 'Returns count of schedules grouped by status. Feeds the 3 animated stat cards at the top of the Admin Dashboard.',
    phase1: `// Phase 1 — mock stats
await new Promise(r => setTimeout(r, 700));
setStats(MOCK_STATS);
// [{ status:'COMPLETED', count:47 },
//  { status:'MISSED',    count:8  },
//  { status:'PENDING',   count:14 }]`,
    phase2: `// Phase 2 — UNCOMMENT when Django is ready
const r = await getScheduleStats();
setStats(r.data);`,
    requestBody: `(no body — GET request)`,
    responseBody: `[
  { "status": "COMPLETED", "count": 47 },
  { "status": "MISSED",    "count": 8  },
  { "status": "PENDING",   "count": 14 }
]`,
  },
  {
    id: 'complaints-submit',
    owner: 'Aditya',
    ownerColor: '#3B82F6',
    category: 'Complaints',
    endpoint: 'POST /api/complaints/',
    file: 'src/pages/ComplaintForm.jsx',
    line: '~68',
    description: 'Submits a multipart/form-data complaint with GPS coordinates and optional photo. The backend runs the Haversine algorithm to find the nearest Active vehicle and returns it in the response.',
    phase1: `// Phase 1 — mock submission (simulates dispatch)
await new Promise(r => setTimeout(r, 1200));
setResult({
  complaint_id: Math.floor(Math.random()*900)+100,
  assigned_vehicle: 'KA01AB1234',  // fake nearest truck
});
spawnConfetti();`,
    phase2: `// Phase 2 — UNCOMMENT when Django is ready
const fd = new FormData();
fd.append('latitude',          coords.lat);
fd.append('longitude',         coords.lng);
if (photo) fd.append('photo',  photo);      // ← File object
fd.append('resolution_notes',  desc);

const res = await submitComplaint(fd);
// res.data.assigned_vehicle = nearest truck number
// (found by Haversine on the backend)
setResult({
  complaint_id:    res.data.complaint_id,
  assigned_vehicle: res.data.assigned_vehicle,
});
spawnConfetti();`,
    requestBody: `FormData {
  latitude:         "12.97305",
  longitude:        "77.59489",
  photo:            <File: dump_photo.jpg>,
  resolution_notes: "Large pile of debris..."
}`,
    responseBody: `{
  "complaint_id": 106,
  "status": "OPEN",
  "assigned_vehicle": "KA01AB1234",  // ← Haversine result
  "latitude": 12.97305,
  "longitude": 77.59489
}`,
  },
  {
    id: 'complaints-list',
    owner: 'Aditya',
    ownerColor: '#3B82F6',
    category: 'Complaints',
    endpoint: 'GET /api/complaints/?status=OPEN',
    file: 'src/pages/AdminDashboard.jsx',
    line: '~103',
    description: 'Fetches all open complaints for the Admin complaints board. Also used in the DBMS Visualizer (Query 3).',
    phase1: `// Phase 1 — 6 mock complaints across Bangalore
setComplaints(MOCK_COMPLAINTS);`,
    phase2: `// Phase 2 — UNCOMMENT when Django is ready
const cr = await getComplaints({ status: 'OPEN' });
setComplaints(cr.data);`,
    requestBody: `(no body — GET /api/complaints/?status=OPEN)`,
    responseBody: `[
  {
    "complaint_id": 101,
    "latitude": 12.9716, "longitude": 77.5946,
    "status": "OPEN",
    "reported_at": "2025-04-12T06:15:00",
    "assigned_vehicle": null
  }
]`,
  },
  {
    id: 'vehicles',
    owner: 'Harsh',
    ownerColor: '#10B981',
    category: 'Vehicles & Crew',
    endpoint: 'GET /api/vehicles/vehicles/',
    file: 'src/pages/AdminDashboard.jsx',
    line: '~104',
    description: 'Returns all vehicles with their GPS coordinates and status. Powers the Vehicle Fleet row and DBMS Query 4.',
    phase1: `// Phase 1 — 8 mock vehicles (4 Active, 2 Maintenance)
setVehicles(MOCK_VEHICLES);`,
    phase2: `// Phase 2 — UNCOMMENT when Django is ready
const vr = await getVehicles();
setVehicles(vr.data);`,
    requestBody: `(no body — GET request, auth required)`,
    responseBody: `[
  {
    "vehicle_id": 1,
    "vehicle_number": "KA01AB1234",
    "vehicle_type": "Compactor",
    "status": "Active",
    "current_latitude": 12.9352,
    "current_longitude": 77.6245
  }
]`,
  },
  {
    id: 'crews',
    owner: 'Harsh',
    ownerColor: '#10B981',
    category: 'Vehicles & Crew',
    endpoint: 'GET /api/vehicles/crews/',
    file: 'src/pages/AdminDashboard.jsx',
    line: '~DBMS Query 5',
    description: 'Returns all crew members. Used by DBMS Visualizer Query 5 (Crew Performance).',
    phase1: `// Phase 1 — 8 mock crew members
return MOCK_CREWS;`,
    phase2: `// Phase 2 — UNCOMMENT when Django is ready
const r = await getCrews();
return r.data;
// Each item: { supervisor_name, ward_name,
//              contact, total_pickups }`,
    requestBody: `(no body — GET request, auth required)`,
    responseBody: `[
  {
    "crew_id": 1,
    "supervisor_name": "Suresh B",
    "ward_name": "Koramangala",
    "contact": "9845012345"
  }
]`,
  },
];

const CATEGORIES = [...new Set(INTEGRATIONS.map(i => i.category))];
const OWNERS = [
  { name: 'Harsh',  color: '#10B981', role: 'Backend Dev 1', apis: ['Authentication', 'Households & Wards', 'Vehicles & Crew'] },
  { name: 'Aditya', color: '#3B82F6', role: 'Backend Dev 2', apis: ['Schedules', 'Complaints'] },
];

export default function IntegrationGuide() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openCard, setOpenCard]             = useState(null);

  const filtered = activeCategory === 'All'
    ? INTEGRATIONS
    : INTEGRATIONS.filter(i => i.category === activeCategory);

  return (
    <div className="page-wrapper page-enter ig-page">
      <div className="grid-overlay" />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>

        {/* ── Hero header ─────────────────────────────────────── */}
        <div className="ig-hero">
          <div className="section-label">Developer Reference</div>
          <h1 className="section-title">
            Backend <span className="accent">Integration</span> Guide
          </h1>
          <p className="ig-subtitle">
            Every API connection point between the React frontend and the Django backend —
            with exact file locations, code to uncomment, and expected request/response shapes.
          </p>
          <div className="ig-phase-legend">
            <div className="phase-pill phase-1">
              <span className="phase-dot" style={{ background: '#FBBF24' }} />
              Phase 1 — Mock data (currently active)
            </div>
            <div className="phase-pill phase-2">
              <span className="phase-dot" style={{ background: '#10B981' }} />
              Phase 2 — Real Django API (uncomment to activate)
            </div>
          </div>
        </div>

        {/* ── Owner overview ──────────────────────────────────── */}
        <div className="ig-owners">
          {OWNERS.map(o => (
            <div key={o.name} className="ig-owner-card card" style={{ '--owner-color': o.color }}>
              <div className="ig-owner-header">
                <div className="ig-owner-avatar" style={{ background: `${o.color}22`, border: `1px solid ${o.color}66`, color: o.color }}>
                  {o.name[0]}
                </div>
                <div>
                  <div className="ig-owner-name">{o.name}</div>
                  <div className="ig-owner-role" style={{ color: o.color }}>{o.role}</div>
                </div>
                <span className="ig-endpoint-count">{INTEGRATIONS.filter(i => i.owner === o.name).length} endpoints</span>
              </div>
              <div className="ig-owner-apis">
                {o.apis.map(a => (
                  <span key={a} className="ig-api-tag" style={{ borderColor: `${o.color}44`, color: o.color, background: `${o.color}11` }}>{a}</span>
                ))}
              </div>
              <div className="ig-connect-hint">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
                Connect {o.name}'s Django server at <code>http://localhost:8000</code>
              </div>
            </div>
          ))}
        </div>

        {/* ── Architecture diagram ────────────────────────────── */}
        <div className="ig-arch-diagram">
          <div className="ig-arch-title">System Architecture — Data Flow</div>
          <div className="ig-arch-flow">
            <div className="ig-arch-node ig-arch-react">
              <div className="ig-arch-node-icon" style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--color-purple-light)', letterSpacing: '0.08em' }}>REACT</div>
              <div className="ig-arch-node-name">React Frontend</div>
              <div className="ig-arch-node-sub">localhost:5173</div>
              <div className="ig-arch-node-files">
                Login.jsx · Register.jsx<br/>
                CitizenDashboard.jsx<br/>
                ComplaintForm.jsx<br/>
                CrewDashboard.jsx<br/>
                AdminDashboard.jsx
              </div>
            </div>

            <div className="ig-arch-connector">
              <div className="ig-arch-line" />
              <div className="ig-arch-label-group">
                <span className="ig-arch-label green">Axios + JWT Bearer</span>
                <span className="ig-arch-sublabel">services/api.js</span>
              </div>
              <div className="ig-arch-line" />
            </div>

            <div className="ig-arch-node ig-arch-django">
              <div className="ig-arch-node-icon" style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--color-green)', letterSpacing: '0.08em' }}>DJANGO</div>
              <div className="ig-arch-node-name">Django REST API</div>
              <div className="ig-arch-node-sub">localhost:8000</div>
              <div className="ig-arch-node-files">
                Harsh → auth/ · vehicles/<br/>
                Aditya → schedules/<br/>
                Aditya → complaints/
              </div>
            </div>

            <div className="ig-arch-connector">
              <div className="ig-arch-line" />
              <div className="ig-arch-label-group">
                <span className="ig-arch-label blue">Django ORM · SQL</span>
                <span className="ig-arch-sublabel">Abhinav's schema</span>
              </div>
              <div className="ig-arch-line" />
            </div>

            <div className="ig-arch-node ig-arch-pg">
              <div className="ig-arch-node-icon" style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--color-blue)', letterSpacing: '0.08em' }}>PSQL</div>
              <div className="ig-arch-node-name">PostgreSQL</div>
              <div className="ig-arch-node-sub">port 5432</div>
              <div className="ig-arch-node-files">
                CITIZEN · WARD<br/>
                HOUSEHOLD · CREW<br/>
                VEHICLE · SCHEDULE<br/>
                PICKUP_LOG · COMPLAINT
              </div>
            </div>
          </div>

          {/* Haversine callout */}
          <div className="ig-haversine-callout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            <strong>Haversine Dispatch (Aditya):</strong> when <code>POST /api/complaints/</code> is called, the backend calculates distance to every Active vehicle using the Haversine formula and assigns the closest one. The React frontend displays this in the success overlay after complaint submission.
          </div>
        </div>

        {/* ── Category filter ─────────────────────────────────── */}
        <div className="ig-filter-row">
          {['All', ...CATEGORIES].map(c => (
            <button
              key={c}
              className={`ig-filter-btn ${activeCategory === c ? 'active' : ''}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
              <span className="ig-filter-count">
                {c === 'All' ? INTEGRATIONS.length : INTEGRATIONS.filter(i => i.category === c).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Integration cards ───────────────────────────────── */}
        <div className="ig-cards">
          {filtered.map((item) => {
            const isOpen = openCard === item.id;
            return (
              <div
                key={item.id}
                className={`ig-card card ${isOpen ? 'ig-card--open' : ''}`}
                style={{ '--ic-color': item.ownerColor }}
              >
                {/* Card header — always visible */}
                <button className="ig-card-header" onClick={() => setOpenCard(isOpen ? null : item.id)}>
                  <div className="ig-card-left">
                    <div className="ig-card-owner-dot" style={{ background: item.ownerColor }} />
                    <div>
                      <div className="ig-card-endpoint">{item.endpoint}</div>
                      <div className="ig-card-meta">
                        <span className="ig-card-file">📄 {item.file}:{item.line}</span>
                        <span className="ig-card-owner-badge" style={{ color: item.ownerColor, borderColor: `${item.ownerColor}44`, background: `${item.ownerColor}11` }}>
                          {item.owner}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`ig-card-chevron ${isOpen ? 'open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>

                {/* Description */}
                <p className="ig-card-desc">{item.description}</p>

                {/* Expanded body */}
                {isOpen && (
                  <div className="ig-card-body">

                    {/* Request / Response shapes */}
                    <div className="ig-req-res">
                      <div className="ig-code-col">
                        <div className="ig-code-label">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                          Request
                        </div>
                        <pre className="ig-code-block">{item.requestBody}</pre>
                      </div>
                      <div className="ig-code-col">
                        <div className="ig-code-label">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Response
                        </div>
                        <pre className="ig-code-block">{item.responseBody}</pre>
                      </div>
                    </div>

                    {/* Phase 1 vs Phase 2 code */}
                    <div className="ig-phases">
                      <div className="ig-phase ig-phase--1">
                        <div className="ig-phase-header">
                          <span className="ig-phase-badge ig-phase-badge--1">Phase 1 — Active Now</span>
                          <span className="ig-phase-note">Mock data, no backend needed</span>
                        </div>
                        <pre className="ig-code-block ig-code--mock">{item.phase1}</pre>
                      </div>
                      <div className="ig-phase ig-phase--2">
                        <div className="ig-phase-header">
                          <span className="ig-phase-badge ig-phase-badge--2">Phase 2 — Uncomment to connect</span>
                          <span className="ig-phase-note">Replace mock block with this</span>
                        </div>
                        <pre className="ig-code-block ig-code--real">{item.phase2}</pre>
                      </div>
                    </div>

                    {/* Connect instruction */}
                    <div className="ig-connect-step">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                      </svg>
                      <strong>To connect:</strong> In <code>{item.file}</code> around line <code>{item.line}</code>, comment out the Phase 1 block and uncomment the Phase 2 block above. Ensure <code>VITE_API_BASE_URL=http://localhost:8000/api</code> is set in <code>.env</code>.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Axios interceptor note ──────────────────────────── */}
        <div className="ig-interceptor-box">
          <div className="ig-interceptor-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Auto Token Injection — services/api.js (no changes needed)
          </div>
          <p>The Axios interceptor already attaches the JWT token to every request automatically. <strong>No manual header code needed in any page component.</strong></p>
          <pre className="ig-code-block" style={{ marginTop: '0.75rem' }}>{`// src/services/api.js — this already runs on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // ← set on login
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

// Auto-logout on 401 Unauthorized:
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // ← redirect to login
    }
    return Promise.reject(err);
  }
);`}</pre>
        </div>

      </div>
    </div>
  );
}
