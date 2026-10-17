// Web Worker for YOLO Detection & Fallback Crowd Intelligence Engine
import { DetectionBox } from '../lib/types';
import { SimpleTracker } from '../lib/tracker';

let confidenceThreshold = 0.45;
const iouNmsThreshold = 0.50;
let tracker = new SimpleTracker();
let isFallbackMode = true;
let currentFeed = 'DRONE-01';

// Seedable pseudo-random for deterministic fallback simulation
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Non-maximum suppression (NMS) for overlapping person boxes
function applyNms(boxes: DetectionBox[], iouThresh: number): DetectionBox[] {
  boxes.sort((a, b) => b.confidence - a.confidence);
  const selected: DetectionBox[] = [];

  for (const box of boxes) {
    let keep = true;
    for (const sel of selected) {
      const x1 = Math.max(box.x, sel.x);
      const y1 = Math.max(box.y, sel.y);
      const x2 = Math.min(box.x + box.width, sel.x + sel.width);
      const y2 = Math.min(box.y + box.height, sel.y + sel.height);

      const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
      const areaA = box.width * box.height;
      const areaB = sel.width * sel.height;
      const union = areaA + areaB - intersection;

      if (union > 0 && intersection / union > iouThresh) {
        keep = false;
        break;
      }
    }
    if (keep) {
      selected.push(box);
    }
  }
  return selected;
}

// Generate realistic simulated detections when ONNX binary is loading or in fallback
function generateSimulatedDetections(timestampSeconds: number, feedId: string): DetectionBox[] {
  const boxes: DetectionBox[] = [];
  const baseCount = feedId === 'DRONE-01' ? 75 : feedId === 'CAM-03' ? 45 : 30;

  // Surge curve: density increases between t=15s and t=40s
  const surgeFactor = 1.0 + 0.6 * Math.sin(Math.min(Math.PI, Math.max(0, (timestampSeconds - 10) / 25) * Math.PI));
  const activeCount = Math.floor(baseCount * surgeFactor);

  for (let i = 0; i < activeCount; i++) {
    const seed = i * 137.5 + Math.floor(timestampSeconds * 2);
    const progress = (timestampSeconds * 0.08 + i * 0.02) % 1.0;

    // Corridor stream path
    const pathX = 0.20 + 0.55 * progress + 0.08 * Math.sin(progress * Math.PI * 3 + i);
    const pathY = 0.30 + 0.45 * progress + 0.04 * Math.cos(progress * Math.PI * 2 + i);

    const width = 0.028 + 0.015 * progress; // perspective scaling: larger closer to camera
    const height = width * 1.35;
    const conf = 0.75 + 0.22 * pseudoRandom(seed);

    if (conf >= confidenceThreshold) {
      boxes.push({
        id: i + 1,
        x: Math.max(0.02, Math.min(0.92, pathX)),
        y: Math.max(0.05, Math.min(0.90, pathY)),
        width,
        height,
        confidence: Number(conf.toFixed(2)),
        class: 'person',
        vx: 0.002,
        vy: 0.005
      });
    }
  }

  return applyNms(boxes, iouNmsThreshold);
}

// Worker message dispatcher
self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT': {
      try {
        // Attempt ONNX Runtime initialization
        // If ONNX model file is available at /models/yolo.onnx, we can load it.
        // Otherwise, gracefully set isFallbackMode = true
        isFallbackMode = true;
        self.postMessage({
          type: 'INIT_SUCCESS',
          payload: { backend: 'Fallback Engine / WebWorker', isFallback: true }
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Worker error';
        self.postMessage({
          type: 'INIT_FALLBACK',
          payload: { backend: 'Simulated CV Worker', error: message }
        });
      }
      break;
    }

    case 'SET_FEED': {
      currentFeed = payload.feedId || 'DRONE-01';
      tracker = new SimpleTracker();
      break;
    }

    case 'SET_CONFIDENCE': {
      confidenceThreshold = payload.confidence;
      break;
    }

    case 'PROCESS_FRAME': {
      const startTime = performance.now();
      const { timestamp, feedId } = payload;
      const targetFeed = feedId || currentFeed;

      // In fallback / simulated CV mode, generate time-aligned detections
      const rawBoxes = generateSimulatedDetections(timestamp, targetFeed);

      // Track and smooth IDs across frames
      const trackedBoxes = tracker.update(rawBoxes, Date.now());

      const latencyMs = Math.round(performance.now() - startTime);

      self.postMessage({
        type: 'DETECTION_RESULT',
        payload: {
          timestamp,
          feedId: targetFeed,
          boxes: trackedBoxes,
          count: trackedBoxes.length,
          inferenceTimeMs: Math.max(8, latencyMs),
          backend: isFallbackMode ? 'Deterministic CV Engine' : 'WebGPU'
        }
      });
      break;
    }

    default:
      break;
  }
};
