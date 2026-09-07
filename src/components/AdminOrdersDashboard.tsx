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
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/driveUtils';

interface AdminOrdersDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  whatsappNumber: string;
}

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
    const totalSales = orders.reduce((sum, o) => (o.status !== 'Cancelado' ? sum + o.total : sum), 0);
    const newCount = orders.filter((o) => o.status === 'Nuevo').length;
    const prepCount = orders.filter((o) => o.status === 'En preparación').length;
    const transitCount = orders.filter((o) => o.status === 'En camino').length;
    const deliveredCount = orders.filter((o) => o.status === 'Entregado').length;

    return { totalSales, totalOrders: orders.length, newCount, prepCount, transitCount, deliveredCount };
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
        (order.district && order.district.toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  }, [orders, selectedStatus, searchQuery]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Nuevo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'En preparación':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'En camino':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Entregado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const cleanPhoneForWhatsApp = (raw: string) => {
    return raw.replace(/[^0-9]/g, '');
  };

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) {
      alert('No hay pedidos para exportar.');
      return;
    }
    const headers = ['Orden', 'Fecha', 'Cliente', 'Telefono', 'Modalidad', 'Distrito', 'Total_PEN', 'Estado', 'Pago'];
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
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pedidos_rosanfer_cusco_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#5C715E]/15 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Total Recaudado</span>
            <DollarSign className="w-4 h-4 text-[#5C715E]" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-serif-boutique font-bold text-[#2C362D]">
            {formatCurrency(stats.totalSales)}
          </p>
          <span className="text-[11px] text-[#5C715E]">
            {stats.totalOrders} pedidos registrados
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-blue-600 font-medium">
            <span>Nuevos por Atender</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-serif-boutique font-bold text-blue-700">
            {stats.newCount}
          </p>
          <span className="text-[11px] text-gray-500">Pendientes de confirmación</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-600 font-medium">
            <span>En Preparación</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-serif-boutique font-bold text-amber-700">
            {stats.prepCount}
          </p>
          <span className="text-[11px] text-gray-500">En taller floral</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-600 font-medium">
            <span>Entregados / Éxito</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-serif-boutique font-bold text-emerald-700">
            {stats.deliveredCount}
          </p>
          <span className="text-[11px] text-gray-500">Entregados con satisfacción</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#5C715E]/15 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono, #orden..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status filters and Export CSV */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['Todos', 'Nuevo', 'En preparación', 'En camino', 'Entregado', 'Cancelado'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedStatus === status
                      ? 'bg-[#5C715E] text-white'
                      : 'bg-[#FBF9F6] text-[#2C362D] hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FBF9F6] hover:bg-[#5C715E] hover:text-white text-[#2C362D] border border-gray-200 transition-colors flex items-center gap-1.5"
            title="Descargar pedidos en formato CSV para Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-[#5C715E]/15 shadow-xs overflow-hidden">
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
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FBF9F6]/60 transition-colors cursor-pointer"
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
                        {order.items.map((it) => `${it.quantity}x ${it.product.name}`).join(', ')}
                      </div>
                      {order.dedicationCard?.enabled && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#D49A89] font-medium mt-0.5">
                          <Heart className="w-2.5 h-2.5" /> Con dedicatoria
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2C362D] whitespace-nowrap">
                      {formatCurrency(order.total)}
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
                        <option value="Nuevo">Nuevo</option>
                        <option value="En preparación">En preparación</option>
                        <option value="En camino">En camino</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-[#5C715E]/10 text-[#5C715E] hover:bg-[#5C715E] hover:text-white transition-colors"
                          title="Ver detalle completo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`https://wa.me/${cleanPhoneForWhatsApp(
                            order.customerPhone
                          )}?text=${encodeURIComponent(
                            `¡Hola ${order.customerName}! Te saludamos de Rosanfer Florería sobre tu pedido #${order.orderNumber}. Ya está siendo preparado con mucho amor por nuestros floristas.`
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#5C715E]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs uppercase font-bold text-[#5C715E]">Detalle del Pedido</span>
                <h3 className="text-xl font-serif-boutique font-bold text-[#2C362D]">
                  Orden #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Customer & Status */}
              <div className="p-3 rounded-xl bg-[#FBF9F6] border border-[#5C715E]/10 flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#2C362D]">{selectedOrder.customerName}</p>
                  <p className="text-gray-500">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="p-3 rounded-xl bg-white border border-gray-100 space-y-1">
                <p className="font-bold text-[#5C715E] uppercase tracking-wider text-[10px]">
                  Información de Entrega
                </p>
                <p>
                  <strong>Modalidad:</strong>{' '}
                  {selectedOrder.deliveryType === 'delivery' ? 'Envío a Domicilio' : 'Recojo en Boutique'}
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
                  <strong>Fecha y Turno:</strong> {selectedOrder.deliveryDate} - {selectedOrder.deliveryTimeSlot}
                </p>
                <p>
                  <strong>Forma de pago:</strong> {selectedOrder.paymentMethod}
                </p>
              </div>

              {/* Dedication Card */}
              {selectedOrder.dedicationCard?.enabled && (
                <div className="p-3 rounded-xl bg-[#F4EFEB] border border-[#D49A89]/30 space-y-1">
                  <p className="font-bold text-[#D49A89] uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Tarjeta de Dedicatoria
                  </p>
                  <p>
                    <strong>Para:</strong> {selectedOrder.dedicationCard.to} |{' '}
                    <strong>De:</strong> {selectedOrder.dedicationCard.from}
                  </p>
                  <p className="italic bg-white p-2 rounded-lg text-gray-700">
                    "{selectedOrder.dedicationCard.message}"
                  </p>
                </div>
              )}

              {/* Products List */}
              <div>
                <p className="font-bold text-[#5C715E] uppercase tracking-wider text-[10px] mb-2">
                  Productos Pedidos
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 rounded-lg bg-gray-50"
                    >
                      <span>
                        {it.quantity}x {it.product.name}
                      </span>
                      <span className="font-semibold">
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
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(selectedOrder.customerPhone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contactar por WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={handlePrintTicket}
                className="px-3.5 py-2.5 rounded-xl bg-[#5C715E]/10 hover:bg-[#5C715E] hover:text-white text-[#5C715E] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Imprimir comanda u hoja de preparación floral"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
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
