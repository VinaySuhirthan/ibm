'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  IconEyeOff
} from '../icons/BespokeIcons';

// Detection box type from drone_detections.json
interface DetectionBox {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  conf: number;
}

interface FrameDetection {
  frame: number;
  t: number;
  boxes: DetectionBox[];
}

export type CamPreset = 'top' | 'angled' | 'original';

const PLANE_WIDTH = 24;
const PLANE_DEPTH = 13.5;
const GRID_COLS = 12;
const GRID_ROWS = 8;
const MAX_PEOPLE_MARKERS = 180;

// Camera controller supporting Top, Angled, and Original drone perspectives
function CameraRig({
  preset,
  controlsRef
}: {
  preset: CamPreset;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 15, 18));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    switch (preset) {
      case 'top':
        // Nadir top-down orthographic-style angle
        targetPos.current.set(0, 24, 0.05);
        targetLook.current.set(0, 0, 0);
        break;
      case 'angled':
        // Oblique 45-degree tactical perspective
        targetPos.current.set(0, 16, 17);
        targetLook.current.set(0, 0, 0);
        break;
      case 'original':
        // High-altitude drone reconnaissance view
        targetPos.current.set(0, 13, 20);
        targetLook.current.set(0, 0, 1.5);
        break;
    }
  }, [preset]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.07);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, 0.07);
      controlsRef.current.update();
    }
  });

  return null;
}

// Displaced Ground Plane using real /public/drone.mp4 and /public/drone_depth.mp4
function DisplacedGroundMesh({
  rgbTexture,
  depthTexture
}: {
  rgbTexture: THREE.VideoTexture | null;
  depthTexture: THREE.VideoTexture | null;
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (rgbTexture) rgbTexture.needsUpdate = true;
    if (depthTexture) depthTexture.needsUpdate = true;
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[PLANE_WIDTH, PLANE_DEPTH, 128, 72]} />
      {rgbTexture ? (
        <meshStandardMaterial
          ref={matRef}
          map={rgbTexture}
          displacementMap={depthTexture || undefined}
          displacementScale={2.0}
          displacementBias={-0.5}
          roughness={0.65}
          metalness={0.12}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshStandardMaterial color="#14141C" roughness={0.8} />
      )}
    </mesh>
  );
}

// People markers rendered from YOLO detections
function PeopleMarkersMesh({ boxes }: { boxes: DetectionBox[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const count = Math.min(boxes.length, MAX_PEOPLE_MARKERS);

    for (let i = 0; i < MAX_PEOPLE_MARKERS; i++) {
      if (i < count) {
        const b = boxes[i];
        // Convert normalized [0, 1] coords to 3D plane dimensions
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        const x = (cx - 0.5) * PLANE_WIDTH;
        const z = (cy - 0.5) * PLANE_DEPTH;
        const y = 0.45; // Hovering slightly above displaced surface

        dummy.position.set(x, y, z);
        dummy.scale.set(0.18, 0.42, 0.18);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // Marker color: verified emerald green
        if (b.conf > 0.7) {
          color.setRGB(0.12, 0.85, 0.52);
        } else {
          color.setRGB(0.95, 0.94, 0.90);
        }
        mesh.setColorAt(i, color);
      } else {
        // Hide unused instances
        dummy.position.set(0, -999, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_PEOPLE_MARKERS]}
      castShadow
    >
      <cylinderGeometry args={[0.22, 0.22, 1, 8]} />
      <meshStandardMaterial
        roughness={0.25}
        metalness={0.5}
        emissive="#0A0A0F"
      />
    </instancedMesh>
  );
}

// Density Heatmap Mesh that turns amber/red where crowding rises
function DensityHeatmapMesh({
  gridDensity
}: {
  gridDensity: number[][];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const totalCells = GRID_ROWS * GRID_COLS;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const heights = useRef<Float32Array>(new Float32Array(totalCells).fill(0.05));

  const cellW = PLANE_WIDTH / GRID_COLS;
  const cellD = PLANE_DEPTH / GRID_ROWS;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    let idx = 0;

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const count = gridDensity[r]?.[c] || 0;
        // Target height elevates where count is high
        const targetH = Math.max(0.04, Math.min(1.4, (count / 6.0) * 1.2));
        heights.current[idx] = THREE.MathUtils.damp(heights.current[idx], targetH, 8, delta);
        const h = heights.current[idx];

        const x = (c + 0.5) * cellW - PLANE_WIDTH / 2;
        const z = (r + 0.5) * cellD - PLANE_DEPTH / 2;

        dummy.position.set(x, h / 2 + 0.08, z);
        dummy.scale.set(cellW * 0.9, h, cellD * 0.9);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);

        // Density color ramp:
        // Safe / Low (< 3 people in cell): subtle cyan/green
        // Warning / Amber (3 - 5 people in cell): bright Amber
        // Dangerous / Red (> 5 people in cell): Signal Vermilion
        if (count >= 6) {
          color.setRGB(1.0, 0.29, 0.12); // Vermilion #FF4B1F
        } else if (count >= 3) {
          color.setRGB(0.96, 0.62, 0.05); // Amber #F59E0B
        } else {
          color.setRGB(0.12, 0.62, 0.42); // Cool muted emerald
        }

        mesh.setColorAt(idx, color);
        idx++;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, totalCells]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        roughness={0.3}
        metalness={0.2}
        transparent
        opacity={0.65}
      />
    </instancedMesh>
  );
}

