import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Sparkles, 
  Truck, 
  BadgeCheck, 
  CreditCard,
  MessageCircle,
  Coins,
  ChevronRight
} from 'lucide-react';
import { Language, SavingEntry } from '../types';
import { t, toBengaliNumber, formatCurrency, formatGrams, parseLocalizedNumber, toLocalizedDigits } from '../utils/translations';
import { calculateSilverWeight, SILVER_PRICE_PER_GRAM } from '../utils/silverCalculations';

interface SilverKinenCTAProps {
  lang: Language;
  entries: SavingEntry[];
  isOpenModal: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
  targetAmount?: number;
  sourceContext?: 'calculator' | 'saver' | 'vault' | 'general';
}

export interface SilverInvestmentPreset {
  id: string;
  labelBn: string;
  labelEn: string;
  subBn: string;
  subEn: string;
  grams: number;
  isPopular?: boolean;
}

export const SILVER_INVESTMENT_PRESETS: SilverInvestmentPreset[] = [
  {
    id: '5g',
    labelBn: '৫ গ্রাম রূপা',
    labelEn: '5g Silver',
    subBn: 'ক্ষুদ্র সেভিংস স্টার্টার',
    subEn: 'Micro Saver Starter',
    grams: 5,
  },
  {
    id: '10g',
    labelBn: '১০ গ্রাম রূপা',
    labelEn: '10g Silver',
    subBn: 'স্মার্ট সেভার গ্রেইন',
    subEn: 'Smart Saver Grain',
    grams: 10,
    isPopular: true,
  },
  {
    id: '1vori',
    labelBn: '১ ভরি রূপা (১১.৬৬g)',
    labelEn: '1 Vori (11.66g)',
    subBn: 'ঐতিহ্যবাহী ট্রেডিশনাল',
    subEn: 'Traditional Standard',
    grams: 11.664,
  },
  {
    id: '50g',
    labelBn: '৫০ গ্রাম বুলিওন',
    labelEn: '50g Bullion',
    subBn: 'ইনফ্লেশন শিল্ড',
    subEn: 'Inflation Shield',
    grams: 50,
  },
  {
    id: '100g',
    labelBn: '১০০ গ্রাম বার',
    labelEn: '100g Bar',
    subBn: 'ওয়েলথ সিকিউরিটি',
    subEn: 'Wealth Security',
    grams: 100,
  },
  {
    id: '500g',
    labelBn: '৫০০ গ্রাম বার',
    labelEn: '500g Bar',
    subBn: 'ফ্যামিলি ফান্ড হেজ',
    subEn: 'Family Fund Hedge',
    grams: 500,
  },
  {
    id: '1kg',
    labelBn: '১ কেজি / ১০০০g',
    labelEn: '1 KG / 1000g',
    subBn: 'ইনস্টিটিউশনাল সিকিউরিটি',
    subEn: 'Institutional Grade',
    grams: 1000,
  },
];

