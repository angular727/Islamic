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

## Prayer notifications and alarms

Settings → Notifications has two separate sections, each with its own master switch, so either can be on while the other is off:

- **Prayer notifications:** per prayer (Fajr, Dhuhr, Asr, Maghrib, Isha) an on/off switch and how many minutes before (or at the prayer time).
- **Prayer alarms:** per prayer an on/off switch, minutes before (or the exact time) and a sound (Chime, Bell, Soft tone, Beep). A full-screen alarm offers **Stop sound**, **Snooze** (5–30 min) and **Dismiss**.

The schedule is rebuilt automatically whenever prayer times, location, calculation method or these settings change. The permission is asked once; if it is blocked, the page shows the current status and step-by-step instructions for the device and never asks again. Notifications are shown through the service worker (`sw-custom.js` wraps `ngsw-worker.js` and adds the Snooze/Dismiss buttons), because `new Notification()` does not work on Android or in installed apps, which was why notifications never appeared there.

**Platform limits (also shown in the app):** a web app cannot schedule alerts once it is completely closed (that needs a push server). Alerts work while Islam is open in a tab or running as an installed app; the looping alarm sound only plays while the app is open, otherwise a persistent notification is shown. Where the browser supports scheduled notifications they are used too. For a guaranteed alarm with the app closed, use **Add alarms to phone calendar** (a 30-day .ics file whose calendar alarms the phone rings itself). On iPhone, notifications need the app added to the Home Screen.

## Quran translations in many languages

Settings → Translation lists the eight Urdu translators and, under **All other languages**, every translation in the AlQuran Cloud catalogue (about 45 languages, e.g. Hindi, Persian, Indonesian, Malay, Bengali, Turkish, French, Russian, Chinese). The list is loaded from the catalogue itself and cached for two weeks, so it grows with the source; each translation is checked to have exactly one entry per ayah so it lines up with the Arabic. Translations are never machine-generated.

**Audio:** the ayah player has separate **Recitation** and **Translation** switches (at least one stays on), and each ayah has its own recitation button and translation (speaker) button. The translation is spoken in a male voice where the device has one (a note shows when it does not). Only one audio session plays at a time: the surah player, the ayah player and Hadith audio stop each other, and starting another ayah cancels the one before it. The ayah being played is highlighted and scrolled into view.

## Hadith translations

In every Hadith chapter (and on the chapter list) a **Translation language** bar shows the languages the Hadith API has for that collection (for example Bukhari: Bengali, English, French, Indonesian, Russian, Tamil, Turkish, Urdu; 40 Nawawi has fewer). The list comes from the API's edition index, so it grows with the source. The Arabic text always stays on screen; the translation is joined to it by hadith number and never altered. The choice is saved; if a collection lacks the chosen language the page says so and shows English. The translator named by the source and the edition id are shown under the bar ("translator not named" when the source does not name one).

The speaker button on a hadith reads its translation aloud in the translation's language (same voices as above), with Pause/Resume, Stop, Previous/Next and "Play on". Only the translation is spoken, never the Arabic (text-to-speech cannot be trusted to recite it correctly).

## Listen with translation

In the Quran reader, the sound-wave button (or the play button on any ayah) plays ayah by ayah: the Arabic recitation, then the translation spoken in the translation's language (Urdu, English, Bengali, Turkish, French…), then the next ayah, to the end of the surah. A control bar gives Pause/Resume, Stop, Previous/Next ayah, speed and a Translation on/off switch. The existing full-surah play button is unchanged.

- The spoken text is exactly the translation text on screen (long ones are cut at phrase breaks); it is never re-translated or edited.
- Voices, tried in order (`src/app/core/tts.config.ts`): **Google Cloud Text-to-Speech** (official; needs an API key; audio is cached on the device so each verse is generated once), then the **device voice** (free, offline, if one is installed for the language), then Google's **online voice** (free, no key, unofficial, not cacheable; played through a hidden no-referrer frame because it rejects requests that carry a Referer).
- If audio fails the bar shows what failed with **Retry**, **Skip this translation** and **Recitation only**; a failed translation is never replaced by another ayah's audio.

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
