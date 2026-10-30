import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatedStickerId,
  BillboardSlot,
  CategoryOption,
  CityId,
  HeadlineFontMood,
  LogoMode,
  MonogramShape,
  PosterData,
  StickerScale,
  StickerTint,
  ThemePresetId,
  VectorIconId,
} from '../types/frontpage';
import {
  ANIMATED_STICKERS_CATALOG,
  CATEGORIES,
  GOOGLE_TRUST_PRESETS,
  HEADLINE_FONT_MOODS,
  THEME_PRESETS,
  VECTOR_ICONS_CATALOG,
  buildWhatsAppGroupViralUrl,
  checkAntiSquatterCooldown,
  formatCountdown,
  formatMidnightCountdown,
  formatSoldOutHoursMinutes,
  generateSecretToken,
  getCategoryEmoji,
  getCityById,
  getHeadlineFontMood,
  getThemeById,
  sanitizeTextInput,
  simulateGooglePlacesLookup,
  validateIndianWhatsApp,
  validateUpiVpa,
} from '../utils/frontpageLogic';
import { renderStoryToCanvas } from '../utils/canvasStoryGenerator';
import {
  AnimatedLoopSticker,
  BrandLogoSeal,
  CategoryVectorIconBadge,
  GoogleMapsTrustPill,
} from './BrandVisuals';
import {
  AlertOctagon,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Flame,
  Lock,
  MessageCircle,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface PosterBuilderCheckoutModalProps {
  isOpen: boolean;
  initialMode: 'builder' | 'checkout' | 'viral-kit' | 'sold-out';
  selectedCityId: CityId;
  targetSlot: BillboardSlot | null;
  todaySlot: BillboardSlot | undefined;
  tomorrowSlot: BillboardSlot | undefined;
  allSlots: BillboardSlot[];
  lockSecondsLeft: number;
  midnightSecondsLeft: number;
  onClose: () => void;
  onSelectSlotInBuilder?: (slotId: string) => void;
  onLockSlot: (slotId: string, draftPoster: PosterData) => void;
  onCompletePayment: (slotId: string, finalizedPoster: PosterData) => void;
}

export const PosterBuilderCheckoutModal: React.FC<
  PosterBuilderCheckoutModalProps
> = ({
  isOpen,
  initialMode,
  selectedCityId,
  targetSlot,
  todaySlot,
  tomorrowSlot,
  allSlots,
  lockSecondsLeft,
  midnightSecondsLeft,
  onClose,
  onSelectSlotInBuilder,
  onLockSlot,
  onCompletePayment,
}) => {
  const [step, setStep] = useState<
    'builder' | 'checkout' | 'viral-kit' | 'sold-out'
  >(initialMode);

  // Builder Sub-Tab for clean organization: Copy & Identity vs Stickers & Icons
  const [builderTab, setBuilderTab] = useState<'copy-identity' | 'stickers-icons'>(
    'copy-identity'
  );

  // Core Copy & Theme state
  const [businessName, setBusinessName] = useState('Namma Filter Coffee Bar');
  const [category, setCategory] = useState<CategoryOption>('☕ CAFÉ & DINING');
  const [headline, setHeadline] = useState(
    'Brass-Drip Filter Kaapi + Warm Khara Bath Combo at Just ₹99 Today'
  );
  const [subtext, setSubtext] = useState(
    '12th Main, HAL 2nd Stage, Indiranagar (Opp. New Horizon School) • 7:00 AM – 9:30 PM • Claim token on WhatsApp'
  );
  const [whatsappNumber, setWhatsappNumber] = useState('9740088991');
  const [themeId, setThemeId] = useState<ThemePresetId>('newspaper-bw');
  const [fontMood, setFontMood] = useState<HeadlineFontMood>('inter-tight');

  // 1. Brand Logo & Identity state
  const [logoMode, setLogoMode] = useState<LogoMode>('auto-fetch');
  const [brandDomainOrHandle, setBrandDomainOrHandle] = useState(
    'bluetokaicoffee.com'
  );
  const [monogramShape, setMonogramShape] = useState<MonogramShape>('circle');

  // 2. Google Maps Rating & Trust Badge state
  const [includeGoogleTrust, setIncludeGoogleTrust] = useState<boolean>(true);
  const [googleTrustText, setGoogleTrustText] = useState<string>(
    GOOGLE_TRUST_PRESETS[0]
  );

  // 3. Transparent Animated GIF Stickers & 24 Vector Icons state
  const [animatedStickerId, setAnimatedStickerId] =
    useState<AnimatedStickerId>('steaming-coffee');
  const [vectorIconId, setVectorIconId] = useState<VectorIconId>('Coffee');
  const [stickerScale, setStickerScale] = useState<StickerScale>('md');
  const [stickerTint, setStickerTint] = useState<StickerTint>('gold');
  const [iconSearchQuery, setIconSearchQuery] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  // Checkout state
  const [upiVpa, setUpiVpa] = useState('merchant@okaxis');
  const [upiError, setUpiError] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState('X9K2P7');

  // Viral kit copy states
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedPermalink, setCopiedPermalink] = useState(false);
  const [downloadedStory, setDownloadedStory] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(initialMode);
    setBuilderTab('copy-identity');
    setFormError(null);
    setUpiError(null);

    if (targetSlot?.poster) {
      setBusinessName(targetSlot.poster.businessName);
      setCategory(targetSlot.poster.category);
      setHeadline(targetSlot.poster.headline);
      setSubtext(targetSlot.poster.subtext);
      setWhatsappNumber(targetSlot.poster.whatsappNumber);
      setThemeId(targetSlot.poster.themeId);
      setFontMood(
        targetSlot.poster.fontMood && targetSlot.poster.fontMood !== 'fraunces'
          ? targetSlot.poster.fontMood
          : 'inter-tight'
      );
      setUpiVpa(targetSlot.poster.upiVpa || 'merchant@okaxis');
      setGeneratedToken(targetSlot.poster.takedownToken);
      setLogoMode(targetSlot.poster.logoMode || 'auto-fetch');
      setBrandDomainOrHandle(
        targetSlot.poster.brandDomainOrHandle || 'bluetokaicoffee.com'
      );
      setMonogramShape(targetSlot.poster.monogramShape || 'circle');
      setIncludeGoogleTrust(targetSlot.poster.includeGoogleTrust !== false);
      setGoogleTrustText(
        targetSlot.poster.googleTrustText || GOOGLE_TRUST_PRESETS[0]
      );
      setAnimatedStickerId(
        targetSlot.poster.animatedStickerId || 'steaming-coffee'
      );
      setVectorIconId(targetSlot.poster.vectorIconId || 'Coffee');
      setStickerScale(targetSlot.poster.stickerScale || 'md');
      setStickerTint(targetSlot.poster.stickerTint || 'gold');
    } else {
      const city = getCityById(targetSlot?.cityId || selectedCityId);
      setBusinessName(`${city.name} Craft Roasters`);
      setCategory('☕ CAFÉ & DINING');
      setHeadline(
        'Buy 1 Get 1 Free Signature Cold Brew & Fresh Sourdough Toast All Day'
      );
      setSubtext(
        `${city.landmarkExample} • Open 8:00 AM – 10:00 PM • Show WhatsApp claim pass at billing counter`
      );
      setWhatsappNumber('9740088991');
      setThemeId('newspaper-bw');
      setFontMood('inter-tight');
      setLogoMode('auto-fetch');
      setBrandDomainOrHandle('bluetokaicoffee.com');
      setMonogramShape('circle');
      setIncludeGoogleTrust(true);
      setGoogleTrustText(GOOGLE_TRUST_PRESETS[0]);
      setAnimatedStickerId('steaming-coffee');
      setVectorIconId('Coffee');
      setStickerScale('md');
      setStickerTint('gold');
      setGeneratedToken(
        generateSecretToken(`${targetSlot?.slotId || selectedCityId}-${Date.now()}`)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetSlot?.slotId, initialMode]);

  // Draw the 1080x1920 HTML5 Canvas whenever step is 'viral-kit'
  useEffect(() => {
    if (step === 'viral-kit' && canvasRef.current && targetSlot) {
      const activePoster: PosterData = targetSlot.poster || {
        businessName,
        category,
        headline,
        subtext,
        whatsappNumber,
        themeId,
        fontMood,
        upiVpa,
        takedownToken: generatedToken,
        bookedAtIso: new Date().toISOString(),
        logoMode,
        brandDomainOrHandle,
        monogramShape,
        includeGoogleTrust,
        googleTrustText,
        animatedStickerId,
        vectorIconId,
        stickerScale,
        stickerTint,
      };
      renderStoryToCanvas(canvasRef.current, {
        ...targetSlot,
        poster: activePoster,
      });
    }
  }, [
    step,
    targetSlot,
    businessName,
    category,
    headline,
    subtext,
    whatsappNumber,
    themeId,
    fontMood,
    upiVpa,
    generatedToken,
    logoMode,
    brandDomainOrHandle,
    monogramShape,
    includeGoogleTrust,
    googleTrustText,
    animatedStickerId,
    vectorIconId,
    stickerScale,
    stickerTint,
  ]);

  const filteredVectorIcons = useMemo(() => {
    const q = iconSearchQuery.trim().toLowerCase();
    if (!q) return VECTOR_ICONS_CATALOG;
    return VECTOR_ICONS_CATALOG.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [iconSearchQuery]);

  if (!isOpen) return null;

  const city = getCityById(targetSlot?.cityId || selectedCityId);
  const selectedTheme = getThemeById(themeId);

  // STEP 0: 100% SOLD OUT FOR CITY (Both Today & Tomorrow are Booked)
  if (step === 'sold-out' || !targetSlot) {
    const tomorrowTeaserName = tomorrowSlot?.poster
      ? `${getCategoryEmoji(tomorrowSlot.poster.category)} ${tomorrowSlot.poster.businessName}`
      : 'Exclusive Local Partner';

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sold-out-modal-title"
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          data-testid="sold-out-modal"
          className="bg-[#09090B] text-white border-2 border-amber-500/80 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6"
        >
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Flame className="w-6 h-6 text-amber-400 shrink-0" />
              <span className="font-mono-tabular text-xs uppercase tracking-widest text-amber-400 font-bold">
                STRICT 2-DAY WINDOW (TODAY &amp; TOMORROW ONLY)
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sold out modal"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 text-center">
            <h2
              id="sold-out-modal-title"
              data-testid="sold-out-headline"
              className="font-editorial text-2xl sm:text-3xl font-bold text-white leading-snug"
            >
              🔥 100% SOLD OUT — Next ₹99 Slot Unlocks at Midnight in{' '}
              {formatSoldOutHoursMinutes(midnightSecondsLeft)}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
              Both <strong>TODAY ({todaySlot?.displayDate || 'OCT 27'})</strong>{' '}
              and <strong>TOMORROW ({tomorrowSlot?.displayDate || 'OCT 28'})</strong>{' '}
              in {city.name} have been claimed. We never open a 3rd day ahead.
            </p>
          </div>

          {/* Live Countdown to Midnight (00:00 IST) */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-700 text-center space-y-1.5">
            <div className="text-xs font-mono-tabular uppercase tracking-widest text-emerald-400 font-semibold">
              NEXT ₹99 BILLBOARD WINDOW UNLOCKS IN
            </div>
            <div
              data-testid="midnight-countdown-timer"
              className="font-mono-tabular text-4xl sm:text-5xl font-extrabold tracking-wider text-white"
            >
              {formatMidnightCountdown(midnightSecondsLeft)}
            </div>
            <div className="text-[11px] font-mono-tabular text-zinc-400">
              Countdown to 00:00:00 IST Rollover ({formatSoldOutHoursMinutes(midnightSecondsLeft)} remaining)
            </div>
          </div>

          {/* Tomorrow's Mystery Teaser (Category + Business Name ONLY, Headline Hidden) */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-1.5">
            <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>TOMORROW&apos;S MYSTERY TEASER (NO EARLY SPOILERS)</span>
            </div>
            <p className="font-mono-tabular text-xs sm:text-sm font-bold text-amber-200 leading-relaxed">
              🔒 TOMORROW&apos;S SPOTLIGHT LOCKED BY: {tomorrowTeaserName} —
              SECRET OFFER REVEALS AT MIDNIGHT (00:00 IST) ⚡
            </p>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm cursor-pointer transition-colors"
            >
              Got It — I&apos;ll Return at Midnight (00:00 IST)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Live Anti-Squatter Cooldown Check
  const cooldownCheck = checkAntiSquatterCooldown(
    allSlots,
    targetSlot.cityId,
    targetSlot.dateIso,
    businessName,
    whatsappNumber
  );

  const phoneValidation = validateIndianWhatsApp(whatsappNumber);

  const buildCurrentPosterPayload = (
    tokenValue: string,
    vpaValue?: string
  ): PosterData => ({
    businessName: businessName.trim(),
    category,
    headline: headline.trim(),
    subtext: subtext.trim(),
    whatsappNumber: phoneValidation.cleaned || whatsappNumber,
    themeId,
    fontMood,
    upiVpa: vpaValue,
    takedownToken: tokenValue,
    bookedAtIso: new Date().toISOString(),
    logoMode,
    brandDomainOrHandle: brandDomainOrHandle.trim(),
    monogramShape,
    includeGoogleTrust,
    googleTrustText,
    animatedStickerId,
    vectorIconId,
    stickerScale,
    stickerTint,
  });

  const handleProceedToLock = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (businessName.trim().length < 2) {
      setFormError('Please enter your Business / Brand Name (2–30 chars).');
      return;
    }
    if (headline.trim().length < 8) {
      setFormError(
        'Please enter a clear Headline Offer (at least 8 characters).'
      );
      return;
    }
    if (subtext.trim().length < 10) {
      setFormError(
        'Please include your locality landmark and timings in Subtext.'
      );
      return;
    }
    if (!phoneValidation.valid) {
      setFormError(
        phoneValidation.error || 'Invalid 10-digit WhatsApp number.'
      );
      return;
    }
    if (cooldownCheck.blocked) {
      setFormError(cooldownCheck.reason || 'Anti-Monopoly rule triggered.');
      return;
    }

    const token = generateSecretToken(
      `${targetSlot.slotId}-${businessName}-${whatsappNumber}`
    );
    setGeneratedToken(token);

    const draftPoster = buildCurrentPosterPayload(token);
    onLockSlot(targetSlot.slotId, draftPoster);
    setStep('checkout');
  };

  const handleSimulateUpiSuccess = () => {
    setUpiError(null);
    const vpaCheck = validateUpiVpa(upiVpa);
    if (!vpaCheck.valid) {
      setUpiError(vpaCheck.error || 'Enter a valid UPI ID.');
      return;
    }

    const finalizedPoster = buildCurrentPosterPayload(
      generatedToken,
      vpaCheck.cleaned
    );

    onCompletePayment(targetSlot.slotId, finalizedPoster);
    setStep('viral-kit');
  };

  const handleDownloadStoryPng = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `frontpage99-${targetSlot.slotId}-story-1080x1920.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadedStory(true);
      setTimeout(() => setDownloadedStory(false), 3000);
    } catch {
      // Fallback if external image tainted canvas: re-render with monogram mode
      renderStoryToCanvas(canvasRef.current, {
        ...targetSlot,
        poster: {
          ...buildCurrentPosterPayload(generatedToken, upiVpa),
          logoMode: 'monogram',
        },
      });
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `frontpage99-${targetSlot.slotId}-story-1080x1920.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadedStory(true);
      setTimeout(() => setDownloadedStory(false), 3000);
    }
  };

  const activeViralSlot: BillboardSlot = {
    ...targetSlot,
    status: 'SOLD',
    poster:
      targetSlot.poster || buildCurrentPosterPayload(generatedToken, upiVpa),
  };

  const existingSoldSlotInCity = allSlots.find(
    (s) => s.cityId === targetSlot.cityId && s.status === 'SOLD' && s.poster
  );

  const isTodayOpen =
    todaySlot?.status === 'OPEN' || todaySlot?.status === 'TAKEN_DOWN';
  const isTomorrowOpen =
    tomorrowSlot?.status === 'OPEN' || tomorrowSlot?.status === 'TAKEN_DOWN';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-modal-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs overflow-y-auto flex items-start sm:items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-[#FBF9F5] border-2 border-stone-900 rounded-2xl max-w-5xl w-full max-h-[94dvh] my-auto overflow-y-auto shadow-2xl">
        {/* Top Modal Header */}
        <div className="px-5 py-2.5 bg-[#F4F0E8] border-b border-stone-300 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div>
            <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-stone-600">
              {city.editionStamp} • BOOKING {targetSlot.dayLabel} (
              {targetSlot.displayDate}) • STRICT 2-DAY WINDOW • /b/
              {targetSlot.slotId}
            </div>
            <h2
              id="builder-modal-title"
              className="font-editorial text-base sm:text-xl font-bold text-stone-900"
            >
              {step === 'builder' &&
                `Book ${targetSlot.dayLabel}'s (${targetSlot.displayDate}) ${city.name} Front Page — ₹99`}
              {step === 'checkout' &&
                '5-Minute Concurrency Lock & ₹99 UPI Intent Checkout'}
              {step === 'viral-kit' &&
                'Post-Payment Merchant Viral Kit & 9:16 Story Generator'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close builder modal"
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/80 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: MICRO-POSTER BUILDER */}
        {step === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-5">
            {/* Left Column: Controls & Form (7 cols) */}
            <form
              onSubmit={handleProceedToLock}
              className="lg:col-span-7 space-y-2.5"
            >
              {/* HONEST SLOT STATUS BAR & 2-DAY SELECTOR (NO FAKE TIMERS ON EMPTY SLOTS) */}
              <div className="p-2.5 rounded-xl bg-white border border-stone-300 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono-tabular uppercase tracking-wider font-bold text-stone-700">
                    Select 2-Day Window Slot ({city.name}):
                  </span>
                  <div className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-300">
                    {todaySlot && (
                      <button
                        type="button"
                        data-testid="select-slot-today"
                        onClick={() =>
                          onSelectSlotInBuilder &&
                          onSelectSlotInBuilder(todaySlot.slotId)
                        }
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono-tabular font-bold transition-colors cursor-pointer ${
                          targetSlot.dayLabel === 'TODAY'
                            ? 'bg-stone-900 text-white'
                            : 'text-stone-700 hover:text-stone-900'
                        }`}
                      >
                        TODAY ({todaySlot.displayDate}){' '}
                        {isTodayOpen ? '· EMPTY (₹99)' : '· LIVE'}
                      </button>
                    )}
                    {tomorrowSlot && (
                      <button
                        type="button"
                        data-testid="select-slot-tomorrow"
                        onClick={() =>
                          onSelectSlotInBuilder &&
                          onSelectSlotInBuilder(tomorrowSlot.slotId)
                        }
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono-tabular font-bold transition-colors cursor-pointer ${
                          targetSlot.dayLabel === 'TOMORROW'
                            ? 'bg-stone-900 text-white'
                            : 'text-stone-700 hover:text-stone-900'
                        }`}
                      >
                        TOMORROW ({tomorrowSlot.displayDate}){' '}
                        {isTomorrowOpen ? '· EMPTY (₹99)' : '· LOCKED'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Honest Info Pill for Selected Empty Slot */}
                {targetSlot.dayLabel === 'TODAY' ? (
                  <div
                    data-testid="honest-slot-pill-today"
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono-tabular text-xs font-semibold flex items-center justify-between gap-2"
                  >
                    <span>
                      ⚡ Goes Live Instantly for the rest of today (until 23:59
                      IST)
                    </span>
                    {!isTodayOpen && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                        BOOKED TODAY
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    data-testid="honest-slot-pill-tomorrow"
                    className="px-3 py-1.5 rounded-lg bg-amber-950 text-amber-200 border border-amber-500/40 font-mono-tabular text-xs font-semibold flex items-center gap-2"
                  >
                    <span>
                      📅 Full 24-Hour Edition (00:00 to 23:59 IST Tomorrow)
                    </span>
                  </div>
                )}
              </div>

              {/* Sub-Navigation Tabs inside Builder: Copy & Brand Identity vs Stickers & Icons */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-stone-200/80 border border-stone-300">
                <button
                  type="button"
                  data-testid="tab-copy-identity"
                  onClick={() => setBuilderTab('copy-identity')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    builderTab === 'copy-identity'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  🏢 1. Copy, Brand Logo &amp; Google Trust
                </button>
                <button
                  type="button"
                  data-testid="tab-stickers-icons"
                  onClick={() => setBuilderTab('stickers-icons')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    builderTab === 'stickers-icons'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  🎨 2. Stickers &amp; 24 Vector Icons
                </button>
              </div>

              {builderTab === 'copy-identity' ? (
                <div className="space-y-3">
                  {/* 10 Curated Aesthetic Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                        Select Poster Aesthetic Preset (10 Curated Themes)
                      </label>
                      <span className="text-xs text-stone-600 font-mono-tabular">
                        {selectedTheme.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {THEME_PRESETS.map((preset) => {
                        const active = preset.id === themeId;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setThemeId(preset.id)}
                            className={`px-2 py-1.5 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              active
                                ? 'border-stone-900 ring-2 ring-stone-900 bg-white text-stone-900'
                                : 'border-stone-300 bg-white/70 text-stone-700 hover:border-stone-500'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-sm shrink-0 border border-black/20"
                              style={{ backgroundColor: preset.canvasBgStart }}
                            />
                            <span className="truncate">{preset.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 🏢 BRAND LOGO & IDENTITY SECTION (NO FILE UPLOADS) */}
                  <div className="p-3 rounded-xl bg-white border border-stone-300 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        🏢 Brand Logo &amp; Identity (Zero Raw Uploads)
                      </span>
                      <div className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-300">
                        <button
                          type="button"
                          data-testid="logo-mode-autofetch"
                          onClick={() => setLogoMode('auto-fetch')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                            logoMode === 'auto-fetch'
                              ? 'bg-stone-900 text-white'
                              : 'text-stone-700 hover:text-stone-900'
                          }`}
                        >
                          Auto-Fetch Website/IG
                        </button>
                        <button
                          type="button"
                          data-testid="logo-mode-monogram"
                          onClick={() => setLogoMode('monogram')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                            logoMode === 'monogram'
                              ? 'bg-stone-900 text-white'
                              : 'text-stone-700 hover:text-stone-900'
                          }`}
                        >
                          Instant Luxury Monogram
                        </button>
                      </div>
                    </div>

                    {logoMode === 'auto-fetch' ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            data-testid="brand-domain-input"
                            value={brandDomainOrHandle}
                            onChange={(e) =>
                              setBrandDomainOrHandle(
                                sanitizeTextInput(e.target.value, 60)
                              )
                            }
                            placeholder="e.g. bluetokaicoffee.com, cornerhouseicecreams.com, cult.fit or @handle"
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#FBF9F5] border border-stone-300 font-mono-tabular text-xs text-stone-900"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-stone-500">Quick test:</span>
                          {[
                            'bluetokaicoffee.com',
                            'cornerhouseicecreams.com',
                            'cult.fit',
                            'subko.coffee',
                          ].map((dom) => (
                            <button
                              key={dom}
                              type="button"
                              onClick={() => setBrandDomainOrHandle(dom)}
                              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 border border-stone-300 font-mono-tabular text-stone-800 cursor-pointer"
                            >
                              {dom}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className="text-xs text-stone-600">
                          Auto-generates gold vector crest from your Business
                          Initials &amp; Category icon:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setMonogramShape('circle')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                              monogramShape === 'circle'
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-stone-100 text-stone-700 border-stone-300'
                            }`}
                          >
                            ◯ Circular Seal
                          </button>
                          <button
                            type="button"
                            onClick={() => setMonogramShape('shield')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                              monogramShape === 'shield'
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-stone-100 text-stone-700 border-stone-300'
                            }`}
                          >
                            🛡️ Royal Shield
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category & Business Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="poster-category"
                        className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-1"
                      >
                        Category
                      </label>
                      <select
                        id="poster-category"
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value as CategoryOption)
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-sm font-medium text-stone-900"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="poster-business-name"
                          className="block text-xs font-bold uppercase tracking-wider text-stone-800"
                        >
                          Business / Brand Name
                        </label>
                        <span className="text-[11px] font-mono-tabular text-stone-500">
                          {businessName.length}/30
                        </span>
                      </div>
                      <input
                        id="poster-business-name"
                        type="text"
                        maxLength={30}
                        value={businessName}
                        onChange={(e) =>
                          setBusinessName(sanitizeTextInput(e.target.value, 30))
                        }
                        placeholder="e.g. Blue Tokai Indiranagar"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-sm text-stone-900"
                      />
                    </div>
                  </div>

                  {/* ⭐ GOOGLE MAPS RATING & TRUST BADGE */}
                  <div className="p-3 rounded-xl bg-white border border-stone-300 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          data-testid="toggle-google-trust"
                          checked={includeGoogleTrust}
                          onChange={(e) =>
                            setIncludeGoogleTrust(e.target.checked)
                          }
                          className="w-4 h-4 accent-[#9A3412] rounded cursor-pointer"
                        />
                        <span>⭐ Include Google Maps Trust Pill</span>
                      </label>
                      {includeGoogleTrust && (
                        <button
                          type="button"
                          onClick={() =>
                            setGoogleTrustText(
                              simulateGooglePlacesLookup(
                                businessName,
                                city.name
                              )
                            )
                          }
                          className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono-tabular text-[10px] font-semibold cursor-pointer hover:bg-emerald-900"
                        >
                          ↻ Auto-Lookup Places Rating
                        </button>
                      )}
                    </div>

                    {includeGoogleTrust && (
                      <select
                        aria-label="Select Google Maps Trust Badge Preset"
                        value={googleTrustText}
                        onChange={(e) => setGoogleTrustText(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#FBF9F5] border border-stone-300 font-mono-tabular text-xs text-stone-900"
                      >
                        {!GOOGLE_TRUST_PRESETS.includes(googleTrustText) && (
                          <option value={googleTrustText}>
                            {googleTrustText}
                          </option>
                        )}
                        {GOOGLE_TRUST_PRESETS.map((preset) => (
                          <option key={preset} value={preset}>
                            {preset}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Poster Builder Font Mood Switcher (3 Cognitive Typography Roles) */}
                  <div className="p-2.5 rounded-xl bg-white border border-stone-300 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        ✒️ Headline Font Mood
                      </span>
                      <span className="text-[11px] font-mono-tabular text-stone-500">
                        {getHeadlineFontMood(fontMood).label}
                      </span>
                    </div>
                    <div
                      data-testid="font-mood-switcher"
                      className="grid grid-cols-1 sm:grid-cols-3 gap-1.5"
                    >
                      {HEADLINE_FONT_MOODS.map((mood) => {
                        const active = fontMood === mood.id;
                        return (
                          <button
                            key={mood.id}
                            type="button"
                            data-testid={`font-mood-${mood.id}`}
                            onClick={() => setFontMood(mood.id)}
                            style={{ fontFamily: mood.fontFamilyCss }}
                            className={`px-2.5 py-1.5 rounded-lg border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                              active
                                ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                                : 'border-stone-300 bg-[#FBF9F5] text-stone-800 hover:border-stone-500'
                            }`}
                          >
                            <span className="truncate">{mood.label}</span>
                            {active && (
                              <Check className="w-3.5 h-3.5 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Headline Offer (max 80 chars) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="poster-headline"
                        className="block text-xs font-bold uppercase tracking-wider text-stone-800"
                      >
                        High-Impact Headline Offer
                      </label>
                      <span className="text-[11px] font-mono-tabular text-stone-500">
                        {headline.length}/80
                      </span>
                    </div>
                    <textarea
                      id="poster-headline"
                      rows={2}
                      maxLength={80}
                      value={headline}
                      onChange={(e) =>
                        setHeadline(sanitizeTextInput(e.target.value, 80))
                      }
                      placeholder="e.g. Flat 50% Off Artisanal Cold Brews All Day Today"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-sm text-stone-900 resize-none"
                    />
                  </div>

                  {/* Subtext & 10-Digit WhatsApp in compact grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-7">
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="poster-subtext"
                          className="block text-xs font-bold uppercase tracking-wider text-stone-800"
                        >
                          Locality Landmark &amp; Timings
                        </label>
                        <span className="text-[11px] font-mono-tabular text-stone-500">
                          {subtext.length}/160
                        </span>
                      </div>
                      <input
                        id="poster-subtext"
                        type="text"
                        maxLength={160}
                        value={subtext}
                        onChange={(e) =>
                          setSubtext(sanitizeTextInput(e.target.value, 160))
                        }
                        placeholder="100 Feet Road, Indiranagar • Open 7:30 AM – 10:30 PM"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs text-stone-900"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="poster-whatsapp"
                          className="block text-xs font-bold uppercase tracking-wider text-stone-800"
                        >
                          WhatsApp Number
                        </label>
                        <span className="text-[10px] font-mono-tabular text-stone-500">
                          {whatsappNumber.replace(/\D/g, '').length}/10
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2.5 py-1.5 rounded-l-lg bg-stone-200 border border-r-0 border-stone-300 font-mono-tabular text-xs font-semibold text-stone-800">
                          +91
                        </span>
                        <input
                          id="poster-whatsapp"
                          type="tel"
                          maxLength={10}
                          value={whatsappNumber}
                          onChange={(e) =>
                            setWhatsappNumber(
                              e.target.value.replace(/\D/g, '').slice(0, 10)
                            )
                          }
                          placeholder="9845011223"
                          className="w-full px-2.5 py-1.5 rounded-r-lg bg-white border border-stone-300 font-mono-tabular text-xs text-stone-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB 2: 🎨 STICKERS & ICONS (8 ANIMATED LOOP STICKERS + 24 VECTOR ICONS) */
                <div
                  data-testid="stickers-icons-panel"
                  className="space-y-3.5 bg-white p-3.5 rounded-xl border border-stone-300"
                >
                  {/* Resize & Tint Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-200">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase text-stone-700">
                        Size:
                      </span>
                      {(['sm', 'md', 'lg'] as StickerScale[]).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setStickerScale(sz)}
                          className={`px-2 py-0.5 rounded text-xs font-mono-tabular font-bold uppercase cursor-pointer ${
                            stickerScale === sz
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase text-stone-700">
                        Icon Tint:
                      </span>
                      {(
                        [
                          { id: 'auto', label: 'Auto' },
                          { id: 'gold', label: 'Gold' },
                          { id: 'emerald', label: 'Mint' },
                          { id: 'coral', label: 'Coral' },
                          { id: 'cyan', label: 'Cyan' },
                        ] as { id: StickerTint; label: string }[]
                      ).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setStickerTint(t.id)}
                          className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                            stickerTint === t.id
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* a) ✨ Animated Loop Stickers (8 built-in CSS/SVG keyframe-animated stickers) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        ✨ Animated Loop Stickers (8 Keyframe Stickers)
                      </span>
                      <button
                        type="button"
                        onClick={() => setAnimatedStickerId('none')}
                        className="text-[11px] underline text-stone-500 hover:text-stone-900 cursor-pointer"
                      >
                        Clear Sticker
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {ANIMATED_STICKERS_CATALOG.map((st) => {
                        const active = animatedStickerId === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            data-testid={`pick-sticker-${st.id}`}
                            onClick={() => setAnimatedStickerId(st.id)}
                            className={`px-2.5 py-2 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-1 ${
                              active
                                ? 'border-stone-900 bg-stone-900 text-white'
                                : 'border-stone-300 bg-[#FBF9F5] text-stone-800 hover:border-stone-500'
                            }`}
                          >
                            <span className="truncate">{st.shortLabel}</span>
                            {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* b) 🎯 Category Vector Icons (24 searchable Lucide/SVG icons) */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        🎯 Category Vector Icons (24 Crisp Icons)
                      </span>
                      <div className="relative flex-1 max-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          data-testid="vector-icon-search"
                          value={iconSearchQuery}
                          onChange={(e) => setIconSearchQuery(e.target.value)}
                          placeholder="Search 24 icons..."
                          className="w-full pl-7 pr-2 py-1 rounded-md bg-[#FBF9F5] border border-stone-300 text-xs text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-[175px] overflow-y-auto p-1">
                      {filteredVectorIcons.map((ic) => {
                        const active = vectorIconId === ic.id;
                        return (
                          <button
                            key={ic.id}
                            type="button"
                            data-testid={`pick-vector-${ic.id}`}
                            onClick={() => setVectorIconId(ic.id)}
                            className={`p-1.5 rounded-lg border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                              active
                                ? 'border-stone-900 bg-stone-900 text-white'
                                : 'border-stone-200 bg-[#FBF9F5] text-stone-800 hover:border-stone-400'
                            }`}
                          >
                            <CategoryVectorIconBadge
                              iconId={ic.id}
                              scale="sm"
                              tint={active ? 'gold' : 'auto'}
                            />
                            <span className="text-[10px] font-medium truncate w-full">
                              {ic.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Helper to test Anti-Squatter Cooldown */}
              {existingSoldSlotInCity?.poster && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-stone-200/70 border border-stone-300 text-xs text-stone-700">
                  <span>Want to test the 7-day Anti-Squatter Guardrail?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessName(
                        existingSoldSlotInCity.poster!.businessName
                      );
                      setWhatsappNumber(
                        existingSoldSlotInCity.poster!.whatsappNumber
                      );
                    }}
                    className="underline font-semibold text-stone-900 hover:text-[#9A3412] cursor-pointer"
                  >
                    Test Repeat Business ({existingSoldSlotInCity.poster.businessName})
                  </button>
                </div>
              )}

              {/* Anti-Squatter Guardrail Alert */}
              {cooldownCheck.blocked && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-amber-50 border-2 border-amber-700 text-xs font-semibold text-amber-950 flex items-start gap-2.5"
                >
                  <AlertOctagon className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <div>{cooldownCheck.reason}</div>
                    {cooldownCheck.matchedSlot && (
                      <div className="text-xs font-normal text-amber-900 mt-0.5">
                        Conflict found with {city.name} slot{' '}
                        <code className="font-mono-tabular font-bold">
                          /b/{cooldownCheck.matchedSlot.slotId}
                        </code>{' '}
                        ({cooldownCheck.matchedSlot.displayDate}).
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formError && !cooldownCheck.blocked && (
                <div
                  role="alert"
                  className="p-2.5 rounded-lg bg-red-50 border border-red-300 text-xs font-semibold text-red-900"
                >
                  {formError}
                </div>
              )}

              <div className="pt-1 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cooldownCheck.blocked}
                  className={`px-5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                    cooldownCheck.blocked
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-[#9A3412] hover:bg-[#7C2D12] text-white'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Lock Slot &amp; Pay ₹99</span>
                </button>
              </div>
            </form>

            {/* Right Column: Live Interactive Poster Preview (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="text-xs font-mono-tabular uppercase tracking-wider text-stone-600 mb-2">
                LIVE INTERACTIVE POSTER PREVIEW (LOGO + TRUST + STICKERS)
              </div>
              <div
                data-testid="builder-live-preview-card"
                className={`flex-1 min-h-[410px] rounded-2xl border-2 ${selectedTheme.borderClass} ${selectedTheme.bgClass} ${selectedTheme.textClass} p-5 flex flex-col justify-between shadow-md`}
              >
                <div>
                  {/* Top Header: Brand Logo/Monogram Seal + Business Name on left; #AD on right */}
                  <div
                    className={`flex items-center justify-between gap-2.5 pb-3 border-b ${selectedTheme.borderClass}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BrandLogoSeal
                        businessName={businessName || 'Brand'}
                        category={category}
                        logoMode={logoMode}
                        brandDomainOrHandle={brandDomainOrHandle}
                        monogramShape={monogramShape}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">
                          {businessName || 'Your Business Name'}
                        </div>
                        <div
                          className={`text-[10px] font-mono-tabular uppercase tracking-wider ${selectedTheme.kickerClass} truncate`}
                        >
                          {category}
                        </div>
                      </div>
                    </div>

                    <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono-tabular text-[10px] font-bold shrink-0">
                      #AD
                    </span>
                  </div>

                  {/* Google Maps Trust Pill + Animated Sticker + Vector Icon Row */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    {includeGoogleTrust && (
                      <GoogleMapsTrustPill text={googleTrustText} compact />
                    )}

                    <div className="flex items-center gap-1.5 ml-auto">
                      <CategoryVectorIconBadge
                        iconId={vectorIconId}
                        scale={stickerScale}
                        tint={stickerTint}
                      />
                      <AnimatedLoopSticker
                        stickerId={animatedStickerId}
                        scale={stickerScale}
                      />
                    </div>
                  </div>

                  <h3
                    data-testid="builder-preview-headline"
                    style={{
                      fontFamily: getHeadlineFontMood(fontMood).fontFamilyCss,
                    }}
                    className={`${getHeadlineFontMood(fontMood).cssClass} text-xl sm:text-2xl font-extrabold mt-3.5 leading-[1.12] tracking-tight`}
                  >
                    {headline || 'Your High-Impact Headline Appears Here'}
                  </h3>

                  <div
                    className={`w-12 border-b-2 ${selectedTheme.borderClass} my-3.5`}
                  />

                  <p
                    className={`font-jakarta text-xs sm:text-sm ${selectedTheme.subtextClass} leading-relaxed`}
                  >
                    {subtext ||
                      'Your locality landmark, store timings, and offer instructions appear here.'}
                  </p>
                </div>

                <div
                  className={`mt-5 pt-3.5 border-t ${selectedTheme.borderClass}`}
                >
                  <div
                    className={`w-full py-2.5 px-4 rounded-xl font-jakarta font-bold text-xs flex items-center justify-center gap-2 ${selectedTheme.ctaBgClass} ${selectedTheme.ctaTextClass}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      💬 Claim Offer on WhatsApp (+91{' '}
                      {whatsappNumber || '98XXXXXXXX'})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: 5-MINUTE CONCURRENCY LOCK & UPI INTENT CHECKOUT */}
        {step === 'checkout' && (
          <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-900 shrink-0" />
                <div>
                  <div className="text-xs font-mono-tabular uppercase font-bold text-amber-900">
                    SLOT STATUS: RESERVED (5-MINUTE CONCURRENCY LOCK ACTIVE)
                  </div>
                  <div className="text-xs text-amber-800">
                    Other merchants in {city.name} are blocked from booking{' '}
                    {targetSlot.displayDate} while your timer is active.
                  </div>
                </div>
              </div>
              <div
                aria-label="Concurrency lock countdown timer"
                className="font-mono-tabular text-2xl font-extrabold text-amber-950 bg-amber-200/80 px-3.5 py-1.5 rounded-lg"
              >
                {formatCountdown(lockSecondsLeft)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-white border border-stone-300 rounded-2xl p-5">
              <div className="sm:col-span-5 flex flex-col items-center text-center p-4 rounded-xl bg-[#FBF9F5] border border-stone-300">
                <div className="text-[11px] font-mono-tabular uppercase font-bold text-stone-700 mb-2">
                  SCAN WITH ANY UPI APP
                </div>
                <div className="w-40 h-40 bg-white border-2 border-stone-900 rounded-lg p-3 flex flex-col items-center justify-center">
                  <QrCode className="w-28 h-28 text-stone-900" />
                  <span className="mt-1 font-mono-tabular text-[10px] font-bold text-stone-700">
                    ₹99.00 · FRONTPAGE99
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 mt-2 font-mono-tabular">
                  VPA: frontpage99@okaxis
                </div>
              </div>

              <div className="sm:col-span-7 space-y-4">
                <div>
                  <div className="text-xs font-mono-tabular uppercase text-stone-500">
                    MERCHANT CHECKOUT SUMMARY
                  </div>
                  <div className="text-base font-bold text-stone-900 mt-0.5">
                    {businessName} — {city.name} ({targetSlot.dayLabel} ·{' '}
                    {targetSlot.displayDate})
                  </div>
                  <div className="text-xs text-stone-600 font-mono-tabular mt-0.5">
                    Flat 24-Hr Billboard Fee: <strong>₹99.00</strong> (Inclusive
                    of GST)
                  </div>
                </div>

                <a
                  href={`upi://pay?pa=frontpage99@okaxis&pn=FrontPage99&am=99.00&cu=INR&tn=${encodeURIComponent(
                    `FrontPage99 ${targetSlot.slotId}`
                  )}`}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Pay ₹99 via GPay / PhonePe / Paytm</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div>
                  <label
                    htmlFor="customer-upi-vpa"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-1"
                  >
                    Customer UPI VPA (180-Day KYC Audit Log)
                  </label>
                  <input
                    id="customer-upi-vpa"
                    type="text"
                    value={upiVpa}
                    onChange={(e) => {
                      setUpiVpa(e.target.value);
                      setUpiError(null);
                    }}
                    placeholder="merchant@okaxis"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9F5] border border-stone-300 font-mono-tabular text-sm text-stone-900"
                  />
                  {upiError && (
                    <p className="text-xs font-semibold text-red-700 mt-1">
                      {upiError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSimulateUpiSuccess}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Simulate Instant UPI Webhook Success</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-600">
              <button
                type="button"
                onClick={() => setStep('builder')}
                className="underline hover:text-stone-900 cursor-pointer"
              >
                ← Back to Edit Poster Copy
              </button>
              <span>Zero accounts · Instant permalink &amp; story kit</span>
            </div>
          </div>
        )}

        {/* STEP 3: POST-PAYMENT MERCHANT VIRAL KIT & HTML5 CANVAS IMAGE GENERATOR */}
        {step === 'viral-kit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-emerald-950">
                    Slot Confirmed! {activeViralSlot.poster?.businessName} Locked{' '}
                    {city.name} ({targetSlot.dayLabel} · {targetSlot.displayDate})
                  </div>
                  <div className="text-xs text-emerald-900 mt-0.5">
                    {targetSlot.dayLabel === 'TOMORROW'
                      ? 'Your Category & Business Name are now live on the bottom Mystery Teaser! Full offer reveals at Midnight (00:00 IST).'
                      : 'Your billboard is now LIVE on the main city stage until 23:59 IST.'}
                  </div>
                </div>
              </div>

              {/* 1. 6-Character Secret Takedown Token */}
              <div className="p-4 rounded-xl bg-white border-2 border-stone-900 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono-tabular uppercase font-bold text-[#9A3412]">
                    6-CHARACTER SECRET TAKEDOWN TOKEN
                  </span>
                  <span className="text-[11px] font-semibold text-stone-600">
                    Save Now — Cannot Be Recovered
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-[#F4F0E8] px-4 py-2.5 rounded-lg border border-stone-300">
                  <code
                    data-testid="secret-takedown-token"
                    className="font-mono-tabular text-2xl font-extrabold tracking-widest text-stone-900"
                  >
                    {activeViralSlot.poster?.takedownToken}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        activeViralSlot.poster?.takedownToken || ''
                      );
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-md bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Token</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-stone-600">
                  Use this token in the micro-footer&apos;s{' '}
                  <strong>Owner? Click here to remove poster</strong> link if you
                  sell out early.
                </p>
              </div>

              {/* 2. Immutable Permalink */}
              <div className="p-4 rounded-xl bg-white border border-stone-300 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono-tabular uppercase font-bold text-stone-800">
                    IMMUTABLE PERMALINK
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `https://frontpage99.in/b/${targetSlot.slotId}`
                      );
                      setCopiedPermalink(true);
                      setTimeout(() => setCopiedPermalink(false), 2500);
                    }}
                    className="text-xs font-semibold underline text-stone-800 hover:text-[#9A3412] cursor-pointer"
                  >
                    {copiedPermalink ? 'Copied URL!' : 'Copy Permalink'}
                  </button>
                </div>

                <div className="px-3.5 py-2 rounded-lg bg-[#F4F0E8] border border-stone-300 font-mono-tabular text-sm font-bold text-stone-900">
                  frontpage99.in/b/{targetSlot.slotId}
                </div>
              </div>

              {/* 3. Download 9:16 Story PNG & Share to WhatsApp Groups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadStoryPng}
                  className="py-3 px-4 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>
                    {downloadedStory
                      ? 'Downloaded 1080×1920 PNG!'
                      : 'Download WhatsApp Status / IG Story PNG'}
                  </span>
                </button>

                <a
                  href={buildWhatsAppGroupViralUrl(activeViralSlot, city.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Share to WhatsApp Groups</span>
                </a>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('sold-out')}
                  className="font-semibold underline text-[#9A3412] hover:text-stone-900 cursor-pointer"
                >
                  Preview &ldquo;🔥 100% SOLD OUT&rdquo; Public Screen →
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-900 font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Real 1080x1920 HTML5 Canvas Preview */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="text-xs font-mono-tabular uppercase tracking-wider text-stone-600 mb-2">
                REAL HTML5 CANVAS (1080×1920 9:16 STORY GRAPHIC)
              </div>
              <div className="w-full max-w-[250px] aspect-[9/16] rounded-xl overflow-hidden border-2 border-stone-900 shadow-md bg-stone-900">
                <canvas
                  ref={canvasRef}
                  data-testid="story-generator-canvas"
                  width={1080}
                  height={1920}
                  className="w-full h-full object-contain block"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
