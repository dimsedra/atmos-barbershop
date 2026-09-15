import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, MapPin, Star, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { STYLISTS_DATA } from '../data/stylists';
import { BRANCHES_DATA } from '../data/branches';
import { Stylist } from '../types';

interface MobileCapsterDeckProps {
  onBookWithCapster: (branchId: string, capster?: Stylist) => void;
}

const AUTO_SWIPE_INTERVAL = 8000; // 8 detik per stylist

export const MobileCapsterDeck: React.FC<MobileCapsterDeckProps> = ({ onBookWithCapster }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [progress, setProgress] = useState(0); // 0 to 100 for current card

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isInteractingRef = useRef(false);
  const timerStartRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  const total = STYLISTS_DATA.length;
  const currentStylist = STYLISTS_DATA[currentIndex];
  const nextStylist = STYLISTS_DATA[(currentIndex + 1) % total];
  const nextNextStylist = STYLISTS_DATA[(currentIndex + 2) % total];

  const getBranchName = (branchId: string) => {
    const branch = BRANCHES_DATA.find((b) => b.id === branchId);
    return branch ? branch.name.replace('ATMOS ', '') : 'Jabodetabek';
  };

  // Function to advance to next card (infinite)
  const handleNext = useCallback((direction: 'left' | 'right' = 'left') => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
      timerStartRef.current = Date.now();
      setProgress(0);
    }, 280);
  }, [total]);

  // Function to go to previous card (infinite)
  const handlePrev = useCallback(() => {
    setSwipeDirection('right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + total) % total);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
      timerStartRef.current = Date.now();
      setProgress(0);
    }, 280);
  }, [total]);

  // 8-second auto-swipe interval with real-time smooth progress
  useEffect(() => {
    timerStartRef.current = Date.now();

    const updateTimer = () => {
      if (!isInteractingRef.current && !isDragging && !swipeDirection) {
        const elapsed = Date.now() - timerStartRef.current;
        const currentProgress = Math.min((elapsed / AUTO_SWIPE_INTERVAL) * 100, 100);
        setProgress(currentProgress);

        if (elapsed >= AUTO_SWIPE_INTERVAL) {
          handleNext('left');
          return;
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentIndex, isDragging, swipeDirection, handleNext]);

  // Touch / Pointer Event Handlers for Tinder-style Swiping
  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't drag if clicking buttons directly
    if ((e.target as HTMLElement).closest('button')) return;
    
    isInteractingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = (e.clientY - dragStartRef.current.y) * 0.4; // soften vertical motion
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    isInteractingRef.current = false;
    timerStartRef.current = Date.now(); // reset timer on release

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const threshold = 75; // swipe sensitivity threshold
    if (dragOffset.x > threshold) {
      // Swiped Right -> Next card
      handleNext('right');
    } else if (dragOffset.x < -threshold) {
      // Swiped Left -> Next card
      handleNext('left');
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Rotation math for realistic card physics: ~1 deg per 10px drag
  const rotation = dragOffset.x * 0.08;
  const isLeaving = swipeDirection !== null;

  const topCardTransform = isLeaving
    ? swipeDirection === 'right'
      ? 'translate3d(140%, 20px, 0) rotate(25deg)'
      : 'translate3d(-140%, 20px, 0) rotate(-25deg)'
    : isDragging
    ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotation}deg)`
    : 'translate3d(0, 0, 0) rotate(0deg)';

  return (
    <div className="space-y-6 select-none touch-none">
      
      {/* Top Multi-Story Progress Bar (8-second auto-swipe indicator) */}
      <div className="space-y-2 max-w-md mx-auto">
        <div className="flex items-center gap-1.5 px-1">
          {STYLISTS_DATA.map((stylist, idx) => {
            const isPast = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const fillWidth = isPast ? '100%' : isCurrent ? `${progress}%` : '0%';

            return (
              <div
                key={stylist.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  timerStartRef.current = Date.now();
                  setProgress(0);
                }}
                className="h-1 flex-1 bg-black/10 rounded-full overflow-hidden cursor-pointer"
              >
                <div
                  className="h-full bg-[#121214] rounded-full transition-all"
                  style={{
                    width: fillWidth,
                    transition: isCurrent ? 'none' : 'width 0.2s ease',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Counter & Hint */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1">
          <span className="flex items-center gap-1.5 text-[#8A7862] font-semibold">
            <Sparkles className="w-3 h-3 text-[#BFA888]" />
            <span>ARTISAN 0{currentIndex + 1} / 0{total}</span>
          </span>
          <span className="text-zinc-400">
            Auto-swipe 8d • Geser bebas
          </span>
        </div>
      </div>

      {/* Tinder Card Stack Arena */}
      <div className="relative h-[510px] sm:h-[560px] max-w-md mx-auto perspective-1000">
        
        {/* Card 3 (Bottom Peeker in Stack) */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden bg-zinc-800 border border-[#E6E4DF]/60 shadow-sm pointer-events-none transition-all duration-300"
          style={{
            transform: 'translate3d(0, 24px, 0) scale(0.90)',
            opacity: 0.45,
            zIndex: 10,
          }}
        >
          <img
            src={nextNextStylist.avatar}
            alt={nextNextStylist.name}
            className="w-full h-full object-cover grayscale opacity-60"
          />
        </div>

        {/* Card 2 (Middle Peeker in Stack) */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden bg-zinc-900 border border-[#E6E4DF] shadow-md pointer-events-none transition-all duration-300"
          style={{
            transform: isDragging
              ? `translate3d(0, ${14 - Math.min(Math.abs(dragOffset.x) * 0.05, 8)}px, 0) scale(${
                  0.95 + Math.min(Math.abs(dragOffset.x) * 0.0003, 0.04)
                })`
              : 'translate3d(0, 14px, 0) scale(0.95)',
            opacity: isDragging ? 0.75 + Math.min(Math.abs(dragOffset.x) * 0.001, 0.2) : 0.75,
            zIndex: 20,
          }}
        >
          <img
            src={nextStylist.avatar}
            alt={nextStylist.name}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E11]/90 via-[#0E0E11]/30 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white/80 font-display text-xl font-bold">
            {nextStylist.name}
          </div>
        </div>

        {/* Card 1: Top Active Swipeable Card */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 rounded-3xl overflow-hidden bg-zinc-900 border border-[#E6E4DF] shadow-[0_12px_36px_rgba(0,0,0,0.12)] cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: topCardTransform,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 30,
          }}
        >
          {/* Main Stylist Photo */}
          <img
            src={currentStylist.avatar}
            alt={currentStylist.name}
            className="w-full h-full object-cover object-top pointer-events-none"
          />

          {/* Tinder Swipe Stamp Indicators */}
          {dragOffset.x > 30 && (
            <div
              className="absolute top-16 left-6 border-2 border-emerald-500 text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg -rotate-12 backdrop-blur-xs bg-emerald-950/40 pointer-events-none transition-opacity"
              style={{ opacity: Math.min(dragOffset.x / 80, 1) }}
            >
              NEXT ARTISAN
            </div>
          )}
          {dragOffset.x < -30 && (
            <div
              className="absolute top-16 right-6 border-2 border-[#BFA888] text-[#D8C29D] font-mono font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg rotate-12 backdrop-blur-xs bg-black/40 pointer-events-none transition-opacity"
              style={{ opacity: Math.min(Math.abs(dragOffset.x) / 80, 1) }}
            >
              SWIPE NEXT
            </div>
          )}

          {/* Top Info Floating Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="px-3 py-1.5 rounded-full bg-[#0E0E11]/85 backdrop-blur-md text-[11px] font-mono text-[#D8C29D] border border-white/10 flex items-center gap-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#BFA888]" />
              <span>Studio {getBranchName(currentStylist.branchId)}</span>
            </span>

            <span className="px-2.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1 border border-white/10 shadow-sm">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{currentStylist.rating}</span>
            </span>
          </div>

          {/* Gradient Scrim for Impeccable Bottom Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E11] via-[#0E0E11]/50 to-transparent pointer-events-none" />

          {/* Stylist Profile & Details */}
          <div className="absolute bottom-5 left-5 right-5 text-white space-y-3">
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#D8C29D]">
                {currentStylist.experience}
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                {currentStylist.name}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 font-normal">
                {currentStylist.role}
              </p>
            </div>

            {/* Specialties Tags */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {currentStylist.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono text-zinc-200 bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-full"
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* Action Button Right inside the card bottom */}
            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookWithCapster(currentStylist.branchId, currentStylist);
                }}
                className="w-full py-3.5 rounded-full bg-white hover:bg-zinc-200 text-[#121214] text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Reservasi dengan {currentStylist.name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Tinder-style Bottom Control Bar */}
      <div className="flex items-center justify-center gap-4 max-w-md mx-auto pt-1">
        {/* Rewind / Prev button */}
        <button
          onClick={() => handlePrev()}
          className="w-12 h-12 rounded-full bg-white border border-[#E6E4DF] shadow-sm flex items-center justify-center text-zinc-600 hover:text-[#121214] hover:border-zinc-400 active:scale-95 transition-all cursor-pointer"
          aria-label="Artisan sebelumnya"
          title="Artisan sebelumnya"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Swipe Left (Next) */}
        <button
          onClick={() => handleNext('left')}
          className="w-14 h-14 rounded-full bg-[#121214] text-white shadow-md flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer group"
          aria-label="Geser ke artisan berikutnya"
          title="Geser ke artisan berikutnya"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Next Card direct indicator */}
        <button
          onClick={() => handleNext('right')}
          className="w-12 h-12 rounded-full bg-white border border-[#E6E4DF] shadow-sm flex items-center justify-center text-zinc-600 hover:text-[#121214] hover:border-zinc-400 active:scale-95 transition-all cursor-pointer"
          aria-label="Artisan berikutnya"
          title="Artisan berikutnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
