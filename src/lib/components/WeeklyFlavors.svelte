<script lang="ts">
  import { weeklyFlavors, type Flavor } from '../stores/flavors';
  import CTAButton from './CTAButton.svelte';
  
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
        <div class="bg-[#E5E5E5] rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300">
          <!-- Image placeholder -->
          <div class="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
            <div class="text-6xl">🍎</div>
          </div>
          
          <!-- Content -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-black mb-2">{flavor.name}</h3>
            <p class="text-gray-600 mb-4 leading-relaxed">{flavor.description}</p>
            
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-[#FF007A]">
                ${flavor.price}
              </span>
              <CTAButton size="sm">Add to Cart</CTAButton>
            </div>
          </div>
        </div>
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