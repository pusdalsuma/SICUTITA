export interface EmployeeData {
  nama: string;
  nip: string;
  jabatan: string;
  masaKerja: string;
  unitKerja: string;
  bidangWilayah?: string;
  signatureImg?: string;
}

export type JenisCutiCode = 'cuti_tahunan' | 'cuti_besar' | 'cuti_sakit' | 'cuti_melahirkan' | 'cuti_penting' | 'cuti_luar_negara' | 'surat_izin';

export interface CutiTahunanCatatan {
  tahunN2: { sisa: string; keterangan: string };
  tahunN1: { sisa: string; keterangan: string };
  tahunN: { sisa: string; keterangan: string };
}

export interface LeaveRequest {
  id: string;
  nomorSurat: string;
  tanggalForm: string; // e.g., "Maker, 23 Januari 2025"
  kepadaYth: string; // e.g., "Kepada Yth. PPLH Sulawesi dan Maluku di Tempat"
  pegawai: EmployeeData;
  jenisCuti: JenisCutiCode;
  alasanCuti: string;
  lamanyaCuti: string; // e.g. "3 Hari (Kamis-Jumat dan Senin)"
  tanggalMulai: string;
  tanggalSelesai: string;
  catatanCuti: {
    cutiTahunan: CutiTahunanCatatan;
    cutiBesar: string;
    cutiSakit: string;
    cutiMelahirkan: string;
    cutiAlasanPenting: string;
    cutiLuarNegara: string;
  };
  alamatSelamaCuti: string;
  telepon: string;
  
  // Signatures and approvals
  atasan: {
    status: 'DISETUJUI' | 'PERUBAHAN' | 'DITANGGUHKAN' | 'TIDAK DISETUJUI' | '';
    nama: string;
    nip: string;
    catatan: string;
    tanggal?: string;
    signed: boolean;
    signatureImg?: string;
  };
  pejabat: {
    status: 'DISETUJUI' | 'PERUBAHAN' | 'DITANGGUHKAN' | 'TIDAK DISETUJUI' | '';
    jabatan: string; // e.g., "Kepala Pusat"
    nama: string;
    nip: string;
    catatan: string;
    tanggal?: string;
    signed: boolean;
    signatureImg?: string;
  };
  
  statusPengajuan: 'DRAF' | 'DIAJUKAN' | 'DISETUJUI_ATASAN' | 'SELESAI' | 'DITOLAK';
  createdAt: string;
}

export type UserRole = 'pegawai' | 'atasan' | 'pejabat' | 'admin';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  nama: string;
  nip: string;
  jabatan?: string;
  unitKerja?: string;
  masaKerja?: string;
  bidangWilayah?: string;
  signatureImg?: string;
}

