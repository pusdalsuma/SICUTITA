import React from 'react';
import { klhLogoBase64 } from './klhLogoBase64';

export function UserGuide() {
  const downloadWordManual = () => {
    const htmlHeader = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Buku Panduan Penggunaan & Penjelasan Aplikasi SICUTITA</title>
        <style>
          @page {
            size: 8.5in 11in;
            margin: 1.0in 1.0in 1.0in 1.0in;
            mso-header-margin: .5in;
            mso-footer-margin: .5in;
          }
          body {
            font-family: 'Arial', 'Calibri', sans-serif;
            line-height: 1.6;
            color: #1F2937;
            font-size: 11pt;
          }
          .title-container {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px double #10B981;
            padding-bottom: 20px;
          }
          .app-title {
            font-family: 'Georgia', serif;
            font-size: 24pt;
            font-weight: bold;
            color: #047857;
            margin: 0;
            text-transform: uppercase;
          }
          .app-subtitle {
            font-size: 12pt;
            color: #4B5563;
            margin: 5px 0 0 0;
            font-weight: normal;
          }
          h1 {
            font-family: 'Georgia', serif;
            font-size: 16pt;
            color: #065F46;
            border-bottom: 1.5pt solid #10B981;
            padding-bottom: 4px;
            margin-top: 28pt;
            margin-bottom: 12pt;
          }
          h2 {
            font-family: 'Arial', sans-serif;
            font-size: 13pt;
            color: #111827;
            margin-top: 18pt;
            margin-bottom: 8pt;
            font-weight: bold;
          }
          p {
            margin-top: 0;
            margin-bottom: 10pt;
            text-align: justify;
          }
          ul, ol {
            margin-top: 0;
            margin-bottom: 10pt;
            padding-left: 20px;
          }
          li {
            margin-bottom: 4pt;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 10pt;
            margin-bottom: 15pt;
          }
          th {
            background-color: #F3F4F6;
            border: 1px solid #D1D5DB;
            padding: 8px;
            font-weight: bold;
            text-align: left;
            font-size: 10pt;
            color: #111827;
          }
          td {
            border: 1px solid #D1D5DB;
            padding: 8px;
            font-size: 10pt;
          }
          .highlight-box {
            background-color: #ECFDF5;
            border-left: 4px solid #10B981;
            padding: 12px;
            margin-top: 10pt;
            margin-bottom: 10pt;
            border-radius: 4px;
          }
          .highlight-title {
            font-weight: bold;
            color: #065F46;
            margin-bottom: 4px;
            font-size: 10pt;
          }
          .text-muted {
            color: #6B7280;
            font-size: 9.5pt;
          }
          .center {
            text-align: center;
          }
          .badge {
            background-color: #E0F2FE;
            color: #0369A1;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9pt;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
    `;

    const htmlBody = `
      <div class="title-container">
        <h1 class="app-title">Buku Panduan Penggunaan & Penjelasan Sistem</h1>
        <p class="app-subtitle">Aplikasi SICUTITA (Sistem Informasi Cuti & Izin Terintegrasi & Akurat)</p>
        <p class="text-muted">Dokumen Resmi Manual Operasional • Versi 2.0 • Juni 2026</p>
      </div>

      <h1>1. Pendahuluan & Penjelasan Aplikasi</h1>
      <p>
        <strong>SICUTITA (Sistem Informasi Cuti & Izin Terintegrasi & Akurat)</strong> adalah aplikasi berbasis web yang dirancang khusus untuk memodernisasi tata kelola administrasi kepegawaian dalam hal pengajuan cuti tahunan dan surat izin karyawan. Aplikasi ini menggabungkan automasi perhitungan saldo sisa cuti, portal otorisasi berjenjang (multi-role), serta kapabilitas ekspor data dan pencetakan dokumen fisik dalam ukuran kertas A4 standar instansi pemerintahan.
      </p>
      <p>
        Dengan menggunakan aplikasi SICUTITA, instansi dapat memotong birokrasi manual yang lambat dan rawan kesalahan perhitungan kuota cuti. Seluruh data disinkronisasikan secara langsung dengan data profil pemohon sehingga meminimalkan redundansi input data.
      </p>

      <div class="highlight-box">
        <div class="highlight-title">💡 KEBIJAKAN ATURAN CUTI UTAMA (12 + 6 HARI)</div>
        <p style="margin: 0;">
          Aplikasi ini dilengkapi dengan <strong>Kalkulator Pengurang Kuota Cuti Otomatis</strong> yang mengacu pada aturan resmi instansi:
          <br />• Kuota Cuti Dasar Tahunan (Tahun N) adalah sebesar <strong>12 hari kerja</strong>.
          <br />• Apabila pegawai <strong>tidak mengambil hak cuti tahun lalu (Tahun N-1)</strong>, maka jatah cuti tahun berjalan bertambah 6 hari kerja secara otomatis, sehingga total kuota cuti menjadi <strong>18 hari kerja</strong>.
          <br />• Seluruh sisa perhitungan dan keterangan penangguhan akan dikalkulasi secara presisi dan dimasukkan langsung ke dalam draft formulir siap cetak.
        </p>
      </div>

      <h1>2. Struktur Peran Pengguna (Multi-Role Workflow)</h1>
      <p>
        Aplikasi SICUTITA mendukung alur kerja persetujuan berjenjang yang melibatkan empat peran penting:
      </p>
      
      <table>
        <thead>
          <tr>
            <th width="20%">Peran Pengguna</th>
            <th width="40%">Fitur & Akses Utama</th>
            <th width="40%">Alur Kerja (Workflow)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Pegawai (Pemohon)</strong></td>
            <td>
              - Mengisi formulir cuti tahunan & surat izin mandiri.<br />
              - Menggambar tanda tangan digital langsung.<br />
              - Memilih atau mengisi manual sisa kuota cuti historis.<br />
              - Melihat live pratinjau lembar kertas A4 cetak.
            </td>
            <td>
              Mengajukan permohonan baru -> Menandatangani berkas -> Memantau status approvals di panel kanan.
            </td>
          </tr>
          <tr>
            <td><strong>Atasan Langsung</strong></td>
            <td>
              - Mengakses "Meja Atasan" untuk review pengajuan.<br />
              - Memberikan catatan persetujuan, penangguhan, atau penolakan.<br />
              - Melakukan tanda tangan digital untuk verifikasi jenjang pertama.
            </td>
            <td>
              Menerima notifikasi ajuan -> Memeriksa rincian -> Bubuhkan catatan & TTD -> Status berubah menjadi DISETUJUI ATASAN.
            </td>
          </tr>
          <tr>
            <td><strong>Pejabat Berwenang</strong></td>
            <td>
              - Melakukan otorisasi final terhadap pengajuan yang sudah disetujui atasan.<br />
              - Membubuhi tanda tangan digital final.<br />
              - Mencetak atau men-download revisi berkas fisik PDF/A4.
            </td>
            <td>
              Menerima ajuan tervalidasi -> Memeriksa kesesuaian kuota -> Bubuhkan keputusan final TTD -> Status berubah menjadi SELESAI.
            </td>
          </tr>
          <tr>
            <td><strong>Administrator</strong></td>
            <td>
              - Mengelola bank data akun instansi (tambah, edit, dan hapus user).<br />
              - Sinkronisasi manual database Supabase.<br />
              - Melakukan audit trail seluruh permohonan yang masuk.
            </td>
            <td>
              Menyediakan konfigurasi awal -> Menginput data awal pegawai -> Melakukan backup/sinkronisasi instansi.
            </td>
          </tr>
        </tbody>
      </table>

      <h1>3. Panduan Penggunaan Fitur Utama</h1>
      
      <h2>3.1 Mengajukan Cuti Tahunan (Pegawai)</h2>
      <ol>
        <li>Masuk ke dalam aplikasi menggunakan akun Pegawai Anda.</li>
        <li>Pilih tab <strong>🌴 Formulir Cuti</strong> di navbar atas.</li>
        <li>Isi data kuota cuti pada panel <strong>Kalkulator Sisa Cuti - Aturan 12+6 Hari</strong>. Pilih apakah Anda mengambil cuti tahun lalu (N-1) atau tidak. Sistem akan secara otomatis menghitung saldo baru Anda secara live.</li>
        <li>Isi kolom alasan cuti, tanggal mulai & selesai, alamat selama cuti, serta nomor telepon aktif.</li>
        <li>Pada bagian tanda tangan, buat tanda tangan Anda menggunakan panel kursor / touch screen di kotak yang disediakan.</li>
        <li>Klik tombol <strong>"Kirim Permohonan Cuti"</strong>.</li>
      </ol>

      <h2>3.2 Mengajukan Surat Izin (Pegawai)</h2>
      <ol>
        <li>Pilih tab <strong>📝 Formulir Surat Izin</strong>.</li>
        <li>Pilih opsi format surat (Satu Hari Saja, atau Rentang Beberapa Hari).</li>
        <li>Lengkapi alasan izin (misalnya: Sakit, Kepentingan Keluarga, dsb) secara lengkap.</li>
        <li>Gambar tanda tangan digital Anda dan klik <strong>"Kirim Permohonan Surat Izin"</strong>.</li>
      </ol>

      <h2>3.3 Proses Approval (Atasan Langsung & Pejabat Final)</h2>
      <ol>
        <li>Masuk menggunakan akun Atasan atau Pejabat yang terdaftar.</li>
        <li>Pilih menu <strong>⚖️ Meja Atasan</strong>. Di sini Anda akan melihat baris daftar permohonan yang berstatus pending (DIAJUKAN atau DISETUJUI_ATASAN).</li>
        <li>Klik tombol <strong>"Pilih"</strong> pada salah satu pengajuan untuk memuat datanya.</li>
        <li>Di bagian bawah detail pengajuan, Anda akan menemukan opsi keputusan: <strong>DISETUJUI</strong>, <strong>DITANGGUHKAN</strong>, atau <strong>TIDAK DISETUJUI</strong>.</li>
        <li>Masukkan catatan disposisi Anda (misalnya: "Berikan delegasi pekerjaan selama cuti"), lalu buat tanda tangan digital di kanvas.</li>
        <li>Klik <strong>"Sahkan Keputusan"</strong> untuk menyimpan keputusan dan memperbarui pratinjau surat secara live.</li>
      </ol>

      <h1>4. Petunjuk Pencetakan Dokumen (A4 Print Layout)</h1>
      <p>
        Salah satu keunggulan utama aplikasi SICUTITA adalah tata letak pratinjau yang dirancang presisi menyerupai kertas dokumen fisik berukuran A4. Untuk mencetak dokumen fisik dengan kualitas terbaik, ikuti langkah-langkah di bawah ini:
      </p>
      <ol>
        <li>Pilih dokumen aktif dari dropdown pemilih dokumen di atas halaman.</li>
        <li>Klik tombol <strong>"🖨️ Cetak Formulir (A4)"</strong> berwarna biru di atas pratinjau kertas.</li>
        <li>Jendela cetak bawaan browser Anda akan terbuka.</li>
        <li><strong>SANGAT PENTING:</strong> Pada pengaturan jendela cetak browser Anda:
          <br />• <strong>Ukuran Kertas (Paper Size):</strong> Atur ke <strong>A4</strong>.
          <br />• <strong>Margin:</strong> Atur ke <strong>Default</strong> atau <strong>None</strong> agar batas kertas presisi.
          <br />• <strong>Header & Footer (Kepala & Kaki Halaman):</strong> Pastikan <strong>UNCHECK / NONAKTIFKAN</strong> agar alamat website dan tanggal browser tidak ikut tercetak di atas lembar dokumen instansi.
          <br />• <strong>Background Graphics (Grafis Latar Belakang):</strong> Pastikan <strong>CHECK / AKTIFKAN</strong> agar garis-subform, logo kop surat, dan aksen tabel tercetak dengan sempurna.
        </li>
        <li>Klik tombol <strong>Print / Cetak</strong> atau pilih <strong>Save as PDF</strong> untuk menyimpannya sebagai file digital berresolusi tinggi.</li>
      </ol>

      <h1>5. Integrasi Google Sheets (Apps Script Deployment)</h1>
      <p>
        Bagi Administrator, data pengajuan cuti ini dapat diekspor secara real-time ke spreadsheet dinamis Google Sheets:
      </p>
      <ul>
        <li>Gunakan skrip Google Apps Script yang disediakan pada tab <strong>🤖 Deploy GAS</strong>.</li>
        <li>Salin kode skrip tersebut dan tempelkan pada menu <em>Extension > Apps Script</em> di Google Sheets instansi Anda.</li>
        <li>Konfigurasikan endpoint Webhook di spreadsheet Anda untuk menangkap setiap pengajuan secara otomatis dan menyimpannya ke baris baru spreadsheet.</li>
      </ul>

      <div class="footer">
        Buku Panduan Penggunaan Sistem SICUTITA • Hak Cipta Terlindungi © 2026 • Didesain untuk Efisiensi Birokrasi Instansi Anda
      </div>
    `;

    const htmlFooter = `
      </body>
      </html>
    `;

    const fullHtml = htmlHeader + htmlBody + htmlFooter;
    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Buku_Panduan_Aplikasi_SICUTITA.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 xl:p-8 space-y-6" id="user-guide-panel">
      
      {/* Header Widget */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-2xl shadow-inner">
            📖
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-normal">Buku Panduan & Penjelasan Sistem</h2>
            <p className="text-xs text-slate-400">Pelajari alur operasional multi-role dan cetak manual aplikasi.</p>
          </div>
        </div>
        
        <button
          onClick={downloadWordManual}
          className="px-4 py-2 bg-emerald-650 hover:bg-emerald-600 text-white border border-emerald-500/25 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/5 cursor-pointer"
          title="Unduh manual dokumentasi ini untuk Microsoft Word"
          id="btn-download-word-guide"
        >
          <svg className="w-4 h-4 text-emerald-100" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Unduh File Manual (Format Word)
        </button>
      </div>

      {/* Grid Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
          <span className="text-emerald-400 text-sm font-bold block">🌴 Kalkulator Otomatis</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Menghitung otomatis jatah cuti berdasarkan jatah dasar (12 hari) dan penambahan bonus tahun lalu (6 hari) jika tidak digunakan.
          </p>
        </div>
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
          <span className="text-indigo-400 text-sm font-bold block">✍️ Tanda Tangan Digital</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Penandatanganan langsung di kanvas digital (signature pad) untuk Pegawai, Atasan Langsung, dan Pejabat Berwenang.
          </p>
        </div>
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
          <span className="text-amber-400 text-sm font-bold block">🖨️ Presisi Desain A4</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pratinjau kertas A4 yang didesain mengikuti standar tata letak pemerintah lengkap dengan Kop Surat instansi.
          </p>
        </div>
      </div>

      {/* Embedded Manual Contents */}
      <div className="space-y-6 pt-2 text-slate-300 text-sm max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        
        <section className="space-y-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">1.</span> Tentang Aplikasi (Penjelasan Utama)
          </h3>
          <p className="leading-relaxed text-slate-350">
            <strong>SICUTITA</strong> singkatan dari <strong>Sistem Informasi Cuti & Izin Terintegrasi & Akurat</strong> merupakan solusi modern pengelolaan administrasi kepegawaian. Aplikasi ini dibangun untuk mempermudah pegawai dalam mengajukan cuti, melakukan disposisi secara berjenjang oleh atasan langsung dan pejabat wewenang, dan menghasilkan keluaran dokumen fisik siap cetak yang rapi.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">2.</span> Struktur Alur Kerja (Workflow) Multi-Role
          </h3>
          <ul className="space-y-2.5 list-disc pl-5 text-slate-350">
            <li>
              <strong className="text-emerald-300">Pegawai:</strong> Mengajukan cuti tahunan atau surat izin, melakukan tanda tangan digital di panel, dan memantau status secara langsung di panel pratinjau kertas.
            </li>
            <li>
              <strong className="text-emerald-300">Atasan Langsung:</strong> Membuka tab <span className="font-semibold text-slate-100">⚖️ Meja Atasan</span>, memberikan catatan persetujuan/penangguhan, membuat tanda tangan, dan menyetujui ajuan tahap pertama.
            </li>
            <li>
              <strong className="text-indigo-300">Pejabat Berwenang:</strong> Otorisasi tahap akhir. Memilih keputusan final (DISETUJUI/DITOLAK) dan menandatanganinya sehingga dokumen sah untuk dicetak.
            </li>
            <li>
              <strong className="text-amber-400">Administrator:</strong> Mengakses panel kelola untuk menambah/mengedit database pegawai, menyinkronkan data dengan Supabase, dan mereset sistem bila diperlukan.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">3.</span> Aturan Hak Cuti Pegawai (Formula 12 + 6 Hari)
          </h3>
          <p className="leading-relaxed text-slate-350">
            Aplikasi mengimplementasikan formula perhitungan kuota cuti dinamis secara transparan:
          </p>
          <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="font-semibold text-slate-400">Hak Cuti Pokok Tahunan (Tahun N):</span>
              <span className="font-bold text-emerald-400">12 Hari Kerja</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="font-semibold text-slate-400">Hak Tambahan (Jika Cuti N-1 Tidak Diambil):</span>
              <span className="font-bold text-emerald-400">+6 Hari Kerja</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="font-black text-slate-300">Maksimal Kuota Berjalan:</span>
              <span className="font-black text-emerald-300">18 Hari Kerja</span>
            </div>
          </div>
          <p className="text-xs text-slate-450 italic mt-1 bg-emerald-950/15 p-2.5 rounded border border-emerald-500/10">
            * Catatan: Ketika mengisi Formulir Cuti, kalkulator sisa kuota akan memperbaruhi input histori secara real-time di bagian subform pencetakan, menghasilkan berkas tertulis yang valid sesuai data riil.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">4.</span> Tips Pencetakan Fisik yang Sempurna
          </h3>
          <p className="leading-relaxed text-slate-350">
            Untuk mendapatkan hasil print fisik di kertas A4 yang lurus, jernih, dan pas satu halaman penuh, pastikan Anda meninjau setting cetak berikut:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-350">
            <li>Atur ukuran kertas pencetakan menjadi <span className="font-bold text-white">A4</span>.</li>
            <li>Hilangkan centang pada <span className="font-bold text-white">"Header and Footer"</span> agar tulisan URL browser tidak ikut tercetak.</li>
            <li>Aktifkan centang pada <span className="font-bold text-white">"Background Graphics"</span> agar logo instansi dan garis tabel tercetak sempurna.</li>
            <li>Atur ukuran skala ke <span className="font-bold text-white">100%</span> atau <span className="font-bold text-white">Fit to page width</span>.</li>
          </ol>
        </section>

      </div>

      {/* Visual Indicator of Downloadable Document */}
      <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl flex items-center gap-3 text-xs text-slate-400">
        <span className="text-lg">📂</span>
        <span>
          Dengan mengklik tombol unduh di atas, Anda akan mendapatkan dokumen <strong>Buku_Panduan_Aplikasi_SICUTITA.doc</strong> yang kompatibel langsung dengan Microsoft Word, lengkap dengan tabel, kop surat, dan format resmi instansi.
        </span>
      </div>

    </div>
  );
}
