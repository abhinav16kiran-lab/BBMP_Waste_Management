import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Animated counter hook ──────────────────────────────────────── */
function useCountUp(target, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, target, duration]);
  return count;
}

/* ── DB Schema data ──────────────────────────────────────────────── */
const DB_TABLES = [
  { name: 'CITIZEN',     fields: ['citizen_id', 'name', 'email', 'phone', 'ward_id'],        owner: 'Abhinav' },
  { name: 'WARD',        fields: ['ward_id', 'ward_name', 'zone', 'area_sqkm'],               owner: 'Abhinav' },
  { name: 'HOUSEHOLD',   fields: ['household_id', 'address', 'ward_id', 'citizen_id'],        owner: 'Abhinav' },
  { name: 'CREW',        fields: ['crew_id', 'supervisor_name', 'contact', 'ward_id'],        owner: 'Abhinav' },
  { name: 'VEHICLE',     fields: ['vehicle_id', 'vehicle_number', 'type', 'status', 'lat/lng'], owner: 'Abhinav' },
  { name: 'SCHEDULE',    fields: ['schedule_id', 'ward_id', 'crew_id', 'vehicle_id', 'status'], owner: 'Aditya' },
  { name: 'PICKUP_LOG',  fields: ['log_id', 'schedule_id', 'completed_at', 'notes'],           owner: 'Aditya' },
  { name: 'COMPLAINT',   fields: ['complaint_id', 'citizen_id', 'lat', 'lng', 'status'],       owner: 'Aditya' },
];

