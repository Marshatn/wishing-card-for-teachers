export interface PresentTheme {
  id: string;
  name: string;
  boxColor: number; // Hex number for Three.js
  boxColorCss: string;
  lidColor: number;
  lidColorCss: string;
  ribbonColor: number;
  ribbonColorCss: string;
  ambientLight: number;
  accentHex: string;
  accentText: string;
  cardBg: string;
  cardBorder: string;
}

export const PRESENT_THEMES: PresentTheme[] = [
  {
    id: 'emerald-gold',
    name: 'Emerald & Gold',
    boxColor: 0x064e3b, // Deep rich emerald
    boxColorCss: '#064e3b',
    lidColor: 0x047857,
    lidColorCss: '#047857',
    ribbonColor: 0xf59e0b, // Warm gold
    ribbonColorCss: '#f59e0b',
    ambientLight: 0xfff7ed,
    accentHex: '#f59e0b',
    accentText: 'text-amber-400',
    cardBg: 'bg-emerald-950/90 border-amber-400/40',
    cardBorder: 'border-amber-400/50',
  },
  {
    id: 'sapphire-silver',
    name: 'Sapphire & Champagne',
    boxColor: 0x1e3a8a, // Rich royal sapphire
    boxColorCss: '#1e3a8a',
    lidColor: 0x2563eb,
    lidColorCss: '#2563eb',
    ribbonColor: 0xfbbf24,
    ribbonColorCss: '#fbbf24',
    ambientLight: 0xeff6ff,
    accentHex: '#38bdf8',
    accentText: 'text-sky-300',
    cardBg: 'bg-slate-900/90 border-sky-400/40',
    cardBorder: 'border-sky-400/50',
  },
  {
    id: 'ruby-rose',
    name: 'Ruby & Rose Gold',
    boxColor: 0x881337, // Rich velvet ruby
    boxColorCss: '#881337',
    lidColor: 0xbe123c,
    lidColorCss: '#be123c',
    ribbonColor: 0xf43f5e,
    ribbonColorCss: '#f43f5e',
    ambientLight: 0xfff1f2,
    accentHex: '#fb7185',
    accentText: 'text-rose-400',
    cardBg: 'bg-rose-950/90 border-rose-400/40',
    cardBorder: 'border-rose-400/50',
  },
  {
    id: 'midnight-violet',
    name: 'Midnight & Gold',
    boxColor: 0x4c1d95, // Deep royal purple
    boxColorCss: '#4c1d95',
    lidColor: 0x6d28d9,
    lidColorCss: '#6d28d9',
    ribbonColor: 0xfacc15,
    ribbonColorCss: '#facc15',
    ambientLight: 0xfaf5ff,
    accentHex: '#c084fc',
    accentText: 'text-purple-300',
    cardBg: 'bg-purple-950/90 border-amber-300/40',
    cardBorder: 'border-purple-400/50',
  },
  {
    id: 'chalkboard-classic',
    name: 'Classroom Slate & Crimson',
    boxColor: 0x1c1917, // Slate stone
    boxColorCss: '#1c1917',
    lidColor: 0x292524,
    lidColorCss: '#292524',
    ribbonColor: 0xe11d48, // Crimson bow
    ribbonColorCss: '#e11d48',
    ambientLight: 0xffffff,
    accentHex: '#f43f5e',
    accentText: 'text-rose-400',
    cardBg: 'bg-stone-900/95 border-rose-500/40',
    cardBorder: 'border-stone-600',
  }
];

export interface FarewellSongOption {
  id: string;
  title: string;
  artistDesc: string;
  badge: string;
  description: string;
}

export const FAREWELL_SONGS: FarewellSongOption[] = [
  {
    id: 'auld-lang-syne',
    title: 'Auld Lang Syne',
    artistDesc: 'Traditional Scottish Air · Robert Burns',
    badge: 'Best Farewell Anthem ⭐',
    description: 'The universally recognized, most touching farewell melody in history. Reminiscent of cherished memories and timeless friendships.',
  },
  {
    id: 'to-sir-with-love',
    title: 'To Sir With Love',
    artistDesc: 'Classic Teacher Dedication Anthem',
    badge: 'Teacher Favorite 🍎',
    description: 'A deeply emotional tribute from students thanking a beloved mentor who helped them grow into who they are today.',
  },
  {
    id: 'pomp-circumstance',
    title: 'Pomp & Circumstance (Farewell March)',
    artistDesc: 'Sir Edward Elgar · Graduation Classic',
    badge: 'Triumphant & Grand 🎓',
    description: 'Celebrates their noble journey, honoring years of dedication with majestic celebratory pride.',
  },
];

