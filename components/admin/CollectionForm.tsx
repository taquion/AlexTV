"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

interface CollectionFormData {
  name: string;
  slug: string;
  description: string;
  visibility: "PUBLIC" | "PIN";
  pin: string;
  youtubePlaylistUrl: string;
}

interface CollectionFormProps {
  initialData?: Partial<CollectionFormData>;
  onSubmit: (data: CollectionFormData) => Promise<void>;
  submitLabel?: string;
}

export default function CollectionForm({
  initialData,
  onSubmit,
  submitLabel = "Save",
}: CollectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<CollectionFormData>({
      defaultValues: {
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        visibility: initialData?.visibility || "PUBLIC",
        pin: "",
        youtubePlaylistUrl: initialData?.youtubePlaylistUrl || "",
      },
    });

  const visibility = watch("visibility");

  const autoSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug);
  };

  const handleFormSubmit = async (data: CollectionFormData) => {
    setError("");
    setLoading(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4 max-w-lg"
    >
      <div>
        <label className="block text-sm text-text-secondary mb-1">Name</label>
        <input
          className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
          {...register("name", { required: "Name is required" })}
          onChange={(e) => {
            register("name").onChange(e);
            if (!initialData?.slug) autoSlug(e.target.value);
          }}
        />
        {errors.name && (
          <p className="text-danger text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Slug</label>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-sm">/play/</span>
          <input
            className="flex-1 px-3 py-2 bg-surface border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
            {...register("slug", {
              required: "Slug is required",
              pattern: {
                value: /^[a-z0-9-]+$/,
                message: "Only lowercase letters, numbers, and hyphens",
              },
            })}
          />
        </div>
        {errors.slug && (
          <p className="text-danger text-sm mt-1">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">
          Description
        </label>
        <textarea
          rows={2}
          className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent resize-none"
          {...register("description")}
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">
          Visibility
        </label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="PUBLIC"
              className="accent-accent"
              {...register("visibility")}
            />
            <span>Public</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="PIN"
              className="accent-accent"
              {...register("visibility")}
            />
            <span>PIN Protected</span>
          </label>
        </div>
      </div>

      {visibility === "PIN" && (
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            PIN (4-8 digits)
          </label>
          <input
            type="password"
            maxLength={8}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
            {...register("pin", {
              minLength: { value: 4, message: "PIN must be at least 4 characters" },
              maxLength: { value: 8, message: "PIN must be at most 8 characters" },
            })}
          />
          {errors.pin && (
            <p className="text-danger text-sm mt-1">{errors.pin.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm text-text-secondary mb-1">
          YouTube Playlist URL (optional)
        </label>
        <input
          type="url"
          placeholder="https://www.youtube.com/playlist?list=..."
          className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
          {...register("youtubePlaylistUrl")}
        />
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
