"use client";

import { useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

type ImageUploadProps = {
  currentUrl?: string;
  onUpload: (url: string) => void;
  disabled?: boolean;
};

export default function ImageUpload({ currentUrl, onUpload, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET || "",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      const url = data.data.url;
      setPreview(url);
      onUpload(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPreview("");
    onUpload("");
    setError("");
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || isUploading}
            className="absolute top-2 right-2 rounded-full bg-white/90 p-2 text-zinc-600 hover:bg-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer ${
            disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-zinc-400 animate-spin mb-2" />
              <span className="text-sm text-zinc-500">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-zinc-400 mb-2" />
              <span className="text-sm text-zinc-600 font-medium">Upload Product Image</span>
              <span className="text-xs text-zinc-400 mt-1">PNG, JPG up to 5MB</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {!preview && !isUploading && (
        <p className="text-xs text-zinc-400">
          Or paste an image URL in the field above
        </p>
      )}
    </div>
  );
}
