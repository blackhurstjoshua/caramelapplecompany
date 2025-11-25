<script lang="ts">
  import type { PageData } from './$types';
  import ProductCard from '$lib/components/ProductCard.svelte';

  export let data: PageData;
  
  $: products = data.products || [];
</script>

<div class="max-w-7xl mx-auto px-4 lg:px-8 py-12">
  <!-- Page Header -->
  <div class="mb-12 text-center">
    <h1 class="text-4xl font-bold text-black mb-4">Our Caramel Apples</h1>
    <p class="text-lg text-gray-600 max-w-2xl mx-auto">
      Hand-crafted with love, each caramel apple is a unique treat. Choose from our selection of delicious varieties.
    </p>
  </div>

  {#if products.length === 0}
    <!-- Empty State -->
    <div class="text-center py-16">
      <p class="text-xl text-gray-600">No products available at the moment.</p>
      <p class="text-gray-500 mt-2">Check back soon for our delicious caramel apples!</p>
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
  {/if}
</div>