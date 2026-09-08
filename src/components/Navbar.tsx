import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, ShieldCheck, Phone, Sparkles, Lock } from 'lucide-react';
import { RosanferLogo } from './RosanferLogo';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onSelectCategory: (category: string) => void;
  activeCategory: string;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  whatsappNumber: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onSelectCategory,
  activeCategory,
  onSearchChange,
  searchQuery,
  whatsappNumber,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const officialCollections = [
    { label: 'Festivos', value: 'Festivos', hint: 'Cumpleaños & Quinceañeros' },
    { label: 'Latidos en Flor', value: 'Latidos en Flor', hint: 'Romance & Amor' },
    { label: 'Graduación', value: 'Graduación', hint: 'Colaciones & Títulos' },
    { label: 'Set Nupcial "Sí Acepto"', value: 'Set Nupcial "Sí Acepto"', hint: 'Bodas en Cusco' },
    { label: 'Amor Eterno', value: 'Amor Eterno', hint: 'Flores Preservadas' },
    { label: 'Primavera Para Ti', value: 'Primavera Para Ti', hint: 'Tulipanes & Frescas' },
  ];

  return (
    <>
      {/* Top minimal ribbon - airy, delicate and calm */}
      <div className="bg-[#5C715E] text-[#FBF9F6] text-[11px] py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-[#D49A89]" />
        <span>Boutique Floral en Cusco • Envíos a Domicilio & Recojo en Taller</span>
        <span className="hidden sm:inline text-[#D49A89]/90">
          • WhatsApp {whatsappNumber.length === 11 && whatsappNumber.startsWith('51')
            ? `${whatsappNumber.slice(2, 5)} ${whatsappNumber.slice(5, 8)} ${whatsappNumber.slice(8)}`
            : (whatsappNumber || '989 415 220')}
        </span>
      </div>

      {/* Main Top Navigation Bar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FBF9F6]/95 backdrop-blur-md shadow-rosanfer border-b border-[#5C715E]/10 py-3'
            : 'bg-[#FBF9F6] border-b border-[#5C715E]/10 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#2C362D] hover:text-[#5C715E] rounded-full hover:bg-[#5C715E]/10 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              id="btn-mobile-search-toggle"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="p-2 text-[#2C362D] hover:text-[#5C715E] rounded-full hover:bg-[#5C715E]/10 transition-colors"
              aria-label="Buscar arreglos"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Left: Boutique Logo with generous negative space */}
          <div className="flex items-center">
            <button
              onClick={() => {
                onSelectCategory('Todos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left cursor-pointer transition-transform hover:opacity-95"
              aria-label="Rosanfer Florería Inicio"
            >
              <RosanferLogo size="sm" variant="horizontal" />
            </button>
          </div>

          {/* Center: Clean, Airy & Spacious Navigation Links (Free from text clutter) */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            <button
              id="nav-link-catalogo"
              onClick={() => {
                onSelectCategory('Todos');
                scrollToSection('catalogo-section');
              }}
              className={`text-sm tracking-wide transition-colors py-1 ${
                activeCategory === 'Todos'
                  ? 'text-[#5C715E] font-semibold'
                  : 'text-[#2C362D]/75 hover:text-[#5C715E]'
              }`}
            >
              Catálogo
            </button>

            <button
              id="nav-link-colecciones"
              onClick={() => {
                scrollToSection('catalogo-section');
              }}
              className="text-sm tracking-wide text-[#2C362D]/75 hover:text-[#5C715E] transition-colors py-1 flex items-center gap-1.5"
            >
              <span>Colecciones</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#D49A89]/20 text-[#2C362D] font-semibold">
                6 Tipos
              </span>
            </button>

            <a
              id="nav-link-taller"
              href="#boutique-story"
              className="text-sm tracking-wide text-[#2C362D]/75 hover:text-[#5C715E] transition-colors py-1"
            >
              Cómo Entregamos
            </a>
          </nav>

          {/* Right: Uncluttered Icon Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Expandable / Compact Search */}
            <div className="relative flex items-center">
              {isSearchExpanded ? (
                <div className="flex items-center bg-white border border-[#5C715E]/25 rounded-full pl-3 pr-2 py-1 shadow-xs transition-all w-48 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-[#5C715E]" />
                  <input
                    type="text"
                    placeholder="Buscar arreglo, flor..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                    className="w-full px-2 text-xs text-[#2C362D] bg-transparent focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setIsSearchExpanded(false);
                      onSearchChange('');
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 p-0.5"
                    title="Cerrar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="btn-search-expand"
                  onClick={() => setIsSearchExpanded(true)}
                  className="hidden md:flex items-center gap-1.5 text-xs text-[#2C362D]/70 hover:text-[#5C715E] p-2 rounded-full hover:bg-[#5C715E]/10 transition-colors"
                  title="Buscar en el catálogo"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Direct WhatsApp icon button */}
            <a
              id="btn-whatsapp-header"
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                '¡Hola Rosanfer Florería! Quisiera información y consultar disponibilidad para un arreglo floral en Cusco.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-[#5C715E] hover:bg-[#5C715E]/10 transition-all"
              title="Atención directa por WhatsApp"
              aria-label="Contactar por WhatsApp"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* Intranet / Admin icon button */}
            <button
              id="btn-open-admin-portal"
              onClick={onOpenAdmin}
              className="p-2 rounded-full text-[#2C362D]/70 hover:text-[#5C715E] hover:bg-[#5C715E]/10 transition-all"
              title="Intranet del personal y pedidos"
              aria-label="Intranet de administración"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Shopping Cart Button */}
            <button
              id="btn-open-cart-drawer"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-[#5C715E] text-white hover:bg-[#4a5c4c] transition-all active:scale-95 shadow-sm flex items-center justify-center ml-1"
              aria-label="Ver carrito de compras"
              title="Ver carrito de compras"
            >
              <ShoppingBag className="w-4 h-4 text-[#FBF9F6]" />
              {cartCount > 0 && (
                <span
                  id="cart-badge-count"
                  className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-[#D49A89] text-[#2C362D] text-[10px] font-bold flex items-center justify-center border-2 border-[#FBF9F6] shadow-xs"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input dropdown when opened */}
        {isSearchExpanded && (
          <div className="p-3 border-t border-[#5C715E]/10 bg-[#FBF9F6] md:hidden">
            <div className="relative flex items-center bg-white rounded-full border border-[#5C715E]/30 px-3 py-1.5">
              <Search className="w-4 h-4 text-[#5C715E] mr-2" />
              <input
                type="text"
                placeholder="Buscar por ocasión, flor o detalle..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="w-full text-xs text-[#2C362D] focus:outline-none"
              />
              <button
                onClick={() => {
                  setIsSearchExpanded(false);
                  onSearchChange('');
                }}
                className="text-gray-400 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-0 mr-auto w-4/5 max-w-sm h-full bg-[#FBF9F6] shadow-2xl flex flex-col p-6 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#5C715E]/15">
              <RosanferLogo size="sm" variant="horizontal" />
              <button
                id="btn-close-mobile-menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[#2C362D] hover:text-[#5C715E] rounded-full"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Colecciones Principales (6 Tipos) */}
            <div className="mt-5 flex flex-col gap-1">
              <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-[11px] uppercase tracking-widest text-[#5C715E] font-bold">
                  Nuestras Colecciones
                </p>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#D49A89]/20 text-[#2C362D] font-bold">
                  6 Tipos
                </span>
              </div>
              {officialCollections.map((col) => (
                <button
                  key={col.value}
                  onClick={() => {
                    onSelectCategory(col.value);
                    setMobileMenuOpen(false);
                    scrollToSection('catalogo-section');
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs transition-colors flex flex-col gap-0.5 ${
                    activeCategory === col.value
                      ? 'bg-[#5C715E] text-white'
                      : 'text-[#2C362D] hover:bg-[#5C715E]/10'
                  }`}
                >
                  <span className="font-bold">{col.label}</span>
                  <span
                    className={`text-[10px] ${
                      activeCategory === col.value ? 'text-white/80' : 'text-[#5C715E]'
                    }`}
                  >
                    {col.hint}
                  </span>
                </button>
              ))}

              {/* Actions */}
              <div className="my-4 border-t border-[#5C715E]/15 pt-3 flex flex-col gap-2">
                <a
                  href="#boutique-story"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-[#2C362D] hover:bg-[#5C715E]/10 rounded-lg flex items-center justify-between"
                >
                  <span>Cómo Entregamos (Taller & Envíos)</span>
                  <span className="text-[10px] bg-[#5C715E]/10 text-[#5C715E] font-bold px-2 py-0.5 rounded-full">
                    100% Delivery
                  </span>
                </a>
              </div>
            </div>

            {/* Bottom Contact & Discreet Internal Access */}
            <div className="mt-auto pt-4 border-t border-[#5C715E]/15">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  '¡Hola Rosanfer Florería! Quisiera realizar una consulta sobre sus arreglos florales en Cusco.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#5C715E] text-white font-medium text-xs shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                Contactar por WhatsApp
              </a>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#2C362D]/40 px-1">
                <span className="font-serif-boutique italic">Rosanfer • Cusco</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="text-[#2C362D]/35 hover:text-[#5C715E] transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
                  title="Gestión interna"
                >
                  <Lock className="w-2.5 h-2.5 opacity-60" />
                  <span>Acceso interno</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
