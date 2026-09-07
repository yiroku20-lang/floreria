import React, { useState } from 'react';
import { X, ShoppingBag, Phone, Check, Sparkles, Shield, Droplets, Scissors, SunMedium } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, transformDriveUrl } from '../utils/driveUtils';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  whatsappNumber: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  whatsappNumber,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola Rosanfer Florería! Estoy interesado(a) en el arreglo "${product.name}" (${formatCurrency(
      product.price
    )}). ¿Tienen disponibilidad inmediata para entrega?`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-[#FBF9F6] rounded-3xl shadow-2xl overflow-hidden border border-[#5C715E]/15 z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          id="btn-close-product-detail"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#2C362D] backdrop-blur-xs shadow-md transition-transform hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image */}
          <div className="relative min-h-[300px] md:min-h-[460px] bg-[#EFECE6]">
            <img
              src={transformDriveUrl(product.imageUrl)}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {/* Tags overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {product.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-[#D49A89] text-[#2C362D] shadow-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between text-xs text-[#5C715E] font-semibold tracking-wider uppercase">
                <span>{product.category}</span>
                {product.stemCount && <span>{product.stemCount}</span>}
              </div>

              <h2 className="mt-2 text-2xl sm:text-3xl font-serif-boutique font-bold text-[#2C362D]">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-[#2C362D]">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-[#5C715E] bg-[#5C715E]/10 px-2.5 py-0.5 rounded-full font-medium">
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                </span>
              </div>

              <p className="mt-4 text-sm text-[#2C362D]/80 leading-relaxed">
                {product.description}
              </p>

              {/* Care Tips Section */}
              {product.careTips && product.careTips.length > 0 && (
                <div className="mt-5 p-4 rounded-2xl bg-white border border-[#5C715E]/15">
                  <h4 className="text-xs font-bold text-[#5C715E] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Droplets className="w-3.5 h-3.5 text-[#D49A89]" />
                    <span>Cuidados del Florista Rosanfer</span>
                  </h4>
                  <ul className="text-xs text-[#2C362D]/80 space-y-1.5 list-disc list-inside">
                    {product.careTips.map((tip, idx) => (
                      <li key={idx} className="leading-normal">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Guarantee badge */}
              <div className="mt-4 flex items-center gap-2 text-xs text-[#5C715E] font-medium">
                <Shield className="w-4 h-4 text-[#D49A89]" />
                <span>Garantía de frescura botánica y diseño de autor 100% artesanal</span>
              </div>
            </div>

            {/* Actions: Quantity & Add to Cart */}
            <div className="mt-6 pt-5 border-t border-[#5C715E]/15">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-medium text-[#2C362D]">Cantidad:</span>
                <div className="flex items-center rounded-xl border border-[#5C715E]/20 bg-white">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-[#2C362D] hover:bg-[#5C715E]/10 rounded-l-xl disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-[#2C362D]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center text-[#2C362D] hover:bg-[#5C715E]/10 rounded-r-xl disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  Subtotal: <strong className="text-[#2C362D]">{formatCurrency(product.price * quantity)}</strong>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  id="btn-modal-add-cart"
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-3 px-6 rounded-full font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-700 text-white'
                      : product.stock <= 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#5C715E] hover:bg-[#4a5c4c] text-white hover:shadow-lg'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Añadido al Carrito!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Agregar al Carrito</span>
                    </>
                  )}
                </button>

                <a
                  id="btn-modal-consult-whatsapp"
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-full border border-[#5C715E]/30 text-[#5C715E] hover:bg-[#5C715E]/10 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
