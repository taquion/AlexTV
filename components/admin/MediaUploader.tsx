"use client";

import { useState, useRef, useCallback } from "react";

interface MediaUploaderProps {
  onUploadComplete: () => void;
}

export default function MediaUploader({ onUploadComplete }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      const fileArray = Array.from(files);

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setProgress(`Uploading ${i + 1}/${fileArray.length}: ${file.name}`);

        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            const err = await res.json();
            console.error(`Failed to upload ${file.name}:`, err.error);
          }
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
        }
      }

      setUploading(false);
      setProgress("");
      onUploadComplete();
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragOver
          ? "border-accent bg-accent/10"
          : "border-surface-border hover:border-text-muted"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
          }
        }}
      />
      {uploading ? (
        <div>
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-text-secondary text-sm">{progress}</p>
        </div>
      ) : (
        <div>
          <svg
            className="w-10 h-10 mx-auto mb-3 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 16V4m0 0l-4 4m4-4l4 4M4 18h16"
            />
          </svg>
          <p className="text-text-secondary">
            Drop files here or click to upload
          </p>
          <p className="text-text-muted text-sm mt-1">
            Images and videos up to 100MB
          </p>
        </div>
      )}
    </div>
  );
}
