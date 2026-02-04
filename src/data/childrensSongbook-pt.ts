// Portuguese Children's Songbook Database (Músicas para Crianças)
// Maps Portuguese song numbers to Portuguese titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints Portuguese Children's Songbook

export interface PortugueseChildrensSong {
  title: string;
  englishSlug: string;
}

// Portuguese song number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=por
export const PORTUGUESE_CHILDRENS_SONGBOOK: Record<string, PortugueseChildrensSong> = {
  // Meu Pai Celestial (Our Heavenly Father)
  "2": { title: "Sou um Filho de Deus", englishSlug: "i-am-a-child-of-god" },
  "4": { title: "Crianças de Todo o Mundo", englishSlug: "children-all-over-the-world" },
  "6": { title: "Oração de uma Criança", englishSlug: "a-childs-prayer" },
  "8": { title: "Eu Sei Que Deus Vive", englishSlug: "i-know-my-father-lives" },
  "9": { title: "Ó Pai Querido, Dou Graças", englishSlug: "i-thank-thee-dear-father" },
  "10": { title: "Reverência", englishSlug: "reverence" },
  "11": { title: "Com Amor, Com Fervor", englishSlug: "reverently-quietly" },
  "12": { title: "Reverência É Amor", englishSlug: "reverence-is-love" },
  "13": { title: "Serei Reverente", englishSlug: "i-will-try-to-be-reverent" },
  "14": { title: "Um Pequeno Como Eu", englishSlug: "can-a-little-child-like-me" },
  "15": { title: "Graças ao Pai Celestial", englishSlug: "thanks-to-our-father" },
  "16": { title: "Meu Pai Celestial Me Tem Afeição", englishSlug: "my-heavenly-father-loves-me" },
  "18a": { title: "Por Minha Força e Saúde (Cânone)", englishSlug: "for-health-and-strength" },
  "18b": { title: "A Cabecinha Abaixarei", englishSlug: "we-bow-our-heads" },

  // O Salvador (Our Savior)
  "20": { title: "Ele Mandou Seu Filho", englishSlug: "he-sent-his-son" },
  "22": { title: "Quando José Foi a Belém", englishSlug: "when-joseph-went-to-bethlehem" },
  "24": { title: "Astros Brilham nas Alturas", englishSlug: "stars-were-gleaming" },
  "25": { title: "Num Estábulo Humilde", englishSlug: "once-within-a-lowly-stable" },
  "26": { title: "Jesus num Presépio", englishSlug: "away-in-a-manger" },
  "28": { title: "Canção de Ninar de Maria", englishSlug: "marys-lullaby" },
  "30": { title: "Dorme, Menino", englishSlug: "sleep-little-jesus" },
  "32": { title: "Natividade", englishSlug: "the-nativity-song" },
  "34": { title: "Jesus Criança Já Foi Também", englishSlug: "jesus-once-was-a-little-child" },
  "35": { title: "Eu Gosto de Ler Sobre Jesus", englishSlug: "i-think-when-i-read-that-sweet-story" },
  "36": { title: "Conta-me Histórias de Cristo", englishSlug: "tell-me-the-stories-of-jesus" },
  "37": { title: "O Melhor Amigo É Jesus", englishSlug: "jesus-is-our-loving-friend" },
  "38": { title: "Brilhando, Brilhando", englishSlug: "jesus-wants-me-for-a-sunbeam" },
  "39": { title: "Ama Sempre ao Teu Irmão", englishSlug: "jesus-said-love-everyone" },
  "40": { title: "Eu Quero Ser Como Cristo", englishSlug: "im-trying-to-be-like-jesus" },
  "42": { title: "O Amor do Salvador", englishSlug: "i-feel-my-saviors-love" },
  "44": { title: "Ressuscitou o Salvador", englishSlug: "jesus-has-risen" },
  "45": { title: "Jesus da Morte Ressurgiu?", englishSlug: "did-jesus-really-live-again" },
  "46": { title: "Quando Jesus Voltar", englishSlug: "when-he-comes-again" },
  "48": { title: "A Igreja de Jesus Cristo", englishSlug: "the-church-of-jesus-christ" },

  // O Evangelho (The Gospel)
  "50": { title: "Fé", englishSlug: "faith" },
  "52": { title: "Faze-me, ó Pai, Perdoar", englishSlug: "help-me-dear-father" },
  "53": { title: "Quando eu for batizado", englishSlug: "when-i-am-baptized" },
  "54": { title: "Batismo", englishSlug: "baptism" },
  "56": { title: "O Espírito Santo", englishSlug: "the-holy-ghost" },
  "57": { title: "Em Um Dia Primaveril", englishSlug: "on-a-golden-springtime" },
  "58": { title: "Segue o Profeta", englishSlug: "follow-the-prophet" },
  "60": { title: "O Sacerdócio Está Restaurado", englishSlug: "the-priesthood-is-restored" },
  "61": { title: "As Placas de Ouro", englishSlug: "the-golden-plates" },
  "62": { title: "Histórias do Livro de Mórmon", englishSlug: "book-of-mormon-stories" },
  "63": { title: "Os Livros do Livro de Mórmon", englishSlug: "the-books-in-the-book-of-mormon" },
  "64": { title: "Néfi Era Valente", englishSlug: "nephis-courage" },
  "66": { title: "Ler, Ponderar e Orar", englishSlug: "search-ponder-and-pray" },
  "67": { title: "Buscarei Cedo ao Senhor", englishSlug: "seek-the-lord-early" },
  "68": { title: "Guarda os Mandamentos", englishSlug: "keep-the-commandments" },
  "70": { title: "Faz-me Andar Só na Luz", englishSlug: "teach-me-to-walk-in-the-light" },
  "71": { title: "Obedecerei", englishSlug: "dare-to-do-right" },
  "72": { title: "Eu Quero Viver o Evangelho", englishSlug: "choose-the-right-way" },
  "73": { title: "O Senhor Deu-me um Templo", englishSlug: "the-lord-gave-me-a-temple" },
  "74": { title: "Amai-vos Uns aos Outros", englishSlug: "love-one-another" },
  "76": { title: "Onde Há Amor", englishSlug: "where-love-is" },
  "78": { title: "Eu Andarei Contigo", englishSlug: "ill-walk-with-you" },
  "80": { title: "Ouse Ser Bom", englishSlug: "dare-to-do-right" },
  "81": { title: "Sê Fiel", englishSlug: "stand-for-the-right" },
  "82": { title: "Escolhendo o Que É Certo", englishSlug: "choose-the-right" },
  "83": { title: "A Bondade por Mim Começará", englishSlug: "kindness-begins-with-me" },
  "84": { title: "Sou como uma Estrela", englishSlug: "i-am-like-a-star" },
  "85": { title: "Serei Valoroso", englishSlug: "ill-be-valiant" },
  "86": { title: "Vou Cumprir o Plano de Deus", englishSlug: "i-will-follow-gods-plan" },
  "88": { title: "Um Jovem Fiel", englishSlug: "a-young-man-prepared" },
  "90": { title: "Um Missionário Já Eu Quero Ser", englishSlug: "i-hope-they-call-me-on-a-mission" },
  "91": { title: "Eu Quero Ser um Missionário", englishSlug: "i-want-to-be-a-missionary-now" },
  "92": { title: "Levaremos ao Mundo a Verdade (Exército de Helamã)", englishSlug: "we-will-bring-the-world-his-truth" },
  "94": { title: "Chamados a Servir", englishSlug: "called-to-serve" },
  "96": { title: "Brilha", englishSlug: "shine-on" },

  // Lar e Família (Home and Family)
  "98": { title: "As Famílias Poderão Ser Eternas", englishSlug: "families-can-be-together-forever" },
  "99": { title: "Eu Gosto de Ver o Templo", englishSlug: "i-love-to-see-the-temple" },
  "100": { title: "Eu Vou Pesquisar a História da Famíla", englishSlug: "family-history-i-am-doing-it" },
  "101": { title: "Oração Familiar", englishSlug: "family-prayer" },
  "102": { title: "Fala-se Com Amor", englishSlug: "love-is-spoken-here" },
  "104": { title: "Uma Família Feliz", englishSlug: "a-happy-family" },
  "105": { title: "Sábado", englishSlug: "saturday" },
  "106": { title: "Os Mais Queridos Nomes", englishSlug: "the-dearest-names" },
  "107": { title: "Mãe, Eu Te Amo", englishSlug: "mother-i-love-you" },
  "108a": { title: "Minha Mãe do Coração", englishSlug: "mothers-day" },
  "108b": { title: "Ajudar Toda Gente", englishSlug: "when-we-help" },
  "109": { title: "Se Vou a Passeio", englishSlug: "when-daddy-comes-home" },
  "110": { title: "Quando Chega em Casa o Meu Pai", englishSlug: "when-daddy-comes-home" },
  "111": { title: "Meu Pai", englishSlug: "father" },
  "112": { title: "Avó", englishSlug: "grandmother" },
  "113": { title: "Quando Chega Meu Avô", englishSlug: "when-grandpa-comes" },
  "114": { title: "Você Deve Cantar", englishSlug: "youve-got-to-sing" },

  // Diversão e Atividades (Fun and Activities)
  "116": { title: "O Riachinho Faz", englishSlug: "give-said-the-little-stream" },
  "117": { title: "Cai a Chuva ao Redor", englishSlug: "rain-is-falling-all-around" },
  "118": { title: "Pipocas no Pé de Jasmim", englishSlug: "popcorn-popping" },
  "119": { title: "As Sementes que Plantei", englishSlug: "little-seeds-lie-fast-asleep" },
  "120": { title: "O Que Você Faz Quando É Verão?", englishSlug: "what-do-you-do-in-the-summertime" },
  "121": { title: "Era uma Vez um Homem de Neve", englishSlug: "once-there-was-a-snowman" },
  "122": { title: "Glorioso É o Mundo", englishSlug: "my-heavenly-father-loves-me" },
  "123": { title: "O Mundo É Tão Belo", englishSlug: "the-world-is-so-big" },
  "124": { title: "Vamos com Alma Cantar", englishSlug: "sing-a-song" },
  "125": { title: "Se Você Está Feliz", englishSlug: "if-youre-happy" },
  "126": { title: "Minhas Mãos São Pequenas", englishSlug: "little-hands" },
  "127": { title: "Juntas", englishSlug: "together" },
  "128": { title: "Sorrisos", englishSlug: "smiles" },
  "129a": { title: "Cabeça, Ombros, Joelhos, Pés", englishSlug: "head-shoulders-knees-and-toes" },
  "129b": { title: "É Bom Cantar", englishSlug: "fun-to-do" },
  "130": { title: "Olá!", englishSlug: "hello" },
  "131": { title: "As Cores da Nossa Primária", englishSlug: "the-primary-colors" },
  "132": { title: "O Sábio e o Tolo", englishSlug: "the-wise-man-and-the-foolish-man" },
  "133": { title: "Canção de Aniversário (Rondó ou Cânone)", englishSlug: "birthday" },
  "134": { title: "Um Feliz Aniversário", englishSlug: "happy-happy-birthday" },

  // Assuntos Diversos (Selected Songs)
  "136": { title: "Canção do Carrinho de Mão", englishSlug: "the-handcart-song" },
  "137": { title: "Crianças Pioneiras", englishSlug: "pioneer-children-sang-as-they-walked" },
  "138": { title: "Pra Ser um Pioneiro", englishSlug: "to-be-a-pioneer" },
  "139": { title: "Para Ser Feliz", englishSlug: "smiles" },
  "140": { title: "No Céu Eu Vivi", englishSlug: "i-lived-in-heaven" },
  "141": { title: "Dize, Senhor", englishSlug: "tell-me-the-stories-of-jesus" },
  "142": { title: "Os Patinhos", englishSlug: "fun-to-do" },
  "144": { title: "Em Tudo Há Beleza", englishSlug: "all-things-bright-and-beautiful" },
  "145": { title: "Você Viu Uma Menina?", englishSlug: "have-you-seen-a-girl" },
  "146": { title: "A Chuva", englishSlug: "rain-is-falling-all-around" },
  "147": { title: "Pequenas Coisas", englishSlug: "fun-to-do" },
  "148": { title: "Viver para Servir", englishSlug: "ill-walk-with-you" }
};

// Get the Portuguese children's song title by number
export const getPortugueseChildrensSongTitle = (number: string): string => {
  return PORTUGUESE_CHILDRENS_SONGBOOK[number]?.title || '';
};

// Check if a song number is valid in the Portuguese Children's Songbook
export const isValidPortugueseChildrensSongNumber = (number: string): boolean => {
  return number in PORTUGUESE_CHILDRENS_SONGBOOK;
};

// Generate URL for Portuguese children's song (uses English slug with ?lang=por)
export const getPortugueseChildrensSongUrl = (number: string): string => {
  const song = PORTUGUESE_CHILDRENS_SONGBOOK[number];
  if (!song) return '';

  const slug = song.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/childrens-songbook/${slug}?lang=por`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=childrens-songbook&lang=por`;
};

// Search Portuguese children's songs by title
export const searchPortugueseChildrensSongByTitle = (searchTerm: string): Array<{number: string, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: string, title: string}> = [];

  // Search through all Portuguese children's songs
  Object.entries(PORTUGUESE_CHILDRENS_SONGBOOK).forEach(([number, song]) => {
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
