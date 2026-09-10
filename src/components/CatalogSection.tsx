import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowUpDown,
  Heart,
  GraduationCap,
  PartyPopper,
  Crown,
  Infinity as InfinityIcon,
  Flower2,
  RefreshCw,
  X,
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';

export interface CategoryInfo {
  name: ProductCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  description: string;
}

export const OFFICIAL_CATEGORIES: CategoryInfo[] = [
  {
    name: 'Festivos',
    label: 'Festivos',
    icon: PartyPopper,
    tagline: 'Cumpleaños, Quinceañeros & Celebraciones',
    description:
      'Arreglos dinámicos y coloridos diseñados para llenar de alegría momentos inolvidables en Cusco.',
  },
  {
    name: 'Latidos en Flor',
    label: 'Latidos en Flor',
    icon: Heart,
    tagline: 'Romance, Aniversarios & Amor',
    description:
      'El lenguaje más sublime del amor: bouquets de rosas rojas de exportación y lirios finos preparados con el toque íntimo de nuestro taller.',
  },
  {
    name: 'Graduación',
    label: 'Graduación',
    icon: GraduationCap,
    tagline: 'Colaciones Académicas & Títulos',
    description:
      'Homenaje al esfuerzo y la excelencia con girasoles andinos resplandecientes, lirios y cintas doradas de honor.',
  },
  {
    name: 'Set Nupcial "Sí Acepto"',
    label: 'Set Nupcial "Sí Acepto"',
    icon: Crown,
    tagline: 'Bodas en Cusco & El Valle Sagrado',
    description:
      'Arreglos y sets nupciales a medida: ramos de novia principales, tocados, boutonnieres y alta floristería matrimonial.',
  },
  {
    name: 'Amor Eterno',
    label: 'Amor Eterno',
    icon: InfinityIcon,
    tagline: 'Flores de Amor Incondicional, Gratitud & Pasión',
    description:
      'Diseños que celebran el amor en todas sus expresiones: boxes botánicos con rosas de exportación, girasoles y canastas románticas.',
  },
  {
    name: 'Primavera Para Ti',
    label: 'Primavera Para Ti',
    icon: Flower2,
    tagline: 'Frescura Campestre & Ternura Botánica',
    description:
      'Vivacidad andina y silvestres con canastas de crisantemos, girasoles y boxes en tonalidades pastel que transmiten alegría.',
  },
];

