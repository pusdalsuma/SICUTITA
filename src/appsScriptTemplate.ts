export const appsScriptCodeGs = `/**
 * Google Apps Script - Sistem Pengajuan Cuti PPLH
 * Tempatkan kode ini di file "Code.gs" pada Google Apps Script Anda (script.google.com)
 */

// 1. Konfigurasi Spreadsheet Utama
const SPREADSHEET_ID = ""; // Kosongkan jika script terikat ke Google Sheet, atau isi ID Spreadsheet Anda
const SHEET_NAME = "DataPengajuanCuti";

function getSheet() {
  const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Tulis Header Kolom
    const headers = [
      "ID Pengajuan", "Nomor Surat", "Tanggal Pengajuan", "Nama Pegawai", "NIP", "Jabatan", 
      "Masa Kerja", "Unit Kerja", "Jenis Cuti", "Alasan Cuti", "Lamanya Cuti (Hari)", 
      "Tanggal Mulai", "Tanggal Selesai", "Alamat Selama Cuti", "Telepon",
      "Status Atasan", "Nama Atasan", "NIP Atasan", "Tanggal Atasan",
      "Status Pejabat", "Jabatan Pejabat", "Nama Pejabat", "NIP Pejabat", "Tanggal Pejabat",
      "Status Pengajuan", "Tanggal Dibuat"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
  }
  return sheet;
}

// 2. Fungsi Utama untuk Melayani Tampilan Web App (HTML Service)
function doGet(e) {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Formulir Cuti PPLH Digital")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 3. Pengiriman Formulir Baru dari Web
function submitLeaveRequest(data) {
  try {
    const sheet = getSheet();
    const id = "REQ_" + new Date().getTime();
    const timestamp = new Date().toISOString();
    
    // Siapkan baris databaru
    const newRow = [
      id,
      data.nomorSurat || "Sc. /PPLH.MS/TU/SET.3.1/B/01/2025",
      data.tanggalForm || "",
      data.nama || "",
      data.nip || "",
      data.jabatan || "",
      data.masaKerja || "",
      data.unitKerja || "",
      data.jenisCuti || "",
      data.alasanCuti || "",
      data.lamanyaCuti || "",
      data.tanggalMulai || "",
      data.tanggalSelesai || "",
      data.alamatSelamaCuti || "",
      data.telepon || "",
      "PENDING", "", "", "", // Atasan
      "PENDING", "", "", "", "", // Pejabat
      "DIAJUKAN",
      timestamp
    ];
    
    sheet.appendRow(newRow);
    
    // Kirim notifikasi email opsional ke pegawai/atasan
    // MailApp.sendEmail(data.emailUser, "Pengajuan Cuti Berhasil", "Halo, pengajuan cuti Anda dengan ID " + id + " telah diajukan.");
    
    return { success: true, message: "Pengajuan berhasil dikirim!", id: id };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// 4. Ambil Daftar Seluruh Pengajuan
function getLeaveRequests() {
  try {
    const sheet = getSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) return [];
    
    const headers = values[0];
    const rows = values.slice(1);
    
    return rows.map(row => {
      let req = {};
      headers.forEach((h, index) => {
        // Map string headers to camelCase keys for ease of use
        const key = mapHeaderToKey(h);
        req[key] = row[index];
      });
      return req;
    });
  } catch (err) {
    return [];
  }
}

// Helper Map Header ke JS Key
function mapHeaderToKey(header) {
  const mapping = {
    "ID Pengajuan": "id",
    "Nomor Surat": "nomorSurat",
    "Tanggal Pengajuan": "tanggalForm",
    "Nama Pegawai": "nama",
    "NIP": "nip",
    "Jabatan": "jabatan",
    "Masa Kerja": "masaKerja",
    "Unit Kerja": "unitKerja",
    "Jenis Cuti": "jenisCuti",
    "Alasan Cuti": "alasanCuti",
    "Lamanya Cuti (Hari)": "lamanyaCuti",
    "Tanggal Mulai": "tanggalMulai",
    "Tanggal Selesai": "tanggalSelesai",
    "Alamat Selama Cuti": "alamatSelamaCuti",
    "Telepon": "telepon",
    "Status Atasan": "atasanStatus",
    "Nama Atasan": "atasanNama",
    "NIP Atasan": "atasanNip",
    "Tanggal Atasan": "atasanTanggal",
    "Status Pejabat": "pejabatStatus",
    "Jabatan Pejabat": "pejabatJabatan",
    "Nama Pejabat": "pejabatNama",
    "NIP Pejabat": "pejabatNip",
    "Tanggal Pejabat": "pejabatTanggal",
    "Status Pengajuan": "status",
    "Tanggal Dibuat": "createdAt"
  };
  return mapping[header] || header;
}

// 5. Update Persetujuan (Atasan atau Pejabat)
function updateApproval(id, role, approvalData) {
  try {
    const sheet = getSheet();
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        rowIndex = i + 1; // 1-indexed for sheets, +1 for headers
        break;
      }
    }
    
    if (rowIndex === -1) throw new Error("Pengajuan tidak ditemukan");
    
    const timestamp = new Date().toLocaleDateString("id-ID");
    
    if (role === "atasan") {
      // Kolom P: Status Atasan (kolom 16), Q: Nama Atasan, R: NIP Atasan, S: Tanggal Atasan
      sheet.getRange(rowIndex, 16).setValue(approvalData.status);
      sheet.getRange(rowIndex, 17).setValue(approvalData.nama);
      sheet.getRange(rowIndex, 18).setValue(approvalData.nip);
      sheet.getRange(rowIndex, 19).setValue(timestamp);
      
      // Update general status
      if (approvalData.status === "DISETUJUI") {
        sheet.getRange(rowIndex, 25).setValue("DISETUJUI_ATASAN");
      } else {
        sheet.getRange(rowIndex, 25).setValue("DITOLAK");
      }
    } else if (role === "pejabat") {
      // Kolom T: Status Pejabat (kolom 20), U: Jabatan Pejabat, V: Nama Pejabat, W: NIP Pejabat, X: Tanggal Pejabat
      sheet.getRange(rowIndex, 20).setValue(approvalData.status);
      sheet.getRange(rowIndex, 21).setValue(approvalData.jabatan || "Kepala Pusat");
      sheet.getRange(rowIndex, 22).setValue(approvalData.nama);
      sheet.getRange(rowIndex, 23).setValue(approvalData.nip);
      sheet.getRange(rowIndex, 24).setValue(timestamp);
      
      // Update general status
      if (approvalData.status === "DISETUJUI") {
        sheet.getRange(rowIndex, 25).setValue("SELESAI");
      } else {
        sheet.getRange(rowIndex, 25).setValue("DITOLAK");
      }
    }
    
    return { success: true, message: "Persetujuan berhasil diperbarui!" };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// 6. Sinkronisasi Database Pengguna (Pegawai & Verifikator)
const USERS_SHEET_NAME = "DaftarPengguna";

function getUsersSheet() {
  const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(USERS_SHEET_NAME);
    const headers = ["ID", "Username", "Password", "Nama Lengkap", "NIP", "Role", "Jabatan", "Unit Kerja", "Masa Kerja"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#fee2e2");
    
    // Add default users
    const defaultUsers = [
      ["usr_admin", "admin", "123", "Administrator", "19700101 200003 1 001", "admin", "Pranata Komputer Madya", "Pusat Teknologi Pengendalian Lingkungan", "15 Tahun"],
      ["usr_stia", "stiawati", "123", "Stiawati Rahayu, S.E., M.Si", "19731123 199803 2 001", "pegawai", "Pedal Madya", "Pusat Pengendalian Lingkungan Hidup Suma", "26 Tahun 10 Bulan"],
      ["usr_arni", "arnianah", "123", "Arnianah Alwi. S.Si., M.Si", "19681227 199803 2 001", "atasan", "Kepala Bidang Verifikasi", "Pusat Pengendalian Lingkungan Hidup Suma", "25 Tahun"],
      ["usr_azri", "azri", "123", "Dr. Azri Rasul, S.K.M., M.Si., M.H", "19710516 199803 1 001", "pejabat", "Kepala Pusat", "Pusat Pengendalian Lingkungan Hidup Suma", "28 Tahun"]
    ];
    sheet.getRange(2, 1, defaultUsers.length, headers.length).setValues(defaultUsers);
  }
  return sheet;
}

function getUserAccounts() {
  try {
    const sheet = getUsersSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    if (values.length <= 1) return [];
    
    const headers = values[0];
    const rows = values.slice(1);
    
    return rows.map(row => {
      return {
        id: row[0] || "",
        username: row[1] || "",
        password: row[2] || "",
        name: row[3] || "",
        nip: row[4] || "",
        role: row[5] || "",
        jabatan: row[6] || "",
        unit: row[7] || "",
        masakerja: row[8] || ""
      };
    });
  } catch (err) {
    return [];
  }
}

function saveUserAccounts(users) {
  try {
    const sheet = getUsersSheet();
    sheet.clear();
    const headers = ["ID", "Username", "Password", "Nama Lengkap", "NIP", "Role", "Jabatan", "Unit Kerja", "Masa Kerja"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#fee2e2");
    
    if (users && users.length > 0) {
      const rows = users.map(u => [
        u.id || "", u.username || "", u.password || "", u.name || "", u.nip || "", u.role || "", u.jabatan || "", u.unit || "", u.masakerja || ""
      ]);
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
`;

