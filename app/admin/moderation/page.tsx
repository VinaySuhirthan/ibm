'use client';

import React, { useState } from 'react';
import { AI_INTELLIGENCE_FIXTURE } from '../../../lib/fixtures';

export default function AdminModerationPage() {
  const [flags, setFlags] = useState(AI_INTELLIGENCE_FIXTURE.misinformationFlags);
  const duplicates = AI_INTELLIGENCE_FIXTURE.duplicateDetections;
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleResolveFlag = (id: string, action: 'debunk' | 'dismiss') => {
    setFlags(prev => prev.filter(f => f.id !== id));
    setActionNotice(
      action === 'debunk'
        ? `Fact-check truth bulletin dispatched for item #${id}.`
        : `Flag #${id} dismissed.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 w-full font-ui text-[#ECE8E1]">
      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(236,232,225,0.08)] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label text-[#22D3EE] font-semibold uppercase tracking-wider text-[11px]">
              AI Verification & Conflict Detection
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(34,211,238,0.12)] text-[#22D3EE] text-[11px] font-semibold">
              SENTINEL ONLINE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#ECE8E1] mt-1">
            Content Moderation & Duplicate Sentinel
          </h1>
          <p className="text-body text-[#8E8D98] mt-1">
            Review viral stampede rumors, debunk false choke claims, and detect scheduling route conflicts between simultaneous assemblies.
          </p>
        </div>

        {actionNotice && (
          <div className="px-4 py-2 rounded-civic-sm bg-[rgba(34,211,238,0.15)] border border-[#22D3EE] text-[#22D3EE] text-[13px] font-semibold">
            {actionNotice}
          </div>
        )}
      </div>

      {/* Main Grid: Misinformation Flags (7 cols) & Route Conflict Sentinel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Misinformation Flags (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(236,232,225,0.08)]">
            <span className="text-label font-semibold text-[#ECE8E1]">
              Flagged Rumors & Misinformation Claims ({flags.length})
            </span>
            <span className="text-[12px] text-[#8E8D98]">AI Confidence &gt; 85%</span>
          </div>

          {flags.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {flags.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-mono-numbers text-[#8E8D98]">{item.id}</span>
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      item.verificationStatus === 'Debunked'
                        ? 'bg-[rgba(255,75,31,0.15)] text-[#FF4B1F]'
                        : 'bg-[rgba(31,157,107,0.15)] text-[#1F9D6B]'
                    }`}>
                      {item.verificationStatus.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-[15px] font-medium text-[#ECE8E1] leading-snug">
                    "{item.claim}"
                  </h3>

                  <div className="p-3 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex items-center justify-between text-[12px] text-[#8E8D98]">
                    <span>Source: {item.source}</span>
                    <span>Reach: ~{item.reachEstimate.toLocaleString('en-US')} accounts</span>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[rgba(236,232,225,0.06)]">
                    <button
                      onClick={() => handleResolveFlag(item.id, 'dismiss')}
                      className="px-3 py-1.5 rounded-civic-sm bg-[#1C1C28] text-[12px] text-[#8E8D98] hover:text-[#ECE8E1] cursor-pointer"
                    >
                      Dismiss Flag
                    </button>
                    <button
                      onClick={() => handleResolveFlag(item.id, 'debunk')}
                      className="px-3.5 py-1.5 rounded-civic-sm bg-[#FF4B1F] text-[12px] text-white font-semibold hover:bg-[#FF4B1F]/90 cursor-pointer shadow-soft"
                    >
                      Issue Public Debunk Alert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] text-center text-[#8E8D98]">
              No active misinformation alerts in the system.
            </div>
          )}
        </div>

        {/* Duplicate Route Conflict Sentinel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(236,232,225,0.08)]">
            <span className="text-label font-semibold text-[#ECE8E1]">
              Route Conflict Sentinel
            </span>
            <span className="text-[12px] text-[#D97706]">Spatio-Temporal Overlap</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {duplicates.map((dup, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#16161F] rounded-civic-lg border border-[rgba(217,119,6,0.25)] shadow-soft flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#D97706] uppercase">
                    COLLISION RISK: {(dup.overlapScore * 100).toFixed(0)}%
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                </div>

                <h4 className="font-display text-lg text-[#ECE8E1]">
                  {dup.eventTitle}
                </h4>

                <p className="text-[13px] text-[#8E8D98] leading-normal">
                  {dup.conflictLocation}
                </p>

                <div className="pt-2 border-t border-[rgba(236,232,225,0.06)] flex items-center justify-between">
                  <span className="text-[12px] text-[#8E8D98]">AI Recommendation: Shift 90 mins</span>
                  <button className="px-3 py-1.5 rounded-civic-sm bg-[#1C1C28] text-[12px] text-[#ECE8E1] hover:bg-[#232332] cursor-pointer">
                    Adjust Stagger Route
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
