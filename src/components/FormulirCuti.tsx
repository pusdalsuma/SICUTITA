import React, { useState, useEffect } from 'react';
import { LeaveRequest, UserAccount } from '../types';

interface FormulirCutiProps {
  onSubmit: (request: LeaveRequest) => void;
  currentUser?: UserAccount | null;
}

export const FormulirCuti: React.FC<FormulirCutiProps> = ({ onSubmit, currentUser }) => {
  // Setup default state
  const [formData, setFormData] = useState({
    nomorSurat: 'Sc. /PPLH.MS/TU/SET.3.1/B/01/2025',
    tanggalForm: 'Makassar, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    kepadaYth: 'Kepada Yth. PPLH Sulawesi dan Maluku di Tempat',
    nama: '',
    nip: '',
    jabatan: '',
    masaKerja: '',
    unitKerja: 'Pusat Pengendalian Lingkungan Hidup Suma',
    bidangWilayah: '',
    jenisCuti: 'cuti_tahunan',
    alasanCuti: '',
    lamanyaCuti: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    // Catatan Cuti Block
    tahunN2Sisa: '-',
    tahunN2Ket: '',
    tahunN1Sisa: '-',
    tahunN1Ket: 'CUTI 2024+2025 = 12 Hari',
    tahunNSisa: '12',
    tahunNKet: 'diambil = 3 Hari, Sisa Cuti = 9 Hari',
    cutiBesar: '',
    cutiSakit: '',
    cutiMelahirkan: '',
    cutiAlasanPenting: '',
    cutiLuarNegara: '',
    alamatSelamaCuti: '',
    telepon: ''
  });

  const [ambilCutiTahunLalu, setAmbilCutiTahunLalu] = useState<boolean>(true);
  const [durasiDiajukan, setDurasiDiajukan] = useState<number>(3);

  const recalculateLeave = (isTakingPrevLeave: boolean, durationThisYear: number) => {
    const totalHakNyata = isTakingPrevLeave ? 12 : 18;
    const sisaNyata = Math.max(0, totalHakNyata - durationThisYear);
    
    setFormData((prev) => ({
      ...prev,
      tahunN1Sisa: isTakingPrevLeave ? '-' : '12',
      tahunN1Ket: isTakingPrevLeave 
        ? 'CUTI 2024 = Diambil (Hak standard N-1)' 
        : 'CUTI 2024 = 12 Hari (Tidak Diambil, +6 Tambahan di 2025)',
      tahunNSisa: sisaNyata.toString(),
      tahunNKet: isTakingPrevLeave
        ? `diambil = ${durationThisYear} Hari, Sisa Cuti = ${sisaNyata} Hari`
        : `diambil = ${durationThisYear} Hari, Sisa Cuti (12+6) = ${sisaNyata} Hari`
    }));
  };

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        nama: currentUser.nama || '',
        nip: currentUser.nip || '',
        jabatan: currentUser.jabatan || '',
        unitKerja: currentUser.unitKerja || 'Pusat Pengendalian Lingkungan Hidup Suma',
        masaKerja: currentUser.masaKerja || '',
        bidangWilayah: currentUser.bidangWilayah || ''
      }));
    }
  }, [currentUser]);

  const [signType, setSignType] = useState<'saved' | 'draw' | 'upload'>('saved');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Sync state signature on mount/change
  useEffect(() => {
    if (currentUser?.signatureImg) {
      setSignatureDataUrl(currentUser.signatureImg);
      setSignType('saved');
    } else {
      const savedSig = localStorage.getItem('saved_signature_' + (currentUser?.nip || ''));
      if (savedSig) {
        setSignatureDataUrl(savedSig);
        setSignType('saved');
      } else {
        setSignatureDataUrl('');
        setSignType('draw');
      }
    }
  }, [currentUser]);

  // Touch/Mouse draw support
  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#059669'; // emerald-600
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pos = getEventPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getEventPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasImage();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
    if (currentUser?.nip) {
      localStorage.removeItem('saved_signature_' + currentUser.nip);
    }
  };

  const saveCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
    if (currentUser?.nip) {
      localStorage.setItem('saved_signature_' + currentUser.nip, dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSignatureDataUrl(reader.result);
        if (currentUser?.nip) {
          localStorage.setItem('saved_signature_' + currentUser.nip, reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const autofillContoh = () => {
    setFormData({
      nomorSurat: 'Sc. /PPLH.MS/TU/SET.3.1/B/01/2025',
      tanggalForm: 'Makassar, 23 Januari 2025',
      kepadaYth: 'Kepada Yth. PPLH Sulawesi dan Maluku di Tempat',
      nama: 'Stiawati Rahayu, S.E., M.Si',
      nip: '19731123 199803 2 001',
      jabatan: 'Pedal Madya',
      masaKerja: '26 Tahun 10 Bulan',
      unitKerja: 'Pusat Pengendalian Lingkungan Hidup Suma',
      bidangWilayah: 'Subbagian Tata Usaha',
      jenisCuti: 'cuti_tahunan',
      alasanCuti: 'Acara Keluarga',
      lamanyaCuti: '3 Hari (Kamis-Jum’at dan Senin)',
      tanggalMulai: '30,31 Januari dan 3 Februari',
      tanggalSelesai: '30,31 Januari - 3 Februari 2025',
      tahunN2Sisa: '-',
      tahunN2Ket: '',
      tahunN1Sisa: '-',
      tahunN1Ket: 'CUTI 2024+2025 = 12 Hari',
      tahunNSisa: '12',
      tahunNKet: 'diambil = 3 Hari, Sisa Cuti = 9 Hari',
      cutiBesar: '',
      cutiSakit: '',
      cutiMelahirkan: '',
      cutiAlasanPenting: '',
      cutiLuarNegara: '',
      alamatSelamaCuti: 'Jakarta',
      telepon: '082153151117'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-detect number of days from lamanyaCuti
    if (name === 'lamanyaCuti') {
      const match = value.match(/\d+/);
      if (match) {
        const parsedDays = parseInt(match[0]);
        if (!isNaN(parsedDays)) {
          setDurasiDiajukan(parsedDays);
          recalculateLeave(ambilCutiTahunLalu, parsedDays);
        }
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const request: LeaveRequest = {
      id: 'req_' + new Date().getTime(),
      nomorSurat: formData.nomorSurat,
      tanggalForm: formData.tanggalForm,
      kepadaYth: formData.kepadaYth,
      pegawai: {
        nama: formData.nama,
        nip: formData.nip,
        jabatan: formData.jabatan,
        masaKerja: formData.masaKerja,
        unitKerja: formData.unitKerja,
        bidangWilayah: formData.bidangWilayah,
        signatureImg: signatureDataUrl || undefined
      },
      jenisCuti: formData.jenisCuti as any,
      alasanCuti: formData.alasanCuti,
      lamanyaCuti: formData.lamanyaCuti,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai: formData.tanggalSelesai,
      catatanCuti: {
        cutiTahunan: {
          tahunN2: { sisa: formData.tahunN2Sisa, keterangan: formData.tahunN2Ket },
          tahunN1: { sisa: formData.tahunN1Sisa, keterangan: formData.tahunN1Ket },
          tahunN: { sisa: formData.tahunNSisa, keterangan: formData.tahunNKet }
        },
        cutiBesar: formData.cutiBesar,
        cutiSakit: formData.cutiSakit,
        cutiMelahirkan: formData.cutiMelahirkan,
        cutiAlasanPenting: formData.cutiAlasanPenting,
        cutiLuarNegara: formData.cutiLuarNegara
      },
      alamatSelamaCuti: formData.alamatSelamaCuti,
      telepon: formData.telepon,
      atasan: {
        status: '',
        nama: 'Arnianah Alwi. S.Si., M.Si', // Default preset
        nip: '19681227 199803 2 001',
        catatan: '',
        signed: false
      },
      pejabat: {
        status: '',
        jabatan: 'Kepala Pusat',
        nama: 'Dr. Azri Rasul, S.K.M., M.Si., M.H', // Default preset
        nip: '19710516 199803 1 001',
        catatan: '',
        signed: false
      },
      statusPengajuan: 'DIAJUKAN',
      createdAt: new Date().toISOString()
    };

    onSubmit(request);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:p-8 shadow-xl text-slate-100">
      
      {/* Form Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            Kirim Pengajuan Cuti Baru
          </h2>
          <p className="text-xs text-slate-400 mt-1">Lengkapi data di bawah ini untuk mengunduh dan mencetak formulir cuti resmi.</p>
        </div>
        <button
          type="button"
          onClick={autofillContoh}
          className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 active:bg-emerald-600/30 text-emerald-400 font-semibold text-xs rounded-xl border border-emerald-500/20 transition self-start sm:self-auto flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Gunakan Contoh Data PDF (Stiawati)
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="mt-8 space-y-8">
        
        {/* Administrasi Surat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-405 tracking-wider mb-2">Nomor Surat</label>
            <input
              type="text"
              name="nomorSurat"
              value={formData.nomorSurat}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-550 focus:ring-1 focus:ring-emerald-555 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-405 tracking-wider mb-2">Tanggal & Tempat Surat</label>
            <input
              type="text"
              name="tanggalForm"
              value={formData.tanggalForm}
              onChange={handleChange}
              placeholder="Contoh: Makassar, 23 Januari 2025"
              className="w-full px-4 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-550 focus:ring-1 focus:ring-emerald-555 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-405 tracking-wider mb-2">Tujuan (Kepada Yth)</label>
            <input
              type="text"
              name="kepadaYth"
              value={formData.kepadaYth}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-550 focus:ring-1 focus:ring-emerald-555 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
              required
            />
          </div>
        </div>

        {/* I. DATA PEGAWAI */}
        <div>
          <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-3 uppercase tracking-wider mb-4">I. Data Pegawai</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="misal: Stiawati Rahayu, S.E., M.Si"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">NIP Pegawai</label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                placeholder="misal: 19731123 199803 2 001"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Jabatan</label>
              <input
                type="text"
                name="jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                placeholder="misal: Pedal Madya"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Masa Kerja</label>
              <input
                type="text"
                name="masaKerja"
                value={formData.masaKerja}
                onChange={handleChange}
                placeholder="misal: 26 Tahun 10 Bulan"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Unit Kerja</label>
              <input
                type="text"
                name="unitKerja"
                value={formData.unitKerja}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Bagian/Bidang Wilayah</label>
              <select
                name="bidangWilayah"
                value={formData.bidangWilayah}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              >
                <option value="">-- Pilih Bagian/Bidang Wilayah --</option>
                <option value="Subbagian Tata Usaha">Subbagian Tata Usaha</option>
                <option value="Bidwil I">Bidwil I</option>
                <option value="Bidwil II">Bidwil II</option>
                <option value="Bidwil III">Bidwil III</option>
              </select>
            </div>
          </div>
        </div>

        {/* II. JENIS CUTI & III. ALASAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-3 uppercase tracking-wider mb-4">II. Jenis Cuti Yang Diambil</h3>
            <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl h-[260px] overflow-y-auto space-y-3">
              {[
                { value: 'cuti_tahunan', label: '1. Cuti Tahunan' },
                { value: 'cuti_besar', label: '2. Cuti Besar' },
                { value: 'cuti_sakit', label: '3. Cuti Sakit' },
                { value: 'cuti_melahirkan', label: '4. Cuti Melahirkan' },
                { value: 'cuti_penting', label: '5. Cuti Karena Alasan Penting' },
                { value: 'cuti_luar_negara', label: '6. Cuti di Luar Tanggungan Negara' },
                { value: 'surat_izin', label: '7. Surat Izin' }
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center space-x-3 p-3 rounded-xl border transition cursor-pointer ${
                    formData.jenisCuti === opt.value
                      ? 'bg-emerald-550/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950/20 border-slate-850 hover:bg-slate-800/35 text-slate-350'
                  }`}
                >
                  <input
                    type="radio"
                    name="jenisCuti"
                    value={opt.value}
                    checked={formData.jenisCuti === opt.value}
                    onChange={handleChange}
                    className="h-4 w-4 text-emerald-600 border-slate-800 bg-slate-900 focus:ring-0"
                  />
                  <span className="text-xs font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-3 uppercase tracking-wider mb-4">III. Alasan Cuti</h3>
            <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl h-[260px] flex flex-col">
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Detail Keperluan Cuti</label>
              <textarea
                name="alasanCuti"
                value={formData.alasanCuti}
                onChange={handleChange}
                placeholder="misal: Acara Pernikahan Adik Kandung / Acara Keluarga di Luar Kota"
                className="w-full flex-grow px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600 resize-none"
                required
              />
            </div>
          </div>

        </div>

        {/* IV. LAMANYA CUTI */}
        <div>
          <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-3 uppercase tracking-wider mb-4">IV. Lamanya Cuti</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Durasi (Hari / Detail)</label>
              <input
                type="text"
                name="lamanyaCuti"
                value={formData.lamanyaCuti}
                onChange={handleChange}
                placeholder="misal: 3 Hari (Kamis-Jum’at dan Senin)"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Mulai Tanggal</label>
              <input
                type="text"
                name="tanggalMulai"
                value={formData.tanggalMulai}
                onChange={handleChange}
                placeholder="misal: 30,31 Januari dan 3 Februari"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Sampai Dengan (s/d)</label>
              <input
                type="text"
                name="tanggalSelesai"
                value={formData.tanggalSelesai}
                onChange={handleChange}
                placeholder="misal: 30,31 Januari - 3 Februari 2025"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              />
            </div>
          </div>
        </div>

        {/* V. CATATAN CUTI */}
        <div>
          <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-3 uppercase tracking-wider mb-4">V. Catatan Cuti (Historis/Sisa Cuti)</h3>
          <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl space-y-6">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 leading-relaxed">
              <strong>💡 Keterangan Kepegawaian:</strong> Kolom ini secara resmi diisi oleh pejabat pengelola administrasi kepegawaian. Anda dapat menyesuaikannya agar sisa kuota cuti tercetak secara otomatis dan presisi di lembar formulir.
            </div>

            {/* Kalkulator Saldo Cuti */}
            <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-emerald-400">🧮 Kalkulator Sisa Cuti - Aturan 12+6 Hari</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-[10px] text-emerald-300 rounded-full font-bold uppercase tracking-wider">Aturan Resmi</span>
                </div>
                <div className="text-[11px] text-slate-450">
                  Maksimal Cuti Standard: <span className="font-bold text-white">12 Hari</span>
                </div>
              </div>
              
              <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                <p>
                  Sesuai kebijakan: Maksimal cuti dalam setahun adalah <strong>12 hari kerja</strong>. Namun, 
                  jika Anda <strong>tidak mengambil cuti tahun lalu (N-1)</strong>, jatah cuti Anda tahun berjalan 
                  menjadi bertambah 6 hari kerja, menjadikannya berkisar hingga <strong>18 hari kerja</strong> di tahun berjalan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350">
                    Apakah Anda mengambil cuti tahun lalu (N-1)?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAmbilCutiTahunLalu(false);
                        recalculateLeave(false, durasiDiajukan);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-300 text-center ${
                        !ambilCutiTahunLalu
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/15'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                      }`}
                    >
                      Tidak Mengambil Cuti<br />
                      <span className="text-[9px] font-normal opacity-90">(Dapat Bonus +6 Hari)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAmbilCutiTahunLalu(true);
                        recalculateLeave(true, durasiDiajukan);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-300 text-center ${
                        ambilCutiTahunLalu
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/15'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                      }`}
                    >
                      Ya, Mengambil Cuti<br />
                      <span className="text-[9px] font-normal opacity-90">(Jatah Standard 12 Hari)</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350">
                    Jumlah hari cuti yang diambil saat ini:
                  </label>
                  <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-850 p-2 rounded-xl">
                    <input
                      type="number"
                      min="0"
                      max={ambilCutiTahunLalu ? 12 : 18}
                      value={durasiDiajukan}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setDurasiDiajukan(val);
                        recalculateLeave(ambilCutiTahunLalu, val);
                      }}
                      className="w-20 text-center py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm font-black text-white"
                    />
                    <div className="text-xs text-slate-450">
                      <div>Hari Kerja</div>
                      <div className="text-[10px] text-slate-500 italic mt-0.5">(Tersinkron otomatis dari durasi cuti)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Ringkasan Perhitungan */}
              <div className="bg-slate-900/30 rounded-xl p-4 text-[11px] flex flex-col space-y-2 text-slate-350 border border-slate-850/60 font-medium">
                <div className="flex justify-between items-center font-sans">
                  <span>Jatah Dasar Cuti Tahunan (Tahun N):</span>
                  <span className="font-bold text-slate-100">12 Hari Kerja</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hak Tambahan Penangguhan (Tahun N-1):</span>
                  <span className={`font-bold ${!ambilCutiTahunLalu ? 'text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded' : 'text-slate-500'}`}>
                    {!ambilCutiTahunLalu ? '+6 Hari Kerja' : '0 Hari'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 font-bold text-slate-200">
                  <span>Total Jatah Cuti Berjalan (Tahun N):</span>
                  <span className="text-sm text-emerald-300">{ambilCutiTahunLalu ? 12 : 18} Hari Kerja</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Diambil dalam permohonan ini:</span>
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded">{durasiDiajukan} Hari Kerja</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-slate-800/80 pt-2 text-emerald-400 font-bold">
                  <span>Sisa Saldo Cuti Berjalan setelah diambil (N):</span>
                  <span className="text-base font-black bg-emerald-550/10 border border-emerald-500/20 px-3 py-1 rounded text-emerald-300">
                    {Math.max(0, (ambilCutiTahunLalu ? 12 : 18) - durasiDiajukan)} Hari Kerja
                  </span>
                </div>
              </div>
            </div>

            {/* Cuti Tahunan Grid Sub-form */}
            <div className="border border-slate-800/65 rounded-xl overflow-hidden p-5 space-y-4">
              <span className="text-xs font-bold text-emerald-400 block border-b border-slate-800/80 pb-2">1. Detail Sisa Cuti Tahunan (Historis 3 Tahun)</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Tahun N-2 (Lalu) */}
                <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850/80 space-y-3 flex flex-col justify-between">
                  <div className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider border-b border-slate-900 pb-1.5">
                    🗓️ Tahun N-2 (Lalu)
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">Sisa Cuti (Hari):</span>
                      <input
                        type="text"
                        name="tahunN2Sisa"
                        value={formData.tahunN2Sisa}
                        onChange={handleChange}
                        placeholder="Sisa"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs font-semibold text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">Keterangan Penangguhan N-2:</span>
                      <input
                        type="text"
                        name="tahunN2Ket"
                        value={formData.tahunN2Ket}
                        onChange={handleChange}
                        placeholder="Keterangan..."
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs text-slate-100 placeholder-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Tahun N-1 (Sebelumnya) */}
                <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850/80 space-y-3 flex flex-col justify-between">
                  <div className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider border-b border-slate-900 pb-1.5">
                    🗓️ Tahun N-1 (Sebelumnya)
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">Sisa Cuti (Hari):</span>
                      <input
                        type="text"
                        name="tahunN1Sisa"
                        value={formData.tahunN1Sisa}
                        onChange={handleChange}
                        placeholder="Sisa"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs font-semibold text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">Keterangan Penangguhan N-1:</span>
                      <input
                        type="text"
                        name="tahunN1Ket"
                        value={formData.tahunN1Ket}
                        onChange={handleChange}
                        placeholder="Keterangan..."
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs text-slate-100 placeholder-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Tahun N (Berjalan) */}
                <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850/80 space-y-3 flex flex-col justify-between">
                  <div className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider border-b border-slate-900 pb-1.5">
                    🗓️ Tahun N (Berjalan)
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">Sisa Cuti (Hari):</span>
                      <input
                        type="text"
                        name="tahunNSisa"
                        value={formData.tahunNSisa}
                        onChange={handleChange}
                        placeholder="Sisa"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs font-semibold text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">Keterangan Penangguhan N:</span>
                      <input
                        type="text"
                        name="tahunNKet"
                        value={formData.tahunNKet}
                        onChange={handleChange}
                        placeholder="Keterangan..."
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs text-slate-100 placeholder-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Leave category counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border border-slate-800/65 rounded-xl p-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase text-slate-450">2. Cuti Besar (Hari/Ket)</label>
                <input type="text" name="cutiBesar" value={formData.cutiBesar} onChange={handleChange} placeholder="misal: -" className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-555 rounded-lg text-xs" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase text-slate-450">3. Cuti Sakit (Hari/Ket)</label>
                <input type="text" name="cutiSakit" value={formData.cutiSakit} onChange={handleChange} placeholder="misal: -" className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-555 rounded-lg text-xs" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase text-slate-450">4. Cuti Melahirkan (Hari/Ket)</label>
                <input type="text" name="cutiMelahirkan" value={formData.cutiMelahirkan} onChange={handleChange} placeholder="misal: -" className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-555 rounded-lg text-xs" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase text-slate-450">5. Cuti Alasan Penting</label>
                <input type="text" name="cutiAlasanPenting" value={formData.cutiAlasanPenting} onChange={handleChange} placeholder="misal: -" className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-555 rounded-lg text-xs" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase text-slate-450">6. Cuti di Luar Negara</label>
                <input type="text" name="cutiLuarNegara" value={formData.cutiLuarNegara} onChange={handleChange} placeholder="misal: -" className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-555 rounded-lg text-xs" />
              </div>
            </div>

          </div>
        </div>

        {/* VI. ALAMAT SELAMA MENJALANKAN CUTI */}
        <div>
          <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-3 uppercase tracking-wider mb-4">VI. Kontak Selama Menjalankan Cuti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Alamat Tujuan Cuti</label>
              <input
                type="text"
                name="alamatSelamaCuti"
                value={formData.alamatSelamaCuti}
                onChange={handleChange}
                placeholder="misal: Jakarta"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">No. Telp / WhatsApp Aktif</label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                placeholder="misal: 082153151117"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-600"
                required
              />
            </div>
          </div>
        </div>

        {/* VII. TANDA TANGAN PEMOHON */}
        <div>
          <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-3 uppercase tracking-wider mb-4">VII. Tanda Tangan Pemohon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl items-start">
            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Bubuhkan tanda tangan fisik basah Anda di bawah ini. Tanda tangan ini secara otomatis akan disimpan ke database profil dan tertera di lembar cetak formulir cuti Anda secara real-time.
              </p>
              
              {/* Tabs */}
              <div className="flex space-x-1 p-0.5 bg-slate-950 border border-slate-850 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setSignType('saved')}
                  className={`flex-1 py-1.5 text-center rounded-md transition font-medium ${
                    signType === 'saved' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tersimpan di Akun
                </button>
                <button
                  type="button"
                  onClick={() => setSignType('draw')}
                  className={`flex-1 py-1.5 text-center rounded-md transition font-medium ${
                    signType === 'draw' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Gambar Baru
                </button>
                <button
                  type="button"
                  onClick={() => setSignType('upload')}
                  className={`flex-1 py-1.5 text-center rounded-md transition font-medium ${
                    signType === 'upload' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Unggah Gambar
                </button>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-950/40 rounded-xl p-4 flex flex-col justify-between min-h-[160px]">
              {signType === 'saved' && (
                <div className="border border-dashed border-slate-800 bg-slate-950/20 p-4 rounded-xl flex flex-col items-center justify-center flex-1 min-h-[100px] text-center">
                  {signatureDataUrl ? (
                    <div className="bg-white/95 p-2 rounded-lg border border-slate-700">
                      <img src={signatureDataUrl} className="h-16 max-w-[220px] object-contain mix-blend-multiply" alt="Tanda tangan pemohon tersimpan" />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Belum ada tanda tangan tersimpan. Silakan pilih tab "Gambar Baru" atau "Unggah Gambar" untuk menambahkan.</p>
                  )}
                </div>
              )}

              {signType === 'draw' && (
                <div className="flex flex-col space-y-2 flex-1">
                  <div className="relative border border-dashed border-slate-800 bg-white rounded-xl overflow-hidden h-28 cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={112}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="absolute inset-0 w-full h-full"
                    />
                    {!signatureDataUrl && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
                        Coret s/d Gambar di sini
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="px-2.5 py-1 bg-red-650/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 text-[10px] font-bold rounded transition uppercase tracking-wider"
                    >
                      Hapus Coretan
                    </button>
                  </div>
                </div>
              )}

              {signType === 'upload' && (
                <div className="flex flex-col space-y-2 flex-1 justify-center">
                  <div className="border border-dashed border-slate-850 bg-slate-950/40 p-4 rounded-xl min-h-[100px] flex flex-col items-center justify-center relative hover:bg-slate-950/70 transition group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {signatureDataUrl && signType === 'upload' ? (
                      <div className="z-10 bg-white/95 p-2 rounded border border-slate-700">
                        <img src={signatureDataUrl} className="h-14 max-w-[200px] object-contain mix-blend-multiply" alt="Tanda tangan diupload" />
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 pointer-events-none">
                        <span className="text-xl block mb-1">📂</span>
                        <p className="text-xs font-semibold text-slate-400">Pilih berkas tanda tangan Anda</p>
                        <p className="text-[10px] text-slate-600">Mendukung format PNG / JPG</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setFormData({
              nomorSurat: 'Sc. /PPLH.MS/TU/SET.3.1/B/01/2025',
              tanggalForm: 'Makassar, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
              kepadaYth: 'Kepada Yth. PPLH Sulawesi dan Maluku di Tempat',
              nama: '',
              nip: '',
              jabatan: '',
              masaKerja: '',
              unitKerja: 'Pusat Pengendalian Lingkungan Hidup Suma',
              bidangWilayah: '',
              jenisCuti: 'cuti_tahunan',
              alasanCuti: '',
              lamanyaCuti: '',
              tanggalMulai: '',
              tanggalSelesai: '',
              tahunN2Sisa: '-',
              tahunN2Ket: '',
              tahunN1Sisa: '-',
              tahunN1Ket: 'CUTI 2024+2025 = 12 Hari',
              tahunNSisa: '12',
              tahunNKet: 'diambil = 3 Hari, Sisa Cuti = 9 Hari',
              cutiBesar: '',
              cutiSakit: '',
              cutiMelahirkan: '',
              cutiAlasanPenting: '',
              cutiLuarNegara: '',
              alamatSelamaCuti: '',
              telepon: ''
            })}
            className="px-5 py-2.5 border border-slate-800 hover:bg-slate-800 active:bg-slate-755 text-slate-400 font-semibold text-xs rounded-xl transition"
          >
            Kosongkan Form
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-750 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-500/10"
          >
            Kirim Pengajuan Cuti
          </button>
        </div>

      </form>
    </div>
  );
};
