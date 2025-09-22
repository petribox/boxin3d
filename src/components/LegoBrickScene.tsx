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
  // Edges touch with no visible seam
  const gap = -0.05 * mm;
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
  // Total 32 bricks: 2 per layer × 16 layers (base + 15 above)
  for (let l = 1; l <= 15; l++) {
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

        {/* Render "BOXINOM" with a crisp 5x7 pixel font (each pixel = 2x2 brick). */}
        <Word5x7 text="BOXINOM" />

        <OrbitControls enableDamping target={[0, 0.03, 0.06]} />
      </Canvas>
    </div>
  );
}

// Convenience wrappers for clarity in the layout below
function Brick2x2({ x, y, z = 0, color = 0xD32F2F }: { x: number; y: number; z?: number; color?: number | string }) {
  // 2x2 is symmetric; rotation doesn't matter
  return <LegoBrick studsX={2} studsZ={2} rotationY={0} position={[x, y, z]} color={color} />;
}

function Brick2x4({ x, y, z = 0, color = 0xD32F2F }: { x: number; y: number; z?: number; color?: number | string }) {
  // Rotate so the long side (4 studs) runs along X
  return <LegoBrick studsX={2} studsZ={4} rotationY={Math.PI / 2} position={[x, y, z]} color={color} />;
}

function BLetter() {
  // Dimensions and stacking
  const mm = 0.001;
  const pitch = 8 * mm;          // 1 stud = 8 mm center-to-center
  const studH = 1.8 * mm;        // stud height (for realism reference)
  const bodyH = 9.6 * mm;        // brick body height per layer
  const layerH = bodyH;          // we stack per body height

  // Brick spans (world units)
  const short = 2 * pitch;       // 2 studs (~16 mm)
  const long = 4 * pitch;        // 4 studs (~32 mm)

  // Seam compensation so adjacent faces visually touch (our body dims are -0.1 mm)
  const seam = 0.05 * mm;

  // X positions (centers) for elements in "bar" layers:
  // - Spine (2x2) sits centered at x = 0
  // - 2x4 bar left edge flush with spine right edge
  // - 2x2 cap at far right flush with 2x4 bar's right edge
  // Spine 2x2: center at x = 0
  const xSpine = 0;
  // 2x4 bar center: left edge = spine right edge (short/2), minus seam; center = left + long/2
  const xBar = short / 2 - seam + long / 2;
  // Far-right 2x2 cap center: left edge = bar right edge (short/2 + long - seam); center = left + short/2
  const xCap = short / 2 + long - seam + short / 2;

  const bricks: JSX.Element[] = [];
  const color = 0xD32F2F;

  // Helper to push a spine layer (just the 2x2 vertical column)
  const addSpine = (layer: number) => {
    const y = layer * layerH;
    // 2x2 spine (vertical)
    bricks.push(
      // Spine 2x2
      <Brick2x2 key={`spine-${layer}`} x={xSpine} y={y} color={color} />
    );
  };

  // Helper to push a bar layer: spine + 2x4 bar + far-right 2x2 cap
  const addBar = (layer: number) => {
    const y = layer * layerH;
    bricks.push(
      // Spine 2x2 (anchor of the "B")
      <Brick2x2 key={`bar-spine-${layer}`} x={xSpine} y={y} color={color} />,
      // 2x4 bar extending to the right from the spine
      <Brick2x4 key={`bar-2x4-${layer}`} x={xBar} y={y} color={color} />,
      // 2x2 cap at far right to square the outer edge of the bar
      <Brick2x2 key={`bar-cap-${layer}`} x={xCap} y={y} color={color} />
    );
  };

  // Compact B: define layers explicitly (0..9) and curve steps
  const maxLayer = 9;

  // Bars: two thick at ends, two single in the middle
  const thickBarPairs: [number, number][] = [[0,1], [8,9]];
  const midBars = [3, 6];

  // Curve X positions step inward by one stud, then center over the bar
  const xCurveSteps = [
    xCap,          // step 0: far-right (boldest)
    xCap - pitch,  // step 1: one stud inward
    xBar           // step 2: centered over the 2x4 bar
  ];

  // Map specific layers to curve steps to approximate a rounded edge
  const curveMap: Record<number, number> = {
    2: 0, // lower bulge, far-right
    4: 1, // step inward
    5: 2, // centered over bar
    7: 0  // upper bulge, far-right
  };

  for (let l = 0; l <= maxLayer; l++) {
    const y = l * layerH;
    const isThick = thickBarPairs.some(([a,b]) => l===a || l===b);
    if (isThick || midBars.includes(l)) {
      // Bar layer (spine + 2x4 + far-right 2x2 cap) — bolder at ends
      addBar(l);
      continue;
    }

    if (l in curveMap) {
      // Curve segment: spine + a 2x2 at a stepped X to fake curvature
      const xCurve = xCurveSteps[curveMap[l]];
      bricks.push(
        <Brick2x2 key={`curve-spine-${l}`} x={xSpine} y={y} color={color} />, // spine
        <Brick2x2 key={`curve-cap-${l}`}   x={xCurve} y={y} color={color} />  // stepped outward point
      );
      continue;
    }

    // Fallback: just the spine
    addSpine(l);
  }

  return <group>{bricks}</group>;
}

