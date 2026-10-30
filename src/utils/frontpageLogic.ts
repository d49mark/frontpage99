import {
  AnimatedStickerId,
  BillboardSlot,
  CategoryOption,
  CityConfig,
  CityId,
  HeadlineFontMood,
  PosterData,
  StickerTint,
  ThemePreset,
  ThemePresetId,
  VectorIconId,
} from '../types/frontpage';

export const CANONICAL_TODAY_ISO = '2026-10-27';
export const CANONICAL_TOMORROW_ISO = '2026-10-28';

// Comprehensive built-in list of 220+ Indian cities & common aliases so validation never fails offline
export const BUILTIN_INDIAN_CITIES: string[] = [
  'bengaluru',
  'bangalore',
  'mumbai',
  'bombay',
  'delhi',
  'new-delhi',
  'delhi-ncr',
  'ncr',
  'hyderabad',
  'pune',
  'jaipur',
  'indore',
  'chennai',
  'madras',
  'kolkata',
  'calcutta',
  'ahmedabad',
  'surat',
  'lucknow',
  'kanpur',
  'nagpur',
  'visakhapatnam',
  'vizag',
  'bhopal',
  'patna',
  'vadodara',
  'baroda',
  'ghaziabad',
  'ludhiana',
  'agra',
  'nashik',
  'faridabad',
  'meerut',
  'rajkot',
  'kalyan',
  'vasai-virar',
  'varanasi',
  'banaras',
  'kashi',
  'srinagar',
  'aurangabad',
  'chhatrapati-sambhajinagar',
  'dhanbad',
  'amritsar',
  'navi-mumbai',
  'allahabad',
  'prayagraj',
  'ranchi',
  'howrah',
  'coimbatore',
  'jabalpur',
  'gwalior',
  'vijayawada',
  'jodhpur',
  'madurai',
  'raipur',
  'kota',
  'guwahati',
  'chandigarh',
  'solapur',
  'hubballi',
  'dharwad',
  'hubli',
  'bareilly',
  'moradabad',
  'mysuru',
  'mysore',
  'gurgaon',
  'gurugram',
  'aligarh',
  'jalandhar',
  'tiruchirappalli',
  'trichy',
  'bhubaneswar',
  'salem',
  'warangal',
  'mira-bhayandar',
  'thiruvananthapuram',
  'trivandrum',
  'bhiwandi',
  'saharanpur',
  'gorakhpur',
  'guntur',
  'bikaner',
  'amravati',
  'noida',
  'greater-noida',
  'jamshedpur',
  'bhilai',
  'cuttack',
  'firozabad',
  'kochi',
  'cochin',
  'nellore',
  'bhavnagar',
  'dehradun',
  'durgapur',
  'asansol',
  'rourkela',
  'nanded',
  'kolhapur',
  'ajmer',
  'akola',
  'gulbarga',
  'kalaburagi',
  'jamnagar',
  'ujjain',
  'loni',
  'siliguri',
  'jhansi',
  'ulhasnagar',
  'jammu',
  'sangli',
  'mangaluru',
  'mangalore',
  'erode',
  'belagavi',
  'belgaum',
  'ambattur',
  'tirunelveli',
  'malegaon',
  'gaya',
  'jalgaon',
  'udaipur',
  'maheshtala',
  'davanagere',
  'kozhikode',
  'calicut',
  'kurnool',
  'rajpur-sonarpur',
  'rajahmundry',
  'bokaro',
  'south-dumdum',
  'bellary',
  'ballari',
  'patiala',
  'gopalpur',
  'agartala',
  'bhagalpur',
  'muzaffarnagar',
  'bhatpara',
  'panihati',
  'latur',
  'dhule',
  'rohtak',
  'korba',
  'bhilwara',
  'berhampur',
  'muzaffarpur',
  'ahmednagar',
  'mathura',
  'kollam',
  'avadi',
  'kadapa',
  'kamarhati',
  'sambalpur',
  'bilaspur',
  'shahjahanpur',
  'satara',
  'bijapur',
  'vijayapura',
  'rampur',
  'shivamogga',
  'shimoga',
  'chandrapur',
  'junagadh',
  'thrissur',
  'alwar',
  'bardhaman',
  'kulti',
  'kakinada',
  'nizamabad',
  'parbhani',
  'tumakuru',
  'tumkur',
  'khammam',
  'ozhukarai',
  'bihar-sharif',
  'panipat',
  'darbhanga',
  'bally',
  'aizawl',
  'dewas',
  'ichalkaranji',
  'karnal',
  'bathinda',
  'jalna',
  'eluru',
  'kirari-suleman-nagar',
  'barasat',
  'purnia',
  'satna',
  'mau',
  'sonipat',
  'farrukhabad',
  'sagar',
  'rourkela',
  'durg',
  'imphal',
  'ratlam',
  'hapur',
  'arrah',
  'karimnagar',
  'anantapur',
  'etawah',
  'ambernath',
  'bharatpur',
  'begusarai',
  'new-delhi',
  'gandhidham',
  'baranagar',
  'tiruvottiyur',
  'pondicherry',
  'puducherry',
  'sikar',
  'thoothukudi',
  'tuticorin',
  'rewa',
  'mirzapur',
  'raichur',
  'pali',
  'ramagundam',
  'haridwar',
  'vijayanagaram',
  'katihar',
  'nagercoil',
  'sri-ganganagar',
  'karawal-nagar',
  'mango',
  'thanjavur',
  'bulandshahr',
  'uluberia',
  'murwara',
  'sambhal',
  'singrauli',
  'nadiad',
  'secunderabad',
  'naihati',
  'yamunanagar',
  'bidhannagar',
  'pallavaram',
  'bidar',
  'munger',
  'panchkula',
  'burhanpur',
  'raurkela',
  'kharagpur',
  'dindigul',
  'gandhinagar',
  'hospet',
  'hosapete',
  'nangloi-jat',
  'malda',
  'ongole',
  'deoghar',
  'chapra',
  'haldia',
  'khandwa',
  'nandyal',
  'morena',
  'amroha',
  'anand',
  'bhind',
  'bhalswa-jahangir-pur',
  'madhyamgram',
  'bhiwani',
  'berhampore',
  'ambala',
  'morbi',
  'fatehpur',
  'raebareli',
  'khora',
  'chittoor',
  'bhusawal',
  'orai',
  'bahraich',
  'phusro',
  'vellore',
  'mehsaana',
  'raiganj',
  'sirsa',
  'danapur',
  'serampore',
  'sultan-pur-majra',
  'guna',
  'jaunpur',
  'panvel',
  'shivpuri',
  'surendranagar',
  'unnao',
  'chinsurah',
  'alappuzha',
  'alleppey',
  'kottayam',
  'shimla',
  'shillong',
  'gangtok',
  'panaji',
  'goa',
  'margao',
  'vasco-da-gama',
  'itanagar',
  'kohima',
  'dimapur',
  'silchar',
  'dibrugarh',
  'tezpur',
  'jorhat',
  'tinsukia',
  'darjeeling',
  'kalimpong',
  'kurseong',
  'puri',
  'konark',
  'balasore',
  'sambalpur',
  'jharsuguda',
  'manipal',
  'udupi',
  'hassan',
  'mandya',
  'chikmagalur',
  'chikkamagaluru',
  'madikeri',
  'coorg',
  'ooty',
  'udhagamandalam',
  'kodaikanal',
  'hosur',
  'kanchipuram',
  'mahabalipuram',
  'tirupati',
  'nellore',
  'kakinada',
  'machilipatnam',
  'munnar',
  'wayanad',
  'kannur',
  'palakkad',
  'malappuram',
  'kasaragod',
  'lonavala',
  'mahabaleshwar',
  'shirdi',
  'ratnagiri',
  'sindhudurg',
  'wardha',
  'yavatmal',
  'chandrapur',
  'gondia',
  'bhandara',
  'vapi',
  'valsad',
  'navsari',
  'bharuch',
  'ankleshwar',
  'patan',
  'palanpur',
  'porbandar',
  'dwarka',
  'somnath',
  'bhuj',
  'kutch',
  'jaisalmer',
  'pushkar',
  'kishangarh',
  'mount-abu',
  'chittorgarh',
  'bharatpur',
  'ranthambore',
  'sawai-madhopur',
  'rishikesh',
  'mussoorie',
  'nainital',
  'haldwani',
  'roorkee',
  'rudrapur',
  'kashipur',
  'almora',
  'pithoragarh',
  'manali',
  'kullu',
  'dharamshala',
  'dalhousie',
  'solan',
  'mandi',
  'baddi',
  'hamirpur',
  'una',
  'pathankot',
  'hoshiarpur',
  'mohali',
  'zirakpur',
  'kapurthala',
  'moga',
  'barnala',
  'sangrur',
  'firozpur',
  'fazilka',
  'kurukshetra',
  'ambala',
  'hisar',
  'rewari',
  'palwal',
  'bahadurgarh',
  'jind',
  'kaithal',
  'thanesar',
  'leh',
  'ladakh',
  'kargil',
  'anantnag',
  'baramulla',
  'udham-pur',
  'katra',
  'port-blair',
  'daman',
  'diu',
  'silvassa',
  'kavaratti',
];

