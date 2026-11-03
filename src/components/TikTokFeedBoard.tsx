import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  Heart,
  Eye,
  Music,
} from 'lucide-react';
import { TIKTOK_VIDEOS, TikTokVideo, TEAAMO_LINKS } from '../data/teaamoData';
import { RevealOnScroll, MagneticWrap } from './ui/AnimatedPrimitives';

interface TikTokFeedBoardProps {
  className?: string;
}

interface VideoCardProps {
  video: TikTokVideo;
  index: number;
  isUnmuted: boolean;
  isActive: boolean;
  onToggleUnmute: (id: string) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

const TikTokVideoCard: React.FC<VideoCardProps> = ({
  video,
  index,
  isUnmuted,
  isActive,
  onToggleUnmute,
  cardRef,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Sync mute state with parent (only 1 video plays audio at a time)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !isUnmuted;
    if (isUnmuted) {
      el.volume = 1;
      el.play().catch(() => {});
    }
  }, [isUnmuted]);

  // Performance optimization: Only play video when this card is ACTIVE in viewport.
  // When inactive, pause to save mobile memory, CPU and battery.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Handle play / pause toggle
  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;

    if (el.paused) {
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  // Handle audio unmute click
  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleUnmute(video.id);
  };

  // Update progress bar
  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    setProgress((el.currentTime / el.duration) * 100);
  };

  return (
    <div
      ref={cardRef}
      className={`snap-start shrink-0 w-[260px] sm:w-[300px] md:w-[320px] transition-all duration-500 ${
        isActive ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-60 hover:opacity-90'
      }`}
    >
      <div
        className={`relative w-full aspect-[9/16] rounded-[2rem] overflow-hidden bg-night-2 cursor-pointer select-none transition-shadow duration-500 ${
          isActive ? 'shadow-neon' : 'ring-1 ring-white/10'
        }`}
        onClick={togglePlayPause}
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.coverUrl}
          autoPlay={isActive}
          muted={!isUnmuted}
          loop
          playsInline
          preload={isActive ? 'auto' : 'none'}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night/50 via-transparent to-night/90 pointer-events-none" />

        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={handleAudioClick}
            aria-label={isUnmuted ? 'Disattiva audio' : 'Attiva audio'}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold backdrop-blur-md transition-all duration-300 ${
              isUnmuted ? 'bg-pop text-white' : 'lg lg-dark text-white'
            }`}
          >
            {isUnmuted ? <Volume2 className="w-4 h-4" aria-hidden="true" /> : <VolumeX className="w-4 h-4" aria-hidden="true" />}
            {isUnmuted ? 'Audio on' : 'Ascolta'}
            {isUnmuted && (
              <span className="flex items-end gap-0.5 h-3 ml-0.5" aria-hidden="true">
                <span className="w-0.5 h-full bg-white animate-bounce" />
                <span className="w-0.5 h-2/3 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            )}
          </button>
          {video.badge && (
            <span className="rounded-full bg-mango text-ink px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide">{video.badge}</span>
          )}
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="w-16 h-16 rounded-full bg-white/90 text-ink flex items-center justify-center shadow-neon">
              <Play className="w-7 h-7 fill-current ml-1" aria-hidden="true" />
            </span>
          </div>
        )}

        <div className="absolute bottom-4 inset-x-4 z-10 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-pop to-taro flex items-center justify-center font-display font-extrabold text-xs text-white">
              {index + 1}
            </span>
            <span className="text-sm font-bold">@teaamobubbletea</span>
          </div>
          <p className="text-[13px] font-medium text-white/95 leading-snug line-clamp-2">{video.title}</p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="lg lg-dark inline-flex items-center gap-1 rounded-full px-2.5 py-1">
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                {video.views}
              </span>
              <span className="lg lg-dark inline-flex items-center gap-1 rounded-full px-2.5 py-1">
                <Heart className="w-3.5 h-3.5 fill-pop text-pop" aria-hidden="true" />
                {video.likes}
              </span>
            </div>
            <a
              href={video.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Apri il video su TikTok"
              className="w-9 h-9 rounded-full bg-white text-ink flex items-center justify-center hover:scale-110 transition-transform"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-white/70 truncate">
            <Music className="w-3 h-3 shrink-0 animate-spin-slow" aria-hidden="true" />
            <span className="truncate">{video.music}</span>
          </p>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/15 z-20">
          <div className="h-full bg-gradient-to-r from-pop to-taro" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export const TikTokFeedBoard: React.FC<TikTokFeedBoardProps> = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [unmutedVideoId, setUnmutedVideoId] = useState<string | null>(null);

  // Toggle audio for a specific video card (and mute all others)
  const handleToggleUnmute = (id: string) => {
    setUnmutedVideoId((prev) => (prev === id ? null : id));
  };

  // Accurately determine which card is at the left-aligned viewing position
  const checkActiveCard = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerTarget = containerRect.left + (parseFloat(getComputedStyle(container).paddingLeft) || 0);

    let closestIdx = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const distance = Math.abs(containerTarget - rect.left);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    setActiveSlideIndex(closestIdx);
    setCanScrollLeft(closestIdx > 0);
    setCanScrollRight(closestIdx < TIKTOK_VIDEOS.length - 1);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkActiveCard, { passive: true });
    checkActiveCard();
    return () => el.removeEventListener('scroll', checkActiveCard);
  }, [checkActiveCard]);

  // Smoothly scroll to a specific slide aligned to left
  const scrollToSlide = (index: number) => {
    const cardEl = cardRefs.current[index];
    if (!cardEl) return;
    cardEl.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'nearest',
    });
  };

  // Scroll carousel left or right by 1 item
  const scrollCarousel = (direction: 'left' | 'right') => {
    const targetIdx =
      direction === 'left'
        ? Math.max(activeSlideIndex - 1, 0)
        : Math.min(activeSlideIndex + 1, TIKTOK_VIDEOS.length - 1);
    scrollToSlide(targetIdx);
  };

  return (
    <section id="tiktok" className="relative pt-16 sm:pt-28 pb-12 sm:pb-16 overflow-hidden" aria-labelledby="tiktok-title">
      <span className="blob w-[520px] h-[520px] -left-56 top-10 bg-pop/25" aria-hidden="true" />
      <span className="blob w-[460px] h-[460px] -right-40 bottom-0 bg-taro/20" style={{ animationDelay: '-8s' }} aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="glass-night inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-haze">
              <span className="w-2 h-2 rounded-full bg-pop animate-pulse" aria-hidden="true" />
              {TIKTOK_VIDEOS.length} video · @teaamobubbletea
            </span>
            <h2 id="tiktok-title" className="mt-5 font-display font-extrabold tracking-[-0.05em] leading-[0.9] text-[clamp(2.6rem,6.5vw,5.5rem)]">
              Dietro il <span className="text-neon">bancone</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-haze max-w-xl">
              I video del nostro TikTok partono da soli, senza audio. Tocca &ldquo;Ascolta&rdquo; per sentire il suono originale.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="lg lg-dark inline-flex items-center rounded-full p-1">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                disabled={!canScrollLeft}
                aria-label="Video precedente"
                className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors enabled:hover:bg-white enabled:hover:text-ink disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                disabled={!canScrollRight}
                aria-label="Video successivo"
                className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors enabled:hover:bg-white enabled:hover:text-ink disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <MagneticWrap strength={0.15}>
              <a
                href={TEAAMO_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-squish inline-flex items-center gap-2 rounded-full bg-white text-ink px-5 py-3 font-display font-bold"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.74 4.54 6.3 6.3 0 0 0 1.95-4.57V8.71a8.21 8.21 0 0 0 4.76 1.5V6.76a4.87 4.87 0 0 1-1-.07z" />
                </svg>
                Seguici
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </MagneticWrap>
          </div>
        </RevealOnScroll>
      </div>

      <div
        ref={carouselRef}
        className="relative mt-6 sm:mt-10 flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory py-6 px-4 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] scroll-px-4 sm:scroll-px-6 lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {TIKTOK_VIDEOS.map((video, idx) => (
          <TikTokVideoCard
            key={video.id}
            cardRef={(el) => {
              cardRefs.current[idx] = el;
            }}
            video={video}
            index={idx}
            isActive={activeSlideIndex === idx}
            isUnmuted={unmutedVideoId === video.id}
            onToggleUnmute={handleToggleUnmute}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center">
        {TIKTOK_VIDEOS.map((_, dotIdx) => (
          <button
            key={dotIdx}
            type="button"
            onClick={() => scrollToSlide(dotIdx)}
            aria-label={`Vai al video ${dotIdx + 1}`}
            aria-current={activeSlideIndex === dotIdx ? 'true' : undefined}
            className="group h-11 min-w-[24px] px-1 flex items-center justify-center"
          >
            <span
              className={`block h-2.5 rounded-full transition-all duration-500 ${
                activeSlideIndex === dotIdx ? 'w-10 bg-gradient-to-r from-pop to-taro' : 'w-2.5 bg-white/25 group-hover:bg-white/50'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
};
