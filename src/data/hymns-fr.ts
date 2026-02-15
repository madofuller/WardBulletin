// French Hymn Database (Cantiques)
// Maps French hymn numbers (1-204) to French titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints French Hymnal

export interface FrenchHymn {
  title: string;
  englishSlug: string;
}

// French hymn number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=fra
export const FRENCH_HYMNS: Record<number, FrenchHymn> = {
  // Rétablissement (Restoration) - Hymns 1-29
  1: { title: "L'aurore pointe", englishSlug: "the-morning-breaks" },
  2: { title: "L'Esprit du Dieu saint", englishSlug: "the-spirit-of-god" },
  3: { title: "Allons, réjouissons-nous", englishSlug: "now-let-us-rejoice" },
  4: { title: "Là-haut sur la montagne", englishSlug: "high-on-the-mountain-top" },
  5: { title: "Israël, Dieu t'appelle", englishSlug: "israel-israel-god-is-calling" },
  6: { title: "Un ange de là-haut", englishSlug: "an-angel-from-on-high" },
  7: { title: "Quelles scènes glorieuses", englishSlug: "what-glorious-scenes-mine-eyes-behold" },
  8: { title: "Toujours nous prions pour toi", englishSlug: "we-ever-pray-for-thee" },
  9: { title: "Dieu, nous te remercions", englishSlug: "we-thank-thee-o-god-for-a-prophet" },
  10: { title: "Venez écouter un prophète", englishSlug: "come-listen-to-a-prophets-voice" },
  11: { title: "Bénis notre prophète", englishSlug: "god-bless-our-prophet-dear" },
  12: { title: "Oh, quel matin merveilleux!", englishSlug: "joseph-smiths-first-prayer" },
  13: { title: "Gloire à celui qui vit", englishSlug: "praise-to-the-man" },
  14: { title: "Chantons en ce jour", englishSlug: "now-well-sing-with-one-accord" },
  15: { title: "Un pauvre voyageur", englishSlug: "a-poor-wayfaring-man-of-grief" },
  16: { title: "O montagnes", englishSlug: "o-ye-mountains-high" },
  17: { title: "Par la force des collines", englishSlug: "for-the-strength-of-the-hills" },
  18: { title: "Ces bâtisseurs du pays", englishSlug: "they-the-builders-of-the-nation" },
  19: { title: "Le jour d'hiver descend", englishSlug: "the-wintry-day-descending-to-its-close" },
  20: { title: "Venez, venez, saints", englishSlug: "come-come-ye-saints" },
  21: { title: "Que Sion dans sa beauté", englishSlug: "let-zion-in-her-beauty-rise" },
  22: { title: "Salut à la gloire de Sion", englishSlug: "hail-to-the-brightness-of-zions-glad-morning" },
  23: { title: "Sion est là sur les coteaux", englishSlug: "zion-stands-with-hills-surrounded" },
  24: { title: "Viens, jour glorieux des promesses", englishSlug: "come-thou-glorious-day-of-promise" },
  25: { title: "Belle Sion bâtie là-haut", englishSlug: "beautiful-zion-built-above" },
  26: { title: "L'aurore se lève", englishSlug: "the-day-dawn-is-breaking" },
  27: { title: "Venez, enfants du Seigneur", englishSlug: "come-ye-children-of-the-lord" },
  28: { title: "Oh, viens, Roi des rois", englishSlug: "come-o-thou-king-of-kings" },
  29: { title: "O créatures du Seigneur", englishSlug: "all-creatures-of-our-god-and-king" },

  // Louange et reconnaissance (Praise and Thanksgiving) - Hymns 30-50
  30: { title: "O saints qui habitez la terre", englishSlug: "come-all-ye-saints-who-dwell-on-earth" },
  31: { title: "Réjouissez-vous, le Seigneur est Roi", englishSlug: "rejoice-the-lord-is-king" },
  32: { title: "C'est un rempart que notre Dieu", englishSlug: "a-mighty-fortress-is-our-god" },
  33: { title: "Gloire à Dieu au plus haut", englishSlug: "glory-to-god-on-high" },
  34: { title: "Louons le Seigneur", englishSlug: "praise-to-the-lord-the-almighty" },
  35: { title: "Louez l'Éternel", englishSlug: "praise-ye-the-lord" },
  36: { title: "Dieu est amour", englishSlug: "god-is-love" },
  37: { title: "L'Éternel est mon berger", englishSlug: "the-lord-is-my-shepherd" },
  38: { title: "Hosanna! Gloire et louange", englishSlug: "all-glory-laud-and-honor" },
  39: { title: "Oui, que nos coeurs exultent", englishSlug: "sing-praise-to-him" },
  40: { title: "Guide-nous, ô Jéhovah", englishSlug: "guide-us-o-thou-great-jehovah" },
  41: { title: "Allez de l'avant, saints", englishSlug: "press-forward-saints" },
  42: { title: "Quel fondement ferme", englishSlug: "how-firm-a-foundation" },
  43: { title: "Que tu es grand", englishSlug: "how-great-thou-art" },
  44: { title: "Le Seigneur est ma lumière", englishSlug: "the-lord-is-my-light" },
  45: { title: "Venez, vous qui aimez le Seigneur", englishSlug: "come-we-that-love-the-lord" },
  46: { title: "De l'univers entier", englishSlug: "from-all-that-dwell-below-the-skies" },
  47: { title: "Chers enfants, Dieu est près", englishSlug: "dearest-children-god-is-near-you" },
  48: { title: "O Père bon et tendre", englishSlug: "o-thou-kind-and-gracious-father" },
  49: { title: "Pour la beauté de la terre", englishSlug: "for-the-beauty-of-the-earth" },
  50: { title: "Prière de reconnaissance", englishSlug: "prayer-of-thanksgiving" },

  // Prière et supplication (Prayer and Supplication) - Hymns 51-95
  51: { title: "Venez, peuple, rendez grâce", englishSlug: "come-ye-thankful-people" },
  52: { title: "Maintenant remercions tous", englishSlug: "now-thank-we-all-our-god" },
  53: { title: "Quand la foi persévère", englishSlug: "when-faith-endures" },
  54: { title: "Doux est le travail", englishSlug: "sweet-is-the-work" },
  55: { title: "Grand est le Seigneur", englishSlug: "great-is-the-lord" },
  56: { title: "De coeur et de voix", englishSlug: "with-all-the-power-of-heart-and-tongue" },
  57: { title: "Compte tes bienfaits", englishSlug: "count-your-blessings" },
  58: { title: "Grand Dieu, entends Sion", englishSlug: "great-god-attend-while-zion-sings" },
  59: { title: "Gloire à Dieu, notre Père", englishSlug: "praise-god-from-whom-all-blessings-flow" },
  60: { title: "Conduis-moi, douce lumière", englishSlug: "lead-kindly-light" },
  61: { title: "J'ai besoin de toi chaque heure", englishSlug: "i-need-thee-every-hour" },
  62: { title: "Plus près de toi, mon Dieu", englishSlug: "nearer-my-god-to-thee" },
  63: { title: "Guide-moi vers toi", englishSlug: "guide-me-to-thee" },
  64: { title: "Père céleste", englishSlug: "father-in-heaven" },
  65: { title: "Jésus, toi qui aimes mon âme", englishSlug: "jesus-lover-of-my-soul" },
  66: { title: "Je crois au Christ", englishSlug: "i-believe-in-christ" },
  67: { title: "Mon Rédempteur vit", englishSlug: "my-redeemer-lives" },
  68: { title: "Venez à lui", englishSlug: "come-unto-him" },
  69: { title: "Venez au Christ", englishSlug: "come-unto-jesus" },
  70: { title: "Je sais qu'il vit, mon Rédempteur", englishSlug: "i-know-that-my-redeemer-lives" },
  71: { title: "Témoignage", englishSlug: "testimony" },
  72: { title: "Maître, la tempête fait rage", englishSlug: "master-the-tempest-is-raging" },
  73: { title: "Vers qui irai-je pour la paix?", englishSlug: "where-can-i-turn-for-peace" },
  74: { title: "Soyez humbles", englishSlug: "be-thou-humble" },
  75: { title: "Donne-moi plus de sainteté", englishSlug: "more-holiness-give-me" },
  76: { title: "Rocher des âges", englishSlug: "rock-of-ages" },
  77: { title: "La lumière divine", englishSlug: "the-light-divine" },
  78: { title: "Même dans les épreuves", englishSlug: "though-deepening-trials" },
  79: { title: "O douce heure de prière", englishSlug: "sweet-hour-of-prayer" },
  80: { title: "Laisse le Saint-Esprit te guider", englishSlug: "let-the-holy-spirit-guide" },
  81: { title: "La prière secrète", englishSlug: "secret-prayer" },
  82: { title: "Nous sommes ici, Seigneur", englishSlug: "we-meet-dear-lord" },
  83: { title: "As-tu pensé à prier?", englishSlug: "did-you-think-to-pray" },
  84: { title: "Jésus, que ta pensée", englishSlug: "jesus-the-very-thought-of-thee" },
  85: { title: "Dieu soit avec vous", englishSlug: "god-be-with-you-till-we-meet-again" },
  86: { title: "Seigneur, avant de nous séparer", englishSlug: "lord-we-ask-thee-ere-we-part" },
  87: { title: "O Père éternel", englishSlug: "god-our-father-hear-us-pray" },
  88: { title: "Donne-nous, bon Père", englishSlug: "father-this-hour-has-been-one-of-joy" },
  89: { title: "Chantons en nous séparant", englishSlug: "sing-we-now-at-parting" },
  90: { title: "Ton Esprit, Seigneur", englishSlug: "thy-spirit-lord-has-stirred-our-souls" },
  91: { title: "Comme la rosée du ciel", englishSlug: "as-the-dew-from-heaven-distilling" },
  92: { title: "La nuit descend", englishSlug: "now-the-day-is-over" },
  93: { title: "Doucement meurt le jour", englishSlug: "softly-now-the-light-of-day" },
  94: { title: "Grand Dieu, ce chant du soir", englishSlug: "great-god-to-thee-my-evening-song" },
  95: { title: "Reste avec moi, le jour décline", englishSlug: "abide-with-me-tis-eventide" },

  // Sainte-Cène (Sacrament) - Hymns 96-118
  96: { title: "Reste avec moi", englishSlug: "abide-with-me" },
  97: { title: "Chantons un hymne du soir", englishSlug: "come-let-us-sing-an-evening-hymn" },
  98: { title: "En prenant la Sainte-Cène", englishSlug: "as-now-we-take-the-sacrament" },
  99: { title: "D'un coeur humble", englishSlug: "with-humble-heart" },
  100: { title: "En humilité, Sauveur", englishSlug: "in-humility-our-savior" },
  101: { title: "En prenant ces emblèmes", englishSlug: "while-of-these-emblems-we-partake" },
  102: { title: "Dieu, Père éternel", englishSlug: "o-god-the-eternal-father" },
  103: { title: "Qu'il est doux de chanter l'amour", englishSlug: "tis-sweet-to-sing-the-matchless-love" },
  104: { title: "O Seigneur des cieux", englishSlug: "o-lord-of-hosts" },
  105: { title: "Encore une fois, Seigneur", englishSlug: "again-our-dear-redeeming-lord" },
  106: { title: "Père céleste, nous croyons", englishSlug: "father-in-heaven-we-do-believe" },
  107: { title: "Jésus de Nazareth, Sauveur et Roi", englishSlug: "jesus-of-nazareth-savior-and-king" },
  108: { title: "Chantons tous à Jésus", englishSlug: "well-sing-all-hail-to-jesus-name" },
  109: { title: "En souvenir de ta souffrance", englishSlug: "in-remembrance-of-thy-suffering" },
  110: { title: "Sur la croix du Calvaire", englishSlug: "upon-the-cross-of-calvary" },
  111: { title: "Humblement et avec respect", englishSlug: "reverently-and-meekly-now" },
  112: { title: "A nouveau réunis", englishSlug: "again-we-meet-around-the-board" },
  113: { title: "Dieu nous aima et envoya son Fils", englishSlug: "god-loved-us-so-he-sent-his-son" },
  114: { title: "Que ta volonté soit faite", englishSlug: "thy-will-o-lord-be-done" },
  115: { title: "O toi, avant le monde", englishSlug: "o-thou-before-the-world-began" },
  116: { title: "En mémoire du Crucifié", englishSlug: "in-memory-of-the-crucified" },
  117: { title: "Voyez mourir le Rédempteur", englishSlug: "behold-the-great-redeemer-die" },
  118: { title: "Il est mort, le grand Rédempteur", englishSlug: "he-died-the-great-redeemer-died" },

  // Pâques (Easter) - Hymns 119-122
  119: { title: "Je reste confondu", englishSlug: "i-stand-all-amazed" },
  120: { title: "Il est un vert coteau", englishSlug: "there-is-a-green-hill-far-away" },
  121: { title: "Qu'elle est grande la sagesse", englishSlug: "how-great-the-wisdom-and-the-love" },
  122: { title: "Jésus, autrefois humble enfant", englishSlug: "jesus-once-of-humble-birth" },

  // Noël (Christmas) - Hymns 123-137
  123: { title: "O Sauveur, toi qui portes", englishSlug: "o-savior-thou-who-wearest-a-crown" },
  124: { title: "Ce matin de Pâques", englishSlug: "that-easter-morn" },
  125: { title: "Il est ressuscité!", englishSlug: "he-is-risen" },
  126: { title: "Christ est ressuscité", englishSlug: "christ-the-lord-is-risen-today" },
  127: { title: "Joie au monde", englishSlug: "joy-to-the-world" },
  128: { title: "Oh! venez, fidèles", englishSlug: "oh-come-all-ye-faithful" },
  129: { title: "Les anges dans nos campagnes", englishSlug: "angels-we-have-heard-on-high" },
  130: { title: "Douce nuit", englishSlug: "silent-night" },
  131: { title: "Dans une cité royale", englishSlug: "once-in-royal-davids-city" },
  132: { title: "Dans une étable obscure", englishSlug: "away-in-a-manger" },
  133: { title: "Vers minuit vint du ciel", englishSlug: "it-came-upon-the-midnight-clear" },
  134: { title: "O petite ville de Bethléhem", englishSlug: "o-little-town-of-bethlehem" },
  135: { title: "Ecoutez le chant des anges", englishSlug: "hark-the-herald-angels-sing" },
  136: { title: "Avec admiration", englishSlug: "with-wondering-awe" },
  137: { title: "La nuit où naquit l'Enfant", englishSlug: "while-shepherds-watched-their-flocks" },

  // Sujets divers (Various Subjects) - Hymns 138-200
  138: { title: "Au loin dans la Judée", englishSlug: "far-far-away-on-judeas-plains" },
  139: { title: "Le premier Noël", englishSlug: "the-first-noel" },
  140: { title: "J'entendis les cloches", englishSlug: "i-heard-the-bells-on-christmas-day" },
  141: { title: "Sonnez, cloches", englishSlug: "ring-out-wild-bells" },
  142: { title: "Allons, recommençons", englishSlug: "come-let-us-anew" },
  143: { title: "Nous te rendons ce qui est tien", englishSlug: "we-give-thee-but-thine-own" },
  144: { title: "Parce que j'ai beaucoup reçu", englishSlug: "because-i-have-been-given-much" },
  145: { title: "Seigneur, je veux te suivre", englishSlug: "lord-i-would-follow-thee" },
  146: { title: "Cher au coeur du berger", englishSlug: "dear-to-the-heart-of-the-shepherd" },
  147: { title: "Ecoute notre prière", englishSlug: "hear-thou-our-prayer-o-lord" },
  148: { title: "Ai-je fait du bien?", englishSlug: "have-i-done-any-good" },
  149: { title: "J'ai beaucoup à faire", englishSlug: "i-have-work-enough-to-do" },
  150: { title: "Nous marchons vers la gloire", englishSlug: "we-are-marching-on-to-glory" },
  151: { title: "Améliorons chaque instant", englishSlug: "improve-the-shining-moments" },
  152: { title: "Il y a du soleil dans mon âme", englishSlug: "there-is-sunshine-in-my-soul-today" },
  153: { title: "Tu peux rendre ton sentier clair", englishSlug: "you-can-make-the-pathway-bright" },
  154: { title: "Aujourd'hui, pendant qu'il fait beau", englishSlug: "today-while-the-sun-shines" },
  155: { title: "Répandons la joie", englishSlug: "scatter-sunshine" },
  156: { title: "Père, réjouis nos coeurs", englishSlug: "father-cheer-our-souls-tonight" },
  157: { title: "Disons souvent des mots aimables", englishSlug: "let-us-oft-speak-kind-words" },
  158: { title: "Ne dis pas de mal", englishSlug: "nay-speak-no-ill" },
  159: { title: "Jésus, grand Roi en Sion", englishSlug: "jesus-mighty-king-in-zion" },
  160: { title: "Si tu es tenté de critiquer", englishSlug: "should-you-feel-inclined-to-censure" },
  161: { title: "Seigneur, accueille en ton royaume", englishSlug: "lord-accept-into-thy-kingdom" },
  162: { title: "Fais ce qui est bien", englishSlug: "do-what-is-right" },
  163: { title: "Vois tes fils et filles, Seigneur", englishSlug: "behold-thy-sons-and-daughters-lord" },
  164: { title: "Choisis le bien", englishSlug: "choose-the-right" },
  165: { title: "Sache que toute âme est libre", englishSlug: "know-this-that-every-soul-is-free" },
  166: { title: "Pressons-nous tous", englishSlug: "let-us-all-press-on" },
  167: { title: "Venez, venez", englishSlug: "come-along-come-along" },
  168: { title: "En avant, soldats du Christ", englishSlug: "onward-christian-soldiers" },
  169: { title: "Ta maison, nous l'aimons", englishSlug: "we-love-thy-house-o-god" },
  170: { title: "Poussez à la roue", englishSlug: "put-your-shoulder-to-the-wheel" },
  171: { title: "Appelés à servir", englishSlug: "called-to-serve" },
  172: { title: "Nous sommes engagés", englishSlug: "we-are-all-enlisted" },
  173: { title: "Fidèles à la foi", englishSlug: "true-to-the-faith" },
  174: { title: "Continue", englishSlug: "carry-on" },
  175: { title: "Jeunesse de Sion", englishSlug: "as-zions-youth-in-latter-days" },
  176: { title: "Réjouissez-vous!", englishSlug: "rejoice-a-glorious-sound-is-heard" },
  177: { title: "O Seigneur, roc du salut", englishSlug: "o-thou-rock-of-our-salvation" },
  178: { title: "Espérance d'Israël", englishSlug: "hope-of-israel" },
  179: { title: "Qui est du côté du Seigneur?", englishSlug: "whos-on-the-lords-side" },
  180: { title: "Tes serviteurs sont prêts", englishSlug: "thy-servants-are-prepared" },
  181: { title: "Allez, messagers de gloire", englishSlug: "go-ye-messengers-of-glory" },
  182: { title: "Va de l'avant avec foi", englishSlug: "go-forth-with-faith" },
  183: { title: "Ecoutez, toutes les nations!", englishSlug: "hark-all-ye-nations" },
  184: { title: "Lève-toi, ô Dieu, et brille", englishSlug: "arise-o-god-and-shine" },
  185: { title: "Le temps presse", englishSlug: "the-time-is-far-spent" },
  186: { title: "Admirable et merveilleux", englishSlug: "how-wondrous-and-great" },
  187: { title: "Venez, vous tous dont l'âme est éclairée", englishSlug: "come-all-whose-souls-are-lighted" },
  188: { title: "J'irai où tu voudras", englishSlug: "ill-go-where-you-want-me-to-go" },
  189: { title: "O saintes paroles de lumière", englishSlug: "oh-holy-words-of-truth-and-love" },
  190: { title: "Qu'est-ce que la vérité?", englishSlug: "oh-say-what-is-truth" },
  191: { title: "La vérité reflète", englishSlug: "truth-reflects-upon-our-senses" },
  192: { title: "La barre de fer", englishSlug: "the-iron-rod" },
  193: { title: "Les hommes sont pour avoir la joie", englishSlug: "men-are-that-they-might-have-joy" },
  194: { title: "En sondant les Ecritures", englishSlug: "as-i-search-the-holy-scriptures" },
  195: { title: "Ta sainte parole", englishSlug: "thy-holy-word" },
  196: { title: "Bienvenue, bon jour, Ecole du Dimanche", englishSlug: "welcome-welcome-sabbath-morning" },
  197: { title: "Si tu pouvais aller à Kolob", englishSlug: "if-you-could-hie-to-kolob" },
  198: { title: "Dieu agit mystérieusement", englishSlug: "god-moves-in-a-mysterious-way" },
  199: { title: "Oh! quels chants du coeur", englishSlug: "oh-what-songs-of-the-heart" },
  200: { title: "O saints, entrez dans les temples", englishSlug: "rise-ye-saints-and-temples-enter" },

  // Pour voix de femmes (For Women's Voices) - Hymn 201
  201: { title: "Que tes temples sont beaux", englishSlug: "how-beautiful-thy-temples-lord" },

  // Pour voix d'hommes (For Men's Voices) - Hymns 202-204
  202: { title: "Saints temples sur les montagnes", englishSlug: "holy-temples-on-mount-zion" },
  203: { title: "O mon Père", englishSlug: "o-my-father" },
  204: { title: "Chaque vie qui touche la mienne", englishSlug: "each-life-that-touches-ours-for-good" },

  // Sabbat et jour de semaine (Sabbath and Weekday) - Hymns 1001-1051
  1001: { title: "Ô toi, Source bienveillante !", englishSlug: "come-thou-fount-of-every-blessing" },
  1002: { title: "Quand le Sauveur reviendra", englishSlug: "when-the-savior-comes-again" },
  1003: { title: "Mon âme est en paix", englishSlug: "it-is-well-with-my-soul" },
  1004: { title: "Je marche avec Jésus", englishSlug: "i-walk-by-faith" },
  1005: { title: "Il veille aussi sur moi", englishSlug: "his-eye-is-on-the-sparrow" },
  1006: { title: "Un chant dans le cœur", englishSlug: "a-song-in-the-heart" },
  1007: { title: "Le pain rompu", englishSlug: "the-bread-is-broken" },
  1008: { title: "Pain de vie, toi, l'eau vive", englishSlug: "bread-of-life-living-water" },
  1009: { title: "Gethsémané", englishSlug: "gethsemane" },
  1010: { title: "Grâce infinie", englishSlug: "amazing-grace" },
  1011: { title: "Nous nous tenons par la main", englishSlug: "we-hold-thy-hand" },
  1012: { title: "En tout temps, en tout lieu", englishSlug: "always-in-every-place" },
  1013: { title: "Chaque jour, en tout lieu, à toute heure", englishSlug: "every-day-every-place-every-hour" },
  1014: { title: "Mon doux berger", englishSlug: "my-gentle-shepherd" },
  1015: { title: "Oh ! l'amour profond du Maître", englishSlug: "oh-the-deep-deep-love-of-jesus" },
  1016: { title: "Voyez les mains de Jésus-Christ", englishSlug: "behold-the-wounds-in-jesus-hands" },
  1017: { title: "Il est le Christ !", englishSlug: "he-is-the-christ" },
  1018: { title: "Viens, Seigneur Jésus !", englishSlug: "come-lord-jesus" },
  1019: { title: "Aimer tout comme toi", englishSlug: "to-love-as-thou-hast-loved" },
  1020: { title: "Aimant et tendre, Jésus nous appelle", englishSlug: "softly-and-tenderly-jesus-is-calling" },
  1021: { title: "Mon Sauveur m'aime vraiment", englishSlug: "my-savior-loves-me" },
  1022: { title: "Nos pas guidés par la foi", englishSlug: "we-walk-by-faith" },
  1023: { title: "Je tiens ferme", englishSlug: "i-will-hold-on" },
  1024: { title: "Oui, j'ai foi en Jésus, mon Sauveur", englishSlug: "i-have-faith-in-jesus-christ" },
  1025: { title: "Qu'à tout jamais, mon cœur te soit consacré", englishSlug: "take-my-heart-o-lord" },
  1026: { title: "Je me tiens en des lieux saints", englishSlug: "i-stand-in-holy-places" },
  1027: { title: "Dieu nous attend", englishSlug: "god-waits-for-us" },
  1028: { title: "Cette lumière en moi", englishSlug: "this-little-light-of-mine" },
  1029: { title: "Je ne peux dénombrer les preuves", englishSlug: "i-cannot-count-my-blessings" },
  1030: { title: "Tout près quand je le prie", englishSlug: "near-when-i-pray" },
  1031: { title: "Prêtez l'oreille à la parole", englishSlug: "give-ear-to-the-word" },
  1032: { title: "Vois son éclat t'illuminer", englishSlug: "see-his-glory-shine-on-thee" },
  1033: { title: "Qu'il est bon de servir chaque jour", englishSlug: "how-good-it-is-to-serve-each-day" },
  1034: { title: "Je suis un pionnier d'aujourd'hui", englishSlug: "i-am-a-pioneer-today" },
  1035: { title: "Quand j'honore le sabbat", englishSlug: "when-i-honor-the-sabbath" },
  1036: { title: "Lis le Livre de Mormon et prie", englishSlug: "read-the-book-of-mormon-and-pray" },
  1037: { title: "Je vivrai pour servir Dieu", englishSlug: "i-will-live-to-serve-god" },
  1038: { title: "Dieu, l'Éternel, est mon berger", englishSlug: "the-lord-is-my-shepherd" },
  1039: { title: "Il m'a tout donné", englishSlug: "he-gave-me-everything" },
  1040: { title: "La voix de l'Agneau", englishSlug: "the-voice-of-the-lamb" },
  1041: { title: "Seigneur, toi qui donnas ta vie", englishSlug: "lord-who-gave-thy-life" },
  1042: { title: "Toi, Dieu de grâce", englishSlug: "thou-god-of-grace" },
  1043: { title: "Oh ! aide-nous à mieux nous souvenir", englishSlug: "oh-help-us-better-to-remember" },
  1044: { title: "Comment Jésus a-t-il servi ?", englishSlug: "how-did-jesus-serve" },
  1045: { title: "Jésus est le chemin glorieux", englishSlug: "jesus-is-the-glorious-way" },
  1046: { title: "Dis, combien d'étoiles brillent ?", englishSlug: "can-you-count-the-stars" },
  1047: { title: "Il prend soin de moi", englishSlug: "he-takes-care-of-me" },
  1048: { title: "Nous te prions, ô notre Père", englishSlug: "we-pray-to-thee-our-father" },
  1049: { title: "Tout comme Joseph, je peux prier", englishSlug: "like-joseph-i-can-pray" },
  1050: { title: "Soutiens-moi", englishSlug: "sustain-me" },
  1051: { title: "Ce jour est si bon, Seigneur", englishSlug: "this-day-is-so-good-lord" },

  // Pâques et Noël (Easter and Christmas) - Hymns 1201-1209
  1201: { title: "Saluez ce jour béni !", englishSlug: "hail-this-blessed-day" },
  1202: { title: "Il est né le divin Enfant", englishSlug: "he-is-born-the-divine-child" },
  1203: { title: "Quel est l'Enfant ?", englishSlug: "what-child-is-this" },
  1204: { title: "Belle étoile", englishSlug: "beautiful-star" },
  1205: { title: "Pour Pâques, tous, chantez !", englishSlug: "for-easter-all-sing" },
  1206: { title: "Étiez-vous là ?", englishSlug: "were-you-there" },
  1207: { title: "Tout est calme enfin", englishSlug: "all-is-calm-at-last" },
  1208: { title: "Viens, crie sur les montagnes !", englishSlug: "go-tell-it-on-the-mountain" },
  1209: { title: "Doux bébé dans la mangeoire", englishSlug: "sweet-baby-in-a-manger" },
};

// Get the French hymn title by number
export const getFrenchHymnTitle = (number: number): string => {
  return FRENCH_HYMNS[number]?.title || '';
};

// Get the English slug for URL generation
export const getFrenchHymnEnglishSlug = (number: number): string => {
  return FRENCH_HYMNS[number]?.englishSlug || '';
};

// Check if a hymn number is valid in the French hymnal
export const isValidFrenchHymnNumber = (number: number): boolean => {
  return number in FRENCH_HYMNS;
};

// Generate URL for French hymn (uses English slug with ?lang=fra)
export const getFrenchHymnUrl = (number: number): string => {
  const hymn = FRENCH_HYMNS[number];
  if (!hymn) return '';

  const slug = hymn.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/hymns/${slug}?lang=fra`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=hymns&lang=fra`;
};

// Search French hymns by title
export const searchFrenchHymnByTitle = (searchTerm: string): Array<{number: number, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: number, title: string}> = [];

  // Search through all French hymns
  Object.entries(FRENCH_HYMNS).forEach(([number, hymn]) => {
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
