'use client';

import React from 'react';
import { useOpsStore, CameraPreset } from '../../stores/opsStore';
import { IconLayers, IconRadar, IconCrosshair } from '../icons/BespokeIcons';

interface LayerTogglesProps {
  onToggleCalibration: () => void;
  calibrationActive: boolean;
}

export function LayerToggles({ onToggleCalibration, calibrationActive }: LayerTogglesProps) {
  const {
    layers,
    toggleLayer,
    cameraPreset,
    setCameraPreset,
    confidenceThreshold,
    setConfidenceThreshold
  } = useOpsStore();

  const layerItems: { key: keyof typeof layers; label: string; tag: string }[] = [
    { key: 'video', label: 'Video Ground Plane', tag: 'TEX' },
    { key: 'boxes', label: 'Tracked Bounding Boxes', tag: 'CV' },
    { key: 'heatmap', label: 'Density Heightmap', tag: '3D' },
    { key: 'flowVectors', label: 'Flow Vectors', tag: 'VEL' },
    { key: 'evacuationRoutes', label: 'Evacuation Routes', tag: 'RT' },
    { key: 'exits', label: 'Emergency Egress Gates', tag: 'EXIT' },
    { key: 'medicalTriage', label: 'Field Hospitals & Triage', tag: 'MED' },
    { key: 'policePosts', label: 'Police Staging Units', tag: 'SEC' },
  ];

  const presets: { id: CameraPreset; label: string }[] = [
    { id: 'top', label: 'Top' },
    { id: 'drone', label: 'Drone' },
    { id: 'street', label: 'Street' },
    { id: 'cinematic', label: 'Cinematic' },
  ];

  return (
    <div className="flex flex-col gap-3 p-3 bg-[#12121A] border-hairline">
      {/* Camera Presets Section */}
      <div>
        <div className="flex items-center justify-between pb-1.5 border-hairline-b mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8B8A93]">
            CAMERA RIG PRESETS
          </span>
          <span className="font-mono text-[9px] text-[#8B8A93]/70">DAMPED</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {presets.map((p) => {
            const isActive = cameraPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setCameraPreset(p.id)}
                className={`py-1 text-center font-mono text-[10px] uppercase border transition-all ${
                  isActive
                    ? 'border-[#ECE8DF] bg-[#191924] text-white font-semibold'
                    : 'border-hairline text-[#8B8A93] hover:text-[#ECE8DF] hover:bg-[#14141C]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Layer Toggles Section */}
      <div>
        <div className="flex items-center justify-between pb-1.5 border-hairline-b mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8B8A93]">
            RENDER LAYERS
          </span>
          <span className="font-mono text-[9px] text-[#3DDC97]">60 FPS</span>
        </div>
        <div className="flex flex-col gap-1">
          {layerItems.map((item) => {
            const isChecked = layers[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleLayer(item.key)}
                className="flex items-center justify-between p-1.5 border border-hairline bg-[#14141C] hover:border-hairline-bright text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 border flex items-center justify-center ${
                      isChecked
                        ? 'border-[#FF4B1F] bg-[#FF4B1F]'
                        : 'border-[#8B8A93]'
                    }`}
                  >
                    {isChecked && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="font-mono text-[11px] text-[#ECE8DF]">
                    {item.label}
                  </span>
                </div>
                <span className="font-mono text-[9px] px-1 py-0.2 border border-hairline text-[#8B8A93]">
                  {item.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calibration & Confidence Slider */}
      <div className="pt-2 border-hairline-t flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8B8A93]">
            CV CONFIDENCE THRESHOLD
          </span>
          <span className="font-mono text-xs font-semibold text-[#ECE8DF] tabular-nums">
            {Math.round(confidenceThreshold * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.20"
          max="0.90"
          step="0.05"
          value={confidenceThreshold}
          onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
          className="w-full accent-[#FF4B1F] bg-[#14141C] cursor-pointer h-1.5"
        />

        {/* 4-Point Homography Ground Calibration Trigger */}
        <button
          onClick={onToggleCalibration}
          className={`mt-1 flex items-center justify-center gap-2 py-1.5 border font-mono text-[10px] tracking-wider uppercase transition-all ${
            calibrationActive
              ? 'border-[#FF4B1F] bg-[#FF4B1F]/20 text-[#FF4B1F] font-bold'
              : 'border-hairline bg-[#14141C] text-[#8B8A93] hover:text-[#ECE8DF]'
          }`}
        >
          <IconCrosshair size={12} />
          <span>{calibrationActive ? 'EXIT HOMOGRAPHY CALIBRATION' : 'CALIBRATE GROUND PLANE (4 CORNERS)'}</span>
        </button>
      </div>
    </div>
  );
}
