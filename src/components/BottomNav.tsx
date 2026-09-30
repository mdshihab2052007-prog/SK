import React from 'react';
import { TrendingDown, PlusCircle, Shield, Sparkles, Info } from 'lucide-react';
import { Language, TabType } from '../types';
import { t, toBengaliNumber } from '../utils/translations';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  lang: Language;
  streak: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  lang,
  streak,
}) => {
  const texts = t[lang];

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'calculator', label: texts.tabCalculator, icon: TrendingDown },
    { id: 'saver', label: texts.tabSaver, icon: PlusCircle },
    { id: 'vault', label: texts.tabVault, icon: Shield },
    { id: 'advisor', label: texts.tabAdvisor, icon: Sparkles },
    { id: 'about', label: texts.tabAbout, icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 border-t border-border backdrop-blur-lg px-2 py-1.5 shadow-2xl font-body">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-silver text-secondary shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 mb-0.5 ${isActive ? 'text-secondary scale-105' : 'text-muted-foreground'}`} />
                {tab.id === 'saver' && streak > 0 && (
                  <span className="absolute -top-1 -right-2 text-[9px] font-bold bg-blue-cta text-white rounded-full px-1 py-0.2 shadow-sm font-display">
                    {lang === 'bn' ? toBengaliNumber(streak) : streak}🔥
                  </span>
                )}
              </div>

              <span className="text-[10px] sm:text-[11px] truncate w-full text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
