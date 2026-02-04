// Japanese Children's Songbook (こどもの歌集)
// Songs organized by category with Japanese titles

export interface JapaneseChildrensSong {
  title: string;
  englishSlug: string;
}

// Japanese Children's Songbook - uses string keys to support letter suffixes (e.g., "18a", "18b")
export const JAPANESE_CHILDRENS_SONGBOOK: Record<string, JapaneseChildrensSong> = {
  // わたしの天のお父様 (My Heavenly Father)
  "2": { title: "神の子です", englishSlug: "i-am-a-child-of-god" },
  "4": { title: "世界中の子供たち", englishSlug: "children-all-over-the-world" },
  "6": { title: "子供のいのり", englishSlug: "a-childs-prayer" },
  "8": { title: "お父様は生きています", englishSlug: "my-heavenly-father-loves-me" },
  "9": { title: "神様ありがとう", englishSlug: "thanks-to-thee" },
  "10": { title: "天のお父様敬虔にします", englishSlug: "father-i-will-reverent-be" },
  "11": { title: "心低く", englishSlug: "reverently-quietly" },
  "12": { title: "敬虔は愛", englishSlug: "reverence-is-love" },
  "13": { title: "敬虔になる努力しましょう", englishSlug: "we-bow-our-heads" },
  "14": { title: "わたしのような小さな子でも", englishSlug: "i-can-be-reverent" },
  "15": { title: "感謝しますお父様", englishSlug: "thank-thee-father" },
  "16": { title: "天のお父様の愛", englishSlug: "my-heavenly-father-loves-me" },
  "18a": { title: "感謝のいのり（輪唱）", englishSlug: "thanks-to-our-father" },
  "18b": { title: "おいのり", englishSlug: "a-prayer" },

  // 救い主 (The Savior)
  "20": { title: "主はみ子をつかわし", englishSlug: "he-sent-his-son" },
  "22": { title: "ベツレヘムへの旅", englishSlug: "the-nativity-song" },
  "24": { title: "星の光る夜に", englishSlug: "stars-were-gleaming" },
  "25": { title: "昔のまずしい", englishSlug: "away-in-a-manger" },
  "26": { title: "ねどこもなくて", englishSlug: "away-in-a-manger" },
  "28": { title: "マリヤのララバイ（子守歌）", englishSlug: "marys-lullaby" },
  "30": { title: "イエス様のお話", englishSlug: "tell-me-the-stories-of-jesus" },
  "32": { title: "クリスマスの歌", englishSlug: "picture-a-christmas" },
  "34": { title: "イエス様も子供でした", englishSlug: "jesus-once-was-a-little-child" },
  "35": { title: "イエス様のお話を読む時", englishSlug: "search-ponder-and-pray" },
  "36": { title: "イエス様の話聞かせて", englishSlug: "tell-me-the-stories-of-jesus" },
  "37": { title: "イエス様は友達", englishSlug: "jesus-is-our-loving-friend" },
  "38": { title: "光となるように", englishSlug: "i-am-like-a-star" },
  "39": { title: "すべての人を愛しなさい", englishSlug: "jesus-said-love-everyone" },
  "40": { title: "イエス様のように", englishSlug: "im-trying-to-be-like-jesus" },
  "42": { title: "救い主の愛", englishSlug: "i-feel-my-saviors-love" },
  "44": { title: "イエス様よみがえる", englishSlug: "did-jesus-really-live-again" },
  "45": { title: "イエス様，本当に復活したの", englishSlug: "jesus-has-risen" },
  "46": { title: "主の来られる時", englishSlug: "when-he-comes-again" },
  "48": { title: "イエス・キリストの教会", englishSlug: "the-church-of-jesus-christ" },

  // 福音 (The Gospel)
  "50": { title: "信仰", englishSlug: "faith" },
  "52": { title: "人をゆるせるように（くいあらため）", englishSlug: "help-me-dear-father" },
  "53": { title: "バプテスマのとき", englishSlug: "when-i-am-baptized" },
  "54": { title: "バプテスマ", englishSlug: "baptism" },
  "56": { title: "せいれい", englishSlug: "the-holy-ghost" },
  "57": { title: "光かがやく春の日に", englishSlug: "when-were-helping" },
  "58": { title: "預言者にしたがおう", englishSlug: "follow-the-prophet" },
  "60": { title: "神権の回復", englishSlug: "the-priesthood-is-restored" },
  "61": { title: "金版", englishSlug: "the-golden-plates" },
  "62": { title: "『モルモン書』の物語", englishSlug: "book-of-mormon-stories" },
  "63": { title: "『モルモン書』", englishSlug: "the-books-in-the-book-of-mormon" },
  "64": { title: "ニーファイの勇気", englishSlug: "nephis-courage" },
  "66": { title: "いのりながらみ言葉読む時", englishSlug: "scripture-power" },
  "67": { title: "子供の時から主を求め", englishSlug: "seek-the-lord-early" },
  "68": { title: "いましめを守る人を", englishSlug: "keep-the-commandments" },
  "70": { title: "光の中進もう", englishSlug: "teach-me-to-walk-in-the-light" },
  "71": { title: "よく聞いて", englishSlug: "listen-listen" },
  "72": { title: "福音の教えよく守りましょう", englishSlug: "keep-the-commandments" },
  "73": { title: "この体は神の宮", englishSlug: "the-lord-gave-me-a-temple" },
  "74": { title: "共に愛し合え", englishSlug: "love-one-another" },
  "75": { title: "神様，今日わたしに", englishSlug: "help-me-dear-father" },
  "76": { title: "愛あるところ", englishSlug: "where-love-is" },
  "78": { title: "友達", englishSlug: "ill-walk-with-you" },
  "80": { title: "おそれずぎをなせ", englishSlug: "dare-to-do-right" },
  "81": { title: "正しくあれ", englishSlug: "stand-for-the-right" },
  "82": { title: "正しい道選ぼう", englishSlug: "choose-the-right-way" },
  "83": { title: "自分から始めよう", englishSlug: "im-trying-to-be-like-jesus" },
  "84": { title: "星のように", englishSlug: "i-am-like-a-star" },
  "85": { title: "勇者になろう", englishSlug: "nephis-courage" },
  "86": { title: "主の計画にしたがう", englishSlug: "i-will-follow-gods-plan" },
  "88": { title: "そなえよう神権に", englishSlug: "i-will-be-valiant" },
  "90": { title: "宣教師になりたいな", englishSlug: "i-hope-they-call-me-on-a-mission" },
  "91": { title: "宣教師になりたい", englishSlug: "i-want-to-be-a-missionary-now" },
  "92": { title: "ニーファイのように", englishSlug: "nephis-courage" },
  "94": { title: "われらは天の王に", englishSlug: "well-bring-the-world-his-truth" },
  "96": { title: "もっとかがやこう", englishSlug: "shine-on" },

  // 家庭と家族 (Home and Family)
  "98": { title: "家族は永遠に", englishSlug: "families-can-be-together-forever" },
  "99": { title: "神殿に行きたいな", englishSlug: "i-love-to-see-the-temple" },
  "100": { title: "家族の歴史は主の教え", englishSlug: "family-history-i-am-doing-it" },
  "101": { title: "家族のいのり", englishSlug: "family-prayer" },
  "102": { title: "愛の言葉", englishSlug: "love-is-spoken-here" },
  "104": { title: "幸せな家族", englishSlug: "a-happy-family" },
  "105": { title: "土曜日", englishSlug: "saturday" },
  "106": { title: "大好きな名前", englishSlug: "the-dearest-names" },
  "107": { title: "愛してる，お母さん", englishSlug: "mother-i-love-you" },
  "108a": { title: "お母さん", englishSlug: "mother-dear" },
  "108b": { title: "お手伝い", englishSlug: "when-were-helping" },
  "109": { title: "春の牧場一人歩く", englishSlug: "in-the-leafy-treetops" },
  "110": { title: "パパのお帰り", englishSlug: "daddys-homecoming" },
  "111": { title: "パパのように", englishSlug: "daddys-homecoming" },
  "112": { title: "おばあちゃん", englishSlug: "grandmother" },
  "113": { title: "おじいちゃんが来ると", englishSlug: "when-grandpa-comes" },
  "114": { title: "歌おう，帰り道に", englishSlug: "fun-to-do" },

  // 楽しみと活動 (Fun and Activity)
  "116": { title: "小さな川が", englishSlug: "give-said-the-little-stream" },
  "117": { title: "雨がふります", englishSlug: "rain-is-falling-all-around" },
  "118": { title: "花がはじけてポップコーン", englishSlug: "popcorn-popping" },
  "119": { title: "空のお日様小さな種に", englishSlug: "once-there-was-a-snowman" },
  "120": { title: "暑い夏はみんな何するの", englishSlug: "in-the-leafy-treetops" },
  "121": { title: "雪だるま", englishSlug: "once-there-was-a-snowman" },
  "122": { title: "美しくかがやくこの世界", englishSlug: "my-heavenly-father-loves-me" },
  "123": { title: "わたしの好きなこの世界", englishSlug: "my-heavenly-father-loves-me" },
  "124": { title: "声上げて歌おう", englishSlug: "fun-to-do" },
  "125": { title: "幸せなら手をたたこう", englishSlug: "if-youre-happy" },
  "126": { title: "小さな手", englishSlug: "little-hands" },
  "127": { title: "関節", englishSlug: "head-shoulders-knees-and-toes" },
  "128": { title: "笑顔で", englishSlug: "smiles" },
  "129a": { title: "体の歌", englishSlug: "do-as-im-doing" },
  "129b": { title: "楽しいな", englishSlug: "fun-to-do" },
  "130": { title: "よく来たね", englishSlug: "hello-song" },
  "131": { title: "プライマリーの色", englishSlug: "the-primary-colors" },
  "132": { title: "かしこい人とおろか者", englishSlug: "the-wise-man-and-the-foolish-man" },
  "133": { title: "おめでとう誕生日（輪唱）", englishSlug: "happy-happy-birthday" },
  "134": { title: "ハッピー，ハッピー，バースデー", englishSlug: "happy-happy-birthday" },

  // その他の歌 (Other Songs)
  "136": { title: "手車の歌は", englishSlug: "the-handcart-song" },
  "137": { title: "開拓者の子供", englishSlug: "pioneer-children" },
  "138": { title: "開拓者になろう", englishSlug: "called-to-serve" },
  "139": { title: "什分の一を主に", englishSlug: "i-want-to-give-the-lord-my-tenth" },
  "140": { title: "かんとくさん", englishSlug: "our-bishop" },
  "141": { title: "感謝", englishSlug: "thanks-to-our-father" },
  "142": { title: "教会に行くのは", englishSlug: "going-to-church" },
  "143": { title: "わたしたちは，正直であることを信じる", englishSlug: "i-believe-in-being-honest" },
  "144": { title: "小さな声で", englishSlug: "reverently-quietly" },
  "146": { title: "わたしのするとおり", englishSlug: "do-as-im-doing" },
  "147": { title: "バプテスマの日", englishSlug: "baptism" },
  "148": { title: "イエス様を思うのは", englishSlug: "i-think-when-i-read-that-sweet-story" }
};

