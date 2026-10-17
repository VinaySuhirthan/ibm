import { VideoFeed, CivicEvent, ForumPost, CivicPoll, MeshPeer, OfflineChatMessage, TriageLocation, AiIntelligenceData, CrowdAlert } from './types';

export const FEEDS_FIXTURE: VideoFeed[] = [
  {
    id: 'DRONE-01',
    name: 'Sector 4 Ghat Approach — Drone 01',
    location: 'Prayagraj Sangam North Corridor',
    type: 'drone',
    resolution: '4K @ 60 FPS (Downscaled 1080p)',
    fps: 60,
    elevationMeters: 42.5,
    calibratedAreaM2: 2400,
    initialHeadcount: 1420,
    status: 'active'
  },
  {
    id: 'CAM-03',
    name: 'Perimeter Gate 2 — High Mount CCTV',
    location: 'Jantar Mantar Parliament St Ingress',
    type: 'cctv',
    resolution: '1080p @ 30 FPS',
    fps: 30,
    elevationMeters: 14.0,
    calibratedAreaM2: 850,
    initialHeadcount: 485,
    status: 'active'
  },
  {
    id: 'GATE-EAST',
    name: 'East Turnstile Bottleneck — Fixed Array',
    location: 'Karur Civic Pavilion Egress',
    type: 'fixed',
    resolution: '1080p @ 30 FPS',
    fps: 30,
    elevationMeters: 8.5,
    calibratedAreaM2: 420,
    initialHeadcount: 290,
    status: 'active'
  }
];

export const AI_INTELLIGENCE_FIXTURE: AiIntelligenceData = {
  predictions: [
    { targetMinute: 2, predictedHeadcount: 1480, predictedDensityM2: 2.45, predictedRisk: 'safe', confidence: 0.94 },
    { targetMinute: 5, predictedHeadcount: 1720, predictedDensityM2: 3.12, predictedRisk: 'watch', confidence: 0.89 },
    { targetMinute: 8, predictedHeadcount: 2190, predictedDensityM2: 4.35, predictedRisk: 'critical', confidence: 0.82 },
    { targetMinute: 10, predictedHeadcount: 2450, predictedDensityM2: 5.10, predictedRisk: 'critical', confidence: 0.78 }
  ],
  sentimentScore: -0.15,
  sentimentLabel: 'Restless',
  misinformationFlags: [
    {
      id: 'MIS-902',
      claim: 'Rumor of Gate 4 barricade collapse propagating on WhatsApp groups',
      verificationStatus: 'Debunked',
      source: 'Telegram Channel "CivicVoice_09"',
      reachEstimate: 4200
    },
    {
      id: 'MIS-903',
      claim: 'Water stations reported out of service along Western Pier',
      verificationStatus: 'Confirmed',
      source: 'Sector Volunteer Radio Check',
      reachEstimate: 850
    }
  ],
  duplicateDetections: [
    {
      eventTitle: 'Citizen Vigil for Clean Air & Civic Health',
      overlapScore: 0.88,
      conflictLocation: 'Shared Route: Barakhamba Circle between 14:00 - 16:00'
    }
  ]
};

export const INITIAL_ALERTS_FIXTURE: CrowdAlert[] = [
  {
    id: 'ALT-104',
    timestamp: '12:48:10',
    title: 'Density Threshold Breached in Sector 4B',
    location: 'North Walkway Chokepoint #2',
    severity: 'critical',
    densityValue: 4.82,
    recommendedAction: 'Engage Secondary Egress Route C. Dispatch Marshal Squad 3 to hold North Entry.',
    acknowledged: false
  },
  {
    id: 'ALT-103',
    timestamp: '12:35:22',
    title: 'Compressive Surge Detected Near Pier 7',
    location: 'Sector 4 Ghat Transition',
    severity: 'watch',
    densityValue: 3.65,
    recommendedAction: 'Broadcast slow-down beacon. Coordinate with water tanker escort.',
    acknowledged: true
  }
];

