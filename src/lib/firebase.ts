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

// Inicialización de la base de datos Firestore
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, FIRESTORE_DATABASE_ID);
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
        if (snapshot.empty) {
          console.log(
            `[Firebase] Colección 'products' en ${FIRESTORE_DATABASE_ID} está vacía. Sembrando catálogo inicial...`
          );
          await seedInitialProducts(db);
          callback(INITIAL_PRODUCTS);
        } else {
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
      async (snapshot) => {
        if (snapshot.empty) {
          console.log('[Firebase] Colección de pedidos vacía en Firestore. Respaldando pedidos iniciales...');
          try {
            const batch = writeBatch(db);
            INITIAL_ORDERS.forEach((o) => {
              batch.set(doc(db, COLLECTIONS.ORDERS, o.id), o);
            });
            await batch.commit();
            console.log('[Firebase] ✅ Pedidos iniciales respaldados en Firestore');
          } catch (seedErr) {
            console.warn('[Firebase] Aviso al sembrar pedidos iniciales:', seedErr);
          }
          callback(INITIAL_ORDERS);
          return;
        }

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
        if (snapshot.exists()) {
          callback(snapshot.data() as BoutiqueSettings);
        } else {
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
        if (snapshot.exists()) {
          callback(snapshot.data() as PromoConfig);
        } else {
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
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback(data.posts || INITIAL_SOCIAL_POSTS);
        } else {
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
        if (snapshot.empty) {
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
 * Guarda o actualiza un producto individual en Firestore
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
    await setDoc(docRef, product, { merge: true });
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
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(docRef);
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
    await replaceAllProductsInFirestore(products, db);
    console.log('[Firebase] ✅ Catálogo completo sincronizado con Firestore');
  } catch (err) {
    console.warn('[Firebase] Error al sincronizar productos completos:', err);
    throw err;
  }
}

/**
 * Registra o actualiza un pedido en Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
    await setDoc(docRef, order, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Error al guardar pedido:', err);
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
  const docRef = doc(activeDb, COLLECTIONS.ORDERS, orderId);
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
  const docRef = doc(activeDb, COLLECTIONS.CONFIG, DOCS.SETTINGS);
  await setDoc(docRef, settings, { merge: true });
}

/**
 * Guarda la configuración del popup de promoción
 */
export async function savePromoToFirestore(promo: PromoConfig): Promise<void> {
  const docRef = doc(activeDb, COLLECTIONS.CONFIG, DOCS.PROMO);
  await setDoc(docRef, promo, { merge: true });
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

    // Escribir los nuevos productos oficiales en lotes
    const insertBatch = writeBatch(database);
    products.forEach((prod) => {
      const ref = doc(database, COLLECTIONS.PRODUCTS, prod.id);
      insertBatch.set(ref, prod);
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



