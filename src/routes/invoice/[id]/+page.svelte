<script lang="ts">
  import InvoiceTemplate from '$lib/components/InvoiceTemplate.svelte';
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  
  let order = $derived(data.order);
  
  function printInvoice() {
    window.print();
  }
</script>

<svelte:head>
  <title>Invoice - Order {order.id.substring(0, 8).toUpperCase()}</title>
</svelte:head>

<div class="invoice-page">
  {#if order}
    <!-- Print button - hidden when printing -->
    <div class="print-button-container no-print">
      <div class="text-center mb-2">
        <button 
          class="btn btn-primary btn-lg"
          onclick={printInvoice}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Download PDF / Print
        </button>
        <p class="text-sm text-gray-600 mt-2">
          💡 In the print dialog, turn off "Headers and footers" for a cleaner PDF
        </p>
      </div>
    </div>
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
  
  .print-button-container {
    max-width: 8.5in;
    margin: 0 auto 1rem auto;
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
    /* Remove browser default headers/footers (URL, date, page title) */
    @page {
      margin: 0;
    }
    
    .invoice-page {
      background: white;
      padding: 0;
    }
    
    .no-print {
      display: none !important;
    }
    
    /* Hide navigation and other UI elements for printing */
    :global(body) {
      margin: 0;
      padding: 0;
    }
  }
</style>

