"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

function LegoBrick() {
  // Units in meters; original snippet uses mm -> meters conversion
  const mm = 0.001;
  const pitch = 8 * mm;
  const studD = 4.8 * mm;
  const studH = 1.8 * mm;
  const bodyH = 9.6 * mm;

  const studsX = 2, studsZ = 4;
  const bodyW = studsX * pitch - 0.1 * mm; // ~15.9mm
  const bodyL = studsZ * pitch - 0.1 * mm; // ~31.9mm

  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.01;
  });

  const studPositions = useMemo(() => {
    const startX = -((studsX - 1) * pitch) / 2;
    const startZ = -((studsZ - 1) * pitch) / 2;
    const y = bodyH + studH / 2;
    const pts: [number, number, number][] = [];
    for (let ix = 0; ix < studsX; ix++) {
      for (let iz = 0; iz < studsZ; iz++) {
        pts.push([startX + ix * pitch, y, startZ + iz * pitch]);
      }
    }
    return pts;
  }, [pitch, studsX, studsZ, bodyH, studH]);

  const color = 0xD32F2F;

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0, bodyH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[bodyW, bodyH, bodyL]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.4}
          metalness={0.0}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Studs (upright along Y) */}
      {studPositions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[studD / 2, studD / 2, studH, 32]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.4}
            metalness={0.0}
            clearcoat={0.6}
            clearcoatRoughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function LegoBrickScene() {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ fov: 50, position: [0.15, 0.12, 0.18] }}>
        {/* Match background */}
        <color attach="background" args={["#f5f5f7"]} />

        {/* Lights */}
        <hemisphereLight args={[0xffffff, 0x444444, 1.0]} />
        <directionalLight position={[1, 2, 1]} intensity={0.8} castShadow />

        {/* Model */}
        <LegoBrick />

        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}

