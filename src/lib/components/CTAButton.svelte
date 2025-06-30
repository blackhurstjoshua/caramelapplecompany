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
    bg-[#FF007A] text-white border-none
    hover:bg-[#e6006e] active:bg-[#cc005f]
    disabled:bg-[#fbbcd7] disabled:text-[#ffffffb3]
    focus:outline-none focus:ring-2 focus:ring-[#FF007A] focus:ring-offset-2 focus:ring-offset-white
    transition-all duration-200 ease-in-out
    ${sizeClasses[size]}
  `;
</script>

{#if href}
  <a {href} class="{baseClasses} no-underline" class:opacity-50={disabled}>
    <slot />
  </a>
{:else}
  <button {type} {disabled} class={baseClasses}>
    <slot />
  </button>
{/if} 