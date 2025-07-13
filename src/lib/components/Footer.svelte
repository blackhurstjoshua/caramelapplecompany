<script lang="ts">
  import { Facebook, Instagram } from '@lucide/svelte';
  
  const footerLinks = [
    { href: '/', label: 'Home' },
    { href: '/featured', label: 'Featured' },
    { href: '/product', label: 'Product' },
    { href: '/about', label: 'About' },
    { href: '/about', label: 'Contact' }
  ];
  
  const socialLinks = [
    { href: 'https://facebook.com/caramelappleco', label: 'Facebook', icon: Facebook },
    { href: 'https://instagram.com/caramelappleco', label: 'Instagram', icon: Instagram }
  ];
</script>

<footer class="bg-gradient-to-br from-amber-100 to-orange-200 text-black font-bold py-12 lg:py-16">
  <div class="max-w-7xl mx-auto px-4 lg:px-8">
    <!-- Main footer content -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
      <!-- Navigation Links -->
      <div class="md:col-span-1">
        <h3 class="font-semibold text-2xl mb-6">Navigation</h3>
        <div class="grid grid-cols-2 gap-4">
          {#each footerLinks as link}
            <a href={link.href} class="text-lg text-black footer-link transition-colors duration-200 py-2">
              {link.label}
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Social Media -->
      <div class="md:col-span-1">
        <h3 class="font-semibold text-2xl mb-6">Follow Us</h3>
        <div class="flex space-x-4">
          {#each socialLinks as social}
            <a 
              href={social.href}
              class="w-12 h-12 bg-white/70 rounded-full flex items-center justify-center social-link transition-colors duration-200"
              aria-label={social.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svelte:component this={social.icon} class="w-6 h-6 text-black" />
            </a>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Bottom section -->
    <div class="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center">
      <div class="flex items-center mb-4 md:mb-0">
        <span class="text-2xl mr-2">🍎</span>
        <span class="font-bold text-2xl" style="font-family: 'Oswald', sans-serif;">Caramel Apple Co.</span>
      </div>
      
      <div class="text-sm text-gray-700 text-center md:text-right">
        <p>&copy; 2025 Caramel Apple Co. All rights reserved.</p>
        <div class="flex flex-wrap justify-center md:justify-end gap-4 mt-2">
          <a href="/terms" class="footer-link transition-colors duration-200">Terms of Service</a>
          <a href="/privacy" class="footer-link transition-colors duration-200">Privacy Policy</a>
          <a href="/accessibility" class="footer-link transition-colors duration-200">Accessibility</a>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  .footer-link:hover {
    background: linear-gradient(to right, var(--color-apple-dark) 0%, var(--color-apple-medium) 55%, var(--color-apple-light) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  
  .social-link:hover {
    background: linear-gradient(to right, var(--color-apple-dark) 0%, var(--color-apple-medium) 55%, var(--color-apple-light) 100%);
  }
  
  .social-link:hover :global(svg) {
    color: white;
  }
</style> 