interface CatalogSectionProps {
  products: Product[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onResetFilters: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onOpenDetail: (product: Product) => void;
  whatsappNumber?: string;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onResetFilters,
  onAddToCart,
  onOpenDetail,
  whatsappNumber,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  // Active category definition
  const currentCategoryInfo = useMemo(() => {
    return OFFICIAL_CATEGORIES.find((c) => c.name === activeCategory);
  }, [activeCategory]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Main Category filter
    if (activeCategory !== 'Todos') {
      list = list.filter(
        (p) => p.category === activeCategory || p.occasion === activeCategory
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subEdition && p.subEdition.toLowerCase().includes(q)) ||
          (p.occasion && p.occasion.toLowerCase().includes(q)) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // featured / bestsellers first
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <section id="catalogo-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5C715E]/10 text-[#5C715E] text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D49A89]" />
          <span>Colecciones Exclusivas • Rosanfer Cusco</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif-boutique font-bold text-[#2C362D] tracking-tight">
          Nuestras 6 Colecciones Principales
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#2C362D]/75 font-light leading-relaxed">
          Diseños de autor para cada emoción: festivos, romance en flor, graduaciones de honor, bodas de ensueño, amor eterno y frescura primaveral con entrega puntual en todo Cusco.
        </p>
      </div>

      {/* Primary Category Selector Bar (Spacious, fluid wrap, perfectly readable) */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {/* 'Todas' Button */}
          <button
            id="filter-cat-todos"
            onClick={() => onSelectCategory('Todos')}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeCategory === 'Todos'
                ? 'bg-[#5C715E] text-white shadow-sm ring-2 ring-[#5C715E]/30 font-bold'
                : 'bg-white text-[#2C362D]/85 hover:bg-[#5C715E]/10 border border-[#5C715E]/20'
            }`}
          >
            <span>Todas las Colecciones</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeCategory === 'Todos'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-[#5C715E]'
              }`}
            >
              {products.length}
            </span>
          </button>

          {/* 6 Official Category Pills */}
          {OFFICIAL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.name;
            const count = products.filter((p) => p.category === cat.name).length;
            return (
              <button
                key={cat.name}
                id={`filter-cat-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onSelectCategory(cat.name)}
                className={`px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
                  isSelected
                    ? 'bg-[#5C715E] text-white shadow-sm ring-2 ring-[#5C715E]/30 font-bold'
                    : 'bg-white text-[#2C362D]/85 hover:bg-[#5C715E]/10 border border-[#5C715E]/20'
                }`}
                title={cat.tagline}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-[#FBF9F6]' : 'text-[#5C715E]'
                  }`}
                />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#5C715E]/10 text-[#5C715E]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-bar: Status and Sort Controls */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#5C715E]/15">
          <div className="flex items-center gap-2.5 text-xs text-[#2C362D]/75">
            <span>
              Mostrando <strong className="text-[#2C362D]">{filteredProducts.length}</strong> arreglos
            </span>
            {activeCategory !== 'Todos' && (
              <span className="inline-flex items-center gap-1 bg-[#5C715E]/10 text-[#5C715E] px-2.5 py-0.5 rounded-full font-semibold">
                <span>{activeCategory}</span>
                <button
                  onClick={() => onSelectCategory('Todos')}
                  className="hover:text-red-600 transition-colors cursor-pointer"
                  title="Quitar filtro"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#2C362D]">
            <span className="text-[#2C362D]/60 hidden sm:inline">Ordenar:</span>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#5C715E]/20 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#5C715E]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name">Nombre: A - Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Category Description Banner (Only shown when a specific collection is filtered) */}
      {currentCategoryInfo && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white border border-[#5C715E]/20 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-2xl bg-[#5C715E]/10 text-[#5C715E] shrink-0">
              <currentCategoryInfo.icon className="w-5 h-5 text-[#5C715E]" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-serif-boutique font-bold text-[#2C362D]">
                  Colección: {currentCategoryInfo.label}
                </h3>
                <span className="text-[11px] px-2 py-0.2 rounded-full bg-[#D49A89]/20 text-[#2C362D] font-semibold">
                  {currentCategoryInfo.tagline}
                </span>
              </div>
              <p className="text-xs text-[#2C362D]/75 mt-0.5 line-clamp-2">
                {currentCategoryInfo.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectCategory('Todos')}
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-[#5C715E] hover:text-[#2C362D] px-3 py-1.5 rounded-full border border-[#5C715E]/20 hover:bg-[#5C715E]/10 transition-colors shrink-0 cursor-pointer"
          >
            Ver todas
          </button>
        </div>
      )}

      {/* Active Search Notification */}
      {searchQuery && (
        <div className="mb-6 flex items-center gap-2 text-xs text-[#5C715E]">
          <span className="bg-gray-100 text-[#2C362D] px-2.5 py-1 rounded-full font-medium">
            Búsqueda activa: "{searchQuery}"
          </span>
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs underline hover:text-[#B87C6B] font-medium ml-2 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onOpenDetail={onOpenDetail}
              whatsappNumber={whatsappNumber}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center py-16 bg-white rounded-3xl border border-[#5C715E]/15 shadow-sm max-w-md mx-auto p-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#5C715E]/10 flex items-center justify-center text-[#5C715E] mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif-boutique font-bold text-[#2C362D]">
            No encontramos arreglos con este filtro
          </h3>
          <p className="mt-1.5 text-xs text-[#2C362D]/70">
            Intenta seleccionando otra colección o explorando todo nuestro catálogo floral.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 px-5 py-2 rounded-full bg-[#5C715E] text-white text-xs font-semibold hover:bg-[#4a5c4c] transition-colors cursor-pointer"
          >
            Ver Catálogo Completo
          </button>
        </div>
      )}
    </section>
  );
};
