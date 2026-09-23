import { TeacherCardData, DEFAULT_CARD_DATA, XCC5305_BESTWISHES_CARD } from '../types/card';

export const SHORT_WISH_ID = 'xcc5305-bestwishes';
export const SECRET_ACCESS_CODE = '12345';
export const SURPRISE_CODE = 'xcc5305-bestwishes';
const STORAGE_KEY = 'sjk_farewell_card_data_v3';
const UNLOCK_STORAGE_KEY = 'sjk_farewell_secret_unlocked_12345';

interface CompactCardPayload {
  t?: string; // teacherName
  rt?: string; // recipientTitle
  h?: string; // mainHeading
  m?: string; // farewellMessage
  o?: string; // signOff
  s?: string; // senderGroup
  th?: string; // themeId
  sg?: string; // selectedSongId
  sig?: string[]; // studentSignatures
}

/**
 * Validate secret access code (12345)
 */
export function validateSecretCode(code: string): boolean {
  if (!code) return false;
  const cleaned = code.trim().replace(/\s+/g, '');
  return cleaned === SECRET_ACCESS_CODE;
}

/**
 * Check if the session is currently unlocked with secret code
 */
export function isAccessCodeUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      sessionStorage.getItem(UNLOCK_STORAGE_KEY) === 'true' ||
      localStorage.getItem(UNLOCK_STORAGE_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

/**
 * Mark secret access code as unlocked
 */
export function setAccessCodeUnlocked(unlocked: boolean = true): void {
  if (typeof window === 'undefined') return;
  try {
    if (unlocked) {
      sessionStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
      localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
      localStorage.removeItem(UNLOCK_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Encode card data into a URL-safe Base64 string supporting UTF-8 characters.
 */
export function encodeCardData(card: TeacherCardData): string {
  try {
    const payload: CompactCardPayload = {
      t: card.teacherName,
      rt: card.recipientTitle,
      h: card.mainHeading,
      m: card.farewellMessage,
      o: card.signOff,
      s: card.senderGroup,
      th: card.themeId,
      sg: card.selectedSongId,
      sig: card.studentSignatures,
    };
    const jsonStr = JSON.stringify(payload);
    const utf8Bytes = encodeURIComponent(jsonStr).replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16))
    );
    return btoa(utf8Bytes);
  } catch (err) {
    console.warn('Failed to encode card data:', err);
    return '';
  }
}

/**
 * Decode URL-safe Base64 string back into partial TeacherCardData.
 */
export function decodeCardData(encoded: string): Partial<TeacherCardData> | null {
  try {
    const binary = atob(encoded);
    const jsonStr = decodeURIComponent(
      Array.from(binary)
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload: CompactCardPayload = JSON.parse(jsonStr);

    const result: Partial<TeacherCardData> = {};
    if (payload.t) result.teacherName = payload.t;
    if (payload.rt) result.recipientTitle = payload.rt;
    if (payload.h) result.mainHeading = payload.h;
    if (payload.m) result.farewellMessage = payload.m;
    if (payload.o) result.signOff = payload.o;
    if (payload.s) result.senderGroup = payload.s;
    if (payload.th) result.themeId = payload.th;
    if (payload.sg) result.selectedSongId = payload.sg;
    if (Array.isArray(payload.sig)) result.studentSignatures = payload.sig;

    return result;
  } catch (err) {
    console.warn('Failed to decode card data from URL:', err);
    return null;
  }
}

/**
 * Save card data to browser localStorage so edits are never lost on reload.
 */
export function saveCardData(card: TeacherCardData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
  } catch (err) {
    console.error('Failed to save card data to localStorage:', err);
  }
}

/**
 * Load initial card data:
 * 1. Checks short link parameter '?wish=xcc5305-bestwishes' or hash/path
 * 2. Checks URL parameter '?d=' or '?data='
 * 3. Checks browser localStorage
 * 4. Falls back to XCC5305_BESTWISHES_CARD
 */
export function loadInitialCardData(): { data: TeacherCardData; fromUrl: boolean } {
  if (typeof window === 'undefined') {
    return { data: XCC5305_BESTWISHES_CARD, fromUrl: false };
  }

  // 1. Check for the shortened link alias xcc5305-bestwishes
  try {
    const params = new URLSearchParams(window.location.search);
    const wishParam = params.get('wish');
    const codeParam = params.get('code');
    const idParam = params.get('id');
    const fullHref = window.location.href;

    if (
      wishParam === SHORT_WISH_ID ||
      codeParam === SHORT_WISH_ID ||
      idParam === SHORT_WISH_ID ||
      fullHref.includes(SHORT_WISH_ID)
    ) {
      saveCardData(XCC5305_BESTWISHES_CARD);
      return { data: XCC5305_BESTWISHES_CARD, fromUrl: true };
    }
  } catch {
    // Ignore URL parse error
  }

  // 2. Check legacy URL parameters
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('d') || params.get('data');
    if (encoded) {
      const parsed = decodeCardData(encoded);
      if (parsed && (parsed.teacherName || parsed.farewellMessage)) {
        const merged: TeacherCardData = {
          ...XCC5305_BESTWISHES_CARD,
          ...parsed,
        };
        saveCardData(merged);
        return { data: merged, fromUrl: true };
      }
    }
  } catch {
    // Ignore URL parse error
  }

  // 3. Check localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.teacherName && parsed.farewellMessage) {
        return {
          data: {
            ...XCC5305_BESTWISHES_CARD,
            ...parsed,
          },
          fromUrl: false,
        };
      }
    }
  } catch {
    // Ignore localStorage parse error
  }

  // 4. Primary fallback is the official XCC5305_BESTWISHES_CARD
  return { data: XCC5305_BESTWISHES_CARD, fromUrl: false };
}