const CITY_ALIAS_MAP: Record<string, string> = {
  bangalore: 'bengaluru',
  blr: 'bengaluru',
  bombay: 'mumbai',
  bom: 'mumbai',
  'new-delhi': 'delhi',
  'delhi-ncr': 'delhi',
  ncr: 'delhi',
  del: 'delhi',
  hyd: 'hyderabad',
  pnq: 'pune',
  jai: 'jaipur',
  madras: 'chennai',
  calcutta: 'kolkata',
  gurgaon: 'gurugram',
  mysore: 'mysuru',
  cochin: 'kochi',
  trivandrum: 'thiruvananthapuram',
  banaras: 'varanasi',
  vizag: 'visakhapatnam',
  baroda: 'vadodara',
  mangalore: 'mangaluru',
  belgaum: 'belagavi',
  calicut: 'kozhikode',
  trichy: 'tiruchirappalli',
  pondicherry: 'puducherry',
};

export function normalizeCitySlug(rawPathOrCity: string): string {
  const cleaned = rawPathOrCity
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  if (!cleaned) return 'bengaluru';
  return CITY_ALIAS_MAP[cleaned] || cleaned;
}

export function formatCityDisplayName(slug: string): string {
  const normalized = normalizeCitySlug(slug);
  if (normalized === 'delhi') return 'Delhi-NCR';
  return normalized
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function isValidIndianCitySlug(
  rawSlug: string,
  extraApiCities?: Set<string>
): boolean {
  const cleaned = rawSlug
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-');

  if (!cleaned) return true; // Root '/' defaults to bengaluru
  if (CITY_ALIAS_MAP[cleaned]) return true;
  if (BUILTIN_INDIAN_CITIES.includes(cleaned)) return true;
  const normalized = normalizeCitySlug(cleaned);
  if (BUILTIN_INDIAN_CITIES.includes(normalized)) return true;
  if (extraApiCities && (extraApiCities.has(cleaned) || extraApiCities.has(normalized))) {
    return true;
  }
  return false;
}

export const CITIES: CityConfig[] = [
  {
    id: 'bengaluru',
    slug: 'bengaluru',
    name: 'Bengaluru',
    shortCode: 'blr',
    editionStamp: 'BENGALURU EDITION',
    baseViews: 7156,
    baseClaims: 142,
    weatherAqi: '24°C Pleasant Breeze · AQI 58 (Satisfactory)',
    communityTip: 'Bengaluru Tip: Avoid 5 PM traffic on ORR by taking the metro.',
    cityTips: [
      'Bengaluru Tip: Avoid 5 PM traffic on ORR by taking the metro.',
      'Bengaluru Tip: Early morning filter kaapi at CTR Malleshwaram has the shortest queue before 7:45 AM.',
      'Bengaluru Tip: Cubbon Park is completely vehicle-free every Sunday — enter via Kasturba Road gate.',
    ],
    landmarkExample: '100 Feet Rd, Indiranagar (Near Sony World Signal)',
  },
  {
    id: 'mumbai',
    slug: 'mumbai',
    name: 'Mumbai',
    shortCode: 'bom',
    editionStamp: 'MUMBAI EDITION',
    baseViews: 8420,
    baseClaims: 196,
    weatherAqi: '31°C Coastal Humid · AQI 84 (Moderate)',
    communityTip:
      'Mumbai Tip: Best vada pav is at Kirti College signal after 4 PM.',
    cityTips: [
      'Mumbai Tip: Best vada pav is at Kirti College signal after 4 PM.',
      'Mumbai Tip: Take the Coastal Road southbound tunnel to skip evening Worli Sea Face bottlenecks.',
      'Mumbai Tip: Catch the 6:15 PM sunset breeze along Carter Road Promenade before peak dinner rush.',
    ],
    landmarkExample: 'Hill Road, Bandra West (Opp. Mehboob Studio)',
  },
  {
    id: 'delhi',
    slug: 'delhi',
    name: 'Delhi-NCR',
    shortCode: 'del',
    editionStamp: 'DELHI-NCR EDITION',
    baseViews: 6890,
    baseClaims: 164,
    weatherAqi: '28°C Crisp Autumn Sun · AQI 162 (Moderate)',
    communityTip:
      'Delhi Tip: Try the lassi at this hidden gem in Karol Bagh.',
    cityTips: [
      'Delhi Tip: Try the lassi at this hidden gem in Karol Bagh.',
      'Delhi Tip: Use Rajiv Chowk Gate 6 exit for the fastest walk to Inner Circle F-Block cafés.',
      'Delhi Tip: Sunder Nursery weekend farmers market starts at 8:30 AM — arrive early for fresh sourdough.',
    ],
    landmarkExample: 'Khan Market, Middle Lane (Near Bahrisons Booksellers)',
  },
  {
    id: 'hyderabad',
    slug: 'hyderabad',
    name: 'Hyderabad',
    shortCode: 'hyd',
    editionStamp: 'HYDERABAD EDITION',
    baseViews: 5190,
    baseClaims: 118,
    weatherAqi: '29°C Clear Skies · AQI 64 (Satisfactory)',
    communityTip:
      'Hyderabad Tip: Beat HITEC City evening rush by taking the Raidurg Metro skywalk before 5:30 PM.',
    cityTips: [
      'Hyderabad Tip: Beat HITEC City evening rush by taking the Raidurg Metro skywalk before 5:30 PM.',
      'Hyderabad Tip: Irani chai and Osmania biscuits at Nimrah Café are best enjoyed right at 6:30 AM.',
      'Hyderabad Tip: KBR Park outer walkway is lit till 8:30 PM for evening runners.',
    ],
    landmarkExample: 'Road No. 36, Jubilee Hills (Near Peddamma Temple Metro)',
  },
  {
    id: 'pune',
    slug: 'pune',
    name: 'Pune',
    shortCode: 'pnq',
    editionStamp: 'PUNE EDITION',
    baseViews: 4345,
    baseClaims: 94,
    weatherAqi: '26°C Cool Evening · AQI 52 (Good)',
    communityTip:
      'Pune Tip: Take the Aqua Line Metro from Deccan Gymkhana to Ruby Hall to skip JM Road peak traffic.',
    cityTips: [
      'Pune Tip: Take the Aqua Line Metro from Deccan Gymkhana to Ruby Hall to skip JM Road peak traffic.',
      'Pune Tip: Fresh Shrewsbury biscuits at Kayani Bakery in Camp sell out by 4:30 PM — go early.',
      'Pune Tip: Koregaon Park Lane 7 pedestrian hours make evening café hopping effortless.',
    ],
    landmarkExample: 'Lane 7, Koregaon Park (Next to German Bakery)',
  },
  {
    id: 'jaipur',
    slug: 'jaipur',
    name: 'Jaipur',
    shortCode: 'jai',
    editionStamp: 'JAIPUR EDITION',
    baseViews: 3480,
    baseClaims: 76,
    weatherAqi: '30°C Golden Sun · AQI 76 (Satisfactory)',
    communityTip:
      'Jaipur Tip: Catch the morning kullad chai at Tapri Central overlooking Central Park before 8:30 AM.',
    cityTips: [
      'Jaipur Tip: Catch the morning kullad chai at Tapri Central overlooking Central Park before 8:30 AM.',
      'Jaipur Tip: Use the underground Badi Chaupar Metro to visit Hawa Mahal without parking hassles.',
      'Jaipur Tip: Best hot pyaz kachori at Rawat Mishthan Bhandar comes out fresh at 9:00 AM.',
    ],
    landmarkExample: 'C-Scheme, Ashok Nagar (Near Statue Circle)',
  },
];

export const CATEGORIES: CategoryOption[] = [
  '☕ CAFÉ & DINING',
  '💪 FITNESS & GYM',
  '✂️ SALON & SPA',
  '📚 COACHING',
  '⚡ TECH LAUNCH',
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'newspaper-bw',
    name: 'Stark Newspaper Black/White',
    shortLabel: 'Newspaper',
    bgClass: 'bg-[#111111]',
    textClass: 'text-[#FAFAFA]',
    subtextClass: 'text-[#D4D4D8]',
    borderClass: 'border-[#3F3F46]',
    kickerClass: 'text-[#E4E4E7]',
    ctaBgClass: 'bg-[#FAFAFA] hover:bg-[#E4E4E7]',
    ctaTextClass: 'text-[#111111]',
    secondaryBtnClass: 'border-[#52525B] text-[#FAFAFA] hover:bg-white/10',
    canvasBgStart: '#111111',
    canvasBgEnd: '#18181B',
    canvasTextPrimary: '#FAFAFA',
    canvasTextSecondary: '#D4D4D8',
    canvasAccentBg: '#FAFAFA',
    canvasAccentText: '#111111',
    canvasBorderHex: '#52525B',
  },
  {
    id: 'editorial-cream',
    name: 'Editorial Cream',
    shortLabel: 'Cream',
    bgClass: 'bg-[#F6F1E7]',
    textClass: 'text-[#1C1917]',
    subtextClass: 'text-[#44403C]',
    borderClass: 'border-[#D6CEBE]',
    kickerClass: 'text-[#78350F]',
    ctaBgClass: 'bg-[#1C1917] hover:bg-[#292524]',
    ctaTextClass: 'text-[#FBF9F5]',
    secondaryBtnClass: 'border-[#A8A29E] text-[#1C1917] hover:bg-stone-200/60',
    canvasBgStart: '#F6F1E7',
    canvasBgEnd: '#EDE5D5',
    canvasTextPrimary: '#1C1917',
    canvasTextSecondary: '#44403C',
    canvasAccentBg: '#1C1917',
    canvasAccentText: '#F6F1E7',
    canvasBorderHex: '#C7B299',
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    shortLabel: 'Sunset',
    bgClass: 'bg-gradient-to-br from-[#7C2D12] via-[#9A3412] to-[#431407]',
    textClass: 'text-[#FFF7ED]',
    subtextClass: 'text-[#FFEDD5]',
    borderClass: 'border-[#C2410C]',
    kickerClass: 'text-[#FDBA74]',
    ctaBgClass: 'bg-[#FFF7ED] hover:bg-[#FFEDD5]',
    ctaTextClass: 'text-[#7C2D12]',
    secondaryBtnClass: 'border-[#FB923C]/50 text-[#FFF7ED] hover:bg-white/10',
    canvasBgStart: '#7C2D12',
    canvasBgEnd: '#431407',
    canvasTextPrimary: '#FFF7ED',
    canvasTextSecondary: '#FED7AA',
    canvasAccentBg: '#FFF7ED',
    canvasAccentText: '#7C2D12',
    canvasBorderHex: '#EA580C',
  },
  {
    id: 'emerald-mint',
    name: 'Emerald Mint',
    shortLabel: 'Emerald',
    bgClass: 'bg-[#064E3B]',
    textClass: 'text-[#ECFDF5]',
    subtextClass: 'text-[#A7F3D0]',
    borderClass: 'border-[#047857]',
    kickerClass: 'text-[#6EE7B7]',
    ctaBgClass: 'bg-[#ECFDF5] hover:bg-[#D1FAE5]',
    ctaTextClass: 'text-[#064E3B]',
    secondaryBtnClass: 'border-[#34D399]/50 text-[#ECFDF5] hover:bg-white/10',
    canvasBgStart: '#064E3B',
    canvasBgEnd: '#022C22',
    canvasTextPrimary: '#ECFDF5',
    canvasTextSecondary: '#A7F3D0',
    canvasAccentBg: '#ECFDF5',
    canvasAccentText: '#064E3B',
    canvasBorderHex: '#10B981',
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    shortLabel: 'Indigo',
    bgClass: 'bg-[#1E1B4B]',
    textClass: 'text-[#EEF2FF]',
    subtextClass: 'text-[#C7D2FE]',
    borderClass: 'border-[#3730A3]',
    kickerClass: 'text-[#A5B4FC]',
    ctaBgClass: 'bg-[#EEF2FF] hover:bg-[#E0E7FF]',
    ctaTextClass: 'text-[#1E1B4B]',
    secondaryBtnClass: 'border-[#818CF8]/50 text-[#EEF2FF] hover:bg-white/10',
    canvasBgStart: '#1E1B4B',
    canvasBgEnd: '#0F172A',
    canvasTextPrimary: '#EEF2FF',
    canvasTextSecondary: '#C7D2FE',
    canvasAccentBg: '#EEF2FF',
    canvasAccentText: '#1E1B4B',
    canvasBorderHex: '#6366F1',
  },
  {
    id: 'cyber-yellow',
    name: 'Cyber Yellow',
    shortLabel: 'Cyber',
    bgClass: 'bg-[#FACC15]',
    textClass: 'text-[#09090B]',
    subtextClass: 'text-[#27272A]',
    borderClass: 'border-[#CA8A04]',
    kickerClass: 'text-[#18181B]',
    ctaBgClass: 'bg-[#09090B] hover:bg-[#27272A]',
    ctaTextClass: 'text-[#FACC15]',
    secondaryBtnClass: 'border-[#18181B]/40 text-[#09090B] hover:bg-black/10',
    canvasBgStart: '#FACC15',
    canvasBgEnd: '#EAB308',
    canvasTextPrimary: '#09090B',
    canvasTextSecondary: '#27272A',
    canvasAccentBg: '#09090B',
    canvasAccentText: '#FACC15',
    canvasBorderHex: '#854D0E',
  },
  {
    id: 'crimson-punch',
    name: 'Crimson Punch',
    shortLabel: 'Crimson',
    bgClass: 'bg-[#7F1D1D]',
    textClass: 'text-[#FEF2F2]',
    subtextClass: 'text-[#FECACA]',
    borderClass: 'border-[#B91C1C]',
    kickerClass: 'text-[#FCA5A5]',
    ctaBgClass: 'bg-[#FEF2F2] hover:bg-[#FEE2E2]',
    ctaTextClass: 'text-[#7F1D1D]',
    secondaryBtnClass: 'border-[#F87171]/50 text-[#FEF2F2] hover:bg-white/10',
    canvasBgStart: '#7F1D1D',
    canvasBgEnd: '#450A0A',
    canvasTextPrimary: '#FEF2F2',
    canvasTextSecondary: '#FECACA',
    canvasAccentBg: '#FEF2F2',
    canvasAccentText: '#7F1D1D',
    canvasBorderHex: '#DC2626',
  },
  {
    id: 'midnight-slate',
    name: 'Midnight Slate',
    shortLabel: 'Slate',
    bgClass: 'bg-[#0F172A]',
    textClass: 'text-[#F8FAFC]',
    subtextClass: 'text-[#CBD5E1]',
    borderClass: 'border-[#334155]',
    kickerClass: 'text-[#94A3B8]',
    ctaBgClass: 'bg-[#F8FAFC] hover:bg-[#E2E8F0]',
    ctaTextClass: 'text-[#0F172A]',
    secondaryBtnClass: 'border-[#475569] text-[#F8FAFC] hover:bg-white/10',
    canvasBgStart: '#0F172A',
    canvasBgEnd: '#020617',
    canvasTextPrimary: '#F8FAFC',
    canvasTextSecondary: '#CBD5E1',
    canvasAccentBg: '#F8FAFC',
    canvasAccentText: '#0F172A',
    canvasBorderHex: '#475569',
  },
  {
    id: 'neon-coral',
    name: 'Neon Coral',
    shortLabel: 'Coral',
    bgClass: 'bg-[#FFF1F2]',
    textClass: 'text-[#881337]',
    subtextClass: 'text-[#9F1239]',
    borderClass: 'border-[#FDA4AF]',
    kickerClass: 'text-[#E11D48]',
    ctaBgClass: 'bg-[#be123c] hover:bg-[#9f1239]',
    ctaTextClass: 'text-[#FFF1F2]',
    secondaryBtnClass: 'border-[#FB7185] text-[#881337] hover:bg-rose-100',
    canvasBgStart: '#FFF1F2',
    canvasBgEnd: '#FFE4E6',
    canvasTextPrimary: '#881337',
    canvasTextSecondary: '#9F1239',
    canvasAccentBg: '#BE123C',
    canvasAccentText: '#FFF1F2',
    canvasBorderHex: '#F43F5E',
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    shortLabel: 'Terracotta',
    bgClass: 'bg-[#431407]',
    textClass: 'text-[#FFEDD5]',
    subtextClass: 'text-[#FDBA74]',
    borderClass: 'border-[#9A3412]',
    kickerClass: 'text-[#FB923C]',
    ctaBgClass: 'bg-[#FFEDD5] hover:bg-[#FED7AA]',
    ctaTextClass: 'text-[#431407]',
    secondaryBtnClass: 'border-[#C2410C] text-[#FFEDD5] hover:bg-white/10',
    canvasBgStart: '#431407',
    canvasBgEnd: '#270B03',
    canvasTextPrimary: '#FFEDD5',
    canvasTextSecondary: '#FDBA74',
    canvasAccentBg: '#FFEDD5',
    canvasAccentText: '#431407',
    canvasBorderHex: '#9A3412',
  },
];

