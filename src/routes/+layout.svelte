<script lang="ts">
  import '../app.css';
  import Navigation from '$lib/components/Navigation.svelte';
  
  let isDrawerOpen = false;
</script>

<Navigation bind:isDrawerOpen />

<slot />

<!-- <div>
  Nav
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/apples">Apples</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</div> -->