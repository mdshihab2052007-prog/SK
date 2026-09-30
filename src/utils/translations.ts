import { Language } from '../types';

export const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const BENGALI_TO_ENGLISH_MAP: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

export function parseLocalizedNumber(inputStr: string): number {
  if (!inputStr) return 0;
  // Replace any Bengali digits with English digits, remove commas and whitespace
  const normalized = inputStr
    .replace(/[০-৯]/g, (char) => BENGALI_TO_ENGLISH_MAP[char] || char)
    .replace(/,/g, '')
    .replace(/[^0-9.]/g, '');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

export function toLocalizedDigits(num: number | string | undefined | null, lang: Language): string {
  if (num === '' || num === undefined || num === null) return '';
  if (lang === 'bn') {
    return toBengaliNumber(num);
  }
  return String(num);
}

export function toBengaliNumber(num: number | string, decimalPlaces?: number): string {
  let str: string;
  if (typeof num === 'number') {
    if (decimalPlaces !== undefined) {
      str = num.toFixed(decimalPlaces);
    } else {
      str = num.toLocaleString('en-US');
    }
  } else {
    str = String(num);
  }

  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)]);
}

export function formatCurrency(amount: number, lang: Language, decimalPlaces: number = 0): string {
  if (lang === 'bn') {
    const formatted = decimalPlaces > 0 ? amount.toFixed(decimalPlaces) : Math.round(amount).toLocaleString('en-US');
    return `৳${toBengaliNumber(formatted)}`;
  }
  const formatted = decimalPlaces > 0 ? amount.toFixed(decimalPlaces) : Math.round(amount).toLocaleString('en-US');
  return `৳${formatted}`;
}

export function formatGrams(grams: number, lang: Language, decimalPlaces: number = 1): string {
  const rounded = grams.toFixed(decimalPlaces);
  if (lang === 'bn') {
    return `${toBengaliNumber(rounded)} গ্রাম`;
  }
  return `${rounded} g`;
}

export function formatNumber(num: number | string, lang: Language, decimalPlaces?: number): string {
  if (lang === 'bn') {
    return toBengaliNumber(num, decimalPlaces);
  }
  if (typeof num === 'number') {
    if (decimalPlaces !== undefined) {
      return num.toFixed(decimalPlaces);
    }
    return num.toLocaleString('en-US');
  }
  return String(num);
}

