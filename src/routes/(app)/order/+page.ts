import type { PageLoad } from './$types';
import { getAllProducts } from '$lib/services/products';

export const load: PageLoad = async () => {
  try {
    const products = await getAllProducts();
    return {
      products
    };
  } catch (error) {
    console.error("Error loading products: ", error);
    return {
      products: []
    };
  }
}; 