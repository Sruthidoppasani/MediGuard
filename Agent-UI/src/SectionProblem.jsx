import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Activity, AlertCircle, ShieldCheck, FileText } from 'lucide-react';

const SectionProblem = () => {
  return (
    <section className="section">
      <div className="section-content" style={{ display: 'flex', alignItems: 'center' }}>
        {/* Left Side: Text */}
        <Motion.div 
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-panel"
          style={{ width: '45%', zIndex: 10 }}
        >
          <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 800 }}>Still missing your <span className="text-gradient">medications?</span></h2>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: '#5C7C89' }}>
            Medication non-adherence leads to serious health risks.
            MediGuard continuously monitors your medication schedule, detects missed doses, and takes action instantly — without waiting for manual intervention.
          </p>
          
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Activity color="#5C7C89" /> <span>Real-time monitoring</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <AlertCircle color="#5C7C89" /> <span>Missed dose detection</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <ShieldCheck color="#5C7C89" /> <span>Intelligent response</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <FileText color="#5C7C89" /> <span>Adherence logging</span>
            </div>
          </div>
        </Motion.div>

        {/* Right Side: Empty for Agent to position */}
        <div style={{ width: '55%' }}></div>
      </div>
    </section>
  );
};
export default SectionProblem;
