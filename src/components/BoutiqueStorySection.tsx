import React from 'react';
import { Sparkles, Heart, PackageCheck, Award, Scissors, Truck, Mail, MapPin, Store } from 'lucide-react';
import { RosanferLogo } from './RosanferLogo';

interface BoutiqueStorySectionProps {
  onSelectCategory: (category: string) => void;
}

export const BoutiqueStorySection: React.FC<BoutiqueStorySectionProps> = ({
  onSelectCategory,
}) => {
  return (
    <section
      id="boutique-story"
      className="py-16 sm:py-24 bg-gradient-to-b from-[#FBF9F6] via-[#F4EFEB] to-[#FBF9F6] border-y border-[#5C715E]/10 relative overflow-hidden"
    >
      {/* Subtle decorative background watermarks */}
      <div className="absolute -right-16 top-10 opacity-5 pointer-events-none">
        <RosanferLogo size="xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[#5C715E] bg-[#5C715E]/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            <span>De Nuestro Taller a Tu Puerta • La Experiencia Rosanfer</span>
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif-boutique font-bold text-[#2C362D] tracking-tight">
            El Arte de Regalar Flores en Cusco
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#2C362D]/75 font-light leading-relaxed">
            Operamos como un <strong>Taller Floral de Autor enfocado 100% en envíos a domicilio</strong>. Cada ramo nace bajo una armonía de verdes salvia, rosas empolvados y dedicatorias escritas con el corazón.
          </p>
        </div>

        {/* Informative Banner: 100% Delivery + Physical Boutique Coming Soon */}
        <div className="max-w-3xl mx-auto mb-12 p-4 sm:p-5 rounded-2xl bg-[#5C715E]/10 border border-[#5C715E]/20 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#5C715E] text-white flex items-center justify-center shrink-0 shadow-sm">
            <MapPin className="w-6 h-6 text-[#D49A89]" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs font-bold text-[#2C362D] uppercase tracking-wider">
                Modalidad de Atención en Cusco
              </span>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Delivery Activo
              </span>
              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Store className="w-3 h-3" />
                <span>Próximamente Local Físico</span>
              </span>
            </div>
            <p className="text-xs text-[#2C362D]/80 leading-relaxed font-light">
              Por ahora no contamos con local presencial para recojo. Llevamos cada pedido con transporte floral especializado a casas, oficinas y restaurantes en todo Cusco. ¡Muy pronto abriremos las puertas de nuestra primera boutique física!
            </p>
          </div>
        </div>

        {/* Visual Bento Showcase: The Delivery and Craft Experience */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left card: Florist Atelier & Stems Preparation */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-rosanfer relative overflow-hidden group">
            <div className="relative h-72 sm:h-84 rounded-2xl overflow-hidden bg-[#EAE6DF]">
              <img
                src="https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=1200&q=80"
                alt="Confección y Taller Floral Rosanfer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs uppercase font-bold tracking-wider text-[#D49A89] block">
                  Cuidado Botánico & Pasión
                </span>
                <h3 className="text-xl font-serif-boutique font-bold">
                  Preparación Artesanal al Amanecer
                </h3>
                <p className="text-xs text-white/85 mt-1">
                  Flores frescas de exportación, corte a 45 grados y preservación hídrica para que duren muchos días en el hogar.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10">
                <Scissors className="w-5 h-5 mx-auto text-[#5C715E] mb-1" />
                <span className="text-xs font-bold text-[#2C362D] block">Corte Diario</span>
                <span className="text-[11px] text-gray-500">Tallos frescos</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10">
                <Mail className="w-5 h-5 mx-auto text-[#D49A89] mb-1" />
                <span className="text-xs font-bold text-[#2C362D] block">Dedicatoria</span>
                <span className="text-[11px] text-gray-500">Papelería fina</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10">
                <Truck className="w-5 h-5 mx-auto text-[#5C715E] mb-1" />
                <span className="text-xs font-bold text-[#2C362D] block">Envío Seguro</span>
                <span className="text-[11px] text-gray-500">Todo Cusco</span>
              </div>
            </div>
          </div>

          {/* Right card: How Delivery and Gifting Works */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-rosanfer relative overflow-hidden group">
              <div className="relative h-60 rounded-2xl overflow-hidden bg-[#EAE6DF]">
                <img
                  src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80"
                  alt="Entrega floral a domicilio y regalo especial"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#D49A89] block">
                    Protocolo de Sorpresa
                  </span>
                  <h3 className="text-lg font-serif-boutique font-bold">
                    El Viaje de tu Ramo: Cuidado en Cada Kilómetro
                  </h3>
                </div>
              </div>

              {/* 3 Step delivery details */}
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FBF9F6]">
                  <span className="w-6 h-6 rounded-full bg-[#5C715E] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="text-xs text-[#2C362D]">
                    <strong className="block text-[#2C362D]">Diseño según la ocasión</strong>
                    Elige entre Festivos, Latidos en Flor, Graduación, Set Nupcial, Amor Eterno o Primavera.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FBF9F6]">
                  <span className="w-6 h-6 rounded-full bg-[#D49A89] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="text-xs text-[#2C362D]">
                    <strong className="block text-[#2C362D]">Tarjeta con tu dedicatoria</strong>
                    Escribimos tu mensaje personalizado en sobre sellado con el toque íntimo de la florería.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FBF9F6]">
                  <span className="w-6 h-6 rounded-full bg-[#2C362D] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="text-xs text-[#2C362D]">
                    <strong className="block text-[#2C362D]">Entrega puntual en destino</strong>
                    Transporte protegido contra el viento y reporte inmediato para tu tranquilidad.
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div>
                  <h4 className="font-serif-boutique font-bold text-base text-[#2C362D]">
                    ¿Listo para sorprender a alguien hoy?
                  </h4>
                  <p className="text-xs text-[#2C362D]/70">
                    Entregas el mismo día o programadas en Cusco.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const cat = document.getElementById('catalogo-section');
                    if (cat) cat.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-xs font-semibold whitespace-nowrap transition-colors shadow-sm cursor-pointer"
                >
                  Ver las 6 Colecciones
                </button>
              </div>
            </div>

            {/* Brand Colors Swatch Bar */}
            <div className="bg-white rounded-2xl p-4 border border-[#5C715E]/15 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#5C715E] uppercase tracking-wider">
                  Paleta Botánica:
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: '#FBF9F6' }}
                    title="Lino Crudo: #FBF9F6"
                  />
                  <span
                    className="w-5 h-5 rounded-full shadow-xs"
                    style={{ backgroundColor: '#5C715E' }}
                    title="Verde Salvia: #5C715E"
                  />
                  <span
                    className="w-5 h-5 rounded-full shadow-xs"
                    style={{ backgroundColor: '#D49A89' }}
                    title="Rosa Empolvado: #D49A89"
                  />
                  <span
                    className="w-5 h-5 rounded-full shadow-xs"
                    style={{ backgroundColor: '#2C362D' }}
                    title="Verde Bosque: #2C362D"
                  />
                </div>
              </div>
              <span className="text-[11px] text-gray-500 font-serif-boutique italic">
                Rosanfer • Floristería de Autor
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
