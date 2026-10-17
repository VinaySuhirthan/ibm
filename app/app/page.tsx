'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconVerifiedSeal,
  IconSafetyShield,
  IconMesh
} from '../../components/icons/BespokeIcons';
import { EVENTS_FIXTURE } from '../../lib/fixtures';

export default function PublicHomePage() {
  const [offlineMeshActive, setOfflineMeshActive] = useState(false);
  const events = EVENTS_FIXTURE.slice(0, 3);

  return (
    <div className="flex flex-col gap-6 w-full font-ui text-[#14141C]">
      {/* Top District Telemetry Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-civic-lg bg-[#FFFFFF] border border-[rgba(20,20,28,0.08)] shadow-soft">
        <div className="flex items-center gap-3.5">
          <span className="w-3 h-3 rounded-full bg-[#1F9D6B] animate-live-dot shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-[#14141C]">
                District: Central Assembly Sector
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[rgba(31,157,107,0.1)] text-[#1F9D6B] text-[11px] font-semibold">
                NORMAL FLOW
              </span>
            </div>
            <p className="text-[13px] text-[#65636D] mt-0.5 leading-normal">
              Cellular Gateway: Operational • Field Medical Tents: 4 Active • Evacuation Corridors: 3 Open
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/safety"
            className="px-4 py-2 rounded-civic-sm bg-[#FF4B1F] text-white text-[13px] font-semibold hover:bg-[#FF4B1F]/90 transition-colors flex items-center gap-2 shadow-soft whitespace-nowrap"
          >
            <IconSafetyShield size={16} />
            <span>Emergency SOS (Hold 2s)</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Protest Hub Cartography (8 cols) & Sidebar Feeds (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Protest Hub Map & Nearby Verified Events (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Protest Hub Radar & Safe Corridors Card */}
          <div className="p-5 sm:p-6 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[rgba(20,20,28,0.08)]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1F9D6B]">
                  Real-Time Assembly Cartography
                </span>
                <h2 className="font-display text-2xl font-semibold text-[#14141C] mt-0.5 tracking-tight leading-snug">
                  Protest Hub & Safe Corridors
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-mono-numbers text-[#65636D]">
                <span className="w-2 h-2 rounded-full bg-[#1F9D6B]" />
                <span>~1,420 people in sector</span>
              </div>
            </div>

            {/* Stylized Visual Cartography Map */}
            <div className="relative w-full h-[280px] sm:h-[320px] bg-[#EAE6DC] rounded-civic overflow-hidden border border-[rgba(20,20,28,0.06)] flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice">
                {/* Street grid representation */}
                <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(20,20,28,0.08)" strokeWidth="8" />
                <line x1="0" y1="220" x2="800" y2="220" stroke="rgba(20,20,28,0.08)" strokeWidth="12" />
                <line x1="200" y1="0" x2="200" y2="320" stroke="rgba(20,20,28,0.08)" strokeWidth="10" />
                <line x1="550" y1="0" x2="550" y2="320" stroke="rgba(20,20,28,0.08)" strokeWidth="8" />

                {/* Safe Assembly Corridor Ribbon */}
                <path
                  d="M 60 220 Q 300 220 420 160 T 740 100"
                  fill="none"
                  stroke="#1F9D6B"
                  strokeWidth="8"
                  strokeDasharray="8 6"
                />

                {/* Crowd Density Heat Cluster */}
                <circle cx="420" cy="160" r="55" fill="rgba(217, 119, 6, 0.25)" />
                <circle cx="420" cy="160" r="28" fill="rgba(217, 119, 6, 0.45)" />

                {/* You Marker */}
                <g transform="translate(200, 220)">
                  <circle cx="0" cy="0" r="12" fill="rgba(31,157,107,0.3)" className="animate-ping" />
                  <circle cx="0" cy="0" r="7" fill="#1F9D6B" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text x="14" y="5" fill="#14141C" fontSize="13" fontWeight="600" fontFamily="Geist">
                    You (North Corridor)
                  </text>
                </g>

                {/* Water Point 1 */}
                <g transform="translate(320, 190)">
                  <circle cx="0" cy="0" r="6" fill="#2E1F73" />
                  <text x="10" y="4" fill="#2E1F73" fontSize="12" fontWeight="500">
                    💧 Water Point #1
                  </text>
                </g>

                {/* Field Medical Tent Alpha */}
                <g transform="translate(600, 120)">
                  <circle cx="0" cy="0" r="7" fill="#FF4B1F" />
                  <text x="10" y="4" fill="#FF4B1F" fontSize="12" fontWeight="600">
                    ✚ Triage Tent Alpha (140m)
                  </text>
                </g>
              </svg>

              {/* In-Map AI Recommendation Pill */}
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-[#FFFFFF]/95 backdrop-blur-sm px-3.5 py-2 rounded-civic-sm border border-[rgba(20,20,28,0.1)] shadow-soft text-[13px] text-[#14141C] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1F9D6B] shrink-0" />
                <span className="font-semibold text-[#14141C]">AI Route Advice:</span>
                <span className="text-[#65636D]">West Gate is clear. Use North Ramp to bypass bottleneck.</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-[#F4F1EA] rounded-civic-sm border border-[rgba(20,20,28,0.06)]">
                <span className="text-[12px] text-[#65636D] block">Local Crowd Level</span>
                <span className="text-[14px] font-semibold text-[#1F9D6B]">Safe (Normal Flow)</span>
              </div>
              <div className="p-3 bg-[#F4F1EA] rounded-civic-sm border border-[rgba(20,20,28,0.06)]">
                <span className="text-[12px] text-[#65636D] block">Nearest Medical Aid</span>
                <span className="text-[14px] font-semibold text-[#14141C]">140m (2 min walk)</span>
              </div>
              <div className="p-3 bg-[#F4F1EA] rounded-civic-sm border border-[rgba(20,20,28,0.06)]">
                <span className="text-[12px] text-[#65636D] block">Primary Egress</span>
                <span className="text-[14px] font-semibold text-[#14141C]">North Ramp Open</span>
              </div>
            </div>
          </div>

          {/* Nearby Verified Public Events List */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#14141C] tracking-tight leading-snug">
                  Nearby Verified Gatherings
                </h3>
                <p className="text-[13px] text-[#65636D] mt-0.5 leading-normal">
                  Constitutional assemblies verified by municipal magistrates
                </p>
              </div>
              <Link
                href="/app/events"
                className="text-label text-[#1F9D6B] font-semibold hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col justify-between hover:border-[#1F9D6B] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,20,28,0.06)] mb-3">
                      <span className="text-[11px] font-semibold text-[#65636D] uppercase">
                        {ev.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#1F9D6B] font-semibold">
                        <IconVerifiedSeal size={13} />
                        Verified
                      </span>
                    </div>

                    <h4 className="font-display text-lg font-semibold text-[#14141C] leading-snug">
                      {ev.title}
                    </h4>
                    <p className="text-[13px] text-[#65636D] mt-1 line-clamp-1">
                      {ev.locationName}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-[12px] text-[#14141C]">
                      <span>📅 {ev.date}</span>
                      <span>•</span>
                      <span>⏰ {ev.time}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[rgba(20,20,28,0.06)] flex items-center justify-between">
                    <span className="text-[12px] font-mono-numbers text-[#65636D]">
                      Cap: {ev.expectedAttendance.toLocaleString('en-US')}
                    </span>
                    <Link
                      href="/app/events"
                      className="text-[13px] font-semibold text-[#1F9D6B] hover:underline"
                    >
                      Inspect Route →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Official Announcements & Offline Mesh (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Official Announcements Card */}
          <div className="p-5 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(20,20,28,0.08)]">
              <span className="text-[13px] font-semibold text-[#14141C]">
                Verified Announcements
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[rgba(31,157,107,0.1)] text-[#1F9D6B] font-semibold">
                Official Dispatch
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="p-3 rounded-civic-sm bg-[#F4F1EA] border border-[rgba(20,20,28,0.06)] flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] text-[#65636D]">
                  <span className="font-semibold text-[#14141C]">Sector Marshal Desk</span>
                  <span>14m ago</span>
                </div>
                <p className="text-[13px] text-[#14141C] leading-normal">
                  North Pontoon passage is clear and flowing steadily. Water tanks 4 and 5 replenished.
                </p>
              </div>

              <div className="p-3 rounded-civic-sm bg-[#F4F1EA] border border-[rgba(20,20,28,0.06)] flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] text-[#65636D]">
                  <span className="font-semibold text-[#14141C]">Field Medical Team</span>
                  <span>42m ago</span>
                </div>
                <p className="text-[13px] text-[#14141C] leading-normal">
                  ORS electrolyte packets available free at all 4 medical tents. Stay hydrated.
                </p>
              </div>
            </div>
          </div>

          {/* Offline Mesh Simulator Card */}
          <div className="p-5 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(20,20,28,0.08)]">
              <div className="flex items-center gap-2">
                <IconMesh size={18} className="text-[#2E1F73]" />
                <span className="text-[13px] font-semibold text-[#14141C]">
                  Offline Mesh Relay
                </span>
              </div>
              <span className="text-[11px] text-[#65636D]">BLE 5.2</span>
            </div>

            <p className="text-[13px] text-[#65636D] leading-normal">
              If cellular internet is throttled or shut down, CivicConnect creates a peer-to-peer mesh with nearby citizen phones within 300 meters.
            </p>

            <button
              onClick={() => setOfflineMeshActive(!offlineMeshActive)}
              className={`p-3 rounded-civic text-[13px] font-semibold transition-colors flex items-center justify-between border cursor-pointer ${
                offlineMeshActive
                  ? 'bg-[rgba(46,31,115,0.1)] border-[#2E1F73] text-[#2E1F73]'
                  : 'bg-[#F4F1EA] border-[rgba(20,20,28,0.08)] text-[#14141C] hover:bg-[rgba(20,20,28,0.04)]'
              }`}
            >
              <span>{offlineMeshActive ? 'Mesh Relay: Active (4 peers)' : 'Enable Offline Mesh Mode'}</span>
              <span className="text-[11px] font-bold">{offlineMeshActive ? 'ACTIVE ✓' : 'STANDBY'}</span>
            </button>

            <Link
              href="/app/connect"
              className="text-[13px] text-[#2E1F73] font-semibold hover:underline flex items-center justify-between pt-1"
            >
              <span>Open Connect & Mesh Center</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
