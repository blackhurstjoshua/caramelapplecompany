<script lang="ts">
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Terms &amp; Conditions - Caramel Apple Co.</title>
  <meta name="description" content="Terms and Conditions for Caramel Apple Co. Read our policies on orders, payments, and deliveries." />
</svelte:head>

<section class="py-12 lg:py-20">
  <div class="max-w-3xl mx-auto px-4 lg:px-8">
    <h1 class="text-3xl md:text-4xl font-bold text-black mb-2">Terms &amp; Conditions</h1>
    <p class="text-sm text-gray-500 mb-10">Effective Date: March 1, 2026</p>

    <div class="prose prose-gray max-w-none space-y-8">
      <div>
        <h2 class="text-xl font-semibold text-black mb-3">1. Order Acceptance</h2>
        <p class="text-gray-700 leading-relaxed">
          All orders placed through Caramel Apple Co. are subject to acceptance and availability.
          We reserve the right to refuse or cancel any order at our discretion. If an order is cancelled,
          you will be notified and any payment already collected will be refunded in full.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">2. Pricing &amp; Payment</h2>
        <p class="text-gray-700 leading-relaxed">
          All prices are listed in US dollars and include applicable sales tax at checkout.
          We accept the following payment methods:
        </p>
        <ul class="list-disc pl-6 mt-2 text-gray-700 space-y-1">
          <li>Cash or Venmo at pickup/delivery</li>
          <li>Credit or debit card via Stripe (charged at time of order)</li>
        </ul>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">3. Pickup &amp; Delivery</h2>
        <p class="text-gray-700 leading-relaxed">
          Orders are available for pickup or local delivery on the date selected during checkout.
          A delivery fee applies for delivery orders. You are responsible for providing accurate
          contact and delivery information. We are not liable for delays or failed deliveries
          caused by incorrect information.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">4. Cancellations &amp; Modifications</h2>
        <p class="text-gray-700 leading-relaxed">
          If you need to cancel or modify your order, please contact us as soon as possible.
          We will do our best to accommodate changes, but cannot guarantee modifications once
          preparation has begun. Refund eligibility for cancellations is determined on a case-by-case basis.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">5. Allergen Notice</h2>
        <p class="text-gray-700 leading-relaxed">
          Our products are made in a facility that handles common allergens including nuts, dairy, wheat,
          and soy. While we take precautions, we cannot guarantee that our products are free from allergens.
          Please note any allergies in the special instructions field during checkout.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">6. Limitation of Liability</h2>
        <p class="text-gray-700 leading-relaxed">
          Caramel Apple Co. is not liable for any indirect, incidental, or consequential damages arising
          from the use of our website or the purchase of our products. Our total liability shall not
          exceed the amount paid for the specific order in question.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">7. Intellectual Property</h2>
        <p class="text-gray-700 leading-relaxed">
          All content on this website, including text, images, logos, and designs, is the property of
          Caramel Apple Co. and may not be reproduced without written permission.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">8. Changes to These Terms</h2>
        <p class="text-gray-700 leading-relaxed">
          We may update these Terms &amp; Conditions from time to time. Continued use of our website
          after changes are posted constitutes acceptance of the updated terms.
        </p>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-black mb-3">9. Contact Us</h2>
        <p class="text-gray-700 leading-relaxed">
          If you have questions about these Terms &amp; Conditions, please contact us:
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
