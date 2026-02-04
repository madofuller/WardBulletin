// Chinese Children's Songbook Database (兒童歌本)
// Maps Chinese song numbers to Chinese titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints Chinese Children's Songbook

export interface ChineseChildrensSong {
  title: string;
  englishSlug: string;
}

// Chinese song number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=zho
export const CHINESE_CHILDRENS_SONGBOOK: Record<string, ChineseChildrensSong> = {
  // 天父 (Heavenly Father)
  "2": { title: "我是神的孩子", englishSlug: "i-am-a-child-of-god" },
  "4": { title: "世界各地的小孩", englishSlug: "children-all-over-the-world" },
  "6": { title: "孩子的祈禱", englishSlug: "a-childs-prayer" },
  "8": { title: "我知天父活著", englishSlug: "i-know-my-father-lives" },
  "9": { title: "感謝祢，親愛的天父", englishSlug: "thank-thee-father" },
  "10": { title: "天父，我願意虔敬", englishSlug: "father-i-will-reverent-be" },
  "11": { title: "虔敬地，肅靜地", englishSlug: "reverently-quietly" },
  "12": { title: "虔敬是愛", englishSlug: "reverence-is-love" },
  "13": { title: "我要保持虔敬", englishSlug: "i-will-try-to-be-reverent" },
  "14": { title: "像我這樣的小孩", englishSlug: "can-a-little-child-like-me" },
  "15": { title: "感謝天父", englishSlug: "i-thank-thee-dear-father" },
  "16": { title: "我天父愛我", englishSlug: "my-heavenly-father-loves-me" },
  "18a": { title: "感謝歌 (輪唱)", englishSlug: "for-health-and-strength" },
  "18b": { title: "虔敬低頭", englishSlug: "we-bow-our-heads" },

  // 救主 (Savior)
  "20": { title: "祂差遣愛子", englishSlug: "he-sent-his-son" },
  "22": { title: "當約瑟前往伯利恆", englishSlug: "when-joseph-went-to-bethlehem" },
  "24": { title: "群星閃耀", englishSlug: "stars-were-gleaming" },
  "25": { title: "很久以前在伯利恆", englishSlug: "once-within-a-lowly-stable" },
  "26": { title: "在客店馬槽裡", englishSlug: "away-in-a-manger" },
  "28": { title: "馬利亞的催眠曲", englishSlug: "marys-lullaby" },
  "30": { title: "噢，親愛的寶貝", englishSlug: "picture-a-christmas" },
  "32": { title: "基督誕生", englishSlug: "the-nativity-song" },
  "34": { title: "耶穌也曾是個小孩", englishSlug: "jesus-once-was-a-little-child" },
  "35": { title: "每當我讀到那美好的故事", englishSlug: "i-think-when-i-read-that-sweet-story" },
  "36": { title: "告訴我耶穌的故事", englishSlug: "tell-me-the-stories-of-jesus" },
  "37": { title: "耶穌是我好朋友", englishSlug: "jesus-is-our-loving-friend" },
  "38": { title: "基督要我做太陽光", englishSlug: "jesus-wants-me-for-a-sunbeam" },
  "39": { title: "耶穌說愛每個人", englishSlug: "jesus-said-love-everyone" },
  "40": { title: "我願效法耶穌基督", englishSlug: "im-trying-to-be-like-jesus" },
  "42": { title: "我感受主的愛", englishSlug: "i-feel-my-saviors-love" },
  "44": { title: "耶穌已復生", englishSlug: "jesus-has-risen" },
  "45": { title: "主耶穌是否已復活？", englishSlug: "did-jesus-really-live-again" },
  "46": { title: "當祂再來時", englishSlug: "when-he-comes-again" },
  "48": { title: "耶穌基督的教會", englishSlug: "the-church-of-jesus-christ" },

  // 福音 (Gospel)
  "50": { title: "信心", englishSlug: "faith" },
  "52": { title: "天父，幫助我 (悔改)", englishSlug: "help-me-dear-father" },
  "53": { title: "當我受洗", englishSlug: "when-i-am-baptized" },
  "54": { title: "洗禮", englishSlug: "baptism" },
  "56": { title: "聖靈", englishSlug: "the-holy-ghost" },
  "57": { title: "在美麗的春天", englishSlug: "on-a-golden-springtime" },
  "58": { title: "來跟隨先知", englishSlug: "follow-the-prophet" },
  "60": { title: "聖職已經復興", englishSlug: "the-priesthood-is-restored" },
  "61": { title: "金頁片", englishSlug: "the-golden-plates" },
  "62": { title: "摩爾門經的故事", englishSlug: "book-of-mormon-stories" },
  "63": { title: "摩爾門經中各書名", englishSlug: "the-books-in-the-book-of-mormon" },
  "64": { title: "尼腓的勇氣", englishSlug: "nephis-courage" },
  "66": { title: "讀，思量，祈禱", englishSlug: "search-ponder-and-pray" },
  "67": { title: "早日尋求主", englishSlug: "seek-the-lord-early" },
  "68": { title: "遵守神的誡命", englishSlug: "keep-the-commandments" },
  "70": { title: "教我走在光明裡", englishSlug: "teach-me-to-walk-in-the-light" },
  "71": { title: "我立刻服從", englishSlug: "quickly-ill-obey" },
  "72": { title: "我願意遵行福音", englishSlug: "choose-the-right-way" },
  "73": { title: "救主賜我聖殿", englishSlug: "the-lord-gave-me-a-temple" },
  "74": { title: "彼此相愛", englishSlug: "love-one-another" },
  "75": { title: "求主教我", englishSlug: "i-pray-in-faith" },
  "76": { title: "若有愛", englishSlug: "where-love-is" },
  "78": { title: "我陪你走", englishSlug: "ill-walk-with-you" },
  "80": { title: "勇於正義", englishSlug: "dare-to-do-right" },
  "81": { title: "堅守正義", englishSlug: "stand-for-the-right" },
  "82": { title: "選擇正義", englishSlug: "choose-the-right" },
  "83": { title: "愛心由我而起", englishSlug: "kindness-begins-with-me" },
  "84": { title: "我像一顆星", englishSlug: "i-am-like-a-star" },
  "85": { title: "我要勇敢", englishSlug: "dare-to-do-right" },
  "86": { title: "我要遵從神的計畫", englishSlug: "i-will-follow-gods-plan" },
  "88": { title: "有準備的青年", englishSlug: "a-young-man-prepared" },
  "90": { title: "我現在就想當個傳教士", englishSlug: "i-hope-they-call-me-on-a-mission" },
  "91": { title: "我希望將來能去傳教", englishSlug: "we-are-missionaries" },
  "92": { title: "我們要把真理傳給萬民 (希拉曼的戰士)", englishSlug: "we-will-bring-the-world-his-truth" },
  "94": { title: "蒙召喚去服務", englishSlug: "called-to-serve" },
  "96": { title: "照耀", englishSlug: "shine-on" },

  // 家庭和家人 (Home and Family)
  "98": { title: "家庭能永遠在一起", englishSlug: "families-can-be-together-forever" },
  "99": { title: "我喜歡看到聖殿", englishSlug: "i-love-to-see-the-temple" },
  "100": { title: "我在寫家譜", englishSlug: "family-history-i-am-doing-it" },
  "101": { title: "家庭祈禱", englishSlug: "family-prayer" },
  "102": { title: "家中有愛心", englishSlug: "love-is-spoken-here" },
  "104": { title: "快樂家庭", englishSlug: "a-happy-family" },
  "105": { title: "週末", englishSlug: "saturday" },
  "106": { title: "最親愛的稱呼", englishSlug: "the-dearest-names" },
  "107": { title: "母親，我愛你", englishSlug: "mother-i-love-you" },
  "108a": { title: "親愛母親", englishSlug: "mothers-lullaby" },
  "108b": { title: "助人", englishSlug: "when-we-are-helping" },
  "109": { title: "我時常去散步", englishSlug: "fun-to-do" },
  "110": { title: "爸爸回家", englishSlug: "daddy-daddy" },
  "111": { title: "我的父親", englishSlug: "daddy-daddy" },
  "112": { title: "祖母", englishSlug: "grandmother" },
  "113": { title: "當祖父來時", englishSlug: "when-grandpa-comes" },
  "114": { title: "唱歌回家", englishSlug: "when-we-are-helping" },

  // 趣味活動 (Fun and Activity)
  "116": { title: "分給人", englishSlug: "give-said-the-little-stream" },
  "117": { title: "小雨小雨一直下", englishSlug: "rain-is-falling-all-around" },
  "118": { title: "爆米花", englishSlug: "popcorn-popping" },
  "119": { title: "小小種子睡著了", englishSlug: "the-little-seeds" },
  "120": { title: "請問你在夏天裡做什麼？", englishSlug: "in-the-summertime" },
  "121": { title: "從前有個雪人", englishSlug: "once-there-was-a-snowman" },
  "122": { title: "我覺得世界真奇妙", englishSlug: "my-heavenly-father-loves-me" },
  "123": { title: "世界多麼奇妙", englishSlug: "the-worlds-so-big" },
  "124": { title: "高聲歡欣歌唱", englishSlug: "sing-a-song" },
  "125": { title: "你很快樂", englishSlug: "if-youre-happy" },
  "126": { title: "我有兩隻小手", englishSlug: "little-hands" },
  "127": { title: "關節", englishSlug: "hinges" },
  "128": { title: "微笑", englishSlug: "smiles" },
  "129a": { title: "頭，肩膀，膝，腳趾", englishSlug: "head-shoulders-knees-and-toes" },
  "129b": { title: "真有趣", englishSlug: "fun-to-do" },
  "130": { title: "哈囉歌", englishSlug: "hello-friends" },
  "131": { title: "初級會的顏色", englishSlug: "the-primary-colors" },
  "132": { title: "蓋房子", englishSlug: "the-wise-man-and-the-foolish-man" },
  "133": { title: "生日歌 (輪唱)", englishSlug: "happy-birthday" },
  "134": { title: "祝你生日快樂", englishSlug: "happy-birthday" },

  // 歌曲選輯 (Song Collection / Additional Songs)
  "136": { title: "手推車", englishSlug: "the-handcart-song" },
  "137": { title: "先驅者兒童邊走邊唱", englishSlug: "pioneer-children-sang-as-they-walked" },
  "138": { title: "成為先驅者", englishSlug: "to-be-a-pioneer" },
  "139": { title: "青海青", englishSlug: "qinghai-qing" },
  "140": { title: "茉莉花", englishSlug: "jasmine-flower" },
  "141": { title: "數蛤蟆", englishSlug: "counting-frogs" },
  "142": { title: "踏雪尋梅", englishSlug: "seeking-plum-blossoms-in-snow" },
  "143": { title: "高山青", englishSlug: "green-mountains" },
  "144": { title: "青春舞曲", englishSlug: "youth-dance" },
};

