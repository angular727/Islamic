/**
 * Configuration of the language and translation APIs. Everything that depends on an external service lives here,
 * so switching to an official or self-hosted provider is a one-line change.
 */
export interface I18nConfig {
  /** Language the app is written in. Text in this language is never sent to a translation API. */
  sourceLanguage: string;
  /** Providers are tried in order until one answers. Unconfigured providers are skipped. */
  providers: ('libre' | 'google-web' | 'mymemory')[];
  /**
   * LibreTranslate (self-hosted, or libretranslate.com with an API key). This is the recommended production setup.
   * Example: { url: 'https://translate.example.com', apiKey: '...' }
   */
  libre: { url: string; apiKey: string };
  /** GraphQL API that lists countries with the languages spoken there (ISO 639-1 codes and native names). */
  countriesApi: string;
  /** How long the language and country lists are cached on the device. */
  listCacheDays: number;
}

export const I18N_CONFIG: I18nConfig = {
  sourceLanguage: 'en',
  providers: ['libre', 'google-web', 'mymemory'],
  libre: { url: '', apiKey: '' },
  countriesApi: 'https://countries.trevorblades.com/graphql',
  listCacheDays: 7,
};
