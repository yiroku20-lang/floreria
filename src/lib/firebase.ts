import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDoc,
  Firestore,
  setLogLevel,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import type {
  Product,
  Order,
  BoutiqueSettings,
  PromoConfig,
  SocialVideoPost,
  InventoryMovement,
  ProductCategory,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  INITIAL_PROMO,
  INITIAL_SOCIAL_POSTS,
  INITIAL_MOVEMENTS,
} from '../data/initialData';
import { transformDriveUrl, BOUTIQUE_FALLBACK_IMAGE } from '../utils/driveUtils';

// Silenciar logs de advertencia de transporte interno de Firestore (reconexiones y long-polling)
setLogLevel('silent');

// Identificador de la base de datos de Firestore
export const FIRESTORE_DATABASE_ID = "ai-studio-rosanferflorerab-abf1e0af-8ef8-427d-8120-7ccfcdb317b5";

// Configuración completa de Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyAZwuG_XFAQ5oLuwcsuZ6M-IQ28pGquDWM",
  authDomain: "wired-signifier-q40ks.firebaseapp.com",
  projectId: "wired-signifier-q40ks",
  storageBucket: "wired-signifier-q40ks.firebasestorage.app",
  messagingSenderId: "242162152938",
  appId: "1:242162152938:web:00fb951d89cd75411bae93",
  firestoreDatabaseId: FIRESTORE_DATABASE_ID,
};

// Log de diagnóstico al montar la aplicación
console.log("[Firebase] Conectando a:", firebaseConfig.projectId, "BD:", FIRESTORE_DATABASE_ID);

// Inicialización de la aplicación Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

// Inicialización de la base de datos Firestore con auto-detección resiliente de transporte
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    },
    FIRESTORE_DATABASE_ID
  );
} catch {
  // En caso de que ya haya sido inicializado previamente en el ciclo de vida
  firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
}

// Exportamos las referencias apuntando de manera consistente a la base de datos oficial
export const db: Firestore = firestoreInstance;
export const dbNamed: Firestore = firestoreInstance;
export const dbDefault: Firestore = firestoreInstance;
export const activeDb: Firestore = firestoreInstance;

// Nombres de colecciones y documentos
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CONFIG: 'config',
  MOVEMENTS: 'movements',
  SETTINGS: 'settings',
  PROMO: 'promo',
};

export const DOCS = {
  SETTINGS: 'boutique_settings',
  PROMO: 'promo_config',
  SOCIAL: 'social_showcase',
};

/**
 * Normaliza cualquier documento de Firestore (en español o inglés) al formato estándar Product
 */
