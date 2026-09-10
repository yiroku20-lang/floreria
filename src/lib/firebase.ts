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
} from 'firebase/firestore';
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
  INITIAL_SETTINGS,
  INITIAL_PROMO,
  INITIAL_SOCIAL_POSTS,
  INITIAL_MOVEMENTS,
} from '../data/initialData';
import { transformDriveUrl, BOUTIQUE_FALLBACK_IMAGE } from '../utils/driveUtils';

// Configuración de Firebase
export const firebaseConfig = {
  projectId: "wired-signifier-q40ks",
  appId: "1:242162152938:web:00fb951d89cd75411bae93",
  apiKey: "AIzaSyAZwuG_XFAQ5oLuwcsuZ6M-IQ28pGquDWM",
  authDomain: "wired-signifier-q40ks.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-rosanferflorerab-abf1e0af-8ef8-427d-8120-7ccfcdb317b5",
  storageBucket: "wired-signifier-q40ks.firebasestorage.app",
  messagingSenderId: "242162152938",
};

// Inicialización de la aplicación Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicialización de Firestore robusta para navegadores y preview iframes
function getInitializedFirestore(): Firestore {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      experimentalForceLongPolling: false,
    }, firebaseConfig.firestoreDatabaseId);
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db: Firestore = getInitializedFirestore();

// Nombres de colecciones y documentos
const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CONFIG: 'config',
  MOVEMENTS: 'movements',
};

const DOCS = {
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
    price = rawPrice;
  } else if (typeof rawPrice === 'string') {
    price = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;
  }

  // Precio Original
  let originalPrice: number | undefined = undefined;
  const rawOrigPrice = raw.originalPrice !== undefined ? raw.originalPrice : raw.precioOriginal;
  if (rawOrigPrice !== undefined) {
    originalPrice = typeof rawOrigPrice === 'number' ? rawOrigPrice : parseFloat(String(rawOrigPrice).replace(/[^0-9.]/g, ''));
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
 * Escucha cambios en tiempo real del catálogo de productos
 */
export function subscribeToProducts(
  callback: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, COLLECTIONS.PRODUCTS);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        console.log('🌱 Firestore vacío: sembrando catálogo inicial en la nube...');
        await seedInitialProducts();
        callback(INITIAL_PRODUCTS);
      } else {
        const prods: Product[] = [];
        snapshot.forEach((docSnap) => {
          prods.push(normalizeProductData(docSnap.id, docSnap.data()));
        });
        callback(prods);
      }
    },
    (err) => {
      // Manejo silencioso de errores de red para no interrumpir al usuario
      if (onError) onError(err);
    }
  );
}

/**
 * Escucha cambios en tiempo real de los pedidos
 */
export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, COLLECTIONS.ORDERS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as Order);
      });
      orders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      callback(orders);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Escucha cambios en la configuración de la boutique
 */
export function subscribeToSettings(
  callback: (settings: BoutiqueSettings) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, COLLECTIONS.CONFIG, DOCS.SETTINGS);
  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as BoutiqueSettings);
      } else {
        await setDoc(docRef, INITIAL_SETTINGS);
        callback(INITIAL_SETTINGS);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Escucha cambios en el popup de promociones
 */
export function subscribeToPromo(
  callback: (promo: PromoConfig) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, COLLECTIONS.CONFIG, DOCS.PROMO);
  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as PromoConfig);
      } else {
        await setDoc(docRef, INITIAL_PROMO);
        callback(INITIAL_PROMO);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Escucha cambios en la vitrina de redes sociales
 */
export function subscribeToSocialPosts(
  callback: (posts: SocialVideoPost[]) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, COLLECTIONS.CONFIG, DOCS.SOCIAL);
  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.posts || INITIAL_SOCIAL_POSTS);
      } else {
        await setDoc(docRef, { posts: INITIAL_SOCIAL_POSTS });
        callback(INITIAL_SOCIAL_POSTS);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Escucha cambios en movimientos de inventario
 */
export function subscribeToMovements(
  callback: (movements: InventoryMovement[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, COLLECTIONS.MOVEMENTS);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_MOVEMENTS);
      } else {
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
      if (onError) onError(err);
    }
  );
}

// --- SERVICIOS DE GUARDADO Y ESCRITURA EN FIRESTORE ---

/**
 * Guarda o actualiza un producto individual en Firestore
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
  await setDoc(docRef, product, { merge: true });
}

/**
 * Elimina un producto de Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  await deleteDoc(docRef);
}

/**
 * Guarda el lote completo de productos en Firestore
 */
export async function saveAllProductsToFirestore(products: Product[]): Promise<void> {
  const batch = writeBatch(db);
  products.forEach((p) => {
    const ref = doc(db, COLLECTIONS.PRODUCTS, p.id);
    batch.set(ref, p);
  });
  await batch.commit();
}

/**
 * Registra o actualiza un pedido en Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
  await setDoc(docRef, order, { merge: true });
}

/**
 * Actualiza el estado de un pedido
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: Order['status'],
  notes?: string
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const payload: Partial<Order> = { status };
  if (notes !== undefined) payload.notes = notes;
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Guarda la configuración de la boutique
 */
export async function saveSettingsToFirestore(
  settings: BoutiqueSettings
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CONFIG, DOCS.SETTINGS);
  await setDoc(docRef, settings, { merge: true });
}

/**
 * Guarda la configuración del popup de promoción
 */
export async function savePromoToFirestore(promo: PromoConfig): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CONFIG, DOCS.PROMO);
  await setDoc(docRef, promo, { merge: true });
}

/**
 * Guarda la lista de videos de redes sociales
 */
export async function saveSocialPostsToFirestore(
  posts: SocialVideoPost[]
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CONFIG, DOCS.SOCIAL);
  await setDoc(docRef, { posts, updatedAt: new Date().toISOString() });
}

/**
 * Registra un movimiento de inventario
 */
export async function saveMovementToFirestore(
  movement: InventoryMovement
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.MOVEMENTS, movement.id);
  await setDoc(docRef, movement);
}

/**
 * Función de siembra inicial de productos en Firestore
 */
export async function seedInitialProducts(): Promise<void> {
  try {
    const batch = writeBatch(db);
    INITIAL_PRODUCTS.forEach((prod) => {
      const ref = doc(db, COLLECTIONS.PRODUCTS, prod.id);
      batch.set(ref, prod);
    });
    await batch.commit();
    console.log('✅ Catálogo inicial sembrado con éxito en Firestore');
  } catch (error) {
    console.error('Error al sembrar productos iniciales en Firestore:', error);
  }
}


