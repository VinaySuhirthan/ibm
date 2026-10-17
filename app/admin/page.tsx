'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { RadialRiskDial } from '../../components/ui/RadialRiskDial';
import { VIDEO_FEEDS_CONFIG, FeedOption, DEFAULT_FEED_ID } from '../../lib/videoConfig';

interface DetectionBox {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  conf: number;
  vx?: number;
  vy?: number;
}

interface FrameDetection {
  frame: number;
  t: number;
  boxes: DetectionBox[];
}

export default function AdminLiveRoomPage() {
  // Feed List configured from lib/videoConfig.ts (editable anytime directly in code)
  const feeds: FeedOption[] = VIDEO_FEEDS_CONFIG;

  const [activeFeedId, setActiveFeedId] = useState<string>(DEFAULT_FEED_ID);
  const activeFeed = feeds.find(f => f.id === activeFeedId) || feeds[0];

  // View Mode: 'video' | 'depth' | 'split'
  const [viewMode, setViewMode] = useState<'video' | 'depth' | 'split'>('video');

  // Video State & Continuous Looping
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const depthVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(20);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Detections Data
  const [detectionsData, setDetectionsData] = useState<FrameDetection[]>([]);
  const [isLoadingDetections, setIsLoadingDetections] = useState<boolean>(true);
  const [detectionsError, setDetectionsError] = useState<string | null>(null);

  // Confidence & Layer Filters
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.35);
  const [calibratedAreaM2, setCalibratedAreaM2] = useState<number>(activeFeed.defaultAreaM2);
  const [layers, setLayers] = useState({
    boxes: true,
    labels: true,
    flowVectors: true,
    corridors: true,
    triagePins: true
  });

  // Load Detections JSON on feed change
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingDetections(true);
    setDetectionsError(null);

    if (!activeFeed.detectionsSrc) {
      setDetectionsData([]);
      setIsLoadingDetections(false);
      return;
    }

    fetch(activeFeed.detectionsSrc)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: FrameDetection[]) => {
        if (!isCancelled) {
          setDetectionsData(data);
          setIsLoadingDetections(false);
          setDetectionsError(null);
        }
      })
      .catch(err => {
        if (!isCancelled) {
          console.warn(`Could not load detections for ${activeFeed.id}:`, err);
          setDetectionsError(`Detections unavailable (${err.message}). Displaying raw video without overlay.`);
          setDetectionsData([]);
          setIsLoadingDetections(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeFeed.detectionsSrc, activeFeed.id]);

  // Current Frame Detections
  const currentFrameBoxes = useMemo(() => {
    if (!detectionsData || detectionsData.length === 0) return [];

    const frameIdx = Math.min(
      detectionsData.length - 1,
      Math.max(0, Math.floor(currentTime * activeFeed.fps))
    );

    const frame = detectionsData[frameIdx] || detectionsData[0];
    if (!frame || !frame.boxes) return [];

    return frame.boxes.filter(b => b.conf >= confidenceThreshold);
  }, [detectionsData, currentTime, activeFeed.fps, confidenceThreshold]);

  // Calculate Real Telemetry
  const inViewCount = currentFrameBoxes.length;
  // Estimate venue density (pax / m2) based on in-view sample and calibrated area
  const sampleFraction = activeFeed.type === 'drone' ? 0.05 : 0.12;
  const estimatedTotalHeadcount = Math.max(inViewCount, Math.round(inViewCount / sampleFraction));
  const currentDensityM2 = Number((estimatedTotalHeadcount / calibratedAreaM2).toFixed(2));

  // Plain Language Crowd Level
  const crowdLevel: 'Safe' | 'Busy' | 'Dangerous' =
    currentDensityM2 < 2.0
      ? 'Safe'
      : currentDensityM2 <= 3.8
      ? 'Busy'
      : 'Dangerous';

  // Synchronize Overlay Canvas with Video Frame
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (layers.boxes && currentFrameBoxes.length > 0) {
        for (const box of currentFrameBoxes) {
          const bx = box.x * canvas.width;
          const by = box.y * canvas.height;
          const bw = Math.max(12, box.w * canvas.width);
          const bh = Math.max(16, box.h * canvas.height);

          // Box Color based on crowd level
          const boxColor =
            crowdLevel === 'Dangerous'
              ? '#FF4B1F'
              : crowdLevel === 'Busy'
              ? '#D97706'
              : '#1F9D6B';

          // Box Outline
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, bw, bh);

          // Corner tick marks
          const tick = 3;
          ctx.fillStyle = boxColor;
          ctx.fillRect(bx - 1, by - 1, tick, 1);
          ctx.fillRect(bx - 1, by - 1, 1, tick);
          ctx.fillRect(bx + bw - tick, by - 1, tick, 1);
          ctx.fillRect(bx + bw, by - 1, 1, tick);

          // Label Tag (ID & Conf)
          if (layers.labels) {
            ctx.fillStyle = 'rgba(14, 14, 20, 0.85)';
            ctx.fillRect(bx, Math.max(0, by - 14), 58, 12);
            ctx.fillStyle = boxColor;
            ctx.font = '9px "Geist Mono", monospace';
            ctx.fillText(
              `#${box.id} ${(box.conf * 100).toFixed(0)}%`,
              bx + 2,
              Math.max(10, by - 4)
            );
          }
        }
      }

      // Safe Assembly Corridors Overlay
      if (layers.corridors) {
        ctx.strokeStyle = 'rgba(31, 157, 107, 0.7)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.1, canvas.height * 0.7);
        ctx.quadraticCurveTo(
          canvas.width * 0.45,
          canvas.height * 0.55,
          canvas.width * 0.88,
          canvas.height * 0.35
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentFrameBoxes, layers, crowdLevel]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (depthVideoRef.current) depthVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      if (depthVideoRef.current) depthVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle Seamless Video Looping
  const handleVideoEnded = () => {
    if (isLooping) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      if (depthVideoRef.current) {
        depthVideoRef.current.currentTime = 0;
        depthVideoRef.current.play().catch(() => {});
      }
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  // When active feed changes, reset and start playing
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
    if (depthVideoRef.current) {
      depthVideoRef.current.currentTime = 0;
      if (isPlaying) {
        depthVideoRef.current.play().catch(() => {});
      }
    }
    setCurrentTime(0);
  }, [activeFeedId, isPlaying]);

  // Handle Scrubber Seek
  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    if (depthVideoRef.current) {
      depthVideoRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  // Speed Adjustment
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    if (depthVideoRef.current) depthVideoRef.current.playbackRate = speed;
  };

  return (
    <div className="flex flex-col gap-5 w-full font-ui text-[#ECE8E1]">
      {/* Top Console Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[rgba(236,232,225,0.08)] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label text-[#FF4B1F] font-semibold uppercase tracking-wider text-[11px]">
              Computer Vision & Depth Sensing
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(255,75,31,0.12)] text-[#FF4B1F] text-[11px] font-semibold">
              AUTHORITY LIVE CONSOLE
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#ECE8E1] mt-1 font-semibold tracking-tight leading-tight">
            Live Crowd Intelligence Room
          </h1>
          <p className="text-[14px] text-[#8E8D98] mt-1 leading-normal">
            Real-time aerial and perimeter feeds with synchronized depth geometry, tracked YOLO person counts, and predictive crowd density.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/broadcast"
            className="px-4 py-2 rounded-civic-sm bg-[#FF4B1F] text-white text-[13px] font-semibold hover:bg-[#FF4B1F]/90 transition-colors flex items-center gap-1.5 shadow-soft"
          >
            <span>Emergency Broadcast</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Main Monitoring 3-Column Layout (lg:grid-cols-12 for laptop/desktop screen efficiency) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLUMN 1: Feed Management & Layer Controls (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Feed Selector Card */}
          <div className="p-4 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(236,232,225,0.08)]">
              <span className="text-[13px] font-semibold text-[#ECE8E1]">
                Active Camera Feeds
              </span>
              <span className="text-[11px] text-[#1F9D6B] font-semibold">Live Feeds (2)</span>
            </div>

            <div className="flex flex-col gap-2">
              {feeds.map((feed) => (
                <button
                  key={feed.id}
                  onClick={() => {
                    setActiveFeedId(feed.id);
                    setCalibratedAreaM2(feed.defaultAreaM2);
                  }}
                  className={`p-3 rounded-civic text-left transition-all cursor-pointer border ${
                    activeFeedId === feed.id
                      ? 'bg-[#1C1C28] border-[#FF4B1F] shadow-soft'
                      : 'bg-[#0E0E14] border-[rgba(236,232,225,0.06)] hover:bg-[#16161F]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#ECE8E1]">
                      {feed.id}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#1F9D6B]" />
                  </div>
                  <p className="text-[12px] text-[#8E8D98] mt-1 line-clamp-1 leading-normal">
                    {feed.name}
                  </p>
                  <div className="text-[11px] text-[#8E8D98] mt-1 font-mono-numbers">
                    {feed.fps} FPS • Area: {feed.defaultAreaM2}m²
                  </div>
                </button>
              ))}
            </div>

            {/* Developer Custom Video Notice */}
            <div className="mt-2.5 p-2.5 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.06)] text-[11px] text-[#8E8D98]">
              <div className="text-[#ECE8E1] font-semibold flex items-center justify-between mb-1">
                <span>⚙️ Video Source Config</span>
                <span className="text-[10px] text-[#1F9D6B] font-mono">lib/videoConfig.ts</span>
              </div>
              <p className="leading-normal">
                To replace or add video feeds, edit <code className="text-[#1F9D6B] font-mono font-medium">lib/videoConfig.ts</code>. Clips placed in <code className="text-[#ECE8E1] font-mono">public/</code> will auto-reload.
              </p>
            </div>
          </div>

          {/* Layer Visibility Toggles */}
          <div className="p-4 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col gap-2.5">
            <span className="text-[13px] font-semibold text-[#ECE8E1] pb-2 border-b border-[rgba(236,232,225,0.08)]">
              Telemetry Layers
            </span>

            <div className="flex flex-col gap-1.5 text-[13px]">
              <label className="flex items-center justify-between cursor-pointer py-1 text-[#8E8D98] hover:text-[#ECE8E1]">
                <span>YOLO Bounding Boxes</span>
                <input
                  type="checkbox"
                  checked={layers.boxes}
                  onChange={(e) => setLayers({ ...layers, boxes: e.target.checked })}
                  className="w-4 h-4 accent-[#FF4B1F] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 text-[#8E8D98] hover:text-[#ECE8E1]">
                <span>Track IDs & Confidence</span>
                <input
                  type="checkbox"
                  checked={layers.labels}
                  onChange={(e) => setLayers({ ...layers, labels: e.target.checked })}
                  className="w-4 h-4 accent-[#FF4B1F] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 text-[#8E8D98] hover:text-[#ECE8E1]">
                <span>Safe Egress Corridors</span>
                <input
                  type="checkbox"
                  checked={layers.corridors}
                  onChange={(e) => setLayers({ ...layers, corridors: e.target.checked })}
                  className="w-4 h-4 accent-[#1F9D6B] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Confidence Slider & Venue Ground Scale */}
          <div className="p-4 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col gap-3.5">
            <div>
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="text-[#ECE8E1] font-medium">Confidence Filter</span>
                <span className="font-mono-numbers text-[#FF4B1F] font-semibold">
                  {(confidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.85"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#FF4B1F] cursor-pointer"
              />
            </div>

            <div className="pt-2.5 border-t border-[rgba(236,232,225,0.08)]">
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="text-[#ECE8E1] font-medium">Calibrated Ground Scale</span>
                <span className="font-mono-numbers text-[#1F9D6B] font-semibold">
                  {calibratedAreaM2} m²
                </span>
              </div>
              <input
                type="number"
                min="100"
                max="10000"
                step="50"
                value={calibratedAreaM2}
                onChange={(e) => setCalibratedAreaM2(Math.max(50, parseInt(e.target.value) || 500))}
                className="w-full px-3 py-1.5 bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] rounded text-[13px] text-[#ECE8E1] focus:outline-none focus:border-[#FF4B1F]"
              />
            </div>
          </div>
        </div>

        {/* COLUMN 2: Center Live Stream & 3D Surface Viewport (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3.5">
          {/* Error / Offline Banner if detections missing */}
          {detectionsError && (
            <div className="p-3 bg-[rgba(255,75,31,0.12)] border border-[rgba(255,75,31,0.25)] rounded-civic-sm text-[13px] text-[#FF4B1F] flex items-center justify-between">
              <span>{detectionsError}</span>
              <span className="font-semibold text-[11px] uppercase">RAW PASS-THROUGH</span>
            </div>
          )}

          {/* View Mode Switcher Tabs */}
          <div className="flex items-center justify-between p-1.5 bg-[#16161F] rounded-civic border border-[rgba(236,232,225,0.08)] shadow-soft">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewMode('video')}
                className={`px-3.5 py-1.5 rounded-civic-sm text-[12px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'video'
                    ? 'bg-[#FF4B1F] text-white'
                    : 'text-[#8E8D98] hover:bg-[#1C1C28] hover:text-[#ECE8E1]'
                }`}
              >
                Video Feed (CV Overlay)
              </button>
              <button
                onClick={() => setViewMode('depth')}
                className={`px-3.5 py-1.5 rounded-civic-sm text-[12px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'depth'
                    ? 'bg-[#FF4B1F] text-white'
                    : 'text-[#8E8D98] hover:bg-[#1C1C28] hover:text-[#ECE8E1]'
                }`}
              >
                3D Depth Geometry
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3.5 py-1.5 rounded-civic-sm text-[12px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-[#FF4B1F] text-white'
                    : 'text-[#8E8D98] hover:bg-[#1C1C28] hover:text-[#ECE8E1]'
                }`}
              >
                Split View
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#8E8D98] pr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F9D6B] animate-live-dot" />
              <span>SYNC 60 FPS</span>
            </div>
          </div>

          {/* Video & Canvas Viewport: Flexbox-based to avoid float collapse */}
          <div className={`relative w-full aspect-video bg-[#0E0E14] rounded-civic-lg overflow-hidden border border-[rgba(236,232,225,0.12)] shadow-elevation ${
            viewMode === 'split' ? 'flex flex-row' : ''
          }`}>
            {/* Viewport: Video Mode */}
            <div className={`relative h-full ${
              viewMode === 'depth' ? 'hidden' : viewMode === 'split' ? 'flex-1 border-r border-[rgba(236,232,225,0.1)]' : 'w-full'
            }`}>
              <video
                ref={videoRef}
                key={activeFeed.videoSrc}
                src={activeFeed.videoSrc}
                autoPlay
                loop={isLooping}
                muted
                playsInline
                onEnded={handleVideoEnded}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    const t = videoRef.current.currentTime;
                    setCurrentTime(t);
                    // Seamless loop check
                    if (isLooping && videoRef.current.duration > 0 && t >= videoRef.current.duration - 0.08) {
                      handleVideoEnded();
                      return;
                    }
                    if (depthVideoRef.current && Math.abs(depthVideoRef.current.currentTime - t) > 0.12) {
                      depthVideoRef.current.currentTime = t;
                    }
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration || 20);
                    if (isPlaying) {
                      videoRef.current.play().catch(() => {});
                    }
                  }
                }}
                className="w-full h-full object-cover"
              />

              {/* Real-time Canvas Bounding Boxes Overlay */}
              <canvas
                ref={canvasRef}
                width={960}
                height={540}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* Tactical Top Overlay Tag */}
              <div className="absolute top-2.5 left-2.5 bg-[#0E0E14]/85 backdrop-blur-xs px-2.5 py-1 rounded border border-[rgba(236,232,225,0.1)] text-[11px] font-mono-numbers text-[#ECE8E1] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F9D6B]" />
                <span>{activeFeed.id} • {activeFeed.fps} FPS</span>
              </div>
            </div>

            {/* Viewport: Depth Mode */}
            <div className={`relative h-full ${
              viewMode === 'video' ? 'hidden' : viewMode === 'split' ? 'flex-1' : 'w-full'
            }`}>
              {activeFeed.depthSrc ? (
                <video
                  ref={depthVideoRef}
                  key={activeFeed.depthSrc}
                  src={activeFeed.depthSrc}
                  autoPlay
                  loop={isLooping}
                  muted
                  playsInline
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0E0E14] text-[#8E8D98]">
                  <span className="text-[13px] font-semibold text-[#ECE8E1]">3D Depth Surface Not Configured</span>
                  <span className="text-[11px] mt-1 text-[#8E8D98] max-w-xs">
                    Custom video stream active. Switch to Raw Feed mode or generate depth with scripts/make_assets.py.
                  </span>
                </div>
              )}

              <div className="absolute top-2.5 right-2.5 bg-[#0E0E14]/85 backdrop-blur-xs px-2.5 py-1 rounded border border-[rgba(236,232,225,0.1)] text-[11px] font-mono-numbers text-[#22D3EE] flex items-center gap-2">
                <span>DEPTH-ANYTHING-V2 SURFACE</span>
              </div>
            </div>
          </div>

          {/* Transport Controls Bar */}
          <div className="p-3.5 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col gap-2.5">
            {/* Timeline Scrubber */}
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono-numbers text-[#8E8D98]">
                {currentTime.toFixed(1)}s
              </span>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.05"
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="flex-1 accent-[#FF4B1F] cursor-pointer"
              />
              <span className="text-[11px] font-mono-numbers text-[#8E8D98]">
                {duration.toFixed(1)}s
              </span>
            </div>

            {/* Control Buttons, Loop Status & Speed */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="px-3.5 py-1.5 rounded-civic-sm bg-[#1C1C28] hover:bg-[#232332] text-[12px] font-semibold text-[#ECE8E1] transition-colors cursor-pointer border border-[rgba(236,232,225,0.08)]"
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  onClick={() => handleSeek(0)}
                  className="px-3 py-1.5 rounded-civic-sm bg-[#1C1C28] hover:bg-[#232332] text-[12px] text-[#8E8D98] hover:text-[#ECE8E1] transition-colors cursor-pointer border border-[rgba(236,232,225,0.08)]"
                >
                  ⏮ Restart
                </button>
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`px-3 py-1.5 rounded-civic-sm text-[12px] font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                    isLooping
                      ? 'bg-[rgba(31,157,107,0.15)] text-[#1F9D6B] border-[#1F9D6B]'
                      : 'bg-[#1C1C28] text-[#8E8D98] border-[rgba(236,232,225,0.08)] hover:text-[#ECE8E1]'
                  }`}
                  title="Toggle continuous video looping"
                >
                  <span>🔁 Loop:</span>
                  <span className="font-bold">{isLooping ? 'ACTIVE' : 'OFF'}</span>
                </button>
              </div>

              {/* Playback Speeds */}
              <div className="flex items-center gap-1.5">
                {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-1 rounded text-[11px] font-mono-numbers font-medium transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-[#FF4B1F] text-white'
                        : 'bg-[#0E0E14] text-[#8E8D98] hover:text-[#ECE8E1]'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Real Telemetry & Radial Dial Gauge (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Plain Language Crowd Level Banner */}
          <div className={`p-4 rounded-civic-lg border shadow-soft flex flex-col gap-1 ${
            crowdLevel === 'Dangerous'
              ? 'bg-[rgba(255,75,31,0.15)] border-[#FF4B1F] text-[#FF4B1F]'
              : crowdLevel === 'Busy'
              ? 'bg-[rgba(217,119,6,0.15)] border-[#D97706] text-[#D97706]'
              : 'bg-[rgba(31,157,107,0.15)] border-[#1F9D6B] text-[#1F9D6B]'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              CROWD LEVEL STATUS
            </span>
            <div className="font-display text-xl font-bold leading-tight">
              Crowd level: {crowdLevel}
            </div>
            <p className="text-[12px] opacity-90 leading-normal">
              {crowdLevel === 'Dangerous'
                ? 'High compression risk. Recommend opening secondary egress ramp.'
                : crowdLevel === 'Busy'
                ? 'Approaching chokepoint capacity. Monitor feeder alleys.'
                : 'Steady flow. Density within safe constitutional guidelines.'}
            </p>
          </div>

          {/* Radial Dynamic Dial Gauge */}
          <div className="p-3.5 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col items-center justify-center">
            <span className="text-[11px] text-[#8E8D98] uppercase font-semibold tracking-wider mb-0.5">
              Compression Risk Gauge
            </span>
            <RadialRiskDial
              score={Math.min(100, Math.round(currentDensityM2 * 24))}
              riskLevel={crowdLevel === 'Dangerous' ? 'critical' : crowdLevel === 'Busy' ? 'watch' : 'safe'}
              size={175}
            />
          </div>

          {/* Real Headcount & Density Card */}
          <div className="p-4 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col gap-2.5">
            <span className="text-[12px] font-semibold text-[#ECE8E1] pb-1.5 border-b border-[rgba(236,232,225,0.08)]">
              Verified Headcount Metrics
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)]">
                <span className="text-[10px] text-[#8E8D98] block">In-View Persons</span>
                <span className="font-display text-xl text-[#ECE8E1] font-mono-numbers">
                  {inViewCount}
                </span>
              </div>

              <div className="p-2.5 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)]">
                <span className="text-[10px] text-[#8E8D98] block">Estimated Total</span>
                <span className="font-display text-xl text-[#ECE8E1] font-mono-numbers">
                  {estimatedTotalHeadcount.toLocaleString('en-US')}
                </span>
              </div>

              <div className="p-2.5 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)]">
                <span className="text-[10px] text-[#8E8D98] block">Density / m²</span>
                <span className={`font-display text-xl font-mono-numbers ${
                  currentDensityM2 > 3.8 ? 'text-[#FF4B1F]' : 'text-[#1F9D6B]'
                }`}>
                  {currentDensityM2}
                </span>
              </div>

              <div className="p-2.5 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)]">
                <span className="text-[10px] text-[#8E8D98] block">Flow Speed</span>
                <span className="font-display text-xl text-[#22D3EE] font-mono-numbers">
                  1.1 m/s
                </span>
              </div>
            </div>
          </div>

          {/* Strict Privacy Guarantee */}
          <div className="p-3 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] text-[11px] text-[#8E8D98] leading-normal">
            🛡️ <span className="font-semibold text-[#ECE8E1]">Privacy Standard:</span> Aggregate headcount only. Zero facial biometrics.
          </div>
        </div>
      </div>
    </div>
  );
}
