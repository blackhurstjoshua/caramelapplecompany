/**
 * Currency conversion utilities
 * Standardized functions for converting between cents and dollars
 */

/**
 * Convert cents to dollars
 * @param cents - Amount in cents (integer)
 * @returns Amount in dollars (number with 2 decimal places)
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert dollars to cents
 * @param dollars - Amount in dollars (number)
 * @returns Amount in cents (integer)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format cents as currency string
 * @param cents - Amount in cents (integer)
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "$12.34")
 */
export function formatCents(
  cents: number, 
  options: {
    currency?: string;
    locale?: string;
    showCents?: boolean;
  } = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    showCents = true
  } = options;

  const dollars = centsToDollars(cents);
  
  if (showCents) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(dollars);
  } else {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(dollars);
  }
}

/**
 * Format dollars as currency string
 * @param dollars - Amount in dollars (number)
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "$12.34")
 */
export function formatDollars(
  dollars: number,
  options: {
    currency?: string;
    locale?: string;
    showCents?: boolean;
  } = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    showCents = true
  } = options;

  if (showCents) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(dollars);
  } else {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(dollars);
  }
}

/**
 * Simple currency formatting (most common use case)
 * @param cents - Amount in cents (integer)
 * @returns Formatted currency string (e.g., "$12.34")
 */
export function formatPrice(cents: number): string {
  return formatCents(cents);
}

/**
 * Parse currency string to cents
 * @param currencyString - Currency string (e.g., "$12.34", "12.34")
 * @returns Amount in cents (integer)
 */
export function parseCurrencyToCents(currencyString: string): number {
  // Remove currency symbols and whitespace, parse as float
  const cleanString = currencyString.replace(/[$,\s]/g, '');
  const dollars = parseFloat(cleanString);
  
  if (isNaN(dollars)) {
    throw new Error(`Invalid currency string: ${currencyString}`);
  }
  
  return dollarsToCents(dollars);
}

/**
 * Validate that a cents value is valid
 * @param cents - Amount in cents
 * @returns true if valid, false otherwise
 */
export function isValidCents(cents: number): boolean {
  return Number.isInteger(cents) && cents >= 0;
}

/**
 * Validate that a dollars value is valid
 * @param dollars - Amount in dollars
 * @returns true if valid, false otherwise
 */
export function isValidDollars(dollars: number): boolean {
  return typeof dollars === 'number' && dollars >= 0 && isFinite(dollars);
}

