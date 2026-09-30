import React, { useState, useId, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  PlusCircle, 
  Flame, 
  Trash2, 
  History, 
  Coins, 
  Sparkles,
  Coffee,
  Bike,
  Utensils,
  ShoppingBag,
  CheckCircle2,
  Lock,
  Zap,
  RotateCcw,
  Timer
} from 'lucide-react';
import { Language, SavingEntry } from '../types';
import { t, toBengaliNumber, formatCurrency, formatGrams, parseLocalizedNumber, toLocalizedDigits } from '../utils/translations';
import { 
  calculateSilverWeight, 
  calculateStreak, 
  playChimeSound, 
  SILVER_PRICE_PER_GRAM 
} from '../utils/silverCalculations';

interface DailyMicroSaverProps {
  lang: Language;
  entries: SavingEntry[];
  onAddEntry: (entry: Omit<SavingEntry, 'id' | 'timestamp' | 'silverGrams'>) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  onOpenVault: () => void;
  onOpenBookingModal?: (amount: number) => void;
}

export const DailyMicroSaver: React.FC<DailyMicroSaverProps> = ({
  lang,
  entries,
  onAddEntry,
  onDeleteEntry,
  onClearAll,
  onOpenVault,
  onOpenBookingModal,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customAmountDisplay, setCustomAmountDisplay] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('rickshaw');

  useEffect(() => {
    if (customAmount) {
      const numeric = parseFloat(customAmount);
      if (!isNaN(numeric)) {
        setCustomAmountDisplay(toLocalizedDigits(numeric, lang));
      }
    } else {
      setCustomAmountDisplay('');
    }
  }, [lang]);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  
  // 10-Second Undo Timer State
  const [undoEntryId, setUndoEntryId] = useState<string | null>(null);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState<number>(10);
  const [justAddedInfo, setJustAddedInfo] = useState<{ amount: number; label: string; grams: string } | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const customAmountInputId = useId();
  const noteInputId = useId();

  const texts = t[lang];

  // Presets definition
  const presets = [
    { amount: 20, labelBn: '৳২০ (রিকশা ভাড়া)', labelEn: '৳20 (Rickshaw Fare)', categoryBn: 'রিকশা ভাড়া', categoryEn: 'Rickshaw Fare', icon: Bike, category: 'rickshaw' },
    { amount: 50, labelBn: '৳৫০ (বিকেলের স্ন্যাকস)', labelEn: '৳50 (Snacks)', categoryBn: 'বিকেলের স্ন্যাকস', categoryEn: 'Snacks', icon: Utensils, category: 'snacks' },
    { amount: 100, labelBn: '৳১০০ (কফি বা চা)', labelEn: '৳100 (Coffee/Tea)', categoryBn: 'কফি বা চা', categoryEn: 'Coffee / Tea', icon: Coffee, category: 'coffee' },
    { amount: 200, labelBn: '৳২০০ (কেনাকাটা সেভ)', labelEn: '৳200 (Shopping Saver)', categoryBn: 'কেনাকাটা সেভ', categoryEn: 'Shopping Saver', icon: ShoppingBag, category: 'shopping' },
  ];

  // Aggregates
  const totalBdtSaved = entries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSilverWeight = calculateSilverWeight(totalBdtSaved);
  const streak = calculateStreak(entries.map((e) => e.timestamp));

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    };
  }, []);

  // 10-Second Countdown Runner
  const start10SecondUndoTimer = (amountNum: number, labelText: string) => {
    if (undoTimerRef.current) {
      clearInterval(undoTimerRef.current);
    }

    const silverSaved = (amountNum / SILVER_PRICE_PER_GRAM).toFixed(2);
    setJustAddedInfo({ amount: amountNum, label: labelText, grams: silverSaved });
    setUndoSecondsLeft(10);

    undoTimerRef.current = setInterval(() => {
      setUndoSecondsLeft((prev) => {
        if (prev <= 1) {
          if (undoTimerRef.current) clearInterval(undoTimerRef.current);
          setUndoEntryId(null);
          setJustAddedInfo(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 1-Tap Instant 10-Second Micro-Saver Action
  const handleQuickPresetSave = (preset: typeof presets[0]) => {
    // Confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2563eb', '#10b981', '#cbd5e1', '#ffffff']
      });
    } catch {
      // Ignored
    }

    playChimeSound();

    const noteText = lang === 'bn' ? preset.labelBn : preset.labelEn;
    
    // Add entry
    onAddEntry({
      amount: preset.amount,
      category: preset.category,
      note: noteText,
    });

    // We track the latest entry by giving user a 10s undo window
    setUndoEntryId('latest');
    start10SecondUndoTimer(preset.amount, noteText);

    // Reset inputs
    setCustomAmount('');
    setNote('');
    setSelectedPreset(null);
  };

  const handleUndo = () => {
    if (undoTimerRef.current) {
      clearInterval(undoTimerRef.current);
    }
    if (entries.length > 0) {
      // Delete the most recent entry
      onDeleteEntry(entries[0].id);
    }
    setUndoEntryId(null);
    setJustAddedInfo(null);
    setSavedSuccessMsg(
      lang === 'bn' 
        ? '↩️ এন্ট্রি সফলভাবে বাতিল (Undo) করা হয়েছে।' 
        : '↩️ Entry successfully undone.'
    );
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  const handleDismissUndo = () => {
    if (undoTimerRef.current) {
      clearInterval(undoTimerRef.current);
    }
    setUndoEntryId(null);
    setJustAddedInfo(null);
  };

  const handleCustomSaveAndShield = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(customAmount, 10);
    if (!amountNum || amountNum <= 0) return;

    // Trigger confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2563eb', '#10b981', '#cbd5e1', '#ffffff']
      });
    } catch {
      // Ignored if blocked
    }

    playChimeSound();

    const currentPreset = presets.find((p) => p.amount === amountNum);
    const defaultNote = currentPreset 
      ? (lang === 'bn' ? currentPreset.labelBn : currentPreset.labelEn) 
      : (lang === 'bn' ? 'দৈনিক সেভিংস' : 'Daily Saving');

    const finalNote = note.trim() || defaultNote;

    onAddEntry({
      amount: amountNum,
      category: selectedCategory || 'general',
      note: finalNote,
    });

    setUndoEntryId('latest');
    start10SecondUndoTimer(amountNum, finalNote);

    // Reset inputs
    setCustomAmount('');
    setCustomAmountDisplay('');
    setNote('');
    setSelectedPreset(null);
  };

  return (
    <div className="space-y-5 animate-fade-in font-body">
      {/* Top Metrics Bar: Total BDT, Silver Grams, Streak */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Total BDT */}
        <div className="glass-card p-3.5 sm:p-4 text-center relative overflow-hidden shadow-md">
          <div className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1 truncate">
            {texts.totalBdtSaved}
          </div>
          <div className="text-base sm:text-xl font-display font-extrabold text-foreground truncate">
            {formatCurrency(totalBdtSaved, lang)}
          </div>
          <div className="text-[10px] text-success mt-1 flex items-center justify-center gap-0.5 font-semibold">
            <Coins className="w-3 h-3" />
            <span>{lang === 'bn' ? toBengaliNumber(entries.length) : entries.length} {lang === 'bn' ? 'টি এন্ট্রি' : (entries.length === 1 ? 'log' : 'logs')}</span>
          </div>
        </div>

        {/* Silver Shielded */}
        <div className="glass-card border border-border p-3.5 sm:p-4 text-center relative overflow-hidden shadow-md">
          <div className="text-[10px] sm:text-xs text-silver-bright font-medium mb-1 truncate flex items-center justify-center gap-1 font-body">
            <Sparkles className="w-3 h-3 text-silver" />
            <span>{texts.totalSilverWeight}</span>
          </div>
          <div className="text-base sm:text-xl font-display font-extrabold silver-text truncate">
            {formatGrams(totalSilverWeight, lang, 2)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {lang === 'bn' ? '৯৯৯ খাঁটি রূপা' : '999 Fine Silver'}
          </div>
        </div>

        {/* Streak Counter */}
        <div className="glass-card p-3.5 sm:p-4 text-center relative overflow-hidden shadow-md">
          <div className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1 truncate">
            {texts.streakCounter}
          </div>
          <div className="text-base sm:text-xl font-display font-extrabold text-silver-bright flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-blue-light fill-blue-light animate-bounce" />
            <span>{lang === 'bn' ? toBengaliNumber(streak) : streak}</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {streak > 0 
              ? (lang === 'bn' ? `${toBengaliNumber(streak)} দিনের স্ট্রিক!` : `${streak} Day Streak!`) 
              : (lang === 'bn' ? 'আজ লগ করুন' : 'Log today')}
          </div>
        </div>
      </div>

      {/* 10-Second Undo Live Action Banner */}
      {undoEntryId && justAddedInfo && (
        <div className="p-4 rounded-xl bg-card border-2 border-blue-cta shadow-premium space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-cta text-white flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-foreground font-display flex items-center gap-1.5">
                  <span>
                    {lang === 'bn'
                      ? `⚡ ৳${toBengaliNumber(justAddedInfo.amount)} (${toBengaliNumber(justAddedInfo.grams)} গ্রাম রূপা) মাত্র ১-সেকেন্ডে ভল্টে শিল্ড হয়েছে!`
                      : `⚡ ৳${justAddedInfo.amount} (${justAddedInfo.grams}g Silver) shielded in 1 second!`}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground font-body">
                  {lang === 'bn'
                    ? `১০ সেকেন্ডের মধ্যে বাতিল (Undo) করতে পারেন — বাকি আছে ${toBengaliNumber(undoSecondsLeft)} সেকেন্ড`
                    : `Undo window active — ${undoSecondsLeft}s remaining`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleUndo}
                className="px-3 py-1.5 rounded-lg bg-destructive hover:bg-destructive/90 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'Undo করুন' : 'Undo'}</span>
              </button>
              <button
                type="button"
                onClick={handleDismissUndo}
                className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold border border-border cursor-pointer"
              >
                {lang === 'bn' ? 'ঠিক আছে' : 'OK'}
              </button>
            </div>
          </div>

          {/* 10-Second Animated Progress Bar */}
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-cta h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(undoSecondsLeft / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Logging Form Card */}
      <div className="glass-card p-5 shadow-premium relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-secondary border border-border text-silver-bright shadow-inner">
              <PlusCircle className="w-5 h-5 text-blue-light" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-foreground">
                <span className="silver-text">{lang === 'bn' ? 'দৈনিক মাইক্রো-সেভার' : 'Daily Micro-Saver'}</span>
              </h2>
              <p className="text-xs text-muted-foreground font-body">
                {lang === 'bn' ? '১-ট্যাপে ক্ষুদ্র খরচ বাঁচিয়ে রূপার মজুত গড়ুন' : '1-Tap micro-savings converted into pure silver'}
              </p>
            </div>
          </div>

          {onOpenBookingModal && (
            <button
              type="button"
              onClick={() => onOpenBookingModal(totalBdtSaved > 0 ? totalBdtSaved : undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
              title={lang === 'bn' ? 'রূপায় লক ইন করুন' : 'Silver Lock-in'}
            >
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>{lang === 'bn' ? 'রূপায় লক ইন' : 'Silver Lock-in'}</span>
            </button>
          )}
        </div>

        {/* Success Toast */}
        {savedSuccessMsg && (
          <div className="mb-4 p-3 rounded-lg bg-success/20 border border-success/40 text-success text-xs sm:text-sm flex items-center gap-2 animate-fade-in shadow-md font-semibold">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        <div className="space-y-4 font-body">
          {/* 1-Tap 10-Second Quick Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {presets.map((preset) => {
              const IconComponent = preset.icon;
              const silverSaved = (preset.amount / SILVER_PRICE_PER_GRAM).toFixed(2);
              return (
                <button
                  key={preset.amount}
                  type="button"
                  onClick={() => handleQuickPresetSave(preset)}
                  className="nm-icon-tile p-3 text-left flex flex-col justify-between transition-all cursor-pointer border border-border bg-card hover:bg-secondary/90 hover:border-blue-cta hover:scale-[1.02] shadow-sm group relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-1.5 rounded-md bg-secondary text-blue-light group-hover:bg-blue-cta group-hover:text-white transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-display font-bold text-silver-bright">
                      {lang === 'bn' ? `~${toBengaliNumber(silverSaved)} গ্রাম` : `~${silverSaved} g`}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-display font-extrabold text-base text-foreground">
                      {formatCurrency(preset.amount, lang)}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate font-body">
                      {lang === 'bn' ? preset.categoryBn : preset.categoryEn}
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-border flex items-center justify-between text-[10px] font-bold text-blue-light group-hover:text-white">
                    <span>{lang === 'bn' ? 'সেভ করুন' : 'Save'}</span>
                    <span>+</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Input Form */}
          <form onSubmit={handleCustomSaveAndShield} className="pt-2 border-t border-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor={customAmountInputId} className="text-[11px] text-muted-foreground font-medium block mb-1">
                  {texts.customInputLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                    ৳
                  </span>
                  <input
                    id={customAmountInputId}
                    type="text"
                    inputMode="numeric"
                    value={customAmountDisplay}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setCustomAmountDisplay(raw);
                      const parsed = parseLocalizedNumber(raw);
                      setCustomAmount(parsed > 0 ? String(parsed) : (raw === '' ? '' : '0'));
                      setSelectedPreset(null);
                    }}
                    placeholder={lang === 'bn' ? 'যেমন: ১৫০' : 'e.g. 150'}
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-input border border-border focus:border-blue-cta focus:ring-1 focus:ring-ring text-foreground font-display text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={noteInputId} className="text-[11px] text-muted-foreground font-medium block mb-1">
                  {texts.noteOptional}
                </label>
                <input
                  id={noteInputId}
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: চা-নাস্তা বাচিয়ে' : 'e.g., skipped coffee'}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:border-blue-cta focus:ring-1 focus:ring-ring text-foreground text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Custom Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="submit"
                disabled={!customAmount || parseInt(customAmount, 10) <= 0}
                className="flex-1 py-2.5 px-4 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-body font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>{texts.actionSaveShield}</span>
              </button>

              {onOpenBookingModal && (
                <button
                  type="button"
                  onClick={() => {
                    const amt = parseInt(customAmount, 10) || (totalBdtSaved > 0 ? totalBdtSaved : 500);
                    onOpenBookingModal(amt);
                  }}
                  className="py-2.5 px-4 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-silver-bright hover:text-white font-body font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-blue-light" />
                  <span>{lang === 'bn' ? 'রূপায় লক ইন' : 'Silver Lock-in'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Savings History Log */}
      <div className="glass-card p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 font-display">
            <History className="w-4 h-4 text-blue-light" />
            <span>{texts.recentLogs}</span>
          </h3>

          {entries.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              {texts.clearAll}
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs font-body">
            {texts.noLogsYet}
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {entries.slice(0, 10).map((entry) => {
              const date = new Date(entry.timestamp);
              const timeStr = date.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' });
              const dateStr = date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' });

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border text-xs transition-all hover:bg-secondary/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary text-silver-bright">
                      <Sparkles className="w-3.5 h-3.5 text-blue-light" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {entry.note || (lang === 'bn' ? 'মাইক্রো সেভিংস' : 'Micro Saving')}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {dateStr} • {timeStr}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-display font-bold text-foreground">
                        +{formatCurrency(entry.amount, lang)}
                      </div>
                      <div className="text-[10px] font-display text-silver-bright">
                        ~{formatGrams(entry.silverGrams, lang, 2)}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title={texts.undo}
                      aria-label="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Milestone Quick Link */}
        {entries.length > 0 && (
          <div className="pt-2 text-center">
            <button
              onClick={onOpenVault}
              className="text-xs text-blue-light hover:text-white font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{lang === 'bn' ? 'ভার্চুয়াল ভল্টে রূপার মজুত দেখুন' : 'View your silver accumulation in Vault'}</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
