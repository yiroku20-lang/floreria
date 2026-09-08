import React from 'react';
import { Phone, MapPin, Clock, Heart, ShieldCheck } from 'lucide-react';
import { RosanferLogo } from './RosanferLogo';
import { BoutiqueSettings } from '../types';

interface FooterProps {
  settings: BoutiqueSettings;
  onOpenAdmin: () => void;
  onSelectCategory: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin, onSelectCategory }) => {
  return (
    <footer className="bg-[#2C362D] text-[#FBF9F6] border-t border-[#5C715E]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-start">
              <RosanferLogo size="md" variant="horizontal" light />
            </div>
            <p className="text-xs text-[#FBF9F6]/70 leading-relaxed font-light">
              Boutique floral dedicada al arte del diseño botánico. Seleccionamos tulipanes holandeses,
              rosas de autor y flores de estación para crear momentos memorables.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] text-[#D49A89] font-serif-boutique italic">
                "El amor viene en forma de flor"
              </span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D49A89] mb-4">
              Colecciones
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FBF9F6]/80 font-light">
              {[
                'Festivos',
                'Latidos en Flor',
                'Graduación',
                'Set Nupcial "Sí Acepto"',
                'Amor Eterno',
                'Primavera Para Ti',
              ].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        onSelectCategory(cat);
                        const c = document.getElementById('catalogo-section');
                        if (c) c.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-[#D49A89] transition-colors cursor-pointer"
                    >
                      {cat}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Col 3: Atelier & Delivery Mode */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D49A89] mb-4">
              Taller Floral & Envíos
            </h4>
            <ul className="space-y-3 text-xs text-[#FBF9F6]/80 font-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D49A89] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Taller Floral de Autor en Cusco</span>
                  <span className="text-[#FBF9F6]/75 block">Atención exclusiva por Delivery en toda la ciudad</span>
                  <span className="inline-block text-[10px] text-amber-300 font-medium bg-amber-900/40 px-2 py-0.5 rounded-md mt-1 border border-amber-500/30">
                    ✨ Próximamente: Apertura de local físico para recojo
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D49A89] shrink-0 mt-0.5" />
                <span>{settings.openingHours}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D49A89] shrink-0 mt-0.5" />
                <span>
                  Atención directa WhatsApp:{' '}
                  {settings.whatsappNumber.length === 11 && settings.whatsappNumber.startsWith('51')
                    ? `+51 ${settings.whatsappNumber.slice(2, 5)} ${settings.whatsappNumber.slice(5, 8)} ${settings.whatsappNumber.slice(8)}`
                    : `+${settings.whatsappNumber}`}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: WhatsApp Orders & Atención */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D49A89] mb-4">
              Atención & Pedidos
            </h4>
            <p className="text-xs text-[#FBF9F6]/70 leading-relaxed mb-4 font-light">
              Gestionamos tus pedidos con dedicatoria personalizada y entrega segura el mismo día en Cusco.
            </p>
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                '¡Hola Rosanfer Florería! Quisiera cotizar un ramo para entrega a domicilio.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-xs font-semibold shadow-md transition-all mb-3"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Chatear por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FBF9F6]/50 gap-4">
          <p>© {new Date().getFullYear()} Rosanfer Florería. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              Diseñado con <Heart className="w-3.5 h-3.5 text-[#D49A89] fill-[#D49A89]" /> para momentos únicos.
            </p>
            <button
              onClick={onOpenAdmin}
              className="text-[10px] text-[#FBF9F6]/30 hover:text-[#D49A89] transition-colors cursor-pointer"
              title="Portal de colaboradores"
            >
              • Acceso interno
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
