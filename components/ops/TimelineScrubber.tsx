'use client';

import React from 'react';
import { useOpsStore } from '../../stores/opsStore';

export function TimelineScrubber() {
  const {
    currentTime,
    duration,
    isPlaying,
    playbackSpeed,
    setCurrentTime,
    setIsPlaying,
    setPlaybackSpeed,
    riskLevel
  } = useOpsStore();

  const spikeMarkers = [
    { time: 14.5, label: 'Spike A (Chokepoint 2)', type: 'watch' },
    { time: 32.0, label: 'Spike B (Fruin LoS F Breach)', type: 'critical' }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  const speeds = [0.25, 0.5, 1.0, 2.0];

  return (
    <div className="w-full px-4 py-2.5 bg-[#0F0F17] border-hairline-t flex flex-col gap-2 select-none">
      {/* Upper Controls Row */}
      <div className="flex items-center justify-between text-xs">
        {/* Play/Pause & Steppers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 border border-hairline bg-[#14141C] hover:border-hairline-bright text-[#ECE8DF] font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isPlaying ? (
              <>
                <span className="w-2 h-2.5 bg-[#FF4B1F] inline-block" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <span className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-[#3DDC97] inline-block" />
                <span>PLAY</span>
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
            className="px-2 py-1 border border-hairline bg-[#14141C] text-[#8B8A93] hover:text-[#ECE8DF] font-mono text-xs"
            title="Step back 5 seconds"
          >
            -5s
          </button>
          <button
            onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
            className="px-2 py-1 border border-hairline bg-[#14141C] text-[#8B8A93] hover:text-[#ECE8DF] font-mono text-xs"
            title="Step forward 5 seconds"
          >
            +5s
          </button>

          {/* Time Counter */}
          <div className="font-mono text-xs text-[#ECE8DF] pl-3 border-hairline-l tabular-nums">
            <span className="text-white font-bold">{formatTime(currentTime)}</span>
            <span className="text-[#8B8A93] mx-1">/</span>
            <span className="text-[#8B8A93]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span className="text-[#8B8A93] mr-1 uppercase tracking-wider">SPEED:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setPlaybackSpeed(s)}
              className={`px-1.5 py-0.5 border ${
                playbackSpeed === s
                  ? 'border-[#FF4B1F] bg-[#191924] text-white font-bold'
                  : 'border-hairline bg-[#14141C] text-[#8B8A93] hover:text-[#ECE8DF]'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Scrub Track with Event Markers */}
      <div className="relative w-full h-6 flex items-center group">
        {/* Track Line */}
        <div className="w-full h-1.5 bg-[#191924] border border-hairline relative">
          {/* Progress fill */}
          <div
            className="h-full bg-[#FF4B1F]/60"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Event Density Spike Markers */}
          {spikeMarkers.map((marker, i) => {
            const leftPct = (marker.time / duration) * 100;
            return (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTime(marker.time);
                }}
                className="absolute top-[-5px] -translate-x-1/2 cursor-pointer z-10 flex flex-col items-center"
                style={{ left: `${leftPct}%` }}
                title={`${marker.label} at ${marker.time}s`}
              >
                <div
                  className={`w-2.5 h-3 border ${
                    marker.type === 'critical'
                      ? 'border-[#FF4B1F] bg-[#FF4B1F]'
                      : 'border-[#E5A93C] bg-[#E5A93C]'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Interactive Scrub Input */}
        <input
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={currentTime}
          onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-20"
        />

        {/* Playhead Marker */}
        <div
          className="absolute pointer-events-none top-0 bottom-0 w-[2px] bg-white -translate-x-1/2 shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-2.5 h-2 bg-white -translate-x-[4px] -top-1" />
        </div>
      </div>
    </div>
  );
}
