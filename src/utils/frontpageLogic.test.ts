import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ANIMATED_STICKERS_CATALOG,
  ANTI_MONOPOLY_MESSAGE,
  CITIES,
  CURATED_FINANCIAL_QUOTES,
  HEADLINE_FONT_MOODS,
  THEME_PRESETS,
  VECTOR_ICONS_CATALOG,
  buildBottomTickerText,
  buildCityJsonLdSchema,
  buildGoogleFaviconUrl,
  buildGoogleNewsRss2JsonUrl,
  buildTopTickerText,
  buildUnavatarUrl,
  buildWhatsAppClaimUrl,
  checkAntiSquatterCooldown,
  createInitialSlots,
  ensureCityTwoDaySlots,
  extractCleanDomain,
  formatCountdown,
  formatMidnightCountdown,
  formatSoldOutHoursMinutes,
  getBusinessInitials,
  getCityById,
  getCityPastEditionsArchive,
  getHeadlineFontMood,
  isValidIndianCitySlug,
  sanitizeTextInput,
  simulateGooglePlacesLookup,
  validateIndianWhatsApp,
  validateUpiVpa,
  verifyAndExecuteTakedown,
} from './frontpageLogic';

test('CITIES and THEME_PRESETS match product specification counts and include hyper-local City Tips', () => {
  assert.equal(CITIES.length, 6);
  assert.equal(THEME_PRESETS.length, 10);

  const blr = CITIES.find((c) => c.id === 'bengaluru')!;
  const bom = CITIES.find((c) => c.id === 'mumbai')!;
  const del = CITIES.find((c) => c.id === 'delhi')!;

  assert.equal(blr.baseViews, 7156);
  assert.equal(blr.baseClaims, 142);
  assert.equal(blr.shortCode, 'blr');

  assert.ok(
    blr.cityTips.includes(
      'Bengaluru Tip: Avoid 5 PM traffic on ORR by taking the metro.'
    )
  );
  assert.ok(
    bom.cityTips.includes(
      'Mumbai Tip: Best vada pav is at Kirti College signal after 4 PM.'
    )
  );
  assert.ok(
    del.cityTips.includes(
      'Delhi Tip: Try the lassi at this hidden gem in Karol Bagh.'
    )
  );
});

test('Brand Logo auto-fetch URLs, monogram initials, Google Trust lookup, 8 animated stickers, and 24 vector icons match specification', () => {
  assert.equal(
    extractCleanDomain('https://www.bluetokaicoffee.com/pages/menu'),
    'bluetokaicoffee.com'
  );
  assert.equal(
    buildUnavatarUrl('bluetokaicoffee.com'),
    'https://unavatar.io/bluetokaicoffee.com'
  );
  assert.equal(
    buildUnavatarUrl('@bluetokaicoffee'),
    'https://unavatar.io/instagram/bluetokaicoffee'
  );
  assert.equal(
    buildGoogleFaviconUrl('cornerhouseicecreams.com'),
    'https://www.google.com/s2/favicons?domain=cornerhouseicecreams.com&sz=128'
  );
  assert.equal(getBusinessInitials('Blue Tokai Indiranagar'), 'BT');
  assert.equal(getBusinessInitials('Subko'), 'SU');

  const trust = simulateGooglePlacesLookup('Blue Tokai', 'Bengaluru');
  assert.ok(trust.includes('Google Reviews'));
  assert.ok(trust.includes('Verified Bengaluru Spot'));

  assert.equal(ANIMATED_STICKERS_CATALOG.length, 8);
  assert.equal(VECTOR_ICONS_CATALOG.length, 24);
});

test('isValidIndianCitySlug validates Indian cities and rejects non-Indian cities like /gotham', () => {
  assert.equal(isValidIndianCitySlug('/bengaluru'), true);
  assert.equal(isValidIndianCitySlug('/mumbai'), true);
  assert.equal(isValidIndianCitySlug('/indore'), true);
  assert.equal(isValidIndianCitySlug('/chennai'), true);
  assert.equal(isValidIndianCitySlug('/kolkata'), true);
  assert.equal(isValidIndianCitySlug('/ahmedabad'), true);
  assert.equal(isValidIndianCitySlug('/gotham'), false);
  assert.equal(isValidIndianCitySlug('/metropolis'), false);
});

