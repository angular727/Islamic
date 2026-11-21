/**
 * Human recordings of a Quran translation (a male reader), keyed by the id of the translation they read. A recording is
 * only listed here when the reader's source names the same translator as the text shown in the app, so the voice always
 * says what is on screen. Translations without a recording are spoken by the male text-to-speech voice instead.
 */
export interface TranslationRecording {
  /** Reader's name, shown in the player. */
  reader: string;
  url(surah: number, ayah: number, global: number): string;
}

const EVERYAYAH = 'https://everyayah.com/data/';
const pad = (n: number, w = 3) => String(n).padStart(w, '0');
const everyayah = (folder: string, reader: string): TranslationRecording => ({ reader, url: (s, a) => `${EVERYAYAH}${folder}/${pad(s)}${pad(a)}.mp3` });

export const TRANSLATION_RECORDINGS: Record<string, TranslationRecording> = {
  'ur.jalandhry': everyayah('translations/urdu_shamshad_ali_khan_46kbps', 'Shamshad Ali Khan'),
  'en.sahih': everyayah('English/Sahih_Intnl_Ibrahim_Walk_192kbps', 'Ibrahim Walk'),
  'fa.makarem': everyayah('translations/Makarem_Kabiri_16Kbps', 'Kabiri'),
  'fa.fooladvand': everyayah('translations/Fooladvand_Hedayatfar_40Kbps', 'Hedayatfar'),
  'bs.korkut': everyayah('translations/besim_korkut_ajet_po_ajet', 'Besim Korkut'),
  'tr.vakfi': { reader: 'Diyanet Vakfı', url: (_s, _a, g) => `https://cdn.islamic.network/quran/audio/128/tr.vakfi-audio/${g}.mp3` },
};