export function normalizeProductData(docId: string, raw: any): Product {
  if (!raw) return { ...INITIAL_PRODUCTS[0], id: docId };

  const name = raw.name || raw.nombre || raw.title || raw.titulo || 'Arreglo Floral';
  
  // Precio
  let price = 0;
  const rawPrice = raw.price !== undefined ? raw.price : raw.precio;
  if (typeof rawPrice === 'number') {
    price = isNaN(rawPrice) ? 0 : rawPrice;
  } else if (typeof rawPrice === 'string') {
    const parsed = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
    price = isNaN(parsed) ? 0 : parsed;
  }

  // Precio Original
  let originalPrice: number | undefined = undefined;
  const rawOrigPrice = raw.originalPrice !== undefined ? raw.originalPrice : raw.precioOriginal;
  if (rawOrigPrice !== undefined) {
    const parsed = typeof rawOrigPrice === 'number' ? rawOrigPrice : parseFloat(String(rawOrigPrice).replace(/[^0-9.]/g, ''));
    originalPrice = isNaN(parsed) ? undefined : parsed;
  }

  // Stock
  let stock = 10;
  const rawStock = raw.stock !== undefined ? raw.stock : raw.cantidad;
  if (typeof rawStock === 'number') {
    stock = rawStock;
  } else if (typeof rawStock === 'string') {
    stock = parseInt(rawStock, 10) || 10;
  }

  // Imagen: Soporta driveImageUrl, imageUrl, imagen, foto, url, image
  const rawImg =
    raw.imageUrl ||
    raw.driveImageUrl ||
    raw.imagen ||
    raw.foto ||
    raw.image ||
    raw.url ||
    raw.link ||
    '';
  
  const cleanImg = transformDriveUrl(rawImg) || rawImg || BOUTIQUE_FALLBACK_IMAGE;

  // Categoría
  let category: ProductCategory = 'Festivos';
  const rawCat = (raw.category || raw.categoria || '').trim();
  const validCategories: ProductCategory[] = [
    'Festivos',
    'Latidos en Flor',
    'Graduación',
    'Set Nupcial "Sí Acepto"',
    'Amor Eterno',
    'Primavera Para Ti',
  ];
  const matched = validCategories.find(
    (c) => c.toLowerCase() === rawCat.toLowerCase()
  );
  if (matched) {
    category = matched;
  } else if (rawCat) {
    category = rawCat as ProductCategory;
  }

  return {
    id: raw.id || docId,
    name,
    category,
    subEdition: raw.subEdition || raw.subEdicion || raw.subtitulo || raw.subtitle || '',
    description: raw.description || raw.descripcion || raw.detalle || '',
    price,
    originalPrice,
    stock,
    imageUrl: cleanImg,
    originalImageUrl: raw.originalImageUrl || rawImg,
    framing: raw.framing,
    tags: Array.isArray(raw.tags)
      ? raw.tags
      : raw.tag
      ? [raw.tag]
      : ['Bestseller'],
    careTips: Array.isArray(raw.careTips) ? raw.careTips : undefined,
    stemCount: raw.stemCount || raw.tallos || raw.cantidadTallos || '',
    featured: raw.featured !== undefined ? Boolean(raw.featured) : true,
    occasion: raw.occasion || raw.ocasion || '',
  };
}

// --- SERVICIOS DE SINCRONIZACIÓN EN TIEMPO REAL ---

/**
 * Escucha cambios en tiempo real del catálogo de productos con fallback resiliente
 */
export function subscribeToProducts(
  callback: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, COLLECTIONS.PRODUCTS);
    return onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty && !snapshot.metadata.fromCache) {
          console.log(
            `[Firebase] Colección 'products' en ${FIRESTORE_DATABASE_ID} está vacía. Sembrando catálogo inicial...`
          );
          await seedInitialProducts(db);
          callback(INITIAL_PRODUCTS);
        } else if (!snapshot.empty) {
          console.log(`[Firebase] ${snapshot.size} productos cargados desde Firestore.`);
          const prods: Product[] = [];
          snapshot.forEach((docSnap) => {
            prods.push(normalizeProductData(docSnap.id, docSnap.data()));
          });
          callback(prods);
        }
      },
      (err) => {
        console.warn(`[Firebase] Aviso en suscripción a 'products':`, err?.code || err?.message || err);
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    console.warn('[Firebase] Fallo al iniciar onSnapshot en products:', e);
    if (onError) onError(e);
    return () => {};
  }
}

/**
 * Escucha cambios en tiempo real de los pedidos
 */
