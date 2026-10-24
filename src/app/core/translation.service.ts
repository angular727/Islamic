import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { baseLang } from './lang-utils';
import { SettingsService } from './settings.service';
import { idbGet, idbSet, lsGet, lsSet } from './store';

export type TranslationSource = 'alquran' | 'fawaz';

export interface Translator {
  /** Edition id used everywhere in the app (also saved in settings). `fz.` ids come from the Quran API on jsDelivr. */
  id: string;
  /** Translator's name in English and Urdu, and the title of the translation. */
  name: string; urduName: string; title: string;
  /** ISO 639 language code, e.g. "ur", "hi", "fa". */
  language: string;
  dir: 'rtl' | 'ltr';
  source?: TranslationSource;
  /** Short note about the source, shown in the picker. */
  sourceLabel?: string;
  /** For a translation of an Urdu scholar's work in another language: the id of that scholar's Urdu translation. */
  scholar?: string;
  available: boolean;
  /** Why a translation cannot be selected yet. */
  reason?: string;
  note?: string;
}

const NO_SOURCE = `No complete, openly licensed digital edition of this work was found in any Quran API, so it is not offered yet. Showing a different translation under this name would be incorrect.`;
const ALQURAN = 'AlQuran Cloud (Tanzil)';
const FAWAZ = 'Quran API (fawazahmed0)';

/** The eight Urdu translators requested, in the requested order. */
export const URDU_TRANSLATORS: Translator[] = [
  { id: 'ur.dehlvi-abdulqadir', name: 'Shah Abdul Qadir Dehlvi', urduName: 'شاہ عبدالقادر دہلوی', title: 'Tarjuma-e-Quran (Mauzih-ul-Quran)', language: 'ur', dir: 'rtl', available: false, reason: NO_SOURCE },
  { id: 'ur.dehlvi-rafiuddin', name: 'Shah Rafiuddin Dehlvi', urduName: 'شاہ رفیع الدین دہلوی', title: 'Literal word-for-word Quran translation', language: 'ur', dir: 'rtl', available: false, reason: NO_SOURCE },
  { id: 'ur.thanvi-bayan', name: 'Maulana Ashraf Ali Thanvi', urduName: 'مولانا اشرف علی تھانوی', title: 'Bayan-ul-Quran', language: 'ur', dir: 'rtl', available: false, reason: NO_SOURCE,
    note: 'Not to be confused with the other works that share the name "Bayan-ul-Quran" (by Dr. Israr Ahmad and by Maulana Muhammad Ali).' },
  { id: 'ur.jalandhry', name: 'Maulana Fateh Muhammad Jalandhari', urduName: 'مولانا فتح محمد جالندھری', title: 'Aasan Urdu Translation', language: 'ur', dir: 'rtl', source: 'alquran', sourceLabel: ALQURAN, available: true },
  { id: 'ur.kanzuliman', name: 'Maulana Ahmad Raza Khan Barelvi', urduName: 'مولانا احمد رضا خان بریلوی', title: 'Kanz-ul-Iman', language: 'ur', dir: 'rtl', source: 'alquran', sourceLabel: ALQURAN, available: true },
  { id: 'ur.maududi', name: "Maulana Abul A'la Maududi", urduName: 'مولانا ابوالاعلیٰ مودودی', title: 'Tafheem-ul-Quran', language: 'ur', dir: 'rtl', source: 'alquran', sourceLabel: ALQURAN, available: true,
    note: 'The translation text of Tafheem-ul-Quran. The commentary is not included.' },
  { id: 'ur.junagarhi', name: 'Maulana Muhammad Junagarhi', urduName: 'مولانا محمد جوناگڑھی', title: 'Urdu Translation of the Quran', language: 'ur', dir: 'rtl', source: 'alquran', sourceLabel: ALQURAN, available: true },
  { id: 'fz.urd-muhammadtaqiusm', name: 'Mufti Muhammad Taqi Usmani', urduName: 'مفتی محمد تقی عثمانی', title: 'Aasan Tarjuma-e-Quran', language: 'ur', dir: 'rtl', source: 'fawaz', sourceLabel: FAWAZ, available: true },
];

