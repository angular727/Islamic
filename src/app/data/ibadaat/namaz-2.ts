import { Lesson, check, diff, dua, list, note, p, qa, r, rank, rec, refs, scholar, sec, steps, table } from './model';

/** Namaz (Salah) – the method of prayer, its recitations, and related rulings. */
export const NAMAZ_PART2: Lesson[] = [
  {
    id: 'method', group: 'Method of Prayer', title: 'Step-by-step method of Namaz', urdu: 'نماز کا طریقہ',
    intro: `This lesson walks through a complete two-rak'ah prayer, from the first takbeer to the salam. The rank beside each step is given in the Hanafi terminology (Fard, Wajib, Sunnah); the other schools classify some steps differently – see "Fard, Wajib and Sunnah in the prayer".`,
    sections: [
      sec('First rak\'ah', [
        steps(
          `Stand facing the Qibla and make the intention in your heart (condition).`,
          `Say "Allahu Akbar" raising the hands: this is Takbeer-e-Tahreemah (Fard / pillar). It makes everything outside prayer unlawful until the salam.`,
          `Fold the hands and recite Sana (Sunnah).`,
          `Say Ta'awwudh and Bismillah quietly (Sunnah), then Surah Al-Fatiha (Wajib in the Hanafi school; a pillar in the other schools) and say "Ameen".`,
          `Recite another surah or at least three short verses (Wajib in the first two rak'ahs of an obligatory prayer; Sunnah in the others).`,
          `Say "Allahu Akbar" and go into Ruku (Fard). Say the tasbeeh of ruku three times.`,
          `Rise saying "Sami'allahu liman hamidah" and stand upright: Qawmah (Wajib / pillar).`,
          `Say "Allahu Akbar" and go into the first Sajdah (Fard). Say the tasbeeh of sajdah three times.`,
          `Say "Allahu Akbar" and sit up calmly: Jalsah (Wajib / pillar).`,
          `Say "Allahu Akbar" and make the second Sajdah (Fard).`),
        note(`Every movement must be done calmly, with a moment of stillness in each posture (tuma'ninah). The Prophet ﷺ told the man who prayed hastily to repeat his prayer (Bukhari 757, Muslim 397).`, 'warn'),
      ], true),
      sec('Second rak\'ah and finishing the prayer', [
        steps(
          `Stand for the second rak'ah saying "Allahu Akbar". Recite Bismillah, Surah Al-Fatiha and a surah (Sana is not repeated).`,
          `Do Ruku, Qawmah, and both Sajdahs as before.`,
          `Sit for the final sitting (Qa'dah akhirah, Fard): recite At-Tahiyyat (Tashahhud, Wajib), then Durood-e-Ibrahimi (Sunnah in the Hanafi school; a pillar in the Shafi'i and Hanbali schools), then a dua.`,
          `Turn the face to the right saying "As-salamu alaykum wa rahmatullah", then to the left in the same way (Wajib; a pillar in the other schools for at least the first salam).`),
        note(`For a prayer of three or four rak'ahs, after the second rak'ah sit only for At-Tahiyyat, then stand for the third rak'ah. See the lesson "Prayers of three and four rak'ahs".`),
      ]),
      sec('Postures', [
        list(
          `Standing: look at the place of sajdah; keep the feet about a hand-span apart.`,
          `Ruku: hands on the knees, back level, head in line with the back (Bukhari 828).`,
          `Sajdah: forehead and nose, two palms, two knees and the toes of both feet touch the ground (Bukhari 812, Muslim 490). Keep the elbows away from the sides (men).`,
          `Sitting: sit calmly with the back straight. In the Hanafi school, sit on the left foot with the right foot upright.`),
      ]),
      sec('Practice checklist', [check(`Intention`, `Takbeer-e-Tahreemah`, `Sana`, `Ta'awwudh and Bismillah`, `Al-Fatiha`, `A surah`, `Ruku and its tasbeeh`, `Qawmah`, `First sajdah and tasbeeh`, `Jalsah`, `Second sajdah`, `Tashahhud`, `Durood`, `Dua`, `Salam to the right and left`)]),
    ],
  },
  {
    id: 'takbeer-qiyam', group: 'Method of Prayer', title: 'Takbeer-e-Tahreemah and Qiyam', urdu: 'تکبیرِ تحریمہ اور قیام',
    intro: `The prayer begins with the intention in the heart and the takbeer "Allahu Akbar". After it you stand with hands folded in Qiyam.`,
    sections: [
      sec('Takbeer-e-Tahreemah', [
        rec('Takbeer-e-Tahreemah', 'Said while standing, to begin the prayer. The words "Allahu Akbar" must be said in the prayer\'s opening.',
          'اللَّهُ أَكْبَرُ', 'Allahu akbar', 'اللہ سب سے بڑا ہے۔', 'Allah is the Greatest.', 'Abu Dawud 61, Tirmidhi 3 (the key of prayer is purification and its opening is the takbeer)'),
        diff('Raising the hands',
          'Men raise the hands to the earlobes; women to the shoulders.',
          'To the level of the shoulders (or the ears) for men and women.',
          'To the level of the shoulders (the well-known view).',
          'To the level of the shoulders or the ears.',
          'The Prophet ﷺ raised his hands at the start of prayer (Bukhari 735, Muslim 390).'),
        note(`The intention is in the heart, immediately before or at the takbeer. It does not have to be said aloud.`),
      ], true),
      sec('Placing the hands', [
        diff('Position of the hands in Qiyam',
          'Right hand over the left, below the navel (men); on the chest (women).',
          'Right hand over the left, below the chest and above the navel.',
          'Hands are by the sides is the well-known view; folding is also permitted.',
          'Right hand over the left, below the navel (preferred) or on the chest.',
          'Sahl ibn Sa\'d reported that people were told to place the right hand over the left forearm in prayer (Bukhari 740).'),
        scholar(`These are differences among valid scholarly views. Do not criticise a fellow Muslim for following a different position.`),
      ]),
    ],
  },
  {
    id: 'sana-tawwudh', group: 'Method of Prayer', title: 'Sana, Ta\'awwudh and Tasmiyah', urdu: 'ثناء، تعوذ اور تسمیہ',
    intro: `After the opening takbeer, the first rak'ah starts with an opening supplication, then seeking refuge in Allah and the Basmalah, before the recitation of Al-Fatiha.`,
    sections: [
      sec('Opening supplication (Sana / Istiftah)', [
        rec('Sana', 'Said quietly in the first rak\'ah only, after the opening takbeer (Sunnah). Recited in the Hanafi and Hanbali schools.',
          'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَىٰ جَدُّكَ وَلَا إِلَٰهَ غَيْرُكَ',
          'Subhanakal-lahumma wa bihamdika wa tabarakasmuka wa ta\'ala jadduka wa la ilaha ghayruk.',
          'اے اللہ! تو پاک ہے اور تیری ہی حمد ہے، تیرا نام بابرکت ہے، تیری شان بلند ہے اور تیرے سوا کوئی معبود نہیں۔',
          'Glory be to You, O Allah, and praise be to You. Blessed is Your name, exalted is Your majesty, and there is no god but You.',
          'Abu Dawud 775, Tirmidhi 243, Ibn Majah 804'),
        rec('Another opening supplication', 'The Prophet ﷺ also recited this opening supplication in obligatory prayer.',
          'اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ',
          'Allahumma ba\'id bayni wa bayna khatayaya kama ba\'adta baynal-mashriqi wal-maghrib. Allahumma naqqini minal-khataya kama yunaqqath-thawbul-abyadu minad-danas. Allahummaghsil khatayaya bil-ma\'i wath-thalji wal-barad.',
          'اے اللہ! میرے اور میرے گناہوں کے درمیان اتنی دوری کر دے جتنی تو نے مشرق اور مغرب کے درمیان کی ہے۔ اے اللہ! مجھے گناہوں سے ایسا پاک کر دے جیسے سفید کپڑا میل سے صاف کیا جاتا ہے۔ اے اللہ! میرے گناہوں کو پانی، برف اور اولوں سے دھو دے۔',
          'O Allah, put distance between me and my sins as You have put distance between the east and the west. O Allah, cleanse me of my sins as a white garment is cleansed of dirt. O Allah, wash away my sins with water, snow and hail.',
          'Bukhari 744, Muslim 598'),
        diff('Opening supplication', 'Sana is recited.', 'The "Wajjahtu wajhiya…" supplication (Muslim 771) or the supplication above is recited.', 'Not recited in the well-known view of the school.', 'Sana is recited.'),
      ], true),
      sec('Ta\'awwudh and Bismillah', [
        rec('Ta\'awwudh', 'Said quietly before reciting the Quran in the first rak\'ah.', 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', 'A\'udhu billahi minash-shaytanir-rajim',
          'میں شیطانِ مردود سے اللہ کی پناہ مانگتا ہوں۔', 'I seek refuge in Allah from the accursed Satan.', 'Quran 16:98'),
        rec('Tasmiyah (Bismillah)', 'Said before Al-Fatiha. Quietly in the Hanafi and Hanbali schools.', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'Bismillahir-rahmanir-rahim',
          'اللہ کے نام سے جو نہایت مہربان، بہت رحم والا ہے۔', 'In the name of Allah, the Entirely Merciful, the Especially Merciful.', 'Quran 1:1'),
        diff('Basmalah in prayer', 'Said quietly before Fatiha in each rak\'ah (Sunnah in the first, according to the school).',
          'Recited as the first verse of Fatiha, aloud in loud prayers.', 'Not recited in obligatory prayers.', 'Recited quietly before Fatiha.',
          'The Prophet ﷺ began the recitation with "Alhamdu lillahi rabbil-alamin" (Bukhari 743, Muslim 399); the schools differ on whether this means the Basmalah was silent or omitted.'),
      ]),
    ],
  },
  {
    id: 'fatiha', group: 'Method of Prayer', title: 'Surah Al-Fatiha', urdu: 'سورۃ الفاتحہ',
    intro: `Al-Fatiha is recited in every rak'ah of every prayer. The Prophet ﷺ said, "There is no prayer for one who does not recite the Opening of the Book" (Bukhari 756, Muslim 394).`,
    sections: [
      sec('Recitation', [
        rec('Surah Al-Fatiha', 'Recited in every rak\'ah after the opening supplication and Ta\'awwudh. Say "Ameen" at the end.',
          'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
          'Bismillahir-rahmanir-rahim. Alhamdu lillahi rabbil-\'alamin. Ar-rahmanir-rahim. Maliki yawmid-din. Iyyaka na\'budu wa iyyaka nasta\'in. Ihdinas-siratal-mustaqim. Siratal-ladhina an\'amta \'alayhim, ghayril-maghdubi \'alayhim wa lad-dallin.',
          'شروع اللہ کے نام سے جو نہایت مہربان، رحم والا ہے۔ سب تعریف اللہ ہی کے لیے ہے جو سارے جہانوں کا پالنے والا ہے۔ نہایت مہربان، رحم والا۔ روزِ جزا کا مالک۔ ہم تیری ہی عبادت کرتے ہیں اور تجھی سے مدد مانگتے ہیں۔ ہمیں سیدھا راستہ دکھا۔ ان لوگوں کا راستہ جن پر تو نے انعام کیا، نہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا۔',
          'In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path — the path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
          'Quran 1:1-7', 'Quran 1'),
        rec('Ameen', `Said after Al-Fatiha. Quietly in the Hanafi school; in the Shafi'i and Hanbali schools the imam and followers say it aloud in loud prayers.`, 'آمِين', 'Ameen', 'اے اللہ! قبول فرما۔', 'O Allah, accept.',
          'Bukhari 780, Muslim 410'),
      ], true),
      sec('Rulings', [
        diff('Status of Fatiha in prayer', 'Wajib (necessary): the prayer is valid without it but must be repeated if it was left deliberately.', 'A pillar (rukn) in every rak\'ah.', 'A pillar (fard) in every rak\'ah.', 'A pillar (rukn) in every rak\'ah.'),
        diff('Reciting Fatiha behind the imam', 'The follower does not recite; the imam\'s recitation is sufficient.', 'The follower recites it in every rak\'ah.', 'The follower recites in silent prayers and listens in loud ones.', 'The follower recites in silent prayers and listens in loud ones (according to the preferred view).',
          'Muslim 404: "When he recites, listen." Both views have strong proofs; follow your school.'),
        note(`Recite Al-Fatiha slowly, pausing at the end of every verse. Imagine Allah answering each verse (Muslim 395).`),
      ]),
    ],
  },
  {
    id: 'surahs', group: 'Method of Prayer', title: 'Surahs recited after Al-Fatiha', urdu: 'فاتحہ کے بعد کی سورتیں',
    intro: `After Al-Fatiha, a further surah (or at least three short verses) is recited in the first two rak'ahs of obligatory prayers and in each rak'ah of voluntary prayers.`,
    sections: [
      sec('Where do you recite a surah?', [
        rank(r('wajib', 'Hanafi: a surah or three short verses after Fatiha in the first two rak\'ahs of fard prayers.'), r('sunnah', 'Other schools: a surah after Fatiha in the first two rak\'ahs is a Sunnah.'), r('info', 'In the third and fourth rak\'ah of a fard prayer, recite Al-Fatiha only.')),
        note(`In Fajr, Maghrib and Isha the Imam recites aloud in the first two rak'ahs. In Zuhr and Asr the recitation is silent.`),
      ], true),
      sec('Short surahs', [
        { t: 'dua', id: 'ikhlas', when: 'Surah Al-Ikhlas (112)' },
        { t: 'dua', id: 'falaq', when: 'Surah Al-Falaq (113)' },
        { t: 'dua', id: 'nas', when: 'Surah An-Nas (114)' },
        rec('Surah Al-Kawthar (108)', 'May be recited in any rak\'ah after Al-Fatiha.', 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ ۝ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
          'Inna a\'taynakal-kawthar. Fasalli lirabbika wanhar. Inna shani\'aka huwal-abtar.',
          'بے شک ہم نے آپ کو کوثر عطا کی۔ پس آپ اپنے رب کے لیے نماز پڑھیں اور قربانی کریں۔ بے شک آپ کا دشمن ہی بے نام و نشان ہے۔',
          'Indeed, We have granted you al-Kawthar. So pray to your Lord and sacrifice. Indeed, your enemy is the one cut off.', 'Quran 108', 'Quran 108'),
        rec('Surah Al-Asr (103)', 'May be recited in any rak\'ah after Al-Fatiha.', 'وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ۝ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
          'Wal-\'asr. Innal-insana lafi khusr. Illal-ladhina amanu wa \'amilus-salihati wa tawasaw bil-haqqi wa tawasaw bis-sabr.',
          'زمانے کی قسم! بے شک انسان خسارے میں ہے۔ سوائے ان لوگوں کے جو ایمان لائے اور نیک عمل کیے اور ایک دوسرے کو حق کی نصیحت کی اور ایک دوسرے کو صبر کی نصیحت کی۔',
          'By time, indeed, mankind is in loss, except for those who believe and do righteous deeds and advise each other to truth and advise each other to patience.', 'Quran 103', 'Quran 103'),
        rec('Surah An-Nasr (110)', 'May be recited in any rak\'ah after Al-Fatiha.', 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ ۝ وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا ۝ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ إِنَّهُ كَانَ تَوَّابًا',
          'Idha ja\'a nasrullahi wal-fath. Wa ra\'aytan-nasa yadkhuluna fi dinillahi afwaja. Fasabbih bihamdi rabbika wastaghfirh, innahu kana tawwaba.',
          'جب اللہ کی مدد اور فتح آ جائے، اور آپ لوگوں کو اللہ کے دین میں فوج در فوج داخل ہوتے دیکھ لیں، تو اپنے رب کی حمد کے ساتھ تسبیح کیجیے اور اس سے مغفرت مانگیے، بے شک وہ بہت توبہ قبول کرنے والا ہے۔',
          'When the victory of Allah has come and the conquest, and you see the people entering into the religion of Allah in multitudes, then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.', 'Quran 110', 'Quran 110'),
      ]),
    ],
  },
  {
    id: 'ruku-qawmah', group: 'Method of Prayer', title: 'Ruku and Qawmah', urdu: 'رکوع اور قومہ',
    intro: `Ruku is bowing with the back level, in glorification of Allah. Qawmah is standing upright after ruku.`,
    sections: [
      sec('Ruku', [
        steps(`Say "Allahu Akbar" while going down.`, `Place the hands on the knees with the fingers spread, keep the back level and the head in line with it.`, `Stay still, saying the tasbeeh three times (at least).`),
        rec('Tasbeeh of Ruku', 'Said in ruku, three times (or an odd number more).', 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', 'Subhana rabbiyal-\'azim',
          'میرا رب پاک ہے، جو بہت عظمت والا ہے۔', 'Glory be to my Lord, the Most Great.', 'Muslim 772, Abu Dawud 869, Tirmidhi 262'),
        note(`Do not recite the Quran while in ruku or sajdah (Muslim 479).`, 'warn'),
      ], true),
      sec('Qawmah (standing after ruku)', [
        rec('Tasmi\'', 'Said while rising from ruku.', 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ', 'Sami\'allahu liman hamidah', 'اللہ نے اس کی سن لی جس نے اس کی تعریف کی۔', 'Allah hears the one who praises Him.', 'Bukhari 796'),
        rec('Tahmeed', 'Said when standing upright.', 'رَبَّنَا لَكَ الْحَمْدُ', 'Rabbana lakal-hamd', 'اے ہمارے رب! تیرے ہی لیے تمام تعریف ہے۔', 'Our Lord, to You belongs all praise.', 'Bukhari 689, 796'),
        diff('Who says what', 'The imam says the tasmi\' and the follower says the tahmeed; one praying alone says both.', 'Everyone (imam, follower and the one praying alone) says both.', 'Imam says the tasmi\'; follower says the tahmeed; one praying alone says both.', 'Imam and one praying alone say both; follower says the tahmeed.'),
        note(`Stand fully upright and pause. The prayer of one who does not straighten his back in ruku and sajdah is not valid (Abu Dawud 855).`, 'warn'),
      ]),
    ],
  },
  {
    id: 'sajdah-jalsah', group: 'Method of Prayer', title: 'Sajdah and Jalsah', urdu: 'سجدہ اور جلسہ',
    intro: `Sajdah (prostration) is the closest a servant is to his Lord (Muslim 482). Jalsah is the short sitting between the two sajdahs.`,
    sections: [
      sec('Sajdah', [
        steps(`Say "Allahu Akbar" while going down.`, `Place the knees, then the hands, then the forehead and nose on the ground, with the toes pointing towards the Qibla.`, `Keep the seven parts on the ground: the forehead (with the nose), two palms, two knees and the toes of both feet (Bukhari 812, Muslim 490).`, `Say the tasbeeh three times, then add dua if you wish: the Prophet ﷺ said, "The closest a servant is to his Lord is while prostrating, so increase your dua" (Muslim 482).`),
        rec('Tasbeeh of Sajdah', 'Said in sajdah, three times.', 'سُبْحَانَ رَبِّيَ الْأَعْلَىٰ', 'Subhana rabbiyal-a\'la', 'میرا رب پاک ہے، جو سب سے بلند ہے۔', 'Glory be to my Lord, the Most High.', 'Muslim 772, Abu Dawud 869'),
        diff('Posture of the arms', 'Men keep the arms away from the sides and the belly off the thighs; women keep the arms and belly close together.',
          'Men and women alike should keep the arms apart; women should keep their posture modest.', 'Same as the Shafi\'i view.', 'Same as the Shafi\'i view.'),
      ], true),
      sec('Jalsah (sitting between the two sajdahs)', [
        steps(`Say "Allahu Akbar" and sit upright calmly.`, `Hanafi: sit on the left foot with the right foot upright, hands on the thighs.`, `Say the supplication (see below, according to your school), then say "Allahu Akbar" and make the second sajdah.`),
        rec('Supplication between the two sajdahs', 'Said in the Jalsah. Recited in the Shafi\'i and Hanbali schools.', 'رَبِّ اغْفِرْ لِي', 'Rabbighfir li', 'اے میرے رب! مجھے بخش دے۔', 'My Lord, forgive me.', 'Abu Dawud 874, Ibn Majah 897'),
        note(`In the Hanafi school it is not part of the standard sequence of fard prayers, but it is permitted in voluntary prayers.`),
      ]),
    ],
  },
  {
    id: 'tashahhud', group: 'Method of Prayer', title: 'Tashahhud, Durood and Dua', urdu: 'تشہد، درود اور دعا',
    intro: `In the final sitting, the worshipper recites At-Tahiyyat, sends blessings upon the Prophet ﷺ, and makes dua before the salam.`,
    sections: [
      sec('At-Tahiyyat (Tashahhud)', [
        rec('At-Tahiyyat', 'Said in the first sitting and the final sitting. Narrated by Ibn Mas\'ud; used in the Hanafi and Hanbali schools.',
          'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
          'At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu \'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu \'alayna wa \'ala \'ibadillahis-salihin. Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan \'abduhu wa rasuluh.',
          'تمام قولی، بدنی اور مالی عبادتیں اللہ ہی کے لیے ہیں۔ اے نبی! آپ پر سلام ہو اور اللہ کی رحمت اور برکتیں ہوں۔ ہم پر اور اللہ کے نیک بندوں پر سلام ہو۔ میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں اور میں گواہی دیتا ہوں کہ محمد ﷺ اس کے بندے اور رسول ہیں۔',
          'All greetings, prayers and good words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.',
          'Bukhari 831, Muslim 402'),
        rec('Tashahhud of Ibn Abbas (Shafi\'i school)', 'An authentic alternative wording used in the Shafi\'i school.',
          'التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
          'At-tahiyyatul-mubarakatus-salawatut-tayyibatu lillah. As-salamu \'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu \'alayna wa \'ala \'ibadillahis-salihin. Ash-hadu an la ilaha illallah wa ash-hadu anna Muhammadar-rasulullah.',
          'تمام بابرکت تحیات، نمازیں اور پاکیزہ باتیں اللہ ہی کے لیے ہیں۔ اے نبی! آپ پر سلام ہو اور اللہ کی رحمت اور برکتیں ہوں۔ ہم پر اور اللہ کے نیک بندوں پر سلام ہو۔ میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں اور میں گواہی دیتا ہوں کہ محمد اللہ کے رسول ہیں۔',
          'The blessed greetings, the good prayers, belong to Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is the Messenger of Allah.',
          'Muslim 403'),
        diff('Gesture of the index finger', 'The finger is raised at "la ilaha" and lowered at "illallah".', 'The finger is raised at "illallah" and kept raised.', 'The finger is moved gently throughout the tashahhud.', 'The finger is raised at the mention of Allah and kept raised.',
          'The Prophet ﷺ pointed with his index finger in the tashahhud (Muslim 579).'),
      ], true),
      sec('Durood-e-Ibrahimi', [
        rec('Durood-e-Ibrahimi', 'Said in the final sitting after the Tashahhud (Sunnah in the Hanafi school; a pillar in the Shafi\'i and Hanbali schools).',
          'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
          'Allahumma salli \'ala Muhammadin wa \'ala ali Muhammad, kama sallayta \'ala Ibrahima wa \'ala ali Ibrahim, innaka hamidum-majid. Allahumma barik \'ala Muhammadin wa \'ala ali Muhammad, kama barakta \'ala Ibrahima wa \'ala ali Ibrahim, innaka hamidum-majid.',
          'اے اللہ! محمد ﷺ اور آلِ محمد پر رحمت نازل فرما جیسا کہ تو نے ابراہیم اور آلِ ابراہیم پر رحمت نازل فرمائی، بے شک تو تعریف کے لائق، بزرگی والا ہے۔ اے اللہ! محمد ﷺ اور آلِ محمد پر برکت نازل فرما جیسا کہ تو نے ابراہیم اور آلِ ابراہیم پر برکت نازل فرمائی، بے شک تو تعریف کے لائق، بزرگی والا ہے۔',
          'O Allah, send prayers upon Muhammad and the family of Muhammad as You sent prayers upon Ibrahim and the family of Ibrahim; You are Praiseworthy and Glorious. O Allah, bless Muhammad and the family of Muhammad as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy and Glorious.',
          'Bukhari 3370, Muslim 406'),
      ]),
      sec('Dua before the salam', [
        p(`After the Durood, the worshipper asks Allah for good in this life and the next. The Prophet ﷺ taught that the worshipper may choose any dua he likes (Bukhari 835, Muslim 402). Some of the duas that the Prophet ﷺ taught for this place are below.`),
        rec('Seeking refuge from four things', 'The Prophet ﷺ commanded it after the final tashahhud.', 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ وَمِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
          'Allahumma inni a\'udhu bika min \'adhabi jahannam, wa min \'adhabil-qabr, wa min fitnatil-mahya wal-mamat, wa min sharri fitnatil-masihid-dajjal.',
          'اے اللہ! میں جہنم کے عذاب، قبر کے عذاب، زندگی اور موت کے فتنے اور مسیحِ دجال کے فتنے کے شر سے تیری پناہ مانگتا ہوں۔',
          'O Allah, I seek refuge in You from the punishment of Hell, from the punishment of the grave, from the trial of life and death, and from the evil of the trial of the Antichrist.', 'Muslim 588'),
        rec('Dua of Abu Bakr (may Allah be pleased with him)', 'The Prophet ﷺ taught it to Abu Bakr to say in his prayer.', 'اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ',
          'Allahumma inni zalamtu nafsi zulman kathiran wa la yaghfirudh-dhunuba illa anta, faghfir li maghfiratan min \'indika warhamni, innaka antal-ghafurur-rahim.',
          'اے اللہ! میں نے اپنی جان پر بہت ظلم کیا اور تیرے سوا کوئی گناہوں کو نہیں بخشتا، پس اپنی طرف سے مجھے بخش دے اور مجھ پر رحم فرما، بے شک تو ہی بخشنے والا، رحم کرنے والا ہے۔',
          'O Allah, I have greatly wronged myself and none forgives sins but You. So grant me forgiveness from You and have mercy on me. You are the Forgiving, the Merciful.', 'Bukhari 834, Muslim 2705'),
        rec('Dua of Ibrahim (Quranic dua)', 'Often recited by Hanafi worshippers in the final sitting.', 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ ۝ رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
          'Rabbij\'alni muqimas-salati wa min dhurriyyati, rabbana wa taqabbal du\'a. Rabbanaghfir li wa liwalidayya wa lil-mu\'minina yawma yaqumul-hisab.',
          'اے میرے رب! مجھے نماز قائم کرنے والا بنا اور میری اولاد میں سے بھی۔ اے ہمارے رب! میری دعا قبول فرما۔ اے ہمارے رب! مجھے، میرے والدین کو اور سب مومنوں کو حساب کے دن بخش دے۔',
          'My Lord, make me an establisher of prayer, and from my descendants. Our Lord, accept my supplication. Our Lord, forgive me and my parents and the believers on the Day the account is established.', 'Quran 14:40-41', 'Quran 14:40-41'),
        scholar(`The Hanafi school generally recommends duas that resemble those in the Quran and Sunnah (not ordinary worldly requests) inside the prayer.`),
      ]),
    ],
  },
  {
    id: 'salam', group: 'Method of Prayer', title: 'Salam and completing the prayer', urdu: 'سلام اور نماز کا اختتام',
    intro: `The prayer ends by turning the head to the right and then to the left with the salam. Then remember Allah with the dhikr that the Prophet ﷺ recited after prayer.`,
    sections: [
      sec('The salam', [
        rec('Salam', 'Said turning the face to the right, then to the left, to end the prayer.', 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', 'As-salamu \'alaykum wa rahmatullah', 'تم پر سلامتی ہو اور اللہ کی رحمت۔', 'Peace be upon you and the mercy of Allah.', 'Abu Dawud 996, Tirmidhi 295'),
        diff('Number of salams', 'Two (right and left) are Wajib.', 'The first salam is a pillar; the second is a Sunnah.', 'The first salam is obligatory; the second is a Sunnah.', 'The first salam is a pillar; the second is obligatory according to the preferred view.'),
      ], true),
      sec('Remembrance after the obligatory prayers', [
        dua('after-salah-istighfar', 'The Prophet ﷺ would seek forgiveness three times immediately after his salam.'),
        dua('after-salah-tasbih', 'Say SubhanAllah 33, Alhamdulillah 33 and Allahu Akbar 34 times.'),
        dua('ayat-kursi', 'Reciting Ayat al-Kursi after every obligatory prayer is recommended (An-Nasa\'i, Amal al-Yawm wal-Layla; graded authentic by Al-Albani).'),
        note(`The dhikr after prayer is not obligatory but is a Sunnah of great reward.`),
      ]),
    ],
  },
  {
    id: 'rakats', group: 'Method of Prayer', title: 'Prayers of three and four rak\'ahs', urdu: 'تین اور چار رکعت والی نماز',
    intro: `The method for the first two rak'ahs is the same in all prayers. For longer prayers, additional rak'ahs follow, with a short first sitting.`,
    sections: [
      sec('Four-rak\'ah fard prayers (Zuhr, Asr, Isha)', [
        steps(`Pray two rak'ahs as in the previous lessons (Fatiha + a surah in each).`, `Sit for the first sitting and recite only At-Tahiyyat (not the Durood in the Hanafi school).`, `Say "Allahu Akbar" and stand for the third rak'ah.`, `In the third and fourth rak'ahs recite Al-Fatiha only (in fard prayers).`, `After the fourth rak'ah, sit for the final sitting: At-Tahiyyat, Durood, dua, and the salam.`),
      ], true),
      sec('Maghrib (three rak\'ahs)', [
        steps(`Pray two rak'ahs with Fatiha and a surah, then the first sitting (At-Tahiyyat only).`, `Stand for the third rak'ah and recite Al-Fatiha only.`, `Sit for the final sitting and finish with the salam.`),
        note(`In Maghrib the third rak'ah is recited silently. In the voluntary four-rak'ah Sunnah prayers (e.g. before Zuhr), a surah is recited in every rak'ah in the Hanafi school.`),
      ]),
      sec('Witr', [
        p(`Witr is prayed after the Isha prayer. See the "Qunoot and Witr" lesson.`),
      ]),
    ],
  },
  {
    id: 'witr-qunoot', group: 'Method of Prayer', title: 'Witr and Dua Qunoot', urdu: 'وتر اور دعائے قنوت',
    intro: `Witr (odd) is the last prayer of the night. The Prophet ﷺ said, "Make the last of your night prayer Witr" (Bukhari 998, Muslim 751).`,
    sections: [
      sec('Method', [
        diff('Witr rak\'ahs and qunoot',
          'Three rak\'ahs with one salam and one sitting at the end. In the third rak\'ah, after Fatiha and a surah, say "Allahu Akbar" raising the hands, fold them and recite Qunoot, then go to ruku.',
          'One to eleven rak\'ahs. Qunoot is recited after ruku in the second half of Ramadan.',
          'One rak\'ah after a two-rak\'ah prayer; qunoot is not recited in Witr.',
          'One to eleven rak\'ahs. Qunoot is recommended, after ruku (some Hanbalis recite it before ruku).'),
      ], true),
      sec('Dua Qunoot', [
        rec('Qunoot recited in the Hanafi school', 'Reported from Umar ibn al-Khattab (may Allah be pleased with him) and used in the Hanafi school.', 'اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ، اللَّهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَىٰ وَنَحْفِدُ وَنَرْجُو رَحْمَتَكَ وَنَخْشَىٰ عَذَابَكَ إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ',
          'Allahumma inna nasta\'inuka wa nastaghfiruka wa nu\'minu bika wa natawakkalu \'alayka wa nuthni \'alaykal-khayra wa la nakfuruka wa nakhla\'u wa natruku man yafjuruk. Allahumma iyyaka na\'budu wa laka nusalli wa nasjudu wa ilayka nas\'a wa nahfid, wa narju rahmataka wa nakhsha \'adhabaka inna \'adhabaka bil-kuffari mulhiq.',
          'اے اللہ! ہم تجھ سے مدد مانگتے ہیں اور تجھ سے بخشش طلب کرتے ہیں، تجھ پر ایمان رکھتے ہیں اور تجھ پر بھروسا کرتے ہیں، تیری بہترین تعریف کرتے ہیں اور تیری ناشکری نہیں کرتے، اور جو تیری نافرمانی کرے اسے چھوڑتے اور ترک کرتے ہیں۔ اے اللہ! ہم تیری ہی عبادت کرتے ہیں، تیرے ہی لیے نماز پڑھتے اور سجدہ کرتے ہیں، تیری ہی طرف دوڑتے اور حاضر ہوتے ہیں، تیری رحمت کے امیدوار ہیں اور تیرے عذاب سے ڈرتے ہیں، بے شک تیرا عذاب کافروں کو پہنچنے والا ہے۔',
          'O Allah, we seek Your help and Your forgiveness; we believe in You and rely on You; we praise You with all good and we are not ungrateful to You; we cast off and abandon whoever disobeys You. O Allah, You alone we worship, to You we pray and prostrate, to You we hasten and strive; we hope for Your mercy and fear Your punishment. Indeed Your punishment will overtake the disbelievers.',
          'Reported from Umar; narrated by Al-Bayhaqi and Ibn Abi Shaybah'),
        rec('Qunoot taught by the Prophet ﷺ to Al-Hasan ibn Ali', 'Recited in Witr in the Shafi\'i and Hanbali schools; also permissible in others.', 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَىٰ عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ',
          'Allahummahdini fiman hadayt, wa \'afini fiman \'afayt, wa tawallani fiman tawallayt, wa barik li fima a\'tayt, wa qini sharra ma qadayt, fa innaka taqdi wa la yuqda \'alayk, wa innahu la yadhillu man walayt, tabarakta rabbana wa ta\'alayt.',
          'اے اللہ! مجھے ہدایت دے ان میں جنہیں تو نے ہدایت دی، مجھے عافیت دے ان میں جنہیں تو نے عافیت دی، میرا کارساز بن ان میں جن کا تو کارساز بنا، جو کچھ تو نے مجھے دیا اس میں برکت دے، اور مجھے اس کی برائی سے بچا جو تو نے مقدر کیا، بے شک تو فیصلہ کرتا ہے اور تیرے خلاف فیصلہ نہیں کیا جاتا، اور جس کا تو دوست بنے وہ ذلیل نہیں ہوتا، اے ہمارے رب! تو بابرکت اور بلند ہے۔',
          'O Allah, guide me among those You have guided, grant me well-being among those You have granted well-being, take me into Your care among those You have taken into Your care, bless me in what You have given, and protect me from the evil of what You have decreed. For You decree and none decrees over You, and he whom You support is never humiliated. Blessed are You, our Lord, and Exalted.',
          'Abu Dawud 1425, Tirmidhi 464, An-Nasa\'i 1745'),
      ]),
    ],
  },
  {
    id: 'fard-wajib-sunnah', group: 'Rulings & Guidance', title: 'Fard, Wajib and Sunnah in the prayer', urdu: 'نماز کے فرائض، واجبات اور سنتیں',
    intro: `The schools classify the parts of the prayer differently. This lesson shows what each school counts as pillars (arkan) and obligations. Knowing it helps you know what must be repeated if something is missed.`,
    sections: [
      sec('Hanafi school', [
        rank(r('fard', 'Fara\'id (pillars): Takbeer-e-Tahreemah, Qiyam (standing, if able), Qira\'ah (reciting some of the Quran), Ruku, two Sajdahs, and the final sitting for the length of the tashahhud. Some also add leaving the prayer by one\'s own action (salam).'),
          r('wajib', 'Wajibat: Surah Al-Fatiha, a surah or three short verses, the correct order of recitation, Qawmah and Jalsah with calmness, the first sitting and tashahhud in 3-4 rak\'ah prayers, Qunoot in Witr, the two Eid takbeers, loud and quiet recitation as required, and the words of the salam.'),
          r('sunnah', 'Sunnah: raising the hands, folding the hands, Sana, Ta\'awwudh, Bismillah, "Ameen", the tasbeehs, the Durood in the final sitting, and so on.')),
        note(`Missing a Fard invalidates the prayer. Missing a Wajib by mistake requires the prostration of forgetfulness (sajdah sahw); omitting it deliberately requires repeating the prayer.`),
      ], true),
      sec('Shafi\'i, Maliki and Hanbali schools', [
        p(`The Shafi'i school lists pillars (arkan) which include: intention, the opening takbeer, standing, reciting Al-Fatiha, ruku, rising from ruku, sajdah, sitting between the two sajdahs, the final tashahhud and sitting, sending blessings upon the Prophet ﷺ in the final tashahhud, the first salam, and the order of the pillars, along with calm pauses (tuma'ninah) in the main postures.`),
        p(`The Maliki and Hanbali schools list similar pillars and "wajibat" but count them differently (for example, the Hanbali school includes the first tashahhud and the tasbeehs among the obligatory acts). The exact lists differ.`),
        scholar(`Follow the manual of your school (for example, a recognized fiqh text) for the exact list. If you have missed something in a past prayer and are unsure, ask a scholar of your school.`),
      ]),
    ],
  },
  {
    id: 'invalidators', group: 'Rulings & Guidance', title: 'What invalidates the prayer', urdu: 'نماز کو توڑنے والی چیزیں',
    intro: `Some things end the prayer. If you do one deliberately, you must repeat the prayer.`,
    sections: [
      sec('Things that invalidate the prayer', [
        list(
          `Speaking deliberately: the Prophet ﷺ said that human speech is not appropriate in prayer (Muslim 537).`,
          `Eating or drinking.`,
          `Excessive continuous movement unrelated to the prayer.`,
          `Turning the chest away from the Qibla without a valid reason.`,
          `Laughing out loud (all schools agree this invalidates the prayer).`,
          `Uncovering the awrah and not covering it immediately.`,
          `Losing wudu (see below).`,
          `Deliberately leaving a pillar or Fard of the prayer, or adding a pillar on purpose.`,
          `Making the intention to leave the prayer.`),
      ], true),
      sec('If wudu breaks during prayer', [
        p(`The majority hold that the prayer is invalid and must be repeated after renewing wudu. The Hanafi school permits "building" (bina) in some situations if the wudu breaks involuntarily, but with strict conditions. Ask a scholar of your school in such a case.`),
        note(`Passing in front of a worshipper does not invalidate the prayer according to most scholars (the Hanbali school holds that a black dog does), but it is a sin for the one who passes (Bukhari 510, Muslim 507). Place a sutrah (barrier) when praying alone.`),
      ]),
      sec('Prayer of forgetfulness (Sajdah Sahw)', [
        p(`If you forget a Wajib (or add or omit an act by mistake), make two prostrations of forgetfulness. The Prophet ﷺ did this when he forgot the first sitting (Bukhari 1224, Muslim 570).`),
        diff('Timing of Sajdah Sahw', 'After the final tashahhud, make a salam to the right only, then two sajdahs, then tashahhud, durood and the final salam.',
          'Before the salam (at the end of the tashahhud and durood).', 'Before the salam for omissions; after the salam for additions.', 'Before the salam for omissions and for acting on doubt; after the salam for additions and for deciding on probability.'),
        refs({ ref: 'Muslim 571', text: 'If one of you is in doubt in his prayer, let him cast away the doubt, build on what he is certain of, and then prostrate twice before the salam.' }),
      ]),
    ],
  },
  {
    id: 'jamaah', group: 'Rulings & Guidance', title: 'Congregational prayer (Jama\'ah)', urdu: 'باجماعت نماز',
    intro: `The Prophet ﷺ emphasised praying in congregation: "The prayer in congregation is twenty-seven degrees better than the prayer of one praying alone" (Bukhari 645, Muslim 650).`,
    sections: [
      sec('Ruling and virtue', [
        diff('Ruling on attending the congregation (for men)', 'Wajib (a strongly emphasised Sunnah, according to some Hanafi scholars).', 'Fard kifayah (a communal obligation); some scholars say a Sunnah muakkadah.', 'Sunnah muakkadah.', 'Obligatory for men who are able (fard \'ayn).'),
        note(`Women may pray at home or in the mosque. See the lesson on women\'s guidance.`),
      ], true),
      sec('The imam and the rows', [
        steps(`The imam should be the one who knows the Quran best and is most knowledgeable of the prayer (Muslim 673).`, `Rows should be straight and gaps filled, shoulder to shoulder (Bukhari 723).`, `Men stand in the front rows, children after them, women behind.`, `Follow the imam: do not go before him; "when he says Allahu Akbar, say Allahu Akbar; when he bows, bow" (Bukhari 689, Muslim 411).`, `The imam should keep the prayer light for the sake of the weak and elderly (Bukhari 702, Muslim 466).`),
      ]),
      sec('Joining late (the masbuq)', [
        p(`The Prophet ﷺ said: "Whatever you catch up with, pray; and whatever you miss, complete" (Bukhari 636, Muslim 602). Come to the prayer calmly and do not run.`),
        steps(`Join the imam in whatever posture he is in, after the takbeer.`, `If you reach the imam in ruku and bow before he rises, the rak'ah counts (Bukhari 783).`, `After the imam's salam, stand (without a salam) and complete the missed rak'ahs.`),
        note(`According to the Hanafi school, what the latecomer catches with the imam counts as the first part of his prayer for the purpose of recitation, and the last part for sitting. Ask a scholar for the details of your school.`),
      ]),
    ],
  },
  {
    id: 'qaza', group: 'Rulings & Guidance', title: 'Qaza (missed prayers)', urdu: 'قضا نمازیں',
    intro: `Prayer must be offered within its time. If a prayer is missed because of sleep or forgetfulness, it must be prayed as soon as one remembers.`,
    sections: [
      sec('Missed prayers', [
        refs({ ref: 'Bukhari 597, Muslim 684', text: 'Whoever forgets a prayer or sleeps through it, its expiation is to pray it when he remembers it.' }),
        steps(`Pray the missed prayer as soon as you remember or wake up.`, `Pray it with the same number of rak'ahs, with the same recitation (aloud or silent) as the prayer that was missed.`, `If several prayers are missed, make them up in order where possible (the Hanafi school makes this an obligation when fewer than six prayers are missed).`, `Make the intention of making up the specific missed prayer.`),
      ], true),
      sec('Deliberately missed prayers', [
        p(`The majority of scholars hold that deliberately missed prayers must be made up, in addition to sincere repentance. Some scholars, such as Ibn Hazm and Ibn Taymiyyah, held that a prayer deliberately missed beyond its time cannot be made up and must be compensated by repentance and extra voluntary prayers.`),
        scholar(`If you have many years of missed prayers, ask a scholar of your school how to calculate and make them up in a manageable way. Repent first and keep every prayer on time from now on.`),
        note(`Sunnah prayers are generally not made up. Some details (for example, the two Sunnah rak'ahs of Fajr) differ by school.`),
      ]),
    ],
  },
  {
    id: 'travel-sick', group: 'Special Cases', title: 'Prayer when travelling or ill', urdu: 'سفر اور بیماری میں نماز',
    intro: `Allah has made the religion easy. Prayer is shortened for travellers and adapted for those who are ill.`,
    sections: [
      sec('Shortening the prayer (Qasr)', [
        refs({ ref: 'Quran 4:101', text: 'When you travel throughout the land, there is no blame upon you for shortening the prayer.' }),
        list(`Only the four-rak'ah fard prayers (Zuhr, Asr, Isha) are shortened to two rak'ahs. Fajr and Maghrib are not.`),
        diff('Distance and ruling', 'About 48 miles (≈77 km). Shortening is obligatory. Staying 15 days or more at a place ends the traveller status.', 'About 80–89 km. Shortening is permissible (and preferred by many). Staying more than four days ends the traveller status.', 'About 80–89 km. Shortening is a Sunnah. Staying four days or more ends the traveller status.', 'About 80–89 km. Shortening is permissible and preferred. Staying more than four days (20 prayers) ends the traveller status.'),
      ], true),
      sec('Combining prayers (Jam\')', [
        p(`Combining Zuhr with Asr, or Maghrib with Isha, is permitted in the Shafi'i, Maliki and Hanbali schools while travelling and in other cases of real hardship (Muslim 705). The Hanafi school permits combining only at Arafah and Muzdalifah during Hajj.`),
        scholar(),
      ]),
      sec('Prayer when ill', [
        refs({ ref: 'Bukhari 1117', text: 'Imran ibn Husayn asked the Prophet ﷺ about prayer. He said: "Pray standing; if you cannot, then sitting; if you cannot, then on your side."' }),
        steps(`Stand if you are able to; if not, sit.`, `If you cannot bow and prostrate, make them by gesture, lowering the head more for sajdah than for ruku.`, `If you cannot sit, pray lying down, facing the Qibla if possible, and indicating by the head or eyes.`, `Do not delay the prayer beyond its time. Combine prayers if your school allows and you are in real difficulty.`),
      ]),
    ],
  },
  {
    id: 'women', group: 'Special Cases', title: 'Guidance for women', urdu: 'خواتین کے لیے رہنمائی',
    intro: `Women are addressed by the same commands to pray as men. This lesson lists some rulings that are specific to women, with the differences among the schools.`,
    sections: [
      sec('Menstruation and postnatal bleeding', [
        p(`A woman does not pray, and does not make up missed prayers, during her period (hayd) or postnatal bleeding (nifas). Aisha said: "We were commanded to make up fasting, but we were not commanded to make up prayer" (Muslim 335). She should perform ghusl when it ends and resume praying.`),
        scholar(`Questions about irregular bleeding (istihadah) or the exact start and end of a period should be asked to a qualified scholar or Muslim woman doctor-scholar.`),
      ], true),
      sec('Attending the mosque', [
        refs({ ref: 'Muslim 442', text: 'Do not prevent the female servants of Allah from the mosques of Allah.' }, { ref: 'Abu Dawud 567', text: 'Do not prevent your women from the mosques, though their homes are better for them.' }),
        p(`Women may attend the mosque and congregation, with modest dress and without perfume. Praying at home is also excellent.`),
      ]),
      sec('Differences in posture and leading', [
        diff('Posture of women in prayer', 'Hands are placed on the chest; in ruku and sajdah women stay compact; in sitting they sit on the left hip with both feet to the right.', 'The same as men, with modesty.', 'The same as men, with modesty.', 'The same as men, with modesty.',
          'The Hanafi rulings are based on the principle of modesty; the other schools hold that the description of the Prophet\'s prayer applies to both men and women.'),
        diff('A woman leading other women', 'Disliked (makruh tahreemi) according to many Hanafi scholars.', 'Permitted; she stands in the middle of the row.', 'Not permitted according to the well-known view.', 'Permitted; she stands in the middle of the row.',
          'The Prophet ﷺ appointed Umm Waraqah to lead the people of her house (Abu Dawud 592; its chain is graded hasan by some).'),
        note(`A woman covers her whole body in prayer except the face and hands (and, in the Hanafi school, the feet).`),
      ]),
    ],
  },
  {
    id: 'mistakes', group: 'Rulings & Guidance', title: 'Common mistakes in Salah', urdu: 'نماز کی عام غلطیاں',
    intro: `A few common mistakes reduce the value of prayer or even invalidate it. Check yourself against this list.`,
    sections: [
      sec('Common mistakes', [
        list(
          `Rushing the movements and not pausing (tuma'ninah). The Prophet ﷺ told a man who prayed hastily, "Go back and pray, for you have not prayed" (Bukhari 757, Muslim 397).`,
          `Not straightening the back in ruku, or not rising fully in qawmah and jalsah.`,
          `Looking up to the sky during prayer: the Prophet ﷺ strongly warned against it (Bukhari 750).`,
          `Reciting the Quran in ruku or sajdah (Muslim 479).`,
          `Not covering the awrah properly, or wearing clothes that are transparent or tight.`,
          `Moving a lot or playing with clothes, the phone or the watch.`,
          `Reciting aloud and disturbing others who are praying.`,
          `Leaving gaps in the row, or praying in front of the imam.`,
          `Finishing before or at the same time as the imam, rather than following him.`,
          `Praying in the three forbidden times without a valid reason (Muslim 831).`,
          `Wrong pronunciation that changes the meaning of the words.`),
      ], true),
      sec('How to improve', [
        steps(`Learn the meaning of what you recite, so that your heart is present (khushu\').`, `Slow down and take a moment in each posture.`, `Use the "Pronunciation" and "Flashcards" sections of this app to practise the recitations.`, `Ask a knowledgeable person or a qualified teacher to listen to your prayer and correct it.`),
        qa({ q: 'I forgot how many rak\'ahs I prayed. What should I do?', a: 'Act on what you are certain of (the lesser number if you have no strong feeling) and make two prostrations of forgetfulness. See the Sajdah Sahw section (Muslim 571).' },
          { q: 'Can I pray while wearing socks?', a: 'Yes. The Prophet ﷺ prayed while wearing his shoes (Bukhari 386), so long as they are clean. Socks and shoes should be free from impurity.' }),
      ]),
    ],
  },
];
