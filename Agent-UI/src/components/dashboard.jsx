import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Thermometer, Clock, Pill, Activity, AlertTriangle, Bell, TrendingUp, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

/* Generate simulated medication schedule based on user input */
function buildMockSchedule(data) {
  const now = new Date();
  const scheduleDays = 7;
  const schedule = [];
  for (let d = scheduleDays - 1; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    const taken = d === 0 ? null : Math.random() > 0.3; // today = pending, past = random
    schedule.push({
      date: day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      medicine: data.medicine,
      time: data.doseTime,
      status: d === 0 ? 'pending' : taken ? 'taken' : 'missed',
    });
  }
  return schedule;
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

function buildAlerts(schedule, risk) {
  const alerts = [];
  const missed = schedule.filter(s => s.status === 'missed');
  if (missed.length > 0) {
    alerts.push({ type: 'warning', text: `Missed dose detected — ${missed.length} time(s) this week`, time: 'Recent' });
  }
  if (risk === 'high' || risk === 'medium') {
    alerts.push({ type: 'escalation', text: 'Caregiver notified due to adherence risk', time: 'Auto' });
  }
  alerts.push({ type: 'reminder', text: `Reminder sent for ${schedule[schedule.length - 1]?.medicine}`, time: 'Today' });
  return alerts;
}

const HealthDashboard = ({ data, onReset }) => {
  const [schedule] = useState(() => buildMockSchedule(data));
  const adherence = computeAdherence(schedule);
  const risk = computeRisk(data.severity, adherence);
  const alerts = buildAlerts(schedule, risk);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const riskColor = risk === 'high' ? '#e74c3c' : risk === 'medium' ? '#f39c12' : '#27ae60';
  const riskBg = risk === 'high' ? 'rgba(231,76,60,0.1)' : risk === 'medium' ? 'rgba(243,156,18,0.1)' : 'rgba(39,174,96,0.1)';

  const severityLabel = data.severity.charAt(0).toUpperCase() + data.severity.slice(1);
  const diseaseLabel = data.disease.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Format time for display
  const formatTime12 = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        zIndex: 10
      }}
    >
      {/* 🧠 1. HEADER — Patient Info */}
      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ padding: '0.8rem', background: 'rgba(92,124,137,0.08)', borderRadius: '12px' }}>
            <User size={24} color="#5C7C89" />
          </div>
          <div>
            <p style={{ color: '#8EACB8', fontSize: '0.85rem' }}>Patient</p>
            <p style={{ fontWeight: 700, fontSize: '1.15rem' }}>{data.name}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ padding: '0.8rem', background: 'rgba(92,124,137,0.08)', borderRadius: '12px' }}>
            <Thermometer size={24} color="#5C7C89" />
          </div>
          <div>
            <p style={{ color: '#8EACB8', fontSize: '0.85rem' }}>Condition</p>
            <p style={{ fontWeight: 700, fontSize: '1.15rem' }}>{diseaseLabel}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ padding: '0.8rem', background: riskBg, borderRadius: '12px' }}>
            <ShieldCheck size={24} color={riskColor} />
          </div>
          <div>
            <p style={{ color: '#8EACB8', fontSize: '0.85rem' }}>Severity</p>
            <p style={{ fontWeight: 700, fontSize: '1.15rem', color: riskColor }}>{severityLabel}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ padding: '0.8rem', background: 'rgba(92,124,137,0.08)', borderRadius: '12px' }}>
            <Clock size={24} color="#5C7C89" />
          </div>
          <div>
            <p style={{ color: '#8EACB8', fontSize: '0.85rem' }}>Med Time</p>
            <p style={{ fontWeight: 700, fontSize: '1.15rem' }}>{formatTime12(data.doseTime)}</p>
          </div>
        </div>
      </motion.div>

      {/* ⏰ 2. MEDICATION SCHEDULE */}
      <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }} className="text-gradient">
          <Pill size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Medication Schedule
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {schedule.map((entry, idx) => {
            const statusIcon = entry.status === 'taken'
              ? <CheckCircle size={20} color="#27ae60" />
              : entry.status === 'missed'
              ? <XCircle size={20} color="#e74c3c" />
              : <Clock size={20} color="#f39c12" />;
            const statusText = entry.status === 'taken' ? 'Taken' : entry.status === 'missed' ? 'Missed' : 'Pending';
            const statusColor = entry.status === 'taken' ? '#27ae60' : entry.status === 'missed' ? '#e74c3c' : '#f39c12';
            return (
              <motion.div 
                key={idx} 
                className="glass-panel" 
                style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
                whileHover={{ x: 8, background: 'rgba(234, 246, 255, 0.85)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <span style={{ fontWeight: 600, minWidth: '140px', color: '#5C7C89' }}>{entry.date}</span>
                  <span style={{ fontWeight: 500 }}>{entry.medicine}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px', justifyContent: 'flex-end' }}>
                  <span style={{ color: '#8EACB8', fontSize: '0.9rem' }}>{formatTime12(entry.time)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '100px', justifyContent: 'flex-end' }}>
                  {statusIcon}
                  <span style={{ fontWeight: 700, color: statusColor, fontSize: '0.95rem' }}>{statusText}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ⚠️ 3. RISK STATUS + 📊 4. ADHERENCE TRACKING */}
      <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Risk Status */}
        <motion.div 
          className="glass-panel" 
          whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${riskBg}` }}
          style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <AlertTriangle size={36} color={riskColor} />
          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#5C7C89' }}>Risk Status</h4>
          <div style={{ 
            padding: '10px 30px', 
            borderRadius: '30px', 
            background: riskBg, 
            color: riskColor, 
            fontWeight: 800, 
            fontSize: '1.4rem',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            {risk}
          </div>
        </motion.div>

        {/* Adherence Tracking */}
        <motion.div 
          className="glass-panel" 
          whileHover={{ scale: 1.02 }}
          style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <TrendingUp size={36} color="#5C7C89" />
          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#5C7C89' }}>Adherence Tracking</h4>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }} className="text-gradient">{adherence.pct}%</p>
              <p style={{ color: '#8EACB8', fontSize: '0.85rem' }}>Weekly Rate</p>
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#e74c3c' }}>{adherence.missed}</p>
              <p style={{ color: '#8EACB8', fontSize: '0.85rem' }}>Missed Doses</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 🔔 5. ALERT SECTION */}
      <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }} className="text-gradient">
          <Bell size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Alerts & Notifications
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alerts.map((alert, idx) => {
            const iconColor = alert.type === 'warning' ? '#e74c3c' : alert.type === 'escalation' ? '#f39c12' : '#27ae60';
            const alertIcon = alert.type === 'warning' 
              ? <AlertTriangle size={18} color={iconColor} />
              : alert.type === 'escalation'
              ? <Bell size={18} color={iconColor} />
              : <CheckCircle size={18} color={iconColor} />;
            return (
              <motion.div 
                key={idx} 
                className="glass-panel" 
                style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                whileHover={{ x: 12, background: 'rgba(234, 246, 255, 0.85)' }}
              >
                <div style={{ 
                  background: `${iconColor}15`, 
                  width: '36px', height: '36px', 
                  borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  flexShrink: 0 
                }}>
                  {alertIcon}
                </div>
                <p style={{ color: '#3A6B7E', fontSize: '1.05rem', flex: 1 }}>{alert.text}</p>
                <span style={{ color: '#8EACB8', fontSize: '0.85rem', fontWeight: 600 }}>{alert.time}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Reset Button */}
      <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '2rem' }}>
        <motion.button 
          onClick={onReset}
          className="glow-btn"
          style={{ padding: '12px 40px', background: 'transparent', border: '1px solid #5C7C89', color: '#5C7C89' }}
          whileHover={{ background: 'rgba(92,124,137,0.08)' }}
        >
          New Health Check
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default HealthDashboard;
