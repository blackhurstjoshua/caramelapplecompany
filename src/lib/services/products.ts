import { supabase } from '$lib/supabase';
import type { Product } from '$lib/stores/product';
// ! examine each return type. Possibly come up with generic return type for all these.

const getAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
};

const getWeeklySpecials = async () => {
  const { data, error } = await supabase.from('products').select('*').eq('is_weekly_special', true);
  if (error) throw error;
  return data;
}

const updateProduct = async (product: Product) => {
  const { data, error } = await supabase.from('products').update(product).eq('id', product.id);
  if (error) throw error;
  return data;
};

const createProduct = async (product: Product) => {
  // ! this won't have an id... will supabase auto generate it?
  const { data, error } = await supabase.from('products').insert(product);
  if (error) throw error;
  return data;
};

const deleteProduct = async (id: string) => {
  const { data, error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return data;
};

// CRUD
export { createProduct, getAllProducts, getWeeklySpecials, updateProduct, deleteProduct };