export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, COLLECTIONS.ORDERS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          callback([]);
          return;
        }

        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          const raw = docSnap.data() as Partial<Order>;
          if (raw) {
            // Ignorar documentos fantasma o vacíos
            const isGhost = !raw.customerName && (!raw.items || raw.items.length === 0) && !raw.total;
            if (isGhost) return;

            const subtotal = typeof raw.subtotal === 'number' && !isNaN(raw.subtotal) ? raw.subtotal : (Number(raw.subtotal) || 0);
            const deliveryFee = typeof raw.deliveryFee === 'number' && !isNaN(raw.deliveryFee) ? raw.deliveryFee : (Number(raw.deliveryFee) || 0);
            const total = typeof raw.total === 'number' && !isNaN(raw.total) ? raw.total : (Number(raw.total) || (subtotal + deliveryFee));

            // Normalización defensiva de cada item del pedido
            const rawItems = Array.isArray(raw.items) ? raw.items : [];
            const safeItems = rawItems.map((it: any) => ({
              quantity: typeof it?.quantity === 'number' && it.quantity > 0 ? it.quantity : (Number(it?.quantity) || 1),
              product: {
                id: it?.product?.id || `prod-${Date.now()}`,
                name: it?.product?.name || 'Arreglo Floral',
                price: typeof it?.product?.price === 'number' && !isNaN(it?.product?.price) ? it.product.price : (Number(it?.product?.price) || 0),
                imageUrl: it?.product?.imageUrl || transformDriveUrl('https://files.catbox.moe/k3h54c.jpg') || BOUTIQUE_FALLBACK_IMAGE,
                category: it?.product?.category || 'Rosas',
                description: it?.product?.description || '',
                stock: typeof it?.product?.stock === 'number' ? it.product.stock : 10,
                tags: Array.isArray(it?.product?.tags) ? it.product.tags : [],
              },
              customFraming: it?.customFraming || undefined,
            }));

            orders.push({
              ...raw,
              id: raw.id || docSnap.id,
              orderNumber: raw.orderNumber || docSnap.id,
              customerName: raw.customerName || 'Cliente',
              customerPhone: raw.customerPhone || '',
              district: raw.district || '',
              address: raw.address || '',
              reference: raw.reference || '',
              deliveryDate: raw.deliveryDate || '',
              deliveryTimeSlot: raw.deliveryTimeSlot || '',
              deliveryType: raw.deliveryType || 'delivery',
              paymentMethod: raw.paymentMethod || 'Yape / Plin',
              notes: raw.notes || '',
              items: safeItems,
              dedicationCard: raw.dedicationCard?.enabled
                ? {
                    enabled: true,
                    to: raw.dedicationCard.to || '',
                    from: raw.dedicationCard.from || '',
                    message: raw.dedicationCard.message || '',
                  }
                : undefined,
              subtotal,
              deliveryFee,
              total,
              status: raw.status || 'Nuevo',
              createdAt: raw.createdAt || new Date().toISOString(),
            } as Order);
          }
        });
        orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        callback(orders);
      },
      (err) => {
        console.warn(`[Firebase] Aviso en suscripción a 'orders':`, err?.code || err?.message);
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    console.warn('[Firebase] Fallo al iniciar onSnapshot en orders:', e);
    if (onError) onError(e);
    return () => {};
  }
}

/**
 * Escucha cambios en la configuración de la boutique
 */
export function subscribeToSettings(
  callback: (settings: BoutiqueSettings) => void,
  onError?: (err: Error) => void
) {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, DOCS.SETTINGS);
    return onSnapshot(
      docRef,
      async (snapshot) => {
        const fromCache = snapshot.metadata.fromCache;
        if (snapshot.exists()) {
          const data = snapshot.data() as BoutiqueSettings;
          // Auto-actualizar si tiene los números de contacto/pago anteriores o la tarifa de 12 previa a la promoción
          if (
            data.whatsappNumber === '51989415220' ||
            data.yapeNumber === '989 415 220' ||
            data.yapeNumber === '989415220' ||
            data.defaultDeliveryFee === 12 ||
            data.defaultDeliveryFee === 12.0
          ) {
            const updated: BoutiqueSettings = {
              ...data,
              whatsappNumber: '51906800626',
              yapeNumber: '961 203 577',
              defaultDeliveryFee: 0,
              bcpAccount: '',
              interbankAccount: '',
            };
            setDoc(docRef, updated, { merge: true }).catch(() => {});
            callback(updated);
          } else {
            callback(data);
          }
        } else if (!fromCache) {
          try {
            await setDoc(docRef, INITIAL_SETTINGS);
          } catch (e) {
            console.warn('[Firebase] Aviso al inicializar settings en Firestore:', e);
          }
          callback(INITIAL_SETTINGS);
        }
      },
      (err) => {
        console.warn('[Firebase] Settings error:', err?.message);
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    console.warn('[Firebase] Error al suscribirse a settings:', e);
    if (onError) onError(e);
    return () => {};
  }
}

