import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Share2,
  Play,
  ExternalLink,
  Sparkles,
  Flame,
  X,
  Volume2,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { SocialVideoPost } from '../types';
import { parseSocialUrl, reloadTikTokEmbeds } from '../utils/socialUtils';
import { transformDriveUrl } from '../utils/driveUtils';

interface SocialShowcaseSectionProps {
  posts: SocialVideoPost[];
}

export const SocialShowcaseSection: React.FC<SocialShowcaseSectionProps> = ({ posts }) => {
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'tiktok' | 'instagram'>('all');
  const [selectedModalPost, setSelectedModalPost] = useState<SocialVideoPost | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const activePosts = posts
    .filter((p) => p.isActive)
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || a.order - b.order);

  const filteredPosts = activePosts.filter((post) => {
    if (filterPlatform === 'all') return true;
    return post.platform === filterPlatform;
  });

  // Load and refresh TikTok embed script whenever posts or filter change
  useEffect(() => {
    reloadTikTokEmbeds();
  }, [filteredPosts.length, filterPlatform]);

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = (post: SocialVideoPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(post.url);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  if (activePosts.length === 0) {
    return null;
  }

  return (
    <section
      id="redes-sociales-section"
      className="py-16 sm:py-20 bg-linear-to-b from-[#FBF9F6] via-[#F5F2EB] to-[#FBF9F6] border-t border-[#5C715E]/15 relative overflow-hidden"
    >
      {/* Decorative background glows */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-[#5C715E]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full bg-[#D49A89]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C715E]/10 border border-[#5C715E]/20 text-[#5C715E] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D49A89]" />
            <span>Comunidad & Taller en Vivo</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif-boutique font-bold text-[#2C362D] tracking-tight">
            Nuestras Redes Sociales & TikTok
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-[#2C362D]/75 leading-relaxed">
            Descubre el detrás de escena de nuestro taller en Cusco: selección de flores frescas,
            confección de ramos de autor y las reacciones de entregas sorpresa a domicilio.
          </p>

          {/* Social Links & Platform Filters */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="p-1 rounded-2xl bg-white border border-[#5C715E]/20 shadow-2xs inline-flex items-center gap-1">
              <button
                onClick={() => setFilterPlatform('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterPlatform === 'all'
                    ? 'bg-[#5C715E] text-white shadow-2xs'
                    : 'text-[#2C362D]/70 hover:text-[#2C362D] hover:bg-gray-100'
                }`}
              >
                Todos los Videos ({activePosts.length})
              </button>
              <button
                onClick={() => setFilterPlatform('tiktok')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterPlatform === 'tiktok'
                    ? 'bg-[#2C362D] text-white shadow-2xs'
                    : 'text-[#2C362D]/70 hover:text-[#2C362D] hover:bg-gray-100'
                }`}
              >
                <TikTokIcon className="w-3.5 h-3.5" />
                <span>TikTok</span>
              </button>
              <button
                onClick={() => setFilterPlatform('instagram')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterPlatform === 'instagram'
                    ? 'bg-[#D49A89] text-[#2C362D] shadow-2xs'
                    : 'text-[#2C362D]/70 hover:text-[#2C362D] hover:bg-gray-100'
                }`}
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </button>
            </div>

            <a
              href="https://www.tiktok.com/@rosanfer14"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-2xl bg-[#2C362D] hover:bg-black text-white text-xs font-semibold flex items-center gap-2 shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <TikTokIcon className="w-3.5 h-3.5 text-[#D49A89]" />
              <span>Seguir @rosanfer14</span>
              <ExternalLink className="w-3 h-3 text-white/60" />
            </a>
          </div>
        </div>

        {/* Video Showcase Grid (Official Embed Cards in Phone Frames) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-stretch">
          {filteredPosts.map((post) => (
            <OfficialTikTokCard
              key={post.id}
              post={post}
              isLiked={!!likedPosts[post.id]}
              isCopied={copiedId === post.id}
              onToggleLike={(e) => handleToggleLike(post.id, e)}
              onShare={(e) => handleShare(post, e)}
              onOpenModal={() => setSelectedModalPost(post)}
            />
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-[#5C715E]/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#5C715E]/10 text-[#5C715E] flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 text-[#D49A89]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif-boutique font-bold text-[#2C362D]">
                ¿Quieres que grabemos la confección o entrega de tu ramo?
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Al hacer tu pedido por WhatsApp, puedes solicitar un video corto exclusivo de la
                preparación de tus flores en nuestro taller.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/51989415220?text=%C2%A1Hola%20Rosanfer!%20Vi%20sus%20videos%20en%20TikTok%20y%20quisiera%20hacer%20un%20pedido%20floral%20en%20Cusco."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center gap-2 cursor-pointer"
          >
            <span>Pedir Arreglo Personalizado</span>
            <ExternalLink className="w-4 h-4 text-[#D49A89]" />
          </a>
        </div>
      </div>

      {/* POPUP / MODAL PARA REPRODUCCIÓN EN PANTALLA COMPLETA */}
      {selectedModalPost && (
        <TikTokPlayerModal
          post={selectedModalPost}
          onClose={() => setSelectedModalPost(null)}
        />
      )}
    </section>
  );
};

// --- OFFICIAL TIKTOK & SOCIAL CARD COMPONENT ---

interface OfficialTikTokCardProps {
  post: SocialVideoPost;
  isLiked: boolean;
  isCopied: boolean;
  onToggleLike: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onOpenModal: () => void;
}

const OfficialTikTokCard: React.FC<OfficialTikTokCardProps> = ({
  post,
  isLiked,
  isCopied,
  onToggleLike,
  onShare,
  onOpenModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const parsed = parseSocialUrl(post.url);
  const coverImage = transformDriveUrl(post.thumbnailUrl || '');

  const handleCardClick = () => {
    if (parsed.videoId) {
      onOpenModal();
    } else if (post.url) {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative flex flex-col justify-between bg-[#1B221C] rounded-[36px] p-2.5 sm:p-3 border-2 border-[#2C362D]/60 hover:border-[#D49A89] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 select-none overflow-hidden"
    >
      {/* Phone Screen Container (Aspect Ratio 9:16) */}
      <div className="relative aspect-9/16 rounded-[28px] overflow-hidden bg-black flex flex-col justify-between p-3.5">
        {/* Background High-Res Cover with Cinematic Gradient */}
        <img
          src={coverImage || 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80'}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/20 to-black/90 pointer-events-none" />

        {/* TOP BAR: Notch & Official Platform Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-white font-medium">
            {post.platform === 'tiktok' ? (
              <TikTokIcon className="w-3 h-3 text-cyan-300" />
            ) : (
              <InstagramIcon className="w-3 h-3 text-[#D49A89]" />
            )}
            <span className="font-bold text-white tracking-wide uppercase text-[9px]">
              {post.platform}
            </span>
          </div>

          {/* Dynamic Phone Speaker Notch */}
          <div className="w-12 h-3 bg-black/90 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-4 h-1 bg-white/20 rounded-full" />
          </div>

          {post.isPinned ? (
            <span className="px-2 py-0.5 rounded-full bg-[#D49A89] text-[#2C362D] text-[9px] font-bold shadow-xs">
              ★ TOP
            </span>
          ) : (
            <div className="w-6" />
          )}
        </div>

        {/* CENTER: Play Button Trigger */}
        <div
          onClick={handleCardClick}
          className="relative z-10 my-auto flex flex-col items-center justify-center cursor-pointer group-hover:scale-105 transition-transform"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#5C715E]/90 hover:bg-[#5C715E] text-white flex items-center justify-center shadow-2xl border-2 border-white/80 transition-all active:scale-95 group-hover:bg-[#D49A89] group-hover:text-[#2C362D]">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
            <div className="absolute -inset-2 rounded-full border border-white/40 animate-ping pointer-events-none opacity-40" />
          </div>
          <span className="mt-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] text-white font-bold tracking-wide border border-white/20 shadow-md">
            ▶ Ver Video
          </span>
        </div>

        {/* BOTTOM: Handle, Title & Actions */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-cyan-300 tracking-tight truncate">
                  {post.authorHandle || '@rosanfer14'}
                </span>
                <span className="text-[10px] text-white/60">• Cusco</span>
              </div>

              <p className="text-xs font-semibold text-white line-clamp-2 leading-snug mt-0.5 text-shadow-sm">
                {post.title}
              </p>

              <p className="text-[10px] text-white/70 line-clamp-1 mt-0.5">
                {post.description || 'Flores de autor y sorpresas a domicilio ✨'}
              </p>
            </div>

            {/* Right Floating Actions (Like & Share) */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {/* Like Button */}
              <button
                onClick={onToggleLike}
                className="flex flex-col items-center gap-0.5 group/btn cursor-pointer"
                title="Me gusta"
              >
                <div
                  className={`p-2 rounded-full backdrop-blur-md border transition-all active:scale-75 ${
                    isLiked
                      ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/50 shadow-md scale-105'
                      : 'bg-black/60 text-white/90 border-white/20 hover:bg-black/80'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                </div>
              </button>

              {/* Share Button */}
              <button
                onClick={onShare}
                className="flex flex-col items-center gap-0.5 group/btn cursor-pointer"
                title="Copiar enlace"
              >
                <div
                  className={`p-2 rounded-full backdrop-blur-md border transition-all active:scale-75 ${
                    isCopied
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-black/60 text-white/90 border-white/20 hover:bg-black/80'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Direct CTA */}
          <div className="pt-1.5 border-t border-white/15 flex items-center justify-between text-[10px]">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-white/85 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Abrir en {post.platform === 'tiktok' ? 'TikTok' : 'Instagram'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <button
              onClick={handleCardClick}
              className="text-[#D49A89] hover:underline font-bold text-[10px] cursor-pointer"
            >
              Reproducir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- POPUP REPRODUCTOR OFICIAL DE TIKTOK (OPTIMIZADO A DIMENSIONES EXACTAS & AUDIO) ---

interface TikTokPlayerModalProps {
  post: SocialVideoPost;
  onClose: () => void;
}

const TikTokPlayerModal: React.FC<TikTokPlayerModalProps> = ({ post, onClose }) => {
  const parsed = parseSocialUrl(post.url);
  const videoId = parsed.videoId || '7677590657304628500';
  const [hasInteractedAudio, setHasInteractedAudio] = useState(false);

  useEffect(() => {
    reloadTikTokEmbeds();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Smartphone Device Container: Exact TikTok 9:16 Aspect & Mobile Frame Dimensions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[340px] sm:max-w-[360px] bg-[#121713] rounded-[40px] p-2.5 sm:p-3 border-2 border-[#5C715E]/50 shadow-2xl flex flex-col items-center max-h-[96vh] overflow-hidden text-white animate-in zoom-in-95 duration-200"
      >
        {/* Top Speaker & Notch Bar */}
        <div className="w-full flex items-center justify-between px-3 pt-1 pb-2">
          <div className="flex items-center gap-1.5">
            <TikTokIcon className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-[11px] font-bold text-white tracking-wide">
              {post.authorHandle || '@rosanfer14'}
            </span>
          </div>

          {/* Center Speaker Notch */}
          <div className="w-14 h-3.5 bg-black rounded-full border border-white/10 flex items-center justify-center gap-1.5">
            <div className="w-5 h-1 bg-white/20 rounded-full" />
            <div className="w-1.5 h-1.5 bg-cyan-900/60 rounded-full" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Cerrar reproductor"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Video Frame Screen (Matches TikTok Dimensions: 325px wide by ~580px tall) */}
        <div className="w-full relative rounded-[28px] overflow-hidden bg-black flex flex-col items-center justify-center min-h-[480px] sm:min-h-[540px] max-h-[72vh] border border-white/10">
          {parsed.videoId ? (
            <iframe
              src={`https://www.tiktok.com/player/v1/${videoId}?autoplay=1&muted=0&mute=0&music_info=1`}
              title={post.title}
              className="w-full h-full min-h-[480px] sm:min-h-[540px] border-0"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; display-capture; clipboard-write; gyroscope; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full p-4 flex flex-col items-center justify-center text-center">
              <blockquote
                className="tiktok-embed"
                cite={post.url}
                data-video-id={videoId}
                style={{ maxWidth: '325px', minWidth: '280px', width: '100%', margin: 0 }}
              >
                <section>
                  <a
                    target="_blank"
                    title={post.authorHandle || '@rosanfer14'}
                    href={`https://www.tiktok.com/${post.authorHandle || '@rosanfer14'}?refer=embed`}
                  >
                    {post.authorHandle || '@rosanfer14'}
                  </a>
                  <p>{post.title}</p>
                </section>
              </blockquote>
            </div>
          )}
        </div>

        {/* Bottom Smartphone Actions Bar */}
        <div className="w-full pt-2.5 pb-1 px-1 flex items-center justify-between gap-2">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-2.5 rounded-full bg-[#2C362D] hover:bg-black text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border border-white/10"
          >
            <TikTokIcon className="w-3 h-3 text-cyan-300 shrink-0" />
            <span className="truncate">Abrir en TikTok</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
          </a>

          <a
            href={`https://wa.me/51989415220?text=${encodeURIComponent(
              `¡Hola Rosanfer! Vi su video "${post.title}" en la web y me gustaría pedir este ramo.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-2.5 rounded-full bg-[#5C715E] hover:bg-[#4a5c4c] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <span className="truncate">Pedir por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// --- ICON COMPONENTS ---

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.84-4.5V8.9a8.18 8.18 0 0 0 4.77 1.52V7c-.28-.01-.56-.11-.84-.31Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
