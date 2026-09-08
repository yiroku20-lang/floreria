import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { RosanferLogo } from './RosanferLogo';
import { AdminUser, AdminSession } from '../types';
import { safeGetStorage, safeSetStorage } from '../utils/driveUtils';

interface AdminLoginProps {
  onSuccess: (session: AdminSession) => void;
  onCancel: () => void;
}

const DEFAULT_ADMIN_EMAIL = 'admin@rosanfer.pe';
const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PASS = 'rosanfer2025';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve stored custom password if modified by user in settings
  const customPassword = safeGetStorage<string>('rosanfer_admin_pass_custom', DEFAULT_ADMIN_PASS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanIdent = identifier.trim().toLowerCase();
      const cleanPass = password.trim();

      const isUserMatch = cleanIdent === DEFAULT_ADMIN_USER || cleanIdent === DEFAULT_ADMIN_EMAIL;
      const isPassMatch = cleanPass === customPassword;

      if (isUserMatch && isPassMatch) {
        const user: AdminUser = {
          username: cleanIdent === DEFAULT_ADMIN_USER ? 'admin' : cleanIdent,
          email: DEFAULT_ADMIN_EMAIL,
          name: 'Administrador Floral',
          role: 'Super Admin',
        };

        const session: AdminSession = {
          user,
          token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          loginTime: new Date().toISOString(),
        };

        if (rememberMe) {
          safeSetStorage('rosanfer_admin_active_session', session);
        }

        onSuccess(session);
      } else {
        setErrorMsg('Usuario o contraseña incorrectos. Verifica los datos e intenta nuevamente.');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2C362D]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-[#FBF9F6] rounded-3xl shadow-2xl border border-[#5C715E]/20 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-[#2C362D] px-6 py-5 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <RosanferLogo size="sm" variant="horizontal" light />
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Volver a la tienda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#5C715E]/10 border border-[#5C715E]/20 flex items-center justify-center text-[#5C715E] mb-3">
              <ShieldCheck className="w-6 h-6 text-[#5C715E]" />
            </div>
            <h2 className="text-2xl font-serif-boutique font-bold text-[#2C362D]">
              Intranet de Administración
            </h2>
            <p className="text-xs text-[#2C362D]/70 mt-1">
              Acceso restringido para control de pedidos, inventario y catálogo floral en Cusco
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#2C362D] mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#5C715E]" />
                <span>Usuario o Correo Electrónico</span>
              </label>
              <input
                type="text"
                required
                placeholder="admin@rosanfer.pe o admin"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5C715E] text-[#2C362D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C362D] mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#5C715E]" />
                <span>Contraseña de Seguridad</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5C715E] text-[#2C362D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#2C362D]/80">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-[#5C715E] focus:ring-[#5C715E]"
                />
                <span>Mantener sesión iniciada</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#5C715E] hover:bg-[#4a5c4c] text-white font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Ingresar a la Intranet</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-[#5C715E]/15">
            <div className="bg-[#5C715E]/5 p-3 rounded-2xl border border-[#5C715E]/15 text-center">
              <p className="text-[11px] text-[#2C362D]/80 leading-relaxed">
                Portal protegido para el equipo de <strong>Rosanfer Florería</strong>. Si olvidaste tus credenciales de acceso, comunícate con la administración de la boutique.
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-gray-500 hover:text-[#2C362D] hover:underline cursor-pointer"
              >
                Volver a la tienda pública
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
