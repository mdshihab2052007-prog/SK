import React, { useState, useEffect } from 'react';
import { Smartphone, PlusSquare, X, Share } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaBannerProps {
  lang: Language;
}

export const PwaBanner: React.FC<PwaBannerProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('tk_shield_pwa_dismissed');
    if (dismissed === 'true') return;

    // Check if already in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // Show banner for non-standalone users
    setShowBanner(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('tk_shield_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  const texts = t[lang];

  return (
    <>
      <div className="bg-card border-b border-border px-4 py-2 text-xs text-foreground font-body">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-secondary border border-border text-silver-bright">
              <Smartphone className="w-4 h-4 text-blue-light" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{texts.pwaBannerTitle}</p>
              <p className="text-[11px] text-muted-foreground hidden xs:block">{texts.pwaBannerDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              {texts.pwaInstallBtn}
            </button>
            <button
              onClick={dismissBanner}
              aria-label="Dismiss banner"
              className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guide Modal for iOS or manual install */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-body">
          <div className="glass-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-premium text-foreground">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-foreground font-display flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-light" />
                {lang === 'bn' ? 'হোম স্ক্রিনে যুক্ত করুন' : 'Add to Home Screen'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-foreground">
              {isIos ? (
                <>
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/80 border border-border">
                    <span className="font-bold text-blue-light text-base font-display">
                      {lang === 'bn' ? '১' : '1'}
                    </span>
                    <p className="flex items-center gap-1.5">
                      {lang === 'bn' ? (
                        <>Safari ব্রাউজারে নিচে <Share className="w-4 h-4 text-blue-light inline" /> (Share) বাটনে ট্যাপ করুন।</>
                      ) : (
                        <>Tap the <Share className="w-4 h-4 text-blue-light inline" /> (Share) icon in Safari.</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/80 border border-border">
                    <span className="font-bold text-blue-light text-base font-display">
                      {lang === 'bn' ? '২' : '2'}
                    </span>
                    <p className="flex items-center gap-1.5">
                      {lang === 'bn' ? (
                        <>মেনু স্ক্রল করে <PlusSquare className="w-4 h-4 text-success inline" /> <strong>Add to Home Screen</strong> চাপুন।</>
                      ) : (
                        <>Scroll down and tap <PlusSquare className="w-4 h-4 text-success inline" /> <strong>Add to Home Screen</strong>.</>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/80 border border-border">
                    <span className="font-bold text-blue-light text-base font-display">
                      {lang === 'bn' ? '১' : '1'}
                    </span>
                    <p>
                      {lang === 'bn' ? (
                        <>ব্রাউজারের উপরের ডান কোণায় <strong>তিনটি ডট (⋮)</strong> মেনুতে ক্লিক করুন।</>
                      ) : (
                        <>Click the <strong>three dots (⋮)</strong> menu in your browser's top right.</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/80 border border-border">
                    <span className="font-bold text-blue-light text-base font-display">
                      {lang === 'bn' ? '২' : '2'}
                    </span>
                    <p>
                      {lang === 'bn' ? (
                        <><strong>"Install App"</strong> অথবা <strong>"Add to Home screen"</strong> অপশন সিলেক্ট করুন।</>
                      ) : (
                        <>Select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs border border-border cursor-pointer transition-colors"
            >
              {lang === 'bn' ? 'বুঝেছি' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