export function getCityById(cityIdOrSlug: CityId): CityConfig {
  const normalized = normalizeCitySlug(cityIdOrSlug);
  const found = CITIES.find(
    (c) => c.id === normalized || c.slug === normalized
  );
  if (found) return found;

  const displayName = formatCityDisplayName(normalized);
  return {
    id: normalized,
    slug: normalized,
    name: displayName,
    shortCode: normalized.slice(0, 3),
    editionStamp: `${displayName.toUpperCase()} EDITION`,
    baseViews: 2640,
    baseClaims: 64,
    weatherAqi: '27°C Clear Skies · AQI 68 (Satisfactory)',
    communityTip: `${displayName} Tip: Support neighbourhood cafés and independent stores on ${displayName}'s daily digital front page.`,
    cityTips: [
      `${displayName} Tip: Beat the evening bazaar rush by visiting the main market before 5:00 PM.`,
      `${displayName} Tip: Support neighbourhood cafés and independent stores on ${displayName}'s daily digital front page.`,
      `${displayName} Tip: Early morning walks at the central city park have the cleanest air before 7:30 AM.`,
    ],
    landmarkExample: `Main Market Road, Central ${displayName}`,
  };
}

export function getThemeById(themeId: ThemePresetId): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
}

export function getCategoryEmoji(category: CategoryOption): string {
  return category.split(' ')[0] || '✨';
}

