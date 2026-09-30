import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { LogOut, Cloud, Loader2 } from 'lucide-react';
import { signInWithGoogle, signOutUser } from '../lib/firebase';
import { Language } from '../types';

interface UserAuthButtonProps {
  user: User | null;
  lang: Language;
  isSyncing?: boolean;
}

export const UserAuthButton: React.FC<UserAuthButtonProps> = ({ user, lang }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google Sign In failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setShowMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-body text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
        title={lang === 'bn' ? 'Google দিয়ে সাইন ইন করুন' : 'Sign in with Google'}
      >
        {isSigningIn ? (
          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
        ) : (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span className="hidden xs:inline">
          {lang === 'bn' ? 'লগইন' : 'Sign in'}
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs text-foreground transition-colors cursor-pointer"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-5 h-5 rounded-full object-cover border border-silver"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-blue-cta text-white flex items-center justify-center text-[10px] font-bold">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}

        <span className="hidden md:inline font-medium max-w-[90px] truncate text-[11px] text-silver-bright">
          {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
        </span>

        {/* Sync Pulse Indicator */}
        <span className="flex h-2 w-2 relative" title="Firestore Synced">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
      </button>

      {/* User Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 glass-card p-3 shadow-premium z-50 text-foreground space-y-2 border border-border">
          <div className="pb-2 border-b border-border">
            <div className="font-display font-bold text-xs text-silver-bright truncate">
              {user.displayName || 'Tk-Shield Saver'}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {user.email}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-success py-1 font-body">
            <Cloud className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ক্লাউড ফায়ারস্টোর সিঙ্ক সক্রিয়' : 'Cloud Firestore Synced'}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-destructive/15 text-xs text-destructive hover:text-destructive transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সাইন আউট' : 'Sign out'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
