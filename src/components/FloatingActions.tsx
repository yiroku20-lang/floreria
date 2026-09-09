import React from 'react';
import { Phone, ShoppingBag } from 'lucide-react';
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
    <div className="fixed bottom-7 sm:bottom-9 right-5 sm:right-7 z-50 flex flex-col items-end gap-3.5 pointer-events-none">
      {/* Mobile Floating Cart Summary Bar if cart has items */}
      {cartCount > 0 && (
        <button
          id="btn-floating-cart-summary"
          onClick={onOpenCart}
          className="pointer-events-auto bg-[#5C715E] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-white/20 hover:bg-[#4a5c4c] transition-all hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-5"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-[#FBF9F6]" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#D49A89] text-[#2C362D] text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <span className="text-xs font-semibold">Ver Carrito</span>
          <span className="text-xs font-bold text-[#D49A89] border-l border-white/20 pl-2">
            {formatCurrency(cartTotal)}
          </span>
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
        className="pointer-events-auto relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group border-2 border-white"
        aria-label="Contactar por WhatsApp"
        title="Chatear con un florista por WhatsApp"
      >
        <Phone className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
        
        {/* Animated pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none opacity-75" />

        {/* Tooltip on hover */}
        <span className="absolute right-18 bg-[#2C362D] text-white text-xs font-medium px-3.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
          ¿Dudas? Chatea con nosotros por WhatsApp
        </span>
      </a>
    </div>
  );
};