// Build a "B" exactly from an ASCII 2D grid using only 2x2 bricks.
function BAscii() {
  // 2D grid (top → bottom). 'S' means place a 2x2 here, ' ' is empty.
  const GRID = [
    "SSSSSSS",
    "SS   SS",
    "SSSSSSS",
    "SS   SS",
    "SSSSSSS",
  ];

  // Dimensions
  const mm = 0.001;
  const pitch = 8 * mm;     // stud spacing (center‑to‑center)
  const bodyH = 9.6 * mm;   // brick body height per layer
  const seam = 0.05 * mm;   // compensate slight undersize so edges meet

  // Center-to-center spacing along X so adjacent 2x2s touch with no gaps
  // A 2x2 spans 2 studs along X → 2 * pitch. Subtract a tiny seam for tight fit.
  const stepX = 2 * pitch - seam;
  const stepY = bodyH; // one brick height per row

  const rows = GRID.length;
  const cols = GRID[0].length;

  // Center the shape around X=0; bottom row sits on Y=0
  const x0 = -((cols - 1) * stepX) / 2; // leftmost center

  const bricks: JSX.Element[] = [];
  const color = 0xD32F2F;

  // Iterate rows (top→bottom in GRID), but place bottom row at y=0
  for (let rTop = 0; rTop < rows; rTop++) {
    const y = (rows - 1 - rTop) * stepY;
    const row = GRID[rTop];
    for (let c = 0; c < cols; c++) {
      if (row[c] !== 'S') continue;
      const x = x0 + c * stepX;
      // Place a single 2x2 brick at (x, y)
      bricks.push(
        <Brick2x2 key={`b-${rTop}-${c}`} x={x} y={y} color={color} />
      );
    }
  }

  return <group>{bricks}</group>;
}

