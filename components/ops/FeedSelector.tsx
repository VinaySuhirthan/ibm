'use client';

import React from 'react';
import { useOpsStore } from '../../stores/opsStore';
import { IconDrone, IconCctv, IconCrosshair } from '../icons/BespokeIcons';

interface FeedSelectorProps {
  viewMode: '3d' | '2d';
  onToggleViewMode: (mode: '3d' | '2d') => void;
}

export function FeedSelector({ viewMode, onToggleViewMode }: FeedSelectorProps) {
  const { feeds, activeFeedId, setActiveFeed } = useOpsStore();

  return (
    <div className="flex flex-col gap-2 p-3 bg-[#12121A] border-hairline">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-hairline-b">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8B8A93]">
            TELEMETRY FEEDS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#3DDC97]" />
        </div>
        {/* 2D / 3D Switch */}
        <div className="flex items-center border border-hairline bg-[#0A0A0F]">
          <button
            onClick={() => onToggleViewMode('3d')}
            className={`px-2 py-0.5 font-mono text-[10px] tracking-wider transition-colors ${
              viewMode === '3d'
                ? 'bg-[#2E1F73] text-white font-semibold'
                : 'text-[#8B8A93] hover:text-[#ECE8DF]'
            }`}
          >
            3D TWIN
          </button>
          <button
            onClick={() => onToggleViewMode('2d')}
            className={`px-2 py-0.5 font-mono text-[10px] tracking-wider transition-colors ${
              viewMode === '2d'
                ? 'bg-[#2E1F73] text-white font-semibold'
                : 'text-[#8B8A93] hover:text-[#ECE8DF]'
            }`}
          >
            2D RAW
          </button>
        </div>
      </div>

      {/* Feed List Buttons */}
      <div className="flex flex-col gap-1.5">
        {feeds.map((feed) => {
          const isActive = feed.id === activeFeedId;
          return (
            <button
              key={feed.id}
              onClick={() => setActiveFeed(feed.id)}
              className={`flex items-start gap-2.5 p-2 text-left transition-all border ${
                isActive
                  ? 'border-[#FF4B1F] bg-[#191924] shadow-sm'
                  : 'border-hairline bg-[#14141C] hover:border-hairline-bright'
              }`}
            >
              <div
                className={`p-1.5 border ${
                  isActive
                    ? 'border-[#FF4B1F] text-[#FF4B1F] bg-[#FF4B1F]/10'
                    : 'border-hairline text-[#8B8A93]'
                }`}
              >
                {feed.type === 'drone' ? (
                  <IconDrone size={14} />
                ) : (
                  <IconCctv size={14} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#ECE8DF] truncate">
                    {feed.id}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#3DDC97]">
                    {feed.status}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-[#8B8A93] truncate">
                  {feed.location}
                </p>
                <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-[#8B8A93]/80">
                  <span>ALT: {feed.elevationMeters}m</span>
                  <span>•</span>
                  <span>AREA: {feed.calibratedAreaM2}m²</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
