import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ShoppingBag, Sparkles, ChevronDown } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  ctaText: string;
  category: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 'slide-latidos',
    title: 'Latidos en Flor: Rosas Rojas de Alta Gama',
    subtitle: 'Ramos de terciopelo y elegantes cajas boutique diseñadas para expresar amor verdadero en Cusco.',
    tag: 'Alta Floristería Romántica',
    imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'Ver Ramos de Amor',
    category: 'Latidos en Flor',
  },
  {
    id: 'slide-primavera',
    title: 'Primavera Para Ti: Girasoles & Encanto Campestre',
    subtitle: 'Canastas de autor con tiernas ovejitas, crisantemos frescos y girasoles andinos radiantes que iluminan el día.',
    tag: 'Colección Campestre & Luz',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'Ver Colección Campestre',
    category: 'Primavera Para Ti',
  },
  {
    id: 'slide-graduacion',
    title: 'Graduación: Bouquets de Triunfo & Honor',
    subtitle: 'Distiguidos arreglos con mini birretes, hortensias celestes y espigas para celebrar cada meta universitaria.',
    tag: 'Colección Colaciones & Títulos',
    imageUrl: 'https://images.unsplash.com/photo-1589244159943-460088ed5c92?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'Ver Diseños de Graduación',
    category: 'Graduación',
  },
  {
    id: 'slide-festivos',
    title: 'Festivos: Alegría, Duendecitos & Color',
    subtitle: 'Arreglos con personajes artesanales, mini rosas y lirios vibrantes para cumpleaños y fechas especiales.',
    tag: 'Cumpleaños & Celebraciones',
    imageUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'Ver Arreglos Festivos',
    category: 'Festivos',
  },
  {
    id: 'slide-nupcial',
    title: 'Set Nupcial "Sí Acepto": Bodas de Ensueño',
    subtitle: 'Bouquets de novia de autor con flores selectas y toques botánicos para bodas en Cusco y el Valle Sagrado.',
    tag: 'Alta Floristería Nupcial',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'Ver Colección Nupcial',
    category: 'Set Nupcial "Sí Acepto"',
  },
];

interface HeroBannerProps {
  onSelectCategory: (category: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollBlur, setScrollBlur] = useState(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);

  // Progressive blur effect on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Calculate progressive blur from 0px up to 16px
      const blurVal = Math.min(16, scrollY * 0.04);
      setScrollBlur(blurVal);
      // Subtle parallax offset
      setScrollOffsetY(scrollY * 0.28);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance carousel every 6.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const slide = HERO_SLIDES[currentSlide];

  const handleCtaClick = () => {
    onSelectCategory(slide.category);
    const catalogElem = document.getElementById('catalogo-section');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] md:h-[640px] lg:h-[700px] overflow-hidden bg-[#2C362D]">
      {/* Background Image Container with Progressive Blur & Parallax */}
      <div
        className="absolute inset-0 w-full h-[120%] -top-[10%] transition-transform duration-100 ease-out"
        style={{
          transform: `translateY(${scrollOffsetY}px)`,
          filter: `blur(${scrollBlur}px)`,
        }}
      >
        <img
          key={slide.id}
          src={slide.imageUrl}
          alt={slide.title}
          className="w-full h-full object-cover object-center transition-opacity duration-700 brightness-90"
        />
      </div>

      {/* Elegant atmospheric overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2C362D]/90 via-[#2C362D]/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none md:block hidden" />

      {/* Left Carousel Navigation Button (matches the dark button in user's mockup) */}
      <button
        id="btn-hero-prev-slide"
        onClick={prevSlide}
        aria-label="Slide anterior"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-[#2C362D]/85 hover:bg-[#2C362D] text-white rounded-md backdrop-blur-xs transition-all hover:scale-105 active:scale-95 shadow-lg border border-white/10"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Right Carousel Navigation Button (matches the white button in user's mockup) */}
      <button
        id="btn-hero-next-slide"
        onClick={nextSlide}
        aria-label="Siguiente slide"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-white hover:bg-[#FBF9F6] text-[#2C362D] rounded-md transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        <ArrowRight className="w-5 h-5 text-[#2C362D]" />
      </button>

      {/* Main Slide Content: responsive positioning matching desktop and mobile screenshots */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-6 sm:px-10 lg:px-14 flex flex-col justify-end pb-12 sm:pb-16 md:justify-center md:pb-0">
        <div className="max-w-xl lg:max-w-2xl text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#FBF9F6] text-xs uppercase tracking-widest font-medium mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#D49A89]" />
            <span>{slide.tag}</span>
          </div>

          {/* Title styled with distinctive script/serif font matching user's image */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif-boutique font-bold text-white tracking-tight leading-[1.15] drop-shadow-md"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.4)',
            }}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#FBF9F6]/90 max-w-lg font-light leading-relaxed drop-shadow-sm">
            {slide.subtitle}
          </p>

          {/* Action buttons */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              id="btn-hero-primary-cta"
              onClick={handleCtaClick}
              className="px-6 py-3 rounded-full bg-[#D49A89] hover:bg-[#B87C6B] text-[#2C362D] font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{slide.ctaText}</span>
            </button>

            <a
              href="#catalogo-section"
              className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium text-sm transition-all duration-200 border border-white/30 flex items-center gap-2"
            >
              <span>Ver Todo el Catálogo</span>
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Carousel indicators dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir a slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === currentSlide
                  ? 'w-7 h-2 bg-[#D49A89]'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