// Render an ASCII word layout made of 2x2 bricks.
// Any non-dot character places a brick; '.' is empty.
function WordAscii() {
  // Top → bottom lines provided by you (explicit '.' as empty 2x2 cells)
  const GRID = [
    "BBBB..OOO..X...X..III..N...N..OOO..M...M",
    "B...B..O...O..X.X..I..NN..N..O...O..MM.MM",
    "BBB..O...O..X..I..N.N.N..O...O..M.MM.M",
    "B...B..O...O..X.X..I..N..NN..O...O..M...M",
    "BBBB..OOO..X...X..III..N...N..OOO..M...M",
  ];

  // Dimensions per 2x2 cell
  const mm = 0.001;
  const pitch = 8 * mm;     // stud spacing
  const bodyH = 9.6 * mm;   // one layer height
  const seam = 0.05 * mm;   // small fit adjustment so edges touch

  // Each cell spans 2 studs along X (2x2 brick width)
  const stepX = 2 * pitch - seam;
  const stepY = bodyH;

  const rows = GRID.length;
  // Normalize all rows to equal length by padding with '.' so columns align
  const cols = Math.max(...GRID.map(r => r.length));
  const ROWS = GRID.map(r => r.padEnd(cols, '.'));
  const x0 = -((cols - 1) * stepX) / 2; // center horizontally

  const bricks: JSX.Element[] = [];
  const color = 0xD32F2F;

  for (let rTop = 0; rTop < rows; rTop++) {
    const y = (rows - 1 - rTop) * stepY; // bottom row at y=0
    const row = ROWS[rTop];
    for (let c = 0; c < cols; c++) {
      const ch = row[c];
      if (ch === '.') continue; // empty 2x2 cell
      const x = x0 + c * stepX;
      bricks.push(
        <Brick2x2 key={`w-${rTop}-${c}`} x={x} y={y} color={color} />
      );
    }
  }

  return <group>{bricks}</group>;
}

// Render an uppercase word using a fixed 5x7 pixel font.
// Each pixel maps to a 2x2 brick (1 = brick, 0 = empty).
function Word5x7({ text, spacing = 1 }: { text: string; spacing?: number }) {
  // 5x7 glyphs (top→bottom rows, 5 columns each)
  const F: Record<string, string[]> = {
    B: [
      "11110",
      "10001",
      "10001",
      "11110",
      "10001",
      "10001",
      "11110",
    ],
    O: [
      "01110",
      "10001",
      "10001",
      "10001",
      "10001",
      "10001",
      "01110",
    ],
    X: [
      "10001",
      "01010",
      "00100",
      "00100",
      "00100",
      "01010",
      "10001",
    ],
    I: [
      "01110",
      "00100",
      "00100",
      "00100",
      "00100",
      "00100",
      "01110",
    ],
    N: [
      "10001",
      "11001",
      "10101",
      "10011",
      "10001",
      "10001",
      "10001",
    ],
    M: [
      "10001",
      "11011",
      "10101",
      "10101",
      "10001",
      "10001",
      "10001",
    ],
  };

  const mm = 0.001;
  const pitch = 8 * mm;   // stud spacing
  const bodyH = 9.6 * mm; // one layer height
  const seam = 0.05 * mm; // tiny fit adjustment

  const stepX = 2 * pitch - seam; // 2x2 brick width (center spacing)
  const stepY = bodyH;            // row height

  // Compose glyphs into a single 5x7 grid string with spacing columns of zeros
  const chars = text.toUpperCase().split("");
  const rows = 7;
  const colsPerGlyph = 5;
  const totalCols = chars.reduce((acc, ch, i) => acc + (F[ch]?.[0]?.length || 0) + (i < chars.length - 1 ? spacing : 0), 0);

  // Center horizontally
  const x0 = -((totalCols - 1) * stepX) / 2;

  const bricks: JSX.Element[] = [];
  const color = 0xD32F2F;

  let colOffset = 0;
  for (let ci = 0; ci < chars.length; ci++) {
    const ch = chars[ci];
    const glyph = F[ch];
    if (!glyph) {
      // Unknown char: just advance spacing columns
      colOffset += spacing;
      continue;
    }
    for (let rTop = 0; rTop < rows; rTop++) {
      const y = (rows - 1 - rTop) * stepY; // bottom row at y=0
      const rowStr = glyph[rTop];
      for (let c = 0; c < colsPerGlyph; c++) {
        if (rowStr[c] !== '1') continue;
        const x = x0 + (colOffset + c) * stepX;
        bricks.push(<Brick2x2 key={`g-${ci}-${rTop}-${c}`} x={x} y={y} color={color} />);
      }
    }
    colOffset += colsPerGlyph;
    if (ci < chars.length - 1) colOffset += spacing;
  }

  return <group>{bricks}</group>;
}
