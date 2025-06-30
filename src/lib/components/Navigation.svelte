<script lang="ts">
  import { page } from '$app/stores';
  
  export let isDrawerOpen = false;
  
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
</script>

<div class="drawer">
  <input id="drawer-toggle" type="checkbox" class="drawer-toggle" bind:checked={isDrawerOpen} />
  
  <!-- Floating hamburger button -->
  <label 
    for="drawer-toggle" 
    class="btn btn-ghost fixed top-4 left-4 z-50 bg-white shadow-lg hover:bg-gray-50 border border-gray-200"
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
  <div class="drawer-side">
    <label for="drawer-toggle" class="drawer-overlay"></label>
    <aside class="min-h-full w-80 bg-white">
      <!-- Drawer header -->
      <div class="flex items-center justify-between p-4 border-b">
        <div class="flex items-center">
          <span class="text-2xl mr-2">🍎</span>
          <span class="text-lg font-semibold text-gray-900">Caramel Apple Co.</span>
        </div>
        <button on:click={closeDrawer} class="btn btn-ghost btn-sm">
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
                class="block px-4 py-3 rounded-2xl text-black hover:text-[#FF007A] transition-colors duration-200 font-medium"
                class:text-[#FF007A]={$page.url.pathname === link.href}
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