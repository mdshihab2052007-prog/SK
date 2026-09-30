import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Shield, Sparkles, Globe, Download, Share2, Check, TrendingUp } from 'lucide-react';
import { Language, MarketIntelligence } from '../types';
import { t, toBengaliNumber } from '../utils/translations';
import { SILVER_PRICE_PER_GRAM } from '../utils/silverCalculations';
import { UserAuthButton } from './UserAuthButton';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenExport: () => void;
  marketData?: MarketIntelligence | null;
  onOpenAdvisor?: () => void;
  user?: User | null;
}

export const Header: React.FC<HeaderProps> = ({ 
  lang, 
  onToggleLang, 
  onOpenExport, 
  marketData, 
  onOpenAdvisor,
  user = null
}) => {
  const [logoLoaded, setLogoLoaded] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  const texts = t[lang];
  const silverRate = marketData?.silverPricePerGram || SILVER_PRICE_PER_GRAM;
  const inflationRate = marketData?.cpiInflationRate || 8.5;

  const handleShare = async () => {
    const shareData = {
      title: 'Tk-Shield by Silver Kinen (টাকা শিল্ড)',
      text: lang === 'bn' 
        ? 'আপনার জমানো টাকার ক্রয়ক্ষমতা ইনফ্লেশন থেকে রক্ষা করুন খাঁটি রূপায়! ফ্রি ইনফ্লেশন লস ক্যালকুলেটর ও ডেইলি সেভার ব্যবহার করুন:'
        : 'Protect your savings from inflation with 999 pure silver. Free Tk-Shield calculator & micro-saver:',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Ignored or cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <header className="relative w-full border-b border-border bg-brand-bg/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Digital Moving Banner (Ticker) */}
      <div className="bg-navy-deep/95 border-b border-border/70 py-1.5 overflow-hidden relative font-body text-xs select-none">
        {/* Left & Right gradient edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-navy-deep via-navy-deep/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-navy-deep via-navy-deep/80 to-transparent z-10" />

        <div 
          className="animate-ticker-marquee flex items-center gap-8 whitespace-nowrap text-muted-foreground"
          style={{ animation: 'ticker-marquee 25s linear infinite', willChange: 'transform' }}
        >
          {/* Ticker Sequence - Group 1 */}
          <div className="flex items-center gap-8 shrink-0">
            {/* Live Silver Price */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-foreground font-semibold">
                {lang === 'bn' ? 'লাইভ রূপার বাজারদর:' : 'Live Silver Price:'}{' '}
                <strong className="font-display font-extrabold text-silver-bright">
                  ৳{lang === 'bn' ? toBengaliNumber(silverRate) : silverRate}/{lang === 'bn' ? 'গ্রাম' : 'g'}
                </strong>
              </span>
              <span className="text-[11px] text-blue-light font-medium bg-blue-cta/15 px-1.5 py-0.5 rounded border border-blue-cta/30">
                {lang === 'bn' ? '৯৯৯ খাঁটি রূপা' : '999 Fine Silver'}
              </span>
            </div>

            {/* 1 Vori Price */}
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="text-silver">💎</span>
              <span>
                {lang === 'bn' ? '১ ভরি (১১.৬৬ গ্রাম):' : '1 Vori (11.66g):'}{' '}
                <strong className="font-display font-bold text-silver-bright">
                  ৳{lang === 'bn' ? toBengaliNumber(Math.round(silverRate * 11.664)) : Math.round(silverRate * 11.664).toLocaleString()}
                </strong>
              </span>
            </div>

            {/* CPI Inflation Rate */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5 text-destructive" />
              <span>
                {lang === 'bn' ? 'সরকারি মূল্যস্ফীতি:' : 'Official CPI Inflation:'}{' '}
                <strong className="font-display font-bold text-destructive">
                  ~{lang === 'bn' ? toBengaliNumber(inflationRate) : inflationRate}%
                </strong>
              </span>
            </div>

            {/* Silver CAGR */}
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="text-success">📈</span>
              <span>
                {lang === 'bn' ? 'রূপায় ৩ বছরের গড় ঐতিহাসিক বৃদ্ধি:' : 'Silver 3-Year Bullion Track:'}{' '}
                <strong className="font-display font-bold text-success">
                  ~{lang === 'bn' ? '২৮.৫%' : '28.5%'} CAGR
                </strong>
              </span>
            </div>

            {/* Shariah & Buyback */}
            <div className="flex items-center gap-1.5 text-silver">
              <span>🛡️</span>
              <span>
                {lang === 'bn' ? '১০০% শরিয়াহ সম্মত ও পুনঃক্রয় নিশ্চয়তা' : '100% Shariah Compliant & Guaranteed Buyback'}
              </span>
            </div>

            {/* Silver Kinen Platform link */}
            <a
              href="https://silverkinen.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-silver hover:text-white font-medium transition-colors"
            >
              <span>🌐 silverkinen.com</span>
            </a>
          </div>

          {/* Ticker Sequence - Group 2 (Exact Duplicate for Infinite Seamless Marquee) */}
          <div className="flex items-center gap-8 shrink-0" aria-hidden="true">
            {/* Live Silver Price */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-foreground font-semibold">
                {lang === 'bn' ? 'লাইভ রূপার বাজারদর:' : 'Live Silver Price:'}{' '}
                <strong className="font-display font-extrabold text-silver-bright">
                  ৳{lang === 'bn' ? toBengaliNumber(silverRate) : silverRate}/{lang === 'bn' ? 'গ্রাম' : 'g'}
                </strong>
              </span>
              <span className="text-[11px] text-blue-light font-medium bg-blue-cta/15 px-1.5 py-0.5 rounded border border-blue-cta/30">
                {lang === 'bn' ? '৯৯৯ খাঁটি রূপা' : '999 Fine Silver'}
              </span>
            </div>

            {/* 1 Vori Price */}
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="text-silver">💎</span>
              <span>
                {lang === 'bn' ? '১ ভরি (১১.৬৬ গ্রাম):' : '1 Vori (11.66g):'}{' '}
                <strong className="font-display font-bold text-silver-bright">
                  ৳{lang === 'bn' ? toBengaliNumber(Math.round(silverRate * 11.664)) : Math.round(silverRate * 11.664).toLocaleString()}
                </strong>
              </span>
            </div>

            {/* CPI Inflation Rate */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5 text-destructive" />
              <span>
                {lang === 'bn' ? 'সরকারি মূল্যস্ফীতি:' : 'Official CPI Inflation:'}{' '}
                <strong className="font-display font-bold text-destructive">
                  ~{lang === 'bn' ? toBengaliNumber(inflationRate) : inflationRate}%
                </strong>
              </span>
            </div>

            {/* Silver CAGR */}
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="text-success">📈</span>
              <span>
                {lang === 'bn' ? 'রূপায় ৩ বছরের গড় ঐতিহাসিক বৃদ্ধি:' : 'Silver 3-Year Bullion Track:'}{' '}
                <strong className="font-display font-bold text-success">
                  ~{lang === 'bn' ? '২৮.৫%' : '28.5%'} CAGR
                </strong>
              </span>
            </div>

            {/* Shariah & Buyback */}
            <div className="flex items-center gap-1.5 text-silver">
              <span>🛡️</span>
              <span>
                {lang === 'bn' ? '১০০% শরিয়াহ সম্মত ও পুনঃক্রয় নিশ্চয়তা' : '100% Shariah Compliant & Guaranteed Buyback'}
              </span>
            </div>

            {/* Silver Kinen Platform link */}
            <a
              href="https://silverkinen.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-silver hover:text-white font-medium transition-colors"
            >
              <span>🌐 silverkinen.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            {logoLoaded ? (
              <img
                id="app-logo"
                src="/silver-kinen-logo.jpg"
                alt="Silver Kinen Logo"
                className="h-9 w-9 rounded-lg shadow-sm border border-silver/30 object-cover bg-[#020626]"
                onError={() => setLogoLoaded(false)}
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-secondary border border-border p-0.5 shadow-md flex items-center justify-center">
                <Shield className="w-5 h-5 text-silver fill-silver-bright" />
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight font-display silver-text">
              {lang === 'bn' ? 'টাকা শিল্ড' : 'Tk-Shield'}
            </h1>
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
              {lang === 'bn' ? 'সিলভার কিনেন' : 'by Silver Kinen'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* User Auth with Google / Firebase */}
          <UserAuthButton user={user} lang={lang} />

          {/* Share Button */}
          <button
            onClick={handleShare}
            title={lang === 'bn' ? 'Tk-Shield শেয়ার করুন' : 'Share Tk-Shield'}
            aria-label={lang === 'bn' ? 'Tk-Shield শেয়ার করুন' : 'Share Tk-Shield'}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground hover:text-white transition-colors cursor-pointer"
          >
            {copiedShare ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4 text-silver" />}
          </button>

          {/* Export Standalone HTML Button */}
          <button
            onClick={onOpenExport}
            title={lang === 'bn' ? 'অফলাইন HTML ফাইল ডাউনলোড করুন' : 'Download Standalone Single-File HTML'}
            aria-label={lang === 'bn' ? 'অফলাইন HTML ফাইল ডাউনলোড করুন' : 'Export single-file HTML'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs text-silver-bright hover:text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-light" />
            <span>{lang === 'bn' ? 'এক্সপোর্ট' : 'Export'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-silver-bright hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-light" />
            <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
          </button>
        </div>
      </div>
    </header>
  );

};
