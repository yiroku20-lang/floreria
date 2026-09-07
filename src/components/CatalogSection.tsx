import React, { useState, useMemo } from 'react';
import { Sparkles, ArrowUpDown, Heart, GraduationCap, Cake, Bird, Flower2, Gift, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface CatalogSectionProps {
  products: Product[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onResetFilters: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onOpenDetail: (product: Product) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onResetFilters,
  onAddToCart,
  onOpenDetail,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [filterMode, setFilterMode] = useState<'ocasiones' | 'flores'>('ocasiones');

  const cuscOccasions = [
    { label: 'Citas & Romance', value: 'Citas & Romance', icon: Heart, desc: 'Rosas rojas, bouquets para citas y aniversarios' },
    { label: 'Graduaciones', value: 'Graduaciones', icon: GraduationCap, desc: 'Girasoles andinos y lirios para colaciones en Cusco' },
    { label: 'Cumpleaños', value: 'Cumpleaños', icon: Cake, desc: 'Diseños coloridos y festivos con dedicatoria' },
    { label: 'Condolencias & Homenaje', value: 'Condolencias & Homenaje', icon: Bird, desc: 'Arreglos sobrios, coronas y pedestales con cinta formal' },
  ];

  const flowerCollections = [
    { label: 'Tulipanes Holandeses', value: 'Tulipanes', icon: Flower2 },
    { label: 'Rosas de Lujo', value: 'Rosas de Lujo', icon: Sparkles },
    { label: 'Ramos de Autor', value: 'Ramos de Autor', icon: Flower2 },
    { label: 'Flores Preservadas', value: 'Flores Preservadas', icon: Sparkles },
    { label: 'Regalos & Merch', value: 'Merchandising & Regalos', icon: Gift },
  ];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category / Occasion filter
    if (activeCategory !== 'Todos') {
      list = list.filter(
        (p) =>
          p.category === activeCategory ||
          p.occasion === activeCategory
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
      {/* Section Header with Cusco Context */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5C715E]/10 text-[#5C715E] text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D49A89]" />
          <span>Catálogo Floral Cusco</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif-boutique font-bold text-[#2C362D] tracking-tight">
          Arreglos para Cada Momento
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#2C362D]/75 font-light leading-relaxed">
          Flores frescas de alta gama en Cusco: arreglos para citas, celebraciones de grado, cumpleaños y homenajes florales solemnes con entrega puntual garantizada.
        </p>
      </div>

      {/* Filter Mode Selector: Ocasiones Populares vs. Variedades */}
      <div className="flex flex-col items-center mb-6">
        <div className="inline-flex p-1 rounded-full bg-[#5C715E]/10 border border-[#5C715E]/15">
          <button
            id="tab-filter-ocasiones"
            onClick={() => setFilterMode('ocasiones')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterMode === 'ocasiones'
                ? 'bg-[#5C715E] text-white shadow-xs'
                : 'text-[#2C362D]/75 hover:text-[#5C715E]'
            }`}
          >
            Ocasiones Populares en Cusco
          </button>
          <button
            id="tab-filter-flores"
            onClick={() => setFilterMode('flores')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterMode === 'flores'
                ? 'bg-[#5C715E] text-white shadow-xs'
                : 'text-[#2C362D]/75 hover:text-[#5C715E]'
            }`}
          >
            Por Tipo de Flor & Colección
          </button>
        </div>
      </div>

      {/* Interactive Filter Pills */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b border-[#5C715E]/15">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {/* 'Todos' Button */}
          <button
            id="filter-cat-todos"
            onClick={() => onSelectCategory('Todos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'Todos'
                ? 'bg-[#5C715E] text-white shadow-xs'
                : 'bg-white text-[#2C362D]/80 hover:bg-[#5C715E]/10 border border-[#5C715E]/20'
            }`}
          >
            Todos ({products.length})
          </button>

          {/* Ocasiones Tab Content */}
          {filterMode === 'ocasiones' ? (
            cuscOccasions.map((occ) => {
              const Icon = occ.icon;
              const isSelected = activeCategory === occ.value;
              return (
                <button
                  key={occ.value}
                  id={`filter-occ-${occ.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => onSelectCategory(occ.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#5C715E] text-white shadow-xs'
                      : 'bg-white text-[#2C362D]/80 hover:bg-[#5C715E]/10 border border-[#5C715E]/20'
                  }`}
                  title={occ.desc}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FBF9F6]' : 'text-[#5C715E]'}`} />
                  <span>{occ.label}</span>
                </button>
              );
            })
          ) : (
            flowerCollections.map((col) => {
              const Icon = col.icon;
              const isSelected = activeCategory === col.value;
              return (
                <button
                  key={col.value}
                  id={`filter-col-${col.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => onSelectCategory(col.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#5C715E] text-white shadow-xs'
                      : 'bg-white text-[#2C362D]/80 hover:bg-[#5C715E]/10 border border-[#5C715E]/20'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FBF9F6]' : 'text-[#5C715E]'}`} />
                  <span>{col.label}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Sort selector & Count */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <span className="text-xs text-[#2C362D]/60 whitespace-nowrap">
            <strong>{filteredProducts.length}</strong> arreglos
          </span>

          <div className="flex items-center gap-1.5 text-xs text-[#2C362D] bg-white px-3 py-1.5 rounded-full border border-[#5C715E]/20 shadow-2xs">
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

      {/* Occasion Context Message Banner (Especially subtle & formal for Condolences) */}
      {activeCategory === 'Condolencias & Homenaje' && (
        <div className="mt-4 p-4 rounded-2xl bg-white border border-[#5C715E]/20 shadow-xs flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-[#5C715E]/10 text-[#5C715E]">
            <Bird className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-[#2C362D] uppercase tracking-wider">
              Condolencias y Homenaje Floral en Cusco
            </h4>
            <p className="text-xs text-[#2C362D]/75 mt-0.5">
              Expresamos su pésame con la mayor solemnidad y respeto. Todos nuestros arreglos incluyen cinta dedicatoria formal caligrafiada y coordinación de entrega delicada en velatorios, templos o domicilios de Cusco.
            </p>
          </div>
        </div>
      )}

      {activeCategory === 'Graduaciones' && (
        <div className="mt-4 p-4 rounded-2xl bg-white border border-[#5C715E]/20 shadow-xs flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-[#D49A89]/20 text-[#2C362D]">
            <GraduationCap className="w-5 h-5 text-[#5C715E]" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-[#2C362D] uppercase tracking-wider">
              Graduaciones & Colaciones Académicas
            </h4>
            <p className="text-xs text-[#2C362D]/75 mt-0.5">
              Ramos emblemáticos con girasoles andinos resplandecientes, lirios blancos y cintas doradas de honor, perfectos para sesiones de fotos de toga y celebraciones en Cusco.
            </p>
          </div>
        </div>
      )}

      {/* Active Search/Filter summary badge */}
      {(searchQuery || activeCategory !== 'Todos') && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#5C715E]">
          <span>Filtro activo:</span>
          {activeCategory !== 'Todos' && (
            <span className="bg-[#5C715E]/10 px-2.5 py-0.5 rounded-full font-semibold">
              {activeCategory}
            </span>
          )}
          {searchQuery && (
            <span className="bg-[#D49A89]/20 text-[#2C362D] px-2.5 py-0.5 rounded-full font-medium">
              Búsqueda: "{searchQuery}"
            </span>
          )}
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs underline hover:text-[#B87C6B] font-medium ml-2"
          >
            <RefreshCw className="w-3 h-3" />
            Mostrar todo el catálogo
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center py-16 bg-white rounded-3xl border border-[#5C715E]/15 shadow-sm max-w-md mx-auto p-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#5C715E]/10 flex items-center justify-center text-[#5C715E] mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif-boutique font-bold text-[#2C362D]">
            No encontramos arreglos con este filtro
          </h3>
          <p className="mt-1.5 text-xs text-[#2C362D]/70">
            Intenta con otra ocasión o revisa nuestras creaciones disponibles.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 px-5 py-2 rounded-full bg-[#5C715E] text-white text-xs font-semibold hover:bg-[#4a5c4c] transition-colors"
          >
            Ver Catálogo Completo
          </button>
        </div>
      )}
    </section>
  );
};