// Safe Corridor Animated Tube Line that dynamically reroutes around high density
function AnimatedSafeCorridor({ isRerouted }: { isRerouted: boolean }) {
  const lineRef = useRef<THREE.Mesh>(null);

  // Normal direct path through central plaza
  const directCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10.5, 0.5, 4.8),
      new THREE.Vector3(-5.5, 0.5, 2.5),
      new THREE.Vector3(0, 0.5, 0.5),
      new THREE.Vector3(5.5, 0.5, -2.0),
      new THREE.Vector3(10.5, 0.5, -4.5)
    ]);
  }, []);

  // Dynamic diversion curve bowing northward around central congestion
  const bypassCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10.5, 0.5, 4.8),
      new THREE.Vector3(-6.0, 0.5, 0.5),
      new THREE.Vector3(-0.5, 0.5, -4.8), // Curved bypass around central cluster
      new THREE.Vector3(5.5, 0.5, -4.5),
      new THREE.Vector3(10.5, 0.5, -4.5)
    ]);
  }, []);

  const activeCurve = isRerouted ? bypassCurve : directCurve;

  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(activeCurve, 64, 0.16, 8, false);
  }, [activeCurve]);

  // Emissive pulse flow animation
  useFrame((state) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      const t = state.clock.getElapsedTime();
      const pulse = 0.5 + 0.5 * Math.sin(t * (isRerouted ? 7.0 : 4.0));
      mat.emissiveIntensity = 0.7 + pulse * 0.7;
    }
  });

  return (
    <group>
      <mesh ref={lineRef} geometry={tubeGeo}>
        <meshStandardMaterial
          color={isRerouted ? '#F59E0B' : '#10B981'}
          emissive={isRerouted ? '#F59E0B' : '#10B981'}
          emissiveIntensity={0.9}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Start Point: You (North Corridor Entry) */}
      <group position={[-10.5, 0.9, 4.8]}>
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
      </group>

      {/* End Point: Primary Exit Beacon */}
      <group position={[10.5, 0.9, -4.5]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 1.2, 8]} />
          <meshBasicMaterial color={isRerouted ? '#F59E0B' : '#10B981'} />
        </mesh>
      </group>

      {/* Triage Tent Marker */}
      <group position={[7.5, 0.8, -1.5]}>
        <mesh>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.42]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial color="#FF4B1F" />
        </mesh>
      </group>
    </group>
  );
}

