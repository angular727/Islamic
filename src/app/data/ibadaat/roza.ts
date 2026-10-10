import { Lesson, check, diff, dua, list, note, p, qa, r, rank, rec, refs, scholar, sec, steps, table } from './model';

/** Fasting (Roza / Sawm). */
export const ROZA_LESSONS: Lesson[] = [
  {
    id: 'meaning-virtues', group: 'Foundations', title: `Meaning, importance and virtues`, urdu: `روزے کی اہمیت اور فضیلت`,
    intro: `Fasting (sawm) is the fourth pillar of Islam. It trains the believer in patience, gratitude, self-control and consciousness of Allah (taqwa).`,
    sections: [
      sec(`What is fasting?`, [
        p(`Sawm literally means to hold back. In Islamic law it means abstaining from food, drink and marital relations from the true dawn (Fajr) until sunset, with the intention of worshipping Allah.`),
        refs({ ref: `Quran 2:183`, text: `O you who believe, fasting has been prescribed for you as it was prescribed for those before you, that you may attain taqwa.` },
          { ref: `Quran 2:185`, text: `The month of Ramadan in which the Quran was revealed as guidance for mankind… so whoever sights the month, let him fast it.` }),
      ], true),
      sec(`Virtues`, [
        refs(
          { ref: `Bukhari 1904, Muslim 1151`, text: `Allah said: "Every deed of the son of Adam is for him except fasting. It is for Me and I shall reward it."` },
          { ref: `Bukhari 1896, Muslim 1152`, text: `In Paradise there is a gate called Ar-Rayyan; only those who fast will enter it.` },
          { ref: `Bukhari 38, Muslim 760`, text: `Whoever fasts Ramadan out of faith and seeking reward, his past sins will be forgiven.` },
          { ref: `Bukhari 1894, Muslim 1151`, text: `Fasting is a shield.` }),
        note(`The value of fasting is not only in leaving food, but in leaving sin. "Whoever does not give up false speech and acting upon it, Allah has no need of him giving up his food and drink" (Bukhari 1903).`, `warn`),
      ]),
    ],
  },
  {
    id: 'ramadan', group: `Foundations`, title: `Ramadan fasting and its requirements`, urdu: `رمضان کے روزے`,
    intro: `Fasting the month of Ramadan is obligatory (fard) upon every Muslim who meets the conditions below.`,
    sections: [
      sec(`Conditions that make fasting obligatory`, [
        rank(r(`fard`, `Islam.`), r(`fard`, `Reaching puberty (children are not obliged, but should be encouraged).`), r(`fard`, `Sanity.`), r(`fard`, `Ability: those who are ill or too weak are exempt (see Exemptions).`), r(`fard`, `Being resident: travellers are allowed to postpone.`), r(`fard`, `For women: being free from menstruation and postnatal bleeding.`)),
      ], true),
      sec(`Beginning and ending the month`, [
        p(`The Prophet ﷺ said: "Fast when you see it (the crescent) and break your fast when you see it. If it is hidden, complete thirty days of Sha'ban" (Bukhari 1909, Muslim 1081). The month has 29 or 30 days.`),
        scholar(`Scholars differ on whether one local sighting applies to the whole world or each region follows its own. Follow the announcement of the trusted authority in your country or community.`),
      ]),
      sec(`Time of the fast`, [
        list(`Starts: true dawn, when the white thread of dawn becomes distinct from the darkness (Quran 2:187).`, `Ends: when the sun has fully set. Break the fast then, without delay (Bukhari 1954, Muslim 1100).`),
        note(`Use a trusted local Sehri/Iftar timetable. The Prayer Times page of this app shows Fajr and Maghrib for your location.`),
      ]),
    ],
  },
  {
    id: 'niyyah', group: `Daily Guide`, title: `Intention (Niyyah)`, urdu: `روزے کی نیت`,
    intro: `Intention is a condition for a valid fast. It is an act of the heart: you decide to fast for the sake of Allah.`,
    sections: [
      sec(`Rulings on the intention`, [
        refs({ ref: `Bukhari 1, Muslim 1907`, text: `Actions are only by intentions.` },
          { ref: `Abu Dawud 2454, Tirmidhi 730`, text: `Whoever does not intend the fast before dawn has no fast. (Applied to obligatory fasts.)` }),
        diff(`When is the intention made?`,
          `For Ramadan, the intention may be made at night, or during the day before midday (before the sun passes its zenith), if nothing breaking the fast has been done.`,
          `The intention must be made at night (before Fajr) for each obligatory fast.`,
          `A single intention at the start of Ramadan (the night before the first day) is enough for the whole month; renewing it nightly is recommended.`,
          `The intention must be made at night for each fast (some Hanbali scholars accept a single intention for the month).`),
        note(`If you wake at the time of Sehri, your decision to eat the meal in order to fast is already an intention. You do not need to say any words.`),
      ], true),
      sec(`Wording some people use`, [
        rec(`Customary wording of intention`, `A customary wording used in South Asia. It is not narrated from the Prophet ﷺ and is not required; the intention in the heart is enough.`,
          `وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ`, `Wa bisawmi ghadin nawaytu min shahri ramadan`, `میں نے ماہِ رمضان کے کل کے روزے کی نیت کی۔`, `I intend to fast tomorrow from the month of Ramadan.`, `Customary; not from a hadith`),
      ]),
    ],
  },
  {
    id: 'sehri', group: `Daily Guide`, title: `Sehri (Suhoor)`, urdu: `سحری`,
    intro: `Sehri is the pre-dawn meal. It is a Sunnah with great blessing.`,
    sections: [
      sec(`Virtue and timing`, [
        refs({ ref: `Bukhari 1923, Muslim 1095`, text: `Take suhoor, for in suhoor there is blessing.` },
          { ref: `Abu Dawud 2345`, text: `What a good suhoor of the believer: dates. (graded hasan)` },
          { ref: `Quran 2:187`, text: `Eat and drink until the white thread of dawn becomes distinct from the black thread.` }),
        list(`Eat towards the end of the night; the Prophet ﷺ ate just before Fajr (Bukhari 1921).`, `Stop eating at the Fajr time. If you hear the adhan while holding a glass, you may drink it, according to some scholars. Follow a trusted timetable.`),
        note(`A small meal such as dates and water is enough. Sehri is valid even if it is a drink.`),
      ], true),
      sec(`Is there a dua for Sehri?`, [
        p(`There is no authentic dua specifically narrated for Sehri. Say Bismillah before eating, and make the intention of fasting.`),
        dua(`before-eating`, `Say Bismillah before eating.`),
      ]),
    ],
  },
  {
    id: 'iftar', group: `Daily Guide`, title: `Iftar and its supplications`, urdu: `افطار اور دعا`,
    intro: `Iftar is the breaking of the fast at sunset. Hasten to it; the Prophet ﷺ said the people will remain in good as long as they hasten to break the fast (Bukhari 1957, Muslim 1098).`,
    sections: [
      sec(`Sunnah of iftar`, [
        steps(`Break the fast as soon as the sun has set (the time of the Maghrib adhan).`, `Break it with fresh dates; if you have none, dried dates; if you have none, water (Abu Dawud 2356, Tirmidhi 696; graded hasan).`, `Say the dua of iftar.`, `Pray Maghrib, then eat your meal moderately.`),
        note(`The one who feeds a fasting person will have a reward like his, without decreasing the fasting person's reward (Tirmidhi 807).`),
      ], true),
      sec(`Dua at iftar`, [
        rec(`Dua after breaking the fast`, `Said after breaking the fast. Narrated by Ibn Umar; graded hasan by many scholars.`,
          `ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ`, `Dhahabaz-zama'u wabtallatil-'uruqu wa thabatal-ajru in sha'allah`,
          `پیاس چلی گئی، رگیں تر ہو گئیں اور اللہ نے چاہا تو اجر ثابت ہو گیا۔`, `The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.`, `Abu Dawud 2357`),
        rec(`Dua widely recited at iftar`, `Widely recited, although its chain of narration is weak (narrated by Abu Dawud as a mursal report). The dua above is preferable.`,
          `اللَّهُمَّ لَكَ صُمْتُ وَعَلَىٰ رِزْقِكَ أَفْطَرْتُ`, `Allahumma laka sumtu wa 'ala rizqika aftartu`, `اے اللہ! میں نے تیرے لیے روزہ رکھا اور تیرے رزق سے افطار کیا۔`, `O Allah, for You I fasted and with Your provision I broke my fast.`, `Abu Dawud 2358 (weak)`),
        note(`The dua of a fasting person at the time of breaking his fast is hoped to be accepted. Make dua for yourself and for others.`),
      ]),
    ],
  },
  {
    id: 'daily-guide', group: `Daily Guide`, title: `Step-by-step daily fasting guide`, urdu: `روزانہ کا طریقہ`,
    intro: `A simple routine for each day of Ramadan.`,
    sections: [
      sec(`From night to night`, [
        steps(
          `Before Fajr: wake up for Sehri, make the intention to fast, and stop eating at the time of Fajr.`,
          `Pray Fajr in congregation if you can, and recite the morning remembrance.`,
          `Through the day: guard your tongue, eyes and ears. "If one of you is fasting, let him not use foul speech or raise his voice; if someone insults him or fights him, let him say: I am fasting" (Bukhari 1904, Muslim 1151).`,
          `Keep up the five prayers on time, recite the Quran, make dhikr and give charity.`,
          `At sunset: break the fast with dates and water and make the dua.`,
          `Pray Maghrib, Isha and Taraweeh.`,
          `Sleep early enough to wake for Sehri.`),
      ], true),
      sec(`Daily checklist`, [check(`Sehri`, `Intention`, `Fajr prayer`, `Five prayers on time`, `Quran recitation`, `Dhikr and dua`, `Charity (even small)`, `Iftar dua`, `Taraweeh`)]),
    ],
  },
  {
    id: 'invalidating', group: `Rulings`, title: `What breaks the fast`, urdu: `روزہ توڑنے والی چیزیں`,
    intro: `A fast is invalidated by the following acts if they are done deliberately, knowing that one is fasting. Some of them also require expiation (see Qada, Fidya and Kaffarah).`,
    sections: [
      sec(`Things that invalidate the fast`, [
        rank(r(`haram`, `Eating or drinking deliberately (including smoking, chewing tobacco or taking anything nutritive through the mouth or nose).`),
          r(`haram`, `Marital relations during the day.`),
          r(`haram`, `Deliberately causing oneself to vomit (Abu Dawud 2380, Tirmidhi 720: whoever vomits involuntarily need not make up the fast; whoever vomits deliberately must make it up).`),
          r(`haram`, `Deliberately causing the emission of semen, for example by self-stimulation.`),
          r(`info`, `Menstruation or postnatal bleeding, even a moment before sunset.`),
          r(`info`, `Intending to break the fast and doing so.`)),
      ], true),
      sec(`Matters of difference`, [
        table([`Matter`, `Hanafi`, `Shafi'i`, `Maliki`, `Hanbali`],
          [`Cupping (hijama) and blood donation`, `Does not break it`, `Does not break it`, `Does not break it`, `Cupping breaks it according to the madhhab; blood donation: discouraged if it weakens`],
          [`Intravenous nutrition or food-giving injections`, `Breaks it`, `Breaks it`, `Breaks it`, `Breaks it`],
          [`Medicinal injections that are not nutritive`, `Does not break it (contemporary fatwa bodies differ)`, `Does not break it`, `Does not break it`, `Does not break it`]),
        scholar(`Contemporary questions such as inhalers, eye or ear drops, nasal sprays, patches and dental procedures are decided differently by scholars and councils. For medical situations, ask a qualified scholar and your doctor.`),
      ]),
    ],
  },
  {
    id: 'not-invalidating', group: `Rulings`, title: `What does not break the fast`, urdu: `جن چیزوں سے روزہ نہیں ٹوٹتا`,
    intro: `Allah has made fasting easy. The following do not break the fast.`,
    sections: [
      sec(`Agreed matters`, [
        rank(r(`mubah`, `Eating or drinking by forgetfulness: the Prophet ﷺ said: "Whoever forgets and eats or drinks should complete his fast, for it is Allah who fed him and gave him drink" (Bukhari 1933, Muslim 1155).`),
          r(`mubah`, `Vomiting without intending to.`),
          r(`mubah`, `Waking up in the state of janabah (major impurity) and fasting; the Prophet ﷺ did so (Bukhari 1925, Muslim 1109).`),
          r(`mubah`, `Bathing, swimming (taking care not to swallow water), wearing perfume.`),
          r(`mubah`, `Using the miswak. Brushing teeth is permitted, taking care not to swallow anything.`),
          r(`mubah`, `Swallowing one's own saliva; dust, smoke or an insect entering the throat unintentionally.`),
          r(`mubah`, `Blood tests; having a wound dressed.`),
          r(`mubah`, `Rinsing the mouth, without exaggeration in sniffing water into the nose (Abu Dawud 142, Tirmidhi 788).`)),
      ], true),
      sec(`Kissing the spouse`, [
        p(`Aisha said that the Prophet ﷺ used to kiss and embrace while fasting, "but he had the most control over his desire among you" (Bukhari 1927, Muslim 1106). It is permitted for those who can control themselves, and disliked for those who may lose control, because relations would break the fast.`),
      ]),
      sec(`Eye drops, kohl and similar`, [
        diff(`Eye drops and kohl`, `Do not break the fast.`, `Do not break the fast (the eye is not a passage to the stomach).`, `Break the fast if a taste is felt in the throat.`, `Break the fast if the taste reaches the throat (a view followed by many).`, `Differences of opinion exist; someone with a medical need should consult a scholar.`),
      ]),
    ],
  },
  {
    id: 'exemptions', group: `Rulings`, title: `Exemptions and special circumstances`, urdu: `روزے میں رعایتیں`,
    intro: `Allah says: "Allah intends for you ease and does not intend for you hardship" (Quran 2:185). Some people are allowed to miss the fast.`,
    sections: [
      sec(`Travellers`, [
        p(`"Whoever among you is ill or on a journey, then an equal number of other days." (Quran 2:184). Hamzah ibn Amr al-Aslami asked the Prophet ﷺ about fasting while travelling; he said: "Fast if you wish, or break your fast if you wish" (Bukhari 1943, Muslim 1121).`),
        diff(`Which is better for a traveller?`, `Fasting is better if it causes no hardship.`, `Fasting is better if it does not cause hardship.`, `Fasting is better if it does not cause hardship.`, `Breaking the fast is better; fasting is disliked by many scholars.`),
        note(`The distance of travel is the same as that for shortening the prayer (see the Namaz section).`),
      ], true),
      sec(`The ill and the elderly`, [
        list(`A sick person who fears harm or delayed recovery from fasting may break the fast and make up the days later (qada).`, `A person with a long-term illness with no hope of recovery, or an elderly person who cannot fast, does not fast, and pays fidyah (feeding a poor person for each day).`),
        scholar(`Ask a doctor whether fasting will harm you, and a scholar whether your situation counts as an excuse.`),
      ]),
      sec(`Menstruation and postnatal bleeding`, [
        p(`Women in their period (hayd) or postnatal bleeding (nifas) must not fast, and must make up the missed days later. They do not make up the prayers (Muslim 335).`),
      ]),
      sec(`Pregnancy and breastfeeding`, [
        diff(`Pregnant or breastfeeding women`, `Qada only (making up the days later), without fidyah.`, `If the fear is for herself alone: qada only. If for the child (alone or with herself): qada and fidyah.`, `Pregnant: qada only. Breastfeeding: qada and fidyah.`, `Same as the Shafi'i view.`,
          `Some of the companions (Ibn Abbas, Ibn Umar) held that fidyah alone was enough.`),
        scholar(`A woman in this situation should consult a trusted scholar and her doctor.`),
      ]),
      sec(`Children`, [
        p(`Fasting is not obligatory for children before puberty, but they may be encouraged to fast to the extent they can, as the companions did (Bukhari 1960).`),
      ]),
    ],
  },
  {
    id: 'qada-fidya-kaffarah', group: `Rulings`, title: `Qada, Fidya and Kaffarah`, urdu: `قضا، فدیہ اور کفارہ`,
    intro: `These three terms are often confused. They apply in different situations.`,
    sections: [
      sec(`The three terms`, [
        table([`Term`, `Meaning`, `When it applies`],
          [`Qada`, `Making up a missed fast on another day.`, `A fast missed for a valid excuse (illness, travel, menstruation) or unintentionally.`],
          [`Fidya`, `Feeding a poor person for each day of fasting missed.`, `Those permanently unable to fast (elderly, chronically ill). Also in some cases for pregnant or breastfeeding women, or delayed qada (see below).`],
          [`Kaffarah`, `Expiation: free a slave; if not possible, fast two consecutive months; if not possible, feed sixty poor people.`, `Deliberately having marital relations in a day of Ramadan (Bukhari 1936, Muslim 1111).`]),
      ], true),
      sec(`Qada rules`, [
        steps(`Make up the days before the next Ramadan arrives; the days need not be consecutive.`, `Intend that the fast is a make-up of Ramadan, at night before Fajr.`, `If you delayed qada beyond the next Ramadan without an excuse, make up the days. The Hanafi school requires only qada. The other schools also require fidyah for each day of delay.`),
        refs({ ref: `Bukhari 1950, Muslim 1146`, text: `Aisha said that she would miss days of Ramadan and could only make them up in Sha'ban.` }),
      ]),
      sec(`Fidya`, [
        p(`Fidya means feeding one poor person for each missed day (Quran 2:184). It can be given as food or its value.`),
        diff(`Amount of fidya for one day`, `Half a sa' of wheat (about 1.6 kg) or its value, enough for two meals.`, `One mudd (about 0.5–0.75 kg) of staple food.`, `One mudd of staple food.`, `One mudd of wheat, or half a sa' of other staple foods.`, `Check with a local scholar for the current monetary equivalent.`),
      ]),
      sec(`Kaffarah`, [
        diff(`What requires kaffarah?`, `Deliberate eating, drinking or marital relations in Ramadan without an excuse.`, `Only marital relations in Ramadan.`, `Deliberate eating, drinking or marital relations in Ramadan.`, `Only marital relations in Ramadan.`),
        scholar(`Kaffarah is a serious matter and has conditions. Ask a qualified scholar of your school if you think it applies to you.`),
      ]),
    ],
  },
  {
    id: 'voluntary', group: `Voluntary Fasts`, title: `Voluntary fasts`, urdu: `نفلی روزے`,
    intro: `Besides Ramadan, the Prophet ﷺ encouraged several voluntary fasts.`,
    sections: [
      sec(`Recommended fasts`, [
        table([`Fast`, `Reference`],
          [`Six days of Shawwal after Ramadan: reward like fasting the whole year.`, `Muslim 1164`],
          [`The Day of Arafah (9 Dhul-Hijjah), for those not performing Hajj: expiates the previous and coming year.`, `Muslim 1162`],
          [`The Day of Ashura (10 Muharram), with the 9th or 11th: expiates the previous year.`, `Muslim 1162, 1134`],
          [`Fasting in Muharram: the best fasting after Ramadan.`, `Muslim 1163`],
          [`Mondays and Thursdays.`, `Muslim 1162, Tirmidhi 747`],
          [`Three days of each month, e.g. the 13th, 14th and 15th (the white days).`, `Tirmidhi 761, An-Nasa'i 2424`],
          [`Most of Sha'ban.`, `Bukhari 1969, Muslim 1156`],
          [`The fast of Dawud: one day fasting, one day not.`, `Bukhari 1131, Muslim 1159`]),
      ], true),
      sec(`Rulings`, [
        list(`A voluntary fast may be broken if needed; making it up later is recommended.`, `A woman should have her husband's permission for voluntary fasts when he is at home (Bukhari 5192, Muslim 1026).`, `Fasts that compete with obligations (such as Ramadan make-up days) should be given priority.`),
      ]),
    ],
  },
  {
    id: 'prohibited', group: `Voluntary Fasts`, title: `Prohibited and disliked fasting`, urdu: `ممنوع اور مکروہ روزے`,
    intro: `Some days and practices of fasting are prohibited or disliked.`,
    sections: [
      sec(`Prohibited`, [
        rank(r(`haram`, `Fasting on the two Eids: Eid al-Fitr and Eid al-Adha (Bukhari 1990, Muslim 1137).`),
          r(`haram`, `Fasting on the days of Tashreeq (11th–13th of Dhul-Hijjah): "days of eating, drinking and remembrance of Allah" (Muslim 1141). Some scholars permit it for the pilgrim who cannot find a sacrificial animal.`),
          r(`haram`, `Fasting while a woman is menstruating or in postnatal bleeding.`),
          r(`haram`, `Fasting continuously without breaking at night (wisal) (Bukhari 1965, Muslim 1103).`)),
      ], true),
      sec(`Disliked`, [
        rank(r(`makruh`, `Singling out Friday alone for fasting, without a day before or after (Bukhari 1985, Muslim 1144).`),
          r(`makruh`, `Fasting every day of the year; "there is no fast for the one who fasts perpetually" (Bukhari 1977, Muslim 1159).`),
          r(`makruh`, `Fasting the "day of doubt" (the 30th of Sha'ban) with the intention of Ramadan (Abu Dawud 2334).`)),
        scholar(`Some scholars differ about fasting on Saturday alone (Abu Dawud 2421). Follow your school.`),
      ]),
    ],
  },
  {
    id: 'faq', group: `Rulings`, title: `Common fasting questions`, urdu: `روزے کے عام سوالات`,
    intro: `Answers to common questions. For personal cases, consult a scholar.`,
    sections: [
      sec(`Questions and answers`, [
        qa(
          { q: `I ate by mistake. Is my fast broken?`, a: `No, if you forgot you were fasting. Continue your fast (Bukhari 1933, Muslim 1155).` },
          { q: `May I brush my teeth?`, a: `Yes, with care not to swallow. Many choose to do so before dawn if they have doubts.` },
          { q: `Is the fast valid if I wake up after Fajr in a state of janabah?`, a: `Yes. You can perform ghusl and continue (Bukhari 1925, Muslim 1109). Do not delay ghusl so as to miss the prayer.` },
          { q: `I got my period shortly before sunset. What about that day?`, a: `That day's fast is invalid, and you must make it up.` },
          { q: `May I take medication?`, a: `Medicine by mouth breaks the fast. If you are ill and must take it, you may break the fast and make it up. Ask your doctor about alternatives, such as a different schedule.` },
          { q: `I am not sure if the dawn has come. May I eat?`, a: `Eat until you are certain that dawn has come (Quran 2:187).` },
          { q: `I broke my fast by mistake thinking the sun had set. What now?`, a: `Stop eating when you realise, and complete the day. Most scholars say you must make up that day; some (such as Ibn Taymiyyah) say it is excused. Ask a scholar.` },
          { q: `Can I fast if I cannot pray?`, a: `Yes, but both are obligations. Do not let one replace the other.` }),
      ], true),
    ],
  },
  {
    id: 'ramadan-worship', group: `Ramadan`, title: `Ramadan acts of worship`, urdu: `رمضان کی عبادات`,
    intro: `Ramadan is a month of Quran, night prayer, charity and seeking forgiveness.`,
    sections: [
      sec(`Taraweeh and Qiyam`, [
        refs({ ref: `Bukhari 37, Muslim 759`, text: `Whoever stands in prayer during Ramadan out of faith and seeking reward, his past sins will be forgiven.` },
          { ref: `Bukhari 1147`, text: `Aisha said that the Prophet ﷺ did not pray more than eleven rak'ahs, in Ramadan or other times.` }),
        diff(`Number of Taraweeh rak'ahs`, `Twenty, in pairs.`, `Twenty, in pairs.`, `Thirty-six (Madinah practice) or twenty.`, `Twenty, in pairs.`, `Many scholars and mosques also pray eight or eleven rak'ahs. All are valid; do not dispute over the number.`),
      ], true),
      sec(`Laylat al-Qadr, Quran and charity`, [
        list(`Seek Laylat al-Qadr in the odd nights of the last ten days (Bukhari 2017). Quran 97:3: it is better than a thousand months.`, `Perform i'tikaf in the last ten nights, if you can (Bukhari 2025, Muslim 1172).`, `Recite and reflect on the Quran; Jibril reviewed the Quran with the Prophet ﷺ in Ramadan (Bukhari 6).`, `Give charity generously, and pay Zakat al-Fitr before the Eid prayer (Bukhari 1503, Muslim 984).`),
        dua(`laylat-qadr`, `Said on the nights of Qadr (Tirmidhi 3513).`),
      ]),
      sec(`Before Ramadan`, [
        check(`Make a plan for the Quran`, `Settle disputes and seek forgiveness`, `Make up any previous fasts you owe`, `Stock up on suitable food`, `Make an intention to give charity`),
      ]),
    ],
  },
  {
    id: 'tracker', group: `Ramadan`, title: `Ramadan worship tracker`, urdu: `رمضان ٹریکر`,
    intro: `Track your fasts and daily acts of worship through the 30 days of Ramadan. Your entries are saved on this device.`,
    sections: [],
    special: 'ramadan',
  },
];
