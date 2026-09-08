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
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/driveUtils';

interface AdminOrdersDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
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
  whatsappNumber,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Computed metrics
  const stats = useMemo(() => {
    const totalSales = orders.reduce(
      (sum, o) => (o.status !== 'Cancelado' ? sum + o.total : sum),
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
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.toLowerCase().includes(q) ||
        (order.district && order.district.toLowerCase().includes(q)) ||
        (order.paymentMethod && order.paymentMethod.toLowerCase().includes(q));

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

  const cleanPhoneForWhatsApp = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
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
      o.orderNumber,
      `"${o.createdAt}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      o.deliveryType === 'delivery' ? 'Envio Domicilio' : 'Recojo Tienda',
      `"${(o.district || '').replace(/"/g, '""')}"`,
      o.total,
      `"${o.status}"`,
      `"${o.paymentMethod.replace(/"/g, '""')}"`,
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
      {/* Top Metric Cards - Responsive Grid for mobile (2 columns) and desktop (5 columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* En espera de pago Card (Prominent alert) */}
        <div
          onClick={() => setSelectedStatus('En espera de pago')}
          className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            stats.waitingPaymentCount > 0
              ? 'bg-amber-50/80 border-amber-300 shadow-xs'
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
            Validar comprobante / voucher
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
            En preparación actual
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
            Entregas con satisfacción
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
        {/* Top bar: search input and CSV export */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono, #orden, método..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
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

      {/* MOBILE ORDER CARDS VIEW (Displayed on mobile/tablet phones: block md:hidden) */}
      <div className="block md:hidden space-y-3.5">
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
                    {order.items.map((it) => `${it.quantity}x ${it.product.name}`).join(', ')}
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
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#5C715E]/10 hover:bg-[#5C715E] hover:text-white text-[#5C715E] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Comanda / Detalle</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP ORDERS TABLE (Displayed on tablets/desktops: hidden md:block) */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#5C715E]/15 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2C362D]">
            <thead className="bg-[#FBF9F6] text-[#5C715E] uppercase tracking-wider font-bold text-[11px] border-b border-[#5C715E]/10">
              <tr>
                <th className="py-3 px-4"># Orden</th>
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Cliente & WhatsApp</th>
                <th className="py-3 px-4">Entrega</th>
                <th className="py-3 px-4">Flores / Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    No se encontraron pedidos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isWaitingPayment = order.status === 'En espera de pago';
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#FBF9F6]/70 transition-colors cursor-pointer ${
                        isWaitingPayment ? 'bg-amber-50/30' : ''
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#5C715E]">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2C362D]">{order.customerName}</div>
                        <a
                          href={`https://wa.me/${cleanPhoneForWhatsApp(order.customerPhone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.customerPhone}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-medium">
                          {order.deliveryType === 'delivery' ? (
                            <>
                              <Truck className="w-3.5 h-3.5 text-[#5C715E]" />
                              <span>{order.district || 'Cusco'}</span>
                            </>
                          ) : (
                            <span className="text-purple-700">Recojo en tienda</span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block">
                          {order.deliveryDate} • {order.deliveryTimeSlot}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate text-[11px]">
                          {order.items
                            .map((it) => `${it.quantity}x ${it.product.name}`)
                            .join(', ')}
                        </div>
                        {order.dedicationCard?.enabled && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#D49A89] font-medium mt-0.5">
                            <Heart className="w-2.5 h-2.5" /> Con dedicatoria
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#2C362D] whitespace-nowrap">
                        <div>{formatCurrency(order.total)}</div>
                        <span className="text-[10px] font-normal text-gray-400 block">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${getStatusBadge(
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
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg bg-[#5C715E]/10 text-[#5C715E] hover:bg-[#5C715E] hover:text-white transition-colors"
                            title="Ver detalle completo y comanda"
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
                            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                            title="Escribir al cliente por WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>
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

      {/* Responsive Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#5C715E]/20 max-h-[92vh] overflow-y-auto">
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
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
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
                  {selectedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50"
                    >
                      <span className="font-medium">
                        {it.quantity}x {it.product.name}
                      </span>
                      <span className="font-bold text-[#2C362D]">
                        {formatCurrency(it.product.price * it.quantity)}
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
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
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
    </div>
  );
};
