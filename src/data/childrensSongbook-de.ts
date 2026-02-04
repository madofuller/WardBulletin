// German Children's Songbook Database (Kinderliederbuch)
// The Church of Jesus Christ of Latter-day Saints

export interface GermanChildrensSong {
  title: string;
  englishSlug: string;
}

// German children's song number -> { title, englishSlug }
export const GERMAN_CHILDRENS_SONGBOOK: Record<string, GermanChildrensSong> = {
  // Der himmlische Vater (Heavenly Father)
  "2": { title: "Ich bin ein Kind von Gott", englishSlug: "i-am-a-child-of-god" },
  "4": { title: "Kinder in aller Welt", englishSlug: "children-all-over-the-world" },
  "6": { title: "Gebet eines Kindes", englishSlug: "a-childs-prayer" },
  "8": { title: "Ich weiß, mein Vater lebt", englishSlug: "i-know-my-father-lives" },
  "9": { title: "O Vater im Himmel", englishSlug: "heavenly-father-are-you-really-there" },
  "10": { title: "Vater, ich will ruhig sein", englishSlug: "father-i-will-reverent-be" },
  "11": { title: "Andachtsvoll, friedlich leis", englishSlug: "reverently-quietly" },
  "12": { title: "Andacht ist Liebe", englishSlug: "reverence-is-love" },
  "13": { title: "Ich wünsch mir Gottes Nähe", englishSlug: "i-need-my-heavenly-father" },
  "14": { title: "Kann ich schon als kleines Kind", englishSlug: "can-a-little-child-like-me" },
  "15": { title: "Unserm Vater danken wir", englishSlug: "thanks-to-our-father" },
  "16": { title: "Ich weiß, dass Gott Vater mich liebt!", englishSlug: "my-heavenly-father-loves-me" },
  "18a": { title: "Dankkanon", englishSlug: "a-song-of-thanks" },
  "18b": { title: "Den Kopf geneigt", englishSlug: "we-bow-our-heads" },

  // Der Erretter (The Savior)
  "20": { title: "Er sandte seinen Sohn", englishSlug: "he-sent-his-son" },
  "22": { title: "Als Josef auf die Reise ging", englishSlug: "when-joseph-went-to-bethlehem" },
  "24": { title: "Christnacht", englishSlug: "christmas-bells" },
  "25": { title: "Seht den Stall", englishSlug: "once-within-a-lowly-stable" },
  "26": { title: "Im Stroh in der Krippe", englishSlug: "away-in-a-manger" },
  "28": { title: "Marias Wiegenlied", englishSlug: "marys-lullaby" },
  "30": { title: "Sei still, kleiner Liebling", englishSlug: "oh-hush-thee-my-baby" },
  "32": { title: "Krippenlied", englishSlug: "the-nativity-song" },
  "34": { title: "Jesus war einst ein kleines Kind", englishSlug: "jesus-once-was-a-little-child" },
  "35": { title: "Liebe Kinder, kommt alle zu mir!", englishSlug: "jesus-loved-the-little-children" },
  "36": { title: "Geschichten von Jesus", englishSlug: "tell-me-the-stories-of-jesus" },
  "37": { title: "Jesus, unser bester Freund", englishSlug: "jesus-is-our-loving-friend" },
  "38": { title: "Ein Sonnenstrahl Jesu", englishSlug: "jesus-wants-me-for-a-sunbeam" },
  "39": { title: "Jesus sagt: Hab alle lieb!", englishSlug: "jesus-said-love-everyone" },
  "40": { title: "Ich möchte so sein wie Jesus", englishSlug: "i-m-trying-to-be-like-jesus" },
  "42": { title: "Des Heilands Liebe", englishSlug: "i-feel-my-saviors-love" },
  "44": { title: "Christ ist erstanden!", englishSlug: "jesus-has-risen" },
  "45": { title: "Stand Jesus von den Toten auf?", englishSlug: "did-jesus-really-live-again" },
  "46": { title: "Wenn Jesus Christus wiederkehrt", englishSlug: "when-he-comes-again" },
  "48": { title: "Ich gehöre zur Kirche Jesu Christi", englishSlug: "the-church-of-jesus-christ" },

  // Das Evangelium (The Gospel)
  "50": { title: "Glaube", englishSlug: "faith" },
  "52": { title: "Hilf mir, o Vater", englishSlug: "help-me-dear-father" },
  "53": { title: "Meine Taufe", englishSlug: "when-i-am-baptized" },
  "54": { title: "Taufe", englishSlug: "baptism" },
  "56": { title: "Der Heilige Geist", englishSlug: "the-holy-ghost" },
  "57": { title: "Welch ein schöner Frühlingstag", englishSlug: "when-i-am-baptized" },
  "58": { title: "Folg dem Propheten!", englishSlug: "follow-the-prophet" },
  "60": { title: "Das Priestertum", englishSlug: "the-priesthood-is-restored" },
  "61": { title: "Die goldnen Platten", englishSlug: "the-golden-plates" },
  "62": { title: "Geschichten aus dem Buch Mormon", englishSlug: "book-of-mormon-stories" },
  "63": { title: "Die Bücher im Buch Mormon", englishSlug: "the-books-in-the-book-of-mormon" },
  "64": { title: "Nephis Mut", englishSlug: "nephis-courage" },
  "66": { title: "Lies, denk nach und bet!", englishSlug: "search-ponder-and-pray" },
  "67": { title: "Ich suche nach Gott", englishSlug: "seek-the-lord-early" },
  "68": { title: "Gottes Gebote will ich befolgen", englishSlug: "keep-the-commandments" },
  "70": { title: "Lehr mich zu wandeln", englishSlug: "teach-me-to-walk-in-the-light" },
  "71": { title: "Ruft die Mama", englishSlug: "called-to-serve" },
  "72": { title: "Dem Evangelium folgen", englishSlug: "i-will-follow-gods-plan" },
  "73": { title: "Gott gab mir einen Tempel", englishSlug: "my-body-is-a-temple" },
  "74": { title: "Liebet einander", englishSlug: "love-one-another" },
  "75": { title: "Sag mir, o Gott", englishSlug: "tell-me-dear-lord" },
  "76": { title: "Wo Liebe ist", englishSlug: "where-love-is" },
  "78": { title: "Ich geh mit dir", englishSlug: "ill-walk-with-you" },
  "80": { title: "Sei immer treu!", englishSlug: "dare-to-do-right" },
  "81": { title: "Steh für das Rechte ein!", englishSlug: "stand-for-the-right" },
  "82": { title: "Wähl das Rechte!", englishSlug: "choose-the-right" },
  "83": { title: "Eine freundliche Welt", englishSlug: "i-want-to-live-the-gospel" },
  "84": { title: "Ich bin wie ein Stern", englishSlug: "i-am-like-a-star" },
  "85": { title: "Der Herr braucht tapfre Diener", englishSlug: "the-lord-needs-valiant-servants" },
  "86": { title: "Ich befolge Gottes Plan", englishSlug: "i-will-follow-gods-plan" },
  "88": { title: "Darum mach ich mich bereit", englishSlug: "im-getting-ready" },
  "90": { title: "Ich wär so gern schon heut ein Missionar", englishSlug: "i-hope-they-call-me-on-a-mission" },
  "91": { title: "Ich möchte einmal auf Mission gehn", englishSlug: "i-want-to-be-a-missionary-now" },
  "92": { title: "Wahrheit verkünden (Wie die Söhne von Helaman)", englishSlug: "we-ll-bring-the-world-his-truth" },
  "94": { title: "Auserwählt zu dienen", englishSlug: "called-to-serve" },
  "96": { title: "Mein Licht", englishSlug: "this-little-light-of-mine" },

  // Das Zuhause und die Familie (Home and Family)
  "98": { title: "Immer und ewig vereint", englishSlug: "families-can-be-together-forever" },
  "99": { title: "Ich freu mich auf den Tempel", englishSlug: "i-love-to-see-the-temple" },
  "100": { title: "Genealogie", englishSlug: "family-history-i-am-doing-it" },
  "101": { title: "Familiengebet", englishSlug: "family-prayer" },
  "102": { title: "Liebe umgibt mich hier", englishSlug: "love-is-spoken-here" },
  "104": { title: "Unsre Familie ist sehr froh", englishSlug: "a-happy-family" },
  "105": { title: "Samstag", englishSlug: "saturday" },
  "106": { title: "Die liebsten Namen", englishSlug: "the-dearest-names" },
  "107": { title: "Mutti, ich lieb dich", englishSlug: "mother-i-love-you" },
  "108a": { title: "Liebe Mutti", englishSlug: "mother-dear" },
  "108b": { title: "Wir sind glücklich beim Helfen", englishSlug: "when-we-re-helping" },
  "109": { title: "Blumen für Mutti", englishSlug: "fun-to-do" },
  "110": { title: "Vati kommt heim!", englishSlug: "daddy-s-homecoming" },
  "111": { title: "Mein Vati", englishSlug: "my-dad" },
  "112": { title: "Für Oma", englishSlug: "grandmother" },
  "113": { title: "Wenn Opa kommt", englishSlug: "grandpa" },
  "114": { title: "Sing doch ein Lied", englishSlug: "fun-to-do" },

  // Spaß und Bewegung (Fun and Activity)
  "116": { title: "Gib, sagt der kleine Bach", englishSlug: "give-said-the-little-stream" },
  "117": { title: "Jahreszeiten", englishSlug: "rain-is-falling-all-around" },
  "118": { title: "Popcorn", englishSlug: "popcorn-popping" },
  "119": { title: "Kleine Samen", englishSlug: "little-seeds-lie-fast-asleep" },
  "120": { title: "Sommer", englishSlug: "fun-to-do" },
  "121": { title: "War einmal ein Schneemann", englishSlug: "once-there-was-a-snowman" },
  "122": { title: "Die Erde ist ja so wunderbar", englishSlug: "my-heavenly-father-loves-me" },
  "123": { title: "Wie herrlich hat Jesus die Erde gemacht", englishSlug: "all-things-bright-and-beautiful" },
  "124": { title: "Erheb deine Stimme und sing!", englishSlug: "sing-a-song" },
  "125": { title: "Wenn du fröhlich bist", englishSlug: "if-you-re-happy" },
  "126": { title: "Ich hab zwei kleine Hände", englishSlug: "i-have-two-little-hands" },
  "127": { title: "Ich bin so gelenkig", englishSlug: "fun-to-do" },
  "128": { title: "Ein Lächeln", englishSlug: "smiles" },
  "129a": { title: "Kopf, Schulter, Knie und Fuß", englishSlug: "head-shoulders-knees-and-toes" },
  "129b": { title: "Singen macht Spaß!", englishSlug: "fun-to-do" },
  "130": { title: "Hallo!", englishSlug: "hello" },
  "131": { title: "Unsere PV-Farben", englishSlug: "the-primary-colors" },
  "132": { title: "Der kluge Mann", englishSlug: "the-wise-man-and-the-foolish-man" },
  "133": { title: "Geburtstagskanon", englishSlug: "happy-birthday" },
  "134": { title: "Zum Geburtstag", englishSlug: "you-ve-had-a-birthday" },

  // Sonstige Lieder (Other Songs)
  "136": { title: "Das Lied von den Handkarren", englishSlug: "the-handcart-song" },
  "137": { title: "Pionierkinder", englishSlug: "pioneer-children" },
  "138": { title: "Wie ein Pionier", englishSlug: "to-be-a-pioneer" },
  "139": { title: "Kleine Wassertropfen", englishSlug: "little-drops-of-water" },
  "140": { title: "Die Tür der Kirche", englishSlug: "here-is-the-church" },
  "141": { title: "An Jesus denken", englishSlug: "think-of-jesus" },
  "142": { title: "Wenn zur Kirch ich geh", englishSlug: "i-like-my-birthdays" },
  "143": { title: "Alle Dinge auf der Welt", englishSlug: "all-things-bright-and-beautiful" },
  "144": { title: "Schöner Herbst", englishSlug: "fun-to-do" },
  "145a": { title: "Familienabend", englishSlug: "family-night" },
  "145b": { title: "Auf, ihr Kinder (Kanon)", englishSlug: "fun-to-do" },
  "146": { title: "Die Ostergeschichte in der Natur", englishSlug: "easter" },
  "147": { title: "Weißt du, wie viel Sternlein stehen", englishSlug: "twinkle-twinkle-little-star" },
  "148": { title: "Tu, was ich tue", englishSlug: "do-as-i-m-doing" }
};

