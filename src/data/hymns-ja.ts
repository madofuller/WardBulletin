// Japanese Hymn Database
// Maps Japanese hymn numbers (1-200) to Japanese titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints Japanese Hymnal (賛美歌)

export interface JapaneseHymn {
  title: string;
  englishSlug: string;
}

// Japanese hymn number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=jpn
export const JAPANESE_HYMNS: Record<number, JapaneseHymn> = {
  // 回復 (Restoration)
  1: { title: "夜明けだ，朝明けだ", englishSlug: "the-morning-breaks" },
  2: { title: "山の上に", englishSlug: "high-on-the-mountain-top" },
  3: { title: "主のみたまは火のごと燃え", englishSlug: "the-spirit-of-god" },
  4: { title: "イスラエルの救い主", englishSlug: "redeemer-of-israel" },
  5: { title: "いざ救いの日を楽しまん", englishSlug: "now-let-us-rejoice" },
  6: { title: "悩めるイスラエル", englishSlug: "israel-israel-god-is-calling" },
  7: { title: "目覚めよ，起て", englishSlug: "awake-ye-saints-of-god-awake" },
  8: { title: "来たれ，喜べや", englishSlug: "come-rejoice" },
  9: { title: "何を天に見しか", englishSlug: "what-was-witnessed-in-the-heavens" },
  10: { title: "長き沈黙破りて出づ", englishSlug: "an-angel-from-on-high" },
  11: { title: "感謝を神に捧げん", englishSlug: "we-thank-thee-o-god-for-a-prophet" },
  12: { title: "力の神よ", englishSlug: "god-of-power-god-of-right" },
  13: { title: "来たれ，予言者より", englishSlug: "come-listen-to-a-prophets-voice" },
  14: { title: "わが予言者に祝福あれ", englishSlug: "god-bless-our-prophet-dear" },
  15: { title: "悩める旅人", englishSlug: "a-poor-wayfaring-man-of-grief" },
  16: { title: "たたえよ，主の召したまいし", englishSlug: "praise-to-the-man" },
  17: { title: "恐れず来たれ，聖徒", englishSlug: "come-come-ye-saints" },
  18: { title: "麗しき朝よ", englishSlug: "joseph-smiths-first-prayer" },
  19: { title: "ああ，神いつまでも", englishSlug: "o-god-our-help-in-ages-past" },
  20: { title: "楽しき日は来て", englishSlug: "the-happy-day-at-last-has-come" },
  21: { title: "山の家", englishSlug: "our-mountain-home-so-dear" },
  22: { title: "高き山よ", englishSlug: "o-ye-mountains-high" },
  23: { title: "山の強さのため", englishSlug: "for-the-strength-of-the-hills" },
  24: { title: "国を造りたる", englishSlug: "they-the-builders-of-the-nation" },
  25: { title: "シオンの朝は輝き", englishSlug: "hail-to-the-brightness-of-zions-glad-morning" },
  26: { title: "山に囲まれて", englishSlug: "zion-stands-with-hills-surrounded" },
  27: { title: "み空に麗し", englishSlug: "beautiful-zion-built-above" },
  28: { title: "明けゆく空", englishSlug: "the-day-dawn-is-breaking" },
  29: { title: "来ませ，王の王", englishSlug: "come-o-thou-king-of-kings" },
  30: { title: "リパブリック賛歌", englishSlug: "battle-hymn-of-the-republic" },
  31: { title: "来たれ，主の子ら", englishSlug: "come-ye-children-of-the-lord" },

  // 賛美と感謝 (Praise and Thanksgiving)
  32: { title: "喜べ，主を", englishSlug: "rejoice-the-lord-is-king" },
  33: { title: "神に栄え", englishSlug: "glory-to-god-on-high" },
  34: { title: "神は造り主", englishSlug: "all-creatures-of-our-god-and-king" },
  35: { title: "やさしき天の父よ", englishSlug: "our-father-by-whose-name" },
  36: { title: "神はわが砦", englishSlug: "a-mighty-fortress-is-our-god" },
  37: { title: "造り主の主を", englishSlug: "praise-to-the-lord-the-almighty" },
  38: { title: "たたえよ神を", englishSlug: "praise-ye-the-lord" },
  39: { title: "主をたたえん", englishSlug: "praise-god-from-whom-all-blessings-flow" },
  40: { title: "全能の父なる神よ", englishSlug: "god-of-our-fathers-whose-almighty-hand" },
  41: { title: "導きたまえよ", englishSlug: "guide-us-o-thou-great-jehovah" },
  42: { title: "いにしえの聖徒の", englishSlug: "faith-of-our-fathers" },
  43: { title: "父なる神のもとに", englishSlug: "come-all-ye-saints-who-dwell-on-earth" },
  44: { title: "わが主よ，わが神", englishSlug: "how-great-thou-art" },
  45: { title: "神は愛なり", englishSlug: "god-is-love" },
  46: { title: "主のみ言葉は", englishSlug: "how-firm-a-foundation" },
  47: { title: "主は光", englishSlug: "the-lord-is-my-light" },
  48: { title: "父よ，子らはうたう", englishSlug: "father-thy-children-to-thee-now-raise" },
  49: { title: "感謝の祈り", englishSlug: "prayer-of-thanksgiving" },
  50: { title: "地は麗しく", englishSlug: "for-the-beauty-of-the-earth" },
  51: { title: "来たりてうたえ", englishSlug: "come-thou-fount-of-every-blessing" },

  // 祈りと願い (Prayer and Supplication)
  52: { title: "取り巻く闇の中を", englishSlug: "lead-kindly-light" },
  53: { title: "絶えず頼り主求む", englishSlug: "i-need-thee-every-hour" },
  54: { title: "主に近づかん", englishSlug: "nearer-dear-savior-to-thee" },
  55: { title: "神よ，汝れに近寄らん", englishSlug: "nearer-my-god-to-thee" },
  56: { title: "主よ，導きたまえや", englishSlug: "savior-lead-me-lest-i-stray" },
  57: { title: "主イエスよ，愛もて", englishSlug: "jesus-lover-of-my-soul" },
  58: { title: "尊き救い主", englishSlug: "jesus-the-very-thought-of-thee" },
  59: { title: "主よ，嵐すさび", englishSlug: "master-the-tempest-is-raging" },
  60: { title: "正義を守れと主に祈る", englishSlug: "lord-i-would-follow-thee" },
  61: { title: "主よ，荒海を導きたまえ", englishSlug: "jesus-savior-pilot-me" },
  62: { title: "主よ，祈り受けて", englishSlug: "lord-we-ask-thee-ere-we-part" },
  63: { title: "主はわが飼い手", englishSlug: "the-lord-is-my-shepherd" },
  64: { title: "主よ，汝がみ手に", englishSlug: "be-thou-humble" },
  65: { title: "飼い主はわれを", englishSlug: "the-lord-is-my-shepherd" },
  66: { title: "われに来よ", englishSlug: "come-unto-him" },
  67: { title: "主に来たれ", englishSlug: "come-unto-jesus" },
  68: { title: "来たれ，友よ", englishSlug: "come-follow-me" },
  69: { title: "試しは多くも", englishSlug: "count-your-blessings" },
  70: { title: "いともやさし", englishSlug: "how-gentle-gods-commands" },
  71: { title: "高ぶりを慎み", englishSlug: "be-thou-humble" },
  72: { title: "救い主，われ信ず", englishSlug: "i-believe-in-christ" },
  73: { title: "贖いの主", englishSlug: "o-savior-thou-who-wearest-a-crown" },
  74: { title: "さらに聖くなお努めん", englishSlug: "more-holiness-give-me" },
  75: { title: "主は生けりと知る", englishSlug: "i-know-that-my-redeemer-lives" },
  76: { title: "天の御父", englishSlug: "our-heavenly-father" },
  77: { title: "証", englishSlug: "testimony" },
  78: { title: "部屋を出る前に", englishSlug: "did-you-think-to-pray" },
  79: { title: "ひそかな祈り", englishSlug: "secret-prayer" },
  80: { title: "主イエスよ，わが胸", englishSlug: "jesus-the-very-thought-of-thee" },
  81: { title: "祈りは楽しき", englishSlug: "sweet-hour-of-prayer" },
  82: { title: "みたまはわれに", englishSlug: "let-the-holy-spirit-guide" },
  83: { title: "祈りは魂の", englishSlug: "prayer-is-the-souls-sincere-desire" },
  84: { title: "賛歌を捧げん", englishSlug: "sweet-is-the-work" },
  85: { title: "神よ，また逢うまで", englishSlug: "god-be-with-you-till-we-meet-again" },
  86: { title: "草の露は，主の", englishSlug: "as-the-dew-from-heaven-distilling" },
  87: { title: "わが神，わが王", englishSlug: "great-king-of-heaven" },
  88: { title: "わかれにまた", englishSlug: "god-be-with-you-till-we-meet-again" },
  89: { title: "み前にぬかずき", englishSlug: "father-in-heaven-we-do-believe" },
  90: { title: "陽は暮れゆきて", englishSlug: "now-the-day-is-over" },
  91: { title: "心に平和と", englishSlug: "where-can-i-turn-for-peace" },
  92: { title: "日は暮れ", englishSlug: "abide-with-me" },
  93: { title: "わかれに願う", englishSlug: "lord-dismiss-us-with-thy-blessing" },
  94: { title: "主よ，われと共に", englishSlug: "abide-with-me-tis-eventide" },
  95: { title: "日は暮れゆき", englishSlug: "softly-now-the-light-of-day" },

  // 聖餐 (Sacrament)
  96: { title: "父なる神よ", englishSlug: "god-our-father-hear-us-pray" },
  97: { title: "われら祈りまつる", englishSlug: "father-in-heaven-we-do-believe" },
  98: { title: "聖餐受くとき", englishSlug: "while-of-these-emblems-we-partake" },
  99: { title: "天にまします永遠なる父", englishSlug: "o-god-the-eternal-father" },
  100: { title: "ナザレ出しわが主よ", englishSlug: "jesus-of-nazareth-savior-and-king" },
  101: { title: "たぐいなき愛を", englishSlug: "in-humility-our-savior" },
  102: { title: "主よ，裂きしパンと", englishSlug: "in-memory-of-the-crucified" },
  103: { title: "罪人のために", englishSlug: "behold-the-great-redeemer-die" },
  104: { title: "敬い崇め", englishSlug: "reverently-and-meekly-now" },
  105: { title: "主の御名をたたえん", englishSlug: "tis-sweet-to-sing-the-matchless-love" },
  106: { title: "カルバリに", englishSlug: "upon-the-cross-of-calvary" },
  107: { title: "神は世を愛し", englishSlug: "god-loved-us-so-he-sent-his-son" },
  108: { title: "見よ，罪のために", englishSlug: "there-is-a-green-hill-far-away" },
  109: { title: "主イエスの愛に", englishSlug: "i-stand-all-amazed" },
  110: { title: "街を離れたる青き丘に", englishSlug: "there-is-a-green-hill-far-away" },
  111: { title: "十字架を覚え", englishSlug: "again-we-meet-around-the-board" },
  112: { title: "高きに満ちたる", englishSlug: "how-great-the-wisdom-and-the-love" },
  113: { title: "いやしく生まれ", englishSlug: "jesus-once-of-humble-birth" },

  // イースター (Easter)
  114: { title: "主はよみがえりぬ", englishSlug: "he-is-risen" },
  115: { title: "主はよみがえりぬ（アレルヤ）", englishSlug: "christ-the-lord-is-risen-today" },

  // クリスマス (Christmas)
  116: { title: "もろびと，こぞりて", englishSlug: "joy-to-the-world" },
  117: { title: "神の御子は今宵しも", englishSlug: "o-come-all-ye-faithful" },
  118: { title: "聖し，この夜", englishSlug: "silent-night" },
  119: { title: "み使い空に", englishSlug: "angels-we-have-heard-on-high" },
  120: { title: "天を降りし神の御子", englishSlug: "far-far-away-on-judeas-plains" },
  121: { title: "天なる神には", englishSlug: "it-came-upon-the-midnight-clear" },
  122: { title: "ああ，ベツレヘムよ", englishSlug: "o-little-town-of-bethlehem" },
  123: { title: "天には栄え", englishSlug: "hark-the-herald-angels-sing" },
  124: { title: "羊飼いらが", englishSlug: "while-shepherds-watched-their-flocks" },
  125: { title: "奇しきあか星", englishSlug: "with-wondering-awe" },
  126: { title: "昔，ユダヤの野辺に", englishSlug: "far-far-away-on-judeas-plains" },
  127: { title: "牧人，羊を", englishSlug: "the-first-noel" },
  128: { title: "なつかしい鐘は鳴る", englishSlug: "ring-out-wild-bells" },

  // 特別な主題 (Special Topics)
  129: { title: "若葉の春", englishSlug: "in-our-lovely-deseret" },
  130: { title: "天の装いの子羊，見よ", englishSlug: "behold-a-royal-army" },
  131: { title: "やさしく交わらん", englishSlug: "let-us-oft-speak-kind-words" },
  132: { title: "主のみ旨に従い行かん", englishSlug: "ill-go-where-you-want-me-to-go" },
  133: { title: "日々によき種と", englishSlug: "we-are-sowing" },
  134: { title: "われ主を愛して", englishSlug: "because-i-have-been-given-much" },
  135: { title: "来たれ，旅を共に続けん", englishSlug: "each-life-that-touches-ours-for-good" },
  136: { title: "羊を守れる羊飼いの愛", englishSlug: "dear-to-the-heart-of-the-shepherd" },
  137: { title: "今日われ善きことせしか", englishSlug: "have-i-done-any-good" },
  138: { title: "主の恵み，人にも分かたん", englishSlug: "because-i-have-been-given-much" },
  139: { title: "心に光あり", englishSlug: "there-is-sunshine-in-my-soul-today" },
  140: { title: "親しく語り合わん", englishSlug: "let-us-oft-speak-kind-words" },
  141: { title: "心の中に光を持てば", englishSlug: "there-is-sunshine-in-my-soul-today" },
  142: { title: "日の照る間に働け", englishSlug: "today-while-the-sun-shines" },
  143: { title: "光を道にまけ", englishSlug: "scatter-sunshine" },
  144: { title: "愛の神，賛めよ", englishSlug: "praise-god-from-whom-all-blessings-flow" },
  145: { title: "陽の落ちぬ間に", englishSlug: "today-while-the-sun-shines" },
  146: { title: "時を惜しみて", englishSlug: "improve-the-shining-moments" },
  147: { title: "人の過ちを", englishSlug: "nay-speak-no-ill" },
  148: { title: "この家，父なる神に捧ぐ", englishSlug: "this-house-we-dedicate-to-thee" },
  149: { title: "神のみ業に進みて", englishSlug: "go-forth-with-faith" },
  150: { title: "悪を言うな", englishSlug: "nay-speak-no-ill" },
  151: { title: "正しかれ", englishSlug: "do-what-is-right" },
  152: { title: "選べ，正義を", englishSlug: "choose-the-right" },
  153: { title: "み恵み数えあげ", englishSlug: "count-your-blessings" },
  154: { title: "来たれ，来たれ", englishSlug: "let-us-all-press-on" },
  155: { title: "戦い進め", englishSlug: "onward-christian-soldiers" },
  156: { title: "刈り手を待ちつつ", englishSlug: "the-field-is-white" },
  157: { title: "われらは天の王に", englishSlug: "we-are-all-enlisted" },
  158: { title: "いとまされる", englishSlug: "called-to-serve" },
  159: { title: "シオンのつわもの", englishSlug: "hope-of-israel" },
  160: { title: "見よ，王の軍は", englishSlug: "behold-a-royal-army" },
  161: { title: "世はよく働く人を求む", englishSlug: "put-your-shoulder-to-the-wheel" },
  162: { title: "戦い止むまで", englishSlug: "true-to-the-faith" },
  163: { title: "シオンの若者，真理を守り", englishSlug: "carry-on" },
  164: { title: "力強き主よ", englishSlug: "god-of-our-fathers-whose-almighty-hand" },
  165: { title: "主の方には", englishSlug: "whos-on-the-lords-side" },
  166: { title: "天よりの声聞け", englishSlug: "ye-elders-of-israel" },
  167: { title: "山のごとく強く", englishSlug: "true-to-the-faith" },
  168: { title: "信仰もて行け", englishSlug: "go-forth-with-faith" },
  169: { title: "時過ぎて", englishSlug: "the-time-is-far-spent" },
  170: { title: "高き知恵もて", englishSlug: "if-you-could-hie-to-kolob" },
  171: { title: "エホバ，天地の主", englishSlug: "jehovah-lord-of-heaven-and-earth" },
  172: { title: "み旨のまま行かん", englishSlug: "ill-go-where-you-want-me-to-go" },
  173: { title: "高きに導く", englishSlug: "the-iron-rod" },
  174: { title: "真理，胸に照り", englishSlug: "truth-reflects-upon-our-senses" },
  175: { title: "真理は何と言えば", englishSlug: "o-say-what-is-truth" },
  176: { title: "鉄の棒", englishSlug: "the-iron-rod" },
  177: { title: "われみ言葉読む", englishSlug: "as-i-search-the-holy-scriptures" },
  178: { title: "楽し安息の日", englishSlug: "welcome-welcome-sabbath-morning" },
  179: { title: "われら天にまた会うとき", englishSlug: "god-be-with-you-till-we-meet-again" },
  180: { title: "高きに栄えて", englishSlug: "o-my-father" },
  181: { title: "家庭の愛", englishSlug: "love-at-home" },
  182: { title: "主よ霊感もて", englishSlug: "help-me-teach-with-inspiration" },
  183: { title: "起て，宮に入りて", englishSlug: "rise-ye-saints-and-temples-enter" },
  184: { title: "母よ，われ美しき夢見ぬ", englishSlug: "o-my-father" },
  185: { title: "神の聖徒の", englishSlug: "come-come-ye-saints" },
  186: { title: "愛ある家は", englishSlug: "home-can-be-a-heaven-on-earth" },

  // 子供の歌 (Children's Songs)
  187: { title: "家族は永遠に", englishSlug: "families-can-be-together-forever" },
  188: { title: "光となるように", englishSlug: "teach-me-to-walk-in-the-light" },
  189: { title: "神の子です", englishSlug: "i-am-a-child-of-god" },
  190: { title: "お父さまは生きています", englishSlug: "i-know-my-father-lives" },
  191: { title: "神の光受け", englishSlug: "the-light-divine" },
  192: { title: "共に愛し合え", englishSlug: "love-one-another" },
  193: { title: "戒めを守る人を", englishSlug: "keep-the-commandments" },
  194: { title: "光の中進もう", englishSlug: "teach-me-to-walk-in-the-light" },

  // 女声用 (Women's Voices)
  195: { title: "シオンの娘", englishSlug: "as-sisters-in-zion" },

  // 男声用 (Men's Voices)
  196: { title: "イスラエルの長老たちよ", englishSlug: "ye-elders-of-israel" },
  197: { title: "み言葉により", englishSlug: "let-us-all-press-on" },
  198: { title: "心を抑えよ", englishSlug: "school-thy-feelings" },
  199: { title: "神権持つ子らよ", englishSlug: "rise-up-o-men-of-god" },
  200: { title: "天父は灯台のごとく", englishSlug: "brightly-beams-our-fathers-mercy" }
};

