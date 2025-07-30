<script lang="ts">
  import { page } from '$app/state';
  import { ShoppingCart, Trash2 } from '@lucide/svelte';
  import { onMount, afterUpdate } from 'svelte';
  import { cart, cartCount, cartTotal, type CartItem } from '$lib/stores/cart';
  import CTAButton from './CTAButton.svelte';
  
    export let isDrawerOpen = false;
  export let isCartDrawerOpen = false;

  let scrollY = 0;
  let isScrolled = false;
  let isAnimating = false;
  let previousCartCount = 0;
  
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/order', label: 'Order' },
    // { href: '/catering', label: 'Catering' },
    { href: '/about', label: 'About' }
  ];
  
  function closeDrawer() {
    isDrawerOpen = false;
  }

  function toggleCartDrawer() {
    isCartDrawerOpen = !isCartDrawerOpen;
  }

  function closeCartDrawer() {
    isCartDrawerOpen = false;
  }

  function removeFromCart(itemId: string) {
    cart.removeItem(itemId);
  }
  
  function handleScroll() {
    scrollY = window.scrollY;
    isScrolled = scrollY > 10; // Trigger after 10px of scroll
  }
  
  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    previousCartCount = $cartCount; // Initialize on mount
    return () => window.removeEventListener('scroll', handleScroll);
  });

  afterUpdate(() => {
    if ($cartCount > previousCartCount) {
      isAnimating = true;
      setTimeout(() => {
        isAnimating = false;
      }, 300);
    }
    previousCartCount = $cartCount;
  });
</script>

