// German Hymn Database
// Maps German hymn numbers (1-210, 1001-1031, 1201-1206) to German titles and English slugs for URL generation
// The Church of Jesus Christ of Latter-day Saints German Hymnal (Gesangbuch)

export interface GermanHymn {
  title: string;
  englishSlug: string;
}

// German hymn number -> { title, englishSlug }
// The englishSlug is used to generate URLs since the Church website uses English slugs with ?lang=deu
export const GERMAN_HYMNS: Record<number, GermanHymn> = {
  // Wiederherstellung (Restoration)
  1: { title: "Der Morgen naht", englishSlug: "the-morning-breaks" },
  2: { title: "Der Geist aus den Höhen", englishSlug: "the-spirit-of-god" },
  3: { title: "O Fülle des Heiles", englishSlug: "now-let-us-rejoice" },
  4: { title: "Hoch auf des Berges Höhn", englishSlug: "high-on-the-mountain-top" },
  5: { title: "Herr, unser Erlöser", englishSlug: "redeemer-of-israel" },
  6: { title: "Israel, der Herr ruft alle", englishSlug: "israel-israel-god-is-calling" },
  7: { title: "Führe mich zum ewgen Leben", englishSlug: "lead-me-into-life-eternal" },
  8: { title: "Ein Engel aus der Höhe", englishSlug: "an-angel-from-on-high" },
  9: { title: "Was klingt in diesen Tagen", englishSlug: "what-was-witnessed-in-the-heavens" },
  10: { title: "Wacht auf, ihr Heilgen!", englishSlug: "awake-ye-saints-of-god-awake" },
  11: { title: "Wir danken, o Gott, für den Propheten", englishSlug: "we-thank-thee-o-god-for-a-prophet" },
  12: { title: "Gott des Rechtes, Gott der Kraft", englishSlug: "god-of-power-god-of-right" },
  13: { title: "Kommt, höret, was der Heiland spricht", englishSlug: "come-listen-to-a-prophets-voice" },
  14: { title: "Wir beten stets für dich, unser Prophet", englishSlug: "we-ever-pray-for-thee" },
  15: { title: "Segne unsern Propheten", englishSlug: "god-bless-our-prophet-dear" },
  16: { title: "O wie lieblich war der Morgen", englishSlug: "joseph-smiths-first-prayer" },
  17: { title: "Preiset den Mann", englishSlug: "praise-to-the-man" },
  18: { title: "Ein armer Wandrer", englishSlug: "a-poor-wayfaring-man-of-grief" },
  19: { title: "Kommt, Heilge, kommt!", englishSlug: "come-come-ye-saints" },
  20: { title: "O ihr Bergeshöhn", englishSlug: "o-ye-mountains-high" },
  21: { title: "Für der Berge Kraft", englishSlug: "for-the-strength-of-the-hills" },
  22: { title: "Kommt und singt von Zion", englishSlug: "we-will-sing-of-zion" },
  23: { title: "Heil sei dir, Zion!", englishSlug: "hail-to-the-brightness-of-zions-glad-morning" },
  24: { title: "Zions Berge, stolz und prächtig", englishSlug: "zion-stands-with-hills-surrounded" },
  25: { title: "Herrliches Zion, hehr erbaut", englishSlug: "beautiful-zion-built-above" },
  26: { title: "Komm, o komm, du Tag der Glorie", englishSlug: "come-thou-glorious-day-of-promise" },
  27: { title: "Der Zeiten Fülle nun begann", englishSlug: "the-happy-day-at-last-has-come" },
  28: { title: "Der Morgen erwachet", englishSlug: "the-day-dawn-is-breaking" },
  29: { title: "Komm, o du Heiland hehr", englishSlug: "come-o-thou-king-of-kings" },
  30: { title: "Morgensterne, jauchzt vor Freud!", englishSlug: "the-morning-breaks" },
  31: { title: "Kommt, ihr Kinder Gottes", englishSlug: "come-ye-children-of-the-lord" },

  // Lobpreis und Danksagung (Praise and Thanksgiving)
  32: { title: "Für die Wunder dieser Welt", englishSlug: "for-the-beauty-of-the-earth" },
  33: { title: "Hört, ihr Geschöpfe all, frohlockt!", englishSlug: "all-creatures-of-our-god-and-king" },
  34: { title: "Heut, am heilgen Tag der Freude", englishSlug: "on-this-day-of-joy-and-gladness" },
  35: { title: "Ehre sei unserm Herrn", englishSlug: "glory-to-god-on-high" },
  36: { title: "Kommt, all ihr Heilgen", englishSlug: "come-all-ye-saints-who-dwell-on-earth" },
  37: { title: "Frohlockt, der Herr regiert!", englishSlug: "rejoice-the-lord-is-king" },
  38: { title: "Wie soll ich dich empfangen?", englishSlug: "how-gentle-gods-commands" },
  39: { title: "Lobe den Herren, den mächtigen König", englishSlug: "praise-to-the-lord-the-almighty" },
  40: { title: "Ein feste Burg ist unser Gott", englishSlug: "a-mighty-fortress-is-our-god" },
  41: { title: "Gott unsrer Väter, wir stehen vor dir", englishSlug: "god-of-our-fathers-whose-almighty-hand" },
  42: { title: "Preist den Herrn", englishSlug: "praise-ye-the-lord" },
  43: { title: "Gott unsrer Väter, deine Hand regiert", englishSlug: "god-of-our-fathers-known-of-old" },
  44: { title: "Großer Gott, wir loben dich", englishSlug: "great-god-to-thee-my-evening-song" },
  45: { title: "Blickt auf den Herrn!", englishSlug: "let-us-all-press-on" },
  46: { title: "Heilig ist der Herr", englishSlug: "holy-holy-holy" },
  47: { title: "Herr und Gott der Himmelsheere", englishSlug: "lord-of-all-being" },
  48: { title: "Kommt, o ihr Menschen", englishSlug: "come-all-whose-souls-are-lighted" },
  49: { title: "Wenn so meine Tage rastlos entfliehn", englishSlug: "when-upon-lifes-billows" },
  50: { title: "Wie groß bist du!", englishSlug: "how-great-thou-art" },
  51: { title: "Der Herr ist mein Licht", englishSlug: "the-lord-is-my-light" },
  52: { title: "Wir treten zum Beten", englishSlug: "prayer-of-thanksgiving" },
  53: { title: "Kinder Gottes, saget Dank", englishSlug: "children-of-our-heavenly-father" },
  54: { title: "Lieber Vater, hoch im Himmel", englishSlug: "father-in-heaven" },
  55: { title: "Gott ist Liebe", englishSlug: "god-is-love" },
  56: { title: "O fest wie ein Felsen", englishSlug: "how-firm-a-foundation" },

  // Beten und Flehen (Prayer and Supplication)
  57: { title: "Die ihr den Herren liebt", englishSlug: "ye-who-are-called-to-labor" },
  58: { title: "Führ, gütges Licht", englishSlug: "lead-kindly-light" },
  59: { title: "Wie gütig sein Gebot", englishSlug: "how-gentle-gods-commands" },
  60: { title: "Ich brauch dich allezeit", englishSlug: "i-need-thee-every-hour" },
  61: { title: "Näher, mein Gott, zu dir", englishSlug: "nearer-my-god-to-thee" },
  62: { title: "Näher, mein Heiland, zu dir", englishSlug: "nearer-dear-savior-to-thee" },
  63: { title: "Kommt, folget mir", englishSlug: "come-follow-me" },
  64: { title: "Jesus, Heiland, führe mich", englishSlug: "jesus-savior-pilot-me" },
  65: { title: "Jesus, dir gehört mein Herz", englishSlug: "o-jesus-the-very-thought-of-thee" },
  66: { title: "Meister, es toben die Winde", englishSlug: "master-the-tempest-is-raging" },
  67: { title: "Der Herr ist mein getreuer Hirt", englishSlug: "the-lord-is-my-shepherd" },
  68: { title: "Der Herr ist mein Hirte", englishSlug: "the-lord-is-my-shepherd" },
  69: { title: "Christ, unser Heil", englishSlug: "arise-o-god-and-shine" },
  70: { title: "Herr, wir wollen preisen, loben", englishSlug: "lord-we-ask-thee-ere-we-part" },
  71: { title: "Herr, unser Gott", englishSlug: "our-father-by-whose-name" },
  72: { title: "Fels seit alters", englishSlug: "rock-of-ages" },
  73: { title: "Herr, gib uns deinen Segen", englishSlug: "lord-dismiss-us-with-thy-blessing" },
  74: { title: "Komm, du Quelle jedes Segens", englishSlug: "come-thou-fount-of-every-blessing" },
  75: { title: "Kommet zu Jesus", englishSlug: "come-unto-jesus" },
  76: { title: "Ihr Heilgen, schauet auf zu Gott", englishSlug: "ye-simple-souls-who-stray" },
  77: { title: "Wo wird mir Trost zuteil?", englishSlug: "where-can-i-turn-for-peace" },
  78: { title: "In Demut", englishSlug: "be-thou-humble" },
  79: { title: "Mehr Heiligkeit gib mir", englishSlug: "more-holiness-give-me" },
  80: { title: "Die Sach ist dein, Herr Jesus Christ", englishSlug: "the-cause-is-real-and-holy" },
  81: { title: "Zu unsres Heilands Füßen einst", englishSlug: "lord-i-would-follow-thee" },
  82: { title: "Christus ist mein Herr", englishSlug: "jesus-of-nazareth-savior-and-king" },
  83: { title: "Schönster Herr Jesus", englishSlug: "beautiful-savior" },
  84: { title: "Mein Erlöser lebt", englishSlug: "he-is-risen" },
  85: { title: "Ich weiß, daß mein Erlöser lebt", englishSlug: "i-know-that-my-redeemer-lives" },
  86: { title: "Wir fasten", englishSlug: "bless-our-fast-we-pray" },
  87: { title: "Das Zeugnis", englishSlug: "testimony" },
  88: { title: "Sprachst du dein Gebet?", englishSlug: "did-you-think-to-pray" },
  89: { title: "Jesus, wenn ich nur denk an dich", englishSlug: "jesus-the-very-thought-of-thee" },
  90: { title: "Wie schön die Stund", englishSlug: "sweet-is-the-work" },
  91: { title: "Wenn der Heilge Geist dich führt", englishSlug: "let-the-holy-spirit-guide" },
  92: { title: "Wie süß die Stund", englishSlug: "sweet-hour-of-prayer" },
  93: { title: "Vater im Himmel", englishSlug: "our-heavenly-father" },
  94: { title: "Der Seele Wunsch ist das Gebet", englishSlug: "prayer-is-the-souls-sincere-desire" },
  95: { title: "Süß ist dein Werk", englishSlug: "sweet-is-the-work" },
  96: { title: "Seht, der Tag des Herrn bricht an", englishSlug: "the-day-of-the-lord-is-near" },
  97: { title: "Wie der Tau, vom Himmel träufelnd", englishSlug: "as-the-dew-from-heaven-distilling" },
  98: { title: "Gott sei mit euch", englishSlug: "god-be-with-you-till-we-meet-again" },
  99: { title: "Heilig sei und bleibe dir", englishSlug: "o-thou-kind-and-gracious-father" },
  100: { title: "Vater, dir sei diese Stunde", englishSlug: "father-this-hour-has-been-one-of-joy" },
  101: { title: "Laßt uns nochmals singen", englishSlug: "now-the-day-is-over" },
  102: { title: "Dein Geist, o Herr, berührt mich heut", englishSlug: "the-spirit-of-god" },
  103: { title: "Leise weicht des Tages Licht", englishSlug: "softly-now-the-light-of-day" },
  104: { title: "Herr, bleib bei mir", englishSlug: "abide-with-me" },
  105: { title: "Nun der Tag vorüber", englishSlug: "now-the-day-is-over" },
  106: { title: "Herr, wir flehn um deinen Segen", englishSlug: "lord-we-ask-thee-ere-we-part" },
  107: { title: "Herr, wir treten vor dich hin", englishSlug: "father-in-heaven-we-do-believe" },
  108: { title: "O bleibe, Herr", englishSlug: "abide-with-me-tis-eventide" },

  // Abendmahl (Sacrament)
  109: { title: "Jesus von Nazareth", englishSlug: "jesus-of-nazareth-savior-and-king" },
  110: { title: "Herr, in Demut flehn wir", englishSlug: "reverently-and-meekly-now" },
  111: { title: "Wenn Brot und Wasser nehmen wir", englishSlug: "while-of-these-emblems-we-partake" },
  112: { title: "O Gott, du ewger Vater", englishSlug: "o-god-the-eternal-father" },
  113: { title: "Wir rufen, Herr, dich Schöpfer an", englishSlug: "god-our-father-hear-us-pray" },
  114: { title: "In Lieb und Gnad vom Himmelsthron", englishSlug: "in-humility-our-savior" },
  115: { title: "Den Namen Jesu ehren wir", englishSlug: "in-memory-of-the-crucified" },
  116: { title: "O sieh des großen Meisters Tod", englishSlug: "behold-the-great-redeemer-die" },
  117: { title: "Es liegt ein Hügel in der Fern", englishSlug: "there-is-a-green-hill-far-away" },
  118: { title: "Erstaunt und bewundernd", englishSlug: "i-stand-all-amazed" },
  119: { title: "Am Kreuze einst auf Golgatha", englishSlug: "upon-the-cross-of-calvary" },
  120: { title: "Zum Tisch des Herren kommen wir", englishSlug: "again-we-meet-around-the-board" },
  121: { title: "Zu dieser Stund gedenken wir", englishSlug: "tis-sweet-to-sing-the-matchless-love" },
  122: { title: "Wie groß die Weisheit und die Lieb", englishSlug: "how-great-the-wisdom-and-the-love" },
  123: { title: "Jesus, einstens schlicht geborn", englishSlug: "jesus-once-of-humble-birth" },
  124: { title: "O Haupt voll Blut und Wunden", englishSlug: "o-sacred-head-now-wounded" },
  125: { title: "Gott und Vater, hör uns flehn", englishSlug: "god-loved-us-so-he-sent-his-son" },

  // Ostern (Easter)
  126: { title: "Seele, dein Heiland ist frei", englishSlug: "he-is-risen" },
  127: { title: "Christ, der Herr, vom Tod erstand", englishSlug: "christ-the-lord-is-risen-today" },
  128: { title: "Seht, der Herr ist auferstanden!", englishSlug: "he-is-risen" },

  // Weihnachten (Christmas)
  129: { title: "Es ist ein Ros entsprungen", englishSlug: "lo-how-a-rose-eer-blooming" },
  130: { title: "Tochter Zion, freue dich", englishSlug: "joy-to-the-world" },
  131: { title: "Freu dich, o Welt, der Herr erschien!", englishSlug: "joy-to-the-world" },
  132: { title: "O du fröhliche", englishSlug: "o-come-all-ye-faithful" },
  133: { title: "Engel auf den Feldern singen", englishSlug: "angels-we-have-heard-on-high" },
  134: { title: "Stille Nacht, heilige Nacht", englishSlug: "silent-night" },
  135: { title: "Im Stroh in der Krippe", englishSlug: "away-in-a-manger" },
  136: { title: "Hört, die Engelschöre singen", englishSlug: "hark-the-herald-angels-sing" },
  137: { title: "Du kleines Städtchen Bethlehem", englishSlug: "o-little-town-of-bethlehem" },
  138: { title: "Mit Staunen sahn die Weisen nahn", englishSlug: "with-wondering-awe" },
  139: { title: "Herbei, o ihr Gläubigen!", englishSlug: "o-come-all-ye-faithful" },
  140: { title: "Lobt Gott, ihr Christen, all zugleich", englishSlug: "it-came-upon-the-midnight-clear" },
  141: { title: "Weit, weit entfernt, dort im Morgenland", englishSlug: "far-far-away-on-judeas-plains" },

  // Besondere Themen (Special Topics)
  142: { title: "Der Glocke Klang hoch zum Himmel klingt", englishSlug: "ring-out-wild-bells" },
  143: { title: "Die Zeit vergeht im Fluge", englishSlug: "improve-the-shining-moments" },
  144: { title: "An des Herren Hand", englishSlug: "in-our-lovely-deseret" },
  145: { title: "Täglich säend", englishSlug: "we-are-sowing" },
  146: { title: "Hör unser Lied, o Herr", englishSlug: "each-life-that-touches-ours-for-good" },
  147: { title: "Weil mir so viel gegeben ist", englishSlug: "because-i-have-been-given-much" },
  148: { title: "Herr, ich will folgen dir", englishSlug: "lord-i-would-follow-thee" },
  149: { title: "Tief in dem Herzen des Hirten", englishSlug: "dear-to-the-heart-of-the-shepherd" },
  150: { title: "Hab ich Gutes am heutigen Tag getan?", englishSlug: "have-i-done-any-good" },
  151: { title: "Ich hab manche Pflicht zu tun", englishSlug: "i-have-work-enough-to-do" },
  152: { title: "Auf, denn die Nacht wird kommen", englishSlug: "work-for-the-night-is-coming" },
  153: { title: "Alle Wege machst du schön", englishSlug: "each-life-that-touches-ours-for-good" },
  154: { title: "Noch heut, wenn die Sonne strahlet", englishSlug: "today-while-the-sun-shines" },
  155: { title: "Eine Sonne mir im Herzen scheint", englishSlug: "there-is-sunshine-in-my-soul-today" },
  156: { title: "Preist Gott, von dem all Segen fließt", englishSlug: "praise-god-from-whom-all-blessings-flow" },
  157: { title: "Tu, was ist recht!", englishSlug: "do-what-is-right" },
  158: { title: "Wähle recht!", englishSlug: "choose-the-right" },
  159: { title: "O wisse, jede Seel ist frei", englishSlug: "know-this-that-every-soul-is-free" },
  160: { title: "Sieh den Segen!", englishSlug: "count-your-blessings" },
  161: { title: "Gehet tapfer vorwärts", englishSlug: "let-us-all-press-on" },
  162: { title: "Vorwärts, Christi Jünger", englishSlug: "onward-christian-soldiers" },
  163: { title: "Auserwählt zu dienen", englishSlug: "called-to-serve" },
  164: { title: "Wir sind Kinder Gottes", englishSlug: "i-am-a-child-of-god" },
  165: { title: "Stemmt die Schulter an das Rad", englishSlug: "put-your-shoulder-to-the-wheel" },
  166: { title: "Treu in dem Glauben", englishSlug: "true-to-the-faith" },
  167: { title: "Geh voran!", englishSlug: "carry-on" },
  168: { title: "O du Held des wahren Glaubens", englishSlug: "the-iron-rod" },
  169: { title: "Du halfst uns, Herr, in frührer Zeit", englishSlug: "o-god-our-help-in-ages-past" },
  170: { title: "Hoffnung Israels", englishSlug: "hope-of-israel" },
  171: { title: "Gott wirket oft geheimnisvoll", englishSlug: "god-moves-in-a-mysterious-way" },
  172: { title: "Denke dir den Lauf der Welten", englishSlug: "if-you-could-hie-to-kolob" },
  173: { title: "Geht hin in alle Welt", englishSlug: "go-ye-into-all-the-world" },
  174: { title: "Sehet, ihr Völker!", englishSlug: "ye-elders-of-israel" },
  175: { title: "Hilf mir, inspiriert zu lehren", englishSlug: "help-me-teach-with-inspiration" },
  176: { title: "Die Zeit ist nur kurz", englishSlug: "the-time-is-far-spent" },
  177: { title: "Wir lieben, Herr, dein Haus", englishSlug: "we-love-thy-house-o-god" },
  178: { title: "Jehova, unser Herr und Gott", englishSlug: "the-lord-is-my-light" },
  179: { title: "Wie groß ist dein Werk", englishSlug: "how-great-thou-art" },
  180: { title: "Ich gehe, wohin du mich heißt", englishSlug: "ill-go-where-you-want-me-to-go" },
  181: { title: "Die eiserne Stange", englishSlug: "the-iron-rod" },
  182: { title: "Wenn ich lese in den Schriften", englishSlug: "as-i-search-the-holy-scriptures" },
  183: { title: "O heilige Wahrheit", englishSlug: "o-say-what-is-truth" },
  184: { title: "Wahrheit strahlt im Herzen wider", englishSlug: "truth-reflects-upon-our-senses" },
  185: { title: "O ringe um Wahrheit", englishSlug: "o-say-what-is-truth" },
  186: { title: "Das Licht des Evangeliums", englishSlug: "the-light-divine" },
  187: { title: "Sei willkommen, Sonntagmorgen", englishSlug: "welcome-welcome-sabbath-morning" },
  188: { title: "O Tag des Herrn, wir singen dir", englishSlug: "o-sabbath-rest-of-galilee" },
  189: { title: "O strahlender Morgen", englishSlug: "the-morning-breaks" },
  190: { title: "O mein Vater", englishSlug: "o-my-father" },
  191: { title: "Heilge, kommt zum Tempel", englishSlug: "come-ye-disconsolate" },
  192: { title: "Irgendwo scheint die Sonne", englishSlug: "there-is-sunshine-in-my-soul-today" },
  193: { title: "Wenn uns ein Mensch zum Guten lenkt", englishSlug: "each-life-that-touches-ours-for-good" },
  194: { title: "So jemand spricht, ich liebe Gott", englishSlug: "a-key-was-turned-in-latter-days" },
  195: { title: "O Liebe, die den Sohn uns schenkt", englishSlug: "god-loved-us-so-he-sent-his-son" },
  196: { title: "Laßt uns dem Nächsten unsre Liebe erweisen", englishSlug: "love-one-another" },
  197: { title: "Wir spüren deine Liebe heut", englishSlug: "love-at-home" },
  198: { title: "Wo die Liebe wohnt", englishSlug: "love-at-home" },
  199: { title: "Wenn zu Hause Liebe herrscht", englishSlug: "home-can-be-a-heaven-on-earth" },

  // Kinderlieder (Children's Songs)
  200: { title: "Liebet einander", englishSlug: "love-one-another" },
  201: { title: "Immer und ewig vereint", englishSlug: "families-can-be-together-forever" },
  202: { title: "Ich bin ein Kind von Gott", englishSlug: "i-am-a-child-of-god" },
  203: { title: "Ich weiß, mein Vater lebt", englishSlug: "i-know-my-father-lives" },
  204: { title: "Gottes Gebote will ich befolgen", englishSlug: "keep-the-commandments" },
  205: { title: "Lehr mich, zu wandeln im göttlichen Licht", englishSlug: "teach-me-to-walk-in-the-light" },
  206: { title: "Das Licht des Herrn", englishSlug: "the-light-divine" },

  // Frauenstimmen (Women's Voices)
  207: { title: "Als Schwestern in Zion", englishSlug: "as-sisters-in-zion" },

  // Männerstimmen (Men's Voices)
  208: { title: "Das Volk des Herrn", englishSlug: "ye-elders-of-israel" },
  209: { title: "Ihr Ältesten Israels", englishSlug: "ye-elders-of-israel" },
  210: { title: "Das heilge Priestertum", englishSlug: "rise-up-o-men-of-god" },

  // Sabbat und Wochentag (New Hymns - Sabbath and Weekday)
  1001: { title: "Komm, du Quelle jedes Segens", englishSlug: "come-thou-fount-of-every-blessing" },
  1002: { title: "Wenn der Heiland wiederkehrt", englishSlug: "when-he-comes-again" },
  1003: { title: "Meine Seel findet Ruhe im Herrn", englishSlug: "it-is-well-with-my-soul" },
  1004: { title: "Auf dem Weg mit Jesus", englishSlug: "where-can-i-turn-for-peace" },
  1005: { title: "Er wacht auch über mich", englishSlug: "his-eye-is-on-the-sparrow" },
  1006: { title: "Denke an ein Lied", englishSlug: "think-a-sacred-song" },
  1007: { title: "Wenn still das Brot nun gebrochen wird", englishSlug: "as-the-shadows-fall" },
  1008: { title: "Lebensbrot, Quell des Lebens", englishSlug: "bread-of-life-living-water" },
  1009: { title: "Getsemani", englishSlug: "gethsemane" },
  1010: { title: "Die Gnade sein", englishSlug: "amazing-grace" },
  1011: { title: "Weltweit Hand in Hand", englishSlug: "hand-in-hand-around-the-world" },
  1012: { title: "Jederzeit, überall", englishSlug: "anytime-anywhere" },
  1013: { title: "Tag für Tag", englishSlug: "day-by-day" },
  1014: { title: "Du, Herr, bist mein geliebter Hirt", englishSlug: "the-lord-is-my-shepherd" },
  1015: { title: "O wie tief die Liebe Jesu", englishSlug: "o-the-deep-deep-love-of-jesus" },
  1016: { title: "Die Nägelmale Jesu seht", englishSlug: "his-hands" },
  1017: { title: "Es ist der Herr", englishSlug: "it-is-well-with-my-soul" },
  1018: { title: "Komm, Herr Jesus", englishSlug: "come-lord-jesus" },
  1019: { title: "Hilf mir, zu lieben, Herr, wie du", englishSlug: "help-me-teach-with-inspiration" },
  1020: { title: "Gütig und liebevoll ruft uns der Heiland", englishSlug: "his-gentle-voice" },
  1021: { title: "Ich weiß, dass mein Heiland mich liebt", englishSlug: "i-know-that-my-savior-loves-me" },
  1022: { title: "Mit jedem Schritt im Glauben", englishSlug: "with-faith-in-every-footstep" },
  1023: { title: "Standhaft baue ich auf Gottes Wort", englishSlug: "how-firm-a-foundation" },
  1024: { title: "Jesus lebt", englishSlug: "i-know-that-my-redeemer-lives" },
  1025: { title: "Nimm mein Herz, ich weih es dir", englishSlug: "take-my-heart" },
  1026: { title: "Heilige Stätten", englishSlug: "holy-places" },
  1027: { title: "Willkommen zuhaus", englishSlug: "welcome-home" },
  1028: { title: "Mein kleines Licht scheint hell", englishSlug: "this-little-light-of-mine" },
  1029: { title: "Unzählige Gaben", englishSlug: "count-your-blessings" },
  1030: { title: "Nur ein Gebet entfernt", englishSlug: "only-a-prayer-away" },
  1031: { title: "O kommt und hört das Wort des Heilands", englishSlug: "come-listen-to-a-prophets-voice" },

  // Ostern und Weihnachten (New Hymns - Easter and Christmas)
  1201: { title: "Preist den Herrn, der auferstand", englishSlug: "christ-the-lord-is-risen-today" },
  1202: { title: "Christus ist geboren heut", englishSlug: "the-first-noel" },
  1203: { title: "Wen wiegt Maria sanft im Arm?", englishSlug: "away-in-a-manger" },
  1204: { title: "Weihnachten im verheißenen Land", englishSlug: "far-far-away-on-judeas-plains" },
  1205: { title: "Das Osterlied erschall!", englishSlug: "he-is-risen" },
  1206: { title: "Warst du da, als sie kreuzigten den Herrn?", englishSlug: "were-you-there" }
};

