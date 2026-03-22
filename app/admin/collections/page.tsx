"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CollectionItem {
  _id: string;
  name: string;
  slug: string;
  visibility: "PUBLIC" | "PIN";
  mediaCount: number;
  updatedAt: string;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => setCollections(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Link
          href="/admin/collections/new"
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          + New Collection
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p className="text-lg">No collections yet</p>
          <p className="text-sm mt-1">Create one to organize your media</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <Link
              key={col._id}
              href={`/admin/collections/${col.slug}`}
              className="bg-surface-alt border border-surface-border rounded-xl p-4 hover:border-text-muted transition-colors group"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold group-hover:text-accent transition-colors">
                  {col.name}
                </h3>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    col.visibility === "PUBLIC"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {col.visibility}
                </span>
              </div>
              <p className="text-text-muted text-sm mt-1">/play/{col.slug}</p>
              <p className="text-text-secondary text-sm mt-2">
                {col.mediaCount} item{col.mediaCount !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
