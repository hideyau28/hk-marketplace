"use client";

import { useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { compressImage, isAcceptedImageType } from "@/lib/compress-image";

type ImageUploadProps = {
  currentUrl?: string;
  onUpload: (url: string) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
  aspectClass?: string;
  previewRounded?: boolean;
};

export default function ImageUpload({
  currentUrl,
  onUpload,
  disabled,
  label = "Upload Product Image",
  hint = "JPG, PNG, WebP — auto-compressed",
  aspectClass = "aspect-square",
  previewRounded = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type — only JPG, PNG, WebP
    if (!isAcceptedImageType(file)) {
      setError("Only JPG, PNG, WebP accepted");
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      // 壓縮到 500KB 以下
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append("file", compressed);

      console.log("[ImageUpload] Starting upload, file size:", compressed.size);

      let response: Response;
      try {
        response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
      } catch (fetchErr) {
        // TypeError = network failure (CORS, offline, DNS, etc.)
        console.error("[ImageUpload] fetch failed:", fetchErr);
        setError("網絡錯誤，請重試");
        return;
      }

      console.log("[ImageUpload] Response status:", response.status);

      if (!response.ok) {
        const body = await response.text();
        console.error("[ImageUpload] Non-OK response:", response.status, body);

        if (response.status === 401 || response.status === 403) {
          setError("登入已過期，請重新登入");
        } else if (response.status >= 500) {
          setError("伺服器錯誤，請稍後重試");
        } else {
          // Try to parse error message from JSON body
          try {
            const data = JSON.parse(body);
            setError(data.error?.message || "Upload failed");
          } catch {
            setError(`Upload failed (${response.status})`);
          }
        }
        return;
      }

      const data = await response.json();

      if (!data.ok) {
        console.error("[ImageUpload] API returned ok:false:", data);
        throw new Error(data.error?.message || "Upload failed");
      }

      const url = data.data.url;
      console.log("[ImageUpload] Upload success:", url);
      setPreview(url);
      onUpload(url);
    } catch (err) {
      console.error("[ImageUpload] Unexpected error:", err);
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
        <div className={`relative border border-zinc-200 bg-zinc-50 overflow-hidden ${previewRounded ? "rounded-full w-32 h-32" : "rounded-lg"}`}>
          <img src={preview} alt="Preview" className={`object-cover ${previewRounded ? "w-32 h-32" : `w-full ${aspectClass}`}`} />
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
          className={`flex flex-col items-center justify-center w-full ${aspectClass} rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer ${
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
              <span className="text-sm text-zinc-600 font-medium">{label}</span>
              <span className="text-xs text-zinc-400 mt-1">{hint}</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
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

    </div>
  );
}
