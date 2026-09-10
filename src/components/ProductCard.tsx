import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, AlertCircle, Phone } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, transformDriveUrl } from '../utils/driveUtils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onOpenDetail: (product: Product) => void;
  whatsappNumber?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetail,
  whatsappNumber,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const handleQuickWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNumber = (whatsappNumber || '51906800626').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola, quisiera pedir el arreglo "${product.name}" (S/.${product.price})`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  // Transform drive link if applicable
  const displayImage = imgError
    ? 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80'
    : transformDriveUrl(product.imageUrl);

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onOpenDetail(product)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-[#5C715E]/10 shadow-rosanfer hover:shadow-rosanfer-lg transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Product Image Area - Exact 1:1 Square matching Intranet Preview */}
      <div className="relative w-full aspect-square bg-[#F4F1EC] overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
          style={
            product.framing
              ? {
                  objectPosition: `${50 + (product.framing.x || 0)}% ${50 + (product.framing.y || 0)}%`,
                  transform: `scale(${Math.max(1, product.framing.zoom || 1)}) rotate(${product.framing.rotation || 0}deg)`,
                  transformOrigin: 'center center',
                }
              : undefined
          }
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.tags?.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs ${
                tag === 'Bestseller'
                  ? 'bg-[#D49A89] text-[#2C362D]'
                  : tag === 'Nuevo'
                  ? 'bg-[#5C715E] text-white'
                  : tag === 'Temporada'
                  ? 'bg-[#2C362D] text-[#FBF9F6]'
                  : 'bg-white/90 text-[#2C362D]'
              }`}
            >
              {tag}
            </span>
          ))}
          {product.originalPrice && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
              OFERTA
            </span>
          )}
        </div>

        {/* Quick View trigger icon */}
        <button
          id={`btn-view-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(product);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-[#2C362D] backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md hover:scale-110"
          aria-label="Ver detalles"
          title="Ver detalles del arreglo"
        >
          <Eye className="w-4 h-4 text-[#5C715E]" />
        </button>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#2C362D]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <span className="bg-white text-[#2C362D] font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
              Agotado por el momento
            </span>
          </div>
        )}
      </div>

      {/* Product Content info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#5C715E] font-medium tracking-wide mb-1 gap-2">
            <span className="truncate">{product.category}</span>
            {product.subEdition ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5C715E]/10 text-[#5C715E] font-semibold truncate shrink-0">
                {product.subEdition}
              </span>
            ) : product.stemCount ? (
              <span className="text-[11px] text-[#2C362D]/60 hidden sm:inline truncate shrink-0">
                {product.stemCount}
              </span>
            ) : null}
          </div>

          <h3 className="font-serif-boutique font-bold text-lg sm:text-xl text-[#2C362D] group-hover:text-[#5C715E] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-[#2C362D]/70 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Stock & Purchase Actions */}
        <div className="mt-4 pt-3 border-t border-[#5C715E]/10 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-[#2C362D]">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Stock alert */}
            <div className="text-[11px] mt-0.5">
              {isOutOfStock ? (
                <span className="text-red-500 font-medium">Sin stock</span>
              ) : isLowStock ? (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 inline" /> ¡Solo {product.stock} disp.!
                </span>
              ) : (
                <span className="text-[#5C715E] text-[11px]">Disponible ({product.stock})</span>
              )}
            </div>
          </div>

          {/* Action Buttons: WhatsApp Quick Order + Comprar Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick WhatsApp order button */}
            <button
              id={`btn-wa-order-${product.id}`}
              type="button"
              onClick={handleQuickWhatsApp}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Pedir directamente por WhatsApp"
              aria-label={`Pedir ${product.name} por WhatsApp`}
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline text-[11px] font-bold">WhatsApp</span>
            </button>

            {/* Primary Buy Button */}
            <button
              id={`btn-add-to-cart-${product.id}`}
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer ${
                isAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#5C715E] hover:bg-[#4a5c4c] text-white hover:shadow-md'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="inline-flex">¡Agregado!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="inline-flex">Comprar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