/**
 * Escucha cambios en el popup de promociones
 */
export function subscribeToPromo(
  callback: (promo: PromoConfig) => void,
  onError?: (err: Error) => void
) {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, DOCS.PROMO);
    return onSnapshot(
      docRef,
      async (snapshot) => {
        const fromCache = snapshot.metadata.fromCache;
        if (snapshot.exists()) {
          callback(snapshot.data() as PromoConfig);
        } else if (!fromCache) {
          try {
            await setDoc(docRef, INITIAL_PROMO);
          } catch (e) {
            console.warn('[Firebase] Aviso al inicializar promo en Firestore:', e);
          }
          callback(INITIAL_PROMO);
        }
      },
      (err) => {
        console.warn('[Firebase] Promo error:', err?.message);
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    console.warn('[Firebase] Error al suscribirse a promo:', e);
    if (onError) onError(e);
    return () => {};
  }
}

/**
 * Escucha cambios en la vitrina de redes sociales
 */
export function subscribeToSocialPosts(
  callback: (posts: SocialVideoPost[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, DOCS.SOCIAL);
    return onSnapshot(
      docRef,
      async (snapshot) => {
        const fromCache = snapshot.metadata.fromCache;
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback(data.posts || INITIAL_SOCIAL_POSTS);
        } else if (!fromCache) {
          try {
            await setDoc(docRef, { posts: INITIAL_SOCIAL_POSTS });
          } catch (e) {
            console.warn('[Firebase] Aviso al inicializar redes en Firestore:', e);
          }
          callback(INITIAL_SOCIAL_POSTS);
        }
      },
      (err) => {
        console.warn('[Firebase] Social posts error:', err?.message);
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    console.warn('[Firebase] Error al suscribirse a redes sociales:', e);
    if (onError) onError(e);
    return () => {};
  }
}

/**
 * Escucha cambios en movimientos de inventario
 */
export function subscribeToMovements(
  callback: (movements: InventoryMovement[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, COLLECTIONS.MOVEMENTS);
    return onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty && !snapshot.metadata.fromCache) {
          console.log('[Firebase] Colección de movimientos vacía. Respaldando movimientos iniciales en Firestore...');
          try {
            const batch = writeBatch(db);
            INITIAL_MOVEMENTS.forEach((m) => {
              batch.set(doc(db, COLLECTIONS.MOVEMENTS, m.id), m);
            });
            await batch.commit();
            console.log('[Firebase] ✅ Movimientos de inventario respaldados en Firestore');
          } catch (seedErr) {
            console.warn('[Firebase] Aviso al sembrar movimientos:', seedErr);
          }
          callback(INITIAL_MOVEMENTS);
        } else if (!snapshot.empty) {
          const movements: InventoryMovement[] = [];
          snapshot.forEach((docSnap) => {
            movements.push(docSnap.data() as InventoryMovement);
          });
          movements.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          callback(movements);
        }
      },
      (err) => {
        console.warn('[Firebase] Movements error:', err?.message);
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    console.warn('[Firebase] Error al suscribirse a movimientos:', e);
    if (onError) onError(e);
    return () => {};
  }
}

// --- SERVICIOS DE GUARDADO Y ESCRITURA EN FIRESTORE ---

/**
 * Sanitiza y limpia el objeto de producto para asegurar que Firestore nunca reciba valores 'undefined'
 */
