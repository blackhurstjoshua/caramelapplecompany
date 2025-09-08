<script lang="ts">
  import { cart, cartTotal, type CartItem } from '$lib/stores/cart';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import Calendar from '$lib/components/Calendar.svelte';
  import type { PageData } from './$types';
  import type { DateAvailability } from '$lib/types';
  
  export let data: PageData;

  // Multi-step form state
  let currentStep = 1;
  const totalSteps = 4;

  // Form data
  let name = '';
  let email = '';
  let phone = '';
  let contactMethod: 'email' | 'phone' = 'email';

  let retrievalMethod: 'pickup' | 'delivery' = 'pickup';
  let addressLine1 = '';
  let addressLine2 = '';
  let city = '';
  let state = '';
  let zip = '';

  let selectedDate = ''; // Will be populated by calendar component

  let paymentMethod: 'pickup' | 'stripe' = 'pickup';

  $: deliveryFee = retrievalMethod === 'delivery' ? 10 : 0; // TODO: Integrate Google Maps distance calc here
  $: subtotal = $cartTotal;
  $: total = subtotal + deliveryFee;

  const steps = [
    { number: 1, title: 'Order Summary' },
    { number: 2, title: 'Contact & Delivery' },
    { number: 3, title: 'Schedule' },
    { number: 4, title: 'Payment' }
  ];

  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function validateCurrentStep(): string | null {
    if (currentStep === 1) {
      return $cart.length === 0 ? 'Your cart is empty' : null;
    }
    if (currentStep === 2) {
      if (!name.trim()) return 'Please enter your name';
      if (contactMethod === 'email' && !email.trim()) return 'Please enter your email';
      if (contactMethod === 'phone' && !phone.trim()) return 'Please enter your phone number';
      if (retrievalMethod === 'delivery') {
        if (!addressLine1.trim() || !city.trim() || !state.trim() || !zip.trim()) {
          return 'Please complete the delivery address';
        }
      }
    }
    if (currentStep === 3) {
      if (!selectedDate) return 'Please select a completion date';
    }
    return null;
  }

  function handleNext() {
    const error = validateCurrentStep();
    if (error) {
      alert(error);
      return;
    }
    nextStep();
  }

  function handleDateSelect(date: string) {
    selectedDate = date;
  }

  // Convert DateAvailability to ScheduleBlock format for Calendar component
  $: schedule = data?.dateAvailability?.map((availability: DateAvailability) => ({
    id: crypto.randomUUID(),
    blockedDate: availability.date,
    deliveryBlocked: !availability.deliveryAvailable,
    pickupBlocked: !availability.pickupAvailable,
    reason: availability.reason,
    createdAt: new Date().toISOString()
  })) || [];

  // Clear selected date when retrieval method changes to avoid invalid selections
  $: if (retrievalMethod && data) {
    // If there's a selected date, check if it's still valid for the new retrieval method
    if (selectedDate) {
      const dateAvailability = data?.dateAvailability || [];
      const availability = dateAvailability.find((a: DateAvailability) => a.date === selectedDate);
      if (availability) {
        const isStillValid = (retrievalMethod === 'pickup' && availability.pickupAvailable) ||
                             (retrievalMethod === 'delivery' && availability.deliveryAvailable);
        if (!isStillValid) {
          selectedDate = '';
        }
      }
    }
  }

  async function submitOrder() {
    const error = validateCurrentStep();
    if (error) {
      alert(error);
      return;
    }

    const payload = {
      customer: {
        name,
        email: contactMethod === 'email' ? email : null,
        phone: contactMethod === 'phone' ? phone : null
      },
      retrieval: {
        method: retrievalMethod,
        address:
          retrievalMethod === 'delivery'
            ? { addressLine1, addressLine2, city, state, zip }
            : null,
        deliveryFee
      },
      payment: {
        method: paymentMethod
      },
      cart: $cart.map((item: CartItem) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        unitPrice: item.product.toDollars(),
        quantity: item.quantity
      })),
      totals: { subtotal, total }
    };

    if (paymentMethod === 'pickup') {
      // Submit to local endpoint to create order and customer, then redirect
      const res = await fetch('/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        // On success, clear cart and go to thank-you
        cart.clear();
        goto('/checkout/success');
      } else {
        const msg = await res.text();
        alert(msg || 'Failed to submit order');
      }
    } else {
      // Stripe flow placeholder
      // TODO: Create Checkout Session with Stripe and redirect to Stripe Checkout
      // Pass payload to server to create session; use address for shipping if provided
      const res = await fetch('/checkout?stripe=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const { checkoutUrl } = await res.json();
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          alert('Stripe is not configured yet.');
        }
      } else {
        const msg = await res.text();
        alert(msg || 'Failed to initialize Stripe checkout');
      }
    }
  }