/** Translations in other languages that the app already offered. */
export const OTHER_TRANSLATORS: Translator[] = [
  { id: 'en.sahih', name: 'Saheeh International', urduName: '', title: 'English', language: 'en', dir: 'ltr', source: 'alquran', sourceLabel: ALQURAN, available: true },
  { id: 'bn.bengali', name: 'Muhiuddin Khan', urduName: '', title: 'বাংলা', language: 'bn', dir: 'ltr', source: 'alquran', sourceLabel: ALQURAN, available: true },
  { id: 'tr.diyanet', name: 'Diyanet', urduName: '', title: 'Türkçe', language: 'tr', dir: 'ltr', source: 'alquran', sourceLabel: ALQURAN, available: true },
  { id: 'fr.hamidullah', name: 'Hamidullah', urduName: '', title: 'Français', language: 'fr', dir: 'ltr', source: 'alquran', sourceLabel: ALQURAN, available: true },
];

/**
 * The same scholar's own translation in another language, where one is published in the sources used. Nothing here is
 * machine-translated: each entry is a separate published edition by that scholar, and a scholar with no entry is simply
 * available in one language only.
 */
export const SCHOLAR_EDITIONS: Translator[] = [
  { id: 'en.maududi', name: "Maulana Abul A'la Maududi", urduName: '', title: 'English', language: 'en', dir: 'ltr', scholar: 'ur.maududi', source: 'alquran', sourceLabel: ALQURAN, available: true },
  { id: 'en.ahmedraza', name: 'Maulana Ahmad Raza Khan Barelvi', urduName: '', title: 'English', language: 'en', dir: 'ltr', scholar: 'ur.kanzuliman', source: 'alquran', sourceLabel: ALQURAN, available: true },
  { id: 'fz.eng-muftitaqiusmani', name: 'Mufti Muhammad Taqi Usmani', urduName: '', title: 'English', language: 'en', dir: 'ltr', scholar: 'fz.urd-muhammadtaqiusm', source: 'fawaz', sourceLabel: FAWAZ, available: true },
];

export const ALL_TRANSLATORS: Translator[] = [...URDU_TRANSLATORS, ...OTHER_TRANSLATORS, ...SCHOLAR_EDITIONS];
export const DEFAULT_TRANSLATION = 'ur.jalandhry';

/** Editions from the AlQuran Cloud catalogue (Tanzil and others), added once the catalogue is loaded or a choice is restored. */
const EXTRA = new Map<string, Translator>();
export const translatorById = (id: string) => ALL_TRANSLATORS.find(t => t.id === id) ?? EXTRA.get(id);

const ODD_CODES: Record<string, string> = { ba: 'Bosnian', ce: 'Chechen', ber: 'Berber' };

/** Name of a language in itself ("हिन्दी") and in English ("Hindi"). */
export function languageNames(code: string): { native: string; english: string } {
  const odd = ODD_CODES[code];                       // codes the catalogue uses that are not standard language codes
  if (odd) return { native: odd, english: odd };
  const of = (loc: string) => { try { return new Intl.DisplayNames([loc], { type: 'language' }).of(code) ?? code; } catch { return code; } };
  return { native: of(code), english: of('en') };
}

interface CatalogEdition { identifier: string; language: string; englishName: string; direction: string | null }
const CATALOG = 'https://api.alquran.cloud/v1/edition?format=text&type=translation';
const CATALOG_DAYS = 14;
const toTranslator = (e: CatalogEdition): Translator => ({
  id: e.identifier, name: e.englishName, urduName: '', title: languageNames(e.language).native, language: e.language,
  dir: e.direction === 'rtl' ? 'rtl' : 'ltr', source: 'alquran', sourceLabel: ALQURAN, available: true,
});

/** Short label such as "Fateh Muhammad Jalandhari – Aasan Urdu Translation". */
export const translatorLabel = (t: Translator) => t.language === 'ur' ? `${t.name.replace('Maulana ', '').replace('Mufti ', '')} – ${t.title}` : `${t.title} – ${t.name}`;

