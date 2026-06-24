import React, { useState } from 'react';
import { LeaveRequest, UserAccount } from '../types';

interface ReviewCutiProps {
  requests: LeaveRequest[];
  onApprove: (id: string, role: 'atasan' | 'pejabat', status: string, name: string, nip: string, notes: string, signatureImg?: string) => void;
  onDelete: (id: string) => void;
  onSelectRequest: (request: LeaveRequest) => void;
  currentUser?: UserAccount | null;
}

export const ReviewCuti: React.FC<ReviewCutiProps> = ({ requests, onApprove, onDelete, onSelectRequest, currentUser }) => {
  const [selectedReqId, setSelectedReqId] = useState<string>(requests[0]?.id || '');
  const [role, setRole] = useState<'atasan' | 'pejabat'>('atasan');
  const [status, setStatus] = useState<'DISETUJUI' | 'PERUBAHAN' | 'DITANGGUHKAN' | 'TIDAK DISETUJUI'>('DISETUJUI');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerNip, setReviewerNip] = useState('');
  const [notes, setNotes] = useState('');

  const [signType, setSignType] = useState<'saved' | 'draw' | 'upload'>('saved');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Sync profile signature on mount or change
  React.useEffect(() => {
    if (currentUser?.signatureImg) {
      setSignatureDataUrl(currentUser.signatureImg);
      setSignType('saved');
    } else {
      const savedSig = localStorage.getItem('saved_signature_' + reviewerNip);
      if (savedSig) {
        setSignatureDataUrl(savedSig);
        setSignType('saved');
      } else {
        setSignatureDataUrl('');
        setSignType('draw');
      }
    }
  }, [currentUser, reviewerNip]);

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
    if (reviewerNip) {
      localStorage.removeItem('saved_signature_' + reviewerNip);
    }
  };

  const saveCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
    if (reviewerNip) {
      localStorage.setItem('saved_signature_' + reviewerNip, dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSignatureDataUrl(reader.result);
        if (reviewerNip) {
          localStorage.setItem('saved_signature_' + reviewerNip, reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const activeRequest = requests.find((r) => r.id === selectedReqId);

  // Lock role based on logged in user's role
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'atasan') {
        setRole('atasan');
      } else if (currentUser.role === 'pejabat') {
        setRole('pejabat');
      }
    }
  }, [currentUser]);

  // Sync reviewer details when role or active request changes
  React.useEffect(() => {
    if (activeRequest) {
      if (role === 'atasan') {
        const defaultName = currentUser?.role === 'atasan' ? currentUser.nama : (activeRequest.atasan.nama || 'Arnianah Alwi. S.Si., M.Si');
        const defaultNip = currentUser?.role === 'atasan' ? currentUser.nip : (activeRequest.atasan.nip || '19681227 199803 2 001');
        setReviewerName(defaultName);
        setReviewerNip(defaultNip);
        setStatus((activeRequest.atasan.status as any) || 'DISETUJUI');
        setNotes(activeRequest.atasan.catatan || '');
      } else {
        const defaultName = currentUser?.role === 'pejabat' ? currentUser.nama : (activeRequest.pejabat.nama || 'Dr. Azri Rasul, S.K.M., M.Si., M.H');
        const defaultNip = currentUser?.role === 'pejabat' ? currentUser.nip : (activeRequest.pejabat.nip || '19710516 199803 1 001');
        setReviewerName(defaultName);
        setReviewerNip(defaultNip);
        setStatus((activeRequest.pejabat.status as any) || 'DISETUJUI');
        setNotes(activeRequest.pejabat.catatan || '');
      }
    }
  }, [role, selectedReqId, activeRequest, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Approve form submitted');
    if (!selectedReqId) return;
    onApprove(selectedReqId, role, status, reviewerName, reviewerNip, notes, signatureDataUrl);
  };

  if (requests.length === 0) {
    return (
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-8 text-center text-slate-400">
        <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-sm font-semibold text-slate-300">Belum Ada Pengajuan Masuk</p>
        <p className="text-xs mt-1 text-slate-500">Silakan ajukan permohonan baru pada formulir pegawai.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Column 1: Selector List */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 h-fit lg:max-h-[600px] overflow-y-auto space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">📂 Daftar Masuk Pengajuan Cuti</h3>
        <div className="space-y-2">
          {requests.map((req) => (
            <div
              key={req.id}
              onClick={() => {
                setSelectedReqId(req.id);
                onSelectRequest(req);
              }}
              className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col cursor-pointer ${
                selectedReqId === req.id
                  ? 'bg-emerald-550/10 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-950/20 border-slate-850 hover:bg-slate-800/30 text-slate-350'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-semibold text-white max-w-[150px] truncate">{req.pegawai.nama}</span>
                <div className="flex items-center gap-2">
                  {currentUser?.role === 'admin' && (
                    <button
                      type="button"
                      id={`delete-btn-${req.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete button clicked for:', req.id);
                        onDelete(req.id);
                      }}
                      className="text-[10px] bg-red-900/40 text-red-400 hover:bg-red-800/60 px-2 py-0.5 rounded-full font-bold uppercase transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    req.statusPengajuan === 'SELESAI'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : req.statusPengajuan === 'DISETUJUI_ATASAN'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {req.statusPengajuan === 'SELESAI'
                      ? 'Selesai Pejabat'
                      : req.statusPengajuan === 'DISETUJUI_ATASAN'
                      ? 'Disetujui Atasan'
                      : 'Menunggu Atasan'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-450">{req.pegawai.jabatan}</span>
              <span className="text-[10px] text-slate-500 mt-2 font-mono">{req.lamanyaCuti} ({req.alasanCuti})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2 & 3: Review Desk Form */}
      <div className="lg:col-span-2 bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
        {activeRequest ? (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800 gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Meja Tindak Lanjut & Persetujuan</h3>
                <p className="text-xs text-slate-400">Tandatangani berkas untuk pemohon: <strong>{activeRequest.pegawai.nama}</strong></p>
              </div>
              <button
                onClick={() => onSelectRequest(activeRequest)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-200 text-xs rounded-lg transition flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Lihat Lembar Formulir
              </button>
            </div>

            {/* Role Tab Selector */}
            <div className="flex space-x-1.5 p-1 bg-slate-950/40 rounded-xl max-w-md border border-slate-800 mb-6 text-xs">
              <button
                type="button"
                onClick={() => setRole('atasan')}
                className={`flex-1 py-2 text-center rounded-lg font-semibold transition ${
                  role === 'atasan'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Atasan Langsung
              </button>
              <button
                type="button"
                onClick={() => setRole('pejabat')}
                className={`flex-1 py-2 text-center rounded-lg font-semibold transition ${
                  role === 'pejabat'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Pejabat Berwenang
              </button>
            </div>

            {/* Rincian Permohonan Cuti Pegawai */}
            <div className="bg-slate-950/30 border border-slate-850/60 p-5 rounded-2xl mb-6 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-500/20 pb-2.5 flex items-center gap-2">
                📂 RINCIAN PERMOHONAN CUTI PEGAWAI
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] text-slate-300">
                <div className="space-y-2 bg-slate-900/20 p-3.5 rounded-xl border border-slate-850/40">
                  <p><span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wide">Nama Pegawai</span> <strong className="text-white text-sm">{activeRequest.pegawai.nama}</strong></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wide">NIP Pegawai</span> <span className="font-mono text-slate-200">{activeRequest.pegawai.nip}</span></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wide">Jabatan & Unit Kerja</span> <span className="text-slate-350">{activeRequest.pegawai.jabatan} — {activeRequest.pegawai.unitKerja}{activeRequest.pegawai.bidangWilayah ? ` (${activeRequest.pegawai.bidangWilayah})` : ''}</span></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wide">Masa Kerja</span> <span className="text-slate-350">{activeRequest.pegawai.masaKerja}</span></p>
                </div>
                <div className="space-y-2 bg-slate-900/20 p-3.5 rounded-xl border border-slate-850/40">
                  <p><span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wide">Jenis Cuti / Permohonan</span> <strong className="text-emerald-400 text-sm">
                    {activeRequest.jenisCuti === 'cuti_tahunan' ? 'Cuti Tahunan' :
                     activeRequest.jenisCuti === 'cuti_besar' ? 'Cuti Besar' :
                     activeRequest.jenisCuti === 'cuti_sakit' ? 'Cuti Sakit' :
                     activeRequest.jenisCuti === 'cuti_melahirkan' ? 'Cuti Melahirkan' :
                     activeRequest.jenisCuti === 'cuti_penting' ? 'Cuti Karena Alasan Penting' :
                     activeRequest.jenisCuti === 'cuti_luar_negara' ? 'Cuti Di Luar Tanggungan Negara' : 
                     activeRequest.jenisCuti === 'surat_izin' ? 'Surat Izin (Tidak Masuk Kerja / Meninggalkan Kantor)' : activeRequest.jenisCuti}
                  </strong></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wide">{activeRequest.jenisCuti === 'surat_izin' ? 'Alasan Mengajukan Izin' : 'Alasan Mengambil Cuti'}</span> <span className="text-slate-350 italic">"{activeRequest.alasanCuti}"</span></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wide">{activeRequest.jenisCuti === 'surat_izin' ? 'Lamanya Izin & Periode' : 'Lamanya Cuti & Periode'}</span> <span className="text-slate-350 font-semibold">{activeRequest.lamanyaCuti} ({activeRequest.tanggalMulai} s/d {activeRequest.tanggalSelesai})</span></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wide">{activeRequest.jenisCuti === 'surat_izin' ? 'Alamat & Nomor Telepon Selama Izin' : 'Alamat & Nomor Telepon Selama Cuti'}</span> <span className="text-slate-350">{activeRequest.alamatSelamaCuti} (Telp: <strong className="text-white">{activeRequest.telepon}</strong>)</span></p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Approval status selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Pertimbangan Keputusan Atasan / Pejabat ({role === 'atasan' ? 'Atasan Langsung' : 'Pejabat Berwenang'})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['DISETUJUI', 'PERUBAHAN', 'DITANGGUHKAN', 'TIDAK DISETUJUI'] as const).map((statusVal) => (
                    <label
                      key={statusVal}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition text-center ${
                        status === statusVal
                          ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 font-bold'
                          : 'bg-slate-950/20 border-slate-850 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <input
                        type="radio"
                        name="approvalStatus"
                        value={statusVal}
                        checked={status === statusVal}
                        onChange={() => setStatus(statusVal)}
                        className="sr-only"
                      />
                      <span className="text-[11px] uppercase tracking-wide">{statusVal}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reviewer identity & Signature placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                      {role === 'atasan' ? 'Nama Atasan Langsung' : 'Nama Pejabat Berwenang'}
                    </label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      readOnly={!!currentUser && (currentUser.role === 'atasan' || currentUser.role === 'pejabat')}
                      className={`w-full px-4 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition text-slate-100 outline-none ${
                        !!currentUser && (currentUser.role === 'atasan' || currentUser.role === 'pejabat') ? 'opacity-70 bg-slate-950/60' : ''
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                      {role === 'atasan' ? 'NIP Atasan Langsung' : 'NIP Pejabat Berwenang'}
                    </label>
                    <input
                      type="text"
                      value={reviewerNip}
                      onChange={(e) => setReviewerNip(e.target.value)}
                      readOnly={!!currentUser && (currentUser.role === 'atasan' || currentUser.role === 'pejabat')}
                      className={`w-full px-4 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition text-slate-100 outline-none ${
                        !!currentUser && (currentUser.role === 'atasan' || currentUser.role === 'pejabat') ? 'opacity-70 bg-slate-950/60' : ''
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Real signature drawer and uploader db box */}
                <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/20 flex flex-col justify-between h-fit min-h-[220px]">
                  <div>
                    <span className="text-xs uppercase font-semibold text-slate-400 block mb-2">✍️ Tandatangan Fisik Basah (Visual)</span>
                    
                    {/* Small tabs */}
                    <div className="flex space-x-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] mb-3">
                      <button
                        type="button"
                        onClick={() => setSignType('saved')}
                        className={`flex-1 py-1 text-center rounded transition font-medium ${
                          signType === 'saved' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Tersimpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignType('draw')}
                        className={`flex-1 py-1 text-center rounded transition font-medium ${
                          signType === 'draw' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Gambar Baru
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignType('upload')}
                        className={`flex-1 py-1 text-center rounded transition font-medium ${
                          signType === 'upload' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Unggah Berkas
                      </button>
                    </div>

                    {/* Tab contents */}
                    {signType === 'saved' && (
                      <div className="border border-dashed border-slate-800 bg-slate-900/40 p-3 rounded-xl flex flex-col items-center justify-center min-h-[96px] text-center">
                        {signatureDataUrl ? (
                          <div className="relative group bg-white/90 p-2 rounded-lg border border-slate-755">
                            <img src={signatureDataUrl} className="h-14 max-w-[200px] object-contain mix-blend-multiply" alt="Tanda tangan tersimpan" />
                            <p className="text-[8px] text-slate-500 mt-1 font-mono">{reviewerName}</p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-500 italic">Belum ada tanda tangan yang disimpan dalam basis data. Silakan gambar atau unggah.</p>
                        )}
                      </div>
                    )}

                    {signType === 'draw' && (
                      <div className="flex flex-col space-y-2">
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
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-[10px] italic">
                              Coret / Gambar tanda tangan Anda di sini
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={clearCanvas}
                            className="px-2 py-1 bg-red-650/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[9px] font-bold rounded transition uppercase tracking-wider"
                          >
                            Hapus Coretan
                          </button>
                        </div>
                      </div>
                    )}

                    {signType === 'upload' && (
                      <div className="flex flex-col space-y-2">
                        <div className="border border-dashed border-slate-800 bg-slate-900/40 p-3 rounded-xl min-h-[96px] flex flex-col items-center justify-center relative hover:bg-slate-900/80 transition group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {signatureDataUrl && signType === 'upload' ? (
                            <div className="z-10 flex flex-col items-center bg-white/95 p-1 rounded">
                              <img src={signatureDataUrl} className="h-10 max-w-[160px] object-contain mix-blend-multiply" alt="Tanda tangan diupload" />
                            </div>
                          ) : (
                            <div className="text-center text-slate-400 pointer-events-none">
                              <span className="text-base block mb-0.5">📂</span>
                              <p className="text-[10px] font-semibold text-slate-300">Pilih berkas tanda tangan</p>
                              <p className="text-[8px] text-slate-500">Mendukung format PNG / JPG</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 border-t border-slate-900 pt-2 text-center">
                    <p className="text-[8.5px] text-slate-500 leading-normal font-mono">ID: SIG_STAMP_{reviewerNip.replace(/\s+/g, '') || '000'}</p>
                  </div>
                </div>
              </div>

              {/* Catatan/Alasan Pertimbangan */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Catatan / Alasan (Opsional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Beri alasan bila ada perubahan, penangguhan, atau penolakan..."
                  className="w-full h-20 px-4 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm transition text-slate-100 outline-none resize-none"
                />
              </div>

              {/* Mismatch Warning Alert */}
              {(() => {
                const isMismatch = !!currentUser && (
                  (role === 'atasan' && currentUser.role !== 'atasan' && currentUser.role !== 'admin') ||
                  (role === 'pejabat' && currentUser.role !== 'pejabat' && currentUser.role !== 'admin') ||
                  (currentUser.role === 'pegawai')
                );
                
                if (isMismatch) {
                  let alertText = '';
                  if (currentUser.role === 'pegawai') {
                    alertText = 'Anda login sebagai Pegawai Pemohon. Anda tidak memiliki izin untuk mengesahkan dokumen cuti ini.';
                  } else if (role === 'atasan') {
                    alertText = `Anda login sebagai Pejabat Berwenang (${currentUser.nama}). Tanda tangan bagian ini hanya boleh disahkan oleh Atasan Langsung.`;
                  } else {
                    alertText = `Anda login sebagai Atasan Langsung (${currentUser.nama}). Tanda tangan bagian ini hanya boleh disahkan oleh Pejabat Berwenang.`;
                  }

                  return (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2.5">
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{alertText}</span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Final Submit action */}
              <button
                type="submit"
                disabled={!!currentUser && (
                  (role === 'atasan' && currentUser.role !== 'atasan' && currentUser.role !== 'admin') ||
                  (role === 'pejabat' && currentUser.role !== 'pejabat' && currentUser.role !== 'admin') ||
                  (currentUser.role === 'pegawai')
                )}
                className={`w-full py-3 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition shadow-lg ${
                  !!currentUser && (
                    (role === 'atasan' && currentUser.role !== 'atasan' && currentUser.role !== 'admin') ||
                    (role === 'pejabat' && currentUser.role !== 'pejabat' && currentUser.role !== 'admin') ||
                    (currentUser.role === 'pegawai')
                  )
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-750 shadow-emerald-500/10'
                }`}
              >
                🔒 Sahkan & Simpan Keputusan
              </button>

            </form>
          </div>
        ) : (
          <p className="text-center text-slate-500">Pilih salah satu berkas di samping untuk memulai peninjauan.</p>
        )}
      </div>

    </div>
  );
};
