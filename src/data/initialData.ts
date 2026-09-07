import { Product, Order, InventoryMovement, PromoConfig, BoutiqueSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // Citas & Romance
  {
    id: 'romance-01',
    name: 'Bouquet Romance Pasión Imperial',
    category: 'Citas & Romance',
    occasion: 'Citas & Romance',
    description: 'Rosas rojas terciopelo de tallo largo con astilbe rosado, hipericum y follaje de eucalipto aromático en envoltura de seda negra con lazo cobrizo Rosanfer.',
    price: 165.0,
    originalPrice: 190.0,
    stock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    tags: ['Bestseller', 'Exclusivo'],
    stemCount: '24 Rosas rojas seleccionadas',
    careTips: [
      'Colocar en agua fresca con hielo suave.',
      'Cortar 1 cm de tallo en ángulo cada dos días.',
      'Conservar en ambiente fresco alejado de fuentes de calor.'
    ],
    featured: true,
  },
  {
    id: 'romance-02',
    name: 'Box Cita Inolvidable & Bombones',
    category: 'Citas & Romance',
    occasion: 'Citas & Romance',
    description: 'Exclusiva sombrerera artesanal con rosas rojas y tonos blush en degradé, acompañada de bombones finos y tarjeta caligrafiada para citas o aniversarios.',
    price: 180.0,
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1200&q=80',
    tags: ['Nuevo'],
    stemCount: '18 Rosas + Bombones finos',
    careTips: [
      'Hidratar la esponja floral interna cada 24 horas con media taza de agua fresca.'
    ],
    featured: true,
  },

  // Graduaciones & Logros
  {
    id: 'grad-01',
    name: 'Bouquet Triunfo & Honor (Girasoles & Lirios)',
    category: 'Graduaciones',
    occasion: 'Graduaciones',
    description: 'El diseño preferido para colaciones y graduaciones en Cusco (UNSAAC, UAC, Andina). Girasoles andinos resplandecientes, lirios blancos, eucalipto fresco y cinta dorada de graduación.',
    price: 135.0,
    originalPrice: 155.0,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80',
    tags: ['Bestseller', 'Temporada'],
    stemCount: '8 Girasoles grandes + Lirios y follaje',
    careTips: [
      'Los girasoles beben abundante agua; mantener el florero lleno.',
      'Cortar 2 cm del tallo al recibir el arreglo.'
    ],
    featured: true,
  },
  {
    id: 'grad-02',
    name: 'Ramillete Éxito & Promoción',
    category: 'Graduaciones',
    occasion: 'Graduaciones',
    description: 'Composición vibrante de rosas amarillas de la prosperidad, mini girasoles y astromelias blancas, diseñado para lucir en fotos de toga y celebraciones académicas.',
    price: 110.0,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    tags: ['Nuevo'],
    stemCount: '16 Tallos seleccionados',
    careTips: [
      'Mantener alejado del sol directo.',
      'Cambiar el agua a diario.'
    ],
    featured: false,
  },

  // Cumpleaños & Celebración
  {
    id: 'bday-01',
    name: 'Explosión Primaveral de Cumpleaños',
    category: 'Cumpleaños',
    occasion: 'Cumpleaños',
    description: 'Diseño floral festivo y alegre con gerberas multicolores, rosas frescas, liliums perfumados y toques de gypsophila. Incluye tarjeta con dedicatoria de feliz cumpleaños.',
    price: 140.0,
    originalPrice: 160.0,
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=1200&q=80',
    tags: ['Bestseller', 'Temporada'],
    stemCount: '25 Tallos multicolor',
    careTips: [
      'Retirar flores que marchiten primero para dar fuerza a los botones.',
      'Renovar agua cada 48 horas.'
    ],
    featured: true,
  },
  {
    id: 'bday-02',
    name: 'Box Festivo Celebración Rosanfer',
    category: 'Cumpleaños',
    occasion: 'Cumpleaños',
    description: 'Caja cilíndrica de diseño botánico con tulipanes amarillos y rosas rosadas, hortensias y follaje fino para iluminar el día de cumpleaños.',
    price: 175.0,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80',
    tags: ['Nuevo', 'Exclusivo'],
    stemCount: 'Composición floral en box',
    careTips: [
      'Regar suavemente la base floral cada 2 días con agua fría.'
    ],
    featured: false,
  },

  // Condolencias & Homenaje (Sutil, solemne y formal)
  {
    id: 'peace-01',
    name: 'Arreglo Serenidad & Paz (Lirios Blancos & Rosas)',
    category: 'Condolencias & Homenaje',
    occasion: 'Condolencias & Homenaje',
    description: 'Sutil y solemne composición en base de cerámica con lirios orientales blancos, rosas marfil y follaje verde bosque. Expresa respeto, pésame y consuelo con la mayor delicadeza.',
    price: 155.0,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1589244159943-460088ed5c92?auto=format&fit=crop&w=1200&q=80',
    tags: ['Exclusivo'],
    stemCount: '20 Tallos blancos seleccionados',
    careTips: [
      'Base con esponja floral hidratada; humedecer cada día con agua fresca.'
    ],
    featured: true,
  },
  {
    id: 'peace-02',
    name: 'Corona Floral Homenaje Eterno',
    category: 'Condolencias & Homenaje',
    occasion: 'Condolencias & Homenaje',
    description: 'Corona floral artesanal montada sobre atril de madera, elaborada con rosas blancas de exportación, claveles de paz, liliums y follaje solemne. Incluye cinta caligrafiada de condolencias.',
    price: 240.0,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1200&q=80',
    tags: ['Exclusivo'],
    stemCount: 'Corona con atril + cinta formal',
    careTips: [
      'Montaje artesanal con hidratación continua para ceremonias y velatorios.'
    ],
    featured: false,
  },
  {
    id: 'peace-03',
    name: 'Pedestal Solemne de Recuerdo y Paz',
    category: 'Condolencias & Homenaje',
    occasion: 'Condolencias & Homenaje',
    description: 'Arreglo floral estilizado de pie con gladiolos blancos, lirios orientales de paz y follaje de eucalipto andino. Presencia sobria y reconfortante para homenajes y despedidas.',
    price: 210.0,
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
    tags: ['Exclusivo'],
    stemCount: 'Pedestal floral con cinta personalizada',
    careTips: [
      'Entrega solemne y puntual en el lugar indicado en Cusco y alrededores.'
    ],
    featured: false,
  },

  // Tulipanes Holandeses
  {
    id: 'tulip-01',
    name: 'Tulipanes Holandeses Sinfonía',
    category: 'Tulipanes',
    occasion: 'Citas & Romance',
    description: 'Espectacular ramillete de tulipanes holandeses en tonos amarillo radiante, naranja atardecer y rosa pastel, acompañados de follaje fresco de eucalipto.',
    price: 145.0,
    originalPrice: 170.0,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=80',
    tags: ['Bestseller', 'Temporada'],
    stemCount: '20 Tallos seleccionados',
    careTips: [
      'Colocar en agua muy fría con cubitos de hielo para prolongar su turgencia.',
      'Cortar 1 cm de tallo en ángulo cada dos días.',
      'Mantener alejado de fuentes directas de calor y frutas maduras.'
    ],
    featured: true,
  },
  {
    id: 'tulip-02',
    name: 'Tulipanes Dulce Amanecer',
    category: 'Tulipanes',
    occasion: 'Cumpleaños',
    description: 'Armoniosa combinación de tulipanes rosa blush y blanco marfil envueltos en papel coreano satinado y lazo de seda en tono terracota Rosanfer.',
    price: 125.0,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
    tags: ['Nuevo'],
    stemCount: '15 Tallos premium',
    careTips: [
      'Requiere agua fresca diaria.',
      'Evitar la exposición al sol directo de mediodía.'
    ],
    featured: true,
  },

  // Rosas de Lujo
  {
    id: 'rose-01',
    name: 'Ramo Velvet Garden de Rosas',
    category: 'Rosas de Lujo',
    occasion: 'Citas & Romance',
    description: 'Exclusivas rosas jardín en tonos rosa empolvado, capuchino y melocotón suave, entrelazadas con flor de cera y follaje silvestre aromático.',
    price: 185.0,
    originalPrice: 210.0,
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
    tags: ['Bestseller', 'Exclusivo'],
    stemCount: '24 Rosas Garden premium',
    careTips: [
      'Retirar hojas sumergidas en el agua para evitar bacterias.',
      'Agregar el conservante floral incluido en el paquete.',
      'Cortar tallos en bisel con tijera afilada.'
    ],
    featured: true,
  },
  {
    id: 'rose-02',
    name: 'Rosa Eterna Rosanfer en Cúpula',
    category: 'Rosas de Lujo',
    occasion: 'Aniversarios',
    description: 'Rosa preservada 100% natural con acabado aperlado en base de madera nogal y cúpula de cristal templado. Dura más de 3 años sin agua.',
    price: 135.0,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=1200&q=80',
    tags: ['Exclusivo'],
    stemCount: '1 Flor preservada de lujo',
    careTips: [
      'No necesita agua ni luz solar.',
      'Mantener dentro de la cúpula para proteger del polvo.'
    ],
    featured: false,
  },

  // Ramos de Autor
  {
    id: 'bouquet-01',
    name: 'Bouquet Ranúnculos & Eucalipto Silvestre',
    category: 'Ramos de Autor',
    occasion: 'Agradecimiento',
    description: 'Inspirado en nuestro taller botánico: voluptuosos ranúnculos en capas color durazno, lavanda silvestre y eucalipto cinerea en jarrón artesanal.',
    price: 160.0,
    stock: 9,
    imageUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1200&q=80',
    tags: ['Nuevo', 'Temporada'],
    stemCount: '28 Tallos mixtos',
    careTips: [
      'Renovar el agua cada 48 horas.',
      'Rociar sutilmente los pétalos con spray de agua limpia.'
    ],
    featured: true,
  },

  // Flores Preservadas
  {
    id: 'dried-01',
    name: 'Arreglo Boho de Flores Preservadas',
    category: 'Flores Preservadas',
    occasion: 'General',
    description: 'Composición botánica duradera con pampas grass, ruscus blanqueado, trigo dorado, eucalipto preserved y flores secas de lavanda.',
    price: 140.0,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1200&q=80',
    tags: ['Exclusivo'],
    stemCount: 'Composición duradera (+2 años)',
    careTips: [
      'No regar. Conservar en ambiente seco.',
      'Limpiar el polvo con aire tibio o plumero suave.'
    ],
    featured: false,
  },

  // Merchandising & Regalos
  {
    id: 'merch-01',
    name: 'Florero de Cerámica Sage Rosanfer',
    category: 'Merchandising & Regalos',
    occasion: 'General',
    description: 'Florero de autor fabricado a mano en cerámica mate color verde salvia (#5C715E) con grabado en relieve del emblema botánico Rosanfer Florería.',
    price: 65.0,
    originalPrice: 80.0,
    stock: 11,
    imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Bestseller', 'Exclusivo'],
    careTips: ['Lavar a mano con esponja suave.', 'Apto para arreglos con agua.'],
    featured: true,
  },
  {
    id: 'merch-02',
    name: 'Delantal de Lino Artesanal Rosanfer',
    category: 'Merchandising & Regalos',
    occasion: 'General',
    description: 'El icónico delantal de lino verde salvia utilizado por nuestros floristas maestros. Bordado con hilo metalizado cobrizo y doble bolsillo porta-tijeras.',
    price: 85.0,
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=1200&q=80',
    tags: ['Exclusivo'],
    careTips: ['Lavar en agua fría, planchado a temperatura media.'],
    featured: false,
  },
  {
    id: 'merch-03',
    name: 'Luxury Botanical Gift Box & Tijeras de Poda',
    category: 'Merchandising & Regalos',
    occasion: 'General',
    description: 'Caja rígida craft con sello de lacre Rosanfer, tijeras de poda japonesas en acabado bronce bruñido, rocío botánico aromático y tarjeta de felicitación.',
    price: 95.0,
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    tags: ['Nuevo'],
    featured: false,
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'RF-2401',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    customerName: 'María Fernanda Gómez',
    customerPhone: '+51 984 234 567',
    deliveryType: 'delivery',
    address: 'Urb. Magisterio 2da Etapa B-4',
    district: 'Wanchaq - Cusco',
    reference: 'Frente al parque, casa portón blanco',
    deliveryDate: 'Hoy',
    deliveryTimeSlot: 'Tarde (14:00 - 18:30)',
    dedicationCard: {
      enabled: true,
      to: 'Mamá Carmen',
      from: 'Mafe y Mateo',
      message: '¡Feliz día mamá! Gracias por llenar nuestros días de tanto amor y bendiciones.',
    },
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_PRODUCTS[12], quantity: 1 },
    ],
    subtotal: 230.0,
    deliveryFee: 12.0,
    total: 242.0,
    status: 'En camino',
    paymentMethod: 'WhatsApp / Transferencia Yape',
    notes: 'Entregar con cuidado, flores frescas',
  },
  {
    id: 'ord-102',
    orderNumber: 'RF-2402',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    customerName: 'Carlos Eduardo Mendoza',
    customerPhone: '+51 984 555 123',
    deliveryType: 'pickup',
    deliveryDate: 'Hoy',
    deliveryTimeSlot: 'Tarde (16:30 hrs)',
    dedicationCard: {
      enabled: true,
      to: 'Valeria',
      from: 'Carlos',
      message: 'Por muchos años más juntos caminando de la mano. Feliz aniversario amor.',
    },
    items: [
      { product: INITIAL_PRODUCTS[2], quantity: 1 },
    ],
    subtotal: 135.0,
    deliveryFee: 0.0,
    total: 135.0,
    status: 'En preparación',
    paymentMethod: 'WhatsApp / Plin',
  },
  {
    id: 'ord-103',
    orderNumber: 'RF-2403',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    customerName: 'Luciana Valdivia',
    customerPhone: '+51 984 889 201',
    deliveryType: 'delivery',
    address: 'Av. De la Infancia 312',
    district: 'Wanchaq',
    deliveryDate: 'Mañana',
    deliveryTimeSlot: 'Mañana (09:00 - 13:00)',
    items: [
      { product: INITIAL_PRODUCTS[4], quantity: 1 },
    ],
    subtotal: 140.0,
    deliveryFee: 12.0,
    total: 152.0,
    status: 'Nuevo',
    paymentMethod: 'WhatsApp / Transferencia BCP',
  },
  {
    id: 'ord-104',
    orderNumber: 'RF-2404',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    customerName: 'Rodrigo Alarcón',
    customerPhone: '+51 984 411 909',
    deliveryType: 'delivery',
    address: 'Calle Santa Clara 450',
    district: 'Centro Histórico - Cusco',
    deliveryDate: 'Ayer',
    deliveryTimeSlot: 'Tarde',
    items: [
      { product: INITIAL_PRODUCTS[6], quantity: 1 },
    ],
    subtotal: 155.0,
    deliveryFee: 12.0,
    total: 167.0,
    status: 'Entregado',
    paymentMethod: 'WhatsApp / Efectivo contraentrega',
  },
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-01',
    productId: 'tulip-01',
    productName: 'Tulipanes Holandeses Sinfonía',
    type: 'entrada',
    quantity: 30,
    reason: 'Importación directa - Lote fresco de Holanda',
    staffName: 'Andrea Florista',
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'mov-02',
    productId: 'merch-01',
    productName: 'Florero de Cerámica Sage Rosanfer',
    type: 'entrada',
    quantity: 15,
    reason: 'Recepción de pedido de alfarería artesanal',
    staffName: 'Rodrigo Almacén',
    date: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'mov-03',
    productId: 'rose-01',
    productName: 'Ramo Velvet Garden de Rosas',
    type: 'salida',
    quantity: 2,
    reason: 'Merma por control de calidad (pétalos magullados en transporte)',
    staffName: 'Andrea Florista',
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'mov-04',
    productId: 'merch-02',
    productName: 'Delantal de Lino Artesanal Rosanfer',
    type: 'salida',
    quantity: 1,
    reason: 'Dotación de uniforme para personal nuevo',
    staffName: 'Gerencia Rosanfer',
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export const INITIAL_PROMO: PromoConfig = {
  isEnabled: true,
  title: 'El amor viene en forma de Tulipán',
  subtitle: 'Descubre nuestra exclusiva colección de tulipanes holandeses. Elige tus colores favoritos con 15% OFF en tu primer pedido.',
  badge: 'Temporada Floral 2026',
  couponCode: 'TULIPAN15',
  driveImageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1000&q=80',
  ctaText: 'Ver Colección de Tulipanes',
  categoryRedirect: 'Tulipanes',
};

export const INITIAL_SETTINGS: BoutiqueSettings = {
  whatsappNumber: '51984234567',
  storeName: 'Rosanfer Florería',
  storeAddress: 'Av. La Cultura 1420 (frente a UNSAAC), Magisterio',
  storeCity: 'Cusco, Perú',
  openingHours: 'Lunes a Sábado: 8:00 AM - 8:30 PM | Domingo: 8:30 AM - 3:00 PM',
  defaultDeliveryFee: 12.0,
};
