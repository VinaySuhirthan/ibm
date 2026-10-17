import { create } from 'zustand';
import { VideoFeed, DetectionBox, RiskLevel, CrowdAlert, DensityCell } from '../lib/types';
import { FEEDS_FIXTURE, INITIAL_ALERTS_FIXTURE } from '../lib/fixtures';
import { CalibrationQuad, DEFAULT_CALIBRATION } from '../lib/homography';
import { computeDensityGrid, GRID_ROWS, GRID_COLS } from '../lib/density';
import { evaluateCrowdRisk } from '../lib/risk';

export type CameraPreset = 'top' | 'drone' | 'street' | 'cinematic';

export interface LayerVisibility {
  video: boolean;
  boxes: boolean;
  heatmap: boolean;
  flowVectors: boolean;
  evacuationRoutes: boolean;
  exits: boolean;
  medicalTriage: boolean;
  policePosts: boolean;
}

interface OpsStoreState {
  // Feeds
  feeds: VideoFeed[];
  activeFeedId: string;
  activeFeed: VideoFeed;
  setActiveFeed: (feedId: string) => void;

  // Playback & Timeline
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackSpeed: number;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;

  // Telemetry & Detections
  boxes: DetectionBox[];
  headcount: number;
  densityM2: number;
  peakDensityM2: number;
  flowSpeedMps: number;
  riskScore: number;
  riskLevel: RiskLevel;
  densityGrid: DensityCell[][];
  confidenceThreshold: number;
  setConfidenceThreshold: (val: number) => void;
  updateDetections: (boxes: DetectionBox[], inferenceTimeMs: number) => void;

  // Calibration
  calibration: CalibrationQuad;
  setCalibrationCorner: (corner: keyof Omit<CalibrationQuad, 'metricWidthMeters' | 'metricHeightMeters'>, x: number, y: number) => void;

  // 3D Layers & Camera
  layers: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;

  // Alerts
  alerts: CrowdAlert[];
  dismissAlert: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
  emergencyTriggered: boolean;
  setEmergencyTriggered: (val: boolean) => void;

  // Performance telemetry
  inferenceFps: number;
  renderFps: number;
  backend: string;
}

export const useOpsStore = create<OpsStoreState>((set, get) => ({
  feeds: FEEDS_FIXTURE,
  activeFeedId: 'DRONE-01',
  activeFeed: FEEDS_FIXTURE[0],
  setActiveFeed: (feedId: string) => {
    const feed = get().feeds.find(f => f.id === feedId) || get().feeds[0];
    set({ activeFeedId: feedId, activeFeed: feed, currentTime: 0 });
  },

  currentTime: 0,
  duration: 60,
  isPlaying: true,
  playbackSpeed: 1.0,
  setCurrentTime: (time: number) => set({ currentTime: Math.max(0, Math.min(get().duration, time)) }),
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),

  boxes: [],
  headcount: 1420,
  densityM2: 2.15,
  peakDensityM2: 3.40,
  flowSpeedMps: 1.15,
  riskScore: 28,
  riskLevel: 'safe',
  densityGrid: Array.from({ length: GRID_ROWS }, (_, r) =>
    Array.from({ length: GRID_COLS }, (_, c) => ({
      row: r,
      col: c,
      density: 1.2,
      status: 'safe' as RiskLevel
    }))
  ),
  confidenceThreshold: 0.45,
  setConfidenceThreshold: (val: number) => set({ confidenceThreshold: val }),

  updateDetections: (boxes: DetectionBox[], inferenceTimeMs: number) => {
    const { calibration, activeFeed } = get();
    const densityResult = computeDensityGrid(boxes, calibration);

    // Calculate flow speed from box velocity vectors
    let totalSpeed = 0;
    let countWithVel = 0;
    for (const b of boxes) {
      if (b.vx !== undefined && b.vy !== undefined) {
        const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy) * 60; // approximate m/s
        totalSpeed += spd;
        countWithVel++;
      }
    }
    const avgFlowSpeed = countWithVel > 0 ? Number((totalSpeed / countWithVel).toFixed(2)) : 0.85;

    // Scale count to full venue estimate
    const sampleAreaFraction = 0.08;
    const estimatedTotalCount = Math.max(
      activeFeed.initialHeadcount,
      Math.round(boxes.length / sampleAreaFraction)
    );

    const risk = evaluateCrowdRisk(
      densityResult.avgDensityM2,
      densityResult.maxDensityM2,
      avgFlowSpeed,
      estimatedTotalCount
    );

    const currentEmergency = get().emergencyTriggered;
    const shouldTriggerEmergency = risk.riskLevel === 'critical' && !currentEmergency;

    set({
      boxes,
      headcount: estimatedTotalCount,
      densityM2: densityResult.avgDensityM2,
      peakDensityM2: densityResult.maxDensityM2,
      flowSpeedMps: avgFlowSpeed,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      densityGrid: densityResult.grid,
      emergencyTriggered: currentEmergency || shouldTriggerEmergency,
      inferenceFps: Math.round(1000 / Math.max(16, inferenceTimeMs)),
      renderFps: 60
    });
  },

  calibration: DEFAULT_CALIBRATION,
  setCalibrationCorner: (corner, x, y) =>
    set(state => ({
      calibration: {
        ...state.calibration,
        [corner]: { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
      }
    })),

  layers: {
    video: true,
    boxes: true,
    heatmap: true,
    flowVectors: true,
    evacuationRoutes: true,
    exits: true,
    medicalTriage: true,
    policePosts: true
  },
  toggleLayer: (layer) =>
    set(state => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] }
    })),

  cameraPreset: 'drone',
  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  alerts: INITIAL_ALERTS_FIXTURE,
  dismissAlert: (id) =>
    set(state => ({ alerts: state.alerts.filter(a => a.id !== id) })),
  acknowledgeAlert: (id) =>
    set(state => ({
      alerts: state.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a)
    })),
  emergencyTriggered: false,
  setEmergencyTriggered: (val) => set({ emergencyTriggered: val }),

  inferenceFps: 15,
  renderFps: 60,
  backend: 'WASM / WebWorker (Interpolated 60 FPS)'
}));