export const EVENTS_FIXTURE: CivicEvent[] = [
  {
    id: 'ev-kumbh-2025',
    title: 'Sector 4 Sacred Ghat Gathering & Pilgrimage Ingress',
    slug: 'sector-4-sacred-ghat-gathering',
    category: 'Religious Gathering',
    date: '2026-10-18',
    time: '04:00 — 20:00 IST',
    locationName: 'Sangam North Embankment, Prayagraj',
    coordinates: [25.4358, 81.8463],
    organizerName: 'Prayagraj Mela Civic Safety Cell',
    organizerRole: 'Designated Safety Warden',
    organizerVerified: true,
    expectedAttendance: 250000,
    registeredCount: 184520,
    status: 'Approved',
    verifiedBadgeNumber: 'UP-CIVIC-2026-08492',
    verificationDate: '2026-10-12',
    authoritiesNotified: [
      'Superintendent of Police (Mela Traffic)',
      'Chief Medical Officer (Emergency Response)',
      'National Disaster Response Force (NDRF 11 Bn)',
      'Municipal Sanitation Directorate'
    ],
    routePoints: [
      { name: 'Kalyani Staging Buffer', lat: 25.4320, lng: 81.8410 },
      { name: 'North Pontoon Bridge 3', lat: 25.4345, lng: 81.8435 },
      { name: 'Ghat Sector 4 Bathing Apron', lat: 25.4360, lng: 81.8465 },
      { name: 'Eastern Exit Ramp & Dispersal Loop', lat: 25.4380, lng: 81.8490 }
    ],
    guidelines: [
      'Maintain continuous forward momentum; strictly no stationary assemblies on pontoon approaches.',
      'Emergency medical cordons at 200m intervals marked with amber aerial balloons.',
      'In the event of network disruption, CivicConnect mesh switches automatically to local Bluetooth relay.',
      'Children and seniors must wear designated barcode safety tags available at Buffer Zone 1.'
    ],
    documents: [
      { name: 'Police NOC & Crowd Flow Clearance', type: 'Police NOC', status: 'Verified', uploadedAt: '2026-10-10', refNo: 'POL/MEL/2026/778' },
      { name: 'Fire & Pontoon Structural Certificate', type: 'Fire Clearance', status: 'Verified', uploadedAt: '2026-10-11', refNo: 'FS-PRY-9921' },
      { name: 'Comprehensive Medical Triage Protocol', type: 'Medical Plan', status: 'Verified', uploadedAt: '2026-10-12', refNo: 'MED-TRI-104' }
    ],
    liveUpdates: [
      { timestamp: '12:45 IST', author: 'Sector Marshal Desk', message: 'Pontoon 3 transit time is currently 14 minutes. Water stations 4 and 5 fully replenished.', pinned: true },
      { timestamp: '12:10 IST', author: 'NDRF Command', message: 'Medical emergency lane along Eastern Ramp kept strictly clear. Please yield immediately if sirens sound.' }
    ]
  },
  {
    id: 'ev-jantar-mantar',
    title: 'Peaceful Citizens Assembly on Environmental Accountability',
    slug: 'peaceful-citizens-assembly-environment',
    category: 'Civil Rights',
    date: '2026-10-20',
    time: '10:00 — 17:00 IST',
    locationName: 'Jantar Mantar Road, Central Delhi',
    coordinates: [28.6271, 77.2166],
    organizerName: 'Clean Air Democratic Initiative',
    organizerRole: 'Lead Convener',
    organizerVerified: true,
    expectedAttendance: 15000,
    registeredCount: 9420,
    status: 'Approved',
    verifiedBadgeNumber: 'DL-PERMIT-2026-0419',
    verificationDate: '2026-10-14',
    authoritiesNotified: [
      'Parliament Street Police Station',
      'Delhi Traffic Police Traffic Advisory Desk',
      'NDMC Civic Services'
    ],
    routePoints: [
      { name: 'Patel Chowk Metro Gate 2 Assembly', lat: 28.6235, lng: 77.2140 },
      { name: 'Ashoka Road Ingress Corridor', lat: 28.6255, lng: 77.2155 },
      { name: 'Main Rostrum Area (Sound Permitted Zone)', lat: 28.6272, lng: 77.2168 },
      { name: 'Tolstoy Road Dispersal Hub', lat: 28.6290, lng: 77.2185 }
    ],
    guidelines: [
      'Sound amplification capped strictly at 65 dB per Supreme Court guidelines.',
      'First-aid volunteers equipped with high-visibility cyan vests spaced every 50 meters.',
      'CivicConnect Offline Mesh mode tested: peer synchronization verified without cell towers.'
    ],
    documents: [
      { name: 'Delhi Police Designated Assembly Permission', type: 'Police NOC', status: 'Verified', uploadedAt: '2026-10-13', refNo: 'DCP/NEW-DELHI/8821' },
      { name: 'Sound & Generator Pollution Clearance', type: 'Municipal Permit', status: 'Verified', uploadedAt: '2026-10-14', refNo: 'NDMC-ENV-3301' }
    ],
    liveUpdates: [
      { timestamp: '11:00 IST', author: 'Organizing Committee', message: 'Legal observers deployed at Metro Gate 2 and Tolstoy Marg intersection.' }
    ]
  },
  {
    id: 'ev-farmers-march',
    title: 'All-India Labor & Agrarian Solidarity Forum',
    slug: 'all-india-labor-agrarian-forum',
    category: 'Labor March',
    date: '2026-10-24',
    time: '08:00 — 18:00 IST',
    locationName: 'Ramleela Maidan, New Delhi',
    coordinates: [28.6433, 77.2343],
    organizerName: 'Kisan & Shramik Samiti Union',
    organizerRole: 'General Secretary',
    organizerVerified: true,
    expectedAttendance: 65000,
    registeredCount: 41200,
    status: 'In Review',
    authoritiesNotified: ['Delhi Police Headquarters', 'Central Fire Brigade'],
    routePoints: [
      { name: 'Ajmeri Gate Staging Point', lat: 28.6410, lng: 77.2310 },
      { name: 'Ramleela Main Grounds', lat: 28.6433, lng: 77.2343 },
      { name: 'Asaf Ali Road North Evac corridor', lat: 28.6450, lng: 77.2365 }
    ],
    guidelines: ['Tractor parking allocated at Burari grounds only; shuttle buses active.'],
    documents: [
      { name: 'Ground Booking Allotment', type: 'Municipal Permit', status: 'Verified', uploadedAt: '2026-10-15', refNo: 'MCD-RLM-2026' },
      { name: 'Traffic Corridor Alignment Plan', type: 'Police NOC', status: 'Pending', uploadedAt: '2026-10-16', refNo: 'POL-REV-901' }
    ],
    liveUpdates: []
  }
];

