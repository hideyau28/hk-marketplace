"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import WishlistHeart from "@/components/WishlistHeart";
import VideoEmbed from "@/components/biolink/VideoEmbed";

type ProductImageCarouselProps = {
  images: string[];
  alt: string;
  stock?: number;
  productId?: string;
  videoUrl?: string | null;
};

export default function ProductImageCarousel({ images, alt, stock, productId, videoUrl }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for variant image change events
  useEffect(() => {
    const handler = (e: Event) => {
      const { imageUrl } = (e as CustomEvent<{ imageUrl: string | null }>).detail;
      setVariantImage(imageUrl);
      if (imageUrl) setCurrentIndex(0);
    };
    window.addEventListener("variantImageChange", handler);
    return () => window.removeEventListener("variantImageChange", handler);
  }, []);

  // Ensure we have at least one image, prepend variant image if present
  const baseImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60"];
  const imageList = variantImage
    ? [variantImage, ...baseImages.filter((img) => img !== variantImage)]
    : baseImages;

  const totalSlides = imageList.length + (videoUrl ? 1 : 0);
  const videoSlideIndex = videoUrl ? totalSlides - 1 : -1;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50;
    if (translateX > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (translateX < -threshold && currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50;
    if (translateX > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (translateX < -threshold && currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    setTranslateX(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  return (
    <div className="mx-4">
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        {/* Image Container */}
        <div
          ref={containerRef}
          className="relative aspect-square overflow-hidden select-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Low stock badge */}
          {stock !== undefined && stock > 0 && stock <= 5 && (
            <div
              className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-3 py-1.5 text-sm font-semibold text-white"
              style={{
                animation: "lowStockPulse 4s ease-in-out infinite",
              }}
            >
              🔥 快將售罄
            </div>
          )}

          {/* Wishlist heart - consistent with ProductCard */}
          {productId && <WishlistHeart productId={productId} size="md" />}
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${isDragging ? translateX : 0}px))`,
              transitionDuration: isDragging ? "0ms" : "300ms",
            }}
          >
            {imageList.map((image, index) => (
              <div key={index} className="relative w-full h-full flex-shrink-0">
                <Image
                  src={image}
                  alt={`${alt} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                  draggable={false}
                />
              </div>
            ))}
            {/* Video slide at end */}
            {videoUrl && (
              <div className="relative w-full h-full flex-shrink-0">
                {currentIndex === videoSlideIndex ? (
                  <VideoEmbed videoUrl={videoUrl} />
                ) : (
                  <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-white ml-1" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dot Indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-2 py-3">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-olive-600"
                    : "bg-zinc-300 dark:bg-zinc-600"
                } ${index === videoSlideIndex ? "ring-1 ring-olive-400" : ""}`}
                aria-label={index === videoSlideIndex ? "Video" : `Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
