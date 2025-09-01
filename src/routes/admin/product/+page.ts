import type { PageLoad } from './$types';
import { getAllProducts } from '$lib/services/products';

export const load: PageLoad = async () => {
  try {
    const products = await getAllProducts();
    console.log("Products: ", products);
    return {
      products: products
    }
  } catch (error) {
    console.error("Caught error in +page.ts: ", error);
    return {
      products: []
    };
  }
}; 