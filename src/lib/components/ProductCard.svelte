<script lang="ts">
  import CTAButton from './CTAButton.svelte';
  import { Product } from '../stores/product';
  import { cart } from '../stores/cart';
  import { getImageUrl } from '../services/images';

  export let product: Product;
  export let onEdit: (() => void) | undefined = undefined;
  export let onDelete: (() => void) | undefined = undefined;
  export let isAdmin: boolean = false;
  
  function handleEdit() {
    if (onEdit) {
      onEdit();
    }
  }
  
  function handleDelete() {
    if (onDelete) {
      onDelete();
    }
  }
  
  function handleAddToCart() {
    cart.addItem(product);
  }
</script>

<div class="bg-neutral-100 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
  <!-- Image section -->
  <div class="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative">
    {#if product.imagePath}
      <!-- Show product image -->
      <img 
        src={getImageUrl(product.imagePath)}
        alt={product.name}
        class="w-full h-full object-cover"
        loading="lazy"
      />
    {:else}
      <!-- Default placeholder -->
      <div class="text-6xl">🍎</div>
    {/if}
    
    {#if isAdmin && onDelete}
      <!-- Delete button for admin -->
      <button 
        on:click={handleDelete}
        class="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-colors duration-200 font-bold text-sm"
        title="Delete product"
      >
        ✕
      </button>
    {/if}
  </div>
  
  <!-- Content -->
  <div class="p-6 flex flex-col flex-grow bg-neutral-100">
    <h3 class="text-xl font-bold text-black mb-2">{product.name}</h3>
    <p class="text-gray-600 mb-4 leading-relaxed flex-grow">{product.description}</p>
    
    <div class="flex items-center justify-between mt-auto">
      <span class="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
        ${product.toDollars()}
      </span>
      {#if isAdmin}
        <CTAButton size="sm" on:click={handleEdit}>
          Edit
        </CTAButton>
      {:else}
        <CTAButton size="sm" on:click={handleAddToCart}>
          Add to Cart
        </CTAButton>
      {/if}
    </div>
  </div>
</div>