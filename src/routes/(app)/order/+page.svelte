<script lang="ts">
  import type { PageData } from './$types';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import type { Flavor } from '$lib/stores/flavors';
  
  export let data: PageData;
  
  // Get all products from the loaded data
  let products: Flavor[] = data.products;
</script>

<svelte:head>
  <title>Order Caramel Apples | Caramel Apple Company</title>
  <meta name="description" content="Browse and order our delicious caramel apples. Fresh, handcrafted treats made with love." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 lg:px-8 py-8 pt-24">
  <!-- Page Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-black mb-2">Order Caramel Apples</h1>
    <p class="text-black">Choose from our delicious selection of handcrafted caramel apples</p>
  </div>

  <!-- Products Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each products as product}
      <ProductCard 
        flavor={product} 
        isAdmin={false}
      />
    {/each}
  </div>

  <!-- Empty state (if no products) -->
  {#if products.length === 0}
    <div class="text-center py-12">
      <div class="text-6xl mb-4">🍎</div>
      <h2 class="text-2xl font-bold text-black mb-2">No products available</h2>
      <p class="text-gray-600">Check back soon for delicious caramel apples!</p>
    </div>
  {/if}
</div> 