<script lang="ts">
  import CTAButton from './CTAButton.svelte';
  import { Product } from '../stores/product';
  import { getAuthState } from '../auth';

  export let product: Product;
  export let onSave: (updatedProduct: Product) => void;
  export let onCancel: () => void;
  
  // Form state
  let name = product.name;
  let description = product.description;
  let price = product.toDollars();
  let isWeeklySpecial = product.isWeeklySpecial;
  
  // Validation
  let priceError = '';
  
  function validatePrice() {
    const numPrice = parseFloat(price.toString());
    if (isNaN(numPrice) || numPrice < 0) {
      priceError = 'Price must be a number greater than or equal to 0';
      return false;
    }
    priceError = '';
    return true;
  }
  
  function handleSave() {
    // Check authentication before saving
    const authState = getAuthState();
    if (!authState.isAuthenticated) {
      alert('You must be authenticated to save changes');
      onCancel(); // Exit edit mode
      return;
    }
    
    if (!validatePrice()) return;
    
    const updatedProduct = new Product({
      ...product,
      name: name.trim(),
      description: description.trim(),
      // ! Warning: This is a hack to get the price in cents
      priceCents: Math.round(price * 100), 
      isWeeklySpecial
    });
    
    onSave(updatedProduct);
  }
</script>

<div class="bg-neutral-100 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-2 border-blue-300 flex flex-col h-full">
  <!-- Image placeholder -->
  <div class="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative">
    <div class="text-6xl">🍎</div>
    <!-- Cancel button -->
    <button 
      on:click={onCancel}
      class="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-colors duration-200 font-bold text-sm"
    >
      ✕
    </button>
  </div>
  
  <!-- Form Content -->
  <div class="p-6 flex flex-col flex-grow bg-neutral-100 space-y-4">
    <!-- Name Input -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
      <input 
        id="name"
        type="text" 
        bind:value={name}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
    
    <!-- Description Input -->
    <div class="flex-grow">
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea 
        id="description"
        bind:value={description}
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      ></textarea>
    </div>
    
    <!-- Price Input -->
    <div>
      <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
      <input 
        id="price"
        type="number" 
        bind:value={price}
        min="0"
        step="0.01"
        on:blur={validatePrice}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        class:border-red-500={priceError}
        required
      />
      {#if priceError}
        <p class="text-red-500 text-xs mt-1">{priceError}</p>
      {/if}
    </div>
    
    <!-- Weekly Special Checkbox -->
    <div class="flex items-center">
      <input 
        id="weeklySpecial"
        type="checkbox" 
        bind:checked={isWeeklySpecial}
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label for="weeklySpecial" class="ml-2 block text-sm text-gray-700">
        Show as Weekly Special
      </label>
    </div>
    
    <!-- Save Button -->
    <div class="mt-auto pt-4">
      <div class="w-full">
        <CTAButton size="sm" on:click={handleSave}>
          Save Changes
        </CTAButton>
      </div>
    </div>
  </div>
</div>