// Helper function to get Japanese children's song title
export const getJapaneseChildrensSongTitle = (number: string): string => {
  const song = JAPANESE_CHILDRENS_SONGBOOK[number];
  return song ? song.title : '';
};

// Helper function to get Japanese children's song URL
export const getJapaneseChildrensSongUrl = (number: string): string => {
  const song = JAPANESE_CHILDRENS_SONGBOOK[number];
  if (!song) return '';

  // Japanese children's songbook URL pattern
  // https://www.churchofjesuschrist.org/study/manual/childrens-songbook/{slug}?lang=jpn
  return `https://www.churchofjesuschrist.org/study/manual/childrens-songbook/${song.englishSlug}?lang=jpn`;
};

// Helper function to check if a number is valid in Japanese children's songbook
export const isValidJapaneseChildrensSongNumber = (number: string): boolean => {
  return number in JAPANESE_CHILDRENS_SONGBOOK;
};

// Helper function to search Japanese children's songs by title
export const searchJapaneseChildrensSongByTitle = (searchTerm: string): { number: string; title: string }[] => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return [];

  const results: { number: string; title: string }[] = [];

  for (const [number, song] of Object.entries(JAPANESE_CHILDRENS_SONGBOOK)) {
    if (song.title.toLowerCase().includes(term)) {
      results.push({ number, title: song.title });
    }
  }

  // Sort by number (numeric part first, then letter suffix)
  return results.sort((a, b) => {
    const aNum = parseInt(a.number.replace(/[a-z]/g, ''));
    const bNum = parseInt(b.number.replace(/[a-z]/g, ''));
    if (aNum !== bNum) return aNum - bNum;
    return a.number.localeCompare(b.number);
  });
};
