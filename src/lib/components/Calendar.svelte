<script lang="ts">
  import type { ScheduleBlock } from '$lib/stores/schedule';
  
  export let schedule: ScheduleBlock[] = [];
  export let editMode = false;
  export let selectedDate: string | null = null;
  export let currentMonth: Date = new Date();
  export let retrievalMethod: 'pickup' | 'delivery' | null = null; // Filter dates based on retrieval method
 
  // Callback props instead of event dispatcher
  export let onDateSelect: ((date: string) => void) | undefined = undefined;
  export let onScheduleUpdate: ((schedule: ScheduleBlock[]) => void) | undefined = undefined;
  export let onSave: ((schedule: ScheduleBlock[]) => void) | undefined = undefined;
  export let onCancel: (() => void) | undefined = undefined;
  
  let editingSchedule: ScheduleBlock[] = [];
  let isEditing = false;
  let changedDates: Set<string> = new Set();
  
  // Calendar helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  function getCalendarDays(month: Date) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(new Date(year, monthIndex, day));
    }
    
    return days;
  }
  
  function navigateMonth(direction: number) {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
  }
  
  function startEditing() {
    // Initialize editing with current schedule
    editingSchedule = [...schedule];
    changedDates = new Set();
    isEditing = true;
  }
  
  function cancelEditing() {
    editingSchedule = [];
    changedDates = new Set();
    isEditing = false;
    onCancel?.();
  }
  
  function saveChanges() {
    // Only return the changed schedule blocks
    const changedBlocks = editingSchedule.filter(block => changedDates.has(block.blockedDate));
    onSave?.(changedBlocks);
    isEditing = false;
    changedDates = new Set();
  }
  
  function getScheduleBlock(dateStr: string, scheduleList: ScheduleBlock[]): ScheduleBlock {
    const scheduleBlock = scheduleList.find(block => block.blockedDate === dateStr);
    if (scheduleBlock) {
      return scheduleBlock;
    }
    
    // Default behavior based on day of week
    const dayOfWeek = new Date(dateStr).getDay();
    if (dayOfWeek === 6) { // Sunday
      return { 
        id: crypto.randomUUID(),
        blockedDate: dateStr, 
        deliveryBlocked: true, // Sunday default: delivery blocked (pickup only)
        pickupBlocked: false,
        createdAt: new Date().toISOString()
      }; 
    } else {
      return { 
        id: crypto.randomUUID(),
        blockedDate: dateStr, 
        deliveryBlocked: false, // Weekday default: both available
        pickupBlocked: false,
        createdAt: new Date().toISOString()
      }; 
    }
  }
  
  function setScheduleBlock(dateStr: string, scheduleUpdate: Partial<ScheduleBlock>, scheduleList: ScheduleBlock[]): ScheduleBlock[] {
    // Track that this date has been changed
    changedDates.add(dateStr);
    
    const existingIndex = scheduleList.findIndex(block => block.blockedDate === dateStr);
    if (existingIndex >= 0) {
      // Update existing
      scheduleList[existingIndex] = { ...scheduleList[existingIndex], ...scheduleUpdate };
      return [...scheduleList];
    } else {
      // Add new
      return [...scheduleList, { 
        id: crypto.randomUUID(),
        blockedDate: dateStr, 
        deliveryBlocked: false, 
        pickupBlocked: false,
        createdAt: new Date().toISOString(),
        ...scheduleUpdate 
      }];
    }
  }
  
  function toggleDayAvailability(dateStr: string) {
    if (isEditing) {
      // Cycle through 4 states: both → delivery only → pickup only → unavailable → both
      const current = getScheduleBlock(dateStr, editingSchedule);
      let newScheduleUpdate: Partial<ScheduleBlock>;
      
      if (!current.deliveryBlocked && !current.pickupBlocked) {
        // Both available → Delivery only (block pickup)
        newScheduleUpdate = { deliveryBlocked: false, pickupBlocked: true };
      } else if (!current.deliveryBlocked && current.pickupBlocked) {
        // Delivery only → Pickup only (block delivery)
        newScheduleUpdate = { deliveryBlocked: true, pickupBlocked: false };
      } else if (current.deliveryBlocked && !current.pickupBlocked) {
        // Pickup only → Unavailable (block both)
        newScheduleUpdate = { deliveryBlocked: true, pickupBlocked: true };
      } else {
        // Unavailable → Both available (unblock both)
        newScheduleUpdate = { deliveryBlocked: false, pickupBlocked: false };
      }
      
      editingSchedule = setScheduleBlock(dateStr, newScheduleUpdate, editingSchedule);
      onScheduleUpdate?.(editingSchedule);
    } else if (!editMode) {
      // Customer selection mode - check if date is available for their retrieval method
      const scheduleBlock = getScheduleBlock(dateStr, schedule);
      
      if (retrievalMethod === 'pickup' && scheduleBlock.pickupBlocked) {
        return; // Can't select this date for pickup
      }
      if (retrievalMethod === 'delivery' && scheduleBlock.deliveryBlocked) {
        return; // Can't select this date for delivery
      }
      
      selectedDate = dateStr;
      onDateSelect?.(dateStr);
    }
  }
  

  
  function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }
  
  function isDateSelectable(dateStr: string): boolean {
    if (editMode || isEditing) return true; // Admin can always interact with dates
    
    const scheduleBlock = getScheduleBlock(dateStr, schedule);
    
    if (retrievalMethod === 'pickup') {
      return !scheduleBlock.pickupBlocked;
    } else if (retrievalMethod === 'delivery') {
      return !scheduleBlock.deliveryBlocked;
    }
    
    // If no specific retrieval method, allow selection if either method is available
    return !scheduleBlock.pickupBlocked || !scheduleBlock.deliveryBlocked;
  }
  
  $: calendarDays = getCalendarDays(currentMonth);
  
  // Create reactive schedule checker
  $: getScheduleForDate = (dateStr: string, dayOfWeek: number): ScheduleBlock => {
    // Get current schedule list
    const scheduleList = isEditing ? editingSchedule : schedule;
    return getScheduleBlock(dateStr, scheduleList);
  };
