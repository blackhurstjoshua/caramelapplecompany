<script lang="ts">
    import type { PageData } from './$types';
    import Header from '$lib/components/Header.svelte';

    let { data }: { data: PageData } = $props();
</script>

<Header />

<div>
  <h2>Hello from the about page</h2>
</div>