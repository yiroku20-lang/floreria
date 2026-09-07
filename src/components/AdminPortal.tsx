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
} from 'lucide-react';
import { Product, Order, InventoryMovement, PromoConfig, BoutiqueSettings, OrderStatus } from '../types';
import { AdminOrdersDashboard } from './AdminOrdersDashboard';
import { InventoryManager } from './InventoryManager';
import { CatalogManager } from './CatalogManager';
import { RosanferLogo } from './RosanferLogo';

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
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'catalog' | 'settings'>('orders');

  // Settings form state
  const [waNumber, setWaNumber] = useState(settings.whatsappNumber);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [storeHours, setStoreHours] = useState(settings.openingHours);
  const [deliveryFee, setDeliveryFee] = useState(settings.defaultDeliveryFee);
  const [settingsFeedback, setSettingsFeedback] = useState('');

  if (!isOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      whatsappNumber: waNumber.trim(),
      storeAddress: storeAddress.trim(),
      openingHours: storeHours.trim(),
      defaultDeliveryFee: deliveryFee,
    });
    setSettingsFeedback('¡Configuración de boutique actualizada!');
    setTimeout(() => setSettingsFeedback(''), 3000);
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

        <div className="flex items-center gap-3">
          <button
            id="btn-close-admin-portal"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Volver a la Tienda</span>
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
            <span>Configuración Boutique</span>
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

        {/* Tab 4: Boutique Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-serif-boutique font-bold text-[#2C362D] pb-3 border-b border-gray-100">
              Ajustes Generales de la Boutique Floral
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Aquí es donde los clientes enviarán el pedido con el formato preconfigurado.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C362D] mb-1">
                  Dirección de la Boutique / Taller
                </label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C362D] mb-1">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  value={storeHours}
                  onChange={(e) => setStoreHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="py-3 px-8 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Configuración</span>
                </button>
              </div>

              {settingsFeedback && (
                <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  {settingsFeedback}
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
