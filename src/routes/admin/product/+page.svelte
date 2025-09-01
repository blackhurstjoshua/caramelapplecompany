<script lang="ts">
  import type { PageData } from './$types';
  import type { Product } from '$lib/stores/product';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import EditProductCard from '$lib/components/EditProductCard.svelte';
  
  export let data: PageData;
  
  // State management
  let products: Product[] = [...data.products]; // Create a local copy we can edit
  let editingIndex: number | null = null; // Track which product is being edited
  
  function handleEdit(index: number) {
    editingIndex = index;
  }
  
  function handleSave(index: number, updatedProduct: Product) {
    products[index] = updatedProduct;
    editingIndex = null;
    // Force reactivity update
    products = [...products];
  }
  
  function handleCancel() {
    editingIndex = null;
  }
</script>

<div class="max-w-7xl mx-auto px-4 lg:px-8 py-8">
  <!-- Page Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-black mb-2">Product Management</h1>
    <p class="text-black">Manage your product offerings and visibility</p>
  </div>

  <!-- Products Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each products as product, index}
      {#if editingIndex === index}
        <EditProductCard 
          product={product} 
          onSave={(updatedFlavor) => handleSave(index, updatedFlavor)}
          onCancel={handleCancel}
        />
      {:else}
        <ProductCard 
          product={product} 
          onEdit={() => handleEdit(index)}
          isAdmin={true}
        />
      {/if}
    {/each}
  </div>
</div>