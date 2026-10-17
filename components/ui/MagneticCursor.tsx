'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function MagneticCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only engage on fine pointers (desktop mouse)
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.getAttribute('role') === 'button')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] top-0 left-0 hidden md:block mix-blend-difference"
      animate={{
        x: pos.x - (isHovering ? 18 : 12),
        y: pos.y - (isHovering ? 18 : 12),
        scale: isHovering ? 1.25 : 1
      }}
      transition={{
        type: 'spring',
        stiffness: 700,
        damping: 38,
        mass: 0.15
      }}
    >
      <div
        className={`rounded-full flex items-center justify-center transition-all duration-150 ${
          isHovering
            ? 'w-9 h-9 border-2 border-white bg-white/20'
            : 'w-6 h-6 border border-white/60 bg-white/10'
        }`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
    </motion.div>
  );
}