export const SilverKinenCTA: React.FC<SilverKinenCTAProps> = ({
  lang,
  entries,
  isOpenModal,
  onCloseModal,
  onOpenModal,
  targetAmount,
  sourceContext = 'general',
}) => {
  const [copied, setCopied] = useState(false);

  const texts = t[lang];
  const savedTotal = entries.reduce((acc, curr) => acc + curr.amount, 0);

  // Selected Option state: preset ID ('5g' | '10g' | '1vori' | etc.) or 'saved' or 'custom'
  const [selectedOptionId, setSelectedOptionId] = useState<string>('5g');
  const [customBdtInput, setCustomBdtInput] = useState<string>('');
  const [customBdtVal, setCustomBdtVal] = useState<number>(5000);

  // Synchronize initial selection when modal opens or targetAmount changes
  useEffect(() => {
    if (isOpenModal) {
      if (targetAmount !== undefined && targetAmount > 0) {
        // Check if matches preset
        const approxGrams = calculateSilverWeight(targetAmount);
        const matched = SILVER_INVESTMENT_PRESETS.find(p => Math.abs(p.grams - approxGrams) < 0.2);
        if (matched) {
          setSelectedOptionId(matched.id);
        } else {
          setSelectedOptionId('custom');
          setCustomBdtVal(targetAmount);
          setCustomBdtInput(toLocalizedDigits(targetAmount, lang));
        }
      } else if (savedTotal > 0) {
        setSelectedOptionId('saved');
      } else {
        setSelectedOptionId('5g');
      }
    }
  }, [isOpenModal, targetAmount, savedTotal, lang]);

  // Determine current active grams and BDT
  let activeBdt = 0;
  let activeGrams = 0;

  const currentPreset = SILVER_INVESTMENT_PRESETS.find(p => p.id === selectedOptionId);

  if (currentPreset) {
    activeGrams = currentPreset.grams;
    activeBdt = Math.round(activeGrams * SILVER_PRICE_PER_GRAM);
  } else if (selectedOptionId === 'saved') {
    activeBdt = savedTotal > 0 ? savedTotal : Math.round(5 * SILVER_PRICE_PER_GRAM);
    activeGrams = calculateSilverWeight(activeBdt);
  } else {
    // Custom
    activeBdt = customBdtVal > 0 ? customBdtVal : Math.round(5 * SILVER_PRICE_PER_GRAM);
    activeGrams = calculateSilverWeight(activeBdt);
  }

  // Format summary text
  const summaryText = lang === 'bn'
    ? `🛡️ টাকা শিল্ড সিলভার ইনভেস্টমেন্ট সারাংশ:\n• পছন্দকৃত বিকল্প: ${currentPreset ? currentPreset.labelBn : (selectedOptionId === 'saved' ? `আমার জমানো সেভিংস (৳${toBengaliNumber(activeBdt)})` : `কাস্টম পরিমাণ (৳${toBengaliNumber(activeBdt)})`)}\n• বিনিয়োগ পরিমাণ: ৳${toBengaliNumber(activeBdt)}\n• খাঁটি রূপা ওজন: ~${toBengaliNumber(activeGrams.toFixed(2))} গ্রাম (৯৯৯ খাঁটি)\n• মেথড: বিকাশ / নগদ / সিলভার কিনেন ডিরেক্ট বুকিং\n• প্ল্যাটফর্ম: সিলভার কিনেন (https://silverkinen.com)`
    : `🛡️ Tk-Shield Silver Investment Summary:\n• Selected Option: ${currentPreset ? currentPreset.labelEn : (selectedOptionId === 'saved' ? `My Saved Balance (৳${activeBdt.toLocaleString()})` : `Custom Amount (৳${activeBdt.toLocaleString()})`)}\n• Investment Amount: ৳${activeBdt.toLocaleString()}\n• Pure Silver Weight: ~${activeGrams.toFixed(2)}g (999 Pure)\n• Payment: bKash / Nagad\n• Platform: Silver Kinen (https://silverkinen.com)`;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* High-Conversion Banner */}
      <div className="nm-hero-card p-5 sm:p-6 shadow-premium relative overflow-hidden font-body">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-base sm:text-xl font-bold font-display text-foreground">
              <span className="silver-text">{lang === 'bn' ? 'বাস্তব ৯৯৯ রূপা হোম ডেলিভারি' : 'Physical 999 Bullion Delivery'}</span>
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl font-body">
              {lang === 'bn' 
                ? '৫ গ্রাম, ১০ গ্রাম, ১ ভরি থেকে শুরু করে আপনার যেকোনো পরিমাণ সঞ্চয় হলমার্ক সার্টিফাইড সিকিউর সিলভার গ্রেইনে রূপান্তর করুন।'
                : 'Convert any savings into 5g, 10g, 1 vori or custom hallmark-certified physical silver grain delivered across Bangladesh.'}
            </p>

            <div className="text-[11px] text-muted-foreground flex items-center justify-center md:justify-start gap-3 pt-1">
              <span>✓ {texts.hallmarkBadge}</span>
              <span>·</span>
              <span>✓ {texts.deliveryBadge}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row gap-2">
            <button
              onClick={onOpenModal}
              className="py-2.5 px-5 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-body font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>{lang === 'bn' ? 'রূপায় ইনভেস্ট / লক-ইন করুন' : 'Silver Investment'}</span>
            </button>

            <a
              href="https://silverkinen.com"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-silver-bright hover:text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>silverkinen.com</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-light" />
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Booking & Savings Summary Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-body overflow-y-auto">
          <div className="glass-card p-5 sm:p-7 max-w-lg w-full shadow-premium relative text-foreground overflow-hidden border border-border my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-secondary border border-border text-silver-bright shadow">
                  <ShieldCheck className="w-5 h-5 text-blue-light" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-foreground font-display">
                    {lang === 'bn' ? 'সিলভার ইনভেস্টমেন্ট ও বুকিং' : 'Silver Investment Gateway'}
                  </h3>
                  <p className="text-[11px] text-blue-light font-medium">
                    {lang === 'bn' ? 'সিলভার কিনেন অফিশিয়াল ইনভেস্টমেন্ট গেটওয়ে' : 'Silver Kinen Official Investment Gateway'}
                  </p>
                </div>
              </div>

              <button
                onClick={onCloseModal}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="my-4 space-y-4 overflow-y-auto pr-1">
              {/* Option Selection Title */}
              <div>
                <label className="text-xs font-bold text-foreground mb-2 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'রূপা ইনভেস্টমেন্ট অপশন নির্বাচন করুন:' : 'Select Silver Investment Option:'}</span>
                  <span className="text-[10px] text-blue-light font-mono">৯৯৯ খাঁটি রূপা</span>
                </label>

                {/* Preset Options Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {SILVER_INVESTMENT_PRESETS.map((preset) => {
                    const presetBdt = Math.round(preset.grams * SILVER_PRICE_PER_GRAM);
                    const isSelected = selectedOptionId === preset.id;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedOptionId(preset.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                          isSelected 
                            ? 'bg-blue-cta/15 border-blue-cta text-foreground shadow-sm ring-1 ring-blue-cta' 
                            : 'bg-card hover:bg-secondary border-border text-muted-foreground'
                        }`}
                      >
                        {preset.isPopular && (
                          <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full bg-blue-cta text-white text-[9px] font-bold">
                            {lang === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                          </span>
                        )}
                        <div className="font-display font-bold text-xs sm:text-sm text-foreground">
                          {lang === 'bn' ? preset.labelBn : preset.labelEn}
                        </div>
                        <div className="text-[11px] font-semibold text-silver-bright font-mono mt-0.5">
                          {formatCurrency(presetBdt, lang)}
                        </div>
                      </button>
                    );
                  })}

                  {/* My Saved Balance Option (if user saved money) */}
                  {savedTotal > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedOptionId('saved')}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedOptionId === 'saved'
                          ? 'bg-blue-cta/15 border-blue-cta text-foreground shadow-sm ring-1 ring-blue-cta'
                          : 'bg-card hover:bg-secondary border-border text-muted-foreground'
                      }`}
                    >
                      <div className="font-display font-bold text-xs text-foreground flex items-center gap-1">
                        <Coins className="w-3 h-3 text-emerald-400" />
                        <span>{lang === 'bn' ? 'আমার সেভিংস' : 'My Savings'}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-400 font-mono mt-0.5">
                        {formatCurrency(savedTotal, lang)}
                      </div>
                    </button>
                  )}

                  {/* Custom Amount Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOptionId('custom');
                      if (!customBdtInput) setCustomBdtInput(toLocalizedDigits(5000, lang));
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      selectedOptionId === 'custom'
                        ? 'bg-blue-cta/15 border-blue-cta text-foreground shadow-sm ring-1 ring-blue-cta'
                        : 'bg-card hover:bg-secondary border-border text-muted-foreground'
                    }`}
                  >
                    <div className="font-display font-bold text-xs text-foreground">
                      {lang === 'bn' ? 'কাস্টম ইনভেস্ট' : 'Custom Amount'}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {lang === 'bn' ? 'নিজের ইচ্ছেমতো' : 'Specify Taka'}
                    </div>
                  </button>
                </div>

                {/* Custom Amount Input Field */}
                {selectedOptionId === 'custom' && (
                  <div className="p-3 rounded-xl bg-card border border-blue-cta/40 space-y-1.5 animate-fade-in">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      {lang === 'bn' ? 'ইনভেস্টমেন্ট পরিমাণ লিখুন (টাকা):' : 'Enter Investment Amount (BDT):'}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-silver-bright font-bold">৳</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customBdtInput}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setCustomBdtInput(raw);
                          const parsed = parseLocalizedNumber(raw);
                          setCustomBdtVal(parsed);
                        }}
                        placeholder={lang === 'bn' ? 'যেমন: ৫০০০' : 'e.g. 5000'}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-input border border-border text-foreground font-display font-bold text-sm outline-none focus:border-blue-cta"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Investment Breakdown Box */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">
                    {lang === 'bn' ? 'মোট ইনভেস্টমেন্ট:' : 'Total Investment:'}
                  </span>
                  <span className="font-display font-extrabold text-foreground text-lg sm:text-xl">
                    {formatCurrency(activeBdt, lang)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">{texts.totalSilverWeight}:</span>
                  <span className="font-display font-extrabold silver-text text-lg sm:text-xl">
                    ~{formatGrams(activeGrams, lang, 2)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      (~{toBengaliNumber((activeGrams / 11.664).toFixed(2))} {lang === 'bn' ? 'ভরি' : 'vori'})
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{texts.silverRateBenchmark}</span>
                  <span className="font-display font-semibold text-silver-bright">
                    ৳{lang === 'bn' ? toBengaliNumber(SILVER_PRICE_PER_GRAM) : SILVER_PRICE_PER_GRAM}/{lang === 'bn' ? 'গ্রাম (৯৯৯ খাঁটি)' : 'g (999 Pure)'}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-3 rounded-xl bg-secondary/60 border border-border text-xs text-foreground space-y-1">
                <div className="flex items-center gap-2 text-success font-semibold">
                  <CreditCard className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'বিকাশ ও নগদ সাপোর্টেড' : 'bKash & Nagad Supported'}</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-body">
                  {texts.bkashNagadNotice}
                </p>
              </div>

              {/* Copy summary preview textarea / snippet */}
              <div className="relative">
                <textarea
                  readOnly
                  value={summaryText}
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-input border border-border text-[11px] text-muted-foreground font-mono resize-none outline-none"
                />
              </div>

              {/* Action buttons inside modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="py-2.5 px-4 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-success">{texts.copiedToast}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-blue-light" />
                      <span>{texts.copySummaryBtn}</span>
                    </>
                  )}
                </button>

                {/* WhatsApp button using documented exception #25D366 (§4 table) */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(summaryText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20ba56] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>{lang === 'bn' ? 'WhatsApp-এ যোগাযোগ' : 'WhatsApp Inquiry'}</span>
                </a>
              </div>

              {/* Primary Direct Booking Link */}
              <a
                href="https://silverkinen.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>{texts.visitWebsiteBtn}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Footer trust info */}
            <div className="pt-2 text-[11px] text-muted-foreground text-center font-body shrink-0 border-t border-border">
              {lang === 'bn' ? 'সিলভার কিনেন • বাংলাদেশে বিশ্বস্ত খাঁটি রূপা প্ল্যাটফর্ম' : 'Silver Kinen • The Trusted Pure Silver Platform in Bangladesh'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

