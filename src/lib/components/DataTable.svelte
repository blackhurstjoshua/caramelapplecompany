<script lang="ts">
  export let data: any[] = [];
  export let columns: { key: string; label: string; width?: string }[] = [];
  export let onRowClick: ((row: any) => void) | undefined = undefined;
  export let loading = false;
  export let emptyMessage = "No data available";
  
  function handleRowClick(row: any) {
    if (onRowClick) {
      onRowClick(row);
    }
  }
  
  function getCellValue(row: any, key: string) {
    return key.split('.').reduce((obj, k) => obj?.[k], row) || '';
  }
</script>

<div class="overflow-x-auto">
  <table class="table w-full">
    <!-- Table Header -->
    <thead>
      <tr>
        {#each columns as column}
          <th class="text-black" style={column.width ? `width: ${column.width}` : ''}>{column.label}</th>
        {/each}
      </tr>
    </thead>
    
    <!-- Table Body -->
    <tbody>
      {#if loading}
        <tr>
          <td colspan={columns.length} class="text-center py-8">
            <span class="loading loading-spinner loading-md"></span>
            <span class="ml-2">Loading...</span>
          </td>
        </tr>
      {:else if data.length === 0}
        <tr>
          <td colspan={columns.length} class="text-center py-8 text-gray-500">
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each data as row, index}
          <tr 
            class={onRowClick ? 'hover:bg-gray-200 cursor-pointer' : ''}
            onclick={() => handleRowClick(row)}
          >
            {#each columns as column}
              <td>{getCellValue(row, column.key)}</td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

 