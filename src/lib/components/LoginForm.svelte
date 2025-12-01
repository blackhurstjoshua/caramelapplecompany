<script lang="ts">
  import CTAButton from './CTAButton.svelte';
  
  export let title = 'Welcome Back';
  export let subtitle = 'Sign in to your account';
  export let showForgotPassword = true;
  export let showContactAdmin = true;
  export let rightSideContent: 'admin' | 'customer' | 'custom' = 'admin';
  export let loading = false;
  
  // Callback props (Svelte 5 pattern)
  export let onsubmit: (data: { email: string; password: string }) => void;
  export let onforgotpassword: (() => void) | undefined = undefined;
  export let oncontactadmin: (() => void) | undefined = undefined;
  
  let email = '';
  let password = '';
  let emailError = '';
  let passwordError = '';
  
  function validateForm() {
    emailError = '';
    passwordError = '';
    
    if (!email.trim()) {
      emailError = 'Email is required';
      return false;
    }
    
    if (!email.includes('@')) {
      emailError = 'Please enter a valid email';
      return false;
    }
    
    if (!password.trim()) {
      passwordError = 'Password is required';
      return false;
    }
    
    if (password.length < 4) {
      passwordError = 'Password must be at least 4 characters';
      return false;
    }
    
    return true;
  }
  
  function handleSubmit() {
    if (validateForm()) {
      onsubmit({ email: email.trim(), password });
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-cream p-4 text-black">
  <div class="card w-full max-w-6xl bg-base-100 shadow-2xl rounded-4xl">
    <div class="card-body p-0">
      <div class="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        <!-- Left Side - Login Form -->
        <div class="p-8 lg:p-12 flex flex-col justify-center rounded-l-4xl bg-white">
          <div class="max-w-md mx-auto w-full">
            <!-- Header -->
            <div class="text-center mb-8">
              <h1 class="text-3xl lg:text-4xl font-bold mb-2 text-gray-900" style="font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: 0.05em;">
                {title}
              </h1>
              <p class="text-gray-600 text-lg">{subtitle}</p>
            </div>
            
            <!-- Login Form -->
            <form onsubmit={handleSubmit} class="space-y-6">
              <!-- Email Input -->
              <div class="form-control">
                <label for="email" class="label">
                  <span class="label-text text-base font-medium text-gray-700">Email</span>
                </label>
                <input
                  id="email"
                  type="email"
                  bind:value={email}
                  class="input input-bordered w-full text-base bg-white border-gray-300 text-gray-900 focus:border-apple-medium focus:ring-1 focus:ring-apple-medium disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed"
                  class:input-error={emailError}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {#if emailError}
                  <div class="label">
                    <span class="label-text-alt text-red-600">{emailError}</span>
                  </div>
                {/if}
              </div>
              
              <!-- Password Input -->
              <div class="form-control">
                <label for="password" class="label">
                  <span class="label-text text-base font-medium text-gray-700">Password</span>
                </label>
                <input
                  id="password"
                  type="password"
                  bind:value={password}
                  class="input input-bordered w-full text-base bg-white border-gray-300 text-gray-900 focus:border-apple-medium focus:ring-1 focus:ring-apple-medium disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed"
                  class:input-error={passwordError}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                {#if passwordError}
                  <div class="label">
                    <span class="label-text-alt text-red-600">{passwordError}</span>
                  </div>
                {/if}
              </div>
              
              <!-- Submit Button -->
              <div class="form-control mt-8">
                <CTAButton
                  type="submit"
                  size="lg"
                  style="green"
                  disabled={loading}
                >
                  {#if loading}
                    <span class="loading loading-spinner loading-sm mr-2"></span>
                    Signing in...
                  {:else}
                    Sign In
                  {/if}
                </CTAButton>
              </div>
            </form>
            
            <!-- Recovery Options -->
            <div class="divider mt-8 mb-6 border-gray-200"></div>
            <div class="space-y-3">
              {#if showForgotPassword}
                <button
                  type="button"
                  onclick={() => onforgotpassword?.()}
                  class="btn btn-ghost btn-sm w-full text-gray-600 hover:text-apple-medium hover:bg-gray-50"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              {/if}
              
              {#if showContactAdmin}
                <button
                  type="button"
                  onclick={() => oncontactadmin?.()}
                  class="btn btn-ghost btn-sm w-full text-gray-600 hover:text-apple-medium hover:bg-gray-50"
                  disabled={loading}
                >
                  Contact Admin
                </button>
              {/if}
            </div>
          </div>
        </div>
        
        <!-- Right Side - Content -->
        <div class="hidden lg:flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 p-12 rounded-r-4xl">
          {#if rightSideContent === 'admin'}
            <div class="text-center max-w-md">
              <div class="text-6xl mb-6">🍏</div>
              <h2 class="text-2xl font-bold mb-4 text-gray-900" style="font-family: 'Oswald', sans-serif; font-weight: 600;">
                Admin Portal
              </h2>
              <p class="text-gray-700 text-lg leading-relaxed">
                Manage your caramel apple business with powerful tools for inventory, orders, and customer management.
              </p>
              <div class="mt-8 space-y-2 text-sm text-gray-600">
                <p>🔐 Secure access</p>
                <p>📊 Real-time analytics</p>
                <p>🛠️ Complete control</p>
              </div>
            </div>
          {:else if rightSideContent === 'customer'}
            <div class="text-center max-w-md">
              <div class="text-6xl mb-6">🍯</div>
              <h2 class="text-2xl font-bold mb-4 text-gray-900" style="font-family: 'Oswald', sans-serif; font-weight: 600;">
                Customer Portal
              </h2>
              <p class="text-gray-700 text-lg leading-relaxed">
                Access your order history, track deliveries, and discover new weekly flavors crafted just for you.
              </p>
              <div class="mt-8 space-y-2 text-sm text-gray-600">
                <p>📱 Order tracking</p>
                <p>🎯 Personalized offers</p>
                <p>💝 Exclusive flavors</p>
              </div>
            </div>
          {:else}
            <slot name="right-content" />
          {/if}
        </div>
      </div>
    </div>
  </div>
</div> 