/**
 * PNG Generation Example for Quaternion Attractor
 * 
 * This example demonstrates how to:
 * 1. Generate attractor points using the JavaScript engine
 * 2. Render them to PNG images with statistics
 * 3. Create different variations and compare results
 */

import { createAttractorEngine, EngineType, SideFlipMode, ProjectionType, createQuaternion, createVector3D } from '../typescript/core/attractor-engine';
import { SimplePNGRenderer } from '../typescript/node/image-renderer';

// ============================================================================
// PNG GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a single PNG image with default parameters
 */
export async function generateBasicPNG(outputPath: string): Promise<void> {
  console.log('=== Generating Basic PNG ===');
  
  try {
    // Create JavaScript engine
    const engine = await createAttractorEngine({ type: EngineType.JAVASCRIPT });
    
    // Generate 1000 points
    const result = await engine.generateBatch({
      start: createQuaternion(0.6, 0.4, 0.3, 0.2),
      additive: createVector3D(0.08, 0.08, 0.08),
      wind: createQuaternion(0.95, 0.05, 0.0, 0.0),
      mode: SideFlipMode.PLAIN_FLIP
    }, {
      projectionType: ProjectionType.SIMPLE,
      cameraRotation: createQuaternion(1.0, 0.0, 0.0, 0.0),
      batchSize: 1000
    });

    console.log(`Generated ${result.points.length} points`);
    console.log(`Computation time: ${result.metadata?.computationTime}ms`);

    // Create PNG renderer
    const renderer = new SimplePNGRenderer({
      width: 800,
      height: 600,
      scale: 150.0,
      offsetX: 400,
      offsetY: 300,
      blurRadius: 1.5
    });

    // Render to PNG
    const renderResult = await renderer.renderPointsToPNG(result.points, outputPath);
    
    console.log(`PNG generated: ${renderResult.imagePath}`);
    console.log(`Statistics:`, renderResult.statistics);
    
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  }
}

/**
 * Generate PNG images for all three side flip variations
 */
export async function generateVariationComparison(outputDir: string): Promise<void> {
  console.log('=== Generating Variation Comparison ===');
  
  try {
    const engine = await createAttractorEngine({ type: EngineType.JAVASCRIPT });
    const renderer = new SimplePNGRenderer({
      width: 800,
      height: 600,
      scale: 120.0,
      offsetX: 400,
      offsetY: 300,
      blurRadius: 1.0
    });

    const variations = [
      { mode: SideFlipMode.PLAIN_FLIP, name: 'plain_flip' },
      { mode: SideFlipMode.FLIP_SMALLEST, name: 'flip_smallest' },
      { mode: SideFlipMode.FLIP_ALL_EXCEPT_LARGEST, name: 'flip_all_except_largest' }
    ];

    for (const variation of variations) {
      console.log(`\nGenerating ${variation.name}...`);
      
      const result = await engine.generateBatch({
        start: createQuaternion(0.5, 0.5, 0.5, 0.5),
        additive: createVector3D(0.1, 0.1, 0.1),
        wind: createQuaternion(0.9, 0.1, 0.0, 0.0),
        mode: variation.mode
      }, {
        projectionType: ProjectionType.SIMPLE,
        cameraRotation: createQuaternion(1.0, 0.0, 0.0, 0.0),
        batchSize: 1500
      });

      const outputPath = `${outputDir}/${variation.name}.png`;
      const renderResult = await renderer.renderPointsToPNG(result.points, outputPath);
      
      console.log(`${variation.name}: ${result.points.length} points, ${renderResult.renderTime}ms`);
    }
    
  } catch (error) {
    console.error('Error generating variation comparison:', error);
    throw error;
  }
}

/**
 * Generate animation frames
 */