export default function Home() {
  const canvasRef   = useRef(null);
  const heroRef     = useRef(null);
  const statsRef    = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const pickups   = useCountUp(1284, 2200, statsVisible);
  const wards     = useCountUp(198,  1800, statsVisible);
  const trucks    = useCountUp(47,   1600, statsVisible);
  const complaints= useCountUp(12,   1400, statsVisible);

  /* ── Three.js Globe/City Grid ────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 3;

    /* Wireframe Globe */
    const sphereGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x7C3AED,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const globe = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(globe);

    /* Glow sphere */
    const glowGeo = new THREE.SphereGeometry(1.25, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xA855F7,
      wireframe: false,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    /* Glowing nodes on globe surface */
    const nodeCount = isMobile ? 30 : 60;
    const nodeGeo   = new THREE.SphereGeometry(0.025, 6, 6);
    const nodeMat   = new THREE.MeshBasicMaterial({ color: 0xFBBF24 });
    for (let i = 0; i < nodeCount; i++) {
      const phi   = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const node  = new THREE.Mesh(nodeGeo, nodeMat);
      const r     = 1.22;
      node.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
      globe.add(node);
    }

    /* Floating particles */
    const partCount   = isMobile ? 60 : 180;
    const partGeo     = new THREE.BufferGeometry();
    const partPositions = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount; i++) {
      partPositions[i * 3]     = (Math.random() - 0.5) * 8;
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0xA855F7,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      globe.rotation.y     += 0.003;
      globe.rotation.x     += 0.001;
      particles.rotation.y += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  /* ── GSAP entrance animations ────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-eyebrow',   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3 });
      gsap.fromTo('.hero-title',     { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.5 });
      gsap.fromTo('.hero-subtitle',  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.8 });
      gsap.fromTo('.hero-cta-group', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 1.0 });
      gsap.fromTo('.scroll-arrow',   { opacity: 0 },         { opacity: 1, duration: 0.5, delay: 1.5 });

      /* Stats section trigger */
      ScrollTrigger.create({
        trigger: '.stats-bar',
        start: 'top 80%',
        onEnter: () => setStatsVisible(true),
      });

      /* How it works cards */
      gsap.fromTo('.step-card',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15,
          scrollTrigger: { trigger: '.steps-section', start: 'top 85%', toggleActions: 'play none none none' } }
      );

      /* DB table cards */
      gsap.fromTo('.db-card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08,
          scrollTrigger: { trigger: '.db-section', start: 'top 85%', toggleActions: 'play none none none' } }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="home-page">
      <div className="grid-overlay" />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="hero-section">
        <canvas ref={canvasRef} className="hero-canvas" />
        <div className="hero-overlay" />
        <div className="hero-content container">
          <span className="hero-eyebrow badge badge-assigned">Live · Real-time Operations</span>
          <h1 className="hero-title">
            BBMP Smart<br />
            <span className="hero-accent">Waste Management</span>
          </h1>
          <p className="hero-subtitle">
            Real-time waste pickup tracking for Bangalore's <strong>198 wards</strong>.<br />
            Powered by Django · PostgreSQL · Haversine Dispatch.
          </p>
          <div className="hero-cta-group">
            <Link to="/login" className="btn btn-primary btn-lg pulse-border">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Citizen Login
            </Link>
            <Link to="/citizen/report" className="btn btn-danger btn-lg" style={{ animation: 'pulseGlowRed 2s ease-in-out infinite' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Report a Dump
            </Link>
          </div>
          <div className="scroll-arrow">
            <span />
            <span />
          </div>
        </div>
      </section>

      {/* ── LIVE STATS BAR ────────────────────────────────────── */}
      <section className="stats-bar" ref={statsRef}>
        <div className="container stats-inner">
          <div className="stat-item">
            <span className="stat-num">{pickups.toLocaleString()}</span>
            <span className="stat-lbl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              Total Pickups
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">{wards}</span>
            <span className="stat-lbl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Wards Covered
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">{trucks}</span>
            <span className="stat-lbl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              Active Trucks
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num" style={{ color: 'var(--color-yellow)' }}>{complaints}</span>
            <span className="stat-lbl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Open Complaints
            </span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="steps-section section container">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">From <span className="accent">Report</span> to <span className="accent">Resolution</span></h2>
        <p className="section-subtitle">Three steps powered by real-time data and the Haversine dispatch algorithm</p>
        <div className="steps-flow">
          <div className="step-card card">
            <div className="step-num">01</div>
            <div className="step-icon-wrap" style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3>Citizen Registers &amp; Reports</h3>
            <p>Citizen logs in, views pickup schedule, or files a complaint with GPS location and photo evidence.</p>
            <div className="step-tag">React Frontend</div>
          </div>

          <div className="step-arrow">
            <div className="arrow-line" />
            <svg className="arrow-head" width="12" height="12" viewBox="0 0 12 12">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="step-card card">
            <div className="step-num">02</div>
            <div className="step-icon-wrap" style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </div>
            <h3>Backend Processes &amp; Dispatches</h3>
            <p>Django REST API validates the complaint, queries PostgreSQL, and runs the Haversine formula to find the nearest active vehicle.</p>
            <div className="step-tag" style={{ color: 'var(--color-green)' }}>Django + PostgreSQL</div>
          </div>

          <div className="step-arrow">
            <div className="arrow-line" />
            <svg className="arrow-head" width="12" height="12" viewBox="0 0 12 12">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="step-card card">
            <div className="step-num">03</div>
            <div className="step-icon-wrap" style={{ background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <h3>Truck Reaches Location</h3>
            <p>The nearest available truck is automatically dispatched. Crew marks pickup as COMPLETED via the Crew Dashboard.</p>
            <div className="step-tag" style={{ color: 'var(--color-blue)' }}>GPS + Haversine</div>
          </div>
        </div>
      </section>

      {/* ── DATABASE SCHEMA ────────────────────────────────────── */}
      <section className="db-section section">
        <div className="container">
          <div className="section-label">Database Architecture</div>
          <h2 className="section-title">8-Table <span className="accent">PostgreSQL</span> Schema</h2>
          <p className="section-subtitle">Designed by Abhinav — normalized relational schema powering all 7 pages</p>
          <div className="db-grid">
            {DB_TABLES.map(t => (
              <div key={t.name} className="db-card card">
                <div className="db-card-top" />
                <div className="db-card-name">{t.name}</div>
                <ul className="db-fields">
                  {t.fields.map(f => (
                    <li key={f}><span className="field-dot" />
                      <code>{f}</code>
                    </li>
                  ))}
                </ul>
                <div className="db-owner">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  {t.owner}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-divider container" />
    </div>
  );
}
