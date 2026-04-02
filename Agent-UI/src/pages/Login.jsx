import React, { useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import { sendUserData } from '../api/sendUserData';

function validateLogin({ name, email, password }) {
  const nextErrors = {};

  const trimmedName = name.trim();
  if (!trimmedName) nextErrors.name = 'Name is required.';

  const trimmedEmail = email.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  if (!trimmedEmail) nextErrors.email = 'Email is required.';
  else if (!emailOk) nextErrors.email = 'Please enter a valid email address.';

  if (!password) nextErrors.password = 'Password is required.';
  else if (password.length < 6) {
    nextErrors.password = 'Password must be at least 6 characters.';
  }

  return {
    ok: Object.keys(nextErrors).length === 0,
    errors: nextErrors,
    normalized: {
      name: trimmedName,
      email: trimmedEmail,
      password,
    },
  };
}

export default function Login() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAuthed] = useState(() => {
    try {
      return Boolean(localStorage.getItem('user'));
    } catch {
      return false;
    }
  });

  const agentImg = '/agent_doctor_welcome_clean.png';

  const shadowFilter =
    'drop-shadow(0px 15px 25px rgba(92,124,137,0.35)) drop-shadow(0px 0px 20px rgba(92,124,137,0.25))';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const result = validateLogin({ name, email, password });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const userData = result.normalized;

    // Phase 1: store user data locally for the client-side protected route.
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      // If storage fails, we still try to proceed; auth route will re-check.
    }

    // Optional backend call (non-blocking for now).
    try {
      await sendUserData(userData);
    } catch {
      // No backend configured yet; ignore to keep UX snappy.
    }

    navigate('/home');
  };

  if (isAuthed) return <Navigate to="/home" replace />;

  return (
    <div className="login-shell">
      <div className="login-grid">
        <div className="login-box glass-panel" role="region" aria-label="Sign in">
          <div>
            <h1 className="login-title text-gradient">Welcome back</h1>
            <p className="login-subtitle">Sign in to your MediGuard health dashboard.</p>
          </div>

          <form onSubmit={onSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
              {errors.name && <div className="login-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
              />
              {errors.email && <div className="login-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              {errors.password && <div className="login-error">{errors.password}</div>}
            </div>


            <button
              type="submit"
              className="glow-btn login-signin-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Right-side agent (does not overlap the form) */}
        <div className="login-agent-col" aria-hidden="true">
          <div className="login-agent-wrap">
            <Motion.div
              animate={
                reducedMotion
                  ? { y: 0, rotate: -7, opacity: 1 }
                  : { y: [-6, 6, -6], rotate: [-8, -4, -8], opacity: 1 }
              }
              transition={
                reducedMotion ? { duration: 0 } : { repeat: Infinity, duration: 7, ease: 'easeInOut' }
              }
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                willChange: 'transform',
                // Slight lean toward the form but kept within the agent column.
                x: -18,
              }}
            >
              {agentImg && (
                <Motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={agentImg}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  style={{ width: '320px', height: '320px', objectFit: 'contain', filter: shadowFilter }}
                />
              )}
            </Motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

