/**
 * Builds public/data/names.json and public/data/waqf-examples.json.
 * Arabic text + transliteration of the 99 Names come from the AlAdhan API; English/Urdu meanings and
 * themes are maintained below. Waqf examples are real ayahs taken from the Uthmani Quran text.
 * Run: node scripts/build-learning-data.js
 */
const fs = require('fs');

const EN = [
  'The Most Gracious, All-Merciful', 'The Most Merciful (especially to the believers)', 'The King, the Sovereign', 'The Most Holy, the Pure',
  'The Source of Peace', 'The Giver of Security and Faith', 'The Guardian, the Watchful', 'The Almighty, the Mighty', 'The Compeller, the Restorer',
  'The Supreme in Greatness', 'The Creator', 'The Maker, the Evolver', 'The Fashioner of Forms', 'The Repeatedly Forgiving', 'The Subduer, the Overpowering',
  'The Bestower', 'The Provider', 'The Opener, the Judge', 'The All-Knowing', 'The Withholder', 'The Expander', 'The Abaser', 'The Exalter',
  'The Giver of Honour', 'The Giver of Dishonour', 'The All-Hearing', 'The All-Seeing', 'The Judge', 'The Utterly Just', 'The Subtle, the Gentle',
  'The All-Aware', 'The Forbearing', 'The Magnificent', 'The Forgiver', 'The Appreciative, the Grateful', 'The Most High', 'The Most Great', 'The Preserver',
  'The Nourisher, the Sustainer', 'The Reckoner', 'The Majestic', 'The Generous', 'The Watchful', 'The Responsive One', 'The All-Encompassing',
  'The Wise', 'The Loving', 'The Glorious', 'The Resurrector', 'The Witness', 'The Truth', 'The Trustee, Disposer of Affairs', 'The All-Strong',
  'The Firm, the Steadfast', 'The Protecting Friend', 'The Praiseworthy', 'The Counter, the Reckoner', 'The Originator', 'The Restorer',
  'The Giver of Life', 'The Bringer of Death', 'The Ever-Living', 'The Self-Sustaining', 'The Finder, the Perceiver', 'The Noble, the Glorious',
  'The One', 'The Unique, the Indivisible', 'The Eternal Refuge', 'The All-Able', 'The All-Powerful', 'The Expediter', 'The Delayer', 'The First',
  'The Last', 'The Manifest', 'The Hidden', 'The Governor', 'The Most Exalted', 'The Source of Goodness', 'The Acceptor of Repentance', 'The Avenger',
  'The Pardoner', 'The Compassionate, the Kind', 'Master of the Kingdom', 'Lord of Majesty and Generosity', 'The Equitable', 'The Gatherer',
  'The Self-Sufficient, the Rich', 'The Enricher', 'The Preventer', 'The Distresser', 'The Benefactor', 'The Light', 'The Guide',
  'The Incomparable Originator', 'The Everlasting', 'The Inheritor', 'The Guide to the Right Path', 'The Patient',
];

const UR = [
  'نہایت مہربان', 'بے حد رحم کرنے والا', 'بادشاہ، حقیقی مالک', 'نہایت پاک، مقدس', 'سلامتی دینے والا', 'امن اور ایمان عطا کرنے والا',
  'نگہبان، حفاظت کرنے والا', 'غالب، زبردست', 'زبردست قوت والا، بگڑے کام بنانے والا', 'بڑائی اور عظمت والا', 'پیدا کرنے والا', 'وجود بخشنے والا',
  'صورت گری کرنے والا', 'بار بار بخشنے والا', 'سب پر غالب', 'بہت عطا کرنے والا', 'رزق دینے والا', 'کھولنے والا، فیصلہ کرنے والا',
  'سب کچھ جاننے والا', 'تنگی کرنے والا', 'کشادگی دینے والا', 'پست کرنے والا', 'بلند کرنے والا', 'عزت دینے والا', 'ذلت دینے والا',
  'سب کچھ سننے والا', 'سب کچھ دیکھنے والا', 'فیصلہ کرنے والا، حاکم', 'سراسر عدل کرنے والا', 'باریک بین، مہربان', 'ہر چیز سے باخبر',
  'بردبار، حلیم', 'بڑی عظمت والا', 'بہت بخشنے والا', 'قدر دان', 'سب سے بلند', 'سب سے بڑا', 'حفاظت کرنے والا', 'روزی اور قوت پہنچانے والا',
  'حساب لینے والا، کافی', 'جلال والا', 'کرم کرنے والا، سخی', 'نگرانی کرنے والا', 'دعا قبول کرنے والا', 'وسعت والا', 'حکمت والا',
  'محبت کرنے والا', 'بزرگی اور شان والا', 'مردوں کو زندہ اٹھانے والا', 'ہر چیز کا گواہ', 'برحق، سچا', 'کارساز', 'بڑی قوت والا', 'نہایت مضبوط',
  'دوست، مددگار', 'تعریف کے لائق', 'ہر چیز کا شمار رکھنے والا', 'پہلی بار پیدا کرنے والا', 'دوبارہ پیدا کرنے والا', 'زندگی دینے والا',
  'موت دینے والا', 'ہمیشہ زندہ', 'سب کو قائم رکھنے والا', 'سب کچھ پا لینے والا', 'بزرگی والا', 'ایک، یکتا', 'یکتا، بے مثل', 'بے نیاز',
  'ہر چیز پر قدرت رکھنے والا', 'کامل قدرت والا', 'آگے کرنے والا', 'پیچھے کرنے والا', 'سب سے پہلے', 'سب سے آخر', 'ظاہر', 'پوشیدہ', 'والی، کارساز',
  'نہایت بلند', 'احسان اور نیکی کرنے والا', 'توبہ قبول کرنے والا', 'ظالموں سے بدلہ لینے والا', 'معاف کرنے والا', 'نہایت شفیق',
  'بادشاہی کا مالک', 'جلال اور اکرام والا', 'انصاف کرنے والا', 'سب کو جمع کرنے والا', 'بے نیاز', 'غنی کرنے والا', 'روکنے والا',
  'نقصان کا اختیار رکھنے والا', 'نفع پہنچانے والا', 'نور', 'ہدایت دینے والا', 'بے مثال پیدا کرنے والا', 'ہمیشہ باقی رہنے والا', 'سب کا وارث',
  'سیدھی راہ دکھانے والا', 'بہت صبر کرنے والا',
];

