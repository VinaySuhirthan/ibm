/**
 * CivicConnect Video Feeds Configuration
 * 
 * ============================================================================
 * HOW TO CHANGE / ADD VIDEOS (DEV GUIDE):
 * ============================================================================
 * 1. Place your video file inside the `/public` folder (e.g., `public/my_video.mp4`).
 * 2. Update `videoSrc` below to point to your new file: `videoSrc: '/my_video.mp4'`.
 * 3. (Optional) Run `python scripts/make_assets.py public/my_video.mp4 my_video`
 *    to auto-generate depth maps and YOLO detections JSON, or leave them pointing
 *    to existing files / set to null.
 * 4. You can also add more feeds to the `VIDEO_FEEDS_CONFIG` array below.
 * ============================================================================
 */

export interface FeedOption {
  id: string;
  name: string;
  location: string;
  videoSrc: string;        // Path to video in /public (e.g., '/drone.mp4' or '/my_clip.mp4')
  depthSrc?: string;       // Optional: path to depth map video (e.g., '/drone_depth.mp4')
  detectionsSrc?: string;  // Optional: path to YOLO detections JSON (e.g., '/drone_detections.json')
  fps: number;
  type: 'drone' | 'cctv' | 'fixed' | 'custom';
  defaultAreaM2: number;
  description?: string;
}

export const VIDEO_FEEDS_CONFIG: FeedOption[] = [
  {
    id: 'DRONE-01',
    name: 'Sector 4 Ghat — Drone 01 (Aerial 1080p)',
    location: 'Prayagraj Sangam North Corridor',
    // CHANGE THIS TO YOUR DESIRED DRONE VIDEO:
    videoSrc: '/drone.mp4',
    depthSrc: '/drone_depth.mp4',
    detectionsSrc: '/drone_detections.json',
    fps: 29.97,
    type: 'drone',
    defaultAreaM2: 2400,
    description: 'Aerial high-angle crowd surveillance with calibrated 3D depth and YOLO person tracking.'
  },
  {
    id: 'CCTV-01',
    name: 'Perimeter Gate 2 — CCTV 01 (1080p)',
    location: 'Jantar Mantar Parliament St Ingress',
    // CHANGE THIS TO YOUR DESIRED CCTV VIDEO:
    videoSrc: '/cctv.mp4',
    depthSrc: '/cctv_depth.mp4',
    detectionsSrc: '/cctv_detections.json',
    fps: 29.97,
    type: 'cctv',
    defaultAreaM2: 850,
    description: 'Fixed high-mount perimeter CCTV monitoring gate turnstiles and bottleneck ingress.'
  }
];

// Primary default active feed
export const DEFAULT_FEED_ID = 'DRONE-01';
