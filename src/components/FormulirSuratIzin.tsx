import React, { useState, useEffect } from 'react';
import { LeaveRequest, UserAccount } from '../types';

interface FormulirSuratIzinProps {
  onSubmit: (request: LeaveRequest) => void;
  currentUser?: UserAccount | null;
}

export const FormulirSuratIzin: React.FC<FormulirSuratIzinProps> = ({ onSubmit, currentUser }) => {
  // Setup default state
  const [formData, setFormData] = useState({
    nomorSurat: 'B. 104/PPLH.SM/PEG.12.1/02/2026',
    tanggalForm: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    
    // Memberikan Izin Kepada (Pegawai)
    nama: '',
    nip: '',
    pangkatGolongan: 'Pembina / IV.a',
    jabatan: '',
    unitKerja: 'Pusat Pengendalian Lingkungan Hidup Suma',
    bidangWilayah: '',

    // Yang Bertanda Tangan di Bawah Ini (Atasan / Pejabat)
    pemberiIzinNama: 'Arnianah Alwi, S.Si., M.Si.',
    pemberiIzinNip: '19681227 199803 2 001',
    pemberiIzinPangkat: 'Pembina Tk.1 / IV.b',
    pemberiIzinJabatan: 'Kepala Bidang Wilayah II',

    // Keperluan / Pilihan Izin
    terlambatMasuk: false,
    terlambatMasukPukul: '',
    pulangSebelum: false,
    pulangSebelumPukul: '',
    keluarKantor: false,
    keluarKantorPukul: '',
    keluarKantorKembaliPukul: '',
    tidakMasukKerja: true, // Default checked like sample PDF

    hariTanggal: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    keperluan: 'Urusan Keluarga',
    tembusan: 'Kepala PUSDAL LH Suma, Kepala Subbagian Tata Usaha'
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        nama: currentUser.nama || '',
        nip: currentUser.nip || '',
        jabatan: currentUser.jabatan || '',
        unitKerja: currentUser.unitKerja || 'Pusat Pengendalian Lingkungan Hidup Suma',
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
      nomorSurat: 'B. 089/PPLH.SM/PEG.12.1/01/2026',
      tanggalForm: '25 Februari 2026',
      nama: 'Syarifuddin, S.Sos., M.Si.',
      nip: '19720712 199803 1 002',
      pangkatGolongan: 'Pembina / IV.a',
      jabatan: 'Analis Kebijakan Ahli Madya',
      unitKerja: 'Pusat Pengendalian Lingkungan Hidup Suma',
      bidangWilayah: 'Bidwil II',
      pemberiIzinNama: 'Arnianah Alwi, S.Si., M.Si.',
      pemberiIzinNip: '19681227 199803 2 001',
      pemberiIzinPangkat: 'Pembina Tk.1 / IV.b',
      pemberiIzinJabatan: 'Kepala Bidang Wilayah II',
      terlambatMasuk: false,
      terlambatMasukPukul: '',
      pulangSebelum: false,
      pulangSebelumPukul: '',
      keluarKantor: false,
      keluarKantorPukul: '',
      keluarKantorKembaliPukul: '',
      tidakMasukKerja: true,
      hariTanggal: 'Senin, 26 Januari 2026',
      keperluan: 'Urusan Keluarga.',
      tembusan: 'Kepala PUSDAL LH Suma, Kepala Subbagian Tata Usaha'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map into standard LeaveRequest format
    const request: LeaveRequest = {
      id: 'req_' + new Date().getTime(),
      nomorSurat: formData.nomorSurat,
      tanggalForm: `Makassar, ${formData.tanggalForm}`,
      kepadaYth: 'Kepada Yth. PPLH Sulawesi dan Maluku di Tempat',
      pegawai: {
        nama: formData.nama,
        nip: formData.nip,
        jabatan: formData.jabatan,
        masaKerja: '-', // Optional for Surat Izin
        unitKerja: formData.unitKerja,
        bidangWilayah: formData.bidangWilayah,
        signatureImg: signatureDataUrl || undefined
      },
      jenisCuti: 'surat_izin',
      alasanCuti: formData.keperluan,
      lamanyaCuti: formData.tidakMasukKerja ? '1 Hari' : 'Jam Kantor',
      tanggalMulai: formData.hariTanggal,
      tanggalSelesai: formData.hariTanggal,
      // Pass the customized Surat Izin config fields as JSON inside `catatanCuti`
      catatanCuti: {
        cutiTahunan: {
          tahunN2: { sisa: '-', keterangan: '' },
          tahunN1: { sisa: '-', keterangan: '' },
          tahunN: { sisa: '-', keterangan: '' }
        },
        cutiBesar: '',
        cutiSakit: '',
        cutiMelahirkan: '',
        cutiAlasanPenting: '',
        cutiLuarNegara: '',
        // Our custom properties for the print layouter
        suratIzin: {
          pemohonPangkat: formData.pangkatGolongan,
          pemberiIzinNama: formData.pemberiIzinNama,
          pemberiIzinNip: formData.pemberiIzinNip,
          pemberiIzinPangkat: formData.pemberiIzinPangkat,
          pemberiIzinJabatan: formData.pemberiIzinJabatan,
          terlambatMasuk: formData.terlambatMasuk,
          terlambatMasukPukul: formData.terlambatMasukPukul,
          pulangSebelum: formData.pulangSebelum,
          pulangSebelumPukul: formData.pulangSebelumPukul,
          keluarKantor: formData.keluarKantor,
          keluarKantorPukul: formData.keluarKantorPukul,
          keluarKantorKembaliPukul: formData.keluarKantorKembaliPukul,
          tidakMasukKerja: formData.tidakMasukKerja,
          hariTanggal: formData.hariTanggal,
          keperluan: formData.keperluan
        }
      } as any,
      alamatSelamaCuti: 'Tembusan: ' + formData.tembusan,
      telepon: '-',
      atasan: {
        status: 'DISETUJUI',
        nama: formData.pemberiIzinNama,
        nip: formData.pemberiIzinNip,
        catatan: 'Disetujui',
        tanggal: formData.tanggalForm,
        signed: true
      },
      pejabat: {
        status: 'DISETUJUI',
        jabatan: formData.pemberiIzinJabatan,
        nama: formData.pemberiIzinNama,
        nip: formData.pemberiIzinNip,
        catatan: 'Disetujui',
        tanggal: formData.tanggalForm,
        signed: true
      },
      statusPengajuan: 'SELESAI', // Surat Izin can compile and print directly
      createdAt: new Date().toISOString()
    };

    onSubmit(request);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="formulir-surat-izin-root">
      
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />

      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-850 pb-5">
        <div>
          <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Surat Izin Form
          </span>
          <h2 className="text-lg font-bold text-white mt-1">Usulan Surat Izin Pegawai</h2>
          <p className="text-xs text-slate-400">Pengajuan surat perizinan meninggalkan kantor atau tidak masuk kerja</p>
        </div>
        
        <button
          type="button"
          onClick={autofillContoh}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-300 font-semibold border border-indigo-500/10 rounded-xl text-xs transition shrink-0 shadow-lg shadow-indigo-500/5 hover:-translate-y-0.5"
        >
          💡 Isi Contoh Sesuai PDF
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        {/* SECTION 1: METADATA SURAT */}
        <div>
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>①</span> INFORMASI DOKUMEN & TANGGAL
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850/60">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Nomor Surat Izin</label>
              <input
                type="text"
                name="nomorSurat"
                value={formData.nomorSurat}
                onChange={handleChange}
                placeholder="Misal: B. /PPLH.SM/PEG.12.1/02/2026"
                className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Tanggal Surat</label>
              <input
                type="text"
                name="tanggalForm"
                value={formData.tanggalForm}
                onChange={handleChange}
                placeholder="Misal: 25 Februari 2026"
                className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-700"
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: YANG BERTANDA TANGAN DI BAWAH INI (PEMBERI IZIN / ATASAN) */}
        <div>
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>②</span> PEMBERI IZIN (YANG BERTANDATANGAN DI BAWAH INI)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850/60">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Nama Pejabat Atasan</label>
              <input
                type="text"
                name="pemberiIzinNama"
                value={formData.pemberiIzinNama}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">NIP Pejabat Atasan</label>
              <input
                type="text"
                name="pemberiIzinNip"
                value={formData.pemberiIzinNip}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Jabatan Pejabat Atasan</label>
              <input
                type="text"
                name="pemberiIzinJabatan"
                value={formData.pemberiIzinJabatan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Pangkat / Gol. Ruang Atasan</label>
              <input
                type="text"
                name="pemberiIzinPangkat"
                value={formData.pemberiIzinPangkat}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100"
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PENERIMA IZIN (PEGAWAI) */}
        <div>
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>③</span> PENERIMA IZIN (MEMBERIKAN IZIN KEPADA)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850/60">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Nama Pegawai</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">NIP Pegawai</label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Jabatan Pegawai</label>
              <input
                type="text"
                name="jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Pangkat / Gol. Ruang Pegawai</label>
              <input
                type="text"
                name="pangkatGolongan"
                value={formData.pangkatGolongan}
                onChange={handleChange}
                placeholder="Misal: Pembina / IV.a"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Bagian / Bidang Wilayah</label>
              <select
                name="bidangWilayah"
                value={formData.bidangWilayah}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100"
                required
              >
                <option value="">-- Pilih Bagian/Bidang Wilayah --</option>
                <option value="Subbagian Tata Usaha">Subbagian Tata Usaha</option>
                <option value="Bidwil I">Bidwil I</option>
                <option value="Bidwil II">Bidwil II</option>
                <option value="Bidwil III">Bidwil III</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Unit Kerja</label>
              <input
                type="text"
                name="unitKerja"
                value={formData.unitKerja}
                disabled
                className="w-full px-4 py-2.5 bg-slate-950/20 border border-slate-900 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: UNTUK (CHECKBOX PILIHAN IZIN) */}
        <div>
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>④</span> TUJUAN SURAT IZIN (DAPAT MEMILIH LEBIH DARI SATU)
          </h3>
          <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-850/60 space-y-4">
            
            {/* option 1: Terlambat Masuk */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 border-b border-slate-850 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="terlambatMasuk"
                  checked={formData.terlambatMasuk}
                  onChange={handleChange}
                  className="h-4.5 w-4.5 text-indigo-600 rounded bg-slate-900 border-slate-800 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-200">Terlambat masuk kerja</span>
              </label>
              {formData.terlambatMasuk && (
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs text-slate-450">Pukul:</span>
                  <input
                    type="text"
                    name="terlambatMasukPukul"
                    value={formData.terlambatMasukPukul}
                    onChange={handleChange}
                    placeholder="Contoh: 09.00 WITA"
                    className="px-3 py-1 bg-slate-900 border border-slate-800 focus:border-indigo-550 rounded-lg text-xs outline-none text-slate-100"
                  />
                </div>
              )}
            </div>

            {/* option 2: Pulang Sebelum Waktunya */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 border-b border-slate-850 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="pulangSebelum"
                  checked={formData.pulangSebelum}
                  onChange={handleChange}
                  className="h-4.5 w-4.5 text-indigo-600 rounded bg-slate-900 border-slate-800 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-200">Pulang sebelum waktunya</span>
              </label>
              {formData.pulangSebelum && (
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs text-slate-450">Pukul:</span>
                  <input
                    type="text"
                    name="pulangSebelumPukul"
                    value={formData.pulangSebelumPukul}
                    onChange={handleChange}
                    placeholder="Contoh: 14.30 WITA"
                    className="px-3 py-1 bg-slate-900 border border-slate-800 focus:border-indigo-550 rounded-lg text-xs outline-none text-slate-100"
                  />
                </div>
              )}
            </div>

            {/* option 3: Keluar Kantor */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 border-b border-slate-850 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="keluarKantor"
                  checked={formData.keluarKantor}
                  onChange={handleChange}
                  className="h-4.5 w-4.5 text-indigo-600 rounded bg-slate-900 border-slate-800 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-200">Keluar kantor selama jam kerja</span>
              </label>
              {formData.keluarKantor && (
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <span className="text-xs text-slate-450">Keluar Pukul:</span>
                  <input
                    type="text"
                    name="keluarKantorPukul"
                    value={formData.keluarKantorPukul}
                    onChange={handleChange}
                    placeholder="10.00"
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 focus:border-indigo-550 rounded-lg text-xs outline-none text-slate-100 text-center"
                  />
                  <span className="text-xs text-slate-450">Kembali Pukul:</span>
                  <input
                    type="text"
                    name="keluarKantorKembaliPukul"
                    value={formData.keluarKantorKembaliPukul}
                    onChange={handleChange}
                    placeholder="13.00"
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 focus:border-indigo-550 rounded-lg text-xs outline-none text-slate-100 text-center"
                  />
                </div>
              )}
            </div>

            {/* option 4: Tidak Masuk Kerja */}
            <div className="flex items-center justify-between py-2.5 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="tidakMasukKerja"
                  checked={formData.tidakMasukKerja}
                  onChange={handleChange}
                  className="h-4.5 w-4.5 text-indigo-600 rounded bg-slate-900 border-slate-800 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-200">Tidak masuk kerja penuh</span>
              </label>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold">1 Hari</span>
            </div>

          </div>
        </div>

        {/* SECTION 5: PELAKSANAAN & KEPERLUAN */}
        <div>
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>⑤</span> JADWAL PELAKSANAAN & KEPERLUAN
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850/60">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Pada Hari, Tanggal</label>
              <input
                type="text"
                name="hariTanggal"
                value={formData.hariTanggal}
                onChange={handleChange}
                placeholder="Misal: Selasa, 26 Januari 2026"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100 placeholder-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Untuk Keperluan / Urusan</label>
              <input
                type="text"
                name="keperluan"
                value={formData.keperluan}
                onChange={handleChange}
                placeholder="Misal: Urusan Keluarga dll."
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase text-slate-450 mb-2">Tembusan Dokumen</label>
              <input
                type="text"
                name="tembusan"
                value={formData.tembusan}
                onChange={handleChange}
                placeholder="Pisahkan dengan tanda koma ( , )"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 rounded-xl text-sm transition outline-none text-slate-100 text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: TANDA TANGAN PEMOHON */}
        <div>
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>⑥</span> TANDA TANGAN PEMOHON
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 items-start">
            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Bubuhkan tanda tangan fisik basah Anda di bawah ini. Tanda tangan ini secara otomatis akan disimpan ke database profil dan tertera di lembar cetak surat izin Anda secara real-time.
              </p>
              
              {/* Tabs */}
              <div className="flex space-x-1 p-0.5 bg-slate-950 border border-slate-850 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setSignType('saved')}
                  className={`flex-1 py-1.5 text-center rounded-md transition font-medium ${
                    signType === 'saved' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tersimpan di Akun
                </button>
                <button
                  type="button"
                  onClick={() => setSignType('draw')}
                  className={`flex-1 py-1.5 text-center rounded-md transition font-medium ${
                    signType === 'draw' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Gambar Baru
                </button>
                <button
                  type="button"
                  onClick={() => setSignType('upload')}
                  className={`flex-1 py-1.5 text-center rounded-md transition font-medium ${
                    signType === 'upload' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Unggah Gambar
                </button>
              </div>
            </div>

            <div className="border border-slate-850 bg-slate-950/20 rounded-xl p-4 flex flex-col justify-between min-h-[160px]">
              {signType === 'saved' && (
                <div className="border border-dashed border-slate-800 bg-slate-950/20 p-4 rounded-xl flex flex-col items-center justify-center flex-1 min-h-[100px] text-center">
                  {signatureDataUrl ? (
                    <div className="bg-white/95 p-2 rounded-lg border border-slate-705">
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
                  <div className="border border-dashed border-slate-800 bg-slate-950/40 p-4 rounded-xl min-h-[100px] flex flex-col items-center justify-center relative hover:bg-slate-950/70 transition group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {signatureDataUrl && signType === 'upload' ? (
                      <div className="z-10 bg-white/95 p-2 rounded border border-slate-705">
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

        {/* SUBMISSION BUTTON */}
        <div className="pt-4 border-t border-slate-850 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/10 hover:-translate-y-0.5 flex items-center gap-2"
          >
            📋 Kirim Dokumen & Perbarui Layout PDF
          </button>
        </div>

      </form>
    </div>
  );
};
