/** Static learning content: Shahadat, Waqf (stopping) rules and the Arabic pronunciation guide. */

export interface WordPart { ar: string; tr: string; en: string }
export interface ShahadatText {
  id: string; title: string; arabic: string; translit: string; english: string; urdu: string;
  words: WordPart[]; note?: string;
}

export const SHAHADAT: ShahadatText[] = [
  {
    id: 'tayyibah', title: 'Kalimah Tayyibah',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
    translit: 'La ilaha illallah, Muhammadur-Rasulullah',
    english: 'There is no god but Allah; Muhammad is the Messenger of Allah.',
    urdu: 'اللہ کے سوا کوئی معبود نہیں، محمد ﷺ اللہ کے رسول ہیں۔',
    words: [
      { ar: 'لَا', tr: 'laa', en: 'no' },
      { ar: 'إِلَٰهَ', tr: 'ilaaha', en: 'god (one worthy of worship)' },
      { ar: 'إِلَّا', tr: 'illaa', en: 'except' },
      { ar: 'اللَّهُ', tr: 'Allaah', en: 'Allah' },
      { ar: 'مُحَمَّدٌ', tr: 'Muhammadun', en: 'Muhammad' },
      { ar: 'رَسُولُ', tr: 'rasoolu', en: 'messenger of' },
      { ar: 'اللَّهِ', tr: 'Allaah', en: 'Allah' },
    ],
  },
  {
    id: 'shahadah', title: 'Kalimah Shahadat',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    translit: "Ash-hadu an la ilaha illallahu wahdahu la shareeka lah, wa ash-hadu anna Muhammadan 'abduhu wa rasooluh",
    english: 'I bear witness that there is no god but Allah alone, He has no partner, and I bear witness that Muhammad is His servant and Messenger.',
    urdu: 'میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اور میں گواہی دیتا ہوں کہ محمد ﷺ اس کے بندے اور رسول ہیں۔',
    words: [
      { ar: 'أَشْهَدُ', tr: 'ash-hadu', en: 'I bear witness' },
      { ar: 'أَنْ', tr: 'an', en: 'that' },
      { ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ', tr: 'laa ilaaha illallaah', en: 'there is no god but Allah' },
      { ar: 'وَحْدَهُ', tr: 'wahdahu', en: 'He is alone' },
      { ar: 'لَا شَرِيكَ لَهُ', tr: 'laa shareeka lahu', en: 'He has no partner' },
      { ar: 'وَأَشْهَدُ', tr: 'wa ash-hadu', en: 'and I bear witness' },
      { ar: 'أَنَّ', tr: 'anna', en: 'that' },
      { ar: 'مُحَمَّدًا', tr: 'Muhammadan', en: 'Muhammad' },
      { ar: 'عَبْدُهُ', tr: "'abduhu", en: 'is His servant' },
      { ar: 'وَرَسُولُهُ', tr: 'wa rasooluhu', en: 'and His messenger' },
    ],
    note: 'This is the wording reported in the hadith on wudu (Muslim 234).',
  },
];

export const SHAHADAT_MEANING = [
  { h: 'Part 1 – "La ilaha illallah"', p: 'It first denies that anything deserves worship ("there is no god") and then affirms that only Allah does ("except Allah"). It means worship, trust and obedience are for Allah alone.' },
  { h: 'Part 2 – "Muhammadur-Rasulullah"', p: 'It means believing that Muhammad ﷺ is Allah\'s final Messenger: believing what he told us, obeying what he commanded, avoiding what he forbade, and worshipping Allah the way he taught.' },
  { h: 'Why it matters', p: 'The Shahadah is the first pillar of Islam and the entrance to it. Saying it sincerely, with understanding, is what makes a person a Muslim.' },
  { h: 'In one line', p: 'Only Allah is worshipped, and the way to worship Him is the way of His Messenger ﷺ.' },
];

export const SHAHADAT_SOURCES = [
  { ref: 'Quran 3:18', text: 'Allah witnesses that there is no god but Him… (shahida Allahu annahu la ilaha illa huwa)' },
  { ref: 'Quran 47:19', text: 'So know that there is no god but Allah… (fa\'lam annahu la ilaha illallah)' },
  { ref: 'Quran 48:29', text: 'Muhammad is the Messenger of Allah… (Muhammadur-Rasulullah)' },
  { ref: 'Bukhari 8, Muslim 16', text: 'The Prophet ﷺ said that Islam is built upon five: the testimony that none has the right to be worshipped but Allah and that Muhammad is the Messenger of Allah, establishing the prayer, giving zakat, Hajj, and fasting Ramadan.' },
];

export const SHAHADAT_PRONUNCIATION = [
  'ش in "ash-hadu" is "sh", and ح is a soft breathy "H" from the middle of the throat (not the light English h).',
  'The ٰ over the ه in "ilaaha" stretches the vowel: il-AA-ha (two counts).',
  'The ل in "Allah" is pronounced full and heavy after a fatha or damma ("illallaah", "rasoolullaah") and light after a kasra ("bismillaah").',
  'In "Muhammadan", the م is doubled (shaddah): hold it for a moment – Mu-ham-ma-dan.',
  'ع in "\'abduhu" comes from the throat with a slight squeeze; do not replace it with a plain "a".',
];

/* ------------------------------------------------------------------ Waqf rules */
export type WaqfAction = 'stop' | 'continue' | 'either' | 'special';
export interface WaqfRule {
  id: string; symbol: string; name: string; arabicName: string; action: WaqfAction; short: string;
  meaning: string; when: string; tip: string; exampleKey?: string; group: 'madani' | 'indopak' | 'general';
}

export const WAQF_RULES: WaqfRule[] = [
  {
    id: 'lazim', symbol: 'ۘ', name: 'Waqf Lazim', arabicName: 'الوقف اللازم (م)', action: 'stop', group: 'madani',
    short: 'Must stop',
    meaning: 'A necessary stop. The sentence is complete here, and if you continue without stopping, the meaning could be misunderstood.',
    when: 'Stop here and take a breath, then continue with the next word. In the Pakistani/Indian mushaf this sign is written as "م".',
    tip: 'Think of it as a full stop (.) – always pause.', exampleKey: 'lazim',
  },
  {
    id: 'la', symbol: 'ۙ', name: 'La Taqif', arabicName: 'لا (لا تَقِف)', action: 'continue', group: 'madani',
    short: 'Do not stop',
    meaning: 'The phrase is still incomplete here. Stopping would cut the meaning in the middle.',
    when: 'Do not stop on this word. If you run out of breath, go back a word or two and read through again. When this sign sits at the end of an ayah, scholars allow stopping there, since stopping at an ayah\'s end is the practice – but continuing is better.',
    tip: 'Think of it as a red light: keep reading.', exampleKey: 'la',
  },
  {
    id: 'jaiz', symbol: 'ۚ', name: 'Waqf Ja\'iz', arabicName: 'الوقف الجائز (ج)', action: 'either', group: 'madani',
    short: 'Stop or continue (equal)',
    meaning: 'Both stopping and continuing are fine. The meaning is correct either way.',
    when: 'Your choice – stop for breath or continue without stopping.',
    tip: 'Think of it as a green light for both options.', exampleKey: 'jaiz',
  },
  {
    id: 'sala', symbol: 'ۖ', name: 'Al-Wasl Awla', arabicName: 'الوصل أولى (صلى)', action: 'continue', group: 'madani',
    short: 'Continuing is better',
    meaning: 'You may stop, but it is better to continue reading.',
    when: 'Continue if you can. Stop here only if you need to breathe.',
    tip: '"Sala" = "joined" – prefer to join the words.', exampleKey: 'sala',
  },
  {
    id: 'qala', symbol: 'ۗ', name: 'Al-Waqf Awla', arabicName: 'الوقف أولى (قلى)', action: 'stop', group: 'madani',
    short: 'Stopping is better',
    meaning: 'You may continue, but it is better to stop here.',
    when: 'Prefer to pause here. If you continue, there is no sin and the meaning stays correct.',
    tip: '"Qala" = "stopping is preferred".', exampleKey: 'qala',
  },
  {
    id: 'muanaqah', symbol: 'ۛ', name: "Mu'anaqah", arabicName: 'المعانقة (∴ ∴)', action: 'special', group: 'madani',
    short: 'Stop at one of two',
    meaning: 'Three dots appear over two nearby places. You may stop at one of them, but not at both.',
    when: 'Choose either the first or the second sign to stop at, and read straight through the other one.',
    tip: 'Like two doors, you can only use one.', exampleKey: 'mu3anaqah',
  },
  {
    id: 'sakta', symbol: 'ۜ', name: 'Saktah', arabicName: 'السكتة (س)', action: 'special', group: 'madani',
    short: 'Short pause, no breath',
    meaning: 'A brief silence, about two counts, without taking a breath, and then you continue immediately.',
    when: 'Pause very briefly on the word without breathing in, and carry on reading.',
    tip: 'A "tiny hold", not a full stop.', exampleKey: 'sakta',
  },
  {
    id: 'sajdah', symbol: '۩', name: 'Sajdat at-Tilawah', arabicName: 'سجدة التلاوة', action: 'special', group: 'madani',
    short: 'Prostration verse',
    meaning: 'This marks a verse of prostration. Reciters and listeners prostrate once when they reach it.',
    when: 'Complete the verse, then perform the prostration of recitation if you are in a state to do so.',
    tip: 'Not a stopping sign, but a place of action.', exampleKey: 'sajdah',
  },
  {
    id: 'ayah', symbol: '۝', name: 'End of Ayah', arabicName: 'رأس الآية', action: 'stop', group: 'general',
    short: 'Natural resting place',
    meaning: 'A circle with the verse number shows where an ayah ends. Stopping at the end of an ayah is the practice of the Prophet ﷺ.',
    when: 'Stopping here is always acceptable and recommended, unless a sign tells you the meaning continues (such as لا).',
    tip: 'Umm Salamah reported that the Prophet ﷺ would stop at the end of each verse of Al-Fatihah when reciting (Abu Dawud 4001, Tirmidhi 2927).',
  },
  {
    id: 'mutlaq', symbol: 'ط', name: 'Waqf Mutlaq', arabicName: 'الوقف المطلق (ط)', action: 'stop', group: 'indopak',
    short: 'Stop (preferred)', meaning: 'The sentence has ended in meaning. Stopping is preferred.',
    when: 'Seen in the Pakistani/Indian mushaf. Stop here, then begin the next sentence normally.', tip: 'Like a full stop.',
  },
  {
    id: 'mujawwaz', symbol: 'ز', name: 'Waqf Mujawwaz', arabicName: 'الوقف المجوز (ز)', action: 'continue', group: 'indopak',
    short: 'Allowed, but continue is better', meaning: 'Stopping is allowed, though continuing is better.',
    when: 'Seen in the Pakistani/Indian mushaf. Prefer to continue.', tip: 'Like صلى.',
  },
  {
    id: 'murakhkhas', symbol: 'ص', name: 'Waqf Murakhkhas', arabicName: 'الوقف المرخص (ص)', action: 'continue', group: 'indopak',
    short: 'Stop only if needed', meaning: 'Stopping is permitted only out of need, such as running out of breath. Otherwise continue.',
    when: 'Seen in the Pakistani/Indian mushaf. Prefer to read on and stop only if necessary.', tip: 'A permit for emergencies.',
  },
  {
    id: 'qif', symbol: 'قف', name: 'Qif', arabicName: 'قِف', action: 'stop', group: 'indopak',
    short: 'Stop', meaning: '"Qif" means "stop". The reader is told to stop here.',
    when: 'Seen in the Pakistani/Indian mushaf. Stop here.', tip: 'Direct instruction: stop.',
  },
  {
    id: 'ruku', symbol: 'ع', name: "Ruku'", arabicName: 'علامة الركوع', action: 'special', group: 'indopak',
    short: 'End of a section', meaning: 'A margin sign that marks the end of a ruku\' (a section of the Quran that is usually recited in one rak\'ah).',
    when: 'It is a marker for sections, not a place you must stop. It is often used when reciting in prayer.', tip: 'Margin sign, not an in-text stop.',
  },
];

export const WAQF_STOP_TIPS = [
  { h: 'Stop where the meaning is complete', p: 'Never stop in the middle of a phrase, for example between "Bismillah" and "ir-Rahman", or after a word like "wa" (and) or "illa" (except) that needs the next word.' },
  { h: 'Out of breath? Go back', p: 'If you must stop where there is no stopping sign, go back to a sensible earlier word and read again from there when you continue.' },
  { h: 'How to pronounce the last letter when you stop', p: 'When you stop on a word, its last short vowel is dropped and the letter is read with sukoon: "Ar-Raheem(i)" → "Ar-Raheem". With tanween fathatayn (ـً) you say a long "aa", and a ة (ta marbutah) is read as a soft "h".' },
  { h: 'Where to start again', p: 'After stopping, start again from a word where the meaning makes sense. When you stop for breath, you may repeat the last word or two.' },
  { h: 'Be consistent', p: 'In prayer and recitation, take the sign of your own mushaf as your guide. Madani and Pakistani/Indian mushafs use some different signs.' },
];

/* ------------------------------------------------------------ Pronunciation guide */
export interface Letter { ar: string; name: string; sound: string; tip: string; word: string; wordTr: string; heavy?: boolean }

export const LETTERS: Letter[] = [
  { ar: 'ا', name: 'Alif', sound: 'aa', tip: 'Carries a long "aa" sound after a fatha. At the start of a word it only holds the vowel of the hamza.', word: 'بَاب', wordTr: 'baab' },
  { ar: 'ب', name: 'Ba', sound: 'b', tip: 'Like English "b". The lips meet.', word: 'بَاب', wordTr: 'baab' },
  { ar: 'ت', name: 'Ta', sound: 't', tip: 'The tongue tip touches the back of the upper teeth. Light, not heavy.', word: 'تِين', wordTr: 'teen' },
  { ar: 'ث', name: 'Tha', sound: 'th (think)', tip: 'Tongue tip lightly between the teeth, unvoiced like "th" in "think".', word: 'ثَلَاثَة', wordTr: 'thalaathah' },
  { ar: 'ج', name: 'Jeem', sound: 'j', tip: 'Like "j" in "jam".', word: 'جَمَل', wordTr: 'jamal' },
  { ar: 'ح', name: 'Ha (heavy h)', sound: 'H', tip: 'A soft breathy sound from the middle of the throat, like whispering to fog a mirror. It is not the light English "h".', word: 'حَمْد', wordTr: 'hamd' },
  { ar: 'خ', name: 'Kha', sound: 'kh', tip: 'From the back of the throat, like the "ch" in Scottish "loch". Heavy letter.', word: 'خَبِير', wordTr: 'khabeer', heavy: true },
  { ar: 'د', name: 'Dal', sound: 'd', tip: 'Like "d", tongue tip at the upper teeth.', word: 'دِين', wordTr: 'deen' },
  { ar: 'ذ', name: 'Dhal', sound: 'dh (this)', tip: 'Tongue tip lightly between the teeth, voiced like "th" in "this".', word: 'ذِكْر', wordTr: 'dhikr' },
  { ar: 'ر', name: 'Ra', sound: 'r (rolled)', tip: 'A quick tap or roll of the tongue tip. Generally full (heavy) after a fatha or damma and light after a kasra.', word: 'رَبّ', wordTr: 'rabb' },
  { ar: 'ز', name: 'Zay', sound: 'z', tip: 'Like "z" in "zoo".', word: 'زَكَاة', wordTr: 'zakaah' },
  { ar: 'س', name: 'Seen', sound: 's', tip: 'Light "s", like "sun".', word: 'سَلَام', wordTr: 'salaam' },
  { ar: 'ش', name: 'Sheen', sound: 'sh', tip: 'Like "sh" in "ship".', word: 'شُكْر', wordTr: 'shukr' },
  { ar: 'ص', name: 'Sad', sound: 'S (heavy s)', tip: 'A "heavy" s. The back of the tongue rises towards the roof of the mouth and the mouth feels full. Compare with س.', word: 'صَبْر', wordTr: 'sabr', heavy: true },
  { ar: 'ض', name: 'Dad', sound: 'D (heavy d)', tip: 'A heavy "d" made by pressing the side of the tongue against the upper molars. Unique to Arabic.', word: 'ضَالِّين', wordTr: 'daalleen', heavy: true },
  { ar: 'ط', name: 'Ta (heavy t)', sound: 'T (heavy t)', tip: 'A heavy "t", with the tongue tip at the upper gum and the back of the tongue raised. Compare with ت.', word: 'طَهَارَة', wordTr: 'tahaarah', heavy: true },
  { ar: 'ظ', name: 'Zha', sound: 'Dh (heavy dh)', tip: 'A heavy version of ذ. Tongue tip between the teeth and the back of the tongue raised.', word: 'ظَلَمْنَا', wordTr: 'zalamnaa', heavy: true },
  { ar: 'ع', name: "'Ayn", sound: "' (throat squeeze)", tip: 'A voiced sound from the middle of the throat with a slight squeeze. There is no English equivalent, so do not replace it with "a".', word: 'عِلْم', wordTr: "'ilm" },
  { ar: 'غ', name: 'Ghayn', sound: 'gh', tip: 'A gargling sound from the back of the throat, like the French "r". Heavy letter.', word: 'غَفُور', wordTr: 'ghafoor', heavy: true },
  { ar: 'ف', name: 'Fa', sound: 'f', tip: 'Like "f". Upper teeth on the lower lip.', word: 'فَتَّاح', wordTr: 'fattaah' },
  { ar: 'ق', name: 'Qaf', sound: 'q', tip: 'A deep "k" from the very back of the tongue, further back than ك. Heavy letter.', word: 'قَادِر', wordTr: 'qaadir', heavy: true },
  { ar: 'ك', name: 'Kaf', sound: 'k', tip: 'A light "k" from the front of the tongue.', word: 'كَرِيم', wordTr: 'kareem' },
  { ar: 'ل', name: 'Lam', sound: 'l', tip: 'Light "l". In the word "Allah" it is heavy after fatha or damma and light after kasra.', word: 'لَطِيف', wordTr: 'lateef' },
  { ar: 'م', name: 'Meem', sound: 'm', tip: 'Like "m". The lips close.', word: 'مَلِك', wordTr: 'malik' },
  { ar: 'ن', name: 'Noon', sound: 'n', tip: 'Like "n". Tongue tip at the upper gum.', word: 'نُور', wordTr: 'noor' },
  { ar: 'ه', name: 'Ha (light h)', sound: 'h', tip: 'A light "h" from the very back of the throat, like "h" in "hat". Not the same as ح.', word: 'هَادِي', wordTr: 'haadee' },
  { ar: 'و', name: 'Waw', sound: 'w / oo', tip: 'A consonant "w", or a long "oo" after a damma.', word: 'وَدُود', wordTr: 'wadood' },
  { ar: 'ي', name: 'Ya', sound: 'y / ee', tip: 'A consonant "y", or a long "ee" after a kasra.', word: 'يَد', wordTr: 'yad' },
  { ar: 'ء', name: 'Hamza', sound: "' (glottal stop)", tip: 'A tiny stop in the throat, like the break in "uh-oh". It may be written on or under alif (أ إ) or on و and ي (ؤ ئ).', word: 'سَأَلَ', wordTr: "sa'ala" },
];

export interface Mark { sym: string; name: string; sound: string; tip: string }
export const MARKS: Mark[] = [
  { sym: 'ـَ', name: 'Fathah', sound: 'short "a"', tip: 'Like the "a" in "cat", but quick. بَ = ba' },
  { sym: 'ـِ', name: 'Kasrah', sound: 'short "i"', tip: 'Like the "i" in "sit". بِ = bi' },
  { sym: 'ـُ', name: 'Dammah', sound: 'short "u"', tip: 'Like the "u" in "put". بُ = bu' },
  { sym: 'ـْ', name: 'Sukoon', sound: 'no vowel', tip: 'The letter is read quickly with no vowel, joined to the next. أَشْ = ash' },
  { sym: 'ـّ', name: 'Shaddah', sound: 'doubled letter', tip: 'Hold the letter for a moment, as if it were written twice. رَبّ = rab-b' },
  { sym: 'ـً ـٍ ـٌ', name: 'Tanween', sound: '-an / -in / -un', tip: 'A final "n" sound added to the end of the word. كِتَابٌ = kitaabun' },
  { sym: 'ا / ي / و', name: 'Madd (long vowels)', sound: 'aa / ee / oo', tip: 'Stretch the vowel for about two counts: باب = baab, بين = been, بور = boor' },
  { sym: 'ـٰ', name: 'Dagger alif', sound: 'long "aa"', tip: 'A small alif above the letter, read as a long "aa". إِلَٰه = ilaah' },
];

export const LETTER_PAIRS = [
  { a: 'حَمْد', at: 'hamd', am: 'praise', b: 'هَمْس', bt: 'hams', bm: 'whisper', note: 'ح is breathy from the middle of the throat; ه is a light h.' },
  { a: 'عَلَم', at: "'alam", am: 'flag', b: 'أَلَم', bt: "alam", bm: 'pain', note: 'ع squeezes the throat; ء is a quick stop.' },
  { a: 'قَلْب', at: 'qalb', am: 'heart', b: 'كَلْب', bt: 'kalb', bm: 'dog', note: 'ق is deep at the back of the tongue; ك is lighter and further forward.' },
  { a: 'سَيْف', at: 'sayf', am: 'sword', b: 'صَيْف', bt: 'sayf (heavy s)', bm: 'summer', note: 'ص makes the mouth full and heavy; س is thin and light.' },
  { a: 'تِين', at: 'teen', am: 'fig', b: 'طِين', bt: 'teen (heavy t)', bm: 'clay', note: 'ط is heavy and full; ت is thin and light.' },
];

/** Short tips for letters that learners most often mispronounce – used in the Names and Duas guides. */
export const WATCH_LETTERS: Record<string, string> = {
  'ح': 'ح (Ha) is a soft breathy sound from the middle of the throat.',
  'خ': 'خ (Kha) comes from the back of the throat, like "ch" in Scottish "loch".',
  'ع': "ع ('Ayn) squeezes the throat; do not replace it with a plain 'a'.",
  'غ': 'غ (Ghayn) is a gargling sound from the back of the throat.',
  'ق': 'ق (Qaf) is a deep "k" from the very back of the tongue.',
  'ص': 'ص (Sad) is a heavy "s" with a full mouth.',
  'ض': 'ض (Dad) is a heavy "d" made with the side of the tongue.',
  'ط': 'ط (Ta) is a heavy "t" with a full mouth.',
  'ظ': 'ظ (Zha) is a heavy "dh" with the tongue between the teeth.',
  'ث': 'ث (Tha) is like "th" in "think".',
  'ذ': 'ذ (Dhal) is like "th" in "this".',
  'أ': 'ء (Hamza) is a tiny stop in the throat.',
  'إ': 'ء (Hamza) is a tiny stop in the throat.',
  'ؤ': 'ء (Hamza) is a tiny stop in the throat.',
  'ئ': 'ء (Hamza) is a tiny stop in the throat.',
  'ّ': 'A shaddah doubles the letter – hold it a little longer.',
};

/** Small Quranic stop marks are combining signs that float without a base letter, so draw them over a dotted circle. */
export function displaySymbol(s: string): string {
  const c = s.codePointAt(0) ?? 0;
  return c >= 0x06D6 && c <= 0x06DC ? '◌' + s : s;
}
