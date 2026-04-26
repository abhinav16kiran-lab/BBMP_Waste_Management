import './Footer.css';

const TEAM = [
  {
    name: 'Abhinav',
    role: 'Database Engineer',
    colour: '#7C3AED',
    icon: '🏛',
    items: ['All 8 database tables', 'Django Admin Panel', 'PostgreSQL schema', 'Seed data', '5 SQL queries'],
  },
  {
    name: 'Harsh',
    role: 'Backend Developer 1',
    colour: '#10B981',
    icon: '⚙️',
    items: ['Authentication API', 'JWT login system', 'Households API', 'Vehicles API'],
  },
  {
    name: 'Aditya',
    role: 'Backend Developer 2',
    colour: '#3B82F6',
    icon: '🔧',
    items: ['Schedules API', 'Complaints API', 'Haversine Nearest-Vehicle Dispatch', 'Missed Pickup Management Command'],
  },
  {
    name: 'Anish',
    role: 'Frontend Developer',
    colour: '#A855F7',
    icon: '💻',
    star: true,
    items: ['All 7 React pages', 'API integration', 'UI/UX design', 'Animations', 'Component architecture'],
  },
];

const TECH = ['React', 'Django REST Framework', 'PostgreSQL', 'JWT Authentication', 'Haversine Algorithm', 'GSAP', 'Three.js', 'Axios'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow-line" />
      <div className="container">
        <div className="footer-grid">

          {/* Team */}
          <div className="footer-col footer-team">
            <h3 className="footer-heading">Built by</h3>
            <p className="footer-sub">BBMP Smart Waste Management Team</p>
            <div className="team-cards">
              {TEAM.map(m => (
                <div
                  key={m.name}
                  className={`team-card ${m.star ? 'team-card--star' : ''}`}
                  style={{ '--team-color': m.colour }}
                >
                  <div className="team-card-header">
                    <span className="team-icon">{m.icon}</span>
                    <div>
                      <div className="team-name">{m.name}</div>
                      <div className="team-role" style={{ color: m.colour }}>{m.role}</div>
                    </div>
                    {m.star && <span className="team-star-badge">Frontend ⭐</span>}
                  </div>
                  <ul className="team-items">
                    {m.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Project Info */}
          <div className="footer-col">
            <h3 className="footer-heading">Project</h3>
            <div className="footer-project-info">
              <div className="project-badge">BBMP Smart Waste Management <span>v3.0</span></div>
              <p>A full-stack civic tech project</p>
              <p className="project-stack-note">Django + React + PostgreSQL</p>
              <p className="project-location">Bangalore, India 🇮🇳</p>
              <div className="project-divider" />
              <div className="footer-db-tables">
                <div className="footer-db-label">Database Tables</div>
                {['CITIZEN', 'WARD', 'HOUSEHOLD', 'CREW', 'VEHICLE', 'SCHEDULE', 'PICKUP_LOG', 'COMPLAINT'].map(t => (
                  <span key={t} className="db-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="footer-col">
            <h3 className="footer-heading">Tech Stack</h3>
            <div className="tech-stack">
              {TECH.map(t => (
                <span key={t} className="tech-tag">{t}</span>
              ))}
            </div>
            <div className="footer-api-info">
              <div className="api-endpoint">POST /api/auth/login/</div>
              <div className="api-endpoint">GET  /api/schedules/stats/</div>
              <div className="api-endpoint">POST /api/complaints/</div>
              <div className="api-endpoint">GET  /api/vehicles/vehicles/</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2025 BBMP Smart Waste Management</span>
          <span className="footer-dot" />
          <span>DBMS Course Project</span>
          <span className="footer-dot" />
          <span style={{ color: 'var(--color-purple-light)' }}>Built with ♥ in Bangalore</span>
        </div>
      </div>
    </footer>
  );
}
