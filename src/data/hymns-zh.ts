// Chinese (Traditional) Hymn Database
// Maps Chinese hymn numbers (1-200) to Chinese titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints Chinese Hymnal

export interface ChineseHymn {
  title: string;
  englishSlug: string;
}

// Chinese hymn number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=zho
export const CHINESE_HYMNS: Record<number, ChineseHymn> = {
  // 復興 (Restoration) - Hymns 1-31
  1: { title: "晨光熹微", englishSlug: "the-morning-breaks" },
  2: { title: "神靈如火", englishSlug: "the-spirit-of-god" },
  3: { title: "我們舉行慶祝", englishSlug: "now-let-us-rejoice" },
  4: { title: "真理永恆", englishSlug: "truth-eternal" },
  5: { title: "在巍峨高山上", englishSlug: "high-on-the-mountain-top" },
  6: { title: "以色列的救贖主", englishSlug: "redeemer-of-israel" },
  7: { title: "以色列哪，神在召喚", englishSlug: "israel-israel-god-is-calling" },
  8: { title: "我看見一位天使", englishSlug: "i-saw-a-mighty-angel-fly" },
  9: { title: "天使來自高天", englishSlug: "an-angel-from-on-high" },
  10: { title: "感謝神賜我們先知", englishSlug: "we-thank-thee-o-god-for-a-prophet" },
  11: { title: "來傾聽先知的聲音", englishSlug: "come-listen-to-a-prophets-voice" },
  12: { title: "為先知禱告", englishSlug: "we-ever-pray-for-thee" },
  13: { title: "求神祝福先知", englishSlug: "god-bless-our-prophet-dear" },
  14: { title: "斯密約瑟的初次祈禱", englishSlug: "joseph-smiths-first-prayer" },
  15: { title: "讚美先知", englishSlug: "praise-to-the-man" },
  16: { title: "聖徒讚美耶和華", englishSlug: "saints-behold-how-great-jehovah" },
  17: { title: "一個憂傷旅途中人", englishSlug: "a-poor-wayfaring-man-of-grief" },
  18: { title: "聖徒齊來", englishSlug: "come-come-ye-saints" },
  19: { title: "快樂時刻終於來臨", englishSlug: "the-happy-day-at-last-has-come" },
  20: { title: "羣山環繞家園", englishSlug: "our-mountain-home-so-dear" },
  21: { title: "高山仰止", englishSlug: "o-ye-mountains-high" },
  22: { title: "羣山壯麗", englishSlug: "for-the-strength-of-the-hills" },
  23: { title: "錫安聖徒", englishSlug: "o-saints-of-zion" },
  24: { title: "錫安的快樂早晨", englishSlug: "hail-to-the-brightness-of-zions-glad-morning" },
  25: { title: "錫安屹立羣山中", englishSlug: "zion-stands-with-hills-surrounded" },
  26: { title: "美麗的錫安", englishSlug: "beautiful-zion-built-above" },
  27: { title: "導我入永生", englishSlug: "lead-me-into-life-eternal" },
  28: { title: "美麗錫安神的聖城", englishSlug: "glorious-things-are-sung-of-zion" },
  29: { title: "破曉天明", englishSlug: "the-day-dawn-is-breaking" },
  30: { title: "看哪，偉大父神君臨！", englishSlug: "lo-the-mighty-god-appearing" },
  31: { title: "來吧！神的兒女們", englishSlug: "come-ye-children-of-the-lord" },

  // 讚美及感恩 (Praise and Thanks) - Hymns 32-47
  32: { title: "萬物頌主", englishSlug: "all-creatures-of-our-god-and-king" },
  33: { title: "萬王之王請來", englishSlug: "come-o-thou-king-of-kings" },
  34: { title: "歡欣，救主是王", englishSlug: "rejoice-the-lord-is-king" },
  35: { title: "榮歸真神", englishSlug: "glory-to-god-on-high" },
  36: { title: "主為堅城", englishSlug: "a-mighty-fortress-is-our-god" },
  37: { title: "神，我們來就祢", englishSlug: "god-of-our-fathers-we-come-unto-thee" },
  38: { title: "至高之神", englishSlug: "great-is-the-lord" },
  39: { title: "全能的神", englishSlug: "god-of-our-fathers-whose-almighty-hand" },
  40: { title: "耶和華請祢引導我", englishSlug: "guide-us-o-thou-great-jehovah" },
  41: { title: "穩當根基", englishSlug: "how-firm-a-foundation" },
  42: { title: "祢何偉大", englishSlug: "how-great-thou-art" },
  43: { title: "神是愛", englishSlug: "god-is-love" },
  44: { title: "收成歌", englishSlug: "come-ye-thankful-people" },
  45: { title: "主是我的光", englishSlug: "the-lord-is-my-light" },
  46: { title: "感謝大地好風光", englishSlug: "for-the-beauty-of-the-earth" },
  47: { title: "親愛孩子，神接近你", englishSlug: "dearest-children-god-is-near-you" },

  // 祈禱及祈求 (Prayer and Supplication) - Hymns 48-103
  48: { title: "慈光歌", englishSlug: "lead-kindly-light" },
  49: { title: "我時時需要主", englishSlug: "i-need-thee-every-hour" },
  50: { title: "更加與救主接近", englishSlug: "nearer-dear-savior-to-thee" },
  51: { title: "更加與主接近", englishSlug: "nearer-my-god-to-thee" },
  52: { title: "領我就祢", englishSlug: "guide-me-to-thee" },
  53: { title: "耶穌我靈避難所", englishSlug: "jesus-lover-of-my-soul" },
  54: { title: "高貴救贖主", englishSlug: "precious-savior-dear-redeemer" },
  55: { title: "主啊，狂風正在怒號", englishSlug: "master-the-tempest-is-raging" },
  56: { title: "求救主來掌我舵", englishSlug: "jesus-savior-pilot-me" },
  57: { title: "主接納我們的熱忱", englishSlug: "lord-accept-our-true-devotion" },
  58: { title: "主是我的牧羊人", englishSlug: "the-lord-is-my-shepherd" },
  59: { title: "救主供我牧場", englishSlug: "the-lord-my-pasture-will-prepare" },
  60: { title: "萬古磐石", englishSlug: "rock-of-ages" },
  61: { title: "耶穌，我靈的救贖主", englishSlug: "savior-redeemer-of-my-soul" },
  62: { title: "救主之愛", englishSlug: "our-saviors-love" },
  63: { title: "來跟隨我", englishSlug: "come-follow-me" },
  64: { title: "來近主耶穌", englishSlug: "come-unto-jesus" },
  65: { title: "信心堅定", englishSlug: "when-faith-endures" },
  66: { title: "重重考驗", englishSlug: "though-deepening-trials" },
  67: { title: "我靈鎮靜", englishSlug: "be-still-my-soul" },
  68: { title: "天父諄諄訓誨", englishSlug: "how-gentle-gods-commands" },
  69: { title: "靠主胸懷", englishSlug: "lean-on-my-ample-arm" },
  70: { title: "你要謙遜", englishSlug: "be-thou-humble" },
  71: { title: "使我更加聖潔", englishSlug: "more-holiness-give-me" },
  72: { title: "聖殿是神世上屋宇", englishSlug: "god-is-in-his-holy-temple" },
  73: { title: "天上的父", englishSlug: "father-in-heaven" },
  74: { title: "我信賴基督", englishSlug: "i-believe-in-christ" },
  75: { title: "我救贖主活著", englishSlug: "my-redeemer-lives" },
  76: { title: "我知道救主活著", englishSlug: "i-know-that-my-redeemer-lives" },
  77: { title: "見證", englishSlug: "testimony" },
  78: { title: "我們禁食同來崇拜", englishSlug: "in-fasting-we-approach-thee" },
  79: { title: "靜靜的祈禱", englishSlug: "secret-prayer" },
  80: { title: "莫忘禱告", englishSlug: "did-you-think-to-pray" },
  81: { title: "耶穌，每逢想念著祢", englishSlug: "jesus-the-very-thought-of-thee" },
  82: { title: "禱告良辰", englishSlug: "sweet-hour-of-prayer" },
  83: { title: "讓聖靈來指引你", englishSlug: "let-the-holy-spirit-guide" },
  84: { title: "誠願祈禱", englishSlug: "prayer-is-the-souls-sincere-desire" },
  85: { title: "聖樂悠揚", englishSlug: "gently-raise-the-sacred-strain" },
  86: { title: "美哉神工", englishSlug: "sweet-is-the-work" },
  87: { title: "天降甘露", englishSlug: "as-the-dew-from-heaven-distilling" },
  88: { title: "讚美親愛仁慈天父", englishSlug: "o-thou-kind-and-gracious-father" },
  89: { title: "親愛救主，我們聚會", englishSlug: "we-meet-dear-lord" },
  90: { title: "願主同在直到再相會", englishSlug: "god-be-with-you-till-we-meet-again" },
  91: { title: "主啊，我們分別時", englishSlug: "lord-we-ask-thee-ere-we-part" },
  92: { title: "離別一曲高歌", englishSlug: "sing-we-now-at-parting" },
  93: { title: "主，祢的靈，感動我心", englishSlug: "thy-spirit-lord-has-stirred-our-souls" },
  94: { title: "在主面前", englishSlug: "before-thee-lord-i-bow-my-head" },
  95: { title: "白日剛才過去", englishSlug: "now-the-day-is-over" },
  96: { title: "暮色蒼茫", englishSlug: "softly-now-the-light-of-day" },
  97: { title: "願主同在", englishSlug: "the-lord-be-with-us" },
  98: { title: "會畢祝福", englishSlug: "lord-dismiss-us-with-thy-blessing" },
  99: { title: "我們歌頌偉大父神", englishSlug: "great-god-to-thee-my-evening-song" },
  100: { title: "時已黃昏，求主同在", englishSlug: "abide-with-me-tis-eventide" },
  101: { title: "與我同住", englishSlug: "abide-with-me" },
  102: { title: "齊來歌唱讚美詩篇", englishSlug: "come-let-us-sing-an-evening-hymn" },
  103: { title: "夜幕低垂", englishSlug: "as-the-shadows-fall" },

  // 聖餐 (Sacrament) - Hymns 104-119
  104: { title: "父，求祢聽我們禱告", englishSlug: "god-our-father-hear-us-pray" },
  105: { title: "我心謙卑", englishSlug: "with-humble-heart" },
  106: { title: "謙卑求主", englishSlug: "in-humility-our-savior" },
  107: { title: "當我們參與聖餐時", englishSlug: "while-of-these-emblems-we-partake" },
  108: { title: "永恆的天父神啊", englishSlug: "o-god-the-eternal-father" },
  109: { title: "拿撒勒的耶穌", englishSlug: "jesus-of-nazareth-savior-and-king" },
  110: { title: "無比愛心", englishSlug: "tis-sweet-to-sing-the-matchless-love" },
  111: { title: "髑髏山十字架上", englishSlug: "upon-the-cross-of-calvary" },
  112: { title: "歌頌歡呼耶穌之名", englishSlug: "well-sing-all-hail-to-jesus-name" },
  113: { title: "記念十字架上救主", englishSlug: "in-memory-of-the-crucified" },
  114: { title: "看，偉大救贖主死亡", englishSlug: "behold-the-great-redeemer-die" },
  115: { title: "偉大救贖主死亡", englishSlug: "he-died-the-great-redeemer-died" },
  116: { title: "令我驚奇", englishSlug: "i-stand-all-amazed" },
  117: { title: "城外青山歌", englishSlug: "there-is-a-green-hill-far-away" },
  118: { title: "大愛與大智", englishSlug: "how-great-the-wisdom-and-the-love" },
  119: { title: "耶穌出生微賤地", englishSlug: "jesus-once-of-humble-birth" },

  // 復活節 (Easter) - Hymns 120-121
  120: { title: "祂已復生", englishSlug: "he-is-risen" },
  121: { title: "基督我主今復生", englishSlug: "christ-the-lord-is-risen-today" },

  // 聖誕節 (Christmas) - Hymns 122-133
  122: { title: "普世歡騰", englishSlug: "joy-to-the-world" },
  123: { title: "齊來，宗主信徒", englishSlug: "oh-come-all-ye-faithful" },
  124: { title: "天使歌唱在高天", englishSlug: "angels-we-have-heard-on-high" },
  125: { title: "平安夜", englishSlug: "silent-night" },
  126: { title: "昔日在大衛王城中", englishSlug: "once-in-royal-davids-city" },
  127: { title: "在客店馬槽裡", englishSlug: "away-in-a-manger" },
  128: { title: "夜半歌聲", englishSlug: "it-came-upon-the-midnight-clear" },
  129: { title: "美哉小城", englishSlug: "o-little-town-of-bethlehem" },
  130: { title: "聽啊！天使高聲唱", englishSlug: "hark-the-herald-angels-sing" },
  131: { title: "猶大遙遠原野深", englishSlug: "far-far-away-on-judeas-plains" },
  132: { title: "聖誕佳音", englishSlug: "the-first-noel" },
  133: { title: "聖誕鐘聲", englishSlug: "i-heard-the-bells-on-christmas-day" },

  // 特殊主題 (Special Topics) - Hymns 134-191
  134: { title: "因為我已獲賜良多", englishSlug: "because-i-have-been-given-much" },
  135: { title: "我可曾行善？", englishSlug: "have-i-done-any-good" },
  136: { title: "牧者所愛", englishSlug: "dear-to-the-heart-of-the-shepherd" },
  137: { title: "主，我願跟隨祢", englishSlug: "lord-i-would-follow-thee" },
  138: { title: "我有未完的使命", englishSlug: "i-have-work-enough-to-do" },
  139: { title: "朝榮光前進", englishSlug: "we-are-marching-on-to-glory" },
  140: { title: "及時努力", englishSlug: "improve-the-shining-moments" },
  141: { title: "日光照我心", englishSlug: "there-is-sunshine-in-my-soul-today" },
  142: { title: "勿批評過錯", englishSlug: "nay-speak-no-ill" },
  143: { title: "大好韶光", englishSlug: "today-while-the-sun-shines" },
  144: { title: "溫和的言語", englishSlug: "let-us-oft-speak-kind-words" },
  145: { title: "你能使前途光明", englishSlug: "you-can-make-the-pathway-bright" },
  146: { title: "救主，求祢接納我們", englishSlug: "lord-accept-into-thy-kingdom" },
  147: { title: "祢是救恩的磐石", englishSlug: "o-thou-rock-of-our-salvation" },
  148: { title: "選正義", englishSlug: "choose-the-right" },
  149: { title: "計算恩典", englishSlug: "count-your-blessings" },
  150: { title: "讚美神", englishSlug: "praise-god-from-whom-all-blessings-flow" },
  151: { title: "大家齊向前", englishSlug: "let-us-all-press-on" },
  152: { title: "齊向前", englishSlug: "come-along-come-along" },
  153: { title: "奉獻屋宇", englishSlug: "this-house-we-dedicate-to-thee" },
  154: { title: "信徒如同精兵", englishSlug: "onward-christian-soldiers" },
  155: { title: "神啊，我愛祢家", englishSlug: "we-love-thy-house-o-god" },
  156: { title: "蒙召喚去服務", englishSlug: "called-to-serve" },
  157: { title: "我等皆是軍人", englishSlug: "we-are-all-enlisted" },
  158: { title: "用肩膀扛起巨輪", englishSlug: "put-your-shoulder-to-the-wheel" },
  159: { title: "忠於信仰", englishSlug: "true-to-the-faith" },
  160: { title: "往前闖", englishSlug: "carry-on" },
  161: { title: "依義而行", englishSlug: "do-what-is-right" },
  162: { title: "末世錫安青年", englishSlug: "as-zions-youth-in-latter-days" },
  163: { title: "以色列民全力起", englishSlug: "hope-of-israel" },
  164: { title: "誰站在主一邊", englishSlug: "whos-on-the-lords-side" },
  165: { title: "聽，各國請聽！", englishSlug: "hark-all-ye-nations" },
  166: { title: "神啊，興起發光", englishSlug: "arise-o-god-and-shine" },
  167: { title: "憑信心往前進", englishSlug: "go-forth-with-faith" },
  168: { title: "為時已無多", englishSlug: "the-time-is-far-spent" },
  169: { title: "任主差遣", englishSlug: "ill-go-where-you-want-me-to-go" },
  170: { title: "聖工奇偉", englishSlug: "how-wondrous-and-great" },
  171: { title: "當我研讀神聖經文", englishSlug: "as-i-search-the-holy-scriptures" },
  172: { title: "神聖經文", englishSlug: "thy-holy-word" },
  173: { title: "甚麼是真理", englishSlug: "oh-say-what-is-truth" },
  174: { title: "真理反映", englishSlug: "truth-reflects-upon-our-senses" },
  175: { title: "鐵桿", englishSlug: "the-iron-rod" },
  176: { title: "來上主日學", englishSlug: "come-away-to-the-sunday-school" },
  177: { title: "感謝主日學校", englishSlug: "thanks-for-the-sabbath-school" },
  178: { title: "歡迎，歡迎，安息早晨", englishSlug: "welcome-welcome-sabbath-morning" },
  179: { title: "助我憑聖靈教導", englishSlug: "help-me-teach-with-inspiration" },
  180: { title: "主日學我們同相聚", englishSlug: "we-meet-again-in-sabbath-school" },
  181: { title: "榮耀福音光照四方", englishSlug: "the-glorious-gospel-light-has-shone" },
  182: { title: "聖哉天父", englishSlug: "o-my-father" },
  183: { title: "愛在家", englishSlug: "love-at-home" },
  184: { title: "家可成人間天堂", englishSlug: "home-can-be-a-heaven-on-earth" },

  // 兒童歌曲 (Children's Songs) - Hymns 185-191
  185: { title: "神的兒女最為平安", englishSlug: "children-of-our-heavenly-father" },
  186: { title: "家庭能永遠在一起", englishSlug: "families-can-be-together-forever" },
  187: { title: "我是神的孩子", englishSlug: "i-am-a-child-of-god" },
  188: { title: "我知天父活著", englishSlug: "i-know-my-father-lives" },
  189: { title: "遵守神的誡命", englishSlug: "keep-the-commandments" },
  190: { title: "教我走在光明裡", englishSlug: "teach-me-to-walk-in-the-light" },
  191: { title: "可愛錫安地", englishSlug: "in-our-lovely-deseret" },

  // 男聲歌曲 (Men's Songs) - Hymns 192-193
  192: { title: "以色列長老們", englishSlug: "ye-elders-of-israel" },
  193: { title: "你蒙召喚做事工", englishSlug: "ye-who-are-called-to-labor" },

  // 女聲歌曲 (Women's Songs) - Hymns 194-200
  194: { title: "耶穌，每逢想念著祢", englishSlug: "jesus-the-very-thought-of-thee" },
  195: { title: "神是愛", englishSlug: "god-is-love" },
  196: { title: "主是我的牧羊人", englishSlug: "the-lord-is-my-shepherd" },
  197: { title: "美哉神工", englishSlug: "sweet-is-the-work" },
  198: { title: "愛在家", englishSlug: "love-at-home" },
  199: { title: "錫安姊妹同來", englishSlug: "as-sisters-in-zion" },
  200: { title: "彼此相愛", englishSlug: "love-one-another" },
};

// Get the Chinese hymn title by number
export const getChineseHymnTitle = (number: number): string => {
  return CHINESE_HYMNS[number]?.title || '';
};

// Get the English slug for URL generation
export const getChineseHymnEnglishSlug = (number: number): string => {
  return CHINESE_HYMNS[number]?.englishSlug || '';
};

// Check if a hymn number is valid in the Chinese hymnal
export const isValidChineseHymnNumber = (number: number): boolean => {
  return number in CHINESE_HYMNS;
};

// Generate URL for Chinese hymn (uses English slug with ?lang=zho)
export const getChineseHymnUrl = (number: number): string => {
  const hymn = CHINESE_HYMNS[number];
  if (!hymn) return '';

  const slug = hymn.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/hymns/${slug}?lang=zho`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=hymns&lang=zho`;
};

// Search Chinese hymns by title
export const searchChineseHymnByTitle = (searchTerm: string): Array<{number: number, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: number, title: string}> = [];

  // Search through all Chinese hymns
  Object.entries(CHINESE_HYMNS).forEach(([number, hymn]) => {
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
