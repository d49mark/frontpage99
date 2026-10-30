import React, { useState } from 'react';
import {
  Archive,
  CheckCircle2,
  ExternalLink,
  Scale,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BillboardSlot, CityId } from '../types/frontpage';
import {
  getCategoryEmoji,
  getCityById,
  getCityPastEditionsArchive,
} from '../utils/frontpageLogic';

interface LegalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSlotId: string;
  cityId: CityId;
  onSelectArchivedEdition?: (slot: BillboardSlot) => void;
}

export const LegalReportModal: React.FC<LegalReportModalProps> = ({
  isOpen,
  onClose,
  activeSlotId,
  cityId,
  onSelectArchivedEdition,
}) => {
  const [activeTab, setActiveTab] = useState<'legal' | 'archive'>('legal');
  const [reportReason, setReportReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const city = getCityById(cityId);
  const pastEditions = getCityPastEditionsArchive(cityId);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setSubmitted(true);
    setReportReason('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-[#111111] text-[#FAFAFA] border border-zinc-700 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-amber-400 shrink-0" />
            <h2
              id="legal-modal-title"
              className="font-editorial text-lg sm:text-xl font-bold text-white"
            >
              Legal Compliance &amp; Past Editions SEO Vault
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close legal dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Tab Switcher: Legal & Grievance vs Past Editions Archive (SEO Vault) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            type="button"
            data-testid="tab-legal-compliance"
            onClick={() => setActiveTab('legal')}
            className={`px-3 py-2 rounded-lg text-xs font-mono-tabular font-bold transition-colors cursor-pointer ${
              activeTab === 'legal'
                ? 'bg-amber-400 text-black'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            ⚖️ Legal &amp; Grievance
          </button>
          <button
            type="button"
            data-testid="tab-seo-archive"
            onClick={() => setActiveTab('archive')}
            className={`px-3 py-2 rounded-lg text-xs font-mono-tabular font-bold transition-colors cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-emerald-400 text-black'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            🗞️ Past Editions Archive (SEO Vault)
          </button>
        </div>

        {activeTab === 'legal' ? (
          <>
            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="font-mono-tabular font-bold text-emerald-400 uppercase mb-1">
                  1. Section 79 IT Act Intermediary Safe Harbour
                </div>
                <p>
                  FrontPage99.in operates strictly as a neutral digital
                  publishing intermediary under Section 79 of the Information
                  Technology Act, 2000 (India). Every promotional slot is
                  explicitly marked with an{' '}
                  <code className="text-amber-300 font-mono-tabular">#AD</code>{' '}
                  disclosure tag. All offer fulfillment and WhatsApp
                  interactions occur directly between the merchant and consumer.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="font-mono-tabular font-bold text-amber-400 uppercase mb-1">
                  2. 180-Day KYC &amp; CERT-In Audit Trail Notice
                </div>
                <p>
                  To prevent spam or unlawful listings without requiring user
                  passwords, every booking logs the merchant&apos;s verified
                  Indian WhatsApp number, Customer UPI VPA, timestamp, and
                  payment reference for a mandatory{' '}
                  <strong>180-day KYC audit retention window</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="font-mono-tabular font-bold text-zinc-100 uppercase mb-1">
                  3. Resident Grievance Officer (IT Rules, 2021)
                </div>
                <p>
                  Grievance Officer:{' '}
                  <strong>Arjun Rao (Compliance Desk, Bengaluru)</strong>
                  <br />
                  Email:{' '}
                  <span className="font-mono-tabular text-emerald-400">
                    grievance@frontpage99.in
                  </span>{' '}
                  · SLA: Acknowledged within 24 hours; resolved within 72 hours.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleReportSubmit}
              className="pt-2 border-t border-zinc-800 space-y-2.5"
            >
              <label
                htmlFor="report-reason"
                className="block text-xs font-mono-tabular uppercase font-semibold text-zinc-300"
              >
                Report Active Slot ({activeSlotId}) for Policy Violation
              </label>
              <div className="flex gap-2">
                <input
                  id="report-reason"
                  type="text"
                  value={reportReason}
                  onChange={(e) => {
                    setReportReason(e.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="Describe misleading offer or policy issue..."
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shrink-0"
                >
                  Submit Report
                </button>
              </div>

              {submitted && (
                <div
                  role="status"
                  className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Report logged with Grievance Officer for slot {activeSlotId}
                    .
                  </span>
                </div>
              )}
            </form>
          </>
        ) : (
          <div
            data-testid="seo-archive-vault-panel"
            className="space-y-3 text-xs text-zinc-300"
          >
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-mono-tabular font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Archive className="w-3.5 h-3.5" />
                  <span>
                    {city.name} Past 5 Editions Permalink Index (SEO Vault)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Every ₹99 FrontPage99 billboard receives an immutable,
                  crawlable permalink with structured{' '}
                  <code className="text-amber-300 font-mono-tabular">
                    LocalBusiness + Offer
                  </code>{' '}
                  JSON-LD schema. Click any past edition below to preview it on
                  the billboard stage.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {pastEditions.map((edition) => {
                const catEmoji = edition.poster
                  ? getCategoryEmoji(edition.poster.category)
                  : '✨';
                const permalinkPath = `/b/${edition.slotId}`;

                return (
                  <a
                    key={edition.slotId}
                    href={permalinkPath}
                    data-testid={`archive-link-${edition.slotId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectArchivedEdition) {
                        onSelectArchivedEdition(edition);
                      }
                      onClose();
                    }}
                    className="block p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono-tabular text-[11px] font-bold text-emerald-400 group-hover:underline flex items-center gap-1.5">
                        <span>{permalinkPath}</span>
                        <ExternalLink className="w-3 h-3 opacity-75" />
                      </span>
                      <span className="font-mono-tabular text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {edition.displayDate} • {edition.dateIso}
                      </span>
                    </div>

                    {edition.poster && (
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{catEmoji}</span>
                          <span>{edition.poster.businessName}</span>
                          <span className="text-zinc-500">·</span>
                          <span className="text-[11px] text-amber-300 font-mono-tabular">
                            {edition.poster.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">
                          {edition.poster.headline}
                        </p>
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500 font-mono-tabular border-t border-zinc-800/80">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> ASCI #AD
            &amp; Schema.org JSON-LD Verified
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
