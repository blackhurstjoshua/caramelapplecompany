<script lang="ts">
  // No props needed - just a simple static header
</script>

<header class="w-full bg-cream py-8 text-center">
  <h1 class="text-black drop-shadow-lg"
      style="font-family: 'Oswald', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; letter-spacing: 0.15em; word-spacing: 0.3em;">
    <!-- Desktop: Single line, all same size -->
    <span class="hidden sm:block text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal">
      CARAMEL APPLE COMPANY
    </span>
    <!-- Mobile: Two lines, first line larger -->
    <span class="sm:hidden">
      <div class="text-3xl font-medium">CARAMEL APPLE</div>
      <div class="text-2xl font-light">COMPANY</div>
    </span>
  </h1>
</header>
