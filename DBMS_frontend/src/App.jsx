import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar       from './components/Shared/Navbar';
import Footer       from './components/Shared/Footer';
import ProtectedRoute from './components/Shared/ProtectedRoute';

import Home             from './pages/Home';
import Login            from './pages/Login';
import Register         from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import ComplaintForm    from './pages/ComplaintForm';
import CrewDashboard    from './pages/CrewDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import IntegrationGuide from './pages/IntegrationGuide';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"       element={<Home />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/citizen/dashboard" element={
            <ProtectedRoute><CitizenDashboard /></ProtectedRoute>
          } />
          <Route path="/citizen/report" element={
            <ProtectedRoute><ComplaintForm /></ProtectedRoute>
          } />
          <Route path="/crew/dashboard" element={
            <ProtectedRoute><CrewDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/integration" element={<IntegrationGuide />} />

          {/* 404 fallback */}
          <Route path="*" element={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', color: 'var(--color-purple)', lineHeight: 1 }}>404</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Page Not Found</h1>
              <a href="/" className="btn btn-primary">Back to Home</a>
            </div>
          } />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
