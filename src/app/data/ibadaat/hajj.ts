import { Lesson, check, diff, dua, list, note, p, qa, r, rank, rec, refs, scholar, sec, steps, table } from './model';

/** Hajj. */
export const HAJJ_LESSONS: Lesson[] = [
  {
    id: 'overview', group: `Foundations`, title: `Meaning, importance and obligation`, urdu: `حج کی اہمیت اور فرضیت`,
    intro: `Hajj is the pilgrimage to the Sacred House of Allah in Makkah at the appointed time, performing specific rituals. It is the fifth pillar of Islam.`,
    sections: [
      sec(`The obligation`, [
        refs({ ref: `Quran 3:97`, text: `And [due] to Allah from the people is a pilgrimage to the House – for whoever is able to find thereto a way.` },
          { ref: `Quran 22:27`, text: `And proclaim to the people the Hajj; they will come to you on foot and on every lean camel.` },
          { ref: `Muslim 1337`, text: `The Prophet ﷺ said: "O people, Allah has made Hajj obligatory upon you, so perform Hajj." A man asked: "Every year?" He remained silent, then said: "If I said yes, it would be obligatory, and you would not be able to do it."` }),
        p(`Hajj is obligatory once in a lifetime for every Muslim who meets the conditions. Anything more is a voluntary act.`),
      ], true),
      sec(`Virtue`, [
        refs({ ref: `Bukhari 1521, Muslim 1350`, text: `Whoever performs Hajj for Allah and does not commit obscenity or transgression will return as on the day his mother bore him.` },
          { ref: `Bukhari 1773, Muslim 1349`, text: `An accepted Hajj has no reward but Paradise.` }),
      ]),
      sec(`How the schools classify the acts of Hajj`, [
        diff(`Pillars (arkan/fard) of Hajj`, `Ihram, Wuquf at Arafah, Tawaf al-Ziyarah (Ifadah). Sa'i is Wajib.`, `Ihram, Wuquf at Arafah, Tawaf al-Ifadah, Sa'i, shaving or trimming, and the order of the main rites.`, `Ihram, Wuquf at Arafah, Tawaf al-Ifadah, Sa'i.`, `Ihram, Wuquf at Arafah, Tawaf al-Ifadah, Sa'i.`,
          `Missing a pillar invalidates the Hajj. Missing a Wajib requires a compensation (dam/sacrifice).`),
        scholar(`The classification determines what must be repeated and what can be compensated. Consult an experienced scholar of your school or your Hajj group's scholar for the rites.`),
      ]),
    ],
  },
  {
    id: 'eligibility', group: `Foundations`, title: `Eligibility and requirements`, urdu: `حج کی شرائط`,
    intro: `Hajj is obligatory for someone who has the means and ability. Understanding the conditions prevents mistakes.`,
    sections: [
      sec(`Conditions`, [
        rank(r(`fard`, `Islam, sanity and puberty.`), r(`fard`, `Freedom (not enslaved).`), r(`fard`, `Financial ability: provisions and transport beyond one's debts and the needs of one's dependants for the period of the trip.`),
          r(`fard`, `Physical ability and safety of the route.`), r(`fard`, `For women: a husband or a mahram to travel with (the Hanafi and Hanbali schools); the Shafi'i and Maliki schools allow safe company of trustworthy women, according to some scholars.`)),
        refs({ ref: `Bukhari 1862, Muslim 1341`, text: `A woman should not travel except with a mahram.` }),
      ], true),
      sec(`Related rulings`, [
        qa({ q: `Can someone perform Hajj on behalf of another?`, a: `Yes, for someone who is unable (permanently ill or elderly), if the representative has performed his own Hajj first (Bukhari 1513, Muslim 1334).` },
          { q: `Can I postpone Hajj?`, a: `The Hanafi and Hanbali schools say that it should be performed immediately once it is obligatory; the Shafi'i school allows delay but warns against procrastination.` },
          { q: `Does a child's Hajj count?`, a: `A child's Hajj is valid and rewarded but does not remove the obligation after puberty (Muslim 1336).` }),
      ]),
    ],
  },
  {
    id: 'preparation', group: `Foundations`, title: `Preparation and travel checklist`, urdu: `حج کی تیاری`,
    intro: `Good preparation of the heart, finances, knowledge and body helps make Hajj accepted and easy.`,
    sections: [
      sec(`Spiritual and practical preparation`, [
        list(`Make your intention sincere for Allah alone, and avoid showing off.`, `Use halal money only; pay your debts, return what you owe and write a will (Bukhari 2738).`, `Repent, seek forgiveness and settle disputes.`, `Learn the rites: take a Hajj course, a trusted book, or this guide.`, `Choose a righteous companion and a reliable group.`, `Be patient with others: Hajj is full of crowds and tests (Quran 2:197: no obscenity, no wickedness, no quarrelling).`),
      ], true),
      sec(`Packing and arrangements`, [
        check(`Passport, visa and Hajj permit/booking documents`, `Required vaccinations and medical documents`, `Ihram clothes (men) and modest loose clothes (women)`, `Unscented toiletries`, `Comfortable footwear and a small bag`, `Prescription medicine and first-aid items`, `Sun protection and water bottle`, `Phone, charger and emergency contacts`, `Copies of the rites and duas`, `Cash for expenses and sacrifice, if needed`),
      ]),
    ],
  },
  {
    id: 'types', group: `Foundations`, title: `Types of Hajj: Ifrad, Qiran, Tamattu'`, urdu: `حج کی اقسام`,
    intro: `There are three ways to perform Hajj. Aisha reported that some of the companions entered Ihram for Hajj alone, some for Umrah and Hajj together, and some for Umrah only (Bukhari 1562, Muslim 1211).`,
    sections: [
      sec(`The three types`, [
        table([`Type`, `Description`, `Sacrifice (Hady)`],
          [`Ifrad`, `Hajj only. Ihram is for Hajj, and you remain in Ihram until the 10th of Dhul-Hijjah.`, `Not required.`],
          [`Qiran`, `Umrah and Hajj together with one Ihram. You remain in Ihram until the 10th.`, `Required.`],
          [`Tamattu'`, `Umrah first, then exit Ihram and enter a new Ihram for Hajj on the 8th of Dhul-Hijjah.`, `Required.`]),
        refs({ ref: `Quran 2:196`, text: `Whoever performs Umrah and then Hajj, let him offer what is easy of sacrificial animals. And whoever cannot, then a fast of three days during Hajj and of seven when you have returned.` }),
      ], true),
      sec(`Which is best?`, [
        diff(`The best type`, `Qiran.`, `Ifrad.`, `Ifrad.`, `Tamattu'.`, `The Prophet ﷺ was in a state of Qiran (Bukhari 1551), and he told those who had no animal to convert to Tamattu' (Muslim 1218).`),
        note(`Most pilgrims from outside the Hijaz perform Tamattu' because it is easy. Qiran and Tamattu' are for those who do not live in Makkah.`),
      ]),
    ],
  },
  {
    id: 'miqat-ihram', group: `Ihram`, title: `Miqat and entering Ihram`, urdu: `میقات اور احرام`,
    intro: `Ihram is the state of consecration entered by intending Hajj or Umrah at the miqat. It is a pillar of Hajj.`,
    sections: [
      sec(`The miqats`, [
        table([`Miqat`, `For pilgrims coming from`],
          [`Dhul-Hulayfah (Abyar Ali)`, `Madinah and those coming by its route`],
          [`Al-Juhfah (near Rabigh)`, `Syria, Egypt, North Africa`],
          [`Qarn al-Manazil (As-Sayl al-Kabir)`, `Najd and Taif`],
          [`Yalamlam`, `Yemen`],
          [`Dhat Irq`, `Iraq and the East`]),
        refs({ ref: `Bukhari 1524, Muslim 1181`, text: `The Prophet ﷺ set the miqats; they are for the people of those places and for those who pass by them intending Hajj or Umrah.` }),
        note(`Pilgrims travelling by air must enter Ihram before they pass the miqat's line in the air. Prepare in advance and make the intention when the crew announces it.`, `warn`),
      ], true),
      sec(`How to enter Ihram`, [
        steps(`Trim the nails and remove unwanted hair, and take a bath (ghusl) – a Sunnah.`, `Men: wear two clean white unstitched sheets (izar and rida). Women: wear ordinary modest clothes.`, `Perfume the body before the intention, if you wish (Bukhari 1539, Muslim 1189); do not perfume the Ihram clothes.`, `Pray two rak'ahs of Sunnah (if it is not a forbidden time).`, `Make the intention: "Labbayka Hajjan" (Ifrad), "Labbayka Umratan" (Umrah), or "Labbayka Umratan wa Hajjan" (Qiran).`, `Recite the Talbiyah, men aloud and women quietly.`),
        diff(`Ihram clothing`, `Men: unstitched garments; head uncovered. Women: usual clothing; face uncovered, no gloves.`, `The same.`, `The same.`, `The same.`),
      ]),
      sec(`Talbiyah`, [
        dua(`talbiyah`, `Recite often from the time of Ihram until you start stoning on the 10th (for Hajj).`),
        refs({ ref: `Bukhari 1549, Muslim 1184`, text: `The Talbiyah of the Prophet ﷺ.` }),
      ]),
    ],
  },
  {
    id: 'ihram-prohibitions', group: `Ihram`, title: `Prohibitions of Ihram and their consequences`, urdu: `احرام کی پابندیاں`,
    intro: `While in Ihram, several lawful things become forbidden. Some require compensation if done.`,
    sections: [
      sec(`For men and women`, [
        rank(r(`haram`, `Cutting or removing hair, and clipping the nails.`), r(`haram`, `Using perfume or scented soap and lotion.`), r(`haram`, `Hunting land animals or helping someone to hunt.`),
          r(`haram`, `Marital relations and anything that leads to it, such as kissing, and the marriage contract or proposal (Muslim 1409).`), r(`haram`, `Quarrelling and disobedience (Quran 2:197).`)),
      ], true),
      sec(`For men only`, [
        rank(r(`haram`, `Wearing stitched clothes (shirt, trousers, underwear and socks).`), r(`haram`, `Covering the head.`)),
        note(`A man may use an umbrella or sit under a roof or tent. He may wear sandals or slippers that leave the ankles uncovered, and wear a belt for money.`),
      ]),
      sec(`For women only`, [
        rank(r(`haram`, `Wearing the niqab or face covering and gloves (Bukhari 1838). She should cover her face from strange men by drawing her headscarf forward without touching her face.`)),
      ]),
      sec(`Compensation for violations`, [
        p(`Allah says about harm that requires shaving the head: "a ransom of fasting, charity or sacrifice" (Quran 2:196). The Prophet ﷺ told Ka'b ibn Ujrah to either fast three days, feed six poor people, or sacrifice a sheep (Bukhari 1814, Muslim 1201).`),
        table([`Violation`, `General ruling`],
          [`Cutting hair or nails, using perfume, covering the head, wearing stitched clothes`, `Fidyah: fast three days, or feed six poor people, or sacrifice a sheep (details differ by school)`],
          [`Marital relations before the first tahallul`, `The Hajj is invalidated according to the majority; the pilgrim completes it, sacrifices an animal and repeats the Hajj later`],
          [`Hunting`, `Compensation with an equivalent animal, or its value in food, or fasting (Quran 5:95)`]),
        scholar(`Compensations differ between schools, and between intentional and accidental violations. Ask a qualified scholar on the spot and do not delay.`),
      ]),
    ],
  },
  {
    id: 'journey', group: `Rites`, title: `Hajj journey in chronological order`, urdu: `حج کے دن بہ دن اعمال`,
    intro: `This overview follows the Hajj of the Prophet ﷺ as described by Jabir (Muslim 1218), day by day. Each step has its own lesson.`,
    sections: [
      sec(`Chronology`, [
        table([`Day`, `Where`, `What you do`],
          [`Before the 8th`, `Makkah`, `Tamattu' pilgrims: complete Umrah, exit Ihram. Qiran/Ifrad: Tawaf al-Qudum, optional.`],
          [`8th Dhul-Hijjah (Yawm at-Tarwiyah)`, `Mina`, `Enter Ihram for Hajj (Tamattu'). Go to Mina; pray Zuhr, Asr, Maghrib, Isha and Fajr there, each at its time (shortened).`],
          [`9th (Day of Arafah)`, `Arafah`, `After sunrise go to Arafah. Remain until sunset (Wuquf). Make dua. Leave after sunset for Muzdalifah.`],
          [`Night of the 10th`, `Muzdalifah`, `Pray Maghrib and Isha together at Muzdalifah. Sleep and collect pebbles. Pray Fajr and make dua until it is bright.`],
          [`10th (Eid)`, `Mina / Makkah`, `Stone Jamrat al-Aqabah (7 pebbles), sacrifice, shave or trim (first tahallul). Go to Makkah for Tawaf al-Ifadah and Sa'i.`],
          [`11th and 12th (and 13th)`, `Mina`, `Stone the three Jamarat after Zawal each day. May leave on the 12th before sunset; staying till the 13th is better.`],
          [`Before leaving Makkah`, `Makkah`, `Tawaf al-Wada (farewell).`]),
        refs({ ref: `Muslim 1218`, text: `The long hadith of Jabir ibn Abdullah describing the Hajj of the Prophet ﷺ.` }),
      ], true),
      sec(`Chronological checklist`, [
        check(`Ihram from the miqat and Talbiyah`, `Tawaf and Sa'i (Umrah for Tamattu')`, `8th: Ihram for Hajj and go to Mina`, `9th: Wuquf at Arafah until sunset`, `Muzdalifah: Maghrib and Isha, night stay, Fajr, pebbles`, `10th: Stone Jamrat al-Aqabah`, `10th: Sacrifice`, `10th: Shave or trim`, `Tawaf al-Ifadah and Sa'i`, `11th: Stone three Jamarat`, `12th: Stone three Jamarat (and leave, or stay for 13th)`, `Tawaf al-Wada`),
      ]),
    ],
  },
  {
    id: 'tawaf', group: `Rites`, title: `Arrival in Makkah and Tawaf`, urdu: `طواف`,
    intro: `Tawaf is circling the Kaaba seven times, starting and ending at the Black Stone, with the Kaaba on your left.`,
    sections: [
      sec(`Conditions and method`, [
        steps(`Have wudu (purity from major and minor impurity is required by the majority; the Hanafi school requires it as a Wajib).`, `Cover the awrah. Men in Ihram expose the right shoulder (idtiba') in the Tawaf of arrival, and walk briskly (raml) in the first three rounds (Bukhari 1603, Muslim 1261).`, `Begin at the Black Stone. Face it, say "Bismillah, Allahu Akbar" and, if possible, touch (istilam) or point towards it with your hand, without pushing or harming anyone.`, `Keep the Kaaba on your left. Complete seven rounds, including outside the Hijr (the semicircular wall), because it is part of the Kaaba (Bukhari 1584).`, `Between the Yemeni corner and the Black Stone say: "Rabbana atina fid-dunya hasanah..." (Quran 2:201).`, `After seven rounds, cover the right shoulder, pray two rak'ahs behind Maqam Ibrahim if possible (or elsewhere in the mosque), reciting Surah Al-Kafirun and Al-Ikhlas (Muslim 1218).`, `Drink Zamzam, and then go to Safa for Sa'i.`),
        dua(`q-hasanah`, `Said between the Yemeni corner and the Black Stone (Abu Dawud 1892).`),
      ], true),
      sec(`Types of Tawaf`, [
        list(`Tawaf al-Qudum (arrival): Sunnah for Ifrad and Qiran pilgrims.`, `Tawaf al-Umrah: pillar of Umrah (for Tamattu').`, `Tawaf al-Ifadah (Ziyarah): pillar of Hajj, after Arafah (see lesson).`, `Tawaf al-Wada (farewell): Wajib for pilgrims leaving Makkah.`, `Voluntary Tawaf: at any time.`),
        note(`Kissing or touching the Black Stone is a Sunnah only if it can be done without harm. Do not push; pointing is enough. "You are a stone which neither harms nor benefits; if I had not seen the Prophet ﷺ kiss you, I would not have kissed you" – Umar (Bukhari 1597, Muslim 1270).`, `warn`),
        note(`Tawaf is valid only within the Masjid al-Haram. Those who cannot walk may be carried or use a wheelchair, as the Prophet ﷺ himself performed Tawaf riding when he was weak or the crowds were great.`),
      ]),
    ],
  },
  {
    id: 'sai', group: `Rites`, title: `Sa'i between Safa and Marwah`, urdu: `سعی`,
    intro: `Sa'i is walking between the hills of Safa and Marwah, remembering the struggle of Hajar for her son Ismail.`,
    sections: [
      sec(`Method`, [
        steps(`Go to Safa. Recite "Inna as-Safa wal-Marwata min sha'a'irillah" (Quran 2:158), and say "Abda'u bima bada'allahu bih" (I begin with what Allah began with) (Muslim 1218).`, `Face the Kaaba, raise your hands and say "Allahu Akbar" three times and the dua below, and make your own dua.`, `Walk to Marwah (this is the first lap). Men run lightly between the green markers.`, `At Marwah, face the Kaaba and say the same remembrance as at Safa. This is the second lap, back to Safa.`, `Complete seven laps, ending at Marwah.`),
        rec(`Remembrance on Safa and Marwah`, `Said facing the Kaaba, three times, with dua in between.`,
          `لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ`,
          `La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir. La ilaha illallahu wahdah, anjaza wa'dah, wa nasara 'abdah, wa hazamal-ahzaba wahdah.`,
          `اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کی بادشاہی ہے اور اسی کی تعریف ہے اور وہ ہر چیز پر قادر ہے۔ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس نے اپنا وعدہ پورا کیا، اپنے بندے کی مدد کی اور اکیلے ہی لشکروں کو شکست دی۔`,
          `There is no god but Allah alone, He has no partner. His is the dominion and His is the praise, and He is over all things capable. There is no god but Allah alone; He fulfilled His promise, aided His servant and defeated the confederates alone.`, `Muslim 1218`),
        dua(`safa-marwa`, `Recited when approaching Safa the first time.`),
      ], true),
      sec(`Rulings`, [
        diff(`Status of Sa'i`, `Wajib; if missed, a sacrifice is due.`, `A pillar of Hajj and Umrah.`, `A pillar of Hajj and Umrah.`, `A pillar of Hajj and Umrah.`),
        list(`Sa'i must come after a Tawaf.`, `Wudu is recommended, but most scholars do not require it for Sa'i.`, `Women walk normally and do not run.`, `The sick and elderly may use a wheelchair.`, `Pause for prayer if the iqamah is called, and then resume.`),
      ]),
    ],
  },
  {
    id: 'mina-arafat-muzdalifah', group: `Rites`, title: `Mina, Arafat and Muzdalifah`, urdu: `منیٰ، عرفات اور مزدلفہ`,
    intro: `The days of Hajj are spent between three sacred places: Mina, Arafat and Muzdalifah.`,
    sections: [
      sec(`8th: Mina`, [
        steps(`In Ihram for Hajj (for Tamattu'), go to Mina before or after Zuhr on the 8th.`, `Pray Zuhr, Asr, Maghrib, Isha and Fajr in Mina, each at its time, shortening the four-rak'ah prayers.`, `Spend the time in dhikr, dua and rest.`),
        note(`Staying in Mina on the 8th is a Sunnah.`),
      ], true),
      sec(`9th: Wuquf at Arafat`, [
        steps(`After sunrise, go to Arafat. Be sure that you are inside the boundaries (the Masjid Namirah's front is outside).`, `Pray Zuhr and Asr combined and shortened, at the time of Zuhr, with the imam (Muslim 1218).`, `Spend the afternoon until sunset in dhikr, dua, tears and repentance, facing the Qibla with raised hands.`, `Do not leave before sunset.`),
        refs({ ref: `Muslim 1348`, text: `There is no day on which Allah frees more servants from the Fire than the Day of Arafah.` },
          { ref: `Tirmidhi 3585`, text: `The best dua is the dua on the Day of Arafah, and the best of what I and the prophets before me said: "La ilaha illallahu wahdahu la sharika lah…"` }),
        dua(`arafah`, `The best dua on the Day of Arafah.`),
        diff(`Wuquf at Arafat`, `Time: after Zawal until sunset (pillar: being there at any time between Zawal and dawn of the 10th; leaving before sunset requires a sacrifice).`, `Pillar: being present at any time from Zawal until the dawn of the 10th.`, `Pillar: being present for part of the night; the day Wuquf until sunset is obligatory.`, `Pillar: being present at any time from dawn of the 9th to dawn of the 10th; staying until sunset is obligatory for the one who arrived in the day.`),
        scholar(`The pillar is simply being at Arafah in its time. Anyone who misses it has missed the Hajj (Abu Dawud 1949, Tirmidhi 889: "Hajj is Arafah").`),
      ]),
      sec(`Night of the 10th: Muzdalifah`, [
        steps(`After sunset, leave Arafat calmly for Muzdalifah. Do not pray Maghrib at Arafat.`, `At Muzdalifah, pray Maghrib and Isha combined (Isha shortened) with one adhan and two iqamahs (Muslim 1218).`, `Collect 7 pebbles for the Jamrat al-Aqabah (some collect 70 for the days to come; they can also be collected at Mina). Washing them is not necessary.`, `Sleep, wake for Fajr, pray it early, then make dhikr and dua facing the Qibla at Al-Mash'ar al-Haram until it is bright.`, `Leave for Mina before sunrise.`),
        diff(`Staying at Muzdalifah`, `Wajib: Wuquf after dawn until before sunrise.`, `Wajib to be present after midnight; staying until Fajr is a Sunnah.`, `Wajib to descend and stay for the time it takes to pray Maghrib and Isha, according to the school.`, `Wajib to stay until after midnight; staying until Fajr is a Sunnah.`),
        note(`The weak, elderly, women and those caring for them may leave after midnight (Bukhari 1679, Muslim 1290).`),
      ]),
    ],
  },
  {
    id: 'rami', group: `Rites`, title: `Rami al-Jamarat (stoning)`, urdu: `رمی جمرات`,
    intro: `Stoning the Jamarat recalls Ibrahim ﷺ, who stoned Satan at these places. Its purpose is the remembrance of Allah (Abu Dawud 1888, Tirmidhi 902).`,
    sections: [
      sec(`The day of Eid (10th)`, [
        steps(`Stone only Jamrat al-Aqabah (the large one) with seven pebbles, each about the size of a chickpea.`, `Throw them one at a time, saying "Allahu Akbar" with each.`, `Time: after sunrise is the Sunnah (Muslim 1299). The Shafi'i and Hanbali schools allow it after midnight for the weak; the Hanafi school allows it from dawn (Fajr).`, `Stop the Talbiyah when throwing the first pebble (Bukhari 1685).`),
      ], true),
      sec(`The 11th, 12th (and 13th)`, [
        steps(`Stone all three Jamarat each day after Zawal (the sun passes its zenith) (Bukhari 1746).`, `Start with Jamrat as-Sughra (the first, nearest Masjid al-Khayf), then al-Wusta, then al-Aqabah, with seven pebbles each, saying "Allahu Akbar" with each pebble.`, `After the first and second, move aside, face the Qibla and make a long dua (Bukhari 1751). Do not make dua after the third.`, `On the 12th, you may leave Mina before sunset; if the sun sets while you are in Mina, stay for the 13th (Quran 2:203).`),
        note(`Stone the pebbles themselves; do not throw shoes or large stones. Do not injure people or rush into crowds. Take pebbles from Muzdalifah or from Mina; they are not needed to be washed.`, `warn`),
        qa({ q: `Who may delegate the stoning?`, a: `A person who cannot do it (illness, old age, pregnancy and the like) may appoint a representative, who stones for himself first and then for him.` }),
      ]),
    ],
  },
  {
    id: 'qurbani-halq', group: `Rites`, title: `Qurbani (Hady), Halq and Taqsir`, urdu: `قربانی، حلق اور تقصیر`,
    intro: `On the 10th the pilgrim sacrifices an animal, if required, and shaves or trims his hair.`,
    sections: [
      sec(`Sacrifice (Hady)`, [
        list(`Obligatory for those performing Qiran or Tamattu' (Quran 2:196). Not obligatory for Ifrad.`, `An animal: one sheep or goat, or one-seventh of a camel or cow.`, `Time: from the 10th until the end of the days of Tashreeq (Hanafi: the 10th to the 12th; Shafi'i: until the 13th).`, `Place: within the Haram boundaries (Mina or Makkah). Many use the authorised sacrifice service.`, `If you cannot afford an animal: fast three days during Hajj (before Arafah) and seven after returning home (Quran 2:196).`),
        scholar(`Make sure that the sacrifice is done at the correct time and place, and by a trusted organisation. Eating from it is recommended (Quran 22:28).`),
      ], true),
      sec(`Halq and Taqsir`, [
        refs({ ref: `Bukhari 1727, Muslim 1301`, text: `May Allah have mercy on those who shave their heads. They said: And those who trim? He said: May Allah have mercy on those who shave... and those who trim.` },
          { ref: `Abu Dawud 1984`, text: `There is no shaving for women; they only trim.` }),
        steps(`Men: shave the whole head (better) or trim the hair evenly.`, `Women: cut a fingertip length (about 2 cm) from the ends of the hair.`, `After this, you come out of the first stage of Ihram (tahallul al-awwal): everything is permitted except marital relations.`),
        note(`The order of the rites on the 10th (stone, sacrifice, shave, Tawaf) is a Sunnah, but if someone changed the order out of forgetfulness or ignorance, the Prophet ﷺ said "No harm" (Bukhari 83, Muslim 1306).`),
      ]),
    ],
  },
  {
    id: 'ifadah-wada', group: `Rites`, title: `Tawaf al-Ifadah and Tawaf al-Wada`, urdu: `طوافِ زیارت اور طوافِ وداع`,
    intro: `After Arafah and Muzdalifah, the pilgrim returns to Makkah to perform the Tawaf which completes the pillars of Hajj, and later a farewell Tawaf.`,
    sections: [
      sec(`Tawaf al-Ifadah (also called Tawaf az-Ziyarah)`, [
        p(`This is a pillar of Hajj by consensus. It is performed after the stoning, sacrifice and shaving on the 10th, or later. "Then let them complete their rites and fulfil their vows, and perform Tawaf around the ancient House" (Quran 22:29).`),
        steps(`Perform Tawaf with the same conditions as any Tawaf (7 rounds, wudu, outside the Hijr).`, `Pray two rak'ahs behind the Maqam.`, `Perform Sa'i if you are a Tamattu' pilgrim, or if you are in Ifrad or Qiran and did not do Sa'i after Tawaf al-Qudum.`),
        diff(`Time of Tawaf al-Ifadah`, `From the dawn of the 10th; delaying it beyond the 12th requires a sacrifice.`, `From midnight of the night of the 10th, with no end in time, though delay is disliked.`, `From the dawn of the 10th until the end of Dhul-Hijjah; delaying beyond requires a sacrifice.`, `From midnight of the night of the 10th; no fixed end.`),
        note(`After this Tawaf, all the restrictions of Ihram, including marital relations, are lifted (tahallul al-akbar).`),
      ], true),
      sec(`Tawaf al-Wada (farewell)`, [
        refs({ ref: `Muslim 1327`, text: `Let none of you depart until his last act is at the House.` },
          { ref: `Bukhari 1755, Muslim 1328`, text: `The people were ordered to make their last act the Tawaf at the House, but this was relaxed for the menstruating woman.` }),
        diff(`Ruling`, `Wajib for those who live outside Makkah.`, `Wajib.`, `Mustahabb (recommended).`, `Wajib.`, `A woman in menses or postnatal bleeding is excused (Bukhari 1755).`),
        note(`The farewell Tawaf should be the last thing you do in Makkah, apart from necessary short tasks.`),
      ]),
    ],
  },
  {
    id: 'duas', group: `Duas`, title: `Essential duas of Hajj`, urdu: `حج کی اہم دعائیں`,
    intro: `The duas here are the main remembrances that the Prophet ﷺ taught for the rites of Hajj. Add your own supplications in your own language at each place.`,
    sections: [
      sec(`Talbiyah and Ihram`, [dua(`talbiyah`, `From the time of Ihram until stoning on the 10th.`)], true),
      sec(`Tawaf`, [dua(`q-hasanah`, `Between the Yemeni corner and the Black Stone.`), dua(`q-accept`, `A dua of Ibrahim and Ismail while building the Kaaba (Quran 2:127).`)]),
      sec(`Sa'i`, [dua(`safa-marwa`, `On approaching Safa.`)]),
      sec(`Arafah`, [dua(`arafah`, `The best dua on the Day of Arafah.`), dua(`sayyid-istighfar`, `A comprehensive prayer for forgiveness.`)]),
    ],
  },
  {
    id: 'mistakes', group: `Guidance`, title: `Common mistakes during Hajj`, urdu: `حج کی عام غلطیاں`,
    intro: `Many pilgrims make the same avoidable mistakes. Review them before you travel.`,
    sections: [
      sec(`Mistakes to avoid`, [
        list(
          `Crossing the miqat without Ihram (especially by air).`,
          `Pushing and harming others while trying to touch the Black Stone or to pray near it.`,
          `Walking through the Hijr during Tawaf; this makes that round invalid.`,
          `Leaving Arafat before sunset, or praying Maghrib at Arafat.`,
          `Staying outside the boundaries of Arafat.`,
          `Throwing large stones, shoes or other items at the Jamarat.`,
          `Stoning in the forbidden time or leaving the three Jamarat order.`,
          `Sacrificing before the time or in the wrong place.`,
          `Cutting only a few hairs, instead of the whole head (men).`,
          `Leaving Makkah without the farewell Tawaf.`,
          `Arguing, losing patience or showing off.`,
          `Cutting hair, using perfume or doing other prohibited acts in Ihram out of ignorance.`),
        note(`If you make a mistake, ask a scholar from your group immediately. Some mistakes can be compensated easily if corrected in time.`),
      ], true),
      sec(`FAQs`, [
        qa({ q: `Is Hajj valid if I did not perform the Tawaf al-Qudum?`, a: `Yes. It is a Sunnah, not a pillar.` },
          { q: `May I put on the Ihram before reaching the miqat?`, a: `Yes, but you must not cross the miqat without the intention. Intention and Talbiyah are made at the miqat or just before it.` },
          { q: `Can I swap Hajj types after I arrive?`, a: `The Prophet ﷺ told those with no animal to turn their Ihram into Umrah (Tamattu'). Consult your guide for the details.` }),
      ]),
    ],
  },
];