const THEMES = {
  mercy: [1, 2, 14, 32, 34, 35, 47, 79, 80, 82, 83],
  majesty: [3, 4, 8, 9, 10, 15, 33, 36, 37, 41, 48, 53, 54, 69, 70, 78, 84, 85],
  knowledge: [19, 26, 27, 31, 38, 40, 43, 45, 46, 50, 57, 64],
  creation: [11, 12, 13, 49, 58, 59, 60, 61, 95],
  provision: [16, 17, 18, 20, 21, 22, 23, 24, 25, 39, 42, 88, 89, 90, 91, 92],
  guidance: [5, 6, 7, 28, 29, 30, 44, 51, 52, 55, 56, 65, 81, 86, 87, 93, 94, 98, 99],
  oneness: [62, 63, 66, 67, 68, 71, 72, 73, 74, 75, 76, 77, 96, 97],
};

const FIX = { 44: 'Al-Mujeeb', 72: "Al-Mu'akhkhir", 89: 'Al-Mughni', 91: 'Ad-Darr', 60: 'Al-Muhyi', 62: 'Al-Hayy', 84: 'Maalik-ul-Mulk', 85: 'Dhul-Jalaali wal-Ikraam', 55: 'Al-Waliyy', 77: 'Al-Waali', 24: "Al-Mu'izz" };
const AR_FIX = { 85: 'ذُو الْجَلَالِ وَالْإِكْرَامِ' };
const clean = (t, n) => FIX[n] ?? t.trim().replace(/[’‘]/g, "'").replace(/^(A[lrsnzdt]|Ash) /, '$1-').replace(/ /g, '-');

(async () => {
  const api = (await (await fetch('https://api.aladhan.com/v1/asmaAlHusna')).json()).data;
  if (api.length !== 99 || EN.length !== 99 || UR.length !== 99) throw new Error(`Counts: api ${api.length}, en ${EN.length}, ur ${UR.length}`);
  const themeOf = n => Object.keys(THEMES).find(k => THEMES[k].includes(n));
  const names = api.map((x, i) => ({
    n: x.number, ar: AR_FIX[x.number] ?? x.name.trim(), tr: clean(x.transliteration, x.number), en: EN[i], ur: UR[i], theme: themeOf(x.number),
  }));
  const missing = names.filter(x => !x.theme);
  if (missing.length) throw new Error('No theme for ' + missing.map(m => m.n));
  fs.writeFileSync('public/data/names.json', JSON.stringify(names));
  console.log('names', names.length);

  // ---- Waqf examples from the real Uthmani text ----
  const [ar, en] = await Promise.all([
    fetch('https://api.alquran.cloud/v1/quran/quran-uthmani').then(r => r.json()),
    fetch('https://api.alquran.cloud/v1/quran/en.sahih').then(r => r.json()),
  ]);
  const MARKS = { lazim: 0x06D8, la: 0x06D9, jaiz: 0x06DA, mu3anaqah: 0x06DB, sakta: 0x06DC, sala: 0x06D6, qala: 0x06D7, sajdah: 0x06E9 };
  const found = Object.fromEntries(Object.keys(MARKS).map(k => [k, []]));
  ar.data.surahs.forEach((s, si) => s.ayahs.forEach((a, ai) => {
    for (const [k, cp] of Object.entries(MARKS)) {
      if (a.text.includes(String.fromCodePoint(cp))) {
        found[k].push({ ref: `${s.number}:${a.numberInSurah}`, surah: s.englishName, text: a.text.replace(/﻿/g, ''), en: en.data.surahs[si].ayahs[ai].text, words: a.text.split(' ').length });
      }
    }
  }));
  const out = {};
  for (const k of Object.keys(found)) out[k] = found[k].sort((a, b) => a.words - b.words).slice(0, 2).map(({ words, ...r }) => r);
  fs.writeFileSync('public/data/waqf-examples.json', JSON.stringify(out));
  console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.map(e => e.ref)])));
})();
