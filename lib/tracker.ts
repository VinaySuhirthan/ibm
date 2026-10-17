import { DetectionBox } from './types';

export interface TrackedPerson {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  vx: number;
  vy: number;
  history: [number, number][];
  lastSeen: number;
  age: number;
}

export class SimpleTracker {
  private tracks: TrackedPerson[] = [];
  private nextId = 1001;
  private maxAge = 15; // frames to keep without detection
  private iouThreshold = 0.3;
  private alpha = 0.65; // smoothing factor for EMA

  public update(detections: DetectionBox[], frameTimestamp: number): DetectionBox[] {
    const matchedTrackIndices = new Set<number>();
    const matchedDetectionIndices = new Set<number>();

    // Compute pairwise IoU
    for (let d = 0; d < detections.length; d++) {
      let bestIou = 0;
      let bestTrackIdx = -1;

      for (let t = 0; t < this.tracks.length; t++) {
        if (matchedTrackIndices.has(t)) continue;
        const iou = this.computeIoU(detections[d], this.tracks[t]);
        if (iou > bestIou && iou >= this.iouThreshold) {
          bestIou = iou;
          bestTrackIdx = t;
        }
      }

      if (bestTrackIdx !== -1) {
        matchedTrackIndices.add(bestTrackIdx);
        matchedDetectionIndices.add(d);

        const track = this.tracks[bestTrackIdx];
        const det = detections[d];

        // Velocity computation (optical-flow-lite)
        const dt = Math.max(1, (frameTimestamp - track.lastSeen) / 1000);
        const vx = (det.x - track.x) / dt;
        const vy = (det.y - track.y) / dt;

        // Exponential smoothing
        track.x = this.alpha * det.x + (1 - this.alpha) * track.x;
        track.y = this.alpha * det.y + (1 - this.alpha) * track.y;
        track.width = this.alpha * det.width + (1 - this.alpha) * track.width;
        track.height = this.alpha * det.height + (1 - this.alpha) * track.height;
        track.confidence = det.confidence;
        track.vx = this.alpha * vx + (1 - this.alpha) * track.vx;
        track.vy = this.alpha * vy + (1 - this.alpha) * track.vy;
        track.lastSeen = frameTimestamp;
        track.age++;

        track.history.push([track.x, track.y]);
        if (track.history.length > 20) track.history.shift();
      }
    }

    // New tracks for unmatched detections
    for (let d = 0; d < detections.length; d++) {
      if (!matchedDetectionIndices.has(d)) {
        const det = detections[d];
        this.tracks.push({
          id: this.nextId++,
          x: det.x,
          y: det.y,
          width: det.width,
          height: det.height,
          confidence: det.confidence,
          vx: 0,
          vy: 0,
          history: [[det.x, det.y]],
          lastSeen: frameTimestamp,
          age: 1
        });
      }
    }

    // Age out old tracks
    this.tracks = this.tracks.filter(t => (frameTimestamp - t.lastSeen) < (this.maxAge * 100));

    // Return smoothed boxes with IDs and flow vectors
    return this.tracks.map(t => ({
      id: t.id,
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height,
      confidence: t.confidence,
      class: 'person',
      vx: t.vx,
      vy: t.vy
    }));
  }

  private computeIoU(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): number {
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.width, b.x + b.width);
    const y2 = Math.min(a.y + a.height, b.y + b.height);

    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    const union = areaA + areaB - intersection;

    return union <= 0 ? 0 : intersection / union;
  }
}
