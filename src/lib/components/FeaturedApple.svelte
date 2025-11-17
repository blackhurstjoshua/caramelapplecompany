<script lang="ts">
  import CTAButton from './CTAButton.svelte';
  import { Product } from '../stores/product';
  import { cart } from '../stores/cart';
  import { getImageUrl } from '../services/images';

  export let product: Product;
  export let isReversed: boolean = false;
  
  function handleAddToCart() {
    cart.addItem(product);
  }
</script>

<section class="py-16 lg:py-8 bg-cream">
  <div class="max-w-7xl mx-auto px-4 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border border-black rounded-2xl p-8 lg:p-12 bg-cream">
      <!-- Content -->
      <div class={isReversed ? "order-last lg:order-last" : "order-last lg:order-first"}>
        <h2 class="text-3xl lg:text-5xl font-bold text-black mb-6 leading-tight">
          <span class="text-black">{product.name}</span>
        </h2>
        
        <p class="text-lg text-gray-600 mb-6 leading-relaxed">
          {product.description}
        </p>
        
        <div class="flex items-center gap-6 mb-8">
          <span class="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            ${product.toDollars()}
          </span>
          {#if product.featured}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              ⭐ Weekly Special
            </span>
          {/if}
        </div>
        
        <CTAButton on:click={handleAddToCart} size="lg">
          Add to Cart
        </CTAButton>
      </div>
      
      <!-- Image -->
      <div class={isReversed ? "order-first lg:order-first" : "order-first lg:order-last"}>
        <div class="aspect-square bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl overflow-hidden shadow-sm">
          {#if product.imagePath}
            <img 
              src={getImageUrl(product.imagePath)}
              alt={product.name}
              class="w-full h-full object-cover"
              loading="lazy"
            />
          {:else}
            <!-- Placeholder for product image -->
            <div class="w-full h-full flex flex-col items-center justify-center text-center p-8">
              <div class="text-8xl mb-4">🍎</div>
              <h3 class="text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
              <p class="text-gray-600">Handcrafted with love</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
