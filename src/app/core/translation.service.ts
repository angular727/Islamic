import { Injectable, computed, inject } from '@angular/core';
import { SettingsService } from './settings.service';

export type TranslationSource = 'alquran' | 'fawaz';

export interface Translator {
  /** Edition id used everywhere in the app (also saved in settings). `fz.` ids come from the Quran API on jsDelivr. */
  id: string;
  /** Translator's name in English and Urdu, and the title of the translation. */
  name: string; urduName: string; title: string;
  language: 'ur' | 'en' | 'bn' | 'tr' | 'fr';
  dir: 'rtl' | 'ltr';
  source?: TranslationSource;
  /** Short note about the source, shown in the picker. */
  sourceLabel?: string;
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

export const ALL_TRANSLATORS: Translator[] = [...URDU_TRANSLATORS, ...OTHER_TRANSLATORS];
export const DEFAULT_TRANSLATION = 'ur.jalandhry';

export const translatorById = (id: string) => ALL_TRANSLATORS.find(t => t.id === id);

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

  readonly selectedId = computed(() => {
    const t = translatorById(this.settings.s().translation);
    return t?.available ? t.id : DEFAULT_TRANSLATION;
  });
  readonly selected = computed(() => translatorById(this.selectedId())!);
  readonly isUrdu = computed(() => this.selected().language === 'ur');

  /** Returns false (and changes nothing) for a translation that is not available. */
  select(id: string): boolean {
    const t = translatorById(id);
    if (!t?.available) return false;
    this.settings.patch({ translation: id });
    return true;
  }
}
