import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoadingDashboard from './components/LoadingDashboard';

const SectionCTA = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const agentImg = '/agent_doctor_welcome_clean.png';

  const validatePhone = (code, num) => {
    return /^\+\d{1,4}$/.test(code.trim()) && /^\d{6,14}$/.test(num.trim());
  };

  // ─── n8n webhook helper ───────────────────────────────────────────────────
  const sendToN8N = async (formattedData) => {
    try {
      console.log('Sending Data:', formattedData);

      const response = await fetch('/api/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      console.log('n8n response status:', response.status);

      // n8n may return non-JSON on some statuses — guard against it
      let data;
      try { data = await response.json(); } catch { data = {}; }
      console.log('n8n response:', data);

      return data;
    } catch (error) {
      console.error('Webhook Error:', error);
      throw error;
    }
  };

  // ─── Form submit handler ──────────────────────────────────────────────────
  const handleGenerate = async (e) => {
    e.preventDefault();
    const form = e.target;

    // Validate phone fields
    const phoneCode = form.phoneCode.value.trim();
    const phoneNumber = form.phoneNumber.value.trim();
    const emergencyCode = form.emergencyCode.value.trim();
    const emergencyNumber = form.emergencyNumber.value.trim();

    if (!validatePhone(phoneCode, phoneNumber)) {
      alert('Phone Number must include a valid country code (e.g., +91) and number.');
      form.phoneNumber.focus();
      return;
    }
    if (!validatePhone(emergencyCode, emergencyNumber)) {
      alert('Caregiver / Emergency Contact must include a valid country code (e.g., +91) and number.');
      form.emergencyNumber.focus();
      return;
    }

    // Format payload to match n8n webhook schema
    const formattedData = {
      id: form.patientId.value,
      name: form.patientName.value,
      age: form.age.value,
      disease: form.disease.value,
      medicine: form.medicineName.value,
      time: form.medicationTime.value,
      phone: `${phoneCode}${phoneNumber}`,
      caregiverPhone: `${emergencyCode}${emergencyNumber}`,
      risk: form.riskLevel.value,
    };

    setLoading(true);

    try {
      await sendToN8N(formattedData);

      // Store for dashboard display
      try {
        sessionStorage.setItem('mediguard_patient', JSON.stringify({
          id: formattedData.id,
          name: formattedData.name,
          age: formattedData.age,
          disease: formattedData.disease,
          medicineName: formattedData.medicine,
          medicationTime: formattedData.time,
          phone: formattedData.phone,
          emergencyContact: formattedData.caregiverPhone,
          severity: formattedData.risk,
          tablets: [{ name: formattedData.medicine, time: formattedData.time }],
        }));
      } catch { /* ignore */ }

      alert('Patient registered successfully ✅');
      setLoading(false);
      navigate('/dashboard');

    } catch (err) {
      console.error('Form submit error:', err);
      alert('Error submitting form ❌');
      setLoading(false);
    }
  };


  const containerVariants = {
    hidden: { opacity: 0, y: -60, scaleY: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      transition: { duration: 0.7, ease: "easeInOut", staggerChildren: 0.08, delayChildren: 0.2 }
    },
    exit: { opacity: 0, y: -40, scaleY: 0.95, transition: { duration: 0.5, ease: "easeInOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <>
      <section className="section" style={{ flexDirection: 'column', paddingTop: '6rem', paddingBottom: '8rem', zIndex: 10 }}>

        {/* Main Header */}
        <motion.div
          animate={{ y: showForm ? -80 : 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="glass-panel"
          style={{ textAlign: 'center', zIndex: 20, padding: '4rem', maxWidth: '800px', width: '100%', marginBottom: '2rem', position: 'relative' }}
        >
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }} className="text-gradient">
            Let MediGuard monitor your health.
          </h2>
          <p style={{ fontSize: '1.4rem', marginBottom: '3rem', color: '#5C7C89' }}>
            Your intelligent agent tracks, detects, and protects — automatically.
          </p>
          <motion.button
            className="glow-btn"
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(92,124,137,0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            {showForm ? 'Hide Health Setup' : 'Ask Your Agent'}
          </motion.button>
        </motion.div>

        {/* Form / Loading */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <LoadingDashboard />
            </motion.div>
          ) : showForm ? (
            <motion.div
              key="form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ overflow: 'hidden', width: '100%', position: 'relative', display: 'flex', justifyContent: 'center', zIndex: 9, transformOrigin: 'top' }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: '900px', zIndex: 5 }}>
                <motion.div className="glass-panel" style={{ padding: '3rem', width: '100%', borderRadius: '24px' }}>
                  <form onSubmit={handleGenerate}>

                    {/* ── SECTION 1: USER IDENTIFICATION ── */}
                    <motion.div variants={itemVariants} className="form-section-header">
                      <span className="form-section-icon">👤</span>
                      <span>User Identification</span>
                    </motion.div>
                    <div className="form-grid">
                      <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label">ID (number only)</label>
                        <input type="number" name="patientId" className="form-input" placeholder="e.g. 123456" required />
                      </motion.div>
                      <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label">Name</label>
                        <input type="text" name="patientName" className="form-input" placeholder="e.g. John Doe" required />
                      </motion.div>
                      <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label">Age</label>
                        <input type="number" name="age" className="form-input" placeholder="e.g. 45" min="1" max="150" required />
                      </motion.div>
                    </div>

                    {/* ── SECTION 2: MEDICAL DETAILS ── */}
                    <motion.div variants={itemVariants} className="form-section-header">
                      <span className="form-section-icon">🩺</span>
                      <span>Medical Details</span>
                    </motion.div>
                    <div className="form-grid">
                      <motion.div variants={itemVariants} className="form-group form-grid-full">
                        <label className="form-label">Disease / Condition</label>
                        <input type="text" name="disease" className="form-input" placeholder="e.g. Type 2 Diabetes, Hypertension" required />
                      </motion.div>
                      <motion.div variants={itemVariants} className="form-group form-grid-full">
                        <label className="form-label">Medicine Name</label>
                        <input type="text" name="medicineName" className="form-input" placeholder="e.g. Metformin 500mg" required />
                      </motion.div>
                    </div>

                    {/* ── SECTION 3: MEDICATION TIME ── */}
                    <motion.div variants={itemVariants} className="form-section-header">
                      <span className="form-section-icon">⏰</span>
                      <span>Medication Time</span>
                    </motion.div>
                    <div className="form-grid">
                      <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label">Time (24-hour format)</label>
                        <input type="time" name="medicationTime" className="form-input" required />
                        <span className="form-hint">HH:MM — e.g. 08:30, 21:15</span>
                      </motion.div>
                    </div>

                    {/* ── SECTION 4: CONTACT DETAILS ── */}
                    <motion.div variants={itemVariants} className="form-section-header">
                      <span className="form-section-icon">📞</span>
                      <span>Contact Details</span>
                    </motion.div>
                    <div className="form-grid">
                      <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label">Phone Number</label>
                        <div className="phone-input-group">
                          <input type="text" name="phoneCode" className="form-input country-code-input" placeholder="+91" defaultValue="+91" required />
                          <input type="number" name="phoneNumber" className="form-input phone-main-input" placeholder="9876543210" required />
                        </div>
                      </motion.div>
                      <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label">Caregiver / Emergency Contact</label>
                        <div className="phone-input-group">
                          <input type="text" name="emergencyCode" className="form-input country-code-input" placeholder="+91" defaultValue="+91" required />
                          <input type="number" name="emergencyNumber" className="form-input phone-main-input" placeholder="5551234567" required />
                        </div>
                      </motion.div>
                    </div>

                    {/* ── SECTION 5: RISK LEVEL ── */}
                    <motion.div variants={itemVariants} className="form-section-header">
                      <span className="form-section-icon">⚠️</span>
                      <span>Risk Level</span>
                    </motion.div>
                    <div className="form-grid">
                      <motion.div variants={itemVariants} className="form-group">
                        <label className="form-label">Risk Level</label>
                        <select name="riskLevel" className="form-select" required defaultValue="">
                          <option value="" disabled>Select risk level</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </motion.div>
                    </div>

                    {/* ── SUBMIT ── */}
                    <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                      <motion.button
                        type="submit"
                        className="glow-btn save-details-btn"
                        whileHover={{ scale: 1.07, boxShadow: "0 15px 30px rgba(92,124,137,0.25), 0 0 30px rgba(92,124,137,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        style={{ padding: '16px 60px' }}
                      >
                        Save Details
                      </motion.button>
                    </motion.div>
                  </form>
                </motion.div>

                {/* OUTSIDE DECORATIVE AGENT */}
                {agentImg && (
                  <motion.div
                    variants={itemVariants}
                    style={{ position: 'absolute', bottom: '0', right: '-250px', width: '450px', height: '450px', pointerEvents: 'none', zIndex: 10 }}
                  >
                    <div style={{ width: '100%', height: '100%' }}>
                      {agentImg && (
                        <img
                          src={agentImg}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', filter: "drop-shadow(0px 18px 30px rgba(31,73,89,0.40)) drop-shadow(0px 0px 25px rgba(42,127,143,0.30)) drop-shadow(0px 6px 10px rgba(31,73,89,0.15))" }}
                          alt="MediGuard Agent"
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <footer className="glass-panel" style={{ margin: '0 2rem 2rem 2rem', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, position: 'relative' }}>
        <div>
          <h3 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800 }}>MediGuard</h3>
          <p style={{ color: '#8EACB8', marginTop: '0.5rem' }}>hello@mediguard.health</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', color: '#5C7C89', fontWeight: 600 }}>
          <span>Twitter</span>
          <span>Instagram</span>
          <span>LinkedIn</span>
        </div>
      </footer>
    </>
  );
};
export default SectionCTA;
