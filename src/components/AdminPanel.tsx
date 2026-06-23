import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { getSupabaseConfig, saveSupabaseConfig, testConnection } from '../lib/supabase';

interface AdminPanelProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  
  // Supabase Configuration States
  const [dbConfig, setDbConfig] = useState(() => getSupabaseConfig());
  const [supabaseUrl, setSupabaseUrl] = useState(dbConfig?.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(dbConfig?.supabaseAnonKey || '');
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'failed' | 'no-tables'>(
    dbConfig ? 'success' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isSqlExpanded, setIsSqlExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Form States for creating/modifying users
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState<UserRole>('pegawai');
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [unitKerja, setUnitKerja] = useState('Pusat Pengendalian Lingkungan Hidup Suma');
  const [masaKerja, setMasaKerja] = useState('');
  const [bidangWilayah, setBidangWilayah] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setUsername('');
    setPassword('123');
    setRole('pegawai');
    setNama('');
    setNip('');
    setJabatan('');
    setUnitKerja('Pusat Pengendalian Lingkungan Hidup Suma');
    setMasaKerja('');
    setBidangWilayah('');
    setEditingUser(null);
    setIsAdding(false);
  };

  const handleEditInit = (user: UserAccount) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(user.password || '123');
    setRole(user.role);
    setNama(user.nama);
    setNip(user.nip);
    setJabatan(user.jabatan || '');
    setUnitKerja(user.unitKerja || 'Pusat Pengendalian Lingkungan Hidup Suma');
    setMasaKerja(user.masaKerja || '');
    setBidangWilayah(user.bidangWilayah || '');
    setIsAdding(true); // open form
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !nama.trim() || !nip.trim()) {
      alert('Username, Nama Lengkap, dan NIP/Identitas wajib diisi.');
      return;
    }

    // Check duplicate username if adding new
    if (!editingUser) {
      const exists = users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase());
      if (exists) {
        alert('Username sudah terdaftar. Silakan gunakan username lain!');
        return;
      }
    }

    const payload: UserAccount = {
      id: editingUser ? editingUser.id : 'usr_' + Date.now(),
      username: username.trim().toLowerCase(),
      password: password || '123',
      role,
      nama: nama.trim(),
      nip: nip.trim(),
      jabatan: jabatan.trim(),
      unitKerja: unitKerja.trim(),
      masaKerja: masaKerja.trim(),
      bidangWilayah: bidangWilayah
    };

    if (editingUser) {
      onUpdateUser(payload);
      alert('Berhasil memperbarui data pengguna!');
    } else {
      onAddUser(payload);
      alert('Berhasil mendaftarkan pengguna baru!');
    }

    resetForm();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nip.includes(searchQuery)
  );

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:p-8 shadow-xl text-slate-100">
      
      {/* Header section with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-800 gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-yellow-550/10 text-yellow-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            Manajemen Basis Data Pengguna
          </h2>
          <p className="text-xs text-slate-400 mt-1">Daftarkan akun pegawai, atasan, atau pejabat yang berhak mengakses sistem cuti.</p>
        </div>
        
        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-750 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Pengguna Baru
          </button>
        )}
      </div>

      {isAdding ? (
        /* Form for Adding / Editing Account */
        <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-850 mb-6">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              {editingUser ? '📝 Perbarui Data Pengguna' : '👤 Tambah Data Pengguna Baru'}
            </h3>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-white text-xs font-semibold"
            >
              Batal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Username login</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="misal: stiawati.rahayu"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-705"
                  required
                  disabled={!!editingUser}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Kata Sandi (Password)</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata sandi login"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm transition outline-none text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Peran Akun (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm transition outline-none text-slate-100"
                >
                  <option value="pegawai">Pegawai Pemohon Cuti</option>
                  <option value="atasan">Atasan Langsung (Signing Atasan)</option>
                  <option value="pejabat">Pejabat Berwenang (Signing Pejabat/Kepala)</option>
                  <option value="admin">Administrator (Pengelola Users)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="misal: Stiawati Rahayu, S.E., M.Si"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-705"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">NIP Pengguna</label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="misal: 19731123 199803 2 001"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm transition outline-none text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Jabatan (Kosongkan bila Admin)</label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="misal: Pedal Madya / Kepala Tata Usaha"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm transition outline-none text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Unit Kerja</label>
                <input
                  type="text"
                  value={unitKerja}
                  onChange={(e) => setUnitKerja(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm transition outline-none text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Masa Kerja (Khusus Pegawai)</label>
                <input
                  type="text"
                  value={masaKerja}
                  onChange={(e) => setMasaKerja(e.target.value)}
                  placeholder="misal: 26 Tahun 10 Bulan"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm transition outline-none text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Bagian/Bidang Wilayah</label>
                <select
                  value={bidangWilayah}
                  onChange={(e) => setBidangWilayah(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-705"
                >
                  <option value="">-- Pilih Bagian/Bidang Wilayah --</option>
                  <option value="Subbagian Tata Usaha">Subbagian Tata Usaha</option>
                  <option value="Bidwil I">Bidwil I</option>
                  <option value="Bidwil II">Bidwil II</option>
                  <option value="Bidwil III">Bidwil III</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-755 text-slate-400 text-xs font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-605 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
              >
                {editingUser ? 'Simpan Perubahan' : 'Daftarkan Akun'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Database Registered Accounts Table/Cards */}
      <div className="space-y-4">
        
        {/* Search Input bar */}
        <div className="flex max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, username atau NIP..."
            className="w-full px-4.5 py-2 bg-slate-955/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs transition outline-none text-slate-100 placeholder-slate-550"
          />
        </div>

        <div className="border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg bg-slate-950/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Username / NIP</th>
                  <th className="py-3.5 px-4 font-bold">Nama Lengkap</th>
                  <th className="py-3.5 px-4 font-bold">Peran (Role)</th>
                  <th className="py-3.5 px-4 font-bold">Jabatan & Unit Kerja</th>
                  <th className="py-3.5 px-4 font-bold text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-550 italic">
                      Tidak ditemukan data pengguna yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-4">
                        <span className="font-bold text-white block">{user.username}</span>
                        <span className="font-mono text-[10px] text-slate-500 mt-0.5 block">{user.nip || 'Tak Ada NIP'}</span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-200">
                        {user.nama}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          user.role === 'admin'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : user.role === 'atasan'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : user.role === 'pejabat'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        <span className="block font-medium">{user.jabatan || 'N/A'}</span>
                        <span className="block text-[10px] text-slate-500">{user.unitKerja || 'PPLH Suma'}</span>
                        {user.bidangWilayah && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-semibold">
                            📍 {user.bidangWilayah}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditInit(user)}
                            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px]  font-bold transition"
                          >
                            Ubah
                          </button>
                          
                          {user.username !== 'admin' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Konfirmasi hapus akun "${user.username}"?`)) {
                                  onDeleteUser(user.id);
                                }
                              }}
                              className="p-1 px-2.5 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/20 rounded text-[10px] font-bold transition"
                            >
                              Hapus
                            </button>
                          )}
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

      {/* SECTION: SUPABASE INTEGRATION */}
      <div className="mt-10 pt-8 border-t border-slate-800" id="supabase-integration-section">
        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-850 gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                ⚡ Integrasi Database Supabase (PostgreSQL)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Sambungkan portal ini dengan database Supabase Cloud agar seluruh transaksi tersimpan permanen.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                testResult === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : testResult === 'idle'
                  ? 'bg-slate-800/20 text-slate-400 border-slate-800'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  testResult === 'success'
                    ? 'bg-emerald-400 animate-pulse'
                    : testResult === 'idle'
                    ? 'bg-slate-400'
                    : 'bg-red-400'
                }`} />
                {testResult === 'success'
                  ? 'Active / Connected (Supabase)'
                  : testResult === 'idle'
                  ? 'Offline Mode (Local Storage)'
                  : 'Disconnected / Error'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left credentials configuration column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">SUPABASE_URL</label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => {
                      setSupabaseUrl(e.target.value.trim());
                      setTestResult('idle');
                    }}
                    placeholder="misal: https://your-project-id.supabase.co"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-850 focus:border-emerald-500 rounded-xl text-xs transition outline-none text-slate-100 placeholder-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">SUPABASE_ANON_KEY (Public Key)</label>
                  <textarea
                    value={supabaseAnonKey}
                    onChange={(e) => {
                      setSupabaseAnonKey(e.target.value.trim());
                      setTestResult('idle');
                    }}
                    rows={3}
                    placeholder="Masukkan Anon API Key dari dashboard Supabase Project API Settings Anda..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-850 focus:border-emerald-500 rounded-xl text-xs transition outline-none text-slate-100 placeholder-slate-700 font-mono"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-red-950/25 text-red-400 rounded-xl border border-red-900/40 text-xs font-mono leading-relaxed">
                  ⚠️ <strong>Error Detail:</strong> {errorMessage}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (!supabaseUrl || !supabaseAnonKey) {
                      alert('Silakan lengkapi Supabase URL dan Anon Key terlebih dahulu!');
                      return;
                    }
                    setIsTestingConn(true);
                    setErrorMessage('');
                    const isOk = await testConnection(supabaseUrl, supabaseAnonKey);
                    setIsTestingConn(false);
                    if (isOk) {
                      saveSupabaseConfig({ supabaseUrl, supabaseAnonKey });
                      setTestResult('success');
                      alert('✅ Koneksi Supabase berhasil dipasang dan diaktifkan!');
                      // Trigger main UI memory synchronization
                      window.location.reload();
                    } else {
                      setTestResult('failed');
                      setErrorMessage('Gagal menghubungi tabel database Supabase Anda. Mohon pastikan kredensial benar dan SQL Schema di sebelah kanan sudah Anda jalankan di SQL Editor Supabase.');
                    }
                  }}
                  disabled={isTestingConn}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-750 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
                >
                  {isTestingConn ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                      <span>Menguji Sambungan...</span>
                    </>
                  ) : (
                    <>
                      <span>🔌 Hubungkan & Aktifkan</span>
                    </>
                  )}
                </button>

                {dbConfig && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Apakah Anda ingin mematikan koneksi Supabase dan kembali ke mode penyimpanan lokal?')) {
                        saveSupabaseConfig(null);
                        setSupabaseUrl('');
                        setSupabaseAnonKey('');
                        setTestResult('idle');
                        setDbConfig(null);
                        setErrorMessage('');
                        alert('Koneksi Supabase diputus. Sistem kembali ke mode Local Storage Offline.');
                        window.location.reload();
                      }
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    🚫 Kembalikan ke Mode Offline
                  </button>
                )}
              </div>
            </div>

            {/* Right side SQL instruction panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="border border-slate-800 rounded-xl bg-slate-900/30 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-850/60">
                  <span className="text-xs font-bold text-slate-350 flex items-center gap-1">
                    💾 1. Jalankan SQL di Supabase
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const text = document.getElementById('supabase-setup-sql-block')?.innerText;
                      if (text) {
                        navigator.clipboard.writeText(text);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }
                    }}
                    className="text-[10px] text-emerald-400 hover:underline font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? 'tersalin! ✔' : 'Salin SQL Schema'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Supabase memerlukan skema tabel database agar sistem cuti ini bisa berintegrasi. Masuk ke dashboard Supabase Anda, pilih menu <strong>SQL Editor</strong>, ketuk <strong>New Query</strong>, salin script di bawah ini, lalu jalankan (klik <strong>Run</strong>):
                </p>

                <div className="relative">
                  <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-850 bg-slate-950 p-3 text-[10px] font-mono text-emerald-300 leading-normal whitespace-pre-wrap select-all" id="supabase-setup-sql-block">
{`-- 1. Tabel Registrasi Akun Pengguna / Multi-Role Users
CREATE TABLE IF NOT EXISTS pplh_user_accounts (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT DEFAULT '123',
  role TEXT NOT NULL CHECK (role IN ('pegawai', 'atasan', 'pejabat', 'admin')),
  nama TEXT NOT NULL,
  nip TEXT NOT NULL,
  jabatan TEXT,
  unit_kerja TEXT DEFAULT 'Pusat Pengendalian Lingkungan Hidup Suma',
  masa_kerja TEXT,
  bidang_wilayah TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Pengajuan Lembar Formulir Cuti
CREATE TABLE IF NOT EXISTS pplh_leave_requests (
  id TEXT PRIMARY KEY,
  nomor_surat TEXT,
  tanggal_form TEXT,
  kepada_yth TEXT DEFAULT 'Kepada Yth. PPLH Sulawesi dan Maluku di Tempat',
  pegawai JSONB NOT NULL,
  jenis_cuti TEXT NOT NULL,
  alasan_cuti TEXT,
  lamanya_cuti TEXT,
  tanggal_mulai TEXT,
  tanggal_selesai TEXT,
  catatan_cuti JSONB NOT NULL,
  alamat_selama_cuti TEXT,
  telepon TEXT,
  atasan JSONB NOT NULL,
  pejabat JSONB NOT NULL,
  status_pengajuan TEXT NOT NULL CHECK (status_pengajuan IN ('DRAF', 'DIAJUKAN', 'DISETUJUI_ATASAN', 'SELESAI', 'DITOLAK')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Kebijakan Row Level Security (RLS) untuk Akses Publik
ALTER TABLE pplh_user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pplh_leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON pplh_user_accounts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON pplh_user_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON pplh_user_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON pplh_user_accounts FOR DELETE USING (true);

CREATE POLICY "Allow public select req" ON pplh_leave_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert req" ON pplh_leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update req" ON pplh_leave_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete req" ON pplh_leave_requests FOR DELETE USING (true);

-- 4. Akun Admin Bawaan
INSERT INTO pplh_user_accounts (id, username, password, role, nama, nip, jabatan, unit_kerja)
VALUES ('usr_admin', 'admin', 'admin123', 'admin', 'Administrator Utama', '19790101 200501 1 001', 'Kepala Admin IT', 'Pusat Pengendalian Lingkungan Hidup Suma')
ON CONFLICT (username) DO NOTHING;`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};
