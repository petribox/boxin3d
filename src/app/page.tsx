"use client";

import dynamic from "next/dynamic";

const LegoBrickScene = dynamic(() => import("@/components/LegoBrickScene"), { ssr: false });

export default function Home() {
  return (
    <main className="fixed inset-0">
      <LegoBrickScene />
    </main>
  );
}
