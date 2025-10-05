/**
 * Node.js Example: Generate High-Quality Attractor Images
 * 
 * This example demonstrates how to use the WASM attractor engine
 * in Node.js to generate high-quality PNG images.
 */

import { NodeAttractor, NodeConfigBuilder } from '../dist/node/node-attractor.js';
import { SideFlipVariation } from '../dist/types/index.js';

async function main() {
  console.log('🌌 Quaternion Attractor - Node.js Example');
  console.log('==========================================\n');
  
  try {
    // Example 1: Golden Ratio Configuration
    console.log('📸 Example 1: Golden Ratio Pattern');
    const goldenConfig = NodeConfigBuilder.createGoldenRatio(12345, 'output/golden-ratio.png');
    goldenConfig.width = 1920;
    goldenConfig.height = 1080;
    
    const goldenAttractor = new NodeAttractor(goldenConfig);
    await goldenAttractor.generateAndSave(50000);
    
    const goldenStats = goldenAttractor.getStatistics();
    console.log(`   Generated ${goldenStats.pointCount} points with ${goldenStats.sideFlipCount} side flips\n`);
    
    // Example 2: High-Quality 4K Image
    console.log('📸 Example 2: High-Quality 4K Image');
    const hqConfig = NodeConfigBuilder.createHighQuality(54321, 'output/high-quality-4k.png');
    hqConfig.width = 3840;
    hqConfig.height = 2160;
    
    const hqAttractor = new NodeAttractor(hqConfig);
    await hqAttractor.generateAndSave(100000);
    
    const hqStats = hqAttractor.getStatistics();
    console.log(`   Generated ${hqStats.pointCount} points with ${hqStats.sideFlipCount} side flips\n`);
    
    // Example 3: Different Side Flip Variations
    console.log('📸 Example 3: Side Flip Variations');
    
    const variations = [
      { name: 'Plain Flip', variation: SideFlipVariation.PLAIN_FLIP },
      { name: 'Flip Smallest', variation: SideFlipVariation.FLIP_SMALLEST },
      { name: 'Flip All Except Largest', variation: SideFlipVariation.FLIP_ALL_EXCEPT_LARGEST }
    ];
    
    for (const { name, variation } of variations) {
      const config = NodeConfigBuilder.createGoldenRatio(11111, `output/variation-${name.toLowerCase().replace(' ', '-')}.png`);
      config.sideFlipVariation = variation;
      config.width = 1200;
      config.height = 800;
      
      const attractor = new NodeAttractor(config);
      await attractor.generateAndSave(25000);
      
      const stats = attractor.getStatistics();
      console.log(`   ${name}: ${stats.pointCount} points, ${stats.sideFlipCount} side flips`);
    }
    
    console.log('\n✅ All examples completed successfully!');
    console.log('📁 Check the "output" directory for generated images.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the example
main();
