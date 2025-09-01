import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { Product } from './product';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: number;
}

function createCartStore() {
  const { subscribe, set, update } = writable<CartItem[]>([]);

  // Load from localStorage on initialization
  function loadFromStorage(): CartItem[] {
    if (!browser) return [];
    try {
      const stored = localStorage.getItem('caramel-apple-cart');
      if (!stored) return [];
      
      const parsedItems = JSON.parse(stored);
      // Convert plain objects back to Product instances
      return parsedItems.map((item: any) => ({
        ...item,
        product: new Product(item.product)
      }));
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }

  // Save to localStorage
  function saveToStorage(items: CartItem[]) {
    if (!browser) return;
    try {
      localStorage.setItem('caramel-apple-cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  // Initialize with stored data
  set(loadFromStorage());

  return {
    subscribe,
    
    // Add item to cart
    addItem: (product: Product) => {
      update(items => {
        const existingItemIndex = items.findIndex(item => item.product.id === product.id);
        
        if (existingItemIndex >= 0) {
          // Increment quantity if item exists
          items[existingItemIndex].quantity += 1;
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity: 1,
            addedAt: Date.now()
          };
          items.push(newItem);
        }
        
        saveToStorage(items);
        return items;
      });
    },

    // Remove specific item from cart
    removeItem: (itemId: string) => {
      update(items => {
        const newItems = items.filter(item => item.id !== itemId);
        saveToStorage(newItems);
        return newItems;
      });
    },

    // Update item quantity
    updateQuantity: (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.removeItem(itemId);
        return;
      }
      
      update(items => {
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex >= 0) {
          items[itemIndex].quantity = quantity;
        }
        saveToStorage(items);
        return items;
      });
    },

    // Clear entire cart
    clear: () => {
      set([]);
      saveToStorage([]);
    },

    // Get total number of items
    getTotalCount: (): number => {
      const items = get({ subscribe });
      return items.reduce((total, item) => total + item.quantity, 0);
    },

    // Get total price
    getTotalPrice: (): number => {
      const items = get({ subscribe });
      return items.reduce((total, item) => total + (item.product.priceCents * item.quantity), 0);
    }
  };
}

export const cart = createCartStore();

// Derived stores for common calculations
export const cartCount = writable(0);
export const cartTotal = writable(0);

// Update derived stores when cart changes
cart.subscribe(items => {
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((total, item) => total + (item.product.priceCents * item.quantity), 0);
  
  cartCount.set(count);
  cartTotal.set(total);
}); 