<script lang="ts">
  import Navigation from '$lib/components/Navigation.svelte';
  
  let isDrawerOpen = false;
</script>

<Navigation bind:isDrawerOpen />

<slot /> 