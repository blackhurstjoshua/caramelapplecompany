<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  $: orderId = $page.params.id;
  
  // In a real app, you would fetch the order data based on the ID
  // For now, using mock data
  const mockOrder = {
    id: orderId,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '(555) 123-4567',
    orderDate: '2024-01-15',
    status: 'completed',
    total: 45.99,
    items: [
      { name: 'Granny Smith Apples', quantity: 2, price: 15.99 },
      { name: 'Honeycrisp Apples', quantity: 1, price: 29.99 }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'ST',
      zip: '12345'
    },
    notes: 'Customer requested extra care with packaging'
  };
  
  function goBack() {
    goto('/admin/orders');
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
    <p class="text-gray-600 mt-2">Order #{orderId}</p>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Customer Information -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
      <div class="space-y-3">
        <div>
          <span class="text-sm font-medium text-gray-500">Name</span>
          <p class="text-gray-900">{mockOrder.customerName}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Email</span>
          <p class="text-gray-900">{mockOrder.customerEmail}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Phone</span>
          <p class="text-gray-900">{mockOrder.customerPhone}</p>
        </div>
      </div>
    </div>
    
    <!-- Order Information -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Order Information</h2>
      <div class="space-y-3">
        <div>
          <span class="text-sm font-medium text-gray-500">Order Date</span>
          <p class="text-gray-900">{new Date(mockOrder.orderDate).toLocaleDateString()}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Status</span>
          <span class="badge badge-success">{mockOrder.status}</span>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Total</span>
          <p class="text-gray-900 text-lg font-semibold">${mockOrder.total.toFixed(2)}</p>
        </div>
      </div>
    </div>
    
    <!-- Order Items -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {#each mockOrder.items as item}
              <tr>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Shipping Address -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Shipping Address</h2>
      <div class="space-y-1">
        <p class="text-gray-900">{mockOrder.shippingAddress.street}</p>
        <p class="text-gray-900">
          {mockOrder.shippingAddress.city}, {mockOrder.shippingAddress.state} {mockOrder.shippingAddress.zip}
        </p>
      </div>
    </div>
    
    <!-- Notes -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Notes</h2>
      <p class="text-gray-900">{mockOrder.notes}</p>
    </div>
  </div>
</div> 