import React, { useState, useEffect } from 'react';
import { Product, Order, InventoryMovement, PromoConfig, BoutiqueSettings, CartItem, OrderStatus, SocialVideoPost } from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_MOVEMENTS,
  INITIAL_PROMO,
  INITIAL_SETTINGS,
  INITIAL_SOCIAL_POSTS,
} from './data/initialData';
import { safeGetStorage, safeSetStorage } from './utils/driveUtils';
import {
  subscribeToProducts,
  subscribeToOrders,
  subscribeToSettings,
  subscribeToPromo,
  subscribeToSocialPosts,
  subscribeToMovements,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  saveSettingsToFirestore,
  savePromoToFirestore,
  saveSocialPostsToFirestore,
  saveMovementToFirestore,
} from './lib/firebase';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CatalogSection } from './components/CatalogSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { PromoModal } from './components/PromoModal';
import { BoutiqueStorySection } from './components/BoutiqueStorySection';
import { SocialShowcaseSection } from './components/SocialShowcaseSection';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';

export default function App() {
  // State with LocalStorage fallbacks and real-time Firestore sync
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = safeGetStorage<Product[]>('rosanfer_products', INITIAL_PRODUCTS);
    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = safeGetStorage<Order[]>('rosanfer_orders', INITIAL_ORDERS);
    return Array.isArray(saved) ? saved : INITIAL_ORDERS;
  });

  const [movements, setMovements] = useState<InventoryMovement[]>(() =>
    safeGetStorage('rosanfer_movements', INITIAL_MOVEMENTS)
  );

  const [promoConfig, setPromoConfig] = useState<PromoConfig>(() =>
    safeGetStorage('rosanfer_promo', INITIAL_PROMO)
  );

  const [settings, setSettings] = useState<BoutiqueSettings>(() => {
    const saved = safeGetStorage<BoutiqueSettings>('rosanfer_settings', INITIAL_SETTINGS);
    return saved ? { ...INITIAL_SETTINGS, ...saved } : INITIAL_SETTINGS;
  });

  const [socialPosts, setSocialPosts] = useState<SocialVideoPost[]>(() =>
    safeGetStorage('rosanfer_social_posts', INITIAL_SOCIAL_POSTS)
  );

  const [cart, setCart] = useState<CartItem[]>(() =>
    safeGetStorage('rosanfer_cart', [])
  );

  const [isCloudConnected, setIsCloudConnected] = useState(true);

  // UI state
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [forceOpenPromo, setForceOpenPromo] = useState(false);

  // --- SUSCRIPCIONES EN TIEMPO REAL CON FIREBASE FIRESTORE ---
  useEffect(() => {
    // 1. Productos
    const unsubProducts = subscribeToProducts(
      (cloudProducts) => {
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
          safeSetStorage('rosanfer_products', cloudProducts);
        }
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    // 2. Pedidos
    const unsubOrders = subscribeToOrders(
      (cloudOrders) => {
        if (cloudOrders) {
          setOrders(cloudOrders);
          safeSetStorage('rosanfer_orders', cloudOrders);
        }
      },
      () => setIsCloudConnected(false)
    );

    // 3. Ajustes de la boutique
    const unsubSettings = subscribeToSettings(
      (cloudSettings) => {
        if (cloudSettings) {
          setSettings(cloudSettings);
          safeSetStorage('rosanfer_settings', cloudSettings);
        }
      },
      () => setIsCloudConnected(false)
    );

    // 4. Popup de promoción
    const unsubPromo = subscribeToPromo(
      (cloudPromo) => {
        if (cloudPromo) {
          setPromoConfig(cloudPromo);
          safeSetStorage('rosanfer_promo', cloudPromo);
        }
      },
      () => setIsCloudConnected(false)
    );

    // 5. Vitrina de redes sociales
    const unsubSocial = subscribeToSocialPosts(
      (cloudPosts) => {
        if (cloudPosts) {
          setSocialPosts(cloudPosts);
          safeSetStorage('rosanfer_social_posts', cloudPosts);
        }
      },
      () => setIsCloudConnected(false)
    );

    // 6. Movimientos de inventario
    const unsubMovements = subscribeToMovements(
      (cloudMovements) => {
        if (cloudMovements) {
          setMovements(cloudMovements);
          safeSetStorage('rosanfer_movements', cloudMovements);
        }
      },
      () => setIsCloudConnected(false)
    );

    return () => {
      unsubProducts();
      unsubOrders();
      unsubSettings();
      unsubPromo();
      unsubSocial();
      unsubMovements();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    safeSetStorage('rosanfer_products', products);
  }, [products]);

  useEffect(() => {
    safeSetStorage('rosanfer_orders', orders);
  }, [orders]);

  useEffect(() => {
    safeSetStorage('rosanfer_movements', movements);
  }, [movements]);

  useEffect(() => {
    safeSetStorage('rosanfer_promo', promoConfig);
  }, [promoConfig]);

  useEffect(() => {
    safeSetStorage('rosanfer_settings', settings);
  }, [settings]);

  useEffect(() => {
    safeSetStorage('rosanfer_social_posts', socialPosts);
  }, [socialPosts]);

  useEffect(() => {
    safeSetStorage('rosanfer_cart', cart);
  }, [cart]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order created handler -> Guardar en Firestore y sincronizar stock
  const handleOrderCreated = async (newOrder: Order) => {
    // 1. Guardar orden en Firestore y estado local
    setOrders((prev) => [newOrder, ...prev]);
    try {
      await saveOrderToFirestore(newOrder);
    } catch (err) {
      console.warn('Error guardando orden en Firestore:', err);
    }

    // 2. Disminuir stock y registrar movimiento en Firestore para cada producto
    newOrder.items.forEach(async (item) => {
      const prod = products.find((p) => p.id === item.product.id);
      if (prod) {
        const updatedProd = { ...prod, stock: Math.max(0, prod.stock - item.quantity) };
        setProducts((prev) =>
          prev.map((p) => (p.id === item.product.id ? updatedProd : p))
        );
        try {
          await saveProductToFirestore(updatedProd);
        } catch (e) {
          console.warn('Error actualizando stock en Firestore:', e);
        }
      }

      const autoMovement: InventoryMovement = {
        id: `mov-${Date.now()}-${item.product.id}`,
        productId: item.product.id,
        productName: item.product.name,
        type: 'salida',
        quantity: item.quantity,
        reason: `Venta web WhatsApp (Orden #${newOrder.orderNumber})`,
        staffName: 'Sistema Rosanfer',
        date: new Date().toISOString(),
      };

      setMovements((prev) => [autoMovement, ...prev]);
      try {
        await saveMovementToFirestore(autoMovement);
      } catch (e) {
        console.warn('Error guardando movimiento en Firestore:', e);
      }
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    try {
      await updateOrderStatusInFirestore(orderId, newStatus);
    } catch (err) {
      console.warn('Error actualizando estado en Firestore:', err);
    }
  };

  // Inventory operations
  const handleRegisterMovement = async (
    productId: string,
    type: 'entrada' | 'salida',
    quantity: number,
    reason: string,
    staffName: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Update product stock
    const newStock = type === 'entrada' ? product.stock + quantity : Math.max(0, product.stock - quantity);
    const updatedProd = { ...product, stock: newStock };
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? updatedProd : p))
    );
    try {
      await saveProductToFirestore(updatedProd);
    } catch (e) {
      console.warn('Error guardando producto en Firestore:', e);
    }

    // Add movement
    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId,
      productName: product.name,
      type,
      quantity,
      reason,
      staffName,
      date: new Date().toISOString(),
    };
    setMovements((prev) => [movement, ...prev]);
    try {
      await saveMovementToFirestore(movement);
    } catch (e) {
      console.warn('Error guardando movimiento en Firestore:', e);
    }
  };

  const handleQuickAdjustStock = async (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock + delta);
    const updatedProd = { ...product, stock: newStock };
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? updatedProd : p))
    );
    try {
      await saveProductToFirestore(updatedProd);
    } catch (e) {
      console.warn('Error guardando producto en Firestore:', e);
    }

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId,
      productName: product.name,
      type: delta > 0 ? 'entrada' : 'salida',
      quantity: Math.abs(delta),
      reason: 'Ajuste rápido desde intranet',
      staffName: 'Personal en mostrador',
      date: new Date().toISOString(),
    };
    setMovements((prev) => [movement, ...prev]);
    try {
      await saveMovementToFirestore(movement);
    } catch (e) {
      console.warn('Error guardando movimiento en Firestore:', e);
    }
  };

  // Catalog operations
  const handleAddProduct = async (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    setActiveCategory('Todos');
    setSearchQuery('');
    try {
      await saveProductToFirestore(newProduct);
    } catch (e) {
      console.warn('Error guardando producto en Firestore:', e);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setActiveCategory('Todos');
    setSearchQuery('');
    try {
      await saveProductToFirestore(updatedProduct);
    } catch (e) {
      console.warn('Error actualizando producto en Firestore:', e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    try {
      await deleteProductFromFirestore(productId);
    } catch (e) {
      console.warn('Error eliminando producto de Firestore:', e);
    }
  };

  // Settings & Promo mutations with Firestore sync
  const handleUpdateSettings = async (newSettings: BoutiqueSettings) => {
    setSettings(newSettings);
    try {
      await saveSettingsToFirestore(newSettings);
    } catch (e) {
      console.warn('Error guardando ajustes en Firestore:', e);
    }
  };

  const handleUpdatePromoConfig = async (newPromo: PromoConfig) => {
    setPromoConfig(newPromo);
    try {
      await savePromoToFirestore(newPromo);
    } catch (e) {
      console.warn('Error guardando promo en Firestore:', e);
    }
  };

  const handleUpdateSocialPosts = async (newPosts: SocialVideoPost[]) => {
    setSocialPosts(newPosts);
    try {
      await saveSocialPostsToFirestore(newPosts);
    } catch (e) {
      console.warn('Error guardando redes en Firestore:', e);
    }
  };

  // Cart financial summary
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#2C362D] flex flex-col font-sans-boutique">
      {/* Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectCategory={setActiveCategory}
        activeCategory={activeCategory}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        whatsappNumber={settings.whatsappNumber}
      />

      {/* Hero Banner with progressive scroll blur and tulip slides */}
      <HeroBanner onSelectCategory={setActiveCategory} />

      {/* Main Catalog Section */}
      <main className="flex-1">
        <CatalogSection
          products={products}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onResetFilters={() => {
            setActiveCategory('Todos');
            setSearchQuery('');
          }}
          onAddToCart={handleAddToCart}
          onOpenDetail={(prod) => setSelectedProductDetail(prod)}
          whatsappNumber={settings.whatsappNumber}
        />

        {/* Brand Story & Merchandise Showcase */}
        <BoutiqueStorySection onSelectCategory={setActiveCategory} />

        {/* Social Media & TikTok Videos Showcase */}
        <SocialShowcaseSection posts={socialPosts} />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectCategory={setActiveCategory}
      />

      {/* Floating Action buttons (Mobile Cart + WhatsApp) */}
      <FloatingActions
        whatsappNumber={settings.whatsappNumber}
        cartCount={totalCartCount}
        cartTotal={totalCartAmount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderCreated={handleOrderCreated}
        whatsappNumber={settings.whatsappNumber}
        defaultDeliveryFee={settings.defaultDeliveryFee}
        storeAddress={settings.storeAddress}
        storeCity={settings.storeCity}
        promoConfig={promoConfig}
        settings={settings}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
        whatsappNumber={settings.whatsappNumber}
      />

      {/* Promotion Popup (supports Google Drive links) */}
      <PromoModal
        promo={promoConfig}
        onExploreCategory={(cat) => setActiveCategory(cat)}
        forceOpen={forceOpenPromo}
        onCloseForce={() => setForceOpenPromo(false)}
      />

      {/* Intranet & Centralized Admin Portal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setActiveCategory('Todos');
          setSearchQuery('');
        }}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        movements={movements}
        onRegisterMovement={handleRegisterMovement}
        onQuickAdjustStock={handleQuickAdjustStock}
        promoConfig={promoConfig}
        onUpdatePromoConfig={handleUpdatePromoConfig}
        onTriggerPromoPreview={() => setForceOpenPromo(true)}
        socialPosts={socialPosts}
        onUpdateSocialPosts={handleUpdateSocialPosts}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}

