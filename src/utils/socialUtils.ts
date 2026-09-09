/**
 * Helper utilities for TikTok, Instagram and social media embeds & parsing
 */

export interface ParsedSocialUrl {
  platform: 'tiktok' | 'instagram' | 'youtube';
  videoId?: string;
  embedUrl?: string;
  authorHandle?: string;
  extractedTitle?: string;
  isValid: boolean;
  cleanUrl: string;
}

export function parseSocialUrl(input: string): ParsedSocialUrl {
  if (!input) {
    return { platform: 'tiktok', isValid: false, cleanUrl: '' };
  }

  const trimmed = input.trim();

  // 1. Check if user pasted a complete TikTok <blockquote> embed snippet
  if (trimmed.includes('tiktok-embed') || trimmed.includes('data-video-id=')) {
    const idMatch = trimmed.match(/data-video-id=["'](\d+)["']/);
    const citeMatch = trimmed.match(/cite=["']([^"']+)["']/);
    const authorMatch = trimmed.match(/title=["'](@[A-Za-z0-9_.-]+)["']/) || trimmed.match(/href=["']https:\/\/www\.tiktok\.com\/(@[A-Za-z0-9_.-]+)/);
    const textMatch = trimmed.match(/<p>([\s\S]*?)<\/p>/);

    const videoId = idMatch ? idMatch[1] : undefined;
    const cleanUrl = citeMatch ? citeMatch[1].split('?')[0] : (videoId ? `https://www.tiktok.com/@rosanfer14/video/${videoId}` : trimmed);
    const authorHandle = authorMatch ? authorMatch[1] : '@rosanfer14';
    const extractedTitle = textMatch ? textMatch[1].replace(/<[^>]*>/g, '').trim() : undefined;

    return {
      platform: 'tiktok',
      videoId,
      embedUrl: videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : undefined,
      authorHandle,
      extractedTitle,
      isValid: !!videoId || !!citeMatch,
      cleanUrl,
    };
  }

  // 2. TikTok URL detection
  if (trimmed.includes('tiktok.com')) {
    // Matches /video/1234567890123456789
    const videoMatch = trimmed.match(/\/video\/(\d+)/);
    const embedMatch = trimmed.match(/\/embed\/(?:v2\/)?(\d+)/);
    const authorMatch = trimmed.match(/@([A-Za-z0-9_.-]+)/);

    const resolvedId = videoMatch ? videoMatch[1] : (embedMatch ? embedMatch[1] : undefined);
    const authorHandle = authorMatch ? `@${authorMatch[1]}` : '@rosanfer14';

    return {
      platform: 'tiktok',
      videoId: resolvedId,
      embedUrl: resolvedId ? `https://www.tiktok.com/embed/v2/${resolvedId}` : undefined,
      authorHandle,
      isValid: true,
      cleanUrl: trimmed.split('?')[0],
    };
  }

  // 3. Instagram detection
  if (trimmed.includes('instagram.com')) {
    const reelMatch = trimmed.match(/\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
    const reelId = reelMatch ? reelMatch[1] : undefined;
    const authorMatch = trimmed.match(/instagram\.com\/([A-Za-z0-9_.-]+)/);

    return {
      platform: 'instagram',
      videoId: reelId,
      embedUrl: reelId ? `https://www.instagram.com/reel/${reelId}/embed` : undefined,
      authorHandle: authorMatch ? `@${authorMatch[1]}` : '@rosanfer.floreria',
      isValid: true,
      cleanUrl: trimmed.split('?')[0],
    };
  }

  // 4. YouTube Shorts / Videos
  if (trimmed.includes('youtube.com/shorts/') || trimmed.includes('youtu.be/')) {
    const shortMatch = trimmed.match(/\/shorts\/([A-Za-z0-9_-]+)/) || trimmed.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
    const videoId = shortMatch ? shortMatch[1] : undefined;

    return {
      platform: 'youtube',
      videoId: videoId,
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : undefined,
      authorHandle: '@rosanfer.floreria',
      isValid: true,
      cleanUrl: trimmed.split('?')[0],
    };
  }

  // Fallback
  return {
    platform: 'tiktok',
    isValid: trimmed.startsWith('http://') || trimmed.startsWith('https://'),
    cleanUrl: trimmed,
  };
}

/**
 * Loads the TikTok embed script or triggers a re-render of embeds
 */
export function reloadTikTokEmbeds() {
  if (typeof window === 'undefined') return;

  const scriptId = 'tiktok-embed-script';
  const existingScript = document.getElementById(scriptId);

  if (!existingScript) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  } else {
    // Re-trigger TikTok embed scan if available
    try {
      // Remove and re-add or invoke if window is initialized
      const script = document.createElement('script');
      script.src = `https://www.tiktok.com/embed.js?t=${Date.now()}`;
      script.async = true;
      document.body.appendChild(script);
      setTimeout(() => script.remove(), 1000);
    } catch {
      // ignore
    }
  }
}