export interface FinancialQuoteItem {
  quote: string;
  author: string;
  role: string;
}

export const CURATED_FINANCIAL_QUOTES: FinancialQuoteItem[] = [
  {
    quote:
      "Price is what you pay. Value is what you get. Whether we're talking about socks or stocks, I like buying quality merchandise when it is marked down.",
    author: 'Warren Buffett',
    role: 'Chairman, Berkshire Hathaway',
  },
  {
    quote:
      'The big money is not in the buying and the selling, but in the waiting. Compounding works best when you never interrupt it unnecessarily.',
    author: 'Charlie Munger',
    role: 'Vice Chairman, Berkshire Hathaway',
  },
  {
    quote:
      'Seek wealth, not money or status. Wealth is having assets that earn while you sleep. Money is how we transfer time and wealth.',
    author: 'Naval Ravikant',
    role: 'Co-Founder, AngelList',
  },
  {
    quote:
      'Ups and downs in life are very important to keep us going, because a straight line even in an ECG means we are not alive. Build trust that outlasts market cycles.',
    author: 'Ratan Tata',
    role: 'Chairman Emeritus, Tata Sons',
  },
  {
    quote:
      "Spending money to show people how much money you have is the fastest way to have less money. True wealth is what you don't see.",
    author: 'Morgan Housel',
    role: 'Author, The Psychology of Money',
  },
];

export function buildGoogleNewsRssUrl(cityName: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(cityName)}+India+when:1d&hl=en-IN&gl=IN&ceid=IN:en`;
}

export function buildGoogleNewsRss2JsonUrl(cityName: string): string {
  return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
    `https://news.google.com/rss/search?q=${cityName}+India+when:1d&hl=en-IN&gl=IN&ceid=IN:en`
  )}`;
}

export function buildAllOriginsRssFallbackUrl(cityName: string): string {
  return `https://api.allorigins.win/get?url=${encodeURIComponent(
    `https://news.google.com/rss/search?q=${cityName}+India+when:1d&hl=en-IN&gl=IN&ceid=IN:en`
  )}`;
}

export function getDefaultCityTrendingHeadline(citySlug: string): string {
  const clean = normalizeCitySlug(citySlug);
  const headlines: Record<string, string> = {
    bengaluru:
      'Namma Metro Purple & Yellow Line Ridership Crosses New Daily Record Across Tech Corridors',
    mumbai:
      'Coastal Road & Aqua Line Metro Cut South Mumbai Commute Times by 40 Minutes',
    delhi:
      'Delhi-NCR Expressways & Regional Rapid Transit See Record Morning Commuter Surge',
    hyderabad:
      'HITEC City & Financial District Metro Phase-2 Corridor Gets Fast-Track Clearance',
    pune:
      'Pune Metro Aqua Line & Hinjawadi IT Park Skywalk Report Record Daily Ridership',
    jaipur:
      'Pink City Heritage Markets & Johari Bazaar Report Record Festive Footfall',
    mysuru:
      'Mysuru Heritage Corridor & Electronics Manufacturing Cluster Draw New Investments',
    indore:
      'Indore Clean Energy & Smart Transit Ring Road Project Enters Final Phase',
  };
  const displayName = formatCityDisplayName(clean);
  return (
    headlines[clean] ||
    `${displayName} Civic Infrastructure & Commercial Corridors See Record Daily Activity`
  );
}

export function getCurrentIstTickerDate(now: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).formatToParts(now);

    const weekday = (
      parts.find((p) => p.type === 'weekday')?.value || 'THU'
    ).toUpperCase();
    const day = parts.find((p) => p.type === 'day')?.value || '29';
    const month = (
      parts.find((p) => p.type === 'month')?.value || 'OCT'
    ).toUpperCase();
    const year = parts.find((p) => p.type === 'year')?.value || '2026';

    return `${weekday}, ${day} ${month} ${year}`;
  } catch {
    return 'THU, 29 OCT 2026';
  }
}

export interface TopTickerParts {
  domainLabel: string;
  dateLabel: string;
  pulseLabel: string;
  headlineText: string;
}

export function buildTopTickerParts(
  citySlug: string,
  trendingHeadline?: string,
  dateLabel: string = getCurrentIstTickerDate()
): TopTickerParts {
  const clean = normalizeCitySlug(citySlug).toUpperCase();
  const headline = (
    trendingHeadline?.trim() || getDefaultCityTrendingHeadline(citySlug)
  ).replace(/\s+/g, ' ');
  return {
    domainLabel: `FRONTPAGE99.IN/${clean}`,
    dateLabel,
    pulseLabel: `${clean} PULSE:`,
    headlineText: headline,
  };
}

export function buildTopTickerText(
  citySlug: string,
  trendingHeadline?: string,
  dateLabel: string = getCurrentIstTickerDate()
): string {
  const parts = buildTopTickerParts(citySlug, trendingHeadline, dateLabel);
  return `${parts.domainLabel}  •  ${parts.dateLabel}  •  ${parts.pulseLabel} ${parts.headlineText}`;
}

export interface BottomTickerParts {
  todayLabel: string;
  todayValue: string;
  tomorrowLabel: string;
  tomorrowValue: string;
}

export function buildBottomTickerParts(
  todaySlot: BillboardSlot | undefined,
  tomorrowSlot: BillboardSlot | undefined
): BottomTickerParts {
  const todayValue =
    todaySlot?.status === 'SOLD' && todaySlot.poster
      ? todaySlot.poster.businessName
      : 'EMPTY (Open for ₹99)';

  let tomorrowValue = 'EMPTY (Open for ₹99)';
  if (
    tomorrowSlot &&
    (tomorrowSlot.status === 'SOLD' || tomorrowSlot.status === 'RESERVED') &&
    tomorrowSlot.poster
  ) {
    const emoji = getCategoryEmoji(tomorrowSlot.poster.category);
    tomorrowValue = `🔒 LOCKED BY ${emoji} ${tomorrowSlot.poster.businessName} (Reveals at Midnight)`;
  }

  return {
    todayLabel: 'TODAY:',
    todayValue,
    tomorrowLabel: 'TOMORROW:',
    tomorrowValue,
  };
}

export function buildBottomTickerText(
  todaySlot: BillboardSlot | undefined,
  tomorrowSlot: BillboardSlot | undefined
): string {
  const parts = buildBottomTickerParts(todaySlot, tomorrowSlot);
  return `${parts.todayLabel} ${parts.todayValue}  •  ${parts.tomorrowLabel} ${parts.tomorrowValue}`;
}

export function formatMidnightCountdown(secondsToMidnight: number): string {
  const clamped = Math.max(0, Math.floor(secondsToMidnight));
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(
    2,
    '0'
  )}:${String(secs).padStart(2, '0')}`;
}

export function formatSoldOutHoursMinutes(secondsToMidnight: number): string {
  const clamped = Math.max(60, Math.floor(secondsToMidnight));
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  return `${hrs}h:${String(mins).padStart(2, '0')}m`;
}

export function buildCityJsonLdSchema(
  city: CityConfig,
  activeSlot: BillboardSlot
): Record<string, unknown> {
  const poster = activeSlot.poster;
  const businessName = poster
    ? poster.businessName
    : `FrontPage99 ${city.name} Edition`;
  const offerDescription = poster
    ? `${poster.headline} — ${poster.subtext}`
    : `${city.name}'s exclusive 24-hour digital front page billboard for ₹99/day.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessName,
    description: offerDescription,
    url: `https://frontpage99.in/${city.slug}`,
    areaServed: {
      '@type': 'City',
      name: city.name,
    },
    makesOffer: {
      '@type': 'Offer',
      name: poster ? poster.headline : `${city.name} Daily Front Page Slot`,
      description: offerDescription,
      price: '99',
      priceCurrency: 'INR',
      areaServed: city.name,
      validFrom: '2026-10-28T00:00:00+05:30',
      validThrough: '2026-10-28T23:59:59+05:30',
      url: `https://frontpage99.in/b/${city.shortCode}-2026-10-28`,
    },
  };
}

