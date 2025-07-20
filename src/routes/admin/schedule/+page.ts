import type { PageLoad } from './$types';
import type { ScheduleData } from '$lib/types';
import scheduleData from '$lib/schedule.json';

export const load: PageLoad = async () => {
  // Load schedule data fresh from server
  const data = scheduleData as ScheduleData;
  const blockedDates: string[] = data.blockedDates;
  
  return {
    blockedDates
  };
};

// Disable prerendering and caching to ensure fresh data
export const ssr = true;
export const prerender = false; 