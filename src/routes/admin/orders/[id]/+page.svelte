<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { formatPrice } from '$lib/utils/currency';
  import { OrderService } from '$lib/services/orders';
  
  let { data }: { data: PageData } = $props();
  
  let orderId = $derived($page.params.id);
  let order = $derived(data.order);
  
  // Edit mode state
  let isEditMode = $state(false);
  let editedOrder = $state<any>(null);
  let isSaving = $state(false);
  let saveError = $state('');
  
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
  
  function formatDateForInput(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0];
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
  
  function startEdit() {
    if (!order) return;
    
    // Create a deep copy of the order for editing
    editedOrder = {
      ...order,
      delivery_date: formatDateForInput(order.delivery_date),
      address: order.address ? { ...order.address } : {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: ''
      }
    };
    isEditMode = true;
    saveError = '';
  }
  
  function cancelEdit() {
    editedOrder = null;
    isEditMode = false;
    saveError = '';
  }
  
  async function saveEdit() {
    if (!editedOrder || !orderId) return;
    
    isSaving = true;
    saveError = '';
    
    try {
      // Prepare the update payload
      const updates: any = {
        delivery_date: editedOrder.delivery_date,
        status: editedOrder.status,
        retrieval_method: editedOrder.retrieval_method,
        payment_method: editedOrder.payment_method,
        customizations: editedOrder.customizations,
        address: editedOrder.address
      };
      
      // Update the order
      await OrderService.updateOrder(orderId, updates);
      
      // Refresh the page to get the updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating order:', error);
      saveError = 'Failed to update order. Please try again.';
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="p-6">
  <div class="mb-6">
    <button 
      class="btn btn-ghost mb-4" 
      onclick={goBack}
    >
      ← Back to Orders
    </button>
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Order Details</h1>
        <p class="text-gray-600 mt-2">{order && order.customer ? order.customer.name : 'Loading...'}</p>
      </div>
      <div class="flex gap-2">
        {#if isEditMode}
          <button 
            class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            class:loading={isSaving}
            onclick={saveEdit}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button 
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            onclick={cancelEdit}
            disabled={isSaving}
          >
            ✕
          </button>
        {:else}
          <button 
            class="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            onclick={startEdit}
          >
            Edit
          </button>
        {/if}
      </div>
    </div>
  </div>
  
  {#if saveError}
    <div class="alert alert-error mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{saveError}</span>
    </div>
  {/if}
  
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
            <p class="text-gray-900">{formatDate(isEditMode ? editedOrder.order_date : order.order_date)}</p>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-500">Due Date</div>
            {#if isEditMode}
              <input 
                type="date" 
                class="input input-bordered input-sm w-full mt-1 bg-white text-gray-900"
                bind:value={editedOrder.delivery_date}
              />
            {:else}
              <p class="text-gray-900">{formatDate(order.delivery_date)}</p>
            {/if}
          </div>
          <div>
            <div class="text-sm font-medium text-gray-500">Method</div>
            {#if isEditMode}
              <select 
                class="select select-bordered select-sm w-full mt-1 bg-white text-gray-900"
                bind:value={editedOrder.retrieval_method}
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            {:else}
              <p class="text-gray-900">{capitalizeFirst(order.retrieval_method)}</p>
            {/if}
          </div>
          <div>
            <div class="text-sm font-medium text-gray-500">Payment</div>
            {#if isEditMode}
              <select 
                class="select select-bordered select-sm w-full mt-1 bg-white text-gray-900"
                bind:value={editedOrder.payment_method}
              >
                <option value="pickup">Pay on {editedOrder.retrieval_method === 'pickup' ? 'Pickup' : 'Delivery'}</option>
                <option value="stripe">Stripe</option>
              </select>
            {:else}
              <p class="text-gray-900">{capitalizeFirst(order.payment_method)}</p>
            {/if}
          </div>
          <div>
            <div class="text-sm font-medium text-gray-500">Status</div>
            {#if isEditMode}
              <select 
                class="select select-bordered select-sm w-full mt-1 bg-white text-gray-900"
                bind:value={editedOrder.status}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            {:else}
              <span class="badge {getStatusBadgeClass(order.status)}">{capitalizeFirst(order.status)}</span>
            {/if}
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
      {#if order.address || (isEditMode && editedOrder.retrieval_method === 'delivery')}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            {(isEditMode ? editedOrder.retrieval_method : order.retrieval_method) === 'delivery' ? 'Delivery Address' : 'Address'}
          </h2>
          {#if isEditMode}
            <div class="space-y-3">
              <div>
                <div class="text-sm font-medium text-gray-500">Street Address</div>
                <input 
                  type="text" 
                  class="input input-bordered input-sm w-full mt-1 bg-white text-gray-900"
                  bind:value={editedOrder.address.addressLine1}
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <div class="text-sm font-medium text-gray-500">Apt, suite, etc. (optional)</div>
                <input 
                  type="text" 
                  class="input input-bordered input-sm w-full mt-1 bg-white text-gray-900"
                  bind:value={editedOrder.address.addressLine2}
                  placeholder="Apt 4B"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <div class="text-sm font-medium text-gray-500">City</div>
                  <input 
                    type="text" 
                    class="input input-bordered input-sm w-full mt-1 bg-white text-gray-900"
                    bind:value={editedOrder.address.city}
                    placeholder="City"
                  />
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500">State</div>
                  <input 
                    type="text" 
                    class="input input-bordered input-sm w-full mt-1 bg-white text-gray-900"
                    bind:value={editedOrder.address.state}
                    placeholder="ST"
                    maxlength="2"
                  />
                </div>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-500">ZIP Code</div>
                <input 
                  type="text" 
                  class="input input-bordered input-sm w-full mt-1 bg-white text-gray-900"
                  bind:value={editedOrder.address.zip}
                  placeholder="12345"
                />
              </div>
            </div>
          {:else}
            <div class="space-y-1 whitespace-pre-line">
              <p class="text-gray-900">{formatAddress(order.address)}</p>
            </div>
          {/if}
        </div>
      {/if}
      
      <!-- Customizations -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Special Instructions</h2>
        {#if isEditMode}
          <textarea 
            class="textarea textarea-bordered w-full bg-white text-gray-900"
            bind:value={editedOrder.customizations}
            placeholder="Any special requests or modifications?"
            rows="3"
          ></textarea>
        {:else}
          <p class="text-gray-900">{order.customizations || 'No special instructions'}</p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="flex justify-center items-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-4 text-gray-600">Loading order details...</span>
    </div>
  {/if}
</div> 