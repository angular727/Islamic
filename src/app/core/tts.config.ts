/**
 * Text-to-speech configuration. The spoken translation is produced from the exact translation text shown on screen;
 * nothing here changes or generates any wording.
 */
export interface TtsConfig {
  /** Engines tried in this order for every piece of text (an engine that cannot speak the language is skipped). */
  providers: ('cloud' | 'device' | 'web')[];
  /**
   * Google Cloud Text-to-Speech (official, supports Urdu "ur-IN"). Needs an API key restricted to your site.
   * Its audio is cached on the device, so each verse is generated only once. Leave empty to skip it.
   */
  cloud: { apiKey: string; voiceType: 'Standard' | 'Wavenet' | '' };
  /** Language codes used by the cloud service when the plain code is not enough. */
  cloudLanguageCodes: Record<string, string>;
  /** Longest piece of text sent in one request (the free web voice accepts about 200 characters). */
  maxChunk: number;
}

export const TTS_CONFIG: TtsConfig = {
  providers: ['cloud', 'device', 'web'],
  cloud: { apiKey: '', voiceType: '' },
  cloudLanguageCodes: { ur: 'ur-IN', en: 'en-US', bn: 'bn-IN', tr: 'tr-TR', fr: 'fr-FR', ar: 'ar-XA', hi: 'hi-IN', fa: 'fa-IR' },
  maxChunk: 190,
};
