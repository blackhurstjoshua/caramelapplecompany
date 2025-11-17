<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { formatPrice } from '$lib/utils/currency';
  import { OrderService, type ItemOp, type OrderUpdatesPayload, type ProductSnapshot } from '$lib/services/orders';
  import { searchProductsByName } from '$lib/services/products';
  
  let { data }: { data: PageData } = $props();
  
  let orderId = $derived($page.params.id);
  let order = $derived(data.order);
  
  // Edit mode state
  let isEditMode = $state(false);
  let editedOrder = $state<any>(null);
  let editedItems = $state<any[]>([]);
  let deletedItemIds = $state<string[]>([]);
  let isSaving = $state(false);
  let saveError = $state('');
  
  // Product search state
  let searchQuery = $state('');
  let searchResults = $state<any[]>([]);
  let isSearching = $state(false);
  let showSearchModal = $state(false);
  let replacingItemId = $state<string | null>(null);
  
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
      case 'refund_due': return 'badge-warning';
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
    
    // Create editable copies of items
    editedItems = (order.order_items || []).map((item: any) => ({
      ...item,
      // Use snapshot name if available, otherwise product name
      displayName: item.product_snapshot?.name || item.product?.name || 'Unknown Product',
      isNew: false,
      isModified: false
    }));
    
    deletedItemIds = [];
    isEditMode = true;
    saveError = '';
  }
  
  function cancelEdit() {
    editedOrder = null;
    editedItems = [];
    deletedItemIds = [];
    isEditMode = false;
    saveError = '';
    showSearchModal = false;
    searchQuery = '';
    searchResults = [];
  }
  
  function removeItem(itemId: string, isNew: boolean) {
    if (isNew) {
      // Just remove from the edited list (never saved to DB)
      editedItems = editedItems.filter(item => item.id !== itemId);
    } else {
      // Mark for deletion
      deletedItemIds = [...deletedItemIds, itemId];
      editedItems = editedItems.filter(item => item.id !== itemId);
    }
  }
  
  function openAddItemModal() {
    replacingItemId = null;
    searchQuery = '';
    searchResults = [];
    showSearchModal = true;
  }
  
  function openReplaceItemModal(itemId: string) {
    replacingItemId = itemId;
    searchQuery = '';
    searchResults = [];
    showSearchModal = true;
  }
  
  async function handleSearchInput() {
    if (!searchQuery || searchQuery.trim().length < 2) {
      searchResults = [];
      return;
    }
    
    isSearching = true;
    try {
      const results = await searchProductsByName(searchQuery.trim());
      searchResults = results;
    } catch (error) {
      console.error('Error searching products:', error);
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }
  
  function selectProduct(product: any) {
    if (replacingItemId) {
      // Replace existing item
      const itemIndex = editedItems.findIndex(item => item.id === replacingItemId);
      if (itemIndex >= 0) {
        editedItems[itemIndex] = {
          ...editedItems[itemIndex],
          product_id: product.id,
          unit_price_cents: product.price_cents,
          displayName: product.name,
          product_snapshot: {
            id: product.id,
            name: product.name,
            description: product.description,
            image_path: product.image_path,
            price_cents: product.price_cents
          },
          isModified: true
        };
      }
    } else {
      // Add new item
      const newItem = {
        id: `new-${Date.now()}-${Math.random()}`,
        order_id: orderId,
        product_id: product.id,
        quantity: 1,
        unit_price_cents: product.price_cents,
        displayName: product.name,
        product_snapshot: {
          id: product.id,
          name: product.name,
          description: product.description,
          image_path: product.image_path,
          price_cents: product.price_cents
        },
        item_notes: null,
        isNew: true,
        isModified: false
      };
      editedItems = [...editedItems, newItem];
    }
    
    // Close modal
    showSearchModal = false;
    searchQuery = '';
    searchResults = [];
    replacingItemId = null;
  }
  
  function markItemModified(itemId: string) {
    const item = editedItems.find(i => i.id === itemId);
    if (item && !item.isNew) {
      item.isModified = true;
    }
  }
  
  function calculateSubtotal(): number {
    return editedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price_cents), 0);
  }
  
  function calculateTotal(): number {
    return calculateSubtotal() + (editedOrder?.delivery_fee_cents || 0);
  }
  
  async function saveEdit() {
    if (!editedOrder || !orderId) return;
    
    isSaving = true;
    saveError = '';
    
    try {
      // Prepare order updates
      const orderUpdates: OrderUpdatesPayload = {
        delivery_date: editedOrder.delivery_date,
        status: editedOrder.status,
        retrieval_method: editedOrder.retrieval_method,
        payment_method: editedOrder.payment_method,
        customizations: editedOrder.customizations,
        address: editedOrder.address,
        delivery_fee_cents: editedOrder.delivery_fee_cents
      };
      
      // Prepare item operations
      const itemOps: ItemOp[] = [];
      
      // Handle deletions
      for (const deletedId of deletedItemIds) {
        itemOps.push({ op: 'delete', id: deletedId });
      }
      
      // Handle upserts (new items and modified items)
      for (const item of editedItems) {
        if (item.isNew) {
          // New item (no id)
          itemOps.push({
            op: 'upsert',
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price_cents: item.unit_price_cents,
            product_snapshot: item.product_snapshot,
            item_notes: item.item_notes
          });
        } else if (item.isModified || item.displayName !== (item.product_snapshot?.name || item.product?.name)) {
          // Existing item that was modified
          // Update snapshot name if display name was changed
          const updatedSnapshot = {
            ...item.product_snapshot,
            name: item.displayName
          };
          
          itemOps.push({
            op: 'upsert',
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price_cents: item.unit_price_cents,
            product_snapshot: updatedSnapshot,
            item_notes: item.item_notes
          });
        }
      }
      
      // Call the RPC function
      await OrderService.updateOrderWithItems(orderId, orderUpdates, itemOps);
      
      // Refresh the page to get the updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating order:', error);
      saveError = error instanceof Error ? error.message : 'Failed to update order. Please try again.';
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
                <option value="refund_due">Refund Due</option>
              </select>
            {:else}
              <span class="badge {getStatusBadgeClass(order.status)}">{capitalizeFirst(order.status.replace('_', ' '))}</span>
            {/if}
          </div>
          {#if isEditMode}
            <div>
              <div class="text-sm font-medium text-gray-500">Delivery Fee</div>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-gray-900">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  class="input input-bordered input-sm flex-1 bg-white text-gray-900"
                  value={editedOrder.delivery_fee_cents / 100}
                  oninput={(e) => {
                    const target = e.target as HTMLInputElement;
                    editedOrder.delivery_fee_cents = Math.round(parseFloat(target.value || '0') * 100);
                  }}
                />
              </div>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Order Items -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Order Items</h2>
          {#if isEditMode}
            <button 
              class="btn btn-sm btn-primary"
              onclick={openAddItemModal}
            >
              + Add Item
            </button>
          {/if}
        </div>
        
        {#if isEditMode && editedItems.length > 0}
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr>
                  <th class="text-black">Product</th>
                  <th class="text-black">Quantity</th>
                  <th class="text-black">Unit Price</th>
                  <th class="text-black">Subtotal</th>
                  <th class="text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each editedItems as item (item.id)}
                  <tr>
                    <td>
                      <div class="space-y-2">
                        <input 
                          type="text" 
                          class="input input-bordered input-sm w-full bg-white text-gray-900"
                          bind:value={item.displayName}
                          oninput={() => markItemModified(item.id)}
                          placeholder="Product name"
                        />
                        <textarea 
                          class="textarea textarea-bordered textarea-xs w-full bg-white text-gray-900"
                          bind:value={item.item_notes}
                          oninput={() => markItemModified(item.id)}
                          placeholder="Notes (optional)"
                          rows="2"
                        ></textarea>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="1"
                        class="input input-bordered input-sm w-20 bg-white text-gray-900"
                        bind:value={item.quantity}
                        oninput={() => markItemModified(item.id)}
                      />
                    </td>
                    <td>
                      <div class="flex items-center gap-1">
                        <span class="text-gray-900">$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          class="input input-bordered input-sm w-24 bg-white text-gray-900"
                          value={item.unit_price_cents / 100}
                          oninput={(e) => {
                            const target = e.target as HTMLInputElement;
                            item.unit_price_cents = Math.round(parseFloat(target.value || '0') * 100);
                            markItemModified(item.id);
                          }}
                        />
                      </div>
                    </td>
                    <td class="font-medium">{formatPrice(item.unit_price_cents * item.quantity)}</td>
                    <td>
                      <div class="flex gap-2">
                        <button 
                          class="btn btn-xs btn-ghost"
                          onclick={() => openReplaceItemModal(item.id)}
                          title="Replace product"
                        >
                          🔄
                        </button>
                        <button 
                          class="btn btn-xs btn-error"
                          onclick={() => removeItem(item.id, item.isNew)}
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
              <tfoot>
                <tr class="border-t-2">
                  <td colspan="3" class="text-right font-medium text-black">Subtotal:</td>
                  <td colspan="2" class="font-bold text-black">{formatPrice(calculateSubtotal())}</td>
                </tr>
                {#if editedOrder.delivery_fee_cents > 0}
                  <tr>
                    <td colspan="3" class="text-right font-medium text-black">Delivery Fee:</td>
                    <td colspan="2" class="font-bold text-black">{formatPrice(editedOrder.delivery_fee_cents)}</td>
                  </tr>
                {/if}
                <tr class="border-t">
                  <td colspan="3" class="text-right font-bold text-lg text-black">Total:</td>
                  <td colspan="2" class="font-bold text-lg text-black">{formatPrice(calculateTotal())}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        {:else if !isEditMode && order.order_items && order.order_items.length > 0}
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
                        <div class="font-medium">{item.product_snapshot?.name || item.product?.name || 'Unknown Product'}</div>
                        {#if item.item_notes}
                          <div class="text-sm text-gray-500 italic">{item.item_notes}</div>
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

<!-- Product Search Modal -->
{#if showSearchModal}
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl bg-white">
      <h3 class="font-bold text-lg text-black mb-4">
        {replacingItemId ? 'Replace Product' : 'Add Product'}
      </h3>
      
      <div class="form-control mb-4">
        <input 
          type="text" 
          placeholder="Search products by name..." 
          class="input input-bordered w-full bg-white text-gray-900"
          bind:value={searchQuery}
          oninput={handleSearchInput}
          autofocus
        />
      </div>
      
      {#if isSearching}
        <div class="flex justify-center items-center py-8">
          <span class="loading loading-spinner loading-md"></span>
          <span class="ml-2 text-gray-600">Searching...</span>
        </div>
      {:else if searchResults.length > 0}
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {#each searchResults as product}
            <button 
              class="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              class:opacity-50={!product.is_active}
              onclick={() => selectProduct(product)}
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="font-medium text-black">
                    {product.name}
                    {#if !product.is_active}
                      <span class="badge badge-sm badge-ghost ml-2">Inactive</span>
                    {/if}
                  </div>
                  {#if product.description}
                    <div class="text-sm text-gray-500 line-clamp-2">{product.description}</div>
                  {/if}
                </div>
                <div class="text-right ml-4">
                  <div class="font-bold text-black">{formatPrice(product.price_cents)}</div>
                </div>
              </div>
            </button>
          {/each}
        </div>
      {:else if searchQuery.trim().length >= 2}
        <div class="text-center py-8 text-gray-500">
          No products found matching "{searchQuery}"
        </div>
      {:else}
        <div class="text-center py-8 text-gray-500">
          Type at least 2 characters to search
        </div>
      {/if}
      
      <div class="modal-action">
        <button class="btn" onclick={() => { showSearchModal = false; searchQuery = ''; searchResults = []; }}>
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
