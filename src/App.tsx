/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { Header } from './components/Header';
import { PwaBanner } from './components/PwaBanner';
import { BottomNav } from './components/BottomNav';
import { InflationLeakageMeter } from './components/InflationLeakageMeter';
import { DailyMicroSaver } from './components/DailyMicroSaver';
import { VirtualVault } from './components/VirtualVault';
import { AiAdvisor } from './components/AiAdvisor';
import { AboutSilverKinen } from './components/AboutSilverKinen';
import { SilverKinenCTA } from './components/SilverKinenCTA';
import { ExportModal } from './components/ExportModal';
import { Language, SavingEntry, TabType, MarketIntelligence } from './types';
import { calculateStreak, calculateSilverWeight } from './utils/silverCalculations';
import { Trash2 } from 'lucide-react';
import { 
  auth, 
  syncUserProfile, 
  persistSavingEntry, 
  removeSavingEntry, 
  loadUserSavings 
} from './lib/firebase';

const STORAGE_KEY = 'tk_shield_savings_entries';
const LANG_STORAGE_KEY = 'tk_shield_user_lang';

export default function App() {
  // Default language: Bangla
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'bn';
  });

  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isSyncingWithCloud, setIsSyncingWithCloud] = useState(false);

  // Market intelligence state grounded via Gemini
  const [marketData, setMarketData] = useState<MarketIntelligence | null>(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);

  // Local storage entries fallback / initial
  const [entries, setEntries] = useState<SavingEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return [];
  });

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsSyncingWithCloud(true);
        try {
          // Sync user profile
          await syncUserProfile(currentUser, lang);

          // Fetch cloud savings
          const cloudEntries = await loadUserSavings(currentUser.uid);
          
          if (cloudEntries.length > 0) {
            setEntries(cloudEntries);
          } else if (entries.length > 0) {
            // First-time sign-in: migrate existing local entries to Firestore
            for (const localEntry of entries) {
              await persistSavingEntry(currentUser.uid, localEntry);
            }
          }
        } catch (err) {
          console.error('Error syncing user cloud data:', err);
        } finally {
          setIsSyncingWithCloud(false);
        }
      }
    });

    return () => unsubscribe();
  }, [lang]);

  // Fetch live market data on mount
  const fetchMarketRates = async () => {
    setIsLoadingMarket(true);
    try {
      const res = await fetch('/api/market-rates');
      if (res.ok) {
        const data = await res.json();
        setMarketData(data);
      }
    } catch (err) {
      console.error('Failed to load market rates:', err);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  useEffect(() => {
    fetchMarketRates();
  }, []);

  // Save entries to localStorage as resilient offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore storage limit issues
    }
  }, [entries]);

  // Save language preference & sync document lang attribute
  useEffect(() => {
    document.documentElement.lang = lang;
    if (lang === 'en') {
      document.documentElement.classList.add('lang-en');
      document.documentElement.classList.remove('lang-bn');
    } else {
      document.documentElement.classList.add('lang-bn');
      document.documentElement.classList.remove('lang-en');
    }
  }, [lang]);

  const handleToggleLang = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, nextLang);
      if (user) {
        syncUserProfile(user, nextLang);
      }
    } catch {
      // Ignore
    }
  };

  const handleAddEntry = async (entryData: Omit<SavingEntry, 'id' | 'timestamp' | 'silverGrams'>) => {
    const silverPrice = marketData?.silverPricePerGram || 452;
    const silverGrams = Math.round((entryData.amount / silverPrice) * 100) / 100;
    const newEntry: SavingEntry = {
      ...entryData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      silverGrams,
    };

    setEntries((prev) => [newEntry, ...prev]);

    // Persist to Cloud Firestore if logged in
    if (user) {
      try {
        await persistSavingEntry(user.uid, newEntry);
      } catch (err) {
        console.error('Failed to persist to Firestore:', err);
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));

    if (user) {
      try {
        await removeSavingEntry(user.uid, id);
      } catch (err) {
        console.error('Failed to delete from Firestore:', err);
      }
    }
  };

  const handleClearAll = () => {
    setIsClearConfirmOpen(true);
  };

  const handleConfirmClearAll = async () => {
    if (user) {
      for (const e of entries) {
        try {
          await removeSavingEntry(user.uid, e.id);
        } catch {
          // Ignore
        }
      }
    }
    setEntries([]);
    setIsClearConfirmOpen(false);
  };

  const [calculatorAmount, setCalculatorAmount] = useState<number>(100000);
  const [activeLockInAmount, setActiveLockInAmount] = useState<number | undefined>(undefined);
  const [lockInSource, setLockInSource] = useState<'calculator' | 'saver' | 'vault' | 'general'>('general');

  const totalBdtSaved = entries.reduce((acc, curr) => acc + curr.amount, 0);

  const handleShieldCashFromCalculator = (amount: number) => {
    setCalculatorAmount(amount);
    setActiveLockInAmount(amount);
    setLockInSource('calculator');
    setIsBookingModalOpen(true);
  };

  const handleOpenLockInFromSaver = (amount?: number) => {
    const amt = amount && amount > 0 ? amount : (totalBdtSaved > 0 ? totalBdtSaved : undefined);
    setActiveLockInAmount(amt);
    setLockInSource('saver');
    setIsBookingModalOpen(true);
  };

  const handleOpenLockInFromVault = () => {
    setActiveLockInAmount(totalBdtSaved > 0 ? totalBdtSaved : undefined);
    setLockInSource('vault');
    setIsBookingModalOpen(true);
  };

  const handleOpenModalFromBanner = () => {
    if (activeTab === 'calculator') {
      setActiveLockInAmount(calculatorAmount);
      setLockInSource('calculator');
    } else if (activeTab === 'saver') {
      setActiveLockInAmount(totalBdtSaved > 0 ? totalBdtSaved : undefined);
      setLockInSource('saver');
    } else if (activeTab === 'vault') {
      setActiveLockInAmount(totalBdtSaved > 0 ? totalBdtSaved : undefined);
      setLockInSource('vault');
    } else {
      setActiveLockInAmount(totalBdtSaved > 0 ? totalBdtSaved : undefined);
      setLockInSource('general');
    }
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const streak = calculateStreak(entries.map((e) => e.timestamp));

  return (
    <div 
      className={`min-h-screen bg-brand-bg text-foreground font-body flex flex-col selection:bg-silver selection:text-navy-deep pb-24 ${lang === 'en' ? 'lang-en' : 'lang-bn'}`}
      data-lang={lang}
    >
      {/* Top Header with live AI-grounded market rates and Google Auth */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenExport={() => setIsExportModalOpen(true)}
        marketData={marketData}
        onOpenAdvisor={() => setActiveTab('advisor')}
        user={user}
      />

      {/* PWA Retention Banner */}
      <PwaBanner lang={lang} />

      {/* Main App Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-5 space-y-6">
        {/* Tab 1: Inflation Leakage Meter */}
        {activeTab === 'calculator' && (
          <InflationLeakageMeter
            lang={lang}
            onShieldCash={handleShieldCashFromCalculator}
            onAmountChange={setCalculatorAmount}
          />
        )}

        {/* Tab 2: Daily Micro-Saver */}
        {activeTab === 'saver' && (
          <DailyMicroSaver
            lang={lang}
            entries={entries}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onClearAll={handleClearAll}
            onOpenVault={() => setActiveTab('vault')}
            onOpenBookingModal={handleOpenLockInFromSaver}
          />
        )}

        {/* Tab 3: Virtual Vault */}
        {activeTab === 'vault' && (
          <VirtualVault
            lang={lang}
            entries={entries}
            onOpenBookingModal={handleOpenLockInFromVault}
          />
        )}

        {/* Tab 4: Gemini AI Advisor & Market Intel */}
        {activeTab === 'advisor' && (
          <AiAdvisor
            lang={lang}
            marketData={marketData}
            onRefreshMarketData={fetchMarketRates}
            isLoadingMarketData={isLoadingMarket}
            onOpenBookingModal={handleOpenLockInFromVault}
          />
        )}

        {/* Tab 5: About Silver Kinen */}
        {activeTab === 'about' && (
          <AboutSilverKinen
            lang={lang}
            onOpenBookingModal={handleOpenLockInFromVault}
          />
        )}

        {/* High Conversion CTA Banner always visible on Calculator & Saver tabs */}
        {(activeTab === 'calculator' || activeTab === 'saver') && (
          <SilverKinenCTA
            lang={lang}
            entries={entries}
            isOpenModal={isBookingModalOpen}
            targetAmount={
              activeLockInAmount !== undefined 
                ? activeLockInAmount 
                : (activeTab === 'calculator' 
                    ? calculatorAmount 
                    : (totalBdtSaved > 0 ? totalBdtSaved : 500))
            }
            sourceContext={lockInSource}
            onOpenModal={handleOpenModalFromBanner}
            onCloseModal={handleCloseBookingModal}
          />
        )}

        {/* Modal for other tabs when trigger is pressed */}
        {activeTab !== 'calculator' && activeTab !== 'saver' && (
          <SilverKinenCTA
            lang={lang}
            entries={entries}
            isOpenModal={isBookingModalOpen}
            targetAmount={activeLockInAmount ?? (totalBdtSaved > 0 ? totalBdtSaved : 5000)}
            sourceContext={lockInSource}
            onOpenModal={handleOpenModalFromBanner}
            onCloseModal={handleCloseBookingModal}
          />
        )}
      </main>

      {/* Standalone Single File Exporter Modal */}
      <ExportModal
        lang={lang}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* In-App Clear All Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-body">
          <div className="glass-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-premium space-y-4 text-foreground">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/15 text-destructive border border-destructive/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base font-display">
                  {lang === 'bn' ? 'সব ইতিহাস মুছে ফেলবেন?' : 'Clear All Savings History?'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === 'bn' ? 'আপনার সমস্ত সেভিংস এন্ট্রি স্থায়ীভাবে মুছে যাবে।' : 'All logged entries will be permanently deleted.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmClearAll}
                className="flex-1 py-2.5 px-4 rounded-lg bg-destructive hover:bg-destructive/90 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                {lang === 'bn' ? 'হ্যাঁ, সব মুছুন' : 'Yes, Clear All'}
              </button>
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Bottom Navigation */}
      <BottomNav
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lang={lang}
        streak={streak}
      />
    </div>
  );
}
