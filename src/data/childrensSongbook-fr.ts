// French Children's Songbook Database (Chants pour les enfants)
// Maps French song numbers to French titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints

export interface FrenchChildrensSong {
  title: string;
  englishSlug: string;
}

// French song number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=fra
export const FRENCH_CHILDRENS_SONGBOOK: Record<string, FrenchChildrensSong> = {
  // Notre Père céleste (Our Heavenly Father)
  "2": { title: "Je suis enfant de Dieu", englishSlug: "i-am-a-child-of-god" },
  "4": { title: "Partout dans le monde", englishSlug: "children-all-over-the-world" },
  "6": { title: "La prière d'un enfant", englishSlug: "a-childs-prayer" },
  "8": { title: "Je sais que mon Dieu vit", englishSlug: "i-know-my-father-lives" },
  "9": { title: "Merci, ô mon Père divin", englishSlug: "i-thank-thee-dear-father" },
  "10": { title: "Dans ta maison sans un bruit", englishSlug: "reverence" },
  "11": { title: "Humblement, calmement", englishSlug: "reverently-quietly" },
  "12": { title: "Le recueillement, c'est l'amour", englishSlug: "reverence-is-love" },
  "13": { title: "A mon Père céleste", englishSlug: "i-will-try-to-be-reverent" },
  "14": { title: "Petit enfant que je suis", englishSlug: "can-a-little-child-like-me" },
  "15": { title: "Remercions notre Père", englishSlug: "thanks-to-our-father" },
  "16": { title: "Mon Père céleste m'aime", englishSlug: "my-heavenly-father-loves-me" },
  "18a": { title: "Pour ce repas", englishSlug: "for-health-and-strength" },
  "18b": { title: "Le front baissé", englishSlug: "we-bow-our-heads" },

  // Notre Sauveur (Our Savior)
  "20": { title: "Il envoya son Fils aimé", englishSlug: "he-sent-his-son" },
  "22": { title: "Joseph à Bethléhem", englishSlug: "when-joseph-went-to-bethlehem" },
  "24": { title: "Nuit de Noël", englishSlug: "stars-were-gleaming" },
  "25": { title: "Un jour dans une humble étable", englishSlug: "once-within-a-lowly-stable" },
  "26": { title: "Au loin, dans l'étable", englishSlug: "away-in-a-manger" },
  "28": { title: "Berceuse de Marie à l'enfant Jésus", englishSlug: "marys-lullaby" },
  "30": { title: "Dors, mon bel ange", englishSlug: "sleep-little-jesus" },
  "32": { title: "C'est l'heureux temps", englishSlug: "the-nativity-song" },
  "34": { title: "Jésus enfant", englishSlug: "jesus-once-was-a-little-child" },
  "35": { title: "Je pense en lisant le récit d'autrefois", englishSlug: "i-think-when-i-read-that-sweet-story" },
  "36": { title: "Raconte-moi les histoires de Jésus", englishSlug: "tell-me-the-stories-of-jesus" },
  "37": { title: "Jésus est notre ami", englishSlug: "jesus-is-our-loving-friend" },
  "38": { title: "Brillant pour lui", englishSlug: "jesus-wants-me-for-a-sunbeam" },
  "39": { title: "Aimez chacun", englishSlug: "jesus-said-love-everyone" },
  "40": { title: "Jésus-Christ est mon modèle", englishSlug: "im-trying-to-be-like-jesus" },
  "42": { title: "Je ressens son amour", englishSlug: "i-feel-my-saviors-love" },
  "44": { title: "Jésus est ressuscité", englishSlug: "jesus-has-risen" },
  "45": { title: "Jésus est-il ressuscité?", englishSlug: "did-jesus-really-live-again" },
  "46": { title: "Quand Jésus reviendra", englishSlug: "when-he-comes-again" },
  "48": { title: "L'Eglise de Jésus-Christ", englishSlug: "the-church-of-jesus-christ" },

  // L'Evangile (The Gospel)
  "50": { title: "La foi", englishSlug: "faith" },
  "52": { title: "Aide-moi, Père", englishSlug: "help-me-dear-father" },
  "53": { title: "Le jour de mon baptême", englishSlug: "when-i-am-baptized" },
  "54": { title: "Baptême", englishSlug: "baptism" },
  "56": { title: "Le Saint-Esprit", englishSlug: "the-holy-ghost" },
  "57": { title: "Par un beau printemps doré", englishSlug: "on-a-golden-springtime" },
  "58": { title: "Suis les prophètes", englishSlug: "follow-the-prophet" },
  "60": { title: "La prêtrise rétablie", englishSlug: "the-priesthood-is-restored" },
  "61": { title: "Les plaques d'or", englishSlug: "the-golden-plates" },
  "62": { title: "Dans le Livre de Mormon", englishSlug: "book-of-mormon-stories" },
  "63": { title: "Les livres du Livre de Mormon", englishSlug: "the-books-in-the-book-of-mormon" },
  "64": { title: "Le courage de Néphi", englishSlug: "nephis-courage" },
  "66": { title: "Quand je lis l'Ecriture sainte", englishSlug: "search-ponder-and-pray" },
  "67": { title: "Sans tarder, je recherche mon Sauveur", englishSlug: "seek-the-lord-early" },
  "68": { title: "Pour trouver la paix", englishSlug: "keep-the-commandments" },
  "70": { title: "Apprends-moi à marcher dans la clarté", englishSlug: "teach-me-to-walk-in-the-light" },
  "71": { title: "Je veux obéir", englishSlug: "dare-to-do-right" },
  "72": { title: "Je suivrai l'Evangile", englishSlug: "choose-the-right-way" },
  "73": { title: "Je demeure dans un temple", englishSlug: "the-lord-gave-me-a-temple" },
  "74": { title: "Aimez vos frères", englishSlug: "love-one-another" },
  "75": { title: "Dis-moi, Seigneur", englishSlug: "tell-me-dear-lord" },
  "76": { title: "C'est l'amour", englishSlug: "where-love-is" },
  "78": { title: "Je viens vers toi", englishSlug: "ill-walk-with-you" },
  "80": { title: "Fais donc le bien", englishSlug: "dare-to-do-right" },
  "81": { title: "Défends le bien", englishSlug: "stand-for-the-right" },
  "82": { title: "Choisir le bien", englishSlug: "choose-the-right" },
  "83": { title: "Soyons gentils", englishSlug: "kindness-begins-with-me" },
  "84": { title: "Vois l'étoile au ciel", englishSlug: "i-am-like-a-star" },
  "85": { title: "Je serai vaillant", englishSlug: "ill-be-valiant" },
  "86": { title: "Je veux suivre le plan de Dieu", englishSlug: "i-will-follow-gods-plan" },
  "88": { title: "Un garçon digne et prêt", englishSlug: "a-young-man-prepared" },
  "90": { title: "Je voudrais déjà partir en mission", englishSlug: "i-want-to-be-a-missionary-now" },
  "91": { title: "J'espère qu'on m'enverra en mission", englishSlug: "i-hope-they-call-me-on-a-mission" },
  "92": { title: "Proclamons la vérité", englishSlug: "we-will-bring-the-world-his-truth" },
  "94": { title: "Appelés à servir", englishSlug: "called-to-serve" },
  "96": { title: "Petite est la lumière en moi", englishSlug: "shine-on" },

  // Mon Foyer, ma famille (Home and Family)
  "98": { title: "Ensemble à tout jamais", englishSlug: "families-can-be-together-forever" },
  "99": { title: "Oh, j'aime voir le temple", englishSlug: "i-love-to-see-the-temple" },
  "100": { title: "Ma généalogie", englishSlug: "family-history-i-am-doing-it" },
  "101": { title: "La prière en famille", englishSlug: "family-prayer" },
  "102": { title: "Ces mots d'amour", englishSlug: "love-is-spoken-here" },
  "104": { title: "Un heureux foyer", englishSlug: "a-happy-family" },
  "105": { title: "Samedi", englishSlug: "saturday" },
  "106": { title: "Les noms les plus chers", englishSlug: "the-dearest-names" },
  "107": { title: "Maman, je t'aime", englishSlug: "mother-i-love-you" },
  "108a": { title: "Ma maman", englishSlug: "mothers-day" },
  "108b": { title: "Nous aidons tous avec joie", englishSlug: "when-we-help" },
  "109": { title: "Dans les prés colorés", englishSlug: "when-daddy-comes-home" },
  "110": { title: "Le retour de papa", englishSlug: "when-daddy-comes-home" },
  "111": { title: "Mon papa", englishSlug: "father" },
  "112": { title: "Grand-maman", englishSlug: "grandmother" },
  "113": { title: "Grand-père vient", englishSlug: "when-grandpa-comes" },
  "114": { title: "Chante en chemin", englishSlug: "youve-got-to-sing" },

  // Jeux et Détente (Fun and Activities)
  "116": { title: "«Donne», dit le ruisseau", englishSlug: "give-said-the-little-stream" },
  "117": { title: "La pluie", englishSlug: "rain-is-falling-all-around" },
  "118": { title: "Ouvrant ma fenêtre", englishSlug: "popcorn-popping" },
  "119": { title: "Petits grains tout endormis", englishSlug: "little-seeds-lie-fast-asleep" },
  "120": { title: "Dis-moi, que fais-tu pendant tout l'été?", englishSlug: "what-do-you-do-in-the-summertime" },
  "121": { title: "Bonhomme de neige", englishSlug: "once-there-was-a-snowman" },
  "122": { title: "Je trouve le monde merveilleux", englishSlug: "my-heavenly-father-loves-me" },
  "123": { title: "Le monde est si beau!", englishSlug: "the-world-is-so-big" },
  "124": { title: "A pleine voix chantez", englishSlug: "sing-a-song" },
  "125": { title: "Pour montrer ta joie", englishSlug: "if-youre-happy" },
  "126": { title: "Mes petites mains", englishSlug: "little-hands" },
  "127": { title: "Articulations", englishSlug: "together" },
  "128": { title: "Sourires", englishSlug: "smiles" },
  "129a": { title: "La tête, les épaules, les genoux, les pieds", englishSlug: "head-shoulders-knees-and-toes" },
  "129b": { title: "C'est amusant", englishSlug: "fun-to-do" },
  "130": { title: "Bonjour!", englishSlug: "hello" },
  "131": { title: "Les couleurs de notre Primaire", englishSlug: "the-primary-colors" },
  "132": { title: "Le sage et le fou", englishSlug: "the-wise-man-and-the-foolish-man" },
  "133": { title: "Un an de plus", englishSlug: "birthday" },
  "134": { title: "Joyeux anniversaire!", englishSlug: "happy-happy-birthday" },

  // Divers (Miscellaneous)
  "136": { title: "La chanson du chariot à bras", englishSlug: "the-handcart-song" },
  "137": { title: "Les enfants pionniers", englishSlug: "pioneer-children-sang-as-they-walked" },
  "138": { title: "Pour être un pionnier", englishSlug: "to-be-a-pioneer" },
  "139": { title: "Vent frais", englishSlug: "smiles" },
  "140": { title: "D'où viens-tu, bergère?", englishSlug: "all-things-bright-and-beautiful" },
  "141": { title: "Noël des oiseaux", englishSlug: "fun-to-do" },
  "142a": { title: "C'est Marie", englishSlug: "fun-to-do" },
  "142b": { title: "Do, ré, mi, la perdrix", englishSlug: "fun-to-do" },
  "143": { title: "Toute la nuit", englishSlug: "all-through-the-night" },
  "144a": { title: "Maintenant, nous voulons prier", englishSlug: "we-bow-our-heads" },
  "144b": { title: "Seigneur, avant de te prier", englishSlug: "we-bow-our-heads" },
  "145": { title: "C'est aujourd'hui", englishSlug: "fun-to-do" },
  "146": { title: "La chanson des doigts", englishSlug: "fun-to-do" },
  "147": { title: "Deux petites mains", englishSlug: "little-hands" },
  "148a": { title: "La dîme", englishSlug: "i-want-to-give-the-lord-my-tenth" },
  "148b": { title: "Je donne ma dîme au Seigneur", englishSlug: "i-want-to-give-the-lord-my-tenth" }
};

// Get the French children's song title by number
export const getFrenchChildrensSongTitle = (number: string): string => {
  return FRENCH_CHILDRENS_SONGBOOK[number]?.title || '';
};

// Check if a song number is valid in the French Children's Songbook
export const isValidFrenchChildrensSongNumber = (number: string): boolean => {
  return number in FRENCH_CHILDRENS_SONGBOOK;
};

// Generate URL for French children's song (uses English slug with ?lang=fra)
export const getFrenchChildrensSongUrl = (number: string): string => {
  const song = FRENCH_CHILDRENS_SONGBOOK[number];
  if (!song) return '';

  const slug = song.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/childrens-songbook/${slug}?lang=fra`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=childrens-songbook&lang=fra`;
};

// Search French children's songs by title
export const searchFrenchChildrensSongByTitle = (searchTerm: string): Array<{number: string, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: string, title: string}> = [];

  // Search through all French children's songs
  Object.entries(FRENCH_CHILDRENS_SONGBOOK).forEach(([number, song]) => {
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
