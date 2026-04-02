import React from 'react';
import { motion as Motion, useReducedMotion, useTransform } from 'framer-motion';

const Agent = ({ scrollYProgress }) => {
  const reducedMotion = useReducedMotion();

  // Translate X: Center -> Right (Section 2)
  const x = useTransform(scrollYProgress, [0.15, 0.35], ["0vw", "25vw"]);

  // Translate Y: Pop-up -> Rest -> Scroll UP dynamically to match Section 2 leaving viewport
  const y = useTransform(scrollYProgress, [0.15, 0.25, 0.35, 0.42, 0.55], ["0vh", "-15vh", "0vh", "0vh", "-120vh"]);

  // Opacities for morphing
  const opWelcome = useTransform(scrollYProgress, [0, 0.22, 0.28], [1, 1, 0]);
  const opMulti = useTransform(scrollYProgress, [0.22, 0.28], [0, 1]); // Stays visible indefinitely

  // Pre-processed transparent PNGs (no runtime background removal needed)
  const welcomeCutout = '/agent_doctor_welcome_clean.png';
  const multiCutout = '/agent_doctor_multitasking_clean.png';

  // Floating character shadow + subtle glow
  const shadowFilter = "drop-shadow(0px 18px 30px rgba(31,73,89,0.40)) drop-shadow(0px 0px 25px rgba(42,127,143,0.30)) drop-shadow(0px 6px 10px rgba(31,73,89,0.15))";

  const floatAnimate = reducedMotion ? { y: 0 } : { y: [-8, 6, -8] };
  const floatTransition = reducedMotion
    ? undefined
    : { repeat: Infinity, duration: 8, ease: "easeInOut" };

  return (
    <Motion.div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Motion.div style={{ x, y, transformStyle: 'preserve-3d', willChange: 'transform' }}>
        <Motion.div animate={floatAnimate} transition={floatTransition}>
          <div style={{ position: 'relative', width: '450px', height: '450px' }}>
            <Motion.img
              src={welcomeCutout}
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{ opacity: opWelcome, position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', filter: shadowFilter }}
            />
            <Motion.img
              src={multiCutout}
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{ opacity: opMulti, position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', filter: shadowFilter }}
            />
          </div>
        </Motion.div>
      </Motion.div>
    </Motion.div>
  );
};
export default Agent;
