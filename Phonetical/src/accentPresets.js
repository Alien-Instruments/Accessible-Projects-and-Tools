export const accentPresets = {
  "english-us": {
    vowels: {
      A: [800, 1150, 2900],
      E: [500, 1750, 2450],
      I: [350, 2000, 2800],
      O: [450, 800, 2830],
      U: [325, 700, 2530],
      AE: [660, 1700, 2400],
      AH: [700, 1220, 2600],
      UH: [440, 1020, 2240],
    },
    consonants: {
      P: { type: "plosive", voiced: false, burst: [200, 400] },
      B: { type: "plosive", voiced: true, burst: [200, 400] },
      T: { type: "plosive", voiced: false, burst: [400, 700] },
      D: { type: "plosive", voiced: true, burst: [400, 700] },
      K: { type: "plosive", voiced: false, burst: [800, 1500] },
      G: { type: "plosive", voiced: true, burst: [800, 1500] },
      F: { type: "fricative", voiced: false, noise: [4000] },
      V: { type: "fricative", voiced: true, noise: [2000, 3000] },
      S: { type: "fricative", voiced: false, noise: [5000, 7000] },
      Z: { type: "fricative", voiced: true, noise: [5000, 7000] },
      SH: { type: "fricative", voiced: false, noise: [2000, 5000] },
      ZH: { type: "fricative", voiced: true, noise: [2000, 5000] },
      M: { type: "nasal", voiced: true, formants: [250, 1200, 2100] },
      N: { type: "nasal", voiced: true, formants: [300, 1700, 2700] },
      NG: { type: "nasal", voiced: true, formants: [300, 2100, 2700] },
      L: { type: "liquid", voiced: true, formants: [400, 2400, 3400] },
      R: { type: "liquid", voiced: true, formants: [300, 1800, 2600] },
      W: { type: "semivowel", voiced: true, formants: [350, 1000, 2400] },
      Y: { type: "semivowel", voiced: true, formants: [250, 2000, 2850] },
      H: { type: "aspirate", voiced: false, noise: [2000] },
      TH: { type: "fricative", voiced: false, noise: [6000] },
      DH: { type: "fricative", voiced: true, noise: [4000] },
      CH: { type: "affricate", voiced: false, burst: [2300, 3400] },
      JH: { type: "affricate", voiced: true, burst: [2300, 3400] },
      Q: { type: "plosive", voiced: false, burst: [3000] },
      WH: { type: "fricative", voiced: false, noise: [1200, 2000] },
    },
  },
  "english-rp": {
    // Received Pronunciation (British English)
    vowels: {
      A: [730, 1090, 2440],
      E: [530, 1840, 2480],
      I: [390, 1990, 2550],
      O: [400, 750, 2400],
      U: [350, 840, 2280],
      AE: [660, 1700, 2400],
      AH: [600, 1170, 2390],
      UH: [440, 1020, 2240],
    },
    consonants: {
      P: { type: "plosive", voiced: false, burst: [200, 400] },
      B: { type: "plosive", voiced: true, burst: [200, 400] },
      T: {
        type: "plosive",
        voiced: false,
        burst: [400, 700],
        aspiration: true,
      },
      D: { type: "plosive", voiced: true, burst: [400, 700] },
      K: { type: "plosive", voiced: false, burst: [800, 1500] },
      G: { type: "plosive", voiced: true, burst: [800, 1500] },
      F: { type: "fricative", voiced: false, noise: [4000] },
      V: { type: "fricative", voiced: true, noise: [2000, 3000] },
      S: { type: "fricative", voiced: false, noise: [5000, 7000] },
      Z: { type: "fricative", voiced: true, noise: [5000, 7000] },
      SH: { type: "fricative", voiced: false, noise: [2000, 5000] },
      ZH: { type: "fricative", voiced: true, noise: [2000, 5000] },
      M: { type: "nasal", voiced: true, formants: [250, 1200, 2100] },
      N: { type: "nasal", voiced: true, formants: [300, 1700, 2700] },
      NG: { type: "nasal", voiced: true, formants: [300, 2100, 2700] },
      L: { type: "liquid", voiced: true, formants: [400, 2400, 3400] },
      R: { type: "liquid", voiced: true, formants: [300, 1800, 2600] },
      W: { type: "semivowel", voiced: true, formants: [350, 1000, 2400] },
      Y: { type: "semivowel", voiced: true, formants: [250, 2000, 2850] },
      H: { type: "aspirate", voiced: false, noise: [2000] },
      TH: { type: "fricative", voiced: false, noise: [6000] },
      DH: { type: "fricative", voiced: true, noise: [4000] },
      CH: { type: "affricate", voiced: false, burst: [2300, 3400] },
      JH: { type: "affricate", voiced: true, burst: [2300, 3400] },
    },
  },
  "spanish-es": {
    vowels: {
      A: [730, 1090, 2440],
      E: [530, 1840, 2480],
      I: [390, 1990, 2550],
      O: [400, 750, 2400],
      U: [350, 840, 2280],
    },
    consonants: {
      P: { type: "plosive", voiced: false, burst: [200, 400] },
      B: { type: "plosive", voiced: true, burst: [200, 400] },
      V: { type: "plosive", voiced: true, burst: [200, 400] }, // optional, same as B
      T: { type: "plosive", voiced: false, burst: [400, 700] },
      D: { type: "plosive", voiced: true, burst: [400, 700] },
      K: { type: "plosive", voiced: false, burst: [800, 1500] },
      G: { type: "plosive", voiced: true, burst: [800, 1500] },
      CH: { type: "affricate", voiced: false, burst: [2000, 3000] },
      F: { type: "fricative", voiced: false, noise: [3500] },
      S: { type: "fricative", voiced: false, noise: [5000] },
      Z: { type: "fricative", voiced: false, noise: [5000] }, // for Castilian
      TH: { type: "fricative", voiced: false, noise: [5000] }, // for Castilian
      X: { type: "fricative", voiced: false, noise: [4000, 5000] }, // for 'x', 'j'
      J: { type: "fricative", voiced: false, noise: [2000, 3000] },
      LL: { type: "semivowel", voiced: true, formants: [350, 1800, 2700] },
      Y: { type: "semivowel", voiced: true, formants: [250, 2000, 2850] },
      W: { type: "semivowel", voiced: true, formants: [350, 1000, 2400] }, // optional, loanwords
      M: { type: "nasal", voiced: true, formants: [250, 1200, 2100] },
      N: { type: "nasal", voiced: true, formants: [300, 1700, 2700] },
      Ñ: { type: "nasal", voiced: true, formants: [270, 2100, 2500] },
      L: { type: "liquid", voiced: true, formants: [400, 2400, 3400] },
      RR: { type: "trill", voiced: true, formants: [300, 1600, 2600] },
      R: { type: "tap", voiced: true, formants: [300, 1800, 2600] },
    },
  },
  "french-fr": {
    vowels: {
      A: [730, 1090, 2440], // as in "pâte"
      E: [530, 1840, 2480], // as in "été"
      I: [390, 1990, 2550], // as in "si"
      O: [400, 750, 2400], // as in "eau"
      U: [350, 840, 2280], // as in "fou"
      EU: [440, 1700, 2100], // as in "peur"
      OE: [370, 1600, 2200], // as in "bleu"
      AN: [650, 1080, 2400], // nasalized A
      IN: [400, 2000, 2500], // nasalized E/I
      ON: [350, 800, 2200], // nasalized O
      UN: [400, 1500, 2200], // nasalized U/EU
    },
    consonants: {
      P: { type: "plosive", voiced: false, burst: [200, 400] },
      B: { type: "plosive", voiced: true, burst: [200, 400] },
      T: { type: "plosive", voiced: false, burst: [400, 700] },
      D: { type: "plosive", voiced: true, burst: [400, 700] },
      K: { type: "plosive", voiced: false, burst: [800, 1500] },
      G: { type: "plosive", voiced: true, burst: [800, 1500] },
      F: { type: "fricative", voiced: false, noise: [4000] },
      V: { type: "fricative", voiced: true, noise: [2000, 3000] },
      S: { type: "fricative", voiced: false, noise: [5000, 7000] },
      Z: { type: "fricative", voiced: true, noise: [5000, 7000] },
      CH: { type: "fricative", voiced: false, noise: [2000, 3000] },
      J: { type: "fricative", voiced: true, noise: [2000, 4000] },
      M: { type: "nasal", voiced: true, formants: [250, 1200, 2100] },
      N: { type: "nasal", voiced: true, formants: [300, 1700, 2700] },
      GN: { type: "nasal", voiced: true, formants: [270, 2100, 2500] },
      L: { type: "liquid", voiced: true, formants: [400, 2400, 3400] },
      R: { type: "liquid", voiced: true, formants: [300, 1200, 2100] },
      W: { type: "semivowel", voiced: true, formants: [350, 1000, 2400] },
      Y: { type: "semivowel", voiced: true, formants: [250, 2000, 2850] },
      H: { type: "aspirate", voiced: false, noise: [2000] },
      NG: { type: "nasal", voiced: true, formants: [300, 2100, 2700] },
      TS: { type: "affricate", voiced: false, burst: [4000, 6000] },
      DZ: { type: "affricate", voiced: true, burst: [4000, 6000] },
    },
  },
  "german-de": {
    vowels: {
      A: [700, 1200, 2600],
      E: [500, 1700, 2500],
      I: [350, 2000, 2800],
      O: [450, 800, 2830],
      U: [325, 700, 2530],
      Ä: [660, 1700, 2400],
      Ö: [500, 1700, 2000],
      Ü: [350, 1800, 2200],
      EI: [500, 2000, 2600],
      AU: [600, 1100, 2100],
      EU: [500, 1700, 2300],
    },
    consonants: {
      P: { type: "plosive", voiced: false, burst: [200, 400] },
      B: { type: "plosive", voiced: true, burst: [200, 400] },
      T: { type: "plosive", voiced: false, burst: [400, 700] },
      D: { type: "plosive", voiced: true, burst: [400, 700] },
      K: { type: "plosive", voiced: false, burst: [800, 1500] },
      G: { type: "plosive", voiced: true, burst: [800, 1500] },
      PF: {
        type: "affricate",
        voiced: false,
        burst: [400, 900],
        noise: [4000],
      },
      Z: {
        type: "affricate",
        voiced: false,
        burst: [700, 1200],
        noise: [5000],
      },
      SCH: { type: "fricative", voiced: false, noise: [2000, 5000] }, // "sch"
      CH: { type: "fricative", voiced: false, noise: [2500, 4500] }, // "ich", "ach"
      F: { type: "fricative", voiced: false, noise: [4000] },
      V: { type: "fricative", voiced: true, noise: [2000, 3000] },
      W: { type: "fricative", voiced: true, noise: [2000, 3000] }, // same as V
      S: { type: "fricative", voiced: false, noise: [5000, 7000] },
      ß: { type: "fricative", voiced: false, noise: [5000, 7000] }, // alias S
      DSCH: {
        type: "affricate",
        voiced: true,
        burst: [1800, 2800],
        noise: [2800, 3800],
      },
      J: { type: "semivowel", voiced: true, formants: [250, 2000, 2850] },
      Y: { type: "semivowel", voiced: true, formants: [250, 2000, 2850] }, // optional
      L: { type: "liquid", voiced: true, formants: [400, 2400, 3400] },
      R: { type: "liquid", voiced: true, formants: [300, 1200, 2100] },
      M: { type: "nasal", voiced: true, formants: [250, 1200, 2100] },
      N: { type: "nasal", voiced: true, formants: [300, 1700, 2700] },
      NG: { type: "nasal", voiced: true, formants: [300, 2100, 2700] },
      H: { type: "aspirate", voiced: false, noise: [2000] },
    },
  },
  "japanese-ja": {
    vowels: {
      A: [800, 1300, 2600], // あ
      I: [350, 2000, 3000], // い
      U: [375, 950, 2250], // う
      E: [475, 1850, 2700], // え
      O: [450, 800, 2700], // お
    },
    consonants: {
      K: { type: "plosive", voiced: false, burst: [800, 1500] }, // か
      G: { type: "plosive", voiced: true, burst: [800, 1500] }, // が
      T: { type: "plosive", voiced: false, burst: [400, 700] }, // た
      D: { type: "plosive", voiced: true, burst: [400, 700] }, // だ
      S: { type: "fricative", voiced: false, noise: [5000] }, // さ
      Z: { type: "fricative", voiced: true, noise: [5000] }, // ざ
      SH: { type: "fricative", voiced: false, noise: [2500, 3500] }, // し
      CH: {
        type: "affricate",
        voiced: false,
        burst: [2200, 3400],
        noise: [3000],
      }, // ち
      TS: {
        type: "affricate",
        voiced: false,
        burst: [400, 1200],
        noise: [2500],
      }, // つ
      J: {
        type: "affricate",
        voiced: true,
        burst: [1500, 2200],
        noise: [3000],
      }, // じ
      H: { type: "fricative", voiced: false, noise: [2000] }, // は
      F: { type: "fricative", voiced: false, noise: [1700] }, // ふ
      B: { type: "plosive", voiced: true, burst: [200, 400] }, // ば
      P: { type: "plosive", voiced: false, burst: [200, 400] }, // ぱ
      M: { type: "nasal", voiced: true, formants: [250, 1200, 2100] }, // ま
      N: { type: "nasal", voiced: true, formants: [300, 1700, 2700] }, // な, ん (default)
      NG: { type: "nasal", voiced: true, formants: [300, 2100, 2700] }, // ん after k/g
      Y: { type: "semivowel", voiced: true, formants: [250, 2000, 2850] }, // や
      R: { type: "liquid", voiced: true, formants: [300, 1800, 2600] }, // ら
      W: { type: "semivowel", voiced: true, formants: [350, 1000, 2400] }, // わ
      V: { type: "fricative", voiced: true, noise: [2000, 3000] }, // loanwords
    },
  },
  "italian-it": {
    vowels: {
      A: [730, 1090, 2440],
      E: [530, 1840, 2480],
      I: [390, 1990, 2550],
      O: [400, 750, 2400],
      U: [350, 840, 2280],
    },
    consonants: {
      P: { type: "plosive", voiced: false, burst: [200, 400] },
      B: { type: "plosive", voiced: true, burst: [200, 400] },
      T: { type: "plosive", voiced: false, burst: [400, 700] },
      D: { type: "plosive", voiced: true, burst: [400, 700] },
      K: { type: "plosive", voiced: false, burst: [800, 1500] },
      G: {
        type: "affricate",
        voiced: true,
        burst: [2300, 3400],
        noise: [1800, 2800],
      },
      C: {
        type: "affricate",
        voiced: false,
        burst: [2300, 3400],
        noise: [3000],
      },
      F: { type: "fricative", voiced: false, noise: [4000] },
      V: { type: "fricative", voiced: true, noise: [2000, 3000] },
      S: { type: "fricative", voiced: false, noise: [5000] },
      Z: { type: "affricate", voiced: true, burst: [700, 1200], noise: [5000] },
      TS: {
        type: "affricate",
        voiced: false,
        burst: [700, 1200],
        noise: [5000],
      },
      DZ: {
        type: "affricate",
        voiced: true,
        burst: [700, 1200],
        noise: [5000],
      },
      SC: { type: "fricative", voiced: false, noise: [2500, 4000] },
      GN: { type: "nasal", voiced: true, formants: [270, 2100, 2500] },
      GL: { type: "liquid", voiced: true, formants: [350, 2000, 2700] },
      L: { type: "liquid", voiced: true, formants: [400, 2400, 3400] },
      R: { type: "trill", voiced: true, formants: [300, 1600, 2600] },
      M: { type: "nasal", voiced: true, formants: [250, 1200, 2100] },
      N: { type: "nasal", voiced: true, formants: [300, 1700, 2700] },
      H: { type: "aspirate", voiced: false, noise: [2000] },
      J: { type: "semivowel", voiced: true, formants: [250, 2000, 2850] },
      W: { type: "semivowel", voiced: true, formants: [350, 1000, 2400] },
    },
  },
  "hindi-hi": {
    vowels: {
      A: [730, 1090, 2440], // /aː/ आ
      I: [390, 1990, 2550], // /iː/ ई
      E: [530, 1840, 2480], // /eː/ ए
      U: [350, 840, 2280], // /uː/ ऊ
      O: [400, 750, 2400], // /oː/ ओ
      AE: [660, 1700, 2400], // /æ/ ऐ
      AI: [600, 2000, 2600], // /əi/ ऐ diphthong
      AU: [700, 1000, 2600], // /əu/ औ diphthong
      AH: [700, 1220, 2600], // /ə/ अ (schwa)
    },
    consonants: {
      P: { type: "plosive", voiced: false, burst: [200, 400] }, // प
      PH: { type: "plosive", voiced: false, burst: [200, 400] }, // फ (aspirated)
      B: { type: "plosive", voiced: true, burst: [200, 400] }, // ब
      BH: { type: "plosive", voiced: true, burst: [200, 400] }, // भ (aspirated)
      T: { type: "plosive", voiced: false, burst: [400, 700] }, // त (dental)
      TH: { type: "plosive", voiced: false, burst: [400, 700] }, // थ (aspirated dental)
      D: { type: "plosive", voiced: true, burst: [400, 700] }, // द (dental)
      DH: { type: "plosive", voiced: true, burst: [400, 700] }, // ध (aspirated dental)
      TT: { type: "plosive", voiced: false, burst: [700, 1200] }, // ट (retroflex)
      TTH: { type: "plosive", voiced: false, burst: [700, 1200] }, // ठ (aspirated retroflex)
      DD: { type: "plosive", voiced: true, burst: [700, 1200] }, // ड (retroflex)
      DDH: { type: "plosive", voiced: true, burst: [700, 1200] }, // ढ (aspirated retroflex)
      K: { type: "plosive", voiced: false, burst: [800, 1500] }, // क
      KH: { type: "plosive", voiced: false, burst: [800, 1500] }, // ख (aspirated)
      G: { type: "plosive", voiced: true, burst: [800, 1500] }, // ग
      GH: { type: "plosive", voiced: true, burst: [800, 1500] }, // घ (aspirated)
      CH: { type: "affricate", voiced: false, burst: [2000, 3500] }, // च
      CHH: { type: "affricate", voiced: false, burst: [2000, 3500] }, // छ (aspirated)
      J: { type: "affricate", voiced: true, burst: [2500, 4000] }, // ज
      JH: { type: "affricate", voiced: true, burst: [2500, 4000] }, // झ (aspirated)
      F: { type: "fricative", voiced: false, noise: [4000] }, // फ़ (loanwords)
      S: { type: "fricative", voiced: false, noise: [5000, 7000] }, // स
      SH: { type: "fricative", voiced: false, noise: [2500, 5000] }, // श
      SS: { type: "fricative", voiced: false, noise: [2000, 4000] }, // ष (retroflex)
      H: { type: "aspirate", voiced: false, noise: [2000] }, // ह
      M: { type: "nasal", voiced: true, formants: [250, 1200, 2100] }, // म
      N: { type: "nasal", voiced: true, formants: [300, 1700, 2700] }, // न
      NN: { type: "nasal", voiced: true, formants: [350, 1900, 2800] }, // ण (retroflex)
      NG: { type: "nasal", voiced: true, formants: [300, 2100, 2700] }, // ङ
      Y: { type: "semivowel", voiced: true, formants: [250, 2000, 2850] }, // य
      R: { type: "liquid", voiced: true, formants: [300, 1800, 2600] }, // र
      L: { type: "liquid", voiced: true, formants: [400, 2400, 3400] }, // ल
      V: { type: "semivowel", voiced: true, formants: [350, 1000, 2400] }, // व
    },
  },
  "mandarin-zh": {
    vowels: {
      A: [750, 1200, 2500], // ā (as in 妈 mā)
      O: [500, 900, 2400], // o (as in 多 duō)
      E: [600, 1700, 2300], // e (as in 哥 gē)
      I: [350, 2150, 2950], // i (as in 你 nǐ)
      U: [325, 700, 2530], // u (as in 书 shū)
      Ü: [360, 1800, 2300], // ü (as in 女 nǚ)
      AI: [700, 1800, 2700], // ai (as in 爱 ài)
      EI: [500, 2100, 2600], // ei (as in 黑 hēi)
      AO: [700, 1100, 2400], // ao (as in 好 hǎo)
      OU: [500, 800, 2200], // ou (as in 口 kǒu)
      AN: [700, 1200, 2200], // an (as in 看 kàn)
      EN: [500, 1700, 2300], // en (as in 很 hěn)
      ANG: [650, 1100, 2000], // ang (as in 忙 máng)
      ENG: [500, 1500, 2000], // eng (as in 冷 lěng)
      ER: [500, 1500, 1800], // er (as in 二 èr)
    },
    consonants: {
      B: { type: "plosive", voiced: false, burst: [200, 400] },
      P: { type: "plosive", voiced: false, burst: [400, 700] },
      D: { type: "plosive", voiced: false, burst: [400, 700] },
      T: { type: "plosive", voiced: false, burst: [800, 1500] },
      G: { type: "plosive", voiced: false, burst: [800, 1500] },
      K: { type: "plosive", voiced: false, burst: [1000, 1600] },
      J: { type: "affricate", voiced: false, burst: [2000, 3000] },
      Q: { type: "affricate", voiced: false, burst: [2000, 3500] },
      X: { type: "fricative", voiced: false, noise: [2500, 3500] },
      Z: { type: "affricate", voiced: false, burst: [3500, 4000] },
      C: { type: "affricate", voiced: false, burst: [3500, 4000] },
      S: { type: "fricative", voiced: false, noise: [5000, 7000] },
      ZH: { type: "affricate", voiced: false, burst: [2000, 3500] },
      CH: { type: "affricate", voiced: false, burst: [2000, 3500] },
      SH: { type: "fricative", voiced: false, noise: [2500, 4000] },
      R: { type: "liquid", voiced: true, formants: [400, 1400, 2400] },
      Y: { type: "semivowel", voiced: true, formants: [250, 2000, 2850] },
      W: { type: "semivowel", voiced: true, formants: [350, 1000, 2400] },
      M: { type: "nasal", voiced: true, formants: [250, 1200, 2100] },
      N: { type: "nasal", voiced: true, formants: [300, 1700, 2700] },
      NG: { type: "nasal", voiced: true, formants: [300, 2100, 2700] },
      F: { type: "fricative", voiced: false, noise: [4000] },
      H: { type: "fricative", voiced: false, noise: [2500] },
      L: { type: "liquid", voiced: true, formants: [400, 2400, 3400] },
    },
  },
};
