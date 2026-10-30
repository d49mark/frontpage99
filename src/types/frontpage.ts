export type CityId = string; // Normalized lowercase slug, e.g., 'bengaluru', 'mumbai', 'indore'

export type ThemePresetId =
  | 'newspaper-bw'
  | 'editorial-cream'
  | 'sunset-gradient'
  | 'emerald-mint'
  | 'royal-indigo'
  | 'cyber-yellow'
  | 'crimson-punch'
  | 'midnight-slate'
  | 'neon-coral'
  | 'warm-terracotta';

export type CategoryOption =
  | '☕ CAFÉ & DINING'
  | '💪 FITNESS & GYM'
  | '✂️ SALON & SPA'
  | '📚 COACHING'
  | '⚡ TECH LAUNCH';

export type SlotStatus = 'SOLD' | 'OPEN' | 'RESERVED' | 'TAKEN_DOWN';

export type LogoMode = 'auto-fetch' | 'monogram';
export type MonogramShape = 'circle' | 'shield';

export type AnimatedStickerId =
  | 'none'
  | 'live-deal'
  | 'steaming-coffee'
  | 'sizzling-flame'
  | 'spinning-star'
  | 'bouncing-whatsapp'
  | 'cyber-50-off'
  | 'shimmering-trophy'
  | 'party-confetti';

export type VectorIconId =
  | 'none'
  | 'Coffee'
  | 'Utensils'
  | 'Dumbbell'
  | 'Scissors'
  | 'Sparkles'
  | 'ShoppingBag'
  | 'GraduationCap'
  | 'Music'
  | 'Car'
  | 'HeartPulse'
  | 'Pizza'
  | 'Flame'
  | 'Award'
  | 'Zap'
  | 'Gift'
  | 'Percent'
  | 'Tag'
  | 'Clock'
  | 'MapPin'
  | 'Star'
  | 'Crown'
  | 'Laptop'
  | 'Camera'
  | 'Bike';

export type StickerScale = 'sm' | 'md' | 'lg';
export type StickerTint = 'auto' | 'gold' | 'emerald' | 'coral' | 'cyan';
export type HeadlineFontMood = 'inter-tight' | 'syne' | 'jakarta' | 'fraunces';

export interface CityConfig {
  id: CityId;
  slug: string;
  name: string;
  shortCode: string; // e.g., 'blr', 'bom', 'del', 'hyd', 'pnq', 'jai'
  editionStamp: string;
  baseViews: number;
  baseClaims: number;
  weatherAqi: string;
  communityTip: string;
  cityTips: string[];
  landmarkExample: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  shortLabel: string;
  bgClass: string;
  textClass: string;
  subtextClass: string;
  borderClass: string;
  kickerClass: string;
  ctaBgClass: string;
  ctaTextClass: string;
  secondaryBtnClass: string;
  // Exact hex colors for HTML5 1080x1920 Canvas rendering
  canvasBgStart: string;
  canvasBgEnd: string;
  canvasTextPrimary: string;
  canvasTextSecondary: string;
  canvasAccentBg: string;
  canvasAccentText: string;
  canvasBorderHex: string;
}

export interface PosterData {
  businessName: string;
  category: CategoryOption;
  headline: string;
  subtext: string;
  whatsappNumber: string;
  themeId: ThemePresetId;
  fontMood?: HeadlineFontMood;
  upiVpa?: string;
  takedownToken: string;
  bookedAtIso: string;
  // Brand Logo & Monogram Identity
  logoMode?: LogoMode;
  brandDomainOrHandle?: string;
  monogramShape?: MonogramShape;
  // Google Maps Rating & Trust Badge
  includeGoogleTrust?: boolean;
  googleTrustText?: string;
  // Animated Loop Stickers & Vector Icon Library
  animatedStickerId?: AnimatedStickerId;
  vectorIconId?: VectorIconId;
  stickerScale?: StickerScale;
  stickerTint?: StickerTint;
}

export interface BillboardSlot {
  slotId: string;
  cityId: CityId;
  dateIso: string; // YYYY-MM-DD (Strictly Today or Tomorrow in active window)
  dayLabel: 'TODAY' | 'TOMORROW' | 'PAST EDITION';
  displayDate: string; // e.g., "OCT 27"
  fullDateLabel: string; // e.g., "Tuesday, Oct 27, 2026"
  status: SlotStatus;
  poster?: PosterData;
  reservedUntilMs?: number;
}
