import React from 'react';
import { motion } from 'framer-motion';

const LoadingDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-panel"
      style={{
        textAlign: 'center',
        padding: '5rem 2rem',
        maxWidth: '600px',
        margin: '2rem auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        boxShadow: '0 0 50px rgba(92, 124, 137, 0.1)',
      }}
    >
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '4px solid rgba(92, 124, 137, 0.1)',
            borderTopColor: '#5C7C89',
            boxShadow: '0 0 15px rgba(92, 124, 137, 0.15)',
          }}
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            inset: '0',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(92, 124, 137, 0.1) 0%, transparent 70%)',
          }}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <h3 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>
          Analyzing your health profile...
        </h3>
        <p style={{ color: '#8EACB8', fontSize: '1.2rem' }}>
          MediGuard is setting up your personalized medication monitoring dashboard.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#5C7C89',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingDashboard;
