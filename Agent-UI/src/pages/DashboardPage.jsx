import React, { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  User, Phone, Mail, Calendar, Thermometer, ShieldCheck,
  Pill, Clock, Activity, AlertTriangle, Bell, TrendingUp,
  CheckCircle, XCircle, Stethoscope, LogOut, Home, ClipboardList
} from 'lucide-react';
import '../index.css';

/* ────── helpers ────── */

function formatTime12(t) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
}

function buildSchedule(tablets) {
  const now = new Date();
  const days = 7;
  const rows = [];
  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    const dateStr = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    tablets.forEach((tab) => {
      const taken = d === 0 ? null : Math.random() > 0.3;
      rows.push({
        date: dateStr,
        medicine: tab.name,
        time: tab.time,
        status: d === 0 ? 'pending' : taken ? 'taken' : 'missed',
      });
    });
  }
  return rows;
}

function computeAdherence(schedule) {
  const past = schedule.filter(s => s.status !== 'pending');
  const taken = past.filter(s => s.status === 'taken').length;
  const missed = past.filter(s => s.status === 'missed').length;
  const pct = past.length > 0 ? Math.round((taken / past.length) * 100) : 100;
  return { taken, missed, total: past.length, pct };
}

function computeRisk(severity, adherence) {
  if (severity === 'high' || adherence.pct < 50) return 'high';
  if (severity === 'medium' || adherence.pct < 75) return 'medium';
  return 'low';
}

function buildAlerts(schedule, risk, tablets) {
  const alerts = [];
  const missed = schedule.filter(s => s.status === 'missed');
  if (missed.length > 0) {
    alerts.push({ type: 'warning', text: `Missed dose detected — ${missed.length} time(s) this week`, time: 'Recent' });
  }
  if (risk === 'high' || risk === 'medium') {
    alerts.push({ type: 'escalation', text: 'Caregiver notified due to adherence risk', time: 'Auto' });
  }
  tablets.forEach(t => {
    alerts.push({ type: 'reminder', text: `Reminder sent for ${t.name} at ${formatTime12(t.time)}`, time: 'Today' });
  });
  return alerts;
}

function todayStatus(schedule, tablets) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return tablets.map(tab => {
    const entry = schedule.find(s => s.date === today && s.medicine === tab.name);
    return {
      medicine: tab.name,
      time: tab.time,
      status: entry ? entry.status : 'pending',
    };
  });
}

