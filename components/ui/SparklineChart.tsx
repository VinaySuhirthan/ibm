'use client';

import React from 'react';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  highlightPeak?: boolean;
}

export function SparklineChart({
  data = [1.2, 1.4, 1.3, 1.8, 2.2, 2.7, 3.4, 3.8, 4.2, 3.9, 3.1, 2.8],
  width = 240,
  height = 50,
  color = '#ECE8DF',
  fillOpacity = 0.12,
  highlightPeak = true
}: SparklineChartProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data, min + 0.1);
  const range = max - min;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 10) - 5;
    return { x, y, val, i };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    // Smooth bezier curve control points
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (p.x - prev.x) / 2;
    const cpy2 = p.y;
    return `${acc} C ${cpx1.toFixed(1)} ${cpy1.toFixed(1)}, ${cpx2.toFixed(1)} ${cpy2.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const peakPoint = points.reduce((maxP, p) => (p.val > maxP.val ? p : maxP), points[0]);

  return (
    <div className="relative select-none">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shaded Area */}
        <path d={areaD} fill={`url(#sparkGrad-${color.replace('#', '')})`} />

        {/* Ridgeline Stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Peak Indicator Dot */}
        {highlightPeak && (
          <g>
            <circle
              cx={peakPoint.x}
              cy={peakPoint.y}
              r="3"
              fill={color}
              stroke="#0A0A0F"
              strokeWidth="1.5"
            />
            <circle
              cx={peakPoint.x}
              cy={peakPoint.y}
              r="6"
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              opacity="0.6"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