export async function generateAnimationFrames(outputDir: string, frameCount: number = 10): Promise<void> {
  console.log(`=== Generating ${frameCount} Animation Frames ===`);
  
  try {
    const engine = await createAttractorEngine({ type: EngineType.JAVASCRIPT });
    const renderer = new SimplePNGRenderer({
      width: 600,
      height: 600,
      scale: 100.0,
      offsetX: 300,
      offsetY: 300,
      blurRadius: 1.0
    });

    // Generate multiple batches for animation
    const batches = await engine.generateMultipleBatches({
      start: createQuaternion(0.7, 0.3, 0.5, 0.2),
      additive: createVector3D(0.05, 0.08, 0.12),
      wind: createQuaternion(0.92, 0.08, 0.0, 0.0),
      mode: SideFlipMode.FLIP_SMALLEST
    }, {
      projectionType: ProjectionType.SIMPLE,
      cameraRotation: createQuaternion(1.0, 0.0, 0.0, 0.0),
      batchSize: 200
    }, frameCount);

    console.log(`Generated ${batches.length} batches`);

    // Render each batch as a frame
    const renderResults = await renderer.renderAnimationFrames(
      batches.map(batch => batch.points),
      outputDir,
      'frame'
    );

    console.log(`Rendered ${renderResults.length} animation frames`);
    console.log(`Average render time: ${renderResults.reduce((sum, r) => sum + r.renderTime, 0) / renderResults.length}ms`);
    
  } catch (error) {
    console.error('Error generating animation frames:', error);
    throw error;
  }
}

/**
 * Performance test with different point counts
 */
export async function performanceTest(outputDir: string): Promise<void> {
  console.log('=== Performance Test ===');
  
  try {
    const engine = await createAttractorEngine({ type: EngineType.JAVASCRIPT });
    const renderer = new SimplePNGRenderer({
      width: 800,
      height: 600,
      scale: 100.0,
      offsetX: 400,
      offsetY: 300,
      blurRadius: 1.0
    });

    const testSizes = [500, 1000, 2000, 5000];
    const results = [];

    for (const size of testSizes) {
      console.log(`\nTesting with ${size} points...`);
      
      const startTime = Date.now();
      
      const result = await engine.generateBatch({
        start: createQuaternion(0.6, 0.4, 0.3, 0.2),
        additive: createVector3D(0.08, 0.08, 0.08),
        wind: createQuaternion(0.95, 0.05, 0.0, 0.0),
        mode: SideFlipMode.PLAIN_FLIP
      }, {
        projectionType: ProjectionType.SIMPLE,
        cameraRotation: createQuaternion(1.0, 0.0, 0.0, 0.0),
        batchSize: size
      });

      const outputPath = `${outputDir}/performance_${size}.png`;
      const renderResult = await renderer.renderPointsToPNG(result.points, outputPath);
      
      const totalTime = Date.now() - startTime;
      const pointsPerSecond = Math.round((size / totalTime) * 1000);
      
      console.log(`${size} points: ${totalTime}ms total, ${pointsPerSecond} points/sec`);
      console.log(`Generation: ${result.metadata?.computationTime}ms, Render: ${renderResult.renderTime}ms`);
      
      results.push({
        size,
        totalTime,
        generationTime: result.metadata?.computationTime,
        renderTime: renderResult.renderTime,
        pointsPerSecond
      });
    }

    console.log('\nPerformance Summary:');
    results.forEach(r => {
      console.log(`${r.size.toString().padStart(5)} points: ${r.pointsPerSecond.toString().padStart(6)} pts/sec, ${r.totalTime.toString().padStart(4)}ms total`);
    });
    
  } catch (error) {
    console.error('Error in performance test:', error);
    throw error;
  }
}

// ============================================================================
// MAIN EXAMPLE RUNNER
// ============================================================================

export async function runPNGExamples(): Promise<void> {
  console.log('🎨 Running PNG Generation Examples\n');
  
  const outputDir = 'output/png_examples';
  
  try {
    // Create output directory
    const fs = require('fs').promises;
    await fs.mkdir(outputDir, { recursive: true });
    
    // Run examples
    await generateBasicPNG(`${outputDir}/basic_attractor.png`);
    await generateVariationComparison(`${outputDir}/variations`);
    await generateAnimationFrames(`${outputDir}/animation`, 8);
    await performanceTest(`${outputDir}/performance`);
    
    console.log('\n✅ All PNG examples completed successfully!');
    console.log(`Check the ${outputDir} directory for generated images.`);
    
  } catch (error) {
    console.error('\n❌ PNG generation failed:', error);
    throw error;
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runPNGExamples().catch(console.error);
}
