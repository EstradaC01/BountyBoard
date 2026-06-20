"use client";

import { useRouter } from "next/navigation";
import CreateBountyForm from "@/components/CreateBountyForm";

export default function CreateBountyPage() {
  const router = useRouter();
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <CreateBountyForm onSuccess={() => router.push("/dashboard")} />
    </div>
  );
}
