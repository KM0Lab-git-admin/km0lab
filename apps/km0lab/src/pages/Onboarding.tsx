import { useState, useRef, useCallback, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import BrandedFrame from "@/components/BrandedFrame";
import { slides } from "@/data/onboardingSlides";
import { cn } from "@/lib/utils";

type Lang = "ca" | "es" | "en";

const getTitle = (slide: typeof slides[0], lang: Lang) => {
  if (lang === "ca") return slide.titleCa;
  if (lang === "en") return slide.titleEn;
  return slide.titleEs;
};

const getDesc = (slide: typeof slides[0], lang: Lang) => {
  if (lang === "ca") return slide.descCa;
  if (lang === "en") return slide.descEn;
  return slide.descEs;
};

const SLOT = 260;
// Slot width for landscape — adapt to viewport so 1280×550 uses wider slots than 667×375
const getSlotLs = () => {
  if (typeof window === "undefined") return 420;
  const w = window.innerWidth;
  if (w >= 1280) return 560; // horizontal-desktop (1280×550)
  return 360; // horizontal-mobile (667×375)
};

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lang: Lang = (location.state?.lang as Lang) ?? "es";

  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(390);
  const [containerWidthLs, setContainerWidthLs] = useState(1200);
  const [portraitScale, setPortraitScale] = useState(1);
  const [slotLs, setSlotLs] = useState(420);
  const touchStartX = useRef<number | null>(null);
  const touchStartXLs = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselRefLs = useRef<HTMLDivElement>(null);

  const measureCarousel = useCallback(() => {
    if (carouselRef.current) {
      setContainerWidth(carouselRef.current.offsetWidth);
    }
    if (carouselRefLs.current) {
      setContainerWidthLs(carouselRefLs.current.offsetWidth);
    }
    // Scale up the portrait carousel on tablets (sm+) to better fill the viewport
    if (typeof window !== "undefined") {
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      const isSm = window.matchMedia("(min-width: 640px)").matches;
      setPortraitScale(isPortrait && isSm ? 1.35 : 1);
      // Adapt landscape slot width: wide screens (1280×550) use bigger slots than 667×375
      setSlotLs(getSlotLs());
    }
  }, []);

  useLayoutEffect(() => {
    measureCarousel();
    window.addEventListener("resize", measureCarousel);
    return () => window.removeEventListener("resize", measureCarousel);
  }, [measureCarousel]);

  const total = slides.length;
  const isFirst = current === 0;
  const isLast = current === total - 1;

  const prev = () => { if (!isFirst) setCurrent((c) => c - 1); };
  const next = () => { if (!isLast) setCurrent((c) => c + 1); };
  const goTo = (i: number) => setCurrent(i);

  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (touchStartX.current === null) return;
    setDragOffset(e.clientX - touchStartX.current);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.clientX;
    touchStartX.current = null;
    setDragOffset(0);
    if (Math.abs(delta) > 40) {
      if (delta > 0) next();
      else prev();
    }
  };

  const handlePointerDownLs = (e: React.PointerEvent) => {
    touchStartXLs.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveLs = (e: React.PointerEvent) => {
    if (touchStartXLs.current === null) return;
    setDragOffset(e.clientX - touchStartXLs.current);
  };

  const handlePointerUpLs = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    if (touchStartXLs.current === null) return;
    const delta = touchStartXLs.current - e.clientX;
    touchStartXLs.current = null;
    setDragOffset(0);
    if (Math.abs(delta) > 40) {
      if (delta > 0) next();
      else prev();
    }
  };

  const skipLabel = isLast
    ? lang === "ca" ? "INICI" : lang === "en" ? "START" : "INICIO"
    : lang === "ca" ? "SALTAR" : lang === "en" ? "SKIP" : "SALTAR";

  // Offset relativo al centro: posiciona el centro de la slide activa
  // sobre el centro del contenedor SIN depender de medir su ancho.
  // Combinado con `left: 50%` en el track, el centrado es geométrico
  // y correcto desde el primer paint (no parpadea ni queda descuadrado).
  const trackX = -(current * SLOT + SLOT / 2);
  const trackXLs = -(current * slotLs + slotLs / 2);

  return (
    <BrandedFrame onBack={() => navigate("/")} backAriaLabel="Back">
      {/* ── PORTRAIT (mobile original) ─────────────────────── */}
      <div className="w-full max-w-[390px] sm:max-w-[460px] mx-auto flex flex-col gap-3 sm:gap-5 overflow-hidden landscape:hidden flex-1 min-h-0 py-2 sm:py-4">

        {/* ── Carousel ───────────────────────────────────────── */}
        <motion.div
          ref={carouselRef}
          className="relative flex-1 min-h-[300px] sm:min-h-[440px] overflow-visible select-none cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          {/* Scale wrapper for tablet portrait */}
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${portraitScale})`,
              transformOrigin: "center center",
            }}
          >
            {/* Sliding track — left:50% + translateX centra geométricamente */}
            <div
              className="absolute top-1/2 left-1/2 flex items-start"
              style={{
                transform: `translateX(${trackX + dragOffset / portraitScale}px) translateY(-58%)`,
                transition: dragOffset !== 0 ? "none" : "transform 420ms cubic-bezier(0.4, 0, 0.2, 1)",
                width: `${total * SLOT}px`,
              }}
            >
            {slides.map((s, i) => {
              const dist = Math.abs(i - current);
              const isActive = i === current;
              const scale = isActive ? 1 : dist === 1 ? 0.92 : 0.76;
              const opacity = isActive ? 1 : dist === 1 ? 0.85 : 0.45;
              const topOffset = isActive ? 0 : dist === 1 ? 12 : 32;

              return (
                <div
                  key={s.id}
                  onClick={() => !isActive && goTo(i)}
                  style={{
                    width: `${SLOT}px`,
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    transform: `scale(${scale}) translateY(${topOffset}px)`,
                    opacity,
                    transition: "transform 420ms cubic-bezier(0.4,0,0.2,1), opacity 420ms ease",
                    transformOrigin: "top center",
                    cursor: isActive ? "default" : "pointer",
                    zIndex: isActive ? 10 : 1,
                    position: "relative",
                  }}
                >
                  {/* Stack layers — only on active card */}
                  {isActive && (<>
                    <div style={{
                      position: "absolute", bottom: -10, left: 22, right: 22,
                      height: 28, background: "rgba(255,255,255,0.55)",
                      borderRadius: 20, zIndex: -1,
                      boxShadow: "0 8px 24px -4px rgba(0,0,0,0.10)",
                    }} />
                    <div style={{
                      position: "absolute", bottom: -18, left: 38, right: 38,
                      height: 28, background: "rgba(255,255,255,0.30)",
                      borderRadius: 20, zIndex: -2,
                      boxShadow: "0 8px 24px -4px rgba(0,0,0,0.06)",
                    }} />
                  </>)}
                  <div className={`bg-white rounded-3xl overflow-hidden ${isActive ? "shadow-2xl" : "shadow-none"}`}>

                    {/* Image area */}
                    <div
                      className="relative mx-3 mt-3 h-[180px] rounded-2xl flex items-center justify-center overflow-hidden"
                      style={{ background: s.color }}
                    >
                      <span className="text-[70px] select-none">{s.emoji}</span>
                      {isActive && (
                        <span className="absolute top-3 right-3 bg-km0-coral-400 text-white font-ui font-bold text-sm px-3 py-1 rounded-xl shadow-md">
                          +{s.xp} XP
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <div className="px-4 pt-3 pb-4 text-center">
                      <h2 className="font-brand font-bold text-lg text-primary leading-tight mb-1">
                        {getTitle(s, lang)}
                      </h2>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        {getDesc(s, lang)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>


          {/* Arrow left */}
          <button
            onClick={prev}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isFirst}
            className={cn(
              "absolute left-[6px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-[2px] flex items-center justify-center shadow-lg transition-all duration-200 z-20",
              isFirst
                ? "border-km0-beige-200 text-km0-beige-300 opacity-40 cursor-not-allowed"
                : "border-km0-yellow-400 text-km0-blue-700 hover:bg-km0-yellow-50 hover:scale-110 cursor-pointer"
            )}
            aria-label="Previous"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          {/* Arrow right */}
          <button
            onClick={next}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isLast}
            className={cn(
              "absolute right-[6px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-[2px] flex items-center justify-center shadow-lg transition-all duration-200 z-20",
              isLast
                ? "border-km0-beige-200 text-km0-beige-300 opacity-40 cursor-not-allowed"
                : "border-km0-yellow-400 text-km0-blue-700 hover:bg-km0-yellow-50 hover:scale-110 cursor-pointer"
            )}
            aria-label="Next"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </motion.div>

        {/* ── Thumbnails ─────────────────────────────────────── */}
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200 border-[2px]",
                i === current
                  ? "border-km0-yellow-500 scale-110 shadow-md"
                  : "border-km0-beige-200 bg-white opacity-70 hover:opacity-100 hover:scale-105"
              )}
              style={{ background: i === current ? s.color : "white" }}
              aria-label={`Slide ${i + 1}`}
            >
              {s.emoji}
            </button>
          ))}
        </motion.div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <motion.div
          className="flex items-center justify-between px-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <span className="font-ui font-bold text-lg text-primary w-12">
            {current + 1}/{total}
          </span>

          <div className="flex gap-2 items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "w-4 h-4 bg-km0-yellow-500"
                    : "w-2.5 h-2.5 bg-km0-blue-200"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (isLast) navigate("/postal-code", { state: { lang } });
              else setCurrent(total - 1);
            }}
            className="bg-primary text-primary-foreground font-ui font-semibold text-sm px-5 py-2.5 rounded-2xl hover:bg-km0-blue-600 hover:scale-[1.03] transition-all duration-200 active:scale-95"
          >
            {skipLabel}
          </button>
        </motion.div>

      </div>

      {/* ── LANDSCAPE 16:9 ─────────────────────────────────── */}
      <div className="hidden landscape:flex w-full flex-1 min-h-0 flex-col relative">

        {/* Carousel area */}
        <motion.div
          ref={carouselRefLs}
          className="relative flex-1 min-h-0 overflow-visible select-none cursor-grab active:cursor-grabbing px-12 horizontal-mobile:px-10"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDownLs}
          onPointerMove={handlePointerMoveLs}
          onPointerUp={handlePointerUpLs}
          onPointerCancel={handlePointerUpLs}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          {/* Sliding track — left:50% + translateX centra geométricamente */}
          <div
            className="absolute top-1/2 left-1/2 flex items-center"
            style={{
              transform: `translateX(${trackXLs + dragOffset}px) translateY(-50%)`,
              transition: dragOffset !== 0 ? "none" : "transform 420ms cubic-bezier(0.4, 0, 0.2, 1)",
              width: `${total * slotLs}px`,
            }}
          >
            {slides.map((s, i) => {
              const dist = Math.abs(i - current);
              const isActive = i === current;
              const scale = isActive ? 1 : dist === 1 ? 0.88 : 0.74;
              const opacity = isActive ? 1 : dist === 1 ? 0.85 : 0.45;

              return (
                <div
                  key={s.id}
                  onClick={() => !isActive && goTo(i)}
                  style={{
                    width: `${slotLs}px`,
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    transform: `scale(${scale})`,
                    opacity,
                    transition: "transform 420ms cubic-bezier(0.4,0,0.2,1), opacity 420ms ease",
                    transformOrigin: "center center",
                    cursor: isActive ? "default" : "pointer",
                    zIndex: isActive ? 10 : 1,
                    position: "relative",
                  }}
                >
                  {/* Stack layers — only on active card (same as vertical) */}
                  {isActive && (<>
                    <div style={{
                      position: "absolute", bottom: -10, left: 32, right: 32,
                      height: 28, background: "rgba(255,255,255,0.55)",
                      borderRadius: 20, zIndex: -1,
                      boxShadow: "0 8px 24px -4px rgba(0,0,0,0.10)",
                    }} />
                    <div style={{
                      position: "absolute", bottom: -18, left: 52, right: 52,
                      height: 28, background: "rgba(255,255,255,0.30)",
                      borderRadius: 20, zIndex: -2,
                      boxShadow: "0 8px 24px -4px rgba(0,0,0,0.06)",
                    }} />
                  </>)}
                  {/* Same card structure as vertical, sized for landscape */}
                  <div className={`bg-white rounded-3xl overflow-hidden ${isActive ? "shadow-2xl" : "shadow-none"}`}>
                    {/* Image area */}
                    <div
                      className="relative mx-3 mt-3 wide-landscape:mx-3 wide-landscape:mt-3 h-[200px] wide-landscape:h-[300px] short-landscape:mx-[clamp(0.5rem,1.2vw,0.75rem)] short-landscape:mt-[clamp(0.5rem,1.2vw,0.75rem)] short-landscape:h-[clamp(120px,32vh,260px)] rounded-2xl flex items-center justify-center overflow-hidden"
                      style={{ background: s.color }}
                    >
                      <span className="text-[80px] wide-landscape:text-[120px] short-landscape:text-[clamp(52px,10vh,96px)] select-none">{s.emoji}</span>
                      {isActive && (
                        <span className="absolute top-3 right-3 wide-landscape:top-3 wide-landscape:right-3 short-landscape:top-1.5 short-landscape:right-1.5 bg-km0-coral-400 text-white font-ui font-bold text-sm wide-landscape:text-sm short-landscape:text-[clamp(10px,1.4vh,14px)] px-3 py-1 wide-landscape:px-3 wide-landscape:py-1 short-landscape:px-2 short-landscape:py-0.5 rounded-xl shadow-md">
                          +{s.xp} XP
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <div className="px-4 pt-3 pb-4 wide-landscape:px-6 wide-landscape:pt-5 wide-landscape:pb-6 short-landscape:px-[clamp(0.75rem,1.6vw,1.25rem)] short-landscape:pt-[clamp(0.5rem,1.2vh,1rem)] short-landscape:pb-[clamp(0.75rem,1.6vh,1.25rem)] text-center">
                      <h2 className="font-brand font-bold text-lg wide-landscape:text-2xl short-landscape:text-[clamp(0.875rem,2.2vh,1.25rem)] text-primary leading-tight mb-1 wide-landscape:mb-2 short-landscape:mb-[clamp(0.125rem,0.6vh,0.5rem)]">
                        {getTitle(s, lang)}
                      </h2>
                      <p className="font-body text-sm wide-landscape:text-base short-landscape:text-[clamp(0.6875rem,1.6vh,0.9375rem)] text-muted-foreground leading-relaxed wide-landscape:leading-snug short-landscape:leading-snug">
                        {getDesc(s, lang)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Arrow left — same style as vertical */}
          <button
            onClick={prev}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isFirst}
            className={cn(
              "absolute left-2 short-landscape:left-1 top-1/2 -translate-y-1/2 w-11 h-11 short-landscape:w-9 short-landscape:h-9 rounded-full bg-white border-[2px] flex items-center justify-center shadow-xl transition-all duration-200 z-30",
              isFirst
                ? "border-km0-beige-200 text-km0-beige-300 opacity-40 cursor-not-allowed"
                : "border-km0-yellow-400 text-km0-blue-700 hover:bg-km0-yellow-50 hover:scale-110 cursor-pointer"
            )}
            aria-label="Previous"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          {/* Arrow right — same style as vertical */}
          <button
            onClick={next}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isLast}
            className={cn(
              "absolute right-2 short-landscape:right-1 top-1/2 -translate-y-1/2 w-11 h-11 short-landscape:w-9 short-landscape:h-9 rounded-full bg-white border-[2px] flex items-center justify-center shadow-xl transition-all duration-200 z-30",
              isLast
                ? "border-km0-beige-200 text-km0-beige-300 opacity-40 cursor-not-allowed"
                : "border-km0-yellow-400 text-km0-blue-700 hover:bg-km0-yellow-50 hover:scale-110 cursor-pointer"
            )}
            aria-label="Next"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </motion.div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-km0-beige-200/70 bg-white/40 backdrop-blur-sm px-4 py-2 wide-landscape:px-5 wide-landscape:py-2.5 short-landscape:px-3 short-landscape:py-1.5 flex items-center justify-between gap-3 wide-landscape:gap-4 short-landscape:gap-2">
          {/* Left: progress + thumbs */}
          <div className="flex items-center gap-2 wide-landscape:gap-3 short-landscape:gap-2 shrink-0">
            <span className="font-ui font-bold text-sm wide-landscape:text-sm short-landscape:text-xs text-primary">
              {current + 1}/{total}
            </span>
            <div className="flex gap-1.5 wide-landscape:gap-1.5 short-landscape:gap-1">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  className={cn(
                    "w-8 h-8 wide-landscape:w-8 wide-landscape:h-8 short-landscape:w-6 short-landscape:h-6 rounded-lg flex items-center justify-center text-base wide-landscape:text-base short-landscape:text-xs transition-all duration-200 border-[2px]",
                    i === current
                      ? "border-km0-yellow-500 shadow-md scale-105"
                      : "border-km0-beige-200 bg-white opacity-70 hover:opacity-100"
                  )}
                  style={{ background: i === current ? s.color : "white" }}
                  aria-label={`Slide ${i + 1}`}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Center: dots */}
          <div className="flex-1 flex justify-center gap-2 items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "w-3 h-3 wide-landscape:w-3.5 wide-landscape:h-3.5 bg-km0-yellow-500"
                    : "w-2 h-2 wide-landscape:w-2.5 wide-landscape:h-2.5 bg-km0-blue-200"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Right: skip */}
          <button
            onClick={() => {
              if (isLast) navigate("/postal-code", { state: { lang } });
              else setCurrent(total - 1);
            }}
            className="shrink-0 bg-primary text-primary-foreground font-ui font-semibold text-sm wide-landscape:text-sm short-landscape:text-xs px-4 wide-landscape:px-5 short-landscape:px-4 py-2 short-landscape:py-2 rounded-2xl hover:bg-km0-blue-600 hover:scale-[1.03] transition-all duration-200 active:scale-95"
          >
            {skipLabel}
          </button>
        </footer>
      </div>
    </BrandedFrame>
  );
};

export default Onboarding;