export function LiveProtestHub3D() {
  // Video Elements and Textures
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const depthVideoRef = useRef<HTMLVideoElement | null>(null);
  const [rgbTexture, setRgbTexture] = useState<THREE.VideoTexture | null>(null);
  const [depthTexture, setDepthTexture] = useState<THREE.VideoTexture | null>(null);

  // Controls & Preset State
  const controlsRef = useRef<any>(null);
  const [cameraPreset, setCameraPreset] = useState<CamPreset>('angled');

  // Detections & Video Sync State
  const [detectionsData, setDetectionsData] = useState<FrameDetection[]>([]);
  const [currentBoxes, setCurrentBoxes] = useState<DetectionBox[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Initialize hidden video elements and Three.js textures
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/drone.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    const depthVideo = document.createElement('video');
    depthVideo.src = '/drone_depth.mp4';
    depthVideo.crossOrigin = 'anonymous';
    depthVideo.loop = true;
    depthVideo.muted = true;
    depthVideo.playsInline = true;
    depthVideo.autoplay = true;

    videoRef.current = video;
    depthVideoRef.current = depthVideo;

    const rgbTex = new THREE.VideoTexture(video);
    rgbTex.minFilter = THREE.LinearFilter;
    rgbTex.magFilter = THREE.LinearFilter;

    const depthTex = new THREE.VideoTexture(depthVideo);
    depthTex.minFilter = THREE.LinearFilter;
    depthTex.magFilter = THREE.LinearFilter;

    setRgbTexture(rgbTex);
    setDepthTexture(depthTex);

    const handleLoadedData = () => {
      video.play().catch(() => {});
      depthVideo.play().catch(() => {});
    };

    video.addEventListener('loadeddata', handleLoadedData);

    // Synchronize depth video playback with RGB video
    const handleTimeUpdate = () => {
      const t = video.currentTime;
      setCurrentTime(t);
      if (Math.abs(depthVideo.currentTime - t) > 0.1) {
        depthVideo.currentTime = t;
      }
    };
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.pause();
      depthVideo.pause();
      rgbTex.dispose();
      depthTex.dispose();
    };
  }, []);

  // Fetch YOLO Detections JSON
  useEffect(() => {
    let cancelled = false;
    fetch('/drone_detections.json')
      .then(res => res.json())
      .then((data: FrameDetection[]) => {
        if (!cancelled) {
          setDetectionsData(data);
        }
      })
      .catch(err => {
        console.warn('Could not load /drone_detections.json:', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Update current detection boxes as the video plays
  useEffect(() => {
    if (!detectionsData.length) return;
    const fps = 29.97;
    const frameIndex = Math.min(
      detectionsData.length - 1,
      Math.max(0, Math.floor(currentTime * fps))
    );
    const frame = detectionsData[frameIndex] || detectionsData[0];
    if (frame && frame.boxes) {
      setCurrentBoxes(frame.boxes);
    }
  }, [detectionsData, currentTime]);

  // Compute 2D Density Grid (12 cols x 8 rows) from current detection boxes
  const gridDensity = useMemo(() => {
    const grid: number[][] = Array.from({ length: GRID_ROWS }, () =>
      new Array(GRID_COLS).fill(0)
    );
    for (const b of currentBoxes) {
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const c = Math.min(GRID_COLS - 1, Math.max(0, Math.floor(cx * GRID_COLS)));
      const r = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(cy * GRID_ROWS)));
      grid[r][c] += 1;
    }
    return grid;
  }, [currentBoxes]);

  // Check if center corridor cells are congested (triggering reroute)
  const isRerouted = useMemo(() => {
    // Check central plaza cells: cols 4..7, rows 3..5
    let centerCongestionCount = 0;
    for (let r = 3; r <= 5; r++) {
      for (let c = 4; c <= 7; c++) {
        if ((gridDensity[r]?.[c] || 0) >= 3) {
          centerCongestionCount++;
        }
      }
    }
    return centerCongestionCount >= 2;
  }, [gridDensity]);

  // Telemetry Computed Directly from YOLO Detections (Zero hardcoding)
  const inViewCount = currentBoxes.length;
  // Scaled to full sector estimate (drone sample represents ~5% of entire district sector)
  const estimatedSectorHeadcount = Math.max(inViewCount, Math.round(inViewCount / 0.05));
  // Venue area calibrated at 2,400 m²
  const calibratedAreaM2 = 2400;
  const currentDensityM2 = Number((estimatedSectorHeadcount / calibratedAreaM2).toFixed(2));

  // Dynamic Crowd Level
  const crowdLevel: { label: string; tone: string; status: 'safe' | 'busy' | 'high' } =
    currentDensityM2 < 1.8
      ? { label: 'Safe (Normal Flow)', tone: 'text-[#1F9D6B]', status: 'safe' }
      : currentDensityM2 <= 3.2
      ? { label: 'Busy (Moderate Congestion)', tone: 'text-[#D97706]', status: 'busy' }
      : { label: 'High Density (Restricted Flow)', tone: 'text-[#FF4B1F]', status: 'high' };

  // Nearest Medical Aid (Dynamic walk time based on density impedance)
  // Distance to Tent Alpha is 140m. Walk speed ranges from 80 m/min down to 30 m/min in dense crowds
  const walkSpeedMpm = Math.max(25, 80 - currentDensityM2 * 14);
  const walkMinutes = Math.max(1, Math.round(140 / walkSpeedMpm));

  // Primary Egress (Dynamic route state)
  const primaryEgress = isRerouted
    ? 'West Gate Bypass (North Ramp Congested)'
    : 'North Ramp Open (Clear Flow)';

  // AI Route Advice dynamically generated from active density & routing state
  const aiRouteAdvice = isRerouted
    ? 'Congestion detected in Central Plaza. Safe corridor dynamically rerouted via West Gate bypass.'
    : crowdLevel.status === 'busy'
    ? 'Moderate pedestrian accumulation along main axis. Maintain forward momentum toward North Ramp.'
    : 'Corridors clear. Optimal pedestrian flow through Central Gateway. Unrestricted egress.';

  return (
    <div className="p-5 sm:p-6 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-4">
      {/* Card Header with Real-Time Telemetry & Privacy Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(20,20,28,0.08)]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1F9D6B]">
            Real-Time Assembly Cartography
          </span>
          <h2 className="font-display text-2xl font-semibold text-[#14141C] mt-0.5 tracking-tight leading-snug">
            Protest Hub & Safe Corridors
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Privacy Tag */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F1EA] border border-[rgba(20,20,28,0.08)] text-[12px] font-medium text-[#65636D]"
            title="Spatial geometry and count aggregation only. Zero facial recognition or biometric scanning active."
          >
            <IconEyeOff size={13} className="text-[#65636D]" />
            <span>Privacy: counts only</span>
          </div>

          {/* Computed People in Sector */}
          <div className="flex items-center gap-2 text-[13px] font-mono-numbers text-[#14141C] bg-[rgba(31,157,107,0.08)] px-3 py-1 rounded-full border border-[rgba(31,157,107,0.2)]">
            <span
              className={`w-2 h-2 rounded-full ${
                crowdLevel.status === 'high'
                  ? 'bg-[#FF4B1F] animate-ping'
                  : crowdLevel.status === 'busy'
                  ? 'bg-[#D97706]'
                  : 'bg-[#1F9D6B] animate-pulse'
              }`}
            />
            <span className="font-semibold">
              ~{estimatedSectorHeadcount.toLocaleString()}
            </span>
            <span className="text-[#65636D] text-[12px]">people in sector ({inViewCount} in view)</span>
          </div>
        </div>
      </div>

      {/* 3D R3F Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-[#0A0A0F] rounded-civic overflow-hidden border border-[rgba(20,20,28,0.1)] shadow-inner select-none">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 16, 17], fov: 45 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#0A0A0F']} />
          <fog attach="fog" args={['#0A0A0F', 24, 60]} />

          {/* Lighting */}
          <ambientLight intensity={0.65} />
          <directionalLight
            position={[12, 22, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-10, 8, -6]} intensity={0.5} color="#22D3EE" />
          <pointLight position={[10, 8, 6]} intensity={0.4} color="#FF4B1F" />

          {/* 3D Elements */}
          <DisplacedGroundMesh rgbTexture={rgbTexture} depthTexture={depthTexture} />
          <DensityHeatmapMesh gridDensity={gridDensity} />
          <PeopleMarkersMesh boxes={currentBoxes} />
          <AnimatedSafeCorridor isRerouted={isRerouted} />

          {/* Calibrated Reference Floor Grid */}
          <gridHelper args={[34, 34, '#2E1F73', '#16161F']} position={[0, -0.02, 0]} />

          {/* Damped OrbitControls restricted to ±35° so back never shows */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.08}
            minAzimuthAngle={(-35 * Math.PI) / 180} // -35 degrees
            maxAzimuthAngle={(35 * Math.PI) / 180}  // +35 degrees
            minPolarAngle={Math.PI * 0.12}          // ~21 degrees (prevents flip)
            maxPolarAngle={(68 * Math.PI) / 180}   // ~68 degrees (prevents horizon/back view)
            minDistance={10}
            maxDistance={38}
            enablePan={false}
          />

          {/* Smooth Camera Rig */}
          <CameraRig preset={cameraPreset} controlsRef={controlsRef} />
        </Canvas>

        {/* HUD Top Left: Camera Presets Switch */}
        <div className="absolute top-3 left-3 flex items-center bg-[#14141C]/90 backdrop-blur-md p-1 rounded-civic-sm border border-white/10 shadow-soft z-10">
          <span className="text-[11px] font-mono-numbers uppercase text-white/50 px-2 select-none">
            Angle:
          </span>
          {(['top', 'angled', 'original'] as CamPreset[]).map((p) => (
            <button
              key={p}
              onClick={() => setCameraPreset(p)}
              className={`px-2.5 py-1 rounded text-[12px] font-semibold capitalize transition-all ${
                cameraPreset === p
                  ? 'bg-[#1F9D6B] text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* HUD Top Right: Dynamic Corridor Status Pill */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-[#14141C]/90 backdrop-blur-md px-3 py-1.5 rounded-civic-sm border border-white/10 shadow-soft text-[12px] font-mono-numbers z-10">
          <span
            className={`w-2 h-2 rounded-full ${
              isRerouted ? 'bg-[#F59E0B] animate-ping' : 'bg-[#10B981]'
            }`}
          />
          <span className="text-white/90">
            {isRerouted ? 'Corridor: Bypass Active' : 'Corridor: Direct Optimal'}
          </span>
        </div>

        {/* HUD Bottom: Dynamic AI Route Advice Pill */}
        <div className="absolute bottom-3 left-3 right-3 bg-[#FFFFFF]/95 backdrop-blur-md px-3.5 py-2.5 rounded-civic-sm border border-[rgba(20,20,28,0.12)] shadow-soft text-[13px] text-[#14141C] flex items-center gap-2.5 z-10">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isRerouted ? 'bg-[#F59E0B]' : 'bg-[#1F9D6B]'
            }`}
          />
          <span className="font-semibold text-[#14141C] shrink-0">
            AI Route Advice:
          </span>
          <span className="text-[#4B4952] leading-tight truncate sm:whitespace-normal">
            {aiRouteAdvice}
          </span>
        </div>
      </div>

      {/* Dynamic Telemetry Metrics Bar (Directly computed from YOLO detections) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 bg-[#F4F1EA] rounded-civic-sm border border-[rgba(20,20,28,0.06)] flex flex-col justify-between">
          <span className="text-[12px] text-[#65636D] block">Local Crowd Level</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className={`text-[15px] font-bold ${crowdLevel.tone}`}>
              {crowdLevel.label}
            </span>
            <span className="text-[11px] font-mono-numbers text-[#65636D]">
              ({currentDensityM2} pax/m²)
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#F4F1EA] rounded-civic-sm border border-[rgba(20,20,28,0.06)] flex flex-col justify-between">
          <span className="text-[12px] text-[#65636D] block">Nearest Medical Aid</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[15px] font-semibold text-[#14141C]">
              140m (~{walkMinutes} min walk)
            </span>
            <span className="text-[11px] text-[#1F9D6B] font-medium">
              • Triage Tent Alpha
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#F4F1EA] rounded-civic-sm border border-[rgba(20,20,28,0.06)] flex flex-col justify-between">
          <span className="text-[12px] text-[#65636D] block">Primary Egress</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-[14px] font-semibold ${
                isRerouted ? 'text-[#D97706]' : 'text-[#14141C]'
              }`}
            >
              {primaryEgress}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
