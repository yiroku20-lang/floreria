import { Product, Order, InventoryMovement, PromoConfig, BoutiqueSettings, SocialVideoPost } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // 1. FESTIVOS (2)
  {
    id: 'festivos-01',
    name: 'Canasta Duendecitos Festivos',
    category: 'Festivos',
    subEdition: 'Crisantemos & Statice',
    occasion: 'Cumpleaños',
    description: 'Alegre y festiva canasta artesanal con crisantemos multicolor, statice silvestre y detalles mágicos que llenan de alegría y calidez cualquier celebración.',
    price: 125.0,
    originalPrice: 145.0,
    stock: 15,
    imageUrl: 'https://files.catbox.moe/rynzsg.jpg',
    tags: ['Bestseller', 'Temporada'],
    stemCount: 'Crisantemos, Statice & Follaje fino',
    careTips: [
      'Hidratar la base de la canasta con media taza de agua fresca a diario.',
      'Mantener en un lugar ventilado y fresco.'
    ],
    featured: true,
  },
  {
    id: 'festivos-02',
    name: 'Bouquet Comparsa Festiva',
    category: 'Festivos',
    subEdition: 'Mini Rosas & Lirios Iris',
    occasion: 'Celebración',
    description: 'Vibrante bouquet con mini rosas frescas, lirios iris coloridos y envoltura de gala inspirada en la música y festividad cusqueña.',
    price: 140.0,
    stock: 12,
    imageUrl: 'https://files.catbox.moe/vr7tt5.jpg',
    tags: ['Nuevo', 'Exclusivo'],
    stemCount: 'Mini Rosas, Lirios Iris & Eucalipto',
    careTips: [
      'Cortar 1 cm de tallo en ángulo al colocar en florero.',
      'Renovar el agua cada 48 horas.'
    ],
    featured: true,
  },

  // 2. LATIDOS EN FLOR (2)
  {
    id: 'latidos-01',
    name: 'Bouquet Latido Dulce',
    category: 'Latidos en Flor',
    subEdition: 'Rosas Bicolor & Manzanilla',
    occasion: 'Citas & Romance',
    description: 'Exquisito bouquet romántico que combina rosas bicolor aterciopeladas con delicadas flores de manzanilla silvestre y follaje noble aromático.',
    price: 135.0,
    originalPrice: 150.0,
    stock: 16,
    imageUrl: 'https://files.catbox.moe/qvo6g2.jpg',
    tags: ['Bestseller', 'Oferta'],
    stemCount: '18 Tallos seleccionados de jardín',
    careTips: [
      'Mantener con agua limpia y fresca en florero.',
      'Evitar la exposición al sol directo.'
    ],
    featured: true,
  },
  {
    id: 'latidos-02',
    name: 'Bouquet Suspiros en Flor',
    category: 'Latidos en Flor',
    subEdition: 'Mini Rosas Fucsia & Margaritas',
    occasion: 'Citas & Romance',
    description: 'Composición tierna y luminosa elaborada con mini rosas fucsia radiantes, margaritas frescas y toques botánicos en papel seda boutique con lazo Rosanfer.',
    price: 120.0,
    stock: 14,
    imageUrl: 'https://files.catbox.moe/v4pler.jpg',
    tags: ['Nuevo'],
    stemCount: 'Mini Rosas Fucsia, Margaritas & Follaje',
    careTips: [
      'Renovar agua a diario y mantener lejos de fuentes de calor.'
    ],
    featured: true,
  },

  // 3. GRADUACIÓN (3)
  {
    id: 'grad-01',
    name: 'Bouquet Graduado Triunfal',
    category: 'Graduación',
    subEdition: 'Hortensias Celestes & Birretes',
    occasion: 'Graduaciones',
    description: 'El diseño por excelencia para colaciones y grados académicos: majestuosas hortensias celestes, rosas de gala, mini birrete conmemorativo y lazo dorado de honor.',
    price: 145.0,
    originalPrice: 165.0,
    stock: 18,
    imageUrl: 'https://files.catbox.moe/bpqyd3.jpg',
    tags: ['Bestseller', 'Temporada'],
    stemCount: 'Hortensias Celestes + Rosas + Mini Birrete',
    careTips: [
      'Las hortensias requieren abundante agua fresca.',
      'Rociar levemente los pétalos con atomizador.'
    ],
    featured: true,
  },
  {
    id: 'grad-02',
    name: 'Bouquet Promoción Cum Laude',
    category: 'Graduación',
    subEdition: 'Agapantos & Margaritas',
    occasion: 'Graduaciones',
    description: 'Diseño solemne y elegante con agapantos azulados, margaritas puras y espigas doradas de honor para ceremonias de bachiller y título universitario.',
    price: 140.0,
    stock: 12,
    imageUrl: 'https://files.catbox.moe/5j9oqp.jpg',
    tags: ['Exclusivo'],
    stemCount: 'Agapantos, Margaritas y Espigas de honor',
    careTips: [
      'Colocar en florero con agua fresca y cortar tallos en diagonal.'
    ],
    featured: false,
  },
  {
    id: 'grad-03',
    name: 'Canasta Pequeños Graduados',
    category: 'Graduación',
    subEdition: 'Rosas Rosadas & Margaritas',
    occasion: 'Graduaciones',
    description: 'Canasta artesanal dulce y emotiva con rosas rosadas, margaritas frescas y cinta festiva, diseñada para graduaciones de primaria, secundaria y nidos.',
    price: 130.0,
    stock: 14,
    imageUrl: 'https://files.catbox.moe/t6t5iy.jpg',
    tags: ['Nuevo'],
    stemCount: 'Rosas Rosadas, Margaritas & Follaje',
    careTips: [
      'Hidratar la esponja floral con agua fría cada día.'
    ],
    featured: true,
  },

  // 4. SET NUPCIAL "SÍ ACEPTO" (1)
  {
    id: 'nupcial-01',
    name: 'Bouquet Nupcial Encanto Silvestre',
    category: 'Set Nupcial "Sí Acepto"',
    subEdition: 'Lisianthus & Rosas',
    occasion: 'Matrimonio',
    description: 'Exclusivo bouquet de novia en estilo fine art con lisianthus aterciopelados, rosas marfil importadas, flor de cera y caída ligera de eucalipto dólar con lazo de seda.',
    price: 185.0,
    originalPrice: 220.0,
    stock: 8,
    imageUrl: 'https://files.catbox.moe/bifl58.jpg',
    tags: ['Bestseller', 'Exclusivo'],
    stemCount: 'Bouquet de novia con flores importadas',
    careTips: [
      'Mantener en agua fresca y ambiente climatizado hasta la ceremonia.',
      'Proteger del sol directo y viento fuerte.'
    ],
    featured: true,
  },

  // 5. AMOR ETERNO (4)
  {
    id: 'eterno-01',
    name: 'Box Amor de Mamá con Girasol & Rosas',
    category: 'Amor Eterno',
    subEdition: 'Girasol & Rosas',
    occasion: 'Amor Infinito',
    description: 'Caja sombrerera de lujo con un imponente girasol andino rodeado de rosas rojas de exportación y flores de temporada. El regalo que ilumina el corazón incondicional de mamá.',
    price: 145.0,
    originalPrice: 165.0,
    stock: 15,
    imageUrl: 'https://files.catbox.moe/q5edum.jpg',
    tags: ['Bestseller', 'Temporada'],
    stemCount: 'Girasol andino central + Rosas rojas',
    careTips: [
      'Agregar media taza de agua fresca a la base floral cada 24 horas.'
    ],
    featured: true,
  },
  {
    id: 'eterno-02',
    name: 'Box Mamá Fortaleza & Rosas Bicolor',
    category: 'Amor Eterno',
    subEdition: 'Rosas Bicolor',
    occasion: 'Aniversarios',
    description: 'Arreglo en caja boutique con elegantes rosas bicolor que expresan admiración, fuerza y ternura eterna para mamá o un ser querido especial.',
    price: 135.0,
    stock: 12,
    imageUrl: 'https://files.catbox.moe/il2e00.jpg',
    tags: ['Nuevo'],
    stemCount: 'Rosas Bicolor & Follaje fino',
    careTips: [
      'Mantener en ambiente seco y fresco, hidratando la base diariamente.'
    ],
    featured: true,
  },
  {
    id: 'eterno-03',
    name: 'Canasta Romance Iluminado',
    category: 'Amor Eterno',
    subEdition: 'Rosas Rojas & Alstroemerias',
    occasion: 'Citas & Romance',
    description: 'Hermosa canasta artesanal cargada de rosas rojas intensas, alstroemerias y follaje fresco con dedicatoria personalizada para avivar el romance y la pasión.',
    price: 130.0,
    stock: 14,
    imageUrl: 'https://files.catbox.moe/s8nwo7.jpg',
    tags: ['Oferta'],
    stemCount: 'Rosas Rojas selectas, Alstroemerias & Helecho',
    careTips: [
      'Hidratar la esponja floral con agua limpia a diario.'
    ],
    featured: false,
  },
  {
    id: 'eterno-04',
    name: 'Bouquet Pasión Terciopelo',
    category: 'Amor Eterno',
    subEdition: 'Rosas Rojas & Eucalipto',
    occasion: 'Citas & Romance',
    description: 'Bouquet de alta gama con rosas rojas de pétalo aterciopelado de exportación y follaje fresco de eucalipto aromático en papel floral de lujo.',
    price: 155.0,
    stock: 16,
    imageUrl: 'https://files.catbox.moe/xxszjh.jpg',
    tags: ['Exclusivo', 'Bestseller'],
    stemCount: '24 Rosas rojas & Eucalipto aromático',
    careTips: [
      'Cortar tallos en ángulo cada dos días y mantener con agua fresca.'
    ],
    featured: true,
  },

  // 6. PRIMAVERA PARA TI (3)
  {
    id: 'primavera-01',
    name: 'Box Jardín de Abejitas',
    category: 'Primavera Para Ti',
    subEdition: 'Rosas Pastel & Flores Silvestres',
    occasion: 'Agradecimiento',
    description: 'Alegre caja decorativa con rosas en suaves tonos pastel, flor silvestre primaveral y toques botánicos que transmiten frescura, dulzura y vitalidad.',
    price: 135.0,
    stock: 14,
    imageUrl: 'https://files.catbox.moe/i5dxev.jpg',
    tags: ['Nuevo'],
    stemCount: 'Rosas Pastel & Silvestres de estación',
    careTips: [
      'Hidratar con media taza de agua cada mañana.'
    ],
    featured: true,
  },
  {
    id: 'primavera-02',
    name: 'Bouquet Sol Andino & Rosas Rojas',
    category: 'Primavera Para Ti',
    subEdition: 'Girasol & Alstroemerias',
    occasion: 'Detalle Cotidiano',
    description: 'Contraste imponente entre la energía del girasol andino y la elegancia de las rosas rojas cusqueñas, acompañado de alstroemerias y eucalipto fresco.',
    price: 150.0,
    originalPrice: 170.0,
    stock: 18,
    imageUrl: 'https://files.catbox.moe/rzv125.jpg',
    tags: ['Bestseller', 'Temporada'],
    stemCount: 'Girasoles + Rosas Rojas + Alstroemerias',
    careTips: [
      'Los girasoles beben bastante agua; mantener el florero bien abastecido.'
    ],
    featured: true,
  },
  {
    id: 'primavera-03',
    name: 'Canasta Ovejitas Campestres',
    category: 'Primavera Para Ti',
    subEdition: 'Crisantemos & Margaritas',
    occasion: 'Ternura',
    description: 'Canasta campestre rebosante de crisantemos esponjosos y margaritas tiernas que transmiten calidez, pureza y alegría primaveral.',
    price: 130.0,
    stock: 15,
    imageUrl: 'https://files.catbox.moe/oh2l33.jpg',
    tags: ['Temporada'],
    stemCount: 'Crisantemos blancos & Margaritas',
    careTips: [
      'Hidratar con agua fresca y mantener en lugar fresco.'
    ],
    featured: false,
  },
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-01',
    productId: 'eterno-01',
    productName: 'Box Amor de Mamá con Girasol & Rosas',
    type: 'entrada',
    quantity: 15,
    reason: 'Recepción de lote fresco de girasoles y rosas de exportación',
    staffName: 'Andrea Florista',
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'mov-02',
    productId: 'latidos-01',
    productName: 'Bouquet Latido Dulce',
    type: 'entrada',
    quantity: 20,
    reason: 'Armado inicial de ramos con rosas bicolor y flores silvestres',
    staffName: 'Rodrigo Almacén',
    date: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'mov-03',
    productId: 'primavera-01',
    productName: 'Box Jardín de Abejitas',
    type: 'salida',
    quantity: 1,
    reason: 'Control de calidad y fotografía para vitrina',
    staffName: 'Andrea Florista',
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'mov-04',
    productId: 'grad-01',
    productName: 'Bouquet Graduado Triunfal',
    type: 'entrada',
    quantity: 12,
    reason: 'Producción de bouquets para ceremonia de graduación',
    staffName: 'Gerencia Rosanfer',
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export const INITIAL_PROMO: PromoConfig = {
  isEnabled: true,
  title: '¡Llegó la Temporada de Flores Amarillas!',
  subtitle: 'Celebra este mes con nuestros exclusivos ramos de girasoles andinos, rosas de exportación y flores selectas en Cusco. ¡Regala luz, alegría y amor!',
  badge: '🌻 Especial Temporada - Flores Amarillas',
  driveImageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80',
  ctaText: 'Ver Flores Amarillas',
  categoryRedirect: 'Festivos',
};

