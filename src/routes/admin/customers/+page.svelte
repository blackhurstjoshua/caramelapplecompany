<script lang="ts">
  import DataTable from '$lib/components/DataTable.svelte';
  import type { TableColumn } from '$lib/types';
  import type { Customer } from '$lib/services/customers';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  
  let { data }: { data: PageData } = $props();
  
  const columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', width: '150px' },
    { key: 'join_date', label: 'Join Date', width: '120px' }
  ];
  
  function handleCustomerClick(customer: Customer) {
    // Navigate to customer details page
    goto(`/admin/customers/${customer.id}`);
  }
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Export to CSV
  let isExporting = $state(false);
  
  async function exportToCSV() {
    try {
      isExporting = true;
      const response = await fetch('/api/admin/customers/export');
      
      if (!response.ok) {
        throw new Error('Failed to export customers');
      }
      
      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'customers_export.csv';
      
      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting customers:', error);
      alert('Failed to export customers. Please try again.');
    } finally {
      isExporting = false;
    }
  }
  
  // Process data to format dates and handle missing values
  let processedCustomers = $derived((data.customers || []).map(customer => ({
    ...customer,
    join_date: formatDate(customer.join_date),
    email: customer.email || 'No email',
    phone: customer.phone || 'No phone'
  })));
  
  let loading = $derived(!data.customers);
  let hasError = $derived(!!data.error);
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-800">Customer Management</h1>
    <p class="text-gray-600 mt-2">View and manage customer information</p>
  </div>
  
  {#if hasError}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span class="text-red-800">{data.error}</span>
      </div>
    </div>
  {/if}

  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="p-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">All Customers</h2>
        <div class="flex items-center gap-4">
          {#if !loading && !hasError}
            <span class="text-sm text-gray-500">{processedCustomers.length} customers</span>
          {/if}
          <button 
            class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            onclick={exportToCSV}
            disabled={isExporting || loading}
          >
            {#if isExporting}
              <span class="loading loading-spinner loading-sm"></span>
              Exporting...
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            {/if}
          </button>
        </div>
      </div>
    </div>
    
    <DataTable 
      data={processedCustomers}
      {columns}
      {loading}
      onRowClick={handleCustomerClick}
      emptyMessage="No customers found"
    />
  </div>
</div>