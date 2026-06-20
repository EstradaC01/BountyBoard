"use client";

import { use } from "react";
import BountyDetailContent from "@/components/BountyDetailContent";

export default function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <BountyDetailContent id={Number(id)} />
    </div>
  );
}
