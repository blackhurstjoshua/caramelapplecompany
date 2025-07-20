<script lang="ts">
  export let blockedDates: string[] = [];
  export let editMode = false;
  export let selectedDate: string | null = null;
  export let currentMonth: Date = new Date();
  
  // Callback props instead of event dispatcher
  export let onDateSelect: ((date: string) => void) | undefined = undefined;
  export let onScheduleUpdate: ((blockedDates: string[]) => void) | undefined = undefined;
  export let onSave: ((blockedDates: string[]) => void) | undefined = undefined;
  export let onCancel: (() => void) | undefined = undefined;
  
  let editingBlockedDates: string[] = [];
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
    // Initialize editing with current blocked dates
    editingBlockedDates = [...blockedDates];
    isEditing = true;
  }
  
  function cancelEditing() {
    editingBlockedDates = [];
    isEditing = false;
    onCancel?.();
  }
  
  function saveChanges() {
    onSave?.(editingBlockedDates);
    isEditing = false;
  }
  
  function toggleDayAvailability(dateStr: string) {
    if (isEditing) {
      // Toggle blocked status - add/remove from blocked list
      const currentlyBlocked = editingBlockedDates.includes(dateStr);
      if (currentlyBlocked) {
        editingBlockedDates = editingBlockedDates.filter(date => date !== dateStr);
      } else {
        editingBlockedDates = [...editingBlockedDates, dateStr];
      }
      onScheduleUpdate?.(editingBlockedDates);
    } else if (!editMode) {
      // Customer selection mode
      selectedDate = dateStr;
      onDateSelect?.(dateStr);
    }
  }
  

  
  function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }
  
  $: calendarDays = getCalendarDays(currentMonth);
  
  // Create reactive availability checker
  $: getAvailability = (dateStr: string, dayOfWeek: number) => {
    // Sunday is always blocked (dayOfWeek === 0)
    if (dayOfWeek === 0) return false;
    
    // Check if date is in blocked list
    const blockedList = isEditing ? editingBlockedDates : blockedDates;
    return !blockedList.includes(dateStr);
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
      <span>Click on days to toggle availability. Green = Available, Red = Unavailable</span>
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
          {@const isAvailable = getAvailability(dateStr, dayOfWeek)}
          {@const isPast = isPastDate(day)}
          {@const isSelected = selectedDate === dateStr}
          
          <button
             class="calendar-day {isAvailable ? 'available' : 'unavailable'} {isSelected ? 'selected' : ''} {isPast ? 'past' : ''} {isEditing ? 'editing' : ''}"
             disabled={isPast && !editMode}
             on:click={() => toggleDayAvailability(dateStr)}
             aria-label="{monthNames[day.getMonth()]} {day.getDate()}, {isAvailable ? 'Available' : 'Unavailable'}"
           >
             <span class="day-number">{day.getDate()}</span>
             
             <!-- Always show availability indicator -->
             {#if !isPast}
               <span class="status-indicator {isAvailable ? 'available-dot' : 'unavailable-dot'}"></span>
             {/if}
           </button>
        {/if}
      {/each}
    </div>
  </div>
  
  <!-- Legend -->
  <div class="flex justify-center gap-6 mt-6 text-sm">
    {#if isEditing}
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
        <span>Available (Green Dot)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
        <span>Unavailable (Red Dot)</span>
      </div>
    {:else}
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-success rounded"></div>
        <span>Available</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-error rounded"></div>
        <span>Unavailable</span>
      </div>
      {#if !editMode}
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-gray-300 rounded"></div>
          <span>Past Date</span>
        </div>
      {/if}
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
    border: 2px solid transparent;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    transition: all 0.2s ease;
    position: relative;
    cursor: pointer;
  }
  
  .calendar-day:not(.past):hover {
    scale: 1.05;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .calendar-day.available {
    background-color: hsl(var(--su));
    color: hsl(var(--suc));
  }
  
  .calendar-day.unavailable {
    background-color: hsl(var(--er));
    color: hsl(var(--erc));
  }
  
  .calendar-day.past {
    background-color: hsl(var(--n));
    color: hsl(var(--nc));
    opacity: 0.5;
    cursor: not-allowed;
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
  
  .status-indicator {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
  
  .status-indicator.available-dot {
    background-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
  }
  
  .status-indicator.unavailable-dot {
    background-color: #ef4444;
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
  }
</style> 