import React from 'react';
import { motion as Motion } from 'framer-motion';

const SectionHero = () => {
  return (
    <section className="section" style={{ flexDirection: 'column', padding: '10vh 0', position: 'relative' }}>

      {/* Background Hero Text behind the agent */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <Motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ textAlign: 'center' }}
        >
          <h1
            className="text-gradient"
            style={{
              fontSize: '14vw',
              fontWeight: 800,
              lineHeight: 1,
              margin: 0,
              opacity: 0.88,
              whiteSpace: 'nowrap',
              userSelect: 'none',
              letterSpacing: '-0.02em',
              textShadow: '0 8px 20px rgba(31,73,89,0.12)',
              display: 'inline-block'
            }}
          >
            MediGuard
          </h1>
        </Motion.div>
        <Motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          style={{
            fontSize: '1.6rem',
            color: '#5C7C89',
            fontWeight: 400,
            letterSpacing: '0.05em',
            userSelect: 'none',
            marginBottom: '2rem'
          }}
        >
          Autonomous Medication Monitoring & Alerting Agent
        </Motion.p>
      </div>


    </section>
  );
};

export default SectionHero;
