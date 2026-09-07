import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    if (!promo.isEnabled) return;

    // Check if shown in current session
    try {
      const seen = typeof window !== 'undefined' && window.sessionStorage ? sessionStorage.getItem('rosanfer_promo_seen') : null;
      if (!seen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          try {
            sessionStorage.setItem('rosanfer_promo_seen', 'true');
          } catch {
            // ignore
          }
        }, 2000); // appear smoothly after 2 seconds
        return () => clearTimeout(timer);
      }
    } catch {
      // If sessionStorage is unavailable, show once
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [promo.isEnabled, forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseForce) onCloseForce();
  };

  const handleCopy = () => {
    if (!promo.couponCode) return;
    navigator.clipboard.writeText(promo.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* Promo Card */}
      <div className="relative w-full max-w-lg bg-[#FBF9F6] rounded-3xl shadow-2xl overflow-hidden border border-[#5C715E]/20 z-10 my-auto animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          id="btn-close-promo-modal"
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#2C362D] backdrop-blur-xs shadow-md transition-transform hover:scale-105"
          aria-label="Cerrar promoción"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Promo Image (supports Google Drive links) */}
        <div className="relative h-52 sm:h-60 w-full bg-[#EFECE6] overflow-hidden">
          <img
            src={imageUrl}
            alt={promo.title}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Fallback image if drive link fails or lacks public permission
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1000&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F6] via-transparent to-transparent" />

          {/* Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D49A89] text-[#2C362D] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {promo.badge}
            </span>
          </div>
        </div>

        {/* Promo Content */}
        <div className="p-6 sm:p-8 pt-2 text-center">
          <h3 className="text-2xl sm:text-3xl font-serif-boutique font-bold text-[#2C362D] leading-tight">
            {promo.title}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-[#2C362D]/75 max-w-sm mx-auto leading-relaxed">
            {promo.subtitle}
          </p>

          {/* Coupon Code copy section */}
          {promo.couponCode && (
            <div className="mt-5 p-3 rounded-2xl bg-white border border-dashed border-[#5C715E]/30 inline-flex items-center gap-3 max-w-xs mx-auto shadow-xs">
              <div className="text-left pl-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Código de cupón
                </span>
                <span className="font-mono font-bold text-base text-[#5C715E] tracking-widest">
                  {promo.couponCode}
                </span>
              </div>
              <button
                id="btn-copy-coupon-promo"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-[#5C715E]/10 hover:bg-[#5C715E] text-[#5C715E] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          )}

          {/* Action button */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              id="btn-promo-cta"
              onClick={handleCta}
              className="w-full py-3.5 px-6 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{promo.ctaText}</span>
              <ArrowRight className="w-4 h-4 text-[#D49A89]" />
            </button>

            <button
              onClick={handleClose}
              className="text-xs text-[#2C362D]/60 hover:text-[#2C362D] py-1 transition-colors"
            >
              No gracias, continuar al catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