export const FORUM_POSTS_FIXTURE: ForumPost[] = [
  {
    id: 'post-01',
    author: 'Dr. Radhika Menon',
    authorRole: 'Chief Emergency Triage Volunteer',
    avatarFallback: 'RM',
    timestamp: '28m ago',
    title: 'Heatstroke Prevention & Hydration Staging along Sector 4 Approach',
    body: 'Temperatures on the Sangam embankment are tracking 3°C above baseline. We have placed 8 ORS hydration tanks between Pontoon 2 and 4. If someone exhibits dizziness or clammy skin, direct them immediately to Triage Tent Delta with the vermilion flag.',
    category: 'Medical',
    upvotes: 142,
    repliesCount: 19,
    pinned: true
  },
  {
    id: 'post-02',
    author: 'Vikramjit Singh',
    authorRole: 'Logistics Lead — Civil Defense',
    avatarFallback: 'VS',
    timestamp: '1h ago',
    title: 'Emergency Evacuation Corridor Protocol: Keeping Left Side Unobstructed',
    body: 'During peak morning bathing hours, the crowd density naturally concentrates along the central pier. Marshals will deploy yellow tape markers. Please remind all family groups to keep the left 3-meter lane clear for stretcher and medical quad transit.',
    category: 'Safety',
    upvotes: 98,
    repliesCount: 12
  },
  {
    id: 'post-03',
    author: 'Ananya Deshmukh',
    authorRole: 'Legal Observer Team Lead',
    avatarFallback: 'AD',
    timestamp: '3h ago',
    title: 'Know Your Rights: Designated Assembly Corridors & Verification Rules',
    body: 'Our full team of verified advocates has copies of the stamped Police NOC and Magistrate permissions. If any marshal or checkpoint officer asks for event permits, you can show the digital cryptographic QR code in the CivicConnect app.',
    category: 'Legal Aid',
    upvotes: 215,
    repliesCount: 34
  }
];

export const CIVIC_POLL_FIXTURE: CivicPoll = {
  id: 'poll-01',
  question: 'Should the Eastern Egress Gate be kept open for one-way exit dispersal past 19:00 IST?',
  organizer: 'Mela Crowd Safety Committee',
  totalVotes: 3840,
  expiresIn: '4 hours remaining',
  options: [
    { id: 'opt-1', label: 'Yes — enforce one-way flow towards Railway Terminal 2', votes: 2420 },
    { id: 'opt-2', label: 'No — maintain dual-direction access with split barricades', votes: 1120 },
    { id: 'opt-3', label: 'Needs further simulation analysis from Drone Feed', votes: 300 }
  ]
};

