'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  IconVerifiedSeal,
  IconSafetyShield,
  IconMesh
} from '../../components/icons/BespokeIcons';
import { EVENTS_FIXTURE } from '../../lib/fixtures';

const LiveProtestHub3D = dynamic(
  () => import('../../components/3d/LiveProtestHub3D').then((m) => m.LiveProtestHub3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col items-center justify-center gap-3 text-[#65636D]">
        <div className="w-8 h-8 rounded-full border-2 border-[#1F9D6B] border-t-transparent animate-spin" />
        <span className="text-[13px] font-mono-numbers">Initializing 3D Assembly Cartography...</span>
      </div>
    )
  }
);

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
          {/* Live 3D Assembly Cartography & Safe Corridors Card */}
          <LiveProtestHub3D />

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
