import React, { useState, useEffect } from 'react';
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
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  QrCode,
  Building2,
  Smartphone,
  AlertTriangle,
  Wallet,
  Sparkles,
  Info,
} from 'lucide-react';
import { CartItem, DeliveryType, Order, DedicationCard, PromoConfig, BoutiqueSettings } from '../types';
import { formatCurrency, transformDriveUrl } from '../utils/driveUtils';
import {
  getPeruTime,
  getAvailableSlots,
  SLOT_MORNING,
  SLOT_AFTERNOON,
  SLOT_ALL_DAY,
  PeruTimeData,
} from '../utils/deliveryTimeUtils';

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
  storeAddress?: string;
  storeCity?: string;
  promoConfig?: PromoConfig;
  settings?: BoutiqueSettings;
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
  storeAddress,
  storeCity,
  promoConfig,
  settings,
}) => {
  // Step 1: Cart Items / Step 2: Checkout Form / Step 3: Confirmation
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');

  // Horario inteligente en Cusco (America/Lima)
  const [timeData, setTimeData] = useState<PeruTimeData>(getPeruTime);

  // Recalcular hora en tiempo real al abrir el carrito o cada 30 segundos
  useEffect(() => {
    if (!isOpen) return;
    const updateTime = () => {
      const fresh = getPeruTime();
      setTimeData(fresh);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const todayStr = timeData.todayDateStr;
  const tomorrowStr = timeData.tomorrowDateStr;

  // Selección inicial adaptativa: si hoy ya está cerrado (>= 14:00 hrs), arranca en 'tomorrow'
  const initialDateOption = timeData.isSameDayAllowed ? 'today' : 'tomorrow';
  const initialSelectedDate = timeData.isSameDayAllowed ? todayStr : tomorrowStr;
  const initialDeliveryDate = timeData.isSameDayAllowed
    ? `Hoy (${todayStr})`
    : `Mañana (${tomorrowStr})`;
  const initialSlot = timeData.isSameDayAllowed
    ? (timeData.availableSlotsToday[0] || SLOT_AFTERNOON)
    : SLOT_MORNING;

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Wanchaq');
  const [reference, setReference] = useState('');
  const [dateOption, setDateOption] = useState<'today' | 'tomorrow' | 'custom'>(initialDateOption);
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [deliveryDate, setDeliveryDate] = useState(initialDeliveryDate);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(initialSlot);
  const [paymentMethod, setPaymentMethod] = useState('Yape o Plin');
  const [notes, setNotes] = useState('');

  // Sincronizar automáticamente turnos y opciones válidas si cambia el reloj
  useEffect(() => {
    if (dateOption === 'today') {
      if (!timeData.isSameDayAllowed) {
        setDateOption('tomorrow');
        setSelectedDate(tomorrowStr);
        setDeliveryDate(`Mañana (${tomorrowStr})`);
        setDeliveryTimeSlot(SLOT_MORNING);
        return;
      }

      // Si el turno actual seleccionado ya no es válido para hoy, conmutar al primero válido
      const validSlots = timeData.availableSlotsToday;
      if (!validSlots.includes(deliveryTimeSlot)) {
        if (validSlots.length > 0) {
          setDeliveryTimeSlot(validSlots[0]);
        }
      }
    }
  }, [timeData, dateOption, deliveryTimeSlot, tomorrowStr]);

  // Dedication Card
  const [cardEnabled, setCardEnabled] = useState(false);
  const [cardTo, setCardTo] = useState('');
  const [cardFrom, setCardFrom] = useState('');
  const [cardMessage, setCardMessage] = useState('');

  // Newly placed order & payment states
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [successWhatsappUrl, setSuccessWhatsappUrl] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Bank & Wallet numbers from settings
  const yapeNum = settings?.yapeNumber || '961 203 577';
  const yapeHolder = settings?.yapeHolder || 'Rosanfer Florería / Andrea V.';

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenWhatsAppSuccess = () => {
    if (successWhatsappUrl) {
      window.open(successWhatsappUrl, '_blank');
    } else {
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  if (!isOpen) return null;

  // Financial calculations
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  // Promoción vigente: Cada pedido incluye el delivery dentro de la ciudad de Cusco
  const isCuscoDeliveryIncluded = true;
  const deliveryFee = deliveryType === 'delivery' ? (isCuscoDeliveryIncluded ? 0 : defaultDeliveryFee) : 0;
  const total = subtotal + deliveryFee;

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

    // Validación inteligente de horario según el reloj del taller en Cusco
    const currentPeru = getPeruTime();
    const isToday =
      dateOption === 'today' ||
      (dateOption === 'custom' && selectedDate === currentPeru.todayDateStr);

    if (isToday) {
      if (!currentPeru.isSameDayAllowed) {
        alert(
          '⏰ Estimado cliente: los pedidos con entrega para hoy están cerrados por tiempo de elaboración artesanal (después de las 14:00 hrs en Cusco). Tu pedido se programará a partir de mañana.'
        );
        setDateOption('tomorrow');
        setSelectedDate(currentPeru.tomorrowDateStr);
        setDeliveryDate(`Mañana (${currentPeru.tomorrowDateStr})`);
        setDeliveryTimeSlot(SLOT_MORNING);
        return;
      }

      if (deliveryTimeSlot.includes('Mañana') && !currentPeru.isMorningSlotAllowedToday) {
        alert(
          `⏰ Estimado cliente: por la hora del pedido (${currentPeru.formattedTime} en Cusco), el turno Mañana ya está en ruta o concluido. Tu arreglo será entregado hoy en el turno Tarde (14:00 - 19:00).`
        );
        setDeliveryTimeSlot(SLOT_AFTERNOON);
        return;
      }
    }

    const orderNumber = `RF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      address: deliveryType === 'delivery' ? (address || '') : '',
      district: deliveryType === 'delivery' ? (district || '') : '',
      reference: deliveryType === 'delivery' ? (reference || '') : '',
      deliveryDate: deliveryDate || '',
      deliveryTimeSlot: deliveryTimeSlot || '',
      dedicationCard: cardEnabled
        ? {
            enabled: true,
            to: cardTo || '',
            from: cardFrom || '',
            message: cardMessage || '',
          }
        : {
            enabled: false,
            to: '',
            from: '',
            message: '',
          },
      items: [...items],
      subtotal,
      deliveryFee,
      total,
      status: paymentMethod.toLowerCase().includes('contraentrega')
        ? 'Nuevo'
        : 'En espera de pago',
      paymentMethod,
      notes: notes || '',
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
      messageText += `📍 *Punto de recojo:* ${storeAddress || 'Av. La Cultura 1420 (frente a UNSAAC), Magisterio'}, ${storeCity || 'Cusco'}\n`;
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
    messageText += `*Subtotal:* ${formatCurrency(subtotal)}\n`;
    messageText += `*Costo de Envío:* ¡GRATIS! (Promoción: Delivery incluido dentro de la ciudad de Cusco)\n`;
    if (notes.trim()) {
      messageText += `📝 *Observaciones:* ${notes}\n`;
    }
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    messageText += `💰 *TOTAL A PAGAR:* ${formatCurrency(total)}\n`;
    messageText += `💳 *MÉTODO DE PAGO:* Yape o Plin al número: ${yapeNum} (${yapeHolder})\n`;
    messageText += `📎 *COMPROBANTE:* Adjunto mi captura de Yape/Plin por este chat para procesar mi orden.\n`;
    messageText += `📞 *Llamadas y Consultas:* 906 800 626\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    messageText += `_Generado desde la tienda web rosanferfloreria.com_`;

    // Encode for WhatsApp URL
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
    setSuccessWhatsappUrl(whatsappUrl);

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
                      Explora nuestros arreglos florales, rosas selectas, girasoles y regalos boutique.
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
                      <div className="w-20 h-20 rounded-xl overflow-hidden relative border border-gray-100 bg-[#F4F1EC] shrink-0 aspect-square">
                        <img
                          src={transformDriveUrl(item.product.imageUrl)}
                          alt={item.product.name}
                          style={
                            item.product.framing
                              ? {
                                  objectPosition: `${50 + (item.product.framing.x || 0)}% ${50 + (item.product.framing.y || 0)}%`,
                                  transform: `scale(${Math.max(1, item.product.framing.zoom || 1)}) rotate(${item.product.framing.rotation || 0}deg)`,
                                  transformOrigin: 'center center',
                                }
                              : undefined
                          }
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
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
              </div>

              {/* Cart Footer */}
              {items.length > 0 && (
                <div className="p-5 bg-white border-t border-[#5C715E]/15 space-y-3">
                  <div className="space-y-1.5 text-xs text-[#2C362D]/80">
                    <div className="flex justify-between">
                      <span>Subtotal de flores:</span>
                      <span className="font-semibold text-[#2C362D]">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-700">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Envío en Ciudad de Cusco:</span>
                      </span>
                      <span className="font-bold text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        ¡Incluido por Promoción!
                      </span>
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
                  <div className="p-3.5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/70 text-[#2C362D] flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs block text-[#2C362D]">Envío a Domicilio en todo Cusco</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                            ¡Promoción Activa!
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-900/90 font-medium block mt-0.5">
                          Por promoción, cada pedido incluye el delivery dentro de la ciudad de Cusco
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs shrink-0">
                      S/. 0.00
                    </span>
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
                        <option value="Wanchaq">Wanchaq</option>
                        <option value="Cusco (Centro Histórico)">Cusco (Centro Histórico)</option>
                        <option value="San Sebastián">San Sebastián</option>
                        <option value="Santiago">Santiago</option>
                        <option value="San Jerónimo">San Jerónimo</option>
                        <option value="Poroy">Poroy</option>
                        <option value="Saylla">Saylla</option>
                        <option value="Otro Distrito / Alrededores">Otro Distrito / Alrededores</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#2C362D] mb-1">
                        Dirección exacta (Calle, Av, Número, Dpto) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Av. De la Cultura 1420, Dpto 301"
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
                <div className="bg-white p-4 rounded-2xl border border-[#5C715E]/15 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#5C715E] uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D49A89]" />
                      <span>Fecha y Turno de Entrega</span>
                    </h4>

                    {/* Clock badge showing current local time in Cusco */}
                    <div className="flex items-center gap-1 text-[11px] font-medium text-[#5C715E] bg-[#5C715E]/10 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>Cusco: {timeData.formattedTime}</span>
                    </div>
                  </div>

                  {/* Informative status notice for artisanal preparation */}
                  <div className="p-2.5 rounded-xl bg-[#FBF9F6] border border-[#5C715E]/15 flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#5C715E] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-[#2C362D]/80">
                      {dateOption === 'today'
                        ? timeData.noticeMessage
                        : 'Cada arreglo es elaborado a mano con flores frescas bajo pedido. Puedes programar la entrega para cualquier fecha y turno.'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-[#2C362D]">
                          Día de Entrega *
                        </label>
                        {!timeData.isSameDayAllowed && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Entregas para hoy cerradas por horario
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 mb-2">
                        {/* Botón HOY con validación inteligente */}
                        <button
                          type="button"
                          disabled={!timeData.isSameDayAllowed}
                          onClick={() => {
                            if (!timeData.isSameDayAllowed) return;
                            setDateOption('today');
                            setSelectedDate(todayStr);
                            setDeliveryDate(`Hoy (${todayStr})`);
                            if (timeData.availableSlotsToday.length > 0) {
                              setDeliveryTimeSlot(timeData.availableSlotsToday[0]);
                            }
                          }}
                          className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                            !timeData.isSameDayAllowed
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                              : dateOption === 'today'
                              ? 'bg-[#5C715E] text-white border-[#5C715E] shadow-xs cursor-pointer'
                              : 'bg-[#FBF9F6] text-[#2C362D] border-gray-200 hover:bg-gray-100 cursor-pointer'
                          }`}
                          title={
                            !timeData.isSameDayAllowed
                              ? 'Pedidos para hoy cerrados (a partir de las 14:00 hrs)'
                              : 'Entrega para el día de hoy'
                          }
                        >
                          Hoy
                          {!timeData.isSameDayAllowed && (
                            <span className="text-[10px] block font-normal text-gray-400">
                              (Cerrado)
                            </span>
                          )}
                        </button>

                        {/* Botón MAÑANA */}
                        <button
                          type="button"
                          onClick={() => {
                            setDateOption('tomorrow');
                            setSelectedDate(tomorrowStr);
                            setDeliveryDate(`Mañana (${tomorrowStr})`);
                            setDeliveryTimeSlot(SLOT_MORNING);
                          }}
                          className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            dateOption === 'tomorrow'
                              ? 'bg-[#5C715E] text-white border-[#5C715E] shadow-xs'
                              : 'bg-[#FBF9F6] text-[#2C362D] border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          Mañana
                        </button>

                        {/* Botón OTRA FECHA */}
                        <button
                          type="button"
                          onClick={() => {
                            setDateOption('custom');
                            const targetDate = selectedDate === todayStr && !timeData.isSameDayAllowed ? tomorrowStr : selectedDate;
                            setSelectedDate(targetDate);
                            setDeliveryDate(`Fecha programada: ${targetDate}`);
                          }}
                          className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            dateOption === 'custom'
                              ? 'bg-[#5C715E] text-white border-[#5C715E] shadow-xs'
                              : 'bg-[#FBF9F6] text-[#2C362D] border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          Otra Fecha
                        </button>
                      </div>

                      {/* Selector de fecha nativo (con fecha mínima bloqueada según disponibilidad) */}
                      <div className="relative">
                        <input
                          type="date"
                          min={timeData.isSameDayAllowed ? todayStr : tomorrowStr}
                          value={selectedDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;

                            // Si eligió hoy pero hoy está cerrado, forzar mañana
                            if (val === todayStr && !timeData.isSameDayAllowed) {
                              setSelectedDate(tomorrowStr);
                              setDateOption('tomorrow');
                              setDeliveryDate(`Mañana (${tomorrowStr})`);
                              alert(
                                '⏰ Estimado cliente: los pedidos con entrega para hoy están cerrados. Tu fecha fue asignada para mañana.'
                              );
                              return;
                            }

                            setSelectedDate(val);
                            if (val === todayStr) {
                              setDateOption('today');
                              setDeliveryDate(`Hoy (${val})`);
                              if (timeData.availableSlotsToday.length > 0) {
                                setDeliveryTimeSlot(timeData.availableSlotsToday[0]);
                              }
                            } else if (val === tomorrowStr) {
                              setDateOption('tomorrow');
                              setDeliveryDate(`Mañana (${val})`);
                            } else {
                              setDateOption('custom');
                              setDeliveryDate(`Fecha programada: ${val}`);
                            }
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E] text-[#2C362D]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-[#2C362D]">
                          Turno de Horario *
                        </label>
                        {dateOption === 'today' && !timeData.isMorningSlotAllowedToday && timeData.isSameDayAllowed && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                            Solo Turno Tarde disponible
                          </span>
                        )}
                      </div>

                      <select
                        value={deliveryTimeSlot}
                        onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E] text-[#2C362D] font-medium"
                      >
                        {getAvailableSlots(dateOption, selectedDate, timeData).map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>

                      {/* Explicación amigable si para hoy solo está disponible el turno tarde */}
                      {dateOption === 'today' && !timeData.isMorningSlotAllowedToday && timeData.isSameDayAllowed && (
                        <p className="mt-1.5 text-[11px] text-[#2C362D]/75 italic flex items-center gap-1">
                          <span>
                            ℹ️ Al ser más de las 09:00 hrs en Cusco ({timeData.formattedTime}), el turno mañana se encuentra en reparto. Tu pedido se confeccionará fresco para la tarde (14:00 - 19:00).
                          </span>
                        </p>
                      )}
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

                {/* Único Método de Pago: Yape o Plin al 961 203 577 */}
                <div className="bg-gradient-to-br from-emerald-50/90 to-[#FBF9F6] p-4 rounded-2xl border-2 border-emerald-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <span>Método de Pago: Yape o Plin</span>
                    </label>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-700 text-white px-2.5 py-0.5 rounded-full shadow-2xs tracking-wider">
                      Único medio
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800/80 block">
                        Número de Pago (Yape / Plin):
                      </span>
                      <span className="font-mono text-base font-extrabold text-[#2C362D] tracking-wider">
                        {yapeNum}
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">
                        Titular: <strong className="text-gray-700">{yapeHolder}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(yapeNum, 'yape-checkout')}
                      className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copiar número de Yape/Plin"
                    >
                      {copiedKey === 'yape-checkout' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                    * Tu pedido se valida automáticamente tras enviar la captura de tu Yape o Plin al WhatsApp de atención al cliente (<strong>906 800 626</strong>).
                  </p>
                </div>
              </div>

              {/* Checkout Submission Button */}
              <div className="p-5 bg-white border-t border-[#5C715E]/15 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal de flores:</span>
                    <span className="font-medium text-[#2C362D]">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-700">
                    <span>Delivery en Ciudad de Cusco:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="line-through text-gray-400 text-[10px]">S/. 12.00</span>
                      <span className="font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                        ¡Incluido por Promoción!
                      </span>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-dashed border-gray-200 flex justify-between items-baseline">
                    <span className="text-gray-700 font-bold">Total a pagar:</span>
                    <span className="text-xl font-serif-boutique font-bold text-[#5C715E]">
                      {formatCurrency(total)}
                    </span>
                  </div>
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

          {/* STEP 3: SUCCESS CONFIRMATION & PAYMENT DETAILS */}
          {step === 'success' && placedOrder && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3 shadow-xs">
                <CheckCircle className="w-8 h-8" />
              </div>

              <span className="text-[11px] uppercase font-bold text-[#5C715E] tracking-widest">
                ¡Pedido Registrado con Éxito!
              </span>
              <h3 className="text-xl font-serif-boutique font-bold text-[#2C362D] mt-0.5">
                Orden #{placedOrder.orderNumber}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Cliente: <strong className="text-[#2C362D]">{placedOrder.customerName}</strong>
              </p>

              {/* Highlighted Boutique Payment Box */}
              <div className="w-full mt-4 p-4 sm:p-5 rounded-3xl bg-white border-2 border-[#5C715E]/20 shadow-sm text-left relative overflow-hidden">
                {/* Subtle Rosanfer decorative accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D49A89]/20 to-transparent rounded-bl-full pointer-events-none" />

                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#5C715E]/10 text-[#5C715E] flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C715E]">
                      Datos para tu Pago Directo
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Único Medio: Yape o Plin
                  </span>
                </div>

                {/* Total a pagar destacado */}
                <div className="bg-[#FBF9F6] p-3.5 rounded-2xl border border-[#5C715E]/15 flex items-center justify-between mb-3.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                      Total a pagar
                    </span>
                    <span className="text-2xl font-bold font-serif-boutique text-[#2C362D]">
                      {formatCurrency(placedOrder?.total)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full block">
                      Delivery en Cusco Incluido (S/. 0.00)
                    </span>
                  </div>
                </div>

                {/* Yape / Plin Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Yape o Plin:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(yapeNum, 'yape')}
                      className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                      title="Copiar número de Yape/Plin"
                    >
                      {copiedKey === 'yape' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiar número</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-0.5">
                    <span className="text-xl font-bold text-[#2C362D] tracking-wider font-mono">
                      {yapeNum}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium">
                    Titular: <span className="font-bold text-emerald-950">{yapeHolder}</span>
                  </p>
                </div>
              </div>

              {/* Clear Instruction Banner */}
              <div className="w-full mt-3.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                <span className="text-base shrink-0 select-none">⚠️</span>
                <p className="leading-relaxed">
                  <strong className="font-bold text-amber-950">Importante:</strong> Los arreglos florales se elaboran y entregan únicamente con el pago verificado. Por favor realiza tu abono mediante Yape o Plin al <strong>{yapeNum}</strong> y adjunta tu comprobante en el WhatsApp de atención (<strong>906 800 626</strong>).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-4 space-y-2.5">
                <button
                  id="btn-whatsapp-send-comprobante"
                  type="button"
                  onClick={handleOpenWhatsAppSuccess}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <span className="text-base">📱</span>
                  <span>Enviar Pedido y Adjuntar Comprobante por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('cart');
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
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
