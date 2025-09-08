<script lang="ts">
  import CTAButton from './CTAButton.svelte';
  
  // Hardcoded hero image for now
  const heroImageUrl = 'https://xbjkguuwlwqhrfumrkye.supabase.co/storage/v1/object/public/images/20201113_065420.jpg';
</script>

<section class="bg-cream">
  <!-- Video Section (Hidden on mobile) -->
  <div class="w-full hidden sm:block">
    <div class="max-w-6xl mx-auto px-4 pt-8 pb-4">
      <!-- Hero Image -->
      <div class="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden shadow-lg">
        <img 
          src={heroImageUrl} 
          alt="Caramel Apple Company - Delicious handcrafted caramel apples"
          class="w-full h-full object-cover"
          loading="eager"
        />
      </div>
    </div>
  </div>
  
  <!-- Hero Content -->
  <div class="py-16 lg:py-24 pt-24 sm:pt-16">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold font-title mb-6 leading-tight text-black">
        Weekly Flavors That Make Every Bite
        <span class="text-[#FF007A]">Unforgettable</span>
      </h1>
      
      <p class="text-lg md:text-xl font-body mb-8 leading-relaxed max-w-2xl mx-auto text-gray-700">
        Discover our handcrafted caramel apples made fresh daily with premium ingredients. 
        Each week brings new flavors that celebrate the perfect balance of crisp apples and 
        rich, buttery caramel.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <CTAButton href="/order" size="lg" style="green">
          Order Now
        </CTAButton>
        
        <CTAButton href="/flavors" size="lg" style="red">
          View Flavors
        </CTAButton>
        
        <button 
          class="btn btn-outline btn-lg border-black text-black hover:bg-black hover:text-white rounded-lg px-8 font-body"
          on:click={() => (document.getElementById('subscribe_modal') as HTMLDialogElement)?.showModal()}
        >
          Subscribe for Weekly Flavors
        </button>
      </div>
    </div>
  </div>
</section>

<!-- Subscribe Modal -->
<dialog id="subscribe_modal" class="modal">
  <div class="modal-box bg-white rounded-2xl">
    <h3 class="font-bold text-xl text-black mb-4 font-title">Subscribe for Weekly Flavors</h3>
    <p class="text-gray-600 mb-6 font-body">Get notified about our latest weekly flavors and special offers!</p>
    
    <form class="space-y-4">
      <input 
        type="email" 
        placeholder="Enter your email address" 
        class="input input-bordered w-full bg-white border-gray-300 text-black placeholder-gray-400 rounded-lg focus:border-black font-body"
      />
      <div class="modal-action justify-between">
        <button type="button" class="btn btn-ghost font-body" on:click={() => (document.getElementById('subscribe_modal') as HTMLDialogElement)?.close()}>Cancel</button>
        <CTAButton type="submit">Subscribe</CTAButton>
      </div>
    </form>
  </div>
  <div class="modal-backdrop">
    <button on:click={() => (document.getElementById('subscribe_modal') as HTMLDialogElement)?.close()}>close</button>
  </div>
</dialog> 