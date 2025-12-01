<script lang="ts">
  import { Instagram } from '@lucide/svelte';
  import DoorDash from './DoorDash.svelte';
  
  const footerLinks = [
    { href: '/', label: 'Home' },
    { href: '/product', label: 'Product' },
    { href: '/about', label: 'About' },
    { href: '/about', label: 'Contact' }
  ];
  
  const socialLinks = [
    { href: 'https://www.instagram.com/caramel_apple_company', label: 'Instagram', icon: Instagram },
    { href: 'https://www.doordash.com/store/caramel-apple-company-1825-w-traverse-pkwy-ste-e-lehi-36577383/', label: 'DoorDash', icon: DoorDash }
  ];
</script>

<footer class="bg-black font-bold py-12 lg:py-16 footer-override">
  <div class="max-w-7xl mx-auto px-4 lg:px-8">
    <!-- Main footer content -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
      <!-- Navigation Links -->
      <div class="md:col-span-1">
        <h3 class="font-semibold text-2xl mb-6 text-white">Navigation</h3>
        <div class="grid grid-cols-2 gap-4">
          {#each footerLinks as link}
            <a href={link.href} class="text-lg text-white footer-link transition-colors duration-200 py-2">
              {link.label}
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Social Media -->
      <div class="md:col-span-1">
        <h3 class="font-semibold text-2xl mb-6 text-white">Follow Us</h3>
        <div class="flex space-x-4 mb-8">
          {#each socialLinks as social}
            <a 
              href={social.href}
              class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center social-link transition-colors duration-200"
              aria-label={social.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svelte:component this={social.icon} class="w-6 h-6 text-white" />
            </a>
          {/each}
        </div>
        
        <!-- Contact Us -->
        <h3 class="font-semibold text-2xl mb-6 text-white">Contact Us</h3>
        <a href="tel:+18017877288" class="text-lg text-white footer-link transition-colors duration-200 inline-block">
          (801) 787-7288
        </a>
      </div>
    </div>
    
    <!-- Bottom section -->
    <div class="border-t border-gray-600 pt-8 flex flex-col md:flex-row justify-between items-center">
      <div class="flex items-center mb-4 md:mb-0">
        <span class="text-2xl mr-2">🍏</span>
        <span class="font-bold text-2xl text-white" style="font-family: 'Oswald', sans-serif;">Caramel Apple Co.</span>
      </div>
      
      <div class="text-sm text-gray-300 text-center md:text-right">
        <p class="text-gray-300">&copy; 2025 Caramel Apple Co. All rights reserved.</p>
        <div class="flex flex-wrap justify-center md:justify-end gap-4 mt-2">
          <a href="/terms" class="footer-link transition-colors duration-200 text-gray-300">Terms of Service</a>
          <a href="/privacy" class="footer-link transition-colors duration-200 text-gray-300">Privacy Policy</a>
          <a href="/accessibility" class="footer-link transition-colors duration-200 text-gray-300">Accessibility</a>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  /* Override global text color for footer */
  .footer-override * {
    color: white !important;
  }
  
  .footer-override .text-gray-300 {
    color: #d1d5db !important;
  }
  
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
    color: white !important;
  }
</style> 