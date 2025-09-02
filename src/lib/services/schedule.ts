import { supabase } from "$lib/supabase";
import type { ScheduleBlock } from "$lib/stores/schedule";

const getSchedule = async (): Promise<ScheduleBlock[]> => {
  const { data, error } = await supabase.from('schedule').select('*');
  if (error) throw error;
  return data;
};

const upsertSchedule = async (schedule: ScheduleBlock) => {
  console.log("Upserting schedule: ", schedule);
  const { data, error } = await supabase.from('schedule').upsert(schedule, { onConflict: 'id' }).select();
  if (error) throw error;
  return data;
};

const editSchedule = async (schedule: ScheduleBlock) => {
  const { data, error } = await supabase
    .from('schedule')
    .upsert(schedule, { onConflict: 'id' })
    .select();
  
  if (error) throw error;
  return data;
};

export { getSchedule, upsertSchedule, editSchedule };