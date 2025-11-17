<script lang="ts">
    import type { PageData } from './$types';
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import { MapPin, Phone, Mail, Clock, Heart, Users, Award } from '@lucide/svelte';

    let { data }: { data: PageData } = $props();
</script>

<Header />

<!-- Hero Section -->
<section class="bg-gradient-to-br from-gray-50 to-gray-100 py-16 lg:py-24">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" 
          style="font-family: var(--font-family-title);">
        About <span style="color: var(--color-apple-medium);">Caramel Apple Company</span>
      </h1>
      <p class="text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
        Crafting the perfect caramel apple experience since day one. 
        We're passionate about bringing you the finest handmade treats with love and tradition.
      </p>
    </div>
  </div>
</section>

<!-- Contact Information Cards -->
<section class="py-16 lg:py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" 
          style="font-family: var(--font-family-title);">
        What you need to know
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        We'd love to hear from you! Reach out for orders, questions, or just to say hello.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Phone Card -->
      <div class="card text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style="background: linear-gradient(to right, var(--color-apple-dark) 0%, var(--color-apple-medium) 75%, var(--color-apple-light) 100%);">
        <div class="card-body text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Phone class="w-8 h-8" />
            </div>
          </div>
          <h3 class="card-title text-2xl justify-center mb-2" style="font-family: var(--font-family-title);">
            Call Us
          </h3>
          <p class="text-4xl lg:text-5xl font-bold mb-2" style="font-family: var(--font-family-title);">
            (801) 787-7288
          </p>
          <p class="text-lg opacity-90">
            Mon-Sat: 8AM-8PM<br>
            Sunday: 10AM-6PM
          </p>
        </div>
      </div>

      <!-- Location Card -->
      <div class="card bg-white border-2 border-gray-200 text-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        <div class="card-body text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin class="w-8 h-8 text-gray-700" />
            </div>
          </div>
          <h3 class="card-title text-2xl justify-center mb-2 text-gray-900" style="font-family: var(--font-family-title);">
            Pickup Location
          </h3>
          <p class="text-2xl lg:text-3xl font-bold mb-2 text-gray-900" style="font-family: var(--font-family-title);">
            6229 West 10830 North<br>
            Highland, UT 84003
          </p>
          <p class="text-lg text-gray-600">
            Outdoor refrigerator for pickup orders
          </p>
        </div>
      </div>

      <!-- Email Card -->
      <div class="card bg-black text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 md:col-span-2 lg:col-span-1 black-card-override">
        <div class="card-body text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Mail class="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 class="card-title text-2xl justify-center mb-2 text-white" style="font-family: var(--font-family-title);">
            Email Us
          </h3>
          <p class="text-2xl lg:text-3xl font-bold mb-2 text-white" style="font-family: var(--font-family-title);">
            kriataleecook5@gmail.com
          </p>
          <p class="text-lg opacity-90 text-white">
            We respond as soon as possible
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Our Story Section -->
<section class="py-16 lg:py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Story Content -->
      <div>
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6" 
            style="font-family: var(--font-family-title);">
          Our Sweet Story
        </h2>
        <div class="prose prose-lg text-gray-700">
          <p class="text-xl leading-relaxed mb-6">
            What started as a family recipe passed down through generations has blossomed into 
            a beloved local tradition. Every caramel apple we create is handcrafted with the 
            same care and attention that our grandmother put into her kitchen creations.
          </p>
          <p class="text-lg leading-relaxed mb-6">
            We source only the finest Granny Smith apples from local orchards, pair them with 
            our signature caramel recipe, and finish each one with premium toppings that make 
            every bite a celebration.
          </p>
          <p class="text-lg leading-relaxed">
            From our family to yours, we're committed to creating moments of joy, one perfect 
            caramel apple at a time.
          </p>
        </div>
      </div>

      <!-- Values Cards -->
      <div class="grid grid-cols-1 gap-6">
        <div class="card bg-white shadow-lg border-l-4" style="border-left-color: var(--color-apple-medium);">
          <div class="card-body">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: var(--color-apple-light); opacity: 0.3;">
                <Heart class="w-6 h-6" style="color: var(--color-apple-dark);" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900" style="font-family: var(--font-family-title);">
                  Made with Love
                </h3>
                <p class="text-gray-600">Every apple is crafted by hand with passion and care</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-white shadow-lg border-l-4 border-gray-400">
          <div class="card-body">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Users class="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900" style="font-family: var(--font-family-title);">
                  Family Tradition
                </h3>
                <p class="text-gray-600">Three generations of perfecting our craft</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-black text-white shadow-lg black-card-override">
          <div class="card-body">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Award class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-white" style="font-family: var(--font-family-title);">
                  Premium Quality
                </h3>
                <p class="text-gray-300">Only the finest ingredients make it into our kitchen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Hours & Location Details -->
