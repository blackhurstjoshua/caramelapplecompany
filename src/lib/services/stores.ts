import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Use raw Supabase client for queries
const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export interface Store {
  id: string;
  name: string;
  contact: string | null;
  address: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParsedAddress {
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Parse an address string into components
 * Handles formats like:
 * - "759 E 400 S. Springville, UT 84663"
 * - "5521 Timpanogos Hwy, Highland UT 84003"
 * - "4587 W. Cedar Hills Dr. Ste 200 Cedar Hills, UT 84062"
 */
export function parseAddress(address: string): ParsedAddress {
  // Remove extra spaces and normalize
  const normalized = address.trim().replace(/\s+/g, ' ');
  
  // Try to match pattern: [street address], [city], [state] [zip]
  // OR: [street address], [city] [state] [zip] (without comma before state)
  const pattern1 = /^(.+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5})$/;
  const pattern2 = /^(.+),\s*([^,]+)\s+([A-Z]{2})\s+(\d{5})$/;
  
  let match = normalized.match(pattern1) || normalized.match(pattern2);
  
  if (match) {
    return {
      addressLine1: match[1].trim(),
      city: match[2].trim(),
      state: match[3].trim(),
      zip: match[4].trim()
    };
  }
  
  // Fallback: Try to extract at least the zip and state from the end
  const fallbackPattern = /^(.+?)\s+([A-Z]{2})\s+(\d{5})$/;
  const fallbackMatch = normalized.match(fallbackPattern);
  
  if (fallbackMatch) {
    const beforeStateZip = fallbackMatch[1];
    // Try to split on last comma to separate street from city
    const lastComma = beforeStateZip.lastIndexOf(',');
    if (lastComma > 0) {
      return {
        addressLine1: beforeStateZip.substring(0, lastComma).trim(),
        city: beforeStateZip.substring(lastComma + 1).trim(),
        state: fallbackMatch[2].trim(),
        zip: fallbackMatch[3].trim()
      };
    }
    // No comma found, just put everything in addressLine1
    return {
      addressLine1: beforeStateZip.trim(),
      city: '',
      state: fallbackMatch[2].trim(),
      zip: fallbackMatch[3].trim()
    };
  }
  
  // Ultimate fallback: put entire address in addressLine1
  return {
    addressLine1: normalized,
    city: '',
    state: '',
    zip: ''
  };
}

/**
 * Get all stores from the database
 */
export async function getAllStores(): Promise<Store[]> {
  const { data, error } = await supabaseClient
    .from('stores')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('[Stores Service] Error fetching stores:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Get a single store by ID
 */
export async function getStoreById(id: string): Promise<Store | null> {
  const { data, error } = await supabaseClient
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching store:', error);
    throw error;
  }
  
  return data;
}

export const StoreService = {
  getAllStores,
  getStoreById,
  parseAddress
};

