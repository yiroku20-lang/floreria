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
  // State with LocalStorage fallbacks and smart upgrade for new collections
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = safeGetStorage<Product[]>('rosanfer_products', INITIAL_PRODUCTS);
    if (Array.isArray(saved) && saved.length > 0) {
      const hasNewCategories = saved.some((p) =>
        ['Festivos', 'Latidos en Flor', 'Graduación', 'Set Nupcial "Sí Acepto"', 'Amor Eterno', 'Primavera Para Ti'].includes(p.category)
      );
      if (hasNewCategories) {
        return saved;
      }
      return INITIAL_PRODUCTS;
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = safeGetStorage<Order[]>('rosanfer_orders', INITIAL_ORDERS);
    if (Array.isArray(saved) && saved.length > 0 && !saved[0].customerPhone.includes('981')) {
      return saved;
    }
    return INITIAL_ORDERS;
  });

  const [movements, setMovements] = useState<InventoryMovement[]>(() =>
    safeGetStorage('rosanfer_movements', INITIAL_MOVEMENTS)
  );

  const [promoConfig, setPromoConfig] = useState<PromoConfig>(() => {
    const saved = safeGetStorage<PromoConfig>('rosanfer_promo', INITIAL_PROMO);
    if (saved && (saved.title.includes('Bienvenidos') || !saved.driveImageUrl.includes('photo-1597848212624'))) {
      return INITIAL_PROMO;
    }
    return saved || INITIAL_PROMO;
  });

  const [settings, setSettings] = useState<BoutiqueSettings>(() => {
    const saved = safeGetStorage<BoutiqueSettings>('rosanfer_settings', INITIAL_SETTINGS);
    if (saved && saved.storeCity && saved.storeCity.includes('Cusco')) {
      const merged = { ...INITIAL_SETTINGS, ...saved };
      // Ensure the official contact number is 989415220 if previous session had old placeholder
      if (merged.whatsappNumber === '51984234567') {
        merged.whatsappNumber = '51989415220';
      }
      if (merged.yapeNumber === '984 234 567') {
        merged.yapeNumber = '989 415 220';
      }
      return merged;
    }
    return INITIAL_SETTINGS;
  });

  const [socialPosts, setSocialPosts] = useState<SocialVideoPost[]>(() =>
    safeGetStorage('rosanfer_social_posts', INITIAL_SOCIAL_POSTS)
  );

  const [cart, setCart] = useState<CartItem[]>(() =>
    safeGetStorage('rosanfer_cart', [])
  );

  // UI state
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [forceOpenPromo, setForceOpenPromo] = useState(false);

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

  // Order created handler
  const handleOrderCreated = (newOrder: Order) => {
    // 1. Add order to central list
    setOrders((prev) => [newOrder, ...prev]);

    // 2. Automatically decrease stock & register movement for each product
    newOrder.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === item.product.id ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p
        )
      );

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
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Inventory operations
  const handleRegisterMovement = (
    productId: string,
    type: 'entrada' | 'salida',
    quantity: number,
    reason: string,
    staffName: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Update product stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = type === 'entrada' ? p.stock + quantity : Math.max(0, p.stock - quantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

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
  };

  const handleQuickAdjustStock = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock + delta);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );

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
  };

  // Catalog operations
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    setActiveCategory('Todos');
    setSearchQuery('');
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setActiveCategory('Todos');
    setSearchQuery('');
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
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
        onUpdatePromoConfig={setPromoConfig}
        onTriggerPromoPreview={() => setForceOpenPromo(true)}
        socialPosts={socialPosts}
        onUpdateSocialPosts={setSocialPosts}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  );
}
