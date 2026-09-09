import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Flower2 } from 'lucide-react';
import { PromoConfig } from '../types';
import { transformDriveUrl } from '../utils/driveUtils';

interface PromoModalProps {
  promo: PromoConfig;
  onExploreCategory: (category: string) => void;
  forceOpen?: boolean;
  onCloseForce?: () => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({
  promo,
  onExploreCategory,
  forceOpen = false,
  onCloseForce,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    if (!promo.isEnabled) return;

    // Check if shown in current session
    try {
      const seen = typeof window !== 'undefined' && window.sessionStorage ? sessionStorage.getItem('rosanfer_welcome_seen') : null;
      if (!seen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          try {
            sessionStorage.setItem('rosanfer_welcome_seen', 'true');
          } catch {
            // ignore
          }
        }, 1500); // appear smoothly after 1.5 seconds
        return () => clearTimeout(timer);
      }
    } catch {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [promo.isEnabled, forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseForce) onCloseForce();
  };

  const handleCta = () => {
    handleClose();
    if (promo.categoryRedirect) {
      onExploreCategory(promo.categoryRedirect);
      const catalog = document.getElementById('catalogo-section');
      if (catalog) {
        catalog.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!isOpen) return null;

  const imageUrl = transformDriveUrl(promo.driveImageUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={handleClose}
      />

      {/* Announcement / Welcome Card */}
      <div className="relative w-full max-w-md bg-[#FBF9F6] rounded-3xl shadow-2xl overflow-hidden border border-[#5C715E]/20 z-10 my-auto animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          id="btn-close-promo-modal"
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/85 hover:bg-white text-[#2C362D] backdrop-blur-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
          aria-label="Cerrar comunicado"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner Image */}
        <div className="relative h-48 sm:h-56 w-full bg-[#EFECE6] overflow-hidden">
          <img
            src={imageUrl}
            alt={promo.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1000&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F6] via-transparent to-transparent" />

          {/* Badge */}
          {promo.badge && (
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D49A89] text-[#2C362D] text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {promo.badge}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 pt-1 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#5C715E]/10 text-[#5C715E] mb-3">
            <Flower2 className="w-5 h-5 text-[#5C715E]" />
          </div>

          <h3 className="text-2xl font-serif-boutique font-bold text-[#2C362D] leading-tight">
            {promo.title}
          </h3>

          <p className="mt-2.5 text-xs sm:text-sm text-[#2C362D]/80 max-w-sm mx-auto leading-relaxed">
            {promo.subtitle}
          </p>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              id="btn-promo-cta"
              onClick={handleCta}
              className="w-full py-3.5 px-6 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <span>{promo.ctaText || 'Explorar Catálogo'}</span>
              <ArrowRight className="w-4 h-4 text-[#D49A89]" />
            </button>

            <button
              onClick={handleClose}
              className="text-xs text-[#2C362D]/60 hover:text-[#2C362D] py-1 transition-colors cursor-pointer"
            >
              Continuar a la tienda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
