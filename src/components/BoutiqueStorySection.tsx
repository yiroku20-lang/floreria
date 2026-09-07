import React from 'react';
import { Sparkles, Heart, PackageCheck, Award, Scissors, Droplet } from 'lucide-react';
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
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-[#5C715E] bg-[#5C715E]/10 px-3.5 py-1 rounded-full">
            El Taller & La Esencia Rosanfer
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif-boutique font-bold text-[#2C362D] tracking-tight">
            Diseño Botánico de Autor & Regalos Exclusivos
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#2C362D]/75 font-light leading-relaxed">
            Cada arreglo floral, empaque y pieza de nuestra colección está concebida bajo una armonía de
            verdes salvia (#5C715E), rosas empolvados (#D49A89) y linos artesanales.
          </p>
        </div>

        {/* Visual Bento Showcase of the Brand Merchandise & Workshop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left card: Florist Linen Apron & Atelier Experience (Photo 5 inspiration) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-rosanfer relative overflow-hidden group">
            <div className="relative h-72 sm:h-84 rounded-2xl overflow-hidden bg-[#EAE6DF]">
              <img
                src="https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=1200&q=80"
                alt="Delantal de Lino y Taller Rosanfer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs uppercase font-bold tracking-wider text-[#D49A89] block">
                  Confección Artesanal
                </span>
                <h3 className="text-xl font-serif-boutique font-bold">
                  Delantal de Lino Sage & Taller Florista
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  El uniforme oficial con bordado metálico de nuestra rosa insignia y bolsillos para tijeras de poda.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10">
                <Scissors className="w-5 h-5 mx-auto text-[#5C715E] mb-1" />
                <span className="text-xs font-bold text-[#2C362D] block">Corte Diario</span>
                <span className="text-[11px] text-gray-500">Tallos hidratados</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10">
                <Award className="w-5 h-5 mx-auto text-[#D49A89] mb-1" />
                <span className="text-xs font-bold text-[#2C362D] block">Calidad Grado A</span>
                <span className="text-[11px] text-gray-500">Flores importadas</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10">
                <PackageCheck className="w-5 h-5 mx-auto text-[#5C715E] mb-1" />
                <span className="text-xs font-bold text-[#2C362D] block">Empaque Luxury</span>
                <span className="text-[11px] text-gray-500">Papelería fina</span>
              </div>
            </div>
          </div>

          {/* Right card: Brand Guide & Ceramic Merchandise (Photo 4 inspiration) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-rosanfer relative overflow-hidden group">
              <div className="relative h-64 rounded-2xl overflow-hidden bg-[#EAE6DF]">
                <img
                  src="https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80"
                  alt="Florero Cerámica Sage y Set de Marca Rosanfer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#D49A89] block">
                    Colección Merchandising
                  </span>
                  <h3 className="text-lg font-serif-boutique font-bold">
                    Floreros de Cerámica Sage & Cajas de Regalo
                  </h3>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <h4 className="font-serif-boutique font-bold text-lg text-[#2C362D]">
                    ¿Deseas complementar tu arreglo floral?
                  </h4>
                  <p className="text-xs text-[#2C362D]/70 mt-0.5">
                    Descubre floreros de autor, tarjetas de lino personalizadas y sets botánicos.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSelectCategory('Merchandising & Regalos');
                    const cat = document.getElementById('catalogo-section');
                    if (cat) cat.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-xs font-semibold whitespace-nowrap transition-colors shadow-sm"
                >
                  Ver Colección
                </button>
              </div>
            </div>

            {/* Brand Colors Swatch Bar */}
            <div className="bg-white rounded-2xl p-4 border border-[#5C715E]/15 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#5C715E] uppercase tracking-wider">
                  Paleta Oficial:
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: '#FBF9F6' }}
                    title="Fondo: #FBF9F6"
                  />
                  <span
                    className="w-5 h-5 rounded-full shadow-xs"
                    style={{ backgroundColor: '#5C715E' }}
                    title="Primario: #5C715E"
                  />
                  <span
                    className="w-5 h-5 rounded-full shadow-xs"
                    style={{ backgroundColor: '#D49A89' }}
                    title="Acento: #D49A89"
                  />
                  <span
                    className="w-5 h-5 rounded-full shadow-xs"
                    style={{ backgroundColor: '#2C362D' }}
                    title="Texto: #2C362D"
                  />
                </div>
              </div>
              <span className="text-[11px] text-gray-500 font-serif-boutique italic">
                Boutique Floral Rosanfer
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
