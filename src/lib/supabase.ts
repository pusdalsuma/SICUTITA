import { createClient } from '@supabase/supabase-js';
import { UserAccount, LeaveRequest } from '../types';
import { initialUsers } from '../initialUsers';
import { initialRequests } from '../initialData';

// Let's define the configuration interface
export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Key for storage
const CONFIG_KEY = 'pplh_supabase_config';

// Load configuration
export function getSupabaseConfig(): SupabaseConfig | null {
  // 1. Prioritize Environment Variables first for an "always-on" online setup across devices
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envUrl.trim() !== '' && envKey && envKey.trim() !== '') {
    return {
      supabaseUrl: "https://bbvknnwapzxhacgccxax.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJidmtubndhcHp4aGFjZ2NjeGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxOTQ3MzgsImV4cCI6MjA5Nzc3MDczOH0.3IkcWOAckYMEGob5U1g1nz-jpzS7IbeMJo63GqUtyNo",
    };
  }

  // 2. Fallback check on localStorage if environment variables are empty
  const localConfig = localStorage.getItem(CONFIG_KEY);
  if (localConfig) {
    try {
      const parsed = JSON.parse(localConfig);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        // Validate URL format before returning
        try {
          new URL(parsed.supabaseUrl);
          return parsed;
        } catch(e) {
          console.error('Invalid Supabase URL in localStorage, clearing:', parsed.supabaseUrl);
          localStorage.removeItem(CONFIG_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved Supabase credentials', e);
      localStorage.removeItem(CONFIG_KEY); // Clear junk
    }
  }

  return null;
}

export function cleanSupabaseUrl(url: string): string {
  let clean = url.trim();
  // Remove sub-routes if accidentally copied from API settings
  if (clean.endsWith('/rest/v1/')) {
    clean = clean.substring(0, clean.length - 9);
  } else if (clean.endsWith('/rest/v1')) {
    clean = clean.substring(0, clean.length - 8);
  }
  // Remove trailing slashes
  while (clean.endsWith('/')) {
    clean = clean.substring(0, clean.length - 1);
  }
  return clean;
}

export function saveSupabaseConfig(config: SupabaseConfig | null) {
  if (config) {
    const cleanedConfig = {
      supabaseUrl: cleanSupabaseUrl(config.supabaseUrl),
      supabaseAnonKey: config.supabaseAnonKey.trim(),
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cleanedConfig));
  } else {
    localStorage.removeItem(CONFIG_KEY);
  }
}

// Safe client creator
export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) return null;

  // Validate URL format
  try {
    new URL(config.supabaseUrl);
  } catch (e) {
    console.error('Invalid Supabase URL in config, clearing saved config:', config.supabaseUrl);
    saveSupabaseConfig(null);
    return null;
  }

  try {
    return createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// -------------------------------------------------------------------------
// Helper functions for Database Operations
// -------------------------------------------------------------------------

export interface TestConnectionResult {
  connected: boolean;
  hasTables: boolean;
  userCount: number;
  error?: string;
}

/**
 * Checks connectivity by running detailed table verification.
 */
export async function testConnection(url: string, key: string): Promise<TestConnectionResult> {
  try {
    const cleanedUrl = cleanSupabaseUrl(url);
    const client = createClient(cleanedUrl, key, { auth: { persistSession: false } });
    
    // Check if we can query the pplh_user_accounts table
    const { data, error } = await client.from('pplh_user_accounts').select('id');
    
    if (error) {
      const isMissingTable = error.message?.toLowerCase().includes('relation') || 
                             error.message?.toLowerCase().includes('does not exist');
      if (isMissingTable) {
        return {
          connected: true,
          hasTables: false,
          userCount: 0,
          error: `Tabel 'pplh_user_accounts' belum terbuat dalam database database Supabase Anda. Sila jalankan script SQL Schema SQL Editor di sebelah kanan.`
        };
      }
      
      return {
        connected: false,
        hasTables: false,
        userCount: 0,
        error: error.message
      };
    }
    
    return {
      connected: true,
      hasTables: true,
      userCount: data ? data.length : 0
    };
  } catch (err: any) {
    console.error('Test connection exception:', err);
    return {
      connected: false,
      hasTables: false,
      userCount: 0,
      error: err?.message || String(err)
    };
  }
}

/**
 * Seeds default initial users to Supabase database.
 */
export async function seedInitialUsersToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Klien Supabase belum dikonfigurasi.' };
  }

  try {
    const dbRows = initialUsers.map((user) => ({
      id: user.id,
      username: user.username,
      password: user.password || '123',
      role: user.role,
      nama: user.nama,
      nip: user.nip,
      jabatan: user.jabatan || null,
      unit_kerja: user.unitKerja || 'Pusat Pengendalian Lingkungan Hidup Suma',
      masa_kerja: user.masaKerja || null,
      bidang_wilayah: user.bidangWilayah || null,
      signature_img: user.signatureImg || null,
    }));

    const { error } = await client.from('pplh_user_accounts').upsert(dbRows, { onConflict: 'id' });
    if (error) {
      console.error('Error seeding initial users:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: dbRows.length };
  } catch (err: any) {
    console.error('Exception seeding users:', err);
    return { success: false, count: 0, error: err?.message || String(err) };
  }
}

/**
 * Seeds default initial requests to Supabase database.
 */
export async function seedInitialRequestsToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Klien Supabase belum dikonfigurasi.' };
  }

  try {
    const dbRows = initialRequests.map((req) => ({
      id: req.id,
      nomor_surat: req.nomorSurat || null,
      tanggal_form: req.tanggalForm || null,
      kepada_yth: req.kepadaYth || 'Kepada Yth. PPLH Sulawesi dan Maluku di Tempat',
      pegawai: req.pegawai,
      jenis_cuti: req.jenisCuti,
      alasan_cuti: req.alasanCuti,
      lamanya_cuti: req.lamanyaCuti,
      tanggal_mulai: req.tanggalMulai,
      tanggal_selesai: req.tanggalSelesai,
      catatan_cuti: req.catatanCuti,
      alamat_selama_cuti: req.alamatSelamaCuti,
      telepon: req.telepon,
      atasan: req.atasan,
      pejabat: req.pejabat,
      status_pengajuan: req.statusPengajuan,
      created_at: req.createdAt || new Date().toISOString(),
    }));

    const { error } = await client.from('pplh_leave_requests').upsert(dbRows, { onConflict: 'id' });
    if (error) {
      console.error('Error seeding initial requests:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: dbRows.length };
  } catch (err: any) {
    console.error('Exception seeding requests:', err);
    return { success: false, count: 0, error: err?.message || String(err) };
  }
}

/**
 * Fetches users from Supabase.
 */
export async function fetchUsersFromSupabase(): Promise<UserAccount[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('pplh_user_accounts')
      .select('*')
      .order('nama', { ascending: true });

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return null;
    }

    // Map database properties (under_score) to model properties (camelCase)
    return (data || []).map((row: any) => ({
      id: row.id,
      username: row.username,
      password: row.password,
      role: row.role,
      nama: row.nama,
      nip: row.nip,
      jabatan: row.jabatan,
      unitKerja: row.unit_kerja,
      masaKerja: row.masa_kerja,
      bidangWilayah: row.bidang_wilayah,
      signatureImg: row.signature_img || undefined,
    }));
  } catch (e) {
    console.error('Exception fetching users:', e);
    return null;
  }
}

