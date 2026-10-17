'use client';

import React, { useState, useRef } from 'react';
import {
  IconSafetyShield,
  IconVerifiedSeal
} from '../../../components/icons/BespokeIcons';
import { TRIAGE_LOCATIONS_FIXTURE } from '../../../lib/fixtures';

export default function PublicSafetyTab() {
  const [sosProgress, setSosProgress] = useState(0);
  const [sosTriggered, setSosTriggered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSosPress = () => {
    if (sosTriggered) return;
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 5;
      setSosProgress(p);
      if (p >= 100) {
        clearInterval(timerRef.current!);
        setSosTriggered(true);
        setSosProgress(100);
      }
    }, 100); // 2.0 seconds total (20 steps of 5% each 100ms)
  };

  const cancelSosPress = () => {
    if (sosTriggered) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSosProgress(0);
  };

  const resetEmergency = () => {
    setSosTriggered(false);
    setSosProgress(0);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(20,20,28,0.08)] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label text-[#FF4B1F] font-semibold uppercase tracking-wider text-[11px]">
              Field Safety & Rapid Medical Dispatch
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(255,75,31,0.1)] text-[#FF4B1F] text-[11px] font-semibold">
              CRITICAL LIFE SAFETY
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#14141C] mt-1">
            Safety Center & Emergency SOS
          </h1>
          <p className="text-body text-[#65636D] mt-1">
            Nearest field triage tents, unobstructed evacuation routes, and instant distress beacon dispatch.
          </p>
        </div>
      </div>

      {/* Hero SOS Action Card */}
      <div className={`p-6 sm:p-8 rounded-civic-lg border transition-all duration-300 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6 ${sosTriggered
          ? 'bg-[#FF4B1F] text-white border-[#FF4B1F]'
          : 'bg-[#FFFFFF] text-[#14141C] border-[rgba(20,20,28,0.12)]'
        }`}>
        <div className="flex flex-col max-w-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${sosTriggered ? 'bg-white animate-ping' : 'bg-[#FF4B1F] animate-live-dot'}`} />
            <span className={`text-[12px] font-bold uppercase tracking-wider ${sosTriggered ? 'text-white' : 'text-[#FF4B1F]'}`}>
              {sosTriggered ? 'EMERGENCY BEACON ACTIVE' : 'PRESS AND HOLD TO DISPATCH'}
            </span>
          </div>

          <h2 className={`font-display text-2xl sm:text-3xl ${sosTriggered ? 'text-white' : 'text-[#14141C]'}`}>
            {sosTriggered ? 'Medical & Sector Marshals Dispatched' : 'Need Immediate Assistance?'}
          </h2>

          <p className={`text-[14px] mt-2 leading-normal ${sosTriggered ? 'text-white/90' : 'text-[#65636D]'}`}>
            {sosTriggered
              ? 'Your GPS and peer mesh vector have been transmitted to Field Triage Alpha. Paramedics are en route. Remain calm and stay in your position if safe.'
              : 'Hold the button below for 2 seconds to broadcast an urgent medical or safety distress beacon to all nearby triage stations and sector marshals.'}
          </p>

          {sosTriggered && (
            <button
              onClick={resetEmergency}
              className="mt-4 px-4 py-2 rounded-civic-sm bg-white text-[#FF4B1F] text-[13px] font-bold hover:bg-white/90 self-start cursor-pointer shadow-soft"
            >
              Cancel / False Alarm
            </button>
          )}
        </div>

        {/* Circular Hold-to-Confirm Trigger Ring */}
        {!sosTriggered && (
          <div className="flex flex-col items-center gap-3">
            <button
              onMouseDown={startSosPress}
              onMouseUp={cancelSosPress}
              onTouchStart={startSosPress}
              onTouchEnd={cancelSosPress}
              className="relative w-32 h-32 rounded-full bg-[#FF4B1F] text-white flex flex-col items-center justify-center cursor-pointer select-none shadow-elevation hover:scale-102 active:scale-98 transition-transform"
            >
              {/* Animated Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="6"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="6"
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * sosProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>

              <IconSafetyShield size={32} />
              <span className="font-display text-lg font-bold mt-1">HOLD SOS</span>
              <span className="text-[10px] font-mono-numbers opacity-80">{sosProgress}%</span>
            </button>
            <span className="text-[12px] text-[#65636D]">Press & hold for 2s</span>
          </div>
        )}
      </div>

      {/* Main Grid: Nearest Triage & Evacuation Corridors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Nearest Triage Facilities (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,20,28,0.08)]">
            <span className="text-label font-semibold text-[#14141C]">
              Nearest Medical Triage Posts
            </span>
            <span className="text-[12px] text-[#1F9D6B] font-medium">Field Aid Active</span>
          </div>

          <div className="flex flex-col gap-3">
            {TRIAGE_LOCATIONS_FIXTURE.map((triage) => (
              <div
                key={triage.id}
                className="p-5 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg text-[#14141C] leading-snug">
                      {triage.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      triage.currentCapacity === 'Available'
                        ? 'bg-[rgba(31,157,107,0.1)] text-[#1F9D6B]'
                        : 'bg-[rgba(217,119,6,0.1)] text-[#D97706]'
                    }`}>
                      {triage.currentCapacity.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#65636D] mt-1 leading-normal">
                    Facility Type: {triage.type} • Contact: {triage.contactRef}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[12px] text-[#14141C]">
                    <span>🚶 {triage.estMinutesWalk} min walk ({triage.distanceMeters}m)</span>
                    <span>•</span>
                    <span>📍 Ref: {triage.contactRef}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <span className="text-[12px] font-mono-numbers text-[#65636D]">
                    Status: {triage.currentCapacity}
                  </span>
                  <a
                    href={`#triage-${triage.id}`}
                    className="px-3 py-1.5 rounded-civic-sm bg-[#1F9D6B] text-white text-[12px] font-semibold hover:bg-[#1F9D6B]/90 transition-colors whitespace-nowrap shadow-soft"
                  >
                    Navigate Route →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Designated Evacuation Corridors & Constitutional Rights (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Evacuation Corridors */}
          <div className="p-5 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,20,28,0.08)]">
              <span className="text-label font-semibold text-[#14141C]">
                Designated Evacuation Corridors
              </span>
              <span className="text-[12px] text-[#1F9D6B]">Real-time Status</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="p-3 bg-[#F4F1EA] rounded-civic-sm border border-[rgba(20,20,28,0.04)] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-[#14141C]">North Pier Ramp (Primary)</div>
                  <div className="text-[11px] text-[#65636D]">Width: 12 meters • 0 Obstructions</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[rgba(31,157,107,0.1)] text-[#1F9D6B] text-[11px] font-bold">
                  CLEAR ✓
                </span>
              </div>

              <div className="p-3 bg-[#F4F1EA] rounded-civic-sm border border-[rgba(20,20,28,0.04)] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-[#14141C]">West Promenade Egress</div>
                  <div className="text-[11px] text-[#65636D]">Width: 8 meters • Steady flow</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[rgba(31,157,107,0.1)] text-[#1F9D6B] text-[11px] font-bold">
                  CLEAR ✓
                </span>
              </div>

              <div className="p-3 bg-[#F4F1EA] rounded-civic-sm border border-[rgba(20,20,28,0.04)] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-[#14141C]">South Pier Underpass</div>
                  <div className="text-[11px] text-[#65636D]">Width: 6 meters • Heavy congestion</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[rgba(217,119,6,0.1)] text-[#D97706] text-[11px] font-bold">
                  SLOW ⚠️
                </span>
              </div>
            </div>
          </div>

          {/* Constitutional Rights Card */}
          <div className="p-5 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-2.5 text-[13px] text-[#65636D]">
            <div className="text-label font-semibold text-[#14141C] flex items-center gap-1.5">
              <IconVerifiedSeal size={16} className="text-[#1F9D6B]" />
              <span>Article 19: Peaceful Assembly Protections</span>
            </div>
            <p className="leading-normal">
              Citizens possess the fundamental constitutional right to assemble peacefully without arms. Police may regulate flow to prevent stampedes, but cannot confiscate recording devices or block access to medical aid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
