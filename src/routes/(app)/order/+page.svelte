<script lang="ts">
  import type { PageData } from './$types';
  import Header from '$lib/components/Header.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { Product } from '$lib/stores/product';
  
  export let data: PageData;
  
  // Convert raw data to Product instances (same as admin page)
  let products: Product[] = data.products.map((p: any) => new Product(p));
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
      <h2 class="text-2xl font-bold text-black mb-2">No products available</h2>
      <p class="text-gray-600">Check back soon for delicious caramel apples!</p>
    </div>
  {/if}
</div> 