export function cleanProductForFirestore(product: Product): Record<string, any> {
  const price = typeof product.price === 'number' && !isNaN(product.price) ? product.price : (Number(product.price) || 0);
  const stock = typeof product.stock === 'number' && !isNaN(product.stock) ? Math.max(0, Math.floor(product.stock)) : 10;
  
  const clean: Record<string, any> = {
    id: product.id || `prod-${Date.now()}`,
    name: (product.name || 'Arreglo Floral').trim(),
    category: product.category || 'Festivos',
    price,
    stock,
    imageUrl: product.imageUrl || BOUTIQUE_FALLBACK_IMAGE,
    description: (product.description || '').trim(),
    featured: product.featured !== undefined ? Boolean(product.featured) : true,
    tags: Array.isArray(product.tags) && product.tags.length > 0 ? product.tags : ['Bestseller'],
  };

  if (product.subEdition && product.subEdition.trim()) {
    clean.subEdition = product.subEdition.trim();
  }
  if (product.occasion && product.occasion.trim()) {
    clean.occasion = product.occasion.trim();
  }
  if (product.stemCount && product.stemCount.trim()) {
    clean.stemCount = product.stemCount.trim();
  }
  if (typeof product.originalPrice === 'number' && !isNaN(product.originalPrice) && product.originalPrice > price) {
    clean.originalPrice = product.originalPrice;
  }
  if (product.originalImageUrl && product.originalImageUrl.trim()) {
    clean.originalImageUrl = product.originalImageUrl.trim();
  }
  if (product.framing && typeof product.framing === 'object') {
    clean.framing = {
      zoom: typeof product.framing.zoom === 'number' && !isNaN(product.framing.zoom) ? product.framing.zoom : 1,
      x: typeof product.framing.x === 'number' && !isNaN(product.framing.x) ? product.framing.x : 0,
      y: typeof product.framing.y === 'number' && !isNaN(product.framing.y) ? product.framing.y : 0,
      rotation: typeof product.framing.rotation === 'number' && !isNaN(product.framing.rotation) ? product.framing.rotation : 0,
    };
  }
  if (Array.isArray(product.careTips) && product.careTips.length > 0) {
    clean.careTips = product.careTips.filter((t) => typeof t === 'string' && t.trim().length > 0);
  }

  return clean;
}

/**
 * Sanitiza y limpia el objeto de configuración de la promoción/popup
 */
export function cleanPromoForFirestore(promo: PromoConfig): Record<string, any> {
  return {
    isEnabled: Boolean(promo.isEnabled),
    title: (promo.title || 'Bienvenida a Rosanfer Florería').trim(),
    subtitle: (promo.subtitle || '').trim(),
    badge: (promo.badge || '').trim(),
    driveImageUrl: promo.driveImageUrl || '',
    ctaText: (promo.ctaText || 'Ver Arreglos Florales').trim(),
    categoryRedirect: promo.categoryRedirect || 'Todos',
  };
}

/**
 * Guarda o actualiza un producto individual en Firestore
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    const payload = cleanProductForFirestore(product);
    const docRef = doc(activeDb, COLLECTIONS.PRODUCTS, payload.id);
    await setDoc(docRef, payload, { merge: true });
    console.log(`[Firebase] ✅ Producto "${payload.name}" guardado en Firestore.`);
  } catch (err) {
    console.warn('[Firebase] Error al guardar producto:', err);
    throw err;
  }
}

/**
 * Elimina un producto de Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    const docRef = doc(activeDb, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(docRef);
    console.log(`[Firebase] ✅ Producto ${productId} eliminado de Firestore.`);
  } catch (err) {
    console.warn('[Firebase] Error al eliminar producto:', err);
    throw err;
  }
}

/**
 * Guarda el lote completo de productos en Firestore
 */
export async function saveAllProductsToFirestore(products: Product[]): Promise<void> {
  try {
    await replaceAllProductsInFirestore(products, activeDb);
    console.log('[Firebase] ✅ Catálogo completo sincronizado con Firestore');
  } catch (err) {
    console.warn('[Firebase] Error al sincronizar productos completos:', err);
    throw err;
  }
}

