/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { BillboardSlot, CityId, PosterData } from './types/frontpage';
import {
  CANONICAL_TODAY_ISO,
  CANONICAL_TOMORROW_ISO,
  CITIES,
  buildBottomTickerParts,
  buildCityJsonLdSchema,
  buildTopTickerParts,
  createInitialSlots,
  ensureCityTwoDaySlots,
  getCityById,
  getCityPastEditionsArchive,
  getDefaultCityTrendingHeadline,
  isValidIndianCitySlug,
  normalizeCitySlug,
} from './utils/frontpageLogic';
import {
  CityPulseWeatherAqi,
  fetchLiveCityPulseWeatherAqi,
  fetchLiveCityTrendingNews,
  geocodeIndianCity,
  getCitySlots,
  recordTelemetry,
  reserveSlot,
  verifyUpiWebhookSimulation,
  writeLocalSlots,
} from './lib/api';
import { LiveBillboardCard } from './components/LiveBillboardCard';
import { PosterBuilderCheckoutModal } from './components/PosterBuilderCheckoutModal';
import { TakedownModal } from './components/TakedownModal';
import { LegalReportModal } from './components/LegalReportModal';
import { Plus } from 'lucide-react';

function getSlugFromPathname(pathname: string): string {
  const raw = pathname.replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  if (!raw) return 'bengaluru';
  if (raw.startsWith('b/')) {
    const slotIdPart = raw.slice(2);
    const shortPrefix = slotIdPart.split('-')[0];
    const matchedCity = CITIES.find(
      (c) => c.shortCode === shortPrefix || c.id === shortPrefix
    );
    return matchedCity ? matchedCity.id : 'bengaluru';
  }
  return raw.split('/')[0] || 'bengaluru';
}

