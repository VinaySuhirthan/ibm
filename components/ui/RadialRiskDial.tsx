'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RiskLevel } from '../../lib/types';

interface RadialRiskDialProps {
  score: number; // 0 to 100
  riskLevel: RiskLevel;
  size?: number;
  showTicks?: boolean;
}

export function RadialRiskDial({
  score = 28,
  riskLevel = 'safe',
  size = 180,
  showTicks = true
}: RadialRiskDialProps) {
  // Angle maps 0-100 to -125deg to +125deg (250 degree sweep)
  const clampedScore = Math.max(0, Math.min(100, score));
  const angle = -125 + (clampedScore / 100) * 250;

  const color =
    riskLevel === 'critical'
      ? '#FF4B1F'
      : riskLevel === 'watch'
      ? '#E5A93C'
      : '#ECE8DF';

  const riskLabel =
    riskLevel === 'critical'
      ? 'CRITICAL COMPRESSION'
      : riskLevel === 'watch'
      ? 'WATCH / MODERATE SURGE'
      : 'SAFE / NOMINAL LAMINAR';

  return (
    <div className="flex flex-col items-center justify-center select-none" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size * 0.78 }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 170"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="riskArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B8A93" stopOpacity="0.3" />
              <stop offset="45%" stopColor="#E5A93C" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FF4B1F" stopOpacity="0.95" />
            </linearGradient>
            <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={color} floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 32 145 A 78 78 0 1 1 168 145"
            fill="none"
            stroke="rgba(236, 232, 223, 0.08)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Active Gradient Arc */}
          <path
            d="M 32 145 A 78 78 0 1 1 168 145"
            fill="none"
            stroke="url(#riskArcGrad)"
            strokeWidth="3.5"
            strokeDasharray="340"
            strokeDashoffset={340 - (clampedScore / 100) * 340}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />

          {/* Perimeter Calibrated Ticks */}
          {showTicks &&
            Array.from({ length: 21 }).map((_, i) => {
              const tickAngle = -125 + (i / 20) * 250;
              const rad = (tickAngle - 90) * (Math.PI / 180);
              const isMajor = i % 5 === 0;
              const r1 = 88;
              const r2 = isMajor ? 97 : 92;
              const x1 = 100 + r1 * Math.cos(rad);
              const y1 = 100 + r1 * Math.sin(rad);
              const x2 = 100 + r2 * Math.cos(rad);
              const y2 = 100 + r2 * Math.sin(rad);

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? 'rgba(236, 232, 223, 0.4)' : 'rgba(236, 232, 223, 0.12)'}
                  strokeWidth={isMajor ? 1.5 : 1}
                />
              );
            })}

          {/* Pivoted Needle with spring physics overshoot */}
          <g transform="translate(100, 100)">
            <motion.g
              animate={{ rotate: angle }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 18, // calibrated slight overshoot
                mass: 0.8
              }}
            >
              {/* Needle Body */}
              <line
                x1="0"
                y1="6"
                x2="0"
                y2="-74"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#needleGlow)"
              />
              {/* Counterweight */}
              <circle cx="0" cy="0" r="5" fill="#14141C" stroke={color} strokeWidth="2" />
              <circle cx="0" cy="0" r="1.5" fill={color} />
            </motion.g>
          </g>

          {/* Critical Threshold Warning Marker at 70% */}
          <line
            x1="140"
            y1="40"
            x2="148"
            y2="34"
            stroke="#FF4B1F"
            strokeWidth="1.5"
          />
        </svg>

        {/* Big Tabular Numeric Readout */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-center">
          <div className="font-mono text-3xl font-bold tracking-tight tabular-nums" style={{ color }}>
            {clampedScore}
            <span className="text-xs font-normal text-mute opacity-60 ml-0.5">/100</span>
          </div>
        </div>
      </div>

      {/* Status Label Banner */}
      <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 border border-hairline bg-graphite/40">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-paper/80">
          {riskLabel}
        </span>
      </div>
    </div>
  );
}
