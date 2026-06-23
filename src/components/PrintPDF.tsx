import React from 'react';
import { LeaveRequest } from '../types';
import { klhLogoBase64 } from './klhLogoBase64';

interface PrintPDFProps {
  request: LeaveRequest;
  onClose?: () => void;
}

export const PrintPDF: React.FC<PrintPDFProps> = ({ request, onClose }) => {
  const printPage = () => {
    window.print();
  };

  // Safely extract Surat Izin custom fields, with fallback to initial example data
  const infoIzin = (request.catatanCuti as any)?.suratIzin || {
    pemohonPangkat: 'Pembina / IV.a',
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
    keperluan: 'Urusan Keluarga.'
  };

  return (
    <div className="bg-slate-900 border-l border-slate-850 p-6 flex flex-col h-full overflow-y-auto w-full lg:max-w-4xl" id="print-preview-container">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 print:hidden shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-white">Preview Cetak</h2>
          <p className="text-xs text-slate-400">Siap cetak ke ukuran kertas A4 (Atur posisi halaman potret tanpa margin/header-footer)</p>
        </div>
        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs transition"
            >
              Tutup Preview
            </button>
          )}
          <button
            onClick={printPage}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition shadow-lg shadow-emerald-500/10 flex items-center space-x-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Actual Paper Markup */}
      <div className="bg-white text-black p-8 md:p-12 mx-auto w-full max-w-[210mm] border border-gray-200 shadow-2xl rounded-sm print:shadow-none print:border-none print:p-0 print:mx-0 print:w-full print:max-w-none font-arial text-[10px] leading-tight select-none">
        
        {request.jenisCuti === 'surat_izin' ? (
          /* =======================================================
             CUSTOM RENDERING FOR SURAT IZIN (DOES NOT USE LEAVE FORM)
             ======================================================= */
          <div className="min-h-[297mm] flex flex-col justify-between p-4" id="print-sheet-surat-izin">
            <div>
              {/* official letterhead */}
              <div className="flex items-center justify-between border-b-4 border-double border-black pb-2 mb-4 relative" id="kop-surat-izin">
                <div className="w-[15%] flex justify-start shrink-0">
                  {/* Official cropped logo of Kementerian Lingkungan Hidup */}
                  <img 
                    src={klhLogoBase64}
                    className="w-[82px] h-[82px] object-contain shrink-0 relative -top-1" 
                    alt="Logo KLH"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center flex-1 pr-10 font-arial">
                  <h2 className="text-[14.0px] font-bold leading-none uppercase text-black tracking-normal">KEMENTERIAN LINGKUNGAN HIDUP/</h2>
                  <h2 className="text-[14.0px] font-bold leading-normal uppercase text-black tracking-normal mt-0.5">BADAN PENGENDALIAN LINGKUNGAN HIDUP</h2>
                  <h1 className="text-[16.0px] font-black leading-normal uppercase text-black mt-1">SEKRETARIAT UTAMA</h1>
                  <h3 className="text-[10px] font-bold leading-tight uppercase text-black mt-1.5">PUSAT PENGENDALIAN LINGKUNGAN HIDUP SULAWESI DAN MALUKU</h3>
                  <p className="text-[8.5px] leading-normal text-gray-800 mt-1">JL. Perintis Kemerdekaan Km. 17, Kode Pos 90243</p>
                  <p className="text-[8.5px] leading-normal text-gray-800">Email: <span className="text-blue-600 underline font-semibold">sekretariat@pusdalsuma.go.id</span></p>
                </div>
              </div>

              {/* date bar */}
              <div className="flex justify-end text-[10px] my-2">
                <p>{request.tanggalForm ? request.tanggalForm.replace('Makassar, ', '') : '.....................'}</p>
              </div>

              {/* letter title */}
              <div className="text-center my-6">
                <h1 className="font-bold text-[13px] uppercase tracking-wider underline">SURAT IZIN</h1>
                <p className="text-[10px] font-sans mt-0.5">NOMOR : {request.nomorSurat || 'B.        /PPLH.SM/PEG.12.1/02/2026'}</p>
              </div>

              {/* sender paragraph */}
              <p className="mb-4 leading-relaxed">Yang bertanda tangan di bawah ini :</p>

              {/* sender variables */}
              <table className="w-full my-3 ml-4 border-collapse text-[11px]">
                <tbody>
                  <tr>
                    <td className="w-[180px] py-1">Nama</td>
                    <td className="w-[15px] text-center">:</td>
                    <td className="py-1 font-bold">{infoIzin.pemberiIzinNama || 'Arnianah Alwi, S.Si., M.Si.'}</td>
                  </tr>
                  <tr>
                    <td className="py-1">NIP</td>
                    <td className="text-center">:</td>
                    <td className="py-1">{infoIzin.pemberiIzinNip || '19681227 199803 2 001'}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Pangkat/Gol. Ruang</td>
                    <td className="text-center">:</td>
                    <td className="py-1">{infoIzin.pemberiIzinPangkat || 'Pembina Tk.1 / IV.b'}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Jabatan</td>
                    <td className="text-center">:</td>
                    <td className="py-1">{infoIzin.pemberiIzinJabatan || 'Kepala Bidang Wilayah II'}</td>
                  </tr>
                </tbody>
              </table>

              {/* transition paragraph */}
              <p className="my-4 leading-relaxed">Memberikan Izin kepada :</p>

              {/* recipient variables */}
              <table className="w-full my-3 ml-4 border-collapse text-[11px]">
                <tbody>
                  <tr>
                    <td className="w-[180px] py-1">Nama</td>
                    <td className="w-[15px] text-center">:</td>
                    <td className="py-1 font-bold">{request.pegawai.nama}</td>
                  </tr>
                  <tr>
                    <td className="py-1">NIP</td>
                    <td className="text-center">:</td>
                    <td className="py-1">{request.pegawai.nip}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Pangkat/Gol. Ruang</td>
                    <td className="text-center">:</td>
                    <td className="py-1">{infoIzin.pemohonPangkat || 'Pembina / IV.a'}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Jabatan</td>
                    <td className="text-center">:</td>
                    <td className="py-1">{request.pegawai.jabatan}</td>
                  </tr>
                </tbody>
              </table>

              {/* checkboxes block */}
              <div className="mt-4">
                <p className="font-semibold mb-3">Untuk :</p>
                <div className="ml-4 space-y-3">
                  
                  {/* Option 1 */}
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center border border-black w-5 h-5 font-bold text-xs mr-3 mt-0.5 shrink-0 bg-white">
                      {infoIzin.terlambatMasuk ? '✓' : ''}
                    </span>
                    <div className="flex-1 flex items-baseline">
                      <span className="w-[200px] shrink-0 text-gray-900">Terlambat masuk</span>
                      <span className="mr-2 text-gray-500">:</span>
                      <span className="flex-1 border-b border-dotted border-black/80 pb-0.5 min-h-[16px] text-[10px] font-sans">
                        {infoIzin.terlambatMasuk && infoIzin.terlambatMasukPukul ? `Pukul ${infoIzin.terlambatMasukPukul}` : 'Pukul: '}
                      </span>
                    </div>
                  </div>

                  {/* Option 2 */}
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center border border-black w-5 h-5 font-bold text-xs mr-3 mt-0.5 shrink-0 bg-white">
                      {infoIzin.pulangSebelum ? '✓' : ''}
                    </span>
                    <div className="flex-1 flex items-baseline">
                      <span className="w-[200px] shrink-0 text-gray-900 font-serif">Pulang sebelum waktunya</span>
                      <span className="mr-2 text-gray-500">:</span>
                      <span className="flex-1 border-b border-dotted border-black/80 pb-0.5 min-h-[16px] text-[10px] font-sans">
                        {infoIzin.pulangSebelum && infoIzin.pulangSebelumPukul ? `Pukul ${infoIzin.pulangSebelumPukul}` : 'Pukul: '}
                      </span>
                    </div>
                  </div>

                  {/* Option 3 */}
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center border border-black w-5 h-5 font-bold text-xs mr-3 mt-0.5 shrink-0 bg-white">
                      {infoIzin.keluarKantor ? '✓' : ''}
                    </span>
                    <div className="flex-1 flex items-baseline">
                      <span className="w-[200px] shrink-0 text-gray-900">Keluar kantor</span>
                      <span className="mr-2 text-gray-500">:</span>
                      <span className="flex-1 border-b border-dotted border-black/80 pb-0.5 min-h-[16px] text-[10px] font-sans">
                        {infoIzin.keluarKantor && infoIzin.keluarKantorPukul ? `Pukul ${infoIzin.keluarKantorPukul} s/d Kembali Pukul ${infoIzin.keluarKantorKembaliPukul || 'selesai'}` : 'Pukul:                                                         Kembali pukul :'}
                      </span>
                    </div>
                  </div>

                  {/* Option 4 */}
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center border border-black w-5 h-5 font-bold text-xs mr-3 mt-0.5 shrink-0 bg-white">
                      {infoIzin.tidakMasukKerja ? '✓' : ''}
                    </span>
                    <div className="flex-1 flex items-baseline">
                      <span className="w-[200px] shrink-0 text-gray-900">Tidak masuk kerja</span>
                      <span className="mr-2 text-gray-500">:</span>
                      <span className="flex-1 border-b border-dotted border-black/60 pb-0.5 min-h-[16px]"></span>
                    </div>
                  </div>

                </div>
              </div>

              {/* schedule table */}
              <table className="w-full my-5 ml-4 border-collapse text-[11px]">
                <tbody>
                  <tr>
                    <td className="w-[180px] py-1.5">Pada hari, tanggal</td>
                    <td className="w-[15px] text-center">:</td>
                    <td className="py-1.5 font-bold text-red-600">{infoIzin.hariTanggal || '.....................'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5">Untuk Keperluan</td>
                    <td className="text-center">:</td>
                    <td className="py-1.5 font-bold text-red-600">{infoIzin.keperluan || '.....................'}</td>
                  </tr>
                </tbody>
              </table>

              {/* closing */}
              <p className="mt-4 mb-8 leading-relaxed">Demikian surat izin ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
            </div>

            {/* signatures blocks */}
            <div>
              <div className="grid grid-cols-2 text-center gap-12 text-[11px] font-sans leading-normal">
                <div>
                  <p>{infoIzin.pemberiIzinJabatan || 'Kepala Bidang Wilayah II'},</p>
                  <div className="h-12 flex items-center justify-center my-1 print:my-0">
                    {request.atasan && request.atasan.signed && request.atasan.signatureImg ? (
                      <img 
                        src={request.atasan.signatureImg} 
                        className="max-h-12 max-w-[180px] object-contain mix-blend-multiply" 
                        alt="Tanda Tangan Atasan"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-12"></div>
                    )}
                  </div>
                  <p className="font-bold underline uppercase">{infoIzin.pemberiIzinNama || 'Arnianah Alwi, S.Si., M.Si.'}</p>
                  <p>NIP. {infoIzin.pemberiIzinNip || '19681227 199803 2 001'}</p>
                </div>
                <div>
                  <p>Yang Bersangkutan,</p>
                  <div className="h-12 flex items-center justify-center my-1 print:my-0">
                    {request.pegawai.signatureImg ? (
                      <img 
                        src={request.pegawai.signatureImg} 
                        className="max-h-12 max-w-[180px] object-contain mix-blend-multiply" 
                        alt="Tanda Tangan Pemohon"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-12"></div>
                    )}
                  </div>
                  <p className="font-bold underline uppercase">{request.pegawai.nama}</p>
                  <p>NIP. {request.pegawai.nip}</p>
                </div>
              </div>

              {/* tembusan */}
              <div className="mt-14 border-t border-black/10 pt-3 text-[9px] text-left font-sans">
                <p className="font-bold underline uppercase">Tembusan Kepada Yth :</p>
                <ol className="list-decimal list-inside text-[8px] space-y-0.5 mt-1 text-gray-700">
                  <li>Kepala PUSDAL LH Suma</li>
                  <li>Kepala Subbagian Tata Usaha</li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          /* =======================================================
             STANDARD LEAVE APPLICATION PDF FORMAT
             ======================================================= */
          <>
            {/* Top Header Location & Date */}
            <div className="flex justify-end mb-4">
              <div className="text-left min-w-[220px] text-[10px] leading-relaxed">
                <p>Makassar, {request.tanggalForm ? request.tanggalForm.replace('Makassar, ', '') : '.....................'}</p>
                <div className="mt-2">
                  <p>Kepada</p>
                  <p>Yth. PPLH Sulawesi dan Maluku</p>
                  <p>di.</p>
                  <p className="indent-4">Tempat</p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-4">
              <h1 className="font-bold text-[13px] uppercase tracking-wide leading-tight">
                FORMULIR PERMINTAAN DAN PEMBERIAN CUTI
              </h1>
              <div className="text-center text-[10px] font-medium mt-1">
                Sc. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{request.nomorSurat || '/PPLH.MS/TU/SET.3.1/B/01/2025'}
              </div>
            </div>

            {/* Section List */}
            <div className="space-y-4">
              
              {/* I. DATA PEGAWAI */}
              <div>
                <div className="font-bold border border-black px-2 py-0.5 bg-gray-100/50 uppercase text-[10px]">I. DATA PEGAWAI</div>
                <table className="w-full border-x border-b border-black text-[10px] text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-[12%] py-1 px-2 border-r border-black font-semibold">Nama</td>
                      <td className="w-[38%] py-1 px-2 border-r border-black">{request.pegawai.nama || '-'}</td>
                      <td className="w-[12%] py-1 px-2 border-r border-black font-semibold">NIP</td>
                      <td className="w-[38%] py-1 px-2">{request.pegawai.nip || '-'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="py-1 px-2 border-r border-black font-semibold">Jabatan</td>
                      <td className="py-1 px-2 border-r border-black">{request.pegawai.jabatan || '-'}</td>
                      <td className="py-1 px-2 border-r border-black font-semibold">Masa Kerja</td>
                      <td className="py-1 px-2">{request.pegawai.masaKerja || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 border-r border-black font-semibold">Unit Kerja</td>
                      <td colSpan={3} className="py-1 px-2">
                        {request.pegawai.unitKerja || '-'}
                        {request.pegawai.bidangWilayah ? ` (${request.pegawai.bidangWilayah})` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* II. JENIS CUTI */}
              <div>
                <div className="font-bold border border-black px-2 py-0.5 bg-gray-100/50 uppercase text-[10px]">II. JENIS CUTI YANG DIAMBIL **</div>
                <table className="w-full border-x border-b border-black text-[10px] border-collapse">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-[50%] py-1.5 px-2 border-r border-black flex items-center justify-between">
                        <span>1. Cuti Tahunan</span>
                        <span className="font-bold pr-4">{request.jenisCuti === 'cuti_tahunan' ? '✔' : ''}</span>
                      </td>
                      <td className="w-[50%] py-1.5 px-2 flex items-center justify-between">
                        <span>2. Cuti Besar</span>
                        <span className="font-bold pr-4">{request.jenisCuti === 'cuti_besar' ? '✔' : ''}</span>
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="py-1.5 px-2 border-r border-black flex items-center justify-between">
                        <span>3. Cuti Sakit</span>
                        <span className="font-bold pr-4">{request.jenisCuti === 'cuti_sakit' ? '✔' : ''}</span>
                      </td>
                      <td className="py-1.5 px-2 flex items-center justify-between">
                        <span>4. Cuti Melahirkan</span>
                        <span className="font-bold pr-4">{request.jenisCuti === 'cuti_melahirkan' ? '✔' : ''}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 border-r border-black flex items-center justify-between">
                        <span>5. Cuti Karena Alasan Penting</span>
                        <span className="font-bold pr-4">{request.jenisCuti === 'cuti_penting' ? '✔' : ''}</span>
                      </td>
                      <td className="py-1.5 px-2 flex items-center justify-between">
                        <span>6. Cuti di Luar Tanggungan Negara</span>
                        <span className="font-bold pr-4">{request.jenisCuti === 'cuti_luar_negara' ? '✔' : ''}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* III. ALASAN CUTI */}
              <div>
                <div className="font-bold border border-black px-2 py-0.5 bg-gray-100/50 uppercase text-[10px]">
                  III. ALASAN CUTI
                </div>
                <div className="border-x border-b border-black p-3 min-h-[40px] text-[10px]">
                  {request.alasanCuti || '-'}
                </div>
              </div>

              {/* IV. LAMANYA CUTI */}
              <div>
                <div className="font-bold border border-black px-2 py-0.5 bg-gray-100/50 uppercase text-[10px]">
                  IV. LAMANYA CUTI
                </div>
                <table className="w-full border-x border-b border-black text-[10px] border-collapse text-left">
                  <tbody>
                    <tr>
                      <td className="w-[10%] py-1.5 px-2 border-r border-black font-semibold bg-gray-50/10">Selama</td>
                      <td className="w-[28%] py-1.5 px-2 border-r border-black">{request.lamanyaCuti || '-'}</td>
                      <td className="w-[14%] py-1.5 px-2 border-r border-black font-semibold bg-gray-50/10">Mulai Tanggal</td>
                      <td className="w-[24%] py-1.5 px-2 border-r border-black">{request.tanggalMulai || '-'}</td>
                      <td className="w-[6%] py-1.5 px-2 border-r border-black font-semibold text-center bg-gray-50/10">s/d</td>
                      <td className="w-[18%] py-1.5 px-2">{request.tanggalSelesai || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* V. CATATAN CUTI */}
              <div>
                <div className="font-bold border border-black px-2 py-0.5 bg-gray-100/50 uppercase text-[10px]">V. CATATAN CUTI ***</div>
                <table className="w-full border-x border-b border-black text-[10px] border-collapse text-left">
                  <tbody>
                    <tr className="border-b border-black">
                      {/* Cuti Tahunan Column */}
                      <td className="w-[50%] border-r border-black align-top">
                        <div className="font-semibold p-1.5 border-b border-black bg-gray-50/40">1. CUTI TAHUNAN</div>
                        <table className="w-full text-center text-[10px] border-collapse">
                          <thead>
                            <tr className="border-b border-black font-semibold">
                              <td className="w-[25%] border-r border-black py-0.5">Tahun</td>
                              <td className="w-[25%] border-r border-black">Sisa</td>
                              <td className="w-[50%]">Keterangan</td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-black">
                              <td className="border-r border-black py-1 h-5 text-gray-500">N-2</td>
                              <td className="border-r border-black">{request.catatanCuti.cutiTahunan.tahunN2.sisa || ''}</td>
                              <td className="text-left px-1.5 text-[9px] truncate max-w-[120px]" title={request.catatanCuti.cutiTahunan.tahunN2.keterangan}>
                                {request.catatanCuti.cutiTahunan.tahunN2.keterangan || ''}
                              </td>
                            </tr>
                            <tr className="border-b border-black">
                              <td className="border-r border-black py-1 h-5 text-gray-500">N-1</td>
                              <td className="border-r border-black">{request.catatanCuti.cutiTahunan.tahunN1.sisa || ''}</td>
                              <td className="text-left px-1.5 text-[9px] truncate max-w-[120px]" title={request.catatanCuti.cutiTahunan.tahunN1.keterangan}>
                                {request.catatanCuti.cutiTahunan.tahunN1.keterangan || ''}
                              </td>
                            </tr>
                            <tr>
                              <td className="border-r border-black py-1 h-5 text-gray-500 font-medium">N</td>
                              <td className="border-r border-black font-medium">{request.catatanCuti.cutiTahunan.tahunN.sisa || ''}</td>
                              <td className="text-left px-1.5 text-[9px] truncate max-w-[120px]" title={request.catatanCuti.cutiTahunan.tahunN.keterangan}>
                                {request.catatanCuti.cutiTahunan.tahunN.keterangan || ''}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>

                      {/* Rest of leaves column */}
                      <td className="w-[50%] align-top p-0">
                        <table className="w-full border-collapse">
                          <tbody>
                            <tr className="border-b border-black">
                              <td className="p-1 px-2 font-semibold bg-gray-50/40 border-r border-black w-[45%]">2. CUTI BESAR</td>
                              <td className="p-1 px-2">{request.catatanCuti.cutiBesar || ''}</td>
                            </tr>
                            <tr className="border-b border-black">
                              <td className="p-1 px-2 font-semibold bg-gray-50/40 border-r border-black">3. CUTI SAKIT</td>
                              <td className="p-1 px-2">{request.catatanCuti.cutiSakit || ''}</td>
                            </tr>
                            <tr className="border-b border-black">
                              <td className="p-1 px-2 font-semibold bg-gray-50/40 border-r border-black">4. CUTI MELAHIRKAN</td>
                              <td className="p-1 px-2">{request.catatanCuti.cutiMelahirkan || ''}</td>
                            </tr>
                            <tr className="border-b border-black">
                              <td className="p-1 px-2 font-semibold bg-gray-50/40 border-r border-black">5. CUTI KARENA ALASAN PENTING</td>
                              <td className="p-1 px-2">{request.catatanCuti.cutiAlasanPenting || ''}</td>
                            </tr>
                            <tr>
                              <td className="p-1 px-2 font-semibold bg-gray-50/40 border-r border-black">6. CUTI DI LUAR TANGGUNGAN NEGARA</td>
                              <td className="p-1 px-2">{request.catatanCuti.cutiLuarNegara || ''}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* VI. ALAMAT SELAMA MENJALANKAN CUTI */}
              <div>
                <div className="font-bold border border-black px-2 py-0.5 bg-gray-100/50 uppercase text-[10px]">VI. ALAMAT SELAMA MENJALANKAN CUTI</div>
                <table className="w-full border-x border-b border-black text-[10px] border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-[50%] p-2.5 border-r border-black align-top" rowSpan={2}>
                        <p className="min-h-[60px] whitespace-pre-wrap">{request.alamatSelamaCuti || '...........................................'}</p>
                      </td>
                      <td className="w-[12%] py-1.5 px-2 border-r border-black font-semibold text-center bg-gray-50/10">TELP</td>
                      <td className="w-[38%] py-1.5 px-2">{request.telepon || '........................'}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="p-4 border-t border-black align-top text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-right w-full pr-6">Hormat Saya,</p>
                          <div className="h-12 flex items-center justify-center my-1 print:my-0">
                            {request.pegawai.signatureImg ? (
                              <img 
                                src={request.pegawai.signatureImg} 
                                className="max-h-12 max-w-[180px] object-contain mix-blend-multiply" 
                                alt="Tanda Tangan Pemohon"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="h-12"></div>
                            )}
                          </div>
                          <p className="font-bold underline uppercase">{request.pegawai.nama || '.........................................'}</p>
                          <p>NIP. {request.pegawai.nip || '.........................................'}</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* VII. PERTIMBANGAN ATASAN LANGSUNG */}
              <div>
                <div className="font-bold border border-black px-2 py-0.5 bg-gray-100/50 uppercase text-[10px]">VII. PERTIMBANGAN ATASAN LANGSUNG **</div>
                <table className="w-full border-x border-b border-black text-[10px] border-collapse">
                  <tbody>
                    <tr className="border-b border-black bg-gray-50/20 text-center font-semibold">
                      <td className="w-[20%] py-1 border-r border-black">DISETUJUI</td>
                      <td className="w-[25%] py-1 border-r border-black">PERUBAHAN ****</td>
                      <td className="w-[25%] py-1 border-r border-black">DITANGGUHKAN ****</td>
                      <td className="w-[30%] py-1">TIDAK DISETUJUI ****</td>
                    </tr>
                    <tr className="border-b border-black text-center h-8">
                      <td className="border-r border-black font-bold text-sm">
                        {request.atasan.status === 'DISETUJUI' ? '✔' : ''}
                      </td>
                      <td className="border-r border-black font-bold text-sm">
                        {request.atasan.status === 'PERUBAHAN' ? '✔' : ''}
                      </td>
                      <td className="border-r border-black font-bold text-sm">
                        {request.atasan.status === 'DITANGGUHKAN' ? '✔' : ''}
                      </td>
                      <td className="font-bold text-sm">
                        {request.atasan.status === 'TIDAK DISETUJUI' ? '✔' : ''}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-4 text-right">
                        <div className="inline-block text-center mr-8 min-w-[220px]">
                          {request.atasan.signed ? (
                            <>
                              <div className="h-12 flex items-center justify-center my-1 print:my-0">
                                {request.atasan.signatureImg ? (
                                  <img 
                                    src={request.atasan.signatureImg} 
                                    className="max-h-12 max-w-[180px] object-contain mix-blend-multiply" 
                                    alt="Tanda Tangan Atasan"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="h-12"></div>
                                )}
                              </div>
                              <p className="font-bold underline text-center">{request.atasan.nama}</p>
                              <p className="text-center">NIP. {request.atasan.nip}</p>
                            </>
                          ) : (
                            <div className="py-2.5 text-gray-400 text-[10px] italic text-center">
                              Menunggu Persetujuan Atasan
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* VIII. KEPUTUSAN PEJABAT YANG BERWENANG */}
              <div>
                <div className="font-bold border border-black px-2 py-0.5 bg-gray-100/50 uppercase text-[10px]">VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI **</div>
                <table className="w-full border-x border-b border-black text-[10px] border-collapse">
                  <tbody>
                    <tr className="border-b border-black bg-gray-50/20 text-center font-semibold">
                      <td className="w-[20%] py-1 border-r border-black">DISETUJUI</td>
                      <td className="w-[25%] py-1 border-r border-black">PERUBAHAN ****</td>
                      <td className="w-[25%] py-1 border-r border-black">DITANGGUHKAN ****</td>
                      <td className="w-[30%] py-1">TIDAK DISETUJUI ****</td>
                    </tr>
                    <tr className="border-b border-black text-center h-8">
                      <td className="border-r border-black font-bold text-sm">
                        {request.pejabat.status === 'DISETUJUI' ? '✔' : ''}
                      </td>
                      <td className="border-r border-black font-bold text-sm">
                        {request.pejabat.status === 'PERUBAHAN' ? '✔' : ''}
                      </td>
                      <td className="border-r border-black font-bold text-sm">
                        {request.pejabat.status === 'DITANGGUHKAN' ? '✔' : ''}
                      </td>
                      <td className="font-bold text-sm">
                        {request.pejabat.status === 'TIDAK DISETUJUI' ? '✔' : ''}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-4 text-right">
                        <div className="inline-block text-center mr-8 min-w-[220px]">
                          {request.pejabat.signed ? (
                            <>
                              <p className="text-center font-medium">{request.pejabat.jabatan || 'Kepala Pusat'},</p>
                              <div className="h-12 flex items-center justify-center my-1 print:my-0">
                                {request.pejabat.signatureImg ? (
                                  <img 
                                    src={request.pejabat.signatureImg} 
                                    className="max-h-12 max-w-[180px] object-contain mix-blend-multiply" 
                                    alt="Tanda Tangan Pejabat"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="h-12"></div>
                                )}
                              </div>
                              <p className="font-bold underline text-center">{request.pejabat.nama}</p>
                              <p className="text-center">NIP. {request.pejabat.nip}</p>
                            </>
                          ) : (
                            <div className="py-2.5 text-gray-400 text-[10px] italic text-center">
                              Menunggu Keputusan Pejabat
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Footnotes / Catatan */}
            <div className="mt-6 text-[9px] leading-relaxed border-t border-black/20 pt-3">
              <p className="font-semibold mb-1">Catatan :</p>
              <div className="grid grid-cols-2 gap-2 text-[8.5px]">
                <div className="space-y-0.5">
                  <p>* Coret yang tidak perlu</p>
                  <p>** Pilih salah satu dengan memberi tanda centang ( ✔ )</p>
                  <p>*** diisi oleh pejabat yang menangani bidang kepegawaian sebelum PNS mengajukan Cuti</p>
                  <p>**** diberi tanda centang dan alasannya,.</p>
                </div>
                <div className="flex justify-between">
                  <div className="space-y-0.5">
                    <p>N = Cuti tahun berjalan</p>
                    <p>N-1 = Sisa cuti 1 tahun sebelumnya</p>
                    <p>N-2 = Sisa cuti 2 tahun sebelumnya</p>
                  </div>
                  <div className="text-right space-y-0.5 pr-2 font-mono">
                    <p>CUTI 2024+2025 = 12 Hari</p>
                    <p>diambil = 3 Hari</p>
                    <p>Sisa Cuti = 9 Hari</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
