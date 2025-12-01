import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OrderService } from '$lib/services/orders';

/**
 * Convert a value to CSV-safe format
 * Escapes quotes and wraps in quotes if needed
 */
function csvEscape(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = String(value);
  
  // If the string contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: any[], headers: string[]): string {
  // Create header row
  const headerRow = headers.map(csvEscape).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      // Handle nested properties (e.g., 'customer.name')
      const keys = header.split('.');
      let value = item;
      for (const key of keys) {
        value = value?.[key];
      }
      return csvEscape(value);
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Format date for CSV export
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format currency for CSV export (convert cents to dollars)
 */
function formatCurrency(cents: number): string {
  return (cents / 100).toFixed(2);
}

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Fetch all orders with customer info
    const orders = await OrderService.getAllOrdersWithCustomer();
    
    // Process orders for CSV export
    const processedOrders = orders.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customer.name,
      'Customer Email': order.customer.email || '',
      'Customer Phone': order.customer.phone || '',
      'Order Date': formatDate(order.order_date),
      'Delivery Date': formatDate(order.delivery_date),
      'Status': order.status.charAt(0).toUpperCase() + order.status.slice(1),
      'Retrieval Method': order.retrieval_method.charAt(0).toUpperCase() + order.retrieval_method.slice(1),
      'Payment Method': order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1),
      'Subtotal': formatCurrency(order.subtotal_cents),
      'Delivery Fee': formatCurrency(order.delivery_fee_cents),
      'Total': formatCurrency(order.total_cents),
      'Address': order.address ? JSON.stringify(order.address) : '',
      'Customizations': order.customizations || '',
      'Created At': new Date(order.created_at).toISOString()
    }));
    
    // Define CSV headers (must match the keys in processedOrders)
    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Order Date',
      'Delivery Date',
      'Status',
      'Retrieval Method',
      'Payment Method',
      'Subtotal',
      'Delivery Fee',
      'Total',
      'Address',
      'Customizations',
      'Created At'
    ];
    
    // Convert to CSV
    const csv = convertToCSV(processedOrders, headers);
    
    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `orders_export_${date}.csv`;
    
    // Return CSV file
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error exporting orders:', error);
    return json({ error: 'Failed to export orders' }, { status: 500 });
  }
};