</script>

<div class="calendar-container">
  <!-- Calendar Header -->
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-4">
      <h2 class="text-2xl font-bold">
        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
      </h2>
      <div class="flex gap-2">
        <button
          class="btn btn-circle btn-sm"
          onclick={() => navigateMonth(-1)}
          aria-label="Previous month"
        >
          ←
        </button>
        <button
          class="btn btn-circle btn-sm"
          onclick={() => navigateMonth(1)}
          aria-label="Next month"
        >
          →
        </button>
      </div>
    </div>
    
    {#if editMode}
      <div class="flex gap-2">
        {#if isEditing}
          <button class="btn btn-success btn-sm" onclick={saveChanges}>
            Save Changes
          </button>
          <button class="btn btn-outline btn-sm" onclick={cancelEditing}>
            Cancel
          </button>
        {:else}
          <button class="btn btn-primary btn-sm" onclick={startEditing}>
            Edit Schedule
          </button>
        {/if}
      </div>
    {/if}
  </div>
  
  <!-- Edit Mode Indicator -->
  {#if isEditing}
    <div class="alert alert-info mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Click on days to cycle through: 🚛📦 Both → 🚛 Delivery Only → 📦 Pickup Only → ❌ Unavailable</span>
    </div>
  {/if}
  
  <!-- Calendar Grid -->
  <div class="calendar-grid">
    <!-- Day Names Header -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      {#each dayNames as dayName}
        <div class="text-center text-sm font-semibold text-gray-600 py-2">
          {dayName}
        </div>
      {/each}
    </div>
    
    <!-- Calendar Days -->
    <div class="grid grid-cols-7 gap-1">
      {#each calendarDays as day}
        {#if day === null}
          <div class="calendar-day-empty"></div>
                {:else}
          {@const dateStr = formatDate(day)}
          {@const dayOfWeek = day.getDay()}
          {@const scheduleBlock = getScheduleForDate(dateStr, dayOfWeek)}
          {@const isPast = isPastDate(day)}
          {@const isSelected = selectedDate === dateStr}
          {@const isSelectable = isDateSelectable(dateStr)}
          {@const cssClass = !scheduleBlock.deliveryBlocked && !scheduleBlock.pickupBlocked ? 'both-available' : 
                             !scheduleBlock.deliveryBlocked ? 'delivery-only' : 
                             !scheduleBlock.pickupBlocked ? 'pickup-only' : 'unavailable'}
          
          <button
             class="calendar-day {cssClass} {isSelected ? 'selected' : ''} {isPast ? 'past' : ''} {isEditing ? 'editing' : ''} {!isSelectable && !editMode ? 'not-selectable' : ''}"
             disabled={(isPast && !editMode) || (!isSelectable && !editMode)}
             onclick={() => toggleDayAvailability(dateStr)}
             aria-label="{monthNames[day.getMonth()]} {day.getDate()}, {!scheduleBlock.deliveryBlocked && !scheduleBlock.pickupBlocked ? 'Both Available' : !scheduleBlock.deliveryBlocked ? 'Delivery Only' : !scheduleBlock.pickupBlocked ? 'Pickup Only' : 'Unavailable'}"
           >
             <span class="day-number">{day.getDate()}</span>
             
             <!-- Show availability icons -->
             {#if !isPast}
               <span class="availability-icon">
                 {#if !scheduleBlock.deliveryBlocked && !scheduleBlock.pickupBlocked}
                   🚛📦
                 {:else if !scheduleBlock.deliveryBlocked}
                   🚛
                 {:else if !scheduleBlock.pickupBlocked}
                   📦
                 {:else}
                   ❌
                 {/if}
               </span>
             {/if}
           </button>
        {/if}
      {/each}
    </div>
  </div>
  
  <!-- Legend -->
  <div class="flex justify-center gap-4 mt-6 text-sm flex-wrap">
    <div class="flex items-center gap-2">
      <span class="text-lg">🚛📦</span>
      <span>Both Available</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-lg">🚛</span>
      <span>Delivery Only</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-lg">📦</span>
      <span>Pickup Only</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-lg">❌</span>
      <span>Unavailable</span>
    </div>
    {#if !editMode}
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-gray-300 rounded"></div>
        <span>Past Date</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .calendar-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .calendar-day-empty {
    min-height: 60px;
  }
  
  .calendar-day {
    min-height: 60px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    transition: all 0.2s ease;
    position: relative;
    cursor: pointer;
    padding: 6px 4px;
  }
  
  /* Mobile: increase padding and let content determine height dynamically */
  @media (max-width: 640px) {
    .calendar-day {
      padding: 8px 4px 10px 4px;
      min-height: 60px;
      height: auto;
    }
    
    .availability-icon {
      line-height: 1.3;
      text-align: center;
    }
  }
  
  .calendar-day:not(.past):hover {
    scale: 1.05;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .calendar-day.both-available {
    background-color: white;
    color: #374151;
    border: 2px solid #e5e7eb;
  }
  
  .calendar-day.delivery-only {
    background-color: white;
    color: #374151;
    border: 2px solid #e5e7eb;
  }
  
  .calendar-day.pickup-only {
    background-color: white;
    color: #374151;
    border: 2px solid #e5e7eb;
  }
  
  .calendar-day.unavailable {
    background-color: #9ca3af;
    color: white;
    border: 2px solid #6b7280;
  }
  
  .calendar-day.past {
    background-color: hsl(var(--n));
    color: hsl(var(--nc));
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .calendar-day.not-selectable {
    background-color: #f3f4f6;
    color: #9ca3af;
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .calendar-day.not-selectable:hover {
    scale: 1;
    box-shadow: none;
  }
  
  .calendar-day.editing {
    border: 2px solid hsl(var(--p));
    cursor: pointer;
  }
  
  .calendar-day.editing:hover {
    border-color: hsl(var(--p));
    box-shadow: 0 0 0 2px hsl(var(--p) / 0.2);
  }
  
  .calendar-day.selected {
    border-color: hsl(var(--p));
    box-shadow: 0 0 0 3px hsl(var(--p) / 0.3);
  }
  
  .day-number {
    font-size: 1.1rem;
  }
  
  .availability-icon {
    font-size: 0.9rem;
    transition: all 0.2s ease;
    margin-top: 2px;
  }
</style> 