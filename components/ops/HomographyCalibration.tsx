'use client';

import React, { useState } from 'react';
import { useOpsStore } from '../../stores/opsStore';
import { CalibrationQuad } from '../../lib/homography';

interface HomographyCalibrationProps {
  onClose: () => void;
}

export function HomographyCalibration({ onClose }: HomographyCalibrationProps) {
  const { calibration, setCalibrationCorner } = useOpsStore();
  const [activeCorner, setActiveCorner] = useState<keyof Omit<CalibrationQuad, 'metricWidthMeters' | 'metricHeightMeters'> | null>(null);

  const handlePointerDown = (corner: keyof Omit<CalibrationQuad, 'metricWidthMeters' | 'metricHeightMeters'>) => {
    setActiveCorner(corner);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!activeCorner) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setCalibrationCorner(activeCorner, x, y);
  };

  const handlePointerUp = () => {
    setActiveCorner(null);
  };

  const corners = [
    { key: 'topLeft' as const, label: 'TL', point: calibration.topLeft },
    { key: 'topRight' as const, label: 'TR', point: calibration.topRight },
    { key: 'bottomRight' as const, label: 'BR', point: calibration.bottomRight },
    { key: 'bottomLeft' as const, label: 'BL', point: calibration.bottomLeft },
  ];

  // Polygon path
  const polygonPoints = `${calibration.topLeft.x * 100}%,${calibration.topLeft.y * 100}% ${calibration.topRight.x * 100}%,${calibration.topRight.y * 100}% ${calibration.bottomRight.x * 100}%,${calibration.bottomRight.y * 100}% ${calibration.bottomLeft.x * 100}%,${calibration.bottomLeft.y * 100}%`;

  return (
    <div className="absolute inset-0 z-30 select-none bg-black/40 backdrop-blur-xs flex flex-col">
      {/* Top Banner */}
      <div className="p-3 bg-[#0A0A0F]/90 border-hairline-b flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF4B1F] animate-ping" />
          <span className="text-[#ECE8DF] font-semibold">HOMOGRAPHY 4-POINT GROUND CALIBRATION</span>
          <span className="text-[#8B8A93]">[DRAG 4 CORNERS TO ALIGN METRIC PLANE]</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 border border-[#3DDC97] text-[#3DDC97] bg-[#3DDC97]/10 hover:bg-[#3DDC97]/20 font-bold"
        >
          CONFIRM CALIBRATION ✓
        </button>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="relative flex-1">
        <svg
          className="w-full h-full cursor-crosshair"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Calibrated Polygon Plane */}
          <polygon
            points={polygonPoints}
            fill="rgba(34, 211, 238, 0.12)"
            stroke="#22D3EE"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Interactive Drag Handles */}
          {corners.map((c) => (
            <g
              key={c.key}
              transform={`translate(${c.point.x * 1000}, ${c.point.y * 700})`}
              onPointerDown={() => handlePointerDown(c.key)}
              className="cursor-move"
            >
              {/* Outer Ring */}
              <circle
                cx="0"
                cy="0"
                r="14"
                fill="rgba(255, 75, 31, 0.3)"
                stroke="#FF4B1F"
                strokeWidth="1.5"
              />
              <circle cx="0" cy="0" r="4" fill="#FF4B1F" />
              {/* Crosshair lines */}
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#FF4B1F" strokeWidth="1" />
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#FF4B1F" strokeWidth="1" />
              <text
                x="16"
                y="-6"
                fill="#ECE8DF"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                {c.label} ({c.point.x.toFixed(2)}, {c.point.y.toFixed(2)})
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
