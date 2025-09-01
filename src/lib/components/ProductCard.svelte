<script lang="ts">
  import CTAButton from './CTAButton.svelte';
  import { Product } from '../stores/product';
  import { cart } from '../stores/cart';

  export let product: Product;
  export let onEdit: (() => void) | undefined = undefined;
  export let isAdmin: boolean = false;
  
  function handleClick() {
    if (isAdmin && onEdit) {
      onEdit();
    } else {
      // Add item to cart for non-admin users
      cart.addItem(product);
    }
  }
</script>

<div class="bg-neutral-100 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
  <!-- Image placeholder -->
  <div class="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
    <div class="text-6xl">🍎</div>
  </div>
  
  <!-- Content -->
  <div class="p-6 flex flex-col flex-grow bg-neutral-100">
    <h3 class="text-xl font-bold text-black mb-2">{product.name}</h3>
    <p class="text-gray-600 mb-4 leading-relaxed flex-grow">{product.description}</p>
    
    <div class="flex items-center justify-between mt-auto">
      <span class="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
        ${product.toDollars()}
      </span>
      <CTAButton size="sm" on:click={handleClick}>
        {isAdmin ? 'Edit Me' : 'Add to Cart'}
      </CTAButton>
    </div>
  </div>
</div>