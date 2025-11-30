import type { PageLoad } from './$types';
import { getAllProducts } from '$lib/services/products';
import { getSchedule } from '$lib/services/schedule';
import { getAllStores } from '$lib/services/stores';
import type { DateAvailability } from '$lib/types';
import type { ScheduleBlock } from '$lib/stores/schedule';

export const load: PageLoad = async () => {
  // Load each resource independently so one failure doesn't affect the others
  let products: any[] = [];
  let scheduleBlocks: ScheduleBlock[] = [];
  let stores: any[] = [];
  
  // Try to load products (may fail if sort_order column doesn't exist)
  try {
    products = await getAllProducts();
  } catch (error) {
    console.error("Error loading products:", error);
  }
  
  // Try to load schedule
  try {
    scheduleBlocks = await getSchedule();
  } catch (error) {
    console.error("Error loading schedule:", error);
  }
  
  // Try to load stores
  try {
    stores = await getAllStores();
  } catch (error) {
    console.error("Error loading stores:", error);
  }
  
  // Convert ScheduleBlock format to DateAvailability format for compatibility
  const dateAvailability: DateAvailability[] = scheduleBlocks.map((block: ScheduleBlock) => ({
    date: block.blockedDate,
    deliveryAvailable: !block.deliveryBlocked,
    pickupAvailable: !block.pickupBlocked,
    reason: block.reason
  }));
  
  return {
    products,
    dateAvailability,
    stores
  };
};
