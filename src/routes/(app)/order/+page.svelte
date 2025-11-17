<script lang="ts">
  import type { PageData } from './$types';
  import Header from '$lib/components/Header.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { Product } from '$lib/stores/product';
  import { searchProductsByName } from '$lib/services/products';
  
  let { data }: { data: PageData } = $props();
  
  // Convert raw data to Product instances (same as admin page)
  let allProducts: Product[] = data.products.map((p: any) => new Product(p));
  
  // Search state
  let searchQuery = $state('');
  let isSearching = $state(false);
  let searchResults = $state<Product[]>([]);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Derived products - either all products or search results
  let products = $derived(searchQuery.trim().length >= 3 ? searchResults : allProducts);
  
  async function handleSearchInput() {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const query = searchQuery.trim();
    
    // Reset if query is too short
    if (query.length < 3) {
      searchResults = [];
      isSearching = false;
      return;
    }
    
    // Set searching state immediately
    isSearching = true;
    
    // Debounce for 500ms (half a second)
    debounceTimer = setTimeout(async () => {
      try {
        const results = await searchProductsByName(query);
        // Convert to Product instances and filter for active products only
        searchResults = results
          .filter(p => p.is_active)
          .map(p => new Product(p));
      } catch (error) {
        console.error('Error searching products:', error);
        searchResults = [];
      } finally {
        isSearching = false;
      }
    }, 500);
  }
  
  function clearSearch() {
    searchQuery = '';
    searchResults = [];
    isSearching = false;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }
</script>

<svelte:head>
  <title>Order Caramel Apples | Caramel Apple Company</title>
  <meta name="description" content="Browse and order our delicious caramel apples. Fresh, handcrafted treats made with love." />
</svelte:head>

<Header />

<div class="max-w-7xl mx-auto px-4 lg:px-8 py-8">
  <!-- Page Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-black mb-2">Order Caramel Apples</h1>
    <p class="text-black">Choose from our delicious selection of handcrafted caramel apples</p>
  </div>

  <!-- Search Bar -->
  <div class="mb-6">
    <div class="relative w-full">
      <input 
        type="text" 
        placeholder="Search products by name (min 3 characters)..." 
        class="input w-full bg-white text-gray-900 pr-20 border border-black placeholder:text-gray-700"
        bind:value={searchQuery}
        oninput={handleSearchInput}
      />
      {#if isSearching}
        <div class="absolute right-3 top-1/2 -translate-y-1/2">
          <span class="loading loading-spinner loading-sm"></span>
        </div>
      {:else if searchQuery}
        <button 
          class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
          onclick={clearSearch}
          title="Clear search"
        >
          ✕
        </button>
      {/if}
    </div>
    {#if searchQuery.trim().length > 0 && searchQuery.trim().length < 3}
      <p class="text-sm text-gray-500 mt-2">Type at least 3 characters to search</p>
    {:else if searchQuery.trim().length >= 3 && !isSearching}
      <p class="text-sm text-gray-600 mt-2">
        {products.length === 0 ? 'No products found' : `Showing ${products.length} result${products.length !== 1 ? 's' : ''}`}
      </p>
    {/if}
  </div>

  <!-- Loading State -->
  {#if isSearching}
    <div class="flex flex-col justify-center items-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="mt-4 text-gray-600">Searching products...</span>
    </div>
  {:else}
    <!-- Products Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each products as product}
        <ProductCard 
          product={product} 
          isAdmin={false}
        />
      {/each}
    </div>

    <!-- Empty state (if no products) -->
    {#if products.length === 0}
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🍎</div>
        <h2 class="text-2xl font-bold text-black mb-2">
          {searchQuery.trim().length >= 3 ? 'No products found' : 'No products available'}
        </h2>
        <p class="text-gray-600">
          {searchQuery.trim().length >= 3 ? 'Try a different search term' : 'Check back soon for delicious caramel apples!'}
        </p>
      </div>
    {/if}
  {/if}
</div> 