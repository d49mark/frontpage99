import { BillboardSlot } from '../types/frontpage';
import {
  ANIMATED_STICKERS_CATALOG,
  VECTOR_ICONS_CATALOG,
  buildUnavatarUrl,
  getBusinessInitials,
  getCityById,
  getHeadlineFontMood,
  getThemeById,
  resolveStickerTintHex,
} from './frontpageLogic';

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawMonogramSealOnCanvas(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  initials: string,
  shape: 'circle' | 'shield' = 'circle'
) {
  ctx.save();
  if (shape === 'shield') {
    const w = radius * 2;
    const h = radius * 2.15;
    const x = centerX - radius;
    const y = centerY - radius;
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(x + w, y + h * 0.22);
    ctx.lineTo(x + w, y + h * 0.58);
    ctx.quadraticCurveTo(x + w * 0.85, y + h * 0.9, centerX, y + h);
    ctx.quadraticCurveTo(x + w * 0.15, y + h * 0.9, x, y + h * 0.58);
    ctx.lineTo(x, y + h * 0.22);
    ctx.closePath();
    ctx.fillStyle = '#18181B';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FACC15';
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#18181B';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FACC15';
    ctx.stroke();
  }

  ctx.fillStyle = '#FEF08A';
  ctx.font = '800 34px "Inter Tight", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, centerX, centerY + 2);
  ctx.restore();
}

