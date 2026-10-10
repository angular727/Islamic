export interface Reciter { id: string; name: string; arabic: string; base: string }

/** Full-surah MP3 sources hosted by mp3quran.net (file name = 3-digit surah number). */
export const RECITERS: Reciter[] = [
  { id: 'alafasy', name: 'Mishary Rashid Alafasy', arabic: 'مشاري راشد العفاسي', base: 'https://server8.mp3quran.net/afs/' },
  { id: 'sudais', name: 'Abdul Rahman Al-Sudais', arabic: 'عبد الرحمن السديس', base: 'https://server11.mp3quran.net/sds/' },
  { id: 'ghamdi', name: 'Saad Al-Ghamdi', arabic: 'سعد الغامدي', base: 'https://server7.mp3quran.net/s_gmd/' },
  { id: 'dossari', name: 'Yasser Al-Dossari', arabic: 'ياسر الدوسري', base: 'https://server11.mp3quran.net/yasser/' },
  { id: 'muaiqly', name: 'Maher Al-Muaiqly', arabic: 'ماهر المعيقلي', base: 'https://server12.mp3quran.net/maher/' },
];

export const surahUrl = (r: Reciter, n: number) => `${r.base}${String(n).padStart(3, '0')}.mp3`;
