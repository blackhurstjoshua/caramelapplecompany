<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  $: customerId = $page.params.id;
  
  // In a real app, you would fetch the customer data based on the ID
  // For now, using mock data
  const mockCustomer = {
    id: customerId,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    joinDate: '2023-12-01',
    totalOrders: 15,
    totalSpent: 456.78,
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'ST',
      zip: '12345'
    },
    recentOrders: [
      { id: 'ORD-001', date: '2024-01-15', total: 45.99, status: 'completed' },
      { id: 'ORD-004', date: '2024-01-10', total: 32.50, status: 'completed' },
      { id: 'ORD-007', date: '2024-01-05', total: 28.75, status: 'completed' }
    ],
    notes: 'Regular customer, prefers organic apples'
  };
  
  function goBack() {
    goto('/admin/customers');
  }
  
  function viewOrder(orderId: string) {
    goto(`/admin/orders/${orderId}`);
  }
</script>

<div class="p-6">
  <div class="mb-6">
    <button 
      class="btn btn-ghost mb-4" 
      on:click={goBack}
    >
      ← Back to Customers
    </button>
    <h1 class="text-3xl font-bold text-gray-800">Customer Details</h1>
    <p class="text-gray-600 mt-2">Customer #{customerId}</p>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Customer Information -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
      <div class="space-y-3">
        <div>
          <span class="text-sm font-medium text-gray-500">Name</span>
          <p class="text-gray-900">{mockCustomer.name}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Email</span>
          <p class="text-gray-900">{mockCustomer.email}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Phone</span>
          <p class="text-gray-900">{mockCustomer.phone}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Join Date</span>
          <p class="text-gray-900">{new Date(mockCustomer.joinDate).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
    
    <!-- Statistics -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Statistics</h2>
      <div class="space-y-3">
        <div>
          <span class="text-sm font-medium text-gray-500">Total Orders</span>
          <p class="text-gray-900 text-2xl font-bold">{mockCustomer.totalOrders}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Total Spent</span>
          <p class="text-gray-900 text-2xl font-bold">${mockCustomer.totalSpent.toFixed(2)}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Average Order</span>
          <p class="text-gray-900 text-lg">${(mockCustomer.totalSpent / mockCustomer.totalOrders).toFixed(2)}</p>
        </div>
      </div>
    </div>
    
    <!-- Address -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Address</h2>
      <div class="space-y-1">
        <p class="text-gray-900">{mockCustomer.address.street}</p>
        <p class="text-gray-900">
          {mockCustomer.address.city}, {mockCustomer.address.state} {mockCustomer.address.zip}
        </p>
      </div>
    </div>
    
    <!-- Notes -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Notes</h2>
      <p class="text-gray-900">{mockCustomer.notes}</p>
    </div>
    
    <!-- Recent Orders -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each mockCustomer.recentOrders as order}
              <tr class="hover:bg-base-200">
                <td>{order.id}</td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>${order.total.toFixed(2)}</td>
                <td><span class="badge badge-success">{order.status}</span></td>
                <td>
                  <button 
                    class="btn btn-sm btn-ghost"
                    on:click={() => viewOrder(order.id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div> 