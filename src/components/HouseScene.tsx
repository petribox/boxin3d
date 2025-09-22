"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from "three";
import { useEffect } from "react";

function HouseModel(props: JSX.IntrinsicElements["group"]) {
  const gltf = useLoader(
    GLTFLoader,
    "/models/house-4/model.gltf",
    (loader: GLTFLoader) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
      loader.setDRACOLoader(draco);
    }
  );

  useEffect(() => {
    gltf.scene.traverse((o) => {
      const obj = o as THREE.Mesh;
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [gltf.scene]);

  // Scale and slightly lift to rest on ground if needed
  const groupProps = { position: [0, 0, 0] as [number, number, number], ...props };
  return <primitive object={gltf.scene} {...groupProps} />;
}

export default function HouseScene() {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [4, 3, 6], fov: 50 }}>
        {/* Background + lights */}
        <color attach="background" args={["#E6D8AD"]} />
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[6, 10, 6]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Ground plane (sand-like) */}
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#E6D8AD" />
        </mesh>

        {/* House model */}
        <HouseModel />

        <OrbitControls enableDamping target={[0, 0.5, 0]} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </div>
  );
}