// Get the German hymn title by number
export const getGermanHymnTitle = (number: number): string => {
  return GERMAN_HYMNS[number]?.title || '';
};

// Get the English slug for URL generation
export const getGermanHymnEnglishSlug = (number: number): string => {
  return GERMAN_HYMNS[number]?.englishSlug || '';
};

// Check if a hymn number is valid in the German hymnal
export const isValidGermanHymnNumber = (number: number): boolean => {
  return number in GERMAN_HYMNS;
};

// Generate URL for German hymn (uses English slug with ?lang=deu)
export const getGermanHymnUrl = (number: number): string => {
  const hymn = GERMAN_HYMNS[number];
  if (!hymn) return '';

  const slug = hymn.englishSlug;

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  // Mobile devices: use study/manual format (opens in Gospel Library App)
  if (isMobile) {
    return `https://www.churchofjesuschrist.org/study/manual/hymns/${slug}?lang=deu`;
  }

  // Desktop/Web: use media/music/songs format
  return `https://www.churchofjesuschrist.org/media/music/songs/${slug}?crumbs=hymns&lang=deu`;
};

// Search German hymns by title
export const searchGermanHymnByTitle = (searchTerm: string): Array<{number: number, title: string}> => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase().trim();
  const results: Array<{number: number, title: string}> = [];

  // Search through all German hymns
  Object.entries(GERMAN_HYMNS).forEach(([number, hymn]) => {
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