export const MESH_PEERS_FIXTURE: MeshPeer[] = [
  { id: 'peer-node-01', name: 'Marshal Post Alpha (Relay)', distanceMeters: 14, protocol: 'BLE 5.2', rssiDbm: -54, hopCount: 1, batteryPercent: 94, isRelay: true, packetsForwarded: 182 },
  { id: 'peer-node-02', name: 'Volunteer Device 088', distanceMeters: 28, protocol: 'Wi-Fi Direct', rssiDbm: -68, hopCount: 1, batteryPercent: 78, isRelay: false, packetsForwarded: 45 },
  { id: 'peer-node-03', name: 'Triage Medical Tent Delta', distanceMeters: 62, protocol: 'LoRa Multi-Hop', rssiDbm: -79, hopCount: 2, batteryPercent: 88, isRelay: true, packetsForwarded: 412 },
  { id: 'peer-node-04', name: 'Water Tanker Beacon 04', distanceMeters: 85, protocol: 'BLE 5.2', rssiDbm: -84, hopCount: 2, batteryPercent: 61, isRelay: true, packetsForwarded: 96 },
  { id: 'peer-node-05', name: 'Perimeter Scout 12', distanceMeters: 120, protocol: 'Wi-Fi Direct', rssiDbm: -91, hopCount: 3, batteryPercent: 52, isRelay: false, packetsForwarded: 18 }
];

export const OFFLINE_MESSAGES_FIXTURE: OfflineChatMessage[] = [
  {
    id: 'msg-01',
    senderName: 'Chief Marshal Sharma',
    senderRole: 'Civic Authority Lead',
    timestamp: '12:44:12',
    content: '[BROADCAST] Internet gateway experiencing cellular congestion. Mesh relay engaged. All marshal units switch to offline sync mode.',
    status: 'synced',
    hops: 1,
    channel: 'broadcast'
  },
  {
    id: 'msg-02',
    senderName: 'Nurse Priya Rao',
    senderRole: 'Triage Tent Delta',
    timestamp: '12:47:30',
    content: 'We need 4 additional oxygen cylinders at Sector 4 North Post. Stretcher squad dispatched.',
    status: 'mesh-relaying',
    hops: 2,
    channel: 'medical-team'
  },
  {
    id: 'msg-03',
    senderName: 'Civil Defense Scout 03',
    senderRole: 'Corridor Monitor',
    timestamp: '12:49:05',
    content: 'Pedestrian flow slowing down near Pier 7 stairs. Diverting next wave toward Ramp B.',
    status: 'queued-local',
    hops: 0,
    channel: 'general'
  }
];

export const TRIAGE_LOCATIONS_FIXTURE: TriageLocation[] = [
  {
    id: 'tri-01',
    name: 'Sector 4 Base Hospital & Field ICU',
    type: 'Hospital',
    distanceMeters: 380,
    estMinutesWalk: 4,
    currentCapacity: 'Available',
    coordinates: [25.4375, 81.8480],
    contactRef: 'EMR-ICU-4 / UHF Ch 12'
  },
  {
    id: 'tri-02',
    name: 'Pontoon 3 Rapid First-Aid Post',
    type: 'Water / Medical Post',
    distanceMeters: 140,
    estMinutesWalk: 2,
    currentCapacity: 'Strained',
    coordinates: [25.4352, 81.8440],
    contactRef: 'TENT-P3 / Medic Call 04'
  },
  {
    id: 'tri-03',
    name: 'North Embankment Police Staging Compound',
    type: 'Police Staging',
    distanceMeters: 290,
    estMinutesWalk: 3,
    currentCapacity: 'Available',
    coordinates: [25.4335, 81.8420],
    contactRef: 'SP-MELA-OFFICE / Ch 01'
  },
  {
    id: 'tri-04',
    name: 'Egress Route C High-Capacity Evac Corridor',
    type: 'Safe Exit',
    distanceMeters: 450,
    estMinutesWalk: 5,
    currentCapacity: 'Available',
    coordinates: [25.4390, 81.8510],
    contactRef: 'DISPERSAL-EVAC-NORTH'
  }
];
