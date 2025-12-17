/**
 * Migrate existing product images to 800x800px with smart cropping
 * 
 * This script:
 * 1. Fetches all products with images from the database
 * 2. Downloads each image from Supabase Storage
 * 3. Processes the image to 800x800px using sharp
 * 4. Uploads the processed image back to Storage (replacing the original)
 * 5. Uses upsert: true to replace files in-place (no path changes needed!)
 * 
 * Usage:
 *   node scripts/migrate_product_images.js
 * 
 * Optional flags:
 *   --dry-run    Show what would be processed without actually processing
 *   --limit N    Process first N images
 *   --all        Process ALL images (by default, only processes 1 for safety!)
 *   --force      Reprocess even if already 800x800px
 * 
 * Examples:
 *   node scripts/migrate_product_images.js              # Process just 1 product (safe test)
 *   node scripts/migrate_product_images.js --limit 3    # Process first 3 products
 *   node scripts/migrate_product_images.js --all        # Process ALL products
 *   node scripts/migrate_product_images.js --dry-run    # Preview without changes
 *   node scripts/migrate_product_images.js --all --force  # Reprocess everything
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const processAll = args.includes('--all');
const forceReprocess = args.includes('--force');
const limitIndex = args.indexOf('--limit');

// Default to processing only 1 product for safety (unless --all or --limit specified)
let limit;
if (processAll) {
  limit = null; // Process all products
} else if (limitIndex !== -1 && args[limitIndex + 1]) {
  limit = parseInt(args[limitIndex + 1]); // Process specified number
} else {
  limit = 1; // Default: only process first product for safety
}

/**
 * Process an image to 800x800px with smart cropping
 */
async function processImage(imageBuffer) {
  return await sharp(imageBuffer)
    .resize(800, 800, {
      fit: 'cover',
      position: 'attention' // Smart crop - focuses on interesting features
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

/**
 * Download image from Supabase Storage
 */
async function downloadImage(imagePath) {
  const { data, error } = await supabase.storage
    .from('images')
    .download(imagePath);

  if (error) {
    throw new Error(`Failed to download ${imagePath}: ${error.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
}

/**
 * Upload processed image back to Storage (replacing original)
 */
async function uploadProcessedImage(imagePath, processedBuffer) {
  const { error } = await supabase.storage
    .from('images')
    .upload(imagePath, processedBuffer, {
      upsert: true, // This replaces the existing file!
      contentType: 'image/jpeg',
      cacheControl: '3600'
    });

  if (error) {
    throw new Error(`Failed to upload ${imagePath}: ${error.message}`);
  }
}

/**
 * Main migration function
 */
async function migrateImages() {
  console.log('🍎 Product Image Migration to 800x800px\n');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  // Fetch all products with images
  console.log('📥 Fetching products from database...');
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image_path')
    .not('image_path', 'is', null)
    .order('name');

  if (error) {
    console.error('❌ Failed to fetch products:', error.message);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log('✅ No products with images found.');
    return;
  }

  const productsToProcess = limit ? products.slice(0, limit) : products;
  console.log(`📋 Found ${products.length} products with images`);
  
  if (limit) {
    if (limit === 1) {
      console.log(`🔒 SAFE MODE: Processing only 1 product for testing`);
      console.log(`   (Use --all to process all products, or --limit N for a specific number)`);
    } else {
      console.log(`🎯 Processing first ${productsToProcess.length} products (--limit ${limit})`);
    }
  } else {
    console.log(`⚠️  Processing ALL ${productsToProcess.length} products`);
  }
  console.log('');

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  const errors = [];

  // Process each product
  for (let i = 0; i < productsToProcess.length; i++) {
    const product = productsToProcess[i];
    const progress = `[${i + 1}/${productsToProcess.length}]`;
    
    try {
      console.log(`${progress} Processing: ${product.name}`);
      console.log(`    Path: ${product.image_path}`);

      if (!isDryRun) {
        // Download the original image
        console.log(`    📥 Downloading...`);
        const originalBuffer = await downloadImage(product.image_path);
        
        // Get original dimensions
        const metadata = await sharp(originalBuffer).metadata();
        console.log(`    📐 Current size: ${metadata.width}x${metadata.height}px`);

        // Check if already 800x800
        if (metadata.width === 800 && metadata.height === 800 && !forceReprocess) {
          console.log(`    ⏭️  Already 800x800px - skipping`);
          console.log(`       (Use --force to reprocess anyway)`);
          skippedCount++;
          console.log('');
          continue;
        }

        // Process the image
        console.log(`    🔄 Resizing and cropping to 800x800px...`);
        const processedBuffer = await processImage(originalBuffer);

        // Upload back with same path (replaces original)
        console.log(`    📤 Uploading (replacing original)...`);
        await uploadProcessedImage(product.image_path, processedBuffer);
        
        console.log(`    ✅ Successfully processed! (${metadata.width}x${metadata.height} → 800x800)`);
      } else {
        // Dry run - still download to check dimensions
        const originalBuffer = await downloadImage(product.image_path);
        const metadata = await sharp(originalBuffer).metadata();
        console.log(`    📐 Current: ${metadata.width}x${metadata.height}px`);
        
        if (metadata.width === 800 && metadata.height === 800 && !forceReprocess) {
          console.log(`    ⏭️  Would skip (already 800x800)`);
          skippedCount++;
        } else {
          console.log(`    🔄 Would process to 800x800px`);
        }
      }
      
      successCount++;
      console.log('');
      
    } catch (err) {
      errorCount++;
      const errorMsg = `Failed to process ${product.name}: ${err.message}`;
      errors.push(errorMsg);
      console.error(`    ❌ ${errorMsg}`);
      console.log('');
    }
  }

  // Summary
  console.log('═'.repeat(60));
  console.log('📊 Migration Summary');
  console.log('═'.repeat(60));
  console.log(`✅ Processed: ${successCount}/${productsToProcess.length}`);
  console.log(`⏭️  Skipped (already 800x800): ${skippedCount}`);
  console.log(`❌ Failed: ${errorCount}/${productsToProcess.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(err => console.log(`   - ${err}`));
  }

  if (isDryRun) {
    console.log('\n🔍 This was a dry run - no actual changes were made');
    console.log('Run without --dry-run to perform the migration');
  } else {
    console.log('\n🎉 Migration complete!');
    console.log('💡 All image paths remain unchanged (files were replaced in-place)');
  }
}

// Run the migration
migrateImages().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
