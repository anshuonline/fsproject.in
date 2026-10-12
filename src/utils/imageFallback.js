/**
 * High-performance SVG fallback placeholders for music artworks and artist avatars
 */
export function getArtistAvatarFallback(name = 'Artist') {
  const initial = (name[0] || 'A').toUpperCase();
  const colors = [
    ['#00C853', '#004D20'],
    ['#00E676', '#007038'],
    ['#2979FF', '#0D47A1'],
    ['#FF6D00', '#BF360C'],
    ['#AA00FF', '#4A148C']
  ];
  const charCode = name.charCodeAt(0) || 0;
  const [c1, c2] = colors[charCode % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="100" fill="url(#grad)" />
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="bold" font-size="76" fill="#FFFFFF">${initial}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getArtworkFallback(title = 'Music') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <defs>
      <linearGradient id="artgrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#181818" />
        <stop offset="100%" stop-color="#0a0a0a" />
      </linearGradient>
    </defs>
    <rect width="300" height="300" rx="12" fill="url(#artgrad)" />
    <circle cx="150" cy="150" r="70" fill="none" stroke="#222222" stroke-width="4" />
    <circle cx="150" cy="150" r="30" fill="#00C853" opacity="0.8" />
    <path d="M142 135 L142 165 L165 150 Z" fill="#000000" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * YouTube serves a 120x90 gray "three dots" placeholder with HTTP 200 for
 * videos whose real thumbnail is unavailable — onError never fires, so it
 * must be detected via the rendered image's intrinsic dimensions.
 */
export function isGrayPlaceholder(img) {
  return Boolean(img && img.naturalWidth > 0 && img.naturalWidth <= 120 && img.naturalHeight <= 90);
}

/**
 * Build an ordered list of thumbnail candidates for a song:
 * primary source first, then progressively more reliable YouTube sizes.
 */
export function buildThumbFallbacks(primaryUrl, videoId) {
  const list = [];
  const push = (u) => {
    if (u && !list.includes(u)) list.push(u);
  };
  push(primaryUrl);
  if (videoId) {
    push(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
    push(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
    push(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`);
  }
  return list;
}

/**
 * Advance an <img> to its next thumbnail candidate when the current one
 * 404s (onError) or turns out to be YouTube's gray placeholder (onLoad).
 */
export function advanceThumb(img, candidates, fallbackSvg) {
  if (!img || !candidates || candidates.length === 0) return;
  const primary = candidates[0];
  if (img.dataset.fbFor !== primary) {
    img.dataset.fbFor = primary;
    img.dataset.fbStep = '0';
  }
  const step = Number(img.dataset.fbStep || 0) + 1;
  if (step < candidates.length) {
    img.dataset.fbStep = String(step);
    img.src = candidates[step];
  } else {
    img.onerror = null;
    img.dataset.fbStep = '0';
    img.src = fallbackSvg;
  }
}
