<script lang="ts">
  import CTAButton from './CTAButton.svelte';
</script>

<section class="hero bg-white py-12 lg:py-20">
  <div class="hero-content flex-col lg:flex-row max-w-7xl mx-auto px-4 lg:px-8 gap-8 lg:gap-12">
    <!-- Video Section -->
    <div class="flex-1 w-full">
      <div class="aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <video 
          class="w-full h-full object-cover"
          controls
          poster="/images/video-poster.jpg"
        >
          <source src="/videos/promo-video.mp4" type="video/mp4">
          <p class="p-4 text-gray-600">Your browser doesn't support video playback.</p>
        </video>
      </div>
    </div>
    
    <!-- Content Section -->
    <div class="flex-1 text-center lg:text-left">
      <h1 class="text-4xl lg:text-6xl font-bold text-black mb-6 leading-tight">
        Weekly Flavors That Make Every Bite
        <span class="text-[#FF007A]">Unforgettable</span>
      </h1>
      
      <p class="text-lg text-gray-600 mb-8 leading-relaxed">
        Discover our handcrafted caramel apples made fresh daily with premium ingredients. 
        Each week brings new flavors that celebrate the perfect balance of crisp apples and 
        rich, buttery caramel.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <CTAButton href="/order" size="lg" style="green">
          Order Now
        </CTAButton>
        
        <CTAButton href="/flavors" size="lg" style="red">
          View Flavors
        </CTAButton>
        
        <button 
          class="btn btn-outline border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg px-8"
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
    <h3 class="font-bold text-xl text-black mb-4">Subscribe for Weekly Flavors</h3>
    <p class="text-gray-600 mb-6">Get notified about our latest weekly flavors and special offers!</p>
    
    <form class="space-y-4">
      <input 
        type="email" 
        placeholder="Enter your email address" 
        class="input input-bordered w-full bg-white border-gray-300 text-black placeholder-gray-400 rounded-lg focus:border-black"
      />
      <div class="modal-action justify-between">
        <button type="button" class="btn btn-ghost" on:click={() => (document.getElementById('subscribe_modal') as HTMLDialogElement)?.close()}>Cancel</button>
        <CTAButton type="submit">Subscribe</CTAButton>
      </div>
    </form>
  </div>
  <div class="modal-backdrop">
    <button on:click={() => (document.getElementById('subscribe_modal') as HTMLDialogElement)?.close()}>close</button>
  </div>
</dialog> 