export function renderStoryToCanvas(
  canvas: HTMLCanvasElement,
  slot: BillboardSlot
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || !slot.poster) return;

  const poster = slot.poster;
  const W = 1080;
  const H = 1920;
  canvas.width = W;
  canvas.height = H;

  const city = getCityById(slot.cityId);
  const theme = getThemeById(poster.themeId);

  // 1. Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, theme.canvasBgStart);
  grad.addColorStop(1, theme.canvasBgEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 2. Outer editorial frame
  const pad = 64;
  ctx.strokeStyle = theme.canvasBorderHex;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 32);
  ctx.stroke();

  // Inner subtle double-rule newspaper line at top
  ctx.beginPath();
  ctx.moveTo(pad + 48, pad + 185);
  ctx.lineTo(W - pad - 48, pad + 185);
  ctx.lineWidth = 2;
  ctx.strokeStyle = theme.canvasBorderHex;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(pad + 48, pad + 195);
  ctx.lineTo(W - pad - 48, pad + 195);
  ctx.lineWidth = 1;
  ctx.stroke();

  // 3. Top Header Stamp: "FEATURED ON FRONTPAGE99 • [CITY]"
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.canvasTextSecondary;
  ctx.font = '700 26px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `FEATURED ON FRONTPAGE99 • ${city.name.toUpperCase()}`,
    W / 2,
    pad + 95
  );

  // Verified City Edition Sub-stamp
  ctx.fillStyle = theme.canvasTextPrimary;
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${city.editionStamp} • ${slot.displayDate} • 24-HR EXCLUSIVE SLOT`,
    W / 2,
    pad + 145
  );

  // 4. Brand Logo Seal / Monogram Crest + Category & Business Name
  const initials = getBusinessInitials(poster.businessName);
  const sealCenterX = W / 2;
  const sealCenterY = pad + 275;
  const sealRadius = 46;

  drawMonogramSealOnCanvas(
    ctx,
    sealCenterX,
    sealCenterY,
    sealRadius,
    initials,
    poster.monogramShape || 'circle'
  );

  const catText = `${poster.category}  •  ${poster.businessName.toUpperCase()}`;
  ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.canvasTextSecondary;
  ctx.textAlign = 'center';
  ctx.fillText(catText, W / 2, pad + 365);

  // 4b. Google Maps Rating & Trust Pill (if enabled)
  let currentY = pad + 415;
  if (poster.includeGoogleTrust !== false) {
    const trustStr =
      poster.googleTrustText ||
      '⭐ 4.8 (1.2k Google Reviews) • Verified Local Spot';
    ctx.font = '600 22px "JetBrains Mono", monospace';
    const trustWidth = Math.min(W - 220, ctx.measureText(trustStr).width + 64);
    const trustX = (W - trustWidth) / 2;
    const trustY = currentY - 32;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    drawRoundedRect(ctx, trustX, trustY, trustWidth, 48, 24);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FACC15';
    ctx.stroke();

    ctx.fillStyle = '#FEF08A';
    ctx.fillText(trustStr, W / 2, currentY);
    currentY += 55;
  }

  // 4c. Animated Sticker Badge + Category Vector Icon Badge on Canvas
  const stickerMeta = ANIMATED_STICKERS_CATALOG.find(
    (s) => s.id === poster.animatedStickerId
  );
  const vectorMeta = VECTOR_ICONS_CATALOG.find(
    (v) => v.id === poster.vectorIconId
  );

  if (stickerMeta || vectorMeta) {
    const badgeParts: string[] = [];
    if (vectorMeta) badgeParts.push(`${vectorMeta.canvasSymbol} ${vectorMeta.label.toUpperCase()}`);
    if (stickerMeta) badgeParts.push(stickerMeta.canvasBadgeText);
    const combinedBadge = badgeParts.join('   •   ');

    ctx.font = '700 22px "JetBrains Mono", monospace';
    const bWidth = Math.min(W - 240, ctx.measureText(combinedBadge).width + 60);
    const bX = (W - bWidth) / 2;
    const bY = currentY - 26;

    const tintHex = resolveStickerTintHex(
      poster.stickerTint,
      stickerMeta?.accentHex || '#FACC15'
    );

    ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
    drawRoundedRect(ctx, bX, bY, bWidth, 44, 22);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = tintHex;
    ctx.stroke();

    ctx.fillStyle = tintHex;
    ctx.fillText(combinedBadge, W / 2, currentY + 3);
    currentY += 65;
  }

  // 5. High-Impact Headline (Wrapped, Centered)
  currentY += 45;
  const moodOption = getHeadlineFontMood(poster.fontMood);
  ctx.fillStyle = theme.canvasTextPrimary;
  ctx.font = moodOption.canvasFont;
  const headlineLines = wrapCanvasText(ctx, poster.headline, W - 260);
  for (const line of headlineLines.slice(0, 4)) {
    ctx.fillText(line, W / 2, currentY);
    currentY += 88;
  }

  // Editorial divider rule
  currentY += 12;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, currentY);
  ctx.lineTo(W / 2 + 140, currentY);
  ctx.lineWidth = 3;
  ctx.strokeStyle = theme.canvasBorderHex;
  ctx.stroke();

  // 6. Subtext / Offer Details & Locality Landmark
  currentY += 72;
  ctx.fillStyle = theme.canvasTextSecondary;
  ctx.font = '500 36px "Plus Jakarta Sans", sans-serif';
  const subtextLines = wrapCanvasText(ctx, poster.subtext, W - 240);
  for (const line of subtextLines.slice(0, 4)) {
    ctx.fillText(line, W / 2, currentY);
    currentY += 52;
  }

  // 7. Bottom Callout Box ("Link in status/bio to claim on WhatsApp")
  const boxWidth = W - 220;
  const boxHeight = 220;
  const boxX = (W - boxWidth) / 2;
  const boxY = H - pad - 330;

  ctx.fillStyle = theme.canvasAccentBg;
  drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 28);
  ctx.fill();

  ctx.fillStyle = theme.canvasAccentText;
  ctx.font = '700 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    'Link in status/bio to claim on WhatsApp',
    W / 2,
    boxY + 90
  );

  ctx.font = '600 30px "JetBrains Mono", monospace';
  ctx.fillText(
    `WhatsApp +91 ${poster.whatsappNumber} • frontpage99.in/b/${slot.slotId}`,
    W / 2,
    boxY + 160
  );

  // 8. Footer Gazette Stamp
  ctx.fillStyle = theme.canvasTextSecondary;
  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.fillText(
    `FRONTPAGE99.IN — YOUR CITY'S DIGITAL FRONT PAGE FOR ₹99/DAY`,
    W / 2,
    H - pad - 45
  );

  // 9. Optional CORS-safe async Brand Logo overlay onto the top seal
  if (
    poster.logoMode === 'auto-fetch' &&
    poster.brandDomainOrHandle &&
    poster.brandDomainOrHandle.trim().length > 0 &&
    typeof Image !== 'undefined'
  ) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sealCenterX, sealCenterY, sealRadius - 3, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(
          sealCenterX - sealRadius,
          sealCenterY - sealRadius,
          sealRadius * 2,
          sealRadius * 2
        );
        ctx.drawImage(
          img,
          sealCenterX - sealRadius + 4,
          sealCenterY - sealRadius + 4,
          (sealRadius - 4) * 2,
          (sealRadius - 4) * 2
        );
        ctx.restore();
      } catch {
        // Keep luxury monogram crest if CORS blocks pixel access
      }
    };
    img.src = buildUnavatarUrl(poster.brandDomainOrHandle);
  }
}
