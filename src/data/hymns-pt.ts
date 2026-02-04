// Portuguese Hymn Database
// Maps Portuguese hymn numbers (1-204) to Portuguese titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints Portuguese Hymnal

export interface PortugueseHymn {
  title: string;
  englishSlug: string;
}

// Portuguese hymn number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=por
export const PORTUGUESE_HYMNS: Record<number, PortugueseHymn> = {
  // Restauração (Restoration) - Hymns 1-28
  1: { title: "A Alva Rompe", englishSlug: "the-morning-breaks" },
  2: { title: "Tal Como um Facho", englishSlug: "the-spirit-of-god" },
  3: { title: "Alegres Cantemos", englishSlug: "now-let-us-rejoice" },
  4: { title: "No Monte a Bandeira", englishSlug: "high-on-the-mountain-top" },
  5: { title: "Israel, Jesus Te Chama", englishSlug: "israel-israel-god-is-calling" },
  6: { title: "Um Anjo Lá do Céu", englishSlug: "an-angel-from-on-high" },
  7: { title: "O Que Vimos Lá nos Céus", englishSlug: "what-glorious-scenes-mine-eyes-behold" },
  8: { title: "Oração pelo Profeta", englishSlug: "we-ever-pray-for-thee" },
  9: { title: "Graças Damos, Ó Deus, Por um Profeta", englishSlug: "we-thank-thee-o-god-for-a-prophet" },
  10: { title: "Vinde ao Profeta Escutar", englishSlug: "come-listen-to-a-prophets-voice" },
  11: { title: "Abençoa Nosso Profeta", englishSlug: "god-bless-our-prophet-dear" },
  12: { title: "Que Manhã Maravilhosa!", englishSlug: "joseph-smiths-first-prayer" },
  13: { title: "Rejubilai-vos, Ó Nações", englishSlug: "praise-to-the-man" },
  14: { title: "Hoje, ao Profeta Louvemos", englishSlug: "now-well-sing-with-one-accord" },
  15: { title: "Um Pobre e Aflito Viajor", englishSlug: "a-poor-wayfaring-man-of-grief" },
  16: { title: "Ó Montanhas Mil", englishSlug: "o-ye-mountains-high" },
  17: { title: "Por Teus Dons", englishSlug: "for-the-strength-of-the-hills" },
  18: { title: "Vede, Ó Santos", englishSlug: "they-the-builders-of-the-nation" },
  19: { title: "Sereno Finda o Dia", englishSlug: "the-wintry-day-descending-to-its-close" },
  20: { title: "Vinde, Ó Santos", englishSlug: "come-come-ye-saints" },
  21: { title: "Ao Salvador Louvemos", englishSlug: "let-zion-in-her-beauty-rise" },
  22: { title: "Em Glória Resplandesce", englishSlug: "hail-to-the-brightness-of-zions-glad-morning" },
  23: { title: "Lá nos Cumes", englishSlug: "zion-stands-with-hills-surrounded" },
  24: { title: "Vem, Ó Dia Prometido", englishSlug: "come-thou-glorious-day-of-promise" },
  25: { title: "Bela Sião", englishSlug: "beautiful-zion-built-above" },
  26: { title: "O Mundo Desperta", englishSlug: "the-day-dawn-is-breaking" },
  27: { title: "Vinde, Ó Filhos do Senhor", englishSlug: "come-ye-children-of-the-lord" },
  28: { title: "Ó Vem, Supremo Rei", englishSlug: "come-o-thou-king-of-kings" },

  // Louvor e Graças (Praise and Thanks) - Hymns 29-59
  29: { title: "Ó Criaturas do Senhor", englishSlug: "all-creatures-of-our-god-and-king" },
  30: { title: "Ó Santos, Que na Terra Habitais", englishSlug: "come-all-ye-saints-who-dwell-on-earth" },
  31: { title: "Com Braço Forte", englishSlug: "rejoice-the-lord-is-king" },
  32: { title: "Castelo Forte", englishSlug: "a-mighty-fortress-is-our-god" },
  33: { title: "Glória a Deus Cantai", englishSlug: "glory-to-god-on-high" },
  34: { title: "Louvai a Deus", englishSlug: "praise-to-the-lord-the-almighty" },
  35: { title: "A Deus, Senhor e Rei", englishSlug: "praise-ye-the-lord" },
  36: { title: "Deus É Amor", englishSlug: "god-is-love" },
  37: { title: "O Senhor Meu Pastor É", englishSlug: "the-lord-is-my-shepherd" },
  38: { title: "Que Toda Honra e Glória", englishSlug: "all-glory-laud-and-honor" },
  39: { title: "Corações, Pois, Exultai", englishSlug: "sing-praise-to-him" },
  40: { title: "Jeová, Sê Nosso Guia", englishSlug: "guide-us-o-thou-great-jehovah" },
  41: { title: "Firmes Segui", englishSlug: "press-forward-saints" },
  42: { title: "Que Firme Alicerce", englishSlug: "how-firm-a-foundation" },
  43: { title: "Grandioso És Tu", englishSlug: "how-great-thou-art" },
  44: { title: "Jesus, Minha Luz", englishSlug: "the-lord-is-my-light" },
  45: { title: "Ó Vós Que Amais ao Senhor", englishSlug: "come-we-that-love-the-lord" },
  46: { title: "Nossas Vozes Elevemos", englishSlug: "from-all-that-dwell-below-the-skies" },
  47: { title: "Deus nos Rege com Amor", englishSlug: "dearest-children-god-is-near-you" },
  48: { title: "Ó Pai Bendito", englishSlug: "o-thou-kind-and-gracious-father" },
  49: { title: "Pela Beleza do Mundo", englishSlug: "for-the-beauty-of-the-earth" },
  50: { title: "Cantando Louvamos", englishSlug: "prayer-of-thanksgiving" },
  51: { title: "Oração de Graças", englishSlug: "come-ye-thankful-people" },
  52: { title: "Vinde, Ó Povos, Graças Dar", englishSlug: "now-thank-we-all-our-god" },
  53: { title: "Se Tenho Fé", englishSlug: "when-faith-endures" },
  54: { title: "Doce É o Trabalho", englishSlug: "sweet-is-the-work" },
  55: { title: "Santo! Santo! Santo!", englishSlug: "great-is-the-lord" },
  56: { title: "Os Céus Proclamam", englishSlug: "with-all-the-power-of-heart-and-tongue" },
  57: { title: "Conta as Bênçãos", englishSlug: "count-your-blessings" },
  58: { title: "Ao Deus de Abraão Louvai", englishSlug: "great-god-attend-while-zion-sings" },
  59: { title: "Louvai o Eterno Criador", englishSlug: "praise-god-from-whom-all-blessings-flow" },

  // Oração e Súplica (Prayer and Supplication) - Hymns 60-97
  60: { title: "Brilha, Meiga Luz", englishSlug: "lead-kindly-light" },
  61: { title: "Careço de Jesus", englishSlug: "i-need-thee-every-hour" },
  62: { title: "Mais Perto Quero Estar", englishSlug: "nearer-my-god-to-thee" },
  63: { title: "Guia-me a Ti", englishSlug: "guide-me-to-thee" },
  64: { title: "Ó Pai Celeste", englishSlug: "father-in-heaven" },
  65: { title: "Jesus Cristo É Meu Senhor", englishSlug: "jesus-lover-of-my-soul" },
  66: { title: "Creio em Cristo", englishSlug: "i-believe-in-christ" },
  67: { title: "Vive o Redentor", englishSlug: "my-redeemer-lives" },
  68: { title: "Vinde a Mim", englishSlug: "come-unto-him" },
  69: { title: "Vinde a Cristo", englishSlug: "come-unto-jesus" },
  70: { title: "Eu Sei Que Vive Meu Senhor", englishSlug: "i-know-that-my-redeemer-lives" },
  71: { title: "Testemunho", englishSlug: "testimony" },
  72: { title: "Mestre, o Mar Se Revolta", englishSlug: "master-the-tempest-is-raging" },
  73: { title: "Onde Encontrar a Paz?", englishSlug: "where-can-i-turn-for-peace" },
  74: { title: "Sê Humilde", englishSlug: "be-thou-humble" },
  75: { title: "Mais Vontade Dá-me", englishSlug: "more-holiness-give-me" },
  76: { title: "Rocha Eterna", englishSlug: "rock-of-ages" },
  77: { title: "A Luz de Deus", englishSlug: "the-light-divine" },
  78: { title: "Embora Cheios de Pesar", englishSlug: "though-deepening-trials" },
  79: { title: "Ó Doce, Grata Oração", englishSlug: "sweet-hour-of-prayer" },
  80: { title: "Santo Espírito de Deus", englishSlug: "let-the-holy-spirit-guide" },
  81: { title: "Secreta Oração", englishSlug: "secret-prayer" },
  82: { title: "Eis-nos Agora Aqui", englishSlug: "we-meet-dear-lord" },
  83: { title: "Com Fervor Fizeste a Prece?", englishSlug: "did-you-think-to-pray" },
  84: { title: "Só por em Ti, Jesus, Pensar", englishSlug: "jesus-the-very-thought-of-thee" },
  85: { title: "Deus Vos Guarde", englishSlug: "god-be-with-you-till-we-meet-again" },
  86: { title: "Nós Pedimos-te, Senhor", englishSlug: "lord-we-ask-thee-ere-we-part" },
  87: { title: "Ó Bondoso Pai Eterno", englishSlug: "god-our-father-hear-us-pray" },
  88: { title: "Dá-nos, Tu, ó Pai Bondoso", englishSlug: "father-this-hour-has-been-one-of-joy" },
  89: { title: "Ao Partir Cantemos", englishSlug: "sing-we-now-at-parting" },
  90: { title: "Teu Santo Espírito, Senhor", englishSlug: "thy-spirit-lord-has-stirred-our-souls" },
  91: { title: "Qual Orvalho Que Cintila", englishSlug: "as-the-dew-from-heaven-distilling" },
  92: { title: "Vai Fugindo o Dia", englishSlug: "now-the-day-is-over" },
  93: { title: "Suavemente a Noite Cai", englishSlug: "softly-now-the-light-of-day" },
  94: { title: "Oração para a Noite", englishSlug: "great-god-to-thee-my-evening-song" },
  95: { title: "Eis-nos, Hoje, a Teus Pés", englishSlug: "abide-with-me-tis-eventide" },
  96: { title: "É Tarde, a Noite Logo Vem", englishSlug: "abide-with-me" },
  97: { title: "Comigo Habita", englishSlug: "come-let-us-sing-an-evening-hymn" },

  // Hinos Sacramentais (Sacramental Hymns) - Hymns 98-117
  98: { title: "Ó Deus, Senhor Eterno", englishSlug: "o-god-the-eternal-father" },
  99: { title: "Ao Partilhar de Teu Amor", englishSlug: "as-now-we-take-the-sacrament" },
  100: { title: "Entoai a Deus Louvor", englishSlug: "god-our-father-hear-us-pray" },
  101: { title: "Deus, Escuta-nos Orar", englishSlug: "with-humble-heart" },
  102: { title: "Nossa Humilde Prece Atende", englishSlug: "in-humility-our-savior" },
  103: { title: "Enquanto unidos em Amor", englishSlug: "while-of-these-emblems-we-partake" },
  104: { title: "Quão Grato É Cantar Louvor", englishSlug: "tis-sweet-to-sing-the-matchless-love" },
  105: { title: "Cantemos Todos a Jesus", englishSlug: "well-sing-all-hail-to-jesus-name" },
  106: { title: "Jesus de Nazaré, Mestre e Rei", englishSlug: "jesus-of-nazareth-savior-and-king" },
  107: { title: "Deus Tal Amor por Nós Mostrou", englishSlug: "god-loved-us-so-he-sent-his-son" },
  108: { title: "Eis-nos à Mesa do Senhor", englishSlug: "again-we-meet-around-the-board" },
  109: { title: "Em uma Cruz Jesus Morreu", englishSlug: "upon-the-cross-of-calvary" },
  110: { title: "Vede, Morreu o Redentor", englishSlug: "behold-the-great-redeemer-die" },
  111: { title: "Lembrando a Morte de Jesus", englishSlug: "in-memory-of-the-crucified" },
  112: { title: "Assombro me Causa", englishSlug: "i-stand-all-amazed" },
  113: { title: "No Monte do Calvário", englishSlug: "there-is-a-green-hill-far-away" },
  114: { title: "Da Corte Celestial", englishSlug: "how-great-the-wisdom-and-the-love" },
  115: { title: "Tão Humilde ao Nascer", englishSlug: "jesus-once-of-humble-birth" },
  116: { title: "Sobre o Calvário", englishSlug: "o-savior-thou-who-wearest-a-crown" },
  117: { title: "Com Irmãos Nós Reunidos", englishSlug: "again-our-dear-redeeming-lord" },

  // Páscoa (Easter) - Hymns 118-120
  118: { title: "Manhã da Ressurreição", englishSlug: "that-easter-morn" },
  119: { title: "Cristo É Já Ressuscitado", englishSlug: "he-is-risen" },
  120: { title: "Cristo Já Ressuscitou", englishSlug: "christ-the-lord-is-risen-today" },

  // Natal (Christmas) - Hymns 121-133
  121: { title: "Mundo Feliz, Nasceu Jesus", englishSlug: "joy-to-the-world" },
  122: { title: "Erguei-vos Cantando", englishSlug: "oh-come-all-ye-faithful" },
  123: { title: "Lá na Judéia, Onde Cristo Nasceu", englishSlug: "far-far-away-on-judeas-plains" },
  124: { title: "Anjos Descem a Cantar", englishSlug: "angels-we-have-heard-on-high" },
  125: { title: "Ouvi os Sinos do Natal", englishSlug: "i-heard-the-bells-on-christmas-day" },
  126: { title: "Noite Feliz", englishSlug: "silent-night" },
  127: { title: "Jesus num Presépio", englishSlug: "away-in-a-manger" },
  128: { title: "Na Bela Noite Se Ouviu", englishSlug: "it-came-upon-the-midnight-clear" },
  129: { title: "Pequena Vila de Belém", englishSlug: "o-little-town-of-bethlehem" },
  130: { title: "No Céu Desponta Nova Luz", englishSlug: "with-wondering-awe" },
  131: { title: "No Dia de Natal", englishSlug: "once-in-royal-davids-city" },
  132: { title: "Eis dos Anjos a Harmonia", englishSlug: "hark-the-herald-angels-sing" },
  133: { title: "Quando o Anjo Proclamou", englishSlug: "while-shepherds-watched-their-flocks" },

  // Temas Especiais (Special Topics) - Hymns 134-204
  134: { title: "Sim, Eu Te Seguirei", englishSlug: "lord-i-would-follow-thee" },
  135: { title: "Eu Devo Partilhar", englishSlug: "because-i-have-been-given-much" },
  136: { title: "Neste mundo", englishSlug: "have-i-done-any-good" },
  137: { title: "Oh! Falemos Palavras Amáveis", englishSlug: "let-us-oft-speak-kind-words" },
  138: { title: "Não Deixeis Palavras Duras", englishSlug: "nay-speak-no-ill" },
  139: { title: "Deus É Consolador Sem Par", englishSlug: "does-the-journey-seem-long" },
  140: { title: "Ama o Pastor Seu Rebanho", englishSlug: "dear-to-the-heart-of-the-shepherd" },
  141: { title: "Trabalhemos Hoje", englishSlug: "today-while-the-sun-shines" },
  142: { title: "Nossa Lei É Trabalhar", englishSlug: "put-your-shoulder-to-the-wheel" },
  143: { title: "Pai, Inspira-me ao Ensinar", englishSlug: "help-me-teach-with-inspiration" },
  144: { title: "Mãos ao Trabalho", englishSlug: "i-have-work-enough-to-do" },
  145: { title: "Sempre Que Alguém Nos Faz o Bem", englishSlug: "each-life-that-touches-ours-for-good" },
  146: { title: "Se a Vida É Penosa", englishSlug: "improve-the-shining-moments" },
  147: { title: "Faze o Bem", englishSlug: "do-what-is-right" },
  148: { title: "Faze o Bem, Escolhendo o Que É Certo", englishSlug: "choose-the-right" },
  149: { title: "A Alma É Livre", englishSlug: "know-this-that-every-soul-is-free" },
  150: { title: "Quem Segue ao Senhor?", englishSlug: "whos-on-the-lords-side" },
  151: { title: "Minha Alma Hoje Tem a luz", englishSlug: "there-is-sunshine-in-my-soul-today" },
  152: { title: "Prolongue os Bons Momentos", englishSlug: "improve-the-shining-moments" },
  153: { title: "Deixa a Luz do Sol Entrar", englishSlug: "you-can-make-the-pathway-bright" },
  154: { title: "Enquanto o Sol Brilha", englishSlug: "today-while-the-sun-shines" },
  155: { title: "Luz Espalhai", englishSlug: "scatter-sunshine" },
  156: { title: "Agora Não, mas Logo Mais", englishSlug: "god-moves-in-a-mysterious-way" },
  157: { title: "Amor que Cristo Demonstrou", englishSlug: "o-love-that-glorifies-the-son" },
  158: { title: "Tu Jesus, Ó Rocha Eterna", englishSlug: "o-thou-rock-of-our-salvation" },
  159: { title: "À Glória Nós Iremos", englishSlug: "we-are-marching-on-to-glory" },
  160: { title: "Somos os Soldados", englishSlug: "we-are-all-enlisted" },
  161: { title: "As Hostes do Eterno", englishSlug: "behold-a-royal-army" },
  162: { title: "Com Valor Marchemos", englishSlug: "onward-christian-soldiers" },
  163: { title: "Ide por Todo o Mundo", englishSlug: "go-ye-messengers-of-glory" },
  164: { title: "De Um a Outro Pólo", englishSlug: "come-all-whose-souls-are-lighted" },
  165: { title: "Semeando", englishSlug: "we-are-sowing" },
  166: { title: "Chamados a Servir", englishSlug: "called-to-serve" },
  167: { title: "Aonde Mandares Irei", englishSlug: "ill-go-where-you-want-me-to-go" },
  168: { title: "Povos da Terra, Vinde, Escutai!", englishSlug: "hark-all-ye-nations" },
  169: { title: "Eis os Teus Filhos, Ó Senhor", englishSlug: "behold-thy-sons-and-daughters-lord" },
  170: { title: "Avante, ao Mundo Proclamai", englishSlug: "go-forth-with-faith" },
  171: { title: "A Verdade o Que É?", englishSlug: "oh-say-what-is-truth" },
  172: { title: "A Verdade É Nosso Guia", englishSlug: "truth-reflects-upon-our-senses" },
  173: { title: "Ao Raiar o Novo Dia", englishSlug: "welcome-welcome-sabbath-morning" },
  174: { title: "Sê Bem-vindo, Dia Santo", englishSlug: "sabbath-day" },
  175: { title: "Do Pó Nos Fala uma Voz", englishSlug: "the-iron-rod" },
  176: { title: "Estudando as Escrituras", englishSlug: "as-i-search-the-holy-scriptures" },
  177: { title: "Ó Meu Pai", englishSlug: "o-my-father" },
  178: { title: "Ó Quão Majestosa É a Obra de Deus", englishSlug: "if-you-could-hie-to-kolob" },
  179: { title: "Ó Jeová, Senhor do Céu", englishSlug: "jehovah-lord-of-heaven-and-earth" },
  180: { title: "Já Refulge a Glória Eterna", englishSlug: "the-glorious-gospel-light-has-shone" },
  181: { title: "O Fim Se Aproxima", englishSlug: "the-time-is-far-spent" },
  182: { title: "Juventude da Promessa", englishSlug: "hope-of-israel" },
  183: { title: "Deve Sião Fugir à Luta?", englishSlug: "let-us-all-press-on" },
  184: { title: "Constantes Qual Firmes Montanhas", englishSlug: "true-to-the-faith" },
  185: { title: "Quão Belos São", englishSlug: "how-beautiful-thy-temples-lord" },
  186: { title: "Levantai-vos, Ide ao Templo", englishSlug: "rise-ye-saints-and-temples-enter" },
  187: { title: "Nós Dedicamos Esta Casa", englishSlug: "this-house-we-dedicate-to-thee" },
  188: { title: "Com Amor no Lar", englishSlug: "love-at-home" },
  189: { title: "Pode o Lar Ser Como o Céu", englishSlug: "home-can-be-a-heaven-on-earth" },
  190: { title: "Os Teus Filhos, Pai Celeste", englishSlug: "children-of-our-heavenly-father" },
  191: { title: "As Famílias Poderão Ser Eternas", englishSlug: "families-can-be-together-forever" },
  192: { title: "Ó Crianças, Deus Vos Ama", englishSlug: "dearest-children-god-is-near-you" },
  193: { title: "Sou um Filho de Deus", englishSlug: "i-am-a-child-of-god" },
  194: { title: "Guarda os Mandamentos", englishSlug: "keep-the-commandments" },
  195: { title: "Eu Sei que Deus Vive", englishSlug: "i-know-my-father-lives" },
  196: { title: "Nas Montanhas de Sião", englishSlug: "in-our-lovely-deseret" },
  197: { title: "Amai-vos Uns aos Outros", englishSlug: "love-one-another" },
  198: { title: "Quando Vejo o Sol Raiar", englishSlug: "gods-daily-care" },
  199: { title: "Faz-me Andar Só na Luz", englishSlug: "teach-me-to-walk-in-the-light" },
  200: { title: "Irmãs em Sião", englishSlug: "as-sisters-in-zion" },
  201: { title: "Ó Filhos do Senhor", englishSlug: "come-all-ye-sons-of-god" },
  202: { title: "Brilham Raios de Clemência", englishSlug: "brightly-beams-our-fathers-mercy" },
  203: { title: "Ó Élderes de Israel", englishSlug: "ye-elders-of-israel" },
  204: { title: "Ó Vós, Que Sois Chamados", englishSlug: "ye-who-are-called-to-labor" },

  // Dia do Senhor e dias da semana (New Hymns 1001-1051)
  1001: { title: "Ó Senhor de toda bênção", englishSlug: "o-lord-of-every-blessing" },
  1002: { title: "Quando o Salvador voltar", englishSlug: "when-the-savior-comes-again" },
  1003: { title: "Minha alma tem paz", englishSlug: "it-is-well-with-my-soul" },
  1004: { title: "Quero andar com Cristo", englishSlug: "i-want-to-walk-with-christ" },
  1005: { title: "Do passarinho cuida", englishSlug: "his-eye-is-on-the-sparrow" },
  1006: { title: "Pense na canção", englishSlug: "think-of-the-song" },
  1007: { title: "Partido o pão", englishSlug: "as-we-break-the-bread" },
  1008: { title: "Pão do Céu, Água Viva", englishSlug: "bread-of-heaven-living-water" },
  1009: { title: "Getsêmani", englishSlug: "gethsemane" },
  1010: { title: "Sublime graça", englishSlug: "amazing-grace" },
  1011: { title: "De mãos dadas em união", englishSlug: "hand-in-hand-as-one" },
  1012: { title: "A qualquer hora ou lugar", englishSlug: "anytime-anywhere" },
  1013: { title: "O amor de Deus", englishSlug: "the-love-of-god" },
  1014: { title: "O meu Pastor vai me amparar", englishSlug: "my-shepherd-will-supply-my-need" },
  1015: { title: "O profundo amor de Cristo", englishSlug: "the-deep-love-of-christ" },
  1016: { title: "Olhai as mãos do Redentor", englishSlug: "behold-the-wounds-in-jesus-hands" },
  1017: { title: "Este é o Cristo", englishSlug: "this-is-the-christ" },
  1018: { title: "Vem, ó Jesus! Vem!", englishSlug: "come-lord-jesus" },
  1019: { title: "Desejo me tornar como Cristo", englishSlug: "i-want-to-be-like-christ" },
  1020: { title: "O Salvador ternamente nos chama", englishSlug: "the-savior-gently-calls" },
  1021: { title: "Que Cristo me ama eu sei", englishSlug: "i-know-that-christ-loves-me" },
  1022: { title: "Fé a cada passo", englishSlug: "faith-in-every-footstep" },
  1023: { title: "Firme nas promessas", englishSlug: "standing-on-the-promises" },
  1024: { title: "Tenho fé em Jesus, meu Senhor", englishSlug: "i-have-faith-in-the-lord" },
  1025: { title: "Consagro meu coração em retidão", englishSlug: "i-consecrate-my-heart" },
  1026: { title: "Lugares santos", englishSlug: "holy-places" },
  1027: { title: "Ao virmos, hoje, adorar", englishSlug: "as-we-gather-here-to-worship" },
  1028: { title: "Tenho uma luz em mim", englishSlug: "i-have-a-light-in-me" },
  1029: { title: "Muitas bênçãos recebo", englishSlug: "i-have-many-blessings" },
  1030: { title: "Tão perto ao orar", englishSlug: "so-near-when-i-pray" },
  1031: { title: "Ó, vinde, ouvi a voz divina", englishSlug: "come-hear-the-voice-divine" },
  1032: { title: "Buscai a Cristo", englishSlug: "seek-the-christ" },
  1033: { title: "Oh, que grande alegria é servir", englishSlug: "oh-what-joy-it-is-to-serve" },
  1034: { title: "Pioneiros como eu", englishSlug: "pioneers-like-me" },
  1035: { title: "Neste Dia do Senhor", englishSlug: "on-this-day-of-the-lord" },
  1036: { title: "O Livro de Mórmon vou ler", englishSlug: "i-will-read-the-book-of-mormon" },
  1037: { title: "Vou viver para a Deus servir", englishSlug: "i-will-live-to-serve-god" },
  1038: { title: "O meu Senhor é meu Pastor", englishSlug: "my-lord-is-my-shepherd" },
  1039: { title: "Porque", englishSlug: "because" },
  1040: { title: "Sua voz a soar", englishSlug: "his-voice-is-calling" },
  1041: { title: "Meu coração é Teu, Jesus", englishSlug: "my-heart-is-yours-jesus" },
  1042: { title: "Bondoso Deus, que nos conduz", englishSlug: "kind-god-who-leads-us" },
  1043: { title: "Faz-nos lembrar", englishSlug: "make-us-remember" },
  1044: { title: "Cristo a todos ministrou", englishSlug: "christ-ministered-to-all" },
  1045: { title: "\"Vinde a Mim\", diz Jesus", englishSlug: "come-unto-me-says-jesus" },
  1046: { title: "Há no céu muitas estrelas", englishSlug: "there-are-many-stars-in-heaven" },
  1047: { title: "Ele me conhece bem", englishSlug: "he-knows-me-well" },
  1048: { title: "A Ti oramos, Pai Celeste", englishSlug: "we-pray-to-thee-heavenly-father" },
  1049: { title: "Posso orar como Joseph orou", englishSlug: "i-can-pray-like-joseph-prayed" },
  1050: { title: "Oh, que estejas junto a mim", englishSlug: "oh-be-near-me" },
  1051: { title: "Senhor, oh, que dia bom!", englishSlug: "lord-oh-what-a-good-day" },

  // Páscoa e Natal (Easter and Christmas New Hymns 1201-1209)
  1201: { title: "Eis a Páscoa do Senhor", englishSlug: "behold-the-easter-of-the-lord" },
  1202: { title: "O menino Jesus nasceu", englishSlug: "the-baby-jesus-was-born" },
  1203: { title: "Quem é o menino?", englishSlug: "who-is-the-child" },
  1204: { title: "Estrela brilhante e bela", englishSlug: "bright-and-beautiful-star" },
  1205: { title: "Na Páscoa do Senhor", englishSlug: "at-easter-of-the-lord" },
  1206: { title: "Você viu?", englishSlug: "did-you-see" },
  1207: { title: "Noite de paz", englishSlug: "silent-night" },
  1208: { title: "Ao mundo proclamai", englishSlug: "proclaim-to-the-world" },
  1209: { title: "Bebezinho no presépio", englishSlug: "baby-in-the-manger" },
};

