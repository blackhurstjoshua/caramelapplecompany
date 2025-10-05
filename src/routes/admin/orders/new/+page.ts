import type { PageLoad } from './$types';
import { getAllProducts } from '$lib/services/products';
import { getSchedule } from '$lib/services/schedule';
import type { DateAvailability } from '$lib/types';
import type { ScheduleBlock } from '$lib/stores/schedule';

export const load: PageLoad = async () => {
  try {
    const [products, scheduleBlocks] = await Promise.all([
      getAllProducts(),
      getSchedule()
    ]);
    
    // Convert ScheduleBlock format to DateAvailability format for compatibility
    const dateAvailability: DateAvailability[] = scheduleBlocks.map((block: ScheduleBlock) => ({
      date: block.blockedDate,
      deliveryAvailable: !block.deliveryBlocked,
      pickupAvailable: !block.pickupBlocked,
      reason: block.reason
    }));
    
    return {
      products,
      dateAvailability
    };
  } catch (error) {
    console.error("Error loading new order page: ", error);
    return {
      products: [],
      dateAvailability: [],
      error: 'Failed to load products or schedule'
    };
  }
};