/**
 * Upsert a user to Supabase
 */
export async function upsertUserToSupabase(user: UserAccount): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const dbRow: any = {
      id: user.id,
      username: user.username,
      password: user.password || '123',
      role: user.role,
      nama: user.nama,
      nip: user.nip,
      jabatan: user.jabatan || null,
      unit_kerja: user.unitKerja || 'Pusat Pengendalian Lingkungan Hidup Suma',
      masa_kerja: user.masaKerja || null,
      bidang_wilayah: user.bidangWilayah || null,
      signature_img: user.signatureImg || null,
    };

    const { error } = await client
      .from('pplh_user_accounts')
      .upsert(dbRow, { onConflict: 'id' });

    if (error) {
      console.warn('Error saving user with signatureImg column, trying fallback without signature_img:', error);
      delete dbRow.signature_img;
      const { error: fallbackError } = await client
        .from('pplh_user_accounts')
        .upsert(dbRow, { onConflict: 'id' });

      if (fallbackError) {
        console.error('Error saving user to Supabase in fallback:', fallbackError);
        return false;
      }
    }
    return true;
  } catch (e) {
    console.error('Exception saving user:', e);
    return false;
  }
}

/**
 * Delete a user from Supabase
 */
export async function deleteUserFromSupabase(userId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('pplh_user_accounts')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception deleting user:', e);
    return false;
  }
}

/**
 * Fetch leave requests from Supabase
 */
export async function fetchRequestsFromSupabase(): Promise<LeaveRequest[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('pplh_leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests from Supabase:', error);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      nomorSurat: row.nomor_surat,
      tanggalForm: row.tanggal_form,
      kepadaYth: row.kepada_yth,
      pegawai: row.pegawai,
      jenisCuti: row.jenis_cuti,
      alasanCuti: row.alasan_cuti,
      lamanyaCuti: row.lamanya_cuti,
      tanggalMulai: row.tanggal_mulai,
      tanggalSelesai: row.tanggal_selesai,
      catatanCuti: row.catatan_cuti,
      alamatSelamaCuti: row.alamat_selama_cuti,
      telepon: row.telepon,
      atasan: row.atasan,
      pejabat: row.pejabat,
      statusPengajuan: row.status_pengajuan,
      createdAt: row.created_at,
    }));
  } catch (e) {
    console.error('Exception fetching requests:', e);
    return null;
  }
}

/**
 * Upsert a leave request to Supabase
 */
export async function upsertRequestToSupabase(req: LeaveRequest): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const dbRow = {
      id: req.id,
      nomor_surat: req.nomorSurat || null,
      tanggal_form: req.tanggalForm || null,
      kepada_yth: req.kepadaYth || 'Kepada Yth. PPLH Sulawesi dan Maluku di Tempat',
      pegawai: req.pegawai,
      jenis_cuti: req.jenisCuti,
      alasan_cuti: req.alasanCuti,
      lamanya_cuti: req.lamanyaCuti,
      tanggal_mulai: req.tanggalMulai,
      tanggal_selesai: req.tanggalSelesai,
      catatan_cuti: req.catatanCuti,
      alamat_selama_cuti: req.alamatSelamaCuti,
      telepon: req.telepon,
      atasan: req.atasan,
      pejabat: req.pejabat,
      status_pengajuan: req.statusPengajuan,
      created_at: req.createdAt || new Date().toISOString(),
    };

    const { error } = await client
      .from('pplh_leave_requests')
      .upsert(dbRow, { onConflict: 'id' });

    if (error) {
      console.error('Error saving request to Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception saving request:', e);
    return false;
  }
}
export async function deleteRequestFromSupabase(requestId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('pplh_leave_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error deleting request from Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception deleting request:', e);
    return false;
  }
}
