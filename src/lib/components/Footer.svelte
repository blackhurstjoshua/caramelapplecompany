<script lang="ts">
  const footerLinks = {
    company: [
      { href: '/about', label: 'Our Story' },
      { href: '/locations', label: 'Locations' },
      { href: '/careers', label: 'Careers' },
      { href: '/contact', label: 'Contact Us' }
    ],
    products: [
      { href: '/order', label: 'Order Online' },
      { href: '/catering', label: 'Catering' },
      { href: '/gift-cards', label: 'Gift Cards' },
      { href: '/merch', label: 'Merchandise' }
    ],
    support: [
      { href: '/faq', label: 'FAQ' },
      { href: '/shipping', label: 'Shipping Info' },
      { href: '/returns', label: 'Returns' },
      { href: '/privacy', label: 'Privacy Policy' }
    ]
  };
  
  const socialLinks = [
    { href: 'https://facebook.com/caramelappleco', label: 'Facebook', icon: 'facebook' },
    { href: 'https://instagram.com/caramelappleco', label: 'Instagram', icon: 'instagram' },
    { href: 'https://twitter.com/caramelappleco', label: 'Twitter', icon: 'twitter' },
    { href: 'https://tiktok.com/@caramelappleco', label: 'TikTok', icon: 'tiktok' }
  ];
</script>

<footer class="bg-[#FFD5E4] text-black py-12 lg:py-16">
  <div class="max-w-7xl mx-auto px-4 lg:px-8">
    <!-- Main footer content -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
      <!-- Company Links -->
      <div>
        <h3 class="font-semibold text-lg mb-4">Company</h3>
        <ul class="space-y-2">
          {#each footerLinks.company as link}
            <li>
              <a href={link.href} class="text-black hover:text-[#FF007A] transition-colors duration-200">
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Products Links -->
      <div>
        <h3 class="font-semibold text-lg mb-4">Products</h3>
        <ul class="space-y-2">
          {#each footerLinks.products as link}
            <li>
              <a href={link.href} class="text-black hover:text-[#FF007A] transition-colors duration-200">
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Support Links -->
      <div>
        <h3 class="font-semibold text-lg mb-4">Support</h3>
        <ul class="space-y-2">
          {#each footerLinks.support as link}
            <li>
              <a href={link.href} class="text-black hover:text-[#FF007A] transition-colors duration-200">
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Newsletter & Social -->
      <div>
        <h3 class="font-semibold text-lg mb-4">Stay Connected</h3>
        <p class="text-sm text-gray-700 mb-4">
          Subscribe to get weekly flavor updates and special offers.
        </p>
        
                 <button 
           class="btn bg-white text-black border-gray-300 hover:bg-gray-50 rounded-lg mb-4 w-full"
           on:click={() => (document.getElementById('subscribe_modal') as HTMLDialogElement)?.showModal()}
         >
           Subscribe
         </button>
        
        <!-- Social Icons -->
        <div class="flex space-x-3">
          {#each socialLinks as social}
            <a 
              href={social.href}
              class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              aria-label={social.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="w-5 h-5 fill-[#FF007A]">
                {#if social.icon === 'facebook'}
                  <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                {:else if social.icon === 'instagram'}
                  <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                {:else if social.icon === 'twitter'}
                  <svg viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                {:else if social.icon === 'tiktok'}
                  <svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Bottom section -->
    <div class="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center">
      <div class="flex items-center mb-4 md:mb-0">
        <span class="text-2xl mr-2">🍎</span>
        <span class="font-bold text-lg">Caramel Apple Co.</span>
      </div>
      
      <div class="text-sm text-gray-700 text-center md:text-right">
        <p>&copy; 2024 Caramel Apple Co. All rights reserved.</p>
        <div class="flex flex-wrap justify-center md:justify-end gap-4 mt-2">
          <a href="/terms" class="hover:text-[#FF007A] transition-colors duration-200">Terms of Service</a>
          <a href="/privacy" class="hover:text-[#FF007A] transition-colors duration-200">Privacy Policy</a>
          <a href="/accessibility" class="hover:text-[#FF007A] transition-colors duration-200">Accessibility</a>
        </div>
      </div>
    </div>
  </div>
</footer> 