test('ensureCityTwoDaySlots creates TODAY and TOMORROW slots for any valid Indian city like Indore', () => {
  const initial = createInitialSlots();
  const withIndore = ensureCityTwoDaySlots(initial, 'indore');
  const indoreSlots = withIndore.filter((s) => s.cityId === 'indore');
  assert.equal(indoreSlots.length, 2);
  assert.deepEqual(
    indoreSlots.map((s) => s.dayLabel),
    ['TODAY', 'TOMORROW']
  );
});

test('buildTopTickerText, buildBottomTickerText, rss2json URL, and CURATED_FINANCIAL_QUOTES match specification', () => {
  assert.equal(
    buildTopTickerText(
      'bengaluru',
      'Namma Metro Ridership Hits Record High',
      'THU, 29 OCT 2026'
    ),
    'FRONTPAGE99.IN/BENGALURU  •  THU, 29 OCT 2026  •  BENGALURU PULSE: Namma Metro Ridership Hits Record High'
  );
  assert.equal(
    buildGoogleNewsRss2JsonUrl('Bengaluru'),
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
      'https://news.google.com/rss/search?q=Bengaluru+India+when:1d&hl=en-IN&gl=IN&ceid=IN:en'
    )}`
  );
  assert.equal(CURATED_FINANCIAL_QUOTES.length, 5);
  assert.equal(CURATED_FINANCIAL_QUOTES[0].author, 'Warren Buffett');

  const slots = createInitialSlots();
  const blrToday = slots.find((s) => s.slotId === 'bengaluru-2026-10-27');
  const blrTomorrow = slots.find((s) => s.slotId === 'bengaluru-2026-10-28');

  const openTicker = buildBottomTickerText(blrToday, blrTomorrow);
  assert.equal(
    openTicker,
    'TODAY: Blue Tokai Indiranagar  •  TOMORROW: EMPTY (Open for ₹99)'
  );

  const delToday = slots.find((s) => s.slotId === 'delhi-2026-10-27');
  const delTomorrow = slots.find((s) => s.slotId === 'delhi-2026-10-28');

  const lockedTicker = buildBottomTickerText(delToday, delTomorrow);
  assert.equal(
    lockedTicker,
    'TODAY: Vairagya Salon Khan Market  •  TOMORROW: 🔒 LOCKED BY 📚 Apex IAS Study Circle (Reveals at Midnight)'
  );
  assert.equal(lockedTicker.includes(delTomorrow!.poster!.headline), false);
});

test('buildCityJsonLdSchema and getCityPastEditionsArchive generate valid LocalBusiness + Offer JSON-LD and 5 past permalinks', () => {
  const slots = createInitialSlots();
  const blrToday = slots.find((s) => s.slotId === 'bengaluru-2026-10-27')!;
  const blrCity = getCityById('bengaluru');

  const schema = buildCityJsonLdSchema(blrCity, blrToday) as Record<string, any>;
  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(schema['@type'], 'LocalBusiness');
  assert.equal(schema.name, 'Blue Tokai Indiranagar');
  assert.equal(schema.areaServed.name, 'Bengaluru');
  assert.equal(schema.makesOffer['@type'], 'Offer');
  assert.equal(schema.makesOffer.validThrough, '2026-10-28T23:59:59+05:30');

  const archive = getCityPastEditionsArchive('bengaluru');
  assert.equal(archive.length, 5);
  assert.equal(archive[0].slotId, 'blr-2026-10-28');
  assert.equal(archive[4].slotId, 'blr-2026-10-24');

  assert.equal(formatSoldOutHoursMinutes(12495), '3h:28m');
});

test('validateIndianWhatsApp strictly validates 10-digit numbers starting with 6-9', () => {
  assert.equal(validateIndianWhatsApp('9845011223').valid, true);
  assert.equal(validateIndianWhatsApp('6360112233').valid, true);
  assert.equal(validateIndianWhatsApp('+91 98450 11223').valid, true);
  assert.equal(validateIndianWhatsApp('+91 98450 11223').cleaned, '9845011223');

  assert.equal(validateIndianWhatsApp('5845011223').valid, false);
  assert.equal(validateIndianWhatsApp('984501122').valid, false);
});

test('sanitizeTextInput strips angle brackets and enforces max length', () => {
  const raw = '<script>Flat 50% Off</script>';
  assert.equal(sanitizeTextInput(raw, 80), 'scriptFlat 50% Off/script');
  assert.equal(sanitizeTextInput('A'.repeat(100), 30).length, 30);
});

test('checkAntiSquatterCooldown blocks repeat business name or WhatsApp within 7 days in same city', () => {
  const slots = createInitialSlots();

  const byName = checkAntiSquatterCooldown(
    slots,
    'bengaluru',
    '2026-10-28',
    'blue tokai indiranagar',
    '9900112233'
  );
  assert.equal(byName.blocked, true);
  assert.equal(byName.reason, ANTI_MONOPOLY_MESSAGE);

  const otherCity = checkAntiSquatterCooldown(
    slots,
    'hyderabad',
    '2026-10-28',
    'Blue Tokai Indiranagar',
    '9845011223'
  );
  assert.equal(otherCity.blocked, false);

  const fresh = checkAntiSquatterCooldown(
    slots,
    'bengaluru',
    '2026-10-28',
    'Ctr Malleshwaram Benne Dosa',
    '9740099887'
  );
  assert.equal(fresh.blocked, false);
});

test('buildWhatsAppClaimUrl generates exact wa.me URL with pre-filled message', () => {
  const slots = createInitialSlots();
  const blrToday = slots.find((s) => s.slotId === 'bengaluru-2026-10-27')!;
  const url = buildWhatsAppClaimUrl(blrToday.poster!, 'Bengaluru');
  assert.ok(url.startsWith('https://wa.me/919845011223?text='));
  const decoded = decodeURIComponent(url.split('?text=')[1]);
  assert.equal(
    decoded,
    "Hi! I saw your offer (Flat 50% Off Artisanal Cold Brews & Pour-Overs All Day Today) on today's FrontPage99 Bengaluru Edition and want to claim it."
  );
});

test('formatCountdown and formatMidnightCountdown format timers accurately', () => {
  assert.equal(formatCountdown(300), '05:00');
  assert.equal(formatCountdown(299), '04:59');
  assert.equal(formatMidnightCountdown(3661), '01:01:01');
});

test('verifyAndExecuteTakedown validates token and transitions slot to TAKEN_DOWN', () => {
  const slots = createInitialSlots();
  const wrong = verifyAndExecuteTakedown(slots, 'bengaluru', '2026-10-27', 'WRONG1');
  assert.equal(wrong.success, false);

  const right = verifyAndExecuteTakedown(slots, 'bengaluru', '2026-10-27', 'x9k2p7');
  assert.equal(right.success, true);
  const updatedSlot = right.updatedSlots.find(
    (s) => s.slotId === 'bengaluru-2026-10-27'
  )!;
  assert.equal(updatedSlot.status, 'TAKEN_DOWN');
});

test('validateUpiVpa checks standard Indian UPI ID format', () => {
  assert.equal(validateUpiVpa('merchant@okaxis').valid, true);
  assert.equal(validateUpiVpa('9845011223@ybl').valid, true);
  assert.equal(validateUpiVpa('invalid-vpa').valid, false);
});

test('HEADLINE_FONT_MOODS and getHeadlineFontMood provide Inter Tight as the default commercial billboard font', () => {
  assert.equal(HEADLINE_FONT_MOODS.length, 3);
  assert.deepEqual(
    HEADLINE_FONT_MOODS.map((m) => m.label),
    [
      'Commercial Billboard (Inter Tight)',
      'Bold Street Impact (Syne)',
      'Clean Modern (Plus Jakarta Sans)',
    ]
  );
  assert.equal(
    getHeadlineFontMood('inter-tight').fontFamilyCss,
    "'Inter Tight', sans-serif"
  );
  assert.equal(
    getHeadlineFontMood().fontFamilyCss,
    "'Inter Tight', sans-serif"
  );
  assert.equal(getHeadlineFontMood('syne').fontFamilyCss, "'Syne', sans-serif");
  assert.equal(
    getHeadlineFontMood('jakarta').fontFamilyCss,
    "'Plus Jakarta Sans', sans-serif"
  );
});

