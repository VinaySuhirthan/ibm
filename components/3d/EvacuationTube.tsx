'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useOpsStore } from '../../stores/opsStore';

interface EvacuationTubeProps {
  visible: boolean;
}

export function EvacuationTube({ visible = true }: EvacuationTubeProps) {
  const lineRef = useRef<THREE.Mesh>(null);
  const { riskLevel, layers } = useOpsStore();

  const isCritical = riskLevel === 'critical';

  // Primary Route Path (standard pontoon path)
  const primaryCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-12, 0.4, -6),
      new THREE.Vector3(-6, 0.4, -2),
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(6, 0.4, 3),
      new THREE.Vector3(12, 0.4, 7)
    ]);
  }, []);

  // Alternative Diversion Route Path (engaged live when critical)
  const alternativeCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-12, 0.4, -6),
      new THREE.Vector3(-6, 0.4, -4),
      new THREE.Vector3(1, 0.4, -7),
      new THREE.Vector3(8, 0.4, -7.5),
      new THREE.Vector3(13, 0.4, -5)
    ]);
  }, []);

  const activeCurve = isCritical ? alternativeCurve : primaryCurve;

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(activeCurve, 64, 0.16, 8, false);
  }, [activeCurve]);

  // Dash pulse animation
  useFrame((state) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      // Modulate emissive intensity for moving flow pulse
      const t = state.clock.getElapsedTime();
      const pulse = 0.5 + 0.5 * Math.sin(t * (isCritical ? 8 : 3.5));
      mat.emissiveIntensity = 0.6 + pulse * 0.8;
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* 3D Evacuation Conduit */}
      <mesh ref={lineRef} geometry={tubeGeometry}>
        <meshStandardMaterial
          color={isCritical ? '#FF4B1F' : '#22D3EE'}
          emissive={isCritical ? '#FF4B1F' : '#22D3EE'}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Emergency Egress Signs & Beacons */}
      {layers.exits && (
        <group>
          {/* Main Exit */}
          <mesh position={[12, 1.2, 7]}>
            <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
            <meshBasicMaterial color="#3DDC97" />
          </mesh>
          {/* Alternate Diversion Egress Gate C */}
          <mesh position={[13, 1.2, -5]}>
            <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
            <meshBasicMaterial color={isCritical ? '#FF4B1F' : '#E5A93C'} />
          </mesh>
        </group>
      )}

      {/* Field Hospital & Triage Post Markers */}
      {layers.medicalTriage && (
        <group position={[-8, 0.8, 6]}>
          <mesh>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshStandardMaterial color="#ECE8DF" />
          </mesh>
          {/* Medical Red Cross */}
          <mesh position={[0, 0, 0.62]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial color="#FF4B1F" />
          </mesh>
        </group>
      )}

      {/* Police Command Post */}
      {layers.policePosts && (
        <group position={[8, 0.8, 5]}>
          <mesh>
            <cylinderGeometry args={[0.8, 0.8, 1.5, 6]} />
            <meshStandardMaterial color="#2E1F73" metalness={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
}
