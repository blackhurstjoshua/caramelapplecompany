<script lang="ts">
  import DataTable from '$lib/components/DataTable.svelte';
  import type { TableColumn, Customer } from '$lib/types';
  import { goto } from '$app/navigation';
  
  // Sample customers data - replace with real data from your API/database
  const sampleCustomers: Customer[] = [
    {
      id: 'CUST-001',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      joinDate: '2023-12-01',
      totalOrders: 15
    },
    {
      id: 'CUST-002',
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      phone: '(555) 987-6543',
      joinDate: '2023-11-15',
      totalOrders: 8
    },
    {
      id: 'CUST-003',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '(555) 456-7890',
      joinDate: '2024-01-05',
      totalOrders: 3
    }
  ];
  
  const columns: TableColumn[] = [
    { key: 'id', label: 'Customer ID', width: '120px' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', width: '150px' },
    { key: 'joinDate', label: 'Join Date', width: '120px' },
    { key: 'totalOrders', label: 'Total Orders', width: '120px' }
  ];
  
  function handleCustomerClick(customer: Customer) {
    // Navigate to customer details page
    goto(`/admin/customers/${customer.id}`);
  }
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
  
  // Process data to format dates
  const processedCustomers = sampleCustomers.map(customer => ({
    ...customer,
    joinDate: formatDate(customer.joinDate)
  }));
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-800">Customer Management</h1>
    <p class="text-gray-600 mt-2">View and manage customer information</p>
  </div>
  
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-800">All Customers</h2>
    </div>
    
    <DataTable 
      data={processedCustomers}
      {columns}
      onRowClick={handleCustomerClick}
      emptyMessage="No customers found"
    />
  </div>
</div>