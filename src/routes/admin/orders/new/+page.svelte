<script lang="ts">
  import { goto } from '$app/navigation';
  import Calendar from '$lib/components/Calendar.svelte';
  import { OrderService, type CreateOrderData, type CreateOrderItemData } from '$lib/services/orders';
  import { CustomerService } from '$lib/services/customers';
  import { Product } from '$lib/stores/product';
  import { formatPrice } from '$lib/utils/currency';
  import type { DateAvailability } from '$lib/types';
  import type { Store } from '$lib/services/stores';
  import { parseAddress } from '$lib/services/stores';
  
  interface PageData {
    products: any[];
    dateAvailability: DateAvailability[];
    stores: Store[];
    error?: string;
  }
  
  let { data }: { data: PageData } = $props();
  
  // Form sections state (collapsible)
  let contactSectionExpanded = $state(true);
  let deliverySectionExpanded = $state(false);
  let dateSectionExpanded = $state(false);
  let productsSectionExpanded = $state(false);
  
  // Store selection
  let selectedStoreId = $state('');
  
  // Contact information
  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let contactMethod = $state<'email' | 'phone'>('email');
  
  // Delivery information
  let retrievalMethod = $state<'pickup' | 'delivery'>('pickup');
  let addressLine1 = $state('');
  let addressLine2 = $state('');
  let city = $state('');
  let addressState = $state('');
  let zip = $state('');
  
  // Date selection
  let selectedDate = $state('');
  
  // Special instructions
  let customizations = $state('');
  
  // Product selection
  interface CartItem {
    product: Product;
    quantity: number;
  }
  let cartItems: CartItem[] = $state([]);
  
  // Calculations
  let deliveryFee = $derived(retrievalMethod === 'delivery' ? 1000 : 0); // 1000 cents = $10
  let subtotal = $derived(cartItems.reduce((sum: number, item: CartItem) => sum + (item.product.priceCents * item.quantity), 0));
  let total = $derived(subtotal + deliveryFee);
  
  // Convert DateAvailability to ScheduleBlock format for Calendar component
  let schedule = $derived((data?.dateAvailability || []).map((availability: DateAvailability) => ({
    id: crypto.randomUUID(),
    blockedDate: availability.date,
    deliveryBlocked: !availability.deliveryAvailable,
    pickupBlocked: !availability.pickupAvailable,
    reason: availability.reason,
    createdAt: new Date().toISOString()
  })));
  
  // Submission state
  let isSubmitting = $state(false);
  let submitError = $state('');
  
  function handleDateSelect(date: string) {
    selectedDate = date;
  }
  
  function handleStoreSelect(storeId: string) {
    if (!storeId) {
      // Clear selection
      selectedStoreId = '';
      name = '';
      phone = '';
      email = '';
      contactMethod = 'email';
      retrievalMethod = 'pickup';
      addressLine1 = '';
      addressLine2 = '';
      city = '';
      addressState = '';
      zip = '';
      return;
    }
    
    selectedStoreId = storeId;
    const store = data.stores.find(s => s.id === storeId);
    
    if (store) {
      // Auto-fill contact information
      name = store.name;
      phone = store.phone || '';
      contactMethod = 'phone';
      
      // Auto-set retrieval method to pickup for stores
      retrievalMethod = 'pickup';
      
      // Parse and auto-fill address fields
      const parsedAddress = parseAddress(store.address);
      addressLine1 = parsedAddress.addressLine1;
      city = parsedAddress.city;
      addressState = parsedAddress.state;
      zip = parsedAddress.zip;
      addressLine2 = ''; // Clear any previous value
    }
  }
  
  function addProductToCart(product: any) {
    const productInstance = new Product(product);
    const existingItem = cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity++;
      cartItems = [...cartItems]; // Trigger reactivity
    } else {
      cartItems = [...cartItems, { product: productInstance, quantity: 1 }];
    }
  }
  
  function updateQuantity(productId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const item = cartItems.find(item => item.product.id === productId);
    if (item) {
      item.quantity = newQuantity;
      cartItems = [...cartItems];
    }
  }
  
  function removeFromCart(productId: string) {
    cartItems = cartItems.filter(item => item.product.id !== productId);
  }
  
  function goToSection(section: 'contact' | 'delivery' | 'date' | 'products') {
    // Collapse all sections
    contactSectionExpanded = false;
    deliverySectionExpanded = false;
    dateSectionExpanded = false;
    productsSectionExpanded = false;
    
    // Expand the requested section
    if (section === 'contact') contactSectionExpanded = true;
    else if (section === 'delivery') deliverySectionExpanded = true;
    else if (section === 'date') dateSectionExpanded = true;
    else if (section === 'products') productsSectionExpanded = true;
  }
  
  function completeContactSection() {
    if (!validateContact()) return;
    contactSectionExpanded = false;
    deliverySectionExpanded = true;
  }
  
  function completeDeliverySection() {
    if (!validateDelivery()) return;
    deliverySectionExpanded = false;
    dateSectionExpanded = true;
  }
  
  function completeDateSection() {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }
    dateSectionExpanded = false;
    productsSectionExpanded = true;
  }
  
  function validateContact(): boolean {
    if (!name.trim()) {
      alert('Please enter a name');
      return false;
    }
    if (contactMethod === 'email' && !email.trim()) {
      alert('Please enter an email');
      return false;
    }
    if (contactMethod === 'phone' && !phone.trim()) {
      alert('Please enter a phone number');
      return false;
    }
    return true;
  }
  
  function validateDelivery(): boolean {
    if (retrievalMethod === 'delivery') {
      if (!addressLine1.trim() || !city.trim() || !addressState.trim() || !zip.trim()) {
        alert('Please complete the delivery address');
        return false;
      }
    }
    return true;
  }
  
  async function submitOrder() {
    // Validate all sections
    if (!validateContact()) {
      goToSection('contact');
      return;
    }
    
    if (!validateDelivery()) {
      goToSection('delivery');
      return;
    }
    
    if (!selectedDate) {
      alert('Please select a date');
      goToSection('date');
      return;
    }
    
    if (cartItems.length === 0) {
      alert('Please add at least one product to the order');
      goToSection('products');
      return;
    }
    
    isSubmitting = true;
    submitError = '';
    
    try {
      // 1. Create or find customer
      const customerData = {
        name: name.trim(),
        email: contactMethod === 'email' ? email.trim() : null,
        phone: contactMethod === 'phone' ? phone.trim() : null
      };
      
      const customer = await CustomerService.createCustomer(customerData);
      const customerId = typeof customer === 'string' ? customer : customer.id;
      
      // 2. Create order
      const orderData: CreateOrderData = {
        customer_id: customerId,
        delivery_date: selectedDate,
        status: 'pending',
        total_cents: total,
        subtotal_cents: subtotal,
        retrieval_method: retrievalMethod,
        delivery_fee_cents: deliveryFee,
        payment_method: 'pickup', // Admin orders are always pay on pickup/delivery
        address: retrievalMethod === 'delivery' ? {
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: addressState.trim(),
          zip: zip.trim()
        } : undefined,
        customizations: customizations.trim() || null
      };
      
      const orderId = await OrderService.createOrder(orderData);
      
      // 3. Create order items
      const orderItems: CreateOrderItemData[] = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price_cents: item.product.priceCents
      }));
      
      await OrderService.createOrderItems(orderItems);
      
      // 4. Navigate to the order details page
      goto(`/admin/orders/${orderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
      submitError = 'Failed to create order. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="p-6">
  <div class="mb-6">
    <button 
      class="btn btn-ghost mb-4" 
      onclick={() => goto('/admin/orders')}
    >
      ← Back to Orders
    </button>
    <h1 class="text-3xl font-bold text-gray-800">Create New Order</h1>
    <p class="text-gray-600 mt-2">Create an order on behalf of a customer</p>
  </div>
  
  {#if submitError}
    <div class="alert alert-error mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{submitError}</span>
    </div>
  {/if}
  
  <div class="max-w-4xl space-y-4">
    <!-- Contact Information Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <button class="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer w-full text-left" onclick={() => contactSectionExpanded = !contactSectionExpanded}>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold">1</div>
          <h2 class="text-xl font-semibold text-gray-800">Contact Information</h2>
          {#if name && !contactSectionExpanded}
            <span class="text-sm text-gray-500">— {name}</span>
          {/if}
        </div>
        <span class="btn btn-ghost btn-sm">
          {contactSectionExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {#if contactSectionExpanded}
        <div class="p-6 space-y-4">
          <!-- Store Selection Dropdown -->
          <div class="form-control">
            <label class="block text-sm font-medium text-gray-700 mb-1" for="store">Select Store (Optional)</label>
            <select 
              id="store" 
              class="select select-bordered bg-gray-50 border-gray-300"
              bind:value={selectedStoreId}
              onchange={(e) => handleStoreSelect(e.currentTarget.value)}
            >
              <option value="">-- Manual Entry --</option>
              {#if data.stores && data.stores.length > 0}
                {#each data.stores as store}
                  <option value={store.id}>{store.name}</option>
                {/each}
              {:else}
                <option disabled>No stores available</option>
              {/if}
            </select>
            {#if selectedStoreId}
              <p class="text-xs text-blue-600 mt-1">Store information has been auto-filled. You can edit any field below.</p>
            {/if}
          </div>
          
          <div class="form-control">
            <label class="block text-sm font-medium text-gray-700 mb-1" for="name">Full Name</label>
            <input 
              id="name" 
              class="input input-bordered bg-gray-50 border-gray-300" 
              bind:value={name} 
              placeholder="Jane Doe" 
            />
          </div>

          <div>
            <fieldset>
              <legend class="text-sm font-medium text-gray-700 mb-3">Preferred Contact Method</legend>
              <div class="flex space-x-4">
                <label class="cursor-pointer">
                  <input type="radio" class="radio" name="contact" value="email" bind:group={contactMethod}>
                  <span class="ml-2">Email</span>
                </label>
                <label class="cursor-pointer">
                  <input type="radio" class="radio" name="contact" value="phone" bind:group={contactMethod}>
                  <span class="ml-2">Phone</span>
                </label>
              </div>
            </fieldset>
            
            {#if contactMethod === 'email'}
              <div class="form-control mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1" for="email">Email Address</label>
                <input 
                  id="email" 
                  class="input input-bordered bg-gray-50 border-gray-300" 
                  type="email" 
                  bind:value={email} 
                  placeholder="you@example.com" 
                />
              </div>
            {:else}
              <div class="form-control mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1" for="phone">Phone Number</label>
                <input 
                  id="phone" 
                  class="input input-bordered bg-gray-50 border-gray-300" 
                  type="tel" 
                  bind:value={phone} 
                  placeholder="(555) 123-4567" 
                />
              </div>
            {/if}
          </div>
          
          <div class="flex justify-end pt-4">
            <button 
              class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              onclick={completeContactSection}
            >
              Continue →
            </button>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Delivery Information Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <button class="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer w-full text-left" onclick={() => deliverySectionExpanded = !deliverySectionExpanded}>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold">2</div>
          <h2 class="text-xl font-semibold text-gray-800">Delivery Information</h2>
          {#if retrievalMethod && !deliverySectionExpanded}
            <span class="text-sm text-gray-500">— {retrievalMethod === 'pickup' ? 'Pickup' : 'Delivery'}</span>
          {/if}
        </div>
        <span class="btn btn-ghost btn-sm">
          {deliverySectionExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {#if deliverySectionExpanded}
        <div class="p-6 space-y-4">
          <div>
            <fieldset>
              <legend class="text-sm font-medium text-gray-700 mb-3">How would you like to receive your order?</legend>
              <div class="flex space-x-4">
                <label class="cursor-pointer">
                  <input type="radio" class="radio" name="retrieval" value="pickup" bind:group={retrievalMethod}>
                  <span class="ml-2">Pickup</span>
                </label>
                <label class="cursor-pointer">
                  <input type="radio" class="radio" name="retrieval" value="delivery" bind:group={retrievalMethod}>
                  <span class="ml-2">Delivery (+$10)</span>
                </label>
              </div>
            </fieldset>

            {#if retrievalMethod === 'delivery'}
              <div class="mt-4 p-4 bg-blue-50 rounded-lg space-y-3">
                <h4 class="font-medium">Delivery Address</h4>
                <div class="form-control">
                  <label class="block text-sm font-medium text-gray-700 mb-1" for="address1">Street Address</label>
                  <input 
                    id="address1" 
                    class="input input-bordered bg-gray-50 border-gray-300" 
                    bind:value={addressLine1} 
                    placeholder="123 Main Street" 
                  />
                </div>
                <div class="form-control">
                  <label class="block text-sm font-medium text-gray-700 mb-1" for="address2">Apt, suite, etc. (optional)</label>
                  <input 
                    id="address2" 
                    class="input input-bordered bg-gray-50 border-gray-300" 
                    bind:value={addressLine2} 
                    placeholder="Apt 4B" 
                  />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-control">
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="city">City</label>
                    <input 
                      id="city" 
                      class="input input-bordered bg-gray-50 border-gray-300" 
                      bind:value={city} 
                      placeholder="City" 
                    />
                  </div>
                  <div class="form-control">
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="state">State</label>
                    <input 
                      id="state" 
                      class="input input-bordered bg-gray-50 border-gray-300" 
                      bind:value={addressState} 
                      placeholder="ST"
                      maxlength="2"
                    />
                  </div>
                </div>
                <div class="form-control">
                  <label class="block text-sm font-medium text-gray-700 mb-1" for="zip">ZIP Code</label>
                  <input 
                    id="zip" 
                    class="input input-bordered bg-gray-50 border-gray-300" 
                    bind:value={zip} 
                    placeholder="12345" 
                  />
                </div>
              </div>
            {/if}
          </div>
          
          <div class="flex justify-end pt-4">
            <button 
              class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              onclick={completeDeliverySection}
            >
              Continue →
            </button>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Date Selection Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <button class="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer w-full text-left" onclick={() => dateSectionExpanded = !dateSectionExpanded}>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold">3</div>
          <h2 class="text-xl font-semibold text-gray-800">Choose Completion Date</h2>
          {#if selectedDate && !dateSectionExpanded}
            <span class="text-sm text-gray-500">
              — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          {/if}
        </div>
        <span class="btn btn-ghost btn-sm">
          {dateSectionExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {#if dateSectionExpanded}
        <div class="p-6 space-y-4">
          <div class="mb-4">
            <p class="text-gray-600 mb-2">Select when you'd like the order to be ready for {retrievalMethod}</p>
            {#if selectedDate}
              <p class="text-sm text-green-600 font-medium">
                Selected: {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            {/if}
          </div>
          
          <Calendar
            {schedule}
            editMode={false}
            {selectedDate}
            {retrievalMethod}
            onDateSelect={handleDateSelect}
          />
          
          <div class="flex justify-end pt-4">
            <button 
              class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              onclick={completeDateSection}
            >
              Continue →
            </button>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Products Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <button class="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer w-full text-left" onclick={() => productsSectionExpanded = !productsSectionExpanded}>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold">4</div>
          <h2 class="text-xl font-semibold text-gray-800">Select Products</h2>
          {#if cartItems.length > 0 && !productsSectionExpanded}
            <span class="text-sm text-gray-500">— {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
          {/if}
        </div>
        <span class="btn btn-ghost btn-sm">
          {productsSectionExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {#if productsSectionExpanded}
        <div class="p-6">
          <!-- Cart Items -->
          {#if cartItems.length > 0}
            <div class="mb-6">
              <h3 class="font-semibold mb-3">Order Items</h3>
              <div class="space-y-3">
                {#each cartItems as item (item.product.id)}
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                      <h4 class="font-medium">{item.product.name}</h4>
                      <p class="text-sm text-gray-600">{formatPrice(item.product.priceCents)} each</p>
                    </div>
                    <div class="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        class="input input-bordered input-sm w-20 bg-white"
                        value={item.quantity}
                        onchange={(e) => updateQuantity(item.product.id, parseInt(e.currentTarget.value))}
                      />
                      <span class="font-semibold w-24 text-right">{formatPrice(item.product.priceCents * item.quantity)}</span>
                      <button 
                        class="btn btn-ghost btn-sm text-red-600"
                        onclick={() => removeFromCart(item.product.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Available Products -->
          <div>
            <h3 class="font-semibold mb-3">Available Products</h3>
            
            {#if data.products && data.products.length > 0}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each data.products as product}
                  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 class="font-medium mb-2">{product.name}</h4>
                    {#if product.description}
                      <p class="text-sm text-gray-600 mb-3">{product.description}</p>
                    {/if}
                    <div class="flex items-center justify-between">
                      <span class="font-semibold">{formatPrice(product.price_cents || product.priceCents)}</span>
                      <button 
                        class="btn btn-primary btn-sm"
                        onclick={() => addProductToCart(product)}
                      >
                        Add
                      </button>
                    </div>
                    {#if !product.is_active}
                      <p class="text-xs text-red-500 mt-2">This product is inactive</p>
                    {/if}
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8 text-gray-500">
                <p>No products available. Please add products first.</p>
                <a href="/admin/product" class="btn btn-primary btn-sm mt-4">Go to Product Management</a>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Order Summary & Submit -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
      
      <!-- Special Instructions -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1" for="customizations">Special Instructions (optional)</label>
        <textarea 
          id="customizations" 
          class="textarea textarea-bordered w-full bg-white text-gray-900" 
          bind:value={customizations} 
          placeholder="Any special requests or modifications?"
          rows="3"
        ></textarea>
      </div>
      
      <!-- Price Summary -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {#if deliveryFee > 0}
            <div class="flex justify-between">
              <span>Delivery Fee</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
          {/if}
          <div class="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <p class="text-sm text-gray-500">Payment: Pay on {retrievalMethod === 'pickup' ? 'Pickup' : 'Delivery'}</p>
        <button 
          class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          class:loading={isSubmitting}
          onclick={submitOrder}
          disabled={isSubmitting || cartItems.length === 0}
        >
          {isSubmitting ? 'Creating Order...' : 'Create Order'}
        </button>
      </div>
    </div>
  </div>
</div>
