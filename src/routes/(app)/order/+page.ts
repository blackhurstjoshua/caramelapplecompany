import type { PageLoad } from './$types';
import type { Flavor } from '$lib/stores/flavors';
import productsData from '$lib/products.json';

export const load: PageLoad = async () => {
  const products: Flavor[] = productsData;
  
  return {
    products
  };
}; 