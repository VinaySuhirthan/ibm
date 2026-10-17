'use client';

import React, { useState } from 'react';
import { IconSafetyShield } from '../../../components/icons/BespokeIcons';
import { INITIAL_ALERTS_FIXTURE } from '../../../lib/fixtures';

export default function AdminBroadcastPage() {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetSector, setTargetSector] = useState('Central Assembly Sector');
  const [severity, setSeverity] = useState<'safe' | 'watch' | 'critical'>('watch');
  const [dispatchedAlerts, setDispatchedAlerts] = useState(INITIAL_ALERTS_FIXTURE);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    const newAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      title: broadcastTitle.trim(),
      location: targetSector,
      severity: severity,
      densityValue: severity === 'critical' ? 4.8 : 2.6,
      recommendedAction: broadcastMessage.trim(),
      acknowledged: false
    };

    setDispatchedAlerts(prev => [newAlert, ...prev]);
    setSuccessBanner(`Emergency broadcast transmitted to ${targetSector} over Push & BLE Mesh.`);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <div className="flex flex-col gap-6 w-full font-ui text-[#ECE8E1]">
      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(236,232,225,0.08)] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label text-[#FF4B1F] font-semibold uppercase tracking-wider text-[11px]">
              Multi-Channel Emergency Beacon
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(255,75,31,0.12)] text-[#FF4B1F] text-[11px] font-semibold">
              DISPATCH DESK
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#ECE8E1] mt-1">
            Emergency Alerts & Organizer Broadcast
          </h1>
          <p className="text-body text-[#8E8D98] mt-1">
            Transmit immediate crowd dispersal instructions, safety advisories, and triage directions over Push, SMS, and peer-to-peer Mesh.
          </p>
        </div>

        {successBanner && (
          <div className="px-4 py-2 rounded-civic-sm bg-[rgba(31,157,107,0.15)] border border-[#1F9D6B] text-[#1F9D6B] text-[13px] font-semibold animate-stamp">
            {successBanner}
          </div>
        )}
      </div>

      {/* Main Grid: Composer (7 cols) & Incoming SOS / Dispatched History (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Broadcast Composer (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <form
            onSubmit={handleDispatch}
            className="p-6 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(236,232,225,0.08)]">
              <span className="text-label font-semibold text-[#ECE8E1]">
                Compose Emergency Broadcast
              </span>
              <span className="text-[12px] text-[#8E8D98]">Instant Dispatch</span>
            </div>

            {/* Target Sector & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-[#8E8D98] block mb-1">Target Sector</label>
                <select
                  value={targetSector}
                  onChange={(e) => setTargetSector(e.target.value)}
                  className="w-full px-3 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[13px] text-[#ECE8E1] focus:outline-none focus:border-[#FF4B1F]"
                >
                  <option value="Central Assembly Sector">Central Assembly Sector</option>
                  <option value="North Pier Corridor">North Pier Corridor</option>
                  <option value="West Promenade Egress">West Promenade Egress</option>
                  <option value="ALL SECTORS (City-Wide Broadcast)">ALL SECTORS (City-Wide)</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] text-[#8E8D98] block mb-1">Severity Protocol</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as 'safe' | 'watch' | 'critical')}
                  className="w-full px-3 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[13px] text-[#ECE8E1] focus:outline-none focus:border-[#FF4B1F]"
                >
                  <option value="safe">Informational Advisory (Safe / Normal)</option>
                  <option value="watch">Crowd Watch / Density Warning (Amber)</option>
                  <option value="critical">Critical Evacuation Order (Red)</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[12px] text-[#8E8D98] block mb-1">Broadcast Headline</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. North Gate bottleneck reached. Engage West Pier ramp immediately."
                className="w-full px-3.5 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[14px] text-[#ECE8E1] placeholder-[#8E8D98] focus:outline-none focus:border-[#FF4B1F]"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="text-[12px] text-[#8E8D98] block mb-1">Instructional Instructions</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter clear, non-panicking directions for citizens and sector marshals..."
                rows={4}
                className="w-full px-3.5 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[13px] text-[#ECE8E1] placeholder-[#8E8D98] focus:outline-none focus:border-[#FF4B1F]"
              />
            </div>

            {/* Channels Checklist */}
            <div className="p-3 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex flex-wrap gap-4 text-[12px] text-[#8E8D98]">
              <span className="text-[#ECE8E1] font-semibold">Channels:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#FF4B1F]" />
                <span>Citizen Push Notifications</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#FF4B1F]" />
                <span>BLE Peer-to-Peer Mesh</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#FF4B1F]" />
                <span>Marshal PA System</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
                className="px-6 py-2.5 rounded-civic-sm bg-[#FF4B1F] hover:bg-[#FF4B1F]/90 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-soft"
              >
                Transmit Official Broadcast →
              </button>
            </div>
          </form>
        </div>

        {/* Incoming SOS & Active Broadcasts (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Incoming SOS Field Beacons */}
          <div className="p-5 bg-[#16161F] rounded-civic-lg border border-[rgba(255,75,31,0.2)] shadow-soft flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(236,232,225,0.08)]">
              <div className="flex items-center gap-2">
                <IconSafetyShield size={16} className="text-[#FF4B1F]" />
                <span className="text-label font-semibold text-[#ECE8E1]">
                  Incoming Field SOS Beacons
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#FF4B1F] animate-ping" />
            </div>

            <div className="p-3 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] text-[#8E8D98]">
                <span className="font-semibold text-[#FF4B1F]">SOS-CITIZEN-104</span>
                <span>2m ago</span>
              </div>
              <p className="text-[13px] text-[#ECE8E1]">
                Elderly attendee experiencing heat exhaustion near Pier 4 water point.
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#8E8D98] pt-1">
                <span>Field Triage Alpha: DISPATCHED</span>
                <span className="text-[#1F9D6B]">En Route ✓</span>
              </div>
            </div>
          </div>

          {/* Broadcasts History */}
          <div className="p-5 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(236,232,225,0.08)]">
              <span className="text-label font-semibold text-[#ECE8E1]">
                Active Dispatched Advisories ({dispatchedAlerts.length})
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {dispatchedAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#8E8D98]">
                    <span className="font-semibold text-[#ECE8E1]">{alt.title}</span>
                    <span>{alt.timestamp}</span>
                  </div>
                  <p className="text-[12px] text-[#8E8D98]">{alt.recommendedAction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
