/**
 * Utilities for formatting Google Drive image links and general image handling
 */

export function transformDriveUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // Check if it is a Google Drive link
  if (trimmed.includes('drive.google.com')) {
    // Pattern 1: /file/d/FILE_ID/view...
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1200`;
    }

    // Pattern 2: ?id=FILE_ID or &id=FILE_ID
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}&sz=w1200`;
    }

    // Pattern 3: /open?id=FILE_ID
    const openMatch = trimmed.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openMatch && openMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w1200`;
    }
  }

  return trimmed;
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