export function getCityPastEditionsArchive(cityId: CityId): BillboardSlot[] {
  const city = getCityById(cityId);
  const code = city.shortCode;

  return [
    {
      slotId: `${code}-2026-10-28`,
      cityId: city.id,
      dateIso: '2026-10-28',
      dayLabel: 'PAST EDITION',
      displayDate: 'OCT 28',
      fullDateLabel: 'Wednesday, Oct 28, 2026',
      status: 'SOLD',
      poster: {
        businessName:
          city.id === 'bengaluru'
            ? 'Blue Tokai Indiranagar'
            : `${city.name} Roastery Collective`,
        category: '☕ CAFÉ & DINING',
        headline:
          'Flat 50% Off Artisanal Cold Brews & Pour-Overs All Day Today',
        subtext: `${city.landmarkExample} • Open 7:30 AM – 10:30 PM • Show this front page at the counter`,
        whatsappNumber: '9845011223',
        themeId: 'newspaper-bw',
        takedownToken: 'AR2801',
        bookedAtIso: '2026-10-27T18:00:00Z',
        logoMode: 'auto-fetch',
        brandDomainOrHandle: 'bluetokaicoffee.com',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.8 (1.2k Google Reviews) • Verified Local Spot',
        animatedStickerId: 'steaming-coffee',
        vectorIconId: 'Coffee',
        stickerScale: 'md',
        stickerTint: 'gold',
      },
    },
    {
      slotId: `${code}-2026-10-27`,
      cityId: city.id,
      dateIso: '2026-10-27',
      dayLabel: 'PAST EDITION',
      displayDate: 'OCT 27',
      fullDateLabel: 'Tuesday, Oct 27, 2026',
      status: 'SOLD',
      poster: {
        businessName:
          city.id === 'bengaluru'
            ? 'Corner House Koramangala'
            : `${city.name} Creamery & Fudge`,
        category: '☕ CAFÉ & DINING',
        headline:
          'Buy 2 Death By Chocolate Sundaes & Get 1 Classic Hot Chocolate Fudge Free',
        subtext: `7th Block, ${city.name} Central • 11:00 AM – 11:30 PM • Dine-in & Takeaway`,
        whatsappNumber: '9845122334',
        themeId: 'editorial-cream',
        takedownToken: 'AR2702',
        bookedAtIso: '2026-10-26T14:20:00Z',
        logoMode: 'auto-fetch',
        brandDomainOrHandle: 'cornerhouseicecreams.com',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.9 (3.1k Google Reviews) • People’s Choice 2026',
        animatedStickerId: 'spinning-star',
        vectorIconId: 'Gift',
        stickerScale: 'md',
        stickerTint: 'gold',
      },
    },
    {
      slotId: `${code}-2026-10-26`,
      cityId: city.id,
      dateIso: '2026-10-26',
      dayLabel: 'PAST EDITION',
      displayDate: 'OCT 26',
      fullDateLabel: 'Monday, Oct 26, 2026',
      status: 'SOLD',
      poster: {
        businessName: `Cult.fit ${city.name} Flagship`,
        category: '💪 FITNESS & GYM',
        headline:
          '7-Day All-Access Group Workouts + Body Composition Scan at Just ₹99',
        subtext: `${city.landmarkExample} • 6:00 AM – 10:00 PM • Instant trial pass on WhatsApp`,
        whatsappNumber: '9845233445',
        themeId: 'cyber-yellow',
        takedownToken: 'AR2603',
        bookedAtIso: '2026-10-25T16:10:00Z',
        logoMode: 'auto-fetch',
        brandDomainOrHandle: 'cult.fit',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.9 (2.4k Google Reviews) • Top Rated in City',
        animatedStickerId: 'shimmering-trophy',
        vectorIconId: 'Dumbbell',
        stickerScale: 'md',
        stickerTint: 'gold',
      },
    },
    {
      slotId: `${code}-2026-10-25`,
      cityId: city.id,
      dateIso: '2026-10-25',
      dayLabel: 'PAST EDITION',
      displayDate: 'OCT 25',
      fullDateLabel: 'Sunday, Oct 25, 2026',
      status: 'SOLD',
      poster: {
        businessName: `Subko Specialty Bakehouse ${city.name}`,
        category: '☕ CAFÉ & DINING',
        headline:
          'Complimentary Sourdough Croissant With Every Specialty Cortado Till 6 PM',
        subtext: `${city.landmarkExample} • 8:00 AM – 9:30 PM • Direct WhatsApp table voucher`,
        whatsappNumber: '9820155667',
        themeId: 'warm-terracotta',
        takedownToken: 'AR2504',
        bookedAtIso: '2026-10-24T11:45:00Z',
        logoMode: 'auto-fetch',
        brandDomainOrHandle: 'subko.coffee',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.8 (1.2k Google Reviews) • Verified Local Spot',
        animatedStickerId: 'live-deal',
        vectorIconId: 'Crown',
        stickerScale: 'md',
        stickerTint: 'gold',
      },
    },
    {
      slotId: `${code}-2026-10-24`,
      cityId: city.id,
      dateIso: '2026-10-24',
      dayLabel: 'PAST EDITION',
      displayDate: 'OCT 24',
      fullDateLabel: 'Saturday, Oct 24, 2026',
      status: 'SOLD',
      poster: {
        businessName: `Indie Hardware & AI Demo Night ${city.name}`,
        category: '⚡ TECH LAUNCH',
        headline:
          'Saturday Builder Showcase — 50 Free Founder & Investor Passes',
        subtext: `${city.landmarkExample} • Doors open 6:00 PM • Claim QR entry on WhatsApp`,
        whatsappNumber: '9822088991',
        themeId: 'midnight-slate',
        takedownToken: 'AR2405',
        bookedAtIso: '2026-10-23T19:00:00Z',
        logoMode: 'monogram',
        monogramShape: 'shield',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.7 (860 Google Reviews) • Neighbourhood Favourite',
        animatedStickerId: 'party-confetti',
        vectorIconId: 'Laptop',
        stickerScale: 'md',
        stickerTint: 'cyan',
      },
    },
  ];
}

export function sanitizeTextInput(raw: string, maxLength: number): string {
  const stripped = raw.replace(/[<>]/g, '');
  return stripped.slice(0, maxLength);
}

export function validateIndianWhatsApp(input: string): {
  valid: boolean;
  cleaned: string;
  error?: string;
} {
  const digitsOnly = input.replace(/\D/g, '');
  const normalized =
    digitsOnly.length === 12 && digitsOnly.startsWith('91')
      ? digitsOnly.slice(2)
      : digitsOnly;

  if (normalized.length !== 10) {
    return {
      valid: false,
      cleaned: normalized.slice(0, 10),
      error: 'Enter a valid 10-digit Indian WhatsApp number.',
    };
  }
  if (!/^[6-9]\d{9}$/.test(normalized)) {
    return {
      valid: false,
      cleaned: normalized,
      error: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
    };
  }
  return { valid: true, cleaned: normalized };
}

export function validateUpiVpa(vpa: string): {
  valid: boolean;
  cleaned: string;
  error?: string;
} {
  const cleaned = vpa.trim().toLowerCase();
  if (!cleaned) {
    return {
      valid: false,
      cleaned,
      error: 'Please enter your UPI ID (e.g. merchant@okaxis) for the KYC receipt.',
    };
  }
  if (!/^[a-z0-9.\-_]{2,45}@[a-z0-9]{2,25}$/i.test(cleaned)) {
    return {
      valid: false,
      cleaned,
      error: 'Enter a valid UPI VPA format (e.g., name@okicici or 9845011223@ybl).',
    };
  }
  return { valid: true, cleaned };
}

export function daysBetweenIsoDates(dateIsoA: string, dateIsoB: string): number {
  const timeA = Date.parse(`${dateIsoA}T00:00:00Z`);
  const timeB = Date.parse(`${dateIsoB}T00:00:00Z`);
  if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 999;
  return Math.round(Math.abs(timeA - timeB) / (1000 * 60 * 60 * 24));
}

export const ANTI_MONOPOLY_MESSAGE =
  'Anti-Monopoly Rule: To keep the city front page fresh, each business can book at most once every 7 days.';

export function checkAntiSquatterCooldown(
  slots: BillboardSlot[],
  cityId: CityId,
  targetDateIso: string,
  businessName: string,
  whatsappNumber: string
): {
  blocked: boolean;
  reason?: string;
  matchedSlot?: BillboardSlot;
} {
  const normalizedCity = normalizeCitySlug(cityId);
  const cleanName = businessName.trim().toLowerCase();
  const cleanPhone = whatsappNumber.replace(/\D/g, '');

  if (!cleanName && cleanPhone.length < 10) {
    return { blocked: false };
  }

  for (const slot of slots) {
    if (normalizeCitySlug(slot.cityId) !== normalizedCity) continue;
    if (!slot.poster) continue;
    if (slot.status !== 'SOLD' && slot.status !== 'TAKEN_DOWN') continue;

    const diffDays = daysBetweenIsoDates(targetDateIso, slot.dateIso);
    if (diffDays <= 7) {
      const existingName = slot.poster.businessName.trim().toLowerCase();
      const existingPhone = slot.poster.whatsappNumber.replace(/\D/g, '');

      const nameMatch = cleanName.length >= 3 && existingName === cleanName;
      const phoneMatch = cleanPhone.length === 10 && existingPhone === cleanPhone;

      if (nameMatch || phoneMatch) {
        return {
          blocked: true,
          reason: ANTI_MONOPOLY_MESSAGE,
          matchedSlot: slot,
        };
      }
    }
  }

  return { blocked: false };
}

