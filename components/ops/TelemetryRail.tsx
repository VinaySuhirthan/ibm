'use client';

import React from 'react';
import { useOpsStore } from '../../stores/opsStore';
import { RadialRiskDial } from '../ui/RadialRiskDial';
import { SparklineChart } from '../ui/SparklineChart';
import { IconShieldAlert, IconRadar } from '../icons/BespokeIcons';

export function TelemetryRail() {
  const {
    headcount,
    densityM2,
    peakDensityM2,
    flowSpeedMps,
    riskScore,
    riskLevel,
    alerts,
    acknowledgeAlert,
    dismissAlert,
    backend,
    inferenceFps
  } = useOpsStore();

  return (
    <div className="flex flex-col gap-3 p-3 bg-[#12121A] border-hairline overflow-y-auto">
      {/* Privacy by Design Seal */}
      <div className="flex items-center justify-between p-2 border border-hairline bg-[#14141C]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3DDC97]" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#3DDC97] font-semibold">
            PRIVACY BY DESIGN
          </span>
        </div>
        <span className="font-mono text-[8px] text-[#8B8A93]">
          NO FACIAL RECOGNITION / AGGREGATE ONLY
        </span>
      </div>

      {/* Hero Radial Risk Dial */}
      <div className="p-3 border border-hairline bg-[#14141C] flex flex-col items-center">
        <div className="w-full flex items-center justify-between pb-2 border-hairline-b mb-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8B8A93]">
            CROWD RISK FACTOR (FRUIN LoS)
          </span>
          <span className="font-mono text-[9px] text-[#8B8A93]">
            {riskLevel.toUpperCase()}
          </span>
        </div>
        <RadialRiskDial score={riskScore} riskLevel={riskLevel} size={190} />
      </div>

      {/* Headcount & Density Telemetry Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {/* Headcount */}
        <div className="p-2.5 border border-hairline bg-[#14141C]">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#8B8A93]">
            VENUE HEADCOUNT
          </div>
          <div className="font-mono text-2xl font-bold text-[#ECE8DF] tabular-nums mt-1">
            {headcount.toLocaleString()}
          </div>
          <div className="font-mono text-[9px] text-[#8B8A93] mt-0.5">
            ±4% Calibrated Variance
          </div>
        </div>

        {/* Real-time Density */}
        <div className="p-2.5 border border-hairline bg-[#14141C]">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#8B8A93]">
            PEAK DENSITY
          </div>
          <div className={`font-mono text-2xl font-bold tabular-nums mt-1 ${
            peakDensityM2 >= 4.2 ? 'text-[#FF4B1F]' : peakDensityM2 >= 2.8 ? 'text-[#E5A93C]' : 'text-[#ECE8DF]'
          }`}>
            {peakDensityM2.toFixed(2)}
            <span className="text-xs font-normal text-mute ml-0.5">ppl/m²</span>
          </div>
          <div className="font-mono text-[9px] text-[#8B8A93] mt-0.5">
            Avg: {densityM2.toFixed(2)} ppl/m²
          </div>
        </div>

        {/* Laminar Flow Velocity */}
        <div className="p-2.5 border border-hairline bg-[#14141C]">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#8B8A93]">
            FLOW VELOCITY
          </div>
          <div className="font-mono text-xl font-bold text-[#ECE8DF] tabular-nums mt-1">
            {flowSpeedMps.toFixed(2)}
            <span className="text-xs font-normal text-mute ml-0.5">m/s</span>
          </div>
          <div className="font-mono text-[9px] text-[#8B8A93] mt-0.5">
            Deceleration Chokepoint
          </div>
        </div>

        {/* Inference Telemetry */}
        <div className="p-2.5 border border-hairline bg-[#14141C]">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#8B8A93]">
            INFERENCE WORKER
          </div>
          <div className="font-mono text-xl font-bold text-[#3DDC97] tabular-nums mt-1">
            {inferenceFps}
            <span className="text-xs font-normal text-mute ml-0.5">FPS</span>
          </div>
          <div className="font-mono text-[9px] text-[#8B8A93] mt-0.5 truncate">
            {backend}
          </div>
        </div>
      </div>

      {/* Ridgeline Density History */}
      <div className="p-2.5 border border-hairline bg-[#14141C]">
        <div className="flex items-center justify-between pb-1 mb-2 border-hairline-b">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#8B8A93]">
            HISTORICAL DENSITY CURVE (LAST 15 MIN)
          </span>
          <span className="font-mono text-[9px] text-[#FF4B1F] font-semibold">PEAK: 4.8 ppl/m²</span>
        </div>
        <SparklineChart
          data={[1.2, 1.4, 1.8, 2.1, 2.5, 3.1, 3.8, 4.4, 4.8, 4.2, 3.6, 3.4]}
          width={280}
          height={48}
          color={peakDensityM2 >= 4.2 ? '#FF4B1F' : '#E5A93C'}
        />
      </div>

      {/* Live Alerts Stream */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between pb-1 border-hairline-b">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8B8A93]">
            ACTIVE ALERTS ({alerts.length})
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B1F] animate-ping" />
        </div>

        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-2 border text-left flex flex-col gap-1 transition-all ${
              alert.severity === 'critical'
                ? 'border-[#FF4B1F]/60 bg-[#FF4B1F]/10'
                : 'border-[#E5A93C]/40 bg-[#E5A93C]/5'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span className={`font-bold uppercase ${alert.severity === 'critical' ? 'text-[#FF4B1F]' : 'text-[#E5A93C]'}`}>
                [{alert.severity.toUpperCase()}] {alert.id}
              </span>
              <span className="text-[#8B8A93]">{alert.timestamp}</span>
            </div>
            <div className="font-mono text-xs font-semibold text-[#ECE8DF]">
              {alert.title}
            </div>
            <div className="font-mono text-[10px] text-[#8B8A93]">
              Location: {alert.location} • Value: {alert.densityValue} ppl/m²
            </div>
            <div className="font-mono text-[9px] text-[#ECE8DF]/90 bg-[#0A0A0F]/60 p-1 border border-hairline mt-1">
              Rec: {alert.recommendedAction}
            </div>

            <div className="flex items-center justify-end gap-2 mt-1 font-mono text-[9px]">
              {!alert.acknowledged && (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="px-2 py-0.5 border border-hairline text-[#3DDC97] hover:bg-[#3DDC97]/10"
                >
                  ACKNOWLEDGE
                </button>
              )}
              <button
                onClick={() => dismissAlert(alert.id)}
                className="px-2 py-0.5 border border-hairline text-[#8B8A93] hover:text-[#ECE8DF]"
              >
                DISMISS
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
