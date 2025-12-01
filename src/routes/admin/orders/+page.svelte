<script lang="ts">
  import DataTable from '$lib/components/DataTable.svelte';
  import type { TableColumn } from '$lib/types';
  import type { OrderWithCustomer } from '$lib/services/orders';
  import { OrderService } from '$lib/services/orders';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { formatPrice } from '$lib/utils/currency';
  
  let { data }: { data: PageData } = $props();
  
  // All orders from initial load
  let allOrders = $state<OrderWithCustomer[]>(data.orders || []);
  
  // Search state
  let searchQuery = $state('');
  let isSearching = $state(false);
  let searchResults = $state<OrderWithCustomer[]>([]);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Derived orders - either all orders or search results
  let orders = $derived(searchQuery.trim().length >= 3 ? searchResults : allOrders);
  
  async function handleSearchInput() {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const query = searchQuery.trim();
    
    // Reset if query is too short
    if (query.length < 3) {
      searchResults = [];
      isSearching = false;
      return;
    }
    
    // Set searching state immediately
    isSearching = true;
    
    // Debounce for 500ms (half a second)
    debounceTimer = setTimeout(async () => {
      try {
        const results = await OrderService.searchOrders(query);
        searchResults = results;
      } catch (error) {
        console.error('Error searching orders:', error);
        searchResults = [];
      } finally {
        isSearching = false;
      }
    }, 500);
  }
  
  function clearSearch() {
    searchQuery = '';
    searchResults = [];
    isSearching = false;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }
  
  const columns: TableColumn[] = [
    { key: 'customer.name', label: 'Customer' },
    { key: 'customer.email', label: 'Email' },
    { key: 'order_date', label: 'Order Date', width: '120px' },
    { key: 'delivery_date', label: 'Due Date', width: '120px' },
    { key: 'retrieval_method', label: 'Method', width: '100px' },
    { key: 'status', label: 'Status', width: '100px' },
    { key: 'total_cents', label: 'Total', width: '100px' }
  ];
  
  function handleOrderClick(order: OrderWithCustomer) {
    // Navigate to order details page
    goto(`/admin/orders/${order.id}`);
  }
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  function getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'badge-success';
      case 'processing': return 'badge-warning';
      case 'pending': return 'badge-info';
      case 'cancelled': return 'badge-error';
      default: return 'badge-ghost';
    }
  }
  
  // Process data to format dates, currency, and status
  let processedOrders = $derived((orders || []).map(order => ({
    ...order,
    order_date: formatDate(order.order_date),
    delivery_date: formatDate(order.delivery_date),
    retrieval_method: capitalizeFirst(order.retrieval_method),
    status: capitalizeFirst(order.status),
    total_cents: formatPrice(order.total_cents),
    customer: {
      ...order.customer,
      email: order.customer.email || 'No email'
    }
  })));
  
  let loading = $derived(!data.orders);
  let hasError = $derived(!!data.error);
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-800">Orders Management</h1>
    <p class="text-gray-600 mt-2">View and manage customer orders</p>
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
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">All Orders</h2>
        <div class="flex items-center gap-4">
          {#if !loading && !hasError}
            <span class="text-sm text-gray-500">{processedOrders.length} orders</span>
          {/if}
          <button 
            class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            onclick={() => goto('/admin/orders/new')}
          >
            + New Order
          </button>
        </div>
      </div>
      
      <!-- Search Bar -->
      <div class="relative w-full">
        <input 
          type="text" 
          placeholder="Search by customer name, email, or phone (min 3 characters)..." 
          class="input w-full bg-gray-50 text-gray-900 pr-20 border border-gray-300 focus:border-green-500 focus:ring-green-500 placeholder:text-gray-500"
          bind:value={searchQuery}
          oninput={handleSearchInput}
        />
        {#if isSearching}
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <span class="loading loading-spinner loading-sm"></span>
          </div>
        {:else if searchQuery}
          <button 
            class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
            onclick={clearSearch}
            title="Clear search"
          >
            ✕
          </button>
        {/if}
      </div>
      {#if searchQuery.trim().length > 0 && searchQuery.trim().length < 3}
        <p class="text-sm text-gray-500 mt-2">Type at least 3 characters to search</p>
      {:else if searchQuery.trim().length >= 3 && !isSearching}
        <p class="text-sm text-gray-600 mt-2">
          {processedOrders.length === 0 ? 'No orders found' : `Showing ${processedOrders.length} result${processedOrders.length !== 1 ? 's' : ''}`}
        </p>
      {/if}
    </div>
    
    <DataTable 
      data={processedOrders}
      {columns}
      {loading}
      onRowClick={handleOrderClick}
      emptyMessage="No orders found"
    />
  </div>
</div>