/**
 * Sanitiza y limpia el objeto de pedido para asegurar que Firestore nunca reciba valores 'undefined'
 */
export function cleanOrderForFirestore(order: Order): Record<string, any> {
  const subtotal = typeof order.subtotal === 'number' && !isNaN(order.subtotal) ? order.subtotal : (Number(order.subtotal) || 0);
  const deliveryFee = typeof order.deliveryFee === 'number' && !isNaN(order.deliveryFee) ? order.deliveryFee : (Number(order.deliveryFee) || 0);
  const total = typeof order.total === 'number' && !isNaN(order.total) ? order.total : (Number(order.total) || (subtotal + deliveryFee));

  const safeItems = (Array.isArray(order.items) ? order.items : []).map((it) => ({
    quantity: typeof it?.quantity === 'number' && it.quantity > 0 ? it.quantity : 1,
    product: {
      id: it?.product?.id || `prod-${Date.now()}`,
      name: it?.product?.name || 'Arreglo Floral',
      price: typeof it?.product?.price === 'number' && !isNaN(it?.product?.price) ? it.product.price : (Number(it?.product?.price) || 0),
      imageUrl: it?.product?.imageUrl || '',
      category: it?.product?.category || 'Rosas',
      description: it?.product?.description || '',
      stock: typeof it?.product?.stock === 'number' ? it.product.stock : 10,
      tags: Array.isArray(it?.product?.tags) ? it.product.tags : [],
    },
    ...(it?.customFraming ? { customFraming: it.customFraming } : {}),
  }));

  const clean: Record<string, any> = {
    id: order.id,
    orderNumber: order.orderNumber || order.id,
    createdAt: order.createdAt || new Date().toISOString(),
    customerName: order.customerName || 'Cliente',
    customerPhone: order.customerPhone || '',
    deliveryType: order.deliveryType || 'delivery',
    address: order.address || '',
    district: order.district || '',
    reference: order.reference || '',
    deliveryDate: order.deliveryDate || '',
    deliveryTimeSlot: order.deliveryTimeSlot || '',
    paymentMethod: order.paymentMethod || 'Yape / Plin',
    status: order.status || 'Nuevo',
    notes: order.notes || '',
    subtotal,
    deliveryFee,
    total,
    items: safeItems,
  };

  if (order.dedicationCard && order.dedicationCard.enabled) {
    clean.dedicationCard = {
      enabled: true,
      to: order.dedicationCard.to || '',
      from: order.dedicationCard.from || '',
      message: order.dedicationCard.message || '',
    };
  }

  return clean;
}

/**
 * Registra o actualiza un pedido en Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const payload = cleanOrderForFirestore(order);
    const docRef = doc(db, COLLECTIONS.ORDERS, payload.id);
    await setDoc(docRef, payload, { merge: true });
    console.log(`[Firebase] ✅ Pedido #${payload.orderNumber} guardado en Firestore`);
  } catch (err) {
    console.warn('[Firebase] Error al guardar pedido en Firestore:', err);
    throw err;
  }
}

/**
 * Elimina un pedido de Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await deleteDoc(docRef);
    console.log(`[Firebase] ✅ Pedido ${orderId} eliminado de Firestore`);
  } catch (err) {
    console.warn('[Firebase] Error al eliminar pedido:', err);
    throw err;
  }
}

/**
 * Actualiza el estado de un pedido
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: Order['status'],
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(activeDb, COLLECTIONS.ORDERS, orderId);
    const payload: Partial<Order> = { status };
    if (notes !== undefined) payload.notes = notes;
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.warn(`[Firebase] Error al actualizar estado de pedido ${orderId}:`, err);
    throw err;
  }
}

/**
 * Guarda la configuración de la boutique
 */
