import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Download,
  Send,
  Sparkles,
  Heart,
  Share2,
  Copy,
  Check,
  Palette,
  Eye,
  ShoppingBag,
  Flower2,
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrency, formatDate } from '../utils/driveUtils';
import { RosanferLogo } from './RosanferLogo';

const FIXED_WHATSAPP_NUMBER = '906800626';
const FIXED_WHATSAPP_DISPLAY = '906 800 626';

interface ThankYouCardModalProps {
  order: Order;
  onClose: () => void;
  whatsappNumber?: string;
}

type CardTheme = 'botanical' | 'luxury_dark' | 'blush';

interface ThemeConfig {
  id: CardTheme;
  name: string;
  badgeBg: string;
  cardBg: string;
  borderClass: string;
  textColor: string;
  accentColor: string;
  // Canvas specific styles
  canvasBg: string;
  canvasBorder: string;
  canvasInnerBorder: string;
  canvasPrimaryText: string;
  canvasAccentText: string;
  canvasMutedText: string;
  canvasPillBg: string;
}

const THEMES: Record<CardTheme, ThemeConfig> = {
  botanical: {
    id: 'botanical',
    name: 'Verde Botánico',
    badgeBg: 'bg-[#5C715E] text-white',
    cardBg: 'bg-[#FBF9F6]',
    borderClass: 'border-[#5C715E]/30',
    textColor: 'text-[#2C362D]',
    accentColor: '#5C715E',
    canvasBg: '#FBF9F6',
    canvasBorder: '#5C715E',
    canvasInnerBorder: '#D49A89',
    canvasPrimaryText: '#2C362D',
    canvasAccentText: '#5C715E',
    canvasMutedText: '#6B7A6D',
    canvasPillBg: '#EAE6DF',
  },
  luxury_dark: {
    id: 'luxury_dark',
    name: 'Atelier Nocturno',
    badgeBg: 'bg-[#2C362D] text-[#D4AF37]',
    cardBg: 'bg-[#1E2520]',
    borderClass: 'border-[#D4AF37]/40',
    textColor: 'text-[#FAF7F2]',
    accentColor: '#D4AF37',
    canvasBg: '#1A211C',
    canvasBorder: '#D4AF37',
    canvasInnerBorder: '#5C715E',
    canvasPrimaryText: '#FAF7F2',
    canvasAccentText: '#D4AF37',
    canvasMutedText: '#A3B3A6',
    canvasPillBg: '#2A352D',
  },
  blush: {
    id: 'blush',
    name: 'Rosa & Oro',
    badgeBg: 'bg-[#D49A89] text-white',
    cardBg: 'bg-[#FFF9F7]',
    borderClass: 'border-[#D49A89]/40',
    textColor: 'text-[#3E2D2B]',
    accentColor: '#B87C6B',
    canvasBg: '#FFF8F6',
    canvasBorder: '#D49A89',
    canvasInnerBorder: '#C5A880',
    canvasPrimaryText: '#3E2D2B',
    canvasAccentText: '#B87C6B',
    canvasMutedText: '#8F716D',
    canvasPillBg: '#F5E6E1',
  },
};

const PRESET_MESSAGES = [
  {
    title: 'Agradecimiento Especial',
    text: 'Gracias de todo corazón por elegirnos. Cada flor de tu arreglo fue seleccionada y diseñada con profundo amor y dedicación en nuestro taller cusqueño para transmitir tus más bellos sentimientos.',
  },
  {
    title: 'Cómplices de tus Momentos',
    text: 'Gracias por permitirnos ser cómplices de tus momentos más especiales. Deseamos que este detalle floral alegre e ilumine el día de quien lo reciba con su perfume y belleza única.',
  },
  {
    title: 'Amor & Celebración',
    text: 'Tu confianza nos inspira a seguir creando arte con flores frescas. Esperamos que disfruten de este arreglo tanto como nosotros disfrutamos preparándolo para ti. ¡Que sea un día inolvidable!',
  },
];

