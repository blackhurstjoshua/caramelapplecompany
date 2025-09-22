<script lang="ts">
  import { onMount } from 'svelte';
  import FeaturedApple from './FeaturedApple.svelte';
  import { getFeaturedApples } from '../services/products';
  import { Product } from '../stores/product';

  let featuredApples: Product[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      featuredApples = await getFeaturedApples();
    } catch (err) {
      console.error('Error loading featured apples:', err);
      error = 'Failed to load featured apples';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="py-16 lg:py-24 bg-cream">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 text-center">
      <div class="text-2xl text-gray-600">Loading featured apples...</div>
    </div>
  </div>
{:else if error}
  <div class="py-16 lg:py-24 bg-cream">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 text-center">
      <div class="text-2xl text-red-600">{error}</div>
    </div>
  </div>
{:else if featuredApples.length > 0}
  {#each featuredApples as apple, index}
    <FeaturedApple product={apple} isReversed={index % 2 === 1} />
  {/each}
{:else}
  <div class="py-16 lg:py-24 bg-cream">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 text-center">
      <div class="text-2xl text-gray-600">No featured apples available at the moment.</div>
    </div>
  </div>
{/if}
