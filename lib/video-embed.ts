/**
 * Video embed utilities
 * 解析 IG Reel / YouTube link 並生成 embed URL
 */

export type VideoType = "instagram" | "youtube";

export function detectVideoType(url: string): VideoType | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") {
      return "youtube";
    }
    if (host === "instagram.com" || host === "m.instagram.com") {
      return "instagram";
    }
  } catch {
    return null;
  }
  return null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "").replace("m.", "");

    // youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (host === "youtube.com" && u.pathname === "/watch") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // youtube.com/shorts/VIDEO_ID
    if (host === "youtube.com" && u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/shorts/")[1]?.split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // youtube.com/embed/VIDEO_ID (already embed)
    if (host === "youtube.com" && u.pathname.startsWith("/embed/")) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}

export function getInstagramEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // instagram.com/reel/CODE/ or instagram.com/p/CODE/
    const match = u.pathname.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/);
    if (match) {
      const [, type, code] = match;
      return `https://www.instagram.com/${type}/${code}/embed`;
    }
  } catch {
    return null;
  }
  return null;
}

export function getEmbedUrl(url: string): string | null {
  const type = detectVideoType(url);
  if (type === "youtube") return getYouTubeEmbedUrl(url);
  if (type === "instagram") return getInstagramEmbedUrl(url);
  return null;
}
