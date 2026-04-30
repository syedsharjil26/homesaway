import { supabase } from '@/src/services/supabaseClient';

/**
 * Common Supabase database helper functions
 * Use these to interact with your Supabase tables
 */

export const supabaseDb = {
  /**
   * Select all rows from a table
   */
  async getAll<T>(table: string) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data as T[];
  },

  /**
   * Select rows by filter
   */
  async get<T>(table: string, filter: Record<string, any>) {
    let query = supabase.from(table).select('*');

    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  },

  /**
   * Get a single row by ID
   */
  async getById<T>(table: string, id: string | number) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data as T;
  },

  /**
   * Insert a single row
   */
  async insert<T>(table: string, row: Omit<T, 'id'>) {
    const { data, error } = await supabase.from(table).insert([row]).select().single();
    if (error) throw error;
    return data as T;
  },

  /**
   * Insert multiple rows
   */
  async insertMany<T>(table: string, rows: Omit<T, 'id'>[]) {
    const { data, error } = await supabase.from(table).insert(rows).select();
    if (error) throw error;
    return data as T[];
  },

  /**
   * Update a row by ID
   */
  async updateById<T>(table: string, id: string | number, updates: Partial<Omit<T, 'id'>>) {
    const { data, error } = await supabase
      .from(table)
      .update(updates as Record<string, any>)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  },

  /**
   * Delete a row by ID
   */
  async deleteById(table: string, id: string | number) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Count rows in a table (with optional filter)
   */
  async count(table: string, filter?: Record<string, any>) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  },

  /**
   * Check if row exists by ID
   */
  async exists(table: string, id: string | number): Promise<boolean> {
    try {
      const { error } = await supabase.from(table).select('id').eq('id', id).single();
      return !error;
    } catch {
      return false;
    }
  },
};

/**
 * Storage helper functions
 */
export const supabaseStorage = {
  /**
   * Upload a file to storage
   * @param bucketName - The storage bucket name
   * @param path - The file path (e.g., 'listings/image.jpg')
   * @param file - The file to upload (File or Blob)
   */
  async upload(bucketName: string, path: string, file: Blob) {
    const { data, error } = await supabase.storage.from(bucketName).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Download a file from storage
   */
  async download(bucketName: string, path: string) {
    const { data, error } = await supabase.storage.from(bucketName).download(path);
    if (error) throw error;
    return data;
  },

  /**
   * Get public URL for a file (assumes bucket is public)
   */
  getPublicUrl(bucketName: string, path: string) {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a file from storage
   */
  async delete(bucketName: string, path: string) {
    const { error } = await supabase.storage.from(bucketName).remove([path]);
    if (error) throw error;
  },

  /**
   * Delete multiple files from storage
   */
  async deleteMany(bucketName: string, paths: string[]) {
    const { error } = await supabase.storage.from(bucketName).remove(paths);
    if (error) throw error;
  },
};
