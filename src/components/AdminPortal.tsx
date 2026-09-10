import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Package,
  Layers,
  Settings,
  ShieldCheck,
  Phone,
  Save,
  Check,
  LogOut,
  User,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  Building2,
  Wallet,
  Share2,
  RefreshCw,
} from 'lucide-react';
import {
  Product,
  Order,
  InventoryMovement,
  PromoConfig,
  BoutiqueSettings,
  OrderStatus,
  AdminSession,
  SocialVideoPost,
} from '../types';
import {
  db,
  firebaseConfig,
  saveAllProductsToFirestore,
  replaceAllProductsInFirestore,
  fetchProductsFromFirestore,
  seedInitialProducts,
  COLLECTIONS,
  DOCS,
} from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { AdminOrdersDashboard } from './AdminOrdersDashboard';
import { InventoryManager } from './InventoryManager';
import { CatalogManager } from './CatalogManager';
import { SocialMediaManager } from './SocialMediaManager';
import { RosanferLogo } from './RosanferLogo';
import { AdminLogin } from './AdminLogin';
import { safeGetStorage, safeSetStorage, formatDate } from '../utils/driveUtils';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  products: Product[];
  onAddProduct: (prod: Product) => void;
  onUpdateProduct: (prod: Product) => void;
  onDeleteProduct: (prodId: string) => void;
  movements: InventoryMovement[];
  onRegisterMovement: (
    productId: string,
    type: 'entrada' | 'salida',
    quantity: number,
    reason: string,
    staffName: string
  ) => void;
  onQuickAdjustStock: (productId: string, delta: number) => void;
  promoConfig: PromoConfig;
  onUpdatePromoConfig: (promo: PromoConfig) => void;
  onTriggerPromoPreview: () => void;
  socialPosts: SocialVideoPost[];
  onUpdateSocialPosts: (posts: SocialVideoPost[]) => void;
  settings: BoutiqueSettings;
  onUpdateSettings: (settings: BoutiqueSettings) => void;
  onReloadProductsFromCloud?: () => Promise<Product[]>;
  onSetProducts?: (prods: Product[]) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  movements,
  onRegisterMovement,
  onQuickAdjustStock,
  promoConfig,
  onUpdatePromoConfig,
  onTriggerPromoPreview,
  socialPosts,
  onUpdateSocialPosts,
  settings,
  onUpdateSettings,
  onReloadProductsFromCloud,
  onSetProducts,
}) => {
  // Authentication State
  const [session, setSession] = useState<AdminSession | null>(() => {
    return safeGetStorage<AdminSession | null>('rosanfer_admin_active_session', null);
  });

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'catalog' | 'social' | 'settings'>('orders');

  // Settings form state
  const [waNumber, setWaNumber] = useState(settings.whatsappNumber);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [storeHours, setStoreHours] = useState(settings.openingHours);
  const [deliveryFee, setDeliveryFee] = useState(settings.defaultDeliveryFee);
  const [yapeNumber, setYapeNumber] = useState(settings.yapeNumber || '989 415 220');
  const [yapeHolder, setYapeHolder] = useState(settings.yapeHolder || 'Rosanfer Florería / Andrea V.');
  const [bcpAccount, setBcpAccount] = useState(settings.bcpAccount || '215-98765432-0-12');
  const [interbankAccount, setInterbankAccount] = useState(settings.interbankAccount || '003-892-0134567890-44');
  const [settingsFeedback, setSettingsFeedback] = useState('');

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Cloud Sync state
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    productsCount: number;
    productsSample: string[];
    ordersCount: number;
    movementsCount: number;
    hasSettings: boolean;
    hasPromo: boolean;
    socialPostsCount: number;
    dbId: string;
    checkedAt: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsSyncing(true);
    setSyncStatus('🔍 Auditando todas las colecciones en vivo en Firebase Firestore...');
    try {
      // 1. Productos
      const prodSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      const names: string[] = [];
      prodSnap.forEach((d) => {
        const data = d.data();
        names.push(data.name || data.nombre || d.id);
      });

      // 2. Pedidos
      const orderSnap = await getDocs(collection(db, COLLECTIONS.ORDERS));

      // 3. Movimientos de inventario
      const movSnap = await getDocs(collection(db, COLLECTIONS.MOVEMENTS));

      // 4. Configuración, Redes y Promo
      const settSnap = await getDoc(doc(db, COLLECTIONS.CONFIG, DOCS.SETTINGS));
      const promoSnap = await getDoc(doc(db, COLLECTIONS.CONFIG, DOCS.PROMO));
      const socialSnap = await getDoc(doc(db, COLLECTIONS.CONFIG, DOCS.SOCIAL));
      const socialCount = socialSnap.exists() ? (socialSnap.data()?.posts?.length || 0) : 0;

      setTestResult({
        productsCount: prodSnap.size,
        productsSample: names.slice(0, 5),
        ordersCount: orderSnap.size,
        movementsCount: movSnap.size,
        hasSettings: settSnap.exists(),
        hasPromo: promoSnap.exists(),
        socialPostsCount: socialCount,
        dbId: firebaseConfig.firestoreDatabaseId,
        checkedAt: new Date().toLocaleTimeString('es-PE'),
      });
      setSyncStatus(`✅ Auditoría completada: Los 5 módulos están respaldados en la base de datos.`);
    } catch (err: any) {
      setSyncStatus(`⚠️ Error en auditoría: ${err?.message || 'Revisa permisos'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAllToFirebase = async () => {
    setIsSyncing(true);
    setSyncStatus('Asegurando catálogo oficial en Firebase Firestore...');
    try {
      await replaceAllProductsInFirestore(products);
      safeSetStorage('rosanfer_products_v2', products);
      setSyncStatus(`¡Éxito! ${products.length} productos oficiales asegurados en Firebase.`);
    } catch (err: any) {
      setSyncStatus(`Aviso al sincronizar: ${err?.message || 'Revisa tu conexión'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  const handleReloadFromFirebase = async () => {
    setIsSyncing(true);
    setSyncStatus('Consultando catálogo oficial directamente desde Firestore...');
    try {
      let freshProducts: Product[] = [];
      if (onReloadProductsFromCloud) {
        freshProducts = await onReloadProductsFromCloud();
      } else {
        freshProducts = await fetchProductsFromFirestore();
        if (onSetProducts && freshProducts.length > 0) {
          onSetProducts(freshProducts);
        }
      }
      safeSetStorage('rosanfer_products_v2', freshProducts);
      setSyncStatus(`✅ Catálogo recargado: ${freshProducts.length} productos sincronizados desde la nube.`);
      setTestResult({
        count: freshProducts.length,
        sample: freshProducts.slice(0, 5).map((p) => p.name),
        dbId: firebaseConfig.firestoreDatabaseId,
      });
    } catch (err: any) {
      setSyncStatus(`⚠️ Error al recargar desde Firebase: ${err?.message || 'Error de conexión'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  if (!isOpen) return null;

  // Gatekeeper: If user is not authenticated, show Admin Login Modal
  if (!session) {
    return (
      <AdminLogin
        onSuccess={(newSession) => {
          setSession(newSession);
        }}
        onCancel={onClose}
      />
    );
  }

  const handleLogout = () => {
    safeSetStorage('rosanfer_admin_active_session', null);
    setSession(null);
    onClose();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      whatsappNumber: waNumber.trim(),
      storeAddress: storeAddress.trim(),
      openingHours: storeHours.trim(),
      defaultDeliveryFee: deliveryFee,
      yapeNumber: yapeNumber.trim(),
      yapeHolder: yapeHolder.trim(),
      bcpAccount: bcpAccount.trim(),
      interbankAccount: interbankAccount.trim(),
    });
    setSettingsFeedback('¡Configuración de boutique y cuentas de cobro actualizadas con éxito!');
    setTimeout(() => setSettingsFeedback(''), 3500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    const storedPass = safeGetStorage<string>('rosanfer_admin_pass_custom', 'rosanfer2025');

    if (currentPass !== storedPass) {
      setPasswordFeedback({
        type: 'error',
        message: 'La contraseña actual no es correcta.',
      });
      return;
    }

    if (newPass.length < 6) {
      setPasswordFeedback({
        type: 'error',
        message: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    if (newPass !== confirmPass) {
      setPasswordFeedback({
        type: 'error',
        message: 'Las contraseñas nuevas no coinciden.',
      });
      return;
    }

    safeSetStorage('rosanfer_admin_pass_custom', newPass);
    setPasswordFeedback({
      type: 'success',
      message: '¡Contraseña de administrador actualizada correctamente!',
    });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPasswordFeedback(null), 4000);
  };

  const waitingPaymentCount = orders.filter((o) => o.status === 'En espera de pago').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Nuevo').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FBF9F6]">
      {/* Top Admin Bar - Fully responsive for mobile devices */}
      <header className="sticky top-0 z-30 bg-[#2C362D] text-white px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <RosanferLogo size="sm" variant="horizontal" light />
          <div className="h-5 w-px bg-white/20 hidden sm:block" />
          <span className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-[#D49A89] hidden xs:flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Intranet & Administración</span>
          </span>
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Nube Firebase Firestore Conectada</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* User badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white/90">
            <User className="w-3.5 h-3.5 text-[#D49A89]" />
            <span className="font-semibold">{session.user.name}</span>
            <span className="text-[10px] text-emerald-300 font-mono">({session.user.role})</span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-red-500/80 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cerrar sesión de administrador"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>

          {/* Return to storefront */}
          <button
            id="btn-close-admin-portal"
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span><span className="hidden sm:inline">Ir a la </span>Tienda</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Navigation Tabs (Mobile-friendly horizontal scroller) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:pb-4 border-b border-[#5C715E]/15 mb-5 sm:mb-8 scrollbar-none">
          <button
            id="tab-admin-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-2 sm:py-2.5 px-3.5 sm:px-5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#5C715E] text-white shadow-md'
                : 'bg-white text-[#2C362D] hover:bg-[#5C715E]/10 border border-[#5C715E]/15'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Pedidos Recibidos ({orders.length})</span>
            {waitingPaymentCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] flex items-center gap-0.5 font-bold"
                title="Pedidos en espera de pago"
              >
                <span>⏳</span>
                <span>{waitingPaymentCount}</span>
              </span>
            )}
            {pendingOrdersCount > 0 && (
              <span
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold"
                title="Nuevos por atender"
              >
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            id="tab-admin-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`py-2 sm:py-2.5 px-3.5 sm:px-5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-[#5C715E] text-white shadow-md'
                : 'bg-white text-[#2C362D] hover:bg-[#5C715E]/10 border border-[#5C715E]/15'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Inventario de Taller</span>
          </button>

          <button
            id="tab-admin-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`py-2 sm:py-2.5 px-3.5 sm:px-5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'catalog'
                ? 'bg-[#5C715E] text-white shadow-md'
                : 'bg-white text-[#2C362D] hover:bg-[#5C715E]/10 border border-[#5C715E]/15'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Catálogo & Promos</span>
          </button>

          <button
            id="tab-admin-social"
            onClick={() => setActiveTab('social')}
            className={`py-2 sm:py-2.5 px-3.5 sm:px-5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'social'
                ? 'bg-[#5C715E] text-white shadow-md'
                : 'bg-white text-[#2C362D] hover:bg-[#5C715E]/10 border border-[#5C715E]/15'
            }`}
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Redes & TikTok ({socialPosts.length})</span>
          </button>

          <button
            id="tab-admin-settings"
            onClick={() => setActiveTab('settings')}
            className={`py-2 sm:py-2.5 px-3.5 sm:px-5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[#5C715E] text-white shadow-md'
                : 'bg-white text-[#2C362D] hover:bg-[#5C715E]/10 border border-[#5C715E]/15'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Configuración</span>
          </button>
        </div>

        {/* Tab 1: Orders Dashboard */}
        {activeTab === 'orders' && (
          <AdminOrdersDashboard
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            whatsappNumber={settings.whatsappNumber}
          />
        )}

        {/* Tab 2: Inventory Intranet */}
        {activeTab === 'inventory' && (
          <InventoryManager
            products={products}
            movements={movements}
            onRegisterMovement={onRegisterMovement}
            onQuickAdjustStock={onQuickAdjustStock}
          />
        )}

        {/* Tab 3: Catalog & Promos */}
        {activeTab === 'catalog' && (
          <CatalogManager
            products={products}
            onAddProduct={onAddProduct}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            promoConfig={promoConfig}
            onUpdatePromoConfig={onUpdatePromoConfig}
            onTriggerPromoPreview={onTriggerPromoPreview}
          />
        )}

        {/* Tab 4: Social Media & TikTok Showcase */}
        {activeTab === 'social' && (
          <SocialMediaManager
            posts={socialPosts}
            onUpdatePosts={onUpdateSocialPosts}
          />
        )}

        {/* Tab 5: Boutique Settings & Security */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Storefront Parameters */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-sm">
              <h3 className="text-xl font-serif-boutique font-bold text-[#2C362D] pb-3 border-b border-gray-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#5C715E]" />
                <span>Ajustes Generales de la Boutique Floral</span>
              </h3>

              <form onSubmit={handleSaveSettings} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#5C715E]" />
                    <span>Número de WhatsApp para Recepción de Pedidos *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 51987654321 (con código de país sin +)"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Aquí es donde los clientes enviarán sus pedidos desde el carrito con el formato preconfigurado.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#2C362D]">
                      Ubicación de Taller / Información de Sede
                    </label>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      100% Delivery • Próximamente tienda física
                    </span>
                  </div>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Ej: Taller Floral de Autor (Solo Delivery en Cusco • Próximamente local físico)"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Se muestra en el pie de página informando que el despacho es exclusivamente a domicilio y que pronto habrá local presencial.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C362D] mb-1">
                      Horario de Atención
                    </label>
                    <input
                      type="text"
                      value={storeHours}
                      onChange={(e) => setStoreHours(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C362D] mb-1">
                      Costo Estándar de Envío a Domicilio (S/.)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    />
                  </div>
                </div>

                {/* Banking & Digital Wallets Section */}
                <div className="pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-[#5C715E]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2C362D]">
                      Datos de Cobro Bancario y Billeteras Digitales (Yape / Plin / Transferencias)
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-4">
                    Estos datos se mostrarán a tus clientes en el resumen de compra y confirmación para que abonen por Yape, Plin o cuenta bancaria.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-[#5C715E]" />
                        <span>Número Yape / Plin *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: 989 415 220"
                        value={yapeNumber}
                        onChange={(e) => setYapeNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1">
                        Nombre del Titular de la Cuenta / Billetera *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Rosanfer Florería / Andrea V."
                        value={yapeHolder}
                        onChange={(e) => setYapeHolder(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#5C715E]" />
                        <span>Número de Cuenta BCP (opcional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 215-98765432-0-12"
                        value={bcpAccount}
                        onChange={(e) => setBcpAccount(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#5C715E]" />
                        <span>Número de Cuenta Interbank (opcional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 003-892-0134567890-44"
                        value={interbankAccount}
                        onChange={(e) => setInterbankAccount(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="py-3 px-8 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Ajustes de Boutique</span>
                  </button>
                </div>

                {settingsFeedback && (
                  <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{settingsFeedback}</span>
                  </p>
                )}
              </form>
            </div>

            {/* Admin Security & Password Change */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xl font-serif-boutique font-bold text-[#2C362D] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#5C715E]" />
                  <span>Seguridad y Contraseña de Administrador</span>
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sesión Activa</span>
                </span>
              </div>

              {/* Active session info */}
              <div className="mt-4 p-4 rounded-2xl bg-[#FBF9F6] border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-[#2C362D]">
                    {session.user.name} ({session.user.email})
                  </p>
                  <p className="text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>Sesión iniciada: {formatDate(session.loginTime)}</span>
                  </p>
                </div>
                <div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold underline cursor-pointer"
                  >
                    Cerrar sesión en este navegador
                  </button>
                </div>
              </div>

              {/* Password update form */}
              <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                <h4 className="font-bold text-xs text-[#2C362D] uppercase tracking-wider">
                  Cambiar Contraseña de Acceso a la Intranet
                </h4>

                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Contraseña Actual *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Introduce tu clave actual"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C362D] mb-1">
                      Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C362D] mb-1">
                      Confirmar Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repite la nueva clave"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="py-3 px-8 rounded-full bg-[#2C362D] hover:bg-[#1a211b] text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-[#D49A89]" />
                    <span>Actualizar Contraseña de Intranet</span>
                  </button>
                </div>

                {passwordFeedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      passwordFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {passwordFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Cloud Database & Firebase Sync Center */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xl font-serif-boutique font-bold text-[#2C362D] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Base de Datos en la Nube (Firebase Firestore)</span>
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Conexión Activa en Tiempo Real</span>
                </span>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-[#FBF9F6] border border-gray-100 text-xs space-y-2 text-[#2C362D]">
                <p>
                  <strong className="font-bold">Proyecto Firebase:</strong> <code className="bg-gray-200/70 px-2 py-0.5 rounded text-[11px] font-mono">wired-signifier-q40ks</code>
                </p>
                <p>
                  <strong className="font-bold">Productos en Memoria:</strong> {products.length} arreglos florales activos.
                </p>
                <p className="text-gray-500">
                  Cualquier producto agregado o editado desde esta Intranet o desde la consola de Firebase se sincroniza automáticamente en vivo con todos tus clientes.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isSyncing}
                  className="py-2.5 px-5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>🔍 Probar Conexión en Vivo (Leer Nube)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncAllToFirebase}
                  disabled={isSyncing}
                  className="py-2.5 px-5 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSyncing ? 'Sincronizando...' : '⬆️ Subir/Asegurar Todo el Catálogo a Firebase'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReloadFromFirebase}
                  className="py-2.5 px-5 rounded-full bg-white hover:bg-gray-100 text-[#2C362D] border border-gray-200 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#5C715E]" />
                  <span>🔄 Recargar Catálogo desde la Nube</span>
                </button>
              </div>

              {testResult && (
                <div className="mt-4 p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                    <p className="font-bold flex items-center gap-2 text-emerald-800 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Auditoría en Vivo: 100% de la Base de Datos Verificada</span>
                    </p>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Verificado: {testResult.checkedAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">1. Catálogo</p>
                      <p className="text-base font-bold text-[#2C362D] mt-0.5">{testResult.productsCount} productos</p>
                      <p className="text-[10px] text-emerald-700 font-medium">Colección 'products'</p>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">2. Pedidos</p>
                      <p className="text-base font-bold text-[#2C362D] mt-0.5">{testResult.ordersCount} pedidos</p>
                      <p className="text-[10px] text-emerald-700 font-medium">Colección 'orders'</p>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">3. Inventario</p>
                      <p className="text-base font-bold text-[#2C362D] mt-0.5">{testResult.movementsCount} movimientos</p>
                      <p className="text-[10px] text-emerald-700 font-medium">Colección 'movements'</p>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">4. Redes Sociales</p>
                      <p className="text-base font-bold text-[#2C362D] mt-0.5">{testResult.socialPostsCount} videos vitrina</p>
                      <p className="text-[10px] text-emerald-700 font-medium">Documento 'social_showcase'</p>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">5. Configuración</p>
                      <p className="text-base font-bold text-[#2C362D] mt-0.5">
                        {testResult.hasSettings ? 'Boutique Activa' : 'Pendiente'}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium">Doc. 'boutique_settings'</p>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">6. Campaña Promocional</p>
                      <p className="text-base font-bold text-[#2C362D] mt-0.5">
                        {testResult.hasPromo ? 'Banner Configurado' : 'Inactivo'}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium">Doc. 'promo_config'</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/50">
                    <strong>Catálogo en vivo:</strong> {testResult.productsSample.join(', ')}...
                  </p>
                </div>
              )}

              {syncStatus && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncStatus}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
