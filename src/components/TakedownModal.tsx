import React, { useEffect, useState } from 'react';
import { BillboardSlot, CityId } from '../types/frontpage';
import {
  CITIES,
  getCityById,
  normalizeCitySlug,
  verifyAndExecuteTakedown,
} from '../utils/frontpageLogic';
import { AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface TakedownModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: BillboardSlot[];
  defaultCityId: CityId;
  onExecuteTakedown: (
    updatedSlots: BillboardSlot[],
    takenDownSlot: BillboardSlot
  ) => void;
}

export const TakedownModal: React.FC<TakedownModalProps> = ({
  isOpen,
  onClose,
  slots,
  defaultCityId,
  onExecuteTakedown,
}) => {
  const [cityId, setCityId] = useState<CityId>(defaultCityId);
  const [dateIso, setDateIso] = useState<string>('2026-10-27');
  const [token, setToken] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCityId(normalizeCitySlug(defaultCityId));
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, defaultCityId]);

  if (!isOpen) return null;

  const normalizedCity = normalizeCitySlug(cityId);
  const cityObj = getCityById(normalizedCity);

  // Include current URL city in dropdown options even if it's a dynamic Indian city like Indore
  const cityOptions = CITIES.some((c) => c.id === normalizedCity)
    ? CITIES
    : [cityObj, ...CITIES];

  const activeSlotsForCity = slots.filter(
    (s) =>
      normalizeCitySlug(s.cityId) === normalizedCity &&
      s.status === 'SOLD' &&
      s.poster &&
      (s.dayLabel === 'TODAY' || s.dayLabel === 'TOMORROW')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = verifyAndExecuteTakedown(
      slots,
      normalizedCity,
      dateIso,
      token
    );
    if (!result.success || !result.targetSlot) {
      setErrorMsg(result.error || 'Unable to verify takedown token.');
      return;
    }

    onExecuteTakedown(result.updatedSlots, result.targetSlot);
    setSuccessMsg(
      `Poster for ${result.targetSlot.slotId} has been wiped and replaced with the Community City Tip Slate.`
    );
    setToken('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="takedown-modal-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-[#FBF9F5] border-2 border-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-300">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#9A3412] shrink-0" />
            <h2
              id="takedown-modal-title"
              className="font-editorial text-xl font-bold text-stone-900"
            >
              Owner Self-Serve Poster Takedown
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close takedown dialog"
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-stone-700 mt-4 leading-relaxed">
          Sold out of stock early or made a typo? Enter your City, Edition Date
          (Today or Tomorrow), and the{' '}
          <strong>6-Character Secret Takedown Token</strong> issued at checkout.
          This immediately replaces your live poster with the{' '}
          <strong>Community City Tip Placeholder Slate</strong> without refund.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="takedown-city"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
              >
                City Edition
              </label>
              <select
                id="takedown-city"
                value={normalizedCity}
                onChange={(e) => {
                  setCityId(e.target.value);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-stone-300 text-sm font-medium text-stone-900"
              >
                {cityOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="takedown-date"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
              >
                2-Day Window Edition
              </label>
              <select
                id="takedown-date"
                value={dateIso}
                onChange={(e) => {
                  setDateIso(e.target.value);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-stone-300 text-sm font-mono-tabular text-stone-900"
              >
                <option value="2026-10-27">2026-10-27 (TODAY · Oct 27)</option>
                <option value="2026-10-28">
                  2026-10-28 (TOMORROW · Oct 28)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="takedown-token"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
            >
              6-Character Secret Takedown Token
            </label>
            <input
              id="takedown-token"
              type="text"
              maxLength={6}
              value={token}
              onChange={(e) => {
                setToken(e.target.value.toUpperCase());
                setErrorMsg(null);
              }}
              placeholder="e.g. X9K2P7"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-stone-300 font-mono-tabular text-base font-bold tracking-widest uppercase text-stone-900"
            />
          </div>

          {activeSlotsForCity.length > 0 && (
            <div className="p-3 rounded-lg bg-stone-200/70 border border-stone-300 text-xs text-stone-700">
              <div className="font-semibold text-stone-900 mb-1">
                Active {cityObj.name} Slots (Click to fill token for testing):
              </div>
              <div className="flex flex-wrap gap-2">
                {activeSlotsForCity.map((s) => (
                  <button
                    key={s.slotId}
                    type="button"
                    onClick={() => {
                      setDateIso(s.dateIso);
                      setToken(s.poster?.takedownToken || '');
                      setErrorMsg(null);
                    }}
                    className="px-2 py-1 rounded bg-white border border-stone-300 font-mono-tabular text-[11px] hover:border-stone-900 cursor-pointer"
                  >
                    {s.dayLabel} ({s.displayDate}): {s.poster?.businessName}{' '}
                    (Token: <strong>{s.poster?.takedownToken}</strong>)
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-300 text-xs font-medium text-red-900 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-700" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-medium text-emerald-950 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold cursor-pointer"
            >
              Verify Token &amp; Remove Poster
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