// Get the German children's song title by number
export const getGermanChildrensSongTitle = (number: string): string => {
  return GERMAN_CHILDRENS_SONGBOOK[number]?.title || '';
};

// Get the English slug for URL generation
export const getGermanChildrensSongEnglishSlug = (number: string): string => {
  return GERMAN_CHILDRENS_SONGBOOK[number]?.englishSlug || '';
};

// Check if a song number is valid in the German children's songbook
export const isValidGermanChildrensSongNumber = (number: string): boolean => {
  return number in GERMAN_CHILDRENS_SONGBOOK;
};

// Generate URL for German children's song
export const getGermanChildrensSongUrl = (number: string): string => {
  const song = GERMAN_CHILDRENS_SONGBOOK[number];
  if (!song) return '';

  const slug = song.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/childrens-songbook/${slug}?lang=deu`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=childrens-songbook&lang=deu`;
};

// Search German children's songs by title
export const searchGermanChildrensSongByTitle = (searchTerm: string): Array<{number: string, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: string, title: string}> = [];

  // Search through all German children's songs
  Object.entries(GERMAN_CHILDRENS_SONGBOOK).forEach(([number, song]) => {
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

    // Sort by numeric value, handling letter suffixes
    const aNum = parseInt(a.number.replace(/[a-z]/g, ''));
    const bNum = parseInt(b.number.replace(/[a-z]/g, ''));
    if (aNum !== bNum) return aNum - bNum;
    return a.number.localeCompare(b.number);
  }).slice(0, 10); // Limit to 10 results
};