export function buildWhatsAppClaimUrl(poster: PosterData, cityName: string): string {
  const message = `Hi! I saw your offer (${poster.headline}) on today's FrontPage99 ${cityName} Edition and want to claim it.`;
  return `https://wa.me/91${poster.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppGroupViralUrl(slot: BillboardSlot, cityName: string): string {
  const headline = slot.poster?.headline ?? 'Special Local Offer';
  const business = slot.poster?.businessName ?? 'Our Store';
  const permalink = `https://frontpage99.in/b/${slot.slotId}`;
  const text = `🗞️ *${business}* is featured on the *FrontPage99 ${cityName} Edition* (${slot.displayDate})!\n\n✨ *${headline}*\n\nClaim on WhatsApp or view the official city front page here: ${permalink}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function generateSecretToken(seed?: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  if (seed) {
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    let out = '';
    let current = Math.abs(hash);
    for (let i = 0; i < 6; i++) {
      out += alphabet[current % alphabet.length];
      current = Math.floor(current / 7) + i * 13 + 5;
    }
    return out;
  }
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return token;
}

export function formatCountdown(remainingSeconds: number): string {
  const clamped = Math.max(0, Math.floor(remainingSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function verifyAndExecuteTakedown(
  slots: BillboardSlot[],
  cityId: CityId,
  dateIso: string,
  tokenInput: string
): {
  success: boolean;
  updatedSlots: BillboardSlot[];
  targetSlot?: BillboardSlot;
  error?: string;
} {
  const normalizedCity = normalizeCitySlug(cityId);
  const normalizedToken = tokenInput.trim().toUpperCase();
  if (normalizedToken.length !== 6) {
    return {
      success: false,
      updatedSlots: slots,
      error: 'Enter a valid 6-character Secret Takedown Token.',
    };
  }

  const slotIndex = slots.findIndex(
    (s) => normalizeCitySlug(s.cityId) === normalizedCity && s.dateIso === dateIso
  );

  if (slotIndex === -1) {
    return {
      success: false,
      updatedSlots: slots,
      error: 'No matching edition found for the selected city and date.',
    };
  }

  const target = slots[slotIndex];
  if (target.status === 'OPEN' || !target.poster) {
    return {
      success: false,
      updatedSlots: slots,
      error: 'This slot is currently OPEN and has no active poster to take down.',
    };
  }

  if (target.status === 'TAKEN_DOWN') {
    return {
      success: false,
      updatedSlots: slots,
      error: 'This edition has already been taken down.',
    };
  }

  if (target.poster.takedownToken.toUpperCase() !== normalizedToken) {
    return {
      success: false,
      updatedSlots: slots,
      error: 'Invalid Secret Takedown Token for this City and Date edition.',
    };
  }

  const updatedSlot: BillboardSlot = {
    ...target,
    status: 'TAKEN_DOWN',
  };

  const nextSlots = [...slots];
  nextSlots[slotIndex] = updatedSlot;

  return {
    success: true,
    updatedSlots: nextSlots,
    targetSlot: updatedSlot,
  };
}

export function ensureCityTwoDaySlots(
  slots: BillboardSlot[],
  citySlug: string
): BillboardSlot[] {
  const normalized = normalizeCitySlug(citySlug);
  const hasToday = slots.some(
    (s) => normalizeCitySlug(s.cityId) === normalized && s.dateIso === CANONICAL_TODAY_ISO
  );
  const hasTomorrow = slots.some(
    (s) => normalizeCitySlug(s.cityId) === normalized && s.dateIso === CANONICAL_TOMORROW_ISO
  );

  if (hasToday && hasTomorrow) return slots;

  const additions: BillboardSlot[] = [];
  if (!hasToday) {
    additions.push({
      slotId: `${normalized}-${CANONICAL_TODAY_ISO}`,
      cityId: normalized,
      dateIso: CANONICAL_TODAY_ISO,
      dayLabel: 'TODAY',
      displayDate: 'OCT 27',
      fullDateLabel: 'Tuesday, Oct 27, 2026',
      status: 'OPEN',
    });
  }
  if (!hasTomorrow) {
    additions.push({
      slotId: `${normalized}-${CANONICAL_TOMORROW_ISO}`,
      cityId: normalized,
      dateIso: CANONICAL_TOMORROW_ISO,
      dayLabel: 'TOMORROW',
      displayDate: 'OCT 28',
      fullDateLabel: 'Wednesday, Oct 28, 2026',
      status: 'OPEN',
    });
  }
  return [...slots, ...additions];
}

export function extractCleanDomain(rawInput: string): string {
  const trimmed = rawInput
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .replace(/^@/, '')
    .replace(/[^a-z0-9._-]/g, '');

  return trimmed || 'bluetokaicoffee.com';
}

export function buildUnavatarUrl(rawInput: string): string {
  const clean = extractCleanDomain(rawInput);
  if (!clean.includes('.')) {
    return `https://unavatar.io/instagram/${encodeURIComponent(clean)}`;
  }
  return `https://unavatar.io/${encodeURIComponent(clean)}`;
}

export function buildGoogleFaviconUrl(rawInput: string): string {
  const clean = extractCleanDomain(rawInput);
  const domain = clean.includes('.') ? clean : `${clean}.com`;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

export function getBusinessInitials(businessName: string): string {
  const words = businessName
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'FP';
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export const GOOGLE_TRUST_PRESETS: string[] = [
  '⭐ 4.8 (1.2k Google Reviews) • Verified Local Spot',
  '⭐ 4.9 (2.4k Google Reviews) • Top Rated in City',
  '⭐ 4.7 (860 Google Reviews) • Neighbourhood Favourite',
  '⭐ 4.9 (3.1k Google Reviews) • People’s Choice 2026',
];

export function simulateGooglePlacesLookup(
  businessName: string,
  cityName: string
): string {
  const clean = businessName.trim() || 'Local Spot';
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) % 1000;
  }
  const ratings = ['4.8', '4.9', '4.7', '4.9', '4.8'];
  const counts = ['1.2k', '2.4k', '940', '1.8k', '3.1k'];
  const rating = ratings[hash % ratings.length];
  const count = counts[hash % counts.length];
  return `⭐ ${rating} (${count} Google Reviews) • Verified ${cityName} Spot`;
}

export interface AnimatedStickerMeta {
  id: Exclude<AnimatedStickerId, 'none'>;
  name: string;
  shortLabel: string;
  canvasBadgeText: string;
  accentHex: string;
}

export const ANIMATED_STICKERS_CATALOG: AnimatedStickerMeta[] = [
  {
    id: 'live-deal',
    name: 'Pulsing Neon LIVE DEAL',
    shortLabel: 'LIVE DEAL',
    canvasBadgeText: '⚡ LIVE DEAL TODAY',
    accentHex: '#10B981',
  },
  {
    id: 'steaming-coffee',
    name: 'Steaming Hot Coffee Cup',
    shortLabel: 'Hot Coffee',
    canvasBadgeText: '☕ FRESH ARTISANAL BREW',
    accentHex: '#F59E0B',
  },
  {
    id: 'sizzling-flame',
    name: 'Sizzling Burger / Flame',
    shortLabel: 'Sizzling Flame',
    canvasBadgeText: '🔥 HOT KITCHEN SPECIAL',
    accentHex: '#EF4444',
  },
  {
    id: 'spinning-star',
    name: 'Spinning Star Burst',
    shortLabel: 'Star Burst',
    canvasBadgeText: '✦ EXCLUSIVE EDITION',
    accentHex: '#FACC15',
  },
  {
    id: 'bouncing-whatsapp',
    name: 'Bouncing WhatsApp Arrow',
    shortLabel: 'WA Arrow',
    canvasBadgeText: '💬 INSTANT WHATSAPP PASS',
    accentHex: '#22C55E',
  },
  {
    id: 'cyber-50-off',
    name: 'Flashing 50% OFF Cyber Tag',
    shortLabel: '50% OFF Tag',
    canvasBadgeText: '🏷️ FLAT 50% OFF FLASH',
    accentHex: '#EAB308',
  },
  {
    id: 'shimmering-trophy',
    name: 'Shimmering Gold Trophy',
    shortLabel: 'Gold Trophy',
    canvasBadgeText: '🏆 #1 CITY SPOTLIGHT',
    accentHex: '#FBBF24',
  },
  {
    id: 'party-confetti',
    name: 'Floating Party Confetti',
    shortLabel: 'Confetti',
    canvasBadgeText: '🎉 GRAND LAUNCH OFFER',
    accentHex: '#EC4899',
  },
];

