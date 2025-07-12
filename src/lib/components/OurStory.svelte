<script lang="ts">
  import CTAButton from './CTAButton.svelte';
</script>

<section class="py-16 lg:py-24 bg-cream">
  <div class="max-w-7xl mx-auto px-4 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Content -->
      <div>
        <h2 class="text-3xl lg:text-5xl font-bold text-black mb-6 leading-tight">
          Our Story: From Family Recipe to 
          <span class="text-[#FF007A]">Sweet Success</span>
        </h2>
        
        <p class="text-lg text-gray-600 mb-6 leading-relaxed">
          What started as Grandma Rose's secret caramel recipe in our family kitchen 
          has blossomed into a beloved tradition. For over 30 years, we've been 
          handcrafting the perfect caramel apple experience, one bite at a time.
        </p>
        
        <p class="text-lg text-gray-600 mb-8 leading-relaxed">
          Every apple is hand-selected for its crisp texture, every batch of caramel 
          is made with real butter and cream, and every topping is carefully chosen 
          to create moments of pure joy.
        </p>
        
        <CTAButton href="/about" size="lg">
          Read Our Full Story
        </CTAButton>
      </div>
      
      <!-- Image -->
      <div class="order-first lg:order-last">
        <div class="aspect-square bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl overflow-hidden shadow-sm">
          <!-- Placeholder for family/kitchen image -->
          <div class="w-full h-full flex flex-col items-center justify-center text-center p-8">
            <div class="text-8xl mb-4">👵</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Grandma Rose's Kitchen</h3>
            <p class="text-gray-600">Where it all began in 1994</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section> 