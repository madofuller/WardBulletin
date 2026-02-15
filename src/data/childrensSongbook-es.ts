// Spanish Children's Songbook Database (Canciones para los Niños)
// Maps Spanish song numbers to Spanish titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints

export interface SpanishChildrensSong {
  title: string;
  englishSlug: string;
}

// Spanish song number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=spa
export const SPANISH_CHILDRENS_SONGBOOK: Record<string, SpanishChildrensSong> = {
  // Nuestro Padre Celestial (Our Heavenly Father)
  "2": { title: "Soy un hijo de Dios", englishSlug: "i-am-a-child-of-god" },
  "4": { title: "Niños de todo el mundo", englishSlug: "children-all-over-the-world" },
  "6": { title: "Oración de un niño", englishSlug: "a-childs-prayer" },
  "8": { title: "Dios vive", englishSlug: "i-know-my-father-lives" },
  "9": { title: "Doy gracias, oh Padre", englishSlug: "i-thank-thee-dear-father" },
  "10": { title: "Con reverencia", englishSlug: "reverence" },
  "11": { title: "Con quietud", englishSlug: "reverently-quietly" },
  "12": { title: "La reverencia es amor", englishSlug: "reverence-is-love" },
  "13": { title: "Reverencia mostraré", englishSlug: "i-will-try-to-be-reverent" },
  "14": { title: "¿Puede un niño como yo?", englishSlug: "can-a-little-child-like-me" },
  "15": { title: "Demos gracias al padre", englishSlug: "thanks-to-our-father" },
  "16": { title: "Mi Padre Celestial me ama", englishSlug: "my-heavenly-father-loves-me" },
  "18a": { title: "Rondó de gracias", englishSlug: "for-health-and-strength" },
  "18b": { title: "Al orar", englishSlug: "we-bow-our-heads" },

  // Nuestro Salvador (Our Savior)
  "20": { title: "Mandó a Su Hijo", englishSlug: "he-sent-his-son" },
  "22": { title: "Al irse a Belén José", englishSlug: "when-joseph-went-to-bethlehem" },
  "24": { title: "La Nochebuena", englishSlug: "stars-were-gleaming" },
  "25": { title: "Dentro de un establo humilde", englishSlug: "once-within-a-lowly-stable" },
  "26": { title: "Jesús en pesebre", englishSlug: "away-in-a-manger" },
  "28": { title: "El arrullo de María", englishSlug: "marys-lullaby" },
  "30": { title: "Duerme, mi nene", englishSlug: "sleep-little-jesus" },
  "32": { title: "Canto de Navidad", englishSlug: "the-nativity-song" },
  "34": { title: "Pequeño niño fue Jesús", englishSlug: "jesus-once-was-a-little-child" },
  "35": { title: "Me gusta pensar en el Señor", englishSlug: "i-think-when-i-read-that-sweet-story" },
  "36": { title: "Dime la historia de Cristo", englishSlug: "tell-me-the-stories-of-jesus" },
  "37": { title: "Fiel amigo es Jesús", englishSlug: "jesus-is-our-loving-friend" },
  "38": { title: "Cristo me manda que brille", englishSlug: "jesus-wants-me-for-a-sunbeam" },
  "39": { title: "Ama a todos, dijo el Señor", englishSlug: "jesus-said-love-everyone" },
  "40": { title: "Yo trato de ser como Cristo", englishSlug: "im-trying-to-be-like-jesus" },
  "42": { title: "Siento el amor de mi Salvador", englishSlug: "i-feel-my-saviors-love" },
  "44": { title: "Resucitó Jesús", englishSlug: "jesus-has-risen" },
  "45": { title: "¿Vivió Jesús una vez más?", englishSlug: "did-jesus-really-live-again" },
  "46": { title: "Cuando venga Jesús", englishSlug: "when-he-comes-again" },
  "48": { title: "La Iglesia de Jesucristo", englishSlug: "the-church-of-jesus-christ" },

  // El Evangelio (The Gospel)
  "50": { title: "La fe", englishSlug: "faith" },
  "52": { title: "Saber perdonar", englishSlug: "help-me-dear-father" },
  "53": { title: "Cuando me bautice", englishSlug: "when-i-am-baptized" },
  "54": { title: "El bautismo", englishSlug: "baptism" },
  "56": { title: "El Espíritu Santo", englishSlug: "the-holy-ghost" },
  "57": { title: "En la primavera", englishSlug: "on-a-golden-springtime" },
  "58": { title: "Sigue al Profeta", englishSlug: "follow-the-prophet" },
  "60": { title: "El sacerdocio se restauró", englishSlug: "the-priesthood-is-restored" },
  "61": { title: "Las planchas de oro", englishSlug: "the-golden-plates" },
  "62": { title: "Historias del Libro de Mormón", englishSlug: "book-of-mormon-stories" },
  "63": { title: "Los libros del Libro de Mormón", englishSlug: "the-books-in-the-book-of-mormon" },
  "64": { title: "El valor de Nefi", englishSlug: "nephis-courage" },
  "66": { title: "Escudriñar, meditar y orar", englishSlug: "search-ponder-and-pray" },
  "67": { title: "Buscaré al Señor", englishSlug: "seek-the-lord-early" },
  "68": { title: "Siempre obedece los mandamientos", englishSlug: "keep-the-commandments" },
  "70": { title: "Hazme andar en la luz", englishSlug: "teach-me-to-walk-in-the-light" },
  "71": { title: "Obediencia", englishSlug: "dare-to-do-right" },
  "72": { title: "Voy a vivir el Evangelio", englishSlug: "choose-the-right-way" },
  "73": { title: "El Señor me dio un templo", englishSlug: "the-lord-gave-me-a-temple" },
  "74": { title: "Amad a otros", englishSlug: "love-one-another" },
  "75": { title: "Dime, Señor", englishSlug: "tell-me-dear-lord" },
  "76": { title: "Donde hay amor", englishSlug: "where-love-is" },
  "78": { title: "Contigo iré", englishSlug: "ill-walk-with-you" },
  "80": { title: "Muestra valor", englishSlug: "dare-to-do-right" },
  "81": { title: "Defiende el bien", englishSlug: "stand-for-the-right" },
  "82": { title: "Escojamos lo correcto", englishSlug: "choose-the-right" },
  "83": { title: "La bondad por mí empieza", englishSlug: "kindness-begins-with-me" },
  "84": { title: "Yo soy como estrella", englishSlug: "i-am-like-a-star" },
  "85": { title: "Voy a ser valiente", englishSlug: "ill-be-valiant" },
  "86": { title: "El plan de Dios puedo seguir", englishSlug: "i-will-follow-gods-plan" },
  "88": { title: "Joven digno y hábil seré", englishSlug: "a-young-man-prepared" },
  "90": { title: "Yo quiero ser un misionero ya", englishSlug: "i-want-to-be-a-missionary-now" },
  "91": { title: "Espero ser llamado a una misión", englishSlug: "i-hope-they-call-me-on-a-mission" },
  "92": { title: "Llevaremos Su verdad al mundo", englishSlug: "we-will-bring-the-world-his-truth" },
  "94": { title: "Llamados a servir", englishSlug: "called-to-serve" },
  "96": { title: "Brilla", englishSlug: "shine-on" },

  // El hogar y la familia (Home and Family)
  "98": { title: "Las familias pueden ser eternas", englishSlug: "families-can-be-together-forever" },
  "99": { title: "Me encanta ver el templo", englishSlug: "i-love-to-see-the-temple" },
  "100": { title: "Estoy haciendo mi historia familiar", englishSlug: "family-history-i-am-doing-it" },
  "101": { title: "Oración familiar", englishSlug: "family-prayer" },
  "102": { title: "Allí donde hay amor", englishSlug: "love-is-spoken-here" },
  "104": { title: "Una familia feliz", englishSlug: "a-happy-family" },
  "105": { title: "El sábado", englishSlug: "saturday" },
  "106": { title: "Los nombres más bellos", englishSlug: "the-dearest-names" },
  "107": { title: "Madre, te amo", englishSlug: "mother-i-love-you" },
  "108a": { title: "Madrecita de mi amor", englishSlug: "mothers-day" },
  "108b": { title: "Cuando ayudamos", englishSlug: "when-we-help" },
  "109": { title: "Por campos de trébol paseo", englishSlug: "when-daddy-comes-home" },
  "110": { title: "Cuando papá vuelve", englishSlug: "when-daddy-comes-home" },
  "111": { title: "Mi papá", englishSlug: "father" },
  "112": { title: "La abuelita", englishSlug: "grandmother" },
  "113": { title: "Cuando abuelito viene", englishSlug: "when-grandpa-comes" },
  "114": { title: "Con un cantar", englishSlug: "youve-got-to-sing" },

  // Diversión y actividades (Fun and Activities)
  "116": { title: "El arroyito da", englishSlug: "give-said-the-little-stream" },
  "117": { title: "Cae la lluvia alrededor", englishSlug: "rain-is-falling-all-around" },
  "118": { title: "Palomitas de maíz", englishSlug: "popcorn-popping" },
  "119": { title: "Las semillas duermen", englishSlug: "little-seeds-lie-fast-asleep" },
  "120": { title: "¿Qué haces en el verano?", englishSlug: "what-do-you-do-in-the-summertime" },
  "121": { title: "Éste era un mono", englishSlug: "once-there-was-a-snowman" },
  "122": { title: "El mundo es glorioso", englishSlug: "my-heavenly-father-loves-me" },
  "123": { title: "¡El mundo es tan bello!", englishSlug: "the-world-is-so-big" },
  "124": { title: "Alza al cielo el son", englishSlug: "sing-a-song" },
  "125": { title: "Si te sientes feliz", englishSlug: "if-youre-happy" },
  "126": { title: "Mis manitas", englishSlug: "little-hands" },
  "127": { title: "Me doblo", englishSlug: "together" },
  "128": { title: "Sonrisas", englishSlug: "smiles" },
  "129a": { title: "Cabeza, cara, hombros, pies", englishSlug: "head-shoulders-knees-and-toes" },
  "129b": { title: "Qué divertido es", englishSlug: "fun-to-do" },
  "130": { title: "¡Hola!", englishSlug: "hello" },
  "131": { title: "Los colores de nuestra Primaria", englishSlug: "the-primary-colors" },
  "132": { title: "El sabio y el imprudente", englishSlug: "the-wise-man-and-the-foolish-man" },
  "133": { title: "Cumpliste años", englishSlug: "birthday" },
  "134": { title: "Feliz, feliz cumpleaños", englishSlug: "happy-happy-birthday" },

  // Canciones Seleccionadas (Selected Songs)
  "136": { title: "Pioneros fieles", englishSlug: "the-handcart-song" },
  "137": { title: "Niños pioneros", englishSlug: "pioneer-children-sang-as-they-walked" },
  "138": { title: "Para ser pionero", englishSlug: "to-be-a-pioneer" },
  "139": { title: "Mi mamá nos da amor", englishSlug: "smiles" },
  "140": { title: "Belleza por doquier", englishSlug: "all-things-bright-and-beautiful" },
  "141": { title: "Hazlo conmigo", englishSlug: "do-as-im-doing" },
  "142": { title: "En el prado", englishSlug: "fun-to-do" },
  "144": { title: "A mi madre", englishSlug: "mother-dear" },
  "145": { title: "Como el sol en la mañana", englishSlug: "my-heavenly-father-loves-me" },
  "146": { title: "Estrella de luz", englishSlug: "i-am-like-a-star" },
  "148": { title: "Viví en los cielos", englishSlug: "i-lived-in-heaven" }
};

