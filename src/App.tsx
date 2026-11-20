import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConsentBanner } from './components/ConsentBanner';
import { ContentRail } from './components/ContentRail';
import { DiscoveryBar, RegionFilter, SubtitleFilter } from './components/DiscoveryBar';
import { Footer } from './components/Footer';
import { HeroCarousel } from './components/HeroCarousel';
import { PremiumHighlights } from './components/PremiumHighlights';
import { PremiumModal } from './components/PremiumModal';
import { ShowDetailModal } from './components/ShowDetailModal';
import { SignInModal } from './components/SignInModal';
import { NavTab, TopBar } from './components/TopBar';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { Episode, HERO_SLIDE_IDS, SHOW_CATALOG, Show } from './data/catalog';
import { variant, track, consent, setConsent, loadClarity } from './pt';

export default function App() {
  const [activeVariant] = useState(() => variant());
  const [consentChoice, setConsentChoice] = useState<'granted' | 'denied' | null>(() =>
    consent()
  );
  const hasTrackedScreenView = useRef(false);

  const [activeNav, setActiveNav] = useState<NavTab>('Home');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('All');
  const [subtitleFilter, setSubtitleFilter] = useState<SubtitleFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [myListIds, setMyListIds] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<
    Record<string, { episodeNumber: number; percent: number; updatedAt: number }>
  >({});

  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [playerState, setPlayerState] = useState<{
    show: Show;
    episode: Episode;
    initialTimeSeconds: number;
  } | null>(null);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isPremiumMember, setIsPremiumMember] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'signin'>('signup');
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  useEffect(() => {
    if (consent() === 'granted') {
      loadClarity();
    }
    if (!hasTrackedScreenView.current) {
      hasTrackedScreenView.current = true;
      track('screen_view');
    }
  }, []);

  const openSignUpModal = useCallback(() => {
    setAuthModalMode('signup');
    setIsSignInOpen(true);
  }, []);

  const openAccountModal = useCallback(() => {
    setAuthModalMode('signin');
    setIsSignInOpen(true);
  }, []);

  const handleCtaSignUp = useCallback(() => {
    track('cta_click', { button: 'sign_up' });
    openSignUpModal();
  }, [openSignUpModal]);

  const handleCtaPremium = useCallback(() => {
    track('cta_click', { button: 'go_premium' });
    setIsPremiumOpen(true);
  }, []);

  const heroSlides = useMemo(
    () =>
      HERO_SLIDE_IDS.map((id) => SHOW_CATALOG.find((s) => s.id === id)).filter(
        (s): s is Show => Boolean(s)
      ),
    []
  );

  const toggleMyList = useCallback((showId: string) => {
    setMyListIds((prev) =>
      prev.includes(showId) ? prev.filter((id) => id !== showId) : [...prev, showId]
    );
  }, []);

  const handleProgressUpdate = useCallback(
    (showId: string, episodeNumber: number, percent: number) => {
      setProgressMap((prev) => ({
        ...prev,
        [showId]: { episodeNumber, percent, updatedAt: Date.now() },
      }));
    },
    []
  );

  const getInitialTimeSeconds = useCallback(
    (showId: string, ep: Episode) => {
      const saved = progressMap[showId];
      if (saved && saved.episodeNumber === ep.number && saved.percent > 0) {
        return Math.round((saved.percent / 100) * ep.durationSeconds);
      }
      return 14;
    },
    [progressMap]
  );

  const handlePlayShow = useCallback(
    (show: Show, episodeNumber?: number) => {
      const targetNum = episodeNumber ?? progressMap[show.id]?.episodeNumber ?? 1;
      const ep =
        show.episodes.find((e) => e.number === targetNum) ?? show.episodes[0];
      if (!ep) return;
      if (ep.requiresSignIn && !signedInEmail) {
        openSignUpModal();
        return;
      }
      if (ep.isPremiumOnly && !isPremiumMember) {
        setIsPremiumOpen(true);
        return;
      }
      setSelectedShow(null);
      setPlayerState({
        show,
        episode: ep,
        initialTimeSeconds: getInitialTimeSeconds(show.id, ep),
      });
    },
    [progressMap, isPremiumMember, signedInEmail, openSignUpModal, getInitialTimeSeconds]
  );

  const handlePlayEpisode = useCallback(
    (show: Show, episode: Episode) => {
      if (episode.requiresSignIn && !signedInEmail) {
        openSignUpModal();
        return;
      }
      if (episode.isPremiumOnly && !isPremiumMember) {
        setIsPremiumOpen(true);
        return;
      }
      setSelectedShow(null);
      setPlayerState({
        show,
        episode,
        initialTimeSeconds: getInitialTimeSeconds(show.id, episode),
      });
    },
    [isPremiumMember, signedInEmail, openSignUpModal, getInitialTimeSeconds]
  );

  const handleSelectNav = useCallback((tab: NavTab) => {
    setActiveNav(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleResetFilters = useCallback(() => {
    setRegionFilter('All');
    setSubtitleFilter('All');
    setSearchQuery('');
  }, []);

  const hasActiveFilters =
    regionFilter !== 'All' || subtitleFilter !== 'All' || searchQuery.trim().length > 0;

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SHOW_CATALOG.filter((show) => {
      if (activeNav === 'K-Dramas' && show.category !== 'K-Drama') return false;
      if (activeNav === 'Variety' && show.category !== 'Variety') return false;
      if (activeNav === 'C-Dramas' && show.category !== 'C-Drama') return false;
      if (activeNav === 'My List' && !myListIds.includes(show.id)) return false;

      if (regionFilter === 'Free' && show.isPremium) return false;
      if (
        regionFilter !== 'All' &&
        regionFilter !== 'Free' &&
        show.region !== regionFilter
      ) {
        return false;
      }

      if (subtitleFilter !== 'All' && !show.subtitles.includes(subtitleFilter)) {
        return false;
      }

      if (q) {
        const haystack = [
          show.title,
          show.nativeTitle,
          show.region,
          show.category,
          ...show.genres,
          ...show.cast,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [activeNav, myListIds, regionFilter, subtitleFilter, searchQuery]);

  const top10Shows = useMemo(
    () =>
      SHOW_CATALOG.filter((s) => typeof s.topRank === 'number').sort(
        (a, b) => (a.topRank ?? 99) - (b.topRank ?? 99)
      ),
    []
  );

  const uwatchOriginals = useMemo(
    () => SHOW_CATALOG.filter((s) => s.isOriginal),
    []
  );

  const freshReleases = useMemo(
    () => SHOW_CATALOG.slice(0, 6),
    []
  );

  const kVarietyShows = useMemo(
    () => SHOW_CATALOG.filter((s) => s.category === 'Variety'),
    []
  );

  const regionalHits = useMemo(
    () =>
      SHOW_CATALOG.filter(
        (s) => s.region === 'China' || s.region === 'Thailand' || s.region === 'Japan'
      ),
    []
  );

  const continueWatchingShows = useMemo(() => {
    if (!signedInEmail) return [];
    return Object.entries(progressMap)
      .sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
      .map(([showId]) => SHOW_CATALOG.find((s) => s.id === showId))
      .filter((s): s is Show => Boolean(s));
  }, [signedInEmail, progressMap]);

  const isFilteredOrTabView = activeNav !== 'Home' || hasActiveFilters;

  return (
    <div className="min-h-screen bg-[#111113] text-[#F5F5F7] flex flex-col">
      <TopBar
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        onOpenSignUp={handleCtaSignUp}
        onOpenAccount={openAccountModal}
        onOpenPremium={handleCtaPremium}
        signedInEmail={signedInEmail}
        isPremiumMember={isPremiumMember}
        myListCount={myListIds.length}
      />

      <main className="flex-1">
        {activeNav === 'Home' && !hasActiveFilters && (
          <HeroCarousel
            slides={heroSlides}
            myListIds={myListIds}
            signedInEmail={signedInEmail}
            showSignUpPrompt={activeVariant === 'B'}
            onSignUpClick={handleCtaSignUp}
            onAccountClick={openAccountModal}
            onPlayLatestEpisode={handlePlayShow}
            onSelectShow={setSelectedShow}
            onToggleMyList={toggleMyList}
          />
        )}

        <DiscoveryBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          regionFilter={regionFilter}
          onRegionChange={setRegionFilter}
          subtitleFilter={subtitleFilter}
          onSubtitleChange={setSubtitleFilter}
          resultCount={filteredCatalog.length}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />

        {isFilteredOrTabView ? (
          <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {activeNav === 'Home' ? 'Search & Filter Results' : activeNav}
                </h1>
                <p className="mt-1 text-sm text-[#A1A1AA] tabular-nums">
                  {filteredCatalog.length}{' '}
                  {filteredCatalog.length === 1 ? 'title' : 'titles'} available
                </p>
              </div>
              {activeNav !== 'Home' && (
                <button
                  type="button"
                  onClick={() => handleSelectNav('Home')}
                  className="text-xs font-semibold text-[#FF6B00] hover:text-[#FF8533] cursor-pointer"
                >
                  Back to Home
                </button>
              )}
            </div>

            {filteredCatalog.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-[#161619] px-6 py-14 text-center">
                <p className="font-display text-lg font-semibold text-white">
                  {activeNav === 'My List'
                    ? 'Your watchlist is currently empty'
                    : 'No titles match your current filters'}
                </p>
                <p className="mt-1.5 text-sm text-[#A1A1AA]">
                  {activeNav === 'My List'
                    ? 'Bookmark dramas or variety shows anywhere in UWatch to pick them up here.'
                    : 'Try clearing your search query or switching back to all regions.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setActiveNav('Home');
                  }}
                  className="mt-5 rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-bold text-[#111113] hover:bg-[#FF8533] cursor-pointer"
                >
                  Browse Full Catalog
                </button>
              </div>
            ) : (
              <ContentRail
                title="Matching Titles"
                shows={filteredCatalog}
                variant="poster"
                defaultExpanded
                myListIds={myListIds}
                signedInEmail={signedInEmail}
                progressMap={progressMap}
                onSelectShow={setSelectedShow}
                onPlayShow={handlePlayShow}
                onToggleMyList={toggleMyList}
              />
            )}
          </section>
        ) : (
          <div className="pb-6">
            {signedInEmail && continueWatchingShows.length > 0 && (
              <ContentRail
                id="continue-watching"
                title="Continue Watching"
                subtitle="Pick up right where you left off"
                shows={continueWatchingShows}
                variant="episode"
                myListIds={myListIds}
                signedInEmail={signedInEmail}
                progressMap={progressMap}
                onSelectShow={setSelectedShow}
                onPlayShow={handlePlayShow}
                onToggleMyList={toggleMyList}
              />
            )}

            <PremiumHighlights
              isPremiumMember={isPremiumMember}
              onOpenPremium={handleCtaPremium}
            />

            <ContentRail
              id="top-10"
              title="Top 10 in Singapore"
              subtitle="Most-watched dramas and variety hits this week"
              shows={top10Shows}
              variant="top10"
              myListIds={myListIds}
              signedInEmail={signedInEmail}
              progressMap={progressMap}
              onSelectShow={setSelectedShow}
              onPlayShow={handlePlayShow}
              onToggleMyList={toggleMyList}
            />

            <ContentRail
              id="fresh-releases"
              title="Fresh Releases & Simulcasts"
              subtitle="New episodes streaming with English & Chinese subtitles"
              shows={freshReleases}
              variant="episode"
              myListIds={myListIds}
              signedInEmail={signedInEmail}
              progressMap={progressMap}
              onSelectShow={setSelectedShow}
              onPlayShow={handlePlayShow}
              onToggleMyList={toggleMyList}
            />

            <ContentRail
              id="uwatch-originals"
              title="UWatch Originals"
              subtitle="Exclusive productions crafted for Asian audiences"
              shows={uwatchOriginals}
              variant="poster"
              myListIds={myListIds}
              signedInEmail={signedInEmail}
              progressMap={progressMap}
              onSelectShow={setSelectedShow}
              onPlayShow={handlePlayShow}
              onToggleMyList={toggleMyList}
            />

            <ContentRail
              id="variety-hits"
              title="Korean Variety Hits"
              subtitle="Weekly laughs, music duels, and celebrity challenges"
              shows={kVarietyShows}
              variant="poster"
              myListIds={myListIds}
              signedInEmail={signedInEmail}
              progressMap={progressMap}
              onSelectShow={setSelectedShow}
              onPlayShow={handlePlayShow}
              onToggleMyList={toggleMyList}
            />

            <ContentRail
              id="asian-picks"
              title="C-Dramas, Thai & Anime Picks"
              subtitle="Curated stories from Mainland China, Bangkok, and Tokyo"
              shows={regionalHits}
              variant="poster"
              myListIds={myListIds}
              signedInEmail={signedInEmail}
              progressMap={progressMap}
              onSelectShow={setSelectedShow}
              onPlayShow={handlePlayShow}
              onToggleMyList={toggleMyList}
            />
          </div>
        )}
      </main>

      <Footer
        signedInEmail={signedInEmail}
        onSelectNav={handleSelectNav}
        onOpenSignUp={handleCtaSignUp}
        onOpenPremium={handleCtaPremium}
      />

      <ShowDetailModal
        show={selectedShow}
        isSaved={selectedShow ? myListIds.includes(selectedShow.id) : false}
        isPremiumMember={isPremiumMember}
        signedInEmail={signedInEmail}
        onClose={() => setSelectedShow(null)}
        onToggleMyList={toggleMyList}
        onPlayEpisode={handlePlayEpisode}
        onOpenPremium={() => {
          setSelectedShow(null);
          setIsPremiumOpen(true);
        }}
        onOpenSignUp={() => {
          setSelectedShow(null);
          openSignUpModal();
        }}
      />

      <VideoPlayerModal
        show={playerState?.show ?? null}
        episode={playerState?.episode ?? null}
        initialTimeSeconds={playerState?.initialTimeSeconds ?? 14}
        isPremiumMember={isPremiumMember}
        signedInEmail={signedInEmail}
        onClose={() => setPlayerState(null)}
        onSelectEpisode={(ep) =>
          playerState &&
          setPlayerState({
            show: playerState.show,
            episode: ep,
            initialTimeSeconds: getInitialTimeSeconds(playerState.show.id, ep),
          })
        }
        onProgressUpdate={handleProgressUpdate}
        onOpenPremium={() => {
          setPlayerState(null);
          setIsPremiumOpen(true);
        }}
        onOpenSignUp={() => {
          setPlayerState(null);
          openSignUpModal();
        }}
      />

      <PremiumModal
        isOpen={isPremiumOpen}
        isPremiumMember={isPremiumMember}
        onClose={() => setIsPremiumOpen(false)}
        onActivatePremium={() => setIsPremiumMember(true)}
      />

      <SignInModal
        isOpen={isSignInOpen}
        initialMode={authModalMode}
        signedInEmail={signedInEmail}
        onClose={() => setIsSignInOpen(false)}
        onSignIn={(email, isNewSignUp) => {
          setSignedInEmail(email);
          if (isNewSignUp) {
            track('goal_complete');
          }
          setProgressMap((prev) =>
            Object.keys(prev).length > 0
              ? prev
              : {
                  'seoul-ward-24': {
                    episodeNumber: 3,
                    percent: 62,
                    updatedAt: Date.now() - 1000,
                  },
                  'celadon-mist-chronicles': {
                    episodeNumber: 4,
                    percent: 38,
                    updatedAt: Date.now() - 2000,
                  },
                  'running-man-sg-special': {
                    episodeNumber: 2,
                    percent: 45,
                    updatedAt: Date.now() - 3000,
                  },
                }
          );
        }}
        onSignOut={() => {
          setSignedInEmail(null);
          if (activeNav === 'My List') {
            setActiveNav('Home');
          }
        }}
      />

      {consentChoice === null && (
        <ConsentBanner
          onAccept={() => {
            setConsent('granted');
            setConsentChoice('granted');
          }}
          onDecline={() => {
            setConsent('denied');
            setConsentChoice('denied');
          }}
        />
      )}
    </div>
  );
}
