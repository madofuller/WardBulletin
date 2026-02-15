// Korean Children's Songbook Database (어린이 노래책)
// Maps Korean song numbers to Korean titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints Korean Children's Songbook

export interface KoreanChildrensSong {
  title: string;
  englishSlug: string;
}

// Korean song number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=kor
export const KOREAN_CHILDRENS_SONGBOOK: Record<string, KoreanChildrensSong> = {
  // 하나님 아버지 (Heavenly Father)
  "2": { title: "난 하나님의 자녀", englishSlug: "i-am-a-child-of-god" },
  "4": { title: "온 세상 어린이들", englishSlug: "children-all-over-the-world" },
  "6": { title: "어린이의 기도", englishSlug: "a-childs-prayer" },
  "8": { title: "주 살아 계시고", englishSlug: "i-know-my-father-lives" },
  "9": { title: "하나님 아버지 감사합니다", englishSlug: "thank-thee-father" },
  "10": { title: "경건하게 하소서", englishSlug: "father-i-will-reverent-be" },
  "11": { title: "경건히 조용히", englishSlug: "reverently-quietly" },
  "12": { title: "경건은 사랑이지요", englishSlug: "reverence-is-love" },
  "13": { title: "경건하기 힘쓰면", englishSlug: "i-will-try-to-be-reverent" },
  "14": { title: "나와 같은 어린이", englishSlug: "can-a-little-child-like-me" },
  "15": { title: "아버지 감사합니다", englishSlug: "i-thank-thee-dear-father" },
  "16": { title: "주는 이 몸을 사랑해요", englishSlug: "my-heavenly-father-loves-me" },
  "18a": { title: "건강과 힘 (돌림노래)", englishSlug: "for-health-and-strength" },
  "18b": { title: "눈감고 머리 숙이며", englishSlug: "we-bow-our-heads" },

  // 구주 (Savior)
  "20": { title: "아들 보내셨네", englishSlug: "he-sent-his-son" },
  "22": { title: "베들레헴 가는 요셉", englishSlug: "when-joseph-went-to-bethlehem" },
  "24": { title: "빛난 별들", englishSlug: "stars-were-gleaming" },
  "25": { title: "낮은 구유에 나신 주", englishSlug: "once-within-a-lowly-stable" },
  "26": { title: "그 어리신 예수", englishSlug: "away-in-a-manger" },
  "28": { title: "마리아의 자장가", englishSlug: "marys-lullaby" },
  "30": { title: "이야기해 줄까 어리신 예수", englishSlug: "picture-a-christmas" },
  "32": { title: "성탄 축하", englishSlug: "the-nativity-song" },
  "34": { title: "주님도 한때 우리처럼", englishSlug: "jesus-once-was-a-little-child" },
  "35": { title: "예수님이 세상에 계실 때에", englishSlug: "i-think-when-i-read-that-sweet-story" },
  "36": { title: "들려주세요 예수님 이야기를", englishSlug: "tell-me-the-stories-of-jesus" },
  "37": { title: "예수님은 우리 친구", englishSlug: "jesus-is-our-loving-friend" },
  "38": { title: "나더러 세상 빛 되라", englishSlug: "jesus-wants-me-for-a-sunbeam" },
  "39": { title: "예수님은 누구나 사랑하랬죠", englishSlug: "jesus-said-love-everyone" },
  "40": { title: "주 예수를 닮으려고", englishSlug: "im-trying-to-be-like-jesus" },
  "42": { title: "주 사랑 느껴요", englishSlug: "i-feel-my-saviors-love" },
  "44": { title: "예수님이 부활하셨네", englishSlug: "jesus-has-risen" },
  "45": { title: "주님 다시 사셨나요?", englishSlug: "did-jesus-really-live-again" },
  "46": { title: "주님이 다시 오실 때", englishSlug: "when-he-comes-again" },
  "48": { title: "예수 그리스도 교회", englishSlug: "the-church-of-jesus-christ" },

  // 복음 (Gospel)
  "50": { title: "신앙", englishSlug: "faith" },
  "52": { title: "불친절한 자", englishSlug: "repentance" },
  "53": { title: "나 침례 받고 나면", englishSlug: "when-i-am-baptized" },
  "54": { title: "침례", englishSlug: "baptism" },
  "56": { title: "성신", englishSlug: "the-holy-ghost" },
  "57": { title: "황금빛 봄날", englishSlug: "on-a-golden-springtime" },
  "58": { title: "선지자 따라", englishSlug: "follow-the-prophet" },
  "60": { title: "신권이 회복되었다", englishSlug: "the-priesthood-is-restored" },
  "61": { title: "금판", englishSlug: "the-golden-plates" },
  "62": { title: "몰몬경 이야기", englishSlug: "book-of-mormon-stories" },
  "63": { title: "몰몬경", englishSlug: "the-books-in-the-book-of-mormon" },
  "64": { title: "니파이의 용기", englishSlug: "nephis-courage" },
  "66": { title: "경전 상고하고 생각하고 기도하라", englishSlug: "search-ponder-and-pray" },
  "67": { title: "나 어릴 때 주님을 찾으리", englishSlug: "seek-the-lord-early" },
  "68": { title: "계명을 지키라", englishSlug: "keep-the-commandments" },
  "70": { title: "사랑의 빛 안에 걸어가고", englishSlug: "i-am-like-a-star" },
  "71": { title: "순종합니다", englishSlug: "dare-to-do-right" },
  "72": { title: "주님의 복음 따라", englishSlug: "choose-the-right-way" },
  "73": { title: "이 몸은 주가 주신 성전", englishSlug: "the-lord-gave-me-a-temple" },
  "74": { title: "서로 사랑해", englishSlug: "love-one-another" },
  "75": { title: "주 앞에 나와", englishSlug: "i-pray-in-faith" },
  "76": { title: "사랑이 깃드는 곳에", englishSlug: "where-love-is" },
  "78": { title: "너와 걷고", englishSlug: "ill-walk-with-you" },
  "80": { title: "용감하게 의 행하라", englishSlug: "dare-to-do-right" },
  "81": { title: "의를 위해 서라", englishSlug: "stand-for-the-right" },
  "82": { title: "정의반 노래", englishSlug: "the-ctrs" },
  "83": { title: "내가 먼저 친절하렵니다", englishSlug: "kindness-begins-with-me" },
  "84": { title: "나는 별과 같이", englishSlug: "i-am-like-a-star" },
  "85": { title: "용감한 종", englishSlug: "the-wise-man-and-the-foolish-man" },
  "86": { title: "나는 하나님 계획 따르리", englishSlug: "i-will-follow-gods-plan" },
  "88": { title: "준비된 소년", englishSlug: "a-young-man-prepared" },
  "90": { title: "나 지금 선교사 되고 싶네", englishSlug: "i-hope-they-call-me-on-a-mission" },
  "91": { title: "나 선교사 되고 싶어라", englishSlug: "we-are-missionaries" },
  "92": { title: "우리들은 니파이처럼 (힐라맨의 용사들)", englishSlug: "we-will-bring-the-world-his-truth" },
  "94": { title: "주 섬기라", englishSlug: "called-to-serve" },
  "96": { title: "빛을 발하라", englishSlug: "shine-on" },

  // 가정과 가족 (Home and Family)
  "98": { title: "가족은 영원해", englishSlug: "families-can-be-together-forever" },
  "99": { title: "나 성전 보고 싶어", englishSlug: "i-love-to-see-the-temple" },
  "100": { title: "지금 나는요", englishSlug: "i-want-to-live-the-gospel" },
  "101": { title: "가족 기도", englishSlug: "family-prayer" },
  "102": { title: "사랑의 기도", englishSlug: "a-prayer-song" },
  "104": { title: "행복한 가족", englishSlug: "a-happy-family" },
  "105": { title: "토요일", englishSlug: "saturday" },
  "106": { title: "사랑스러운 이름", englishSlug: "mother-i-love-you" },
  "107": { title: "어머니 사랑해요", englishSlug: "mother-i-love-you" },
  "108a": { title: "사랑하는 어머니", englishSlug: "mothers-lullaby" },
  "108b": { title: "언제나 도울 때는", englishSlug: "when-we-are-helping" },
  "109": { title: "클로버 풀밭에서", englishSlug: "fun-to-do" },
  "110": { title: "아빠의 귀가", englishSlug: "daddy-daddy" },
  "111": { title: "우리 아빠", englishSlug: "daddy-daddy" },
  "112": { title: "할머니", englishSlug: "grandmother" },
  "113": { title: "할아버지 오실 때", englishSlug: "when-grandpa-comes" },
  "114": { title: "집에 갈 때 노래하자", englishSlug: "when-we-are-helping" },

  // 오락과 활동 (Fun and Activity)
  "116": { title: "골짜기 흐르는 시냇물", englishSlug: "give-said-the-little-stream" },
  "117": { title: "비가 내려 옵니다", englishSlug: "rain-is-falling-all-around" },
  "118": { title: "팝콘 꽃", englishSlug: "popcorn-popping" },
  "119": { title: "어린 씨앗 누워서", englishSlug: "the-little-seeds" },
  "120": { title: "여름엔 무엇을 하나요", englishSlug: "in-the-summertime" },
  "121": { title: "눈사람", englishSlug: "once-there-was-a-snowman" },
  "122": { title: "소리 높여 찬양하라", englishSlug: "sing-a-song" },
  "123": { title: "세상은 참으로 아름다워라", englishSlug: "the-worlds-so-big" },
  "124": { title: "목소리를 높여 노래 부르자", englishSlug: "singing-time" },
  "125": { title: "우리 모두 다 같이", englishSlug: "do-as-i-am-doing" },
  "126": { title: "굳게 쥔 작은 두손", englishSlug: "little-hands" },
  "127": { title: "마디", englishSlug: "the-wise-man-and-the-foolish-man" },
  "128": { title: "웃음", englishSlug: "smiles" },
  "129a": { title: "머리, 어깨, 무릎, 발", englishSlug: "head-shoulders-knees-and-toes" },
  "129b": { title: "즐거운 일", englishSlug: "fun-to-do" },
  "130": { title: "인사 노래", englishSlug: "hello-friends" },
  "131": { title: "초등회를 상징하는 색은", englishSlug: "the-primary-colors" },
  "132": { title: "현명한 자와 어리석은 자", englishSlug: "the-wise-man-and-the-foolish-man" },
  "133": { title: "큰 소리로 다 축하해 (돌림노래)", englishSlug: "happy-birthday" },
  "134": { title: "생일 축하해요", englishSlug: "happy-birthday" },

  // 추가 노래 (Additional Songs)
  "136": { title: "손수레 노래", englishSlug: "the-handcart-song" },
  "137": { title: "개척자 어린이", englishSlug: "pioneer-children-sang-as-they-walked" },
  "138": { title: "개척자", englishSlug: "to-be-a-pioneer" },
  "139": { title: "초원을 건너", englishSlug: "westward-ho" },
  "140": { title: "당신께 감사합니다", englishSlug: "thanks-to-thee" },
  "141": { title: "주님, 당신께 감사합니다", englishSlug: "thank-thee-father" },
  "142": { title: "예배당 문", englishSlug: "the-chapel-doors" },
  "143": { title: "예수님을 생각함", englishSlug: "to-think-about-jesus" },
  "144": { title: "아름다운 세상", englishSlug: "my-heavenly-father-loves-me" },
  "145": { title: "봄이기 때문이죠", englishSlug: "because-its-spring" },
  "146": { title: "축하하오 기쁜 크리스마스", englishSlug: "have-a-very-merry-christmas" },
  "147": { title: "티끌 모아 태산", englishSlug: "little-by-little" },
};

// Get the Korean children's song title by number
export const getKoreanChildrensSongTitle = (number: string): string => {
  return KOREAN_CHILDRENS_SONGBOOK[number]?.title || '';
};

// Get the English slug for URL generation
export const getKoreanChildrensSongEnglishSlug = (number: string): string => {
  return KOREAN_CHILDRENS_SONGBOOK[number]?.englishSlug || '';
};

// Check if a song number is valid in the Korean children's songbook
export const isValidKoreanChildrensSongNumber = (number: string): boolean => {
  return number in KOREAN_CHILDRENS_SONGBOOK;
};

// Generate URL for Korean children's song (uses English slug with ?lang=kor)
export const getKoreanChildrensSongUrl = (number: string): string => {
  const song = KOREAN_CHILDRENS_SONGBOOK[number];
  if (!song) return '';

  const slug = song.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/childrens-songbook/${slug}?lang=kor`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=childrens-songbook&lang=kor`;
};

// Search Korean children's songs by title
export const searchKoreanChildrensSongByTitle = (searchTerm: string): Array<{number: string, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: string, title: string}> = [];

  // Search through all Korean children's songs
  Object.entries(KOREAN_CHILDRENS_SONGBOOK).forEach(([number, song]) => {
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
