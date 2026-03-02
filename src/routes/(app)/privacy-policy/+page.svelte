<script lang="ts">
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Privacy Policy - Caramel Apple Co.</title>
  <meta name="description" content="Privacy Policy for Caramel Apple Co. Learn how we handle your personal information." />
</svelte:head>

<section class="py-12 lg:py-20">
  <div class="max-w-3xl mx-auto px-4 lg:px-8">
    <h1 class="text-3xl md:text-4xl font-bold text-black mb-2">Privacy Policy</h1>
    <p class="text-sm text-gray-500 mb-10">Effective Date: March 1, 2026</p>

    <div class="prose prose-gray max-w-none space-y-8">
      <div>
        <h2 class="text-xl font-semibold text-black mb-3">1. Information We Collect</h2>
        <p class="text-gray-700 leading-relaxed">
          When you place an order with Caramel Apple Co., we collect the following personal information:
        </p>
        <ul class="list-disc pl-6 mt-2 text-gray-700 space-y-1">
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number (if provided)</li>
          <li>Delivery address (if applicable)</li>
          <li>Payment information (processed securely by Stripe; we do not store card details)</li>
        </ul>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">2. How We Use Your Information</h2>
        <p class="text-gray-700 leading-relaxed">
          Your personal information is used solely for the following purposes:
        </p>
        <ul class="list-disc pl-6 mt-2 text-gray-700 space-y-1">
          <li>Processing and fulfilling your orders</li>
          <li>Sending order confirmations and status updates via email</li>
          <li>Communicating with you about your order when necessary</li>
          <li>Improving our products and services</li>
        </ul>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">3. We Do Not Sell Your Data</h2>
        <p class="text-gray-700 leading-relaxed">
          We will never sell, rent, or share your personal information with third parties for marketing purposes.
          Your data is used exclusively for internal operations and necessary communication related to your orders.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">4. Data Storage &amp; Security</h2>
        <p class="text-gray-700 leading-relaxed">
          Your information is stored securely using industry-standard practices. Payment processing is handled
          entirely by Stripe, a PCI-compliant payment provider. We do not store credit card numbers or
          sensitive payment details on our servers.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">5. Third-Party Services</h2>
        <p class="text-gray-700 leading-relaxed">
          We use the following third-party services to operate our business:
        </p>
        <ul class="list-disc pl-6 mt-2 text-gray-700 space-y-1">
          <li><strong>Stripe</strong> &mdash; secure payment processing</li>
          <li><strong>Namecheap Private Email</strong> &mdash; order notification emails</li>
        </ul>
        <p class="text-gray-700 leading-relaxed mt-2">
          These services have their own privacy policies and handle data in accordance with their respective terms.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">6. Your Rights</h2>
        <p class="text-gray-700 leading-relaxed">
          You may request access to, correction of, or deletion of your personal information at any time
          by contacting us at the email address below.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">7. Changes to This Policy</h2>
        <p class="text-gray-700 leading-relaxed">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page
          with an updated effective date.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">8. Contact Us</h2>
        <p class="text-gray-700 leading-relaxed">
          If you have questions about this Privacy Policy, please contact us:
        </p>
        <ul class="list-none mt-2 text-gray-700 space-y-1">
          <li>Email: <a href="mailto:kristaleecook5@gmail.com" class="text-apple-dark hover:underline">kristaleecook5@gmail.com</a></li>
          <li>Phone: <a href="tel:+18017877288" class="text-apple-dark hover:underline">(801) 787-7288</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<Footer />
