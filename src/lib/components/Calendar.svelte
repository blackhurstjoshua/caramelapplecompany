<script lang="ts">
  import type { DateAvailability } from '$lib/types';
  
  export let dateAvailability: DateAvailability[] = [];
  export let editMode = false;
  export let selectedDate: string | null = null;
  export let currentMonth: Date = new Date();
  export let retrievalMethod: 'pickup' | 'delivery' | null = null; // Filter dates based on retrieval method
  
  // Debug logging
  // $: {
  //   console.log('Calendar received dateAvailability:', dateAvailability);
  //   console.log('Number of availability entries:', dateAvailability.length);
  // }
  
  // Callback props instead of event dispatcher
  export let onDateSelect: ((date: string) => void) | undefined = undefined;
  export let onScheduleUpdate: ((availability: DateAvailability[]) => void) | undefined = undefined;
  export let onSave: ((availability: DateAvailability[]) => void) | undefined = undefined;
  export let onCancel: (() => void) | undefined = undefined;
  
  let editingAvailability: DateAvailability[] = [];
  let isEditing = false;
  
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
    // Initialize editing with current availability
    editingAvailability = [...dateAvailability];
    isEditing = true;
  }
  
  function cancelEditing() {
    editingAvailability = [];
    isEditing = false;
    onCancel?.();
  }
  
  function saveChanges() {
    onSave?.(editingAvailability);
    isEditing = false;
  }
  
  function getDateAvailability(dateStr: string, availabilityList: DateAvailability[]): DateAvailability {
    const availability = availabilityList.find(a => a.date === dateStr);
    if (availability) {
      console.log(`Found schedule data for ${dateStr}:`, availability);
      return availability;
    }
    
    // Default behavior based on day of week
    const dayOfWeek = new Date(dateStr).getDay();
    if (dayOfWeek === 6) { // Sunday
      console.log(`Using Sunday default for ${dateStr}`);
      return { date: dateStr, deliveryAvailable: false, pickupAvailable: true }; // Sunday default: pickup only
    } else {
      console.log(`Using weekday default for ${dateStr}`);
      return { date: dateStr, deliveryAvailable: true, pickupAvailable: true }; // Other days: both available
    }
  }
  
  function setDateAvailability(dateStr: string, availability: Partial<DateAvailability>, availabilityList: DateAvailability[]): DateAvailability[] {
    const existingIndex = availabilityList.findIndex(a => a.date === dateStr);
    if (existingIndex >= 0) {
      // Update existing
      availabilityList[existingIndex] = { ...availabilityList[existingIndex], ...availability };
      return [...availabilityList];
    } else {
      // Add new
      return [...availabilityList, { date: dateStr, deliveryAvailable: true, pickupAvailable: true, ...availability }];
    }
  }
  
  function toggleDayAvailability(dateStr: string) {
    if (isEditing) {
      // Cycle through 4 states: both → delivery only → pickup only → unavailable → both
      const current = getDateAvailability(dateStr, editingAvailability);
      let newAvailability: Partial<DateAvailability>;
      
      if (current.deliveryAvailable && current.pickupAvailable) {
        // Both available → Delivery only
        newAvailability = { deliveryAvailable: true, pickupAvailable: false };
      } else if (current.deliveryAvailable && !current.pickupAvailable) {
        // Delivery only → Pickup only
        newAvailability = { deliveryAvailable: false, pickupAvailable: true };
      } else if (!current.deliveryAvailable && current.pickupAvailable) {
        // Pickup only → Unavailable
        newAvailability = { deliveryAvailable: false, pickupAvailable: false };
      } else {
        // Unavailable → Both available
        newAvailability = { deliveryAvailable: true, pickupAvailable: true };
      }
      
      editingAvailability = setDateAvailability(dateStr, newAvailability, editingAvailability);
      onScheduleUpdate?.(editingAvailability);
    } else if (!editMode) {
      // Customer selection mode - check if date is available for their retrieval method
      const availability = getDateAvailability(dateStr, dateAvailability);
      
      if (retrievalMethod === 'pickup' && !availability.pickupAvailable) {
        return; // Can't select this date for pickup
      }
      if (retrievalMethod === 'delivery' && !availability.deliveryAvailable) {
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
    
    const availability = getDateAvailability(dateStr, dateAvailability);
    
    if (retrievalMethod === 'pickup') {
      return availability.pickupAvailable;
    } else if (retrievalMethod === 'delivery') {
      return availability.deliveryAvailable;
    }
    
    // If no specific retrieval method, allow selection if either method is available
    return availability.pickupAvailable || availability.deliveryAvailable;
  }
  
  $: calendarDays = getCalendarDays(currentMonth);
  
  // Create reactive availability checker
  $: getAvailabilityForDate = (dateStr: string, dayOfWeek: number): DateAvailability => {
    // Get current availability list
    const availabilityList = isEditing ? editingAvailability : dateAvailability;
    return getDateAvailability(dateStr, availabilityList);
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
          on:click={() => navigateMonth(-1)}
          aria-label="Previous month"
        >
          ←
        </button>
        <button
          class="btn btn-circle btn-sm"
          on:click={() => navigateMonth(1)}
          aria-label="Next month"
        >
          →
        </button>
      </div>
    </div>
    
    {#if editMode}
      <div class="flex gap-2">
        {#if isEditing}
          <button class="btn btn-success btn-sm" on:click={saveChanges}>
            Save Changes
          </button>
          <button class="btn btn-outline btn-sm" on:click={cancelEditing}>
            Cancel
          </button>
        {:else}
          <button class="btn btn-primary btn-sm" on:click={startEditing}>
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
          {@const availability = getAvailabilityForDate(dateStr, dayOfWeek)}
          {@const isPast = isPastDate(day)}
          {@const isSelected = selectedDate === dateStr}
          {@const isSelectable = isDateSelectable(dateStr)}
          {@const cssClass = availability.deliveryAvailable && availability.pickupAvailable ? 'both-available' : 
                             availability.deliveryAvailable ? 'delivery-only' : 
                             availability.pickupAvailable ? 'pickup-only' : 'unavailable'}
          
          <button
             class="calendar-day {cssClass} {isSelected ? 'selected' : ''} {isPast ? 'past' : ''} {isEditing ? 'editing' : ''} {!isSelectable && !editMode ? 'not-selectable' : ''}"
             disabled={(isPast && !editMode) || (!isSelectable && !editMode)}
             on:click={() => toggleDayAvailability(dateStr)}
             aria-label="{monthNames[day.getMonth()]} {day.getDate()}, {availability.deliveryAvailable && availability.pickupAvailable ? 'Both Available' : availability.deliveryAvailable ? 'Delivery Only' : availability.pickupAvailable ? 'Pickup Only' : 'Unavailable'}"
           >
             <span class="day-number">{day.getDate()}</span>
             
             <!-- Show availability icons -->
             {#if !isPast}
               <span class="availability-icon">
                 {#if availability.deliveryAvailable && availability.pickupAvailable}
                   🚛📦
                 {:else if availability.deliveryAvailable}
                   🚛
                 {:else if availability.pickupAvailable}
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
    height: 60px;
  }
  
  .calendar-day {
    height: 60px;
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