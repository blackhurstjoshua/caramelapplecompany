<script lang="ts">
  import CTAButton from './CTAButton.svelte';
  import type { Flavor } from '../stores/flavors';

  export let flavor: Flavor;
  export let onEdit: (() => void) | undefined = undefined;
  export let isAdmin: boolean = false;
  
  function handleClick() {
    if (isAdmin && onEdit) {
      onEdit();
    }
    // For non-admin users, we could add "Add to Cart" logic here later
  }
</script>

<div class="bg-neutral-100 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
  <!-- Image placeholder -->
  <div class="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
    <div class="text-6xl">🍎</div>
  </div>
  
  <!-- Content -->
  <div class="p-6 flex flex-col flex-grow bg-neutral-100">
    <h3 class="text-xl font-bold text-black mb-2">{flavor.name}</h3>
    <p class="text-gray-600 mb-4 leading-relaxed flex-grow">{flavor.description}</p>
    
    <div class="flex items-center justify-between mt-auto">
      <span class="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
        ${flavor.price}
      </span>
      <CTAButton size="sm" on:click={handleClick}>
        {isAdmin ? 'Edit Me' : 'Add to Cart'}
      </CTAButton>
    </div>
  </div>
</div>