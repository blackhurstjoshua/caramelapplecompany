<script lang="ts">
  import CTAButton from './CTAButton.svelte';
  import { Product } from '../stores/product';
  import { cart } from '../stores/cart';
  import { getImageUrl } from '../services/images';

  export let product: Product;
  export let onEdit: (() => void) | undefined = undefined;
  export let onDelete: (() => void) | undefined = undefined;
  export let onReactivate: (() => void) | undefined = undefined;
  export let onMoveUp: (() => void) | undefined = undefined;
  export let onMoveDown: (() => void) | undefined = undefined;
  export let isAdmin: boolean = false;
  export let position: number | undefined = undefined;
  export let canMoveUp: boolean = true;
  export let canMoveDown: boolean = true;
  
  let quantity: number = 1;
  
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
  
  function handleReactivate() {
    if (onReactivate) {
      onReactivate();
    }
  }
  
  function handleMoveUp() {
    if (onMoveUp) {
      onMoveUp();
    }
  }
  
  function handleMoveDown() {
    if (onMoveDown) {
      onMoveDown();
    }
  }
  
  function handleAddToCart() {
    // Add the product to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      cart.addItem(product);
    }
    // Reset quantity to 1 after adding
    quantity = 1;
  }
</script>

<div class="bg-neutral-100 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300 flex flex-col h-full" class:opacity-60={isAdmin && !product.isActive}>
  <!-- Image section -->
  <div class="aspect-square bg-black flex items-center justify-center relative">
    {#if isAdmin && position !== undefined}
      <!-- Position indicator -->
      <div class="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
        #{position}
      </div>
    {/if}
    
    {#if isAdmin && (onMoveUp || onMoveDown)}
      <!-- Reorder controls -->
      <div class="absolute top-2 right-14 flex flex-col gap-1 z-10">
        {#if onMoveUp}
          <button 
            onclick={handleMoveUp}
            disabled={!canMoveUp}
            class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-colors duration-200 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            title={canMoveUp ? "Move up" : "Already at top"}
          >
            ↑
          </button>
        {/if}
        {#if onMoveDown}
          <button 
            onclick={handleMoveDown}
            disabled={!canMoveDown}
            class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-colors duration-200 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            title={canMoveDown ? "Move down" : "Already at bottom"}
          >
            ↓
          </button>
        {/if}
      </div>
    {/if}
    {#if product.imagePath}
      <!-- Show product image -->
      <img 
        src={getImageUrl(product.imagePath)}
        alt={product.name}
        class="w-full h-full object-cover"
        class:grayscale={isAdmin && !product.isActive}
        loading="lazy"
      />
    {:else}
      <!-- Default placeholder -->
      <img 
        src="/images/placeholder.svg" 
        alt="Product placeholder"
        class="w-32 h-32 invert"
        style="filter: invert(1);"
      />
    {/if}
    
    {#if isAdmin && !product.isActive}
      <!-- Inactive badge -->
      <div class="absolute top-2 left-2 bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">
        INACTIVE
      </div>
    {/if}
    
    {#if isAdmin && onDelete}
      <!-- Delete button for admin -->
      <button 
        onclick={handleDelete}
        class="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-colors duration-200 font-bold text-sm"
        title={product.isActive ? "Deactivate product" : "Product already inactive"}
      >
        ✕
      </button>
    {/if}
  </div>
  
  <!-- Content -->
  <div class="p-6 flex flex-col flex-grow bg-neutral-100">
    <h3 class="text-xl font-bold text-black mb-2">{product.name}</h3>
    <p class="text-gray-600 mb-4 leading-relaxed flex-grow">{product.description}</p>
    
    <div class="mt-auto">
      <div class="flex items-center justify-between mb-3">
        <span class="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
          ${product.toDollars().toFixed(2)}
        </span>
      </div>
      
      {#if isAdmin}
        <div class="flex gap-2">
          {#if !product.isActive && onReactivate}
            <button
              onclick={handleReactivate}
              class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
              title="Reactivate product"
            >
              Reactivate
            </button>
          {/if}
          <CTAButton size="sm" on:click={handleEdit}>
            Edit
          </CTAButton>
        </div>
      {:else}
        <!-- Quantity input and Add to Cart button for customers -->
        <div class="flex flex-col gap-2">
          <label class="input input-bordered validator flex items-center gap-2 bg-white">
            <span class="text-sm font-medium text-gray-700">Qty:</span>
            <input
              type="number"
              bind:value={quantity}
              min="1"
              max="999"
              required
              pattern="[0-9]*"
              title="Must be between 1 and 999"
              class="grow tabular-nums bg-white"
              placeholder="1"
            />
          </label>
          <div class="w-full">
            <CTAButton size="sm" on:click={handleAddToCart}>
              Add {quantity > 1 ? `${quantity}` : ''} to Cart
            </CTAButton>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>