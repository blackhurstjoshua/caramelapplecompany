<script lang="ts">
  import CTAButton from './CTAButton.svelte';
  import ImageUpload from './ImageUpload.svelte';
  import { Product } from '../stores/product';
  import { getAuthState } from '../auth';
  import { uploadImage, getImageUrl, type ImageUploadResult } from '../services/images';

  export let product: Product;
  export let onSave: (updatedProduct: Product) => void;
  export let onCancel: () => void;
  
  // Form state
  let name = product.name;
  let description = product.description;
  let price = product.toDollars();
  let featured = product.featured;
  let isActive = product.isActive;
  let imagePath = product.imagePath || '';
  let imageUrl = '';
  
  // Validation
  let priceError = '';
  
  // Enforce that featured products must be active
  $: if (!isActive && featured) {
    featured = false;
  }
  
  function validatePrice() {
    const numPrice = parseFloat(price.toString());
    if (isNaN(numPrice) || numPrice < 0) {
      priceError = 'Price must be a number greater than or equal to 0';
      return false;
    }
    priceError = '';
    return true;
  }
  
  function handleImageUpload(result: ImageUploadResult) {
    if (result.success && result.url && result.path) {
      imagePath = result.path;
      imageUrl = result.url;
    }
  }

  async function handleSave() {
    // Check authentication before saving
    const authState = await getAuthState();
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
      imagePath: imagePath,
      // ! Warning: This is a hack to get the price in cents
      priceCents: Math.round(price * 100), 
      featured,
      isActive
    });
    
    onSave(updatedProduct);
  }
</script>

<div class="bg-neutral-100 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-2 border-blue-300 flex flex-col h-full">
  <!-- Image section -->
  <div class="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative">
    {#if imageUrl || imagePath || product.imagePath}
      <!-- Show uploaded image -->
      <img 
        src={imageUrl || getImageUrl(imagePath || product.imagePath)}
        alt={name}
        class="w-full h-full object-cover"
      />
    {:else}
      <!-- Default placeholder -->
      <div class="text-6xl">🍎</div>
    {/if}
    
    <!-- Cancel button -->
    <button 
      onclick={onCancel}
      class="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-colors duration-200 font-bold text-sm"
    >
      ✕
    </button>
  </div>
  
  <!-- Form Content -->
  <div class="p-6 flex flex-col flex-grow bg-neutral-100 space-y-4">
    <!-- Image Upload -->
    <div>
      <div class="block text-sm font-medium text-gray-700 mb-2">Product Image</div>
      <div class="max-w-xs">
        <ImageUpload
          folder="products"
          onUploadComplete={handleImageUpload}
          label="Upload Product Image"
          showPreview={false}
        />
      </div>
    </div>
    
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
        onblur={validatePrice}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        class:border-red-500={priceError}
        required
      />
      {#if priceError}
        <p class="text-red-500 text-xs mt-1">{priceError}</p>
      {/if}
    </div>
    
    <!-- Active Checkbox -->
    <div class="flex items-center">
      <input 
        id="isActive"
        type="checkbox" 
        bind:checked={isActive}
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label for="isActive" class="ml-2 block text-sm text-gray-700">
        Active (visible to customers)
      </label>
    </div>
    
    <!-- Featured Checkbox -->
    <div class="flex items-center">
      <input 
        id="featured"
        type="checkbox" 
        bind:checked={featured}
        disabled={!isActive}
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <label for="featured" class="ml-2 block text-sm text-gray-700" class:text-gray-400={!isActive}>
        Featured on home page? {!isActive ? '(requires active)' : ''}
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