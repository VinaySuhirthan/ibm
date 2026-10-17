'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useOpsStore } from '../../stores/opsStore';

interface CrowdMarkersProps {
  visible: boolean;
}

const MAX_MARKERS = 300;

export function CrowdMarkers({ visible = true }: CrowdMarkersProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { boxes, riskLevel } = useOpsStore();

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    if (!meshRef.current || !visible) return;

    const mesh = meshRef.current;
    const planeWidth = 30;
    const planeHeight = 20;

    const activeCount = Math.min(boxes.length, MAX_MARKERS);

    for (let i = 0; i < MAX_MARKERS; i++) {
      if (i < activeCount) {
        const box = boxes[i];
        // Center of detection box mapped to 3D world space
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;

        const x = (cx - 0.5) * planeWidth;
        const z = (cy - 0.5) * planeHeight;

        dummy.position.set(x, 0.45, z);
        dummy.scale.set(0.28, 0.9, 0.28);
        dummy.updateMatrix();

        mesh.setMatrixAt(i, dummy.matrix);

        // Marker color: High confidence / Critical alert accent
        if (riskLevel === 'critical' && cy > 0.55) {
          color.setRGB(1.0, 0.29, 0.12); // Vermilion in chokepoint
        } else if (box.confidence > 0.85) {
          color.setRGB(0.24, 0.86, 0.59); // Verified tracking green
        } else {
          color.setRGB(0.92, 0.91, 0.87); // Broadsheet paper white
        }

        mesh.setColorAt(i, color);
      } else {
        // Hide unused instances below floor
        dummy.position.set(0, -50, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_MARKERS]}
      castShadow
    >
      <cylinderGeometry args={[0.2, 0.25, 1, 8]} />
      <meshStandardMaterial
        roughness={0.3}
        metalness={0.4}
        emissive="#0A0A0F"
      />
    </instancedMesh>
  );
}
