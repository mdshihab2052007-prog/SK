import React, { useState } from 'react';
import { Download, ExternalLink, X, Check, FileCode } from 'lucide-react';
import { Language } from '../types';

interface ExportModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ lang, isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const res = await fetch('/standalone.html');
      const htmlContent = await res.text();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tk-shield-silver-kinen.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch {
      window.open('/standalone.html', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-body">
      <div className="glass-card border border-border rounded-2xl p-6 max-w-md w-full shadow-premium space-y-4 text-foreground">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-light" />
            <h3 className="font-bold text-foreground text-base font-display">
              {lang === 'bn' ? 'স্ট্যান্ডঅ্যালন সিঙ্গেল-ফাইল HTML এক্সপোর্ট' : 'Standalone Single-File HTML Export'}
            </h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          {lang === 'bn'
            ? 'এই অ্যাপটি কোনো সার্ভার বা বিল্ড টুল ছাড়াই সম্পূর্ণ অফলাইনে একটি মাত্র HTML ফাইল হিসেবে যেকোনো ব্রাউজারে বা মোবাইলে চলবে।'
            : 'Tk-Shield can run 100% offline as a self-contained single HTML5 file with zero build step dependencies.'}
        </p>

        <div className="p-3.5 rounded-lg bg-card border border-border text-xs space-y-1.5 font-mono">
          <div className="text-silver-bright font-semibold">tk-shield-silver-kinen.html</div>
          <div className="text-muted-foreground text-[11px]">Tailwind CDN + Vanilla JS + Lucide Icons + LocalStorage</div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleDownload}
            className="py-2.5 px-4 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>{lang === 'bn' ? 'ডাউনলোড HTML' : 'Download HTML'}</span>
              </>
            )}
          </button>

          <a
            href="/standalone.html"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{lang === 'bn' ? 'সরাসরি ওপেন করুন' : 'Preview Single File'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-light" />
          </a>
        </div>
      </div>
    </div>
  );
};