export const t = {
  bn: {
    appTitle: 'টাকা শিল্ড (Tk-Shield)',
    appTitleBengali: 'টাকা শিল্ড',
    subtitle: 'আপনার জমানো টাকার ক্রয়ক্ষমতা রক্ষা করুন',
    bySilverKinen: 'সিলভার কিনেন কর্তৃক নিবেদিত',
    silverRateBenchmark: 'রূপার বাজারদর:',
    perGram: 'প্রতি গ্রাম ৯৯৯ খাঁটি রূপা',
    inflationRateBanner: 'বাংলাদেশ ব্যাংক গড় মূল্যস্ফীতি: ~৮.৫%',
    
    // Tabs
    tabCalculator: 'লস ক্যালকুলেটর',
    tabSaver: 'দৈনিক সেভার',
    tabVault: 'আমার ভল্ট',
    tabAdvisor: 'এআই অ্যাডভাইজার',
    tabAbout: 'সিলভার কিনেন',

    // PWA Banner
    pwaBannerTitle: 'হোম স্ক্রিনে ইনস্টল করুন',
    pwaBannerDesc: 'প্রতিদিনের সেভিংস দ্রুত ট্র্যাক করতে টাকা শিল্ড অ্যাপ যুক্ত করুন',
    pwaInstallBtn: 'ইনস্টল করুন',
    pwaDismissBtn: 'পরে',

    // Core Tool #1: Leakage Meter
    leakageTitle: 'ইনফ্লেশন লস ক্যালকুলেটর',
    leakageSubtitle: 'দেখুন অলস টাকায় রেখে দিলে কত টাকা অদৃশ্য হয়ে যায়!',
    cashAmountLabel: 'ক্যাশ টাকার পরিমাণ (টাকা)',
    tenureLabel: 'সময়কাল নির্বাচন করুন',
    tenure1M: '১ মাস',
    tenure3M: '৩ মাস',
    tenure6M: '৬ মাস',
    tenure1Y: '১ বছর',
    tenure2Y: '২ বছর',
    tenure3Y: '৩ বছর',
    tenureCustom: 'কাস্টম বছর',
    
    // Silver Growth vs Cash
    silverGrowTitle: 'রূপায় রাখলে কত টাকা হতো?',
    silverProjectedValue: 'রূপায় বিনিয়োগের মূল্য',
    silverNetGain: 'মোট বৃদ্ধি / লাভ',
    silverRealCAGR: 'বার্ষিক গড় বৃদ্ধি (সিএজিআর)',
    silverHistoricalBadge: 'বাস্তব মার্কেট ডেটা',
    silverDataCitation: 'বাস্তব তথ্যসূত্র: ঢাকা বুলিওন মার্কেট (BAJUS) ও সিলভার কিনেন-এর ৩ বছরের লাইভ রেকর্ড (৳১৯৫/গ্রাম থেকে ৳৪৫২/গ্রাম, গড় বার্ষিক বৃদ্ধি ~২৮.৫%)।',
    silverVsCashAdvantage: 'ক্যাশের চেয়ে রূপায় লাভ বেশি',
    
    advancedSettings: 'মুদ্রাস্ফীতির হার পরিবর্তন করুন',
    cpiRate: 'সরকারি মূল্যস্ফীতি (~৮.৫%)',
    foodRate: 'খাদ্য মূল্যস্ফীতি (~১১.৫%)',
    customRate: 'কাস্টম রেট',

    lostValueAlert: 'আপনার {amount} অলস টাকা {tenure}-এ {loss} ক্রয়ক্ষমতা হারাবে!',
    silverProtectionMetric: 'এই টাকা সিলভার কিনেন-এ রূপায় সংরক্ষণ করলে আপনি পাবেন ~{grams} খাঁটি রুপা, যা ইনফ্লেশন প্রতিরোধ করবে।',
    purchasingPowerNote: 'এই ক্ষতি প্রায় {items}-এর মূল্যের সমান!',
    actionShieldNow: 'রূপায় এখনই লক ইন করুন',
    
    // Comparison
    cashVsSilver: 'ক্যাশ টাকা বনাম ৯৯৯ খাঁটি রূপা',
    cashErosion: 'ক্যাশ টাকার মান ক্ষয় (ইনফ্লেশন)',
    silverShielded: 'রূপা দিয়ে সুরক্ষিত ক্রয়ক্ষমতা',
    realPurchasingPower: 'প্রকৃত ক্রয়ক্ষমতা থাকবে:',
    silverPurchasingPower: 'রূপার ঐতিহাসিক মূল্য সুরক্ষা:',

    // Core Tool #2: Daily Micro-Saver
    saverTitle: '১০-সেকেন্ড দৈনিক সেভিংস লগার',
    saverSubtitle: 'আজকের ছোট খরচ বাঁচিয়ে রূপার মজুত গড়ে তুলুন',
    presetRickshaw: '৳২০ (রিকশা ভাড়া)',
    presetSnacks: '৳৫০ (স্ন্যাকস)',
    presetCoffee: '৳১০০ (কফি)',
    presetShopping: '৳২০০ (শপিং সেভ)',
    customInputLabel: 'বা কাস্টম টাকার পরিমাণ (টাকা):',
    noteOptional: 'নোট (ঐচ্ছিক, যেমন: বিকেলের চা বাঁচালাম)',
    actionSaveShield: 'ভল্টে সেভ ও শিল্ড করুন',
    
    totalBdtSaved: 'মোট জমানো টাকা',
    totalSilverWeight: 'সংরক্ষিত রূপার ওজন',
    streakCounter: 'সেভিংস স্ট্রিক!',
    streakDays: '{days} দিনের স্ট্রিক 🔥',
    startStreakToday: 'আজই স্ট্রিক শুরু করুন! 🔥',

    recentLogs: 'সাম্প্রতিক জমানো ইতিহাস',
    noLogsYet: 'এখনও কোনো সেভিংস এন্ট্রি করা হয়নি। আজই প্রথম এন্ট্রি করুন!',
    clearAll: 'সব মুছুন',
    undo: 'মুছুন',

    // Core Tool #3: Virtual Vault
    vaultTitle: 'ভার্চুয়াল ভল্ট ও মাইলস্টোন ট্র্যাকার',
    vaultSubtitle: 'আপনার সঞ্চিত খাঁটি রূপার লাইভ মজুত ও অগ্রগতি',
    nextMilestone: 'পরবর্তী মাইলস্টোন:',
    milestoneProgress: 'মাইলস্টোন অগ্রগতি',
    gramsNeeded: 'আর প্রয়োজন {grams} রূপা ({amount})',
    milestoneCompleted: 'অভিনন্দন! মাইলস্টোন অর্জিত হয়েছে!',
    
    lossPrevented: 'মুদ্রাস্ফীতি ক্ষতি প্রতিরোধ করা হয়েছে',
    lossPreventedDesc: 'টাকা অলস না রেখে রূপায় সংরক্ষণ করার কারণে সংরক্ষিত মূল্যমান',
    
    milestone1: 'মাইক্রো সিলভার গ্রেইন (৫ গ্রাম)',
    milestone1Desc: 'প্রথম বিনিয়োগ পদক্ষেপ সম্পন্ন',
    milestone2: 'সিলভার গ্রেইন প্যাক (১০ গ্রাম)',
    milestone2Desc: 'ধারাবাহিক স্মার্ট সঞ্চয়ী',
    milestone3: 'ঐতিহ্যবাহী ১ ভরি সিলভার গ্রেইন (১১.৬৬ গ্রাম)',
    milestone3Desc: 'খাঁটি বাংলা বুলিওন ঐতিহ্য',
    milestone4: 'হেরিটেজ সিলভার গ্রেইন (৫০ গ্রাম)',
    milestone4Desc: 'শক্তিশালী ইনফ্লেশন সুরক্ষা প্রাচীর',

    // CTA Section
    ctaBannerTitle: 'আপনার জমানো ক্ষুদ্র সঞ্চয় দিয়ে বাস্তব রূপা নিন',
    ctaBannerDesc: '৯৯৯ খাঁটি রূপার গ্রেইন সরাসরি আপনার ঠিকানায় পৌঁছে দিবে সিলভার কিনেন।',
    ctaPrimaryBtn: 'সিলভার কিনেন-এ লক ইন করুন (বিকাশ/নগদ)',
    ctaSecondaryBtn: 'হোয়াটসঅ্যাপে যোগাযোগ করুন',

    // Modal
    bookingModalTitle: 'বাস্তব খাঁটি রূপা লক ইন করুন',
    bookingSummaryLabel: 'আপনার জমানো সেভিংস সারাংশ:',
    copySummaryBtn: 'সারাংশ কপি করুন (হোয়াটসঅ্যাপ/বিকাশ)',
    copiedToast: 'সারাংশ ক্লিপবোর্ডে কপি করা হয়েছে!',
    visitWebsiteBtn: 'সিলভার কিনেন ওয়েবসাইটে যান',
    bkashNagadNotice: 'বিকাশ এবং নগদ-এর মাধ্যমে ঝামেলাহীন পেমেন্ট সুবিধা।',
    hallmarkBadge: '৯৯৯ খাঁটি রূপা সার্টিফাইড',
    deliveryBadge: 'সারা বাংলাদেশে হোম ডেলিভারি',

    // Language
    toggleLang: 'English'
  },
  en: {
    appTitle: 'Tk-Shield by Silver Kinen',
    appTitleBengali: 'টাকা শিল্ড',
    subtitle: 'Shield Your Savings From Inflation',
    bySilverKinen: 'Powered by Silver Kinen',
    silverRateBenchmark: 'Silver Benchmark:',
    perGram: 'per gram 999 pure silver',
    inflationRateBanner: 'Bangladesh Bank CPI Avg: ~8.5%',
    
    // Tabs
    tabCalculator: 'Leakage Meter',
    tabSaver: 'Daily Saver',
    tabVault: 'My Vault',
    tabAdvisor: 'AI Advisor',
    tabAbout: 'Silver Kinen',

    // PWA Banner
    pwaBannerTitle: 'Install on Home Screen',
    pwaBannerDesc: 'Add Tk-Shield to your home screen for quick daily savings logging.',
    pwaInstallBtn: 'Install App',
    pwaDismissBtn: 'Later',

    // Core Tool #1: Leakage Meter
    leakageTitle: 'Inflation Leakage Meter',
    leakageSubtitle: 'See how much purchasing power vanishes if cash sits idle!',
    cashAmountLabel: 'Cash Amount in BDT',
    tenureLabel: 'Select Tenure',
    tenure1M: '1 Month',
    tenure3M: '3 Months',
    tenure6M: '6 Months',
    tenure1Y: '1 Year',
    tenure2Y: '2 Years',
    tenure3Y: '3 Years',
    tenureCustom: 'Custom Years',
    
    // Silver Growth vs Cash
    silverGrowTitle: 'How Big Would Your Money Become in Silver?',
    silverProjectedValue: 'Value If Saved in Silver',
    silverNetGain: 'Net Capital Gain',
    silverRealCAGR: 'Annual Compound Growth (CAGR)',
    silverHistoricalBadge: 'Real Bullion Data',
    silverDataCitation: 'Real benchmark source: Dhaka bullion market (BAJUS) & Silver Kinen historical transaction track (৳195/g to ৳452/g, ~28.5% annual CAGR in BDT).',
    silverVsCashAdvantage: 'Silver Wealth Advantage vs Cash',
    
    advancedSettings: 'Adjust Inflation Rate',
    cpiRate: 'Official CPI (~8.5%)',
    foodRate: 'Food Basket (~11.5%)',
    customRate: 'Custom Rate',

    lostValueAlert: 'Your {amount} idle cash will lose {loss} in purchasing power over {tenure}!',
    silverProtectionMetric: 'Shielding this cash in pure silver via Silver Kinen gives you ~{grams} 999 silver, completely protecting your value.',
    purchasingPowerNote: 'This lost value equals roughly {items}!',
    actionShieldNow: 'Silver Lock-in Now',
    
    // Comparison
    cashVsSilver: 'Idle Cash vs 999 Pure Silver',
    cashErosion: 'Cash Value Erosion (Inflation)',
    silverShielded: 'Silver Protected Value',
    realPurchasingPower: 'Real Purchasing Power Left:',
    silverPurchasingPower: 'Silver Real Purchasing Power:',

    // Core Tool #2: Daily Micro-Saver
    saverTitle: '10-Second Daily Micro-Saver',
    saverSubtitle: 'Save small daily expenses and build an enduring silver reserve',
    presetRickshaw: '৳20 (Rickshaw Fare)',
    presetSnacks: '৳50 (Snacks)',
    presetCoffee: '৳100 (Coffee)',
    presetShopping: '৳200 (Shopping Saver)',
    customInputLabel: 'Or Custom Amount (BDT):',
    noteOptional: 'Note (Optional, e.g., skipped afternoon snack)',
    actionSaveShield: 'Save & Shield Now',
    
    totalBdtSaved: 'Total BDT Saved',
    totalSilverWeight: 'Shielded Silver Weight',
    streakCounter: 'Savings Streak!',
    streakDays: '{days}-Day Streak 🔥',
    startStreakToday: 'Start your streak today! 🔥',

    recentLogs: 'Recent Micro-Savings Log',
    noLogsYet: 'No savings logged yet. Record your first micro-saving today!',
    clearAll: 'Clear All',
    undo: 'Delete',

    // Core Tool #3: Virtual Vault
    vaultTitle: 'Virtual Vault & Milestone Tracker',
    vaultSubtitle: 'Your live accumulated 999 pure silver bullion assets',
    nextMilestone: 'Next Milestone:',
    milestoneProgress: 'Milestone Progress',
    gramsNeeded: '{grams} silver ({amount}) needed',
    milestoneCompleted: 'Milestone Achieved! Outstanding!',
    
    lossPrevented: 'Inflation Loss Prevented',
    lossPreventedDesc: 'Value saved by locking into physical silver instead of idle cash',
    
    milestone1: 'Micro Silver Grain (5 Grams)',
    milestone1Desc: 'First step into precious metal accumulation',
    milestone2: 'Silver Grain Pack (10 Grams)',
    milestone2Desc: 'Consistent smart saver',
    milestone3: 'Traditional 1 Vori Silver Grain (11.66 Grams)',
    milestone3Desc: 'Timeless Bengali bullion tradition',
    milestone4: 'Heritage Silver Grain (50 Grams)',
    milestone4Desc: 'Sturdy financial fortress against inflation',

    // CTA Section
    ctaBannerTitle: 'Book Physical Silver Grain With Your Micro-Savings',
    ctaBannerDesc: 'Turn your digital micro-savings into 999 hallmarked physical silver grain delivered to your doorstep.',
    ctaPrimaryBtn: 'Lock In on Silver Kinen (bKash/Nagad)',
    ctaSecondaryBtn: 'Inquire on WhatsApp',

    // Modal
    bookingModalTitle: 'Lock In Real 999 Pure Silver',
    bookingSummaryLabel: 'Your Tk-Shield Micro-Savings Summary:',
    copySummaryBtn: 'Copy Summary (WhatsApp/bKash)',
    copiedToast: 'Summary copied to clipboard!',
    visitWebsiteBtn: 'Visit SilverKinen.com',
    bkashNagadNotice: 'Hassle-free instant booking via bKash, Nagad & Cards.',
    hallmarkBadge: '999 Pure Fine Silver Hallmarked',
    deliveryBadge: 'Doorstep Delivery Across Bangladesh',

    // Language
    toggleLang: 'বাংলা'
  }
};
