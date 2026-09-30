import React from 'react';
import { 
  Shield, 
  Award, 
  Coins, 
  CheckCircle, 
  Sparkles, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { Language, SavingEntry } from '../types';
import { t, toBengaliNumber, formatCurrency, formatGrams } from '../utils/translations';
import { 
  calculateSilverWeight, 
  calculateInflationLoss, 
  SILVER_PRICE_PER_GRAM 
} from '../utils/silverCalculations';

interface VirtualVaultProps {
  lang: Language;
  entries: SavingEntry[];
  onOpenBookingModal: () => void;
}

export const VirtualVault: React.FC<VirtualVaultProps> = ({
  lang,
  entries,
  onOpenBookingModal,
}) => {
  const texts = t[lang];

  const totalBdtSaved = entries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSilverGrams = calculateSilverWeight(totalBdtSaved);

  // Inflation loss prevented: if this money stayed idle in cash for 1 year at 8.5%
  const { loss: lossPrevented } = calculateInflationLoss(totalBdtSaved, 12, 0.085);

  // Milestones list
  const milestones = [
    {
      targetGrams: 5,
      targetBdt: 5 * SILVER_PRICE_PER_GRAM,
      titleBn: t.bn.milestone1,
      titleEn: t.en.milestone1,
      badgeBn: 'ব্রোঞ্জ শিল্ড',
      badgeEn: 'Bronze Shield',
      descBn: t.bn.milestone1Desc,
      descEn: t.en.milestone1Desc,
    },
    {
      targetGrams: 10,
      targetBdt: 10 * SILVER_PRICE_PER_GRAM,
      titleBn: t.bn.milestone2,
      titleEn: t.en.milestone2,
      badgeBn: 'সিলভার পায়োনিয়ার',
      badgeEn: 'Silver Pioneer',
      descBn: t.bn.milestone2Desc,
      descEn: t.en.milestone2Desc,
    },
    {
      targetGrams: 11.66,
      targetBdt: Math.round(11.66 * SILVER_PRICE_PER_GRAM),
      titleBn: t.bn.milestone3,
      titleEn: t.en.milestone3,
      badgeBn: 'স্টার্লিং মাস্টার (১ ভরি)',
      badgeEn: 'Sterling Master (1 Vori)',
      descBn: t.bn.milestone3Desc,
      descEn: t.en.milestone3Desc,
    },
    {
      targetGrams: 50,
      targetBdt: 50 * SILVER_PRICE_PER_GRAM,
      titleBn: t.bn.milestone4,
      titleEn: t.en.milestone4,
      badgeBn: '৯৯৯ বুলিওন গার্ডিয়ান',
      badgeEn: '999 Bullion Guardian',
      descBn: t.bn.milestone4Desc,
      descEn: t.en.milestone4Desc,
    },
  ];

  // Find active milestone
  const currentMilestoneIndex = milestones.findIndex((m) => totalSilverGrams < m.targetGrams);
  const activeMilestone = currentMilestoneIndex !== -1 ? milestones[currentMilestoneIndex] : milestones[milestones.length - 1];
  const isAllCompleted = currentMilestoneIndex === -1 && totalSilverGrams >= 50;

  // Progress towards current milestone
  const prevTargetGrams = currentMilestoneIndex > 0 ? milestones[currentMilestoneIndex - 1].targetGrams : 0;
  const targetSpan = activeMilestone.targetGrams - prevTargetGrams;
  const currentSpan = Math.max(0, totalSilverGrams - prevTargetGrams);
  const milestoneProgress = isAllCompleted ? 100 : Math.min(100, Math.round((currentSpan / targetSpan) * 100));

  const gramsRemaining = Math.max(0, activeMilestone.targetGrams - totalSilverGrams);
  const bdtRemaining = Math.round(gramsRemaining * SILVER_PRICE_PER_GRAM);

  // Determine user rank tier
  let rankBadge = lang === 'bn' ? 'নতুন সঞ্চয়ী' : 'Novice Saver';
  if (totalSilverGrams >= 50) rankBadge = lang === 'bn' ? 'বুলিওন গার্ডিয়ান' : 'Bullion Guardian';
  else if (totalSilverGrams >= 11.66) rankBadge = lang === 'bn' ? 'স্টার্লিং মাস্টার' : 'Sterling Master';
  else if (totalSilverGrams >= 10) rankBadge = lang === 'bn' ? 'সিলভার পায়োনিয়ার' : 'Silver Pioneer';
  else if (totalSilverGrams >= 5) rankBadge = lang === 'bn' ? 'মাইক্রো সিলভার অনার' : 'Micro Silver Owner';

  return (
    <div className="space-y-5 animate-fade-in font-body">
      {/* Executive Virtual Vault Summary Card */}
      <div className="nm-hero-card p-6 sm:p-7 shadow-premium relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary border border-border p-0.5 shadow-md flex items-center justify-center text-silver-bright font-bold shrink-0">
              <Shield className="w-6 h-6 text-silver" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-silver uppercase tracking-wider font-display">
                  {rankBadge}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">· {lang === 'bn' ? '৯৯৯ খাঁটি রূপা' : '999 FINE SILVER'}</span>
              </div>
              <div className="text-3xl sm:text-4xl font-display font-extrabold silver-text">
                {formatGrams(totalSilverGrams, lang, 2)}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-muted-foreground">{lang === 'bn' ? 'মোট আর্থিক মূল্য' : 'Total Asset Value'}</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {formatCurrency(totalBdtSaved, lang)}
            </div>
            <div className="text-[11px] text-success font-medium flex items-center sm:justify-end gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-success" />
              <span>+{formatCurrency(lossPrevented, lang)} {lang === 'bn' ? 'ক্ষয় রোধ' : 'hedge'}</span>
            </div>
          </div>
        </div>

        {/* Primary CTA button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-body">
            {lang === 'bn' ? 'সংরক্ষিত রূপা যেকোনো সময় ফিজিক্যাল বুলিওন হিসেবে ডেলিভারি নিন।' : 'Convert virtual holdings to physical hallmarked bullion anytime.'}
          </p>
          <button
            type="button"
            onClick={onOpenBookingModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-body font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer group"
          >
            <span>{texts.ctaPrimaryBtn}</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Milestone Progress Bar Card */}
      <div className="glass-card p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-blue-light">
              {texts.nextMilestone}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground font-display">
              {lang === 'bn' ? activeMilestone.titleBn : activeMilestone.titleEn}
            </h3>
          </div>

          <span className="font-display font-bold text-xs sm:text-sm text-silver-bright bg-secondary px-2.5 py-1 rounded-lg border border-border">
            {lang === 'bn' ? toBengaliNumber(milestoneProgress) : milestoneProgress}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-card rounded-full overflow-hidden p-0.5 border border-border">
          <div
            className="h-full bg-blue-cta rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${Math.max(4, milestoneProgress)}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground font-body">
          <span>
            {formatGrams(totalSilverGrams, lang, 2)} / {formatGrams(activeMilestone.targetGrams, lang, 1)}
          </span>
          <span>
            {gramsRemaining > 0 ? (
              texts.gramsNeeded
                .replace('{grams}', formatGrams(gramsRemaining, lang, 2))
                .replace('{amount}', formatCurrency(bdtRemaining, lang))
            ) : (
              <span className="text-success font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {texts.milestoneCompleted}
              </span>
            )}
          </span>
        </div>

        {/* Milestones Stepper List */}
        <div className="space-y-2 pt-2 border-t border-border">
          {milestones.map((m, idx) => {
            const isCompleted = totalSilverGrams >= m.targetGrams;
            const isCurrent = !isCompleted && (idx === 0 || totalSilverGrams >= milestones[idx - 1].targetGrams);

            return (
              <div
                key={m.targetGrams}
                className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                  isCompleted
                    ? 'bg-success/5 border-success/20 text-foreground'
                    : isCurrent
                    ? 'bg-card border-blue-cta shadow-sm text-foreground'
                    : 'bg-card/40 border-border text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isCompleted
                        ? 'bg-success/20 text-success'
                        : isCurrent
                        ? 'bg-blue-cta/20 text-blue-light'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Award className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span className="font-display">{lang === 'bn' ? m.titleBn : m.titleEn}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        · {lang === 'bn' ? m.badgeBn : m.badgeEn}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-display font-bold text-xs text-foreground">
                    {formatGrams(m.targetGrams, lang, 1)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-display">
                    ~{formatCurrency(m.targetBdt, lang)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

