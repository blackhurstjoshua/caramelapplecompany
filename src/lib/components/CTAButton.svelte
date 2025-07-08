<script lang="ts">
  export let href: string | undefined = undefined;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base', 
    lg: 'px-8 py-4 text-lg'
  };
  
  const baseClasses = `
    inline-flex items-center justify-center font-semibold rounded-lg
    greenApple text-white border-none
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-apple-medium focus:ring-offset-2
    ${sizeClasses[size]}
  `;
</script>

{#if href}
  <a {href} class="{baseClasses} no-underline" class:pointer-events-none={disabled}>
    <span class="relative z-10">
      <slot />
    </span>
  </a>
{:else}
  <button {type} {disabled} class={baseClasses}>
    <span class="relative z-10">
      <slot />
    </span>
  </button>
{/if} 