<section class="py-16 lg:py-20 bg-white">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" 
          style="font-family: var(--font-family-title);">
        Visit Our Kitchen
      </h2>
      <p class="text-lg text-gray-600">
        Come see where the magic happens! We love welcoming visitors to our cozy kitchen.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Hours Card -->
      <div class="card bg-white border-2 border-gray-200 shadow-lg">
        <div class="card-body">
          <div class="flex items-center gap-3 mb-4">
            <Clock class="w-8 h-8 text-gray-700" />
            <h3 class="text-2xl font-bold text-gray-900" style="font-family: var(--font-family-title);">
              Store Hours
            </h3>
          </div>
          <div class="space-y-3 text-lg">
            <div class="flex justify-between">
              <span class="font-semibold">Monday - Friday</span>
              <span class="text-2xl font-bold text-gray-900">8:00 AM - 8:00 PM</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">Saturday</span>
              <span class="text-2xl font-bold text-gray-900">8:00 AM - 8:00 PM</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">Sunday</span>
              <span class="text-2xl font-bold text-gray-900">10:00 AM - 6:00 PM</span>
            </div>
          </div>
          <div class="mt-4 p-3 rounded-lg" style="background-color: var(--color-apple-light);">
            <p class="text-sm font-medium" style="color: black;">
              💡 Pro tip: Call ahead for large orders or special requests!
            </p>
          </div>
        </div>
      </div>

      <!-- Location Details Card -->
      <div class="card bg-black text-white shadow-lg black-card-override">
        <div class="card-body">
          <div class="flex items-center gap-3 mb-4">
            <MapPin class="w-8 h-8 text-white" />
            <h3 class="text-2xl font-bold text-white" style="font-family: var(--font-family-title);">
              Find Us
            </h3>
          </div>
          <div class="space-y-4">
            <div>
              <p class="text-2xl font-bold text-white mb-2">
                123 Apple Orchard Lane<br>
                Sweet Valley, CA 90210
              </p>
            </div>
            <div class="space-y-2 text-gray-300">
              <p class="flex items-center gap-2 text-gray-300">
                <span class="font-semibold">🚗 Parking:</span> Free street parking available
              </p>
              <p class="flex items-center gap-2 text-gray-300">
                <span class="font-semibold">🚌 Transit:</span> Bus route 42 stops right outside
              </p>
              <p class="flex items-center gap-2 text-gray-300">
                <span class="font-semibold">♿ Access:</span> Wheelchair accessible entrance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Call to Action -->
<section class="py-16" style="background: linear-gradient(to right, var(--color-apple-dark) 0%, var(--color-apple-medium) 75%, var(--color-apple-light) 100%);">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6" 
        style="font-family: var(--font-family-title);">
      Ready to Taste the Magic?
    </h2>
    <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
      Don't wait – our caramel apples are made fresh daily and they go fast! 
      Place your order today and taste what everyone's talking about.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/order" class="btn btn-lg bg-white border-none text-xl font-bold px-8 hover:bg-gray-100 order-now-btn">
        🍎 Order Now
      </a>
      <a href="tel:8017877288" class="btn btn-lg btn-outline border-white text-white text-xl font-bold px-8 call-us-btn">
        📞 Call Us
      </a>
    </div>
  </div>
</section>

<Footer />

<style>
  /* Override global text color for black cards */
  .black-card-override * {
    color: white !important;
  }
  
  .black-card-override .text-gray-300 {
    color: #d1d5db !important;
  }
  
  /* CTA Button styles */
  .order-now-btn {
    color: var(--color-apple-medium) !important;
  }
  
  .call-us-btn {
    border-color: white !important;
  }
  
  .call-us-btn:hover {
    background-color: white !important;
    color: var(--color-apple-medium) !important;
  }
</style>