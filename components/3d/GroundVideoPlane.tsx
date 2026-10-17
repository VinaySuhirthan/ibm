'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useOpsStore } from '../../stores/opsStore';

interface GroundVideoPlaneProps {
  visible: boolean;
}

export function GroundVideoPlane({ visible = true }: GroundVideoPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { activeFeedId, currentTime, isPlaying } = useOpsStore();

  // Create an offscreen procedural canvas that generates realistic drone aerial footage
  const { canvas, ctx, texture } = useMemo(() => {
    if (typeof document === 'undefined') {
      return { canvas: null, ctx: null, texture: null };
    }
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 768;
    const context = cvs.getContext('2d');
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return { canvas: cvs, ctx: context, texture: tex };
  }, []);

  // Animate dynamic aerial stream onto the canvas texture
  useFrame((state) => {
    if (!ctx || !canvas || !texture || !visible) return;

    const t = state.clock.getElapsedTime();

    // Background corridor pavement (textured broadsheet tone)
    ctx.fillStyle = '#0F1018';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid guide lines (5-meter calibrated grid)
    ctx.strokeStyle = 'rgba(236, 232, 223, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Walkway pedestrian zones and pontoon banks
    ctx.fillStyle = 'rgba(46, 31, 115, 0.14)';
    ctx.fillRect(140, 100, 744, 568);

    // Center chokepoint barriers & guide paths
    ctx.strokeStyle = 'rgba(236, 232, 223, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(200, 384);
    ctx.lineTo(824, 384);
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated water or perimeter area (subtle wave pulse)
    const wave = Math.sin(t * 1.5) * 4;
    ctx.fillStyle = 'rgba(34, 211, 238, 0.04)';
    ctx.fillRect(0, 0, 140, canvas.height);
    ctx.fillRect(884, 0, 140, canvas.height);

    // Corner alignment crosshairs on the ground plane
    ctx.strokeStyle = 'rgba(255, 75, 31, 0.5)';
    ctx.lineWidth = 1.5;
    // Top-left
    ctx.strokeRect(140, 100, 24, 24);
    // Bottom-right
    ctx.strokeRect(860, 644, 24, 24);

    // Labeling
    ctx.fillStyle = 'rgba(236, 232, 223, 0.4)';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`CIVIC-SURVEILLANCE // FEED: ${activeFeedId}`, 155, 128);
    ctx.fillText(`GEO-CALIBRATED GROUND PLANE [40m x 60m]`, 155, 145);

    texture.needsUpdate = true;
  });

  if (!visible || !texture) return null;

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
    >
      <planeGeometry args={[30, 20]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.7}
        metalness={0.1}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}
