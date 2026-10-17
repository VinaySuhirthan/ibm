'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useOpsStore, CameraPreset } from '../../stores/opsStore';
import { GroundVideoPlane } from './GroundVideoPlane';
import { HeatmapMesh } from './HeatmapMesh';
import { CrowdMarkers } from './CrowdMarkers';
import { EvacuationTube } from './EvacuationTube';

// Camera controller handling smooth spring transitions between presets
function CameraRig({ preset }: { preset: CameraPreset }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 22, 18));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    switch (preset) {
      case 'top':
        // Top-down nadir view
        targetPos.current.set(0, 28, 0.1);
        targetLook.current.set(0, 0, 0);
        break;
      case 'drone':
        // Oblique 45 degree drone reconnaissance
        targetPos.current.set(0, 18, 20);
        targetLook.current.set(0, 0, 2);
        break;
      case 'street':
        // Low angle pedestrian perspective
        targetPos.current.set(-14, 3.2, 10);
        targetLook.current.set(0, 1.2, 0);
        break;
      case 'cinematic':
        // Dynamic continuous orbit handled in useFrame
        break;
    }
  }, [preset]);

  useFrame((state, delta) => {
    if (preset === 'cinematic') {
      const t = state.clock.getElapsedTime() * 0.25;
      const radius = 24;
      const x = Math.sin(t) * radius;
      const z = Math.cos(t) * radius;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, x, 3, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 16 + Math.sin(t * 0.5) * 4, 3, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 3, delta);
      camera.lookAt(0, 1, 0);
    } else {
      camera.position.lerp(targetPos.current, 0.06);
      camera.lookAt(targetLook.current);
    }
  });

  return null;
}

export function DigitalTwinScene() {
  const { layers, cameraPreset } = useOpsStore();

  return (
    <div className="relative w-full h-full bg-[#0A0A0F] overflow-hidden select-none">
      <Canvas
        shadows
        dpr={[1, 2]} // Clamped DPR for guaranteed 60 FPS
        camera={{ position: [0, 20, 22], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0A0A0F']} />
        <fog attach="fog" args={['#0A0A0F', 25, 60]} />

        {/* Ambient & Key Architectural Lighting */}
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[15, 25, 12]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={60}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <pointLight position={[-10, 8, -8]} intensity={0.6} color="#22D3EE" />
        <pointLight position={[10, 8, 8]} intensity={0.4} color="#FF4B1F" />

        {/* Dynamic Table-top Digital Twin Elements */}
        <GroundVideoPlane visible={layers.video} />
        <HeatmapMesh visible={layers.heatmap} />
        <CrowdMarkers visible={layers.boxes} />
        <EvacuationTube visible={layers.evacuationRoutes} />

        {/* Boundary Grid Base */}
        <gridHelper args={[50, 50, '#2E1F73', '#14141C']} position={[0, -0.05, 0]} />

        {/* Damped Controls & Camera Rig */}
        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2.05} // Prevent going below ground
          minDistance={8}
          maxDistance={45}
        />
        <CameraRig preset={cameraPreset} />
      </Canvas>

      {/* Blueprint Corner Ticks Overlay */}
      <span className="absolute top-3 left-3 w-4 h-4 border-t border-l border-hairline-bright pointer-events-none" />
      <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-hairline-bright pointer-events-none" />
      <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-hairline-bright pointer-events-none" />
      <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-hairline-bright pointer-events-none" />
    </div>
  );
}