export interface VectorIconMeta {
  id: Exclude<VectorIconId, 'none'>;
  label: string;
  keywords: string;
  canvasSymbol: string;
}

export const VECTOR_ICONS_CATALOG: VectorIconMeta[] = [
  { id: 'Coffee', label: 'Coffee', keywords: 'cafe brew tea cup espresso', canvasSymbol: '☕' },
  { id: 'Utensils', label: 'Dining', keywords: 'food restaurant fork spoon dinner', canvasSymbol: '🍴' },
  { id: 'Dumbbell', label: 'Fitness', keywords: 'gym workout sport weights yoga', canvasSymbol: '🏋️' },
  { id: 'Scissors', label: 'Salon', keywords: 'spa hair grooming beauty cut', canvasSymbol: '✂️' },
  { id: 'Sparkles', label: 'Luxury', keywords: 'clean shine new glow premium', canvasSymbol: '✨' },
  { id: 'ShoppingBag', label: 'Retail', keywords: 'store fashion shop boutique', canvasSymbol: '🛍️' },
  { id: 'GraduationCap', label: 'Coaching', keywords: 'study ias class school exam', canvasSymbol: '🎓' },
  { id: 'Music', label: 'Live Gig', keywords: 'concert dj night party audio', canvasSymbol: '🎵' },
  { id: 'Car', label: 'Auto Care', keywords: 'wash detailing garage service', canvasSymbol: '🚗' },
  { id: 'HeartPulse', label: 'Wellness', keywords: 'clinic dental health medical', canvasSymbol: '🩺' },
  { id: 'Pizza', label: 'Fast Food', keywords: 'slice bakery burger snack', canvasSymbol: '🍕' },
  { id: 'Flame', label: 'Hot Deal', keywords: 'fire spicy trending popular', canvasSymbol: '🔥' },
  { id: 'Award', label: 'Certified', keywords: 'winner best ribbon quality', canvasSymbol: '🎖️' },
  { id: 'Zap', label: 'Flash Tech', keywords: 'bolt instant electric launch', canvasSymbol: '⚡' },
  { id: 'Gift', label: 'Freebie', keywords: 'present bonus combo hamper', canvasSymbol: '🎁' },
  { id: 'Percent', label: 'Discount', keywords: 'sale offer off savings', canvasSymbol: '％' },
  { id: 'Tag', label: 'Price Drop', keywords: 'voucher coupon label code', canvasSymbol: '🏷️' },
  { id: 'Clock', label: 'Happy Hour', keywords: 'time limited countdown today', canvasSymbol: '⏰' },
  { id: 'MapPin', label: 'Local Spot', keywords: 'location landmark address metro', canvasSymbol: '📍' },
  { id: 'Star', label: 'Top Rated', keywords: 'review five rating favourite', canvasSymbol: '⭐' },
  { id: 'Crown', label: 'Royal VIP', keywords: 'king gold heritage flagship', canvasSymbol: '👑' },
  { id: 'Laptop', label: 'Tech Hub', keywords: 'software ai coworking gadget', canvasSymbol: '💻' },
  { id: 'Camera', label: 'Studio', keywords: 'photo creator reel shoot', canvasSymbol: '📷' },
  { id: 'Bike', label: 'Quick Delivery', keywords: 'cycle express ride local', canvasSymbol: '🚲' },
];

export function resolveStickerTintHex(
  tint: StickerTint | undefined,
  themeAccentTextHex: string
): string {
  switch (tint) {
    case 'gold':
      return '#FACC15';
    case 'emerald':
      return '#34D399';
    case 'coral':
      return '#FB7185';
    case 'cyan':
      return '#38BDF8';
    default:
      return themeAccentTextHex;
  }
}

