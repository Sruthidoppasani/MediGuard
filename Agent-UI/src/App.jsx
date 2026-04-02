import React from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import DashboardPage from './pages/DashboardPage';
import HealthcareForm from './pages/HealthcareForm';

function RequireAuth({ children }) {
  let hasUser = false;
  try {
    hasUser = Boolean(localStorage.getItem('user'));
  } catch {
    hasUser = false;
  }

  if (!hasUser) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route path="/healthcare-form" element={<HealthcareForm />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
