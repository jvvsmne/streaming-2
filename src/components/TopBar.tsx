import { User } from 'lucide-react';

export type NavTab = 'Home' | 'K-Dramas' | 'Variety' | 'C-Dramas' | 'My List';

interface TopBarProps {
  activeNav: NavTab;
  onSelectNav: (tab: NavTab) => void;
  onOpenSignUp: () => void;
  onOpenAccount: () => void;
  onOpenPremium: () => void;
  signedInEmail: string | null;
  isPremiumMember: boolean;
  myListCount: number;
}

const GUEST_NAV_ITEMS: NavTab[] = ['Home', 'K-Dramas', 'Variety', 'C-Dramas'];
const AUTH_NAV_ITEMS: NavTab[] = ['Home', 'K-Dramas', 'Variety', 'C-Dramas', 'My List'];

export function TopBar({
  activeNav,
  onSelectNav,
  onOpenSignUp,
  onOpenAccount,
  onOpenPremium,
  signedInEmail,
  isPremiumMember,
  myListCount,
}: TopBarProps) {
  const navItems = signedInEmail ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#111113]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8">
        {/* Zone 1: Single-element Viu brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectNav('Home')}
          aria-label="Viu Singapore Home"
          className="flex items-center whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FDBE11] cursor-pointer"
        >
          <span className="font-display text-3xl font-extrabold tracking-tight text-[#FDBE11] leading-none">
            viu
          </span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary categories"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeNav === item;
            const label =
              item === 'My List' && myListCount > 0 ? `My List (${myListCount})` : item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelectNav(item)}
                className={`relative py-5 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDBE11] ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-[#FDBE11]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Auth status + Sign Up (primary) & Go Premium (secondary) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!signedInEmail ? (
            <>
              <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] whitespace-nowrap mr-1">
                <User className="h-3.5 w-3.5 text-[#71717A]" aria-hidden="true" />
                <span>Not signed in</span>
              </span>

              <button
                type="button"
                onClick={onOpenSignUp}
                className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-md bg-[#FDBE11] text-[#111113] hover:bg-[#FFD043] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDBE11]"
              >
                Sign Up
              </button>

              <button
                type="button"
                onClick={onOpenPremium}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md border border-white/20 bg-[#1A1A1E] text-white hover:bg-[#232329] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDBE11]"
              >
                Go Premium
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenAccount}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md border border-white/15 bg-[#1A1A1E] text-[#E4E4E7] hover:bg-[#232329] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDBE11]"
              >
                <User className="h-3.5 w-3.5 text-[#FDBE11]" aria-hidden="true" />
                <span className="max-w-[130px] truncate">{signedInEmail}</span>
              </button>

              <button
                type="button"
                onClick={onOpenPremium}
                className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDBE11] ${
                  isPremiumMember
                    ? 'bg-[#232329] text-[#FDBE11] border border-[#FDBE11]/40 hover:bg-[#2B2B33]'
                    : 'bg-[#FDBE11] text-[#111113] hover:bg-[#FFD043]'
                }`}
              >
                {isPremiumMember ? 'Viu Premium' : 'Go Premium'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile horizontal nav row (compact, single-line scrolling) */}
      <nav
        aria-label="Mobile categories"
        className="flex md:hidden items-center justify-between gap-4 overflow-x-auto no-scrollbar border-t border-white/[0.06] px-4 py-2 text-xs font-medium"
      >
        <div className="flex items-center gap-5">
          {navItems.map((item) => {
            const isActive = activeNav === item;
            const label =
              item === 'My List' && myListCount > 0 ? `My List (${myListCount})` : item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelectNav(item)}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive ? 'text-[#FDBE11] font-semibold' : 'text-[#A1A1AA]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {!signedInEmail && (
          <span className="text-[11px] text-[#71717A] whitespace-nowrap shrink-0">
            Not signed in
          </span>
        )}
      </nav>
    </header>
  );
}
