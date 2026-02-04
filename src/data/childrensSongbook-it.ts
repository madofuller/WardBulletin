// Italian Children's Songbook (Innario dei Bambini)
// The Church of Jesus Christ of Latter-day Saints

export const ITALIAN_CHILDRENS_SONGBOOK: Record<string, string> = {
  // Il mio Padre celeste (My Heavenly Father)
  "2": "Sono un figlio di Dio",
  "4": "I bambini di tutto il mondo",
  "6": "La preghiera di un bambino",
  "8": "Mio Padre vive in ciel",
  "9": "Un grazie a Te, Padre",
  "10": "Padre, sarò riverente",
  "11": "Quieti siam",
  "12": "La riverenza è amore",
  "13": "Sarò più riverente",
  "14": "Un bambino come me",
  "15": "Grazie al nostro Padre in ciel",
  "16": "Il mio Padre celeste mi ama",
  "18a": "Per la salute e la forza (Canone)",
  "18b": "Chiniamo il capo",

  // Il Salvatore (The Savior)
  "20": "Egli mandò il Figlio Suo",
  "22": "Così Giuseppe andò a Betlemme",
  "24": "Scintillavano le stelle",
  "25": "C'era freddo nella stalla",
  "26": "Lontano in una mangiatoia",
  "28": "Ninna nanna di Maria",
  "30": "Non pianger, bambino",
  "32": "Canto della Natività",
  "34": "Gesù fu un tempo anche Lui un bimbo",
  "35": "Leggendo la storia del Salvatore",
  "36": "Narrami le storie di Gesù",
  "37": "Il più caro Amico che abbiam",
  "38": "Come un raggio di sole",
  "39": "\"Amatevi\", disse Gesù",
  "40": "Vorrò imitar Gesù",
  "42": "Io sento attorno a me",
  "44": "Cristo è risorto",
  "45": "Gesù risorse il terzo dì?",
  "46": "Quand'Egli tornerà",
  "48": "La Chiesa di Gesù Cristo",

  // Il Vangelo (The Gospel)
  "50": "Fede",
  "52": "Padre, aiutami a perdonar",
  "53": "Io sono puro grazie a Lui",
  "54": "Il battesimo",
  "56": "Lo Spirito Santo",
  "57": "Fu in primavera",
  "58": "Segui il profeta",
  "60": "Il sacerdozio è stato restaurato",
  "61": "Le tavole d'oro",
  "62": "Le storie del Libro di Mormon",
  "63": "I libri del Libro di Mormon",
  "64": "Il coraggio di Nefi",
  "66": "Studiare, meditare e pregare",
  "67": "Gesù cercherò in gioventù",
  "68": "Vivi il Vangelo",
  "70": "Mamma e papà, insegnatemi insiem",
  "71": "Presto obbedirò",
  "72": "Vivendo il Vangelo",
  "73": "Il Signor mi ha dato un tempio",
  "74": "Come vi ho amati",
  "75": "Dimmi, Signor",
  "76": "Dov'è amor",
  "78": "Camminerò con te",
  "80": "Fa' ciò ch'è ben!",
  "81": "Difendi la verità",
  "82": "Scegli il giusto",
  "83": "La gentilezza comincia da me",
  "84": "Come una stella",
  "85": "Sarem dei valorosi",
  "86": "Io seguirò il piano di Dio",
  "88": "Un ragazzo preparato",
  "90": "Un missionario voglio diventar",
  "91": "Spero di diventare un missionario",
  "92": "Porteremo al mondo la Sua parola (L'esercito di Helaman)",
  "94": "Chiamati a servirLo",
  "96": "Splendi",

  // La casa e la famiglia (Home and Family)
  "98": "Le famiglie sono eterne",
  "99": "Amo il sacro tempio",
  "100": "La mia genealogia",
  "101": "La preghiera familiare",
  "102": "L'amor regna qui sovran",
  "104": "Una famiglia felice",
  "105": "Sabato",
  "106": "I nomi più cari",
  "107": "Mamma, ti amo",
  "108a": "Cara mamma",
  "108b": "Aiutando siamo felici",
  "109": "Io vado a spasso",
  "110": "Quando torna a casa papà",
  "111": "Il mio papà",
  "112": "La nonna",
  "113": "Quando il nonno viene a trovarci",
  "114": "Canta mentre vai a casa",

  // Divertimento e attività (Fun and Activity)
  "116": "Disse il ruscello un dì",
  "117": "Sta piovendo intorno a me",
  "118": "Popcorn e papaveri",
  "119": "Dorme il seme",
  "120": "Che fai tu durante l'estate?",
  "121": "C'era una volta un pupazzo di neve",
  "122": "Io penso che il mondo sia glorioso",
  "123": "Il mondo è bello",
  "124": "Cantiamo insieme",
  "125": "Se felice sei",
  "126": "Ho due piccole mani",
  "127": "Le mie giunture",
  "128": "Sorrisi",
  "129a": "Testa, spalle, ginocchia e piè",
  "129b": "È bello",
  "130": "Ehi, ciao!",
  "131": "I colori della Primaria",
  "132": "L'uomo saggio e l'uomo folle",
  "133": "Buon compleanno (Canone)",
  "134": "Felice compleanno",

  // Inni scelti (Selected Hymns)
  "136": "Inno dei carretti a mano",
  "137": "Cantano i figli dei pionieri",
  "138": "Siamo pionieri",
  "140": "Il cuore dei figli",
  "142": "Insegnante, quanto amore hai per me?",
  "144": "Quando Gesù Cristo fu battezzato",
  "145": "La serata familiare",
  "146": "Le porte della cappella",
  "147": "Samuele parla di Gesù Bambino",
  "148": "Noi qui siamo insieme"
};

// Get the Italian children's song title by number
export const getItalianChildrensSongTitle = (number: string): string => {
  return ITALIAN_CHILDRENS_SONGBOOK[number] || '';
};

// Check if a song number is valid in the Italian children's songbook
export const isValidItalianChildrensSongNumber = (number: string): boolean => {
  return number in ITALIAN_CHILDRENS_SONGBOOK;
};

// Generate URL for Italian children's song
export const getItalianChildrensSongUrl = (number: string): string => {
  if (!ITALIAN_CHILDRENS_SONGBOOK[number]) return '';

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/childrens-songbook?lang=ita`;
  }

  // Desktop/Web: use media/music format
  return `https://www.churchofjesuschrist.org/media/music/library/childrens-songbook?lang=ita`;
};

// Search Italian children's songs by title
export const searchItalianChildrensSongByTitle = (searchTerm: string): Array<{number: string, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: string, title: string}> = [];

  // Search through all Italian children's songs
  Object.entries(ITALIAN_CHILDRENS_SONGBOOK).forEach(([number, title]) => {
    if (title.toLowerCase().includes(term)) {
      results.push({
        number: number,
        title: title
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
