import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Check,
  Flame,
  Star,
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, transformDriveUrl, BOUTIQUE_FALLBACK_IMAGE } from '../utils/driveUtils';

interface SmartSearchDropdownProps {
  query: string;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onViewAllInCatalog: () => void;
  onSelectSuggestion: (text: string) => void;
  whatsappNumber: string;
  isMobile?: boolean;
}

const POPULAR_SUGGESTIONS = [
  { label: 'Rosas Rojas', icon: '🌹' },
  { label: 'Girasoles', icon: '🌻' },
  { label: 'Cumpleaños', icon: '🎂' },
  { label: 'Latidos en Flor', icon: '❤️' },
  { label: 'Graduación', icon: '🎓' },
  { label: 'Amor Eterno', icon: '✨' },
];

export const SmartSearchDropdown: React.FC<SmartSearchDropdownProps> = ({
  query,
  products,
  isOpen,
  onClose,
  onSelectProduct,
  onAddToCart,
  onViewAllInCatalog,
  onSelectSuggestion,
  whatsappNumber,
  isMobile = false,
}) => {
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const cleanQuery = query.trim().toLowerCase();

  // Buscar coincidencias directas con ponderación
  const { matches, recommendations } = useMemo(() => {
    if (!cleanQuery) {
      // Si no hay texto, sugerir los más destacados de la boutique
      const topPicks = products
        .filter((p) => p.featured || p.tags?.includes('Bestseller'))
        .slice(0, 4);
      return { matches: [], recommendations: topPicks.length > 0 ? topPicks : products.slice(0, 4) };
    }

    const words = cleanQuery.split(/\s+/).filter(Boolean);

    // Filtrar productos con puntaje de relevancia
    const scored = products
      .map((p) => {
        let score = 0;
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const occasion = (p.occasion || '').toLowerCase();
        const sub = (p.subEdition || '').toLowerCase();
        const tags = (p.tags || []).join(' ').toLowerCase();

        // Coincidencia exacta o contiene frase completa
        if (name.includes(cleanQuery)) score += 10;
        if (cat.includes(cleanQuery)) score += 7;
        if (occasion.includes(cleanQuery)) score += 6;
        if (sub.includes(cleanQuery)) score += 6;
        if (tags.includes(cleanQuery)) score += 5;
        if (desc.includes(cleanQuery)) score += 3;

        // Coincidencias palabra por palabra
        for (const w of words) {
          if (name.includes(w)) score += 4;
          if (occasion.includes(w)) score += 3;
          if (cat.includes(w)) score += 2;
          if (desc.includes(w)) score += 1;
        }

        return { product: p, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);

    // Si no hay coincidencias, extraer recomendaciones inteligentes
    let recs: Product[] = [];
    if (scored.length === 0) {
      // 1. Preferir productos con tag Bestseller o destacados
      recs = products.filter((p) => p.tags?.includes('Bestseller') || p.featured).slice(0, 3);
      if (recs.length === 0) {
        recs = products.slice(0, 3);
      }
    }

    return { matches: scored, recommendations: recs };
  }, [cleanQuery, products]);

  if (!isOpen) return null;

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, 1);
      setAddedProductId(product.id);
      setTimeout(() => setAddedProductId(null), 1800);
    }
  };

  return (
    <div
      id="smart-search-results-dropdown"
      className={
        isMobile
          ? 'w-full mt-2 bg-white rounded-2xl shadow-xl border border-[#5C715E]/20 overflow-hidden text-[#2C362D] animate-in fade-in duration-150'
          : 'absolute right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-[#5C715E]/20 z-50 overflow-hidden text-[#2C362D] animate-in fade-in zoom-in-95 duration-150'
      }
    >
      {/* 1. ESTADO: Búsqueda activa con resultados encontrados */}
      {cleanQuery.length > 0 && matches.length > 0 && (
        <div>
          {/* Header de resultados */}
          <div className="px-4 py-2.5 bg-[#FBF9F6] border-b border-[#5C715E]/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#5C715E] font-medium">
              <Search className="w-3.5 h-3.5" />
              <span>
                {matches.length} {matches.length === 1 ? 'arreglo encontrado' : 'arreglos encontrados'}
              </span>
            </div>
            <button
              type="button"
              onClick={onViewAllInCatalog}
              className="text-[11px] font-bold text-[#5C715E] hover:text-[#4a5c4c] underline underline-offset-2 cursor-pointer"
            >
              Ver en catálogo
            </button>
          </div>

          {/* Lista de miniaturas de productos */}
          <div className="max-h-[330px] overflow-y-auto divide-y divide-gray-100 p-1.5 space-y-1">
            {matches.slice(0, 5).map((product) => {
              const isJustAdded = addedProductId === product.id;
              const imgUrl = transformDriveUrl(product.imageUrl, 200) || BOUTIQUE_FALLBACK_IMAGE;

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="group flex items-center gap-3 p-2 rounded-xl hover:bg-[#FBF9F6] cursor-pointer transition-all border border-transparent hover:border-[#5C715E]/15"
                >
                  {/* Miniatura del arreglo */}
                  <div className="w-13 h-13 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative border border-gray-200">
                    <img
                      src={imgUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = BOUTIQUE_FALLBACK_IMAGE;
                      }}
                    />
                    {product.tags?.includes('Bestseller') && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#5C715E] text-white text-[8px] font-bold text-center py-0.2 tracking-wider">
                        TOP
                      </span>
                    )}
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-[#5C715E] truncate">
                        {product.category}
                      </span>
                      {product.occasion && (
                        <span className="text-[10px] text-[#2C362D]/50">• {product.occasion}</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#2C362D] truncate group-hover:text-[#5C715E] transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#5C715E]">
                        {formatCurrency(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[10px] line-through text-gray-400">
                          {formatCurrency(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones rápidas: Añadir al carrito */}
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, product)}
                      disabled={product.stock <= 0}
                      className={`p-2 rounded-xl transition-all ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[#5C715E]/10 text-[#5C715E] hover:bg-[#5C715E] hover:text-white'
                      }`}
                      title={isJustAdded ? '¡Agregado!' : 'Añadir al carrito'}
                    >
                      {isJustAdded ? (
                        <Check className="w-4 h-4 animate-in zoom-in" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón inferior: Ir al catálogo */}
          <div className="p-2.5 bg-[#FBF9F6] border-t border-[#5C715E]/10">
            <button
              type="button"
              onClick={onViewAllInCatalog}
              className="w-full py-2 px-3 bg-[#5C715E] text-white hover:bg-[#4a5c4c] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Ver todos los resultados en el catálogo ({matches.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. ESTADO: No se encontraron resultados -> MOTOR INTELIGENTE DE RECOMENDACIÓN */}
      {cleanQuery.length > 0 && matches.length === 0 && (
        <div className="p-4 space-y-3.5">
          {/* Aviso cordial */}
          <div className="text-center py-1">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center mb-2">
              <Search className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs font-bold text-[#2C362D]">
              No encontramos coincidencias para "{query}"
            </p>
            <p className="text-[11px] text-[#2C362D]/70 mt-0.5">
              Pero no te preocupes, te recomendamos los arreglos favoritos más pedidos en Cusco:
            </p>
          </div>

          {/* Miniaturas de arreglos recomendados */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#5C715E] uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-[#D49A89]" />
              <span>Sugerencias Populares de la Boutique</span>
            </div>

            <div className="divide-y divide-gray-100 bg-[#FBF9F6] rounded-xl p-1 border border-[#5C715E]/15">
              {recommendations.map((product) => {
                const isJustAdded = addedProductId === product.id;
                const imgUrl = transformDriveUrl(product.imageUrl, 200) || BOUTIQUE_FALLBACK_IMAGE;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                  >
                    <img
                      src={imgUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = BOUTIQUE_FALLBACK_IMAGE;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#2C362D] truncate">{product.name}</h5>
                      <span className="text-[11px] font-bold text-[#5C715E]">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`p-1.5 rounded-lg text-xs transition-all ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#5C715E]/10 text-[#5C715E] hover:bg-[#5C715E] hover:text-white'
                      }`}
                      title="Añadir"
                    >
                      {isJustAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sugerencias de palabras clave rápidas */}
          <div>
            <span className="text-[11px] font-bold text-[#2C362D]/75 block mb-1.5">
              ¿Buscabas quizás alguna de estas opciones?
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SUGGESTIONS.map((sug) => (
                <button
                  key={sug.label}
                  type="button"
                  onClick={() => onSelectSuggestion(sug.label)}
                  className="text-[11px] py-1 px-2.5 rounded-full bg-[#FBF9F6] hover:bg-[#5C715E]/15 text-[#2C362D] border border-[#5C715E]/20 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  <span>{sug.icon}</span>
                  <span>{sug.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ayuda personalizada directa por WhatsApp */}
          <div className="p-2.5 rounded-xl bg-[#5C715E]/10 border border-[#5C715E]/20 flex items-center justify-between gap-2">
            <div className="text-[11px] text-[#2C362D]">
              <span className="font-bold block">¿Buscas un diseño personalizado?</span>
              <span className="text-[#2C362D]/75">Diseñamos tu arreglo a medida en Cusco</span>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `¡Hola Rosanfer Florería! Estuve buscando en su web "${query}" y quisiera consultar si pueden armar un pedido personalizado con flores frescas en Cusco.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold bg-[#5C715E] text-white px-2.5 py-1.5 rounded-lg hover:bg-[#4a5c4c] transition-colors shrink-0 flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Consultar</span>
            </a>
          </div>
        </div>
      )}

      {/* 3. ESTADO: Barra de búsqueda abierta pero vacía (Exploración rápida) */}
      {!cleanQuery && (
        <div className="p-3.5 space-y-3">
          {/* Búsquedas frecuentes */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#5C715E] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D49A89]" />
              <span>Búsquedas Frecuentes en Cusco</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SUGGESTIONS.map((sug) => (
                <button
                  key={sug.label}
                  type="button"
                  onClick={() => onSelectSuggestion(sug.label)}
                  className="text-[11px] py-1.5 px-3 rounded-full bg-[#FBF9F6] hover:bg-[#5C715E] hover:text-white text-[#2C362D] border border-[#5C715E]/20 transition-all flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <span>{sug.icon}</span>
                  <span>{sug.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Arreglos destacados */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#2C362D]/75 uppercase tracking-wider mb-1.5">
              <Star className="w-3.5 h-3.5 text-[#D49A89]" />
              <span>Más Solicitados de la Boutique</span>
            </div>
            <div className="divide-y divide-gray-100 bg-[#FBF9F6] rounded-xl p-1 border border-[#5C715E]/15">
              {recommendations.slice(0, 3).map((product) => {
                const imgUrl = transformDriveUrl(product.imageUrl, 200) || BOUTIQUE_FALLBACK_IMAGE;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                  >
                    <img
                      src={imgUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = BOUTIQUE_FALLBACK_IMAGE;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#2C362D] truncate">{product.name}</h5>
                      <span className="text-[11px] font-medium text-[#5C715E]">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5C715E] font-bold bg-[#5C715E]/10 px-2 py-0.5 rounded-full">
                      Ver
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
