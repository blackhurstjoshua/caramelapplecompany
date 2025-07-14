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

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-apple-light/20 to-apple-medium/20 p-4">
  <div class="card w-full max-w-6xl bg-base-100 shadow-2xl">
    <div class="card-body p-0">
      <div class="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        <!-- Left Side - Login Form -->
        <div class="p-8 lg:p-12 flex flex-col justify-center">
          <div class="max-w-md mx-auto w-full">
            <!-- Header -->
            <div class="text-center mb-8">
              <h1 class="text-3xl lg:text-4xl font-bold mb-2" style="font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: 0.05em;">
                {title}
              </h1>
              <p class="text-base-content/70 text-lg">{subtitle}</p>
            </div>
            
            <!-- Login Form -->
            <form on:submit|preventDefault={handleSubmit} class="space-y-6">
              <!-- Email Input -->
              <div class="form-control">
                <label for="email" class="label">
                  <span class="label-text text-base font-medium">Email</span>
                </label>
                <input
                  id="email"
                  type="email"
                  bind:value={email}
                  class="input input-bordered w-full text-base"
                  class:input-error={emailError}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {#if emailError}
                  <label class="label">
                    <span class="label-text-alt text-error">{emailError}</span>
                  </label>
                {/if}
              </div>
              
              <!-- Password Input -->
              <div class="form-control">
                <label for="password" class="label">
                  <span class="label-text text-base font-medium">Password</span>
                </label>
                <input
                  id="password"
                  type="password"
                  bind:value={password}
                  class="input input-bordered w-full text-base"
                  class:input-error={passwordError}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                {#if passwordError}
                  <label class="label">
                    <span class="label-text-alt text-error">{passwordError}</span>
                  </label>
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
            <div class="divider mt-8 mb-6"></div>
            <div class="space-y-3">
              {#if showForgotPassword}
                <button
                  type="button"
                  on:click={() => onforgotpassword?.()}
                  class="btn btn-ghost btn-sm w-full text-base-content/70 hover:text-apple-medium"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              {/if}
              
              {#if showContactAdmin}
                <button
                  type="button"
                  on:click={() => oncontactadmin?.()}
                  class="btn btn-ghost btn-sm w-full text-base-content/70 hover:text-apple-medium"
                  disabled={loading}
                >
                  Contact Admin
                </button>
              {/if}
            </div>
          </div>
        </div>
        
        <!-- Right Side - Content -->
        <div class="hidden lg:flex items-center justify-center bg-gradient-to-br from-apple-medium/10 to-apple-dark/10 p-12">
          {#if rightSideContent === 'admin'}
            <div class="text-center max-w-md">
              <div class="text-6xl mb-6">🍎</div>
              <h2 class="text-2xl font-bold mb-4" style="font-family: 'Oswald', sans-serif; font-weight: 600;">
                Admin Portal
              </h2>
              <p class="text-base-content/70 text-lg leading-relaxed">
                Manage your caramel apple business with powerful tools for inventory, orders, and customer management.
              </p>
              <div class="mt-8 space-y-2 text-sm text-base-content/60">
                <p>🔐 Secure access</p>
                <p>📊 Real-time analytics</p>
                <p>🛠️ Complete control</p>
              </div>
            </div>
          {:else if rightSideContent === 'customer'}
            <div class="text-center max-w-md">
              <div class="text-6xl mb-6">🍯</div>
              <h2 class="text-2xl font-bold mb-4" style="font-family: 'Oswald', sans-serif; font-weight: 600;">
                Customer Portal
              </h2>
              <p class="text-base-content/70 text-lg leading-relaxed">
                Access your order history, track deliveries, and discover new weekly flavors crafted just for you.
              </p>
              <div class="mt-8 space-y-2 text-sm text-base-content/60">
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