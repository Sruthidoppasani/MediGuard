import React from 'react';
import { motion as Motion, useReducedMotion, useTransform } from 'framer-motion';

const AnimatedBackground = ({ scrollYProgress }) => {
  const reducedMotion = useReducedMotion();

  // Keep visibility high, subtle dimming on scroll
  const globalOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.9]);

  // Subtle parallax movement tied to scroll (no infinite loops).
  const ribbonX = useTransform(scrollYProgress, [0, 1], ['-6vw', '6vw']);
  const ribbonY = useTransform(scrollYProgress, [0, 1], ['-2vh', '2vh']);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const finalRibbonX = reducedMotion ? 0 : ribbonX;
  const finalRibbonY = reducedMotion ? 0 : ribbonY;
  const finalGlowScale = reducedMotion ? 1 : glowScale;

  return (
    <Motion.div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        background: '#EAF6FF',
        overflow: 'hidden',
        opacity: globalOpacity
      }}
    >
      {/* Static gradient base */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 1,
          zIndex: 1,
          background:
            'radial-gradient(circle at 20% 10%, rgba(92, 124, 137, 0.08) 0%, transparent 55%),' +
            'radial-gradient(circle at 80% 30%, rgba(234, 246, 255, 0.6) 0%, transparent 60%),' +
            'radial-gradient(circle at 55% 90%, rgba(92, 124, 137, 0.05) 0%, transparent 65%)'
        }}
      />

      {/* Single ribbon with scroll-tied parallax */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          transform: 'skewY(-10deg)'
        }}
      >
        <Motion.div
          style={{
            position: 'absolute',
            top: '0%',
            left: '-10%',
            width: '150vw',
            height: '60vh',
            background:
              'linear-gradient(90deg, transparent, rgba(92, 124, 137, 0.08), transparent)',
            opacity: 0.9,
            x: finalRibbonX,
            y: finalRibbonY,
            willChange: 'transform, opacity'
          }}
        />
      </div>

      {/* Core glow */}
      <Motion.div
        style={{
          position: 'absolute',
          inset: '10%',
          background:
            'radial-gradient(circle at 40% 40%, rgba(234, 246, 255, 0.5), transparent 70%)',
          opacity: 0.85,
          scale: finalGlowScale,
          willChange: 'transform, opacity',
          zIndex: -1
        }}
      />

      {/* Vignette */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 40%, rgba(234, 246, 255, 0.15) 100%)',
          zIndex: 2
        }}
      />
    </Motion.div>
  );
};

export default AnimatedBackground;
