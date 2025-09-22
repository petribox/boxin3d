"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

type BrickProps = {
  studsX?: number;
  studsZ?: number;
  color?: number | string;
  position?: [number, number, number];
  rotationY?: number;
};

function LegoBrick({ studsX = 2, studsZ = 4, color = 0xD32F2F, position = [0, 0, 0], rotationY = 0 }: BrickProps) {
  // Units in meters; original snippet uses mm -> meters conversion
  const mm = 0.001;
  const pitch = 8 * mm;
  const studD = 4.8 * mm;
  const studH = 1.8 * mm;
  const bodyH = 9.6 * mm;

  const bodyW = studsX * pitch - 0.1 * mm; // ~15.9mm for 2 studs
  const bodyL = studsZ * pitch - 0.1 * mm; // ~31.9mm for 4 studs

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

  return (
    <group position={position} rotation={[0, rotationY, 0]}> 
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

function HouseOfBricks() {
  // Basic footprint made of 2x4 bricks arranged into a small perimeter with two layers
  const mm = 0.001;
  const pitch = 8 * mm;
  const studH = 1.8 * mm;
  const bodyH = 9.6 * mm;
  const layerHeight = bodyH + studH; // approximate stacking height

  const long = 4 * pitch; // length of 2x4 along its long side
  const short = 2 * pitch; // width of 2x4 along its short side

  const layer0: JSX.Element[] = [];
  const layer1: JSX.Element[] = [];

  // Front and back rows (bricks oriented long along X)
  const xs = [-1.5 * long, -0.5 * long, 0.5 * long, 1.5 * long];
  const frontZ = 0;
  const backZ = 2 * long;
  xs.forEach((x, i) => {
    layer0.push(
      <LegoBrick key={`f0-${i}`} position={[x, 0, frontZ]} rotationY={Math.PI / 2} />
    );
    layer0.push(
      <LegoBrick key={`b0-${i}`} position={[x, 0, backZ]} rotationY={Math.PI / 2} />
    );
    // Offset bonding on second layer
    layer1.push(
      <LegoBrick key={`f1-${i}`} position={[x + long / 2, layerHeight, frontZ]} rotationY={Math.PI / 2} />
    );
    layer1.push(
      <LegoBrick key={`b1-${i}`} position={[x + long / 2, layerHeight, backZ]} rotationY={Math.PI / 2} />
    );
  });

  // Side walls (bricks oriented long along Z)
  const zs = [long / 2, 1.5 * long];
  const leftX = -2 * long;
  const rightX = 2 * long;
  zs.forEach((z, i) => {
    layer0.push(<LegoBrick key={`l0-${i}`} position={[leftX, 0, z]} rotationY={0} />);
    layer0.push(<LegoBrick key={`r0-${i}`} position={[rightX, 0, z]} rotationY={0} />);
    layer1.push(
      <LegoBrick key={`l1-${i}`} position={[leftX, layerHeight, z + long / 2]} rotationY={0} />
    );
    layer1.push(
      <LegoBrick key={`r1-${i}`} position={[rightX, layerHeight, z + long / 2]} rotationY={0} />
    );
  });

  return (
    <group>
      {layer0}
      {layer1}
    </group>
  );
}

export default function LegoBrickScene() {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ fov: 50, position: [0.25, 0.18, 0.35] }}>
        {/* Match background */}
        <color attach="background" args={["#f5f5f7"]} />

        {/* Lights */}
        <hemisphereLight args={[0xffffff, 0x444444, 1.0]} />
        <directionalLight position={[1, 2, 1]} intensity={0.8} castShadow />

        {/* Bricks forming a small footprint */}
        <HouseOfBricks />

        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}
