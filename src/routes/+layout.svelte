<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    let { data, children }: { data: LayoutData, children: Snippet } = $props();
</script>

{@render children()}

<div>
  Nav
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/apples">Apples</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</div>