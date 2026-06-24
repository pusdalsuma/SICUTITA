import { useState, useEffect } from 'react';
import { LeaveRequest, UserAccount } from './types';
import { initialRequests } from './initialData';
import { initialUsers } from './initialUsers';
import { FormulirCuti } from './components/FormulirCuti';
import { FormulirSuratIzin } from './components/FormulirSuratIzin';
import { ReviewCuti } from './components/ReviewCuti';
import { PrintPDF } from './components/PrintPDF';
import { AppsScriptExporter } from './components/AppsScriptExporter';
import { LoginPortal } from './components/LoginPortal';
import { AdminPanel } from './components/AdminPanel';
import { klhLogoBase64 } from './components/klhLogoBase64';
import { UserGuide } from './components/UserGuide';
import {
  getSupabaseConfig,
  fetchUsersFromSupabase,
  upsertUserToSupabase,
  deleteUserFromSupabase,
  fetchRequestsFromSupabase,
  upsertRequestToSupabase,
  deleteRequestFromSupabase,
} from './lib/supabase';

export default function App() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'surat-izin' | 'review' | 'apps-script' | 'admin'>('form');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial users database and requests on mount
  useEffect(() => {
    async function hydrate() {
      setIsLoading(true);
      const dbConfigured = getSupabaseConfig() !== null;
      let loadedUsers: UserAccount[] = [];
      let loadedRequests: LeaveRequest[] = [];

      // 1. Hydrate User Database
      if (dbConfigured) {
        const supabaseUsers = await fetchUsersFromSupabase();
        if (supabaseUsers && supabaseUsers.length > 0) {
          loadedUsers = supabaseUsers;
          setUsers(supabaseUsers);
        } else {
            loadedUsers = initialUsers;
            setUsers(initialUsers);
        }
      } else {
          loadedUsers = initialUsers;
          setUsers(initialUsers);
      }

      // 2. Hydrate Leave Requests
      if (dbConfigured) {
        const supabaseRequests = await fetchRequestsFromSupabase();
        if (supabaseRequests && supabaseRequests.length > 0) {
          loadedRequests = supabaseRequests;
          setRequests(supabaseRequests);
          setSelectedRequest(supabaseRequests[0]);
        } else {
          // If configured but empty, use empty list
          loadedRequests = [];
          setRequests([]);
        }
      } else {
        loadedRequests = [];
        setRequests([]);
      }

      // 3. Hydrate Current User Session
      const savedSession = sessionStorage.getItem('pplh_current_user');
      if (savedSession) {
        try {
          const sessionUser = JSON.parse(savedSession);
          // Sync with absolute latest in database
          const latestProfile = loadedUsers.find((u) => u.id === sessionUser.id) || sessionUser;
          setCurrentUser(latestProfile);
          
          // Auto-route tabs based on profile
          if (latestProfile.role === 'pegawai') {
            setActiveTab('form');
          } else if (latestProfile.role === 'admin') {
            setActiveTab('admin');
          } else {
            setActiveTab('review');
          }
        } catch (e) {
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    }

    hydrate();
  }, []);

  // Sync state changes of requests
  const updateRequestsState = (updatedList: LeaveRequest[]) => {
    setRequests(updatedList);
  };

  // Auth Callbacks
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    sessionStorage.setItem('pplh_current_user', JSON.stringify(user));

    // Smart route based on roles
    if (user.role === 'pegawai') {
      setActiveTab('form');
    } else if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('review');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('pplh_current_user');
    setIsFullScreenPreview(false);
  };

  // Admin database modification triggers
  const handleAddUser = async (newUser: UserAccount) => {
    const updated = [...users, newUser];
    setUsers(updated);
    await upsertUserToSupabase(newUser);
  };

  const handleUpdateUser = async (updatedUser: UserAccount) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      sessionStorage.setItem('pplh_current_user', JSON.stringify(updatedUser));
    }
    await upsertUserToSupabase(updatedUser);
  };

  const handleDeleteUser = async (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    await deleteUserFromSupabase(userId);
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengajuan ini secara permanen?')) {
      const updated = requests.filter((r) => r.id !== requestId);
      updateRequestsState(updated);
      await deleteRequestFromSupabase(requestId);
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(updated.length > 0 ? updated[0] : null);
      }
    }
  };

  // Request Submit
  const handleAddNewRequest = async (newRequest: LeaveRequest) => {
    const updated = [newRequest, ...requests];
    updateRequestsState(updated);
    setSelectedRequest(newRequest);
    
    // Auto sync user's signature to their account profile if it was created/updated during submission
    if (newRequest.pegawai.signatureImg && currentUser && newRequest.pegawai.signatureImg !== currentUser.signatureImg) {
      const updatedUser = { ...currentUser, signatureImg: newRequest.pegawai.signatureImg };
      handleUpdateUser(updatedUser);
    }

    const isSuratIzin = newRequest.jenisCuti === 'surat_izin';
    setActiveTab(isSuratIzin ? 'surat-izin' : 'form');
    
    await upsertRequestToSupabase(newRequest);
    
    alert(`Pengajuan berhasil dikirim!\n\nPemohon: ${newRequest.pegawai.nama}\nID Dokumen: ${newRequest.id}\n\nTinjauan lembar cetak diperbarui pada panel kanan.`);
  };

  // Signature and Approvals
  const handleApprove = async (
    id: string,
    role: 'atasan' | 'pejabat',
    status: string,
    name: string,
    nip: string,
    notes: string,
    signatureImg?: string
  ) => {
    const updated = requests.map((req) => {
      if (req.id !== id) return req;

      const dateStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const updatedReq = { ...req };
      if (role === 'atasan') {
        updatedReq.atasan = {
          status: status as any,
          nama: name,
          nip: nip,
          catatan: notes,
          tanggal: dateStr,
          signed: true,
          signatureImg: signatureImg || req.atasan.signatureImg,
        };
        if (status === 'DISETUJUI') {
          updatedReq.statusPengajuan = 'DISETUJUI_ATASAN';
        } else if (status === 'TIDAK DISETUJUI') {
          updatedReq.statusPengajuan = 'DITOLAK';
        }
      } else {
        updatedReq.pejabat = {
          status: status as any,
          jabatan: updatedReq.pejabat.jabatan || 'Kepala Pusat',
          nama: name,
          nip: nip,
          catatan: notes,
          tanggal: dateStr,
          signed: true,
          signatureImg: signatureImg || req.pejabat.signatureImg,
        };
        if (status === 'DISETUJUI' && updatedReq.statusPengajuan === 'DISETUJUI_ATASAN') {
          updatedReq.statusPengajuan = 'SELESAI';
        } else if (status === 'TIDAK DISETUJUI') {
          updatedReq.statusPengajuan = 'DITOLAK';
        } else if (status === 'DISETUJUI') {
          updatedReq.statusPengajuan = 'SELESAI';
        }
      }
      return updatedReq;
    });

    updateRequestsState(updated);
    
    const found = updated.find((r) => r.id === id);
    if (found) {
      setSelectedRequest(found);
      await upsertRequestToSupabase(found);

      // Save user profile signature as well
      if (signatureImg && currentUser) {
        // Find matching profile by name/nip or role to make it durable in local storage/DB
        const isSelf = currentUser.role === role || currentUser.role === 'admin';
        if (isSelf) {
          const matchedProfile = users.find(u => u.nip === nip || u.nama === name);
          if (matchedProfile) {
            const updatedProfile = { ...matchedProfile, signatureImg };
            handleUpdateUser(updatedProfile);
          } else {
            // fallback to current logged in user
            const updatedProfile = { ...currentUser, signatureImg };
            handleUpdateUser(updatedProfile);
          }
        }
      }
    }

    alert('Perubahan keputusan berhasil disahkan!');
  };

  // Render Login state if session not authentic
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-slate-950 font-bold">Menghubungkan ke Database...</div>;
  }
  
  if (!currentUser) {
    return (
      <LoginPortal 
        users={users} 
        onLoginSuccess={handleLoginSuccess} 
        onRefreshUsers={async () => {
          const freshUsers = await fetchUsersFromSupabase();
          if (freshUsers && freshUsers.length > 0) {
            setUsers(freshUsers);
            localStorage.setItem('pplh_user_accounts', JSON.stringify(freshUsers));
            return freshUsers;
          }
          return users;
        }}
      />
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans" id="app-root-view">
      
      {/* Navbar Title Banner */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 sticky top-0 z-40 print:hidden">
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 flex items-center justify-center bg-slate-900 border border-slate-805 text-emerald-400 font-bold shrink-0 shadow-lg p-1.5 rounded-xl">
            <img src={klhLogoBase64} alt="Logo" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide uppercase">SICUTITA</h1>
              <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded-full border border-slate-850 text-slate-400 font-bold">V2.0</span>
            </div>
            <p className="text-xs text-slate-400">Sistem Informasi Cuti & Izin Terintegrasi & Akurat</p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs based on role */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-850/60" id="navbar-nav-tabs">
            
            {/* 1. Admin Tab (Only for Admin) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setIsFullScreenPreview(false);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                  activeTab === 'admin' && !isFullScreenPreview
                    ? 'bg-yellow-600 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚙️ Kelola Pengaju
              </button>
            )}

            {/* 2. Formulir Pegawai (Only for pegawai or admin) */}
            {(currentUser.role === 'pegawai' || currentUser.role === 'admin') && (
              <>
                <button
                  onClick={() => {
                    setActiveTab('form');
                    setIsFullScreenPreview(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                    activeTab === 'form' && !isFullScreenPreview
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌴 Formulir Cuti
                </button>

                <button
                  onClick={() => {
                    setActiveTab('surat-izin');
                    setIsFullScreenPreview(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                    activeTab === 'surat-izin' && !isFullScreenPreview
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📝 Formulir Surat Izin
                </button>
              </>
            )}

            {/* 3. Meja Atasan review (For atasan, pejabat, admin) */}
            {(currentUser.role === 'atasan' || currentUser.role === 'pejabat' || currentUser.role === 'admin') && (
              <button
                onClick={() => {
                  setActiveTab('review');
                  setIsFullScreenPreview(false);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 relative ${
                  activeTab === 'review' && !isFullScreenPreview
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚖️ Meja Atasan
                {requests.filter(r => r.statusPengajuan === 'DIAJUKAN').length > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                )}
              </button>
            )}

            {/* 4. Deploy GAS tab (For reviewers and admin) */}
            {(currentUser.role === 'atasan' || currentUser.role === 'pejabat' || currentUser.role === 'admin') && (
              <button
                onClick={() => {
                  setActiveTab('apps-script');
                  setIsFullScreenPreview(false);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                  activeTab === 'apps-script' && !isFullScreenPreview
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🤖 Deploy GAS
              </button>
            )}

            {/* 5. Panduan Tab (Accessible to everyone) */}
            <button
              onClick={() => {
                setActiveTab('panduan');
                setIsFullScreenPreview(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                activeTab === 'panduan' && !isFullScreenPreview
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📖 Panduan
            </button>
          </div>

          {/* Profile Identity Widget & Logout */}
          <div className="flex items-center gap-3 border-l border-slate-850 pl-4">
            <div className="text-right hidden md:block leading-tight">
              <span className="text-xs font-bold text-white block">{currentUser.nama}</span>
              <span className="text-[9px] text-emerald-400 uppercase tracking-wider font-bold block">{currentUser.role} • NIP: {currentUser.nip}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/10 text-xs rounded-xl font-bold transition flex items-center gap-1 shrink-0"
              title="Keluar dari sesi ini"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 flex overflow-hidden min-h-0 print:overflow-visible" id="app-viewport">
        
        {/* Left Interactive Panel */}
        <div className={`p-6 xl:p-8 overflow-y-auto w-full transition-all duration-350 print:hidden ${
          isFullScreenPreview ? 'hidden w-0 p-0' : 'md:w-[50%] lg:w-[50%] xl:w-[55%]'
        }`}>
          
          {/* Quick Active Document Selector (so both pegawais and admins/reviewers can select which form to preview) */}
          <div className="mb-6 bg-slate-905/60 border border-slate-850/80 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">📄</span>
              <div>
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Dokumen Aktif (Pratinjau)</h3>
                <p className="text-[9px] text-slate-400">Pilih dokumen yang ingin ditampilkan di kertas preview.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                id="doc-preview-select"
                value={selectedRequest?.id || ''}
                onChange={(e) => {
                  const req = requests.find((r) => r.id === e.target.value);
                  if (req) {
                    setSelectedRequest(req);
                  }
                }}
                className="bg-slate-950 border border-slate-850 rounded-lg text-xs px-3 py-1.5 text-white max-w-[220px] focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
              >
                {requests.length === 0 ? (
                  <option value="">(Belum ada pengajuan)</option>
                ) : (
                  requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.jenisCuti === 'surat_izin' ? 'IZIN' : 'CUTI'}] - {r.pegawai.nama.split(',')[0]}
                    </option>
                  ))
                )}
              </select>

              {/* Mobile layout preview toggler */}
              <button
                onClick={() => setIsFullScreenPreview(!isFullScreenPreview)}
                className="md:hidden bg-indigo-650 hover:bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center"
                title="Tukar antara formulir dan kertas"
              >
                {isFullScreenPreview ? '✍️ Form' : '📄 Kertas'}
              </button>
            </div>
          </div>
          
          {/* Admin panel rendered if tab active */}
          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <AdminPanel
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'form' && (currentUser.role === 'pegawai' || currentUser.role === 'admin') && (
            <div className="space-y-6">
              <FormulirCuti onSubmit={handleAddNewRequest} currentUser={currentUser} />
            </div>
          )}

          {activeTab === 'surat-izin' && (currentUser.role === 'pegawai' || currentUser.role === 'admin') && (
            <div className="space-y-6">
              <FormulirSuratIzin onSubmit={handleAddNewRequest} currentUser={currentUser} />
            </div>
          )}

          {activeTab === 'review' && (currentUser.role === 'atasan' || currentUser.role === 'pejabat' || currentUser.role === 'admin') && (
            <ReviewCuti
              requests={requests}
              onApprove={handleApprove}
              onDelete={handleDeleteRequest}
              onSelectRequest={(req) => setSelectedRequest(req)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'apps-script' && (currentUser.role === 'atasan' || currentUser.role === 'pejabat' || currentUser.role === 'admin') && (
            <AppsScriptExporter />
          )}

          {activeTab === 'panduan' && (
            <UserGuide />
          )}
        </div>

        {/* Right Live A4 Print Mirror (PrintPDF) */}
        {selectedRequest && (
          <div className={`border-l border-slate-900 bg-slate-950 transition-all duration-350 print:border-none print:w-full print:block ${
            isFullScreenPreview ? 'w-full md:w-full' : 'hidden md:block md:w-[50%] lg:w-[50%] xl:w-[45%]'
          }`}>
            <div className="relative h-full flex flex-col">
              
              {/* Floating Fullscreen button */}
              <button
                onClick={() => setIsFullScreenPreview(!isFullScreenPreview)}
                className="absolute top-6 right-36 bg-slate-800/80 hover:bg-slate-700/80 text-white p-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition border border-slate-700 pointer-events-auto print:hidden z-10 hidden md:flex items-center gap-1"
                title={isFullScreenPreview ? "Tampilkan Sisi Kiri" : "Besarkan Layar Cetak"}
              >
                {isFullScreenPreview ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                    </svg>
                    <span>Sisi Edit</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>Layar Penuh</span>
                  </>
                )}
              </button>

              <PrintPDF
                request={selectedRequest}
                onClose={isFullScreenPreview ? () => setIsFullScreenPreview(false) : undefined}
              />
            </div>
          </div>
        )}

      </main>

      {/* Responsive footer disclaimer */}
      <footer className="bg-slate-900/30 border-t border-slate-900 p-4 text-center text-xs text-slate-500 print:hidden flex flex-col sm:flex-row sm:justify-between sm:px-8">
        <p>© 2026 Pusat Pengendalian Lingkunngan Hidup Sulawesi dan Maluku. All rights reserved.</p>
        <p className="mt-1 sm:mt-0">Didesain presisi sesuai Formulir Cuti No. Sc. /ADM-TU/SET/B/01/2025 • Multi-Role Portal Enabled</p>
      </footer>

    </div>
  );
}