// Get the Japanese hymn title by number
export const getJapaneseHymnTitle = (number: number): string => {
  return JAPANESE_HYMNS[number]?.title || '';
};

// Get the English slug for URL generation
export const getJapaneseHymnEnglishSlug = (number: number): string => {
  return JAPANESE_HYMNS[number]?.englishSlug || '';
};

// Check if a hymn number is valid in the Japanese hymnal
export const isValidJapaneseHymnNumber = (number: number): boolean => {
  return number in JAPANESE_HYMNS;
};

// Generate URL for Japanese hymn (uses English slug with ?lang=jpn)
export const getJapaneseHymnUrl = (number: number): string => {
  const hymn = JAPANESE_HYMNS[number];
  if (!hymn) return '';

  const slug = hymn.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/hymns/${slug}?lang=jpn`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=hymns&lang=jpn`;
};

// Search Japanese hymns by title
export const searchJapaneseHymnByTitle = (searchTerm: string): Array<{number: number, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: number, title: string}> = [];

  // Search through all Japanese hymns
  Object.entries(JAPANESE_HYMNS).forEach(([number, hymn]) => {
    if (hymn.title.toLowerCase().includes(term)) {
      results.push({
        number: parseInt(number),
        title: hymn.title
      });
    }
  });

  // Sort by relevance (exact matches first, then by number)
  return results.sort((a, b) => {
    const aExact = a.title.toLowerCase().startsWith(term);
    const bExact = b.title.toLowerCase().startsWith(term);

    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    return a.number - b.number;
  }).slice(0, 10); // Limit to 10 results
};
