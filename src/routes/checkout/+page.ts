import type { PageLoad } from './$types';
import type { DateAvailability } from '$lib/types';
import type { ScheduleBlock } from '$lib/stores/schedule';
import { getSchedule } from '$lib/services/schedule';

export const load: PageLoad = async () => {
  // Load schedule data from database for customer date selection
  try {
    const scheduleBlocks: ScheduleBlock[] = await getSchedule();
    
    // Convert ScheduleBlock format to DateAvailability format for compatibility
    const dateAvailability: DateAvailability[] = scheduleBlocks.map(block => ({
      date: block.blockedDate,
      deliveryAvailable: !block.deliveryBlocked,
      pickupAvailable: !block.pickupBlocked,
      reason: block.reason
    }));
    
    return {
      dateAvailability
    };
  } catch (error) {
    console.error('Error loading schedule data:', error);
    return {
      dateAvailability: []
    };
  }
};

// Disable prerendering and caching to ensure fresh data
export const ssr = true;
export const prerender = false;
