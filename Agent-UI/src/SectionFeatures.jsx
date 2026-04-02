import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle, ShieldCheck, Brain, Bell, ClipboardList } from 'lucide-react';

const featureList = [
  { id: 0, icon: <Activity size={24} />, title: "Monitoring Agent", desc: ["Continuously tracks medication schedules.", "Detects whether doses are taken or missed.", "Works in real-time without user input."] },
  { id: 1, icon: <AlertCircle size={24} />, title: "Missed Dose Detection", desc: ["Identifies missed medications instantly.", "Logs every missed dose event.", "Triggers further actions automatically."] },
  { id: 2, icon: <ShieldCheck size={24} />, title: "Risk Assessment Engine", desc: ["Evaluates risk based on user condition.", "Uses missed dose patterns for scoring.", "Classifies risk into low, medium, high."] },
  { id: 3, icon: <Brain size={24} />, title: "Autonomous Decision Engine", desc: ["Decides actions without human input.", "Chooses between reminder or escalation.", "Adapts based on user behavior."] },
  { id: 4, icon: <Bell size={24} />, title: "Alert & Escalation System", desc: ["Sends reminders to users.", "Escalates to caregivers if needed.", "Ensures critical cases are not ignored."] },
  { id: 5, icon: <ClipboardList size={24} />, title: "Adherence Logging", desc: ["Stores medication history.", "Tracks missed dose patterns.", "Provides insights for doctors."] }
];

const SectionFeatures = () => {
  // Default INITIAL STATE: Show Monitoring Agent (Index 0)
  const [activeFeat, setActiveFeat] = useState(0);

  return (
    <section className="section" style={{ display: 'flex', overflow: 'hidden', padding: '0', minHeight: '100vh', justifyContent: 'center' }}>
      <div className="section-content" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>

        {/* LEFT SIDE: POP-UP AGENT FIXED TO LEFT */}
        <div style={{ flex: '0.8', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '2rem' }}>
          {/* Agent should appear on left side with a pop-up / flying effect */}
          <Motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.5 }}
            style={{ pointerEvents: 'none' }}
          >
            <Motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src="/agent_doctor_standing_clean.png"
              alt="MediGuard Medical Assistant"
              decoding="async"
              draggable={false}
              style={{ width: '450px', objectFit: 'contain', filter: "drop-shadow(0 18px 30px rgba(31,73,89,0.40)) drop-shadow(0 0 25px rgba(42,127,143,0.30)) drop-shadow(0 6px 10px rgba(31,73,89,0.15))" }}
            />
          </Motion.div>
        </div>

        {/* RIGHT SIDE: CONTENT & CIRCULAR SELECTORS */}
        <div style={{ flex: '1.2', position: 'relative', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Circular wrapper for selector buttons */}
          <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {featureList.map((feat, i) => {
              // Arrange 6 buttons in a full circular layout
              const angle = (i * (360 / featureList.length)) - 90;
              const rad = angle * (Math.PI / 180);
              const radius = 240;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;

              const isActive = activeFeat === feat.id;

              return (
                <Motion.button
                  key={feat.id}
                  onClick={() => setActiveFeat(feat.id)}
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    // Use transform-based translate via framer to avoid layout-based positioning.
                    x: x - 35,
                    y: y - 35,
                    width: '70px', height: '70px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: isActive ? '2px solid var(--secondary-color)' : '1px solid var(--border-light)',
                    boxShadow: isActive ? '0 0 25px rgba(92,124,137,0.3)' : '0 10px 20px rgba(92,124,137,0.08)',
                    color: isActive ? 'var(--accent-color)' : '#8EACB8',
                    cursor: 'pointer', zIndex: 20,
                    background: isActive ? 'rgba(234, 246, 255, 0.9)' : 'rgba(234, 246, 255, 0.5)',
                    padding: 0,
                    willChange: 'transform'
                  }}
                  whileHover={{ scale: 1.15, boxShadow: '0 15px 30px rgba(92,124,137,0.2), 0 0 25px rgba(92,124,137,0.15)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  {feat.icon}
                </Motion.button>
              )
            })}
          </div>

          {/* FIXED CONTENT AREA (Inside the circle) */}
          <div className="glass-panel" style={{ position: 'relative', width: '380px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', zIndex: 10, padding: '2rem' }}>

            {/* mode="wait" ensures fade out completes BEFORE fade in starts (No overlapping) */}
            <AnimatePresence mode="wait">
              <Motion.div
                key={activeFeat}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ position: 'absolute', width: '100%', padding: '0 1rem' }}
              >
                <h3 className="text-gradient" style={{ margin: '0 0 1rem 0', fontSize: '1.6rem', fontWeight: 800 }}>
                  {featureList[activeFeat].title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#5C7C89', fontSize: '1.05rem', lineHeight: '1.6' }}>
                  {featureList[activeFeat].desc.map((line, j) => (
                    <li key={j} style={{ marginBottom: '8px', opacity: 0.9 }}>{line}</li>
                  ))}
                </ul>
              </Motion.div>
            </AnimatePresence>

          </div>

        </div>
      </div>
    </section>
  )
}
export default SectionFeatures;