/**
 * Returns the base URL for the current application.
 * By default, uses window.location.origin so the link works immediately without 404.
 * If preferShared is true, switches 'ais-dev-' to 'ais-pre-' for published share links.
 */
export function getBaseUrl(preferShared: boolean = false): string {
  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;
  if (preferShared && origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }
  return origin + window.location.pathname;
}

/**
 * Generate clean short URL for sharing:
 * e.g., https://host/?wish=xcc5305-bestwishes
 * Or with pre-authorized code: https://host/?wish=xcc5305-bestwishes&code=12345
 */
export function getShortSurpriseUrl(includeCode: boolean = false, preferShared: boolean = false): string {
  if (typeof window === 'undefined') return '';
  const baseUrl = getBaseUrl(preferShared);
  if (includeCode) {
    return `${baseUrl}?wish=${SHORT_WISH_ID}&code=${SECRET_ACCESS_CODE}`;
  }
  return `${baseUrl}?wish=${SHORT_WISH_ID}`;
}

/**
 * Generate shareable surprise link with customized wishes.
 * If matches the primary card, returns clean short link!
 */
export function getShareableSurpriseUrl(
  card: TeacherCardData,
  includeCode: boolean = false,
  preferShared: boolean = false
): string {
  if (typeof window === 'undefined') return '';
  const baseUrl = getBaseUrl(preferShared);

  // If card matches the xcc5305-bestwishes preset, use the clean short link
  if (
    card.teacherName === XCC5305_BESTWISHES_CARD.teacherName &&
    card.senderGroup === XCC5305_BESTWISHES_CARD.senderGroup
  ) {
    return getShortSurpriseUrl(includeCode, preferShared);
  }

  // Otherwise generate custom data url
  const encodedData = encodeCardData(card);
  const params = new URLSearchParams();
  params.set('wish', SHORT_WISH_ID);
  if (includeCode) {
    params.set('code', SECRET_ACCESS_CODE);
  }
  if (encodedData) {
    params.set('d', encodedData);
  }
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Reset to school defaults
 */
export function resetCardData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
