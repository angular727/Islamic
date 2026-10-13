/** Small helpers for language codes. They contain no translations. */

/** Scripts written right-to-left, used only when neither an API nor the browser can tell. */
const RTL_FALLBACK = new Set(['ar', 'fa', 'he', 'iw', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv', 'ckb']);
/** Direction hints learned from the country/language API. */
const rtlHints = new Map<string, boolean>();

export const baseLang = (code: string) => (code || 'en').toLowerCase().split(/[-_]/)[0];

export function registerRtl(code: string, rtl: boolean) { rtlHints.set(code.toLowerCase(), rtl); }

export function isRtl(code: string): boolean {
  const c = (code || 'en').toLowerCase();
  if (rtlHints.has(c)) return rtlHints.get(c)!;
  if (rtlHints.has(baseLang(c))) return rtlHints.get(baseLang(c))!;
  try {
    const l: any = new Intl.Locale(code);
    const dir = (l.getTextInfo?.() ?? l.textInfo)?.direction;
    if (dir) return dir === 'rtl';
  } catch { /* unsupported tag */ }
  return RTL_FALLBACK.has(baseLang(c));
}

/** Name of a language written in a given locale (defaults to the language itself, i.e. its native name). */
export function languageName(code: string, inLocale?: string): string {
  try { return new Intl.DisplayNames([inLocale ?? code], { type: 'language' }).of(code) ?? ''; } catch { return ''; }
}

/** Flag emoji for an ISO 3166 country code. */
export const flag = (cc: string) => cc.toUpperCase().replace(/./g, ch => String.fromCodePoint(127397 + ch.charCodeAt(0)));
