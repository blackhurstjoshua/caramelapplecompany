<!-- Dashboard Content -->
<div class="text-center py-16">
  <!-- Welcome Message -->
  <div class="mb-8">
    <div class="text-6xl mb-4">🍎</div>
    <h2 class="text-4xl font-bold mb-4 text-gray-900" style="font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: 0.05em;">
      Welcome to Admin Dashboard
    </h2>
    <p class="text-xl text-gray-600 max-w-2xl mx-auto">
      You're successfully logged in to the Caramel Apple Co. admin portal. 
      This is where you'll manage your business operations.
    </p>
  </div>
  
  <!-- Feature Cards Preview -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
    <a href="/admin/orders" class="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
      <div class="p-6 items-center text-center">
        <div class="text-3xl mb-2">📦</div>
        <h3 class="text-lg font-semibold text-gray-900">Orders</h3>
        <p class="text-sm text-gray-600">Manage customer orders</p>
      </div>
    </a>
    
    <a href="/admin/customers" class="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
      <div class="p-6 items-center text-center">
        <div class="text-3xl mb-2">👥</div>
        <h3 class="text-lg font-semibold text-gray-900">Customers</h3>
        <p class="text-sm text-gray-600">Customer management</p>
      </div>
    </a>
    
    <a href="/admin/product" class="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
      <div class="p-6 items-center text-center">
        <div class="text-3xl mb-2">🍯</div>
        <h3 class="text-lg font-semibold text-gray-900">Products</h3>
        <p class="text-sm text-gray-600">Manage flavors & products</p>
      </div>
    </a>
    
    <a href="/admin/schedule" class="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
      <div class="p-6 items-center text-center">
        <div class="text-3xl mb-2">📅</div>
        <h3 class="text-lg font-semibold text-gray-900">Schedule</h3>
        <p class="text-sm text-gray-600">Production planning</p>
      </div>
    </a>
  </div>
  
  <!-- Demo Credentials Info -->
  <div class="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg max-w-md mx-auto">
    <h3 class="font-semibold mb-2 text-gray-900">Demo Credentials</h3>
    <div class="text-sm text-left space-y-1 text-gray-700">
      <p><strong>Admin:</strong> admin@caramelapple.com / test</p>
      <p><strong>Manager:</strong> manager@caramelapple.com / hello</p>
    </div>
    <p class="text-xs text-gray-500 mt-2">Simple string comparison authentication</p>
  </div>
</div>