// Italian Hymn Database (Innario)
// Maps Italian hymn numbers to Italian titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints Italian Hymnal

export interface ItalianHymn {
  title: string;
  englishSlug: string;
}

// Italian hymn number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=ita
export const ITALIAN_HYMNS: Record<number, ItalianHymn> = {
  // Restaurazione (Restoration) - Hymns 1-35
  1: { title: "Le ombre fuggon, sorge il sol", englishSlug: "the-morning-breaks" },
  2: { title: "Lo Spirito arde", englishSlug: "the-spirit-of-god" },
  3: { title: "S'approssima il tempo", englishSlug: "now-let-us-rejoice" },
  4: { title: "O eterna verità", englishSlug: "truth-eternal" },
  5: { title: "Là dove sorge Sion", englishSlug: "high-on-the-mountain-top" },
  6: { title: "O Re d'Israele", englishSlug: "redeemer-of-israel" },
  7: { title: "Israele, Dio ti chiama", englishSlug: "israel-israel-god-is-calling" },
  8: { title: "Venite, cantiam, lodiamo il Signor", englishSlug: "awake-and-arise" },
  9: { title: "Dall'alto scese un angel", englishSlug: "an-angel-from-on-high" },
  10: { title: "Dolce è la pace del Vangel", englishSlug: "what-was-witnessed-in-the-heavens" },
  11: { title: "Ti siam grati, o Signor, per il Profeta", englishSlug: "we-thank-thee-o-god-for-a-prophet" },
  12: { title: "Dio di forza e di virtù", englishSlug: "twas-witnessed-in-the-morning-sky" },
  13: { title: "Ascolta il Profeta", englishSlug: "come-listen-to-a-prophets-voice" },
  14: { title: "Del Tuo profeta, o Dio", englishSlug: "god-of-power-god-of-right" },
  15: { title: "Per te, Profeta", englishSlug: "praise-to-the-man" },
  16: { title: "Se ascolti il Profeta", englishSlug: "we-ever-pray-for-thee" },
  17: { title: "Canteremo d'un solo cor", englishSlug: "well-sing-all-hail-to-jesus-name" },
  18: { title: "Il mattino era sereno", englishSlug: "joseph-smiths-first-prayer" },
  19: { title: "Lode all'uomo", englishSlug: "praise-to-the-man" },
  20: { title: "Un povero viandante", englishSlug: "a-poor-wayfaring-man-of-grief" },
  21: { title: "Santi, venite", englishSlug: "come-come-ye-saints" },
  22: { title: "Guidami alla vita eterna", englishSlug: "lead-me-into-life-eternal" },
  23: { title: "Alte vette lassù", englishSlug: "for-the-strength-of-the-hills" },
  24: { title: "Per la Patria", englishSlug: "my-country-tis-of-thee" },
  25: { title: "Alte verso il ciel leviam", englishSlug: "now-well-sing-with-one-accord" },
  26: { title: "Ridestati, o Sion", englishSlug: "arise-o-god-and-shine" },
  27: { title: "O santi di Sion", englishSlug: "o-ye-mountains-high" },
  28: { title: "Salve al mattino di Sion", englishSlug: "great-is-the-lord" },
  29: { title: "Là sui monti s'erge Sion", englishSlug: "the-mountain-of-the-lord" },
  30: { title: "Bella Sion", englishSlug: "beautiful-zion-built-above" },
  31: { title: "Esultiamo", englishSlug: "let-zions-beauty" },
  32: { title: "Sorgi presto, dì promesso", englishSlug: "the-day-dawn-is-breaking" },
  33: { title: "L'aurora vien lesta", englishSlug: "the-happy-day-at-last-has-come" },
  34: { title: "Deh, vieni, o Re dei re", englishSlug: "come-o-thou-king-of-kings" },
  35: { title: "Forza, figli del Signor", englishSlug: "hope-of-israel" },

  // Lode e ringraziamento (Praise and Thanksgiving) - Hymns 36-56
  36: { title: "O creature del Signor", englishSlug: "all-creatures-of-our-god-and-king" },
  37: { title: "Per la terra tutta in fior", englishSlug: "for-the-beauty-of-the-earth" },
  38: { title: "Qual forte rocca è il Signor", englishSlug: "a-mighty-fortress-is-our-god" },
  39: { title: "Gloria al Signor lassù!", englishSlug: "glory-to-god-on-high" },
  40: { title: "O Condottiero d'Israel", englishSlug: "guide-us-o-thou-great-jehovah" },
  41: { title: "A Te, Signor", englishSlug: "prayer-of-thanksgiving" },
  42: { title: "Sian gloria, onore e lode", englishSlug: "all-glory-laud-and-honor" },
  43: { title: "È Cristo il nostro Re!", englishSlug: "rejoice-the-lord-is-king" },
  44: { title: "Mandate voci di gioia all'Eterno", englishSlug: "come-ye-children-of-the-lord" },
  45: { title: "Lodiamo il nostro gran Signor", englishSlug: "let-us-all-press-on" },
  46: { title: "Lode all'Altissimo", englishSlug: "praise-to-the-lord-the-almighty" },
  47: { title: "Onnipotente è il braccio del Signor", englishSlug: "how-firm-a-foundation" },
  48: { title: "Avanti andiam", englishSlug: "put-your-shoulder-to-the-wheel" },
  49: { title: "Un fermo sostegno", englishSlug: "how-firm-a-foundation" },
  50: { title: "O mio Signor", englishSlug: "o-my-father" },
  51: { title: "Guidaci, o grande Geova", englishSlug: "guide-us-o-thou-great-jehovah" },
  52: { title: "Il divino amor", englishSlug: "god-is-love" },
  53: { title: "Sei luce, Signor", englishSlug: "the-lord-is-my-light" },
  54: { title: "Preghiera di ringraziamento", englishSlug: "prayer-of-thanksgiving" },
  55: { title: "Grati, o santi, in cor cantiam", englishSlug: "come-ye-thankful-people" },
  56: { title: "Santo è il Signor", englishSlug: "holy-holy-holy" },

  // Preghiera e supplica (Prayer and Supplication) - Hymns 57-101
  57: { title: "D'ogni era Tu il Signor", englishSlug: "o-god-our-help-in-ages-past" },
  58: { title: "Rischiara, Padre, questo mio sentier", englishSlug: "lead-kindly-light" },
  59: { title: "Bisogno ho di Te", englishSlug: "i-need-thee-every-hour" },
  60: { title: "Sempre vicino a Te, dolce Signor", englishSlug: "nearer-my-god-to-thee" },
  61: { title: "Guidami a Te", englishSlug: "lead-kindly-light" },
  62: { title: "Dammi, o Signor", englishSlug: "more-holiness-give-me" },
  63: { title: "Oh, qual furente tempesta", englishSlug: "master-the-tempest-is-raging" },
  64: { title: "O accetta, nostro Padre", englishSlug: "our-saviors-love" },
  65: { title: "T'amo tanto, buon Gesù", englishSlug: "jesus-the-very-thought-of-thee" },
  66: { title: "Benigno Pastore", englishSlug: "the-lord-is-my-shepherd" },
  67: { title: "Amar Gesù", englishSlug: "jesus-lover-of-my-soul" },
  68: { title: "Seguitemi", englishSlug: "come-follow-me" },
  69: { title: "Venite a Cristo", englishSlug: "come-unto-jesus" },
  70: { title: "Se aspro appare il tuo sentier", englishSlug: "be-still-my-soul" },
  71: { title: "Noi che il Signore amiam", englishSlug: "we-are-all-enlisted" },
  72: { title: "Anima mia", englishSlug: "cast-thy-burden-upon-the-lord" },
  73: { title: "Oh, quanto dolce", englishSlug: "how-sweet-the-hour-of-closing-day" },
  74: { title: "La fede si rafforzerà", englishSlug: "we-walk-by-faith" },
  75: { title: "Dove trovar potrò pace e conforto?", englishSlug: "where-can-i-turn-for-peace" },
  76: { title: "Sii umile", englishSlug: "be-thou-humble" },
  77: { title: "Più forza Tu dammi", englishSlug: "lord-i-would-follow-thee" },
  78: { title: "Dio è nel Suo santo tempio", englishSlug: "the-lord-is-in-his-holy-temple" },
  79: { title: "Padre del cielo", englishSlug: "our-father-in-heaven" },
  80: { title: "Credo in Te, Gesù", englishSlug: "i-believe-in-christ" },
  81: { title: "Vive il Redentor", englishSlug: "i-know-that-my-redeemer-lives" },
  82: { title: "Io so che vive il Redentor", englishSlug: "i-know-that-my-redeemer-lives" },
  83: { title: "Testimonianza", englishSlug: "testimony" },
  84: { title: "Hai lasciato all'alba il sonno", englishSlug: "did-you-think-to-pray" },
  85: { title: "Gesù, se sol io penso a Te", englishSlug: "jesus-the-very-thought-of-thee" },
  86: { title: "È dolce l'ora del pregar", englishSlug: "sweet-hour-of-prayer" },
  87: { title: "Scenda in noi lo Spirto Tuo", englishSlug: "let-the-holy-spirit-guide" },
  88: { title: "C'è un'ora dolce e cheta", englishSlug: "there-is-an-hour-of-peace-and-rest" },
  89: { title: "Desio dell'alma", englishSlug: "as-the-dew-from-heaven-distilling" },
  90: { title: "Oggi è il giorno del Signor", englishSlug: "welcome-welcome-sabbath-morning" },
  91: { title: "Dolce è il lavoro del Signor", englishSlug: "sweet-is-the-work" },
  92: { title: "O gentile e giusto Padre", englishSlug: "gently-raise-the-sacred-strain" },
  93: { title: "La rugiada del mattino", englishSlug: "as-the-dew-from-heaven-distilling" },
  94: { title: "Fino al giorno in cui ci rivedrem", englishSlug: "god-be-with-you-till-we-meet-again" },
  95: { title: "Dolcemente cala il sol", englishSlug: "softly-now-the-light-of-day" },
  96: { title: "Or congedaci, Signore", englishSlug: "lord-dismiss-us-with-thy-blessing" },
  97: { title: "Muore questo giorno", englishSlug: "now-the-day-is-over" },
  98: { title: "Prima di lasciarci", englishSlug: "each-lifes-journey" },
  99: { title: "Or che stiamo per andar", englishSlug: "father-this-hour-has-been-one-of-joy" },
  100: { title: "Signore, resta qui con me", englishSlug: "abide-with-me" },
  101: { title: "Il dì declina", englishSlug: "abide-with-me-tis-eventide" },

  // Sacramento (Sacrament) - Hymns 102-117
  102: { title: "Umilmente, Salvatore", englishSlug: "while-of-these-emblems-we-partake" },
  103: { title: "Padre nostro, ascoltaci", englishSlug: "father-in-heaven-we-do-believe" },
  104: { title: "O Dio, eterno Padre", englishSlug: "o-god-the-eternal-father" },
  105: { title: "Iddio ebbe carità", englishSlug: "god-loved-us-so-he-sent-his-son" },
  106: { title: "Cantiamo insieme il grande amor", englishSlug: "how-great-the-wisdom-and-the-love" },
  107: { title: "Con canti e lodi inneggerem", englishSlug: "in-hymns-of-praise" },
  108: { title: "Riverentemente or", englishSlug: "reverently-and-meekly-now" },
  109: { title: "In cima al Calvario", englishSlug: "upon-the-cross-of-calvary" },
  110: { title: "Cristo di Nazaret, Re, Salvator", englishSlug: "jesus-of-nazareth-savior-and-king" },
  111: { title: "Il Padre diede il Suo Figliuol", englishSlug: "god-loved-us-so-he-sent-his-son" },
  112: { title: "Ricorda che Gesù morì", englishSlug: "in-memory-of-the-crucified" },
  113: { title: "Per ricordar Chi un dì morì", englishSlug: "in-remembrance-of-thy-suffering" },
  114: { title: "Attonito resto", englishSlug: "i-stand-all-amazed" },
  115: { title: "Un verde colle v'è lontano", englishSlug: "there-is-a-green-hill-far-away" },
  116: { title: "L'acqua e il pane noi prendiam", englishSlug: "as-now-we-take-the-sacrament" },
  117: { title: "Gesù nacque in umiltà", englishSlug: "jesus-once-of-humble-birth" },

  // Pasqua (Easter) - Hymns 118-119
  118: { title: "È risorto!", englishSlug: "christ-the-lord-is-risen-today" },
  119: { title: "È risorto il Signor", englishSlug: "he-is-risen" },

  // Natale (Christmas) - Hymns 120-131
  120: { title: "Gioisca il mondo", englishSlug: "joy-to-the-world" },
  121: { title: "Venite, fedeli", englishSlug: "oh-come-all-ye-faithful" },
  122: { title: "Gli angeli lassù nel ciel", englishSlug: "angels-we-have-heard-on-high" },
  123: { title: "Nato è Gesù", englishSlug: "far-far-away-on-judeas-plains" },
  124: { title: "Col capo sul fieno", englishSlug: "away-in-a-manger" },
  125: { title: "A mezzanotte in ciel s'udì", englishSlug: "it-came-upon-the-midnight-clear" },
  126: { title: "Betlemme, piccola città", englishSlug: "o-little-town-of-bethlehem" },
  127: { title: "Un Re nacque a Betleem", englishSlug: "once-in-royal-davids-city" },
  128: { title: "Campane il giorno di Natal", englishSlug: "i-heard-the-bells-on-christmas-day" },
  129: { title: "Là, nell'Oriente lontano, lontan", englishSlug: "with-wondering-awe" },
  130: { title: "Lieti siamo in cuor", englishSlug: "silent-night" },
  131: { title: "Natal, Natal", englishSlug: "oh-come-all-ye-faithful" },

  // Occasioni speciali (Special Occasions) - Hymns 132-186
  132: { title: "Un dolce suon si libra in ciel", englishSlug: "ring-out-wild-bells" },
  133: { title: "Poiché io molto ho avuto", englishSlug: "because-i-have-been-given-much" },
  134: { title: "O Signor, ch'io possa amarTi", englishSlug: "o-savior-thou-who-wearest-a-crown" },
  135: { title: "Caro al cuor del Pastore", englishSlug: "dear-to-the-heart-of-the-shepherd" },
  136: { title: "Ho aiutato il mio prossimo in questo dì?", englishSlug: "have-i-done-any-good" },
  137: { title: "Ogni giorno seminiamo", englishSlug: "we-are-sowing" },
  138: { title: "Ho ancor tanto da far", englishSlug: "theres-sunshine-in-my-soul-today" },
  139: { title: "Tesoro fa' dell'ore", englishSlug: "improve-the-shining-moments" },
  140: { title: "Nell'anima mia c'è il sol", englishSlug: "theres-sunshine-in-my-soul-today" },
  141: { title: "È più lieto il tuo cammin", englishSlug: "scatter-sunshine" },
  142: { title: "In ciel splende il sole", englishSlug: "today-while-the-sun-shines" },
  143: { title: "A chi è triste al mondo", englishSlug: "let-us-oft-speak-kind-words" },
  144: { title: "Con accenti gentili parliamo", englishSlug: "let-us-oft-speak-kind-words" },
  145: { title: "Se ti senti di accusare", englishSlug: "nay-speak-no-ill" },
  146: { title: "O Geova, Re di terra e ciel", englishSlug: "how-great-thou-art" },
  147: { title: "Fai ciò ch'è ben", englishSlug: "do-what-is-right" },
  148: { title: "Scegli il ben", englishSlug: "choose-the-right" },
  149: { title: "Vicini all'acque siamo già", englishSlug: "shall-we-gather-at-the-river" },
  150: { title: "Quando la tempesta s'avvicinerà", englishSlug: "count-your-blessings" },
  151: { title: "Avanziamo insiem nel lavoro del Signor", englishSlug: "let-us-all-press-on" },
  152: { title: "Su, soldati, in guardia!", englishSlug: "behold-a-royal-army" },
  153: { title: "Sia lode a Dio", englishSlug: "praise-god-from-whom-all-blessings-flow" },
  154: { title: "Stiam marciando verso la gloria", englishSlug: "onward-christian-soldiers" },
  155: { title: "La Tua casa amiam", englishSlug: "we-love-thy-house-o-god" },
  156: { title: "Chiamati a servirLo", englishSlug: "called-to-serve" },
  157: { title: "Arruolati dal Signor", englishSlug: "we-are-all-enlisted" },
  158: { title: "Siam la reale armata", englishSlug: "behold-a-royal-army" },
  159: { title: "Bisogno al mondo v'è di te", englishSlug: "you-can-make-the-pathway-bright" },
  160: { title: "Quest'inno ascolta, o Re", englishSlug: "god-of-our-fathers-whose-almighty-hand" },
  161: { title: "Forza, giovani di Sion", englishSlug: "carry-on" },
  162: { title: "Come montagne saremo", englishSlug: "true-to-the-faith" },
  163: { title: "Sei la rocca di salvezza", englishSlug: "rock-of-ages" },
  164: { title: "O speranza d'Israele", englishSlug: "hope-of-israel" },
  165: { title: "Chi sta con il Signor?", englishSlug: "who-is-on-the-lords-side" },
  166: { title: "Genti, guardate!", englishSlug: "hark-all-ye-nations" },
  167: { title: "La Tua parola", englishSlug: "thy-word-is-a-lamp" },
  168: { title: "Il giorno è vicin", englishSlug: "the-day-is-at-hand" },
  169: { title: "Andiam con fede", englishSlug: "go-forth-with-faith" },
  170: { title: "Su vette ardite mai forse andrò", englishSlug: "lord-i-would-follow-thee" },
  171: { title: "Qual gemma preziosa", englishSlug: "as-i-search-the-holy-scriptures" },
  172: { title: "Qual gloria traspar", englishSlug: "how-great-thou-art" },
  173: { title: "Se il Vangelo è nel tuo cuore", englishSlug: "when-faith-endures" },
  174: { title: "A Nefi un tempo Dio mostrò", englishSlug: "the-iron-rod" },
  175: { title: "Quando studio le Scritture", englishSlug: "as-i-search-the-holy-scriptures" },
  176: { title: "Benvenuto, bel mattino", englishSlug: "welcome-welcome-sabbath-morning" },
  177: { title: "Dammi la Tua ispirazione", englishSlug: "thy-spirit-lord-has-stirred-our-souls" },
  178: { title: "Se a Kolob tu potessi", englishSlug: "if-you-could-hie-to-kolob" },
  179: { title: "Ora, o santi, entriam nel tempio", englishSlug: "come-ye-children-of-the-lord" },
  180: { title: "Che bello il tempio del Signor", englishSlug: "i-love-to-see-the-temple" },
  181: { title: "Sacri templi sopra il monte di Sion", englishSlug: "holy-temples-on-mount-zion" },
  182: { title: "Padre mio", englishSlug: "o-my-father" },
  183: { title: "Il ben che tocca il nostro cuor", englishSlug: "love-at-home" },
  184: { title: "Padre mio", englishSlug: "o-my-father" },
  185: { title: "Se in casa vuoi il cielo", englishSlug: "home-can-be-a-heaven-on-earth" },
  186: { title: "Tutto è bello attorno a noi", englishSlug: "all-things-bright-and-beautiful" },

  // Bambini (Children) - Hymns 187-197
  187: { title: "Tu, Signor, ci sei vicino", englishSlug: "our-saviors-love" },
  188: { title: "I bambini sempre avranno", englishSlug: "children-of-our-heavenly-father" },
  189: { title: "Le famiglie sono eterne", englishSlug: "families-can-be-together-forever" },
  190: { title: "Sono un figlio di Dio", englishSlug: "i-am-a-child-of-god" },
  191: { title: "Mio Padre vive in ciel", englishSlug: "i-know-my-father-lives" },
  192: { title: "Vivi il Vangelo", englishSlug: "keep-the-commandments" },
  193: { title: "Mamma e papà, insegnatemi insiem", englishSlug: "teach-me-to-walk-in-the-light" },
  194: { title: "La luce del Signor", englishSlug: "the-light-divine" },
  195: { title: "Nella nostra bella Sion", englishSlug: "in-our-lovely-deseret" },
  196: { title: "Quand'Egli tornerà", englishSlug: "when-he-comes-again" },
  197: { title: "Come vi ho amati", englishSlug: "love-one-another" },

  // Donne (Women) - Hymn 198
  198: { title: "Noi, come sorelle in Sion", englishSlug: "as-sisters-in-zion" },

  // Uomini (Men) - Hymns 199-201
  199: { title: "Fratelli, siam chiamati", englishSlug: "brethren-we-have-met-to-worship" },
  200: { title: "O figli del Signor", englishSlug: "ye-simple-souls-who-stray" },
  201: { title: "Anziani d'Israele", englishSlug: "ye-elders-of-israel" },

  // Patria (Homeland) - Hymn 202
  202: { title: "Va, pensiero sull'ali dorate", englishSlug: "god-save-the-king" }
};

// Get the Italian hymn title by number
export const getItalianHymnTitle = (number: number): string => {
  return ITALIAN_HYMNS[number]?.title || '';
};

// Check if a hymn number is valid in the Italian hymnal
export const isValidItalianHymnNumber = (number: number): boolean => {
  return number in ITALIAN_HYMNS;
};

// Generate URL for Italian hymn (uses English slug with ?lang=ita)
export const getItalianHymnUrl = (number: number): string => {
  const hymn = ITALIAN_HYMNS[number];
  if (!hymn) return '';

  const slug = hymn.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/hymns/${slug}?lang=ita`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=hymns&lang=ita`;
};

// Search Italian hymns by title
export const searchItalianHymnByTitle = (searchTerm: string): Array<{number: number, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: number, title: string}> = [];

  // Search through all Italian hymns
  Object.entries(ITALIAN_HYMNS).forEach(([number, hymn]) => {
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
