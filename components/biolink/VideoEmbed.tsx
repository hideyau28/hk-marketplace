"use client";

import { useRef, useState, useEffect } from "react";
import { getEmbedUrl, detectVideoType } from "@/lib/video-embed";

type Props = {
  videoUrl: string;
};

export default function VideoEmbed({ videoUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const embedUrl = getEmbedUrl(videoUrl);
  const videoType = detectVideoType(videoUrl);

  // Lazy load via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!embedUrl) return null;

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black">
      {isVisible ? (
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={videoType === "instagram" ? "Instagram embed" : "YouTube embed"}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}
