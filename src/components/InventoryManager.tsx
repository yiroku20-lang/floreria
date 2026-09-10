import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Clock,
  User,
  FileSpreadsheet,
} from 'lucide-react';
import { Product, InventoryMovement } from '../types';
import { formatDate, formatCurrency } from '../utils/driveUtils';

interface InventoryManagerProps {
  products: Product[];
  movements: InventoryMovement[];
  onRegisterMovement: (
    productId: string,
    type: 'entrada' | 'salida',
    quantity: number,
    reason: string,
    staffName: string
  ) => void;
  onQuickAdjustStock: (productId: string, delta: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  movements,
  onRegisterMovement,
  onQuickAdjustStock,
}) => {
  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada');
  const [quantity, setQuantity] = useState<number>(5);
  const [reason, setReason] = useState<string>('');
  const [staffName, setStaffName] = useState<string>('Florista Rosanfer');
  const [submitFeedback, setSubmitFeedback] = useState<string>('');

  // Search & Filter
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    onRegisterMovement(
      selectedProductId,
      movementType,
      quantity,
      reason.trim() || (movementType === 'entrada' ? 'Ingreso de flores frescas' : 'Ajuste de inventario'),
      staffName.trim() || 'Personal de turno'
    );

    setSubmitFeedback(
      `¡Registrado con éxito! ${movementType === 'entrada' ? '+' : '-'}${quantity} a ${
        selectedProduct?.name
      }`
    );
    setTimeout(() => setSubmitFeedback(''), 3000);

    // Reset form fields
    setQuantity(5);
    setReason('');
  };

  const filteredProducts = products.filter((p) => {
    if (stockFilter === 'low') return p.stock > 0 && p.stock <= 5;
    if (stockFilter === 'out') return p.stock <= 0;
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="space-y-8">
      {/* Top Inventory Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#5C715E]/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#5C715E]/10 flex items-center justify-center text-[#5C715E]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Total Unidades en Tienda</span>
            <span className="text-2xl font-serif-boutique font-bold text-[#2C362D]">
              {totalStockUnits} flores / piezas
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-amber-700 font-medium block">Productos con Stock Bajo</span>
            <span className="text-2xl font-serif-boutique font-bold text-amber-800">
              {lowStockCount} arreglos
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-red-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-red-600 font-medium block">Agotados / Sin Stock</span>
            <span className="text-2xl font-serif-boutique font-bold text-red-700">
              {outOfStockCount} productos
            </span>
          </div>
        </div>
      </div>

      {/* Intranet Registration Form */}
      <div className="bg-white rounded-3xl p-6 border border-[#5C715E]/20 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#5C715E]">
              Formulario de Intranet
            </span>
            <h3 className="text-lg font-serif-boutique font-bold text-[#2C362D]">
              Registrar Entrada o Salida de Producto
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#5C715E]/10 text-[#5C715E] font-medium">
            Personal Autorizado
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Product selector */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-[#2C362D] mb-1">Producto / Ramo *</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
            >
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} (Stock actual: {prod.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Type selector (Entrada / Salida) */}
          <div>
            <label className="block text-xs font-bold text-[#2C362D] mb-1">Tipo de Movimiento *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('entrada')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  movementType === 'entrada'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Entrada</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('salida')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  movementType === 'salida'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Salida</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-[#2C362D] mb-1">Cantidad *</label>
            <input
              type="number"
              min="1"
              max="500"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
            />
          </div>

          {/* Motivo / Razón */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-[#2C362D] mb-1">
              Motivo o Detalle del Movimiento
            </label>
            <input
              type="text"
              placeholder={
                movementType === 'entrada'
                  ? 'Ej: Recepción de lote holandés, producción taller...'
                  : 'Ej: Venta directa mostrador, merma por pétalo marchito...'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
            />
          </div>

          {/* Staff responsible */}
          <div>
            <label className="block text-xs font-bold text-[#2C362D] mb-1">Personal Responsable</label>
            <input
              type="text"
              placeholder="Ej: Andrea Florista"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
            />
          </div>

          {/* Submit button */}
          <div className="flex items-end">
            <button
              type="submit"
              id="btn-register-movement"
              className="w-full py-2.5 px-4 rounded-xl bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-xs transition-all shadow-sm active:scale-98"
            >
              Registrar Movimiento
            </button>
          </div>
        </form>

        {submitFeedback && (
          <p className="mt-3 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            {submitFeedback}
          </p>
        )}
      </div>

      {/* Real-time Inventory Table */}
      <div className="bg-white rounded-3xl border border-[#5C715E]/15 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif-boutique font-bold text-lg text-[#2C362D]">
              Control de Stock en Tiempo Real
            </h3>
            <p className="text-xs text-gray-500">
              Ajustes rápidos de stock y monitoreo de existencias.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1 text-xs rounded-lg font-medium ${
                stockFilter === 'all' ? 'bg-[#5C715E] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1 text-xs rounded-lg font-medium ${
                stockFilter === 'low' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Bajo ({lowStockCount})
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1 text-xs rounded-lg font-medium ${
                stockFilter === 'out' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Agotados ({outOfStockCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF9F6] text-[#5C715E] uppercase font-bold text-[11px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4 text-center">Stock Actual</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Ajuste Rápido (+/- 1)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-[#2C362D]">{prod.name}</td>
                  <td className="py-3 px-4 text-gray-500">{prod.category}</td>
                  <td className="py-3 px-4 font-medium">{formatCurrency(prod.price)}</td>
                  <td className="py-3 px-4 text-center font-bold text-base text-[#2C362D]">
                    {prod.stock}
                  </td>
                  <td className="py-3 px-4">
                    {prod.stock <= 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                        Agotado
                      </span>
                    ) : prod.stock <= 5 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                        Stock Bajo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-white">
                      <button
                        onClick={() => onQuickAdjustStock(prod.id, -1)}
                        disabled={prod.stock <= 0}
                        className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                        title="Descontar 1 unidad"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono font-bold text-xs">{prod.stock}</span>
                      <button
                        onClick={() => onQuickAdjustStock(prod.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"
                        title="Sumar 1 unidad"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movements History Log */}
      <div className="bg-white rounded-3xl border border-[#5C715E]/15 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif-boutique font-bold text-lg text-[#2C362D]">
              Historial de Entradas y Salidas
            </h3>
            <p className="text-xs text-gray-500">
              Registro auditado de movimientos en taller e inventario.
            </p>
          </div>
          <Clock className="w-5 h-5 text-[#5C715E]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF9F6] text-[#5C715E] uppercase font-bold text-[11px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4">Motivo / Justificación</th>
                <th className="py-3 px-4">Registrado Por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No hay movimientos registrados recientemente.
                  </td>
                </tr>
              ) : (
                movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {formatDate(mov.date)}
                    </td>
                    <td className="py-3 px-4">
                      {mov.type === 'entrada' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <ArrowDownLeft className="w-3 h-3" /> Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                          <ArrowUpRight className="w-3 h-3" /> Salida
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#2C362D]">{mov.productName}</td>
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {mov.type === 'entrada' ? `+${mov.quantity}` : `-${mov.quantity}`}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs">{mov.reason}</td>
                    <td className="py-3 px-4 text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3" /> {mov.staffName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
