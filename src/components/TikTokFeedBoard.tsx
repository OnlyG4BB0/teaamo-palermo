import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  Pause,
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
      className={`snap-center shrink-0 w-[280px] xs:w-[310px] sm:w-[330px] md:w-[340px] rounded-2xl border-2 bg-white dark:bg-[#120B0E] overflow-hidden flex flex-col justify-between shadow-md transition-all duration-300 ${
        isActive
          ? 'border-[#FD5E86] shadow-xl scale-100 ring-4 ring-[#FD5E86]/10'
          : 'border-[#FCE4EC] dark:border-[#281E23] opacity-85 scale-[0.97] hover:opacity-100 hover:scale-[0.99]'
      }`}
    >
      {/* Card Top Bar */}
      <div className="p-3 border-b border-[#FCE4EC] dark:border-[#281E23] bg-[#FFF5F8] dark:bg-[#180E13] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-full bg-[#FD5E86] text-white flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
            0{index + 1}
          </span>
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold text-[#1C0D12] dark:text-white truncate">
              @teaamobubbletea
            </p>
            <p className="font-mono text-[9px] text-[#FD5E86] uppercase tracking-wider truncate">
              {video.tag}
            </p>
          </div>
        </div>

        {video.badge && (
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-black border border-[#FD5E86] text-[#FD5E86] font-bold shrink-0 shadow-2xs">
            {video.badge}
          </span>
        )}
      </div>

      {/* Video Container (Vertical 9:16) */}
      <div
        className="relative w-full h-[500px] sm:h-[540px] bg-black overflow-hidden cursor-pointer select-none"
        onClick={togglePlayPause}
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.coverUrl}
          autoPlay
          muted={!isUnmuted}
          loop
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />

        {/* Video Overlay Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />

        {/* Top Floating Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
          {/* Audio Unmute / Mute Toggle Button */}
          <button
            type="button"
            onClick={handleAudioClick}
            aria-label={isUnmuted ? 'Disattiva audio' : 'Attiva audio'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium backdrop-blur-md transition-all duration-300 shadow-md ${
              isUnmuted
                ? 'bg-[#FD5E86] text-white ring-2 ring-[#FD5E86]/50 animate-pulse'
                : 'bg-black/60 text-white hover:bg-[#FD5E86] hover:text-white border border-white/20'
            }`}
          >
            {isUnmuted ? (
              <>
                <Volume2 className="w-4 h-4 text-white" />
                <span className="font-semibold tracking-wide">AUDIO ON</span>
                {/* Animated Equalizer wave */}
                <span className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-2/3 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-white/80" />
                <span>Ascolta</span>
              </>
            )}
          </button>

          {/* Play/Pause state indicator */}
          <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 border border-white/10">
            {isPlaying ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-white" />
            )}
          </div>
        </div>

        {/* Pause Overlay (when paused by tap) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-10 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-[#FD5E86]/90 flex items-center justify-center text-white shadow-xl animate-scale-up">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Floating Info (TikTok Style) */}
        <div className="absolute bottom-3 left-3 right-3 text-white z-10 pointer-events-auto space-y-2">
          {/* Metrics Pill (Views + Likes) */}
          <div className="flex items-center gap-3 text-xs font-mono font-medium drop-shadow-md">
            <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15">
              <Eye className="w-3.5 h-3.5 text-[#FD5E86]" />
              {video.views}
            </span>
            <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15">
              <Heart className="w-3.5 h-3.5 text-[#FD5E86] fill-current" />
              {video.likes}
            </span>
          </div>

          {/* Video Title / Caption */}
          <p className="text-xs sm:text-[13px] font-sans font-medium text-white/95 leading-snug line-clamp-2 drop-shadow-md">
            {video.title}
          </p>

          {/* Music Track Note */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/80 drop-shadow-xs truncate">
            <Music className="w-3 h-3 text-[#FD5E86] shrink-0 animate-spin-slow" />
            <span className="truncate">{video.music}</span>
          </div>
        </div>

        {/* Pink Scrub / Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-[#FD5E86] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Footer Bar */}
      <div className="p-3 bg-white dark:bg-[#120B0E] border-t border-[#FCE4EC] dark:border-[#281E23] flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-[#7A5A66] dark:text-[#A3939B] truncate">
          Viale Strasburgo 378
        </span>

        <a
          href={video.tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF0F5] dark:bg-white/5 border border-[#FCE4EC] hover:border-[#FD5E86] hover:bg-[#FD5E86] hover:text-white text-[#FD5E86] font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 shrink-0 shadow-2xs"
        >
          <span>Apri su TikTok</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
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

  // Accurately determine which card is closest to the carousel container's center
  const checkActiveCard = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIdx = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);
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

  // Smoothly center a specific slide
  const scrollToSlide = (index: number) => {
    const cardEl = cardRefs.current[index];
    if (!cardEl) return;
    cardEl.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
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
    <section
      id="tiktok"
      className="border-b border-[#FCE4EC] dark:border-[#281E23] py-14 sm:py-24 bg-[#FFF9FA] dark:bg-[#0D090B] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-10 border-b border-[#FCE4EC] dark:border-[#281E23] gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FD5E86] live-dot shrink-0" />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#FD5E86] font-semibold">
                03 / CAROSELLO VIDEO UFFICIALI • @TEAAMOBUBBLETEA
              </p>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-none text-[#1C0D12] dark:text-[#F5EFEA]">
              Bacheca Video{' '}
              <span className="italic text-[#FD5E86]">TikTok</span>
            </h2>
            <p className="mt-3 text-sm text-[#7A5A66] dark:text-[#A3939B] max-w-xl">
              I 7 video originali del nostro canale: riproduzione continua in silenzioso. Tocca <strong>"Ascolta"</strong> su qualsiasi video per attivare l'audio originale.
            </p>
          </div>

          {/* Carousel Navigation Controls & Official Channel Link */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Arrow Navigation */}
            <div className="inline-flex items-center rounded-full border-2 border-[#FCE4EC] dark:border-[#281E23] bg-white dark:bg-[#120B0E] p-1 shadow-xs">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                disabled={!canScrollLeft}
                aria-label="Video precedente"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  canScrollLeft
                    ? 'text-[#1C0D12] dark:text-white hover:bg-[#FD5E86] hover:text-white'
                    : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <span className="w-px h-5 bg-[#FCE4EC] dark:bg-[#281E23] mx-1" />
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                disabled={!canScrollRight}
                aria-label="Video successivo"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  canScrollRight
                    ? 'text-[#1C0D12] dark:text-white hover:bg-[#FD5E86] hover:text-white'
                    : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Official Channel Button */}
            <MagneticWrap strength={0.15}>
              <a
                href={TEAAMO_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FD5E86] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#1C0D12] transition-colors shadow-sm font-semibold"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.74 4.54 6.3 6.3 0 0 0 1.95-4.57V8.71a8.21 8.21 0 0 0 4.76 1.5V6.76a4.87 4.87 0 0 1-1-.07z" />
                </svg>
                <span className="hidden sm:inline">@teaamobubbletea</span>
                <span className="sm:hidden">TikTok</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </a>
            </MagneticWrap>
          </div>
        </RevealOnScroll>

        {/* Channel Status Banner */}
        <div className="py-3 px-4 border-x border-b border-[#FCE4EC] dark:border-[#281E23] bg-white dark:bg-[#140E11] flex items-center justify-between text-xs font-mono text-[#7A5A66] dark:text-[#A3939B]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#FD5E86] live-dot shrink-0" />
            <span className="font-medium text-[#1C0D12] dark:text-white truncate">
              {TIKTOK_VIDEOS.length} Video Originali Caricati
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {unmutedVideoId && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#FD5E86] font-semibold">
                <Volume2 className="w-3.5 h-3.5" />
                Audio Attivo
              </span>
            )}
            <div className="font-mono text-xs text-[#FD5E86] font-bold">
              Video {activeSlideIndex + 1} di {TIKTOK_VIDEOS.length}
            </div>
          </div>
        </div>

        {/* 7-Video Horizontal Native Carousel (Center-Snapped Spotlight) */}
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory py-6 px-4 sm:px-[calc(50%-165px)] md:px-[calc(50%-170px)] border-x border-b border-[#FCE4EC] dark:border-[#281E23] bg-[#FFF9FA] dark:bg-[#0D090B]"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
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

        {/* Carousel Pagination Dots (1:1 with all 7 accessible videos) */}
        <div className="py-4 border-x border-b border-[#FCE4EC] dark:border-[#281E23] bg-white dark:bg-[#120B0E] flex items-center justify-center gap-2">
          {TIKTOK_VIDEOS.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => scrollToSlide(dotIdx)}
              aria-label={`Vai al video ${dotIdx + 1}`}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                activeSlideIndex === dotIdx
                  ? 'w-8 bg-[#FD5E86]'
                  : 'w-2 bg-[#FCE4EC] dark:bg-[#281E23] hover:bg-[#FD5E86]/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
