'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VerifiedBadgeProps {
  code?: string;
  date?: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function VerifiedBadge({
  code = 'CIVIC-VERIFIED-2026',
  date = '2026-10-14',
  size = 'md',
  interactive = true
}: VerifiedBadgeProps) {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={interactive ? { scale: 1.03, y: -1 } : undefined}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className={`relative inline-flex items-center gap-2.5 px-3 py-1.5 border border-[#3DDC97]/40 bg-[#3DDC97]/10 backdrop-blur-sm select-none ${
        isLg ? 'p-4 border-2' : isSm ? 'px-2 py-0.5 text-xs' : ''
      }`}
      style={{
        boxShadow: '0 0 20px rgba(61, 220, 151, 0.12), inset 0 0 12px rgba(61, 220, 151, 0.08)'
      }}
    >
      {/* Holographic moving sheen line */}
      <div className="absolute inset-0 pointer-events-none opacity-20 holo-sheen" />

      {/* Guilloche Seal Stamp Icon */}
      <div className="relative flex items-center justify-center text-[#3DDC97]">
        <svg
          width={isLg ? 28 : isSm ? 14 : 20}
          height={isLg ? 28 : isSm ? 14 : 20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Outer Serrated Stamp Border */}
          <path d="M12 2l2.6 2.1 3.3-.4 1.5 3 2.9 1.6-.7 3.3 1.7 2.8-2 2.6.4 3.3-3.2 1-1.6 2.9-3.1-.9-2.7 2-2.7-2-3.1.9-1.6-2.9-3.2-1 .4-3.3-2-2.6 1.7-2.8-.7-3.3 2.9-1.6 1.5-3 3.3.4L12 2z" />
          <circle cx="12" cy="12" r="5" strokeWidth="1" strokeDasharray="1.5 1.5" />
          <polyline points="9 12 11.2 14.2 15 10" strokeWidth="1.8" />
        </svg>
      </div>

      {/* Authority Seal Microcopy */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#3DDC97] font-semibold">
            Civic Verified
          </span>
          <span className="w-1 h-1 rounded-full bg-[#3DDC97] animate-ping" />
        </div>
        {!isSm && (
          <span className="font-mono text-[10px] text-[#ECE8DF]/70 tabular-nums">
            {code}
          </span>
        )}
      </div>

      {/* Subtle Corner Ticks */}
      <span className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 border-t border-l border-[#3DDC97]" />
      <span className="absolute -bottom-[3px] -right-[3px] w-1.5 h-1.5 border-b border-r border-[#3DDC97]" />
    </motion.div>
  );
}