export async function saveSettingsToFirestore(
  settings: BoutiqueSettings
): Promise<void> {
  const docRef = doc(activeDb, COLLECTIONS.CONFIG, DOCS.SETTINGS);
  await setDoc(docRef, settings, { merge: true });
}

/**
 * Guarda la configuración del popup de promoción
 */
export async function savePromoToFirestore(promo: PromoConfig): Promise<void> {
  try {
    const payload = cleanPromoForFirestore(promo);
    const docRef = doc(activeDb, COLLECTIONS.CONFIG, DOCS.PROMO);
    await setDoc(docRef, payload, { merge: true });
    console.log('[Firebase] ✅ Configuración de promoción guardada en Firestore.');
  } catch (err) {
    console.warn('[Firebase] Error al guardar promo:', err);
    throw err;
  }
}

/**
 * Guarda la lista de videos de redes sociales
 */
export async function saveSocialPostsToFirestore(
  posts: SocialVideoPost[]
): Promise<void> {
  const docRef = doc(activeDb, COLLECTIONS.CONFIG, DOCS.SOCIAL);
  await setDoc(docRef, { posts, updatedAt: new Date().toISOString() });
}

/**
 * Registra un movimiento de inventario
 */
export async function saveMovementToFirestore(
  movement: InventoryMovement
): Promise<void> {
  const docRef = doc(activeDb, COLLECTIONS.MOVEMENTS, movement.id);
  await setDoc(docRef, movement);
}

/**
 * Función para reemplazar completamente la colección de productos en Firestore con una nueva lista oficial
 */
export async function replaceAllProductsInFirestore(
  products: Product[] = INITIAL_PRODUCTS,
  database: Firestore = activeDb
): Promise<void> {
  try {
    const colRef = collection(database, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(colRef);

    // Eliminar documentos obsoletos existentes
    if (!snapshot.empty) {
      const deleteBatch = writeBatch(database);
      snapshot.forEach((docSnap) => {
        deleteBatch.delete(docSnap.ref);
      });
      await deleteBatch.commit();
      console.log(`[Firebase] Eliminados ${snapshot.size} productos anteriores de Firestore.`);
    }

    // Escribir los nuevos productos oficiales en lotes con sanitización
    const insertBatch = writeBatch(database);
    products.forEach((prod) => {
      const clean = cleanProductForFirestore(prod);
      const ref = doc(database, COLLECTIONS.PRODUCTS, clean.id);
      insertBatch.set(ref, clean);
    });
    await insertBatch.commit();
    console.log(`[Firebase] ✅ ${products.length} productos oficiales guardados en Firestore.`);
  } catch (error) {
    console.warn('[Firebase] Error al reemplazar catálogo de productos:', error);
    throw error;
  }
}

/**
 * Consulta y devuelve el catálogo de productos actualizado directamente desde Firestore
 */
export async function fetchProductsFromFirestore(
  database: Firestore = activeDb
): Promise<Product[]> {
  try {
    const colRef = collection(database, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('[Firebase] Colección vacía al consultar fetchProductsFromFirestore. Sembrando...');
      await replaceAllProductsInFirestore(INITIAL_PRODUCTS, database);
      return INITIAL_PRODUCTS;
    }
    const list: Product[] = [];
    snapshot.forEach((docSnap) => {
      list.push(normalizeProductData(docSnap.id, docSnap.data()));
    });
    return list;
  } catch (err) {
    console.warn('[Firebase] Error en fetchProductsFromFirestore:', err);
    return INITIAL_PRODUCTS;
  }
}

/**
 * Función de siembra inicial de productos en Firestore
 */
export async function seedInitialProducts(database: Firestore = activeDb): Promise<void> {
  try {
    await replaceAllProductsInFirestore(INITIAL_PRODUCTS, database);
    console.log('[Firebase] ✅ Catálogo inicial sembrado con éxito en Firestore');
  } catch (error) {
    console.warn('[Firebase] Error al sembrar productos iniciales en Firestore:', error);
  }
}



