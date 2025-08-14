import type { PageLoad } from './$types';
import type { ScheduleData, DateAvailability } from '$lib/types';
import scheduleData from '$lib/schedule.json';

export const load: PageLoad = async () => {
  // Load schedule data fresh from server
  const data = scheduleData as ScheduleData;
  const dateAvailability: DateAvailability[] = data.dateAvailability || [];
  
  return {
    dateAvailability
  };
};

// Disable prerendering and caching to ensure fresh data
export const ssr = true;
export const prerender = false; 