export const ThankYouCardModal: React.FC<ThankYouCardModalProps> = ({
  order,
  onClose,
  whatsappNumber = '906800626',
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('botanical');
  const [messageIndex, setMessageIndex] = useState<number>(0);
  const [customMessage, setCustomMessage] = useState<string>(PRESET_MESSAGES[0].text);
  const [includeItems, setIncludeItems] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cleanPhoneForWhatsApp = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits.length === 9 && digits.startsWith('9')) {
      return `51${digits}`;
    }
    return digits;
  };

  // Helper to wrap text in Canvas 2D
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  // Render high-res card onto Canvas
  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = THEMES[selectedTheme];
    const width = 1200;
    const height = 1500;

    canvas.width = width;
    canvas.height = height;

    // 1. Background
    ctx.fillStyle = theme.canvasBg;
    ctx.fillRect(0, 0, width, height);

    // Subtle background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (selectedTheme === 'luxury_dark') {
      bgGrad.addColorStop(0, '#1E2520');
      bgGrad.addColorStop(1, '#141815');
    } else if (selectedTheme === 'blush') {
      bgGrad.addColorStop(0, '#FFFDFB');
      bgGrad.addColorStop(1, '#FFF1ED');
    } else {
      bgGrad.addColorStop(0, '#FCFAF7');
      bgGrad.addColorStop(1, '#F3EFEA');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Double Luxury Border with Corner Accents
    const outerMargin = 40;
    const innerMargin = 58;

    // Outer border
    ctx.strokeStyle = theme.canvasBorder;
    ctx.lineWidth = 4;
    ctx.strokeRect(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2);

    // Inner fine border
    ctx.strokeStyle = theme.canvasInnerBorder;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);

    // Corner decorative diamonds
    const drawCornerDiamond = (cx: number, cy: number) => {
      ctx.fillStyle = theme.canvasBorder;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx + 8, cy);
      ctx.lineTo(cx, cy + 8);
      ctx.lineTo(cx - 8, cy);
      ctx.closePath();
      ctx.fill();
    };

    drawCornerDiamond(innerMargin, innerMargin);
    drawCornerDiamond(width - innerMargin, innerMargin);
    drawCornerDiamond(innerMargin, height - innerMargin);
    drawCornerDiamond(width - innerMargin, height - innerMargin);

    // 3. Floral / Boutique Crest Header with official Rosanfer Logo Emblem & Typography
    const emblemCenterY = 160;
    const emblemScale = 1.35;
    const isDark = selectedTheme === 'luxury_dark';

    // Draw Vector Emblem (Matching Rosanfer official logo)
    ctx.save();
    ctx.translate(width / 2, emblemCenterY);
    ctx.scale(emblemScale, emblemScale);
    ctx.translate(-50, -50); // Center the 100x100 viewBox

    // Sage Green Leaf on left side
    const leafGrad = ctx.createLinearGradient(20, 40, 40, 60);
    leafGrad.addColorStop(0, '#8CA18F');
    leafGrad.addColorStop(1, '#5C715E');
    ctx.fillStyle = leafGrad;
    ctx.fill(new Path2D('M 32 40 C 22 40 18 48 24 58 C 30 52 35 48 37 42 C 35 40 33 40 32 40 Z'));

    // Rose Petals & R paths (Rose-gold or golden foil gradient)
    const roseGrad = ctx.createLinearGradient(20, 15, 80, 80);
    if (isDark) {
      roseGrad.addColorStop(0, '#F5D77F');
      roseGrad.addColorStop(0.5, '#D4AF37');
      roseGrad.addColorStop(1, '#AA820A');
    } else {
      roseGrad.addColorStop(0, '#E8BCB0');
      roseGrad.addColorStop(0.35, '#D49A89');
      roseGrad.addColorStop(0.7, '#B87C6B');
      roseGrad.addColorStop(1, '#965D4F');
    }

    ctx.strokeStyle = roseGrad;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(150, 93, 79, 0.25)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    // Outer Rose Silhouette
    ctx.lineWidth = 3.3;
    ctx.stroke(new Path2D('M 36 28 C 36 18 48 14 55 14 C 64 14 74 20 74 30 C 74 40 65 44 58 44 C 54 44 48 43 43 40'));

    // Rose Spiral Center
    ctx.lineWidth = 2.8;
    ctx.stroke(new Path2D('M 54 22 C 58 20 62 23 60 27 C 58 30 53 30 51 27 C 49 24 52 21 56 21'));
    ctx.stroke(new Path2D('M 44 26 C 45 32 50 35 56 35 C 61 35 65 31 66 27'));

    // Left Petal Flare
    ctx.lineWidth = 3.0;
    ctx.stroke(new Path2D('M 36 28 C 31 32 32 42 39 46 C 44 48 51 46 54 44'));

    // Right Petal Swell & Stylized R Loop
    ctx.lineWidth = 3.3;
    ctx.stroke(new Path2D('M 64 26 C 73 28 80 34 80 43 C 80 52 70 57 60 55 C 55 54 52 50 51 45'));

    // Stem of the R
    ctx.lineWidth = 3.2;
    ctx.stroke(new Path2D('M 50 45 L 48 65 C 48 66 48 68 49 70'));

    // Swooping Flourish Leg of the R
    ctx.lineWidth = 3.4;
    ctx.stroke(new Path2D('M 55 53 C 58 60 62 70 72 73 C 76 74 81 72 82 67 C 78 69 72 67 67 61 C 63 56 60 52 58 48'));

    ctx.restore();

    // Brand Name: "Rosanfer"
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    const brandGrad = ctx.createLinearGradient(width / 2 - 120, 240, width / 2 + 120, 240);
    if (isDark) {
      brandGrad.addColorStop(0, '#FAF7F2');
      brandGrad.addColorStop(0.5, '#F5D77F');
      brandGrad.addColorStop(1, '#D4AF37');
    } else {
      brandGrad.addColorStop(0, '#6C3F35');
      brandGrad.addColorStop(0.5, '#B87C6B');
      brandGrad.addColorStop(1, '#D49A89');
    }
    ctx.fillStyle = brandGrad;
    ctx.font = '700 52px "Cormorant Garamond", Georgia, serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('Rosanfer', width / 2, 242);

    // "Florería"
    ctx.font = '500 24px "Cormorant Garamond", Georgia, serif';
    ctx.letterSpacing = '6px';
    ctx.fillStyle = isDark ? '#D4AF37' : '#965D4F';
    ctx.fillText('Florería', width / 2, 282);

    // Boutique Subtitle
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillStyle = isDark ? 'rgba(250,247,242,0.7)' : '#5C715E';
    ctx.fillText('BOUTIQUE FLORAL • CUSCO', width / 2, 315);
    ctx.restore();

    // Fine divider line
    ctx.strokeStyle = theme.canvasInnerBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 180, 342);
    ctx.lineTo(width / 2 + 180, 342);
    ctx.stroke();

    // 4. Thank you header badge
    const badgeText = 'TARJETA DE AGRADECIMIENTO';
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '4px';
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = badgeMetrics.width + 48;
    const badgeH = 40;
    const badgeY = 390;

    ctx.fillStyle = theme.canvasPillBg;
    ctx.beginPath();
    ctx.roundRect(width / 2 - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 20);
    ctx.fill();
    ctx.strokeStyle = theme.canvasBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.canvasAccentText;
    ctx.fillText(badgeText, width / 2, badgeY);

    // 5. Customer Name & Salutation
    ctx.letterSpacing = '0px';
    ctx.fillStyle = theme.canvasPrimaryText;
    ctx.font = 'italic 700 56px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('¡Muchas Gracias!', width / 2, 485);

    // Personalized Customer Name in large display
    ctx.fillStyle = theme.canvasAccentText;
    ctx.font = '700 48px "Cormorant Garamond", Georgia, serif';
    const displayCustomer = order.customerName.trim() || 'Estimado(a) Cliente';
    ctx.fillText(displayCustomer, width / 2, 555);

    // 6. Dedicated heartfelt message
    ctx.fillStyle = theme.canvasPrimaryText;
    ctx.font = '400 30px "Plus Jakarta Sans", -apple-system, sans-serif';
    const messageY = 665;
    const maxTextWidth = 860;
    const endY = wrapText(ctx, customMessage, width / 2, messageY, maxTextWidth, 48);

    // 7. Order Reference Card Box (Items + Order Number)
    if (includeItems) {
      const boxY = Math.max(endY + 40, 920);
      const boxW = 880;
      const boxH = 200;
      const boxX = width / 2 - boxW / 2;

      ctx.fillStyle = theme.canvasPillBg;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 24);
      ctx.fill();
      ctx.strokeStyle = theme.canvasInnerBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Order info inside box
      ctx.textAlign = 'left';
      ctx.fillStyle = theme.canvasAccentText;
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`PEDIDO #${order.orderNumber}`, boxX + 40, boxY + 50);

      ctx.textAlign = 'right';
      ctx.fillStyle = theme.canvasMutedText;
      ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(formatDate(order.createdAt), boxX + boxW - 40, boxY + 50);

      // Items list inside box
      ctx.textAlign = 'left';
      ctx.fillStyle = theme.canvasPrimaryText;
      ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
      const itemsList = order.items
        .map((it) => `${it.quantity}x ${it.product.name}`)
        .join('  •  ');
      
      wrapText(ctx, `Arreglos: ${itemsList}`, boxX + 40, boxY + 105, boxW - 80, 36);

      // Total info
      ctx.fillStyle = theme.canvasAccentText;
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Total: ${formatCurrency(order.total)}`, boxX + 40, boxY + 165);
    }

    // 8. Footer & Contact
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.canvasAccentText;
    ctx.font = '600 24px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('« Creando sonrisas y momentos inolvidables en Cusco »', width / 2, 1310);

    ctx.fillStyle = theme.canvasMutedText;
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Atención y Consultas: +51 ${FIXED_WHATSAPP_DISPLAY} • Cusco, Perú`, width / 2, 1360);

    ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.canvasMutedText;
    ctx.fillText('Rosanfer Florería • Cusco, Perú', width / 2, 1395);
  }, [selectedTheme, customMessage, includeItems, order]);

  // Redraw whenever parameters change
  useEffect(() => {
    drawCard();
  }, [drawCard]);

  // Download high-resolution PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = order.customerName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `tarjeta-agradecimiento-${safeName}-RO${order.orderNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading thank you card image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate personalized WhatsApp message with fixed WhatsApp 906 800 626
  const whatsappMessage = `¡Hola ${order.customerName.trim()}! 🌸✨
Te saludamos con mucho cariño de *Rosanfer Florería Cusco*.

Queremos agradecerte de corazón por tu confianza en nuestro taller floral para tu pedido *#${order.orderNumber}*.
Esperamos que las flores transmitan todo tu cariño y llenen este día de alegría y momentos mágicos.

Adjunto te compartimos tu *Tarjeta de Agradecimiento* personalizada por tu compra. ¡Muchas gracias por elegirnos! 💐🌿

🌹 *Rosanfer Florería Boutique • Cusco*
📞 WhatsApp: +51 ${FIXED_WHATSAPP_DISPLAY}`;

  const handleShareWhatsApp = () => {
    const rawPhone = order.customerPhone ? cleanPhoneForWhatsApp(order.customerPhone) : '';
    const phone = rawPhone || `51${FIXED_WHATSAPP_NUMBER}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
      alert('Texto copiado al portapapeles.');
    }
  };

  // Native share if supported (can share the image directly on mobile)
  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File(
          [blob],
          `tarjeta-agradecimiento-${order.customerName.replace(/\s+/g, '_')}.png`,
          { type: 'image/png' }
        );

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Tarjeta de Agradecimiento - ${order.customerName}`,
            text: whatsappMessage,
            files: [file],
          });
        } else {
          // Fallback to regular download
          handleDownload();
        }
      }, 'image/png');
    } catch (err) {
      console.log('Native share failed or canceled', err);
    }
  };

  const activeThemeConfig = THEMES[selectedTheme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-[#5C715E]/20 my-auto max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-[#5C715E] tracking-wider">
                  Boutique de Fidelización
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                  Orden #{order.orderNumber}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif-boutique font-bold text-[#2C362D]">
                Tarjeta de Agradecimiento Personalizada
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Grid: Preview on Left, Controls on Right */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Card Preview Container */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full text-center mb-2">
              <span className="text-[11px] font-semibold text-gray-500 flex items-center justify-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#5C715E]" />
                <span>Vista previa interactiva de la tarjeta</span>
              </span>
            </div>

            {/* Visual Live Styled Card Preview */}
            <div
              className={`w-full max-w-[360px] rounded-2xl border-2 p-5 shadow-lg relative transition-all ${activeThemeConfig.cardBg} ${activeThemeConfig.borderClass}`}
            >
              {/* Inner Double Line */}
              <div
                className="rounded-xl border p-4 space-y-3.5 text-center relative overflow-hidden"
                style={{ borderColor: activeThemeConfig.canvasInnerBorder }}
              >
                {/* Official Rosanfer Logo Header */}
                <div className="flex flex-col items-center justify-center pt-1 pb-0.5">
                  <RosanferLogo
                    size="md"
                    variant="full"
                    light={selectedTheme === 'luxury_dark'}
                    className="transform scale-95"
                  />
                  <p
                    className="text-[9px] tracking-[0.25em] uppercase font-semibold mt-1"
                    style={{
                      color: selectedTheme === 'luxury_dark' ? 'rgba(250,247,242,0.65)' : '#5C715E',
                    }}
                  >
                    Boutique Floral • Cusco
                  </p>
                </div>

                {/* Badge */}
                <div className="inline-block">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${activeThemeConfig.badgeBg}`}
                  >
                    Tarjeta de Agradecimiento
                  </span>
                </div>

                {/* Personalized Greeting */}
                <div className="space-y-1">
                  <p
                    className="font-serif-boutique italic font-bold text-xl leading-tight"
                    style={{
                      color:
                        selectedTheme === 'luxury_dark' ? '#FAF7F2' : '#2C362D',
                    }}
                  >
                    ¡Muchas Gracias!
                  </p>
                  <p
                    className="font-serif-boutique font-bold text-lg leading-tight truncate px-2"
                    style={{ color: activeThemeConfig.accentColor }}
                    title={order.customerName}
                  >
                    {order.customerName}
                  </p>
                </div>

                {/* Message */}
                <p
                  className="text-xs leading-relaxed px-2 font-normal"
                  style={{
                    color:
                      selectedTheme === 'luxury_dark' ? '#D1DBD2' : '#4B5563',
                  }}
                >
                  "{customMessage}"
                </p>

                {/* Optional Items Box */}
                {includeItems && (
                  <div
                    className="p-2.5 rounded-xl border text-left text-[11px] space-y-1"
                    style={{
                      backgroundColor:
                        selectedTheme === 'luxury_dark' ? '#253326' : '#F4EFEB',
                      borderColor: activeThemeConfig.canvasInnerBorder,
                      color:
                        selectedTheme === 'luxury_dark' ? '#FAF7F2' : '#2C362D',
                    }}
                  >
                    <div className="flex justify-between font-bold text-[10px]">
                      <span style={{ color: activeThemeConfig.accentColor }}>
                        ORDEN #{order.orderNumber}
                      </span>
                      <span className="text-gray-400 font-normal">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <p className="truncate text-gray-600 text-[10.5px]">
                      {order.items.map((it) => `${it.quantity}x ${it.product.name}`).join(', ')}
                    </p>
                  </div>
                )}

                {/* Footer Signature */}
                <div className="pt-2 border-t border-gray-200/40 text-[10px] text-gray-400 space-y-0.5">
                  <p className="font-serif-boutique italic text-[11px]" style={{ color: activeThemeConfig.accentColor }}>
                    « Creando momentos inolvidables en Cusco »
                  </p>
                  <p className="font-sans">WhatsApp: +51 {FIXED_WHATSAPP_DISPLAY} • Cusco, Perú</p>
                </div>
              </div>
            </div>

            {/* Hidden High-Resolution Canvas for Image Generation */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls & Customization on Right */}
          <div className="lg:col-span-6 space-y-4">
            {/* 1. Theme Selector */}
            <div>
              <label className="text-xs font-bold text-[#2C362D] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Palette className="w-3.5 h-3.5 text-[#5C715E]" />
                <span>Estilo y Color de la Tarjeta</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(THEMES) as CardTheme[]).map((themeKey) => {
                  const cfg = THEMES[themeKey];
                  const isActive = selectedTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => setSelectedTheme(themeKey)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#5C715E] bg-[#5C715E]/10 ring-2 ring-[#5C715E]/20'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full mx-auto mb-1 border shadow-2xs"
                        style={{ backgroundColor: cfg.canvasBg, borderColor: cfg.canvasBorder }}
                      />
                      <span className="text-[11px] font-bold block text-[#2C362D]">
                        {cfg.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Message Selector / Custom Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#2C362D] uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#D49A89]" />
                  <span>Mensaje de Agradecimiento</span>
                </label>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_MESSAGES.map((msg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMessageIndex(idx);
                      setCustomMessage(msg.text);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      messageIndex === idx
                        ? 'bg-[#5C715E] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {msg.title}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => {
                  setCustomMessage(e.target.value);
                  setMessageIndex(-1); // custom
                }}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-1 focus:ring-[#5C715E] leading-relaxed"
                placeholder="Escribe un mensaje de agradecimiento personalizado..."
              />
            </div>

            {/* 3. Include Items Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F6] border border-gray-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#5C715E]" />
                <div>
                  <span className="text-xs font-bold text-[#2C362D] block">
                    Incluir resumen de arreglos
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    Muestra el número de orden y flores solicitadas
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeItems}
                  onChange={(e) => setIncludeItems(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5C715E]"></div>
              </label>
            </div>

            {/* 4. Action Buttons */}
            <div className="pt-2 space-y-2.5">
              {/* Main Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3 px-4 rounded-xl bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isDownloading ? 'Generando imagen HD...' : 'Descargar Tarjeta (Imagen PNG)'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Send via WhatsApp */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Abrir WhatsApp con mensaje personalizado listo para enviar"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </button>

                {/* Copy Text */}
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="py-2.5 px-3 rounded-xl border border-gray-200 bg-[#FBF9F6] hover:bg-gray-100 text-[#2C362D] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Copiar texto para WhatsApp"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>Copiar Mensaje</span>
                    </>
                  )}
                </button>
              </div>

              {/* Native share on mobile devices */}
              {typeof navigator !== 'undefined' && 'canShare' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-2 px-3 rounded-xl border border-[#5C715E]/30 text-[#5C715E] hover:bg-[#5C715E]/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir imagen directamente a WhatsApp</span>
                </button>
              )}

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 leading-snug">
                <strong>Consejo Boutique:</strong> Descarga la imagen en PNG y adjúntala en el chat de WhatsApp al cliente junto con el mensaje copiado. ¡Genera una experiencia memorable y de alta fidelización!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
