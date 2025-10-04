/**
 * Batch Processing Example: Generate Multiple Images
 * 
 * This example demonstrates how to generate multiple attractor images
 * with different seeds for batch processing.
 */

import { NodeAttractor, NodeConfigBuilder } from '../dist/node/node-attractor.js';

async function main() {
  console.log('🌌 Quaternion Attractor - Batch Processing Example');
  console.log('=================================================\n');
  
  try {
    // Generate interesting seeds
    const seeds = [
      12345,    // Golden ratio
      54321,    // Reversed
      11111,    // All ones
      99999,    // All nines
      31415,    // Pi approximation
      27182,    // e approximation
      16180,    // Golden ratio * 10000
      98765,    // Descending
      13579,    // Odd numbers
      24680     // Even numbers
    ];
    
    console.log(`🎲 Generating ${seeds.length} images with different seeds...\n`);
    
    // Create batch configuration
    const batchConfig = NodeConfigBuilder.createBatch(seeds[0], 'output/batch');
    batchConfig.width = 1600;
    batchConfig.height = 1200;
    batchConfig.format = 'png';
    
    const batchAttractor = new NodeAttractor(batchConfig);
    
    // Generate batch
    const startTime = Date.now();
    await batchAttractor.generateBatch(seeds, 30000, 'output/batch');
    const totalTime = Date.now() - startTime;
    
    console.log(`\n✅ Batch generation completed in ${totalTime}ms`);
    console.log(`📊 Average time per image: ${Math.round(totalTime / seeds.length)}ms`);
    console.log('📁 Check the "output/batch" directory for all generated images.');
    
    // Generate some statistics
    console.log('\n📈 Batch Statistics:');
    for (const seed of seeds.slice(0, 5)) { // Show first 5 seeds
      batchAttractor.updateConfig({ seed });
      batchAttractor.generatePoints(10000);
      const stats = batchAttractor.getStatistics();
      console.log(`   Seed ${seed}: ${stats.pointCount} points, ${stats.sideFlipCount} side flips`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the example
main();
