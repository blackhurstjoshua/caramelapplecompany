<script lang="ts">
  import Navigation from '$lib/components/Navigation.svelte';
  
  let isDrawerOpen = false;
  let isCartDrawerOpen = false;
</script>

<div class="min-h-screen bg-cream">
  <Navigation bind:isDrawerOpen bind:isCartDrawerOpen />
  
  <slot />
</div> 