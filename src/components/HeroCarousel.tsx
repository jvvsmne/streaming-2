import { useEffect, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Lock,
  Play,
  Sparkles,
} from 'lucide-react';
import { Show } from '../data/catalog';
import { MediaImage } from './MediaImage';

interface HeroCarouselProps {
  slides: Show[];
  myListIds: string[];
  signedInEmail: string | null;
  onSignUpClick: () => void;
  onAccountClick: () => void;
  onPlayLatestEpisode: (show: Show, episodeNumber: number) => void;
  onSelectShow: (show: Show) => void;
  onToggleMyList: (showId: string) => void;
}

export function HeroCarousel({
  slides,
  myListIds,
  signedInEmail,
  onSignUpClick,
  onAccountClick,
  onPlayLatestEpisode,
  onSelectShow,
  onToggleMyList,
}: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 7500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeIndex] ?? slides[0];
  if (!current) return null;

  const isSaved = myListIds.includes(current.id);
  const latestEp = current.episodes[current.episodes.length - 1];
  const latestEpNum = latestEp?.number ?? current.availableEpisodes;
  const isLatestLocked = Boolean(latestEp?.requiresSignIn && !signedInEmail);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      aria-label="Featured currently airing premieres"
      className="relative w-full overflow-hidden bg-[#111113]"
    >
      <div className="relative min-h-[480px] sm:min-h-[540px] lg:min-h-[590px] w-full flex">
        {/* Background Key Art with smooth crossfade */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            aria-hidden={index !== activeIndex}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <MediaImage
              src={slide.backdropUrl}
              alt={`${slide.title} featured backdrop`}
              fallbackTitle={slide.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}

        {/* Measured multi-stop scrim for guaranteed WCAG AA legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#111113] via-[#111113]/80 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-[#111113]/35"
        />

        {/* Editorial Hero Content Overlay */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-end px-4 pt-16 pb-12 sm:px-8 sm:pb-14">
          <div className="max-w-2xl">
            <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-[#FF6B00]">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-[#FF6B00] shadow-[0_0_8px_#FF6B00]"
                />
                <span>Currently Airing</span>
              </span>
              <span aria-hidden="true" className="text-white/30">·</span>
              <span>{current.isOriginal ? 'UWatch Original' : current.category}</span>
              {current.simulcastNote && (
                <>
                  <span aria-hidden="true" className="text-white/30">·</span>
                  <span className="text-[#E4E4E7] font-medium">
                    {current.simulcastNote.replace(/^Currently Airing\s*·\s*/i, '')}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.08] [text-wrap:balance]">
              {current.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-[#D4D4D8] tabular-nums">
              <span>{current.year}</span>
              <span aria-hidden="true">·</span>
              <span>
                {current.availableEpisodes} of {current.totalEpisodes} Episodes
              </span>
              <span aria-hidden="true">·</span>
              <span>{current.genres.join(', ')}</span>
              <span aria-hidden="true">·</span>
              <span>{current.subtitles.join(' / ')} Sub</span>
            </div>

            <p className="mt-3.5 max-w-xl text-sm sm:text-[15px] leading-relaxed text-[#E4E4E7] line-clamp-2 sm:line-clamp-3">
              {current.synopsis}
            </p>

            {/* Latest Episode Lock / Priority Access Status */}
            <div className="mt-4">
              {!signedInEmail ? (
                <div className="inline-flex items-center gap-2 rounded-md border border-[#FF6B00]/40 bg-[#1A1A1E]/90 px-3 py-1.5 text-xs sm:text-sm text-[#F5F5F7]">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-[#FF6B00]" aria-hidden="true" />
                  <span>
                    <strong className="text-white">Not signed in</strong> · Latest Episode (
                    <strong className="text-[#FF6B00]">Ep {latestEpNum}</strong>) is locked —{' '}
                    <span className="font-semibold text-[#FF6B00]">Priority Access</span> for members
                  </span>
                </div>
              ) : (
                <div className="inline-flex flex-wrap items-center gap-2 rounded-md border border-emerald-400/35 bg-[#1A1A1E]/90 px-3 py-1.5 text-xs sm:text-sm text-[#F5F5F7]">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span>
                    <strong className="text-emerald-400">Priority Access Unlocked</strong> · Ep {latestEpNum} ready to stream
                  </span>
                  <button
                    type="button"
                    onClick={onAccountClick}
                    className="ml-1 text-xs font-semibold text-[#D4D4D8] underline underline-offset-2 hover:text-white cursor-pointer"
                  >
                    Account
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {isLatestLocked ? (
                <button
                  type="button"
                  onClick={onSignUpClick}
                  className="animate-uwatch-flash inline-flex items-center gap-2 rounded-md bg-[#FF6B00] px-5 py-3 text-sm sm:text-base font-extrabold tracking-wide text-[#111113] transition-colors duration-150 hover:bg-[#FF8533] shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B00]"
                >
                  <Sparkles className="h-4 w-4 stroke-[2.5] shrink-0" aria-hidden="true" />
                  <span>Sign Up for Priority Access · Unlock Ep {latestEpNum}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onPlayLatestEpisode(current, latestEpNum)}
                  className="inline-flex items-center gap-2 rounded-md bg-[#FF6B00] px-5 py-3 text-sm sm:text-base font-extrabold tracking-wide text-[#111113] transition-colors duration-150 hover:bg-[#FF8533] shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B00]"
                >
                  <Play className="h-4 w-4 fill-current shrink-0" aria-hidden="true" />
                  <span>Watch Ep {latestEpNum} · Priority Access</span>
                </button>
              )}

              {signedInEmail && (
                <button
                  type="button"
                  onClick={() => onToggleMyList(current.id)}
                  className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-[#1A1A1E]/80 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#232329] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B00]"
                >
                  {isSaved ? (
                    <Check className="h-4 w-4 text-[#FF6B00]" aria-hidden="true" />
                  ) : (
                    <Bookmark className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{isSaved ? 'In My List' : 'My List'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onSelectShow(current)}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-[#1A1A1E]/75 px-4 py-2.5 text-sm font-medium text-[#E4E4E7] transition-colors duration-150 hover:text-white hover:bg-[#232329] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B00]"
              >
                <Info className="h-4 w-4" aria-hidden="true" />
                <span>Details</span>
              </button>
            </div>
          </div>

          {/* Slide controls & indicators */}
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 md:mt-0 md:border-t-0 md:pt-0 md:absolute md:bottom-14 md:right-8 md:gap-4">
            <div className="flex items-center gap-2" role="tablist" aria-label="Featured slides">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Show slide ${idx + 1}: ${slide.title}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B00] ${
                    idx === activeIndex
                      ? 'w-8 bg-[#FF6B00]'
                      : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous featured show"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-[#1A1A1E]/80 text-white transition-colors hover:bg-[#232329] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B00]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next featured show"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-[#1A1A1E]/80 text-white transition-colors hover:bg-[#232329] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B00]"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
