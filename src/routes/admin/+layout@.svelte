<script lang="ts">
  import '../../app.css';
  import { onMount, onDestroy } from 'svelte';
  import LoginForm from '$lib/components/LoginForm.svelte';
  import { verifyAdminLogin, getAuthState, clearAuthState, onAuthStateChange } from '$lib/auth';
  import type { User } from '@supabase/supabase-js';
  
  let isAuthenticated = false;
  let currentUser: User | null = null;
  let loading = false;
  let errorMessage = '';
  let successMessage = '';
  let sidebarOpen = true;
  
  let authSubscription: any;
  
  onMount(async () => {
    // Get initial auth state
    const authState = await getAuthState();
    isAuthenticated = authState.isAuthenticated && authState.isAdmin;
    currentUser = authState.user;
    
    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((authState) => {
      isAuthenticated = authState.isAuthenticated && authState.isAdmin;
      currentUser = authState.user;
      
      // Clear messages when auth state changes
      if (!isAuthenticated) {
        successMessage = '';
        errorMessage = '';
      }
    });
    
    authSubscription = subscription;
  });
  
  // Cleanup subscription on component destroy
  onDestroy(() => {
    authSubscription?.unsubscribe();
  });
  
  async function handleLogin(data: { email: string; password: string }) {
    loading = true;
    errorMessage = '';
    successMessage = '';
    
    try {
      const result = await verifyAdminLogin(data.email, data.password);
      
      if (result.success && result.user) {
        successMessage = result.message;
        // Auth state will be updated via onAuthStateChange listener
        // No need to manually set state here
      } else {
        errorMessage = result.message;
      }
    } catch (error) {
      errorMessage = 'An unexpected error occurred';
    } finally {
      loading = false;
    }
  }
  
  function handleForgotPassword() {
    // Placeholder for forgot password functionality
    alert('Forgot password functionality will be implemented soon. Please contact your administrator.');
  }
  
  function handleContactAdmin() {
    // Placeholder for contact admin functionality
    const mailtoLink = 'mailto:admin@caramelapple.com?subject=Admin%20Access%20Request&body=Hello,%0D%0A%0D%0AI%20need%20assistance%20with%20admin%20access.%0D%0A%0D%0AThank%20you!';
    window.open(mailtoLink, '_blank');
  }
  
  async function handleLogout() {
    await clearAuthState();
    // Auth state will be updated via onAuthStateChange listener
    successMessage = '';
    errorMessage = '';
  }
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
  
  const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/orders', label: 'Orders', icon: '📦' },
    { href: '/admin/customers', label: 'Customers', icon: '👥' },
    { href: '/admin/product', label: 'Products', icon: '🍯' },
    { href: '/admin/schedule', label: 'Schedule', icon: '📅' },
  ];
</script>

<svelte:head>
  <title>Admin Portal - Caramel Apple Co.</title>
  <meta name="description" content="Caramel Apple Co. Admin Portal - Secure access for business management" />
</svelte:head>

{#if !isAuthenticated}
  <!-- Login Form -->
  <LoginForm
    title="Admin Portal"
    subtitle="Sign in to manage your business"
    rightSideContent="admin"
    {loading}
    onsubmit={handleLogin}
    onforgotpassword={handleForgotPassword}
    oncontactadmin={handleContactAdmin}
  />
  
  <!-- Error/Success Messages -->
  {#if errorMessage}
    <div class="toast toast-top toast-center">
      <div class="alert alert-error">
        <span>{errorMessage}</span>
      </div>
    </div>
  {/if}
  
  {#if successMessage}
    <div class="toast toast-top toast-center">
      <div class="alert alert-success">
        <span>{successMessage}</span>
      </div>
    </div>
  {/if}
{:else}
  <!-- Admin Dashboard Layout -->
  <div class="min-h-screen bg-cream flex">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}">
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center">
          <span class="text-3xl mr-3">🍏</span>
          <span class="text-xl font-semibold text-gray-900" style="font-family: 'Oswald', sans-serif;">Admin Portal</span>
        </div>
        <button
          onclick={toggleSidebar}
          class="p-3 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200"
          aria-label="Close sidebar"
        >
          <svg class="w-6 h-6" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Navigation -->
      <nav class="mt-8 px-6">
        <ul class="space-y-3">
          {#each adminNavItems as item}
            <li>
              <a 
                href={item.href}
                class="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 text-gray-700 hover:bg-gray-50 hover:text-apple-medium"
              >
                <span class="text-xl mr-4">{item.icon}</span>
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
      
      <!-- Sidebar Footer -->
      <div class="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div class="text-center">
          <p class="text-sm text-gray-500">Logged in as</p>
          <p class="text-base font-medium text-gray-900">{currentUser?.email || 'Admin User'}</p>
          <button
            onclick={handleLogout}
            class="mt-3 w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-apple-medium hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>

    <!-- Sidebar Overlay (for mobile) -->
    {#if sidebarOpen}
      <div 
        class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
        onclick={toggleSidebar}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Escape' && toggleSidebar()}
      ></div>
    {/if}

    <!-- Main Content -->
    <div class="flex-1 transition-all duration-300 ease-in-out {sidebarOpen ? 'lg:ml-80' : 'ml-0'}">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <button
                onclick={toggleSidebar}
                class="p-3 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200 mr-4"
                aria-label="Toggle sidebar"
              >
                <svg class="w-7 h-7" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-gray-900" style="font-family: 'Oswald', sans-serif; font-weight: 600;">
                  Admin Dashboard
                </h1>
                <p class="text-sm text-gray-600">Welcome back, {currentUser?.email || 'Admin User'}!</p>
              </div>
            </div>
            <button
              onclick={handleLogout}
              class="px-6 py-3 text-base font-medium text-gray-600 hover:text-apple-medium hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    
      <!-- Page Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <slot />
      </div>
    </div>
  </div>
{/if} 