export default function App() {
  // 1. URL-driven city slug state
  const [rawUrlSlug, setRawUrlSlug] = useState<string>(() => {
    if (typeof window === 'undefined') return 'bengaluru';
    const currentPath = window.location.pathname;
    if (currentPath === '/' || !currentPath) {
      try {
        window.history.replaceState(null, '', '/bengaluru');
      } catch {
        // ignore in restricted environments
      }
      return 'bengaluru';
    }
    return getSlugFromPathname(currentPath);
  });

  // Archived Edition preview state (triggered from Past Editions Archive or /b/:slotId URL)
  const [archivedPreviewSlot, setArchivedPreviewSlot] =
    useState<BillboardSlot | null>(() => {
      if (typeof window === 'undefined') return null;
      const raw = window.location.pathname
        .replace(/^\/+|\/+$/g, '')
        .trim()
        .toLowerCase();
      if (raw.startsWith('b/')) {
        const slotId = raw.slice(2);
        const citySlug = getSlugFromPathname(window.location.pathname);
        const archives = getCityPastEditionsArchive(citySlug);
        return archives.find((a) => a.slotId === slotId) || null;
      }
      return null;
    });

  // Subtle dev toggle to preview Empty Slot vs Booked Slot
  const [forceEmptySlotView, setForceEmptySlotView] = useState(false);

  // Live Open-Meteo Geocoding validation & coordinates state (`country_code === "IN"`)
  const [isValidIndianCity, setIsValidIndianCity] = useState<boolean>(() =>
    isValidIndianCitySlug(rawUrlSlug)
  );
  const [geocodedCityName, setGeocodedCityName] = useState<string | undefined>(
    undefined
  );
  const [liveCityPulse, setLiveCityPulse] =
    useState<CityPulseWeatherAqi | null>(null);

  const selectedCityId: CityId = useMemo(
    () => normalizeCitySlug(rawUrlSlug),
    [rawUrlSlug]
  );

  const currentCity = useMemo(
    () => getCityById(selectedCityId),
    [selectedCityId]
  );

  // Listen to browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const nextSlug = getSlugFromPathname(window.location.pathname);
      setRawUrlSlug(nextSlug);
      setForceEmptySlotView(false);
      const raw = window.location.pathname
        .replace(/^\/+|\/+$/g, '')
        .trim()
        .toLowerCase();
      if (raw.startsWith('b/')) {
        const slotId = raw.slice(2);
        const archives = getCityPastEditionsArchive(nextSlug);
        setArchivedPreviewSlot(
          archives.find((a) => a.slotId === slotId) || null
        );
      } else {
        setArchivedPreviewSlot(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // 1a. Live Indian City Validation via Open-Meteo Geocoding API + Live Parallel Weather & AQI Fetch
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Immediate synchronous check while geocoding resolves
    const initialValid = isValidIndianCitySlug(rawUrlSlug);
    setIsValidIndianCity(initialValid);

    const verifyAndLoadCityPulse = async () => {
      const geo = await geocodeIndianCity(rawUrlSlug, controller.signal);
      if (cancelled) return;

      setIsValidIndianCity(geo.valid);
      if (!geo.valid) {
        setLiveCityPulse(null);
        return;
      }

      setGeocodedCityName(geo.name || currentCity.name);
      const pulse = await fetchLiveCityPulseWeatherAqi(
        geo.latitude,
        geo.longitude,
        controller.signal
      );
      if (!cancelled && pulse) {
        setLiveCityPulse(pulse);
      }
    };

    verifyAndLoadCityPulse().finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [rawUrlSlug, currentCity.name]);

  // 1b. Live City Trending News Headline on Top Ticker (via rss2json + allorigins XML parser fallback)
  const [cityTrendingHeadline, setCityTrendingHeadline] = useState<string>(() =>
    getDefaultCityTrendingHeadline(selectedCityId)
  );

  useEffect(() => {
    setCityTrendingHeadline(getDefaultCityTrendingHeadline(selectedCityId));
    if (!isValidIndianCity) return;

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    fetchLiveCityTrendingNews(currentCity.name, controller.signal)
      .then((liveHeadline) => {
        if (!cancelled && liveHeadline) {
          setCityTrendingHeadline(liveHeadline);
        }
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [selectedCityId, currentCity.name, isValidIndianCity]);

  // 1c. Slots & Dynamic Telemetry routed through `src/lib/api.ts`
  const [slots, setSlots] = useState<BillboardSlot[]>(() =>
    createInitialSlots()
  );
  const [viewCount, setViewCount] = useState<number>(
    () => currentCity.baseViews + 1
  );
  const [claimCount, setClaimCount] = useState<number>(
    () => currentCity.baseClaims
  );
  const [activeOrderId, setActiveOrderId] = useState<string>(
    'order_fp99_initial'
  );

  useEffect(() => {
    if (!isValidIndianCity) return;
    let cancelled = false;

    const loadSlotsAndIncrementView = async () => {
      const { slots: fetchedSlots } = await getCitySlots(selectedCityId);
      if (cancelled) return;

      const ensured = ensureCityTwoDaySlots(fetchedSlots, selectedCityId);
      setSlots(ensured);

      const activeToday = ensured.find(
        (s) =>
          normalizeCitySlug(s.cityId) === selectedCityId &&
          s.dateIso === CANONICAL_TODAY_ISO
      );
      const targetSlotId =
        activeToday?.slotId || `${selectedCityId}-${CANONICAL_TODAY_ISO}`;

      // Dynamically increment unique view on load via src/lib/api.ts
      const updatedTelemetry = await recordTelemetry(
        targetSlotId,
        selectedCityId,
        'view'
      );
      if (!cancelled) {
        setViewCount(updatedTelemetry.views);
        setClaimCount(updatedTelemetry.claims);
      }
    };

    loadSlotsAndIncrementView();

    return () => {
      cancelled = true;
    };
  }, [selectedCityId, isValidIndianCity]);

  const handleIncrementClaimCount = async () => {
    const targetSlotId =
      displayedSlot?.slotId || `${selectedCityId}-${CANONICAL_TODAY_ISO}`;
    const updated = await recordTelemetry(
      targetSlotId,
      selectedCityId,
      'claim'
    );
    setViewCount(updated.views);
    setClaimCount(updated.claims);
  };

  // Builder / Checkout / Viral Kit / Sold-Out Modal state
  const [builderModalOpen, setBuilderModalOpen] = useState(false);
  const [builderInitialMode, setBuilderInitialMode] = useState<
    'builder' | 'checkout' | 'viral-kit' | 'sold-out'
  >('builder');
  const [modalTargetSlotId, setModalTargetSlotId] = useState<string | null>(
    null
  );

  // 5-Minute (300s) concurrency lock countdown state
  const [reservedSlotId, setReservedSlotId] = useState<string | null>(null);
  const [lockSecondsLeft, setLockSecondsLeft] = useState<number>(300);

  // Live countdown to Midnight (00:00 IST) for the 100% Sold Out screen
  const [midnightSecondsLeft, setMidnightSecondsLeft] = useState<number>(12495);

  // Self-Serve Takedown & Legal Modals
  const [takedownModalOpen, setTakedownModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  // Persist slots via api helper
  useEffect(() => {
    writeLocalSlots(slots);
  }, [slots]);

  // Midnight (00:00 IST) live ticking countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setMidnightSecondsLeft((prev) => (prev <= 1 ? 86400 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 5-Minute Concurrency Lock Countdown Timer
  useEffect(() => {
    if (!reservedSlotId) return;

    const timer = setInterval(() => {
      setLockSecondsLeft((prev) => {
        if (prev <= 1) {
          setSlots((currentSlots) =>
            currentSlots.map((s) =>
              s.slotId === reservedSlotId && s.status === 'RESERVED'
                ? { ...s, status: 'OPEN', poster: undefined }
                : s
            )
          );
          setReservedSlotId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [reservedSlotId]);

  const navigateToCityPath = (pathInput: string) => {
    const slug = getSlugFromPathname(pathInput);
    try {
      window.history.pushState(null, '', `/${slug}`);
    } catch {
      // ignore
    }
    setRawUrlSlug(slug);
    setArchivedPreviewSlot(null);
    setForceEmptySlotView(false);
  };

  const handleSelectArchivedEdition = (archivedSlot: BillboardSlot) => {
    setArchivedPreviewSlot(archivedSlot);
    setForceEmptySlotView(false);
    try {
      window.history.pushState(null, '', `/b/${archivedSlot.slotId}`);
    } catch {
      // ignore
    }
  };

  const handleReturnToLiveToday = () => {
    setArchivedPreviewSlot(null);
    try {
      window.history.pushState(null, '', `/${selectedCityId}`);
    } catch {
      // ignore
    }
  };

  // Strict 2-Day Window: ONLY Today and Tomorrow exist for the active city
  const todaySlot = useMemo(() => {
    const found = slots.find(
      (s) =>
        normalizeCitySlug(s.cityId) === selectedCityId &&
        s.dateIso === CANONICAL_TODAY_ISO
    );
    if (found) return found;
    return {
      slotId: `${selectedCityId}-${CANONICAL_TODAY_ISO}`,
      cityId: selectedCityId,
      dateIso: CANONICAL_TODAY_ISO,
      dayLabel: 'TODAY' as const,
      displayDate: 'OCT 27',
      fullDateLabel: 'Tuesday, Oct 27, 2026',
      status: 'OPEN' as const,
    };
  }, [slots, selectedCityId]);

  const tomorrowSlot = useMemo(() => {
    const found = slots.find(
      (s) =>
        normalizeCitySlug(s.cityId) === selectedCityId &&
        s.dateIso === CANONICAL_TOMORROW_ISO
    );
    if (found) return found;
    return {
      slotId: `${selectedCityId}-${CANONICAL_TOMORROW_ISO}`,
      cityId: selectedCityId,
      dateIso: CANONICAL_TOMORROW_ISO,
      dayLabel: 'TOMORROW' as const,
      displayDate: 'OCT 28',
      fullDateLabel: 'Wednesday, Oct 28, 2026',
      status: 'OPEN' as const,
    };
  }, [slots, selectedCityId]);

  // Effective Today Slot (respects the dev "Switch View: [Booked / Empty Slot]" toggle)
  const effectiveTodaySlot: BillboardSlot = useMemo(() => {
    if (forceEmptySlotView) {
      return {
        ...todaySlot,
        status: 'OPEN',
        poster: undefined,
      };
    }
    return todaySlot;
  }, [todaySlot, forceEmptySlotView]);

  const displayedSlot = archivedPreviewSlot || effectiveTodaySlot;

  const isCurrentlyShowingEmptySlot =
    displayedSlot.status === 'OPEN' ||
    displayedSlot.status === 'TAKEN_DOWN' ||
    !displayedSlot.poster;

  // SEO ARCHIVE & JSON-LD SCHEMA LAYER: Dynamically inject <script type="application/ld+json"> into document.head
  useEffect(() => {
    if (typeof document === 'undefined' || !isValidIndianCity) return;
    const schemaId = 'frontpage99-jsonld-schema';
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = schemaId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    const schemaData = buildCityJsonLdSchema(currentCity, displayedSlot);
    scriptEl.textContent = JSON.stringify(schemaData, null, 2);
  }, [currentCity, displayedSlot, isValidIndianCity]);

  const modalTargetSlot = useMemo(
    () => slots.find((s) => s.slotId === modalTargetSlotId) || null,
    [slots, modalTargetSlotId]
  );

  // 3. Top Ticker Parts: FRONTPAGE99.IN/BENGALURU (#fbbf24) • THU, 29 OCT 2026 (#e5e7eb) • BENGALURU PULSE: (#fbbf24) [Headline] (#e5e7eb)
  const topTickerParts = useMemo(
    () => buildTopTickerParts(selectedCityId, cityTrendingHeadline),
    [selectedCityId, cityTrendingHeadline]
  );

  // 3. Bottom Ticker Parts: TODAY: (#fbbf24) [Merchant] (#e5e7eb) • TOMORROW: (#fbbf24) [Merchant/EMPTY] (#e5e7eb)
  const bottomTickerParts = useMemo(
    () => buildBottomTickerParts(effectiveTodaySlot, tomorrowSlot),
    [effectiveTodaySlot, tomorrowSlot]
  );

  // Strict 2-Day Booking Window Logic:
  const handleOpenBookingFlow = () => {
    if (
      effectiveTodaySlot.status === 'OPEN' ||
      effectiveTodaySlot.status === 'RESERVED'
    ) {
      setModalTargetSlotId(todaySlot.slotId);
      setBuilderInitialMode(
        todaySlot.status === 'RESERVED' ? 'checkout' : 'builder'
      );
      setBuilderModalOpen(true);
      return;
    }

    if (
      tomorrowSlot &&
      (tomorrowSlot.status === 'OPEN' || tomorrowSlot.status === 'RESERVED')
    ) {
      setModalTargetSlotId(tomorrowSlot.slotId);
      setBuilderInitialMode(
        tomorrowSlot.status === 'RESERVED' ? 'checkout' : 'builder'
      );
      setBuilderModalOpen(true);
      return;
    }

    setModalTargetSlotId(tomorrowSlot?.slotId || todaySlot.slotId);
    setBuilderInitialMode('sold-out');
    setBuilderModalOpen(true);
  };

  const handleLockSlot = async (slotId: string, draftPoster: PosterData) => {
    setForceEmptySlotView(false);
    setReservedSlotId(slotId);
    const target = slots.find((s) => s.slotId === slotId);
    const res = await reserveSlot({
      slotId,
      citySlug: selectedCityId,
      slotDate: target?.dateIso || CANONICAL_TODAY_ISO,
      poster: draftPoster,
    });
    setActiveOrderId(res.orderId);
    setLockSecondsLeft(res.expiresInSeconds);
    setSlots(res.updatedSlots);
  };

  const handleCompletePayment = async (
    slotId: string,
    finalizedPoster: PosterData
  ) => {
    setForceEmptySlotView(false);
    setReservedSlotId(null);
    const res = await verifyUpiWebhookSimulation(
      activeOrderId,
      finalizedPoster.upiVpa || 'merchant@okaxis',
      slotId,
      finalizedPoster
    );
    setSlots(res.updatedSlots);
  };

  const handleExecuteTakedown = (
    updatedSlots: BillboardSlot[],
    takenDownSlot: BillboardSlot
  ) => {
    setSlots(updatedSlots);
    navigateToCityPath(`/${takenDownSlot.cityId}`);
  };

  const handleToggleBookedEmptyView = () => {
    if (archivedPreviewSlot) {
      setArchivedPreviewSlot(null);
    }
    setForceEmptySlotView((prev) => !prev);
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-[#FBF9F5] text-[#1C1917] relative">
      {/* EXPLICIT RAILWAY STATION LED DOT-MATRIX KEYFRAMES, PAUSE-ON-HOVER & SINGLE-PASS (65vw PADDING) STYLES */}
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .led-board {
          height: 32px;
          background-color: #0c0d0e;
          background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 0);
          background-size: 3px 3px;
          overflow: hidden;
          display: flex;
          align-items: center;
          position: relative;
        }
        .led-track-left {
          display: flex;
          width: max-content;
          white-space: nowrap;
          animation: marqueeLeft 26s linear infinite;
          will-change: transform;
        }
        .led-track-right {
          display: flex;
          width: max-content;
          white-space: nowrap;
          animation: marqueeRight 26s linear infinite;
          will-change: transform;
        }
        .retro-ticker:hover .ticker-track {
          animation-play-state: paused !important;
        }
        .led-single-pass {
          padding-right: 65vw;
          display: inline-block;
        }
        .led-text-railway {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-variant-numeric: tabular-nums;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #e5e7eb;
          text-shadow: 0 0 8px rgba(251, 191, 36, 0.25);
        }
      `}</style>

      {/* 1. TOP ROTATING RAILWAY STATION LED DOT-MATRIX TICKER (UNIFIED RAILWAY AMBER #fbbf24 + WARM IVORY #e5e7eb) */}
      <div
        role="region"
        aria-label="Top Railway Station LED Ticker"
        data-testid="top-led-ticker"
        className="retro-ticker led-board shrink-0 border-b border-zinc-800 cursor-default select-none"
      >
        <div className="ticker-track led-track-left">
          <span className="led-text-railway uppercase led-single-pass">
            <span className="text-[#fbbf24]">{topTickerParts.domainLabel}</span>
            <span className="text-[#fbbf24]">{'  •  '}</span>
            <span className="text-[#e5e7eb]">{topTickerParts.dateLabel}</span>
            <span className="text-[#fbbf24]">{'  •  '}</span>
            <span className="text-[#fbbf24]">{topTickerParts.pulseLabel}</span>
            <span className="text-[#e5e7eb]"> {topTickerParts.headlineText}</span>
          </span>
          <span
            className="led-text-railway uppercase led-single-pass"
            aria-hidden="true"
          >
            <span className="text-[#fbbf24]">{topTickerParts.domainLabel}</span>
            <span className="text-[#fbbf24]">{'  •  '}</span>
            <span className="text-[#e5e7eb]">{topTickerParts.dateLabel}</span>
            <span className="text-[#fbbf24]">{'  •  '}</span>
            <span className="text-[#fbbf24]">{topTickerParts.pulseLabel}</span>
            <span className="text-[#e5e7eb]"> {topTickerParts.headlineText}</span>
          </span>
        </div>
      </div>

      {/* 2. CENTER STAGE OR 404 NON-INDIAN CITY SCREEN */}
      {!isValidIndianCity ? (
        <main
          data-testid="city-not-found-404"
          className="flex-1 min-h-0 w-full flex items-center justify-center p-4"
        >
          <div className="max-w-lg w-full rounded-2xl bg-[#0c0d0e] border-2 border-zinc-800 p-8 text-center shadow-2xl space-y-5">
            <div className="inline-block px-3 py-1 rounded bg-red-500/10 border border-red-500/30 font-mono-tabular text-xs font-bold text-red-400 tracking-widest uppercase">
              RAILWAY LED DISPATCH • ERROR 404
            </div>
            <h1 className="font-mono-tabular text-xl sm:text-2xl font-extrabold text-[#fcd34d] tracking-wider uppercase">
              404 — CITY NOT FOUND IN INDIA
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono-tabular leading-relaxed">
              The route <code className="text-white">/{rawUrlSlug}</code> did
              not match any verified municipality with{' '}
              <code className="text-emerald-300">country_code === &quot;IN&quot;</code>.
              FrontPage99 operates exclusively across Indian cities.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {['bengaluru', 'mumbai', 'delhi', 'jaipur', 'mysuru', 'pune'].map(
                (citySlug) => (
                  <button
                    key={citySlug}
                    type="button"
                    onClick={() => navigateToCityPath(`/${citySlug}`)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 font-mono-tabular text-xs text-[#6ee7b7] cursor-pointer"
                  >
                    /{citySlug}
                  </button>
                )
              )}
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-col items-center justify-center overflow-hidden">
          <LiveBillboardCard
            slot={displayedSlot}
            cityDisplayName={geocodedCityName || currentCity.name}
            livePulse={liveCityPulse}
            viewCount={viewCount}
            claimCount={claimCount}
            onIncrementClaimCount={handleIncrementClaimCount}
            onOpenBookingModal={handleOpenBookingFlow}
            isArchivedPreview={Boolean(archivedPreviewSlot)}
            onReturnToLiveToday={handleReturnToLiveToday}
          />
        </main>
      )}

      {/* 3. BOTTOM ROTATING RAILWAY STATION LED TICKER (UNIFIED RAILWAY AMBER #fbbf24 + WARM IVORY #e5e7eb) & ZERO-SCROLLBAR MICRO-FOOTER */}
      <div className="shrink-0 bg-[#0c0d0e] border-t border-zinc-800 text-white overflow-hidden w-full">
        <div
          role="region"
          aria-label="Bottom Railway Station LED Ticker"
          data-testid="bottom-amber-ticker"
          className="retro-ticker led-board w-full border-b border-zinc-800/80 cursor-default select-none"
        >
          <div className="ticker-track led-track-right">
            <span className="led-text-railway led-single-pass">
              <span className="text-[#fbbf24]">{bottomTickerParts.todayLabel}</span>
              <span className="text-[#e5e7eb]"> {bottomTickerParts.todayValue}</span>
              <span className="text-[#fbbf24]">{'  •  '}</span>
              <span className="text-[#fbbf24]">{bottomTickerParts.tomorrowLabel}</span>
              <span className="text-[#e5e7eb]"> {bottomTickerParts.tomorrowValue}</span>
            </span>
            <span
              className="led-text-railway led-single-pass"
              aria-hidden="true"
            >
              <span className="text-[#fbbf24]">{bottomTickerParts.todayLabel}</span>
              <span className="text-[#e5e7eb]"> {bottomTickerParts.todayValue}</span>
              <span className="text-[#fbbf24]">{'  •  '}</span>
              <span className="text-[#fbbf24]">{bottomTickerParts.tomorrowLabel}</span>
              <span className="text-[#e5e7eb]"> {bottomTickerParts.tomorrowValue}</span>
            </span>
          </div>
        </div>

        {/* Micro-Footer: "+ Book ₹99 Slot" on left; "Mode: Booked/Empty", "Owner Takedown", and "Legal" on right (fits 320px with overflow-hidden w-full) */}
        <footer
          data-testid="bottom-utility-footer"
          className="max-w-6xl mx-auto px-2 sm:px-5 h-11 flex items-center justify-between gap-1.5 text-xs overflow-hidden w-full"
        >
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleOpenBookingFlow}
              data-testid="footer-book-slot-btn"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] text-white font-jakarta font-bold text-[11px] sm:text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] shrink-0" />
              <span>Book ₹99 Slot</span>
            </button>
          </div>

          <div
            data-testid="footer-right-links"
            className="flex items-center justify-end gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-zinc-300 overflow-hidden"
          >
            <button
              type="button"
              onClick={handleToggleBookedEmptyView}
              data-testid="footer-switch-view-toggle"
              className="px-1.5 sm:px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 font-mono-tabular text-[10px] text-[#fbbf24] hover:text-amber-300 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              Mode: Booked/Empty
            </button>

            <span aria-hidden="true" className="text-zinc-600 shrink-0">
              ·
            </span>

            <button
              type="button"
              onClick={() => setTakedownModalOpen(true)}
              data-testid="footer-owner-takedown-btn"
              className="hover:text-[#fbbf24] underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Owner Takedown
            </button>

            <span aria-hidden="true" className="text-zinc-600 shrink-0">
              ·
            </span>

            <button
              type="button"
              onClick={() => setLegalModalOpen(true)}
              data-testid="footer-legal-report-btn"
              className="hover:text-[#fbbf24] underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Legal
            </button>
          </div>
        </footer>
      </div>

      {/* MICRO-POSTER BUILDER, 5-MIN UPI LOCK, VIRAL KIT & 100% SOLD OUT MODAL */}
      <PosterBuilderCheckoutModal
        isOpen={builderModalOpen}
        initialMode={builderInitialMode}
        selectedCityId={selectedCityId}
        targetSlot={modalTargetSlot}
        todaySlot={effectiveTodaySlot}
        tomorrowSlot={tomorrowSlot}
        allSlots={slots}
        lockSecondsLeft={lockSecondsLeft}
        midnightSecondsLeft={midnightSecondsLeft}
        onClose={() => setBuilderModalOpen(false)}
        onSelectSlotInBuilder={(slotId) => setModalTargetSlotId(slotId)}
        onLockSlot={handleLockSlot}
        onCompletePayment={handleCompletePayment}
      />

      {/* OWNER 6-CHAR TOKEN TAKEDOWN MODAL */}
      <TakedownModal
        isOpen={takedownModalOpen}
        onClose={() => setTakedownModalOpen(false)}
        slots={slots}
        defaultCityId={selectedCityId}
        onExecuteTakedown={handleExecuteTakedown}
      />

      {/* LEGAL & REPORT + PAST EDITIONS ARCHIVE (SEO VAULT) MODAL */}
      <LegalReportModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        activeSlotId={todaySlot.slotId}
        cityId={selectedCityId}
        onSelectArchivedEdition={handleSelectArchivedEdition}
      />
    </div>
  );
}
