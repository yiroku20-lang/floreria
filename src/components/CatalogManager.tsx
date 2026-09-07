import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Link,
  Sparkles,
  Check,
  Image as ImageIcon,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Product, PromoConfig } from '../types';
import { transformDriveUrl, formatCurrency } from '../utils/driveUtils';

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
  const [category, setCategory] = useState<Product['category']>('Tulipanes');
  const [price, setPrice] = useState<number>(120);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number>(15);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [stemCount, setStemCount] = useState('');
  const [tagSelection, setTagSelection] = useState<string>('Nuevo');
  const [productFeedback, setProductFeedback] = useState('');

  // Promo Form state
  const [promoTitle, setPromoTitle] = useState(promoConfig.title);
  const [promoSubtitle, setPromoSubtitle] = useState(promoConfig.subtitle);
  const [promoBadge, setPromoBadge] = useState(promoConfig.badge);
  const [promoCoupon, setPromoCoupon] = useState(promoConfig.couponCode || '');
  const [promoDriveUrl, setPromoDriveUrl] = useState(promoConfig.driveImageUrl);
  const [promoCtaText, setPromoCtaText] = useState(promoConfig.ctaText);
  const [promoEnabled, setPromoEnabled] = useState(promoConfig.isEnabled);
  const [promoCategory, setPromoCategory] = useState(promoConfig.categoryRedirect || 'Tulipanes');
  const [promoFeedback, setPromoFeedback] = useState('');

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price);
    setOriginalPrice(product.originalPrice);
    setStock(product.stock);
    setImageUrl(product.imageUrl);
    setDescription(product.description);
    setStemCount(product.stemCount || '');
    setTagSelection(product.tags?.[0] || 'Nuevo');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setPrice(120);
    setOriginalPrice(undefined);
    setStock(15);
    setImageUrl('');
    setDescription('');
    setStemCount('');
    setTagSelection('Nuevo');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imageUrl.trim() || price <= 0) {
      alert('Por favor completa el nombre, precio e imagen del producto.');
      return;
    }

    const transformedUrl = transformDriveUrl(imageUrl);

    if (editingId) {
      const updated: Product = {
        id: editingId,
        name,
        category,
        price,
        originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
        stock,
        imageUrl: transformedUrl,
        description,
        stemCount: stemCount || undefined,
        tags: [tagSelection as any],
      };
      onUpdateProduct(updated);
      setProductFeedback('¡Producto actualizado con éxito!');
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name,
        category,
        price,
        originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
        stock,
        imageUrl: transformedUrl,
        description,
        stemCount: stemCount || undefined,
        tags: [tagSelection as any],
        featured: true,
      };
      onAddProduct(newProd);
      setProductFeedback('¡Nuevo arreglo añadido al catálogo!');
    }

    handleCancelEdit();
    setTimeout(() => setProductFeedback(''), 3000);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPromo: PromoConfig = {
      isEnabled: promoEnabled,
      title: promoTitle,
      subtitle: promoSubtitle,
      badge: promoBadge,
      couponCode: promoCoupon.trim().toUpperCase() || undefined,
      driveImageUrl: transformDriveUrl(promoDriveUrl),
      ctaText: promoCtaText,
      categoryRedirect: promoCategory,
    };

    onUpdatePromoConfig(updatedPromo);
    setPromoFeedback('¡Configuración de la promoción guardada!');
    setTimeout(() => setPromoFeedback(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
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
          {/* Add / Edit Form */}
          <div className="bg-white rounded-3xl p-6 border border-[#5C715E]/15 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-serif-boutique font-bold text-lg text-[#2C362D]">
                {editingId ? 'Editar Producto del Catálogo' : 'Agregar Nuevo Arreglo al Catálogo'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Nombre del Arreglo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Tulipanes Noche de Verano"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">Categoría *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                  >
                    <optgroup label="Ocasiones Cusco">
                      <option value="Citas & Romance">Citas & Romance</option>
                      <option value="Graduaciones">Graduaciones</option>
                      <option value="Cumpleaños">Cumpleaños</option>
                      <option value="Condolencias & Homenaje">Condolencias & Homenaje</option>
                    </optgroup>
                    <optgroup label="Colecciones & Variedades">
                      <option value="Tulipanes">Tulipanes</option>
                      <option value="Rosas de Lujo">Rosas de Lujo</option>
                      <option value="Ramos de Autor">Ramos de Autor</option>
                      <option value="Flores Preservadas">Flores Preservadas</option>
                      <option value="Merchandising & Regalos">Merchandising & Regalos</option>
                    </optgroup>
                  </select>
                </div>

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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Precio Anterior (Opcional si tiene oferta)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ej: 160"
                    value={originalPrice || ''}
                    onChange={(e) =>
                      setOriginalPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">Etiqueta Destacada</label>
                  <select
                    value={tagSelection}
                    onChange={(e) => setTagSelection(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Temporada">Temporada</option>
                    <option value="Exclusivo">Exclusivo</option>
                  </select>
                </div>
              </div>

              {/* Image URL with Drive link transformer */}
              <div className="p-4 bg-[#FBF9F6] rounded-2xl border border-[#5C715E]/15">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-[#2C362D] mb-1 flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-[#5C715E]" />
                      <span>Link de Imagen (Soporta Google Drive o Web) *</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/file/d/.../view o URL directa"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      💡 Tip: Puedes pegar directamente el enlace para compartir de Google Drive. El sistema lo convertirá automáticamente para visualización directa.
                    </p>
                  </div>

                  {/* Immediate Image Preview */}
                  {imageUrl && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-gray-400 mb-1">Vista Previa</span>
                      <img
                        src={transformDriveUrl(imageUrl)}
                        alt="Previsualización"
                        className="w-16 h-16 rounded-xl object-cover border border-gray-300 shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description & Stem count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre las variedades de flores, colores y follajes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Cantidad de Tallos / Formato
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 20 Tallos holandeses"
                    value={stemCount}
                    onChange={(e) => setStemCount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  id="btn-save-product-catalog"
                  className="py-2.5 px-6 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Guardar Cambios' : 'Publicar en Catálogo'}</span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-2.5 px-4 rounded-full border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {productFeedback && (
                <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  {productFeedback}
                </p>
              )}
            </form>
          </div>

          {/* Current Products Table */}
          <div className="bg-white rounded-3xl border border-[#5C715E]/15 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-serif-boutique font-bold text-lg text-[#2C362D]">
                Listado de Productos en Catálogo
              </h3>
              <span className="text-xs text-gray-500">{products.length} productos activos</span>
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
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4">
                        <img
                          src={transformDriveUrl(prod.imageUrl)}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#2C362D]">{prod.name}</td>
                      <td className="py-2.5 px-4 text-gray-500">{prod.category}</td>
                      <td className="py-2.5 px-4 font-bold">{formatCurrency(prod.price)}</td>
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
                              if (confirm(`¿Estás seguro de eliminar "${prod.name}" del catálogo?`)) {
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PROMOTION POPUP & DRIVE LINK SETTINGS */}
      {activeSubTab === 'promo' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs uppercase font-bold text-[#5C715E] tracking-wider">
                Marketing y Campañas
              </span>
              <h3 className="text-xl font-serif-boutique font-bold text-[#2C362D]">
                Configurar Popup Promocional (Poppat)
              </h3>
            </div>

            {/* Test live preview button */}
            <button
              id="btn-preview-promo-live"
              type="button"
              onClick={onTriggerPromoPreview}
              className="px-4 py-2 rounded-full bg-[#D49A89] hover:bg-[#B87C6B] text-[#2C362D] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Previsualizar Popup en Vivo</span>
            </button>
          </div>

          <form onSubmit={handleSavePromo} className="space-y-5">
            {/* Enable toggle */}
            <div className="p-4 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/15 flex items-center justify-between">
              <div>
                <label className="font-bold text-sm text-[#2C362D] block cursor-pointer">
                  Activar Popup Promocional para Visitantes
                </label>
                <p className="text-xs text-gray-500">
                  Si está activo, aparecerá suavemente a los usuarios al ingresar a la tienda.
                </p>
              </div>
              <input
                type="checkbox"
                checked={promoEnabled}
                onChange={(e) => setPromoEnabled(e.target.checked)}
                className="w-5 h-5 text-[#5C715E] rounded-sm focus:ring-[#5C715E] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C362D] mb-1">
                  Título de la Promoción *
                </label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C362D] mb-1">
                  Etiqueta / Badge *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Temporada de Tulipanes"
                  value={promoBadge}
                  onChange={(e) => setPromoBadge(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#2C362D] mb-1">
                  Subtítulo / Texto Explicativo *
                </label>
                <textarea
                  rows={2}
                  required
                  value={promoSubtitle}
                  onChange={(e) => setPromoSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C362D] mb-1">
                  Código de Cupón (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: TULIPAN15"
                  value={promoCoupon}
                  onChange={(e) => setPromoCoupon(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C362D] mb-1">
                  Categoría a la que Dirige
                </label>
                <select
                  value={promoCategory}
                  onChange={(e) => setPromoCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                >
                  <optgroup label="Ocasiones Cusco">
                    <option value="Citas & Romance">Citas & Romance</option>
                    <option value="Graduaciones">Graduaciones</option>
                    <option value="Cumpleaños">Cumpleaños</option>
                    <option value="Condolencias & Homenaje">Condolencias & Homenaje</option>
                  </optgroup>
                  <optgroup label="Colecciones">
                    <option value="Tulipanes">Tulipanes</option>
                    <option value="Rosas de Lujo">Rosas de Lujo</option>
                    <option value="Ramos de Autor">Ramos de Autor</option>
                    <option value="Flores Preservadas">Flores Preservadas</option>
                    <option value="Merchandising & Regalos">Merchandising & Regalos</option>
                  </optgroup>
                </select>
              </div>

              {/* Google Drive Link for Promo Image */}
              <div className="md:col-span-2 p-4 bg-[#FBF9F6] rounded-2xl border border-[#5C715E]/15">
                <label className="block text-xs font-bold text-[#2C362D] mb-1 flex items-center gap-1.5">
                  <Link className="w-4 h-4 text-[#5C715E]" />
                  <span>Link de Google Drive con la Imagen Promocional *</span>
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={promoDriveUrl}
                    onChange={(e) => setPromoDriveUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  />
                  {promoDriveUrl && (
                    <img
                      src={transformDriveUrl(promoDriveUrl)}
                      alt="Preview Promo"
                      className="w-16 h-12 rounded-lg object-cover border shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Soporta enlaces directos de Google Drive ("Cualquier persona con el enlace puede ver"). Se adapta automáticamente al formato de imagen.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C362D] mb-1">
                  Texto del Botón CTA
                </label>
                <input
                  type="text"
                  value={promoCtaText}
                  onChange={(e) => setPromoCtaText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6]"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                id="btn-save-promo-config"
                className="py-3 px-8 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Configuración de Promoción</span>
              </button>
            </div>

            {promoFeedback && (
              <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                {promoFeedback}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