export const INITIAL_SETTINGS: BoutiqueSettings = {
  whatsappNumber: '51906800626',
  storeName: 'Rosanfer Florería',
  storeAddress: 'Atención Exclusiva con Envío a Domicilio en todo Cusco',
  storeCity: 'Cusco, Perú',
  openingHours: 'Lunes a Sábado: 8:00 AM - 8:30 PM | Domingo: 8:30 AM - 3:00 PM',
  defaultDeliveryFee: 12.0,
  yapeNumber: '961 203 577',
  yapeHolder: 'Rosanfer Florería / Andrea V.',
  bcpAccount: '',
  interbankAccount: '',
};

export const INITIAL_SOCIAL_POSTS: SocialVideoPost[] = [
  {
    id: 'social-1',
    platform: 'tiktok',
    title: 'Ovejitas en la pradera 🐑🐑🌳',
    description: 'Nuestra esencia y momentos en vivo en el campo y taller floral ✨ @rosanfer14 #TikTokPeru #Rosanfer #Cusco',
    url: 'https://www.tiktok.com/@rosanfer14/video/7677590657304628500',
    videoId: '7677590657304628500',
    thumbnailUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
    authorHandle: '@rosanfer14',
    authorName: 'Rosanfer Florería Cusco',
    isActive: true,
    isPinned: true,
    order: 1,
  },
  {
    id: 'social-2',
    platform: 'tiktok',
    title: 'Momento de la Entrega Sorpresa en San Blas 🛵🎁',
    description: 'Nuestra misión: entregar sonrisas y momentos inolvidables. La reacción de la cumpleañera no tiene precio 🥹💐 #DeliveryCusco #SorpresasCusco',
    url: 'https://www.tiktok.com/@rosanfer14/video/7350123456789012346',
    videoId: '7350123456789012346',
    thumbnailUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    authorHandle: '@rosanfer14',
    authorName: 'Rosanfer Florería Cusco',
    isActive: true,
    isPinned: false,
    order: 2,
  },
  {
    id: 'social-3',
    platform: 'tiktok',
    title: 'Llegaron Girasoles Gigantes y Rosas de Exportación 🌻🌹',
    description: 'Combinación primaveral en bases de cerámica artesanal con lazo de lino. ¿Cuál es tu favorito? #GirasolesCusco #Rosas #Rosanfer',
    url: 'https://www.tiktok.com/@rosanfer14/video/7350123456789012347',
    videoId: '7350123456789012347',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    authorHandle: '@rosanfer14',
    authorName: 'Rosanfer Florería Cusco',
    isActive: true,
    isPinned: false,
    order: 3,
  },
  {
    id: 'social-4',
    platform: 'instagram',
    title: 'Detalle de Orquídeas Phalaenopsis & Tarjeta Caligrafiada 💌',
    description: 'El arte de las palabras: escribimos tu dedicatoria a mano en papel couché sellado con lacre. #OrquideasCusco #DetallesFlorales',
    url: 'https://www.instagram.com/reel/rosanfer.floreria',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    authorHandle: '@rosanfer14',
    authorName: 'Rosanfer Florería Cusco',
    isActive: true,
    isPinned: false,
    order: 4,
  },
];

