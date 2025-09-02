import type { PageLoad } from './$types';
import type { ScheduleBlock } from '$lib/stores/schedule';
import { getSchedule } from '$lib/services/schedule';

export const load: PageLoad = async () => {
  // Load schedule data fresh from server
  try {
    const schedule = await getSchedule();
    return {
      schedule
    };
  } catch (error) {
    console.error("Error loading schedule: ", error);
    return {
      schedule: []
    };
  }
};

// Disable prerendering and caching to ensure fresh data
export const ssr = true;
export const prerender = false; 