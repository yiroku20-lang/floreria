import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Check,
  RotateCcw,
  Sparkles,
  Grid,
  Info,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { transformDriveUrl, isGoogleDriveUrl } from '../utils/driveUtils';
import { ImageFraming } from '../types';

interface ImageFramingModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName?: string;
  initialFraming?: ImageFraming;
  onSaveCropped: (
    croppedDataUrl: string,
    originalUrl?: string,
    framing?: ImageFraming
  ) => void;
}

export const ImageFramingModal: React.FC<ImageFramingModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  productName = 'Arreglo Floral',
  initialFraming,
  onSaveCropped,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Resolved source URL (transformed for Google Drive or direct)
  const resolvedUrl = transformDriveUrl(imageUrl);

  // Frame dimension for the interactive canvas viewport (fixed square)
  const FRAME_SIZE = 360;

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const renderMiniPreview = useCallback(() => {
    const mini = previewCanvasRef.current;
    const main = canvasRef.current;
    if (!mini || !main) return;

    const ctx = mini.getContext('2d');
    if (!ctx) return;

    mini.width = 160;
    mini.height = 160;
    ctx.clearRect(0, 0, 160, 160);
    try {
      ctx.drawImage(main, 0, 0, 160, 160);
    } catch {
      // Ignore if main is temporarily inaccessible
    }
  }, []);

  // Main canvas renderer
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = FRAME_SIZE;
    canvas.height = FRAME_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);

    // Save context state
    ctx.save();

    // Clip to the square frame
    ctx.beginPath();
    ctx.rect(0, 0, FRAME_SIZE, FRAME_SIZE);
    ctx.clip();

    // Background color inside frame
    ctx.fillStyle = '#F4F1EC';
    ctx.fillRect(0, 0, FRAME_SIZE, FRAME_SIZE);

    // Move to center of canvas frame
    ctx.translate(FRAME_SIZE / 2 + offset.x, FRAME_SIZE / 2 + offset.y);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Compute base scale so the image covers the frame at zoom = 1
    const imgAspect = img.width / img.height;
    let baseWidth: number;
    let baseHeight: number;

    const isSideways = rotation % 180 !== 0;
    const targetW = isSideways ? FRAME_SIZE : FRAME_SIZE;
    const targetH = isSideways ? FRAME_SIZE : FRAME_SIZE;

    if (imgAspect >= 1) {
      baseHeight = targetH;
      baseWidth = targetH * imgAspect;
    } else {
      baseWidth = targetW;
      baseHeight = targetW / imgAspect;
    }

    const drawW = baseWidth * zoom;
    const drawH = baseHeight * zoom;

    // Draw centered
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Render the mini preview canvas
    renderMiniPreview();
  }, [offset, zoom, rotation, renderMiniPreview]);

  // Stable string key to prevent infinite loop from object reference changes
  const framingKey = initialFraming
    ? `${initialFraming.zoom}_${initialFraming.x}_${initialFraming.y}_${initialFraming.rotation || 0}`
    : 'none';

  // Safe image loader that fetches a Blob first with CORS to prevent tainted canvas
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    let isMounted = true;
    setIsLoading(true);
    setImageError(null);

    if (initialFraming) {
      setZoom(Math.max(1, initialFraming.zoom || 1));
      setRotation(initialFraming.rotation || 0);
      const safeInitX = Math.min(50, Math.max(-50, initialFraming.x || 0));
      const safeInitY = Math.min(50, Math.max(-50, initialFraming.y || 0));
      setOffset({
        x: (safeInitX / 50) * (FRAME_SIZE / 2),
        y: (safeInitY / 50) * (FRAME_SIZE / 2),
      });
    } else {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }

    const loadAsync = async () => {
      // Free old blob
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      // If already data URL or blob URL, load directly
      if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!isMounted) return;
          imageRef.current = img;
          setIsLoading(false);
        };
        img.onerror = () => {
          if (!isMounted) return;
          setIsLoading(false);
          setImageError('No se pudo cargar la imagen.');
        };
        img.src = imageUrl;
        return;
      }

      const resolved = transformDriveUrl(imageUrl);
      const proxyLocal = `/api/proxy-image?url=${encodeURIComponent(resolved)}`;
      const proxyWsrv = `https://wsrv.nl/?url=${encodeURIComponent(resolved)}&output=jpg`;
      const proxyAllOrigins = `https://api.allorigins.win/raw?url=${encodeURIComponent(resolved)}`;

      const fetchCandidates = isGoogleDriveUrl(imageUrl)
        ? [proxyLocal, proxyWsrv, proxyAllOrigins, resolved]
        : [proxyLocal, resolved, proxyWsrv, proxyAllOrigins];

      let loadedBlobUrl: string | null = null;

      for (const candidate of fetchCandidates) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);
          const resp = await fetch(candidate, {
            mode: 'cors',
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (resp.ok) {
            const blob = await resp.blob();
            if (blob.size > 200) {
              loadedBlobUrl = URL.createObjectURL(blob);
              objectUrlRef.current = loadedBlobUrl;
              break;
            }
          }
        } catch {
          // Attempt next candidate
        }
      }

      if (!isMounted) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        if (!isMounted) return;
        imageRef.current = img;
        setIsLoading(false);
      };

      img.onerror = () => {
        if (!isMounted) return;
        // Fallback to direct URL
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';
        fallbackImg.onload = () => {
          if (!isMounted) return;
          imageRef.current = fallbackImg;
          setIsLoading(false);
        };
        fallbackImg.onerror = () => {
          // Last resort: standard load (visual preview & framing metadata)
          const raw = new Image();
          raw.onload = () => {
            if (!isMounted) return;
            imageRef.current = raw;
            setIsLoading(false);
          };
          raw.onerror = () => {
            if (!isMounted) return;
            setIsLoading(false);
            setImageError('No se pudo cargar la imagen. Verifica que el enlace sea accesible.');
          };
          raw.src = resolved;
        };
        fallbackImg.src = resolved;
      };

      img.src = loadedBlobUrl || resolved;
    };

    loadAsync();

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageUrl, framingKey]);

  useEffect(() => {
    if (!isLoading && imageRef.current && canvasRef.current) {
      renderCanvas();
    }
  }, [renderCanvas, isLoading, zoom, rotation, offset]);

  // Mouse & Touch Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Helper actions
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleCenter = () => {
    setOffset({ x: 0, y: 0 });
  };

  // Apply and export cropped 1:1 image
  const handleApplyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    setIsProcessing(true);

    const offsetX = Number(offset?.x) || 0;
    const offsetY = Number(offset?.y) || 0;
    const safeZoom = Number(zoom) || 1;

    const safeX = Number(Math.min(50, Math.max(-50, (offsetX / (FRAME_SIZE / 2)) * 50)).toFixed(1));
    const safeY = Number(Math.min(50, Math.max(-50, (offsetY / (FRAME_SIZE / 2)) * 50)).toFixed(1));

    const framingData: ImageFraming = {
      zoom: Number(Math.max(1, safeZoom).toFixed(2)),
      x: safeX,
      y: safeY,
      rotation: rotation || 0,
    };

    const isWebUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');

    // If the image is a web URL or Google Drive link, preserve the original clean URL.
    // The CSS objectPosition + scale framing renders the 1:1 view flawlessly
    // across all cards and modals without wasting 5MB of LocalStorage on Base64 strings.
    if (isWebUrl) {
      onSaveCropped(imageUrl, imageUrl, framingData);
      setIsProcessing(false);
      onClose();
      return;
    }

    let exportedDataUrl: string | null = null;

    try {
      // For local data/blob images, create a compact lightweight JPEG (400x400, quality 0.72)
      const EXPORT_SIZE = 400;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = EXPORT_SIZE;
      exportCanvas.height = EXPORT_SIZE;

      const ctx = exportCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#F4F1EC';
        ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

        ctx.save();
        // Clip to square
        ctx.beginPath();
        ctx.rect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
        ctx.clip();

        // Scale factor from interactive canvas to export canvas
        const scaleFactor = EXPORT_SIZE / FRAME_SIZE;

        ctx.translate(
          EXPORT_SIZE / 2 + offset.x * scaleFactor,
          EXPORT_SIZE / 2 + offset.y * scaleFactor
        );

        ctx.rotate((rotation * Math.PI) / 180);

        const imgAspect = img.width / img.height;
        let baseWidth: number;
        let baseHeight: number;

        if (imgAspect >= 1) {
          baseHeight = EXPORT_SIZE;
          baseWidth = EXPORT_SIZE * imgAspect;
        } else {
          baseWidth = EXPORT_SIZE;
          baseHeight = EXPORT_SIZE / imgAspect;
        }

        const drawW = baseWidth * zoom;
        const drawH = baseHeight * zoom;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Export as lightweight compressed JPEG
        exportedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.72);
      }
    } catch {
      // Canvas tainted fallback handled gracefully
    }

    // If canvas directly generated a cropped 1:1 image, it is already cropped and doesn't need secondary framing
    if (exportedDataUrl) {
      onSaveCropped(exportedDataUrl, imageUrl, undefined);
    } else {
      onSaveCropped(imageUrl, imageUrl, framingData);
    }

    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col my-auto max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#2C362D] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5C715E] flex items-center justify-center text-white shadow-xs">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-boutique font-bold text-base sm:text-lg text-[#FBF9F6] flex items-center gap-2">
                <span>Editor de Encuadre Floral</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#D49A89] text-[#2C362D] font-bold">
                  1:1 Cuadrado
                </span>
              </h2>
              <p className="text-[11px] text-white/70">
                Ajusta la posición y zoom exacto para que el arreglo se vea perfecto en la tienda online.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Cerrar sin guardar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {imageError ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
              <p className="text-sm font-semibold text-red-800">{imageError}</p>
              <p className="text-xs text-red-600">
                Verifica que el archivo en Google Drive tenga los permisos en &ldquo;Cualquier persona con el enlace&rdquo;.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700"
              >
                Volver
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Canvas Viewport (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1.5 font-medium text-[#2C362D]">
                    <Move className="w-3.5 h-3.5 text-[#5C715E]" />
                    <span>Arrastra con el ratón para encuadrar</span>
                  </span>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      showGrid
                        ? 'bg-[#5C715E]/15 text-[#5C715E]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="w-3 h-3" />
                    <span>{showGrid ? 'Ocultar Guías' : 'Mostrar Guías'}</span>
                  </button>
                </div>

                {/* Viewport Frame with Outer Vignette */}
                <div className="relative w-[360px] h-[360px] max-w-full rounded-2xl overflow-hidden border-2 border-[#5C715E] shadow-lg bg-[#2C362D]/10">
                  {isLoading && (
                    <div className="absolute inset-0 bg-[#FBF9F6]/90 flex flex-col items-center justify-center gap-2 z-30">
                      <Loader2 className="w-7 h-7 text-[#5C715E] animate-spin" />
                      <span className="text-xs font-semibold text-[#2C362D]">
                        Cargando fotografía floral...
                      </span>
                    </div>
                  )}

                  {/* Interactive Canvas */}
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'} select-none`}
                  />

                  {/* Rule of Thirds Grid Overlay */}
                  {showGrid && !isLoading && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                      <div className="border-r border-b border-white/40 shadow-xs" />
                      <div className="border-r border-b border-white/40 shadow-xs" />
                      <div className="border-b border-white/40 shadow-xs" />
                      <div className="border-r border-b border-white/40 shadow-xs" />
                      <div className="border-r border-b border-white/40 shadow-xs" />
                      <div className="border-b border-white/40 shadow-xs" />
                      <div className="border-r border-white/40 shadow-xs" />
                      <div className="border-r border-white/40 shadow-xs" />
                      <div />
                    </div>
                  )}

                  {/* Corner accents */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white pointer-events-none drop-shadow-md" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white pointer-events-none drop-shadow-md" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white pointer-events-none drop-shadow-md" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white pointer-events-none drop-shadow-md" />

                  {/* Ratio badge */}
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs pointer-events-none">
                    1:1 CUADRADO EXACTO
                  </div>
                </div>

                {/* Control toolbar */}
                <div className="w-full mt-4 bg-[#FBF9F6] p-3 rounded-2xl border border-gray-200 space-y-3">
                  {/* Zoom Slider */}
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-gray-500" />
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-[#5C715E] cursor-pointer"
                    />
                    <ZoomIn className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-mono font-bold text-[#2C362D] w-12 text-right">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>

                  {/* Quick Zoom & Transform Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {[1, 1.25, 1.5, 2].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setZoom(preset)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                            zoom === preset
                              ? 'bg-[#5C715E] text-white'
                              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {preset}x
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleRotate}
                        className="px-2.5 py-1 rounded bg-white hover:bg-gray-100 text-[#2C362D] border border-gray-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Rotar 90° hacia la derecha"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-[#5C715E]" />
                        <span>Rotar {rotation}°</span>
                      </button>

                      <button
                        onClick={handleCenter}
                        className="px-2.5 py-1 rounded bg-white hover:bg-gray-100 text-[#2C362D] border border-gray-200 text-xs font-semibold transition-colors"
                        title="Centrar posición"
                      >
                        Centrar
                      </button>

                      <button
                        onClick={handleReset}
                        className="px-2.5 py-1 rounded bg-white hover:bg-gray-100 text-red-600 border border-gray-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Reiniciar a tamaño original"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restablecer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Mockup & Web Store Preview (5 cols) */}
              <div className="lg:col-span-5 bg-[#FBF9F6] p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C715E]">
                  <Eye className="w-4 h-4" />
                  <span>Resultado Final en la Web de Cusco</span>
                </div>
                <p className="text-xs text-gray-600">
                  Así es exactamente como los clientes verán el arreglo en la grilla del catálogo con la proporción 1:1.
                </p>

                {/* Mini mockup of the Product Card */}
                <div className="bg-white rounded-2xl overflow-hidden border border-[#5C715E]/15 shadow-md max-w-[240px] mx-auto">
                  <div className="relative w-full aspect-square bg-[#F4F1EC] overflow-hidden flex items-center justify-center">
                    <canvas
                      ref={previewCanvasRef}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#5C715E] text-white">
                      Nuevo
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] text-[#5C715E] font-semibold uppercase">
                      Boutique Rosanfer
                    </span>
                    <h4 className="font-serif-boutique font-bold text-xs text-[#2C362D] line-clamp-1">
                      {productName}
                    </h4>
                    <p className="text-xs font-bold text-[#2C362D] mt-1">
                      S/. 120.00
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Calidad Garantizada:</strong> Al hacer clic en aplicar, el sistema recortará y optimizará la fotografía en alta definición con el encuadre exacto seleccionado.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleApplyCrop}
            disabled={isLoading || isProcessing || !!imageError}
            className="px-6 py-2.5 rounded-xl bg-[#5C715E] hover:bg-[#4a5c4c] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Encuadrando fotografía...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Aplicar y Guardar Encuadre (1:1)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
