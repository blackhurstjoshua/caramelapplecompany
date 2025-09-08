<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import WeeklyFlavors from '$lib/components/WeeklyFlavors.svelte';
  import OurStory from '$lib/components/OurStory.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Caramel Apple Co. - Handcrafted Weekly Flavors</title>
  <meta name="description" content="Discover our handcrafted caramel apples made fresh daily with premium ingredients. Each week brings new flavors that celebrate the perfect balance of crisp apples and rich, buttery caramel." />
</svelte:head>

<main>
  <!-- Header Section -->
  <Header />
  
  <!-- Hero Section -->
  <Hero />
  
  <!-- Weekly Flavors Section -->
  <WeeklyFlavors />
  
  <!-- Our Story Section -->
  <OurStory />
  
  <!-- Footer -->
  <Footer />
</main>
