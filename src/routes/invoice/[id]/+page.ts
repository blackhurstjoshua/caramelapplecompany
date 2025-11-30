import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { OrderService } from '$lib/services/orders';

export const load: PageLoad = async ({ params, url }) => {
  const orderId = params.id;
  const token = url.searchParams.get('token');
  
  if (!orderId) {
    throw error(400, 'Order ID is required');
  }
  
  if (!token) {
    throw error(403, 'Access token is required');
  }
  
  // Validate token format (simple timestamp-based token)
  try {
    const tokenData = atob(token);
    const [tokenOrderId, timestamp] = tokenData.split(':');
    
    // Verify the token is for this order
    if (tokenOrderId !== orderId) {
      throw error(403, 'Invalid access token');
    }
    
    // Token is valid for 1 hour
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 3600000) { // 1 hour in milliseconds
      throw error(403, 'Access token has expired');
    }
  } catch (err) {
    throw error(403, 'Invalid access token');
  }
  
  // Fetch order details
  const order = await OrderService.getOrderDetails(orderId);
  
  if (!order) {
    throw error(404, 'Order not found');
  }
  
  return {
    order
  };
};

