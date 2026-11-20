import { useEffect, useState } from 'react';
import { Check, LogIn, Sparkles, X } from 'lucide-react';
import { UWatchLogo } from './UWatchLogo';

interface SignInModalProps {
  isOpen: boolean;
  initialMode?: 'signup' | 'signin';
  signedInEmail: string | null;
  onClose: () => void;
  onSignIn: (email: string) => void;
  onSignOut: () => void;
}

export function SignInModal({
  isOpen,
  initialMode = 'signup',
  signedInEmail,
  onClose,
  onSignIn,
  onSignOut,
}: SignInModalProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSignUp = mode === 'signup';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setError(null);
    onSignIn(trimmed);
    setPassword('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#161619] p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign up dialog"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#111113] text-white hover:bg-[#232329] cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <UWatchLogo size="md" />

        {signedInEmail ? (
          <div className="mt-4">
            <div className="inline-flex items-center gap-1.5 rounded bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Priority Access Active</span>
            </div>
            <h2
              id="signin-modal-title"
              className="mt-3 font-display text-2xl font-bold text-white"
            >
              Signed In
            </h2>
            <p className="mt-2 text-sm text-[#D4D4D8]">
              Active account: <span className="font-semibold text-white">{signedInEmail}</span>
            </p>
            <p className="mt-1 text-xs text-[#A1A1AA]">
              Latest airing episodes on featured premieres are unlocked for your account.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="rounded-md border border-white/15 bg-[#232329] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E2E36] cursor-pointer"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-[#111113] hover:bg-[#FF8533] cursor-pointer"
              >
                Continue Watching
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="inline-flex items-center gap-1.5 rounded bg-[#FF6B00]/15 px-2.5 py-1 text-xs font-semibold text-[#FF6B00]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Priority Access · Free Member Unlock</span>
            </div>

            <h2
              id="signin-modal-title"
              className="mt-3 font-display text-2xl font-bold text-white"
            >
              {isSignUp ? 'Sign up to unlock the latest episode' : 'Sign in to UWatch Singapore'}
            </h2>
            <p className="mt-1.5 text-sm text-[#A1A1AA]">
              {isSignUp
                ? 'Get instant Priority Access to newly aired episodes as soon as they drop, plus sync your watchlist across devices.'
                : 'Sign in with your UWatch account to unlock latest airing episodes with Priority Access.'}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="uwatch-signin-email"
                  className="block text-xs font-semibold text-[#D4D4D8] mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="uwatch-signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoFocus
                  className="w-full rounded-md border border-white/10 bg-[#111113] px-3.5 py-2.5 text-sm text-white placeholder-[#71717A] focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="uwatch-signin-password"
                  className="block text-xs font-semibold text-[#D4D4D8] mb-1.5"
                >
                  {isSignUp ? 'Create password' : 'Password'}
                </label>
                <input
                  id="uwatch-signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'At least 4 characters' : 'Enter your password'}
                  className="w-full rounded-md border border-white/10 bg-[#111113] px-3.5 py-2.5 text-sm text-white placeholder-[#71717A] focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 text-xs font-medium text-[#FF6B00]">{error}</p>
            )}

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#FF6B00] px-5 py-2.5 text-sm font-extrabold text-[#111113] hover:bg-[#FF8533] transition-colors cursor-pointer"
            >
              {isSignUp ? (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              ) : (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              )}
              <span>
                {isSignUp
                  ? 'Sign Up & Unlock Priority Access'
                  : 'Sign In & Unlock Priority Access'}
              </span>
            </button>

            <p className="mt-4 text-center text-xs text-[#A1A1AA]">
              {isSignUp ? 'Already have a UWatch account?' : 'New to UWatch Singapore?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(isSignUp ? 'signin' : 'signup');
                  setError(null);
                }}
                className="font-semibold text-[#FF6B00] hover:text-[#FF8533] cursor-pointer"
              >
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
