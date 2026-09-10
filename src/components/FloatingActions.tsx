import React from 'react';
import { Phone, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/driveUtils';

interface FloatingActionsProps {
  whatsappNumber: string;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  whatsappNumber,
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  return (
    <div className="fixed bottom-6 sm:bottom-8 right-4 sm:right-7 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* Prominent Floating Cart Action - Enlarged & High-Visibility when items are selected */}
      {cartCount > 0 && (
        <button
          id="btn-floating-cart-summary"
          onClick={onOpenCart}
          className="pointer-events-auto group relative bg-[#2C362D] text-white px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl sm:rounded-full shadow-2xl flex items-center gap-3.5 border-2 border-[#D49A89]/80 hover:border-[#D49A89] hover:bg-[#202720] transition-all duration-300 hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-5 cursor-pointer ring-4 ring-[#D49A89]/20"
        >
          {/* Pulsing indicator ring */}
          <span className="absolute -inset-1 rounded-2xl sm:rounded-full bg-[#D49A89]/25 animate-pulse pointer-events-none" />

          {/* Cart Icon & Badge */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-full bg-[#5C715E] flex items-center justify-center text-white shadow-md group-hover:bg-[#4a5c4c] transition-colors">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#FBF9F6]" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-[#D49A89] text-[#2C362D] text-xs font-black flex items-center justify-center shadow-md border-2 border-[#2C362D]">
              {cartCount}
            </span>
          </div>

          {/* Texts: Order Summary */}
          <div className="text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-[#D49A89]">
                Pedido en Carrito
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xs sm:text-sm font-medium text-white/90">
                {cartCount} {cartCount === 1 ? 'arreglo' : 'arreglos'}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white">
                {formatCurrency(cartTotal)}
              </span>
            </div>
          </div>

          {/* Click action indicator */}
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-[#D49A89] group-hover:text-[#2C362D] transition-colors ml-1 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      )}

      {/* Floating WhatsApp Quick Inquiries Button */}
      <a
        id="btn-floating-whatsapp"
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          '¡Hola Rosanfer Florería! Quisiera consultar por disponibilidad de flores y pedidos para entrega.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group border-2 border-white cursor-pointer"
        aria-label="Contactar por WhatsApp"
        title="Chatear con un florista por WhatsApp"
      >
        <Phone className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
        
        {/* Animated pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none opacity-75" />

        {/* Tooltip on hover */}
        <span className="absolute right-18 bg-[#2C362D] text-white text-xs font-medium px-3.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
          ¿Dudas o pedidos? WhatsApp & Llamadas: 906 800 626
        </span>
      </a>
    </div>
  );
};