<div class="drawer">
  <input id="drawer-toggle" type="checkbox" class="drawer-toggle" bind:checked={isDrawerOpen} />
  
  <!-- Company Name Overlay with dynamic background and sizing -->
  <div class="fixed top-0 left-0 right-0 z-40 flex justify-center transition-all duration-300 ease-in-out" 
       class:scrolled={isScrolled}>
    <div class="text-center transition-all duration-300 ease-in-out" 
         class:mt-4={!isScrolled} 
         class:mt-1={isScrolled}>
      <h1 class="text-black drop-shadow-lg transition-all duration-300 ease-in-out" 
          class:text-4xl={!isScrolled} 
          class:md:text-5xl={!isScrolled} 
          class:lg:text-6xl={!isScrolled}
          class:text-2xl={isScrolled} 
          class:md:text-3xl={isScrolled} 
          class:lg:text-4xl={isScrolled}
          style="font-family: 'Oswald', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight: 400; letter-spacing: 0.15em; word-spacing: 0.3em;">
        <!-- Mobile: Single line with CO. -->
        <span class="sm:hidden">CARAMEL APPLE CO.</span>
        <!-- Desktop: Two lines with full COMPANY -->
        <span class="hidden sm:block">
          CARAMEL APPLE<br>
          <span class="transition-all duration-300 ease-in-out"
                class:text-2xl={!isScrolled} 
                class:md:text-3xl={!isScrolled} 
                class:lg:text-4xl={!isScrolled}
                class:text-lg={isScrolled} 
                class:md:text-xl={isScrolled} 
                class:lg:text-2xl={isScrolled}>COMPANY</span>
        </span>
      </h1>
    </div>
  </div>
  
  <!-- Shopping Cart Icon - fades in when scrolling -->
  <div class="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out"
       class:opacity-0={!isScrolled}
       class:opacity-100={isScrolled}
       class:pointer-events-none={!isScrolled}
       class:pointer-events-auto={isScrolled}>
    <!-- SVG gradient definition -->
    <svg class="absolute w-0 h-0">
      <defs>
        <linearGradient id="cart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:var(--color-apple-red-medium);stop-opacity:1" />
          <stop offset="100%" style="stop-color:var(--color-apple-red-dark);stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>
    <div class="indicator">
      {#if $cartCount > 0}
        <span 
          class="indicator-item indicator-end w-5 h-5 bg-gradient-to-br from-amber-100 to-orange-200 text-black rounded-full flex items-center justify-center text-xs font-bold cart-indicator"
          class:cart-bounce={isAnimating}
        >{$cartCount}</span>
      {/if}
      <button 
        class="p-2 transition-all duration-200 hover:scale-110" 
        aria-label="Shopping cart"
        on:click={toggleCartDrawer}
      >
        <ShoppingCart class="w-10 h-10" color="url(#cart-gradient)"/>
      </button>
    </div>
  </div>
  
  <!-- Floating round hamburger button -->
  <label 
    for="drawer-toggle" 
    class="btn btn-ghost btn-circle fixed top-4 left-4 z-50 bg-black bg-opacity-90 shadow-lg hover:bg-opacity-100 border border-gray-200"
    aria-label="Open navigation menu"
  >
    <svg class="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  </label>
  
  <!-- Page content -->
  <div class="drawer-content">
    <slot />
  </div>
  
  <!-- Drawer side -->
  <div class="drawer-side z-60">
    <label for="drawer-toggle" class="drawer-overlay"></label>
    <aside class="min-h-full w-80 bg-white">
      <!-- Drawer header -->
      <div class="flex items-center justify-between p-4 border-b">
        <div class="flex items-center">
          <span class="text-2xl mr-2">🍎</span>
          <span class="text-lg font-semibold text-gray-900" style="font-family: 'Oswald', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight: 400; letter-spacing: 0.1em;">Caramel Apple Co.</span>
        </div>
        <button on:click={closeDrawer} class="btn btn-sm" aria-label="Close navigation menu">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Navigation links -->
      <nav class="p-4">
        <ul class="space-y-2">
          {#each navLinks as link}
            <li>
              <a 
                href={link.href}
                class="block px-4 py-4 rounded-2xl text-black nav-link transition-colors duration-200 text-xl"
                style="font-family: 'Oswald', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight: 600; letter-spacing: 0.05em;"
                on:click={closeDrawer}
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    </aside>
  </div>
</div>

<!-- Cart Drawer -->
<div class="drawer drawer-end">
  <input id="cart-drawer-toggle" type="checkbox" class="drawer-toggle" bind:checked={isCartDrawerOpen} />
  
  <!-- Drawer content (invisible, just for DaisyUI structure) -->
  <div class="drawer-content"></div>
  
  <!-- Cart drawer side -->
  <div class="drawer-side z-70">
    <label for="cart-drawer-toggle" class="drawer-overlay"></label>
    <aside class="min-h-full w-96 bg-white flex flex-col">
      <!-- Cart header -->
      <div class="flex items-center justify-between p-4 border-b bg-gray-50">
        <div class="flex items-center">
          <ShoppingCart class="w-6 h-6 mr-2 text-gray-700" />
          <span class="text-lg font-semibold text-gray-900">Shopping Cart</span>
          {#if $cartCount > 0}
            <span class="ml-2 bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-full">
              {$cartCount} {$cartCount === 1 ? 'item' : 'items'}
            </span>
          {/if}
        </div>
        <button on:click={closeCartDrawer} class="btn btn-sm btn-ghost" aria-label="Close cart">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Cart items -->
      <div class="flex-1 overflow-y-auto p-4">
        {#if $cart.length === 0}
          <div class="text-center py-12">
            <div class="text-6xl mb-4">🛒</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
            <p class="text-gray-500">Add some delicious caramel apples to get started!</p>
          </div>
        {:else}
          <ul class="space-y-3">
            {#each $cart as item (item.id)}
              <li class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 mb-1">{item.flavor.name}</h4>
                    <p class="text-sm text-gray-600 mb-2 line-clamp-2">{item.flavor.description}</p>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-500">Qty: {item.quantity}</span>
                        <span class="text-lg font-bold text-green-600">
                          ${(item.flavor.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <button 
                        on:click={() => removeFromCart(item.id)}
                        class="text-red-500 hover:text-red-700 transition-colors p-1"
                        aria-label="Remove from cart"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      
      <!-- Cart footer with total and checkout -->
      {#if $cart.length > 0}
        <div class="border-t bg-gray-50 p-4">
          <div class="flex items-center justify-between mb-4">
            <span class="text-lg font-semibold text-gray-900">Total:</span>
            <span class="text-2xl font-bold text-green-600">
              ${$cartTotal.toFixed(2)}
            </span>
          </div>
          <CTAButton 
            size="lg" 
            style="green"
            on:click={() => {
              // Handle checkout logic here
              console.log('Proceeding to checkout...');
            }}
          >
            Checkout
          </CTAButton>
        </div>
      {/if}
    </aside>
  </div>
</div>

<style>
  .scrolled {
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .nav-link:hover {
    background: linear-gradient(to right, var(--color-apple-dark) 0%, var(--color-apple-medium) 55%, var(--color-apple-light) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  
  .cart-indicator {
    transform: translate(-8px, 8px);
    transition: transform 0.2s ease-out;
  }
  
  .cart-bounce {
    animation: cartBounce 0.3s ease-out;
  }
  
  @keyframes cartBounce {
    0% { transform: translate(-8px, 8px) scale(1); }
    50% { transform: translate(-8px, 8px) scale(1.3); }
    100% { transform: translate(-8px, 8px) scale(1); }
  }
</style> 