export const appsScriptIndexHtml = `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts Inter -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    /* Simple Custom Scrollbar style */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0b1329;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #334155;
    }

    /* Dark Slate Dashboard Theme Overrides matching React App */
    #app-stage {
      background-color: #0f172a !important; /* bg-slate-900 */
      border-color: #1e293b !important; /* border-slate-800 */
      color: #f1f5f9 !important;
    }
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .bg-white,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .bg-slate-50,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .bg-slate-100 {
      background-color: #0c1424 !important; /* deep slate bg */
    }
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .border-slate-200,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .border-slate-100,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .divide-slate-200 > *,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .divide-slate-100 > * {
      border-color: #1e293b !important;
    }
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) input,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) select,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) textarea {
      background-color: #030712 !important;
      border-color: #1e293b !important;
      color: #f1f5f9 !important;
    }
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .text-slate-900,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .text-slate-800,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .text-slate-700 {
      color: #f1f5f9 !important;
    }
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .text-slate-600,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .text-slate-500 {
      color: #cbd5e1 !important;
    }
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .text-slate-400 {
      color: #94a3b8 !important;
    }
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .hover\:bg-slate-50:hover {
      background-color: #1e293b !important;
    }
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .bg-emerald-50\/70 {
      background-color: #1a4d35 !important;
      border-color: #10b981 !important;
    }
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .text-emerald-850,
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .text-emerald-700 {
      color: #34d399 !important;
    }
    #app-stage :not(#print-sheet-payload):not(#print-sheet-payload *) .bg-emerald-100 {
      background-color: rgb(6 78 59) !important;
      color: rgb(110 231 183) !important;
    }
    
    /* Modals & Loading */
    #loading-indicator {
      background-color: rgba(3, 7, 18, 0.7) !important;
    }
    #loading-indicator > div {
      background-color: #0f172a !important;
      border-color: #1e293b !important;
      color: #f1f5f9 !important;
    }
    #loading-indicator p {
      color: #e2e8f0 !important;
    }
    #userModal > div,
    #statusModal > div {
      background-color: #0f172a !important;
      border-color: #1e293b !important;
      color: #f1f5f9 !important;
    }
    #userModal h3,
    #userModal label,
    #statusModal h3,
    #statusModal p {
      color: #e2e8f0 !important;
    }
    /* Buttons in lists */
    #app-stage .hover\:bg-emerald-50:hover {
      background-color: #064e3b !important;
      color: #ffffff !important;
    }
    #app-stage .hover\:bg-red-50:hover {
      background-color: #7f1d1d !important;
      color: #ffffff !important;
    }
  </style>
</head>
<body class="bg-slate-950 min-h-screen text-slate-100 antialiased p-3 md:p-6 transition-colors duration-300" id="apps-script-body">

  <!-- ============================================== -->
  <!-- LOGIN PORTAL STAGE -->
  <!-- ============================================== -->
  <div id="login-stage" class="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative z-10 transition-all text-white">
    <div class="text-center mb-6">
      <div class="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3">
        🌴
      </div>
      <h2 class="text-base font-bold tracking-wide uppercase text-white">Pembawa Cuti PPLH</h2>
      <p class="text-[10px] text-slate-400 mt-1">Sistem Informasi Pengajuan & Pengesahan Cuti</p>
    </div>

    <!-- Portal tabs inside login -->
    <div class="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-850/60 mb-5" id="login-portal-tabs">
      <button type="button" onclick="setLoginPortal('pegawai')" id="login-tab-pegawai" class="py-1.5 rounded-lg text-[11px] font-bold transition bg-emerald-600 text-white shadow cursor-pointer" style="cursor: pointer;">
        <span class="pointer-events-none">👤 Pegawai Pemohon</span>
      </button>
      <button type="button" onclick="setLoginPortal('verifikator')" id="login-tab-verifikator" class="py-1.5 rounded-lg text-[11px] font-bold transition text-slate-400 hover:text-slate-200 cursor-pointer" style="cursor: pointer;">
        <span class="pointer-events-none">💼 Verifikator & Admin</span>
      </button>
    </div>

    <form id="loginForm" onsubmit="handlePortalLogin(event)" class="space-y-4">
      <div id="login-error-msg" class="hidden p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px]"></div>

      <div>
        <label class="block text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-1">Username Pengguna</label>
        <input type="text" id="login-username" placeholder="Masukkan username..." class="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs transition outline-none text-slate-100 placeholder-slate-600" required>
      </div>
      <div>
        <label class="block text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-1">Kata Sandi (Password)</label>
        <input type="password" id="login-password" value="123" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs transition outline-none text-slate-100" required>
      </div>
      <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl tracking-wider transition shadow-lg mt-2">
        Masuk Ke Aplikasi
      </button>
    </form>

    <div class="mt-6 pt-4 border-t border-slate-850 text-center">
      <p class="text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-2">💡 Akses Cepat Demo</p>
      <div class="flex flex-wrap gap-1.5 justify-center" id="quick-login-buttons">
      </div>
    </div>
  </div>

  <!-- ============================================== -->
  <!-- MAIN APP STAGE -->
  <!-- ============================================== -->
  <div id="app-stage" class="hidden max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
    
    <!-- Top Brand Banner with Multi-Role Tabs -->
    <div class="bg-gradient-to-r from-emerald-800 via-emerald-750 to-teal-900 text-white p-5 md:p-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
      <div class="flex items-center space-x-3.5">
        <div class="h-10 w-10 bg-emerald-600/10 rounded-xl flex items-center justify-center border border-emerald-550/20 text-emerald-400 font-bold shrink-0 shadow-lg shadow-emerald-500/5">
          🌴
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-sm font-bold text-white tracking-wide uppercase">PPLH Leave Applet</h1>
            <span class="text-[9px] bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-900 text-emerald-300 font-bold">Apps Script</span>
          </div>
          <p class="text-xs text-emerald-100">Sistem Pengajuan & Verifikasi Cuti ASN (Pusat Pengendalian Lingkungan Hidup Suma)</p>
        </div>
      </div>

      <!-- Navigation Tabs & Profile info -->
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex bg-emerald-950/40 p-1 rounded-xl text-xs font-semibold gap-1" id="navbar-nav-tabs">
          <button onclick="switchTab('tab-admin')" id="btn-tab-admin" class="hidden px-3.5 py-1.5 rounded-lg text-emerald-250 hover:text-white transition flex items-center gap-1.5">
            ⚙️ Kelola Pengaju
          </button>
          <button onclick="switchTab('tab-form')" id="btn-tab-form" class="px-3.5 py-1.5 rounded-lg text-emerald-250 hover:text-white transition flex items-center gap-1.5">
            ✍️ Isi Formulir Cuti
          </button>
          <button onclick="switchTab('tab-approval')" id="btn-tab-approval" class="px-3.5 py-1.5 rounded-lg text-emerald-250 hover:text-white transition flex items-center gap-1.5">
            ⚖️ Meja Persetujuan
          </button>
          <button onclick="switchTab('tab-list')" id="btn-tab-list" class="px-3.5 py-1.5 rounded-lg text-emerald-250 hover:text-white transition flex items-center gap-1.5">
            📊 Data & Cetak 
            <span id="unread-badge" class="hidden h-2 w-2 rounded-full bg-yellow-400"></span>
          </button>
        </div>

        <!-- Profile Widget -->
        <div class="flex items-center gap-3 border-l border-emerald-800 pl-4">
          <div class="text-right hidden md:block leading-tight">
            <span class="text-xs font-bold text-white block" id="header-user-name">Nama Pengguna</span>
            <span class="text-[9px] text-emerald-300 uppercase tracking-wider font-bold block" id="header-user-role">Role • NIP</span>
          </div>
          <button onclick="handlePortalLogout()" class="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-900/15 text-xs rounded-xl font-bold transition flex items-center gap-1 shrink-0">
            Keluar 🚪
          </button>
        </div>
      </div>
    </div>

    <!-- Active Loading Indicator overlay -->
    <div id="loading-indicator" class="hidden bg-white/70 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center">
      <div class="text-center p-6 bg-white rounded-xl shadow-2xl border border-slate-100 flex flex-col items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mb-3"></div>
        <p class="text-xs font-semibold text-slate-700">Menghubungi Google Spreadsheet...</p>
        <p class="text-[10px] text-slate-400 mt-1">Harap tunggu beberapa detik.</p>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- TAB ADMIN: KELOLA PENGAJU USER -->
    <!-- ============================================== -->
    <div id="view-tab-admin" class="hidden p-4 md:p-8 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-3 gap-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-3 uppercase tracking-wider">Kelola Daftar Pengguna (Pegawai & Pimpinan)</h2>
          <p class="text-[10px] text-slate-500 mt-1">Tambahkan akun, ubah kata sandi, atau perbarui NIP/jabatan akun lokal pendaftar.</p>
        </div>
        <button onclick="openAddUserModal()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1">
          <span>➕</span> Pengguna Baru
        </button>
      </div>

      <!-- User List Table Grid -->
      <div class="overflow-x-auto border border-slate-200 rounded-xl">
        <table class="w-full text-xs text-left border-collapse">
          <thead class="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-400 font-bold">
            <tr>
              <th class="p-3">Nama Pegawai / NIP</th>
              <th class="p-3">Username</th>
              <th class="p-3">Role Sistem</th>
              <th class="p-3">Jabatan & Unit Kerja</th>
              <th class="p-3 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody id="admin-user-table-body" class="divide-y divide-slate-100">
            <!-- Populated via Javascript -->
          </tbody>
        </table>
      </div>

      <!-- Modal Tambah / Edit User -->
      <div id="userModal" class="hidden fixed inset-0 bg-slate-900/45 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-slate-100">
          <h3 class="text-sm font-bold text-slate-950 mb-4 uppercase" id="user-modal-title">Tambah Pengguna Baru</h3>
          
          <form id="userForm" onsubmit="handleUserFormSubmit(event)" class="space-y-3.5 text-slate-700">
            <input type="hidden" id="edit-user-id">
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Username</label>
                <input type="text" id="usr-username" placeholder="cth: humap" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" required>
              </div>
              <div>
                <label class="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Password</label>
                <input type="text" id="usr-password" placeholder="cth: 123" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" required>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Nama Lengkap</label>
                <input type="text" id="usr-nama" placeholder="cth: Andi S.M" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" required>
              </div>
              <div>
                <label class="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">NIP Pegawai</label>
                <input type="text" id="usr-nip" placeholder="cth: 1980..." class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" required>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Peran Berkas</label>
                <select id="usr-role" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" required>
                  <option value="pegawai">Pegawai Pemohon</option>
                  <option value="atasan">Atasan Langsung</option>
                  <option value="pejabat">Pejabat Berwenang</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label class="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Masa Kerja</label>
                <input type="text" id="usr-masakerja" placeholder="cth: 12 Tahun" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none">
              </div>
            </div>

            <div>
              <label class="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Jabatan & Golongan</label>
              <input type="text" id="usr-jabatan" placeholder="cth: Pedal Muda" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" required>
            </div>

            <div>
              <label class="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Unit Kerja Resmi</label>
              <input type="text" id="usr-unitkerja" value="Pusat Pengendalian Lingkungan Hidup Suma" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" required>
            </div>

            <div class="pt-3 flex justify-end space-x-2">
              <button type="button" onclick="closeUserModal()" class="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs">Batalkan</button>
              <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-600/10">Simpan Pengguna</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- TAB 1: FORMULIR PENGAJUAN (EMPLOYEE) -->
    <!-- ============================================== -->
    <div id="view-tab-form" class="p-4 md:p-8 space-y-6">
      
      <!-- Top form guidance -->
      <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs leading-relaxed flex items-start gap-2.5">
        <span class="text-base">💡</span>
        <div>
          <strong>Pengumuman Pegawai:</strong> Isi data diri Anda dengan tepat. Setelah mengirimkan, pengajuan Anda akan terekam otomatis di baris spreadsheet pimpinan. Anda dapat mencetak formulir akhir setelah atasan menyetujui.
        </div>
      </div>

      <form id="leaveForm" class="space-y-6" onsubmit="handleSubmit(event)">
        <!-- I. DATA PEGAWAI -->
        <div class="border-b border-slate-150 pb-5">
          <h2 class="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-3 mb-4 uppercase tracking-wider">I. Data Pegawai</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Lengkap & Gelar</label>
              <input required type="text" name="nama" placeholder="Contoh: Stiawati Rahayu, S.E., M.Si" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-555">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">NIP Pegawai</label>
              <input required type="text" name="nip" placeholder="Contoh: 19731123 199803 2 001" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-555">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Jabatan / Gologan</label>
              <input required type="text" name="jabatan" placeholder="Contoh: Pedal Madya" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-555">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Masa Kerja</label>
              <input required type="text" name="masaKerja" placeholder="Contoh: 26 Tahun 10 Bulan" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-555">
            </div>
            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Unit Kerja</label>
              <input required type="text" name="unitKerja" value="Pusat Pengendalian Lingkungan Hidup Suma" placeholder="Kepagawaian Suma" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-555">
            </div>
          </div>
        </div>

        <!-- II. JENIS CUTI & III. ALASAN -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-150 pb-5">
          <div>
            <h2 class="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-3 mb-4 uppercase tracking-wider">II. Jenis Cuti Yang Diambil</h2>
            <div class="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              <label class="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200/60 cursor-pointer text-xs">
                <input required type="radio" name="jenisCuti" value="Cuti Tahunan" class="h-4 w-4 text-emerald-600 border-gray-300">
                <span class="font-medium text-slate-700">Cuti Tahunan</span>
              </label>
              <label class="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200/60 cursor-pointer text-xs">
                <input type="radio" name="jenisCuti" value="Cuti Besar" class="h-4 w-4 text-emerald-600 border-gray-300">
                <span class="font-medium text-slate-700">Cuti Besar</span>
              </label>
              <label class="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200/60 cursor-pointer text-xs">
                <input type="radio" name="jenisCuti" value="Cuti Sakit" class="h-4 w-4 text-emerald-600 border-gray-300">
                <span class="font-medium text-slate-700">Cuti Sakit</span>
              </label>
              <label class="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200/60 cursor-pointer text-xs">
                <input type="radio" name="jenisCuti" value="Cuti Melahirkan" class="h-4 w-4 text-emerald-600 border-gray-300">
                <span class="font-medium text-slate-700">Cuti Melahirkan</span>
              </label>
              <label class="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200/60 cursor-pointer text-xs">
                <input type="radio" name="jenisCuti" value="Cuti Karena Alasan Penting" class="h-4 w-4 text-emerald-600 border-gray-300">
                <span class="font-medium text-slate-700">Cuti Karena Alasan Penting</span>
              </label>
              <label class="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200/60 cursor-pointer text-xs">
                <input type="radio" name="jenisCuti" value="Cuti Di Luar Tanggungan Negara" class="h-4 w-4 text-emerald-600 border-gray-300">
                <span class="font-medium text-slate-700">Cuti Di Luar Tanggungan Negara</span>
              </label>
              <label class="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200/60 cursor-pointer text-xs">
                <input type="radio" name="jenisCuti" value="Surat Izin" class="h-4 w-4 text-emerald-600 border-gray-300">
                <span class="font-medium text-slate-700">Surat Izin (Tidak Masuk Kerja / Meninggalkan Kantor)</span>
              </label>
            </div>
          </div>

          <div>
            <h2 class="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-3 mb-4 uppercase tracking-wider">III. Alasan Cuti</h2>
            <div>
              <textarea required name="alasanCuti" rows="4" placeholder="Tuliskan alasan lengkap untuk cuti, contoh: Menghadiri Acara Pernikahan Adik Kandung / Ada Acara Keluarga Utama di Makassar" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-[180px]"></textarea>
            </div>
          </div>
        </div>

        <!-- IV. LAMANYA CUTI -->
        <div class="border-b border-slate-150 pb-5">
          <h2 class="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-3 mb-4 uppercase tracking-wider">IV. Lamanya Cuti</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Durasi Cuti</label>
              <input required type="text" name="lamanyaCuti" placeholder="Contoh: 3 Hari (Kamis-Jum'at dan Senin)" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-555">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mulai Tanggal</label>
              <input required type="text" name="tanggalMulai" placeholder="Contoh: 30,31 Januari dan 3 Februari" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-555">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Sampai Dengan (s/d)</label>
              <input required type="text" name="tanggalSelesai" placeholder="Contoh: 30,31 Januari - 3 Februari 2025" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-555">
            </div>
          </div>
        </div>

        <!-- V. KONTAK SELAMA CUTI -->
        <div class="pb-3">
          <h2 class="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-3 mb-4 uppercase tracking-wider">VI. Alamat & Kontak Selama Cuti</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Alamat Menjalankan Cuti</label>
              <input required type="text" name="alamatSelamaCuti" placeholder="Contoh: Jakarta" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-555">
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">No. Telpon / WhatsApp Aktif</label>
              <input required type="text" name="telepon" placeholder="Contoh: 082153151117" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-555">
            </div>
          </div>
        </div>

        <!-- Action -->
        <div class="pt-4 flex items-center justify-end space-x-4 border-t border-slate-100">
          <button type="reset" class="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50">Reset Form</button>
          <button type="submit" id="submitBtn" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg text-xs transition shadow-lg shadow-emerald-600/10">
            Kirim Pengajuan Cuti
          </button>
        </div>
      </form>
    </div>

    <!-- ============================================== -->
    <!-- TAB 2: MEJA PERSETUJUAN (OFFICIALS) -->
    <!-- ============================================== -->
    <div id="view-tab-approval" class="hidden p-4 md:p-8 space-y-6">
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Sub-panel: List of pending / all requests -->
        <div class="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-600">📂 Berkas Masuk</h3>
            <button onclick="refreshRequests()" class="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1 rounded">
              🔄 Segarkan
            </button>
          </div>
          <div id="approval-list-container" class="space-y-2 max-h-[460px] overflow-y-auto">
            <p class="text-xs italic text-slate-400 text-center py-8">Klik segarkan atau tunggu memuat berkas...</p>
          </div>
        </div>

        <!-- Right Sub-panel: Multi-Role signing Desk -->
        <div class="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-5">
          <div id="empty-desk-view" class="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400">
            <span class="text-3xl mb-1">⚖️</span>
            <p class="text-xs font-semibold">Meja Tanda Tangan Atasan / Pejabat</p>
            <p class="text-[10px] text-slate-400 mt-1">Silakan pilih salah satu berkas di samping untuk mengambil keputusan.</p>
          </div>

          <div id="active-desk-view" class="hidden space-y-5">
            <!-- Selected document status banner -->
            <div class="bg-emerald-950 text-emerald-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p class="text-[10px] uppercase font-bold text-emerald-450">Bahan Pertimbangan Berkas</p>
                <h4 id="desk-employee-name" class="text-sm font-bold text-white mt-1">Stiawati Rahayu</h4>
                <p id="desk-leave-details" class="text-[10px] text-emerald-300">Cuti Tahunan | 3 Hari</p>
              </div>
              <span id="desk-id-badge" class="text-[9px] font-mono bg-emerald-900 border border-emerald-800 px-2 py-0.5 rounded text-emerald-300">ID: -</span>
            </div>

            <!-- Detailed Request review block for supervisor -->
            <div id="desk-details-card" class="bg-white border border-slate-200 p-4 rounded-xl text-xs space-y-3 shadow-sm">
              <h5 class="font-bold text-emerald-700 border-b border-slate-100 pb-2 uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-1">
                📝 Ringkasan Berkas Permohonan Cuti
              </h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 text-[11px] leading-relaxed">
                <div class="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p><span class="text-slate-400 block text-[9px] uppercase font-medium">Pegawai Pemohon</span> <strong id="val-nama-peg" class="text-slate-800 text-[12px]"></strong></p>
                  <p><span class="text-slate-400 block text-[9px] uppercase font-medium">NIP Pegawai</span> <span id="val-nip-peg" class="font-mono text-slate-700 font-semibold"></span></p>
                  <p><span class="text-slate-400 block text-[9px] uppercase font-medium">Jabatan & Unit Kerja</span> <span id="val-jab-peg" class="text-slate-700"></span></p>
                  <p><span class="text-slate-400 block text-[9px] uppercase font-medium">Masa Kerja</span> <span id="val-masa-peg" class="text-slate-700"></span></p>
                </div>
                <div class="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p><span class="text-slate-400 block text-[9px] uppercase font-medium">Jenis Cuti Yang Dipilih</span> <strong id="val-jenis-cuti" class="text-emerald-700 font-bold text-[12px]"></strong></p>
                  <p><span class="text-slate-400 block text-[9px] uppercase font-medium">Alasan Mengambil Cuti</span> <span id="val-alasan-cuti" class="italic text-slate-700 font-medium"></span></p>
                  <p><span class="text-slate-400 block text-[9px] uppercase font-medium">Lamanya Cuti</span> <span id="val-lama-cuti" class="font-bold text-slate-800"></span></p>
                  <p><span class="text-slate-400 block text-[9px] uppercase font-medium">Periode Tanggal</span> <span id="val-periode-cuti" class="text-slate-700"></span></p>
                </div>
              </div>
            </div>

            <!-- Role tabs inside approval screen -->
            <div class="flex space-x-1 p-1 bg-slate-200/60 rounded-lg max-w-xs text-[11px] font-semibold">
              <button onclick="setApprovalRole('atasan')" id="role-btn-atasan" class="flex-1 py-1.5 text-center rounded bg-white text-slate-800 shadow">
                1. Atasan Langsung
              </button>
              <button onclick="setApprovalRole('pejabat')" id="role-btn-pejabat" class="flex-1 py-1.5 text-center rounded text-slate-650">
                2. Pejabat Berwenang
              </button>
            </div>

            <!-- Review form fields -->
            <form id="approvalForm" onsubmit="handleApprovalSubmit(event)" class="space-y-4">
              
              <!-- Role Mismatch Alert Message -->
              <div id="approval-role-warning" class="hidden p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-3">
                <span class="text-base shrink-0">🔒</span>
                <div>
                  <strong class="font-bold">Gembok Pengesahan Aktif:</strong>
                  <span id="approval-role-warning-text">Anda tidak memiliki wewenang untuk menandatangani lembaran verifikasi ini.</span>
                </div>
              </div>

              <!-- Select Status -->
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Keputusan Status</label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <label class="flex items-center justify-center p-2.5 rounded-lg border cursor-pointer border-slate-200 hover:border-slate-400 transition text-center font-semibold bg-white" id="label-stat-DISETUJUI">
                    <input required type="radio" name="deskStatus" value="DISETUJUI" class="sr-only" onclick="highlightStatusOption('DISETUJUI')">
                    <span>DISETUJUI</span>
                  </label>
                  <label class="flex items-center justify-center p-2.5 rounded-lg border cursor-pointer border-slate-200 hover:border-slate-400 transition text-center font-semibold bg-white" id="label-stat-PERUBAHAN">
                    <input type="radio" name="deskStatus" value="PERUBAHAN" class="sr-only" onclick="highlightStatusOption('PERUBAHAN')">
                    <span>PERUBAHAN</span>
                  </label>
                  <label class="flex items-center justify-center p-2.5 rounded-lg border cursor-pointer border-slate-200 hover:border-slate-400 transition text-center font-semibold bg-white" id="label-stat-DITANGGUHKAN">
                    <input type="radio" name="deskStatus" value="DITANGGUHKAN" class="sr-only" onclick="highlightStatusOption('DITANGGUHKAN')">
                    <span>DITANGGUHKAN</span>
                  </label>
                  <label class="flex items-center justify-center p-2.5 rounded-lg border cursor-pointer border-slate-200 hover:border-slate-400 transition text-center font-semibold bg-white" id="label-stat-TIDAK DISETUJUI">
                    <input type="radio" name="deskStatus" value="TIDAK DISETUJUI" class="sr-only" onclick="highlightStatusOption('TIDAK DISETUJUI')">
                    <span>TIDAK DISETUJUI</span>
                  </label>
                </div>
              </div>

              <!-- Atasan / Pejabat Names -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label id="label-reviewer-name" class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Pejabat Yang Berwenang</label>
                  <input required type="text" id="reviewer-name-field" placeholder="Nama Lengkap Pejabat" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none">
                </div>
                <div>
                  <label id="label-reviewer-nip" class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">NIP Pejabat</label>
                  <input required type="text" id="reviewer-nip-field" placeholder="Nomor Induk Pegawaian" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none">
                </div>
              </div>

              <!-- Custom Jabatan (For Pejabat view e.g. "Kepala Pusat") -->
              <div id="desk-jabatan-container" class="hidden">
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Jabatan Pembuat Keputusan</label>
                <input type="text" id="reviewer-jabatan-field" value="Kepala Pusat" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none">
              </div>

              <!-- Digital Stamp Preview -->
              <div class="p-3.5 bg-slate-100 rounded-xl border border-dashed border-slate-350 flex flex-col items-center justify-center text-center">
                <span class="text-[9px] font-semibold text-slate-405 uppercase tracking-wide">Validasi Berkas & Tanda Kasih Digital</span>
                <span id="digital-signature-text" class="text-xs font-mono font-medium text-emerald-700 italic border-b border-dashed border-slate-300 px-3 pb-0.5 mt-2 h-[22px]">-</span>
                <span id="digital-signature-hash" class="text-[8px] font-mono text-slate-400 mt-1 uppercase">SIG_HASH_...</span>
              </div>

              <!-- Submit -->
              <button type="submit" id="btn-confirm-approval" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg tracking-wider uppercase transition text-center">
                Sahkan & Simpan Keputusan
              </button>

            </form>
          </div>

        </div>

      </div>

    </div>

    <!-- ============================================== -->
    <!-- TAB 3: DAFTAR DATA & PRINT (A4 PREVIEW) -->
    <!-- ============================================== -->
    <div id="view-tab-list" class="hidden p-4 md:p-8 space-y-6">
      
      <div id="list-empty-view" class="text-center py-20 text-slate-400">
        <p class="text-xs font-semibold">Sistem tidak mendeteksi log pengajuan</p>
        <p class="text-[10px] text-slate-500 mt-2">Mulai dengan mengisi formulir cuti atau tekan segarkan daftar.</p>
        <button onclick="refreshRequests()" class="mt-4 bg-emerald-600 text-white text-xs px-4 py-2 rounded-lg font-medium">Segarkan Daftar Pengajuan</button>
      </div>

      <div id="list-active-view" class="hidden space-y-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 class="text-sm font-semibold">Arsip Pengajuan Cuti</h3>
            <p class="text-[10px] text-slate-500">Pilih salah satu baris untuk mencetak formulir akhir sesuai format dokumen.</p>
          </div>
          <button onclick="refreshRequests()" class="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
            🔄 Segarkan Semua Data
          </button>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-xs text-left border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-400 font-bold">
              <tr>
                <th class="p-3">Nama Pegawai / NIP</th>
                <th class="p-3">Jenis Cuti</th>
                <th class="p-3">Lamanya</th>
                <th class="p-3">Pers. Atasan</th>
                <th class="p-3">Kep. Pejabat</th>
                <th class="p-3 text-center">Aksi Cetak</th>
              </tr>
            </thead>
            <tbody id="list-table-body" class="divide-y divide-slate-100">
              <!-- Dynamically populated rows -->
            </tbody>
          </table>
        </div>

        <!-- Floating print preview layout in GAS Web App -->
        <div id="gas-print-container" class="hidden p-4 md:p-6 bg-slate-900 text-white rounded-2xl border border-slate-700">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h4 class="text-xs font-bold text-emerald-400 uppercase">Interactive Print Frame</h4>
              <p class="text-[10px] text-slate-400">Siap print langsung ke PDF komputer Anda.</p>
            </div>
            <button onclick="printGasDoc()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold transition">
              🖨️ Cetak Berkas Cuti
            </button>
          </div>
          
          <!-- Simulating the beautiful A4 page inside the web-app -->
          <div id="print-sheet-payload" class="bg-white text-black p-8 font-serif leading-tight text-[11px] mx-auto max-w-[210mm] overflow-x-auto shadow-2xl">
            <!-- Payload dynamically loaded via Javascript -->
          </div>
        </div>
      </div>

    </div>

    <!-- Status Mask for leaves -->
    <div id="statusModal" class="hidden fixed inset-0 bg-slate-900/45 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900">Pengajuan Cuti Terkirim!</h3>
        <p class="text-xs text-slate-500 mt-2">Permintaan cuti Anda telah disimpan secara real-time ke Google Sheet utama dan siap ditindak oleh pimpinan.</p>
        <button onclick="closeModal()" class="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-semibold transition">Saya Mengerti</button>
      </div>
    </div>

  </div>

  <!-- Global Javascript handlers for Apps Script client side UI -->
  <script>
    // 1. Initial User Accounts Database (Synchronized with primary Web App)
    const DEFAULT_USERS = [
      { id: "usr_admin", username: "admin", password: "123", name: "Administrator", nip: "19700101 200003 1 001", role: "admin", jabatan: "Pranata Komputer Madya", unit: "Pusat Teknologi Pengendalian Lingkungan", masakerja: "15 Tahun" },
      { id: "usr_stia", username: "stiawati", password: "123", name: "Stiawati Rahayu, S.E., M.Si", nip: "19731123 199803 2 001", role: "pegawai", jabatan: "Pedal Madya", unit: "Pusat Pengendalian Lingkungan Hidup Suma", masakerja: "26 Tahun 10 Bulan" },
      { id: "usr_arni", username: "arnianah", password: "123", name: "Arnianah Alwi. S.Si., M.Si", nip: "19681227 199803 2 001", role: "atasan", jabatan: "Kepala Bidang Verifikasi", unit: "Pusat Pengendalian Lingkungan Hidup Suma", masakerja: "25 Tahun" },
      { id: "usr_azri", username: "azri", password: "123", name: "Dr. Azri Rasul, S.K.M., M.Si., M.H", nip: "19710516 199803 1 001", role: "pejabat", jabatan: "Kepala Pusat", unit: "Pusat Pengendalian Lingkungan Hidup Suma", masakerja: "28 Tahun" }
    ];

    let globalRequests = [];
    let selectedRequestId = null;
    let activeApprovalRole = "atasan"; // "atasan" or "pejabat"
    let currentActivePortal = "pegawai"; // "pegawai" or "verifikator"
    let activeUser = null;

    // Default signers references
    let defAtasanName = "Arnianah Alwi. S.Si., M.Si";
    let defAtasanNip = "19681227 199803 2 001";
    let defPejabatName = "Dr. Azri Rasul, S.K.M., M.Si., M.H";
    let defPejabatNip = "19710516 199803 1 001";

    // Auto load on init
    window.onload = function() {
      // Setup local accounts database
      if (!localStorage.getItem("pplh_user_accounts")) {
        localStorage.setItem("pplh_user_accounts", JSON.stringify(DEFAULT_USERS));
      }
      
      renderQuickLoginButtons();
      
      // Ambil database pengguna terpusat dari Google Sheet jika berjalan di Apps Script
      if (typeof google !== "undefined" && google.script && google.script.run) {
        try {
          google.script.run
            .withSuccessHandler(function(serverUsers) {
              if (serverUsers && serverUsers.length > 0) {
                localStorage.setItem("pplh_user_accounts", JSON.stringify(serverUsers));
                
                // Perbarui referensi penandatangan default
                const atasan = serverUsers.find(function(u) { return u.role === "atasan"; });
                if (atasan) {
                  defAtasanName = atasan.name;
                  defAtasanNip = atasan.nip;
                }
                const pejabat = serverUsers.find(function(u) { return u.role === "pejabat"; });
                if (pejabat) {
                  defPejabatName = pejabat.name;
                  defPejabatNip = pejabat.nip;
                }
                
                renderQuickLoginButtons();
                
                // Perbarui sesi aktif jika data pengguna berubah di server
                const session = sessionStorage.getItem("pplh_currentUser");
                if (session) {
                  const cur = JSON.parse(session);
                  const match = serverUsers.find(function(u) { return u.id === cur.id || u.username === cur.username; });
                  if (match) {
                    sessionStorage.setItem("pplh_currentUser", JSON.stringify(match));
                    if (activeUser) {
                      activeUser = match;
                      document.getElementById("header-user-name").innerText = match.name;
                      renderAdminUserTable();
                    }
                  }
                }
              }
            })
            .withFailureHandler(function(err) {
              console.warn("Spreadsheet accounts fetch offline (using standard backup profiles):", err);
              renderQuickLoginButtons();
            })
            .getUserAccounts();
        } catch (e) {
          console.error("Google script handler error on init:", e);
          renderQuickLoginButtons();
        }
      }
      
      checkSession();
    };

    function checkSession() {
      const session = sessionStorage.getItem("pplh_currentUser");
      if (session) {
        handleLoginSuccess(JSON.parse(session));
      } else {
        // Form login stage view
        document.getElementById("login-stage").classList.remove("hidden");
        document.getElementById("app-stage").classList.add("hidden");
        document.getElementById("apps-script-body").className = "bg-slate-950 min-h-screen text-slate-100 antialiased p-3 md:p-6";
        setLoginPortal("pegawai");
      }
    }

    // Tab switcher inside login page
    function setLoginPortal(portalType) {
      currentActivePortal = portalType;
      const tabPeg = document.getElementById("login-tab-pegawai");
      const tabVer = document.getElementById("login-tab-verifikator");
      
      if (portalType === "pegawai") {
        if (tabPeg) tabPeg.className = "py-1.5 rounded-lg text-[11px] font-bold transition bg-emerald-600 text-white shadow cursor-pointer";
        if (tabVer) tabVer.className = "py-1.5 rounded-lg text-[11px] font-bold transition text-slate-400 hover:text-slate-200 cursor-pointer";
        const userEl = document.getElementById("login-username");
        if (userEl) userEl.value = "stiawati";
      } else {
        if (tabVer) tabVer.className = "py-1.5 rounded-lg text-[11px] font-bold transition bg-emerald-600 text-white shadow cursor-pointer";
        if (tabPeg) tabPeg.className = "py-1.5 rounded-lg text-[11px] font-bold transition text-slate-400 hover:text-slate-200 cursor-pointer";
        const userEl = document.getElementById("login-username");
        if (userEl) userEl.value = "arnianah";
      }
      const passEl = document.getElementById("login-password");
      if (passEl) passEl.value = "123";
      const errEl = document.getElementById("login-error-msg");
      if (errEl) errEl.classList.add("hidden");
    }

    // Quick Login buttons
    function renderQuickLoginButtons() {
      const container = document.getElementById("quick-login-buttons");
      const users = JSON.parse(localStorage.getItem("pplh_user_accounts")) || DEFAULT_USERS;
      container.innerHTML = "";
      
      users.forEach(u => {
        let badgeColor = "bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300";
        if (u.role === "admin") badgeColor = "bg-red-950 hover:bg-red-900 border-red-900 text-red-300 text-[8.5px]";
        if (u.role === "atasan" || u.role === "pejabat") badgeColor = "bg-purple-950 hover:bg-purple-900 border-purple-900 text-purple-300";
        if (u.role === "pegawai") badgeColor = "bg-emerald-950 hover:bg-emerald-900 border-emerald-900 text-emerald-300";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.onclick = function() {
          document.getElementById("login-username").value = u.username;
          document.getElementById("login-password").value = u.password;
          // Auto choose portal type
          if (u.role === "pegawai") {
            setLoginPortal("pegawai");
          } else {
            setLoginPortal("verifikator");
          }
          
          const loginForm = document.getElementById("loginForm");
          if (loginForm && typeof loginForm.requestSubmit === "function") {
            try {
              loginForm.requestSubmit();
            } catch (err) {
              handlePortalLogin({ preventDefault: function() {} });
            }
          } else {
            handlePortalLogin({ preventDefault: function() {} });
          }
        };
        btn.className = "px-2 py-1 text-[8px] font-mono font-bold rounded-lg border transition uppercase " + badgeColor;
        btn.innerText = u.username;
        container.appendChild(btn);
      });
    }

    // Authenticate
    function handlePortalLogin(e) {
      e.preventDefault();
      const userField = document.getElementById("login-username").value.trim().toLowerCase();
      const passField = document.getElementById("login-password").value;
      const errorDiv = document.getElementById("login-error-msg");
      
      const users = JSON.parse(localStorage.getItem("pplh_user_accounts")) || DEFAULT_USERS;
      const verified = users.find(u => u.username.toLowerCase() === userField && u.password === passField);
      
      if (!verified) {
        errorDiv.innerText = "🚨 Username atau Password tidak sesuai. Silakan gunakan tombol Akses Cepat di bawah!";
        errorDiv.classList.remove("hidden");
        return;
      }

      // Check access permission to portals
      if (currentActivePortal === "pegawai" && verified.role !== "pegawai" && verified.role !== "admin") {
        errorDiv.innerText = "🚨 Akun pimpinan/admin harap login melalui portal Verifikator & Admin.";
        errorDiv.classList.remove("hidden");
        return;
      }
      if (currentActivePortal === "verifikator" && verified.role === "pegawai") {
        errorDiv.innerText = "🚨 Pegawai biasa dilarang masuk ke portal verifikasi dokumen ini.";
        errorDiv.classList.remove("hidden");
        return;
      }

      sessionStorage.setItem("pplh_currentUser", JSON.stringify(verified));
      handleLoginSuccess(verified);
    }

    // Success login handler
    function handleLoginSuccess(user) {
      if (!user) return;
      try {
        activeUser = user;
        
        // Toggle stages
        const loginStage = document.getElementById("login-stage");
        const appStage = document.getElementById("app-stage");
        const appBody = document.getElementById("apps-script-body");
        
        if (loginStage) loginStage.classList.add("hidden");
        if (appStage) appStage.classList.remove("hidden");
        if (appBody) appBody.className = "bg-slate-950 min-h-screen text-slate-100 antialiased p-3 md:p-6";
        
        // Render user active info onto header and profile widgets
        const headerName = document.getElementById("header-user-name");
        if (headerName) headerName.innerText = user.name || "Administrator";
        
        let roleTitle = "Pengaju Biro";
        let roleColor = "text-emerald-300";
        if (user.role === "admin") { roleTitle = "Administrator"; roleColor = "text-red-400"; }
        if (user.role === "atasan") { roleTitle = "Atasan Langsung"; roleColor = "text-amber-300"; }
        if (user.role === "pejabat") { roleTitle = "Pejabat Berwenang"; roleColor = "text-indigo-300"; }
        
        const headerRole = document.getElementById("header-user-role");
        if (headerRole) {
          headerRole.innerHTML = '<span class="' + roleColor + ' font-bold">' + roleTitle + '</span> • NIP. ' + (user.nip || "-");
        }

        // Navigation role authorization logic
        const btnAdmin = document.getElementById("btn-tab-admin");
        const btnForm = document.getElementById("btn-tab-form");
        const btnApproval = document.getElementById("btn-tab-approval");
        const btnList = document.getElementById("btn-tab-list");

        // Hide all initially
        if (btnAdmin) btnAdmin.classList.add("hidden");
        if (btnForm) btnForm.classList.add("hidden");
        if (btnApproval) btnApproval.classList.add("hidden");
        if (btnList) btnList.classList.add("hidden");

        if (user.role === "admin") {
          if (btnAdmin) btnAdmin.classList.remove("hidden");
          if (btnForm) btnForm.classList.remove("hidden");
          if (btnApproval) btnApproval.classList.remove("hidden");
          if (btnList) btnList.classList.remove("hidden");
          switchTab("tab-admin");
        } else if (user.role === "pegawai") {
          if (btnForm) btnForm.classList.remove("hidden");
          switchTab("tab-form");
          
          // Auto Fill Employee Form Data from Account Information
          const form = document.getElementById("leaveForm");
          if (form) {
            if (form.nama) form.nama.value = user.name || "";
            if (form.nip) form.nip.value = user.nip || "";
            if (form.jabatan) form.jabatan.value = user.jabatan || "";
            if (form.masaKerja) form.masaKerja.value = user.masakerja || "";
            if (form.unitKerja) form.unitKerja.value = user.unit || "Pusat Pengendalian Lingkungan Hidup Suma";
          }
        } else {
          // Atasan & Pejabat
          if (btnApproval) btnApproval.classList.remove("hidden");
          if (btnList) btnList.classList.remove("hidden");
          switchTab("tab-approval");
        }

        refreshRequests();
        renderAdminUserTable();
      } catch (err) {
        alert("⚠️ Login Error: " + err.message + "\nStack: " + err.stack);
      }
    }

    function handlePortalLogout() {
      sessionStorage.removeItem("pplh_currentUser");
      window.location.reload();
    }

    function switchTab(tabId) {
      try {
        // Hide all panels
        const fView = document.getElementById('view-tab-form');
        const aView = document.getElementById('view-tab-approval');
        const lView = document.getElementById('view-tab-list');
        const adView = document.getElementById('view-tab-admin');
        
        if (fView) fView.classList.add('hidden');
        if (aView) aView.classList.add('hidden');
        if (lView) lView.classList.add('hidden');
        if (adView) adView.classList.add('hidden');
        
        // Deactivate tab buttons
        ['btn-tab-form', 'btn-tab-approval', 'btn-tab-list', 'btn-tab-admin'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.className = "px-3.5 py-1.5 rounded-lg text-emerald-250 hover:text-white transition flex items-center gap-1.5";
        });

        // Show targeted panel
        const targetPanel = document.getElementById('view-' + tabId);
        if (targetPanel) targetPanel.classList.remove('hidden');
        
        const targetBtn = document.getElementById('btn-' + tabId);
        if (targetBtn) targetBtn.className = "px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white shadow-sm transition flex items-center gap-1.5";

        if (tabId === 'tab-approval' || tabId === 'tab-list') {
          refreshRequests();
        }
      } catch (err) {
        console.error("switchTab error:", err);
      }
    }

    function refreshRequests() {
      try {
        const loading = document.getElementById('loading-indicator');
        if (loading) loading.classList.remove('hidden');
        
        // Running Google Apps Script runner APIs
        if (typeof google !== "undefined" && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(function(data) {
              const loading2 = document.getElementById('loading-indicator');
              if (loading2) loading2.classList.add('hidden');
              globalRequests = data || [];
              
              // Re-render Views
              renderApprovalList();
              renderDataListTable();
              
              // Compute pending notifications
              let pendings = (data || []).filter(r => r.status === "DIAJUKAN" || r.status === "PENDING" || !r.status);
              const unreadBadge = document.getElementById('unread-badge');
              if (unreadBadge) {
                if (pendings.length > 0) {
                  unreadBadge.classList.remove('hidden');
                } else {
                  unreadBadge.classList.add('hidden');
                }
              }
            })
            .withFailureHandler(function(err) {
              const loading2 = document.getElementById('loading-indicator');
              if (loading2) loading2.classList.add('hidden');
              console.warn("Google Apps Script getLeaveRequests failed:", err);
            })
            .getLeaveRequests();
        } else {
          const loading2 = document.getElementById('loading-indicator');
          if (loading2) loading2.classList.add('hidden');
        }
      } catch (err) {
        console.error("refreshRequests error:", err);
      }
    }

    // FORM SUBMISSION (NEW LEAVE)
    function handleSubmit(e) {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.innerText = "Mengirim...";
      
      document.getElementById('loading-indicator').classList.remove('hidden');
      
      const form = document.getElementById('leaveForm');
      const formData = {
        nomorSurat: "Sc. /PPLH.MS/TU/SET.3.1/B/01/2025",
        tanggalForm: "Makassar, " + new Date().toLocaleDateString("id-ID", {day: "numeric", month: "long", year: "numeric"}),
        nama: form.nama.value,
        nip: form.nip.value,
        jabatan: form.jabatan.value,
        masaKerja: form.masaKerja.value,
        unitKerja: form.unitKerja.value,
        jenisCuti: form.querySelector('input[name="jenisCuti"]:checked').value,
        alasanCuti: form.alasanCuti.value,
        lamanyaCuti: form.lamanyaCuti.value,
        tanggalMulai: form.tanggalMulai.value,
        tanggalSelesai: form.tanggalSelesai.value,
        alamatSelamaCuti: form.alamatSelamaCuti.value,
        telepon: form.telepon.value
      };

      // Call Google Apps Script backend append row
      google.script.run
        .withSuccessHandler(function(resp) {
          btn.disabled = false;
          btn.innerText = "Kirim Pengajuan Cuti";
          document.getElementById('loading-indicator').classList.add('hidden');
          if (resp.success) {
            document.getElementById('statusModal').classList.remove('hidden');
            form.reset();
          } else {
            alert("Error: " + resp.error);
          }
        })
        .withFailureHandler(function(err) {
          btn.disabled = false;
          btn.innerText = "Kirim Pengajuan Cuti";
          document.getElementById('loading-indicator').classList.add('hidden');
          alert("Gagal menghubungi server: " + err);
        })
        .submitLeaveRequest(formData);
    }

    // RENDER APPROVAL SYSTEM (TAB 2)
    function renderApprovalList() {
      const container = document.getElementById('approval-list-container');
      if (!globalRequests || globalRequests.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">KOSONG: Belum ada pengisian.</p>';
        return;
      }
      
      container.innerHTML = "";
      globalRequests.forEach(req => {
        const isSelected = selectedRequestId === req.id;
        const stateColor = req.status === "SELESAI" ? "bg-emerald-100 text-emerald-800" :
                           req.status === "DISETUJUI_ATASAN" ? "bg-blue-100 text-blue-800" : "bg-amber-150 text-amber-800";
        
        const cardHTML = \`
          <button onclick="selectRequestToDesk('\${req.id}')" class="w-full text-left p-3 rounded-lg border text-xs transition flex flex-col gap-1.5 \${
            isSelected ? "border-emerald-500 bg-emerald-50/70" : "border-slate-200 bg-white hover:bg-slate-50"
          }">
            <div class="flex items-center justify-between w-full">
              <span class="font-bold text-slate-800 truncate max-w-[140px]">\${req.nama}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded font-bold \${stateColor}">\${req.status || "PENDING"}</span>
            </div>
            <p class="text-[10px] text-slate-500 truncate font-mono">\${req.jenisCuti} (\${req.lamanyaCuti})</p>
          </button>
        \`;
        container.innerHTML += cardHTML;
      });
    }

    // SELECT A REQUEST UNTO DESK
    function selectRequestToDesk(id) {
      selectedRequestId = id;
      renderApprovalList();
      
      const req = globalRequests.find(r => r.id === id);
      if (!req) return;
      
      document.getElementById('empty-desk-view').classList.add('hidden');
      document.getElementById('active-desk-view').classList.remove('hidden');
      
      document.getElementById('desk-employee-name').innerText = req.nama;
      document.getElementById('desk-leave-details').innerText = \`\${req.jenisCuti} | \${req.lamanyaCuti} | \${req.alasanCuti}\`;
      document.getElementById('desk-id-badge').innerText = "ID: " + req.id;
      
      // Populate review card layout
      document.getElementById('val-nama-peg').innerText = req.nama || '-';
      document.getElementById('val-nip-peg').innerText = req.nip || '-';
      document.getElementById('val-jab-peg').innerText = (req.jabatan || '-') + " | Unit: " + (req.unitKerja || '-');
      document.getElementById('val-masa-peg').innerText = req.masaKerja || '-';
      
      document.getElementById('val-jenis-cuti').innerText = req.jenisCuti || '-';
      document.getElementById('val-alasan-cuti').innerText = '"' + (req.alasanCuti || '-') + '"';
      document.getElementById('val-lama-cuti').innerText = req.lamanyaCuti || '-';
      document.getElementById('val-periode-cuti').innerText = (req.tanggalMulai || '-') + " s/d " + (req.tanggalSelesai || '-');
      
      // Auto hydrate current review roles details onto inputs
      setApprovalRole(activeApprovalRole);
    }

    // TOGGLE ROLE (ATASAN vs PEJABAT)
    function setApprovalRole(role) {
      activeApprovalRole = role;
      
      const atasanBtn = document.getElementById('role-btn-atasan');
      const pejabatBtn = document.getElementById('role-btn-pejabat');
      const jabContainer = document.getElementById('desk-jabatan-container');
      const warningDiv = document.getElementById('approval-role-warning');
      const warningTxt = document.getElementById('approval-role-warning-text');
      const nameField = document.getElementById('reviewer-name-field');
      const nipField = document.getElementById('reviewer-nip-field');
      const submitBtn = document.getElementById('btn-confirm-approval');
      
      let isAllowed = false;
      
      if (activeUser) {
        if (activeUser.role === 'admin') {
          isAllowed = true;
        } else if (role === 'atasan' && activeUser.role === 'atasan') {
          isAllowed = true;
        } else if (role === 'pejabat' && activeUser.role === 'pejabat') {
          isAllowed = true;
        }
      }
      
      if (role === 'atasan') {
        atasanBtn.className = "flex-1 py-1.5 text-center rounded bg-white text-slate-800 shadow";
        pejabatBtn.className = "flex-1 py-1.5 text-center rounded text-slate-650";
        jabContainer.classList.add('hidden');
        
        // Dynamically change labels for clarity of Atasan langsung vs Pejabat
        document.getElementById('label-reviewer-name').innerText = "Nama Atasan Langsung";
        nameField.placeholder = "Nama Lengkap Atasan Langsung";
        document.getElementById('label-reviewer-nip').innerText = "NIP Atasan Langsung";
        nipField.placeholder = "Nomor Induk Pegawai Atasan";
        
        // Hydrate
        if (activeUser && activeUser.role === 'atasan') {
          nameField.value = activeUser.name;
          nipField.value = activeUser.nip;
        } else {
          nameField.value = defAtasanName;
          nipField.value = defAtasanNip;
        }
      } else {
        pejabatBtn.className = "flex-1 py-1.5 text-center rounded bg-white text-slate-800 shadow";
        atasanBtn.className = "flex-1 py-1.5 text-center rounded text-slate-650";
        jabContainer.classList.remove('hidden');
        
        // Dynamically change labels for clarity of Atasan langsung vs Pejabat
        document.getElementById('label-reviewer-name').innerText = "Nama Pejabat Yang Berwenang";
        nameField.placeholder = "Nama Lengkap Pejabat";
        document.getElementById('label-reviewer-nip').innerText = "NIP Pejabat Yang Berwenang";
        nipField.placeholder = "Nomor Induk Pegawai Pejabat";
        
        // Hydrate
        if (activeUser && activeUser.role === 'pejabat') {
          nameField.value = activeUser.name;
          nipField.value = activeUser.nip;
        } else {
          nameField.value = defPejabatName;
          nipField.value = defPejabatNip;
        }
      }
      
      // Live validation safety shield and lockouts
      if (isAllowed) {
        warningDiv.classList.add('hidden');
        nameField.removeAttribute('readonly');
        nipField.removeAttribute('readonly');
        submitBtn.disabled = false;
        submitBtn.className = "w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg tracking-wider uppercase transition text-center shadow-lg";
      } else {
        warningDiv.classList.remove('hidden');
        let userRoleText = "Pegawai Biasa";
        if (activeUser && activeUser.role === 'atasan') userRoleText = "Atasan Langsung";
        if (activeUser && activeUser.role === 'pejabat') userRoleText = "Pejabat Berwenang";
        if (activeUser && activeUser.role === 'admin') userRoleText = "Administrator";
        
        warningTxt.innerHTML = "Anda masuk sebagai <strong class='font-bold underline'>" + userRoleText + "</strong> (" + (activeUser ? activeUser.name : 'Pegawai') + "). Tanda tangan bagian ini hanya boleh disahkan oleh <strong class='font-bold underline'>" + (role === 'atasan' ? 'Atasan Langsung' : 'Pejabat Berwenang') + "</strong>.";
        
        nameField.setAttribute('readonly', 'true');
        nipField.setAttribute('readonly', 'true');
        submitBtn.disabled = true;
        submitBtn.className = "w-full py-2.5 bg-slate-350 text-slate-500 font-bold text-xs rounded-lg tracking-wider uppercase transition text-center cursor-not-allowed opacity-50";
      }
      
      updateStampPreviews();
    }

    function updateStampPreviews() {
      const name = document.getElementById('reviewer-name-field').value || "-";
      const nip = document.getElementById('reviewer-nip-field').value || "000";
      
      document.getElementById('digital-signature-text').innerText = name;
      document.getElementById('digital-signature-hash').innerText = "SIG_STAMP_" + nip.replace(/\\s+/g, '');
    }

    // Input listeners to update stamp
    document.getElementById('reviewer-name-field').oninput = updateStampPreviews;
    document.getElementById('reviewer-nip-field').oninput = updateStampPreviews;

    function highlightStatusOption(status) {
      // Clean all label options styling
      ['DISETUJUI', 'PERUBAHAN', 'DITANGGUHKAN', 'TIDAK DISETUJUI'].forEach(val => {
        const el = document.getElementById('label-stat-' + val);
        if (el) el.className = "flex items-center justify-center p-2.5 rounded-lg border cursor-pointer border-slate-200 hover:border-slate-400 transition text-center font-semibold bg-white";
      });
      
      // Add highlighted color onto selected
      let customColorClass = "";
      if (status === "DISETUJUI") customColorClass = "border-emerald-500 text-emerald-700 bg-emerald-50 ring-2 ring-emerald-500/20";
      if (status === "PERUBAHAN") customColorClass = "border-amber-500 text-amber-700 bg-amber-50 ring-2 ring-amber-500/20";
      if (status === "DITANGGUHKAN") customColorClass = "border-blue-500 text-blue-700 bg-blue-50 ring-2 ring-blue-500/20";
      if (status === "TIDAK DISETUJUI") customColorClass = "border-red-500 text-red-700 bg-red-50 ring-2 ring-red-500/20";
      
      document.getElementById('label-stat-' + status).className = "flex items-center justify-center p-2.5 rounded-lg border cursor-pointer text-center font-bold bg-white " + customColorClass;
    }

    // PERSUBMIT APPROVAL DECISION
    function handleApprovalSubmit(e) {
      e.preventDefault();
      if (!selectedRequestId) return;
      
      const radChecked = document.querySelector('input[name="deskStatus"]:checked');
      if (!radChecked) {
        alert("Pilih Keputusan Status terlebih dahulu!");
        return;
      }
      
      const status = radChecked.value;
      const nama = document.getElementById('reviewer-name-field').value;
      const nip = document.getElementById('reviewer-nip-field').value;
      const jabatan = document.getElementById('reviewer-jabatan-field').value || "Kepala Pusat";
      
      document.getElementById('loading-indicator').classList.remove('hidden');
      
      google.script.run
        .withSuccessHandler(function(resp) {
          document.getElementById('loading-indicator').classList.add('hidden');
          if (resp.success) {
            alert("Saran/Persetujuan cuti berhasil divalidasi dan disimpan!");
            refreshRequests();
            // Clear desk
            document.getElementById('empty-desk-view').classList.remove('hidden');
            document.getElementById('active-desk-view').classList.add('hidden');
            selectedRequestId = null;
          } else {
            alert("Gagal menyimpan persetujuan: " + resp.error);
          }
        })
        .withFailureHandler(function(err) {
          document.getElementById('loading-indicator').classList.add('hidden');
          alert("Gagal menghubungi server: " + err);
        })
        .updateApproval(selectedRequestId, activeApprovalRole, {
          status: status,
          nama: nama,
          nip: nip,
          jabatan: jabatan
        });
    }

    // TAB 3: DATA LIST & PRINT PREVIEW GENERATOR
    function renderDataListTable() {
      const emptyView = document.getElementById('list-empty-view');
      const activeView = document.getElementById('list-active-view');
      const tbody = document.getElementById('list-table-body');
      
      if (!globalRequests || globalRequests.length === 0) {
        emptyView.classList.remove('hidden');
        activeView.classList.add('hidden');
        return;
      }
      
      emptyView.classList.add('hidden');
      activeView.classList.remove('hidden');
      
      tbody.innerHTML = "";
      globalRequests.forEach(req => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
        
        tr.innerHTML = \`
          <td class="p-3">
            <p class="font-semibold text-slate-800">\${req.nama}</p>
            <p class="text-[9px] text-slate-400 font-mono">NIP. \${req.nip}</p>
          </td>
          <td class="p-3 text-slate-600 font-semibold text-[11px]">\${req.jenisCuti}</td>
          <td class="p-3 text-slate-500 text-[10px]">\${req.lamanyaCuti}</td>
          <td class="p-3">
            <span class="text-[9px] px-1.5 py-0.5 rounded font-bold \${
              req.atasanStatus === "DISETUJUI" ? "bg-emerald-100 text-emerald-700" :
              req.atasanStatus === "TIDAK DISETUJUI" ? "bg-red-105 text-red-650" : "bg-slate-200 text-slate-500"
            }">
              \${req.atasanStatus || "-"}
            </span>
          </td>
          <td class="p-3">
            <span class="text-[9px] px-1.5 py-0.5 rounded font-bold \${
              req.pejabatStatus === "DISETUJUI" ? "bg-emerald-100 text-emerald-700" :
              req.pejabatStatus === "TIDAK DISETUJUI" ? "bg-red-105 text-red-650" : "bg-slate-200 text-slate-500"
            }">
              \${req.pejabatStatus || "-"}
            </span>
          </td>
          <td class="p-3 text-center">
            <button onclick="renderGasA4PrintFrame('\${req.id}')" class="px-2.5 py-1 bg-slate-900 border border-slate-755 hover:bg-slate-800 text-white text-[10px] rounded font-bold transition">
              🔍 Lihat & Cetak A4
            </button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    // DRAW THE BEAUTIFUL HTML-FORM A4 DOCUMENT (Aesthetic design compliant with instructions)
    function renderGasA4PrintFrame(id) {
      const req = globalRequests.find(r => r.id === id);
      if (!req) return;
      
      const container = document.getElementById('gas-print-container');
      container.classList.remove('hidden');
      
      // Compute checkboxes
      const ch1 = (req.jenisCuti === 'Cuti Tahunan' || req.jenisCuti === 'cuti_tahunan') ? '✔' : '';
      const ch2 = (req.jenisCuti === 'Cuti Besar' || req.jenisCuti === 'cuti_besar') ? '✔' : '';
      const ch3 = (req.jenisCuti === 'Cuti Sakit' || req.jenisCuti === 'cuti_sakit') ? '✔' : '';
      const ch4 = (req.jenisCuti === 'Cuti Melahirkan' || req.jenisCuti === 'cuti_melahirkan') ? '✔' : '';
      const ch5 = (req.jenisCuti === 'Cuti Karena Alasan Penting' || req.jenisCuti === 'cuti_penting') ? '✔' : '';
      const ch6 = (req.jenisCuti === 'Cuti Di Luar Tanggungan Negara' || req.jenisCuti === 'cuti_luar_negara') ? '✔' : '';
      const ch7 = (req.jenisCuti === 'Surat Izin' || req.jenisCuti === 'surat_izin') ? '✔' : '';

      // Compute Approval Checks
      const at1 = req.atasanStatus === 'DISETUJUI' ? '✔' : '';
      const at2 = req.atasanStatus === 'PERUBAHAN' ? '✔' : '';
      const at3 = req.atasanStatus === 'DITANGGUHKAN' ? '✔' : '';
      const at4 = req.atasanStatus === 'TIDAK DISETUJUI' ? '✔' : '';

      const pe1 = req.pejabatStatus === 'DISETUJUI' ? '✔' : '';
      const pe2 = req.pejabatStatus === 'PERUBAHAN' ? '✔' : '';
      const pe3 = req.pejabatStatus === 'DITANGGUHKAN' ? '✔' : '';
      const pe4 = req.pejabatStatus === 'TIDAK DISETUJUI' ? '✔' : '';

      const htmlPayload = \`
        <!-- Page Form -->
        <div style="text-align: right; margin-bottom: 10px;">
          <div style="display: inline-block; text-align: left; min-width: 200px;">
            <p>Makassar, \${req.tanggalForm ? req.tanggalForm.replace('Makassar, ', '') : '.....................'}</p>
            <p style="margin-top: 8px;">Kepada</p>
            <p>Yth. PPLH Sulawesi dan Maluku</p>
            <p>di.</p>
            <p style="text-indent: 16px;">Tempat</p>
          </div>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <h2 style="font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 0;">\${(req.jenisCuti === 'Surat Izin' || req.jenisCuti === 'surat_izin') ? 'FORMULIR PERMINTAAN DAN PEMBERIAN IZIN (TIDAK MASUK KERJA)' : 'FORMULIR PERMINTAAN DAN PEMBERIAN CUTI'}</h2>
          <div style="border-top: 1px solid black; max-width: 300px; margin: 4px auto 0 auto; padding-top: 2px; font-size: 10px;">
            <span>No: \${req.nomorSurat || '...........................................'}</span>
          </div>
        </div>

        <!-- 1. DATA PEGAWAI -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid black;">
          <tr style="background-color: #f1f5f9; border-bottom: 1px solid black; font-weight: bold;">
            <td colspan="4" style="padding: 4px 8px; text-transform: uppercase;">I. DATA PEGAWAI</td>
          </tr>
          <tr style="border-bottom: 1px solid black;">
            <td style="width: 15%; padding: 4px; border-right: 1px solid black; font-weight: bold;">Nama</td>
            <td style="width: 35%; padding: 4px; border-right: 1px solid black;">\${req.nama}</td>
            <td style="width: 15%; padding: 4px; border-right: 1px solid black; font-weight: bold;">NIP</td>
            <td style="width: 35%; padding: 4px;">\${req.nip}</td>
          </tr>
          <tr style="border-bottom: 1px solid black;">
            <td style="padding: 4px; border-right: 1px solid black; font-weight: bold;">Jabatan</td>
            <td style="padding: 4px; border-right: 1px solid black;">\${req.jabatan}</td>
            <td style="padding: 4px; border-right: 1px solid black; font-weight: bold;">Masa Kerja</td>
            <td style="padding: 4px;">\${req.masaKerja}</td>
          </tr>
          <tr>
            <td style="padding: 4px; border-right: 1px solid black; font-weight: bold;">Unit Kerja</td>
            <td colspan="3" style="padding: 4px;">\${req.unitKerja}</td>
          </tr>
        </table>

        <!-- 2. JENIS CUTI -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid black;">
          <tr style="background-color: #f1f5f9; border-bottom: 1px solid black; font-weight: bold;">
            <td colspan="2" style="padding: 4px 8px; text-transform: uppercase;">II. JENIS CUTI YANG DIAMBIL **</td>
          </tr>
          <tr style="border-bottom: 1px solid black;">
            <td style="width: 50%; padding: 4px; border-right: 1px solid black; display: flex; justify-content: space-between;">
              <span>1. Cuti Tahunan</span>
              <span style="font-weight: bold; margin-right: 15px;">\${ch1}</span>
            </td>
            <td style="width: 50%; padding: 4px; display: flex; justify-content: space-between;">
              <span>2. Cuti Besar</span>
              <span style="font-weight: bold; margin-right: 15px;">\${ch2}</span>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid black;">
            <td style="padding: 4px; border-right: 1px solid black; display: flex; justify-content: space-between;">
              <span>3. Cuti Sakit</span>
              <span style="font-weight: bold; margin-right: 15px;">\${ch3}</span>
            </td>
            <td style="padding: 4px; display: flex; justify-content: space-between;">
              <span>4. Cuti Melahirkan</span>
              <span style="font-weight: bold; margin-right: 15px;">\${ch4}</span>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid black;">
            <td style="padding: 4px; border-right: 1px solid black; display: flex; justify-content: space-between;">
              <span>5. Cuti Karena Alasan Penting</span>
              <span style="font-weight: bold; margin-right: 15px;">\${ch5}</span>
            </td>
            <td style="padding: 4px; display: flex; justify-content: space-between;">
              <span>6. Cuti di Luar Tanggungan Negara</span>
              <span style="font-weight: bold; margin-right: 15px;">\${ch6}</span>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 4px; display: flex; justify-content: space-between;">
              <span>7. Surat Izin (Tidak Masuk Kerja / Meninggalkan Kantor)</span>
              <span style="font-weight: bold; margin-right: 15px;">\${ch7}</span>
            </td>
          </tr>
        </table>

        <!-- 3. ALASAN CUTI -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid black;">
          <tr style="background-color: #f1f5f9; border-bottom: 1px solid black; font-weight: bold;">
            <td style="padding: 4px 8px; text-transform: uppercase;">\${(req.jenisCuti === 'Surat Izin' || req.jenisCuti === 'surat_izin') ? 'III. ALASAN IZIN' : 'III. ALASAN CUTI'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-size:11px;">\${req.alasanCuti || '-'}</td>
          </tr>
        </table>

        <!-- 4. LAMANYA CUTI -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid black; text-align: center;">
          <tr style="background-color: #f1f5f9; border-bottom: 1px solid black; font-weight: bold; text-align: left;">
            <td colspan="3" style="padding: 4px 8px; text-transform: uppercase;">\${(req.jenisCuti === 'Surat Izin' || req.jenisCuti === 'surat_izin') ? 'IV. LAMANYA IZIN' : 'IV. LAMANYA CUTI'}</td>
          </tr>
          <tr style="border-bottom: 1px solid black; font-weight: bold;">
            <td style="width: 30%; border-right: 1px solid black; padding: 4px;">Selama</td>
            <td style="width: 40%; border-right: 1px solid black; padding: 4px;">Mulai Tanggal</td>
            <td style="width: 30%; padding: 4px;">s/d</td>
          </tr>
          <tr>
            <td style="border-right: 1px solid black; padding: 8px;">\${req.lamanyaCuti}</td>
            <td style="border-right: 1px solid black; padding: 8px;">\${req.tanggalMulai}</td>
            <td style="padding: 8px;">\${req.tanggalSelesai}</td>
          </tr>
        </table>

        <!-- 5. CATATAN CUTI (Historis & Counters presets) -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid black;">
          <tr style="background-color: #f1f5f9; border-bottom: 1px solid black; font-weight: bold;">
            <td colspan="2" style="padding: 4px 8px; text-transform: uppercase;">V. CATATAN CUTI ***</td>
          </tr>
          <tr style="border-bottom: 1px solid black;">
            <!-- Sisa cuti column -->
            <td style="width: 50%; border-right: 1px solid black; vertical-align: top;">
              <div style="font-weight: bold; padding: 3px; border-bottom: 1px solid black; background-color: #f8fafc;">1. CUTI TAHUNAN</div>
              <table style="width: 100%; text-align: center; font-size: 10px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid black; font-weight: bold;">
                  <td style="border-right: 1px solid black;">Tahun</td>
                  <td style="border-right: 1px solid black;">Sisa</td>
                  <td>Keterangan</td>
                </tr>
                <tr style="border-bottom: 1px solid black;">
                  <td style="border-right: 1px solid black; padding: 2px;">N-2</td>
                  <td style="border-right: 1px solid black; padding: 2px;">-</td>
                  <td style="text-align: left; padding-left: 4px;"></td>
                </tr>
                <tr style="border-bottom: 1px solid black;">
                  <td style="border-right: 1px solid black; padding: 2px;">N-1</td>
                  <td style="border-right: 1px solid black; padding: 2px;">-</td>
                  <td style="text-align: left; padding-left: 4px; font-size: 8.5px;">CUTI 2024+2025 = 12 Hari</td>
                </tr>
                <tr>
                  <td style="border-right: 1px solid black; padding: 2px;">N</td>
                  <td style="border-right: 1px solid black; padding: 2px;">12</td>
                  <td style="text-align: left; padding-left: 4px; font-size: 8.5px;">diambil = 3 Hari, Sisa = 9 Hari</td>
                </tr>
              </table>
            </td>
            <!-- Other cutis column -->
            <td style="width: 50%; vertical-align: top;">
              <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid black;">
                  <td style="font-weight: bold; padding: 4px; background-color: #f8fafc; border-right: 1px solid #e2e8f0; width: 45%;">2. CUTI BESAR</td>
                  <td style="padding: 4px;">-</td>
                </tr>
                <tr style="border-bottom: 1px solid black;">
                  <td style="font-weight: bold; padding: 4px; background-color: #f8fafc; border-right: 1px solid #e2e8f0;">3. CUTI SAKIT</td>
                  <td style="padding: 4px;">-</td>
                </tr>
                <tr style="border-bottom: 1px solid black;">
                  <td style="font-weight: bold; padding: 4px; background-color: #f8fafc; border-right: 1px solid #e2e8f0;">4. CUTI MELAHIRKAN</td>
                  <td style="padding: 4px;">-</td>
                </tr>
                <tr style="border-bottom: 1px solid black;">
                  <td style="font-weight: bold; padding: 4px; background-color: #f8fafc; border-right: 1px solid #e2e8f0;">5. CUTI ALASAN PENTING</td>
                  <td style="padding: 4px;">-</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; padding: 4px; background-color: #f8fafc; border-right: 1px solid #e2e8f0;">6. CUTI DI LUAR NEGARA</td>
                  <td style="padding: 4px;">-</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- 6. CONTACT DETAIL & SIGNATURE OF APPLICANT -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid black;">
          <tr style="background-color: #f1f5f9; border-bottom: 1px solid black; font-weight: bold;">
            <td colspan="2" style="padding: 4px 8px; text-transform: uppercase;">VI. ALAMAT SELAMA MENJALANKAN CUTI</td>
          </tr>
          <tr>
            <td style="width: 50%; padding: 8px; border-right: 1px solid black; vertical-align: top;">
              <p style="min-height: 40px;">\${req.alamatSelamaCuti}</p>
              <div style="margin-top: 15px; border-top: 1px solid #cbd5e1; padding-top: 4px; font-weight: bold;">
                TELP: \${req.telepon}
              </div>
            </td>
            <td style="width: 50%; padding: 8px; text-align: center; vertical-align: bottom; min-height: 110px;">
              <p style="text-align: right; margin-right: 20px;">Hormat Saya,</p>
              <p style="font-family: monospace; italic; color: #047857; font-size: 11px; margin: 20px 0;">[Tandatangan Digital]</p>
              <p style="font-weight: bold; text-decoration: underline;">\${req.nama}</p>
              <p>NIP. \${req.nip}</p>
            </td>
          </tr>
        </table>

        <!-- 7. ATASAN SELECTION -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid black;">
          <tr style="background-color: #f1f5f9; border-bottom: 1px solid black; font-weight: bold;">
            <td colspan="4" style="padding: 4px 8px; text-transform: uppercase;">VII. PERTIMBANGAN ATASAN LANGSUNG **</td>
          </tr>
          <tr style="border-bottom: 1px solid black; font-weight: bold; text-align: center; background-color: #f8fafc;">
            <td style="width: 25%; border-right: 1px solid black; padding: 2px;">DISETUJUI</td>
            <td style="width: 25%; border-right: 1px solid black; padding: 2px;">PERUBAHAN</td>
            <td style="width: 25%; border-right: 1px solid black; padding: 2px;">DITANGGUHKAN</td>
            <td style="width: 25%; padding: 2px;">TIDAK DISETUJUI</td>
          </tr>
          <tr style="border-bottom: 1px solid black; text-align: center; height: 26px; font-weight: bold; font-size: 14px;">
            <td style="border-right: 1px solid black;">\${at1}</td>
            <td style="border-right: 1px solid black;">\${at2}</td>
            <td style="border-right: 1px solid black;">\${at3}</td>
            <td>\${at4}</td>
          </tr>
          <tr>
            <td colspan="4" style="padding: 8px; text-align: right;">
              <div style="display: inline-block; text-align: center; margin-right: 30px; min-width: 180px;">
                \${req.atasanNama ? \`
                  <p style="font-family: monospace; size: 10px; color: #000; font-size:10px;">Tanggal: \${req.atasanTanggal || '-'}</p>
                  <p style="font-family: monospace; font-size: 10px; color: #047857; italic;">Approved: \${req.atasanNama}</p>
                  <p style="font-weight: bold; text-decoration: underline; margin-top: 10px;">\${req.atasanNama}</p>
                  <p>NIP. \${req.atasanNip}</p>
                \` : '<p style="font-style: italic; color: #94a3b8; padding: 10px 0;">Menunggu Atasan</p>'}
              </div>
            </td>
          </tr>
        </table>

        <!-- 8. PEJABAT SELECTION -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
          <tr style="background-color: #f1f5f9; border-bottom: 1px solid black; font-weight: bold;">
            <td colspan="4" style="padding: 4px 8px; text-transform: uppercase;">VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI **</td>
          </tr>
          <tr style="border-bottom: 1px solid black; font-weight: bold; text-align: center; background-color: #f8fafc;">
            <td style="width: 25%; border-right: 1px solid black; padding: 2px;">DISETUJUI</td>
            <td style="width: 25%; border-right: 1px solid black; padding: 2px;">PERUBAHAN</td>
            <td style="width: 25%; border-right: 1px solid black; padding: 2px;">DITANGGUHKAN</td>
            <td style="width: 25%; padding: 2px;">TIDAK DISETUJUI</td>
          </tr>
          <tr style="border-bottom: 1px solid black; text-align: center; height: 26px; font-weight: bold; font-size: 14px;">
            <td style="border-right: 1px solid black;">\${pe1}</td>
            <td style="border-right: 1px solid black;">\${pe2}</td>
            <td style="border-right: 1px solid black;">\${pe3}</td>
            <td>\${pe4}</td>
          </tr>
          <tr>
            <td colspan="4" style="padding: 8px; text-align: right;">
              <div style="display: inline-block; text-align: center; margin-right: 30px; min-width: 180px;">
                \${req.pejabatNama ? \`
                  <p style="font-family: monospace; font-size: 10px; color: #000;">Tanggal: \values \${req.pejabatTanggal || '-'}</p>
                  <p style="font-weight: bold; font-size:9.5px;">Kepala Pusat / \${req.pejabatJabatan || 'Pejabat'}</p>
                  <p style="font-family: monospace; font-size: 10px; color: #047857; italic;">Signed: \${req.pejabatNama}</p>
                  <p style="font-weight: bold; text-decoration: underline; margin-top: 10px;">\${req.pejabatNama}</p>
                  <p>NIP. \${req.pejabatNip}</p>
                \` : '<p style="font-style: italic; color: #94a3b8; padding: 10px 0;">Menunggu Pejabat</p>'}
              </div>
            </td>
          </tr>
        </table>
      \`;

      document.getElementById('print-sheet-payload').innerHTML = htmlPayload;
    }

    // NATIVE SYSTEM PRINT
    function printGasDoc() {
      // Temporarily hide parts and call native print focusing on key area
      const printContents = document.getElementById('print-sheet-payload').innerHTML;
      const originalContents = document.body.innerHTML;

      // Swap body markup to print seamlessly, then return
      document.body.innerHTML = \`
        <div style="padding: 24px; font-family: serif; font-size: 11px;">
          \${printContents}
        </div>
      \`;
      window.print();
      document.body.innerHTML = originalContents;
      
      // Force reload UI hooks
      window.location.reload();
    }

    function closeModal() {
      document.getElementById('statusModal').classList.add('hidden');
    }

    // ==============================================
    // ADMIN USER MANAGEMENT CONTROLLERS
    // ==============================================
    function renderAdminUserTable() {
      try {
        const tbody = document.getElementById("admin-user-table-body");
        if (!tbody) return;
        
        const rawUsers = localStorage.getItem("pplh_user_accounts");
        let users = DEFAULT_USERS;
        try {
          if (rawUsers) {
            users = JSON.parse(rawUsers) || DEFAULT_USERS;
          }
        } catch (e) {
          console.warn("Parsing pplh_user_accounts failed, using DEFAULT_USERS", e);
          users = DEFAULT_USERS;
        }
        
        tbody.innerHTML = "";
        
        users.forEach(u => {
          if (!u) return;
          const uId = u.id || "";
          const uName = u.name || "Pengguna";
          const uNip = u.nip || "-";
          const uUsername = u.username || "";
          const uRole = u.role || "pegawai";
          const uJabatan = u.jabatan || "-";
          const uUnit = u.unit || "-";
          
          let roleBadgeColor = "bg-slate-100 text-slate-800";
          if (uRole === "admin") roleBadgeColor = "bg-red-100 text-red-700";
          if (uRole === "atasan") roleBadgeColor = "bg-amber-100 text-amber-800";
          if (uRole === "pejabat") roleBadgeColor = "bg-indigo-100 text-indigo-850";
          if (uRole === "pegawai") roleBadgeColor = "bg-emerald-100 text-emerald-850";
          
          const tr = document.createElement("tr");
          tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
          tr.innerHTML = " " +
            "<td class='p-3'>" +
              "<p class='font-semibold text-slate-800'>" + uName + "</p>" +
              "<p class='text-[9px] text-slate-400 font-mono'>NIP. " + uNip + "</p>" +
            "</td>" +
            "<td class='p-3 text-slate-600 font-mono text-[11px]'>" + uUsername + "</td>" +
            "<td class='p-3'>" +
              "<span class='text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase " + roleBadgeColor + "'>" +
                uRole +
              "</span>" +
            "</td>" +
            "<td class='p-3 text-slate-500 leading-tight'>" +
              "<p class='text-[11px] font-semibold text-slate-700'>" + uJabatan + "</p>" +
              "<p class='text-[9px] text-slate-400'>" + uUnit + "</p>" +
            "</td>" +
            "<td class='p-3 text-center gap-1.5 justify-center flex'>" +
              "<button onclick=\"openEditUserModal('" + uId + "')\" class='px-2.5 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 rounded transition border border-emerald-200'>" +
                "Ubah" +
              "</button>" +
              "<button onclick=\"deleteUser('" + uId + "')\" class='px-2.5 py-1 text-[10px] font-bold text-red-650 hover:bg-red-50 rounded transition border border-red-200' " +
                (uUsername === "admin" ? "disabled style='opacity: 0.4; cursor: not-allowed;'" : "") + ">" +
                "Hapus" +
              "</button>" +
            "</td>";
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error("renderAdminUserTable error:", err);
      }
    }

    function openAddUserModal() {
      document.getElementById("user-modal-title").innerText = "Tambah Admin/Pegawai Baru";
      document.getElementById("edit-user-id").value = "";
      document.getElementById("userForm").reset();
      document.getElementById("usr-username").removeAttribute("readonly");
      document.getElementById("userModal").classList.remove("hidden");
    }

    function closeUserModal() {
      document.getElementById("userModal").classList.add("hidden");
    }

    function openEditUserModal(id) {
      const users = JSON.parse(localStorage.getItem("pplh_user_accounts")) || DEFAULT_USERS;
      const u = users.find(usr => usr.id === id);
      if (!u) return;
      
      document.getElementById("user-modal-title").innerText = "Ubah Informasi Akun";
      document.getElementById("edit-user-id").value = u.id;
      document.getElementById("usr-username").value = u.username;
      document.getElementById("usr-username").setAttribute("readonly", "true");
      document.getElementById("usr-password").value = u.password;
      document.getElementById("usr-nama").value = u.name;
      document.getElementById("usr-nip").value = u.nip;
      document.getElementById("usr-role").value = u.role;
      document.getElementById("usr-masakerja").value = u.masakerja || "";
      document.getElementById("usr-jabatan").value = u.jabatan || "";
      document.getElementById("usr-unitkerja").value = u.unit || "Pusat Pengendalian Lingkungan Hidup Suma";
      
      document.getElementById("userModal").classList.remove("hidden");
    }

    function handleUserFormSubmit(e) {
      e.preventDefault();
      const id = document.getElementById("edit-user-id").value;
      const username = document.getElementById("usr-username").value.trim().toLowerCase();
      const password = document.getElementById("usr-password").value.trim();
      const name = document.getElementById("usr-nama").value.trim();
      const nip = document.getElementById("usr-nip").value.trim();
      const role = document.getElementById("usr-role").value;
      const masakerja = document.getElementById("usr-masakerja").value.trim();
      const jabatan = document.getElementById("usr-jabatan").value.trim();
      const unit = document.getElementById("usr-unitkerja").value.trim() || "Pusat Pengendalian Lingkungan Hidup Suma";
      
      let users = JSON.parse(localStorage.getItem("pplh_user_accounts")) || DEFAULT_USERS;
      
      if (id) {
        // Edit Mode
        users = users.map(u => {
          if (u.id === id) {
            return { ...u, password, name, nip, role, masakerja, jabatan, unit };
          }
          return u;
        });
        alert("Informasi akun pengguna berhasil diperbarui!");
      } else {
        // Create Mode
        if (users.some(u => u.username.toLowerCase() === username)) {
          alert("Gagal: Username sudah digunakan pengguna lain!");
          return;
        }
        const newUser = {
          id: "usr_" + new Date().getTime(),
          username, password, name, nip, role, masakerja, jabatan, unit
        };
        users.push(newUser);
        alert("Pengguna baru berhasil ditambahkan!");
      }
      
      localStorage.setItem("pplh_user_accounts", JSON.stringify(users));
      closeUserModal();
      renderAdminUserTable();
      renderQuickLoginButtons();

      // Sinkronisasi penuh ke sheet Google
      if (typeof google !== "undefined" && google.script && google.script.run) {
        document.getElementById('loading-indicator').classList.remove('hidden');
        google.script.run
          .withSuccessHandler(function(resp) {
            document.getElementById('loading-indicator').classList.add('hidden');
            if (!resp || !resp.success) {
              alert("Perhatian: Akun tersimpan lokal di browser Anda, tetapi gagal diserahkan ke Google Sheets pimpinan: " + (resp ? resp.error : "Unknown"));
            }
          })
          .withFailureHandler(function(err) {
            document.getElementById('loading-indicator').classList.add('hidden');
            alert("Terjadi kegagalan komunikasi saat sinkronisasi daftar akun: " + err);
          })
          .saveUserAccounts(users);
      }
    }

    function deleteUser(id) {
      let users = JSON.parse(localStorage.getItem("pplh_user_accounts")) || DEFAULT_USERS;
      const targetUser = users.find(u => u.id === id);
      if (!targetUser) return;
      
      if (targetUser.username === "admin") {
        alert("Keamanan Akun: Akun 'admin' utama tidak boleh dihapus!");
        return;
      }
      
      if (confirm("Apakah Anda yakin ingin menghapus akun " + targetUser.name + " (" + targetUser.username + ") dari database lokal?")) {
        users = users.filter(u => u.id !== id);
        localStorage.setItem("pplh_user_accounts", JSON.stringify(users));
        renderAdminUserTable();
        renderQuickLoginButtons();
        alert("Akun pengguna berhasil dihapus.");

        // Sinkronisasi penuh ke sheet Google
        if (typeof google !== "undefined" && google.script && google.script.run) {
          document.getElementById('loading-indicator').classList.remove('hidden');
          google.script.run
            .withSuccessHandler(function(resp) {
              document.getElementById('loading-indicator').classList.add('hidden');
              if (!resp || !resp.success) {
                alert("Perhatian: Akun terhapus lokal di browser Anda, tetapi gagal ditiadakan dari Google Sheets pimpinan: " + (resp ? resp.error : "Unknown"));
              }
            })
            .withFailureHandler(function(err) {
              document.getElementById('loading-indicator').classList.add('hidden');
              alert("Terjadi kegagalan komunikasi saat sinkronisasi daftar akun: " + err);
            })
            .saveUserAccounts(users);
        }
      }
    }
  </script>
</body>
</html>
`;
export const appsScriptGuide = `### 📋 Langkah Pemasangan di Google Apps Script

Sistem pengisian **Formulir, Rekap Otomatis di Google Sheet, dan Verifikasi Pimpinan (Atasan & Pejabat)** dapat Anda pasang hanya dalam waktu kurang dari 5 menit menggunakan panduan berikut:

1. **Buat Google Spreadsheet Baru**:
   - Beri nama \`Sistem Cuti PPLH Digital\`.
   - Salin **ID Spreadsheet** Anda dari alamat URL browser (Karakter panjang di antara \`/d/\` dan \`/edit\`).

2. **Buka Pintasan Apps Script**:
   - Klik menu **Extensions** (Ekstensi) > pilih **Apps Script**.

3. **Tempel Kode Backend (\`Code.gs\`)**:
   - Hapus semua isi bawaan pada berkas \`Code.gs\`.
   - Salin seluruh baris kode dari tab **Code.gs** di samping, lalu tempelkan.
   - Masukkan ID Spreadsheet Anda pada variabel \`SPREADSHEET_ID\` di baris teratas (atau kosongkan bila script terikat langsung pada modul berkas tersebut).

4. **Buat Berkas Tampilan (\`Index.html\`)**:
   - Klik tombol **+** di panel kiri Apps Script > pilih **HTML**.
   - Beri nama berkas tepat: **Index** (huruf besar di awal, tanpa menambah ekstensi *.html*).
   - Kosongkan isinya, lalu salin dan tempelkan seluruh baris kode dari tab **Index.html** di samping.

5. **Deploy & Publikasikan sebagai Aplikasi Web**:
   - Klik tombol **Deploy** di sudut kanan atas > pilih **New deployment**.
   - Klik tombol roda gerigi tipe > pilih **Web app**.
   - Isi konfigurasi:
     - **Execute as**: \`Me (email Anda)\` (agar seluruh aktivitas menulis ke data sheet menggunakan jalur akun Anda).
     - **Who has access**: \`Anyone\` (agar seluruh pegawai dapat mengisi formulir dinas tanpa kewajiban membuat login individu).
   - Klik **Deploy**. Setujui perizinan akun Google jika muncul jendela verifikasi (*Advanced* > *Go to ... (unsafe)*).

6. **Selesai! Tautkan Web App URL**:
   - Anda akan mendapatkan link website aktif. Staf Anda dapat mengajukan cuti, pimpinan dapat mengesahkan (menyetujui/menolak) secara online, dan lembaran A4 PDF dapat langsung dicetak dari web app ini!
`;