// Get the Portuguese hymn title by number
export const getPortugueseHymnTitle = (number: number): string => {
  return PORTUGUESE_HYMNS[number]?.title || '';
};

// Get the English slug for URL generation
export const getPortugueseHymnEnglishSlug = (number: number): string => {
  return PORTUGUESE_HYMNS[number]?.englishSlug || '';
};

// Check if a hymn number is valid in the Portuguese hymnal
export const isValidPortugueseHymnNumber = (number: number): boolean => {
  return number in PORTUGUESE_HYMNS;
};

// Generate URL for Portuguese hymn (uses English slug with ?lang=por)
export const getPortugueseHymnUrl = (number: number): string => {
  const hymn = PORTUGUESE_HYMNS[number];
  if (!hymn) return '';

  const slug = hymn.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/hymns/${slug}?lang=por`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=hymns&lang=por`;
};

// Search Portuguese hymns by title
export const searchPortugueseHymnByTitle = (searchTerm: string): Array<{number: number, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: number, title: string}> = [];

  // Search through all Portuguese hymns
  Object.entries(PORTUGUESE_HYMNS).forEach(([number, hymn]) => {
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

// Language code mapping for Church website URLs
export const HYMN_LANGUAGE_CODES: Record<string, string> = {
  'en': 'eng',
  'pt': 'por',
  'es': 'spa',
  'fr': 'fra',
  'de': 'deu',
  'it': 'ita',
  'ja': 'jpn',
  'ko': 'kor',
  'zh': 'zho',
};

// Get the Church website language code from i18n language code
export const getChurchLanguageCode = (i18nLang: string): string => {
  return HYMN_LANGUAGE_CODES[i18nLang] || 'eng';
};