export interface TeacherCardData {
  recipientTitle: string; // e.g., "To Our Beloved Teacher & Guide"
  teacherName: string; // e.g., "Mrs. Anderson"
  mainHeading: string; // "Farewell & Thank You, Teacher!"
  farewellMessage: string;
  signOff: string;
  senderGroup: string; // e.g., "SJK (C) Chung Hwa Kota Belud 🎓"
  studentSignatures: string[];
  themeId: string;
  selectedSongId: string;
  farewellType: string; // 'General Farewell' | 'Retirement' | 'New Journey' | 'Graduation Farewell'
}

export const XCC5305_BESTWISHES_CARD: TeacherCardData = {
  recipientTitle: 'To Our Beloved Teachers',
  teacherName: 'Mr Eric Chung & Ms Eily Gracesee',
  mainHeading: 'Farewell & Thank You, Teacher!',
  farewellMessage:
    'A truly great teacher is impossible to forget —\nespecially one who can turn chaos into learning\nand Monday blues into “Okay lah, can survive.”\n\nMay your new school bless you with students who bring their books,\ncolleagues who don’t permanently “borrow” your pen,\na snack corner that never runs out,\nmeetings that end before your coffee gets cold,\nand WiFi strong enough for YouTube.\n\nWe’ll miss your jokes, teamwork,\nand those teacher superpowers that fix everything\neven when nothing is working.\n\nGo shine in your new school —\nbut don’t forget us… we still need someone\nto complain about WiFi problems with.',
  signOff: 'With deepest gratitude ',
  senderGroup: 'SJK (C) Chung Hwa Kota Belud 🎓',
  studentSignatures: [
    'Amos',
    'Alve',
    'Brian',
    'Chia',
    'Evolyn',
    'Mui Len',
    'Delan',
    'Dorin',
    'Eudora',
    'Fanny',
    'Fenny',
    'Fiona',
    'Jackryson',
    'Fedora',
    'Jackson',
    'Jacqueline',
    'Jamuel',
    'Jennifer',
    'Joyce',
    'Chen Ching',
    'Masnika',
    'Mell',
    'Khai',
    'Yen',
    'Ashikin',
    'Azah',
    'Kelvin',
    'Patrick',
    'Jessica',
    'SIew Nah',
    'Victorry',
    'Fui Han',
    'Mung Ping',
  ],
  themeId: 'emerald-gold',
  selectedSongId: 'auld-lang-syne',
  farewellType: 'New Journey',
};

export const DEFAULT_CARD_DATA: TeacherCardData = XCC5305_BESTWISHES_CARD;

export const MESSAGE_PRESETS: { title: string; subtitle: string; text: string }[] = [
  {
    title: 'Mr Eric & Ms Eily Special (Kota Belud)',
    subtitle: 'Witty, Warm & Heartfelt Farewell',
    text:
      'A truly great teacher is impossible to forget —\nespecially one who can turn chaos into learning\nand Monday blues into “Okay lah, can survive.”\n\nMay your new school bless you with students who bring their books,\ncolleagues who don’t permanently “borrow” your pen,\na snack corner that never runs out,\nmeetings that end before your coffee gets cold,\nand WiFi strong enough for YouTube.\n\nWe’ll miss your jokes, teamwork,\nand those teacher superpowers that fix everything\neven when nothing is working.\n\nGo shine in your new school —\nbut don’t forget us… we still need someone\nto complain about WiFi problems with.',
  },
  {
    title: 'Heartfelt Legacy & Gratitude',
    subtitle: 'Classic Teacher Farewell',
    text:
      'A truly great teacher is impossible to forget. Thank you for igniting our curiosity, believing in us when we doubted ourselves, and filling our classroom with wisdom, warmth, and laughter. Though your journey takes you to new horizons, your inspiring lessons and kindness will forever live in our hearts. Wishing you endless joy, fulfillment, and happiness in your next chapter!',
  },
  {
    title: 'Happy Retirement Celebration',
    subtitle: 'Celebrating Years of Dedication',
    text:
      'Congratulations on a legendary career! You have touched countless lives, nurtured generations of dreamers, and left an indelible mark on our school. May your retirement be filled with peaceful mornings, cherished adventures, and all the relaxation you so richly deserve!',
  },
  {
    title: 'New School / New Horizon Adventure',
    subtitle: 'Wishing Success on the Next Stop',
    text:
      'Our school won’t be the same without your bright smile and endless patience, but your next students are the luckiest in the world! Thank you for being our anchor and our inspiration. We wish you soaring success and grand happiness in your new journey!',
  },
  {
    title: 'Short, Poetic & Everlasting',
    subtitle: 'Timeless Farewell Sentiment',
    text:
      '“A teacher affects eternity; they can never tell where their influence stops.” Thank you for guiding our minds and touching our hearts. Farewell, dear teacher—you will be deeply missed!',
  },
];
