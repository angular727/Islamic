import { Lesson, check, diff, note, p, qa, r, rank, rec, refs, scholar, sec, steps, list, table } from './model';

/** Namaz (Salah) – foundations, purification and preparation. */
export const NAMAZ_PART1: Lesson[] = [
  {
    id: 'importance', group: 'Foundations', title: 'Importance & purpose of Salah', urdu: 'نماز کی اہمیت',
    intro: `Salah is the second pillar of Islam, after the declaration of faith. It is the daily meeting between the servant and his Lord, performed five times a day.`,
    sections: [
      sec('What is Salah?', [
        p(`Salah (ṣalāh) literally means supplication. In Islamic law it is a specific act of worship made up of set words and movements, beginning with the takbeer (Allahu Akbar) and ending with the salam.`),
        p(`Allah says: establish the prayer for My remembrance (Quran 20:14). Its purpose is remembrance of Allah, gratitude, humility, and discipline.`),
      ], true),
      sec('Virtues and warnings', [
        refs(
          { ref: 'Quran 29:45', text: 'Recite what has been revealed to you of the Book and establish prayer. Indeed, prayer prohibits immorality and wrongdoing.' },
          { ref: 'Quran 2:238', text: 'Guard strictly the prayers, especially the middle prayer, and stand before Allah devoutly obedient.' },
          { ref: 'Bukhari 528, Muslim 667', text: 'The Prophet ﷺ compared the five daily prayers to a flowing river at one\'s door in which a person bathes five times a day: no dirt would remain on him. Likewise, Allah erases sins through the five prayers.' },
          { ref: 'Tirmidhi 413, Abu Dawud 864', text: 'The first thing a servant will be held to account for on the Day of Resurrection is his prayer.' },
          { ref: 'Muslim 82', text: 'Between a man and shirk and disbelief is abandoning the prayer.' },
        ),
        scholar(`Scholars agree that abandoning the prayer is among the gravest sins. They differ about the exact ruling on someone who neglects it out of laziness while still believing it is obligatory. Such a person should repent and return to the prayer at once.`),
      ]),
      sec('Upon whom is it obligatory?', [
        p(`Salah is obligatory on every Muslim who is sane and has reached puberty, man or woman. Children should be taught it early: the Prophet ﷺ said, "Command your children to pray when they are seven, and discipline them for it when they are ten" (Abu Dawud 495).`),
        rank(r('fard', 'Five daily prayers: Fajr, Zuhr, Asr, Maghrib and Isha.'), r('wajib', 'Witr (Hanafi school) – see "Five daily prayers".'), r('sunnah', 'Regular Sunnah prayers before and after the obligatory ones.')),
      ]),
    ],
  },
  {
    id: 'five-prayers', group: 'Foundations', title: 'The five daily prayers', urdu: 'پانچ وقت کی نمازیں',
    intro: `Each of the five prayers has its own time and number of rak'ahs. This lesson summarises the obligatory (fard) prayers and the Sunnah prayers that accompany them.`,
    sections: [
      sec('Times of the prayers', [
        table(['Prayer', 'Begins', 'Ends'],
          ['Fajr', 'True dawn (the horizontal white light on the horizon)', 'Sunrise'],
          ['Zuhr', 'When the sun passes its highest point', 'When Asr begins'],
          ['Asr', 'See the difference below', 'Sunset'],
          ['Maghrib', 'Sunset', 'When the twilight fades'],
          ['Isha', 'When the twilight fades', 'True dawn (best before midnight)']),
        diff('Start of Asr', 'When the shadow of an object is twice its length (plus the noon shadow), according to Abu Hanifa. Many Hanafi fatwas follow this.',
          'When an object\'s shadow equals its length (plus the noon shadow).', 'Same as Shafi\'i.', 'Same as Shafi\'i.',
          'Praying Asr at the earlier time is valid for the majority; waiting for the Hanafi time is a matter of following your school.'),
        refs({ ref: 'Muslim 612', text: 'The Prophet ﷺ explained the times of the prayers in detail, including that the time of Isha lasts until midnight.' },
          { ref: 'Quran 4:103', text: 'Indeed, prayer has been decreed upon the believers at specified times.' }),
        note(`Use a trusted local timetable or the Prayer Times page of this app. Times are calculated, so use the calculation method your community follows.`),
      ], true),
      sec('Rak\'ahs of the obligatory prayers', [
        table(['Prayer', 'Fard rak\'ahs', 'Notes'],
          ['Fajr', '2', 'Recitation aloud'],
          ['Zuhr', '4', 'Recitation silent'],
          ['Asr', '4', 'Recitation silent'],
          ['Maghrib', '3', 'Aloud in the first two'],
          ['Isha', '4', 'Aloud in the first two']),
        note(`In a three or four rak'ah prayer there are two sittings: the first sitting after the second rak'ah (tashahhud only) and the final sitting after the last rak'ah.`),
      ]),
      sec('Sunnah and Witr prayers', [
        p(`The regular Sunnah prayers (rawatib) are not obligatory, but the Prophet ﷺ rarely left them. Umm Habibah reported that whoever prays twelve rak'ahs in a day and night, Allah builds a house for him in Paradise (Muslim 728). Tirmidhi 414 lists them: four before Zuhr, two after, two after Maghrib, two after Isha and two before Fajr.`),
        diff('Regular (muakkadah) Sunnah prayers',
          'Twelve: 2 before Fajr, 4 before Zuhr, 2 after Zuhr, 2 after Maghrib, 2 after Isha. Also recommended: 4 before Asr and 4 before Isha.',
          'Ten: 2 before Fajr, 2 before Zuhr, 2 after Zuhr, 2 after Maghrib, 2 after Isha. More are recommended (4 before Zuhr, 4 before Asr).',
          'Stresses the two rak\'ahs of Fajr and Witr; other voluntary prayers are recommended.',
          'Ten: 2 before Fajr, 2 before Zuhr, 2 after Zuhr, 2 after Maghrib, 2 after Isha (as in Bukhari 1180).'),
        diff('Witr (night prayer after Isha)',
          'Wajib. Three rak\'ahs with one salam; qunoot is recited in the third rak\'ah.',
          'Sunnah muakkadah. From one up to eleven rak\'ahs; usually 1 or 3.',
          'Sunnah muakkadah. One rak\'ah, preceded by two (shaf\').',
          'Sunnah muakkadah. From one up to eleven rak\'ahs; usually 1 or 3.',
          'Bukhari 998 and Muslim 749: make Witr the last of your night prayers.'),
        scholar(`If you follow a school, follow it for the number of Sunnah rak'ahs. Differences here are about the rank (Sunnah or Wajib) and the count, not about whether the prayers are good to pray.`),
      ]),
    ],
  },
  {
    id: 'conditions', group: 'Foundations', title: 'Conditions required before prayer', urdu: 'نماز کی شرائط',
    intro: `Conditions (shuroot) are things that must be present before you begin the prayer. If one is missing, the prayer is not valid.`,
    sections: [
      sec('The conditions', [
        steps(
          `Islam, sanity and reaching puberty (the conditions for it to be obligatory).`,
          `Purity from minor impurity (wudu) and major impurity (ghusl): "Allah does not accept the prayer of one who has broken his wudu until he performs wudu" (Bukhari 135, Muslim 225).`,
          `A clean body, clothes and place (free from physical impurity).`,
          `Covering the awrah (Quran 7:31: take your adornment at every place of prayer).`,
          `The time of the prayer has entered (Quran 4:103).`,
          `Facing the Qibla, the direction of the Kaaba (Quran 2:144).`,
          `Intention (niyyah) in the heart.`),
        note(`Intention is in the heart. You do not have to say it aloud. If you do speak it, it should be quiet and is not required.`),
      ], true),
      sec('Related rulings', [
        qa(
          { q: 'What if the time has entered but I cannot find water?', a: 'Perform tayammum (dry ablution) and pray. See the Tayammum lesson.' },
          { q: 'What if I am unsure of the Qibla?', a: 'Ask someone knowledgeable or use a reliable Qibla tool. If you cannot find out, make your best effort and pray in the direction you believe is correct; the prayer is valid insha\'Allah.' },
          { q: 'May I pray on a plane, train or bus?', a: 'Yes, when you cannot get off before the time ends. Face the Qibla as best you can and pray standing, sitting or by gesture, according to what is possible. Scholars differ on some details; ask a scholar for your journey.' }),
      ]),
    ],
  },
  {
    id: 'wudu', group: 'Purification', title: 'Wudu (ablution)', urdu: 'وضو',
    intro: `Wudu is the washing of specific parts of the body before prayer. Allah commanded it in the Quran, and the Prophet ﷺ taught its method.`,
    sections: [
      sec('Obligatory acts of wudu (Quran 5:6)', [
        p(`"O you who believe, when you rise to pray, wash your faces and your forearms to the elbows, wipe your heads, and wash your feet to the ankles." (Quran 5:6)`),
        diff('Fard (obligatory) acts of wudu',
          'Four: washing the face, washing the arms including the elbows, wiping a quarter of the head, washing the feet including the ankles.',
          'Six: intention, washing the face, arms to the elbows, wiping some part of the head, washing the feet to the ankles, and doing them in order.',
          'Seven: intention, washing the face, arms to the elbows, wiping the head, washing the feet, rubbing the limbs while washing, and doing them without long break (continuity).',
          'Six: washing the face (including rinsing the mouth and nose), arms, wiping the whole head (including the ears), feet, order, and continuity.',
          'The schools differ in how they count. All agree that these four parts of the body must be washed or wiped.'),
      ], true),
      sec('Step-by-step method (Sunnah)', [
        steps(
          `Make the intention in your heart to purify yourself for prayer.`,
          `Say "Bismillah" (the Prophet ﷺ said there is no wudu for one who does not mention Allah\'s name – Abu Dawud 101; scholars differ whether this is a condition or a Sunnah).`,
          `Wash the hands up to the wrists three times, also between the fingers.`,
          `Rinse the mouth three times.`,
          `Sniff water into the nose and blow it out three times.`,
          `Wash the whole face three times, from the hairline to the chin and from ear to ear.`,
          `Wash the right arm, then the left, from the fingertips to include the elbows, three times each.`,
          `Wipe the head once with wet hands, from the front to the back and back again, and wipe the ears.`,
          `Wash the right foot, then the left, up to and including the ankles, three times each, also between the toes.`,
          `Recite the dua after wudu (see below).`),
        refs({ ref: 'Bukhari 159, Muslim 226', text: 'The description of the wudu of the Prophet ﷺ narrated by Uthman ibn Affan: he washed his hands, rinsed his mouth and nose, washed his face, arms, wiped his head, and washed his feet, three times each.' }),
        note(`Do not waste water. Allah does not like extravagance (Quran 7:31).`, 'tip'),
      ]),
      sec('Dua after wudu', [
        { t: 'dua', id: 'after-wudu', when: 'Recite after finishing wudu (Muslim 234).' },
      ]),
      sec('Wudu step checklist', [check(`Intention`, `Hands`, `Mouth`, `Nose`, `Face`, `Arms to the elbows`, `Wipe the head and ears`, `Feet to the ankles`, `In order and without long delay`)]),
    ],
  },
  {
    id: 'wudu-breakers', group: 'Purification', title: 'What breaks wudu', urdu: 'وضو توڑنے والی چیزیں',
    intro: `Some things end the state of wudu. Scholars agree on a core list and differ on several others.`,
    sections: [
      sec('Agreed by all four schools', [
        list(
          `Anything that leaves the front or back passage: urine, stool, passing wind, and madhi or wadi.`,
          `Loss of consciousness: fainting, intoxication or madness.`,
          `Deep sleep that removes awareness (see the note below).`),
        note(`Light drowsiness that does not remove awareness does not break wudu. The schools differ in whether sleeping while seated firmly breaks wudu.`),
      ], true),
      sec('Where the schools differ', [
        table(['Cause', 'Hanafi', "Shafi'i", 'Maliki', 'Hanbali'],
          ['Flowing blood or vomiting', 'Breaks it (if it flows or fills the mouth)', 'Does not break it', 'Does not break it', 'Breaks it if it is a large amount'],
          ['Touching the private part directly', 'Does not break it', 'Breaks it (with the inner palm)', 'Breaks it if with desire', 'Breaks it'],
          ['Skin contact with a woman (not a mahram)', 'Does not break it', 'Breaks it', 'Breaks it if with desire', 'Breaks it if with desire'],
          ['Eating camel meat', 'No', 'No', 'No', 'Breaks it'],
          ['Laughing aloud in prayer', 'Breaks wudu and prayer', 'Breaks prayer only', 'Breaks prayer only', 'Breaks prayer only']),
        scholar(`This table is a summary. Details and exceptions exist in each school. If you doubt whether your wudu is broken, act on certainty: if you were sure of wudu and only doubt it, you remain in wudu (Bukhari 137, Muslim 361).`),
      ]),
    ],
  },
  {
    id: 'ghusl', group: 'Purification', title: 'Ghusl (full bath)', urdu: 'غسل',
    intro: `Ghusl is washing the whole body with the intention of purification. It is required to remove major impurity before praying.`,
    sections: [
      sec('When is ghusl obligatory?', [
        list(
          `After sexual intercourse (even without discharge).`,
          `After emission of semen (including a wet dream with discharge, Bukhari 282, Muslim 313).`,
          `At the end of menstruation (hayd) and postnatal bleeding (nifas).`,
          `Washing the body of a deceased Muslim (a duty on the community).`,
          `Allah says: "If you are in a state of janabah, then purify yourselves" (Quran 5:6; see also 4:43).`),
        scholar(`Scholars differ on whether the emission of semen without desire requires ghusl. The Shafi\'i school requires it; the other schools require desire.`),
      ], true),
      sec('Fard acts of ghusl', [
        diff('Obligatory acts of ghusl',
          'Three: rinsing the mouth, sniffing water into the nose, and washing the entire body.',
          'Intention and washing the entire body (including the hair); rinsing the mouth and nose are Sunnah.',
          'Intention, washing the entire body, rubbing the body, and continuity.',
          'Washing the entire body, including rinsing the mouth and nose; intention is a condition.'),
      ]),
      sec('Method of the Prophet ﷺ', [
        steps(
          `Make the intention in your heart.`,
          `Wash the hands, then the private parts and any impurity.`,
          `Perform a complete wudu (some scholars leave the feet for the end).`,
          `Pour water over the head three times, making sure the roots of the hair are wet.`,
          `Pour water over the right shoulder and side, then the left.`,
          `Make sure no part of the body, including the navel and between the toes, remains dry.`),
        refs({ ref: 'Bukhari 248, Muslim 316', text: `Aisha described the ghusl of the Prophet ﷺ (Maymunah's description is also in the two Sahihs).` }),
        note(`Ghusl is also recommended before Friday prayer, the two Eid prayers and for Ihram.`),
      ]),
    ],
  },
  {
    id: 'tayammum', group: 'Purification', title: 'Tayammum (dry ablution)', urdu: 'تیمم',
    intro: `When water is not available, or its use would harm a sick person, Allah permits tayammum with clean earth in place of wudu or ghusl.`,
    sections: [
      sec('When is it allowed?', [
        refs({ ref: 'Quran 5:6, 4:43', text: 'If you do not find water, then seek clean earth and wipe your faces and hands with it.' }),
        list(`No water is available after a reasonable search.`, `Using water would worsen an illness or delay recovery (as advised by a trustworthy doctor).`, `Water is needed for drinking and cannot be spared.`, `The cold is so severe that using water would cause real harm.`),
      ], true),
      sec('Method', [
        steps(`Make the intention to perform tayammum for prayer.`, `Say Bismillah.`, `Strike both palms lightly on clean earth, sand, stone or a dusty surface.`, `Wipe the face once.`, `Wipe the hands (see the differences below).`),
        diff('Wiping the hands',
          'Strike twice: once for the face, once for the arms; wipe the arms up to and including the elbows.',
          'Strike twice: face, then arms up to the elbows.',
          'Face and hands to the wrists are obligatory; wiping to the elbows is recommended.',
          'One strike; wipe the face, then the backs of the hands to the wrists (Bukhari 338).'),
        note(`Tayammum is broken by whatever breaks wudu, and when water becomes available or the excuse ends.`, 'tip'),
      ]),
    ],
  },
  {
    id: 'preparation', group: 'Preparation', title: 'Preparing for prayer', urdu: 'نماز کی تیاری',
    intro: `Before standing in prayer, make sure of purity, clothing, Qibla, place and time.`,
    sections: [
      sec('Covering the awrah', [
        diff('Awrah in prayer',
          'Men: from the navel down to and including the knees. Women: the entire body except face, hands and feet.',
          'Men: between the navel and the knees. Women: the entire body except face and hands (the feet are covered).',
          'Men: between the navel and the knees (the thighs are the most emphasised). Women: the entire body except face and hands.',
          'Men: between the navel and the knees. Women: the entire body except the face (and the hands according to many); feet are covered.'),
        note(`Clothing should be clean, modest and not transparent. A man should also cover his shoulders in prayer if he is able (Bukhari 359, Muslim 516).`),
      ], true),
      sec('Qibla, place and time', [
        list(
          `Face the Kaaba in Makkah (Quran 2:144). In another city, face the direction of Makkah. You can use the Qibla page of this app.`,
          `Pray in a clean place. Use a clean mat, cloth or floor.`,
          `Pray within the time of the prayer. Praying early in its time is best, except Isha, which may be delayed if there is no hardship (see Muslim 612).`,
          `Avoid distractions: food ready to eat, needing the toilet, loud noise (Muslim 560).`),
        refs({ ref: 'Bukhari 1096, Muslim 700', text: 'The Prophet ﷺ prayed voluntary prayers on his mount in whichever direction it was facing while travelling, but not obligatory prayers.' }),
      ]),
      sec('Times when voluntary prayer is prohibited', [
        p(`According to Uqbah ibn Amir, the Prophet ﷺ forbade us to pray, or bury our dead, at three times: when the sun is rising until it has risen, when it is at its zenith until it passes, and when it is setting until it has set (Muslim 831). Voluntary prayer is also disliked after Fajr until sunrise and after Asr until sunset (Bukhari 586, Muslim 827).`),
        scholar(`Scholars differ on prayers with a cause, such as greeting the mosque or a missed fard prayer made up in these times. Ask your school's scholar.`),
      ]),
    ],
  },
  {
    id: 'adhan', group: 'Preparation', title: 'Adhan and Iqamah', urdu: 'اذان اور اقامت',
    intro: `The adhan is the call to prayer; the iqamah announces that the congregation is about to start. Replying to the caller is a Sunnah.`,
    sections: [
      sec('The adhan', [
        rec('Adhan', 'Called aloud by the muadhdhin when the time of an obligatory prayer enters.',
          'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ\nأَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ (×2)\nأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ (×2)\nحَيَّ عَلَى الصَّلَاةِ (×2)\nحَيَّ عَلَى الْفَلَاحِ (×2)\nاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ\nلَا إِلَٰهَ إِلَّا اللَّهُ',
          'Allahu akbar, Allahu akbar, Allahu akbar, Allahu akbar. Ash-hadu al-la ilaha illallah (×2). Ash-hadu anna Muhammadan rasulullah (×2). Hayya \'alas-salah (×2). Hayya \'alal-falah (×2). Allahu akbar, Allahu akbar. La ilaha illallah.',
          'اللہ سب سے بڑا ہے (چار بار)۔ میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں (دو بار)۔ میں گواہی دیتا ہوں کہ محمد ﷺ اللہ کے رسول ہیں (دو بار)۔ آؤ نماز کی طرف (دو بار)۔ آؤ کامیابی کی طرف (دو بار)۔ اللہ سب سے بڑا ہے (دو بار)۔ اللہ کے سوا کوئی معبود نہیں۔',
          'Allah is the Greatest (four times). I bear witness that there is no god but Allah (twice). I bear witness that Muhammad is the Messenger of Allah (twice). Come to prayer (twice). Come to success (twice). Allah is the Greatest (twice). There is no god but Allah.',
          'Muslim 379'),
        rec('Addition in the Fajr adhan', 'Said after "Hayya \'alal-falah" in the adhan for Fajr.', 'الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ (×2)', 'As-salatu khayrum minan-nawm (×2)',
          'نماز نیند سے بہتر ہے (دو بار)۔', 'Prayer is better than sleep (twice).', 'Abu Dawud 500'),
        diff('Number of takbeers at the start of the adhan', 'Four', 'Four', 'Two (as practised in Madinah)', 'Four',
          'All forms are authentic practices; follow the practice of your community.'),
      ], true),
      sec('The iqamah', [
        diff('Wording of the iqamah',
          'The same as the adhan, with "Qad qamatis-salah" said twice after "Hayya \'alal-falah".',
          'Each phrase once, "Qad qamatis-salah" twice.',
          'Each phrase once, "Qad qamatis-salah" once.',
          'Each phrase once, "Qad qamatis-salah" twice.'),
        rec('Added phrase in the iqamah', 'Said before the congregational prayer begins.', 'قَدْ قَامَتِ الصَّلَاةُ', 'Qad qamatis-salah', 'نماز کھڑی ہو گئی۔', 'The prayer has begun.', 'Abu Dawud 499'),
      ]),
      sec('Replying and the dua after the adhan', [
        steps(`Repeat what the muadhdhin says, phrase by phrase.`, `When he says "Hayya \'alas-salah" and "Hayya \'alal-falah", say "La hawla wa la quwwata illa billah" (Bukhari 613, Muslim 385).`, `When he finishes, send blessings on the Prophet ﷺ (Muslim 384).`, `Then make the dua below.`),
        rec('Dua after the adhan', 'Said after the adhan finishes.',
          'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
          "Allahumma rabba hadhihid-da'watit-tammah, was-salatil-qa'imah, ati Muhammadanil-wasilata wal-fadilah, wab'athhu maqamam-mahmudanil-ladhi wa'adtah.",
          'اے اللہ! اس کامل پکار اور قائم ہونے والی نماز کے رب! محمد ﷺ کو وسیلہ اور فضیلت عطا فرما اور انہیں وہ مقامِ محمود عطا فرما جس کا تو نے ان سے وعدہ کیا ہے۔',
          'O Allah, Lord of this perfect call and of the prayer to be established, grant Muhammad the intercession and the favour, and raise him to the praised station You promised him.',
          'Bukhari 614'),
      ]),
    ],
  },
];
