'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HoldToConfirmButtonProps {
  onConfirm: () => void;
  holdDurationMs?: number;
  label?: string;
  confirmingLabel?: string;
  completedLabel?: string;
}

export function HoldToConfirmButton({
  onConfirm,
  holdDurationMs = 3000,
  label = 'HOLD FOR 3 SECONDS TO TRIGGER SOS',
  confirmingLabel = 'TRANSMITTING BEACON...',
  completedLabel = 'SOS DISPATCHED TO NDRF & POLICE'
}: HoldToConfirmButtonProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startHold = () => {
    if (isConfirmed) return;
    setIsHolding(true);
    startTimeRef.current = performance.now();

    const loop = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(1, elapsed / holdDurationMs);
      setProgress(pct);

      if (pct >= 1) {
        setIsConfirmed(true);
        setIsHolding(false);
        onConfirm();
      } else {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const cancelHold = () => {
    if (isConfirmed) return;
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="relative group cursor-pointer"
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
      >
        {/* SVG Progress Ring */}
        <svg width="120" height="120" className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="#1C1C26"
            strokeWidth="4"
          />
          {/* Animated active hold progress */}
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="#FF4B1F"
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75 ease-linear"
          />
        </svg>

        {/* Central Core SOS Button */}
        <div
          className={`absolute inset-3 rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${
            isConfirmed
              ? 'bg-[#FF4B1F] border-[#FF4B1F] text-white shadow-[0_0_35px_rgba(255,75,31,0.6)]'
              : isHolding
              ? 'bg-[#FF4B1F]/20 border-[#FF4B1F] text-[#FF4B1F] scale-95'
              : 'bg-[#14141C] border-[#FF4B1F]/50 hover:border-[#FF4B1F] text-[#ECE8DF]'
          }`}
        >
          <span className="font-mono text-xl font-black tracking-widest text-[#FF4B1F]">
            {isConfirmed ? 'DISPATCHED' : 'SOS'}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-mute mt-0.5">
            {isConfirmed ? 'ACTIVE' : isHolding ? `${Math.round((1 - progress) * 3)}s` : 'HOLD'}
          </span>
        </div>
      </div>

      {/* Instructional Status Line */}
      <div className="mt-4 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-paper/80 font-medium">
          {isConfirmed ? completedLabel : isHolding ? confirmingLabel : label}
        </p>
        <p className="font-mono text-[10px] text-mute mt-1">
          Direct emergency telemetry relay to nearest Police & Field Medical units
        </p>
      </div>
    </div>
  );
}
