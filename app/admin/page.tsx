'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RadialRiskDial } from '../../components/ui/RadialRiskDial';
import { VIDEO_FEEDS_CONFIG, FeedOption, DEFAULT_FEED_ID } from '../../lib/videoConfig';
import { EVENTS_FIXTURE } from '../../lib/fixtures';
import { CivicEvent } from '../../lib/types';
import {
  IconArrowLeft,
  IconPlus,
  IconUpload,
  IconVideo,
  IconDrone,
  IconCctv,
  IconDocumentCheck,
  IconArrowRight
} from '../../components/icons/BespokeIcons';

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

function AdminLiveRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get('event');

  // All Events State
  const [eventsList, setEventsList] = useState<CivicEvent[]>(EVENTS_FIXTURE);

  // Sync selected event from URL search param
  const selectedEvent = useMemo(() => {
    if (!eventIdParam) return null;
    return eventsList.find((ev) => ev.id === eventIdParam) || null;
  }, [eventIdParam, eventsList]);

  // Available feeds list (supports custom uploaded videos)
  const [feeds, setFeeds] = useState<FeedOption[]>(VIDEO_FEEDS_CONFIG);
  const [activeFeedId, setActiveFeedId] = useState<string>(DEFAULT_FEED_ID);

  // Event search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Approved' | 'In Review'>('all');

  // Create Event Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<CivicEvent['category']>('Civil Rights');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-10-25');
  const [newEventTime, setNewEventTime] = useState('10:00 — 16:00 IST');
  const [newEventAttendance, setNewEventAttendance] = useState('15000');
  const [newEventOrganizer, setNewEventOrganizer] = useState('Civic Action Forum');

  // Video upload state
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [selectedPresetFeed, setSelectedPresetFeed] = useState<string>('DRONE-01');

  // Documents attached state
  const [attachedDocs, setAttachedDocs] = useState<Array<{ name: string; type: string; status: string; refNo: string }>>([
    { name: 'Police NOC & Route Clearance', type: 'Police NOC', status: 'Verified', refNo: 'NOC-DEL-8921' },
    { name: 'Municipal Assembly Ground Permit', type: 'Municipal Permit', status: 'Verified', refNo: 'MUN-PERM-304' }
  ]);
  const [newDocName, setNewDocName] = useState('');

  // Live Room View Mode: 'video' | 'depth' | 'split'
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
  const [detectionsError, setDetectionsError] = useState<string | null>(null);

  // Active Feed Object
  const activeFeed = feeds.find((f) => f.id === activeFeedId) || feeds[0];

  // Confidence & Area Settings
  const confidenceThreshold = 0.35;
  const calibratedAreaM2 = activeFeed?.defaultAreaM2 || 2400;
  const [layers, setLayers] = useState({
    boxes: true,
    labels: true,
    flowVectors: true,
    corridors: true,
    triagePins: true
  });

  // Handle Event Selection with URL push
  const handleSelectEvent = (event: CivicEvent) => {
    // Auto-map feed if event specifies one
    if (event.id === 'ev-jantar-mantar') {
      setActiveFeedId('CCTV-01');
    } else {
      setActiveFeedId('DRONE-01');
    }
    router.push(`/admin?event=${encodeURIComponent(event.id)}`);
  };

  // Video File Upload Handler
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedVideoFile(file);
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
    }
  };

  // Add document
  const handleAddDocument = () => {
    if (!newDocName.trim()) return;
    setAttachedDocs((prev) => [
      ...prev,
      {
        name: newDocName.trim(),
        type: 'Municipal Permit',
        status: 'Verified',
        refNo: `DOC-${Math.floor(1000 + Math.random() * 9000)}`
      }
    ]);
    setNewDocName('');
  };

  // Create Event Form Submission
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventId = `ev-custom-${Date.now()}`;
    const feedId = `FEED-${Date.now()}`;

    let videoSrc = '/drone.mp4';
    let depthSrc: string | undefined = '/drone_depth.mp4';
    let detectionsSrc: string | undefined = '/drone_detections.json';

    if (uploadedVideoUrl) {
      videoSrc = uploadedVideoUrl;
      depthSrc = undefined;
      detectionsSrc = '/drone_detections.json'; // fallback detections simulation
    } else if (selectedPresetFeed === 'CCTV-01') {
      videoSrc = '/cctv.mp4';
      depthSrc = '/cctv_depth.mp4';
      detectionsSrc = '/cctv_detections.json';
    }

    const newFeed: FeedOption = {
      id: feedId,
      name: `${newEventTitle || 'Custom Assembly'} Feed`,
      location: newEventLocation || 'Designated Corridor',
      videoSrc,
      depthSrc,
      detectionsSrc,
      fps: 29.97,
      type: uploadedVideoUrl ? 'custom' : selectedPresetFeed === 'CCTV-01' ? 'cctv' : 'drone',
      defaultAreaM2: 2000,
      description: uploadedVideoUrl ? 'User uploaded custom MP4 footage' : 'Synchronized tactical surveillance'
    };

    const newEvent: CivicEvent = {
      id: eventId,
      title: newEventTitle || 'Untitled Civic Assembly',
      slug: (newEventTitle || 'assembly').toLowerCase().replace(/\s+/g, '-'),
      category: newEventCategory,
      date: newEventDate,
      time: newEventTime,
      locationName: newEventLocation || 'Central Assembly Sector',
      coordinates: [28.6139, 77.2090],
      organizerName: newEventOrganizer,
      organizerRole: 'Coordinator',
      organizerVerified: true,
      expectedAttendance: parseInt(newEventAttendance, 10) || 10000,
      registeredCount: 1,
      status: 'Approved',
      authoritiesNotified: ['District Magistrate Office', 'Traffic Safety Cell'],
      routePoints: [],
      guidelines: ['Keep emergency corridors clear at all times.'],
      documents: attachedDocs.map((d) => ({
        name: d.name,
        type: d.type as CivicEvent['documents'][number]['type'],
        status: 'Verified',
        uploadedAt: new Date().toISOString().split('T')[0],
        refNo: d.refNo
      })),
      liveUpdates: [
        {
          timestamp: 'Just now',
          author: 'System',
          message: 'Assembly registered with attached surveillance footage.'
        }
      ]
    };

    setFeeds((prev) => [newFeed, ...prev]);
    setEventsList((prev) => [newEvent, ...prev]);
    setActiveFeedId(feedId);
    router.push(`/admin?event=${encodeURIComponent(newEvent.id)}`);
    setIsCreateModalOpen(false);

    // Reset draft fields
    setNewEventTitle('');
    setNewEventLocation('');
    setUploadedVideoFile(null);
    setUploadedVideoUrl(null);
  };

  // Load Detections JSON on active feed change
  useEffect(() => {
    let isCancelled = false;
    setDetectionsError(null);

    if (!activeFeed?.detectionsSrc) {
      setDetectionsData([]);
      return;
    }

    fetch(activeFeed.detectionsSrc)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data: FrameDetection[]) => {
        if (!isCancelled) {
          setDetectionsData(data);
          setDetectionsError(null);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setDetectionsError(`Detections unavailable (${err.message}). Displaying raw video without overlay.`);
          setDetectionsData([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeFeed?.detectionsSrc, activeFeed?.id]);

  // Current Frame Detections
  const currentFrameBoxes = useMemo(() => {
    if (!detectionsData || detectionsData.length === 0) return [];
    const fps = activeFeed?.fps || 29.97;
    const frameIdx = Math.min(
      detectionsData.length - 1,
      Math.max(0, Math.floor(currentTime * fps))
    );
    const frame = detectionsData[frameIdx] || detectionsData[0];
    if (!frame || !frame.boxes) return [];
    return frame.boxes.filter((b) => b.conf >= confidenceThreshold);
  }, [detectionsData, currentTime, activeFeed?.fps, confidenceThreshold]);

  // Real-time Telemetry Calculations
  const inViewCount = currentFrameBoxes.length;
  const sampleFraction = activeFeed?.type === 'drone' ? 0.05 : 0.12;
  const estimatedTotalHeadcount = Math.max(inViewCount, Math.round(inViewCount / sampleFraction));
  const currentDensityM2 = Number((estimatedTotalHeadcount / calibratedAreaM2).toFixed(2));

  const crowdLevel: 'Safe' | 'Busy' | 'Dangerous' =
    currentDensityM2 < 2.0 ? 'Safe' : currentDensityM2 <= 3.8 ? 'Busy' : 'Dangerous';

  // Synchronize 2D Canvas with Video
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (layers.boxes && currentFrameBoxes.length > 0) {
        for (const box of currentFrameBoxes) {
          const bx = box.x * canvas.width;
          const by = box.y * canvas.height;
          const bw = Math.max(12, box.w * canvas.width);
          const bh = Math.max(16, box.h * canvas.height);

          const boxColor =
            crowdLevel === 'Dangerous'
              ? '#FF4B1F'
              : crowdLevel === 'Busy'
              ? '#D97706'
              : '#1F9D6B';

          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 1.75;
          ctx.strokeRect(bx, by, bw, bh);

          if (layers.labels) {
            ctx.fillStyle = boxColor;
            ctx.fillRect(bx, Math.max(0, by - 14), 48, 14);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(`ID ${box.id}`, bx + 3, Math.max(10, by - 3));
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentFrameBoxes, layers, crowdLevel]);

  // Video Time Update Listener
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      if (depthVideoRef.current && Math.abs(depthVideoRef.current.currentTime - cur) > 0.15) {
        depthVideoRef.current.currentTime = cur;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 20);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (depthVideoRef.current) depthVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      if (depthVideoRef.current) depthVideoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

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

  // Filtered Events
  const filteredEvents = eventsList.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'Approved'
        ? ev.status === 'Approved'
        : ev.status === 'In Review';
    return matchesSearch && matchesStatus;
  });

  // ===========================================================================
  // VIEW 1: EVENTS HUB (When no event is actively launched)
  // ===========================================================================
  if (!selectedEvent) {
    return (
      <div className="flex flex-col gap-6 w-full font-ui text-[#ECE8E1]">
        {/* Top Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(236,232,225,0.08)] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-label text-[#FF4B1F] font-semibold uppercase tracking-wider text-[11px]">
                Tactical Command & Surveillance
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[rgba(255,75,31,0.12)] text-[#FF4B1F] text-[11px] font-semibold">
                LIVE CROWD INTELLIGENCE
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#ECE8E1] mt-1 font-semibold tracking-tight leading-tight">
              Assemblies & Live Feeds Overview
            </h1>
            <p className="text-[14px] text-[#8E8D98] mt-1 leading-normal">
              Select an assembly below to launch its real-time computer vision room, YOLO person tracking, and depth relief.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-civic-sm bg-[#1F9D6B] hover:bg-[#1F9D6B]/90 text-white font-semibold text-[13px] flex items-center gap-2 shadow-soft transition-all"
            >
              <IconPlus size={16} />
              <span>Create Event & Attach Video</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)]">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search assemblies by title or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[#ECE8E1] placeholder-[#8E8D98] text-[13px] focus:outline-none focus:border-[#1F9D6B]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {(['all', 'Approved', 'In Review'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors whitespace-nowrap ${
                  statusFilter === filter
                    ? 'bg-[#1F9D6B] text-white'
                    : 'bg-[#0E0E14] text-[#8E8D98] hover:text-[#ECE8E1] border border-[rgba(236,232,225,0.08)]'
                }`}
              >
                {filter === 'all' ? 'All Assemblies' : filter === 'Approved' ? 'Active / Approved' : 'In Review'}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => {
            const isDroneLinked = ev.id === 'ev-kumbh-2025';
            const isCctvLinked = ev.id === 'ev-jantar-mantar';

            return (
              <div
                key={ev.id}
                className="p-5 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] hover:border-[rgba(236,232,225,0.2)] shadow-soft flex flex-col justify-between gap-4 transition-all group"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[rgba(236,232,225,0.06)] text-[11px] font-semibold text-[#8E8D98]">
                      {ev.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        ev.status === 'Approved'
                          ? 'bg-[rgba(31,157,107,0.15)] text-[#1F9D6B]'
                          : 'bg-[rgba(217,119,6,0.15)] text-[#D97706]'
                      }`}
                    >
                      {ev.status === 'Approved' ? 'Monitoring Live' : 'Pending Review'}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-[#ECE8E1] leading-snug group-hover:text-white">
                    {ev.title}
                  </h3>

                  <p className="text-[13px] text-[#8E8D98] leading-normal line-clamp-2">
                    📍 {ev.locationName}
                  </p>

                  <div className="flex items-center gap-3 text-[12px] text-[#8E8D98] font-mono-numbers pt-1">
                    <span>🗓️ {ev.date}</span>
                    <span>⏰ {ev.time}</span>
                  </div>

                  {/* Footage Link Badge */}
                  <div className="mt-2 p-2.5 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.06)] flex items-center gap-2 text-[12px]">
                    {isDroneLinked ? (
                      <>
                        <IconDrone size={15} className="text-[#1F9D6B]" />
                        <span className="text-[#ECE8E1] font-medium">Sector 4 Drone 01 (Aerial 1080p)</span>
                      </>
                    ) : isCctvLinked ? (
                      <>
                        <IconCctv size={15} className="text-[#22D3EE]" />
                        <span className="text-[#ECE8E1] font-medium">Perimeter CCTV 01 (Ingress Gate)</span>
                      </>
                    ) : (
                      <>
                        <IconVideo size={15} className="text-[#D97706]" />
                        <span className="text-[#ECE8E1] font-medium">Custom Attached MP4 Footage</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[rgba(236,232,225,0.08)] flex items-center justify-between gap-3">
                  <div className="flex flex-col text-[11px] text-[#8E8D98]">
                    <span>Expected Crowd</span>
                    <span className="font-semibold text-[#ECE8E1] text-[13px] font-mono-numbers">
                      ~{ev.expectedAttendance.toLocaleString()} pax
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectEvent(ev)}
                    className="px-3.5 py-1.5 rounded-civic-sm bg-[rgba(236,232,225,0.08)] hover:bg-[#1F9D6B] hover:text-white text-[#ECE8E1] text-[12px] font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <span>Launch Live Room</span>
                    <IconArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CREATE EVENT MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.12)] p-6 shadow-2xl flex flex-col gap-5 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(236,232,225,0.08)]">
                <div>
                  <h2 className="font-display text-xl font-semibold text-[#ECE8E1]">
                    Register Assembly & Attach Video
                  </h2>
                  <p className="text-[13px] text-[#8E8D98] mt-0.5">
                    Attach statutory clearances and upload single MP4 video footage for AI telemetry.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded text-[#8E8D98] hover:text-white hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
                {/* Notice Banner */}
                <div className="p-3.5 rounded-civic-sm bg-[rgba(34,211,238,0.08)] border border-[rgba(34,211,238,0.2)] text-[12px] text-[#22D3EE] leading-normal flex items-start gap-2.5">
                  <IconVideo size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Surveillance Feed Configuration:</span>
                    Currently, upload a single MP4 video file for automated crowd intelligence analysis. In future updates, live camera RTSP / WebRTC stream access and multi-angle drone feeds will connect directly.
                  </div>
                </div>

                {/* Event Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-semibold text-[#8E8D98] block mb-1">
                      Assembly / Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Civic Freedom Rally 2026"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[#ECE8E1] text-[13px] focus:outline-none focus:border-[#1F9D6B]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[#8E8D98] block mb-1">
                      Assembly Category
                    </label>
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value as CivicEvent['category'])}
                      className="w-full px-3 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[#ECE8E1] text-[13px] focus:outline-none focus:border-[#1F9D6B]"
                    >
                      <option value="Civil Rights">Civil Rights</option>
                      <option value="Religious Gathering">Religious Gathering</option>
                      <option value="Labor March">Labor March</option>
                      <option value="Cultural Fair">Cultural Fair</option>
                      <option value="Student Assembly">Student Assembly</option>
                    </select>
                  </div>
                </div>

                {/* Location & Attendance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-semibold text-[#8E8D98] block mb-1">
                      Assembly Location Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramleela Maidan, Central Delhi"
                      value={newEventLocation}
                      onChange={(e) => setNewEventLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[#ECE8E1] text-[13px] focus:outline-none focus:border-[#1F9D6B]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[#8E8D98] block mb-1">
                      Expected Attendance
                    </label>
                    <input
                      type="number"
                      placeholder="15000"
                      value={newEventAttendance}
                      onChange={(e) => setNewEventAttendance(e.target.value)}
                      className="w-full px-3 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[#ECE8E1] text-[13px] focus:outline-none focus:border-[#1F9D6B]"
                    />
                  </div>
                </div>

                {/* Date, Time & Organizer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[12px] font-semibold text-[#8E8D98] block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[#ECE8E1] text-[13px] focus:outline-none focus:border-[#1F9D6B]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[#8E8D98] block mb-1">
                      Time Slot
                    </label>
                    <input
                      type="text"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[#ECE8E1] text-[13px] focus:outline-none focus:border-[#1F9D6B]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[#8E8D98] block mb-1">
                      Organizing Body
                    </label>
                    <input
                      type="text"
                      value={newEventOrganizer}
                      onChange={(e) => setNewEventOrganizer(e.target.value)}
                      placeholder="e.g. Civil Defense Forum"
                      className="w-full px-3 py-2 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[#ECE8E1] text-[13px] focus:outline-none focus:border-[#1F9D6B]"
                    />
                  </div>
                </div>

                {/* Statutory Clearances & Documents Section */}
                <div className="p-3 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex flex-col gap-2.5">
                  <span className="text-[12px] font-semibold text-[#ECE8E1] flex items-center gap-1.5">
                    <IconDocumentCheck size={15} className="text-[#1F9D6B]" />
                    <span>Attached Clearances & Permits ({attachedDocs.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {attachedDocs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded bg-[#16161F] border border-[rgba(236,232,225,0.08)] text-[11px] text-[#ECE8E1] flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1F9D6B]" />
                        <span>{doc.name}</span>
                        <span className="text-[#8E8D98]">({doc.refNo})</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add another permit (e.g. Fire Safety Clearance #401)..."
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-civic-sm bg-[#16161F] border border-[rgba(236,232,225,0.1)] text-[#ECE8E1] text-[12px] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddDocument}
                      className="px-3 py-1.5 rounded-civic-sm bg-[rgba(236,232,225,0.08)] hover:bg-white/10 text-[12px] text-white"
                    >
                      Attach
                    </button>
                  </div>
                </div>

                {/* Video Upload or Preset Feed Selection */}
                <div className="p-3.5 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex flex-col gap-3">
                  <span className="text-[12px] font-semibold text-[#ECE8E1] flex items-center gap-1.5">
                    <IconUpload size={15} className="text-[#22D3EE]" />
                    <span>Attach Surveillance Video (Single MP4)</span>
                  </span>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="w-full sm:w-auto px-4 py-2.5 rounded-civic-sm bg-[#1F9D6B]/15 border border-[#1F9D6B]/30 hover:bg-[#1F9D6B]/25 text-[#1F9D6B] text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all">
                      <IconUpload size={15} />
                      <span>{uploadedVideoFile ? 'Change MP4 File' : 'Browse MP4 Video File'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleVideoFileChange}
                        className="hidden"
                      />
                    </label>

                    <span className="text-[12px] text-[#8E8D98]">or select existing calibrated preset:</span>

                    <select
                      value={selectedPresetFeed}
                      onChange={(e) => {
                        setSelectedPresetFeed(e.target.value);
                        setUploadedVideoFile(null);
                        setUploadedVideoUrl(null);
                      }}
                      className="px-3 py-2 rounded-civic-sm bg-[#16161F] border border-[rgba(236,232,225,0.1)] text-[#ECE8E1] text-[12px] focus:outline-none"
                    >
                      <option value="DRONE-01">Sector 4 Drone (drone.mp4)</option>
                      <option value="CCTV-01">Perimeter CCTV (cctv.mp4)</option>
                    </select>
                  </div>

                  {uploadedVideoFile && (
                    <div className="p-2.5 rounded bg-[#16161F] border border-[rgba(236,232,225,0.08)] flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2 text-[#1F9D6B]">
                        <span className="w-2 h-2 rounded-full bg-[#1F9D6B] animate-pulse" />
                        <span className="font-semibold text-white">{uploadedVideoFile.name}</span>
                        <span className="text-[#8E8D98]">
                          ({(uploadedVideoFile.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>
                      <span className="text-[#22D3EE] font-mono-numbers">Ready for live playback</span>
                    </div>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(236,232,225,0.08)]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-civic-sm bg-transparent hover:bg-white/5 text-[#8E8D98] hover:text-white text-[13px] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-civic-sm bg-[#1F9D6B] hover:bg-[#1F9D6B]/90 text-white text-[13px] font-semibold flex items-center gap-2 shadow-soft"
                  >
                    <span>Create Event & Launch Live Room</span>
                    <IconArrowRight size={15} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===========================================================================
  // VIEW 2: LIVE CROWD INTELLIGENCE ROOM (For Selected Event)
  // ===========================================================================
  return (
    <div className="flex flex-col gap-5 w-full font-ui text-[#ECE8E1]">
      {/* Top Console Navigation & Event Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[rgba(236,232,225,0.08)] gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-civic-sm bg-[#16161F] hover:bg-[#1C1C28] text-[#ECE8E1] hover:text-white text-[12px] font-semibold flex items-center gap-1.5 border border-[rgba(236,232,225,0.08)] transition-all shadow-sm"
            >
              <IconArrowLeft size={14} />
              <span>Back to All Events</span>
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(255,75,31,0.12)] text-[#FF4B1F] text-[11px] font-semibold">
              LIVE MONITORING
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl text-[#ECE8E1] mt-1.5 font-semibold tracking-tight leading-tight">
            {selectedEvent.title}
          </h1>
          <p className="text-[13px] text-[#8E8D98] mt-0.5 leading-normal">
            📍 {selectedEvent.locationName} • 🗓️ {selectedEvent.date} ({selectedEvent.time}) • Expected: ~{selectedEvent.expectedAttendance.toLocaleString()} pax
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Feed Selector Dropdown */}
          <div className="flex items-center gap-2 bg-[#16161F] px-3 py-1.5 rounded-civic-sm border border-[rgba(236,232,225,0.08)]">
            <span className="text-[11px] uppercase tracking-wider text-[#8E8D98] font-semibold">Feed:</span>
            <select
              value={activeFeedId}
              onChange={(e) => setActiveFeedId(e.target.value)}
              className="bg-transparent text-[13px] text-[#ECE8E1] font-medium focus:outline-none cursor-pointer"
            >
              {feeds.map((feed) => (
                <option key={feed.id} value={feed.id} className="bg-[#16161F] text-[#ECE8E1]">
                  {feed.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle: Video / Depth / Split */}
          <div className="flex items-center bg-[#16161F] p-0.5 rounded-civic-sm border border-[rgba(236,232,225,0.08)]">
            {(['video', 'depth', 'split'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-civic-sm text-[12px] font-semibold capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-[#1F9D6B] text-white shadow-sm'
                    : 'text-[#8E8D98] hover:text-[#ECE8E1]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Layer Toggles */}
          <div className="flex items-center gap-2.5 bg-[#16161F] px-3 py-1.5 rounded-civic-sm border border-[rgba(236,232,225,0.08)] text-[12px]">
            <label className="flex items-center gap-1.5 text-[#ECE8E1] cursor-pointer">
              <input
                type="checkbox"
                checked={layers.boxes}
                onChange={(e) => setLayers((prev) => ({ ...prev, boxes: e.target.checked }))}
                className="accent-[#1F9D6B]"
              />
              <span className="text-[11px] font-medium">Boxes</span>
            </label>
            <label className="flex items-center gap-1.5 text-[#ECE8E1] cursor-pointer">
              <input
                type="checkbox"
                checked={layers.labels}
                onChange={(e) => setLayers((prev) => ({ ...prev, labels: e.target.checked }))}
                className="accent-[#1F9D6B]"
              />
              <span className="text-[11px] font-medium">IDs</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Command Center Grid: 8 Cols Viewport / 4 Cols Telemetry Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Video Viewport & Playback Timeline (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Center Stage Video Player & Detection Canvas */}
          <div className="relative w-full aspect-video bg-[#000000] rounded-civic-lg overflow-hidden border border-[rgba(236,232,225,0.08)] shadow-2xl flex items-center justify-center">
            {/* RGB Video */}
            <video
              ref={videoRef}
              src={activeFeed?.videoSrc || '/drone.mp4'}
              className={`absolute inset-0 w-full h-full object-cover ${
                viewMode === 'depth' ? 'hidden' : viewMode === 'split' ? 'w-1/2 left-0' : 'w-full'
              }`}
              playsInline
              muted
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnded}
            />

            {/* Depth Map Video */}
            {activeFeed?.depthSrc && (
              <video
                ref={depthVideoRef}
                src={activeFeed.depthSrc}
                className={`absolute inset-0 w-full h-full object-cover filter contrast-125 ${
                  viewMode === 'video' ? 'hidden' : viewMode === 'split' ? 'w-1/2 left-1/2 border-l border-white/20' : 'w-full'
                }`}
                playsInline
                muted
                autoPlay
              />
            )}

            {/* 2D Canvas for YOLO Detections */}
            <canvas
              ref={canvasRef}
              width={1920}
              height={1080}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
                viewMode === 'depth' ? 'hidden' : viewMode === 'split' ? 'w-1/2 left-0' : 'w-full'
              }`}
            />

            {/* HUD Overlay Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#0E0E14]/85 backdrop-blur-md px-2.5 py-1 rounded-civic-sm border border-[rgba(236,232,225,0.12)] text-[11px] font-mono-numbers">
              <span className="w-2 h-2 rounded-full bg-[#1F9D6B] animate-pulse" />
              <span>LIVE FEED: {activeFeed?.id}</span>
              <span className="text-[#8E8D98]">• {activeFeed?.fps || 29.97} FPS</span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-2 bg-[#0E0E14]/85 backdrop-blur-md px-3 py-1 rounded-civic-sm border border-[rgba(236,232,225,0.12)] text-[12px] font-mono-numbers">
              <span
                className={`w-2 h-2 rounded-full ${
                  crowdLevel === 'Dangerous'
                    ? 'bg-[#FF4B1F]'
                    : crowdLevel === 'Busy'
                    ? 'bg-[#D97706]'
                    : 'bg-[#1F9D6B]'
                }`}
              />
              <span className="font-semibold text-white">Status: {crowdLevel}</span>
            </div>

            {detectionsError && (
              <div className="absolute bottom-3 left-3 bg-[#FF4B1F]/90 backdrop-blur-md text-white text-[12px] px-3 py-1.5 rounded-civic-sm">
                {detectionsError}
              </div>
            )}
          </div>

          {/* Timeline Scrubber & Playback Controls */}
          <div className="p-4 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] flex flex-col gap-3">
            <div className="flex items-center justify-between text-[12px] font-mono-numbers text-[#8E8D98]">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="px-3 py-1 rounded bg-[rgba(236,232,225,0.08)] hover:bg-[#1F9D6B] hover:text-white text-[#ECE8E1] font-semibold text-[12px] transition-colors"
                >
                  {isPlaying ? 'Pause ⏸' : 'Play ▶'}
                </button>
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    isLooping ? 'bg-[#1F9D6B]/20 text-[#1F9D6B]' : 'bg-transparent text-[#8E8D98]'
                  }`}
                >
                  Loop: {isLooping ? 'ON' : 'OFF'}
                </button>
                <div className="flex items-center gap-1 bg-[#0E0E14] px-1.5 py-0.5 rounded text-[11px]">
                  {[1.0, 1.5, 2.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        setPlaybackSpeed(spd);
                        if (videoRef.current) videoRef.current.playbackRate = spd;
                        if (depthVideoRef.current) depthVideoRef.current.playbackRate = spd;
                      }}
                      className={`px-1.5 py-0.5 rounded ${
                        playbackSpeed === spd ? 'bg-[#1F9D6B] text-white font-bold' : 'text-[#8E8D98] hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span>{currentTime.toFixed(1)}s</span> / <span>{duration.toFixed(1)}s</span>
              </div>
            </div>

            {/* Slider Track */}
            <input
              type="range"
              min="0"
              max={duration || 20}
              step="0.05"
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (videoRef.current) videoRef.current.currentTime = val;
                if (depthVideoRef.current) depthVideoRef.current.currentTime = val;
              }}
              className="w-full accent-[#1F9D6B] cursor-pointer"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Telemetry & Risk Gauges (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Radial Risk Dial Panel */}
          <div className="p-5 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] flex flex-col items-center text-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#8E8D98] font-semibold">
              Live Sector Risk Gauge
            </span>
            <RadialRiskDial
              score={Math.min(100, Math.round(currentDensityM2 * 22))}
              level={crowdLevel === 'Dangerous' ? 'critical' : crowdLevel === 'Busy' ? 'watch' : 'safe'}
              size={170}
            />
            <div className="text-[13px] text-[#ECE8E1] font-medium">
              Density: <span className="font-mono-numbers font-bold text-white">{currentDensityM2} pax/m²</span>
            </div>
          </div>

          {/* Key Metrics Counters Grid */}
          <div className="p-4 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#8E8D98] font-semibold">
              Real-time In-View Telemetry
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)]">
                <span className="text-[11px] text-[#8E8D98] block">In-View Persons</span>
                <span className="font-display text-2xl text-[#ECE8E1] font-mono-numbers font-bold">
                  {inViewCount}
                </span>
              </div>

              <div className="p-3 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)]">
                <span className="text-[11px] text-[#8E8D98] block">Estimated Total</span>
                <span className="font-display text-2xl text-[#ECE8E1] font-mono-numbers font-bold">
                  {estimatedTotalHeadcount.toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)]">
                <span className="text-[11px] text-[#8E8D98] block">Flow Speed</span>
                <span className="font-display text-xl text-[#22D3EE] font-mono-numbers font-bold">
                  1.1 m/s
                </span>
              </div>

              <div className="p-3 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)]">
                <span className="text-[11px] text-[#8E8D98] block">Crowd State</span>
                <span
                  className={`font-display text-xl font-bold ${
                    crowdLevel === 'Dangerous'
                      ? 'text-[#FF4B1F]'
                      : crowdLevel === 'Busy'
                      ? 'text-[#D97706]'
                      : 'text-[#1F9D6B]'
                  }`}
                >
                  {crowdLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Attached Statutory Permits for This Event */}
          <div className="p-4 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] flex flex-col gap-2.5">
            <span className="text-[11px] uppercase tracking-wider text-[#8E8D98] font-semibold">
              Statutory Documents for this Event
            </span>
            <div className="flex flex-col gap-2">
              {selectedEvent.documents && selectedEvent.documents.length > 0 ? (
                selectedEvent.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex items-center justify-between text-[12px]"
                  >
                    <div className="flex items-center gap-2">
                      <IconDocumentCheck size={14} className="text-[#1F9D6B]" />
                      <span className="text-[#ECE8E1] font-medium">{doc.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#1F9D6B]/15 text-[#1F9D6B] text-[10px] font-semibold">
                      {doc.status}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-[12px] text-[#8E8D98]">Standard Magistrate permit issued.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLiveRoomPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#8E8D98] font-mono-numbers">Loading assembly intelligence...</div>}>
      <AdminLiveRoomContent />
    </Suspense>
  );
}