// Get the Spanish children's song title by number
export const getSpanishChildrensSongTitle = (number: string): string => {
  return SPANISH_CHILDRENS_SONGBOOK[number]?.title || '';
};

// Check if a song number is valid in the Spanish Children's Songbook
export const isValidSpanishChildrensSongNumber = (number: string): boolean => {
  return number in SPANISH_CHILDRENS_SONGBOOK;
};

// Generate URL for Spanish children's song (uses English slug with ?lang=spa)
export const getSpanishChildrensSongUrl = (number: string): string => {
  const song = SPANISH_CHILDRENS_SONGBOOK[number];
  if (!song) return '';

  const slug = song.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/childrens-songbook/${slug}?lang=spa`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=childrens-songbook&lang=spa`;
};

// Search Spanish children's songs by title
export const searchSpanishChildrensSongByTitle = (searchTerm: string): Array<{number: string, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: string, title: string}> = [];

  // Search through all Spanish children's songs
  Object.entries(SPANISH_CHILDRENS_SONGBOOK).forEach(([number, song]) => {
    if (song.title.toLowerCase().includes(term)) {
      results.push({ number, title: song.title });
    }
  });

  // Sort by relevance (exact matches first, then by number)
  return results.sort((a, b) => {
    const aExact = a.title.toLowerCase().startsWith(term);
    const bExact = b.title.toLowerCase().startsWith(term);

    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // Sort by numeric part of the number
    const aNum = parseInt(a.number.replace(/[a-z]/g, ''));
    const bNum = parseInt(b.number.replace(/[a-z]/g, ''));
    if (aNum !== bNum) return aNum - bNum;

    return a.number.localeCompare(b.number);
  }).slice(0, 10); // Limit to 10 results
};
