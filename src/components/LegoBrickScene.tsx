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
  const gap = 0.6 * mm;    // small visual gap between bricks so seams are visible
  const longG = long + gap;
  const shortG = short + gap;
  const brickColor = 0xD32F2F;

  const layer0: JSX.Element[] = [];
  const layer1: JSX.Element[] = [];

  // Front and back rows (bricks oriented long along X)
  const xs = [-1.5 * longG, -0.5 * longG, 0.5 * longG, 1.5 * longG];
  const frontZ = 0;
  const backZ = 2 * longG;
  xs.forEach((x, i) => {
    layer0.push(
      <LegoBrick key={`f0-${i}`} position={[x, 0, frontZ]} rotationY={Math.PI / 2} color={brickColor} />
    );
    layer0.push(
      <LegoBrick key={`b0-${i}`} position={[x, 0, backZ]} rotationY={Math.PI / 2} color={brickColor} />
    );
    // Offset bonding on second layer
    layer1.push(
      <LegoBrick key={`f1-${i}`} position={[x + longG / 2, layerHeight, frontZ]} rotationY={Math.PI / 2} color={brickColor} />
    );
    layer1.push(
      <LegoBrick key={`b1-${i}`} position={[x + longG / 2, layerHeight, backZ]} rotationY={Math.PI / 2} color={brickColor} />
    );
  });

  // Side walls (bricks oriented long along Z)
  const zs = [longG / 2, 1.5 * longG];
  const leftX = -2 * longG;
  const rightX = 2 * longG;
  zs.forEach((z, i) => {
    layer0.push(<LegoBrick key={`l0-${i}`} position={[leftX, 0, z]} rotationY={0} color={brickColor} />);
    layer0.push(<LegoBrick key={`r0-${i}`} position={[rightX, 0, z]} rotationY={0} color={brickColor} />);
    layer1.push(
      <LegoBrick key={`l1-${i}`} position={[leftX, layerHeight, z + longG / 2]} rotationY={0} color={brickColor} />
    );
    layer1.push(
      <LegoBrick key={`r1-${i}`} position={[rightX, layerHeight, z + longG / 2]} rotationY={0} color={brickColor} />
    );
  });

  return (
    <group>
      {layer0}
      {layer1}
    </group>
  );
}

function TwoBricks() {
  // Two 2x4 bricks aligned along X axis (same Z, same Y), long side along X
  const mm = 0.001;
  const pitch = 8 * mm;
  const long = 4 * pitch; // ~32mm
  const gap = 0.0 * mm;
  const brickColor = 0xD32F2F;

  const halfSpacing = long / 2 + gap; // center-to-center offset from origin

  return (
    <group>
      <LegoBrick position={[-halfSpacing, 0, 0]} rotationY={Math.PI / 2} color={brickColor} />
      <LegoBrick position={[halfSpacing, 0, 0]} rotationY={Math.PI / 2} color={brickColor} />
    </group>
  );
}

function TwoBricksStack() {
  // Two 2x4 bricks base + eight stacked above them (no horizontal gaps).
  const mm = 0.001;
  const pitch = 8 * mm;
  const long = 4 * pitch; // ~32mm
  const studH = 1.8 * mm;
  const bodyH = 9.6 * mm;
  const layerHeight = bodyH; // stack each new layer by brick height
  // Compensate slight body undersize; small extra overlap removes any hairline seam
  const gap = 0.00 * mm;
  const brickColor = 0xD32F2F;

  const halfSpacing = long / 2 + gap;
  const xLeft = -halfSpacing;
  const xRight = halfSpacing;

  const groups: JSX.Element[] = [];
  // Base layer (2 bricks)
  groups.push(
    <group key="layer-0">
      <LegoBrick position={[xLeft, 0, 0]} rotationY={Math.PI / 2} color={brickColor} />
      <LegoBrick position={[xRight, 0, 0]} rotationY={Math.PI / 2} color={brickColor} />
    </group>
  );
  // 4 more layers above => 8 more bricks total
  for (let l = 1; l <= 4; l++) {
    groups.push(
      <group key={`layer-${l}`}>
        <LegoBrick position={[xLeft, l * layerHeight, 0]} rotationY={Math.PI / 2} color={brickColor} />
        <LegoBrick position={[xRight, l * layerHeight, 0]} rotationY={Math.PI / 2} color={brickColor} />
      </group>
    );
  }

  return <group>{groups}</group>;
}

export default function LegoBrickScene() {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ fov: 50, position: [0.35, 0.25, 0.55] }}>
        {/* Match background */}
        <color attach="background" args={["#f5f5f7"]} />

        {/* Lights */}
        <hemisphereLight args={[0xffffff, 0x444444, 1.0]} />
        <directionalLight position={[1, 2, 1]} intensity={0.8} castShadow />

        {/* Ground to help depth perception and receive shadows */}
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.0005, 0]} receiveShadow>
          <planeGeometry args={[1.2, 1.2]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>

        {/* Two bricks base + 8 stacked above (no horizontal gaps) */}
        <TwoBricksStack />

        <OrbitControls enableDamping target={[0, 0.03, 0.06]} />
      </Canvas>
    </div>
  );
}
