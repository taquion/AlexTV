"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  mediaCount: number;
  collectionCount: number;
  imageCount: number;
  videoCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    mediaCount: 0,
    collectionCount: 0,
    imageCount: 0,
    videoCount: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/media").then((r) => r.json()),
      fetch("/api/collections").then((r) => r.json()),
    ]).then(([media, collections]) => {
      setStats({
        mediaCount: media.length,
        collectionCount: collections.length,
        imageCount: media.filter((m: { type: string }) => m.type === "IMAGE").length,
        videoCount: media.filter((m: { type: string }) => m.type === "VIDEO").length,
      });
    });
  }, []);

  const cards = [
    {
      label: "Total Media",
      value: stats.mediaCount,
      href: "/admin/media",
      color: "text-accent",
    },
    {
      label: "Images",
      value: stats.imageCount,
      href: "/admin/media",
      color: "text-blue-400",
    },
    {
      label: "Videos",
      value: stats.videoCount,
      href: "/admin/media",
      color: "text-purple-400",
    },
    {
      label: "Collections",
      value: stats.collectionCount,
      href: "/admin/collections",
      color: "text-green-400",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-surface-alt border border-surface-border rounded-xl p-5 hover:border-text-muted transition-colors"
          >
            <p className="text-text-muted text-sm">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/media"
          className="bg-surface-alt border border-surface-border rounded-xl p-6 hover:border-accent transition-colors group"
        >
          <h3 className="font-semibold group-hover:text-accent transition-colors">
            Upload Media
          </h3>
          <p className="text-text-muted text-sm mt-1">
            Add photos and videos to your library
          </p>
        </Link>
        <Link
          href="/admin/collections/new"
          className="bg-surface-alt border border-surface-border rounded-xl p-6 hover:border-accent transition-colors group"
        >
          <h3 className="font-semibold group-hover:text-accent transition-colors">
            New Collection
          </h3>
          <p className="text-text-muted text-sm mt-1">
            Create a collection to organize your media
          </p>
        </Link>
      </div>
    </div>
  );
}