// Get the Chinese children's song title by number
export const getChineseChildrensSongTitle = (number: string): string => {
  return CHINESE_CHILDRENS_SONGBOOK[number]?.title || '';
};

// Get the English slug for URL generation
export const getChineseChildrensSongEnglishSlug = (number: string): string => {
  return CHINESE_CHILDRENS_SONGBOOK[number]?.englishSlug || '';
};

// Check if a song number is valid in the Chinese children's songbook
export const isValidChineseChildrensSongNumber = (number: string): boolean => {
  return number in CHINESE_CHILDRENS_SONGBOOK;
};

// Generate URL for Chinese children's song (uses English slug with ?lang=zho)
export const getChineseChildrensSongUrl = (number: string): string => {
  const song = CHINESE_CHILDRENS_SONGBOOK[number];
  if (!song) return '';

  const slug = song.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/childrens-songbook/${slug}?lang=zho`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=childrens-songbook&lang=zho`;
};

// Search Chinese children's songs by title
export const searchChineseChildrensSongByTitle = (searchTerm: string): Array<{number: string, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: string, title: string}> = [];

  // Search through all Chinese children's songs
  Object.entries(CHINESE_CHILDRENS_SONGBOOK).forEach(([number, song]) => {
    if (song.title.toLowerCase().includes(term)) {
      results.push({
        number,
        title: song.title
      });
    }
  });

  // Sort by relevance (exact matches first, then by number)
  return results.sort((a, b) => {
    const aExact = a.title.toLowerCase().startsWith(term);
    const bExact = b.title.toLowerCase().startsWith(term);

    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // Sort by numeric part of number
    const aNum = parseInt(a.number.replace(/[a-z]/g, ''));
    const bNum = parseInt(b.number.replace(/[a-z]/g, ''));
    if (aNum !== bNum) return aNum - bNum;

    return a.number.localeCompare(b.number);
  }).slice(0, 10); // Limit to 10 results
};
