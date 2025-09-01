<script lang="ts">
  import { weeklyFlavors, type Flavor } from '../stores/flavors';
  import CTAButton from './CTAButton.svelte';
  import ProductCard from './ProductCard.svelte';
  
  $: specialFlavors = $weeklyFlavors.filter(flavor => flavor.isWeeklySpecial);
</script>

<section class="py-16 lg:py-24 bg-cream">
  <div class="max-w-7xl mx-auto px-4 lg:px-8">
    <!-- Section Header -->
    <div class="text-center mb-12">
      <h2 class="text-3xl lg:text-5xl font-bold text-black mb-4">
        This Week's Featured Flavors
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Each week we craft new combinations that celebrate the perfect harmony of 
        crisp apples, rich caramel, and premium toppings.
      </p>
    </div>
    
    <!-- Flavors Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {#each specialFlavors as flavor}
        <!-- <ProductCard product={flavor} isAdmin={false} /> -->
      {/each}
    </div>
    
    <!-- CTA Section -->
    <div class="text-center">
      <CTAButton href="/order" size="lg">
        View All Flavors
      </CTAButton>
    </div>
  </div>
</section> 