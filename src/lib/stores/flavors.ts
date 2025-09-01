import { writable } from 'svelte/store';

export interface Flavor {
  id: string;
  name: string;
  description: string;
  image: string;
  isWeeklySpecial: boolean;
  price: number;
}
// needs to pull products from supabase and cast them to Flavor
import { getWeeklySpecials } from '$lib/services/products';

export const fetchWeeklyFlavors = async () => {
  const products = await getWeeklySpecials();
  return products.map(product => ({
    ...product,
    isWeeklySpecial: product.is_weekly_special
  }));
};

export const weeklyFlavors = writable<Flavor[]>([
  {
    id: '1',
    name: 'Classic Caramel Apple',
    description: 'Our signature crisp apple dipped in golden caramel and rolled in chopped pecans',
    image: '/images/classic-caramel.jpg',
    isWeeklySpecial: true,
    price: 12.99
  },
  {
    id: '2', 
    name: 'Chocolate Drizzle Delight',
    description: 'Fresh apple with caramel coating drizzled with rich dark chocolate',
    image: '/images/chocolate-drizzle.jpg',
    isWeeklySpecial: true,
    price: 14.99
  },
  {
    id: '3',
    name: 'Cinnamon Sugar Crunch',
    description: 'Apple dipped in caramel and rolled in cinnamon sugar with graham cracker crumbs',
    image: '/images/cinnamon-crunch.jpg', 
    isWeeklySpecial: false,
    price: 13.99
  }
]); 