/**
 * Import stores from CSV file into the database
 * 
 * Usage:
 * 1. First run the db/stores.sql script to create the stores table
 * 2. Place your CSV file at: scripts/stores.csv
 *    CSV format: Store,Contact,Address,Phone (with header row)
 * 3. Then run: node scripts/import_stores.js
 * 
 * You can optionally specify a custom CSV file path:
 *    node scripts/import_stores.js path/to/your/stores.csv
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Required: PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Parse a CSV line, handling quoted values that may contain commas
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Read and parse the CSV file
 */
function parseStoresCSV(csvPath) {
  console.log(`Reading CSV file from: ${csvPath}`);
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }
  
  // Skip header row (first line)
  const dataLines = lines.slice(1);
  
  const stores = dataLines.map((line, index) => {
    const [name, contact, address, phone] = parseCSVLine(line);
    
    if (!name || !address) {
      console.warn(`Warning: Skipping line ${index + 2} - missing required fields (name or address)`);
      return null;
    }
    
    return {
      name: name.trim(),
      contact: contact ? contact.trim() : null,
      address: address.trim(),
      phone: phone ? phone.trim() : null
    };
  }).filter(store => store !== null);
  
  return stores;
}

async function importStores(csvPath) {
  console.log('Starting store import...');
  
  try {
    // Parse the CSV file
    const stores = parseStoresCSV(csvPath);
    console.log(`Parsed ${stores.length} stores from CSV`);
    
    if (stores.length === 0) {
      console.error('No valid stores found in CSV file');
      process.exit(1);
    }
    
    // Check if stores already exist
    const { data: existingStores, error: fetchError } = await supabase
      .from('stores')
      .select('id');
    
    if (fetchError) {
      console.error('Error checking existing stores:', fetchError);
      throw fetchError;
    }
    
    if (existingStores && existingStores.length > 0) {
      console.log(`Found ${existingStores.length} existing stores. Clearing table...`);
      const { error: deleteError } = await supabase
        .from('stores')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (deleteError) {
        console.error('Error clearing stores table:', deleteError);
        throw deleteError;
      }
      console.log('Cleared existing stores.');
    }
    
    // Insert stores
    const { data, error } = await supabase
      .from('stores')
      .insert(stores)
      .select();
    
    if (error) {
      console.error('Error inserting stores:', error);
      throw error;
    }
    
    console.log(`Successfully imported ${data.length} stores!`);
    console.log('\nImported stores:');
    data.forEach((store, index) => {
      console.log(`  ${index + 1}. ${store.name}`);
    });
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Determine CSV file path
// Use command line argument if provided, otherwise use default path
const csvPath = process.argv[2] || path.join(__dirname, 'stores.csv');

// Run the import
importStores(csvPath).then(() => {
  console.log('\nImport completed successfully!');
  process.exit(0);
});

