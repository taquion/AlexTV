import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Collection } from "@/lib/models/Collection";

export const dynamic = "force-dynamic";

export default async function Home() {
  await connectDB();
  const collections = await Collection.find({ visibility: "PUBLIC" })
    .select("name slug description mediaItems")
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-3">AlexTV</h1>
          <p className="text-text-secondary text-lg">
            Your memories, on the big screen
          </p>
        </div>

        {collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map((col) => (
              <Link
                key={col._id.toString()}
                href={`/play/${col.slug}`}
                className="bg-surface-alt border border-surface-border rounded-xl p-6 hover:border-accent transition-all hover:scale-[1.02] group"
              >
                <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
                  {col.name}
                </h3>
                {col.description && (
                  <p className="text-text-muted text-sm mt-2 line-clamp-2">
                    {col.description}
                  </p>
                )}
                <p className="text-text-secondary text-sm mt-3">
                  {col.mediaItems?.length || 0} item
                  {(col.mediaItems?.length || 0) !== 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg">No public collections yet</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/login"
            className="text-text-muted hover:text-text-secondary text-sm transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
