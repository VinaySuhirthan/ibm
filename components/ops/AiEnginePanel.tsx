'use client';

import React from 'react';
import { AI_INTELLIGENCE_FIXTURE } from '../../lib/fixtures';
import { IconDocumentCheck, IconShieldAlert, IconRadar } from '../icons/BespokeIcons';

export function AiEnginePanel() {
  const ai = AI_INTELLIGENCE_FIXTURE;

  return (
    <div className="flex flex-col gap-3 p-3 bg-[#12121A] border-hairline">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-hairline-b">
        <div className="flex items-center gap-1.5">
          <IconRadar size={13} className="text-[#22D3EE]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#22D3EE] font-semibold">
            STAGE 4 // AI INTELLIGENCE ENGINE
          </span>
        </div>
        <span className="font-mono text-[9px] text-[#8B8A93]">LIVE INFERENCE</span>
      </div>

      {/* Crowd Prediction Next 10 Min */}
      <div className="p-2.5 border border-hairline bg-[#14141C]">
        <div className="flex items-center justify-between pb-1 mb-2 border-hairline-b">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#8B8A93]">
            PREDICTIVE TRAJECTORY (+10 MIN HORIZON)
          </span>
          <span className="font-mono text-[9px] text-[#3DDC97]">CONFIDENCE: 89%</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center">
          {ai.predictions.map((p) => {
            const isCrit = p.predictedRisk === 'critical';
            const isWatch = p.predictedRisk === 'watch';
            return (
              <div
                key={p.targetMinute}
                className={`p-1.5 border flex flex-col items-center ${
                  isCrit
                    ? 'border-[#FF4B1F]/60 bg-[#FF4B1F]/10'
                    : isWatch
                    ? 'border-[#E5A93C]/40 bg-[#E5A93C]/5'
                    : 'border-hairline bg-[#0A0A0F]'
                }`}
              >
                <span className="font-mono text-[9px] text-[#8B8A93]">
                  +{p.targetMinute}m
                </span>
                <span className={`font-mono text-xs font-bold tabular-nums mt-0.5 ${
                  isCrit ? 'text-[#FF4B1F]' : isWatch ? 'text-[#E5A93C]' : 'text-[#ECE8DF]'
                }`}>
                  {p.predictedDensityM2}
                </span>
                <span className="font-mono text-[8px] text-[#8B8A93]">ppl/m²</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sentiment Analysis Gauge */}
      <div className="p-2.5 border border-hairline bg-[#14141C]">
        <div className="flex items-center justify-between pb-1 mb-1.5 border-hairline-b">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#8B8A93]">
            ACOUSTIC & SOCIAL SENTIMENT ANALYSIS
          </span>
          <span className={`font-mono text-[9px] font-bold ${
            ai.sentimentLabel === 'High Tension' ? 'text-[#FF4B1F]' : 'text-[#E5A93C]'
          }`}>
            {ai.sentimentLabel}
          </span>
        </div>

        {/* Sentiment Spectrum Bar */}
        <div className="relative w-full h-2 bg-[#0A0A0F] border border-hairline my-2">
          {/* Center Zero Marker */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#8B8A93]" />
          {/* Indicator Dot */}
          <div
            className="absolute top-[-3px] w-2 h-3.5 bg-[#E5A93C] border border-[#0A0A0F]"
            style={{ left: `calc(${50 + ai.sentimentScore * 50}% - 4px)` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[8px] text-[#8B8A93]">
          <span>CALM / ORDERLY</span>
          <span>RESTLESS</span>
          <span>AGITATED</span>
        </div>
      </div>

      {/* Misinformation & Rumor Verification Flags */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between pb-1 border-hairline-b">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#8B8A93]">
            MISINFORMATION / FAKE NEWS DETECTION
          </span>
          <span className="font-mono text-[8px] text-[#8B8A93]">NLP SENTINEL</span>
        </div>

        {ai.misinformationFlags.map((flag) => (
          <div
            key={flag.id}
            className="p-2 border border-hairline bg-[#14141C] flex flex-col gap-1 text-left"
          >
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span className="text-[#8B8A93]">{flag.id} • {flag.source}</span>
              <span className={`px-1.5 py-0.2 border font-semibold ${
                flag.verificationStatus === 'Debunked'
                  ? 'border-[#3DDC97] text-[#3DDC97] bg-[#3DDC97]/10'
                  : 'border-[#E5A93C] text-[#E5A93C] bg-[#E5A93C]/10'
              }`}>
                {flag.verificationStatus.toUpperCase()}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#ECE8DF]">
              &ldquo;{flag.claim}&rdquo;
            </p>
            <span className="font-mono text-[9px] text-[#8B8A93]">
              Reach mitigation: Flagged on {flag.reachEstimate.toLocaleString()} local receivers
            </span>
          </div>
        ))}
      </div>

      {/* Duplicate / Route Conflict Alert */}
      <div className="p-2 border border-[#E5A93C]/40 bg-[#E5A93C]/5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#E5A93C] font-semibold">
          <IconShieldAlert size={12} />
          <span>ROUTE OVERLAP DETECTED (STAGE 4 ENGINE)</span>
        </div>
        <p className="font-mono text-[10px] text-[#ECE8DF]">
          {ai.duplicateDetections[0].eventTitle}
        </p>
        <span className="font-mono text-[9px] text-[#8B8A93]">
          {ai.duplicateDetections[0].conflictLocation}
        </span>
      </div>
    </div>
  );
}
