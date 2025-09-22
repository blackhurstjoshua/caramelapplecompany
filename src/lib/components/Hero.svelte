<script lang="ts">
  import CTAButton from './CTAButton.svelte';
  import { onMount } from 'svelte';
  
  // Hero carousel slides with videos and fallback images
  const heroSlides = [
    {
      id: 'slide3',
      title: 'Premium',
      titleHighlight: 'Ingredients',
      textColor: 'white', // 'white' or 'black'
      videoUrl: 'https://xbjkguuwlwqhrfumrkye.supabase.co/storage/v1/object/public/videos/Trimmed.mov',
      imageUrl: 'https://xbjkguuwlwqhrfumrkye.supabase.co/storage/v1/object/public/images/20201113_065420.jpg',
      imageAlt: 'Gourmet caramel apples with toppings'
    },
    {
      id: 'slide1',
      title: 'Handcrafted',
      titleHighlight: 'Weekly Flavors',
      textColor: 'white', // 'white' or 'black'
      videoUrl: 'https://xbjkguuwlwqhrfumrkye.supabase.co/storage/v1/object/public/videos/IMG_7596.mov',
      imageUrl: 'https://xbjkguuwlwqhrfumrkye.supabase.co/storage/v1/object/public/images/20201113_065420.jpg',
      imageAlt: 'Handcrafted caramel apples being made'
    },
    {
      id: 'slide2', 
      title: 'Made Fresh',
      titleHighlight: 'Daily',
      textColor: 'white', // 'white' or 'black'
      videoUrl: 'https://xbjkguuwlwqhrfumrkye.supabase.co/storage/v1/object/public/videos/IMG_7614.mov',
      imageUrl: 'https://xbjkguuwlwqhrfumrkye.supabase.co/storage/v1/object/public/images/20201113_065420.jpg',
      imageAlt: 'Fresh caramel apples on display'
    }
  ];
  
  let currentSlide = 0;
  let carouselContainer: HTMLElement;
  
  onMount(() => {
    // Auto-advance carousel every 5 seconds
    const interval = setInterval(() => {
      nextSlide();
    }, 9000);
    
    return () => clearInterval(interval);
  });
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % heroSlides.length;
    updateCarousel();
  }
  
  function prevSlide() {
    currentSlide = currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1;
    updateCarousel();
  }
  
  function goToSlide(index: number) {
    currentSlide = index;
    updateCarousel();
  }
  
  function updateCarousel() {
    if (carouselContainer) {
      const slideWidth = carouselContainer.offsetWidth;
      carouselContainer.scrollTo({
        left: currentSlide * slideWidth,
        behavior: 'smooth'
      });
    }
  }
</script>

<!-- Hero Carousel Section -->
<section class="relative bg-cream py-8">
  <!-- Carousel Container -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="carousel w-full aspect-video rounded-2xl overflow-hidden shadow-2xl" bind:this={carouselContainer}>
      {#each heroSlides as slide, index}
        <div id={slide.id} class="carousel-item relative w-full aspect-video">
        <!-- Background Video/Image -->
        <div class="absolute inset-0">
          <!-- Video element -->
          <video 
            class="w-full h-full object-cover"
            autoplay 
            muted 
            loop
            poster={slide.imageUrl}
            playsinline
            on:error={(e) => {
              // Hide video and show fallback image if video fails to load
              const video = e.target as HTMLVideoElement;
              const slideContainer = video.closest('.carousel-item');
              const img = slideContainer?.querySelector('img') as HTMLImageElement;
              
              if (video) video.style.display = 'none';
              if (img) img.style.display = 'block';
            }}
          >
            <source src={slide.videoUrl} type="video/mp4">
            <source src={slide.videoUrl} type="video/mov">
            <!-- Fallback to image if video doesn't load -->
          </video>
          
          <!-- Fallback image (hidden by default, shown if video fails) -->
          <img 
            src={slide.imageUrl} 
            alt={slide.imageAlt}
            class="w-full h-full object-cover hidden"
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
        
        <!-- Hero Overlay -->
        <div class="hero-overlay bg-black bg-opacity-40"></div>
        
        <!-- Hero Content -->
        <div class="absolute inset-0 flex items-center justify-center z-10 px-4">
          <div class="text-center max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-title mb-4 sm:mb-6 leading-tight {slide.textColor === 'white' ? 'text-white' : 'text-black'}">
              {slide.title}
              <span class="block {slide.textColor === 'white' ? 'text-white' : 'text-black'}">{slide.titleHighlight}</span>
            </h1>
            
            <div class="flex justify-center">
              <CTAButton href="/order" size="md" style="green">
                Order Now
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    {/each}
    
    <!-- Carousel Navigation -->
    <div class="absolute left-4 right-4 top-1/2 flex -translate-y-1/2 transform justify-between z-20">
      <button 
        class="btn btn-circle btn-sm btn-outline border-white text-white hover:bg-white hover:text-black bg-black bg-opacity-30"
        on:click={prevSlide}
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button 
        class="btn btn-circle btn-sm btn-outline border-white text-white hover:bg-white hover:text-black bg-black bg-opacity-30"
        on:click={nextSlide}
        aria-label="Next slide"
      >
        ❯
      </button>
    </div>
    
    <!-- Carousel Indicators -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
      {#each heroSlides as _, index}
        <button
          class="w-2 h-2 rounded-full transition-all duration-300 {currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'}"
          on:click={() => goToSlide(index)}
          aria-label="Go to slide {index + 1}"
        ></button>
      {/each}
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