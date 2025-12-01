import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CustomerService } from '$lib/services/customers';

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
    return headers.map(header => csvEscape(item[header])).join(',');
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

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Fetch all customers
    const customers = await CustomerService.getAllCustomers();
    
    // Process customers for CSV export
    const processedCustomers = customers.map(customer => ({
      'Customer ID': customer.id,
      'Name': customer.name,
      'Email': customer.email || '',
      'Phone': customer.phone || '',
      'Join Date': formatDate(customer.join_date),
      'Created At': new Date(customer.created_at).toISOString()
    }));
    
    // Define CSV headers (must match the keys in processedCustomers)
    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Join Date',
      'Created At'
    ];
    
    // Convert to CSV
    const csv = convertToCSV(processedCustomers, headers);
    
    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `customers_export_${date}.csv`;
    
    // Return CSV file
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error exporting customers:', error);
    return json({ error: 'Failed to export customers' }, { status: 500 });
  }
};

