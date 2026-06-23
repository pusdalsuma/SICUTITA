import { UserAccount } from './types';

export const initialUsers: UserAccount[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    password: '123',
    role: 'admin',
    nama: 'Administrator Kepegawaian',
    nip: 'N/A'
  },
  {
    id: 'usr_stiawati',
    username: 'stiawati',
    password: '123',
    role: 'pegawai',
    nama: 'Stiawati Rahayu, S.E., M.Si',
    nip: '19731123 199803 2 001',
    jabatan: 'Pedal Madya',
    unitKerja: 'Pusat Pengendalian Lingkungan Hidup Suma',
    masaKerja: '26 Tahun 10 Bulan'
  },
  {
    id: 'usr_arnianah',
    username: 'arnianah',
    password: '123',
    role: 'atasan',
    nama: 'Arnianah Alwi. S.Si., M.Si',
    nip: '19681227 199803 2 001',
    jabatan: 'Kepala Tata Usaha',
    unitKerja: 'Pusat Pengendalian Lingkungan Hidup Suma'
  },
  {
    id: 'usr_azri',
    username: 'azri',
    password: '123',
    role: 'pejabat',
    nama: 'Dr. Azri Rasul, S.K.M., M.Si., M.H',
    nip: '19710516 199803 1 001',
    jabatan: 'Kepala Pusat',
    unitKerja: 'Pusat Pengendalian Lingkungan Hidup Suma'
  }
];
