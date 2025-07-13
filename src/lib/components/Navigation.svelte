<script lang="ts">
  import { page } from '$app/state';
  import { ShoppingCart } from '@lucide/svelte';
  import { onMount } from 'svelte';
  
  export let isDrawerOpen = false;
  
  let scrollY = 0;
  let isScrolled = false;
  
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/order', label: 'Order' },
    { href: '/locations', label: 'Locations' },
    { href: '/catering', label: 'Catering' },
    { href: '/gift-cards', label: 'Gift Cards' },
    { href: '/merch', label: 'Merch' }
  ];
  
  function closeDrawer() {
    isDrawerOpen = false;
  }
  
  function handleScroll() {
    scrollY = window.scrollY;
    isScrolled = scrollY > 10; // Trigger after 10px of scroll
  }
  
  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <button class="p-2 transition-all duration-200 hover:scale-110" aria-label="Shopping cart">
      <ShoppingCart class="w-10 h-10" color="url(#cart-gradient)"/>
    </button>
  </div>
  
  <!-- Floating round hamburger button -->
  <label 
    for="drawer-toggle" 
    class="btn btn-ghost btn-circle fixed top-4 left-4 z-50 bg-black bg-opacity-90 shadow-lg hover:bg-opacity-100 border border-gray-200"
    aria-label="Open navigation menu"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

<style>
  .scrolled {
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .cart-icon {
    stroke: var(--color-apple-red-medium, #dc2626);
    color: var(--color-apple-red-medium, #dc2626);
    filter: drop-shadow(0 1px 2px rgba(255, 0, 122, 0.3));
  }
  
  .nav-link:hover {
    background: linear-gradient(to right, var(--color-apple-dark) 0%, var(--color-apple-medium) 55%, var(--color-apple-light) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
</style> 