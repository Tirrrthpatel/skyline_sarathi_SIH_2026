import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export default function CursorTracker() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: -100, y: -100 });

  const springConfig = { damping: 28, stiffness: 260, mass: 0.5 };
  const smoothX = useSpring(-100, springConfig);
  const smoothY = useSpring(-100, springConfig);

  useEffect(() => {
    // Only enable on pointer-supported devices (non-touch)
    if (window.matchMedia('(pointer: fine)').matches) {
      setIsVisible(true);
    }

    const handleMouseMove = (e) => {
      setCoords({ x: e.clientX, y: e.clientY });
      smoothX.set(e.clientX);
      smoothY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('[data-interactive="true"]')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [smoothX, smoothY]);

  if (!isVisible) return null;

  // Calculate synthetic cockpit telemetry based on cursor
  const syntheticAlt = Math.round(24000 + (coords.y / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 12000);
  const syntheticHdg = Math.round((coords.x / (typeof window !== 'undefined' ? window.innerWidth : 1000)) * 360);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer aviation crosshair ring */}
      <motion.div
        className="fixed top-0 left-0 flex items-center justify-center border border-carbon-primary/40 rounded-full"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 56 : 34,
          height: isHovered ? 56 : 34,
          backgroundColor: isHovered ? 'rgba(29, 36, 46, 0.08)' : 'transparent',
          borderColor: isHovered ? 'rgba(29, 36, 46, 0.8)' : 'rgba(29, 36, 46, 0.35)',
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease'
        }}
      >
        {/* Center reticle dot */}
        <div className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-carbon-primary scale-125' : 'bg-carbon-primary/70'} transition-transform duration-150`} />

        {/* Small cardinal tick marks */}
        <div className="absolute -top-1 w-0.5 h-1.5 bg-carbon-primary/50" />
        <div className="absolute -bottom-1 w-0.5 h-1.5 bg-carbon-primary/50" />
        <div className="absolute -left-1 h-0.5 w-1.5 bg-carbon-primary/50" />
        <div className="absolute -right-1 h-0.5 w-1.5 bg-carbon-primary/50" />
      </motion.div>

      {/* Floating telemetry label next to reticle */}
      <motion.div
        className="fixed top-0 left-0 hidden md:flex items-center gap-2 px-2 py-0.5 rounded bg-carbon-primary/80 backdrop-blur-sm text-aircraft-white text-[10px] font-mono-avionics shadow-sm"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '24px',
          translateY: '18px',
          opacity: isHovered ? 0.95 : 0.4,
          transition: 'opacity 0.2s ease'
        }}
      >
        <span>HDG {String(syntheticHdg).padStart(3, '0')}°</span>
        <span className="text-metallic-gray">|</span>
        <span>ALT {syntheticAlt.toLocaleString()}FT</span>
      </motion.div>
    </div>
  );
}
