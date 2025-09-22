"use client";

import dynamic from "next/dynamic";

const HouseScene = dynamic(() => import("@/components/HouseScene"), { ssr: false });

export default function Home() {
  return (
    <main className="fixed inset-0">
      <HouseScene />
    </main>
  );
}
