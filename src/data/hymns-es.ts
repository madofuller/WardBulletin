// Spanish Hymn Database
// Maps Spanish hymn numbers (1-209) to Spanish titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints Spanish Hymnal (Himnos)

export interface SpanishHymn {
  title: string;
  englishSlug: string;
}

// Spanish hymn number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=spa
export const SPANISH_HYMNS: Record<number, SpanishHymn> = {
  // La Restauración (Restoration) - Hymns 1-29
  1: { title: "Ya rompe el alba", englishSlug: "the-morning-breaks" },
  2: { title: "El Espíritu de Dios", englishSlug: "the-spirit-of-god" },
  3: { title: "Ya regocijemos", englishSlug: "now-let-us-rejoice" },
  4: { title: "Bandera de Sión", englishSlug: "high-on-the-mountain-top" },
  5: { title: "Oh Dios de Israel", englishSlug: "redeemer-of-israel" },
  6: { title: "Israel, Jesús os llama", englishSlug: "israel-israel-god-is-calling" },
  7: { title: "Id, vosotros mensajeros", englishSlug: "go-ye-messengers-of-glory" },
  8: { title: "¿Qué es lo que vieron en las alturas?", englishSlug: "what-was-witnessed-in-the-heavens" },
  9: { title: "Un ángel del Señor", englishSlug: "an-angel-from-on-high" },
  10: { title: "Te damos, Señor, nuestras gracias", englishSlug: "we-thank-thee-o-god-for-a-prophet" },
  11: { title: "Dios manda a profetas", englishSlug: "come-listen-to-a-prophets-voice" },
  12: { title: "Pedimos hoy por ti", englishSlug: "we-ever-pray-for-thee" },
  13: { title: "Bendice, Dios, a nuestro Profeta", englishSlug: "god-bless-our-prophet-dear" },
  14: { title: "La oración del Profeta", englishSlug: "joseph-smiths-first-prayer" },
  15: { title: "Loor al Profeta", englishSlug: "praise-to-the-man" },
  16: { title: "Un pobre forastero", englishSlug: "a-poor-wayfaring-man-of-grief" },
  17: { title: "¡Oh, está todo bien!", englishSlug: "come-come-ye-saints" },
  18: { title: "Oh Sión, santuario de libertad", englishSlug: "o-ye-mountains-high" },
  19: { title: "Por Tus dones loor cantamos", englishSlug: "for-the-strength-of-the-hills" },
  20: { title: "Gozoso día llega ya", englishSlug: "the-day-dawn-is-breaking" },
  21: { title: "¡Salve, Sión! Es tu día ilustre", englishSlug: "hail-to-the-brightness-of-zions-glad-morning" },
  22: { title: "En las cumbres de los montes", englishSlug: "in-the-mountain-top" },
  23: { title: "Bella Sión", englishSlug: "beautiful-zion-built-above" },
  24: { title: "El alba ya rompe", englishSlug: "let-zion-in-her-beauty-rise" },
  25: { title: "Jehová aparece en Su gloria", englishSlug: "jehovah-lord-of-heaven-and-earth" },
  26: { title: "Hijos del Señor, venid", englishSlug: "come-ye-children-of-the-lord" },
  27: { title: "Oh Rey de reyes, ven", englishSlug: "come-o-thou-king-of-kings" },
  28: { title: "Himno de batalla de la República", englishSlug: "battle-hymn-of-the-republic" },
  29: { title: "Ven, oh día prometido", englishSlug: "come-thou-glorious-day-of-promise" },

  // Alabanza y agradecimiento (Praise and Thanks) - Hymns 30-47
  30: { title: "A Cristo Rey Jesús", englishSlug: "rejoice-the-lord-is-king" },
  31: { title: "Oh, creaciones del Señor", englishSlug: "all-creatures-of-our-god-and-king" },
  32: { title: "Baluarte firme es nuestro Dios", englishSlug: "a-mighty-fortress-is-our-god" },
  33: { title: "Honor, loor y gloria", englishSlug: "all-glory-laud-and-honor" },
  34: { title: "Oh, Santo Dios, omnipotente ser", englishSlug: "great-is-the-lord" },
  35: { title: "Haznos pensar en Ti, Señor", englishSlug: "we-meet-dear-lord" },
  36: { title: "Padre bendito, venimos a Ti", englishSlug: "o-thou-kind-and-gracious-father" },
  37: { title: "Glorias cantad a Dios", englishSlug: "glory-to-god-on-high" },
  38: { title: "Santos, avanzad", englishSlug: "press-forward-saints" },
  39: { title: "Jehová, sé nuestro guía", englishSlug: "guide-us-o-thou-great-jehovah" },
  40: { title: "Qué firmes cimientos", englishSlug: "how-firm-a-foundation" },
  41: { title: "¡Grande eres Tú!", englishSlug: "how-great-thou-art" },
  42: { title: "Jesús es mi luz", englishSlug: "the-lord-is-my-light" },
  43: { title: "Por la belleza terrenal", englishSlug: "for-the-beauty-of-the-earth" },
  44: { title: "El sublime Creador", englishSlug: "praise-to-the-lord-the-almighty" },
  45: { title: "Oración de gratitud", englishSlug: "prayer-of-thanksgiving" },
  46: { title: "Elevemos nuestros himnos", englishSlug: "from-all-that-dwell-below-the-skies" },
  47: { title: "Caros niños, Dios os ama", englishSlug: "dearest-children-god-is-near-you" },

  // Súplica (Supplication) - Hymns 48-100
  48: { title: "Divina Luz", englishSlug: "lead-kindly-light" },
  49: { title: "Señor, te necesito", englishSlug: "i-need-thee-every-hour" },
  50: { title: "Más cerca, Dios, de ti", englishSlug: "nearer-my-god-to-thee" },
  51: { title: "Guíame, oh Salvador", englishSlug: "savior-like-a-shepherd-lead-us" },
  52: { title: "Guíame a Ti", englishSlug: "guide-me-to-thee" },
  53: { title: "¡Oh Jesús, mi gran amor!", englishSlug: "jesus-lover-of-my-soul" },
  54: { title: "Paz, cálmense", englishSlug: "master-the-tempest-is-raging" },
  55: { title: "Dios da valor", englishSlug: "god-moves-in-a-mysterious-way" },
  56: { title: "Jehová mi Pastor es", englishSlug: "the-lord-is-my-shepherd" },
  57: { title: "El amor del Salvador", englishSlug: "i-feel-my-saviors-love" },
  58: { title: "Roca de eternidad", englishSlug: "rock-of-ages" },
  59: { title: "Mirad al Salvador", englishSlug: "behold-the-great-redeemer-die" },
  60: { title: "Venid a Cristo", englishSlug: "come-unto-jesus" },
  61: { title: "Venid a Mí", englishSlug: "come-unto-him" },
  62: { title: "No desmayéis, oh santos", englishSlug: "let-us-all-press-on" },
  63: { title: "Aunque colmados de pesar", englishSlug: "though-deepening-trials" },
  64: { title: "Venid, los que a Dios amáis", englishSlug: "come-we-that-love-the-lord" },
  65: { title: "¿Sin contestar?", englishSlug: "does-the-journey-seem-long" },
  66: { title: "Cuán dulce la ley de Dios", englishSlug: "how-gentle-gods-commands" },
  67: { title: "Si la vía es penosa", englishSlug: "improve-the-shining-moments" },
  68: { title: "La fe", englishSlug: "when-faith-endures" },
  69: { title: "¿Dónde hallo el solaz?", englishSlug: "where-can-i-turn-for-peace" },
  70: { title: "Sé humilde", englishSlug: "be-thou-humble" },
  71: { title: "Más santidad dame", englishSlug: "more-holiness-give-me" },
  72: { title: "Creo en Cristo", englishSlug: "i-believe-in-christ" },
  73: { title: "Yo sé que vive mi Señor", englishSlug: "i-know-that-my-redeemer-lives" },
  74: { title: "Vive mi Señor", englishSlug: "my-redeemer-lives" },
  75: { title: "Testimonio", englishSlug: "testimony" },
  76: { title: "Tan sólo con pensar en Ti", englishSlug: "jesus-the-very-thought-of-thee" },
  77: { title: "Deja que el Espíritu te enseñe", englishSlug: "let-the-holy-spirit-guide" },
  78: { title: "Oh dulce, grata oración", englishSlug: "sweet-hour-of-prayer" },
  79: { title: "La oración del alma es", englishSlug: "prayer-is-the-souls-sincere-desire" },
  80: { title: "Secreta oración", englishSlug: "secret-prayer" },
  81: { title: "¿Pensaste orar?", englishSlug: "did-you-think-to-pray" },
  82: { title: "Padre en los cielos", englishSlug: "father-in-heaven" },
  83: { title: "Entonad sagrado son", englishSlug: "sing-praise-to-him" },
  84: { title: "Dulce Tu obra es, Señor", englishSlug: "sweet-is-the-work" },
  85: { title: "El día santo del Señor", englishSlug: "sabbath-day" },
  86: { title: "Nuestro bondadoso Padre", englishSlug: "god-our-father-hear-us-pray" },
  87: { title: "Cual rocío, que destila", englishSlug: "as-the-dew-from-heaven-distilling" },
  88: { title: "Placentero nos es trabajar", englishSlug: "sweet-is-the-work" },
  89: { title: "Para siempre Dios esté con Vos", englishSlug: "god-be-with-you-till-we-meet-again" },
  90: { title: "Padre, antes de partir", englishSlug: "lord-we-ask-thee-ere-we-part" },
  91: { title: "Al partir cantemos", englishSlug: "sing-we-now-at-parting" },
  92: { title: "Hemos sentido Tu amor", englishSlug: "thy-spirit-lord-has-stirred-our-souls" },
  93: { title: "A Ti, Señor", englishSlug: "to-thee-our-god-we-fly" },
  94: { title: "Ya termina el día", englishSlug: "now-the-day-is-over" },
  95: { title: "El fuego del Espíritu", englishSlug: "the-spirit-of-god" },
  96: { title: "El ocaso viene ya", englishSlug: "softly-now-the-light-of-day" },
  97: { title: "Ante Ti, Señor, Tu grey", englishSlug: "great-god-to-thee-my-evening-song" },
  98: { title: "Conmigo quédate, Señor", englishSlug: "abide-with-me" },
  99: { title: "Acompáñame", englishSlug: "abide-with-me-tis-eventide" },
  100: { title: "Dios, bendícenos", englishSlug: "father-this-hour-has-been-one-of-joy" },

  // La Santa Cena (Sacrament) - Hymns 101-120
  101: { title: "Dios, escúchanos orar", englishSlug: "god-our-father-hear-us-pray" },
  102: { title: "Hoy con humildad te pido", englishSlug: "in-humility-our-savior" },
  103: { title: "La Santa Cena", englishSlug: "with-humble-heart" },
  104: { title: "Oh Dios, Eterno Padre", englishSlug: "o-god-the-eternal-father" },
  105: { title: "Jesús de Nazaret", englishSlug: "jesus-of-nazareth-savior-and-king" },
  106: { title: "Cuán grato es cantar loor", englishSlug: "tis-sweet-to-sing-the-matchless-love" },
  107: { title: "Pedimos Tu Espíritu", englishSlug: "father-thy-children-to-thee-now-raise" },
  108: { title: "Mansos, reverentes hoy", englishSlug: "reverently-and-meekly-now" },
  109: { title: "Cantemos todos a Jesús", englishSlug: "well-sing-all-hail-to-jesus-name" },
  110: { title: "En memoria de Tu muerte", englishSlug: "in-memory-of-the-crucified" },
  111: { title: "En el Calvario, en la cruz", englishSlug: "upon-the-cross-of-calvary" },
  112: { title: "El Padre tanto nos amó", englishSlug: "god-loved-us-so-he-sent-his-son" },
  113: { title: "Ya nos juntamos otra vez", englishSlug: "again-we-meet-around-the-board" },
  114: { title: "Cristo, el Redentor, murió", englishSlug: "again-our-dear-redeeming-lord" },
  115: { title: "Nos reunimos, Padre, hoy", englishSlug: "while-of-these-emblems-we-partake" },
  116: { title: "Jesús, en la corte celestial", englishSlug: "how-great-the-wisdom-and-the-love" },
  117: { title: "¡Murió! El Redentor murió", englishSlug: "behold-the-great-redeemer-die" },
  118: { title: "Asombro me da", englishSlug: "i-stand-all-amazed" },
  119: { title: "En un lejano cerro fue", englishSlug: "there-is-a-green-hill-far-away" },
  120: { title: "Tan humilde al nacer", englishSlug: "jesus-once-of-humble-birth" },

  // La Pascua de Resurrección (Easter) - Hymns 121-122
  121: { title: "Himno de la Pascua de Resurrección", englishSlug: "that-easter-morn" },
  122: { title: "Cristo ha resucitado", englishSlug: "christ-the-lord-is-risen-today" },

  // La Navidad (Christmas) - Hymns 123-134
  123: { title: "¡Regocijad! Jesús nació", englishSlug: "joy-to-the-world" },
  124: { title: "Venid, adoremos", englishSlug: "oh-come-all-ye-faithful" },
  125: { title: "Jesús en pesebre", englishSlug: "away-in-a-manger" },
  126: { title: "Cantan santos ángeles", englishSlug: "angels-we-have-heard-on-high" },
  127: { title: "Noche de luz", englishSlug: "silent-night" },
  128: { title: "A medianoche se oyó", englishSlug: "it-came-upon-the-midnight-clear" },
  129: { title: "Oh, pueblecito de Belén", englishSlug: "o-little-town-of-bethlehem" },
  130: { title: "Escuchad el son triunfal", englishSlug: "hark-the-herald-angels-sing" },
  131: { title: "Asombro dio a los magos", englishSlug: "with-wondering-awe" },
  132: { title: "La primera Navidad", englishSlug: "the-first-noel" },
  133: { title: "Campanas de Navidad", englishSlug: "i-heard-the-bells-on-christmas-day" },
  134: { title: "En la Judea, en tierra de Dios", englishSlug: "far-far-away-on-judeas-plains" },

  // Temas varios (Various Topics) - Hymns 135-194
  135: { title: "Hoy sembramos la semilla", englishSlug: "we-are-sowing" },
  136: { title: "Todos los santos", englishSlug: "for-all-the-saints" },
  137: { title: "Tú me has dado muchas bendiciones, Dios", englishSlug: "because-i-have-been-given-much" },
  138: { title: "Señor, yo te seguiré", englishSlug: "lord-i-would-follow-thee" },
  139: { title: "Ama el Pastor las ovejas", englishSlug: "dear-to-the-heart-of-the-shepherd" },
  140: { title: "A Dios el Padre y a Jesús", englishSlug: "god-is-love" },
  141: { title: "¿En el mundo he hecho bien?", englishSlug: "have-i-done-any-good" },
  142: { title: "Otro año ha pasado", englishSlug: "ring-out-wild-bells" },
  143: { title: "A Dios ofrecemos gozosa canción", englishSlug: "now-thank-we-all-our-god" },
  144: { title: "A la gloria marcharemos", englishSlug: "we-are-marching-on-to-glory" },
  145: { title: "La voz, ya, del eterno", englishSlug: "the-voice-of-god-again-is-heard" },
  146: { title: "Tengo gozo en mi alma hoy", englishSlug: "there-is-sunshine-in-my-soul-today" },
  147: { title: "Recojamos los destellos", englishSlug: "improve-the-shining-moments" },
  148: { title: "Si hay gozo en tu corazón", englishSlug: "if-youre-happy" },
  149: { title: "Trabajad con fervor", englishSlug: "put-your-shoulder-to-the-wheel" },
  150: { title: "Siembra gozo", englishSlug: "scatter-sunshine" },
  151: { title: "Oh, hablemos con tiernos acentos", englishSlug: "let-us-oft-speak-kind-words" },
  152: { title: "No hablemos con enojo", englishSlug: "nay-speak-no-ill" },
  153: { title: "Oíd el toque del clarín", englishSlug: "hark-all-ye-nations" },
  154: { title: "Haz tú lo justo", englishSlug: "do-what-is-right" },
  155: { title: "Haz el bien", englishSlug: "choose-the-right" },
  156: { title: "Señor del cielo, Jehová", englishSlug: "jehovah-lord-of-heaven-and-earth" },
  157: { title: "Cuenta tus bendiciones", englishSlug: "count-your-blessings" },
  158: { title: "Trabajemos hoy en la obra", englishSlug: "today-while-the-sun-shines" },
  159: { title: "Con valor marchemos", englishSlug: "onward-christian-soldiers" },
  160: { title: "Tu casa amamos, Dios", englishSlug: "we-love-thy-house-o-god" },
  161: { title: "Llamados a servir", englishSlug: "called-to-serve" },
  162: { title: "Somos los soldados", englishSlug: "we-are-all-enlisted" },
  163: { title: "¡Mirad! Reales huestes", englishSlug: "behold-a-royal-army" },
  164: { title: "Pon tu hombro a la lid", englishSlug: "put-your-shoulder-to-the-wheel" },
  165: { title: "Tu palabra", englishSlug: "thy-word-is-a-lamp" },
  166: { title: "Firmes creced en la fe", englishSlug: "true-to-the-faith" },
  167: { title: "A vencer", englishSlug: "let-us-all-press-on" },
  168: { title: "Juventud de Israel", englishSlug: "hope-of-israel" },
  169: { title: "Al mundo ve a predicar", englishSlug: "go-forth-with-faith" },
  170: { title: "¿Quién sigue al Señor?", englishSlug: "whos-on-the-lords-side" },
  171: { title: "La luz de la verdad", englishSlug: "the-light-divine" },
  172: { title: "Cuando enseñe a Tus hijos", englishSlug: "help-me-teach-with-inspiration" },
  173: { title: "El fin se acerca", englishSlug: "the-time-is-far-spent" },
  174: { title: "Qué maravillosas Tus obras", englishSlug: "how-wondrous-and-great" },
  175: { title: "A donde me mandes iré", englishSlug: "ill-go-where-you-want-me-to-go" },
  176: { title: "Palabras de amor", englishSlug: "each-life-that-touches-ours-for-good" },
  177: { title: "¿Qué es la verdad?", englishSlug: "oh-say-what-is-truth" },
  178: { title: "Nuestra mente se refleja", englishSlug: "truth-reflects-upon-our-senses" },
  179: { title: "La barra de hierro", englishSlug: "the-iron-rod" },
  180: { title: "Al leer las Escrituras", englishSlug: "as-i-search-the-holy-scriptures" },
  181: { title: "Cuando raya el nuevo dia", englishSlug: "welcome-welcome-sabbath-morning" },
  182: { title: "Bienvenido, día santo", englishSlug: "sabbath-day" },
  183: { title: "Santos templos de Sión", englishSlug: "how-beautiful-thy-temples-lord" },
  184: { title: "Id, oh santos, a los templos", englishSlug: "rise-ye-saints-and-temples-enter" },
  185: { title: "En los postreros días", englishSlug: "in-the-last-days" },
  186: { title: "Volved vuestro corazón", englishSlug: "turn-your-hearts" },
  187: { title: "Oh mi Padre", englishSlug: "o-my-father" },
  188: { title: "Quienes nos brindan su amor", englishSlug: "each-life-that-touches-ours-for-good" },
  189: { title: "Oh Padre, llénanos de amor", englishSlug: "lord-we-come-before-thee-now" },
  190: { title: "Hay un hogar eterno", englishSlug: "home-can-be-a-heaven-on-earth" },
  191: { title: "Con maravillas obra Dios", englishSlug: "god-moves-in-a-mysterious-way" },
  192: { title: "¿Por qué somos?", englishSlug: "know-this-that-every-soul-is-free" },
  193: { title: "El hogar es como el cielo", englishSlug: "love-at-home" },
  194: { title: "Cuando hay amor", englishSlug: "love-at-home" },

  // Canciones para niños (Children's Songs) - Hymns 195-204
  195: { title: "Las familias pueden ser eternas", englishSlug: "families-can-be-together-forever" },
  196: { title: "Soy un hijo de Dios", englishSlug: "i-am-a-child-of-god" },
  197: { title: "Siempre obedece los mandamientos", englishSlug: "keep-the-commandments" },
  198: { title: "Hazme andar en la luz", englishSlug: "teach-me-to-walk-in-the-light" },
  199: { title: "Dios vive", englishSlug: "i-know-my-father-lives" },
  200: { title: "La luz de Dios", englishSlug: "the-light-divine" },
  201: { title: "Dios cuida a sus hijos", englishSlug: "gods-daily-care" },
  202: { title: "En el pueblo de Sión", englishSlug: "in-our-lovely-deseret" },
  203: { title: "Amad a otros", englishSlug: "love-one-another" },
  204: { title: "Hijos de nuestro Padre", englishSlug: "children-of-our-heavenly-father" },

  // Para mujeres (For Women) - Hymn 205
  205: { title: "Sirvamos unidas", englishSlug: "as-sisters-in-zion" },

  // Para hombres (For Men) - Hymns 206-209
  206: { title: "Venid, los que tenéis de Dios el sacerdocio", englishSlug: "come-all-ye-sons-of-god" },
  207: { title: "Oh vos que sois llamados", englishSlug: "ye-who-are-called-to-labor" },
  208: { title: "Brillan rayos de clemencia", englishSlug: "brightly-beams-our-fathers-mercy" },
  209: { title: "Oh élderes de Israel", englishSlug: "ye-elders-of-israel" },

  // Día de reposo y día de semana (Sabbath and Weekday) - New Hymns 1001-1051
  1001: { title: "Fuente de mis bendiciones", englishSlug: "praise-god-from-whom-all-blessings-flow" },
  1002: { title: "Cuando vuelva el Salvador", englishSlug: "when-he-comes-again" },
  1003: { title: "Reina paz en mi ser", englishSlug: "it-is-well-with-my-soul" },
  1004: { title: "Andaré con Cristo", englishSlug: "i-will-walk-with-jesus" },
  1005: { title: "Él cuida de las aves", englishSlug: "his-eye-is-on-the-sparrow" },
  1006: { title: "En tu corazón entona una canción", englishSlug: "the-hymns-of-zion" },
  1007: { title: "En Ti pensamos", englishSlug: "as-now-we-take-the-sacrament" },
  1008: { title: "Agua viva, pan de vida", englishSlug: "the-bread-of-life" },
  1009: { title: "Getsemaní", englishSlug: "gethsemane" },
  1010: { title: "Sublime gracia", englishSlug: "amazing-grace" },
  1011: { title: "Somos niños, de la mano del Señor", englishSlug: "we-are-one-in-the-gospel" },
  1012: { title: "En cualquier ocasión", englishSlug: "wherever-he-leads-ill-go" },
  1013: { title: "Dios me da Su gracia", englishSlug: "gods-love" },
  1014: { title: "Mi buen pastor es Jehová", englishSlug: "the-lord-is-my-shepherd" },
  1015: { title: "Oh, cuán pleno, cuán profundo", englishSlug: "the-love-of-god" },
  1016: { title: "Mirad las marcas de Jesús", englishSlug: "behold-the-wounds-in-jesus-hands" },
  1017: { title: "El Cristo es", englishSlug: "christ" },
  1018: { title: "Ven, oh, Cristo", englishSlug: "come-lord-jesus" },
  1019: { title: "Amar igual que Tú", englishSlug: "our-father-we-pray" },
  1020: { title: "Tiernamente Jesús hoy nos llama", englishSlug: "softly-and-tenderly" },
  1021: { title: "Cristo me ama, lo sé", englishSlug: "jesus-loves-me" },
  1022: { title: "Con fe en cada paso", englishSlug: "faith-in-every-footstep" },
  1023: { title: "Firme en las promesas", englishSlug: "standing-on-the-promises" },
  1024: { title: "Tengo fe en Jesús, mi Señor", englishSlug: "my-faith-in-jesus" },
  1025: { title: "Hoy te doy mi corazón", englishSlug: "take-my-heart-o-father" },
  1026: { title: "Lugares santos", englishSlug: "holy-places" },
  1027: { title: "Soy bienvenido a Su hogar", englishSlug: "there-is-a-home" },
  1028: { title: "Mi pequeña luz", englishSlug: "this-little-light-of-mine" },
  1029: { title: "Los dones que el Padre derrama", englishSlug: "count-your-blessings" },
  1030: { title: "Dios siempre cerca está", englishSlug: "nearer-still-nearer" },
  1031: { title: "Venid, oíd la voz de Cristo", englishSlug: "hear-the-words-of-the-lord" },
  1032: { title: "Mirad a Cristo", englishSlug: "look-to-christ" },
  1033: { title: "Placentero nos es trabajar", englishSlug: "sweet-is-the-work" },
  1034: { title: "Soy pionero también", englishSlug: "pioneer-children" },
  1035: { title: "Honraré Su día", englishSlug: "ill-honor-his-day" },
  1036: { title: "El Libro de Mormón leeré", englishSlug: "book-of-mormon-stories" },
  1037: { title: "Vivir, servir, orar y cantar", englishSlug: "live-serve-pray-and-sing" },
  1038: { title: "Es Jehová mi buen pastor", englishSlug: "the-lord-is-my-shepherd" },
  1039: { title: "Es gracias al Señor", englishSlug: "because-of-him" },
  1040: { title: "Prevalece Su voz", englishSlug: "his-voice-prevails" },
  1041: { title: "Por mí la vida diste Tú", englishSlug: "you-gave-your-life-for-me" },
  1042: { title: "Clemente Dios, hoy cual ayer", englishSlug: "god-of-our-fathers" },
  1043: { title: "Oh, Redentor, rogamos Tu perdón", englishSlug: "o-redeemer-we-ask-thy-forgiveness" },
  1044: { title: "Así nos ministró Cristo", englishSlug: "as-christ-did-minister" },
  1045: { title: "La senda es Jesús", englishSlug: "the-way-is-jesus" },
  1046: { title: "¿Puedes tú contar los astros?", englishSlug: "can-you-count-the-stars" },
  1047: { title: "Dios me conoce", englishSlug: "god-knows-me" },
  1048: { title: "A Ti oramos", englishSlug: "we-pray-to-thee" },
  1049: { title: "José oró con fe", englishSlug: "joseph-prayed-with-faith" },
  1050: { title: "Ven a mí", englishSlug: "come-unto-me" },
  1051: { title: "Señor, un buen día es hoy", englishSlug: "lord-today-is-a-good-day" },

  // Pascua de Resurrección y Navidad (Easter and Christmas) - New Hymns 1201-1209
  1201: { title: "Gloria al día de redención", englishSlug: "glory-to-the-day-of-redemption" },
  1202: { title: "El divino Jesús nació", englishSlug: "the-divine-jesus-was-born" },
  1203: { title: "¿Qué niño es este?", englishSlug: "what-child-is-this" },
  1204: { title: "Estrella de luz", englishSlug: "a-new-star" },
  1205: { title: "En Pascua himnos entonad", englishSlug: "easter-hymn" },
  1206: { title: "¿Viste tú?", englishSlug: "were-you-there" },
  1207: { title: "Paz, paz, paz", englishSlug: "peace-peace-peace" },
  1208: { title: "¡Ve! Dilo en las montañas", englishSlug: "go-tell-it-on-the-mountain" },
  1209: { title: "Pequeñito en pesebre", englishSlug: "away-in-a-manger" },
};

// Get the Spanish hymn title by number
export const getSpanishHymnTitle = (number: number): string => {
  return SPANISH_HYMNS[number]?.title || '';
};

// Get the English slug for URL generation
export const getSpanishHymnEnglishSlug = (number: number): string => {
  return SPANISH_HYMNS[number]?.englishSlug || '';
};

// Check if a hymn number is valid in the Spanish hymnal
export const isValidSpanishHymnNumber = (number: number): boolean => {
  return number in SPANISH_HYMNS;
};

// Generate URL for Spanish hymn (uses English slug with ?lang=spa)
export const getSpanishHymnUrl = (number: number): string => {
  const hymn = SPANISH_HYMNS[number];
  if (!hymn) return '';

  const slug = hymn.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/hymns/${slug}?lang=spa`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=hymns&lang=spa`;
};

// Search Spanish hymns by title
export const searchSpanishHymnByTitle = (searchTerm: string): Array<{number: number, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: number, title: string}> = [];

  // Search through all Spanish hymns
  Object.entries(SPANISH_HYMNS).forEach(([number, hymn]) => {
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
