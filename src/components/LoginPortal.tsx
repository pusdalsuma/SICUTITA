import React, { useState } from 'react';
import { UserAccount } from '../types';
import { klhLogoBase64 } from './klhLogoBase64';

interface LoginPortalProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onRefreshUsers?: () => Promise<UserAccount[]>;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ users, onLoginSuccess, onRefreshUsers }) => {
  const [activePortal, setActivePortal] = useState<'pegawai' | 'verifikator'>('pegawai');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan Password wajib diisi.');
      return;
    }

    setIsLoggingIn(true);
    let currentUsersList = users;

    try {
      // Fetch latest users directly from Supabase, so newly inputted accounts work instantly!
      if (onRefreshUsers) {
        const fresh = await onRefreshUsers();
        if (fresh && fresh.length > 0) {
          currentUsersList = fresh;
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch live database users on login, using local/cached memory.', err);
    }

    // Authenticate
    const matched = currentUsersList.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    setIsLoggingIn(false);

    if (!matched) {
      setErrorMsg('Username atau Password yang Anda masukkan salah atau belum sinkron.');
      return;
    }

    // Check portal compatibility
    if (activePortal === 'pegawai' && matched.role !== 'pegawai') {
      setErrorMsg('Akun Anda terdaftar sebagai Verifikator/Admin. Silakan login melalui Portal Pejabat & Verifikator.');
      return;
    }
    if (activePortal === 'verifikator' && matched.role === 'pegawai') {
      setErrorMsg('Akun Pegawai tidak dapat mengakses Portal Verifikator. Silakan login melalui Portal Pegawai Pemohon.');
      return;
    }

    onLoginSuccess(matched);
  };

  const handleQuickLogin = (user: UserAccount, portal: 'pegawai' | 'verifikator') => {
    setActivePortal(portal);
    setUsername(user.username);
    setPassword(user.password || '123');
    setErrorMsg('');
    
    // Auto submit or trigger login
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden" id="login-portal-stage">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-600/5 blur-3xl pointer-events-none" />

      {/* Main card box */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl relative z-10 transition-all">
        
        {/* Core Header info */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-2.5 mx-auto mb-4 shadow-xl shadow-emerald-500/5">
            <img src={klhLogoBase64} alt="KLH Logo" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">SICUTITA</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Sistem Informasi Cuti & Izin Terintegrasi<br />
            PUSAT PENGENDALIAN LINGKUNGAN HIDUP SULAWESI dan MALUKU
          </p>
        </div>

        {/* Portal option tabs */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-850/60 mb-6" id="login-portal-tabs">
          <button
            type="button"
            onClick={() => {
              setActivePortal('pegawai');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activePortal === 'pegawai'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👤 Pegawai Pemohon
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePortal('verifikator');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activePortal === 'verifikator'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💼 Verifikator & Admin
          </button>
        </div>

        {/* Title indicating chosen portal */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            {activePortal === 'pegawai' ? '⚡ PORTAL KHUSUS PEGAWAI' : '🔒 PORTAL PENANDATANGAN / ADMIN'}
          </span>
          <h3 className="text-sm font-semibold text-slate-200">
            {activePortal === 'pegawai'
              ? 'Silakan masuk untuk mengajukan permohonan cuti'
              : 'Verifikasi berkas cuti masuk & kelola akun'}
          </h3>
        </div>

        {/* Standard sign-in form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-550/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Username Pengguna</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username anda..."
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-650"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Kata Sandi (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-650"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-750 text-white font-bold text-xs uppercase rounded-xl tracking-wider transition shadow-lg shadow-emerald-500/10 mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            id="login-btn-submit"
          >
            {isLoggingIn ? (
              <>
                <span className="h-3 w-3 border-2 border-emerald-300 border-t-white rounded-full animate-spin" />
                <span>Menghubungkan ke Database...</span>
              </>
            ) : (
              <span>Masuk Ke Aplikasi</span>
            )}
          </button>
        </form>

        {/* Demo Quick login block */}
        <div className="mt-8 pt-6 border-t border-slate-850">
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-550 block mb-3 text-center">
            💡 AKSES CEPAT (PILORED UNTUK PENGUJIAN)
          </span>
          
          <div className="space-y-2">
            
            {/* Pegawai role click quick option */}
            <div className="flex flex-wrap gap-2 justify-center">
              {users.map((u) => {
                const isPeg = u.role === 'pegawai';
                const icon = u.role === 'pegawai' ? '👤' : u.role === 'atasan' ? '🤝' : u.role === 'pejabat' ? '👑' : '⚙️';
                const badgeStyle = u.role === 'pegawai' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : u.role === 'atasan'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : u.role === 'pejabat'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  : 'bg-slate-500/10 text-slate-300 border-slate-500/20';

                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u, isPeg ? 'pegawai' : 'verifikator')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 border border-slate-850 hover:border-emerald-600/50 hover:bg-slate-900 rounded-xl text-[10px] text-slate-300 transition text-left"
                    title={`Login as ${u.nama}`}
                  >
                    <span>{icon}</span>
                    <div className="leading-tight">
                      <span className="font-bold text-[9px] text-white block">{u.username} <span className="font-normal text-slate-500">({u.role})</span></span>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-500 text-center mt-2 font-light">
              Kata sandi awal semua akun adalah <strong className="text-slate-400 font-bold">123</strong>. Admin dapat menambah pengguna baru di halaman Admin.
            </p>
          </div>
        </div>

      </div>

      {/* Decorative footer standard citation */}
      <div className="text-[10px] text-slate-600 mt-8 font-mono select-none text-center">
        SICUTITA • SECURE LOCAL DATABASE AUTH • VERSI 2.0
      </div>
    </div>
  );
};
