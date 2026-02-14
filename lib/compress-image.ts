/**
 * Client-side image compression using Canvas API.
 * Compresses images to under a target size (default 500KB).
 * Accepts only JPEG, PNG, and WebP.
 */

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_TARGET_BYTES = 500 * 1024; // 500KB
const MAX_DIMENSION = 1600; // px — 夠晒 product image 用

export function isAcceptedImageType(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type);
}

/**
 * Compress an image file to under `targetBytes`.
 * Strategy: resize to max dimension, then reduce JPEG/WebP quality iteratively.
 */
export async function compressImage(
  file: File,
  targetBytes = MAX_TARGET_BYTES
): Promise<File> {
  // Already small enough and is jpeg/webp — skip
  if (file.size <= targetBytes && file.type !== "image/png") {
    return file;
  }

  const img = await loadImage(file);
  const { width, height } = fitDimensions(img.width, img.height, MAX_DIMENSION);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  // Output as WebP if supported, otherwise JPEG
  const outputType = "image/webp";

  // Try decreasing quality until under target
  let quality = 0.85;
  let blob = await canvasToBlob(canvas, outputType, quality);

  while (blob.size > targetBytes && quality > 0.3) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, outputType, quality);
  }

  // If still too large, scale down further
  if (blob.size > targetBytes) {
    const scale = Math.sqrt(targetBytes / blob.size) * 0.9;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, outputType, 0.7);
  }

  const ext = outputType === "image/webp" ? ".webp" : ".jpg";
  const name = file.name.replace(/\.[^.]+$/, ext);
  return new File([blob], name, { type: outputType });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

function fitDimensions(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = Math.min(max / w, max / h);
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      type,
      quality
    );
  });
}
