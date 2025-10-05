<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { formatPrice, centsToDollars } from '$lib/utils/currency';
  
  let { data }: { data: PageData } = $props();
  
  let customerId = $derived($page.params.id);
  let customer = $derived(data.customer);
  let orders = $derived(data.orders || []);
  
  function goBack() {
    goto('/admin/customers');
  }
  
  function viewOrder(orderId: string) {
    goto(`/admin/orders/${orderId}`);
  }
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
  
  function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
</script>

<div class="p-6">
  <div class="mb-6">
    <button 
      class="btn btn-ghost mb-4" 
      onclick={goBack}
    >
      ← Back to Customers
    </button>
    <h1 class="text-3xl font-bold text-gray-800">Customer Details</h1>
    <p class="text-gray-600 mt-2">{customer ? customer.name : 'Loading...'}</p>
  </div>
  
  {#if customer}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Customer Information -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
        <div class="space-y-3">
          <div>
            <span class="text-sm font-medium text-gray-500">Name</span>
            <p class="text-gray-900">{customer.name}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Email</span>
            <p class="text-gray-900">{customer.email || 'No email provided'}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Phone</span>
            <p class="text-gray-900">{customer.phone || 'No phone provided'}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Join Date</span>
            <p class="text-gray-900">{formatDate(customer.join_date)}</p>
          </div>
        </div>
      </div>
      
      <!-- Statistics -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Statistics</h2>
        <div class="space-y-3">
          <div>
            <span class="text-sm font-medium text-gray-500">Total Orders</span>
            <p class="text-gray-900 text-2xl font-bold">{customer.total_orders}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Total Spent</span>
            <p class="text-gray-900 text-2xl font-bold">{formatPrice(customer.total_spent_cents)}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Average Order</span>
            <p class="text-gray-900 text-lg">
              {customer.total_orders > 0 ? formatPrice(Math.round(customer.total_spent_cents / customer.total_orders)) : '$0.00'}
            </p>
          </div>
          {#if customer.last_order_date}
            <div>
              <span class="text-sm font-medium text-gray-500">Last Order</span>
              <p class="text-gray-900">{formatDate(customer.last_order_date)}</p>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Customer Orders -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Order History ({orders.length})</h2>
        {#if orders.length > 0}
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr>
                  <th class="text-black">Order Date</th>
                  <th class="text-black">Due Date</th>
                  <th class="text-black">Method</th>
                  <th class="text-black">Total</th>
                  <th class="text-black">Status</th>
                  <th class="text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each orders as order}
                  <tr class="hover:bg-gray-200">
                    <td>{formatDate(order.order_date)}</td>
                    <td>{formatDate(order.delivery_date)}</td>
                    <td>{capitalizeFirst(order.retrieval_method)}</td>
                    <td>{formatPrice(order.total_cents)}</td>
                    <td>
                      <span class="badge {getStatusBadgeClass(order.status)}">
                        {capitalizeFirst(order.status)}
                      </span>
                    </td>
                    <td>
                      <button 
                        class="btn btn-sm btn-ghost"
                        onclick={() => viewOrder(order.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="text-gray-500 text-center py-8">No orders found for this customer.</p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="flex justify-center items-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-4 text-gray-600">Loading customer details...</span>
    </div>
  {/if}
</div> 