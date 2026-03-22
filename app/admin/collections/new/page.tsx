"use client";

import { useRouter } from "next/navigation";
import CollectionForm from "@/components/admin/CollectionForm";

export default function NewCollectionPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    name: string;
    slug: string;
    description: string;
    visibility: "PUBLIC" | "PIN";
    pin: string;
    youtubePlaylistUrl: string;
  }) => {
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create collection");
    }
    const created = await res.json();
    router.push(`/admin/collections/${created.slug}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Collection</h1>
      <CollectionForm onSubmit={handleSubmit} submitLabel="Create Collection" />
    </div>
  );
}
