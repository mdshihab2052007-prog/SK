import React from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Truck, 
  Award, 
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';

interface AboutSilverKinenProps {
  lang: Language;
  onOpenBookingModal: () => void;
}

export const AboutSilverKinen: React.FC<AboutSilverKinenProps> = ({
  lang,
  onOpenBookingModal,
}) => {
  const texts = t[lang];

  return (
    <div className="space-y-5 animate-fade-in font-body">
      {/* Brand Hero */}
      <div className="nm-hero-card p-6 sm:p-7 shadow-premium text-center relative overflow-hidden">
        <div className="max-w-xs sm:max-w-sm mx-auto mb-5 flex items-center justify-center">
          <div className="relative rounded-2xl bg-[#020626] border border-silver/30 shadow-[0_0_30px_rgba(180,200,255,0.2)] p-2 overflow-hidden group">
            <img
              src="/silver-kinen-logo.jpg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://i.ibb.co.com/RGfLf2wN/IMG-20260326-WA0023.jpg";
              }}
              alt="Silver Kinen Official Logo"
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-xl object-contain shadow-2xl transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground mb-1.5">
          <span className="silver-text">{lang === 'bn' ? 'সিলভার কিনেন (Silver Kinen)' : 'About Silver Kinen'}</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto font-body leading-relaxed">
          {lang === 'bn' 
            ? 'বাংলাদেশে ক্ষুদ্র সঞ্চয়কে মুদ্রাস্ফীতি থেকে সুরক্ষিত রাখতে ৯৯৯ সার্টিফাইড ফাইন সিলভার বুলিওন প্ল্যাটফর্ম।'
            : "Bangladesh's trusted fine silver bullion platform helping individuals preserve purchasing power in 999 physical silver."}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          <button
            onClick={onOpenBookingModal}
            className="px-5 py-2.5 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>{texts.ctaPrimaryBtn}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <a
            href="https://silverkinen.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border flex items-center gap-1.5 transition-colors"
          >
            <span>silverkinen.com</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-light" />
          </a>
        </div>
      </div>

      {/* 4 Pillars of Trust */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-bold text-xs sm:text-sm text-foreground font-display uppercase tracking-wider text-muted-foreground">
          {lang === 'bn' ? 'নিরাপত্তা ও নিশ্চয়তা' : 'Security & Assurance'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-lg nm-icon-tile space-y-1">
            <Award className="w-5 h-5 text-silver-bright mx-auto" />
            <div className="text-xs font-bold text-foreground font-display">
              {lang === 'bn' ? '৯৯৯ খাঁটি' : '999 Pure'}
            </div>
            <div className="text-[11px] text-muted-foreground font-body">{lang === 'bn' ? 'ল্যাব সার্টিফাইড' : 'Lab Certified'}</div>
          </div>

          <div className="p-3.5 rounded-lg nm-icon-tile space-y-1">
            <Truck className="w-5 h-5 text-blue-light mx-auto" />
            <div className="text-xs font-bold text-foreground font-display">
              {lang === 'bn' ? 'হোম ডেলিভারি' : 'Doorstep'}
            </div>
            <div className="text-[11px] text-muted-foreground font-body">{lang === 'bn' ? 'সারাদেশে হোম ডেলিভারি' : 'Nationwide Delivery'}</div>
          </div>

          <div className="p-3.5 rounded-lg nm-icon-tile space-y-1">
            <Lock className="w-5 h-5 text-success mx-auto" />
            <div className="text-xs font-bold text-foreground font-display">
              {lang === 'bn' ? 'সিলগালা প্যাক' : 'Tamper-Proof'}
            </div>
            <div className="text-[11px] text-muted-foreground font-body">{lang === 'bn' ? 'সিলগালা সিকিউর প্যাক' : 'Sealed Packaging'}</div>
          </div>

          <div className="p-3.5 rounded-lg nm-icon-tile space-y-1">
            <ShieldCheck className="w-5 h-5 text-silver mx-auto" />
            <div className="text-xs font-bold text-foreground font-display">
              {lang === 'bn' ? 'বাইব্যাক' : 'Buyback'}
            </div>
            <div className="text-[11px] text-muted-foreground font-body">{lang === 'bn' ? 'সহজ পুনঃক্রয় নিশ্চয়তা' : 'Guaranteed Buyback'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

