<script lang="ts">
  import DataTable from '$lib/components/DataTable.svelte';
  import type { TableColumn, Order } from '$lib/types';
  import { goto } from '$app/navigation';
  
  // Sample orders data - replace with real data from your API/database
  const sampleOrders: Order[] = [
    {
      id: 'ORD-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      orderDate: '2024-01-15',
      status: 'completed',
      total: 45.99,
      items: ['Granny Smith Apples', 'Honeycrisp Apples']
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Smith',
      customerEmail: 'sarah@example.com',
      orderDate: '2024-01-16',
      status: 'processing',
      total: 32.50,
      items: ['Red Delicious Apples']
    },
    {
      id: 'ORD-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      orderDate: '2024-01-17',
      status: 'pending',
      total: 78.25,
      items: ['Fuji Apples', 'Gala Apples', 'Apple Pie']
    }
  ];
  
  const columns: TableColumn[] = [
    { key: 'id', label: 'Order ID', width: '120px' },
    { key: 'customerName', label: 'Customer' },
    { key: 'customerEmail', label: 'Email' },
    { key: 'orderDate', label: 'Date', width: '120px' },
    { key: 'status', label: 'Status', width: '100px' },
    { key: 'total', label: 'Total', width: '100px' }
  ];
  
  function handleOrderClick(order: Order) {
    // Navigate to order details page
    goto(`/admin/orders/${order.id}`);
  }
  
  function formatCurrency(value: number): string {
    return `$${value.toFixed(2)}`;
  }
  
  // Process data to format currency
  const processedOrders = sampleOrders.map(order => ({
    ...order,
    total: formatCurrency(order.total),
    status: order.status.charAt(0).toUpperCase() + order.status.slice(1)
  }));
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-800">Orders Management</h1>
    <p class="text-gray-600 mt-2">View and manage customer orders</p>
  </div>
  
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-800">Recent Orders</h2>
    </div>
    
    <DataTable 
      data={processedOrders}
      {columns}
      onRowClick={handleOrderClick}
      emptyMessage="No orders found"
    />
  </div>
</div>