<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import LoginForm from '$lib/components/LoginForm.svelte';
  import { verifyAdminLogin, setAuthState, getAuthState, clearAuthState } from '$lib/auth';
  
  let isAuthenticated = false;
  let currentUser = '';
  let loading = false;
  let errorMessage = '';
  let successMessage = '';
  
  onMount(() => {
    const authState = getAuthState();
    isAuthenticated = authState.isAuthenticated;
    currentUser = authState.user || '';
  });
  
  async function handleLogin(data: { email: string; password: string }) {
    loading = true;
    errorMessage = '';
    successMessage = '';
    
    try {
      const result = await verifyAdminLogin(data.email, data.password);
      
      if (result.success && result.user) {
        successMessage = result.message;
        setAuthState(result.user);
        isAuthenticated = true;
        currentUser = result.user;
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
  
  function handleLogout() {
    clearAuthState();
    isAuthenticated = false;
    currentUser = '';
    successMessage = '';
    errorMessage = '';
  }
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
  <!-- Admin Dashboard -->
  <div class="min-h-screen bg-gradient-to-br from-apple-light/10 to-apple-medium/10">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900" style="font-family: 'Oswald', sans-serif; font-weight: 600;">
              Admin Dashboard
            </h1>
            <p class="text-sm text-gray-600">Welcome back, {currentUser}!</p>
          </div>
          <button
            on:click={handleLogout}
            class="btn btn-ghost btn-sm text-gray-600 hover:text-apple-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center py-16">
        <!-- Welcome Message -->
        <div class="mb-8">
          <div class="text-6xl mb-4">🍎</div>
          <h2 class="text-4xl font-bold mb-4" style="font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: 0.05em;">
            Welcome to Admin Dashboard
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            You're successfully logged in to the Caramel Apple Co. admin portal. 
            This is where you'll manage your business operations.
          </p>
        </div>
        
        <!-- Feature Cards Preview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body items-center text-center">
              <div class="text-3xl mb-2">📦</div>
              <h3 class="card-title text-lg">Orders</h3>
              <p class="text-sm text-gray-600">Manage customer orders</p>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body items-center text-center">
              <div class="text-3xl mb-2">👥</div>
              <h3 class="card-title text-lg">Customers</h3>
              <p class="text-sm text-gray-600">Customer management</p>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body items-center text-center">
              <div class="text-3xl mb-2">🍯</div>
              <h3 class="card-title text-lg">Products</h3>
              <p class="text-sm text-gray-600">Manage flavors & products</p>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body items-center text-center">
              <div class="text-3xl mb-2">📅</div>
              <h3 class="card-title text-lg">Schedule</h3>
              <p class="text-sm text-gray-600">Production planning</p>
            </div>
          </div>
        </div>
        
        <!-- Demo Credentials Info -->
        <div class="mt-12 p-6 bg-base-200 rounded-lg max-w-md mx-auto">
          <h3 class="font-semibold mb-2">Demo Credentials</h3>
          <div class="text-sm text-left space-y-1">
            <p><strong>Admin:</strong> admin@caramelapple.com / test</p>
            <p><strong>Manager:</strong> manager@caramelapple.com / hello</p>
          </div>
          <p class="text-xs text-gray-500 mt-2">Simple string comparison authentication</p>
        </div>
      </div>
    </div>
  </div>
{/if}