export function createInitialSlots(): BillboardSlot[] {
  return [
    // ================= BENGALURU (bengaluru) — Today SOLD, Tomorrow OPEN =================
    {
      slotId: 'bengaluru-2026-10-25',
      cityId: 'bengaluru',
      dateIso: '2026-10-25',
      dayLabel: 'PAST EDITION',
      displayDate: 'OCT 25',
      fullDateLabel: 'Sunday, Oct 25, 2026',
      status: 'SOLD',
      poster: {
        businessName: 'Corner House Koramangala',
        category: '☕ CAFÉ & DINING',
        headline: 'Buy 2 Death By Chocolate Sundaes & Get 1 Classic Hot Chocolate Fudge Free',
        subtext: '7th Block, Koramangala (Near Forum Mall) • 11:00 AM – 11:30 PM • Dine-in & Takeaway',
        whatsappNumber: '9845122334',
        themeId: 'editorial-cream',
        upiVpa: 'cornerhouse@okhdfcbank',
        takedownToken: 'CH25BL',
        bookedAtIso: '2026-10-24T14:20:00Z',
        logoMode: 'auto-fetch',
        brandDomainOrHandle: 'cornerhouseicecreams.com',
        monogramShape: 'circle',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.9 (3.1k Google Reviews) • People’s Choice 2026',
        animatedStickerId: 'spinning-star',
        vectorIconId: 'Gift',
        stickerScale: 'md',
        stickerTint: 'gold',
      },
    },
    {
      slotId: 'bengaluru-2026-10-27',
      cityId: 'bengaluru',
      dateIso: CANONICAL_TODAY_ISO,
      dayLabel: 'TODAY',
      displayDate: 'OCT 27',
      fullDateLabel: 'Tuesday, Oct 27, 2026',
      status: 'SOLD',
      poster: {
        businessName: 'Blue Tokai Indiranagar',
        category: '☕ CAFÉ & DINING',
        headline: 'Flat 50% Off Artisanal Cold Brews & Pour-Overs All Day Today',
        subtext:
          '100 Feet Road, Indiranagar (Near Sony World Signal) • Open 7:30 AM – 10:30 PM • Show this front page at the counter',
        whatsappNumber: '9845011223',
        themeId: 'newspaper-bw',
        upiVpa: 'bluetokai.blr@okaxis',
        takedownToken: 'X9K2P7',
        bookedAtIso: '2026-10-26T09:15:00Z',
        logoMode: 'auto-fetch',
        brandDomainOrHandle: 'bluetokaicoffee.com',
        monogramShape: 'circle',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.8 (1.2k Google Reviews) • Verified Local Spot',
        animatedStickerId: 'steaming-coffee',
        vectorIconId: 'Coffee',
        stickerScale: 'md',
        stickerTint: 'gold',
      },
    },
    {
      slotId: 'bengaluru-2026-10-28',
      cityId: 'bengaluru',
      dateIso: CANONICAL_TOMORROW_ISO,
      dayLabel: 'TOMORROW',
      displayDate: 'OCT 28',
      fullDateLabel: 'Wednesday, Oct 28, 2026',
      status: 'OPEN',
    },

    // ================= MUMBAI (mumbai) — Today SOLD, Tomorrow SOLD (Teaser Locked) =================
    {
      slotId: 'mumbai-2026-10-27',
      cityId: 'mumbai',
      dateIso: CANONICAL_TODAY_ISO,
      dayLabel: 'TODAY',
      displayDate: 'OCT 27',
      fullDateLabel: 'Tuesday, Oct 27, 2026',
      status: 'SOLD',
      poster: {
        businessName: 'Subko Cacao Bandra',
        category: '☕ CAFÉ & DINING',
        headline: 'Complimentary Sourdough Croissant With Every Specialty Cortado Till 6 PM',
        subtext:
          'Mary Lodge, Chapel Road, Bandra West (Off Hill Road) • 8:00 AM – 9:30 PM • Direct WhatsApp table voucher',
        whatsappNumber: '9820155667',
        themeId: 'warm-terracotta',
        upiVpa: 'subko.bandra@okhdfcbank',
        takedownToken: 'SB27BM',
        bookedAtIso: '2026-10-26T10:12:00Z',
        logoMode: 'auto-fetch',
        brandDomainOrHandle: 'subko.coffee',
        monogramShape: 'shield',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.9 (2.4k Google Reviews) • Top Rated in City',
        animatedStickerId: 'live-deal',
        vectorIconId: 'Crown',
        stickerScale: 'md',
        stickerTint: 'gold',
      },
    },
    {
      slotId: 'mumbai-2026-10-28',
      cityId: 'mumbai',
      dateIso: CANONICAL_TOMORROW_ISO,
      dayLabel: 'TOMORROW',
      displayDate: 'OCT 28',
      fullDateLabel: 'Wednesday, Oct 28, 2026',
      status: 'SOLD',
      poster: {
        businessName: 'Gold’s Gym Pali Hill',
        category: '💪 FITNESS & GYM',
        headline: 'Secret Midnight Reveal Offer',
        subtext: 'Pali Hill, Bandra West • 6:00 AM – 11:00 PM',
        whatsappNumber: '9820998877',
        themeId: 'cyber-yellow',
        upiVpa: 'goldsgym@okicici',
        takedownToken: 'GG28BM',
        bookedAtIso: '2026-10-27T08:00:00Z',
        logoMode: 'auto-fetch',
        brandDomainOrHandle: 'goldsgym.in',
        monogramShape: 'shield',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.8 (1.2k Google Reviews) • Verified Local Spot',
        animatedStickerId: 'shimmering-trophy',
        vectorIconId: 'Dumbbell',
        stickerScale: 'md',
        stickerTint: 'gold',
      },
    },

    // ================= DELHI-NCR (delhi) — Today SOLD, Tomorrow SOLD (100% Sold Out) =================
    {
      slotId: 'delhi-2026-10-27',
      cityId: 'delhi',
      dateIso: CANONICAL_TODAY_ISO,
      dayLabel: 'TODAY',
      displayDate: 'OCT 27',
      fullDateLabel: 'Tuesday, Oct 27, 2026',
      status: 'SOLD',
      poster: {
        businessName: 'Vairagya Salon Khan Market',
        category: '✂️ SALON & SPA',
        headline: 'Flat ₹999 Korean Glass Skin Facial + Keratin Blowdry Combo Today',
        subtext:
          'Middle Lane, Khan Market (Above Good Earth) • 10:00 AM – 8:30 PM • Instant slot confirmation on WhatsApp',
        whatsappNumber: '9811233445',
        themeId: 'editorial-cream',
        upiVpa: 'vairagya.del@okaxis',
        takedownToken: 'VR27DL',
        bookedAtIso: '2026-10-26T11:30:00Z',
        logoMode: 'monogram',
        monogramShape: 'shield',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.9 (2.4k Google Reviews) • Top Rated in City',
        animatedStickerId: 'cyber-50-off',
        vectorIconId: 'Scissors',
        stickerScale: 'md',
        stickerTint: 'coral',
      },
    },
    {
      slotId: 'delhi-2026-10-28',
      cityId: 'delhi',
      dateIso: CANONICAL_TOMORROW_ISO,
      dayLabel: 'TOMORROW',
      displayDate: 'OCT 28',
      fullDateLabel: 'Wednesday, Oct 28, 2026',
      status: 'SOLD',
      poster: {
        businessName: 'Apex IAS Study Circle',
        category: '📚 COACHING',
        headline: 'Free Sunday Open Mock GS Paper-1 + 1-on-1 Mains Answer Review',
        subtext:
          'Bada Bazar Marg, Old Rajinder Nagar (Gate 2 Metro) • Batch starts 9:00 AM • Register via WhatsApp',
        whatsappNumber: '9810477889',
        themeId: 'royal-indigo',
        upiVpa: 'apexias@oksbi',
        takedownToken: 'AP28DL',
        bookedAtIso: '2026-10-26T16:00:00Z',
        logoMode: 'monogram',
        monogramShape: 'shield',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.8 (1.2k Google Reviews) • Verified Local Spot',
        animatedStickerId: 'shimmering-trophy',
        vectorIconId: 'GraduationCap',
        stickerScale: 'md',
        stickerTint: 'gold',
      },
    },

    // ================= HYDERABAD (hyderabad) — Today SOLD, Tomorrow OPEN =================
    {
      slotId: 'hyderabad-2026-10-27',
      cityId: 'hyderabad',
      dateIso: CANONICAL_TODAY_ISO,
      dayLabel: 'TODAY',
      displayDate: 'OCT 27',
      fullDateLabel: 'Tuesday, Oct 27, 2026',
      status: 'SOLD',
      poster: {
        businessName: 'Roastery Coffee House',
        category: '☕ CAFÉ & DINING',
        headline: 'Cranberry Cold Brew + Cascara Cheesecake Duo at ₹349 All Day',
        subtext:
          'Road No. 14, Banjara Hills (Near KBR Park Main Gate) • 8:00 AM – 11:00 PM • Claim table pass on WhatsApp',
        whatsappNumber: '9849066778',
        themeId: 'emerald-mint',
        upiVpa: 'roastery.hyd@okicici',
        takedownToken: 'RC27HD',
        bookedAtIso: '2026-10-26T12:00:00Z',
        logoMode: 'auto-fetch',
        brandDomainOrHandle: 'roasterycoffee.co.in',
        monogramShape: 'circle',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.9 (3.1k Google Reviews) • People’s Choice 2026',
        animatedStickerId: 'steaming-coffee',
        vectorIconId: 'Coffee',
        stickerScale: 'md',
        stickerTint: 'emerald',
      },
    },
    {
      slotId: 'hyderabad-2026-10-28',
      cityId: 'hyderabad',
      dateIso: CANONICAL_TOMORROW_ISO,
      dayLabel: 'TOMORROW',
      displayDate: 'OCT 28',
      fullDateLabel: 'Wednesday, Oct 28, 2026',
      status: 'OPEN',
    },

    // ================= PUNE (pune) — Today SOLD, Tomorrow OPEN =================
    {
      slotId: 'pune-2026-10-27',
      cityId: 'pune',
      dateIso: CANONICAL_TODAY_ISO,
      dayLabel: 'TODAY',
      displayDate: 'OCT 27',
      fullDateLabel: 'Tuesday, Oct 27, 2026',
      status: 'SOLD',
      poster: {
        businessName: 'Kalyani TechForge Labs',
        category: '⚡ TECH LAUNCH',
        headline: 'Pune Indie Hardware & AI Demo Night — 50 Free Builder Passes Today',
        subtext:
          'Lane 6, Koregaon Park (Above Sante Spa Cuisine) • Doors open 6:00 PM • Claim QR entry on WhatsApp',
        whatsappNumber: '9822088991',
        themeId: 'midnight-slate',
        upiVpa: 'techforge@okaxis',
        takedownToken: 'TF27PN',
        bookedAtIso: '2026-10-26T15:10:00Z',
        logoMode: 'monogram',
        monogramShape: 'shield',
        includeGoogleTrust: true,
        googleTrustText: '⭐ 4.8 (1.2k Google Reviews) • Verified Local Spot',
        animatedStickerId: 'party-confetti',
        vectorIconId: 'Laptop',
        stickerScale: 'md',
        stickerTint: 'cyan',
      },
    },
    {
      slotId: 'pune-2026-10-28',
      cityId: 'pune',
      dateIso: CANONICAL_TOMORROW_ISO,
      dayLabel: 'TOMORROW',
      displayDate: 'OCT 28',
      fullDateLabel: 'Wednesday, Oct 28, 2026',
      status: 'OPEN',
    },

    // ================= JAIPUR (jaipur) — Today OPEN (Shows Rotating City Tip Slate), Tomorrow OPEN =================
    {
      slotId: 'jaipur-2026-10-27',
      cityId: 'jaipur',
      dateIso: CANONICAL_TODAY_ISO,
      dayLabel: 'TODAY',
      displayDate: 'OCT 27',
      fullDateLabel: 'Tuesday, Oct 27, 2026',
      status: 'OPEN',
    },
    {
      slotId: 'jaipur-2026-10-28',
      cityId: 'jaipur',
      dateIso: CANONICAL_TOMORROW_ISO,
      dayLabel: 'TOMORROW',
      displayDate: 'OCT 28',
      fullDateLabel: 'Wednesday, Oct 28, 2026',
      status: 'OPEN',
    },
  ];
}

export interface HeadlineFontMoodOption {
  id: HeadlineFontMood;
  label: string;
  cssClass: string;
  fontFamilyCss: string;
  canvasFont: string;
}

export const HEADLINE_FONT_MOODS: HeadlineFontMoodOption[] = [
  {
    id: 'inter-tight',
    label: 'Commercial Billboard (Inter Tight)',
    cssClass: 'font-inter-tight',
    fontFamilyCss: "'Inter Tight', sans-serif",
    canvasFont: '800 70px "Inter Tight", sans-serif',
  },
  {
    id: 'syne',
    label: 'Bold Street Impact (Syne)',
    cssClass: 'font-syne',
    fontFamilyCss: "'Syne', sans-serif",
    canvasFont: '800 66px "Syne", sans-serif',
  },
  {
    id: 'jakarta',
    label: 'Clean Modern (Plus Jakarta Sans)',
    cssClass: 'font-modern',
    fontFamilyCss: "'Plus Jakarta Sans', sans-serif",
    canvasFont: '800 68px "Plus Jakarta Sans", sans-serif',
  },
];

export function getHeadlineFontMood(
  mood?: HeadlineFontMood
): HeadlineFontMoodOption {
  if (!mood || mood === 'fraunces') {
    return HEADLINE_FONT_MOODS[0];
  }
  return (
    HEADLINE_FONT_MOODS.find((item) => item.id === mood) ||
    HEADLINE_FONT_MOODS[0]
  );
}


