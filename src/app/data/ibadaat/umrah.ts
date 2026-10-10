import { Lesson, check, diff, dua, list, note, p, qa, r, rank, rec, refs, scholar, sec, see, steps, table } from './model';

/** Umrah. */
export const UMRAH_LESSONS: Lesson[] = [
  {
    id: 'overview', group: `Foundations`, title: `Meaning, importance and rulings`, urdu: `عمرہ کی اہمیت اور احکام`,
    intro: `Umrah is the "lesser pilgrimage": a visit to the Sacred House performing Tawaf, Sa'i and shaving or trimming in a state of Ihram. It can be performed at any time of the year.`,
    sections: [
      sec(`Importance`, [
        refs({ ref: `Quran 2:196`, text: `And complete the Hajj and Umrah for Allah.` },
          { ref: `Bukhari 1773, Muslim 1349`, text: `One Umrah to the next is an expiation for what is between them.` },
          { ref: `Bukhari 1782, Muslim 1256`, text: `Umrah in Ramadan equals Hajj (in reward).` }),
      ], true),
      sec(`Ruling`, [
        diff(`Is Umrah obligatory?`, `Sunnah muakkadah.`, `Obligatory once in a lifetime for those able.`, `Sunnah muakkadah.`, `Obligatory once in a lifetime for those able.`, `All agree that it is a great act of worship and highly recommended.`),
        scholar(),
      ]),
      sec(`The rites of Umrah`, [
        steps(`Ihram from the miqat, with the intention and Talbiyah.`, `Enter Masjid al-Haram and perform Tawaf (7 rounds).`, `Pray two rak'ahs behind Maqam Ibrahim.`, `Perform Sa'i between Safa and Marwah (7 laps).`, `Shave or trim the hair, and exit Ihram.`),
        see(`umrah/hajj-vs-umrah`, `Read the differences between Hajj and Umrah.`),
      ]),
    ],
  },
  {
    id: 'preparation', group: `Foundations`, title: `Preparation before travel`, urdu: `سفرِ عمرہ کی تیاری`,
    intro: `Prepare your heart, your money, your documents and your health before travelling.`,
    sections: [
      sec(`Preparation`, [
        list(`Make your intention sincere for Allah.`, `Use halal money, repay debts and seek forgiveness from people you may have wronged.`, `Learn the rites and the duas. Practise walking, as Tawaf and Sa'i are long.`, `Choose reliable travel arrangements and follow all the rules for visas and permits.`, `Pack light, with comfortable shoes, a small bag, unscented toiletries and your medicines.`),
      ], true),
      sec(`Checklist`, [
        check(`Passport, visa and Umrah permit`, `Vaccinations and medical documents`, `Ihram sheets (men) / modest clothes (women)`, `Unscented soap and toiletries`, `Comfortable shoes and sandals`, `Medicines and a small first-aid kit`, `Water bottle and snacks`, `Money and contact numbers`, `A guide to the rites and duas`),
        note(`Avoid arguments and unnecessary crowds. Be patient and kind to your fellow pilgrims.`),
      ]),
    ],
  },
  {
    id: 'ihram', group: `Ihram`, title: `Ihram, Miqat, Niyyah and Talbiyah`, urdu: `احرام، میقات، نیت اور تلبیہ`,
    intro: `Ihram is the state of consecration entered at the miqat. Pilgrims enter Ihram by intending Umrah, and by reciting the Talbiyah.`,
    sections: [
      sec(`Steps`, [
        steps(`Before the miqat: trim your nails and remove unwanted hair, take a bath (ghusl) and apply perfume to your body (not on the Ihram clothes).`, `Men: wear two unstitched white sheets. Women: wear modest ordinary clothes, without a face veil or gloves.`, `Pray two rak'ahs (Sunnah of Ihram) if the time permits.`, `At the miqat, or just before, say the intention: "Labbayka Umratan" (Here I am, O Allah, for Umrah).`, `Recite the Talbiyah: men aloud, women quietly.`),
        see(`hajj/miqat-ihram`, `See the list of miqats and the Ihram clothing.`),
        note(`If you are travelling by air, enter Ihram before reaching the miqat, as the pilot or the crew announces.`, `warn`),
      ], true),
      sec(`Talbiyah`, [dua(`talbiyah`, `Recite often from the intention until you begin Tawaf.`)]),
      sec(`Restrictions of Ihram`, [
        rank(r(`haram`, `Cutting hair or nails; using perfume.`), r(`haram`, `Marital relations and what leads to them.`), r(`haram`, `Hunting; marriage proposals or contracts.`), r(`haram`, `Men: stitched clothes and covering the head. Women: niqab and gloves.`), r(`haram`, `Quarrelling and sin.`)),
        see(`hajj/ihram-prohibitions`, `See details and compensation for violations.`),
      ]),
    ],
  },
  {
    id: 'enter-haram', group: `Rites`, title: `Entering Masjid al-Haram`, urdu: `مسجد حرام میں داخلہ`,
    intro: `Enter with humility, calm and gratitude.`,
    sections: [
      sec(`Etiquette`, [
        steps(`Enter with the right foot, saying the dua for entering a masjid.`, `When you see the Kaaba, praise Allah and make any dua you wish. It is a time when dua is accepted.`, `Head straight for the Black Stone corner to start Tawaf. There is no "Tahiyyat al-Masjid" prayer for someone who begins with Tawaf, as the Tawaf is the greeting of the mosque.`, `Keep the voice low. Do not push, do not photograph those who are praying, and be patient.`),
        dua(`enter-masjid`, `Said when entering the masjid (Muslim 713).`),
      ], true),
    ],
  },
  {
    id: 'tawaf', group: `Rites`, title: `Tawaf: method, rounds and duas`, urdu: `طواف کا طریقہ`,
    intro: `Tawaf is circling the Kaaba seven times, counter-clockwise, with the Kaaba on your left.`,
    sections: [
      sec(`Method`, [
        steps(`Have wudu and cover your awrah. Men: place the Ihram cloth under the right armpit, leaving the right shoulder bare (idtiba') for the Tawaf of Umrah (Abu Dawud 1884).`, `Go to the Black Stone corner. Face it and say "Bismillah, Allahu Akbar". Touch or kiss it if possible without harming anyone; otherwise, point to it with the right hand and say "Allahu Akbar" (Bukhari 1613).`, `Turn so the Kaaba is on your left and start the first round.`, `Men: walk quickly with short steps (raml) in the first three rounds; in the other four, walk normally (Bukhari 1603, Muslim 1261).`, `Between the Yemeni corner and the Black Stone, say: "Rabbana atina fid-dunya hasanah…" (Quran 2:201; Abu Dawud 1892).`, `Complete seven rounds, ending at the Black Stone. Each round starts and ends at the Black Stone.`, `Keep outside the Hijr (the semicircular wall): it is part of the Kaaba (Bukhari 1584).`),
        rec(`At the Black Stone`, `Said while facing the stone and pointing towards it, at the start of each round if you can.`, `اللَّهُ أَكْبَرُ`, `Allahu akbar`, `اللہ سب سے بڑا ہے۔`, `Allah is the Greatest.`, `Bukhari 1613`),
        dua(`q-hasanah`, `Said between the Yemeni corner and the Black Stone in each round.`),
      ], true),
      sec(`Supplications during Tawaf`, [
        p(`No specific dua is authentically reported for each round. Praise Allah, send blessings on the Prophet ﷺ, recite Quran, and make dua in any language for yourself, your family and the Muslims. Printed booklets of round-by-round duas are not from the Prophet ﷺ; use them only as help for ideas, and do not believe them to be required.`),
        note(`Women should not push to the Black Stone. They may do their Tawaf at the outer area, away from the crowd. There is no need to touch it.`),
      ]),
      sec(`Rulings`, [
        diff(`Purity for Tawaf`, `Wudu is a Wajib; Tawaf without it must be repeated, or compensated as the school rules.`, `Wudu is a condition.`, `Wudu is a condition.`, `Wudu is a condition.`),
        list(`If wudu breaks during Tawaf, renew it and continue; some scholars prefer starting the Tawaf again.`, `If you doubt the number of rounds, build on the lower number.`, `Pause for the obligatory prayer if the iqamah is called, then resume.`),
      ]),
    ],
  },
  {
    id: 'two-rakahs', group: `Rites`, title: `Two rak'ahs after Tawaf and Zamzam`, urdu: `طواف کے دو نفل اور زمزم`,
    intro: `After the seventh round, pray two rak'ahs behind the Maqam of Ibrahim.`,
    sections: [
      sec(`The prayer`, [
        steps(`After Tawaf, recite "Wattakhidhu min maqami Ibrahima musalla" (Quran 2:125) and go to the Maqam of Ibrahim.`, `Pray two light rak'ahs, reciting Surah Al-Kafirun in the first and Surah Al-Ikhlas in the second (Muslim 1218).`, `If it is crowded, you may pray anywhere in the Masjid or the Haram.`, `Cover the right shoulder again (men).`, `Drink Zamzam, and then go to Safa.`),
        refs({ ref: `Abu Dawud 1894, Tirmidhi 868`, text: `O Banu Abd Manaf, do not prevent anyone from circumambulating this House and praying at any hour of the night or day.` },
          { ref: `Muslim 2473`, text: `Zamzam is blessed; it is food that nourishes.` }),
        note(`According to the Hanafi school, the two rak'ahs of Tawaf are delayed if the Tawaf ended at one of the forbidden times; the majority permit praying them at any time.`),
      ], true),
    ],
  },
  {
    id: 'sai', group: `Rites`, title: `Sa'i between Safa and Marwah`, urdu: `صفا و مروہ کی سعی`,
    intro: `Sa'i is seven laps between the hills of Safa and Marwah, starting at Safa and ending at Marwah.`,
    sections: [
      sec(`Steps`, [
        steps(`After the prayer, go to Safa. Recite "Inna as-Safa wal-Marwata min sha'a'irillah" once, and "Abda'u bima bada'allahu bih".`, `Climb a little until you can see the Kaaba, face it, raise your hands, say "Allahu Akbar" three times and the remembrance of Safa and make a dua.`, `Walk to Marwah. Men: run lightly between the green markers.`, `At Marwah, face the Kaaba and repeat the remembrance and dua.`, `Complete 7 laps (Safa to Marwah is one, Marwah to Safa is another), ending at Marwah.`),
        dua(`safa-marwa`, `Said on approaching Safa for the first time.`),
        see(`hajj/sai`, `See the full remembrance of Safa and Marwah and rulings on Sa'i.`),
      ], true),
      sec(`Rulings`, [
        diff(`Status of Sa'i`, `Wajib.`, `A pillar of Umrah.`, `A pillar of Umrah.`, `A pillar of Umrah.`),
        note(`The sick and elderly may use a wheelchair or a motorised cart. Women walk without running.`),
      ]),
    ],
  },
  {
    id: 'halq', group: `Rites`, title: `Halq or Taqsir and completing Umrah`, urdu: `حلق یا تقصیر اور عمرہ کی تکمیل`,
    intro: `The last step of Umrah is shaving or trimming the hair, after which you leave the state of Ihram.`,
    sections: [
      sec(`Method`, [
        steps(`After the Sa'i, men shave the head (better) or trim the hair from the entire head.`, `Women gather their hair and cut about a fingertip length from the ends.`, `You are now out of Ihram. All restrictions are lifted.`),
        refs({ ref: `Bukhari 1727, Muslim 1301`, text: `May Allah have mercy on those who shave their heads.` }),
        note(`If you are performing Tamattu' Hajj and Hajj is very near, trim rather than shave, to keep hair for the Halq of Hajj.`),
      ], true),
      sec(`After Umrah`, [
        p(`There is no obligatory farewell Tawaf after Umrah in most opinions: the Tawaf of Umrah is itself the last act, if you leave right after. Scholars differ on whether the farewell Tawaf is required for a pilgrim who stays on and leaves later, so ask your guide.`),
        note(`Give thanks, perform voluntary Tawaf and prayers in the Haram, and continue to be mindful of Allah afterwards.`),
      ]),
    ],
  },
  {
    id: 'duas', group: `Duas`, title: `Essential duas of Umrah`, urdu: `عمرہ کی دعائیں`,
    intro: `Duas and remembrances for each stage of Umrah.`,
    sections: [
      sec(`From Ihram to Tawaf`, [dua(`talbiyah`, `After the intention for Umrah.`), dua(`enter-masjid`, `Entering Masjid al-Haram.`)], true),
      sec(`Tawaf and Sa'i`, [dua(`q-hasanah`, `Between the Yemeni corner and the Black Stone.`), dua(`q-accept`, `A dua of Ibrahim and Ismail (Quran 2:127).`), dua(`safa-marwa`, `At Safa and Marwah.`)]),
      sec(`General`, [dua(`sayyid-istighfar`, `Seeking forgiveness.`), dua(`q-steadfast`, `Asking for steadfastness.`)]),
    ],
  },
  {
    id: 'special-groups', group: `Guidance`, title: `Guidance for women, the elderly and people with disabilities`, urdu: `خواتین، بزرگوں اور معذور افراد کے لیے رہنمائی`,
    intro: `Islam makes allowance for difficulty. These are some common rulings.`,
    sections: [
      sec(`Women`, [
        list(`A woman needs a mahram or a husband to travel (see the Hajj lesson for the schools' differences).`, `A woman in menstruation or postnatal bleeding cannot perform Tawaf. The Prophet ﷺ told Aisha: "Do what the pilgrim does, except do not circle the House until you are pure" (Bukhari 305, Muslim 1211).`, `She may enter Ihram while menstruating and wait until she is pure to perform Tawaf and Sa'i. If this is not possible due to travel dates, ask a scholar about the solutions.`, `Women should dress modestly and avoid pushing in crowds.`),
        scholar(`Medicines to postpone a period are a matter for her doctor and a scholar. Ask before relying on this.`),
      ], true),
      sec(`The elderly and people with disabilities`, [
        list(`Tawaf and Sa'i may be done in a wheelchair, a cart or by being carried. Umm Salamah was told to perform Tawaf behind the people while riding (Bukhari 1619, Muslim 1276).`, `Rest areas and prayer areas are available; use the Haram's upper floors and the dedicated lanes.`, `If you cannot complete the Sa'i, you may do it in stages with rests.`, `Those unable to stand in prayer may pray sitting.`),
        note(`If someone is unable to travel at all for permanent reasons, ask a scholar about a proxy Umrah.`),
      ]),
    ],
  },
  {
    id: 'hajj-vs-umrah', group: `Guidance`, title: `Difference between Hajj and Umrah`, urdu: `حج اور عمرہ میں فرق`,
    intro: `Hajj and Umrah share many rites, but they are different in timing, requirements and rulings.`,
    sections: [
      sec(`Comparison`, [
        table([`Aspect`, `Hajj`, `Umrah`],
          [`Time`, `Only in the days of Dhul-Hijjah (8th–13th)`, `Any time of the year`],
          [`Ruling`, `A pillar of Islam, obligatory once for those able`, `Obligatory in the Shafi'i and Hanbali schools; Sunnah muakkadah in Hanafi and Maliki`],
          [`Ihram`, `Yes, from the miqat or from Makkah (for Tamattu')`, `Yes, from the miqat`],
          [`Tawaf`, `Tawaf al-Qudum (arrival), Ifadah (pillar), Wada (farewell)`, `One Tawaf (pillar)`],
          [`Sa'i`, `Yes`, `Yes`],
          [`Wuquf at Arafah`, `Yes (the main pillar)`, `No`],
          [`Mina and Muzdalifah`, `Yes`, `No`],
          [`Stoning (Rami)`, `Yes`, `No`],
          [`Sacrifice (Hady)`, `Yes (Tamattu', Qiran)`, `No`],
          [`Halq / Taqsir`, `Yes`, `Yes`],
          [`Duration`, `About 5–6 days of rites`, `A few hours`]),
        note(`Umrah done in the months of Hajj before Hajj, with an exit from Ihram, becomes Tamattu' Hajj.`),
      ], true),
    ],
  },
  {
    id: 'mistakes', group: `Guidance`, title: `Common mistakes and frequently asked questions`, urdu: `عام غلطیاں اور سوالات`,
    intro: `Check yourself against these mistakes before your Umrah.`,
    sections: [
      sec(`Common mistakes`, [
        list(`Crossing the miqat without Ihram (especially in planes).`, `Starting Tawaf before the Black Stone line, or walking through the Hijr.`, `Pushing and harming others to touch the Black Stone.`, `Reciting duas aloud in a group so that others are disturbed.`, `Starting the Sa'i from Marwah instead of Safa.`, `Cutting only a few hairs, instead of the whole head (men).`, `Leaving Ihram before finishing the Sa'i.`, `Using perfumed soap in Ihram.`),
      ], true),
      sec(`Frequently asked questions`, [
        qa({ q: `Can I perform Umrah more than once on a trip?`, a: `Scholars differ on repeated Umrahs in one trip. The Prophet ﷺ and his companions did not make repeated Umrahs. Many scholars say that more Tawaf is better. Ask your guide.` },
          { q: `Do I need to pray 2 rak'ahs of Ihram?`, a: `It is a Sunnah, not a condition.` },
          { q: `Can I do Umrah on behalf of a deceased parent?`, a: `Yes, if you have performed your own Umrah first, and if the parent was Muslim.` },
          { q: `Can I perform Umrah during menstruation?`, a: `You may enter Ihram but you cannot perform Tawaf until you are pure (Bukhari 305).` }),
      ]),
    ],
  },
  {
    id: 'checklist', group: `Guidance`, title: `Step-by-step Umrah checklist`, urdu: `عمرہ کی مرحلہ وار فہرست`,
    intro: `Tick each step as you complete it.`,
    sections: [
      sec(`Checklist`, [check(`Intention and ghusl before the miqat`, `Wear Ihram (men) / modest clothes (women)`, `Intention at the miqat: Labbayka Umratan`, `Recite the Talbiyah`, `Enter Masjid al-Haram with the dua`, `Tawaf: 7 rounds starting at the Black Stone`, `Two rak'ahs behind Maqam Ibrahim`, `Drink Zamzam`, `Sa'i: 7 laps Safa to Marwah`, `Shave or trim the hair`, `Out of Ihram: Umrah complete`)], true),
    ],
  },
];
