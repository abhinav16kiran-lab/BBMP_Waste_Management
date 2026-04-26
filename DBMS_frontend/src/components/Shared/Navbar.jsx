import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/',                   label: 'Home'        },
  { to: '/citizen/dashboard',  label: 'Citizen'     },
  { to: '/crew/dashboard',     label: 'Crew'        },
  { to: '/admin/dashboard',    label: 'Admin'       },
  { to: '/integration',        label: 'Dev Guide', highlight: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect x="2" y="8" width="24" height="16" rx="3" stroke="#7C3AED" strokeWidth="2"/>
              <path d="M9 8V6a5 5 0 0 1 10 0v2" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 14v4M12 16h4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>BBMP<span className="logo-accent"> Waste</span></span>
          </Link>

          {/* Desktop links */}
          <div className="navbar-links">
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''} ${l.highlight ? 'nav-link--highlight' : ''}`
                }
              >
                {l.label}
                {l.highlight && <span className="nav-dev-badge">DEV</span>}
              </NavLink>
            ))}
          </div>

          {/* Auth area */}
          <div className="navbar-auth">
            {user ? (
              <>
                <span className="navbar-user">{user.name || user.email}</span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-drawer-inner">
          {NAV_LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? 'active' : ''} ${l.highlight ? 'mobile-nav-link--highlight' : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
              {l.highlight && <span className="nav-dev-badge" style={{ marginLeft: '0.5rem' }}>DEV</span>}
            </NavLink>
          ))}
          <div className="mobile-auth">
            {user ? (
              <>
                <span className="navbar-user">{user.name || user.email}</span>
                <button className="btn btn-outline btn-full" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-full" onClick={() => setMenuOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      </div>
      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
