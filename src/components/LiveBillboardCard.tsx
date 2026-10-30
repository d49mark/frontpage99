import React, { useEffect, useState } from 'react';
import { BillboardSlot } from '../types/frontpage';
import {
  CURATED_FINANCIAL_QUOTES,
  buildWhatsAppClaimUrl,
  getCityById,
  getHeadlineFontMood,
  getThemeById,
} from '../utils/frontpageLogic';
import { CityPulseWeatherAqi } from '../lib/api';
import {
  AnimatedLoopSticker,
  BrandLogoSeal,
  CategoryVectorIconBadge,
  GoogleMapsTrustPill,
} from './BrandVisuals';
import { Check } from 'lucide-react';

interface LiveBillboardCardProps {
  slot: BillboardSlot;
  cityDisplayName?: string;
  livePulse?: CityPulseWeatherAqi | null;
  viewCount: number;
  claimCount: number;
  isArchivedPreview?: boolean;
  onReturnToLiveToday?: () => void;
  onIncrementClaimCount: () => void;
  onOpenBookingModal: () => void;
}

export const LiveBillboardCard: React.FC<LiveBillboardCardProps> = ({
  slot,
  cityDisplayName,
  livePulse,
  viewCount,
  claimCount,
  isArchivedPreview = false,
  onReturnToLiveToday,
  onIncrementClaimCount,
  onOpenBookingModal,
}) => {
  const [copiedPermalink, setCopiedPermalink] = useState(false);
  const [liveQuote, setLiveQuote] = useState<{
    quote: string;
    author: string;
  }>(() => ({
    quote: CURATED_FINANCIAL_QUOTES[0].quote,
    author: CURATED_FINANCIAL_QUOTES[0].author,
  }));

  const city = getCityById(slot.cityId);
  const resolvedCityName = cityDisplayName || city.name;
  const permalinkUrl = isArchivedPreview
    ? `https://frontpage99.in/b/${slot.slotId}`
    : `https://frontpage99.in/${city.slug}`;

  const isShowingEmptySlot =
    slot.status === 'TAKEN_DOWN' || slot.status === 'OPEN' || !slot.poster;

  // Fetch a live quote from https://dummyjson.com/quotes/random when the Empty Slot card is displayed
  useEffect(() => {
    if (!isShowingEmptySlot) return;

    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    fetch('https://dummyjson.com/quotes/random', {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: { quote?: string; author?: string }) => {
        if (cancelled) return;
        if (
          typeof data?.quote === 'string' &&
          data.quote.trim() &&
          typeof data?.author === 'string' &&
          data.author.trim()
        ) {
          setLiveQuote({
            quote: data.quote.trim(),
            author: data.author.trim(),
          });
        }
      })
      .catch(() => {
        // Fallback to curated financial quote if offline
      })
      .finally(() => clearTimeout(timer));

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [isShowingEmptySlot, slot.cityId]);

  const handleShareFrontPage = async () => {
    const shareTitle = `${resolvedCityName}'s Digital Front Page — FrontPage99`;
    const shareText = slot.poster
      ? `${slot.poster.businessName}: "${slot.poster.headline}" on FrontPage99/${city.slug}`
      : `View ${resolvedCityName}'s Digital Front Page on FrontPage99`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: permalinkUrl,
        });
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }

    try {
      await navigator.clipboard.writeText(permalinkUrl);
    } catch {
      // ignore
    }
    setCopiedPermalink(true);
    setTimeout(() => setCopiedPermalink(false), 2000);
  };

  const passBadgeCode = `PASS #${city.shortCode.toUpperCase()}-144`;

  // Format live [CITY] PULSE badge string from Open-Meteo real-time response
  const pulseBadgeString = livePulse
    ? `${resolvedCityName.toUpperCase()} PULSE  •  ${livePulse.temperatureC}°C (${livePulse.weatherLabel})  •  AQI ${livePulse.usAqi}`
    : `${resolvedCityName.toUpperCase()} PULSE  •  LIVE WEATHER & AQI`;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center h-full max-h-full gap-2.5">
      {/* ARCHIVED EDITION TOP BANNER (WHEN PREVIEWING SEO VAULT PERMALINK) */}
      {isArchivedPreview && onReturnToLiveToday && (
        <button
          type="button"
          onClick={onReturnToLiveToday}
          data-testid="archived-edition-return-banner"
          className="w-full py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 border-2 border-zinc-950 font-mono-tabular text-xs font-extrabold tracking-wide text-center shadow-sm cursor-pointer transition-colors"
        >
          Archived Edition ({slot.displayDate} · /b/{slot.slotId}) — Tap to
          return to Today&apos;s Live Front Page
        </button>
      )}

      {/* FUNCTIONAL TELEMETRY BADGE:
          - Tiny pulsing green status dot (#22c55e) on the left
          - Crisp white (#f3f4f6) for "[views] viewed today"
          - Warm amber (#fbbf24) for "🔥 [claims] people clicked claim" */}
      <div className="w-full flex items-center justify-center">
        <div
          data-testid="floating-viewership-badge"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-950 text-[#f3f4f6] border border-zinc-800 shadow-sm text-xs font-mono-tabular font-semibold whitespace-nowrap"
        >
          <span
            data-testid="visitor-status-dot"
            className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shrink-0"
            aria-hidden="true"
          />
          {isShowingEmptySlot ? (
            <span data-testid="visitor-viewed-text" className="text-[#f3f4f6]">
              {viewCount.toLocaleString('en-IN')} viewed today
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <span data-testid="visitor-viewed-text" className="text-[#f3f4f6]">
                {viewCount.toLocaleString('en-IN')} viewed today
              </span>
              <span className="text-zinc-500">•</span>
              <span data-testid="visitor-claimed-text" className="text-[#fbbf24]">
                🔥 {claimCount.toLocaleString('en-IN')} people clicked claim
              </span>
            </span>
          )}
        </div>
      </div>

      {/* 2. SIMPLIFIED EDITORIAL EMPTY SLOT CARD (ZERO SCROLLBAR, 3 ELEMENTS ONLY) */}
      {isShowingEmptySlot ? (
        <article
          aria-label={`${resolvedCityName} Open Front Page Card`}
          data-testid="empty-slot-editorial-card"
          className="w-full flex-1 max-h-[500px] rounded-2xl border-2 border-stone-900 bg-[#FBF9F5] text-stone-900 p-6 sm:p-8 flex flex-col justify-between shadow-lg overflow-hidden"
        >
          {/* 1) Top Row: [CITY] PULSE badge with live fetched temperature, weather description, and live AQI */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-stone-200">
            <span
              data-testid="city-pulse-badge"
              className="inline-flex items-center px-3 py-1 rounded-full bg-stone-900 text-[#fbbf24] font-mono-tabular text-[11px] font-bold tracking-wider uppercase"
            >
              {pulseBadgeString}
            </span>
          </div>

          {/* 2) Center Body: Live quote fetched from https://dummyjson.com/quotes/random in clean Inter Tight SemiBold typography (no background blocks, zero scrollbar) */}
          <div
            data-testid="empty-slot-quote-body"
            className="my-auto py-4 space-y-4 overflow-hidden"
          >
            <p
              data-testid="empty-slot-quote-text"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
              className="font-inter-tight text-2xl sm:text-3xl font-semibold text-stone-950 leading-snug tracking-tight"
            >
              &ldquo;{liveQuote.quote}&rdquo;
            </p>
            <div className="font-mono-tabular text-xs sm:text-sm font-semibold text-stone-600">
              — {liveQuote.author}
            </div>
          </div>

          {/* 3) Bottom Row: Subtle minimal prompt + compact pill button "Claim for ₹99 ↗" */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
            <span
              data-testid="empty-slot-open-prompt"
              className="font-jakarta text-xs sm:text-sm font-medium text-stone-700"
            >
              Today&apos;s {resolvedCityName} Front Page is open
            </span>

            <button
              type="button"
              onClick={onOpenBookingModal}
              data-testid="empty-slot-claim-cta"
              className="w-auto px-5 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-jakarta text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <span>Claim for ₹99 ↗</span>
            </button>
          </div>
        </article>
      ) : (
        /* ACTIVE 4:5 TODAY BILLBOARD POSTER CARD WITH COMPACT FOOTER ROW */
        (() => {
          const poster = slot.poster!;
          const theme = getThemeById(poster.themeId);
          const headlineMood = getHeadlineFontMood(poster.fontMood);
          const whatsappClaimUrl = buildWhatsAppClaimUrl(
            poster,
            resolvedCityName
          );

          return (
            <article
              aria-label={`${resolvedCityName} Live Billboard Poster`}
              className={`w-full flex-1 max-h-[520px] rounded-2xl border-2 ${theme.borderClass} ${theme.bgClass} ${theme.textClass} p-5 sm:p-7 flex flex-col justify-between shadow-lg overflow-hidden relative`}
            >
              <div>
                {/* Top Header: Brand Logo/Monogram Seal + Business Name on left; #AD badge + subtle Share button (↗) on right */}
                <div
                  className={`flex items-center justify-between gap-3 pb-3.5 border-b ${theme.borderClass}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BrandLogoSeal
                      businessName={poster.businessName}
                      category={poster.category}
                      logoMode={poster.logoMode || 'auto-fetch'}
                      brandDomainOrHandle={poster.brandDomainOrHandle}
                      monogramShape={poster.monogramShape || 'circle'}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-sm sm:text-base tracking-tight truncate">
                        {poster.businessName}
                      </div>
                      <div
                        className={`text-[10px] font-mono-tabular uppercase tracking-wider ${theme.kickerClass} truncate`}
                      >
                        {poster.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      data-testid="poster-ad-tag"
                      className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono-tabular text-[10px] font-bold"
                    >
                      #AD
                    </span>
                    <button
                      type="button"
                      onClick={handleShareFrontPage}
                      aria-label="Share Poster Link"
                      title={copiedPermalink ? 'Link Copied!' : 'Share Poster'}
                      className={`w-7 h-7 rounded-md border flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${theme.secondaryBtnClass}`}
                    >
                      {copiedPermalink ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span aria-hidden="true">↗</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Google Maps Trust Pill + Animated Loop Sticker & Tinted Vector Icon Row */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  {poster.includeGoogleTrust !== false && (
                    <GoogleMapsTrustPill
                      text={
                        poster.googleTrustText ||
                        '⭐ 4.8 (1.2k Google Reviews) • Verified Local Spot'
                      }
                    />
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <CategoryVectorIconBadge
                      iconId={poster.vectorIconId || 'Coffee'}
                      scale={poster.stickerScale || 'md'}
                      tint={poster.stickerTint || 'gold'}
                    />
                    <AnimatedLoopSticker
                      stickerId={poster.animatedStickerId || 'steaming-coffee'}
                      scale={poster.stickerScale || 'md'}
                    />
                  </div>
                </div>

                {/* High-Impact Commercial Billboard Headline (max 80 chars, Inter Tight ExtraBold by default) */}
                <h1
                  data-testid="poster-headline"
                  style={{ fontFamily: headlineMood.fontFamilyCss }}
                  className={`${headlineMood.cssClass} text-2xl sm:text-4xl font-extrabold mt-4 leading-[1.12] tracking-tight`}
                >
                  {poster.headline}
                </h1>

                <div className={`w-14 border-b-2 ${theme.borderClass} my-4`} />

                {/* Subtext / Locality Landmark (max 160 chars) */}
                <p
                  data-testid="poster-subtext"
                  className={`font-jakarta text-sm sm:text-base ${theme.subtextClass} leading-relaxed`}
                >
                  {poster.subtext}
                </p>
              </div>

              {/* COMPACT SLEEK FOOTER ROW: Left PASS #BLR-144 badge, Right compact pill CTA */}
              <div
                className={`mt-5 pt-3.5 border-t ${theme.borderClass} flex items-center justify-between gap-3`}
              >
                <span
                  data-testid="poster-pass-badge"
                  className={`font-mono-tabular text-[11px] font-bold tracking-wider uppercase opacity-75 ${theme.kickerClass}`}
                >
                  {passBadgeCode}
                </span>

                <a
                  href={whatsappClaimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onIncrementClaimCount}
                  data-testid="whatsapp-claim-cta"
                  className={`w-auto px-5 py-2 rounded-full font-jakarta text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98] shadow-xs ${theme.ctaBgClass} ${theme.ctaTextClass}`}
                >
                  <span>💬 Claim Offer ↗</span>
                </a>
              </div>
            </article>
          );
        })()
      )}
    </div>
  );
};
