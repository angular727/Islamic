import { Lesson, check, diff, list, note, p, qa, r, rank, rec, refs, scholar, sec, see, steps, table } from './model';

/** Namaz-e-Janaza (funeral prayer). */
export const JANAZA_LESSONS: Lesson[] = [
  {
    id: 'overview', group: `Foundations`, title: `Importance and purpose of Namaz-e-Janaza`, urdu: `نمازِ جنازہ کی اہمیت`,
    intro: `The funeral prayer is a prayer for the forgiveness and mercy of Allah upon a deceased Muslim. It is a duty on the community (fard kifayah): if some Muslims perform it, the obligation is removed from the rest.`,
    sections: [
      sec(`Purpose and reward`, [
        p(`The funeral prayer is a dua. There is no ruku or sajdah; the whole prayer is standing. It is among the rights of one Muslim over another.`),
        refs({ ref: `Bukhari 1325, Muslim 945`, text: `Whoever attends the funeral until he prays over it will have one qirat of reward, and whoever attends until the burial will have two qirats. It was asked: "What are two qirats?" He said: "Like two great mountains."` },
          { ref: `Muslim 947`, text: `If forty people who do not associate anything with Allah pray over a deceased Muslim, Allah accepts their intercession for him.` },
          { ref: `Abu Dawud 3166, Tirmidhi 1028`, text: `If three rows of Muslims pray over a deceased, Paradise is assured for him. (graded hasan)` }),
      ], true),
      sec(`Ruling`, [
        rank(r(`fard`, `Fard kifayah (communal obligation) on the Muslims, in all four schools.`), r(`sunnah`, `Attending the burial and following the procession.`)),
      ]),
    ],
  },
  {
    id: 'preparation', group: `Foundations`, title: `Preparation and conditions`, urdu: `تیاری اور شرائط`,
    intro: `Before the prayer, the body must be washed, shrouded and brought to the place of prayer.`,
    sections: [
      sec(`Before the prayer`, [
        steps(`The deceased is washed by Muslims of the same sex (a spouse may wash the other spouse), with water and with respect for the body.`, `The body is wrapped in a clean white shroud: three sheets for a man; Hanafi: five pieces for a woman.`, `The body is placed in front of the imam, facing the Qibla, with the head to the imam's right.`, `Hasten the funeral without rushing it: "Hasten with the funeral; if he is righteous you are taking him to goodness, and if otherwise, you are removing an evil from your necks" (Bukhari 1315, Muslim 944).`),
      ], true),
      sec(`Conditions for the prayer`, [
        list(`The deceased is a Muslim and has been washed (or, if it was not possible to wash, tayammum per the school).`, `The deceased's body is present in front of the congregation (see the difference below).`, `Those praying have wudu, cover their awrah, and face the Qibla.`, `The prayer is performed standing (unless there is an excuse).`),
        diff(`Praying for someone who is absent (Salat al-Ghaib)`, `Not permitted.`, `Permitted.`, `Not permitted.`, `Permitted, as the Prophet ﷺ prayed for the Negus (Bukhari 1245, Muslim 951).`, `The schools that do not permit it regard the case of the Negus as specific to him.`),
        diff(`The martyr in battle`, `Is prayed upon.`, `Is not washed or prayed upon.`, `Is not washed or prayed upon.`, `Is not required to be prayed upon (it is permitted).`),
        scholar(),
      ]),
    ],
  },
  {
    id: 'method', group: `Method`, title: `Step-by-step method`, urdu: `نمازِ جنازہ کا طریقہ`,
    intro: `The funeral prayer has four takbeers, and no ruku, sajdah, adhan or iqamah.`,
    sections: [
      sec(`Steps (Hanafi method)`, [
        steps(
          `Make the intention in your heart: "I pray this funeral prayer for Allah and as a dua for this deceased" (the imam is behind the deceased).`,
          `First takbeer: say "Allahu Akbar", raising the hands to the ears; fold the hands and recite Sana (and, optionally, Ta'awwudh and Bismillah).`,
          `Second takbeer: say "Allahu Akbar" without raising the hands and recite Durood-e-Ibrahimi.`,
          `Third takbeer: say "Allahu Akbar" without raising the hands and recite the dua for the deceased (adult, or child, as appropriate).`,
          `Fourth takbeer: say "Allahu Akbar" (without raising hands), pause a moment.`,
          `Finish with the salam to the right and then to the left, saying "As-salamu alaykum wa rahmatullah".`),
        refs({ ref: `Bukhari 1245, Muslim 951`, text: `The Prophet ﷺ announced the death of the Negus on the day he died, lined up the people and said four takbeers.` }),
        note(`The imam says the takbeers and the salam aloud, and the supplications are silent. The followers say the takbeers and recitations quietly.`),
      ], true),
      sec(`Differences among the schools`, [
        diff(`Number of takbeers`, `Four.`, `Four (five is also permitted by some).`, `Four.`, `Four (up to seven or nine is also reported).`),
        diff(`Surah Al-Fatiha`, `Not recited; Sana is recited after the first takbeer (Fatiha may be recited as a dua).`, `Recited after the first takbeer; it is a pillar.`, `Not recited; the prayer consists of takbeers and dua.`, `Recited after the first takbeer; it is a pillar.`,
          `Ibn Abbas recited Fatiha at a funeral and said it is a Sunnah (Bukhari 1335).`),
        diff(`Raising the hands`, `With the first takbeer only.`, `With each of the four takbeers.`, `With the first takbeer only.`, `With each of the four takbeers (or the first only).`),
        diff(`Salam`, `Two salams.`, `Two salams (one is a pillar).`, `One salam.`, `One salam (a second is permitted).`),
        diff(`Durood after the second takbeer`, `Recited.`, `Recited (a pillar).`, `Recommended.`, `Recited (a pillar).`),
        scholar(`Follow the practice of the imam if you are praying behind him, as long as it is a valid view held by the scholars.`),
      ]),
    ],
  },
  {
    id: 'recitations', group: `Supplications`, title: `Recitations and supplications`, urdu: `دعائیں اور اذکار`,
    intro: `The supplications below are used at each takbeer, according to the school. All are narrated from the Prophet ﷺ except where noted.`,
    sections: [
      sec(`After the first takbeer: Sana`, [
        rec(`Sana`, `Said quietly after the first takbeer (Hanafi). In the Shafi'i and Hanbali schools, Al-Fatiha is recited here instead.`,
          `سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَىٰ جَدُّكَ وَلَا إِلَٰهَ غَيْرُكَ`,
          `Subhanakal-lahumma wa bihamdika wa tabarakasmuka wa ta'ala jadduka wa la ilaha ghayruk.`,
          `اے اللہ! تو پاک ہے اور تیری ہی حمد ہے، تیرا نام بابرکت ہے، تیری شان بلند ہے اور تیرے سوا کوئی معبود نہیں۔`,
          `Glory be to You, O Allah, and praise be to You. Blessed is Your name, exalted is Your majesty, and there is no god but You.`, `Abu Dawud 775, Tirmidhi 243`),
      ], true),
      sec(`After the second takbeer: Durood-e-Ibrahimi`, [
        rec(`Durood-e-Ibrahimi`, `Said after the second takbeer.`,
          `اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ`,
          `Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka hamidum-majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka hamidum-majid.`,
          `اے اللہ! محمد ﷺ اور آلِ محمد پر رحمت نازل فرما جیسا کہ تو نے ابراہیم اور آلِ ابراہیم پر رحمت نازل فرمائی، بے شک تو تعریف کے لائق، بزرگی والا ہے۔ اے اللہ! محمد ﷺ اور آلِ محمد پر برکت نازل فرما جیسا کہ تو نے ابراہیم اور آلِ ابراہیم پر برکت نازل فرمائی، بے شک تو تعریف کے لائق، بزرگی والا ہے۔`,
          `O Allah, send prayers upon Muhammad and the family of Muhammad as You sent prayers upon Ibrahim and the family of Ibrahim; You are Praiseworthy and Glorious. O Allah, bless Muhammad and the family of Muhammad as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy and Glorious.`,
          `Bukhari 3370, Muslim 406`),
      ]),
      sec(`After the third takbeer: dua for an adult`, [
        rec(`Dua for the deceased (taught by the Prophet ﷺ)`, `Said after the third takbeer for an adult deceased. For a woman, replace "lahu/anhu/nuzulahu/mudkhalahu" with "laha/anha/nuzulaha/mudkhalaha" and the pronouns accordingly.`,
          `اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا نَقَّيْتَ الثَّوْبَ الْأَبْيَضَ مِنَ الدَّنَسِ، وَأَبْدِلْهُ دَارًا خَيْرًا مِنْ دَارِهِ، وَأَهْلًا خَيْرًا مِنْ أَهْلِهِ، وَزَوْجًا خَيْرًا مِنْ زَوْجِهِ، وَأَدْخِلْهُ الْجَنَّةَ، وَأَعِذْهُ مِنْ عَذَابِ الْقَبْرِ وَمِنْ عَذَابِ النَّارِ`,
          `Allahummaghfir lahu warhamhu wa 'afihi wa'fu 'anhu, wa akrim nuzulahu, wa wassi' mudkhalahu, waghsilhu bil-ma'i wath-thalji wal-barad, wa naqqihi minal-khataya kama naqqaytath-thawbal-abyada minad-danas, wa abdilhu daran khayran min darihi, wa ahlan khayran min ahlihi, wa zawjan khayran min zawjihi, wa adkhilhul-jannah, wa a'idhhu min 'adhabil-qabri wa min 'adhabin-nar.`,
          `اے اللہ! اسے بخش دے، اس پر رحم فرما، اسے عافیت دے اور اسے معاف کر دے، اس کی مہمانی عزت والی فرما، اس کی قبر کشادہ کر دے، اسے پانی، برف اور اولوں سے دھو دے، اور اسے گناہوں سے ایسا پاک کر دے جیسے سفید کپڑا میل سے صاف کیا جاتا ہے، اسے اس کے گھر سے بہتر گھر، اس کے گھر والوں سے بہتر گھر والے اور اس کے جوڑے سے بہتر جوڑا عطا فرما، اسے جنت میں داخل فرما اور اسے قبر کے عذاب اور آگ کے عذاب سے بچا لے۔`,
          `O Allah, forgive him, have mercy on him, grant him well-being and pardon him. Honour his reception and widen his entrance. Wash him with water, snow and hail, and cleanse him of sins as a white garment is cleansed of dirt. Give him a home better than his home, a family better than his family, and a spouse better than his spouse. Admit him to Paradise and protect him from the punishment of the grave and the punishment of the Fire.`,
          `Muslim 963`),
        rec(`General dua for the living and the dead`, `Commonly recited after the third takbeer, especially in the Hanafi school. It may be recited before the dua above.`,
          `اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا، اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ، وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ`,
          `Allahummaghfir lihayyina wa mayyitina wa shahidina wa gha'ibina wa saghirina wa kabirina wa dhakarina wa unthana. Allahumma man ahyaytahu minna fa-ahyihi 'alal-islam, wa man tawaffaytahu minna fa-tawaffahu 'alal-iman.`,
          `اے اللہ! ہمارے زندہ اور فوت شدہ، حاضر اور غائب، چھوٹے اور بڑے، مرد اور عورت سب کو بخش دے۔ اے اللہ! ہم میں سے جسے تو زندہ رکھے اسے اسلام پر زندہ رکھ، اور جسے وفات دے اسے ایمان پر وفات دے۔`,
          `O Allah, forgive our living and our dead, those present and those absent, our young and our old, our males and our females. O Allah, whomever You keep alive among us, keep him alive upon Islam, and whomever You cause to die among us, cause him to die upon faith.`,
          `Abu Dawud 3201, Tirmidhi 1024, Ibn Majah 1498`),
      ]),
      sec(`Dua for a child`, [
        rec(`Dua for a child (customary wording in Hanafi manuals)`, `Said after the third takbeer when the deceased is a minor. Many Hanafi scholars say it for a boy or girl of the pre-puberty age.`,
          `اللَّهُمَّ اجْعَلْهُ لَنَا فَرَطًا وَاجْعَلْهُ لَنَا أَجْرًا وَذُخْرًا وَاجْعَلْهُ لَنَا شَافِعًا وَمُشَفَّعًا`,
          `Allahummaj'alhu lana faratan waj'alhu lana ajran wa dhukhran waj'alhu lana shafi'an wa mushaffa'a.`,
          `اے اللہ! اسے ہمارے لیے آگے جا کر انتظام کرنے والا بنا، اسے ہمارے لیے اجر اور ذخیرہ بنا، اور اسے ہمارے لیے شفاعت کرنے والا اور مقبولِ شفاعت بنا۔`,
          `O Allah, make him for us a forerunner, make him for us a reward and a treasure, and make him for us an intercessor whose intercession is accepted.`,
          `Customary wording from Hanafi fiqh manuals`),
        rec(`Dua reported from Al-Hasan al-Basri`, `Al-Hasan al-Basri recited Al-Fatiha over a child and said this (mentioned by Al-Bukhari as a comment before hadith 1335).`,
          `اللَّهُمَّ اجْعَلْهُ لَنَا فَرَطًا وَسَلَفًا وَأَجْرًا`,
          `Allahummaj'alhu lana faratan wa salafan wa ajra.`,
          `اے اللہ! اسے ہمارے لیے آگے بھیجا ہوا (سفارش و انتظام کرنے والا)، پیش رو اور اجر بنا۔`,
          `O Allah, make him for us a forerunner, a predecessor and a reward.`,
          `Reported by Al-Bukhari (mu'allaq)`),
        note(`The Shafi'i and Hanbali schools may also add a dua for the parents of the child, asking Allah to make him a cause of their reward.`),
        scholar(`Duas for a miscarried or stillborn child, or for the deceased who are not adults, differ in detail among scholars. Ask a trusted scholar for the specific case.`),
      ]),
      sec(`After the fourth takbeer`, [
        p(`After the fourth takbeer, pause briefly. Some scholars recommend a short dua, such as: "O Allah, do not deprive us of his reward and do not tempt us after him, and forgive us and him" (Ibn Majah 1498). Then say the salam.`),
        rec(`Dua after the fourth takbeer (optional)`, `Optional dua said after the fourth takbeer by some scholars.`,
          `اللَّهُمَّ لَا تَحْرِمْنَا أَجْرَهُ وَلَا تَفْتِنَّا بَعْدَهُ وَاغْفِرْ لَنَا وَلَهُ`,
          `Allahumma la tahrimna ajrahu wa la taftinna ba'dahu waghfir lana wa lah.`,
          `اے اللہ! ہمیں اس کے اجر سے محروم نہ کر، اس کے بعد ہمیں فتنے میں نہ ڈال، اور ہمیں اور اسے بخش دے۔`,
          `O Allah, do not deprive us of his reward, do not put us to trial after him, and forgive us and him.`,
          `Ibn Majah 1498`),
      ]),
    ],
  },
  {
    id: 'imam-congregation', group: `Rulings`, title: `Imam, rows and latecomers`, urdu: `امام، صفیں اور مسبوق`,
    intro: `Rules about who leads the funeral prayer, how rows are arranged, and what a latecomer should do.`,
    sections: [
      sec(`The imam and the rows`, [
        list(`The one most entitled to lead is the ruler or his representative, then the guardian of the deceased (a close relative), as long as he is capable. The deceased's will naming an imam is also respected, by some scholars.`, `The imam stands in front, near the chest of the deceased (Hanafi). The followers stand behind him in rows. Odd numbers of rows are recommended (three or more).`, `Men are in front, then children, then women.`, `The imam says the takbeers aloud and followers repeat them quietly.`),
        diff(`Where the imam stands`, `Opposite the chest of the deceased, male or female.`, `Opposite the head of a male and the middle of a female.`, `At the middle of a male and the shoulders of a female.`, `At the chest of a male and at the middle of a female.`),
      ], true),
      sec(`The latecomer (masbuq)`, [
        steps(`Join the prayer immediately with a takbeer. Do not wait for the next takbeer.`, `Continue with the imam, saying the recitations in order if you can, or what you can.`, `After the imam's salam, say the takbeers that you missed in order. If the deceased may be lifted, the Hanafi school says to recite the takbeers without the supplications, one after another.`, `Then say the salam.`),
        note(`If you arrive after the fourth takbeer and before the imam's salam, the Hanafi school says that you make up the missed takbeers after he finishes. Other schools allow you to join and end with the salam.`),
        scholar(),
      ]),
    ],
  },
  {
    id: 'etiquette', group: `Etiquette`, title: `Etiquette before and after the funeral prayer`, urdu: `جنازے کے آداب`,
    intro: `Respecting the dead and comforting the living are acts of worship.`,
    sections: [
      sec(`Before the prayer`, [
        list(`Attend, and join the funeral procession and burial, as it is among the rights of a Muslim (Bukhari 1240, Muslim 2162).`, `Speak little and well. Avoid wailing, striking the cheeks, tearing clothes or shouting. Weeping silently is permitted (Bukhari 1294, Muslim 103).`, `Make dua for the deceased, and for his family's patience.`),
      ], true),
      sec(`At the burial`, [
        steps(`The body is placed in the grave on its right side facing the Qibla.`, `Say as it is lowered: "Bismillahi wa 'ala millati rasulillah" (Abu Dawud 3213, Tirmidhi 1046).`, `Throw a handful of earth with the dua if you wish; do not sit on the grave or walk over it (Muslim 971).`, `After burial, stand for a short time and ask Allah to keep the deceased firm: the Prophet ﷺ said, "Ask forgiveness for your brother and ask Allah to keep him firm, for he is being questioned now" (Abu Dawud 3221).`),
        note(`The Prophet ﷺ forbade plastering graves, building over them and sitting on them (Muslim 970). Keep the grave simple.`),
      ]),
      sec(`Condolences`, [
        rec(`When hearing of a death or calamity`, `Said at the news of death or any misfortune.`,
          `إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا`,
          `Inna lillahi wa inna ilayhi raji'un. Allahumma'jurni fi musibati wakhluf li khayran minha.`,
          `بے شک ہم اللہ ہی کے ہیں اور ہم اسی کی طرف لوٹنے والے ہیں۔ اے اللہ! مجھے میری مصیبت میں اجر دے اور مجھے اس سے بہتر بدل عطا فرما۔`,
          `Indeed we belong to Allah and to Him we shall return. O Allah, reward me in my affliction and replace it with something better.`,
          `Quran 2:156; Muslim 918`),
        list(`Visit the family, comfort them, and bring them food for the first days; the Prophet ﷺ said, "Prepare food for the family of Jafar, for something has come to them that occupies them" (Abu Dawud 3132, Tirmidhi 998).`, `Condolence is not tied to a specific wording; a kind and sincere dua is enough.`, `The family's period of mourning is three days; a widow mourns four months and ten days (Bukhari 1280, Muslim 938).`),
      ]),
    ],
  },
  {
    id: 'mistakes-faq', group: `Etiquette`, title: `Common mistakes and frequently asked questions`, urdu: `عام غلطیاں اور سوالات`,
    intro: `Answers to common questions about the funeral prayer.`,
    sections: [
      sec(`Common mistakes`, [
        list(`Bowing or prostrating: there is no ruku or sajdah.`, `Saying "Ameen" aloud, or making dua aloud in groups, in a way that disturbs others.`, `Delaying the funeral unnecessarily (the Prophet ﷺ told us to hasten it; Bukhari 1315). Note that burial is also discouraged at sunrise, noon and sunset (Muslim 831).`, `Standing in the rows in a disorderly way, or leaving gaps.`, `Praying at a graveyard without need for those who have not prayed before.`),
      ], true),
      sec(`Questions`, [
        qa({ q: `Do I need an adhan or iqamah?`, a: `No. The funeral prayer has none.` },
          { q: `Can women pray the funeral prayer?`, a: `Yes, women may attend and pray, in rows behind the men. Umm Atiyyah said they were discouraged from following the funeral procession, but it was not made strictly forbidden (Bukhari 1278, Muslim 938).` },
          { q: `Can I pray the funeral prayer in a mosque?`, a: `Yes. The Prophet ﷺ prayed over Suhayl ibn Bayda in the mosque (Muslim 973). The Hanafi school considers it disliked to pray over the deceased inside the mosque unless it is needed.` },
          { q: `Can I pray for someone who died long ago?`, a: `The Prophet ﷺ prayed over a grave after burial (Bukhari 1337, Muslim 954), but only for a limited time. Ask a scholar for particulars.` },
          { q: `What if I miss the whole prayer?`, a: `If you cannot reach it, make dua for the deceased. Some scholars say that you may pray at the grave, if the burial just happened.` }),
        see(`namaz/tashahhud`, `See the Durood-e-Ibrahimi and its recitation in the main prayer.`),
      ]),
    ],
  },
];
