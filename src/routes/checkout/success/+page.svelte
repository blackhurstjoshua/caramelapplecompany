<script lang="ts">
  import { onMount } from 'svelte';
  import { cart } from '$lib/stores/cart';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import CTAButton from '$lib/components/CTAButton.svelte';

  let { data } = $props();

  onMount(() => {
    // Ensure cart is cleared if landing here directly
    cart.clear();
  });

  function goHome() {
    goto('/');
  }

  function orderAgain() {
    goto('/order');
  }
</script>

<svelte:head>
  <title>Order Confirmed - Caramel Apple Co.</title>
  <meta name="description" content="Thank you for your order! We'll be in touch soon with next steps." />
</svelte:head>

<main class="min-h-screen bg-cream">
  <!-- Header -->
  <Header />
  
  <!-- Success Content -->
  <section class="py-12 lg:py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Success Card -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12 text-center">
        
        <!-- Success Icon & Animation -->
        <div class="mb-8">
          <div class="relative mx-auto w-24 h-24 mb-6">
            <div class="absolute inset-0 bg-green-100 rounded-full animate-ping"></div>
            <div class="relative bg-green-500 rounded-full w-24 h-24 flex items-center justify-center">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Main Message -->
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 leading-tight">
          Order Confirmed!
        </h1>
        
        <p class="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Thank you for choosing Caramel Apple Co.! We've received your order and will be contacting you shortly with next steps.
        </p>

        <!-- What's Next Section -->
        <div class="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
          <h2 class="text-xl font-semibold text-black mb-4 text-center">What happens next?</h2>
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                <span class="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <p class="text-gray-700"><strong>Order Confirmation:</strong> You'll receive a confirmation email or text within 15 minutes.</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                <span class="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <p class="text-gray-700"><strong>Contact:</strong> We'll reach out to coordinate pickup or delivery details.</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                <span class="text-white text-sm font-bold">3</span>
                <div>
                  <p class="text-gray-700"><strong>Preparation:</strong> We'll start handcrafting your delicious caramel apples fresh.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <CTAButton size="lg" on:click={goHome}>
            Back to Home
          </CTAButton>
        </div>

        <!-- Contact Info -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-2">
            Questions about your order?
          </p>
          <div class="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm">
            <a href="mailto:kriataleecook5@gmail.com" class="text-green-600 hover:text-green-700 font-medium">
              📧 kriataleecook5@gmail.com
            </a>
            <span class="hidden sm:inline text-gray-300">•</span>
            <a href="tel:+18017877288" class="text-green-600 hover:text-green-700 font-medium">
              📞 (801) 787-7288
            </a>
          </div>
        </div>
      </div>

      <!-- Social Proof / Trust Section -->
      <div class="mt-12 text-center">
        <div class="flex justify-center items-center space-x-8 opacity-60">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">⭐</span>
            <span class="text-sm text-gray-600">500+ Happy Customers</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-2xl">🍎</span>
            <span class="text-sm text-gray-600">Handcrafted Daily</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-2xl">🚚</span>
            <span class="text-sm text-gray-600">Fresh Delivery</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Footer -->
  <Footer />
</main>

<style>
  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  .animate-ping {
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
</style>


