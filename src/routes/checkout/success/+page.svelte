<script lang="ts">
  import { onMount } from 'svelte';
  import { cart } from '$lib/stores/cart';
  import { goto } from '$app/navigation';

  onMount(() => {
    // Ensure cart is cleared if landing here directly
    cart.clear();
  });

  function goHome() {
    goto('/');
  }
</script>

<div class="max-w-2xl mx-auto p-8 text-center">
  <div class="text-6xl mb-4">🎉</div>
  <h1 class="text-3xl font-bold mb-2">Thank you for your order!</h1>
  <p class="text-gray-600 mb-6">We'll be contacting you shortly with next steps.</p>
  <button class="btn btn-primary" on:click={goHome}>Back to Home</button>
  <div class="mt-6 text-sm text-gray-500">
    If you chose delivery, we'll confirm your address and delivery window.
  </div>
</div>


