# Islam (Angular 19 + Bootstrap 5)

All-in-one Islamic web app: Quran, Hadith, Duas & Azkar, Prayer Times, Qibla, Tasbeeh, Hijri Calendar,
Audio, Search, Bookmarks, Notes and Settings, built from the "Islam – App Flow & Pages" design.

## Run

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build in dist/
```

## Flow

Splash → Onboarding → Language → Madhab → Location → Home (bottom tabs: Home, Library, Search, More).
Onboarding runs once; afterwards the app opens straight on Home.

## Where things live

| Folder | Purpose |
|---|---|
| `src/app/core` | Services: settings, i18n (6 languages + RTL), prayer times (adhan), location, notifications, Quran / Hadith APIs, audio player, user data (bookmarks, notes, tasbeeh), PIN lock |
| `src/app/data` | Bundled Duas & Azkar, reciters |
| `src/app/features` | One file per feature area (pages) |
| `public/data/hadith-books.json` | Hadith book/chapter index (rebuild with `node scripts/build-hadith-index.js`) |

## Learning section (Library tab)

- **Asma-ul-Husna** (`/names`): 99 names with Arabic, transliteration, English and Urdu meanings, search and theme filters, pronunciation tips. Data: `public/data/names.json` (rebuild with `node scripts/build-learning-data.js`).
- **Duas** (`/duas`): Arabic, transliteration, English and Urdu, references, category and occasion folders.
- **Shahadat** (`/shahadat`), **Waqf rules** (`/waqf`, examples are real ayahs from the Uthmani text), **Pronunciation guide** (`/pronunciation`) and **Flashcards** (`/flashcards`, progress saved locally).

## Ibadaat tab (worship guides)

Bottom-nav tab with five guides: Prayer (Namaz), Fasting (Roza), Hajj, Umrah and Funeral Prayer (Janaza) - 77 lessons.

- Content lives in plain data files: `src/app/data/ibadaat/*.ts` (one per section, model in `model.ts`). Add or edit lessons there; no component changes needed.
- Routes: `/ibadaat`, `/ibadaat/:section`, `/ibadaat/:section/:lesson`.
- Rulings that differ between schools use the school selector (shares the app Madhab setting; Hanafi by default).
- Progress, checklists, the Ramadan tracker and bookmarks are stored on the device and included in Backup.
- `npm test` runs data-integrity tests (needs Chrome; set `CHROME_BIN` if it is not on the default path).

## Languages (API-driven)

Settings > Language (also More > Language and the first-run setup) lists every language from an API and translates the whole interface into the chosen one.

- **Language list:** the translation provider (240+ languages) plus a countries API that gives each country's languages with native names and text direction. Browse **All languages** or **By country**; any language can be chosen in any country. Lists are cached for 7 days; if the APIs are down a short list is built from the browser's languages.
- **Translation:** `DomTranslator` translates all visible text, placeholders and tooltips (menus, buttons, forms, dialogs, toasts, notifications) through `TranslateService`, which batches requests, falls back between providers and caches every string per language on the device. New screens and new languages need no code changes. If the service is unreachable the app shows English and offers Retry.
- **Not machine-translated:** Quran, Hadith and Dua texts, names and your notes (marked `translate="no"`). Ibadaat lesson text is translated only if you switch on "Translate lesson text too" (it is marked `data-content`).
- **Default language:** the browser's language if the API supports it, otherwise English. The choice is saved in settings and restored on every visit.
- **Providers** are configured in `src/app/core/i18n.config.ts`. The no-setup default is Google's public web translate endpoint, which is not an officially supported API; for production set up LibreTranslate (self-hosted or with a key) in the same file and it is used first.

## Quran translations

The reader and Settings have a translator picker (Urdu translators first). The choice is saved in settings, restored on the next visit, and used by the reader, search, daily ayah and offline downloads.

| Translator | Source |
|---|---|
| Fateh Muhammad Jalandhari, Ahmad Raza Khan (Kanz-ul-Iman), Maududi (Tafheem-ul-Quran), Muhammad Junagarhi | AlQuran Cloud (Tanzil) |
| Mufti Muhammad Taqi Usmani (Aasan Tarjuma-e-Quran) | Quran API by fawazahmed0 (public domain), via jsDelivr |
| Shah Abdul Qadir Dehlvi, Shah Rafiuddin Dehlvi, Ashraf Ali Thanvi (Bayan-ul-Quran) | **Not available yet** - no complete, openly licensed digital edition was found. They are listed but cannot be selected, and no other translation is shown in their place. |

Every translation is checked at load time to have exactly one entry per ayah. To add a source later, add an entry to `src/app/core/translation.service.ts` (and a provider in `quran.service.ts` if it is a new API).

## Install on a phone (PWA)

- Build: `npm run build`, then host `dist/islam360/browser` on any **https** site (Vercel config included in `vercel.json`).
- Android (Chrome): menu > Install app, or More > Install app inside Islam. iPhone (Safari): Share > Add to Home Screen.
- Once installed it opens full-screen with its own icon and works offline (service worker is active in production builds only).
- Icons are in `public/icons`; app name and colours are in `public/manifest.webmanifest`; caching rules are in `ngsw-config.json`.

## Data sources

- Quran text, translations, transliteration, tafseer, search: AlQuran Cloud API (cached in IndexedDB; downloadable from More → Downloads)
- Quran audio: mp3quran.net (surah) and Islamic Network CDN (ayah)
- Hadith: fawazahmed0/hadith-api via jsDelivr (chapters cached after first view)
- Prayer times: `adhan` (calculated on device); Hijri dates: `Intl` Umm al-Qura
- Maps: Leaflet + OpenStreetMap; city search: Open-Meteo geocoding

## Known limits (web platform)

- Azan/reminder alerts fire only while the app is open in the browser (no background push).
- Live Qibla compass needs a device with orientation sensors (phone); desktops show the static bearing.
- Duas are a curated starter set with references; verify with a qualified scholar before adding more.
