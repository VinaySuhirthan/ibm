'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useOpsStore } from '../../stores/opsStore';
import { GRID_ROWS, GRID_COLS } from '../../lib/density';

interface HeatmapMeshProps {
  visible: boolean;
}

export function HeatmapMesh({ visible = true }: HeatmapMeshProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const { densityGrid, riskLevel } = useOpsStore();

  const totalCells = GRID_ROWS * GRID_COLS;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Track smoothed heights for fluid 60 FPS transitions
  const currentHeights = useRef<Float32Array>(new Float32Array(totalCells).fill(0.1));

  useFrame((_, delta) => {
    if (!instancedMeshRef.current || !visible) return;

    const mesh = instancedMeshRef.current;
    const planeWidth = 30;
    const planeHeight = 20;
    const cellWidth = planeWidth / GRID_COLS;
    const cellHeight = planeHeight / GRID_ROWS;

    let index = 0;

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = densityGrid[r]?.[c];
        const targetDensity = cell ? cell.density : 1.0;

        // Height maps density (0-6 ppl/m² -> 0.05 to 2.8 units)
        const targetHeight = Math.max(0.08, (targetDensity / 5.0) * 2.8);

        // Smooth lerp
        currentHeights.current[index] = THREE.MathUtils.damp(
          currentHeights.current[index],
          targetHeight,
          6.5,
          delta
        );

        const h = currentHeights.current[index];

        // Position in 3D scene (centered at [0, 0, 0])
        const x = (c + 0.5) * cellWidth - planeWidth / 2;
        const z = (r + 0.5) * cellHeight - planeHeight / 2;

        dummy.position.set(x, h / 2, z);
        dummy.scale.set(cellWidth * 0.88, h, cellHeight * 0.88);
        dummy.updateMatrix();

        mesh.setMatrixAt(index, dummy.matrix);

        // Color ramp: Cool Slate (<2.2) -> Amber (2.2-4.0) -> Signal Vermilion (>4.0)
        if (targetDensity > 4.2) {
          // Critical signal vermilion
          color.setRGB(1.0, 0.29, 0.12);
        } else if (targetDensity > 2.6) {
          // Watch amber
          color.setRGB(0.90, 0.66, 0.24);
        } else {
          // Neutral cool slate
          color.setRGB(0.18, 0.20, 0.28);
        }

        mesh.setColorAt(index, color);
        index++;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[undefined, undefined, totalCells]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        roughness={0.4}
        metalness={0.2}
        transparent
        opacity={0.80}
      />
    </instancedMesh>
  );
}
