/**
 * Simple test to generate one PNG file with proper format
 */

import { createAttractorEngine, EngineType, SideFlipMode, ProjectionType, createQuaternion, createVector3D } from '../typescript/core/attractor-engine';
import { SimplePNGRenderer } from '../typescript/node/image-renderer';

async function testPNG() {
  console.log('Testing PNG generation...');
  
  try {
    // Create JavaScript engine
    const engine = await createAttractorEngine({ type: EngineType.JAVASCRIPT });
    
    // Generate 500 points
    const result = await engine.generateBatch({
      start: createQuaternion(0.6, 0.4, 0.3, 0.2),
      additive: createVector3D(0.08, 0.08, 0.08),
      wind: createQuaternion(0.95, 0.05, 0.0, 0.0),
      mode: SideFlipMode.PLAIN_FLIP
    }, {
      projectionType: ProjectionType.SIMPLE,
      cameraRotation: createQuaternion(1.0, 0.0, 0.0, 0.0),
      batchSize: 500
    });

    console.log(`Generated ${result.points.length} points`);

    // Create PNG renderer
    const renderer = new SimplePNGRenderer({
      width: 400,
      height: 300,
      scale: 100.0,
      offsetX: 200,
      offsetY: 150,
      blurRadius: 1.0
    });

    // Render to PNG
    const outputPath = 'output/test_png.png';
    const renderResult = await renderer.renderPointsToPNG(result.points, outputPath);
    
    console.log(`PNG generated: ${renderResult.imagePath}`);
    console.log(`File size: ${renderResult.statistics}`);
    
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  }
}

if (require.main === module) {
  testPNG().catch(console.error);
}
