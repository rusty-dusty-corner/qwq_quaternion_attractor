/**
 * API Usage Examples for Quaternion Attractor Draft01
 * 
 * This file demonstrates how to use the unified API interface
 * for different use cases and scenarios.
 */

import {
  AttractorConstants,
  RenderParameters,
  SideFlipMode,
  ProjectionType,
  createQuaternion,
  createVector3D,
  createDefaultEngine,
  generateAttractorPoints,
  generateAnimationFrames
} from '../typescript/core/attractor-engine';

// ============================================================================
// EXAMPLE 1: Basic Usage
// ============================================================================

export async function basicExample() {
  console.log('=== Basic Attractor Generation ===');
  
  // Generate 50 points with default parameters
  const result = await generateAttractorPoints(50);
  
  console.log(`Generated ${result.points.length} points`);
  console.log('First few points:', result.points.slice(0, 3));
  console.log('Final quaternion:', result.finalQuaternion);
  
  return result;
}

// ============================================================================
// EXAMPLE 2: Custom Parameters
// ============================================================================

export async function customParametersExample() {
  console.log('=== Custom Parameters Example ===');
  
  // Define custom constants
  const constants: Partial<AttractorConstants> = {
    start: createQuaternion(0.7, 0.3, 0.5, 0.2),
    additive: createVector3D(0.05, 0.08, 0.12),
    wind: createQuaternion(0.9, 0.1, 0.0, 0.0),
    mode: SideFlipMode.FLIP_SMALLEST
  };
  
  // Define custom render parameters
  const renderParams: Partial<RenderParameters> = {
    projectionType: ProjectionType.SPHERE,
    cameraRotation: createQuaternion(0.8, 0.2, 0.0, 0.0),
    batchSize: 200
  };
  
  const result = await generateAttractorPoints(200, constants, renderParams);
  
  console.log(`Generated ${result.points.length} points with custom parameters`);
  console.log('Mode used:', constants.mode);
  console.log('Projection type:', renderParams.projectionType);
  
  return result;
}

// ============================================================================
// EXAMPLE 3: Animation Generation
// ============================================================================

export async function animationExample() {
  console.log('=== Animation Generation Example ===');
  
  // Generate 10 frames with 25 points each
  const frames = await generateAnimationFrames(
    10,    // frameCount
    25,    // pointsPerFrame
    {      // custom constants
      mode: SideFlipMode.FLIP_ALL_EXCEPT_LARGEST,
      additive: createVector3D(0.1, 0.1, 0.1)
    },
    {      // custom render params
      projectionType: ProjectionType.SIMPLE
    }
  );
  
  console.log(`Generated ${frames.length} animation frames`);
  console.log(`Total points: ${frames.reduce((sum, frame) => sum + frame.points.length, 0)}`);
  
  // Show progression of final quaternions
  console.log('Quaternion progression:');
  frames.forEach((frame, index) => {
    console.log(`Frame ${index}: (${frame.finalQuaternion.w.toFixed(3)}, ${frame.finalQuaternion.x.toFixed(3)}, ${frame.finalQuaternion.y.toFixed(3)}, ${frame.finalQuaternion.z.toFixed(3)})`);
  });
  
  return frames;
}

// ============================================================================
// EXAMPLE 4: Parameter Validation
// ============================================================================

export async function validationExample() {
  console.log('=== Parameter Validation Example ===');
  
  try {
    const engine = await createDefaultEngine();
    
    // Test with valid parameters
    const validConstants: AttractorConstants = {
      start: createQuaternion(0.5, 0.5, 0.5, 0.5),
      additive: createVector3D(0.1, 0.1, 0.1),
      wind: createQuaternion(1.0, 0.0, 0.0, 0.0),
      mode: SideFlipMode.PLAIN_FLIP
    };
    
    const validRenderParams: RenderParameters = {
      projectionType: ProjectionType.SIMPLE,
      cameraRotation: createQuaternion(1.0, 0.0, 0.0, 0.0),
      batchSize: 100
    };
    
    const validation = engine.validateParameters(validConstants, validRenderParams);
    console.log('Valid parameters result:', validation);
    
    // Test with invalid parameters
    const invalidConstants: AttractorConstants = {
      start: createQuaternion(NaN, 0.5, 0.5, 0.5), // Invalid quaternion
      additive: createVector3D(0.1, 0.1, 0.1),
      wind: createQuaternion(1.0, 0.0, 0.0, 0.0),
      mode: 999 as SideFlipMode // Invalid mode
    };
    
    const invalidValidation = engine.validateParameters(invalidConstants, validRenderParams);
    console.log('Invalid parameters result:', invalidValidation);
    
  } catch (error) {
    console.error('Validation example error:', error);
  }
}

// ============================================================================
// EXAMPLE 5: Multiple Variations Comparison
// ============================================================================

export async function variationsComparison() {
  console.log('=== Variations Comparison Example ===');
  
  const baseConstants = {
    start: createQuaternion(0.6, 0.4, 0.3, 0.2),
    additive: createVector3D(0.08, 0.08, 0.08),
    wind: createQuaternion(0.95, 0.05, 0.0, 0.0)
  };
  
  const renderParams = {
    projectionType: ProjectionType.SIMPLE,
    cameraRotation: createQuaternion(1.0, 0.0, 0.0, 0.0),
    batchSize: 50
  };
  
  const results = [];
  
  // Generate points for each variation
  for (const mode of [SideFlipMode.PLAIN_FLIP, SideFlipMode.FLIP_SMALLEST, SideFlipMode.FLIP_ALL_EXCEPT_LARGEST]) {
    console.log(`\nGenerating points for mode ${mode}:`);
    
    const constants = { ...baseConstants, mode };
    const result = await generateAttractorPoints(50, constants, renderParams);
    
    results.push({ mode, result });
    
    console.log(`Mode ${mode}: Generated ${result.points.length} points`);
    console.log(`Final quaternion: (${result.finalQuaternion.w.toFixed(3)}, ${result.finalQuaternion.x.toFixed(3)}, ${result.finalQuaternion.y.toFixed(3)}, ${result.finalQuaternion.z.toFixed(3)})`);
  }
  
  return results;
}

// ============================================================================
// EXAMPLE 6: Performance Testing
// ============================================================================

export async function performanceTest() {
  console.log('=== Performance Test Example ===');
  
  const testSizes = [100, 500, 1000, 2000];
  const results = [];
  
  for (const size of testSizes) {
    console.log(`\nTesting with ${size} points:`);
    
    const startTime = Date.now();
    const result = await generateAttractorPoints(size);
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    const pointsPerSecond = Math.round((size / duration) * 1000);
    
    console.log(`Generated ${result.points.length} points in ${duration}ms`);
    console.log(`Performance: ${pointsPerSecond} points/second`);
    
    results.push({
      size,
      duration,
      pointsPerSecond,
      pointCount: result.points.length
    });
  }
  
  return results;
}

// ============================================================================
// MAIN EXAMPLE RUNNER
// ============================================================================

export async function runAllExamples() {
  console.log('🚀 Running Quaternion Attractor API Examples\n');
  
  try {
    await basicExample();
    await customParametersExample();
    await animationExample();
    await validationExample();
    await variationsComparison();
    await performanceTest();
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Example execution failed:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}
