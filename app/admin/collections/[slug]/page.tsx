"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import CollectionForm from "@/components/admin/CollectionForm";
import CollectionMediaManager from "@/components/admin/CollectionMediaManager";

interface CollectionData {
  _id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: "PUBLIC" | "PIN";
  youtubePlaylistUrl: string | null;
}

export default function EditCollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/collections/${slug}`)
      .then((res) => res.json())
      .then((data) => setCollection(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (data: {
    name: string;
    slug: string;
    description: string;
    visibility: "PUBLIC" | "PIN";
    pin: string;
    youtubePlaylistUrl: string;
  }) => {
    const res = await fetch(`/api/collections/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update");
    }
    const updated = await res.json();
    if (updated.slug !== slug) {
      router.push(`/admin/collections/${updated.slug}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this collection? This cannot be undone.")) return;
    await fetch(`/api/collections/${slug}`, { method: "DELETE" });
    router.push("/admin/collections");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!collection) {
    return <p className="text-text-muted py-8">Collection not found.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{collection.name}</h1>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-danger/20 hover:bg-danger text-danger hover:text-white rounded-lg text-sm font-medium transition-colors"
        >
          Delete Collection
        </button>
      </div>

      <CollectionForm
        initialData={{
          name: collection.name,
          slug: collection.slug,
          description: collection.description || "",
          visibility: collection.visibility,
          youtubePlaylistUrl: collection.youtubePlaylistUrl || "",
        }}
        onSubmit={handleSubmit}
        submitLabel="Update Collection"
      />

      <hr className="border-surface-border" />

      <CollectionMediaManager slug={slug} />
    </div>
  );
}
