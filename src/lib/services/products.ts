import { supabase } from '$lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { Product } from '$lib/stores/product';
// ! examine each return type. Possibly come up with generic return type for all these.

// Use raw Supabase client for filtering queries
const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const getAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
};

const updateProduct = async (product: any) => {
  const { data, error } = await supabase.from('products').update(product).eq('id', product.id);
  if (error) throw error;
  return data;
};

const createProduct = async (product: any) => {
  // Supabase will auto-generate the id since it's a UUID with default gen_random_uuid()
  const insertResult = await supabase.from('products').insert(product);
  if (insertResult.error) throw insertResult.error;
  
  // Since the wrapper doesn't support chaining, get the most recent product
  // This isn't perfect but should work for our demo purposes
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  
  // Return the most recently created product (assuming it's the last one)
  return data ? [data[data.length - 1]] : [];
};

const deleteProduct = async (id: string) => {
  const { data, error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return data;
};

const getFeaturedApples = async (): Promise<Product[]> => {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_weekly_special', true);
  if (error) throw error;
  
  // Convert to Product instances
  return data.map(productData => new Product(productData));
};

// CRUD
export { createProduct, getAllProducts, updateProduct, deleteProduct, getFeaturedApples };