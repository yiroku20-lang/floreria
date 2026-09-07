import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Tag,
  CheckCircle,
  Truck,
  Store,
} from 'lucide-react';
import { CartItem, DeliveryType, Order, DedicationCard } from '../types';
import { formatCurrency, transformDriveUrl } from '../utils/driveUtils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderCreated: (order: Order) => void;
  whatsappNumber: string;
  defaultDeliveryFee: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
  whatsappNumber,
  defaultDeliveryFee,
}) => {
  // Step 1: Cart Items / Step 2: Checkout Form / Step 3: Confirmation
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('San Isidro');
  const [reference, setReference] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('Hoy');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('Tarde (14:00 - 19:00)');
  const [paymentMethod, setPaymentMethod] = useState('Yape / Plin / Transferencia');
  const [notes, setNotes] = useState('');

  // Dedication Card
  const [cardEnabled, setCardEnabled] = useState(false);
  const [cardTo, setCardTo] = useState('');
  const [cardFrom, setCardFrom] = useState('');
  const [cardMessage, setCardMessage] = useState('');

  // Promo coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percentage
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Newly placed order
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Financial calculations
  const rawSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (rawSubtotal * appliedDiscount) / 100;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const deliveryFee = deliveryType === 'delivery' ? defaultDeliveryFee : 0;
  const total = subtotal + deliveryFee;

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'TULIPAN15' || code === 'ROSANFER15') {
      setAppliedDiscount(15);
      setCouponSuccess('¡Cupón aplicado! 15% de descuento.');
    } else if (code === 'FLORES10') {
      setAppliedDiscount(10);
      setCouponSuccess('¡Cupón aplicado! 10% de descuento.');
    } else {
      setCouponError('Cupón inválido o expirado.');
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    setStep('checkout');
  };

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor, ingresa tu nombre y teléfono para procesar el pedido.');
      return;
    }

    if (deliveryType === 'delivery' && !address.trim()) {
      alert('Por favor ingresa la dirección de entrega.');
      return;
    }

    const orderNumber = `RF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customerName,
      customerPhone,
      deliveryType,
      address: deliveryType === 'delivery' ? address : undefined,
      district: deliveryType === 'delivery' ? district : undefined,
      reference: deliveryType === 'delivery' ? reference : undefined,
      deliveryDate,
      deliveryTimeSlot,
      dedicationCard: cardEnabled
        ? {
            enabled: true,
            to: cardTo,
            from: cardFrom,
            message: cardMessage,
          }
        : undefined,
      items: [...items],
      subtotal,
      deliveryFee,
      total,
      status: 'Nuevo',
      paymentMethod,
      notes,
    };

    // Save order in state/intranet
    onOrderCreated(newOrder);
    setPlacedOrder(newOrder);

    // Build pre-configured WhatsApp message
    let messageText = `🌿 *NUEVO PEDIDO: ${orderNumber} - ROSANFER FLORERÍA* 🌿\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    messageText += `👤 *Cliente:* ${customerName}\n`;
    messageText += `📱 *Teléfono:* ${customerPhone}\n`;
    messageText += `📦 *Modalidad:* ${
      deliveryType === 'delivery' ? 'Envío a Domicilio' : 'Recojo en Boutique'
    }\n`;

    if (deliveryType === 'delivery') {
      messageText += `📍 *Dirección:* ${address} (${district})\n`;
      if (reference.trim()) {
        messageText += `📌 *Referencia:* ${reference}\n`;
      }
    } else {
      messageText += `📍 *Punto de recojo:* Boutique Rosanfer (Av. Conquistadores 780, San Isidro)\n`;
    }

    messageText += `🗓️ *Fecha deseada:* ${deliveryDate}\n`;
    messageText += `⏰ *Horario:* ${deliveryTimeSlot}\n`;

    if (cardEnabled && (cardTo.trim() || cardMessage.trim())) {
      messageText += `\n💌 *TARJETA DE DEDICATORIA:*\n`;
      if (cardTo.trim()) messageText += `• Para: ${cardTo}\n`;
      if (cardFrom.trim()) messageText += `• De: ${cardFrom}\n`;
      if (cardMessage.trim()) messageText += `• Mensaje: "${cardMessage}"\n`;
    }

    messageText += `\n🌸 *DETALLE DE FLORES & PRODUCTOS:*\n`;
    items.forEach((it) => {
      messageText += `• ${it.quantity}x ${it.product.name} - ${formatCurrency(
        it.product.price * it.quantity
      )}\n`;
    });

    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    messageText += `*Subtotal:* ${formatCurrency(rawSubtotal)}\n`;
    if (appliedDiscount > 0) {
      messageText += `*Descuento (${appliedDiscount}%):* -${formatCurrency(discountAmount)}\n`;
    }
    messageText += `*Costo de Envío:* ${formatCurrency(deliveryFee)}\n`;
    messageText += `*💰 TOTAL A PAGAR:* ${formatCurrency(total)}\n`;
    messageText += `*Forma de pago:* ${paymentMethod}\n`;

    if (notes.trim()) {
      messageText += `📝 *Observaciones:* ${notes}\n`;
    }

    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    messageText += `_Generado automáticamente desde rosanferfloreria.com_\n`;
    messageText += `¡Quedo a la espera de sus datos de pago para confirmar mi pedido! Muchas gracias.`;

    // Encode for WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

    // Clear cart and switch to success view
    onClearCart();
    setStep('success');

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-[#FBF9F6] shadow-2xl flex flex-col border-l border-[#5C715E]/15">
          {/* Header */}
          <div className="p-5 border-b border-[#5C715E]/15 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#5C715E]" />
              <h2 className="font-serif-boutique font-bold text-xl text-[#2C362D]">
                {step === 'cart'
                  ? `Tu Carrito (${items.reduce((s, i) => s + i.quantity, 0)})`
                  : step === 'checkout'
                  ? 'Finalizar Pedido WhatsApp'
                  : '¡Pedido Generado!'}
              </h2>
            </div>
            <button
              id="btn-close-cart"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: ITEMS IN CART */}
          {step === 'cart' && (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto rounded-full bg-[#5C715E]/10 flex items-center justify-center text-[#5C715E] mb-4">
                      <ShoppingBag className="w-10 h-10 stroke-1" />
                    </div>
                    <p className="font-serif-boutique font-bold text-xl text-[#2C362D]">
                      Tu carrito está vacío
                    </p>
                    <p className="mt-1 text-xs text-[#2C362D]/60 max-w-xs mx-auto">
                      Explora nuestros arreglos florales, tulipanes holandeses y regalos boutique.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-6 px-6 py-2.5 rounded-full bg-[#5C715E] text-white text-xs font-semibold hover:bg-[#4a5c4c]"
                    >
                      Ver Arreglos
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-3 bg-white rounded-2xl border border-[#5C715E]/10 shadow-xs items-center"
                    >
                      <img
                        src={transformDriveUrl(item.product.imageUrl)}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#5C715E] tracking-wider">
                          {item.product.category}
                        </span>
                        <h4 className="font-serif-boutique font-bold text-base text-[#2C362D] truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs font-semibold text-[#2C362D] mt-0.5">
                          {formatCurrency(item.product.price)}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center rounded-lg border border-[#5C715E]/20 bg-[#FBF9F6]">
                            <button
                              onClick={() =>
                                onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                              }
                              className="w-6 h-6 flex items-center justify-center text-xs text-[#2C362D] hover:bg-[#5C715E]/10"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  Math.min(item.product.stock, item.quantity + 1)
                                )
                              }
                              className="w-6 h-6 flex items-center justify-center text-xs text-[#2C362D] hover:bg-[#5C715E]/10"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-auto"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Promo Code input in cart */}
                {items.length > 0 && (
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Cupón de descuento (ej: TULIPAN15)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#5C715E]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#D49A89] uppercase"
                        />
                        <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#5C715E]/15 text-[#5C715E] hover:bg-[#5C715E] hover:text-white transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                    {couponSuccess && (
                      <p className="text-xs text-emerald-700 font-medium mt-1">
                        {couponSuccess}
                      </p>
                    )}
                    {couponError && (
                      <p className="text-xs text-red-500 font-medium mt-1">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {items.length > 0 && (
                <div className="p-5 bg-white border-t border-[#5C715E]/15 space-y-3">
                  <div className="space-y-1.5 text-xs text-[#2C362D]/80">
                    <div className="flex justify-between">
                      <span>Subtotal de flores:</span>
                      <span className="font-semibold text-[#2C362D]">{formatCurrency(rawSubtotal)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Descuento aplicado ({appliedDiscount}%):</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#5C715E]">
                      <span>Envío:</span>
                      <span>Se calcula en el siguiente paso</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dashed border-[#5C715E]/20 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#2C362D]">Total estimado:</span>
                    <span className="text-xl font-serif-boutique font-bold text-[#5C715E]">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <button
                    id="btn-go-to-checkout"
                    onClick={handleProceedToCheckout}
                    className="w-full py-3.5 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Continuar con Datos de Entrega</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {step === 'checkout' && (
            <form onSubmit={handleSendWhatsAppOrder} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="text-xs font-semibold text-[#5C715E] hover:underline flex items-center gap-1"
                >
                  ← Volver al carrito
                </button>

                {/* Delivery Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#5C715E] uppercase tracking-wider mb-2">
                    Tipo de Entrega
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                        deliveryType === 'delivery'
                          ? 'border-[#5C715E] bg-[#5C715E]/10 text-[#2C362D] ring-2 ring-[#5C715E]/30'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Truck className="w-4 h-4 text-[#5C715E]" />
                        <span>Envío a Domicilio</span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {formatCurrency(defaultDeliveryFee)} en Cusco y alrededores
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                        deliveryType === 'pickup'
                          ? 'border-[#5C715E] bg-[#5C715E]/10 text-[#2C362D] ring-2 ring-[#5C715E]/30'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Store className="w-4 h-4 text-[#5C715E]" />
                        <span>Recojo en Tienda</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold">Gratis</span>
                    </button>
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div className="bg-white p-4 rounded-2xl border border-[#5C715E]/15 space-y-3">
                  <h4 className="text-xs font-bold text-[#5C715E] uppercase tracking-wider">
                    Datos de Contacto
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-[#2C362D] mb-1">
                      Tu Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Laura Ramírez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2C362D] mb-1">
                      Tu Número de WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 987 654 321"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
                    />
                  </div>
                </div>

                {/* Delivery Address fields */}
                {deliveryType === 'delivery' && (
                  <div className="bg-white p-4 rounded-2xl border border-[#5C715E]/15 space-y-3">
                    <h4 className="text-xs font-bold text-[#5C715E] uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D49A89]" />
                      <span>Dirección de Entrega</span>
                    </h4>

                    <div>
                      <label className="block text-xs font-medium text-[#2C362D] mb-1">
                        Distrito *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
                      >
                        <option value="San Isidro">San Isidro</option>
                        <option value="Miraflores">Miraflores</option>
                        <option value="Barranco">Barranco</option>
                        <option value="Surco">Santiago de Surco</option>
                        <option value="La Molina">La Molina</option>
                        <option value="San Borja">San Borja</option>
                        <option value="Jesús María">Jesús María</option>
                        <option value="Magdalena">Magdalena del Mar</option>
                        <option value="Lince">Lince</option>
                        <option value="Pueblo Libre">Pueblo Libre</option>
                        <option value="San Miguel">San Miguel</option>
                        <option value="Otro Distrito">Otro Distrito</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2C362D] mb-1">
                        Dirección exacta (Calle, Av, Número, Dpto) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Av. Las Flores 452, Dpto 301"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2C362D] mb-1">
                        Referencia para el repartidor
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Frente al parque, rejas blancas"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
                      />
                    </div>
                  </div>
                )}

                {/* Delivery Date & Time */}
                <div className="bg-white p-4 rounded-2xl border border-[#5C715E]/15 space-y-3">
                  <h4 className="text-xs font-bold text-[#5C715E] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D49A89]" />
                    <span>Fecha y Turno</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#2C362D] mb-1">Día</label>
                      <select
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
                      >
                        <option value="Hoy Mismo">Hoy Mismo (Express)</option>
                        <option value="Mañana">Mañana</option>
                        <option value="En 2 días">En 2 días</option>
                        <option value="Fecha especial / Por coordinar">Por coordinar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2C362D] mb-1">Turno</label>
                      <select
                        value={deliveryTimeSlot}
                        onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
                      >
                        <option value="Mañana (09:00 - 13:00)">Mañana (09:00 - 13:00)</option>
                        <option value="Tarde (14:00 - 19:00)">Tarde (14:00 - 19:00)</option>
                        <option value="Todo el día">Cualquier hora</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dedication Card Accordion */}
                <div className="bg-white p-4 rounded-2xl border border-[#5C715E]/15">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="checkbox-dedication-card"
                      className="text-xs font-bold text-[#5C715E] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#D49A89]" />
                      <span>Incluir Tarjeta de Dedicatoria (Gratis)</span>
                    </label>
                    <input
                      id="checkbox-dedication-card"
                      type="checkbox"
                      checked={cardEnabled}
                      onChange={(e) => setCardEnabled(e.target.checked)}
                      className="w-4 h-4 text-[#5C715E] rounded-sm focus:ring-[#5C715E] cursor-pointer"
                    />
                  </div>

                  {cardEnabled && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-0.5">Para:</label>
                          <input
                            type="text"
                            placeholder="Nombre del destinatario"
                            value={cardTo}
                            onChange={(e) => setCardTo(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-[#FBF9F6]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-0.5">De parte de:</label>
                          <input
                            type="text"
                            placeholder="Tu nombre"
                            value={cardFrom}
                            onChange={(e) => setCardFrom(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-[#FBF9F6]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-0.5">Mensaje especial:</label>
                        <textarea
                          rows={2}
                          placeholder="Escribe tus palabras de amor, felicitación o gratitud..."
                          value={cardMessage}
                          onChange={(e) => setCardMessage(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-[#FBF9F6]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment preference */}
                <div className="bg-white p-4 rounded-2xl border border-[#5C715E]/15">
                  <label className="block text-xs font-bold text-[#5C715E] uppercase tracking-wider mb-2">
                    Preferencia de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E]"
                  >
                    <option value="Yape / Plin">Yape o Plin</option>
                    <option value="Transferencia BCP / Interbank / BBVA">Transferencia Bancaria (BCP, Interbank, BBVA)</option>
                    <option value="Efectivo contraentrega">Efectivo contraentrega (sujeto a cobertura)</option>
                    <option value="Tarjeta de crédito/débito vía link">Link de pago con tarjeta</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    * Al enviar por WhatsApp, el personal de Rosanfer te brindará el QR o número de cuenta exacto.
                  </p>
                </div>
              </div>

              {/* Checkout Submission Button */}
              <div className="p-5 bg-white border-t border-[#5C715E]/15 space-y-3">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-gray-500">Total a pagar:</span>
                  <span className="text-xl font-serif-boutique font-bold text-[#5C715E]">
                    {formatCurrency(total)}
                  </span>
                </div>

                <button
                  type="submit"
                  id="btn-submit-whatsapp-order"
                  className="w-full py-3.5 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#D49A89]" />
                  <span>Enviar Pedido por WhatsApp</span>
                </button>
                <p className="text-[11px] text-center text-gray-400">
                  Se abrirá WhatsApp con todos los detalles listos para enviar.
                </p>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && placedOrder && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>

              <span className="text-xs uppercase font-bold text-[#5C715E] tracking-widest">
                ¡Muchas Gracias por tu Pedido!
              </span>
              <h3 className="text-2xl font-serif-boutique font-bold text-[#2C362D] mt-1">
                Orden #{placedOrder.orderNumber}
              </h3>

              <p className="text-xs text-[#2C362D]/70 mt-2 max-w-xs leading-relaxed">
                Hemos registrado tu pedido en nuestro sistema central. Si no se abrió WhatsApp
                automáticamente, puedes presionar el botón abajo para enviar el mensaje preconfigurado.
              </p>

              <div className="w-full mt-6 p-4 rounded-2xl bg-white border border-[#5C715E]/15 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente:</span>
                  <span className="font-semibold text-[#2C362D]">{placedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total a pagar:</span>
                  <span className="font-bold text-[#5C715E]">{formatCurrency(placedOrder.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Entrega:</span>
                  <span>{placedOrder.deliveryType === 'delivery' ? 'A domicilio' : 'Recojo en tienda'}</span>
                </div>
              </div>

              <div className="w-full mt-6 space-y-2.5">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-full bg-[#5C715E] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-[#4a5c4c]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Abrir WhatsApp Nuevamente</span>
                </a>

                <button
                  onClick={() => {
                    setStep('cart');
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-full border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Regresar al Catálogo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
