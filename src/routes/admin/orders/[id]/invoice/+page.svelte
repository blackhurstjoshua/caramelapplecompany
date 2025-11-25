<script lang="ts">
  import InvoiceTemplate from '$lib/components/InvoiceTemplate.svelte';
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  
  let order = $derived(data.order);
</script>

<svelte:head>
  <title>Invoice - Order {order.id.substring(0, 8).toUpperCase()}</title>
</svelte:head>

<div class="invoice-page">
  {#if order}
    <InvoiceTemplate {order} />
  {:else}
    <div class="loading">Loading invoice...</div>
  {/if}
</div>

<style>
  .invoice-page {
    min-height: 100vh;
    background: #f3f4f6;
    padding: 2rem 1rem;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    font-size: 1.25rem;
    color: #6b7280;
  }
  
  /* Print styles */
  @media print {
    .invoice-page {
      background: white;
      padding: 0;
    }
    
    /* Hide navigation and other UI elements for printing */
    :global(body) {
      margin: 0;
      padding: 0;
    }
  }
</style>

