import { supabase } from '$lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { Product } from '$lib/stores/product';

// Use raw Supabase client for filtering queries
const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const getAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false }); // NULLs go to end
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
    sort_order: product.sortOrder ?? product.sort_order,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase.from('products').update(dbProduct).eq('id', product.id);
  if (error) throw error;
  return data;
};

const createProduct = async (product: any) => {
  // Get the max sort_order to put new product at the end
  const { data: products, error: fetchError } = await supabaseClient
    .from('products')
    .select('sort_order')
    .not('sort_order', 'is', null) // Exclude NULL values
    .order('sort_order', { ascending: false })
    .limit(1);
  if (fetchError) throw fetchError;
  
  const maxSortOrder = products && products.length > 0 && products[0].sort_order !== null 
    ? products[0].sort_order 
    : 0;
  
  // Convert camelCase to snake_case for database
  // Handle both formats (camelCase from Product class or snake_case from admin)
  const dbProduct = {
    name: product.name,
    description: product.description,
    image_path: product.imagePath || product.image_path,
    featured: product.featured,
    price_cents: product.priceCents ?? product.price_cents,
    is_active: product.isActive ?? product.is_active ?? true, // Default to true if not specified
    sort_order: maxSortOrder + 1, // Place at the end
  };
  
  // Supabase will auto-generate the id since it's a UUID with default gen_random_uuid()
  const insertResult = await supabase.from('products').insert(dbProduct);
  if (insertResult.error) throw insertResult.error;
  
  // Get the most recently created product
  const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false }).limit(1);
  if (error) throw error;
  
  // Return the most recently created product
  return data || [];
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
    .eq('featured', true)
    .order('sort_order', { ascending: true, nullsFirst: false });
  if (error) throw error;
  
  // Convert to Product instances
  return data.map(productData => new Product(productData));
};

const getActiveProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true, nullsFirst: false });
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

/**
 * Swap two products' positions in the sort order
 * Uses a simple 3-step approach with NULL as temporary value
 * Only makes 3 database calls regardless of how many products exist
 */
const swapProductOrder = async (productId1: string, productId2: string) => {
  // Step 1: Get both products' current sort_order values
  const { data: products, error: fetchError } = await supabaseClient
    .from('products')
    .select('id, sort_order')
    .in('id', [productId1, productId2]);
  
  if (fetchError) throw fetchError;
  if (!products || products.length !== 2) {
    throw new Error('Could not find both products');
  }
  
  const product1 = products.find(p => p.id === productId1);
  const product2 = products.find(p => p.id === productId2);
  
  if (!product1 || !product2) {
    throw new Error('Could not find both products');
  }
  
  // Save the original values
  const product1OriginalSort = product1.sort_order;
  const product2OriginalSort = product2.sort_order;
  
  // Step 2: Set product1 to NULL (temporarily removes from order)
  const { error: error1 } = await supabase
    .from('products')
    .update({ sort_order: null, updated_at: new Date().toISOString() })
    .eq('id', productId1);
  
  if (error1) throw error1;
  
  // Step 3: Set product2 to product1's original position
  const { error: error2 } = await supabase
    .from('products')
    .update({ sort_order: product1OriginalSort, updated_at: new Date().toISOString() })
    .eq('id', productId2);
  
  if (error2) throw error2;
  
  // Step 4: Set product1 to product2's original position
  const { error: error3 } = await supabase
    .from('products')
    .update({ sort_order: product2OriginalSort, updated_at: new Date().toISOString() })
    .eq('id', productId1);
  
  if (error3) throw error3;
  
  return { success: true };
};

/**
 * Update a single product's sort_order
 */
const updateProductOrder = async (productId: string, newSortOrder: number) => {
  const { data, error } = await supabase
    .from('products')
    .update({ sort_order: newSortOrder, updated_at: new Date().toISOString() })
    .eq('id', productId);
  
  if (error) throw error;
  return data;
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
  searchProductsByName,
  swapProductOrder,
  updateProductOrder
};