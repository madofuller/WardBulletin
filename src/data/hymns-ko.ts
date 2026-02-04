// Korean Hymn Database
// Maps Korean hymn numbers (1-201) to Korean titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints Korean Hymnal (찬송가)

export interface KoreanHymn {
  title: string;
  englishSlug: string;
}

// Korean hymn number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=kor
export const KOREAN_HYMNS: Record<number, KoreanHymn> = {
  // 회복 (Restoration) - Hymns 1-32
  1: { title: "선지자와 구주의 음성", englishSlug: "come-listen-to-a-prophets-voice" },
  2: { title: "높은 산 언덕 위", englishSlug: "high-on-the-mountain-top" },
  3: { title: "다 와서 주께 찬양하세", englishSlug: "now-let-us-rejoice" },
  4: { title: "동트니 날이 밝는다", englishSlug: "the-morning-breaks" },
  5: { title: "소리 모아 노래해", englishSlug: "now-well-sing-with-one-accord" },
  6: { title: "우리 인도하실 선지자 주신", englishSlug: "we-thank-thee-o-god-for-a-prophet" },
  7: { title: "복음이 지닌 평화", englishSlug: "truth-eternal" },
  8: { title: "아름다운 시온 위에다", englishSlug: "beautiful-zion-built-above" },
  9: { title: "거룩하신 복음으로", englishSlug: "the-glorious-gospel-light-has-shone" },
  10: { title: "애통하는 이스라엘", englishSlug: "israel-israel-god-is-calling" },
  11: { title: "영광의 시온 세우신 하나님", englishSlug: "zion-stands-with-hills-surrounded" },
  12: { title: "선지자의 음성", englishSlug: "come-listen-to-a-prophets-voice" },
  13: { title: "오라 주의 자녀들", englishSlug: "come-ye-children-of-the-lord" },
  14: { title: "오래 기다리던 만왕의 왕", englishSlug: "come-o-thou-king-of-kings" },
  15: { title: "와서 기쁜 노래하라", englishSlug: "come-thou-glorious-day-of-promise" },
  16: { title: "성도들아 두려울 것 없다", englishSlug: "come-come-ye-saints" },
  17: { title: "보아라 저 위대하신 여호와", englishSlug: "jehovah-lord-of-heaven-and-earth" },
  18: { title: "찬양해 여호와와 대화한 사람", englishSlug: "praise-to-the-man" },
  19: { title: "영원하고 거룩한 진리", englishSlug: "truth-eternal" },
  20: { title: "주님 영광 한이 없다", englishSlug: "let-zion-in-her-beauty-rise" },
  21: { title: "예부터 도움 되시고 내 소망 되신 주", englishSlug: "o-god-our-help-in-ages-past" },
  22: { title: "전승가", englishSlug: "battle-hymn-of-the-republic" },
  23: { title: "주께 찬양하여라", englishSlug: "hail-to-the-brightness-of-zions-glad-morning" },
  24: { title: "조셉 스미스의 첫 번째 기도", englishSlug: "joseph-smiths-first-prayer" },
  25: { title: "우리 사랑하는 선지자를 위하여", englishSlug: "we-ever-pray-for-thee" },
  26: { title: "일어나라 주의 성도", englishSlug: "arise-o-god-and-shine" },
  27: { title: "이스라엘 구속주", englishSlug: "redeemer-of-israel" },
  28: { title: "하늘에서 온 천사", englishSlug: "an-angel-from-on-high" },
  29: { title: "사랑의 하나님 우리의 선지자", englishSlug: "god-bless-our-prophet-dear" },
  30: { title: "슬픔에 잠긴 나그네", englishSlug: "a-poor-wayfaring-man-of-grief" },
  31: { title: "타는 듯한 하나님의 영", englishSlug: "the-spirit-of-god" },
  32: { title: "우리 구원의 날을 함께 다 즐기세", englishSlug: "now-let-us-rejoice" },

  // 찬양과 감사 (Praise and Thanks) - Hymns 33-57
  33: { title: "감사 기도", englishSlug: "prayer-of-thanksgiving" },
  34: { title: "감사하는 백성아", englishSlug: "come-ye-thankful-people" },
  35: { title: "굳도다 그 기초", englishSlug: "how-firm-a-foundation" },
  36: { title: "기뻐하라 너희 주는 왕이시라", englishSlug: "rejoice-the-lord-is-king" },
  37: { title: "내 정성 다하여 주님께 감사하네", englishSlug: "now-thank-we-all-our-god" },
  38: { title: "이 즐겁고 기쁜 날에", englishSlug: "for-the-strength-of-the-hills" },
  39: { title: "위대하신 하나님을", englishSlug: "praise-to-the-lord-the-almighty" },
  40: { title: "사랑하는 자녀들아", englishSlug: "dearest-children-god-is-near-you" },
  41: { title: "내 주는 강한 요새요", englishSlug: "a-mighty-fortress-is-our-god" },
  42: { title: "왕이 되시는 주께", englishSlug: "all-glory-laud-and-honor" },
  43: { title: "위대하신 여호와여", englishSlug: "guide-us-o-thou-great-jehovah" },
  44: { title: "진리로 자유케 된 자녀들", englishSlug: "o-ye-mountains-high" },
  45: { title: "아름다운 세상", englishSlug: "for-the-beauty-of-the-earth" },
  46: { title: "온 세상에 있는 성도들", englishSlug: "come-all-ye-saints-who-dwell-on-earth" },
  47: { title: "소리 높여 찬양해", englishSlug: "sing-praise-to-him" },
  48: { title: "주는 나의 빛", englishSlug: "the-lord-is-my-light" },
  49: { title: "하나님께 영광", englishSlug: "glory-to-god-on-high" },
  50: { title: "주 하나님 지으신 모든 세계", englishSlug: "how-great-thou-art" },
  51: { title: "전능하신 조상의 하나님", englishSlug: "god-of-our-fathers-whose-almighty-hand" },
  52: { title: "하늘 아래 사는 온 백성아", englishSlug: "from-all-that-dwell-below-the-skies" },
  53: { title: "하나님은 사랑이라", englishSlug: "god-is-love" },
  54: { title: "땅 위에 사는 성도들", englishSlug: "ye-simple-souls-who-stray" },
  55: { title: "전진하세 주 예수 믿으니", englishSlug: "press-forward-saints" },
  56: { title: "전지 전능하신 주님께", englishSlug: "great-is-the-lord" },
  57: { title: "온 천하 만물 우러러", englishSlug: "all-creatures-of-our-god-and-king" },

  // 기도와 간구 (Prayer and Supplication) - Hymns 58-104
  58: { title: "간증", englishSlug: "testimony" },
  59: { title: "주여 큰 폭풍우 일고", englishSlug: "master-the-tempest-is-raging" },
  60: { title: "거룩함도 더욱", englishSlug: "more-holiness-give-me" },
  61: { title: "기도는 영혼의 소망", englishSlug: "prayer-is-the-souls-sincere-desire" },
  62: { title: "내 평안 어디서 찾을 수 있나", englishSlug: "where-can-i-turn-for-peace" },
  63: { title: "나의 하나님 나의 왕", englishSlug: "come-we-that-love-the-lord" },
  64: { title: "내 영혼 구한 구속주", englishSlug: "my-redeemer-lives" },
  65: { title: "날 따르라", englishSlug: "lord-i-would-follow-thee" },
  66: { title: "주여 복을 비옵나니", englishSlug: "father-this-hour-has-been-one-of-joy" },
  67: { title: "고해 같은 인생길", englishSlug: "does-the-journey-seem-long" },
  68: { title: "내 구주 살아 계시다", englishSlug: "i-know-that-my-redeemer-lives" },
  69: { title: "주 사랑하는 자", englishSlug: "come-we-that-love-the-lord" },
  70: { title: "나 그리스도 믿습니다", englishSlug: "i-believe-in-christ" },
  71: { title: "이제 비오니 주여", englishSlug: "lord-we-ask-thee-ere-we-part" },
  72: { title: "낮도 다간 이 저녁에", englishSlug: "now-the-day-is-over" },
  73: { title: "성령 인도하시어", englishSlug: "let-the-holy-spirit-guide" },
  74: { title: "우리 다시 만나 볼 동안", englishSlug: "god-be-with-you-till-we-meet-again" },
  75: { title: "승리한 나의 구속주", englishSlug: "my-redeemer-lives" },
  76: { title: "오늘 네 집 떠나올 때", englishSlug: "did-you-think-to-pray" },
  77: { title: "예수께 오라", englishSlug: "come-unto-jesus" },
  78: { title: "은밀한 기도", englishSlug: "secret-prayer" },
  79: { title: "어둠에 싸인 밤에", englishSlug: "lead-kindly-light" },
  80: { title: "내 기도하는 그 시간", englishSlug: "sweet-hour-of-prayer" },
  81: { title: "관대한 그 계명", englishSlug: "how-gentle-gods-commands" },
  82: { title: "헤어지며 찬송 하나 더 하세", englishSlug: "sing-we-now-at-parting" },
  83: { title: "사랑 충만한 하늘 아버지여", englishSlug: "o-thou-kind-and-gracious-father" },
  84: { title: "신앙의 인내 있을 때", englishSlug: "when-faith-endures" },
  85: { title: "약한 자여 겸손하라", englishSlug: "be-thou-humble" },
  86: { title: "참되신 구주여", englishSlug: "savior-redeemer-of-my-soul" },
  87: { title: "가시밭 험한 길", englishSlug: "though-deepening-trials" },
  88: { title: "성도들아 큰 시험이 닥쳐와도", englishSlug: "let-us-all-press-on" },
  89: { title: "집으로 돌아갈 때에", englishSlug: "lord-dismiss-us-with-thy-blessing" },
  90: { title: "주여 내 영 감동하사", englishSlug: "thy-spirit-lord-has-stirred-our-souls" },
  91: { title: "푸른 풀에 소리없이", englishSlug: "as-the-dew-from-heaven-distilling" },
  92: { title: "잠잠하라 내 영아", englishSlug: "be-still-my-soul" },
  93: { title: "오 내 영혼 가슴 깊은 말", englishSlug: "jesus-the-very-thought-of-thee" },
  94: { title: "불러라 고요히 성가", englishSlug: "come-let-us-sing-an-evening-hymn" },
  95: { title: "사랑하는 구속주여", englishSlug: "jesus-lover-of-my-soul" },
  96: { title: "내 주를 가까이", englishSlug: "nearer-my-god-to-thee" },
  97: { title: "늘 함께 하소서", englishSlug: "abide-with-me" },
  98: { title: "주는 내 목자 되시어", englishSlug: "the-lord-is-my-shepherd" },
  99: { title: "주님은 내 목자니", englishSlug: "the-lord-is-my-shepherd" },
  100: { title: "주님 앞에 머리 숙여", englishSlug: "i-need-thee-every-hour" },
  101: { title: "이제 날 저물어", englishSlug: "abide-with-me-tis-eventide" },
  102: { title: "저녁 닥쳐와", englishSlug: "softly-now-the-light-of-day" },
  103: { title: "낮의 빛이 말없이", englishSlug: "the-day-is-past-and-gone" },
  104: { title: "예수님 생각하오니", englishSlug: "jesus-the-very-thought-of-thee" },

  // 성찬 (Sacrament) - Hymns 105-121
  105: { title: "하늘 중에 사시는 하나님", englishSlug: "o-god-the-eternal-father" },
  106: { title: "주 이름으로 상징물", englishSlug: "in-remembrance-of-thy-suffering" },
  107: { title: "하나님 지혜와 사랑", englishSlug: "how-great-the-wisdom-and-the-love" },
  108: { title: "십자가에 달리신 주", englishSlug: "upon-the-cross-of-calvary" },
  109: { title: "우리를 사랑하셔서", englishSlug: "god-loved-us-so-he-sent-his-son" },
  110: { title: "위대한 주 돌아가셨으니", englishSlug: "behold-the-great-redeemer-die" },
  111: { title: "예수께서 베푸신 사랑", englishSlug: "tis-sweet-to-sing-the-matchless-love" },
  112: { title: "저 멀리 예루살렘 성", englishSlug: "there-is-a-green-hill-far-away" },
  113: { title: "겸손하게 기도하오니", englishSlug: "in-humility-our-savior" },
  114: { title: "하나님 기도 들으시고", englishSlug: "god-our-father-hear-us-pray" },
  115: { title: "구속주 돌아가셔서", englishSlug: "in-memory-of-the-crucified" },
  116: { title: "갈보리 십자가 위에", englishSlug: "o-savior-thou-who-wearest-a-crown" },
  117: { title: "위대한 계획 이루시려", englishSlug: "while-of-these-emblems-we-partake" },
  118: { title: "하늘에 계신 아버지", englishSlug: "father-in-heaven" },
  119: { title: "나사렛 예수는 구주며 왕", englishSlug: "jesus-of-nazareth-savior-and-king" },
  120: { title: "예수의 이름 찬송하고", englishSlug: "well-sing-all-hail-to-jesus-name" },
  121: { title: "구유에서 나신 예수", englishSlug: "jesus-once-of-humble-birth" },

  // 부활절 (Easter) - Hymns 122-124
  122: { title: "주님 부활하셨네", englishSlug: "he-is-risen" },
  123: { title: "주님 다시 부활했네", englishSlug: "christ-the-lord-is-risen-today" },
  124: { title: "부활절 아침", englishSlug: "that-easter-morn" },

  // 성탄절 (Christmas) - Hymns 125-137
  125: { title: "천사들의 노래가", englishSlug: "angels-we-have-heard-on-high" },
  126: { title: "동방박사 두렴으로", englishSlug: "with-wondering-awe" },
  127: { title: "주 믿는 신도여", englishSlug: "oh-come-all-ye-faithful" },
  128: { title: "저 멀리 유대의 넓은 들에", englishSlug: "far-far-away-on-judeas-plains" },
  129: { title: "목자가 밤에 양 지킬 때", englishSlug: "while-shepherds-watched-their-flocks" },
  130: { title: "기쁘다 구주 오셨네", englishSlug: "joy-to-the-world" },
  131: { title: "그 어리신 예수", englishSlug: "away-in-a-manger" },
  132: { title: "그 맑고 환한 밤중에", englishSlug: "it-came-upon-the-midnight-clear" },
  133: { title: "천사 찬송하기를", englishSlug: "hark-the-herald-angels-sing" },
  134: { title: "고요한 밤", englishSlug: "silent-night" },
  135: { title: "저 들 밖에 한밤중에", englishSlug: "the-first-noel" },
  136: { title: "오 베들레헴 작은 골", englishSlug: "o-little-town-of-bethlehem" },
  137: { title: "성탄의 종이 울린다", englishSlug: "i-heard-the-bells-on-christmas-day" },

  // 특별한 주제 (Special Topics) - Hymns 138-186
  138: { title: "풍성하신 주 은혜로", englishSlug: "because-i-have-been-given-much" },
  139: { title: "오 높은 영광 보좌에", englishSlug: "o-thou-rock-of-our-salvation" },
  140: { title: "우리가 가진 것 다 주의 것이니", englishSlug: "because-i-have-been-given-much" },
  141: { title: "의와 진리 지키기에", englishSlug: "do-what-is-right" },
  142: { title: "세상 모든 풍파 너를 휩쓸어", englishSlug: "count-your-blessings" },
  143: { title: "거룩하신 경전으로", englishSlug: "as-i-search-the-holy-scriptures" },
  144: { title: "사랑해 목자의 마음", englishSlug: "dear-to-the-heart-of-the-shepherd" },
  145: { title: "주 섬기라", englishSlug: "called-to-serve" },
  146: { title: "주께서 날 보내시기 심히 원하시는 곳은", englishSlug: "ill-go-where-you-want-me-to-go" },
  147: { title: "촌음을 아껴 쓰고", englishSlug: "improve-the-shining-moments" },
  148: { title: "천지의 주재 여호와", englishSlug: "god-of-our-fathers-whose-almighty-hand" },
  149: { title: "하나님의 일 부지런히 하세", englishSlug: "put-your-shoulder-to-the-wheel" },
  150: { title: "어서 오라 주일 아침", englishSlug: "welcome-welcome-sabbath-morning" },
  151: { title: "친절한 말들을 서로 하세", englishSlug: "let-us-oft-speak-kind-words" },
  152: { title: "날마다 주님 보이신 진리의 말씀", englishSlug: "the-iron-rod" },
  153: { title: "내 영혼이 햇빛을 받아", englishSlug: "there-is-sunshine-in-my-soul-today" },
  154: { title: "때가 임박하니", englishSlug: "the-time-is-far-spent" },
  155: { title: "말해 보아라 무엇이 진리냐?", englishSlug: "oh-say-what-is-truth" },
  156: { title: "이스라엘 시온 군대", englishSlug: "hope-of-israel" },
  157: { title: "신앙으로 나아가서", englishSlug: "true-to-the-faith" },
  158: { title: "진리 내 맘 비춰 주니", englishSlug: "the-light-divine" },
  159: { title: "맘에 햇빛 있으면", englishSlug: "you-can-make-the-pathway-bright" },
  160: { title: "만복의 근원 하나님", englishSlug: "praise-god-from-whom-all-blessings-flow" },
  161: { title: "세상은 즐겨 일하는 일꾼 필요하네", englishSlug: "have-i-done-any-good" },
  162: { title: "성도들아 성전에 가서", englishSlug: "rise-ye-saints-and-temples-enter" },
  163: { title: "의의 일 선택하여 생활하라", englishSlug: "choose-the-right" },
  164: { title: "사랑은 예수께 영광 돌려", englishSlug: "love-at-home" },
  165: { title: "면류관 위해 영광 향해", englishSlug: "we-are-marching-on-to-glory" },
  166: { title: "사랑 넘치는 우리 집", englishSlug: "home-can-be-a-heaven-on-earth" },
  167: { title: "들으라 만방 하늘 음성", englishSlug: "hark-all-ye-nations" },
  168: { title: "영감으로 가르치는 축복", englishSlug: "help-me-teach-with-inspiration" },
  169: { title: "보라 당당한 군대", englishSlug: "behold-a-royal-army" },
  170: { title: "쇠막대", englishSlug: "the-iron-rod" },
  171: { title: "너희 마음 돌이켜라", englishSlug: "turn-your-hearts" },
  172: { title: "빛을 던져 주어라", englishSlug: "scatter-sunshine" },
  173: { title: "선한 영향 주는 삶", englishSlug: "each-life-that-touches-ours-for-good" },
  174: { title: "나의 집에 사랑이 차고 넘치면", englishSlug: "love-at-home" },
  175: { title: "인간이 선택의지로", englishSlug: "know-this-that-every-soul-is-free" },
  176: { title: "아직 대낮 동안 힘써 일하라", englishSlug: "today-while-the-sun-shines" },
  177: { title: "의의 일하세", englishSlug: "put-your-shoulder-to-the-wheel" },
  178: { title: "하나님 이루시는 일", englishSlug: "god-moves-in-a-mysterious-way" },
  179: { title: "싸움 끝나는 날까지", englishSlug: "we-are-all-enlisted" },
  180: { title: "아침 저녁 매일 같이", englishSlug: "sweet-is-the-work" },
  181: { title: "예수님은 구원 반석", englishSlug: "rock-of-ages" },
  182: { title: "오늘 세상에서 선한 일 했나?", englishSlug: "have-i-done-any-good" },
  183: { title: "참 아름다운 성전", englishSlug: "how-beautiful-thy-temples-lord" },
  184: { title: "위대하셔라 주님의 경륜", englishSlug: "if-you-could-hie-to-kolob" },
  185: { title: "주 예수의 군병들", englishSlug: "onward-christian-soldiers" },
  186: { title: "주 영이 거하는 주의 집", englishSlug: "we-love-thy-house-o-god" },

  // 어린이 노래 (Children's Songs) - Hymns 187-195
  187: { title: "난 하나님의 자녀", englishSlug: "i-am-a-child-of-god" },
  188: { title: "주 살아 계시고", englishSlug: "i-know-my-father-lives" },
  189: { title: "가족은 영원해", englishSlug: "families-can-be-together-forever" },
  190: { title: "사랑스런 데저렛", englishSlug: "in-our-lovely-deseret" },
  191: { title: "계명을 지키라", englishSlug: "keep-the-commandments" },
  192: { title: "사랑의 빛 안에 걸어가고", englishSlug: "teach-me-to-walk-in-the-light" },
  193: { title: "서로 사랑해", englishSlug: "love-one-another" },
  194: { title: "하늘 아버지의 자녀", englishSlug: "children-of-our-heavenly-father" },
  195: { title: "거룩하신 주님의 빛", englishSlug: "the-light-divine" },

  // 여성용 (For Women) - Hymns 196-198
  196: { title: "하나님은 사랑이라 (여성용)", englishSlug: "god-is-love" },
  197: { title: "우리 사랑하는 선지자를 위하여 (여성용)", englishSlug: "we-ever-pray-for-thee" },
  198: { title: "오 시온의 자매여 (여성용)", englishSlug: "as-sisters-in-zion" },

  // 남성용 (For Men) - Hymns 199-201
  199: { title: "신권을 받은 자 하나님의 아들아 (남성용)", englishSlug: "come-all-ye-sons-of-god" },
  200: { title: "너 이스라엘 장로는 (남성용)", englishSlug: "ye-elders-of-israel" },
  201: { title: "주 위해 부름받은 신실한 형제여 (남성용)", englishSlug: "ye-who-are-called-to-labor" },

  // 안식일과 평일 (Sabbath and Weekday) - New Hymns 1001-1031
  1001: { title: "모든 축복 주는 주여", englishSlug: "praise-god-from-whom-all-blessings-flow" },
  1002: { title: "사랑하는 주 다시 오실 때", englishSlug: "when-he-comes-again" },
  1003: { title: "내 영혼 평안해", englishSlug: "it-is-well-with-my-soul" },
  1004: { title: "예수님 손잡고 함께 걸어가리", englishSlug: "i-will-walk-with-jesus" },
  1005: { title: "작은 새 돌보신 주님", englishSlug: "his-eye-is-on-the-sparrow" },
  1006: { title: "거룩한 노래 내게 힘을 줘요", englishSlug: "the-hymns-of-zion" },
  1007: { title: "경건히 성찬의 빵 들며", englishSlug: "as-now-we-take-the-sacrament" },
  1008: { title: "생명의 떡과 물", englishSlug: "the-bread-of-life" },
  1009: { title: "겟세마네", englishSlug: "gethsemane" },
  1010: { title: "오 놀라운 그 은혜로", englishSlug: "amazing-grace" },
  1011: { title: "복음 안에 손을 잡고서", englishSlug: "we-are-one-in-the-gospel" },
  1012: { title: "언제 어디서나", englishSlug: "wherever-he-leads-ill-go" },
  1013: { title: "주 은혜로운 사랑", englishSlug: "gods-love" },
  1014: { title: "여호와는 내 목자니", englishSlug: "the-lord-is-my-shepherd" },
  1015: { title: "깊고 깊은 주의 사랑", englishSlug: "the-love-of-god" },
  1016: { title: "보라 예수의 두 손을", englishSlug: "behold-the-wounds-in-jesus-hands" },
  1017: { title: "그리스도", englishSlug: "christ" },
  1018: { title: "주 예수님 오소서", englishSlug: "come-lord-jesus" },
  1019: { title: "아버지 기도하오니", englishSlug: "our-father-we-pray" },
  1020: { title: "주께서 다정히 날 부르시네", englishSlug: "softly-and-tenderly" },
  1021: { title: "주님은 날 사랑하죠", englishSlug: "jesus-loves-me" },
  1022: { title: "신앙의 발자취로", englishSlug: "faith-in-every-footstep" },
  1023: { title: "주님 약속 위에 서리라", englishSlug: "standing-on-the-promises" },
  1024: { title: "주 예수 믿는 신앙 있네", englishSlug: "my-faith-in-jesus" },
  1025: { title: "나의 마음 받으사 성결하게 하소서", englishSlug: "take-my-heart-o-father" },
  1026: { title: "거룩한 곳", englishSlug: "holy-places" },
  1027: { title: "날 반겨 주는 집", englishSlug: "there-is-a-home" },
  1028: { title: "내 안의 작은 빛", englishSlug: "this-little-light-of-mine" },
  1029: { title: "셀 수 없는 주님의 축복", englishSlug: "count-your-blessings" },
  1030: { title: "곁에 가까이 계신 주", englishSlug: "nearer-still-nearer" },
  1031: { title: "들어 보라 주님의 말씀", englishSlug: "hear-the-words-of-the-lord" },

  // 부활절과 성탄절 (Easter and Christmas) - New Hymns 1201-1206
  1201: { title: "부활하신 어린양", englishSlug: "the-risen-lamb" },
  1202: { title: "기쁘게 노래 부르세", englishSlug: "sing-with-joy" },
  1203: { title: "왕 되신 아기 예수", englishSlug: "the-infant-king" },
  1204: { title: "영롱한 새 별", englishSlug: "a-new-star" },
  1205: { title: "부활 찬송하세", englishSlug: "he-is-risen" },
  1206: { title: "그곳에 있었느냐", englishSlug: "were-you-there" },
};

// Get the Korean hymn title by number
export const getKoreanHymnTitle = (number: number): string => {
  return KOREAN_HYMNS[number]?.title || '';
};

// Get the English slug for URL generation
export const getKoreanHymnEnglishSlug = (number: number): string => {
  return KOREAN_HYMNS[number]?.englishSlug || '';
};

// Check if a hymn number is valid in the Korean hymnal
export const isValidKoreanHymnNumber = (number: number): boolean => {
  return number in KOREAN_HYMNS;
};

// Generate URL for Korean hymn (uses English slug with ?lang=kor)
export const getKoreanHymnUrl = (number: number): string => {
  const hymn = KOREAN_HYMNS[number];
  if (!hymn) return '';

  const slug = hymn.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/hymns/${slug}?lang=kor`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=hymns&lang=kor`;
};

// Search Korean hymns by title
export const searchKoreanHymnByTitle = (searchTerm: string): Array<{number: number, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: number, title: string}> = [];

  // Search through all Korean hymns
  Object.entries(KOREAN_HYMNS).forEach(([number, hymn]) => {
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
