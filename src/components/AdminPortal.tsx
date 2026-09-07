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
} from 'lucide-react';
import {
  Product,
  Order,
  InventoryMovement,
  PromoConfig,
  BoutiqueSettings,
  OrderStatus,
  AdminSession,
} from '../types';
import { AdminOrdersDashboard } from './AdminOrdersDashboard';
import { InventoryManager } from './InventoryManager';
import { CatalogManager } from './CatalogManager';
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
  settings: BoutiqueSettings;
  onUpdateSettings: (settings: BoutiqueSettings) => void;
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
  settings,
  onUpdateSettings,
}) => {
  // Authentication State
  const [session, setSession] = useState<AdminSession | null>(() => {
    return safeGetStorage<AdminSession | null>('rosanfer_admin_active_session', null);
  });

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'catalog' | 'settings'>('orders');

  // Settings form state
  const [waNumber, setWaNumber] = useState(settings.whatsappNumber);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [storeHours, setStoreHours] = useState(settings.openingHours);
  const [deliveryFee, setDeliveryFee] = useState(settings.defaultDeliveryFee);
  const [settingsFeedback, setSettingsFeedback] = useState('');

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    });
    setSettingsFeedback('¡Configuración de boutique actualizada con éxito!');
    setTimeout(() => setSettingsFeedback(''), 3000);
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

  const pendingOrdersCount = orders.filter((o) => o.status === 'Nuevo').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FBF9F6]">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 bg-[#2C362D] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <RosanferLogo size="sm" variant="horizontal" light />
          <div className="h-6 w-px bg-white/20 hidden sm:block" />
          <span className="text-xs uppercase font-bold tracking-widest text-[#D49A89] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Intranet & Administración</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* User badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white/90">
            <User className="w-3.5 h-3.5 text-[#D49A89]" />
            <span className="font-semibold">{session.user.name}</span>
            <span className="text-[10px] text-emerald-300 font-mono">({session.user.role})</span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-red-500/80 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cerrar sesión de administrador"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>

          {/* Return to storefront */}
          <button
            id="btn-close-admin-portal"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Ir a la Tienda</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-[#5C715E]/15 mb-8 scrollbar-none">
          <button
            id="tab-admin-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#5C715E] text-white shadow-md'
                : 'bg-white text-[#2C362D] hover:bg-[#5C715E]/10 border border-[#5C715E]/15'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos Recibidos ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            id="tab-admin-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#5C715E] text-white shadow-md'
                : 'bg-white text-[#2C362D] hover:bg-[#5C715E]/10 border border-[#5C715E]/15'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Intranet de Inventario (Entradas / Salidas)</span>
          </button>

          <button
            id="tab-admin-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#5C715E] text-white shadow-md'
                : 'bg-white text-[#2C362D] hover:bg-[#5C715E]/10 border border-[#5C715E]/15'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catálogo & Popup Promocional</span>
          </button>

          <button
            id="tab-admin-settings"
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#5C715E] text-white shadow-md'
                : 'bg-white text-[#2C362D] hover:bg-[#5C715E]/10 border border-[#5C715E]/15'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración & Seguridad</span>
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

        {/* Tab 4: Boutique Settings & Security */}
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
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Dirección de la Boutique / Taller en Cusco
                  </label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                  />
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
          </div>
        )}
      </div>
    </div>
  );
};
