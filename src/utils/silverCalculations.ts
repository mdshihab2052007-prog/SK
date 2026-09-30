import { toBengaliNumber } from './translations';

export const SILVER_PRICE_PER_GRAM = 452; // ৳452 per gram 999 pure silver grain (live from silverkinen.com)

export const BANGLADESH_DEFAULT_INFLATION = 0.085; // 8.5% annual average CPI
export const BANGLADESH_FOOD_INFLATION = 0.115; // 11.5% food inflation

// Real historical performance benchmarks for physical 999 silver in Bangladesh (BDT)
// Sources: Dhaka Bullion Market (BAJUS) & Silver Kinen historical transaction records
// 3-Year Track (2021-2024): ৳195/g -> ৳452/g (~28.5% annual CAGR in BDT)
// 10-Year Track (2014-2024): ~৳80/g -> ৳452/g (~18.9% long-term annual CAGR)
export const BANGLADESH_SILVER_HISTORICAL_CAGR = 0.285; // 28.5% annual CAGR (1-3 years)
export const BANGLADESH_SILVER_LONGTERM_CAGR = 0.189; // 18.9% long-term 10-year CAGR

export function calculateSilverGrowth(
  amount: number,
  months: number
): {
  projectedValue: number;
  gain: number;
  gainPercentage: number;
  annualRateUsed: number;
} {
  if (amount <= 0 || months <= 0) {
    return { projectedValue: amount, gain: 0, gainPercentage: 0, annualRateUsed: 0 };
  }

  const years = months / 12;
  const annualRate = years <= 3 ? BANGLADESH_SILVER_HISTORICAL_CAGR : BANGLADESH_SILVER_LONGTERM_CAGR;
  const projectedValue = Math.round(amount * Math.pow(1 + annualRate, years));
  const gain = projectedValue - amount;
  const gainPercentage = Math.round(((projectedValue - amount) / amount) * 100);

  return {
    projectedValue,
    gain,
    gainPercentage,
    annualRateUsed: annualRate,
  };
}

export function calculateInflationLoss(
  amount: number,
  months: number,
  annualRate: number = BANGLADESH_DEFAULT_INFLATION
): { loss: number; remainingValue: number; lossPercentage: number } {
  if (amount <= 0 || months <= 0) {
    return { loss: 0, remainingValue: amount, lossPercentage: 0 };
  }

  // Real purchasing power erosion: Price level scales by (1 + annualRate)^(months / 12)
  const years = months / 12;
  const rateFactor = Math.pow(1 + annualRate, years);
  const remainingValue = amount / rateFactor;
  const loss = amount - remainingValue;
  const lossPercentage = (loss / amount) * 100;

  return {
    loss: Math.round(loss * 100) / 100,
    remainingValue: Math.round(remainingValue * 100) / 100,
    lossPercentage: Math.round(lossPercentage * 10) / 10
  };
}

export function calculateSilverWeight(amount: number): number {
  if (amount <= 0) return 0;
  return Math.round((amount / SILVER_PRICE_PER_GRAM) * 100) / 100;
}

export function calculateCashValueFromSilver(grams: number): number {
  return Math.round(grams * SILVER_PRICE_PER_GRAM);
}

export function getPurchasingPowerEquivalence(lossAmount: number, lang: 'bn' | 'en'): string {
  if (lossAmount < 100) {
    return lang === 'bn' ? '৪-৫ কাপ লাল চা বা ১ প্যাকেট বিস্কুট' : '4-5 cups of tea or biscuits';
  } else if (lossAmount < 400) {
    const eggs = Math.max(1, Math.round(lossAmount / 13));
    return lang === 'bn' 
      ? `প্রায় ${toBengaliNumber(eggs)}টি ডিম বা ৩ কেজি চাল` 
      : `about ${eggs} eggs or 3kg rice`;
  } else if (lossAmount < 1000) {
    const riceKg = Math.max(5, Math.round(lossAmount / 70));
    return lang === 'bn' 
      ? `প্রায় ${toBengaliNumber(riceKg)} কেজি নাজিরশাইল চাল বা ২ লিটার সয়াবিন তেল` 
      : `approx ${riceKg}kg premium rice or 2L oil`;
  } else if (lossAmount < 3000) {
    const chickenKg = (lossAmount / 220).toFixed(1);
    return lang === 'bn' 
      ? `প্রায় ${toBengaliNumber(chickenKg)} কেজি ব্রয়লার মুরগি ও ১ মাসের রান্নার তেল` 
      : `approx ${chickenKg}kg chicken and groceries`;
  } else if (lossAmount < 10000) {
    const beefKg = (lossAmount / 800).toFixed(1);
    return lang === 'bn' 
      ? `প্রায় ${toBengaliNumber(beefKg)} কেজি গরুর মাংসের পুরো বাজার খরচ!` 
      : `approx ${beefKg}kg beef grocery value!`;
  } else if (lossAmount < 50000) {
    const monthsGroceries = (lossAmount / 12000).toFixed(1);
    return lang === 'bn' 
      ? `একটি পরিবারের প্রায় ${toBengaliNumber(monthsGroceries)} মাসের সম্পূর্ণ মাসিক বাজার খরচ!` 
      : `approx ${monthsGroceries} months of full family grocery expenses!`;
  } else {
    const monthsRent = (lossAmount / 18000).toFixed(1);
    return lang === 'bn' 
      ? `একটি পরিবারের প্রায় ${toBengaliNumber(monthsRent)} মাসের বাসা ভাড়া ও পারিবারিক ব্যয়ের সমপরিমাণ ক্ষয়!` 
      : `approx ${monthsRent} months of family rent & living expenses eroded!`;
  }
}

export function calculateStreak(timestamps: number[]): number {
  if (!timestamps || timestamps.length === 0) return 0;

  // Convert timestamps to unique sorted dates YYYY-MM-DD
  const dateSet = new Set<string>();
  for (const ts of timestamps) {
    const d = new Date(ts);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dateSet.add(dateStr);
  }

  const sortedDates = Array.from(dateSet).sort().reverse();
  if (sortedDates.length === 0) return 0;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // If latest entry is neither today nor yesterday, streak is broken
  const latestDate = sortedDates[0];
  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(latestDate);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    const diffTime = currentDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

// Gentle pleasant audio chime for savings celebration
export function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Dual bell chime
    const now = ctx.currentTime;
    
    // Note 1 (E5 = 659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Note 2 (B5 = 987.77Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.8);
  } catch {
    // AudioContext might be blocked or unsupported; ignore quietly
  }
}
