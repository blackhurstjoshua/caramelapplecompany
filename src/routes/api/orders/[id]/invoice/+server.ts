import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { chromium } from 'playwright';
import { dev } from '$app/environment';

export const GET: RequestHandler = async ({ params, url }) => {
  try {
    const orderId = params.id;
    
    if (!orderId) {
      throw error(400, 'Order ID is required');
    }
    
    // Determine the base URL for the invoice page
    const protocol = dev ? 'http' : 'https';
    const host = url.host;
    const invoiceUrl = `${protocol}://${host}/admin/orders/${orderId}/invoice`;
    
    // Launch Playwright browser
    const browser = await chromium.launch({
      headless: true,
      // Use bundled chromium in production
      executablePath: dev ? undefined : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    });
    
    try {
      const context = await browser.newContext({
        // Set viewport to A4 paper size
        viewport: {
          width: 794, // A4 width at 96 DPI
          height: 1123 // A4 height at 96 DPI
        }
      });
      
      const page = await context.newPage();
      
      // Navigate to the invoice page
      await page.goto(invoiceUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // Wait for the invoice content to be visible
      await page.waitForSelector('.invoice-container', {
        timeout: 10000
      });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        printBackground: true,
        preferCSSPageSize: false
      });
      
      await context.close();
      
      // Convert Buffer to Uint8Array for Response
      const pdfData = new Uint8Array(pdfBuffer);
      
      // Return PDF as download
      return new Response(pdfData, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${orderId.substring(0, 8)}.pdf"`,
          'Cache-Control': 'no-cache'
        }
      });
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error('Error generating PDF invoice:', err);
    
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Failed to generate PDF invoice. Please try again.');
  }
};

