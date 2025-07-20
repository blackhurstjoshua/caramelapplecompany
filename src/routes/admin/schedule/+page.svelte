<script lang="ts">
  import Calendar from '$lib/components/Calendar.svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let blockedDates: string[] = data.blockedDates;
  let currentMonth = new Date();
  let saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
  
  async function handleSave(newBlockedDates: string[]) {
    saveStatus = 'saving';
    
    try {
      // Here you would normally save to your database
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      blockedDates = newBlockedDates;
      saveStatus = 'saved';
      
      // Reset status after 3 seconds
      setTimeout(() => {
        saveStatus = 'idle';
      }, 3000);
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      saveStatus = 'error';
      
      setTimeout(() => {
        saveStatus = 'idle';
      }, 3000);
    }
  }
  
  function handleCancel() {
    saveStatus = 'idle';
  }
</script>

<svelte:head>
  <title>Delivery Schedule | Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Delivery Schedule Management</h1>
      <p class="text-gray-600">
        Manage which dates are available for apple deliveries. Click "Edit Schedule" to toggle day availability.
      </p>
    </div>
    
    <!-- Save Status -->
    {#if saveStatus !== 'idle'}
      <div class="mb-6">
        {#if saveStatus === 'saving'}
          <div class="alert alert-info">
            <span class="loading loading-spinner loading-sm"></span>
            <span>Saving schedule changes...</span>
          </div>
        {:else if saveStatus === 'saved'}
          <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Schedule updated successfully!</span>
          </div>
        {:else if saveStatus === 'error'}
          <div class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error saving schedule. Please try again.</span>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Calendar Component -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <Calendar
        {blockedDates}
        {currentMonth}
        editMode={true}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
    
    <!-- Usage Instructions -->
    <div class="mt-8 bg-gray-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">How to use:</h3>
      <ul class="space-y-2 text-gray-700">
        <li>• <strong>Default Availability:</strong> All days except Sundays are available by default</li>
        <li>• <strong>Edit Schedule:</strong> Click the "Edit Schedule" button to enable editing mode</li>
        <li>• <strong>Block/Unblock Days:</strong> Click on any day to block (red dot) or unblock (green dot) it</li>
        <li>• <strong>Save Changes:</strong> Click "Save Changes" to confirm your updates</li>
        <li>• <strong>Cancel:</strong> Click "Cancel" to discard any unsaved changes</li>
        <li>• <strong>Visual Indicators:</strong> Green dots = Available, Red dots = Blocked, Sundays always blocked</li>
      </ul>
    </div>
  </div>
</div>