<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div>
  <h2>Hello from apples page</h2>
  {data.name}
  {data.description}
</div>