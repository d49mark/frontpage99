import React, { useEffect, useState } from 'react';
import {
  AnimatedStickerId,
  CategoryOption,
  LogoMode,
  MonogramShape,
  StickerScale,
  StickerTint,
  VectorIconId,
} from '../types/frontpage';
import {
  buildGoogleFaviconUrl,
  buildUnavatarUrl,
  getBusinessInitials,
  getCategoryEmoji,
} from '../utils/frontpageLogic';
import {
  Award,
  Bike,
  Camera,
  Car,
  Clock,
  Coffee,
  Crown,
  Dumbbell,
  Flame,
  Gift,
  GraduationCap,
  HeartPulse,
  Laptop,
  MapPin,
  Music,
  Percent,
  Pizza,
  Scissors,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Utensils,
  Zap,
} from 'lucide-react';

interface BrandLogoSealProps {
  businessName: string;
  category: CategoryOption;
  logoMode?: LogoMode;
  brandDomainOrHandle?: string;
  monogramShape?: MonogramShape;
  size?: 'sm' | 'md' | 'lg';
}

function buildBrandSvgDataUri(
  businessName: string,
  domainOrHandle: string,
  category: CategoryOption
): string {
  const initials = getBusinessInitials(businessName);
  const cleanDom = (domainOrHandle || '').toLowerCase();
  let bgHex = '#0F172A';
  let ringHex = '#FACC15';
  let textHex = '#FEF08A';

  if (cleanDom.includes('bluetokai')) {
    bgHex = '#0C4A6E';
    ringHex = '#38BDF8';
    textHex = '#F0F9FF';
  } else if (cleanDom.includes('cornerhouse')) {
    bgHex = '#451A03';
    ringHex = '#F59E0B';
    textHex = '#FEF3C7';
  } else if (cleanDom.includes('cult')) {
    bgHex = '#18181B';
    ringHex = '#F43F5E';
    textHex = '#FFE4E6';
  } else if (cleanDom.includes('subko')) {
    bgHex = '#431407';
    ringHex = '#FB923C';
    textHex = '#FFEDD5';
  }

  const emoji = getCategoryEmoji(category);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
    <rect width="96" height="96" rx="22" fill="${bgHex}" stroke="${ringHex}" stroke-width="5"/>
    <circle cx="48" cy="48" r="36" fill="none" stroke="${ringHex}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="48" y="55" text-anchor="middle" fill="${textHex}" font-family="Georgia, serif" font-weight="800" font-size="34">${initials}</text>
    <text x="76" y="26" text-anchor="middle" font-size="18">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const BrandLogoSeal: React.FC<BrandLogoSealProps> = ({
  businessName,
  category,
  logoMode = 'monogram',
  brandDomainOrHandle = '',
  monogramShape = 'circle',
  size = 'md',
}) => {
  const svgFallbackUri = buildBrandSvgDataUri(
    businessName,
    brandDomainOrHandle,
    category
  );
  const [resolvedImgSrc, setResolvedImgSrc] = useState<string>(svgFallbackUri);

  useEffect(() => {
    const nextFallback = buildBrandSvgDataUri(
      businessName,
      brandDomainOrHandle,
      category
    );
    setResolvedImgSrc(nextFallback);

    if (logoMode !== 'auto-fetch' || !brandDomainOrHandle.trim()) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    let objectUrlToRevoke: string | null = null;

    const unavatarUrl = buildUnavatarUrl(brandDomainOrHandle);
    fetch(unavatarUrl, { mode: 'cors', signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('unavatar failed');
        return res.blob();
      })
      .then((blob) => {
        clearTimeout(timeoutId);
        if (blob && blob.size > 100 && blob.type.startsWith('image/')) {
          objectUrlToRevoke = URL.createObjectURL(blob);
          setResolvedImgSrc(objectUrlToRevoke);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        // Cleanly retain the generated SVG monogram avatar if offline or rate-limited
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [businessName, brandDomainOrHandle, category, logoMode]);

  const initials = getBusinessInitials(businessName);
  const emoji = getCategoryEmoji(category);

  const dims =
    size === 'sm'
      ? 'w-9 h-9 text-xs'
      : size === 'lg'
      ? 'w-12 h-12 text-base'
      : 'w-10 h-10 text-sm';

  const hasDomainInput =
    logoMode === 'auto-fetch' && brandDomainOrHandle.trim().length > 0;

  if (hasDomainInput) {
    return (
      <div
        data-testid="brand-logo-seal"
        data-unavatar-url={buildUnavatarUrl(brandDomainOrHandle)}
        data-favicon-url={buildGoogleFaviconUrl(brandDomainOrHandle)}
        className={`${dims} relative rounded-xl overflow-hidden bg-zinc-950 border-2 border-amber-400/90 shadow-sm shrink-0 flex items-center justify-center`}
      >
        <img
          src={resolvedImgSrc}
          alt={`${businessName} Official Logo`}
          crossOrigin="anonymous"
          onError={() => setResolvedImgSrc(svgFallbackUri)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Instant Luxury Monogram Crest (Circular or Shield Vector Crest)
  if (monogramShape === 'shield') {
    return (
      <div
        data-testid="brand-logo-seal"
        title={`${businessName} Luxury Monogram Crest`}
        className={`${dims} relative shrink-0 flex items-center justify-center select-none`}
      >
        <svg
          viewBox="0 0 48 48"
          className="w-full h-full drop-shadow-xs"
          aria-hidden="true"
        >
          <path
            d="M24 3L6 10v13c0 11.2 7.7 20.8 18 23 10.3-2.2 18-11.8 18-23V10L24 3z"
            fill="#18181B"
            stroke="#FACC15"
            strokeWidth="2.5"
          />
          <path
            d="M24 6.5L9.5 12.2v10.8c0 9.1 6.2 17.1 14.5 19.1 8.3-2 14.5-10 14.5-19.1V12.2L24 6.5z"
            fill="none"
            stroke="#FDE047"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          <text
            x="24"
            y="28"
            textAnchor="middle"
            fill="#FEF08A"
            fontFamily="Inter Tight, sans-serif"
            fontWeight="800"
            fontSize="15"
          >
            {initials}
          </text>
        </svg>
        <span
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 text-[10px] leading-none bg-zinc-950 rounded-full px-0.5 border border-amber-400/60"
        >
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <div
      data-testid="brand-logo-seal"
      title={`${businessName} Luxury Monogram Seal`}
      className={`${dims} relative rounded-full bg-zinc-950 text-amber-200 border-2 border-amber-400 ring-1 ring-amber-300/40 shrink-0 flex items-center justify-center font-editorial font-extrabold tracking-tight shadow-xs select-none`}
    >
      <span>{initials}</span>
      <span
        aria-hidden="true"
        className="absolute -bottom-1 -right-1 text-[10px] leading-none bg-zinc-900 rounded-full px-0.5 border border-amber-400/60"
      >
        {emoji}
      </span>
    </div>
  );
};

interface GoogleMapsTrustPillProps {
  text?: string;
  compact?: boolean;
}

export const GoogleMapsTrustPill: React.FC<GoogleMapsTrustPillProps> = ({
  text = '⭐ 4.8 (1.2k Google Reviews) • Verified Local Spot',
  compact = false,
}) => {
  return (
    <div
      data-testid="google-maps-trust-pill"
      className={`inline-flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-xs border border-amber-300/40 text-amber-200 font-mono-tabular font-semibold ${
        compact ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]'
      }`}
    >
      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
};

const LUCIDE_ICON_MAP: Record<
  Exclude<VectorIconId, 'none'>,
  React.FC<{ className?: string }>
> = {
  Coffee,
  Utensils,
  Dumbbell,
  Scissors,
  Sparkles,
  ShoppingBag,
  GraduationCap,
  Music,
  Car,
  HeartPulse,
  Pizza,
  Flame,
  Award,
  Zap,
  Gift,
  Percent,
  Tag,
  Clock,
  MapPin,
  Star,
  Crown,
  Laptop,
  Camera,
  Bike,
};

interface CategoryVectorIconBadgeProps {
  iconId?: VectorIconId;
  scale?: StickerScale;
  tint?: StickerTint;
}

export const CategoryVectorIconBadge: React.FC<CategoryVectorIconBadgeProps> = ({
  iconId = 'none',
  scale = 'md',
  tint = 'auto',
}) => {
  if (!iconId || iconId === 'none') return null;
  const IconComp = LUCIDE_ICON_MAP[iconId];
  if (!IconComp) return null;

  const boxDims =
    scale === 'sm'
      ? 'w-8 h-8 rounded-lg'
      : scale === 'lg'
      ? 'w-12 h-12 rounded-2xl'
      : 'w-10 h-10 rounded-xl';

  const iconDims =
    scale === 'sm' ? 'w-4 h-4' : scale === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  const tintClasses =
    tint === 'gold'
      ? 'text-amber-300 border-amber-400/50 bg-amber-500/15'
      : tint === 'emerald'
      ? 'text-emerald-300 border-emerald-400/50 bg-emerald-500/15'
      : tint === 'coral'
      ? 'text-rose-300 border-rose-400/50 bg-rose-500/15'
      : tint === 'cyan'
      ? 'text-sky-300 border-sky-400/50 bg-sky-500/15'
      : 'text-current border-current/30 bg-white/10';

  return (
    <div
      data-testid={`vector-icon-badge-${iconId}`}
      title={`${iconId} Vector Badge`}
      className={`${boxDims} ${tintClasses} border flex items-center justify-center shrink-0 transition-transform`}
    >
      <IconComp className={iconDims} />
    </div>
  );
};

interface AnimatedLoopStickerProps {
  stickerId?: AnimatedStickerId;
  scale?: StickerScale;
}

export const AnimatedLoopSticker: React.FC<AnimatedLoopStickerProps> = ({
  stickerId = 'none',
  scale = 'md',
}) => {
  if (!stickerId || stickerId === 'none') return null;

  const sizeClass =
    scale === 'sm'
      ? 'scale-90 origin-right'
      : scale === 'lg'
      ? 'scale-110 origin-right'
      : 'scale-100 origin-right';

  return (
    <div
      data-testid={`animated-sticker-${stickerId}`}
      className={`inline-flex items-center select-none ${sizeClass}`}
    >
      {stickerId === 'live-deal' && (
        <div className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-mono-tabular text-[11px] font-extrabold tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.45)] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>LIVE DEAL</span>
        </div>
      )}

      {stickerId === 'steaming-coffee' && (
        <div className="px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-400/80 text-amber-200 font-mono-tabular text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
          <svg
            viewBox="0 0 28 28"
            className="w-4 h-4 overflow-visible"
            aria-hidden="true"
          >
            <path
              d="M9 6 C9 3, 11 3, 11 1"
              stroke="#FDE68A"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              className="animate-bounce"
            />
            <path
              d="M15 6 C15 3, 17 3, 17 1"
              stroke="#FCD34D"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              className="animate-pulse"
            />
            <rect
              x="5"
              y="9"
              width="14"
              height="12"
              rx="3"
              fill="#F59E0B"
              stroke="#FEF3C7"
              strokeWidth="1.5"
            />
            <path
              d="M19 11 H22 A2.5 2.5 0 0 1 22 17 H19"
              stroke="#FEF3C7"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          <span>FRESH BREW</span>
        </div>
      )}

      {stickerId === 'sizzling-flame' && (
        <div className="px-2.5 py-1 rounded-full bg-red-950/90 border border-orange-400 text-orange-200 font-mono-tabular text-[11px] font-extrabold flex items-center gap-1 shadow-[0_0_12px_rgba(249,115,22,0.4)] animate-bounce">
          <span className="text-sm leading-none">🔥</span>
          <span>SIZZLING</span>
        </div>
      )}

      {stickerId === 'spinning-star' && (
        <div className="px-2.5 py-1 rounded-full bg-yellow-950/90 border border-yellow-300 text-yellow-200 font-mono-tabular text-[11px] font-extrabold flex items-center gap-1.5">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-yellow-300 animate-spin"
            style={{ animationDuration: '5s' }}
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z"
            />
          </svg>
          <span>STAR PICK</span>
        </div>
      )}

      {stickerId === 'bouncing-whatsapp' && (
        <div className="px-2.5 py-1 rounded-full bg-green-950/90 border border-green-400 text-green-200 font-mono-tabular text-[11px] font-extrabold flex items-center gap-1 animate-bounce">
          <span>💬 FAST CLAIM ↓</span>
        </div>
      )}

      {stickerId === 'cyber-50-off' && (
        <div className="px-2.5 py-1 rounded-md bg-yellow-400 text-zinc-950 border-2 border-white font-mono-tabular text-[11px] font-black tracking-wider animate-pulse shadow-[0_0_14px_rgba(250,204,21,0.6)]">
          ⚡ 50% OFF
        </div>
      )}

      {stickerId === 'shimmering-trophy' && (
        <div className="px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-300 text-amber-200 font-mono-tabular text-[11px] font-extrabold flex items-center gap-1 shadow-[0_0_12px_rgba(251,191,36,0.35)] animate-pulse">
          <span>🏆 #1 SPOT</span>
        </div>
      )}

      {stickerId === 'party-confetti' && (
        <div className="px-2.5 py-1 rounded-full bg-pink-950/90 border border-pink-400 text-pink-200 font-mono-tabular text-[11px] font-extrabold flex items-center gap-1 animate-bounce">
          <span>🎉 LAUNCH DROP</span>
        </div>
      )}
    </div>
  );
};
