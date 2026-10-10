# Islam 360 (Angular 19 + Bootstrap 5)

All-in-one Islamic web app: Quran, Hadith, Duas & Azkar, Prayer Times, Qibla, Tasbeeh, Hijri Calendar,
Audio, Search, Bookmarks, Notes and Settings, built from the "Islam 360 – App Flow & Pages" design.

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
