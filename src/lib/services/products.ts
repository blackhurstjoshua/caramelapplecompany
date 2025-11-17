import { supabase } from '$lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { Product } from '$lib/stores/product';

// Use raw Supabase client for filtering queries
const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const getAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
};

const updateProduct = async (product: any) => {
  // Convert camelCase to snake_case for database
  const dbProduct = {
    name: product.name,
    description: product.description,
    image_path: product.imagePath,
    featured: product.featured,
    price_cents: product.priceCents,
    is_active: product.isActive,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase.from('products').update(dbProduct).eq('id', product.id);
  if (error) throw error;
  return data;
};

const createProduct = async (product: any) => {
  // Convert camelCase to snake_case for database
  // Handle both formats (camelCase from Product class or snake_case from admin)
  const dbProduct = {
    name: product.name,
    description: product.description,
    image_path: product.imagePath || product.image_path,
    featured: product.featured,
    price_cents: product.priceCents ?? product.price_cents,
    is_active: product.isActive ?? product.is_active ?? true, // Default to true if not specified
  };
  
  // Supabase will auto-generate the id since it's a UUID with default gen_random_uuid()
  const insertResult = await supabase.from('products').insert(dbProduct);
  if (insertResult.error) throw insertResult.error;
  
  // Since the wrapper doesn't support chaining, get the most recent product
  // This isn't perfect but should work for our demo purposes
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  
  // Return the most recently created product (assuming it's the last one)
  return data ? [data[data.length - 1]] : [];
};

const deleteProduct = async (id: string) => {
  // Soft delete - just mark as inactive instead of actually deleting
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  return data;
};

const reactivateProduct = async (id: string) => {
  // Reactivate a previously deactivated product
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  return data;
};

const getFeaturedApples = async (): Promise<Product[]> => {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('featured', true);
  if (error) throw error;
  
  // Convert to Product instances
  return data.map(productData => new Product(productData));
};

const getActiveProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true);
  if (error) throw error;
  
  // Convert to Product instances
  return data.map(productData => new Product(productData));
};

/**
 * Search products by name for order item editing
 * Returns minimal fields needed for product picker
 * Searches across ALL products (including inactive ones)
 */
const searchProductsByName = async (term: string): Promise<Array<{
  id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  price_cents: number;
  is_active: boolean;
}>> => {
  if (!term || term.trim().length === 0) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('products')
    .select('id, name, description, image_path, price_cents, is_active')
    .ilike('name', `%${term}%`)
    .order('is_active', { ascending: false }) // Active products first
    .order('name', { ascending: true })
    .limit(20);
  
  if (error) throw error;
  return data || [];
};

// CRUD
export { 
  createProduct, 
  getAllProducts, 
  updateProduct, 
  deleteProduct, 
  reactivateProduct, 
  getFeaturedApples, 
  getActiveProducts,
  searchProductsByName
};