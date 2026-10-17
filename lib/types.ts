export type RiskLevel = 'safe' | 'watch' | 'critical';

export interface DetectionBox {
  id: number;
  x: number;       // normalized [0, 1]
  y: number;       // normalized [0, 1]
  width: number;   // normalized [0, 1]
  height: number;  // normalized [0, 1]
  confidence: number;
  class: 'person';
  vx?: number;     // flow vector X
  vy?: number;     // flow vector Y
}

export interface VideoFeed {
  id: string;
  name: string;
  location: string;
  type: 'drone' | 'cctv' | 'fixed';
  resolution: string;
  fps: number;
  elevationMeters: number;
  calibratedAreaM2: number;
  initialHeadcount: number;
  streamUrl?: string;
  status: 'active' | 'degraded' | 'offline';
}

export interface DensityCell {
  row: number;
  col: number;
  density: number; // people per m²
  status: RiskLevel;
}

export interface TelemetryState {
  feedId: string;
  timestamp: number;
  headcount: number;
  peakHeadcount: number;
  densityM2: number; // average people / m²
  peakDensityM2: number;
  flowSpeedMps: number; // meters per second
  flowDirectionDeg: number;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  inferenceFps: number;
  renderFps: number;
  latencyMs: number;
  backend: 'WebGPU' | 'WASM' | 'Fallback Engine';
  boxes: DetectionBox[];
  activeAlerts: CrowdAlert[];
}

export interface CrowdAlert {
  id: string;
  timestamp: string;
  title: string;
  location: string;
  severity: RiskLevel;
  densityValue: number;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface AiPrediction {
  targetMinute: number;
  predictedHeadcount: number;
  predictedDensityM2: number;
  predictedRisk: RiskLevel;
  confidence: number;
}

export interface AiIntelligenceData {
  predictions: AiPrediction[];
  sentimentScore: number; // -1.0 to 1.0 (calm vs agitated)
  sentimentLabel: 'Calm / Orderly' | 'Restless' | 'High Tension';
  misinformationFlags: {
    id: string;
    claim: string;
    verificationStatus: 'Debunked' | 'Unverified' | 'Confirmed';
    source: string;
    reachEstimate: number;
  }[];
  duplicateDetections: {
    eventTitle: string;
    overlapScore: number;
    conflictLocation: string;
  }[];
}

export interface CivicEvent {
  id: string;
  title: string;
  slug: string;
  category: 'Civil Rights' | 'Religious Gathering' | 'Labor March' | 'Cultural Fair' | 'Student Assembly';
  description?: string;
  date: string;
  time: string;
  locationName: string;
  coordinates: [number, number]; // [lat, lng]
  organizerName: string;
  organizerRole: string;
  organizerVerified: boolean;
  expectedAttendance: number;
  registeredCount: number;
  status: 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Changes Requested';
  verifiedBadgeNumber?: string;
  verificationDate?: string;
  authoritiesNotified: string[];
  routePoints: { name: string; lat: number; lng: number }[];
  guidelines: string[];
  documents: {
    name: string;
    type: 'Police NOC' | 'Fire Clearance' | 'Municipal Permit' | 'Medical Plan';
    status: 'Verified' | 'Pending' | 'Rejected';
    uploadedAt: string;
    refNo: string;
  }[];
  liveUpdates: {
    timestamp: string;
    author: string;
    message: string;
    pinned?: boolean;
  }[];
}

export interface ForumPost {
  id: string;
  eventId?: string;
  author: string;
  authorRole?: string;
  avatarFallback: string;
  timestamp: string;
  title: string;
  body: string;
  category: 'Logistics' | 'Safety' | 'Legal Aid' | 'Medical' | 'General';
  upvotes: number;
  repliesCount: number;
  pinned?: boolean;
}

export interface CivicPoll {
  id: string;
  question: string;
  organizer: string;
  totalVotes: number;
  expiresIn: string;
  options: {
    id: string;
    label: string;
    votes: number;
  }[];
}

export interface MeshPeer {
  id: string;
  name: string;
  distanceMeters: number;
  protocol: 'BLE 5.2' | 'Wi-Fi Direct' | 'LoRa Multi-Hop';
  rssiDbm: number; // e.g. -58 dBm
  hopCount: number;
  batteryPercent: number;
  isRelay: boolean;
  packetsForwarded: number;
}

export interface OfflineChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  timestamp: string;
  content: string;
  status: 'synced' | 'mesh-relaying' | 'queued-local';
  hops: number;
  channel: 'broadcast' | 'medical-team' | 'general';
}

export interface TriageLocation {
  id: string;
  name: string;
  type: 'Hospital' | 'Police Staging' | 'Water / Medical Post' | 'Safe Exit';
  distanceMeters: number;
  estMinutesWalk: number;
  currentCapacity: 'Available' | 'Strained' | 'Saturated';
  coordinates: [number, number];
  contactRef: string;
}
