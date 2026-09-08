import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Link,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ZoomIn,
  X,
  Tag,
  Search,
  Check,
  ShieldCheck,
  RotateCcw,
  Crop,
} from 'lucide-react';
import { Product, PromoConfig } from '../types';
import { ImageFramingModal } from './ImageFramingModal';
import {
  transformDriveUrl,
  formatCurrency,
  extractDriveFileId,
  analyzeImageUrl,
  BOUTIQUE_FALLBACK_IMAGE,
} from '../utils/driveUtils';

interface CatalogManagerProps {
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct: (updatedProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  promoConfig: PromoConfig;
  onUpdatePromoConfig: (newPromo: PromoConfig) => void;
  onTriggerPromoPreview: () => void;
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  promoConfig,
  onUpdatePromoConfig,
  onTriggerPromoPreview,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'promo'>('products');

  // Product Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('Festivos');
  const [subEdition, setSubEdition] = useState('');
  const [occasion, setOccasion] = useState<Product['occasion']>('General');
  const [price, setPrice] = useState<number>(140);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number>(15);
  const [imageUrl, setImageUrl] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState<string | undefined>(undefined);
  const [productFraming, setProductFraming] = useState<Product['framing']>(undefined);
  const [isFramingModalOpen, setIsFramingModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [stemCount, setStemCount] = useState('');
  const [tagSelection, setTagSelection] = useState<string>('Nuevo');
  const [productFeedback, setProductFeedback] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

  // Table filter state
  const [tableSearch, setTableSearch] = useState('');
  const [tableCategory, setTableCategory] = useState<string>('all');

  // Promo Form state
  const [promoTitle, setPromoTitle] = useState(promoConfig.title);
  const [promoSubtitle, setPromoSubtitle] = useState(promoConfig.subtitle);
  const [promoBadge, setPromoBadge] = useState(promoConfig.badge);
  const [promoCoupon, setPromoCoupon] = useState(promoConfig.couponCode || '');
  const [promoDriveUrl, setPromoDriveUrl] = useState(promoConfig.driveImageUrl);
  const [promoCtaText, setPromoCtaText] = useState(promoConfig.ctaText);
  const [promoEnabled, setPromoEnabled] = useState(promoConfig.isEnabled);
  const [promoCategory, setPromoCategory] = useState(promoConfig.categoryRedirect || 'Primavera Para Ti');
  const [promoFeedback, setPromoFeedback] = useState('');
  const [promoImageError, setPromoImageError] = useState(false);
  const [isPromoFramingOpen, setIsPromoFramingOpen] = useState(false);
  const [originalPromoUrl, setOriginalPromoUrl] = useState<string | undefined>(undefined);

  // Zoom Lightbox
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  // Analysis for product image
  const productImageAnalysis = analyzeImageUrl(imageUrl);
  const promoImageAnalysis = analyzeImageUrl(promoDriveUrl);

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setSubEdition(product.subEdition || '');
    setOccasion(product.occasion || 'General');
    setPrice(product.price);
    setOriginalPrice(product.originalPrice);
    setStock(product.stock);
    setImageUrl(product.imageUrl);
    setOriginalImageUrl(product.originalImageUrl);
    setProductFraming(product.framing);
    setDescription(product.description);
    setStemCount(product.stemCount || '');
    setTagSelection(product.tags?.[0] || 'Nuevo');
    setImageLoadError(false);

    const formElement = document.getElementById('catalog-product-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setCategory('Festivos');
    setSubEdition('');
    setOccasion('General');
    setPrice(140);
    setOriginalPrice(undefined);
    setStock(15);
    setImageUrl('');
    setOriginalImageUrl(undefined);
    setProductFraming(undefined);
    setIsFramingModalOpen(false);
    setDescription('');
    setStemCount('');
    setTagSelection('Nuevo');
    setImageLoadError(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imageUrl.trim() || price <= 0) {
      alert('Por favor completa el nombre, precio e imagen del producto.');
      return;
    }

    const transformedUrl = imageUrl.startsWith('data:image')
      ? imageUrl
      : transformDriveUrl(imageUrl);

    if (editingId) {
      const existing = products.find((p) => p.id === editingId);
      const updated: Product = {
        ...existing,
        id: editingId,
        name: name.trim(),
        category,
        subEdition: subEdition.trim() || undefined,
        occasion: occasion || existing?.occasion || (category as any),
        price,
        originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
        stock,
        imageUrl: transformedUrl,
        originalImageUrl: originalImageUrl || existing?.originalImageUrl,
        framing: productFraming || existing?.framing,
        description: description.trim(),
        stemCount: stemCount.trim() || undefined,
        tags: [tagSelection as any],
        featured: existing?.featured ?? true,
        careTips: existing?.careTips || [],
      };
      onUpdateProduct(updated);
      setProductFeedback(`¡Producto "${name}" actualizado con éxito en el catálogo!`);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: name.trim(),
        category,
        subEdition: subEdition.trim() || undefined,
        occasion: occasion || (category as any) || 'General',
        price,
        originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
        stock,
        imageUrl: transformedUrl,
        originalImageUrl: originalImageUrl,
        framing: productFraming,
        description: description.trim(),
        stemCount: stemCount.trim() || undefined,
        tags: [tagSelection as any],
        featured: true,
        careTips: ['Colocar en agua fresca', 'Cortar tallos en diagonal 1cm cada 2 días', 'Mantener en lugar fresco sin sol directo'],
      };
      onAddProduct(newProd);
      setProductFeedback(`¡Nuevo arreglo "${name}" publicado con éxito!`);
    }

    handleCancelEdit();
    setTimeout(() => setProductFeedback(''), 4000);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPromo: PromoConfig = {
      isEnabled: promoEnabled,
      title: promoTitle.trim(),
      subtitle: promoSubtitle.trim(),
      badge: promoBadge.trim(),
      couponCode: promoCoupon.trim() || undefined,
      driveImageUrl: transformDriveUrl(promoDriveUrl),
      ctaText: promoCtaText.trim() || 'Ver Colección',
      categoryRedirect: promoCategory,
    };
    onUpdatePromoConfig(updatedPromo);
    setPromoFeedback('¡Configuración de promoción guardada correctamente!');
    setTimeout(() => setPromoFeedback(''), 4000);
  };

  // Filtered list of products for the table
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(tableSearch.toLowerCase());
    const matchesCategory = tableCategory === 'all' || p.category === tableCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${
            activeSubTab === 'products'
              ? 'border-[#5C715E] text-[#5C715E]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Gestión del Catálogo ({products.length} productos)
        </button>

        <button
          onClick={() => setActiveSubTab('promo')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'promo'
              ? 'border-[#5C715E] text-[#5C715E]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#D49A89]" />
          <span>Popup Promocional & Links de Drive</span>
        </button>
      </div>

      {/* SUB-TAB 1: PRODUCTS MANAGEMENT */}
      {activeSubTab === 'products' && (
        <div className="space-y-8">
          {/* Add / Edit Form Card */}
          <div
            id="catalog-product-form"
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-sm scroll-mt-24"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    editingId ? 'bg-[#D49A89]/20 text-[#D49A89]' : 'bg-[#5C715E]/10 text-[#5C715E]'
                  }`}
                >
                  {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-serif-boutique font-bold text-lg text-[#2C362D]">
                    {editingId ? `Editando: ${name || 'Producto'}` : 'Agregar Nuevo Arreglo al Catálogo'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {editingId
                      ? 'Modifica los datos y previsualiza la imagen en gran tamaño.'
                      : 'Publica un nuevo diseño floral con soporte directo para fotos de Google Drive.'}
                  </p>
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cancelar Edición</span>
                </button>
              )}
            </div>

            {productFeedback && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{productFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-6">
              {/* Responsive Layout: Inputs on Left, Large Live Preview on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT: Product Fields (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C362D] mb-1">
                      Nombre del Arreglo Floral *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Ramo de Tulipanes Cusco Imperial"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1">
                        Tipo de Arreglo / Colección *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => {
                          const val = e.target.value as Product['category'];
                          setCategory(val);
                        }}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E] font-medium"
                      >
                        <option value="Festivos">Festivos (Cumpleaños, Quinceañero, etc.)</option>
                        <option value="Latidos en Flor">Latidos en Flor (Romance & Amor)</option>
                        <option value="Graduación">Graduación (Colaciones & Títulos)</option>
                        <option value="Set Nupcial &quot;Sí Acepto&quot;">Set Nupcial &quot;Sí Acepto&quot; (Bodas)</option>
                        <option value="Amor Eterno">Amor Eterno (Flores Preservadas)</option>
                        <option value="Primavera Para Ti">Primavera Para Ti (Tulipanes & Frescas)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1">
                        Versión Especial / Edición
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Cumpleaños, Quinceañero..."
                        value={subEdition}
                        onChange={(e) => setSubEdition(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />
                      {/* Suggestions pills based on current category */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {category === 'Festivos' && (
                          <>
                            {['Cumpleaños', 'Quinceañero', 'Fiesta & Brindis'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setSubEdition(tag)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer"
                              >
                                +{tag}
                              </button>
                            ))}
                          </>
                        )}
                        {category === 'Latidos en Flor' && (
                          <>
                            {['Romance Profundo', 'Declaración de Amor', 'Primera Cita'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setSubEdition(tag)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 hover:bg-rose-100 cursor-pointer"
                              >
                                +{tag}
                              </button>
                            ))}
                          </>
                        )}
                        {category === 'Graduación' && (
                          <>
                            {['Bachiller & Título', 'Toga & Birrete', 'Promoción UNSAAC'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setSubEdition(tag)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 cursor-pointer"
                              >
                                +{tag}
                              </button>
                            ))}
                          </>
                        )}
                        {category === 'Set Nupcial "Sí Acepto"' && (
                          <>
                            {['Ramo de Novia', 'Boda Civil', 'Dúo Nupcial + Boutonnière'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setSubEdition(tag)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                              >
                                +{tag}
                              </button>
                            ))}
                          </>
                        )}
                        {category === 'Amor Eterno' && (
                          <>
                            {['Cúpula de Cristal', 'Cofre Joyero', 'Dúo Perpetuo'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setSubEdition(tag)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 hover:bg-purple-100 cursor-pointer"
                              >
                                +{tag}
                              </button>
                            ))}
                          </>
                        )}
                        {category === 'Primavera Para Ti' && (
                          <>
                            {['Tulipanes Holandeses', 'Mix Silvestre', 'Dulce Amanecer'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setSubEdition(tag)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-800 hover:bg-green-100 cursor-pointer"
                              >
                                +{tag}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1">
                        Etiqueta Destacada
                      </label>
                      <select
                        value={tagSelection}
                        onChange={(e) => setTagSelection(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      >
                        <option value="Bestseller">Bestseller (Más vendido)</option>
                        <option value="Nuevo">Nuevo (Lanzamiento)</option>
                        <option value="Temporada">Temporada Cusco</option>
                        <option value="Exclusivo">Exclusivo Boutique</option>
                        <option value="Oferta">Oferta Especial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1">
                        Precio (S/.) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        required
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1">
                        P. Anterior (S/.)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Opcional"
                        value={originalPrice || ''}
                        onChange={(e) =>
                          setOriginalPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1">
                        Stock Inicial *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={stock}
                        onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />
                    </div>
                  </div>

                  {/* Google Drive / Image URL section */}
                  <div className="p-4 bg-[#FBF9F6] rounded-2xl border border-[#5C715E]/15 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold text-[#2C362D] flex items-center gap-1.5">
                        <Link className="w-3.5 h-3.5 text-[#5C715E]" />
                        <span>Link de Imagen (Google Drive o URL Web) *</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {imageUrl.startsWith('data:image') && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Crop className="w-3 h-3" /> Encuadre 1:1 Aplicado
                          </span>
                        )}
                        {productImageAnalysis.isDrive && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Drive Compatible
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Pega el link de Google Drive (ej: https://drive.google.com/file/d/.../view) o enlace web"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setOriginalImageUrl(undefined);
                          setImageLoadError(false);
                        }}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />

                      {/* Edit Framing / Crop Button */}
                      <button
                        type="button"
                        disabled={!imageUrl.trim()}
                        onClick={() => setIsFramingModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-[#5C715E]/15 hover:bg-[#5C715E] text-[#5C715E] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
                        title="Encuadra la zona exacta en proporción 1:1 que se verá en la web"
                      >
                        <Crop className="w-4 h-4" />
                        <span>Editar Encuadre (1:1)</span>
                      </button>
                    </div>

                    {/* Original URL restoration if cropped */}
                    {originalImageUrl && imageUrl !== originalImageUrl && (
                      <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl border border-gray-100">
                        <span className="text-gray-500 truncate mr-2">
                          Original: {originalImageUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl(originalImageUrl);
                            setOriginalImageUrl(undefined);
                          }}
                          className="text-xs text-[#5C715E] font-semibold hover:underline shrink-0"
                        >
                          Restaurar enlace original
                        </button>
                      </div>
                    )}

                    {/* Drive analysis tip */}
                    <div className="text-[11px] text-gray-600 flex items-start gap-1.5 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#5C715E] shrink-0 mt-0.5" />
                      <div>
                        <span>{productImageAnalysis.advice}</span>
                        {productImageAnalysis.fileId && (
                          <span className="block font-mono text-[10px] text-gray-500 mt-0.5">
                            ID detectado: {productImageAnalysis.fileId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description & Stems */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#2C362D] mb-1">
                        Descripción Floral
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Variedades, tonos de pétalos, follajes cusqueños..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2C362D] mb-1">
                        Formato / Tallos
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 18 Tallos + Gypsophila"
                        value={stemCount}
                        onChange={(e) => setStemCount(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      id="btn-save-product-catalog"
                      className="py-3 px-6 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingId ? 'Guardar Cambios del Arreglo' : 'Publicar en Catálogo'}</span>
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-3 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT: Large Image Preview Box (5 cols) */}
                <div className="lg:col-span-5 bg-[#FBF9F6] rounded-2xl p-4 border border-[#5C715E]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2C362D] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#5C715E]" />
                      <span>Previsualización Floral (1:1 Cuadrado)</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {imageUrl && (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsFramingModalOpen(true)}
                            className="px-2 py-1 rounded-lg bg-[#5C715E]/15 hover:bg-[#5C715E] hover:text-white text-[#5C715E] text-[11px] font-bold transition-colors flex items-center gap-1"
                            title="Editar encuadre y recorte cuadrado"
                          >
                            <Crop className="w-3.5 h-3.5" />
                            <span>Encuadrar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setZoomImageUrl(transformDriveUrl(imageUrl))}
                            className="p-1 rounded-lg text-gray-500 hover:text-[#5C715E] hover:bg-white transition-colors"
                            title="Ver en pantalla completa"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Big Image Canvas - STRICT 1:1 SQUARE MATCHING STOREFRONT */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-[#5C715E]/20 shadow-sm group">
                    {imageUrl ? (
                      <>
                        <img
                          src={transformDriveUrl(imageUrl)}
                          alt="Vista previa del producto"
                          style={
                            productFraming
                              ? {
                                  objectPosition: `${50 + (productFraming.x || 0)}% ${50 + (productFraming.y || 0)}%`,
                                  transform: `scale(${Math.max(1, productFraming.zoom || 1)}) rotate(${productFraming.rotation || 0}deg)`,
                                  transformOrigin: 'center center',
                                }
                              : undefined
                          }
                          className="w-full h-full object-cover transition-transform duration-300"
                          onError={() => setImageLoadError(true)}
                          onLoad={() => setImageLoadError(false)}
                        />
                        {/* 1:1 Badge Indicator */}
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs pointer-events-none">
                          1:1 IDÉNTICO A TIENDA
                        </div>

                        {/* Hover Overlay with Action Buttons */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                          <button
                            type="button"
                            onClick={() => setIsFramingModalOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-[#5C715E] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                          >
                            <Crop className="w-4 h-4" />
                            <span>Editar Encuadre</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setZoomImageUrl(transformDriveUrl(imageUrl))}
                            className="px-3.5 py-2 rounded-xl bg-white text-[#2C362D] text-xs font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                          >
                            <ZoomIn className="w-4 h-4" />
                            <span>Ampliar</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                        <Tag className="w-10 h-10 mb-2 opacity-30 text-[#5C715E]" />
                        <p className="text-xs font-medium">
                          Pega un enlace de Google Drive o URL web para previsualizar aquí el arreglo en formato 1:1 cuadrado idéntico a la tienda.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Warning if load failed */}
                  {imageLoadError && imageUrl && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>¿No carga la imagen de Google Drive?</span>
                      </div>
                      <p>
                        Asegúrate de que el archivo en Drive esté configurado como <strong>"Cualquier persona con el enlace"</strong> (Acceso general: Lector).
                      </p>
                    </div>
                  )}

                  {/* Storefront Card Simulation */}
                  <div className="bg-white p-3 rounded-2xl border border-gray-200 text-xs space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                      Cómo lo verá el cliente en la web de Cusco:
                    </span>
                    <div className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F4F1EC] shrink-0 border border-gray-100 aspect-square">
                        {imageUrl ? (
                          <img
                            src={transformDriveUrl(imageUrl)}
                            alt="Miniatura"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[9px]">
                            1:1
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#2C362D] truncate text-xs">
                            {name || 'Nombre del Arreglo'}
                          </span>
                          <span className="font-bold text-[#5C715E] text-xs">
                            {formatCurrency(price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-[#5C715E]/10 text-[#5C715E] font-medium">
                            {category}
                          </span>
                          {stemCount && <span>• {stemCount}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Current Products Table with Search & Filter */}
          <div className="bg-white rounded-3xl border border-[#5C715E]/15 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif-boutique font-bold text-lg text-[#2C362D]">
                  Listado de Productos en Catálogo
                </h3>
                <p className="text-xs text-gray-500">
                  {filteredProducts.length} de {products.length} arreglos florales
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] w-40 sm:w-48"
                  />
                </div>

                <select
                  value={tableCategory}
                  onChange={(e) => setTableCategory(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                >
                  <option value="all">Todas las colecciones</option>
                  <option value="Festivos">Festivos</option>
                  <option value="Latidos en Flor">Latidos en Flor</option>
                  <option value="Graduación">Graduación</option>
                  <option value="Set Nupcial &quot;Sí Acepto&quot;">Set Nupcial &quot;Sí Acepto&quot;</option>
                  <option value="Amor Eterno">Amor Eterno</option>
                  <option value="Primavera Para Ti">Primavera Para Ti</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FBF9F6] text-[#5C715E] uppercase font-bold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Foto</th>
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Precio</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No se encontraron arreglos florales con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => (
                      <tr
                        key={prod.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          editingId === prod.id ? 'bg-[#5C715E]/5 font-medium' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4">
                          <div
                            className="w-12 h-12 rounded-xl overflow-hidden relative border border-gray-200 shadow-xs cursor-pointer hover:opacity-80 aspect-square bg-[#F4F1EC] shrink-0"
                            onClick={() => setZoomImageUrl(transformDriveUrl(prod.imageUrl))}
                            title="Haz clic para ver imagen ampliada"
                          >
                            <img
                              src={transformDriveUrl(prod.imageUrl)}
                              alt={prod.name}
                              style={
                                prod.framing
                                  ? {
                                      objectPosition: `${50 + (prod.framing.x || 0)}% ${50 + (prod.framing.y || 0)}%`,
                                      transform: `scale(${Math.max(1, prod.framing.zoom || 1)}) rotate(${prod.framing.rotation || 0}deg)`,
                                      transformOrigin: 'center center',
                                    }
                                  : undefined
                              }
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = BOUTIQUE_FALLBACK_IMAGE;
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-[#2C362D]">
                          <div className="flex items-center gap-1.5">
                            <span>{prod.name}</span>
                            {editingId === prod.id && (
                              <span className="text-[10px] bg-[#5C715E] text-white px-2 py-0.5 rounded-full">
                                En edición
                              </span>
                            )}
                          </div>
                          {prod.tags && prod.tags[0] && (
                            <span className="text-[10px] text-[#D49A89] font-medium">
                              #{prod.tags[0]}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-gray-600">
                          <div>
                            <span className="font-medium text-[#2C362D]">{prod.category}</span>
                            {prod.subEdition && (
                              <span className="inline-block ml-1 text-[10px] px-1.5 py-0.2 rounded bg-[#5C715E]/10 text-[#5C715E] font-semibold">
                                {prod.subEdition}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[#2C362D]">
                          {formatCurrency(prod.price)}
                          {prod.originalPrice && (
                            <span className="text-[10px] text-gray-400 line-through block">
                              {formatCurrency(prod.originalPrice)}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              prod.stock <= 0
                                ? 'bg-red-100 text-red-700'
                                : prod.stock <= 5
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {prod.stock} disp.
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(prod)}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#5C715E] hover:text-white transition-colors"
                              title="Editar producto"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `¿Estás seguro de eliminar "${prod.name}" del catálogo? Esta acción no se puede deshacer.`
                                  )
                                ) {
                                  onDeleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PROMOTION POPUP & DRIVE LINK SETTINGS */}
      {activeSubTab === 'promo' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div>
              <span className="text-xs uppercase font-bold text-[#5C715E] tracking-wider">
                Marketing y Campañas Boutique
              </span>
              <h3 className="text-xl font-serif-boutique font-bold text-[#2C362D]">
                Configurar Popup Promocional (Poppat)
              </h3>
              <p className="text-xs text-gray-500">
                Aparece a los clientes al ingresar para ofrecer descuentos y redirecciones.
              </p>
            </div>

            {/* Test live preview button */}
            <button
              id="btn-preview-promo-live"
              type="button"
              onClick={onTriggerPromoPreview}
              className="px-5 py-2.5 rounded-full bg-[#D49A89] hover:bg-[#B87C6B] text-[#2C362D] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Popup en la Tienda</span>
            </button>
          </div>

          <form onSubmit={handleSavePromo} className="space-y-6">
            {/* Enable toggle */}
            <div className="p-4 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/15 flex items-center justify-between">
              <div>
                <label className="font-bold text-sm text-[#2C362D] block cursor-pointer">
                  Activar Popup Promocional para Visitantes de la Web
                </label>
                <p className="text-xs text-gray-500">
                  Si está marcado, se mostrará automáticamente con animación suave al entrar a la tienda.
                </p>
              </div>
              <input
                type="checkbox"
                checked={promoEnabled}
                onChange={(e) => setPromoEnabled(e.target.checked)}
                className="w-5 h-5 text-[#5C715E] rounded-md focus:ring-[#5C715E] cursor-pointer"
              />
            </div>

            {/* 2-Column Promo Configuration + Large Live Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2C362D] mb-1">
                      Distintivo / Badge Superior
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Ocasión Especial Cusco"
                      value={promoBadge}
                      onChange={(e) => setPromoBadge(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C362D] mb-1">
                      Cupón de Descuento (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: CUSCOFLORAL"
                      value={promoCoupon}
                      onChange={(e) => setPromoCoupon(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Título de la Promoción *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Temporada de Amor & Tulipanes"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Subtítulo / Mensaje Promocional *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ej: 15% de descuento en pedidos por WhatsApp para entregas en Cusco"
                    value={promoSubtitle}
                    onChange={(e) => setPromoSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2C362D] mb-1">
                      Categoría a la que redirige
                    </label>
                    <select
                      value={promoCategory}
                      onChange={(e) => setPromoCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    >
                      <option value="Festivos">Festivos (Cumpleaños, Quinceañeros)</option>
                      <option value="Latidos en Flor">Latidos en Flor (Romance)</option>
                      <option value="Graduación">Graduación (Colaciones)</option>
                      <option value="Set Nupcial &quot;Sí Acepto&quot;">Set Nupcial &quot;Sí Acepto&quot; (Bodas)</option>
                      <option value="Amor Eterno">Amor Eterno (Flores Preservadas)</option>
                      <option value="Primavera Para Ti">Primavera Para Ti (Tulipanes & Frescas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C362D] mb-1">
                      Texto del Botón CTA
                    </label>
                    <input
                      type="text"
                      value={promoCtaText}
                      onChange={(e) => setPromoCtaText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    />
                  </div>
                </div>

                {/* Google Drive Link for Promo Image */}
                <div className="p-4 bg-[#FBF9F6] rounded-2xl border border-[#5C715E]/15 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#2C362D]">
                      <Link className="w-4 h-4 text-[#5C715E]" />
                      <span>Link de Google Drive con la Imagen Promocional *</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {promoDriveUrl.startsWith('data:image') && (
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Crop className="w-3 h-3" /> Imagen Encuadrada
                        </span>
                      )}
                      {promoImageAnalysis.isDrive && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Drive Compatible
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      placeholder="https://drive.google.com/file/d/.../view"
                      value={promoDriveUrl}
                      onChange={(e) => {
                        setPromoDriveUrl(e.target.value);
                        setOriginalPromoUrl(undefined);
                        setPromoImageError(false);
                      }}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    />

                    <button
                      type="button"
                      disabled={!promoDriveUrl.trim()}
                      onClick={() => setIsPromoFramingOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#5C715E]/15 hover:bg-[#5C715E] text-[#5C715E] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <Crop className="w-4 h-4" />
                      <span>Encuadrar Imagen</span>
                    </button>
                  </div>

                  {originalPromoUrl && promoDriveUrl !== originalPromoUrl && (
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl border border-gray-100">
                      <span className="text-gray-500 truncate mr-2">
                        Original: {originalPromoUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPromoDriveUrl(originalPromoUrl);
                          setOriginalPromoUrl(undefined);
                        }}
                        className="text-xs text-[#5C715E] font-semibold hover:underline shrink-0"
                      >
                        Restaurar original
                      </button>
                    </div>
                  )}

                  <div className="text-[11px] text-gray-600 flex items-start gap-1.5 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5C715E] shrink-0 mt-0.5" />
                    <div>
                      <span>{promoImageAnalysis.advice}</span>
                      {promoImageAnalysis.fileId && (
                        <span className="block font-mono text-[10px] text-gray-500 mt-0.5">
                          ID de archivo Drive: {promoImageAnalysis.fileId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-save-promo-config"
                    className="py-3 px-8 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Configuración del Popup</span>
                  </button>
                </div>

                {promoFeedback && (
                  <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    {promoFeedback}
                  </p>
                )}
              </div>

              {/* RIGHT: Large Live Popup Preview Simulator (5 cols) */}
              <div className="lg:col-span-5 bg-[#FBF9F6] p-4 rounded-3xl border border-[#5C715E]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2C362D] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D49A89]" />
                    <span>Simulación del Popup en Pantalla</span>
                  </span>
                  {promoDriveUrl && (
                    <button
                      type="button"
                      onClick={() => setZoomImageUrl(transformDriveUrl(promoDriveUrl))}
                      className="p-1 rounded-lg text-gray-500 hover:text-[#5C715E] hover:bg-white"
                      title="Ver imagen en tamaño completo"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Card Simulator */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden text-center">
                  {/* Large image banner */}
                  <div className="relative w-full aspect-16/10 bg-gray-100 overflow-hidden">
                    <img
                      src={transformDriveUrl(promoDriveUrl)}
                      alt="Banner promocional"
                      className="w-full h-full object-cover"
                      onError={() => setPromoImageError(true)}
                      onLoad={() => setPromoImageError(false)}
                    />
                    <div className="absolute top-3 left-3 bg-[#5C715E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {promoBadge || 'Promoción'}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-serif-boutique font-bold text-base text-[#2C362D]">
                      {promoTitle || 'Título de la Promoción'}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {promoSubtitle || 'Descripción o descuento para el cliente.'}
                    </p>

                    {promoCoupon && (
                      <div className="inline-block bg-[#FBF9F6] border border-dashed border-[#D49A89] px-3 py-1 rounded-lg font-mono text-xs font-bold text-[#D49A89]">
                        Cupón: {promoCoupon}
                      </div>
                    )}

                    <div className="pt-2">
                      <div className="w-full py-2 px-4 rounded-xl bg-[#5C715E] text-white text-xs font-semibold">
                        {promoCtaText || 'Ver Colección'}
                      </div>
                    </div>
                  </div>
                </div>

                {promoImageError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                    ⚠️ Si la imagen no se visualiza, comprueba en Google Drive que el permiso de compartir sea público ("Cualquier persona con el enlace").
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* FULLSCREEN ZOOM MODAL */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomImageUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <span className="text-xs font-bold text-[#2C362D]">
                Vista Previa de Imagen en Alta Resolución
              </span>
              <button
                onClick={() => setZoomImageUrl(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[80vh] overflow-hidden">
              <img
                src={zoomImageUrl}
                alt="Imagen ampliada"
                className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = BOUTIQUE_FALLBACK_IMAGE;
                }}
              />
            </div>
            <div className="p-3 text-right">
              <a
                href={zoomImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#5C715E] font-semibold hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir enlace directo en pestaña nueva</span>
              </a>
            </div>
          </div>
        </div>
      )}
      {/* IMAGE FRAMING & CROPPING MODAL (1:1 CANVAS) */}
      <ImageFramingModal
        isOpen={isFramingModalOpen}
        onClose={() => setIsFramingModalOpen(false)}
        imageUrl={originalImageUrl || imageUrl}
        productName={name || 'Arreglo Floral'}
        initialFraming={productFraming}
        onSaveCropped={(savedUrl, origUrl, framingData) => {
          // Never replace with giant Base64 if clean web URL exists
          const cleanUrl =
            origUrl && !origUrl.startsWith('data:image')
              ? origUrl
              : savedUrl && !savedUrl.startsWith('data:image')
              ? savedUrl
              : imageUrl && !imageUrl.startsWith('data:image')
              ? imageUrl
              : savedUrl;

          setImageUrl(cleanUrl);
          if (origUrl) setOriginalImageUrl(origUrl);
          if (framingData) setProductFraming(framingData);
          setImageLoadError(false);

          // If editing an existing product, sync the updated framing immediately
          if (editingId) {
            const existing = products.find((p) => p.id === editingId);
            if (existing) {
              onUpdateProduct({
                ...existing,
                imageUrl: cleanUrl,
                originalImageUrl: origUrl || existing.originalImageUrl,
                framing: framingData,
              });
            }
          }

          setProductFeedback(
            editingId
              ? '¡Encuadre aplicado! Haz clic en "Guardar Cambios del Arreglo" para publicar en el catálogo.'
              : '¡Encuadre aplicado! Haz clic en "Guardar Cambios" para publicar en el catálogo.'
          );
          setTimeout(() => setProductFeedback(''), 6000);
        }}
      />

      {/* PROMO IMAGE FRAMING MODAL */}
      <ImageFramingModal
        isOpen={isPromoFramingOpen}
        onClose={() => setIsPromoFramingOpen(false)}
        imageUrl={originalPromoUrl || promoDriveUrl}
        productName={promoTitle || 'Popup Promocional'}
        onSaveCropped={(savedUrl, origUrl) => {
          const cleanUrl =
            origUrl && !origUrl.startsWith('data:image')
              ? origUrl
              : savedUrl && !savedUrl.startsWith('data:image')
              ? savedUrl
              : promoDriveUrl && !promoDriveUrl.startsWith('data:image')
              ? promoDriveUrl
              : savedUrl;

          setPromoDriveUrl(cleanUrl);
          if (origUrl) setOriginalPromoUrl(origUrl);
          setPromoImageError(false);
          setPromoFeedback(
            '¡Encuadre aplicado! Haz clic en "Guardar Configuración de Promoción" para publicar los cambios.'
          );
          setTimeout(() => setPromoFeedback(''), 5000);
        }}
      />
    </div>
  );
};
