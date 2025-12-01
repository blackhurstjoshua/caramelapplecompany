import type { PageLoad } from './$types';
import { getActiveProducts } from '$lib/services/products';

export const load: PageLoad = async () => {
  try {
    const products = await getActiveProducts();
    return {
      products
    }
  } catch (error) {
    console.error("Error loading products: ", error);
    return {
      products: []
    };
  }
};
