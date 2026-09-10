import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Heart,
  CheckCircle,
  Truck,
  AlertTriangle,
  FileText,
  DollarSign,
  Send,
  Eye,
  Download,
  Printer,
  Hourglass,
  Check,
  ChevronRight,
  ExternalLink,
  MoreVertical,
  Edit3,
  Trash2,
  X,
  Save,
  Lock,
  List,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/driveUtils';
import { ThankYouCardModal } from './ThankYouCardModal';

interface AdminOrdersDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onEditOrder?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  whatsappNumber: string;
}

const ALL_STATUSES: OrderStatus[] = [
  'En espera de pago',
  'Nuevo',
  'En preparación',
  'En camino',
  'Entregado',
  'Cancelado',
];

export const AdminOrdersDashboard: React.FC<AdminOrdersDashboardProps> = ({
  orders,
  onUpdateOrderStatus,
  onEditOrder,
  onDeleteOrder,
  whatsappNumber,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openMenuOrderId, setOpenMenuOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [thankYouOrder, setThankYouOrder] = useState<Order | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'auto' | 'table' | 'cards'>('auto');

  // Computed metrics
  const stats = useMemo(() => {
    const totalSales = orders.reduce(
      (sum, o) => (o.status !== 'Cancelado' ? sum + (Number(o.total) || 0) : sum),
      0
    );
    const waitingPaymentCount = orders.filter((o) => o.status === 'En espera de pago').length;
    const newCount = orders.filter((o) => o.status === 'Nuevo').length;
    const prepCount = orders.filter((o) => o.status === 'En preparación').length;
    const transitCount = orders.filter((o) => o.status === 'En camino').length;
    const deliveredCount = orders.filter((o) => o.status === 'Entregado').length;

    return {
      totalSales,
      totalOrders: orders.length,
      waitingPaymentCount,
      newCount,
      prepCount,
      transitCount,
      deliveredCount,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = selectedStatus === 'Todos' || order.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (order.orderNumber?.toLowerCase()?.includes(q) ?? false) ||
        (order.customerName?.toLowerCase()?.includes(q) ?? false) ||
        (order.customerPhone?.toLowerCase()?.includes(q) ?? false) ||
        (order.district?.toLowerCase()?.includes(q) ?? false) ||
        (order.paymentMethod?.toLowerCase()?.includes(q) ?? false) ||
        (order.dedicationCard?.to?.toLowerCase()?.includes(q) ?? false) ||
        (order.items?.some((it) => it.product?.name?.toLowerCase()?.includes(q)) ?? false);

      return matchesStatus && matchesQuery;
    });
  }, [orders, selectedStatus, searchQuery]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'En espera de pago':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Nuevo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'En preparación':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'En camino':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Entregado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const cleanPhoneForWhatsApp = (raw?: string | null) => {
    const digits = (raw || '').replace(/[^0-9]/g, '');
    if (digits.length === 9 && digits.startsWith('9')) {
      return `51${digits}`;
    }
    return digits;
  };

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) {
      alert('No hay pedidos para exportar.');
      return;
    }
    const headers = [
      'Orden',
      'Fecha',
      'Cliente',
      'Telefono',
      'Modalidad',
      'Distrito',
      'Total_PEN',
      'Estado',
      'Pago',
    ];
    const rows = orders.map((o) => [
      o.orderNumber || o.id,
      `"${o.createdAt || ''}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      o.deliveryType === 'delivery' ? 'Envio Domicilio' : 'Recojo Tienda',
      `"${(o.district || '').replace(/"/g, '""')}"`,
      Number(o.total) || 0,
      `"${o.status || ''}"`,
      `"${(o.paymentMethod || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `pedidos_rosanfer_cusco_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Metric Cards - Responsive Grid for mobile (2 columns) and desktop (6 columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* En espera de pago Card (Prominent alert) */}
        <div
          onClick={() => setSelectedStatus('En espera de pago')}
          className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            stats.waitingPaymentCount > 0
              ? 'bg-amber-50/80 border-amber-300 shadow-xs ring-1 ring-amber-400/50'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
            <span className="truncate">En Espera de Pago</span>
            {stats.waitingPaymentCount > 0 ? (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            ) : (
              <Hourglass className="w-3.5 h-3.5 text-amber-600" />
            )}
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-serif-boutique font-bold text-amber-900">
            {stats.waitingPaymentCount}
          </p>
          <span className="text-[10px] sm:text-[11px] text-amber-700/90 block truncate">
            Validar comprobante
          </span>
        </div>

        {/* Nuevos por Atender */}
        <div
          onClick={() => setSelectedStatus('Nuevo')}
          className="p-3 sm:p-4 bg-white rounded-2xl border border-blue-200 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-blue-600 font-medium">
            <span className="truncate">Nuevos por Atender</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-serif-boutique font-bold text-blue-700">
            {stats.newCount}
          </p>
          <span className="text-[10px] sm:text-[11px] text-gray-500 block truncate">
            Confirmados para armado
          </span>
        </div>

        {/* En Preparación */}
        <div
          onClick={() => setSelectedStatus('En preparación')}
          className="p-3 sm:p-4 bg-white rounded-2xl border border-orange-200 shadow-xs cursor-pointer hover:border-orange-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-orange-600 font-medium">
            <span className="truncate">En Taller Floral</span>
            <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-serif-boutique font-bold text-orange-700">
            {stats.prepCount}
          </p>
          <span className="text-[10px] sm:text-[11px] text-gray-500 block truncate">
            En armado floral
          </span>
        </div>

        {/* En Camino / Reparto */}
        <div
          onClick={() => setSelectedStatus('En camino')}
          className="p-3 sm:p-4 bg-white rounded-2xl border border-purple-200 shadow-xs cursor-pointer hover:border-purple-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-purple-600 font-medium">
            <span className="truncate">En Ruta de Entrega</span>
            <Truck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-serif-boutique font-bold text-purple-700">
            {stats.transitCount}
          </p>
          <span className="text-[10px] sm:text-[11px] text-gray-500 block truncate">
            Repartidor en camino
          </span>
        </div>

        {/* Entregados */}
        <div
          onClick={() => setSelectedStatus('Entregado')}
          className="p-3 sm:p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-emerald-600 font-medium">
            <span className="truncate">Entregados</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-serif-boutique font-bold text-emerald-700">
            {stats.deliveredCount}
          </p>
          <span className="text-[10px] sm:text-[11px] text-gray-500 block truncate">
            Entregas con éxito
          </span>
        </div>

        {/* Total Recaudado */}
        <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 bg-white rounded-2xl border border-[#5C715E]/15 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Total Recaudado</span>
            <DollarSign className="w-4 h-4 text-[#5C715E]" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-serif-boutique font-bold text-[#2C362D]">
            {formatCurrency(stats.totalSales)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#5C715E]">
            {stats.totalOrders} pedidos totales
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 bg-white rounded-2xl border border-[#5C715E]/15 shadow-xs space-y-3">
        {/* Top bar: search input, view switcher and CSV export */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono, #orden, método..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* View mode toggle (Adaptable full table vs. cards) */}
          <div className="flex items-center bg-[#FBF9F6] p-0.5 rounded-xl border border-gray-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#5C715E] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#2C362D]'
              }`}
              title="Ver en tabla completa adaptada"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#5C715E] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#2C362D]'
              }`}
              title="Ver en tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
            {viewMode !== 'auto' && (
              <button
                type="button"
                onClick={() => setViewMode('auto')}
                className="px-2 py-1 text-[10px] text-gray-400 hover:text-[#5C715E] font-medium cursor-pointer"
                title="Volver a modo automático según el dispositivo"
              >
                Auto
              </button>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#FBF9F6] hover:bg-[#5C715E] hover:text-white text-[#2C362D] border border-gray-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Descargar pedidos en formato CSV para Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>

        {/* Status filter pills (Horizontal scroll on mobile with touch support) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedStatus('Todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedStatus === 'Todos'
                ? 'bg-[#5C715E] text-white shadow-xs'
                : 'bg-[#FBF9F6] text-[#2C362D] hover:bg-gray-200'
            }`}
          >
            Todos ({orders.length})
          </button>

          {ALL_STATUSES.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            const isWaitingPayment = st === 'En espera de pago';
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedStatus === st
                    ? isWaitingPayment
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-[#5C715E] text-white font-bold shadow-xs'
                    : isWaitingPayment && count > 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                    : 'bg-[#FBF9F6] text-[#2C362D] hover:bg-gray-200'
                }`}
              >
                {isWaitingPayment && <Hourglass className="w-3 h-3" />}
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedStatus === st
                      ? 'bg-white/20 text-white'
                      : 'bg-black/5 text-[#2C362D]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ORDER CARDS VIEW (Displayed on mobile/tablet or when cards view is selected) */}
      <div
        className={`${
          viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'block md:hidden'
        } space-y-3.5`}
      >
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">No se encontraron pedidos con el filtro actual.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isWaitingPayment = order.status === 'En espera de pago';
            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 transition-all ${
                  isWaitingPayment
                    ? 'border-amber-300 ring-1 ring-amber-300/40'
                    : 'border-[#5C715E]/15'
                }`}
              >
                {/* Card Top: Order Number, Date, and Status Selector */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#5C715E]">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="text-base font-bold text-[#2C362D] mt-0.5">
                      {formatCurrency(order.total)}
                    </div>
                  </div>

                  {/* Direct Status Selector for Mobile */}
                  <select
                    value={order.status}
                    onChange={(e) =>
                      onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                    }
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Banner if Waiting for Payment */}
                {isWaitingPayment && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                      <Hourglass className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                      <span>Pendiente de Comprobante / Voucher</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Método: <strong>{order.paymentMethod}</strong> • Monto:{' '}
                      <strong>{formatCurrency(order.total)}</strong>
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(
                          order.customerPhone
                        )}?text=${encodeURIComponent(
                          `¡Hola ${order.customerName}! Te saludamos de Rosanfer Florería Cusco 🌸. Recibimos tu pedido #${order.orderNumber} por ${formatCurrency(
                            order.total
                          )}. Por favor envíanos la captura de tu comprobante de pago (${order.paymentMethod}) para que nuestro taller floral empiece a prepararlo. ¡Muchas gracias!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold flex items-center justify-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Pedir Voucher por WhatsApp</span>
                      </a>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'En preparación')}
                        className="py-1.5 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold flex items-center justify-center gap-1"
                        title="Marcar pago como recibido y pasar a preparación"
                      >
                        <Check className="w-3 h-3" />
                        <span>Pago Recibido</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Customer Information */}
                <div className="p-2.5 rounded-xl bg-[#FBF9F6] border border-gray-100 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <p className="font-bold text-[#2C362D]">{order.customerName}</p>
                    <a
                      href={`tel:${cleanPhoneForWhatsApp(order.customerPhone)}`}
                      className="text-[11px] text-gray-500 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-[#5C715E]" />
                      <span>{order.customerPhone}</span>
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(
                        order.customerPhone
                      )}?text=${encodeURIComponent(
                        `¡Hola ${order.customerName}! Te saludamos de Rosanfer Florería sobre tu pedido #${order.orderNumber}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                      title="Enviar mensaje por WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`tel:${cleanPhoneForWhatsApp(order.customerPhone)}`}
                      className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      title="Llamar al cliente"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Delivery & Items Summary */}
                <div className="space-y-1 text-xs text-[#2C362D]/85">
                  <div className="flex items-center gap-1.5">
                    {order.deliveryType === 'delivery' ? (
                      <span className="inline-flex items-center gap-1 text-[#5C715E] font-semibold">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Envío a {order.district || 'Cusco'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-purple-700 font-semibold">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Recojo en Boutique</span>
                      </span>
                    )}
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 text-[11px]">
                      {order.deliveryDate} ({order.deliveryTimeSlot})
                    </span>
                  </div>

                  {/* Flower items */}
                  <div className="text-[11px] text-gray-600 line-clamp-2">
                    {(order.items || []).map((it) => `${it.quantity || 1}x ${it.product?.name || 'Arreglo Floral'}`).join(', ')}
                  </div>

                  {/* Dedication badge */}
                  {order.dedicationCard?.enabled && (
                    <div className="text-[10px] text-[#D49A89] font-medium flex items-center gap-1 pt-0.5">
                      <Heart className="w-2.5 h-2.5" />
                      <span>Con tarjeta de dedicatoria para {order.dedicationCard.to}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#5C715E]/10 hover:bg-[#5C715E] hover:text-white text-[#5C715E] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Comanda</span>
                  </button>

                  <a
                    href={`https://wa.me/${cleanPhoneForWhatsApp(
                      order.customerPhone
                    )}?text=${encodeURIComponent(
                      isWaitingPayment
                        ? `¡Hola ${order.customerName}! Te saludamos de Rosanfer Florería Cusco. Recibimos tu pedido #${order.orderNumber}. Por favor compártenos el comprobante de tu pago (${order.paymentMethod}) para comenzar con la preparación de tus flores.`
                        : `¡Hola ${order.customerName}! Te saludamos de Rosanfer Florería sobre tu pedido #${order.orderNumber}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                    title="Escribir al cliente por WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>

                  {/* 3-dots Menu for Mobile Card */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuOrderId(openMenuOrderId === order.id ? null : order.id);
                      }}
                      className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                      title="Opciones del pedido"
                      id={`btn-menu-mobile-${order.id}`}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {openMenuOrderId === order.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-40 text-left animate-in fade-in zoom-in-95"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuOrderId(null);
                            setSelectedOrder(order);
                          }}
                          className="w-full px-3.5 py-2.5 text-xs text-[#2C362D] hover:bg-[#FBF9F6] flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#5C715E]" />
                          <span>Ver Comanda / Detalle</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuOrderId(null);
                            setThankYouOrder(order);
                          }}
                          className="w-full px-3.5 py-2.5 text-xs text-amber-900 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Tarjeta de Agradecimiento</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuOrderId(null);
                            setEditingOrder(JSON.parse(JSON.stringify(order)));
                          }}
                          className="w-full px-3.5 py-2.5 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Editar Pedido</span>
                        </button>

                        <div className="my-1 border-t border-gray-100" />

                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuOrderId(null);
                            setDeletingOrder(order);
                          }}
                          className="w-full px-3.5 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Borrar Pedido</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ORDERS TABLE VIEW (Zero scrollbar obstruction, completely visible on desktop with spacious action gutters) */}
      <div
        className={`${
          viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden md:block'
        } bg-white rounded-2xl border border-[#5C715E]/15 shadow-xs`}
      >
        <div className="w-full overflow-x-auto lg:overflow-x-visible overflow-y-visible min-h-[160px] pb-6 scrollbar-thin">
          <table className="w-full text-left text-xs text-[#2C362D] table-auto lg:table-fixed">
            <thead className="bg-[#FBF9F6] text-[#5C715E] uppercase tracking-wider font-bold text-[10.5px] border-b border-[#5C715E]/10 rounded-t-2xl">
              <tr>
                <th className="py-3 pl-3.5 pr-2 whitespace-nowrap lg:w-[14%] rounded-tl-2xl"># Orden / Fecha</th>
                <th className="py-3 px-3 lg:w-[18%]">Cliente & WhatsApp</th>
                <th className="py-3 px-3 lg:w-[16%]">Entrega</th>
                <th className="py-3 px-3 lg:w-[22%]">Flores / Items</th>
                <th className="py-3 px-3 whitespace-nowrap lg:w-[10%]">Total</th>
                <th className="py-3 px-3 whitespace-nowrap lg:w-[10%]">Estado</th>
                <th className="py-3 pl-2 pr-6 sm:pr-8 text-right whitespace-nowrap lg:w-[10%] rounded-tr-2xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    No se encontraron pedidos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isWaitingPayment = order.status === 'En espera de pago';
                  const totalItems = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
                  const itemsSummary = (order.items || []).map((it) => `${it.quantity || 1}x ${it.product?.name || 'Arreglo Floral'}`).join(', ');

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#FBF9F6]/70 transition-colors cursor-pointer ${
                        isWaitingPayment ? 'bg-amber-50/40' : ''
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* # Orden & Fecha */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-xs text-[#5C715E]">
                          #{order.orderNumber}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>

                      {/* Cliente & WhatsApp */}
                      <td className="py-2.5 px-3">
                        <div
                          className="font-semibold text-[#2C362D] text-xs truncate max-w-[125px] xl:max-w-[160px]"
                          title={order.customerName}
                        >
                          {order.customerName}
                        </div>
                        <a
                          href={`https://wa.me/${cleanPhoneForWhatsApp(order.customerPhone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10.5px] text-emerald-700 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span className="font-mono">{order.customerPhone}</span>
                        </a>
                      </td>

                      {/* Entrega */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 font-medium text-xs text-[#2C362D]">
                          {order.deliveryType === 'delivery' ? (
                            <>
                              <Truck className="w-3.5 h-3.5 text-[#5C715E] shrink-0" />
                              <span className="truncate max-w-[110px] xl:max-w-[140px]" title={order.district || 'Cusco'}>
                                {order.district || 'Cusco'}
                              </span>
                            </>
                          ) : (
                            <span className="text-purple-700 font-semibold text-[11px] whitespace-nowrap">
                              Recojo en tienda
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[10px] text-gray-400 block truncate max-w-[120px] xl:max-w-[150px] mt-0.5"
                          title={`${order.deliveryDate} • ${order.deliveryTimeSlot}`}
                        >
                          {order.deliveryDate} • {order.deliveryTimeSlot}
                        </span>
                      </td>

                      {/* Flores / Items */}
                      <td className="py-2.5 px-3">
                        <div
                          className="truncate text-[11px] text-gray-700 max-w-[150px] lg:max-w-[200px] xl:max-w-[260px]"
                          title={itemsSummary}
                        >
                          <span className="font-semibold text-[#5C715E] mr-1">{totalItems} itm:</span>
                          {itemsSummary}
                        </div>
                        {order.dedicationCard?.enabled && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-[#D49A89] font-medium bg-[#D49A89]/10 px-1.5 py-0.2 rounded-md mt-0.5">
                            <Heart className="w-2 h-2 shrink-0" /> Dedicatoria
                          </span>
                        )}
                      </td>

                      {/* Total & Pago */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-[#2C362D] text-xs">
                          {formatCurrency(order.total)}
                        </div>
                        <span
                          className="text-[10px] font-normal text-gray-400 block truncate max-w-[85px] mt-0.5"
                          title={order.paymentMethod}
                        >
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer max-w-[130px] transition-colors focus:outline-none ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 pl-2 pr-6 sm:pr-8 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 sm:p-2 rounded-xl bg-[#5C715E]/10 text-[#5C715E] hover:bg-[#5C715E] hover:text-white transition-colors cursor-pointer"
                            title="Ver comanda y detalle completo"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://wa.me/${cleanPhoneForWhatsApp(
                              order.customerPhone
                            )}?text=${encodeURIComponent(
                              isWaitingPayment
                                ? `¡Hola ${order.customerName}! Te saludamos de Rosanfer Florería Cusco. Recibimos tu pedido #${order.orderNumber}. Por favor compártenos el comprobante de tu pago (${order.paymentMethod}) para comenzar con la preparación de tus flores.`
                                : `¡Hola ${order.customerName}! Te saludamos de Rosanfer Florería sobre tu pedido #${order.orderNumber}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 sm:p-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                            title="Escribir al cliente por WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>

                          {/* 3-dots Menu for Desktop Table Row */}
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuOrderId(openMenuOrderId === order.id ? null : order.id);
                              }}
                              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                                openMenuOrderId === order.id
                                  ? 'bg-[#5C715E] text-white border-[#5C715E] shadow-xs ring-2 ring-[#5C715E]/20'
                                  : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-[#2C362D] hover:border-gray-300'
                              }`}
                              title="Opciones del pedido"
                              id={`btn-menu-desktop-${order.id}`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {openMenuOrderId === order.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 ring-1 ring-black/5"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuOrderId(null);
                                    setSelectedOrder(order);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs text-[#2C362D] hover:bg-[#FBF9F6] flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#5C715E]" />
                                  <span>Ver Comanda / Detalle</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuOrderId(null);
                                    setThankYouOrder(order);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs text-amber-900 hover:bg-amber-50 flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Tarjeta de Agradecimiento</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuOrderId(null);
                                    setEditingOrder(JSON.parse(JSON.stringify(order)));
                                  }}
                                  className="w-full px-3.5 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Editar Pedido</span>
                                </button>

                                <div className="my-1 border-t border-gray-100" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuOrderId(null);
                                    setDeletingOrder(order);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  <span>Borrar Pedido</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Click-Outside Backdrop for 3-dots menus */}
      {openMenuOrderId && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setOpenMenuOrderId(null)}
        />
      )}

      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#2C362D] text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in slide-in-from-top-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Responsive Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-[#5C715E]/20 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs uppercase font-bold text-[#5C715E] flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-[#5C715E]" />
                  <span>Modificar Datos del Pedido</span>
                </span>
                <h3 className="text-xl font-serif-boutique font-bold text-[#2C362D] flex items-center gap-2">
                  <span>Orden #{editingOrder.orderNumber}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 font-normal">
                    <Lock className="w-3 h-3 text-amber-700" /> # Orden fijo
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingOrder) return;
                onEditOrder?.(editingOrder);
                setSuccessToast(`Pedido #${editingOrder.orderNumber} actualizado correctamente.`);
                setTimeout(() => setSuccessToast(null), 3500);
                setEditingOrder(null);
              }}
              className="space-y-4 pt-4 text-xs"
            >
              {/* Protected Order Number Notice */}
              <div className="p-2.5 rounded-xl bg-[#FBF9F6] border border-gray-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-gray-600">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Número de Orden (Trazabilidad):</span>
                </div>
                <span className="font-mono font-bold text-[#5C715E] bg-white px-2.5 py-0.5 rounded-lg border border-gray-200">
                  #{editingOrder.orderNumber}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-[#5C715E] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Datos del Cliente</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={editingOrder.customerName}
                      onChange={(e) =>
                        setEditingOrder({ ...editingOrder, customerName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={editingOrder.customerPhone}
                      onChange={(e) =>
                        setEditingOrder({ ...editingOrder, customerPhone: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-[#5C715E] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Dirección y Fecha de Entrega</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Distrito (Cusco)</label>
                    <input
                      type="text"
                      value={editingOrder.district || ''}
                      onChange={(e) =>
                        setEditingOrder({ ...editingOrder, district: e.target.value })
                      }
                      placeholder="Ej. Wanchaq, Cusco Centro, San Sebastián..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Dirección Exacta</label>
                    <input
                      type="text"
                      value={editingOrder.address || ''}
                      onChange={(e) =>
                        setEditingOrder({ ...editingOrder, address: e.target.value })
                      }
                      placeholder="Calle, número, departamento..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Referencia</label>
                    <input
                      type="text"
                      value={editingOrder.reference || ''}
                      onChange={(e) =>
                        setEditingOrder({ ...editingOrder, reference: e.target.value })
                      }
                      placeholder="Frente al parque, portón verde..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Fecha Programada</label>
                    <input
                      type="text"
                      value={editingOrder.deliveryDate}
                      onChange={(e) =>
                        setEditingOrder({ ...editingOrder, deliveryDate: e.target.value })
                      }
                      placeholder="Ej. Hoy, Mañana, 14 de Febrero..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-gray-600 mb-1">Horario / Rango de Entrega</label>
                    <input
                      type="text"
                      value={editingOrder.deliveryTimeSlot}
                      onChange={(e) =>
                        setEditingOrder({ ...editingOrder, deliveryTimeSlot: e.target.value })
                      }
                      placeholder="Ej. Mañana (09:00 - 13:00), Tarde (14:00 - 18:30)..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Financials */}
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-[#5C715E] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Estado y Montos de la Orden</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Estado de la Orden</label>
                    <select
                      value={editingOrder.status}
                      onChange={(e) =>
                        setEditingOrder({ ...editingOrder, status: e.target.value as OrderStatus })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30 cursor-pointer"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Método de Pago</label>
                    <input
                      type="text"
                      value={editingOrder.paymentMethod}
                      onChange={(e) =>
                        setEditingOrder({ ...editingOrder, paymentMethod: e.target.value })
                      }
                      placeholder="WhatsApp / Yape, Plin, BCP, Efectivo..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Subtotal (S/)</label>
                    <input
                      type="number"
                      step="0.10"
                      value={editingOrder.subtotal}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditingOrder({
                          ...editingOrder,
                          subtotal: val,
                          total: val + (editingOrder.deliveryFee || 0),
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Costo de Envío (S/)</label>
                    <input
                      type="number"
                      step="0.10"
                      value={editingOrder.deliveryFee}
                      onChange={(e) => {
                        const fee = parseFloat(e.target.value) || 0;
                        setEditingOrder({
                          ...editingOrder,
                          deliveryFee: fee,
                          total: (editingOrder.subtotal || 0) + fee,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#2C362D] mb-1">Total a Cobrar (S/)</label>
                    <input
                      type="number"
                      step="0.10"
                      value={editingOrder.total}
                      onChange={(e) =>
                        setEditingOrder({
                          ...editingOrder,
                          total: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border-2 border-[#5C715E] font-mono font-bold text-sm bg-emerald-50/40 text-[#2C362D] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dedication Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#5C715E] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#D49A89]" />
                    <span>Tarjeta de Dedicatoria</span>
                  </h4>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={Boolean(editingOrder.dedicationCard?.enabled)}
                      onChange={(e) =>
                        setEditingOrder({
                          ...editingOrder,
                          dedicationCard: {
                            to: editingOrder.dedicationCard?.to || '',
                            from: editingOrder.dedicationCard?.from || '',
                            message: editingOrder.dedicationCard?.message || '',
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#5C715E] focus:ring-[#5C715E]"
                    />
                    <span>Incluir Dedicatoria</span>
                  </label>
                </div>

                {editingOrder.dedicationCard?.enabled && (
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-gray-600 text-[10px] mb-0.5">Para:</label>
                        <input
                          type="text"
                          value={editingOrder.dedicationCard?.to || ''}
                          onChange={(e) =>
                            setEditingOrder({
                              ...editingOrder,
                              dedicationCard: {
                                ...editingOrder.dedicationCard,
                                enabled: true,
                                to: e.target.value,
                              },
                            })
                          }
                          placeholder="Nombre del destinatario"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-600 text-[10px] mb-0.5">De:</label>
                        <input
                          type="text"
                          value={editingOrder.dedicationCard?.from || ''}
                          onChange={(e) =>
                            setEditingOrder({
                              ...editingOrder,
                              dedicationCard: {
                                ...editingOrder.dedicationCard,
                                enabled: true,
                                from: e.target.value,
                              },
                            })
                          }
                          placeholder="Firma / Nombre de quien envía"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-600 text-[10px] mb-0.5">Mensaje:</label>
                      <textarea
                        rows={2}
                        value={editingOrder.dedicationCard?.message || ''}
                        onChange={(e) =>
                          setEditingOrder({
                            ...editingOrder,
                            dedicationCard: {
                              ...editingOrder.dedicationCard,
                              enabled: true,
                              message: e.target.value,
                            },
                          })
                        }
                        placeholder="Mensaje personalizado..."
                        className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes / Special Instructions */}
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2">
                <label className="block font-bold text-[#5C715E] uppercase tracking-wider text-[11px]">
                  Notas Internas / Observaciones
                </label>
                <textarea
                  rows={2}
                  value={editingOrder.notes || ''}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, notes: e.target.value })
                  }
                  placeholder="Detalles sobre timbre, horario de guardia, etc."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5C715E]/30"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responsive Delete Order Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-[#2C362D]">
              ¿Eliminar el pedido #{deletingOrder.orderNumber}?
            </h3>
            <p className="text-xs text-gray-600 text-center mt-2 leading-relaxed">
              Cliente: <span className="font-semibold text-[#2C362D]">{deletingOrder.customerName}</span> por un monto de{' '}
              <span className="font-semibold text-[#2C362D]">{formatCurrency(deletingOrder.total)}</span>.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-[11px] text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                Esta acción eliminará el pedido de forma definitiva del panel y de la base de datos de Firestore para no acumular registros.
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder?.(deletingOrder.id);
                  setSuccessToast(`Pedido #${deletingOrder.orderNumber} eliminado permanentemente.`);
                  setTimeout(() => setSuccessToast(null), 3500);
                  setDeletingOrder(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div id="printable-order-ticket" className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#5C715E]/20 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs uppercase font-bold text-[#5C715E]">
                  Detalle del Pedido
                </span>
                <h3 className="text-xl font-serif-boutique font-bold text-[#2C362D]">
                  Orden #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer no-print"
                title="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Customer & Status Selector inside Modal */}
              <div className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                <div>
                  <p className="font-bold text-sm text-[#2C362D]">{selectedOrder.customerName}</p>
                  <a
                    href={`tel:${cleanPhoneForWhatsApp(selectedOrder.customerPhone)}`}
                    className="text-gray-500 hover:text-[#5C715E] flex items-center gap-1 mt-0.5"
                  >
                    <Phone className="w-3 h-3 text-[#5C715E]" />
                    <span>{selectedOrder.customerPhone}</span>
                  </a>
                </div>
                <div className="w-full sm:w-auto">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newSt = e.target.value as OrderStatus;
                      onUpdateOrderStatus(selectedOrder.id, newSt);
                      setSelectedOrder({ ...selectedOrder, status: newSt });
                    }}
                    className={`w-full sm:w-auto px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Alert if in wait */}
              {selectedOrder.status === 'En espera de pago' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Hourglass className="w-3.5 h-3.5 text-amber-600" />
                    <span>Esperando comprobante de pago</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Forma de pago elegida: <strong>{selectedOrder.paymentMethod}</strong>.
                    Verifica el abono en la app de Yape/Plin/Banco antes de pasar a preparación.
                  </p>
                </div>
              )}

              {/* Delivery Details */}
              <div className="p-3.5 rounded-2xl bg-white border border-gray-100 space-y-1.5">
                <p className="font-bold text-[#5C715E] uppercase tracking-wider text-[10px]">
                  Información de Entrega & Fecha
                </p>
                <p>
                  <strong>Modalidad:</strong>{' '}
                  {selectedOrder.deliveryType === 'delivery'
                    ? 'Envío a Domicilio'
                    : 'Recojo en Boutique'}
                </p>
                {selectedOrder.address && (
                  <p>
                    <strong>Dirección:</strong> {selectedOrder.address} ({selectedOrder.district})
                  </p>
                )}
                {selectedOrder.reference && (
                  <p>
                    <strong>Referencia:</strong> {selectedOrder.reference}
                  </p>
                )}
                <p>
                  <strong>Fecha y Turno:</strong> {selectedOrder.deliveryDate} -{' '}
                  {selectedOrder.deliveryTimeSlot}
                </p>
                <p>
                  <strong>Forma de pago:</strong> {selectedOrder.paymentMethod}
                </p>
                {selectedOrder.notes && (
                  <p className="text-gray-500 italic">
                    <strong>Notas:</strong> {selectedOrder.notes}
                  </p>
                )}
              </div>

              {/* Dedication Card */}
              {selectedOrder.dedicationCard?.enabled && (
                <div className="p-3.5 rounded-2xl bg-[#F4EFEB] border border-[#D49A89]/30 space-y-1.5">
                  <p className="font-bold text-[#D49A89] uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Tarjeta de Dedicatoria Especial
                  </p>
                  <p>
                    <strong>Para:</strong> {selectedOrder.dedicationCard.to} |{' '}
                    <strong>De:</strong> {selectedOrder.dedicationCard.from}
                  </p>
                  <p className="italic bg-white p-2.5 rounded-xl text-gray-700 leading-relaxed">
                    "{selectedOrder.dedicationCard.message}"
                  </p>
                </div>
              )}

              {/* Products List */}
              <div>
                <p className="font-bold text-[#5C715E] uppercase tracking-wider text-[10px] mb-2">
                  Arreglos y Productos
                </p>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50"
                    >
                      <span className="font-medium">
                        {it.quantity || 1}x {it.product?.name || 'Arreglo Floral'}
                      </span>
                      <span className="font-bold text-[#2C362D]">
                        {formatCurrency((Number(it.product?.price) || 0) * (Number(it.quantity) || 1))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-gray-200 space-y-1 text-right">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Envío:</span>
                  <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#5C715E] pt-1 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2 no-print">
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(
                  selectedOrder.customerPhone
                )}?text=${encodeURIComponent(
                  selectedOrder.status === 'En espera de pago'
                    ? `¡Hola ${selectedOrder.customerName}! Te saludamos de Rosanfer Florería Cusco 🌸. Recibimos tu pedido #${selectedOrder.orderNumber} por ${formatCurrency(
                        selectedOrder.total
                      )}. Por favor compártenos el comprobante de tu pago (${selectedOrder.paymentMethod}) para que nuestro taller empiece a preparar tus flores. ¡Gracias!`
                    : `¡Hola ${selectedOrder.customerName}! Te saludamos de Rosanfer Florería sobre tu pedido #${selectedOrder.orderNumber}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contactar por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setThankYouOrder(selectedOrder)}
                className="py-2.5 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Generar tarjeta de agradecimiento para WhatsApp"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Tarjeta Agradecimiento</span>
              </button>

              <button
                type="button"
                onClick={handlePrintTicket}
                className="py-2.5 px-3.5 rounded-xl bg-[#5C715E]/10 hover:bg-[#5C715E] hover:text-white text-[#5C715E] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Imprimir comanda u hoja de preparación floral"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Card Generator Modal */}
      {thankYouOrder && (
        <ThankYouCardModal
          order={thankYouOrder}
          onClose={() => setThankYouOrder(null)}
          whatsappNumber={whatsappNumber}
        />
      )}
    </div>
  );
};