/* ────── NAV ITEMS ────── */
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: <Home size={18} /> },
  { id: 'tracker', label: 'Medical Tracker', icon: <Pill size={18} /> },
  { id: 'history', label: 'Health History', icon: <TrendingUp size={18} /> },
  { id: 'insights', label: 'Doctor Insights', icon: <Stethoscope size={18} /> },
  { id: 'notifications', label: 'Notifications & Alerts', icon: <Bell size={18} /> },
];

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  // Read patient data from sessionStorage
  const data = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('mediguard_patient');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  if (!data) return <Navigate to="/home" replace />;

  const [schedule] = useState(() => buildSchedule(data.tablets));
  const adherence = computeAdherence(schedule);
  const risk = computeRisk(data.severity, adherence);
  const alerts = buildAlerts(schedule, risk, data.tablets);
  const todayMeds = todayStatus(schedule, data.tablets);

  const riskColor = risk === 'high' ? 'var(--red)' : risk === 'medium' ? 'var(--yellow)' : 'var(--green)';
  const riskBg = risk === 'high' ? 'rgba(244,67,54,0.10)' : risk === 'medium' ? 'rgba(255,193,7,0.10)' : 'rgba(76,175,80,0.10)';
  const severityLabel = data.severity.charAt(0).toUpperCase() + data.severity.slice(1);
  const diseaseLabel = data.disease.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const handleLogout = () => {
    try { sessionStorage.removeItem('mediguard_patient'); } catch { /* */ }
    try { localStorage.removeItem('user'); } catch { /* */ }
    navigate('/login', { replace: true });
  };

  const initials = (data.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  /* ──── Content Renderer ──── */
  const renderContent = () => {
    switch (activeTab) {

      /* ──────── HOME ──────── */
      case 'home':
        return (
          <div>
            <div className="dashboard-greeting">
              <h1 className="text-gradient">Hi, {data.name} 👋</h1>
              <p>How's your health today?</p>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
              {/* Today's Medication Status */}
              <div className="summary-card">
                <div className="summary-card-icon" style={{ background: 'rgba(42,127,143,0.10)' }}>
                  <Pill size={22} color="var(--secondary-color)" />
                </div>
                <span className="summary-card-label">Today's Medication</span>
                <span className="summary-card-value" style={{ color: 'var(--secondary-color)' }}>
                  {todayMeds.filter(m => m.status === 'taken').length}/{todayMeds.length} Taken
                </span>
              </div>

              {/* Risk Level */}
              <div className="summary-card">
                <div className="summary-card-icon" style={{ background: riskBg }}>
                  <AlertTriangle size={22} color={riskColor} />
                </div>
                <span className="summary-card-label">Risk Level</span>
                <span className="summary-card-value" style={{ color: riskColor, textTransform: 'capitalize' }}>
                  {risk}
                </span>
              </div>

              {/* Missed Doses */}
              <div className="summary-card">
                <div className="summary-card-icon" style={{ background: 'rgba(244,67,54,0.10)' }}>
                  <XCircle size={22} color="var(--red)" />
                </div>
                <span className="summary-card-label">Missed Doses</span>
                <span className="summary-card-value" style={{ color: 'var(--red)' }}>
                  {adherence.missed}
                </span>
              </div>
            </div>

            {/* Notification Preview */}
            <div className="notification-preview">
              <h3 className="text-gradient">
                <Bell size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Notifications & Alerts
              </h3>
              {alerts.slice(0, 3).map((alert, idx) => {
                const dotColor = alert.type === 'warning' ? 'var(--red)' : alert.type === 'escalation' ? 'var(--yellow)' : 'var(--green)';
                return (
                  <div className="notif-item" key={idx}>
                    <span className="notif-dot" style={{ background: dotColor }}></span>
                    <span style={{ flex: 1 }}>{alert.text}</span>
                    <span style={{ color: '#5C7C89', fontSize: '0.85rem', fontWeight: 600 }}>{alert.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      /* ──────── MEDICAL TRACKER ──────── */
      case 'tracker':
        return (
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              <Pill size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Medical Tracker
            </h2>
            <div className="med-tracker-grid">
              {schedule.map((entry, idx) => {
                const statusColor = entry.status === 'taken' ? 'var(--green)' : entry.status === 'missed' ? 'var(--red)' : 'var(--yellow)';
                const statusBg = entry.status === 'taken' ? 'rgba(76,175,80,0.10)' : entry.status === 'missed' ? 'rgba(244,67,54,0.10)' : 'rgba(255,193,7,0.10)';
                const statusText = entry.status === 'taken' ? 'Taken' : entry.status === 'missed' ? 'Missed' : 'Pending';
                const StatusIcon = entry.status === 'taken' ? CheckCircle : entry.status === 'missed' ? XCircle : Clock;
                return (
                  <div className="med-tracker-card" key={idx}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <span style={{ fontWeight: 600, minWidth: '140px', color: '#5C7C89', fontSize: '0.9rem' }}>{entry.date}</span>
                      <span style={{ fontWeight: 600, fontSize: '1rem' }}>{entry.medicine}</span>
                    </div>
                    <span style={{ color: '#5C7C89', fontSize: '0.9rem', minWidth: '90px', textAlign: 'right' }}>{formatTime12(entry.time)}</span>
                    <div className="med-status-badge" style={{ background: statusBg, color: statusColor, minWidth: '100px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <StatusIcon size={14} />
                      {statusText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      /* ──────── HEALTH HISTORY ──────── */
      case 'history':
        const morningMisses = schedule.filter(s => {
          if (s.status !== 'missed' || !s.time) return false;
          const hour = parseInt(s.time.split(':')[0], 10);
          return hour < 12;
        }).length;
        const eveningMisses = schedule.filter(s => {
          if (s.status !== 'missed' || !s.time) return false;
          const hour = parseInt(s.time.split(':')[0], 10);
          return hour >= 12;
        }).length;
        const pattern = morningMisses > eveningMisses
          ? 'Misses mostly in morning'
          : morningMisses < eveningMisses
            ? 'Misses mostly in evening'
            : 'Misses spread evenly';

        return (
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              <TrendingUp size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Health History
            </h2>
            <div className="health-stats-grid">
              <div className="health-stat-card">
                <div className="stat-value" style={{ color: 'var(--red)' }}>{adherence.missed}</div>
                <div className="stat-label">Total Missed Doses</div>
              </div>
              <div className="health-stat-card">
                <div className="stat-value text-gradient">{adherence.pct}%</div>
                <div className="stat-label">Weekly Adherence</div>
              </div>
              <div className="health-stat-card">
                <div className="stat-value" style={{ color: 'var(--secondary-color)' }}>{adherence.taken}/{adherence.total}</div>
                <div className="stat-label">Doses Taken</div>
              </div>
            </div>
            <div className="dash-section-panel">
              <h3 className="text-gradient">Pattern Analysis</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 0' }}>
                <Activity size={20} color="var(--secondary-color)" />
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{pattern}</span>
              </div>
            </div>
          </div>
        );

      /* ──────── DOCTOR INSIGHTS ──────── */
      case 'insights': {
        const insights = [];
        if (adherence.pct < 80) {
          insights.push('Consult doctor due to frequent missed doses');
        }
        insights.push('Maintain consistent timing for all medications');
        insights.push('Consider setting phone reminders for better adherence');
        if (risk === 'high') {
          insights.push('Immediate medical review recommended — high risk detected');
        }
        if (adherence.missed > 3) {
          insights.push('Pattern of missed doses may affect treatment efficacy');
        }
        insights.push('Stay hydrated and take medications with food when recommended');

        return (
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              <Stethoscope size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Doctor Insights
            </h2>
            <div className="dash-section-panel">
              <h3 className="text-gradient">Recommendations</h3>
              <ul className="insight-list">
                {insights.map((text, idx) => (
                  <li key={idx}>
                    <CheckCircle size={18} color="var(--secondary-color)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      }

      /* ──────── NOTIFICATIONS ──────── */
      case 'notifications':
        return (
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              <Bell size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Notifications & Alerts
            </h2>
            <div className="dash-section-panel">
              {alerts.map((alert, idx) => {
                const iconColor = alert.type === 'warning' ? 'var(--red)' : alert.type === 'escalation' ? 'var(--yellow)' : 'var(--green)';
                const AlertIcon = alert.type === 'warning' ? AlertTriangle : alert.type === 'escalation' ? Bell : CheckCircle;
                return (
                  <div className="notif-item" key={idx}>
                    <div style={{
                      background: alert.type === 'warning' ? 'rgba(244,67,54,0.10)' : alert.type === 'escalation' ? 'rgba(255,193,7,0.10)' : 'rgba(76,175,80,0.10)',
                      width: '36px', height: '36px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <AlertIcon size={16} color={iconColor} />
                    </div>
                    <span style={{ flex: 1, fontSize: '1rem' }}>{alert.text}</span>
                    <span style={{ color: '#5C7C89', fontSize: '0.85rem', fontWeight: 600 }}>{alert.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <div className="dashboard-shell">
      {/* ──── LEFT SIDEBAR ──── */}
      <aside className="dashboard-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <h2 className="text-gradient">MediGuard</h2>
        </div>

        {/* Profile Section */}
        <div className="sidebar-profile" style={{ position: 'relative' }}>
          <div className="sidebar-profile-avatar">{initials}</div>

          {/* Welcoming Doctor Agent in Sidebar */}
          <div style={{ position: 'absolute', top: '10px', right: '15px', width: '80px', height: '80px', pointerEvents: 'none', opacity: 0.9 }}>
            <img
              src="/agent_doctor_welcome_clean.png"
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(31,73,89,0.15))' }}
              alt="Agent"
            />
          </div>

          <div className="sidebar-info-row">
            <span><User size={14} /></span>
            <span>{data.name}</span>
          </div>
          <div className="sidebar-info-row">
            <span><Phone size={14} /></span>
            <span>{data.phone || '—'}</span>
          </div>
          <div className="sidebar-info-row">
            <span><Phone size={14} /></span>
            <span title="Emergency">{data.emergencyContact || '—'}</span>
          </div>
          <div className="sidebar-info-row">
            <span><Mail size={14} /></span>
            <span>{data.email || '—'}</span>
          </div>
          <div className="sidebar-info-row">
            <span><Calendar size={14} /></span>
            <span>{data.age} yrs</span>
          </div>
          <div className="sidebar-info-row">
            <span><Thermometer size={14} /></span>
            <span>{diseaseLabel}</span>
          </div>
          <div className="sidebar-info-row">
            <span><ShieldCheck size={14} /></span>
            <span style={{ color: riskColor, fontWeight: 700 }}>{severityLabel}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          {/* Logout */}
          <button className="sidebar-nav-item logout-item" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* ──── RIGHT MAIN CONTENT ──── */}
      <main className="dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
}
