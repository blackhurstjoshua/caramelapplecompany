<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { formatPrice } from '$lib/utils/currency';
  
  let { data }: { data: PageData } = $props();
  
  let orderId = $derived($page.params.id);
  let order = $derived(data.order);
  
  function goBack() {
    goto('/admin/orders');
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
  
  function formatAddress(address: any): string {
    if (!address) return 'No address provided';
    
    const parts = [
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.zip}`
    ].filter(Boolean);
    
    return parts.join('\n');
  }
</script>

<div class="p-6">
  <div class="mb-6">
    <button 
      class="btn btn-ghost mb-4" 
      on:click={goBack}
    >
      ← Back to Orders
    </button>
    <h1 class="text-3xl font-bold text-gray-800">Order Details</h1>
    <p class="text-gray-600 mt-2">{order && order.customer ? order.customer.name : 'Loading...'}</p>
  </div>
  
  {#if order}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Customer Information -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
        <div class="space-y-3">
          <div>
            <span class="text-sm font-medium text-gray-500">Name</span>
            <p class="text-gray-900">{order.customer.name}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Email</span>
            <p class="text-gray-900">{order.customer.email || 'No email provided'}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Phone</span>
            <p class="text-gray-900">{order.customer.phone || 'No phone provided'}</p>
          </div>
        </div>
      </div>
      
      <!-- Order Information -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Order Information</h2>
        <div class="space-y-3">
          <div>
            <span class="text-sm font-medium text-gray-500">Order Date</span>
            <p class="text-gray-900">{formatDate(order.order_date)}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Due Date</span>
            <p class="text-gray-900">{formatDate(order.delivery_date)}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Method</span>
            <p class="text-gray-900">{capitalizeFirst(order.retrieval_method)}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Payment</span>
            <p class="text-gray-900">{capitalizeFirst(order.payment_method)}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Status</span>
            <span class="badge {getStatusBadgeClass(order.status)}">{capitalizeFirst(order.status)}</span>
          </div>
        </div>
      </div>
      
      <!-- Order Items -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
        {#if order.order_items && order.order_items.length > 0}
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr>
                  <th class="text-black">Product</th>
                  <th class="text-black">Quantity</th>
                  <th class="text-black">Unit Price (at time of order)</th>
                  <th class="text-black">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {#each order.order_items as item}
                  <tr>
                    <td>
                      <div>
                        <div class="font-medium">{item.product?.name || 'Unknown Product'}</div>
                        {#if item.product?.description}
                          <div class="text-sm text-gray-500">{item.product.description}</div>
                        {/if}
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.unit_price_cents)}</td>
                    <td class="font-medium">{formatPrice(item.unit_price_cents * item.quantity)}</td>
                  </tr>
                {/each}
              </tbody>
              <tfoot>
                <tr class="border-t-2">
                  <td colspan="3" class="text-right font-medium text-black">Subtotal:</td>
                  <td class="font-bold text-black">{formatPrice(order.subtotal_cents)}</td>
                </tr>
                {#if order.delivery_fee_cents > 0}
                  <tr>
                    <td colspan="3" class="text-right font-medium text-black">Delivery Fee:</td>
                    <td class="font-bold text-black">{formatPrice(order.delivery_fee_cents)}</td>
                  </tr>
                {/if}
                <tr class="border-t">
                  <td colspan="3" class="text-right font-bold text-lg text-black">Total:</td>
                  <td class="font-bold text-lg text-black">{formatPrice(order.total_cents)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        {:else}
          <p class="text-gray-500 text-center py-8">No items found for this order.</p>
        {/if}
      </div>
      
      <!-- Address -->
      {#if order.address}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            {order.retrieval_method === 'delivery' ? 'Delivery Address' : 'Address'}
          </h2>
          <div class="space-y-1 whitespace-pre-line">
            <p class="text-gray-900">{formatAddress(order.address)}</p>
          </div>
        </div>
      {/if}
      
      <!-- Customizations -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Special Instructions</h2>
        <p class="text-gray-900">{order.customizations || 'No special instructions'}</p>
      </div>
    </div>
  {:else}
    <div class="flex justify-center items-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-4 text-gray-600">Loading order details...</span>
    </div>
  {/if}
</div> 