/**
 * Single place that knows which translation is selected. It is stored in the user's settings (and therefore
 * restored on the next visit and included in Backup). An unknown or unavailable id falls back to the default.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private settings = inject(SettingsService);

  readonly urdu = URDU_TRANSLATORS;
  readonly others = OTHER_TRANSLATORS;
  /** Every other translation the catalogue offers, grouped by language (Urdu is listed above). Empty until loaded. */
  readonly catalog = signal<Translator[]>([]);
  readonly catalogError = signal(false);
  readonly languages = computed(() => {
    const codes = [...new Set([...OTHER_TRANSLATORS, ...this.catalog()].map(t => t.language))];
    return codes.map(code => ({ code, ...languageNames(code) })).sort((a, b) => a.english.localeCompare(b.english));
  });

  constructor() {
    // Restore a previously chosen catalogue edition straight away, before the catalogue itself is loaded.
    const saved = lsGet<Translator | null>('i360.translatorExtra', null);
    if (saved?.id) EXTRA.set(saved.id, saved);
    // The catalogue is needed as soon as the app is in a language that may have its own translation.
    effect(() => { if (this.followCode()) untracked(() => void this.loadCatalog()); });
  }

  /** The app language when the Quran translation should follow it (not English or Urdu, which keep the saved choice). */
  private followCode = computed(() => {
    const s = this.settings.s(); const code = baseLang(s.lang);
    return s.translationAuto && code !== 'en' && code !== 'ur' ? code : '';
  });

  /** The translation chosen automatically for the app language, if the catalogue has one. */
  readonly autoPick = computed(() => {
    const c = this.followCode(); if (!c) return undefined;
    // Keep the same scholar when that scholar's own translation exists in the app language.
    const key = this.scholarKeyOf(this.settings.s().translation);
    return (key ? this.scholarLanguages(key).find(t => t.language === c) : undefined) ?? this.inLanguage(c)[0];
  });
  private scholarKeyOf(id: string) { const t = translatorById(id); const k = t?.scholar ?? t?.id ?? ''; return URDU_TRANSLATORS.some(u => u.id === k) ? k : ''; }
  /** True when the app language has translations, so "follow the app language" can be offered. */
  readonly appLanguageHasTranslation = computed(() => { const c = baseLang(this.settings.s().lang); return c !== 'en' && c !== 'ur' && this.inLanguage(c).length > 0; });
  readonly following = computed(() => !!this.autoPick());

  /** Go back to showing the translation in the app's language. */
  followApp() { this.settings.patch({ translationAuto: true }); }

  /** Loads the list of available translations (cached for two weeks; the cached copy is used if the network fails). */
  private loading?: Promise<void>;
  loadCatalog(): Promise<void> {
    if (this.catalog().length) return Promise.resolve();
    return this.loading ??= this.fetchCatalog().finally(() => (this.loading = undefined));
  }

  private async fetchCatalog() {
    this.catalogError.set(false);
    try {
      const cached = await idbGet<{ at: number; list: CatalogEdition[] }>('quran:catalog');
      let list = cached && Date.now() - cached.at < CATALOG_DAYS * 864e5 ? cached.list : undefined;
      if (!list) {
        try {
          const r = await fetch(CATALOG);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          list = ((await r.json()).data as CatalogEdition[]);
          await idbSet('quran:catalog', { at: Date.now(), list });
        } catch (e) { if (!cached) throw e; list = cached.list; }
      }
      const known = new Set(ALL_TRANSLATORS.map(t => t.id));
      const extra = list.filter(e => e.language !== 'ur' && e.language !== 'ar' && e.identifier && !known.has(e.identifier)).map(toTranslator);
      extra.forEach(t => EXTRA.set(t.id, t));
      this.catalog.set(extra);
    } catch { this.catalogError.set(true); }
  }

  /** Editions in one language: the built-in ones first, then the catalogue's (each edition once). */
  inLanguage(code: string) {
    const seen = new Set<string>();
    return [...OTHER_TRANSLATORS, ...SCHOLAR_EDITIONS, ...this.catalog()].filter(t => t.language === code && !seen.has(t.id) && !!seen.add(t.id));
  }

  /** The Urdu scholar whose work is currently shown (in any language), or '' when the selection is another translator. */
  readonly scholarKey = computed(() => { const t = this.selected(); const k = t.scholar ?? t.id; return URDU_TRANSLATORS.some(u => u.id === k && u.available) ? k : ''; });

  /** One scholar's available translations, one per language: the original Urdu first, then the other languages published. */
  scholarLanguages(key: string): Translator[] {
    const base = URDU_TRANSLATORS.find(t => t.id === key && t.available);
    return base ? [base, ...SCHOLAR_EDITIONS.filter(t => t.scholar === key)] : [];
  }

  readonly selectedId = computed(() => {
    const auto = this.autoPick();
    if (auto) return auto.id;
    const t = translatorById(this.settings.s().translation);
    return t?.available ? t.id : DEFAULT_TRANSLATION;
  });
  readonly selected = computed(() => translatorById(this.selectedId())!);
  readonly isUrdu = computed(() => this.selected().language === 'ur');

  /** Returns false (and changes nothing) for a translation that is not available. */
  select(id: string): boolean {
    const t = translatorById(id);
    if (!t?.available) return false;
    this.settings.patch({ translation: id, translationAuto: false });   // an explicit choice stops following the app language
    if (EXTRA.has(id)) lsSet('i360.translatorExtra', EXTRA.get(id)!);
    return true;
  }
}
