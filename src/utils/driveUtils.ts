/**
 * Utilities for formatting Google Drive image links and general image handling
 */

export const BOUTIQUE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=85';

/**
 * Extracts the Google Drive file ID from various URL patterns
 */
export function extractDriveFileId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const clean = rawUrl.trim().replace(/^["'<]+|["'>]+$/g, '');

  // Pattern 1: drive.google.com/file/d/FILE_ID...
  const fileDMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id=FILE_ID or &id=FILE_ID
  const idParamMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Pattern 3: /open?id=FILE_ID
  const openMatch = clean.match(/\/open\?id=([a-zA-Z0-9_-]{15,})/);
  if (openMatch && openMatch[1]) return openMatch[1];

  // Pattern 4: /d/FILE_ID/
  const shortDMatch = clean.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (shortDMatch && shortDMatch[1]) return shortDMatch[1];

  // Pattern 5: drive.google.com/uc?id=FILE_ID
  const ucMatch = clean.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]{15,})/);
  if (ucMatch && ucMatch[1]) return ucMatch[1];

  // Pattern 6: direct file ID string (alphanumeric with _ or -, typically 25 to 45 chars)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(clean)) {
    return clean;
  }

  return null;
}

/**
 * Transforms any Google Drive URL into a high-resolution, publicly renderable image URL.
 * Works seamlessly with Google's public thumbnail service (`/thumbnail?id=...&sz=w1200`).
 */
export function transformDriveUrl(rawUrl: string, size: number = 1200): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const clean = rawUrl.trim().replace(/^["'<]+|["'>]+$/g, '');

  const fileId = extractDriveFileId(clean);
  if (fileId) {
    // Google Drive thumbnail endpoint: high resolution, no virus warning page, fast caching
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  }

  return clean;
}

/**
 * Alternative Google Drive direct image URL (fallback if thumbnail endpoint is throttled)
 */
export function getDriveSecondaryUrl(rawUrl: string): string {
  const fileId = extractDriveFileId(rawUrl);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return rawUrl;
}

/**
 * Analyzes an image URL to provide friendly validation messages in the admin UI
 */
export function analyzeImageUrl(rawUrl: string): {
  isDrive: boolean;
  fileId: string | null;
  transformedUrl: string;
  isValid: boolean;
  advice: string;
} {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      isDrive: false,
      fileId: null,
      transformedUrl: '',
      isValid: false,
      advice: 'Ingresa un enlace de Google Drive o URL web.',
    };
  }

  const clean = rawUrl.trim();
  const fileId = extractDriveFileId(clean);

  if (fileId) {
    return {
      isDrive: true,
      fileId,
      transformedUrl: transformDriveUrl(clean),
      isValid: true,
      advice:
        'Enlace de Google Drive detectado correctamente. Asegúrate de que en Drive tenga acceso general: "Cualquier persona con el enlace puede ver".',
    };
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return {
      isDrive: false,
      fileId: null,
      transformedUrl: clean,
      isValid: true,
      advice: 'Enlace web directo estándar.',
    };
  }

  return {
    isDrive: false,
    fileId: null,
    transformedUrl: clean,
    isValid: false,
    advice: 'Por favor ingresa un link válido con https:// o un ID de Google Drive.',
  };
}

export function formatCurrency(amount: number, currency: string = 'S/.'): string {
  return `${currency} ${amount.toFixed(2)}`;
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function isGoogleDriveUrl(rawUrl: string): boolean {
  return extractDriveFileId(rawUrl) !== null;
}

export function safeGetStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved) as T;
      }
    }
  } catch (e) {
    console.warn(`Error accessing localStorage for ${key}:`, e);
  }
  return defaultValue;
}

export function safeSetStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn(`Error writing to localStorage for ${key}:`, e);
  }
}
