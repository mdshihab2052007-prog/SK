import React, { useState, useEffect, useId } from 'react';
import { 
  TrendingDown, 
  TrendingUp,
  ShieldCheck, 
  Sliders, 
  ArrowRight,
  Sparkles,
  Calendar,
  Coins
} from 'lucide-react';
import { Language } from '../types';
import { t, toBengaliNumber, formatCurrency, formatGrams, parseLocalizedNumber, toLocalizedDigits } from '../utils/translations';
import { 
  calculateInflationLoss, 
  calculateSilverWeight, 
  calculateSilverGrowth,
  getPurchasingPowerEquivalence,
  BANGLADESH_DEFAULT_INFLATION,
  BANGLADESH_FOOD_INFLATION,
  SILVER_PRICE_PER_GRAM
} from '../utils/silverCalculations';

interface InflationLeakageMeterProps {
  lang: Language;
  onShieldCash: (amount: number) => void;
  onAmountChange?: (amount: number) => void;
}

export const InflationLeakageMeter: React.FC<InflationLeakageMeterProps> = ({ 
  lang, 
  onShieldCash,
  onAmountChange
}) => {
  const [amount, setAmount] = useState<number>(100000);
  const [amountInputVal, setAmountInputVal] = useState<string>(() => toLocalizedDigits(100000, lang));

  useEffect(() => {
    onAmountChange?.(amount);
  }, [amount, onAmountChange]);

  useEffect(() => {
    setAmountInputVal(toLocalizedDigits(amount, lang));
  }, [amount, lang]);

  const [months, setMonths] = useState<number>(12); // Default: 1 Year
  const [isCustomYear, setIsCustomYear] = useState<boolean>(false);
  const [customYears, setCustomYears] = useState<number | ''>(5);
  const [customYearsInputVal, setCustomYearsInputVal] = useState<string>(() => toLocalizedDigits(5, lang));

  useEffect(() => {
    setCustomYearsInputVal(toLocalizedDigits(customYears, lang));
  }, [customYears, lang]);

  const [inflationRate, setInflationRate] = useState<number>(BANGLADESH_DEFAULT_INFLATION);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const cashAmountInputId = useId();
  const customYearInputId = useId();

  const handleFetchAiAnalysis = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai-analyze-leakage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          months,
          inflationRate: (inflationRate * 100).toFixed(1),
          lang,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (e) {
      console.error('Failed to fetch AI analysis', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const texts = t[lang];

  // Calculations
  const { loss, remainingValue, lossPercentage } = calculateInflationLoss(amount, months, inflationRate);
  const silverGrams = calculateSilverWeight(amount);
  const foodEquiv = getPurchasingPowerEquivalence(loss, lang);
  const { projectedValue: silverProjectedValue, gain: silverGain, gainPercentage: silverGainPct, annualRateUsed } = calculateSilverGrowth(amount, months);
  const netWealthAdvantage = silverProjectedValue - remainingValue;

  const tenureOptions = [
    { label: texts.tenure1Y, months: 12 },
    { label: texts.tenure2Y, months: 24 },
    { label: texts.tenure3Y, months: 36 },
  ];

  const quickAmounts = [25000, 50000, 100000, 250000, 500000];

  const getTenureText = (m: number) => {
    if (m === 12) return texts.tenure1Y;
    if (m === 24) return texts.tenure2Y;
    if (m === 36) return texts.tenure3Y;
    if (m % 12 === 0) {
      const yrs = m / 12;
      return lang === 'bn' 
        ? `${toBengaliNumber(yrs)} বছর` 
        : `${yrs} Year${yrs > 1 ? 's' : ''}`;
    }
    const yrs = (m / 12).toFixed(1);
    return lang === 'bn' ? `${toBengaliNumber(yrs)} বছর` : `${yrs} Years`;
  };

  return (
    <div className="space-y-5 animate-fade-in font-body">
      {/* Tool Header Glass Card */}
      <div className="glass-card p-5 shadow-premium relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive shadow-inner">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display flex items-center gap-2">
                <span className="silver-text">{texts.leakageTitle}</span>
              </h2>
              <p className="text-xs text-muted-foreground font-body">
                {texts.leakageSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-light" />
            <span className="hidden sm:inline">{texts.advancedSettings}</span>
          </button>
        </div>

        {/* Advanced Rate Controls (Collapsible) */}
        {showAdvanced && (
          <div className="mb-5 p-4 rounded-xl bg-card border border-border space-y-3 animate-fade-in">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foreground font-medium">{texts.advancedSettings}</span>
              <span className="font-display font-bold text-silver-bright">
                {lang === 'bn' ? toBengaliNumber((inflationRate * 100).toFixed(1)) : (inflationRate * 100).toFixed(1)}% {lang === 'bn' ? 'বার্ষিক' : 'Annual'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInflationRate(BANGLADESH_DEFAULT_INFLATION)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                  inflationRate === BANGLADESH_DEFAULT_INFLATION
                    ? 'bg-secondary border-blue-cta text-blue-light font-bold'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {texts.cpiRate}
              </button>

              <button
                onClick={() => setInflationRate(BANGLADESH_FOOD_INFLATION)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                  inflationRate === BANGLADESH_FOOD_INFLATION
                    ? 'bg-destructive/20 border-destructive text-destructive font-bold'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {texts.foodRate}
              </button>
            </div>

            <div className="pt-1">
              <input
                type="range"
                min="0.04"
                max="0.20"
                step="0.005"
                value={inflationRate}
                onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                aria-label="Adjust annual inflation rate percentage"
                className="w-full accent-blue-cta h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-body">
                <span>{lang === 'bn' ? '৪.০%' : '4.0%'}</span>
                <span>{lang === 'bn' ? '৮.৫% (সিপিআই)' : '8.5% (CPI)'}</span>
                <span>{lang === 'bn' ? '১১.৫% (খাদ্য)' : '11.5% (Food)'}</span>
                <span>{lang === 'bn' ? '২০.০%' : '20.0%'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Input: Cash Amount in BDT */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <label htmlFor={cashAmountInputId} className="text-foreground font-semibold flex items-center gap-1.5">
              <span>{texts.cashAmountLabel}</span>
            </label>
            <span className="text-silver-bright font-display font-bold text-sm sm:text-base">
              {formatCurrency(amount, lang)}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg pointer-events-none">
              ৳
            </span>
            <input
              id={cashAmountInputId}
              type="text"
              inputMode="numeric"
              value={amountInputVal}
              onChange={(e) => {
                const raw = e.target.value;
                setAmountInputVal(raw);
                const parsed = parseLocalizedNumber(raw);
                setAmount(parsed);
              }}
              placeholder={lang === 'bn' ? '১০০০০০' : '100000'}
              className="w-full pl-9 pr-4 py-3 rounded-lg bg-input border border-border focus:border-blue-cta focus:ring-2 focus:ring-ring/20 text-foreground font-display text-lg font-bold outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {quickAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`text-xs px-2.5 py-1 rounded-md border font-display transition-all cursor-pointer ${
                  amount === preset
                    ? 'bg-blue-cta text-white border-blue-cta font-bold shadow-sm'
                    : 'bg-secondary hover:bg-secondary/80 border-border text-foreground'
                }`}
              >
                {formatCurrency(preset, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Input: Tenure Selector (Years 1, 2, 3 and Custom) */}
        <div className="space-y-2 mb-2">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <label className="text-foreground font-semibold block">
              {texts.tenureLabel}
            </label>
            <span className="text-blue-light font-display font-bold text-xs sm:text-sm">
              {getTenureText(months)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tenureOptions.map((opt) => (
              <button
                key={opt.months}
                type="button"
                onClick={() => {
                  setIsCustomYear(false);
                  setMonths(opt.months);
                }}
                className={`py-2.5 px-2 text-center rounded-lg border text-xs sm:text-sm font-semibold transition-all cursor-pointer font-body ${
                  !isCustomYear && months === opt.months
                    ? 'bg-blue-cta border-blue-cta text-white shadow-sm'
                    : 'bg-secondary border-border text-foreground hover:bg-secondary/80'
                }`}
              >
                {opt.label}
              </button>
            ))}

            {/* Custom Year Button */}
            <button
              type="button"
              onClick={() => {
                setIsCustomYear(true);
                const yr = typeof customYears === 'number' && customYears > 0 ? customYears : 5;
                setCustomYears(yr);
                setMonths(yr * 12);
              }}
              className={`py-2.5 px-2 text-center rounded-lg border text-xs sm:text-sm font-semibold transition-all cursor-pointer font-body flex items-center justify-center gap-1.5 ${
                isCustomYear
                  ? 'bg-blue-cta border-blue-cta text-white shadow-sm'
                  : 'bg-secondary border-border text-foreground hover:bg-secondary/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-light" />
              <span>{texts.tenureCustom}</span>
            </button>
          </div>

          {/* Interactive Custom Year Input Container */}
          {isCustomYear && (
            <div className="mt-2.5 p-3.5 rounded-xl bg-card border border-border space-y-2.5 animate-fade-in">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor={customYearInputId} className="font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-light" />
                  <span>{lang === 'bn' ? 'কাস্টম সময়কাল লিখুন (বছর):' : 'Enter custom tenure (in years):'}</span>
                </label>
                <span className="text-[11px] text-muted-foreground font-display font-medium">
                  ={lang === 'bn' ? toBengaliNumber(months) : months} {lang === 'bn' ? 'মাস' : 'Months'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    id={customYearInputId}
                    type="text"
                    inputMode="numeric"
                    value={customYearsInputVal}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setCustomYearsInputVal(raw);
                      if (raw === '') {
                        setCustomYears('');
                        return;
                      }
                      const parsed = parseLocalizedNumber(raw);
                      const val = Math.max(1, Math.min(50, Math.round(parsed) || 1));
                      setCustomYears(val);
                      setMonths(val * 12);
                    }}
                    placeholder={lang === 'bn' ? 'যেমন: ৫' : 'e.g. 5'}
                    className="w-full pl-3 pr-16 py-2 rounded-lg bg-input border border-border focus:border-blue-cta focus:ring-1 focus:ring-ring text-foreground font-display text-base font-bold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                    {lang === 'bn' ? 'বছর' : 'Years'}
                  </span>
                </div>

                {/* Preset Year Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[5, 7, 10, 15, 20].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setCustomYears(yr);
                        setMonths(yr * 12);
                      }}
                      className={`text-xs px-2.5 py-2 rounded-md border font-display transition-all cursor-pointer ${
                        customYears === yr
                          ? 'bg-blue-cta text-white border-blue-cta font-bold shadow-sm'
                          : 'bg-secondary hover:bg-secondary/80 border-border text-foreground'
                      }`}
                    >
                      {lang === 'bn' ? toBengaliNumber(yr) : yr} {lang === 'bn' ? 'বছর' : 'Years'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Calculation Output Card: Side-by-Side Cash Erosion vs Real Silver Growth */}
      <div className="nm-hero-card p-5 shadow-premium space-y-4">
        {/* Comparison Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border/80 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-display text-foreground">
              {texts.silverGrowTitle}
            </h3>
            <p className="text-xs text-muted-foreground font-body">
              {lang === 'bn'
                ? `${getTenureText(months)}-এ অলস ক্যাশ টাকার ক্ষয় বনাম রূপায় বিনিয়োগের বাস্তব ফলাফল`
                : `Real comparison over ${getTenureText(months)}: Cash loss vs physical silver return`}
            </p>
          </div>
          <span className="self-start sm:self-auto text-[10px] bg-secondary text-blue-light border border-border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {texts.silverHistoricalBadge}
          </span>
        </div>

        {/* 2-Column Side-by-Side: Cash vs Silver */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: Idle Cash (Depreciation) */}
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/25 text-left flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-destructive uppercase tracking-wider">
                  {lang === 'bn' ? 'অলস ক্যাশ টাকা (মুদ্রাস্ফীতিতে ক্ষয়)' : 'Idle Cash Deposit'}
                </span>
                <span className="text-[10px] text-destructive font-mono font-bold bg-destructive/15 px-1.5 py-0.5 rounded">
                  -{lang === 'bn' ? toBengaliNumber(lossPercentage) : lossPercentage}%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-foreground mt-1">
                {formatCurrency(remainingValue, lang)}
              </div>
              <div className="text-xs text-destructive font-medium mt-0.5 font-display">
                -{formatCurrency(loss, lang)} {lang === 'bn' ? 'ক্রয়ক্ষমতা লোপ পাবে' : 'purchasing power lost'}
              </div>
            </div>

            <div className="pt-2 border-t border-destructive/20 text-[11px] text-muted-foreground">
              <span>{texts.purchasingPowerNote.replace('{items}', foodEquiv)}</span>
            </div>
          </div>

          {/* Card 2: 999 Silver Investment (Real Growth) */}
          <div className="p-4 rounded-xl bg-card border border-border hover:border-silver transition-all text-left flex flex-col justify-between space-y-2 shadow-sm relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-light uppercase tracking-wider flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-silver-bright" />
                  <span>{texts.silverProjectedValue}</span>
                </span>
                <span className="text-[10px] text-success font-mono font-bold bg-success/15 px-1.5 py-0.5 rounded">
                  +{lang === 'bn' ? toBengaliNumber(silverGainPct) : silverGainPct}% {lang === 'bn' ? 'বৃদ্ধি' : 'gain'}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-display font-extrabold silver-text mt-1">
                {formatCurrency(silverProjectedValue, lang)}
              </div>
              <div className="text-xs text-success font-medium mt-0.5 font-display flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                <span>+{formatCurrency(silverGain, lang)} {lang === 'bn' ? 'আনুমানিক মুনাফা' : 'gain'}</span>
                <span className="text-muted-foreground font-normal">
                  ({formatGrams(silverGrams, lang, 1)} {lang === 'bn' ? 'রূপা' : 'Silver'})
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{lang === 'bn' ? 'বার্ষিক গড় রিটার্ন (CAGR):' : 'Annual historical CAGR:'}</span>
              <span className="font-display font-bold text-silver-bright">
                ~{lang === 'bn' ? toBengaliNumber((annualRateUsed * 100).toFixed(1)) : (annualRateUsed * 100).toFixed(1)}% / {lang === 'bn' ? 'বছর' : 'yr'}
              </span>
            </div>
          </div>
        </div>

        {/* Wealth Gap / Silver Advantage Highlight Banner */}
        <div className="p-3.5 rounded-xl bg-secondary/70 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-cta/20 text-blue-light shrink-0">
              <ShieldCheck className="w-5 h-5 text-silver-bright" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-body">
                {texts.silverVsCashAdvantage} ({getTenureText(months)}):
              </div>
              <div className="text-base sm:text-lg font-display font-extrabold text-foreground">
                <span className="text-success">+{formatCurrency(netWealthAdvantage, lang)}</span>{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({lang === 'bn' ? 'ক্যাশের চেয়ে রূপায় বেশি সম্পদ থাকবে' : 'more wealth retained vs idle cash'})
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground font-display self-start sm:self-auto">
            {lang === 'bn' ? 'লাইভ বাজারদর:' : 'Live Benchmark:'}{' '}
            <strong className="text-silver-bright font-bold">
              ৳{lang === 'bn' ? toBengaliNumber(SILVER_PRICE_PER_GRAM) : SILVER_PRICE_PER_GRAM}/{lang === 'bn' ? 'গ্রাম' : 'g'}
            </strong>
          </div>
        </div>

        {/* Real Data Benchmark Citation Note */}
        <p className="text-[11px] text-muted-foreground font-body leading-relaxed pt-0.5">
          💡 {texts.silverDataCitation}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onShieldCash(amount)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-body font-bold text-sm shadow-md transition-all cursor-pointer group"
          >
            <span>{texts.actionShieldNow}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            onClick={handleFetchAiAnalysis}
            disabled={isLoadingAi}
            className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-silver-bright font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-blue-light ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>
              {isLoadingAi 
                ? (lang === 'bn' ? 'বিশ্লেষণ হচ্ছে...' : 'Analyzing...') 
                : (lang === 'bn' ? 'AI বিশ্লেষণ' : 'AI Analysis')}
            </span>
          </button>
        </div>

        {/* Gemini AI Breakdown Card */}
        {aiAnalysis && (
          <div className="p-4 rounded-xl glass-card border border-border shadow-lg space-y-2 animate-fade-in text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-light font-body">
              <Sparkles className="w-4 h-4 text-silver-bright" />
              <span>{lang === 'bn' ? 'Gemini AI অর্থনৈতিক পর্যালোচনা' : 'Gemini AI Market Analysis'}</span>
            </div>
            <div className="text-xs text-foreground font-body leading-relaxed whitespace-pre-line">
              {aiAnalysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


