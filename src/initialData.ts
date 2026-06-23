import { LeaveRequest } from './types';

export const initialRequests: LeaveRequest[] = [
  {
    id: 'req_stiawati_2025',
    nomorSurat: 'Sc. /PPLH.MS/TU/SET.3.1/B/01/2025',
    tanggalForm: 'Makassar, 23 Januari 2025',
    kepadaYth: 'Kepada Yth. PPLH Sulawesi dan Maluku di Tempat',
    pegawai: {
      nama: 'Stiawati Rahayu, S.E., M.Si',
      nip: '19731123 199803 2 001',
      jabatan: 'Pedal Madya',
      masaKerja: '26 Tahun 10 Bulan',
      unitKerja: 'Pusat Pengendalian Lingkungan Hidup Suma'
    },
    jenisCuti: 'cuti_tahunan',
    alasanCuti: 'Acara Keluarga',
    lamanyaCuti: '3 Hari (Kamis-Jum’at dan Senin)',
    tanggalMulai: '30,31 Januari dan 3 Februari',
    tanggalSelesai: '30,31 Januari - 3 Februari 2025',
    catatanCuti: {
      cutiTahunan: {
        tahunN2: { sisa: '-', keterangan: '' },
        tahunN1: { sisa: '-', keterangan: 'CUTI 2024+2025 = 12 Hari' },
        tahunN: { sisa: '12', keterangan: 'diambil = 3 Hari, Sisa Cuti = 9 Hari' }
      },
      cutiBesar: '',
      cutiSakit: '',
      cutiMelahirkan: '',
      cutiAlasanPenting: '',
      cutiLuarNegara: ''
    },
    alamatSelamaCuti: 'Jakarta',
    telepon: '082153151117',
    atasan: {
      status: 'DISETUJUI',
      nama: 'Arnianah Alwi. S.Si., M.Si',
      nip: '19681227 199803 2 001',
      catatan: '',
      tanggal: '23 Januari 2025',
      signed: true
    },
    pejabat: {
      status: 'DISETUJUI',
      jabatan: 'Kepala Pusat',
      nama: 'Dr. Azri Rasul, S.K.M., M.Si., M.H',
      nip: '19710516 199803 1 001',
      catatan: 'Disetujui untuk diberikan hak cuti sesuai peraturan.',
      tanggal: '24 Januari 2025',
      signed: true
    },
    statusPengajuan: 'SELESAI',
    createdAt: '2025-01-23T08:00:00Z'
  }
];
