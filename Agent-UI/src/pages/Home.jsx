import React, { useRef, useEffect } from 'react';
import { useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Agent from '../Agent';
import SectionHero from '../SectionHero';
import SectionProblem from '../SectionProblem';
import SectionFeatures from '../SectionFeatures';
import SectionCTA from '../SectionCTA';
import AnimatedBackground from '../AnimatedBackground';
import '../index.css';

const CursorGlow = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    let rafId = null;
    const latest = { x: 0, y: 0 };

    const handleMove = (e) => {
      latest.x = e.clientX;
      latest.y = e.clientY;

      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        if (glowRef.current) {
          glowRef.current.style.transform = `translate(calc(${latest.x}px - 50%), calc(${latest.y}px - 50%))`;
        }
      });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" />;
};

export default function Home() {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
    } catch {
      // Ignore; route guard will also fail on next load.
    }
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-container" ref={containerRef}>
      <CursorGlow />
      <AnimatedBackground scrollYProgress={scrollYProgress} />

      <button type="button" className="logout-btn" onClick={handleLogout}>
        Log out
      </button>

      {/* Central Agent Character Orchestrated by Scroll Progress */}
      <Agent scrollYProgress={scrollYProgress} />

      {/* Sections */}
      <SectionHero />
      <SectionProblem />
      <SectionFeatures />
      <SectionCTA />
    </div>
  );
}