</script>

<Header />

<div class="min-h-screen bg-white">
  <div class="max-w-4xl mx-auto p-4 md:p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Checkout</h1>
      <a href="/" class="btn btn-outline bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
        ← Back to Home
      </a>
    </div>
    
    <!-- Breadcrumbs -->
    <div class="breadcrumbs text-sm mb-8">
      <ul>
        {#each steps as step}
          <li class={currentStep === step.number ? 'text-apple-dark font-semibold' : currentStep > step.number ? 'text-gray-600' : 'text-gray-400'}>
            <span class="mr-2">{step.number}</span>
            {step.title}
          </li>
        {/each}
      </ul>
    </div>

    <!-- Step Content -->
    <div class="bg-cream rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
      {#if currentStep === 1}
        <!-- Step 1: Order Summary -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold mb-6">Order Summary</h2>
          {#if $cart.length === 0}
            <div class="text-center py-8">
              <p class="text-gray-500">Your cart is empty.</p>
              <a href="/order" class="btn btn-primary mt-4">Browse Caramel Apples</a>
            </div>
          {:else}
            <div class="space-y-4">
              {#each $cart as item (item.id)}
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 class="font-medium">{item.product.name}</h3>
                    <p class="text-sm text-gray-600">${item.product.toDollars().toFixed(2)} each × {item.quantity}</p>
                  </div>
                  <div class="text-lg font-semibold">${(item.product.toDollars() * item.quantity).toFixed(2)}</div>
                </div>
              {/each}
              
              <div class="mt-6 p-4 bg-gray-100 rounded-lg">
                <div class="flex justify-between text-gray-700 mb-2">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-gray-700 mb-2">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'TBD'}</span>
                </div>
                <div class="flex justify-between text-xl font-bold text-black">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          {/if}
        </div>

      {:else if currentStep === 2}
        <!-- Step 2: Contact & Delivery -->
        <div class="space-y-6">
          <h2 class="text-2xl font-semibold mb-6">Contact & Delivery Information</h2>
          
          <div class="form-control">
            <label class="block text-sm font-medium text-gray-700 mb-1" for="name">Full Name</label>
            <input id="name" class="input input-bordered bg-gray-50 border-gray-300" bind:value={name} placeholder="Jane Doe" />
          </div>

          <div>
            <fieldset>
              <legend class="text-sm font-medium text-gray-700 mb-3">Preferred Contact Method</legend>
              <div class="flex space-x-4">
                <label class="cursor-pointer">
                  <input type="radio" class="radio" name="contact" value="email" checked={contactMethod==='email'} on:change={() => contactMethod='email'}>
                  <span class="ml-2">Email</span>
                </label>
                <label class="cursor-pointer">
                  <input type="radio" class="radio" name="contact" value="phone" checked={contactMethod==='phone'} on:change={() => contactMethod='phone'}>
                  <span class="ml-2">Phone</span>
                </label>
              </div>
            </fieldset>
            
            {#if contactMethod === 'email'}
              <div class="form-control mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1" for="email">Email Address</label>
                <input id="email" class="input input-bordered bg-gray-50 border-gray-300" type="email" bind:value={email} placeholder="you@example.com" />
              </div>
            {:else}
              <div class="form-control mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1" for="phone">Phone Number</label>
                <input id="phone" class="input input-bordered bg-gray-50 border-gray-300" type="tel" bind:value={phone} placeholder="(555) 123-4567" />
              </div>
            {/if}
          </div>

          <div>
            <fieldset>
              <legend class="text-sm font-medium text-gray-700 mb-3">How would you like to receive your order?</legend>
              <div class="flex space-x-4">
                <label class="cursor-pointer">
                  <input type="radio" class="radio" name="retrieval" value="pickup" checked={retrievalMethod==='pickup'} on:change={() => retrievalMethod='pickup'}>
                  <span class="ml-2">Pickup</span>
                </label>
                <label class="cursor-pointer">
                  <input type="radio" class="radio" name="retrieval" value="delivery" checked={retrievalMethod==='delivery'} on:change={() => retrievalMethod='delivery'}>
                  <span class="ml-2">Delivery (+$10)</span>
                </label>
              </div>
            </fieldset>

            {#if retrievalMethod === 'delivery'}
              <div class="mt-4 p-4 bg-blue-50 rounded-lg space-y-3">
                <h4 class="font-medium">Delivery Address</h4>
                <div class="form-control">
                  <label class="block text-sm font-medium text-gray-700 mb-1" for="address1">Street Address</label>
                  <input id="address1" class="input input-bordered bg-gray-50 border-gray-300" bind:value={addressLine1} placeholder="123 Main Street" />
                </div>
                <div class="form-control">
                  <label class="block text-sm font-medium text-gray-700 mb-1" for="address2">Apt, suite, etc. (optional)</label>
                  <input id="address2" class="input input-bordered bg-gray-50 border-gray-300" bind:value={addressLine2} placeholder="Apt 4B" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-control">
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="city">City</label>
                    <input id="city" class="input input-bordered bg-gray-50 border-gray-300" bind:value={city} placeholder="City" />
                  </div>
                  <div class="form-control">
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="state">State</label>
                    <input id="state" class="input input-bordered bg-gray-50 border-gray-300" bind:value={state} placeholder="ST" />
                  </div>
                </div>
                <div class="form-control">
                  <label class="block text-sm font-medium text-gray-700 mb-1" for="zip">ZIP Code</label>
                  <input id="zip" class="input input-bordered bg-gray-50 border-gray-300" bind:value={zip} placeholder="12345" />
                </div>
                <p class="text-sm text-blue-600">
                  💡 Delivery is $10 within 5 miles, +$1 per additional mile
                </p>
                <!-- TODO: Google Maps distance calculation -->
              </div>
            {/if}
          </div>
        </div>

      {:else if currentStep === 3}
        <!-- Step 3: Schedule -->
        <div class="space-y-6">
          <h2 class="text-2xl font-semibold mb-6">Choose Completion Date</h2>
          <div class="mb-4">
            <p class="text-gray-600 mb-2">Select when you'd like your order to be ready for {retrievalMethod}</p>
            <p class="text-sm text-blue-600 mb-2">
              💡 Only dates available for {retrievalMethod} are shown as selectable
            </p>
            {#if selectedDate}
              <p class="text-sm text-green-600 font-medium">
                Selected: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            {/if}
          </div>
          
          <Calendar
            schedule={schedule}
            editMode={false}
            selectedDate={selectedDate}
            retrievalMethod={retrievalMethod}
            onDateSelect={handleDateSelect}
          />
        </div>

      {:else if currentStep === 4}
        <!-- Step 4: Payment -->
        <div class="space-y-6">
          <h2 class="text-2xl font-semibold mb-6">Payment Method</h2>
          
          <div>
            <fieldset>
              <legend class="text-sm font-medium text-gray-700 mb-4">How would you like to pay?</legend>
              <div class="space-y-3">
                <label class="cursor-pointer flex items-center p-4 border rounded-lg hover:bg-gray-50">
                  <input type="radio" class="radio" name="payment" value="pickup" checked={paymentMethod==='pickup'} on:change={() => paymentMethod='pickup'}>
                  <div class="ml-3">
                    <div class="font-medium">Pay on {retrievalMethod === 'pickup' ? 'Pickup' : 'Delivery'}</div>
                    <div class="text-sm text-gray-600">Cash or Venmo when you receive your order</div>
                  </div>
                </label>
                <label class="cursor-pointer flex items-center p-4 border rounded-lg hover:bg-gray-50">
                  <input type="radio" class="radio" name="payment" value="stripe" checked={paymentMethod==='stripe'} on:change={() => paymentMethod='stripe'}>
                  <div class="ml-3">
                    <div class="font-medium">Pay Now with Credit Card</div>
                    <div class="text-sm text-gray-600">Secure payment via Stripe</div>
                  </div>
                </label>
              </div>
            </fieldset>
          </div>

          <!-- Order Summary for final step -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-semibold mb-3">Order Summary</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Items ({$cart.length})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {#if deliveryFee > 0}
                <div class="flex justify-between">
                  <span>Delivery</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              {/if}
              <div class="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Navigation buttons -->
      <div class="flex justify-between mt-8 pt-6 border-t">
        <button 
          class="btn btn-outline" 
          class:btn-disabled={currentStep === 1}
          on:click={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </button>
        
        {#if currentStep < totalSteps}
          <button 
            class="btn bg-black text-white" 
            on:click={handleNext}
            disabled={$cart.length === 0}
          >
            Next
          </button>
        {:else}
          <button 
            class="btn bg-black text-white" 
            on:click={submitOrder}
            disabled={$cart.length === 0}
          >
            {paymentMethod === 'pickup' ? 'Place Order' : 'Pay with Stripe'}
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  /* Keep styles minimal here; we will refine later per design */
</style>


