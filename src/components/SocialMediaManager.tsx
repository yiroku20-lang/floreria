import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  Link,
  Sparkles,
  Share2,
  Heart,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  BadgeCheck,
  Code2,
  Play,
} from 'lucide-react';
import { SocialVideoPost } from '../types';
import { parseSocialUrl, reloadTikTokEmbeds } from '../utils/socialUtils';
import { transformDriveUrl, analyzeImageUrl } from '../utils/driveUtils';
import { INITIAL_SOCIAL_POSTS } from '../data/initialData';

interface SocialMediaManagerProps {
  posts: SocialVideoPost[];
  onUpdatePosts: (posts: SocialVideoPost[]) => void;
}

export const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({
  posts,
  onUpdatePosts,
}) => {
  const [editingPost, setEditingPost] = useState<SocialVideoPost | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formInputRaw, setFormInputRaw] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPlatform, setFormPlatform] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok');
  const [formAuthorHandle, setFormAuthorHandle] = useState('@rosanfer14');
  const [formAuthorName, setFormAuthorName] = useState('Rosanfer Florería Cusco');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [previewTab, setPreviewTab] = useState<'smartphone' | 'official'>('official');

  // Live URL analysis
  const parsed = parseSocialUrl(formInputRaw);
  const thumbnailAnalysis = analyzeImageUrl(formThumbnailUrl);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormInputRaw('');
    setFormTitle('');
    setFormDescription('');
    setFormPlatform('tiktok');
    setFormAuthorHandle('@rosanfer14');
    setFormAuthorName('Rosanfer Florería Cusco');
    setFormThumbnailUrl('https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80');
    setFormVideoUrl('');
    setFormIsActive(true);
    setFormIsPinned(false);
    setIsCreatingNew(true);
  };

  const handleOpenEdit = (post: SocialVideoPost) => {
    setEditingPost(post);
    setFormInputRaw(post.url);
    setFormTitle(post.title);
    setFormDescription(post.description);
    setFormPlatform(post.platform);
    setFormAuthorHandle(post.authorHandle);
    setFormAuthorName(post.authorName || 'Rosanfer Florería Cusco');
    setFormThumbnailUrl(post.thumbnailUrl || '');
    setFormVideoUrl(post.videoUrl || '');
    setFormIsActive(post.isActive);
    setFormIsPinned(!!post.isPinned);
    setIsCreatingNew(true);
  };

  const handleRawInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setFormInputRaw(val);
    const p = parseSocialUrl(val);
    setFormPlatform(p.platform);
    if (p.authorHandle && !editingPost) {
      setFormAuthorHandle(p.authorHandle);
    }
    if (p.extractedTitle && (!formTitle || formTitle.startsWith('Video TikTok'))) {
      setFormTitle(p.extractedTitle);
    }
  };

  const handleInsertSampleCode = () => {
    const sample = '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@rosanfer14/video/7677590657304628500" data-video-id="7677590657304628500" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@rosanfer14" href="https://www.tiktok.com/@rosanfer14?refer=embed">@rosanfer14</a> <p>Ovejitas en la pradera 🐑🐑🌳 </p> <a target="_blank" title="♬ suara asli - Fhand" href="https://www.tiktok.com/music/suara-asli-Fhand-7493805862193007366?refer=embed">♬ suara asli - Fhand</a> </section> </blockquote>';
    setFormInputRaw(sample);
    const p = parseSocialUrl(sample);
    setFormPlatform(p.platform);
    setFormAuthorHandle(p.authorHandle || '@rosanfer14');
    if (p.extractedTitle) setFormTitle(p.extractedTitle);
    setFormDescription('Momentos del taller floral y campo ✨ Rosanfer Florería');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formInputRaw.trim() || !formTitle.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor completa el enlace o código embed y el título del video.',
      });
      return;
    }

    const currentParsed = parseSocialUrl(formInputRaw);
    const finalCleanUrl = currentParsed.cleanUrl || formInputRaw.trim();

    const postPayload: SocialVideoPost = {
      id: editingPost ? editingPost.id : `social-${Date.now()}`,
      platform: formPlatform,
      title: formTitle.trim(),
      description: formDescription.trim(),
      url: finalCleanUrl,
      videoId: currentParsed.videoId,
      videoUrl: formVideoUrl.trim() || undefined,
      thumbnailUrl: transformDriveUrl(formThumbnailUrl.trim()) || undefined,
      authorHandle: formAuthorHandle.trim() || '@rosanfer14',
      authorName: formAuthorName.trim() || 'Rosanfer Florería Cusco',
      isActive: formIsActive,
      isPinned: formIsPinned,
      order: editingPost ? editingPost.order : posts.length + 1,
    };

    let updatedList: SocialVideoPost[];
    if (editingPost) {
      updatedList = posts.map((p) => (p.id === editingPost.id ? postPayload : p));
      setFeedback({ type: 'success', message: '¡Video actualizado correctamente!' });
    } else {
      updatedList = [postPayload, ...posts];
      setFeedback({ type: 'success', message: '¡Nuevo video de TikTok/Red social agregado con éxito!' });
    }

    onUpdatePosts(updatedList);
    reloadTikTokEmbeds();
    setIsCreatingNew(false);
    setEditingPost(null);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta publicación de la vitrina?')) {
      const updated = posts.filter((p) => p.id !== id);
      onUpdatePosts(updated);
      setFeedback({ type: 'success', message: 'Publicación eliminada correctamente.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = posts.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p));
    onUpdatePosts(updated);
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= posts.length) return;

    const newPosts = [...posts];
    const temp = newPosts[index];
    newPosts[index] = newPosts[targetIndex];
    newPosts[targetIndex] = temp;

    // Recalculate orders
    const reordered = newPosts.map((p, idx) => ({ ...p, order: idx + 1 }));
    onUpdatePosts(reordered);
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('¿Restablecer los videos de muestra originales de TikTok e Instagram?')) {
      onUpdatePosts(INITIAL_SOCIAL_POSTS);
      reloadTikTokEmbeds();
      setFeedback({ type: 'success', message: 'Videos de muestra restablecidos.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C715E]/10 text-[#5C715E] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D49A89]" />
              <span>Módulo de Redes Sociales & TikTok</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif-boutique font-bold text-[#2C362D]">
              Vitrina de Videos & Embeds Oficiales
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Agrega links o códigos <code className="bg-gray-100 px-1 py-0.5 rounded text-[#2C362D] font-mono text-[11px]">&lt;blockquote&gt;</code> de TikTok para que los clientes puedan reproducir los videos reales con audio y seguir a <span className="font-bold text-[#5C715E]">@rosanfer14</span>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRestoreDefaults}
              className="px-4 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Restablecer videos por defecto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Muestra</span>
            </button>

            <button
              id="btn-add-social-post"
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar Nuevo Video</span>
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`mt-4 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Stats summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10">
            <span className="text-[11px] text-gray-500 block uppercase font-bold tracking-wider">
              Total Publicaciones
            </span>
            <span className="text-xl font-bold font-serif-boutique text-[#2C362D]">
              {posts.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10">
            <span className="text-[11px] text-gray-500 block uppercase font-bold tracking-wider">
              Videos Activos
            </span>
            <span className="text-xl font-bold font-serif-boutique text-emerald-700">
              {posts.filter((p) => p.isActive).length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10">
            <span className="text-[11px] text-gray-500 block uppercase font-bold tracking-wider">
              TikToks Oficiales
            </span>
            <span className="text-xl font-bold font-serif-boutique text-[#2C362D]">
              {posts.filter((p) => p.platform === 'tiktok').length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#5C715E]/10">
            <span className="text-[11px] text-gray-500 block uppercase font-bold tracking-wider">
              Cuenta Oficial
            </span>
            <span className="text-xs font-bold text-[#5C715E] truncate block mt-1">
              @rosanfer14
            </span>
          </div>
        </div>
      </div>

      {/* MODAL / FORM: CREATE OR EDIT VIDEO */}
      {isCreatingNew && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#5C715E]/30 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div>
              <span className="text-xs font-bold text-[#D49A89] uppercase tracking-wider block">
                {editingPost ? 'Modificando Publicación' : 'Nueva Publicación para la Web'}
              </span>
              <h4 className="text-lg font-serif-boutique font-bold text-[#2C362D]">
                {editingPost ? 'Editar Video de TikTok / Red Social' : 'Conectar Video de TikTok o Reel'}
              </h4>
            </div>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Fields (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Social URL or Embed Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#2C362D]">
                      Enlace o Código Embed de TikTok / Instagram *
                    </label>
                    <button
                      type="button"
                      onClick={handleInsertSampleCode}
                      className="text-[11px] font-semibold text-[#5C715E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Code2 className="w-3 h-3 text-[#D49A89]" />
                      <span>Cargar ejemplo de @rosanfer14</span>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      rows={3}
                      required
                      placeholder="Pega aquí el enlace de TikTok (https://www.tiktok.com/@rosanfer14/video/...) o el código <blockquote ...> copiado de TikTok"
                      value={formInputRaw}
                      onChange={handleRawInputChange}
                      className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                    />
                  </div>
                  
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                    <span>Plataforma:</span>
                    <span className="font-bold text-[#5C715E] uppercase bg-[#5C715E]/10 px-2 py-0.5 rounded-md">
                      {formPlatform}
                    </span>
                    {parsed.videoId && (
                      <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                        ID Video: {parsed.videoId}
                      </span>
                    )}
                    {parsed.authorHandle && (
                      <span className="text-gray-600 font-semibold">
                        Autor: {parsed.authorHandle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Título del Video *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ovejitas en la pradera 🐑🐑🌳 o Ramo de 50 rosas en Cusco"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                  />
                </div>

                {/* Description & Hashtags */}
                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Descripción & Hashtags
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Momentos de nuestro taller en Cusco ✨ #TikTokPeru #FloreriaCusco #FloresDeAutor"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                  />
                </div>

                {/* Cover Image / Thumbnail (Google Drive link or Unsplash/URL) */}
                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Foto de Portada / Miniatura (Opcional - Enlace de Google Drive o URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/... o URL de imagen (si deseas portada personalizada)"
                    value={formThumbnailUrl}
                    onChange={(e) => setFormThumbnailUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                  />
                  {thumbnailAnalysis.isDrive && (
                    <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                      ✓ Enlace de Google Drive detectado y transformado automáticamente.
                    </p>
                  )}
                </div>

                {/* Handle & Account */}
                <div>
                  <label className="block text-xs font-bold text-[#2C362D] mb-1">
                    Handle de TikTok / Red Social
                  </label>
                  <input
                    type="text"
                    value={formAuthorHandle}
                    onChange={(e) => setFormAuthorHandle(e.target.value)}
                    placeholder="@rosanfer14"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FBF9F6] focus:outline-none focus:ring-2 focus:ring-[#5C715E]"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#5C715E] focus:ring-[#5C715E]"
                    />
                    <span className="text-xs font-bold text-[#2C362D]">Mostrar en la web (Activo)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D49A89] focus:ring-[#D49A89]"
                    />
                    <span className="text-xs font-bold text-[#2C362D]">Fijar como Destacado ⭐</span>
                  </label>
                </div>
              </div>

              {/* Right Column: Live Mockup Preview (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 mb-3">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('official')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewTab === 'official' ? 'bg-white text-[#2C362D] shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Embed Oficial
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('smartphone')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewTab === 'smartphone' ? 'bg-white text-[#2C362D] shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Marco Celular
                  </button>
                </div>

                {previewTab === 'official' ? (
                  <div className="w-full max-w-[325px] bg-white rounded-2xl p-3 border border-gray-200 shadow-md">
                    <div className="text-[11px] text-gray-500 mb-2 flex items-center justify-between font-medium">
                      <span>Vista Previa del Embed:</span>
                      <span className="text-[#5C715E] font-bold">{formAuthorHandle}</span>
                    </div>

                    {parsed.videoId ? (
                      <div className="rounded-xl overflow-hidden bg-black/90 aspect-9/16 flex flex-col items-center justify-center relative p-4 text-center">
                        <img
                          src={
                            transformDriveUrl(formThumbnailUrl) ||
                            'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80'
                          }
                          alt="Cover"
                          className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-black/50" />
                        <div className="relative z-10 space-y-3">
                          <div className="w-12 h-12 rounded-full bg-cyan-400 text-black flex items-center justify-center mx-auto shadow-lg">
                            <Play className="w-6 h-6 fill-black ml-0.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">
                              {formTitle || 'Video Oficial de TikTok'}
                            </p>
                            <p className="text-[10px] text-cyan-300 mt-1 font-mono">
                              ID: {parsed.videoId}
                            </p>
                          </div>
                          <span className="inline-block text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-xs font-bold">
                            ▶ Reproduce con audio real en la web
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-9/16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 text-center text-gray-400">
                        <Code2 className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-xs">Pega el link o código de TikTok para ver la previsualización</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-64 bg-[#1B221C] rounded-[36px] p-2.5 border-2 border-[#5C715E]/40 shadow-xl overflow-hidden">
                    <div className="relative aspect-9/16 rounded-[28px] overflow-hidden bg-black flex flex-col justify-between p-3">
                      {/* Background image preview */}
                      <img
                        src={
                          transformDriveUrl(formThumbnailUrl) ||
                          'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80'
                        }
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/85" />

                      {/* Top Notch */}
                      <div className="relative z-10 flex items-center justify-between text-[9px] text-white/80 font-bold">
                        <span>Rosanfer</span>
                        <div className="w-10 h-2.5 bg-black rounded-full" />
                        <span className="text-cyan-300 uppercase">{formPlatform}</span>
                      </div>

                      {/* Bottom Info */}
                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] text-cyan-300 font-bold block">
                          {formAuthorHandle}
                        </span>
                        <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                          {formTitle || 'Título del video de TikTok'}
                        </p>
                        <p className="text-[9px] text-white/70 line-clamp-1">
                          {formDescription || '#FloreriaCusco #FloresDeAutor'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {editingPost ? 'Guardar Cambios' : 'Publicar en la Tienda'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST OF CURRENT SOCIAL POSTS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5C715E]/15 shadow-sm space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-serif-boutique font-bold text-[#2C362D]">
            Videos Activos en la Vitrina ({posts.length})
          </h4>
          <span className="text-xs text-gray-500 font-medium">
            Usa las flechas para ordenar qué video aparece primero
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <Sparkles className="w-8 h-8 text-[#D49A89] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-gray-600">No hay videos en la vitrina todavía.</p>
            <p className="text-xs text-gray-400 mt-1">
              Haz clic en "+ Agregar Nuevo Video" para insertar tu primer TikTok o Reel.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, idx) => {
              const postParsed = parseSocialUrl(post.url);
              return (
                <div
                  key={post.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    post.isActive
                      ? 'bg-[#FBF9F6] border-[#5C715E]/20 hover:border-[#5C715E]/40'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  {/* Left: Thumbnail and info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-[#5C715E]/20">
                      <img
                        src={
                          transformDriveUrl(post.thumbnailUrl) ||
                          'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 px-1 py-0.2 rounded-md bg-black/70 text-[8px] font-bold text-white uppercase">
                        {post.platform}
                      </div>
                      {post.isPinned && (
                        <div className="absolute bottom-1 right-1 text-xs" title="Fijado">
                          ⭐
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#5C715E]">{post.authorHandle}</span>
                        {post.isPinned && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#D49A89]/20 text-[#2C362D] font-bold">
                            Fijado ⭐
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                            post.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {post.isActive ? 'Visible en tienda' : 'Pausado'}
                        </span>
                      </div>

                      <h5 className="text-xs sm:text-sm font-bold text-[#2C362D] truncate max-w-md">
                        {post.title}
                      </h5>

                      <p className="text-[11px] text-gray-500 truncate max-w-md">
                        {post.description || 'Sin descripción adicional'}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        {postParsed.videoId && <span className="font-mono">ID TikTok: {postParsed.videoId}</span>}
                        <span className="capitalize">Plataforma: {post.platform}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Move Up/Down */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5">
                      <button
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-gray-500 hover:text-[#5C715E] disabled:opacity-30 cursor-pointer"
                        title="Subir posición"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === posts.length - 1}
                        className="p-1 text-gray-500 hover:text-[#5C715E] disabled:opacity-30 cursor-pointer"
                        title="Bajar posición"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleActive(post.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        post.isActive
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={post.isActive ? 'Ocultar video' : 'Mostrar video'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Open in TikTok */}
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#5C715E] hover:border-[#5C715E] transition-colors"
                      title="Ver en TikTok / Red social"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#5C715E] hover:border-[#5C715E] transition-colors cursor-pointer"
                      title="Editar publicación"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 rounded-xl bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                      title="Eliminar publicación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
