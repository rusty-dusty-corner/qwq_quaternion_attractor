#!/usr/bin/env node

/**
 * Test Hemisphere Fix
 * 
 * This script tests if the hemisphere transition fix is working correctly
 * by generating a small batch of points and checking for side transitions.
 */

const { createAttractorEngine, createQuaternion, createVector3D, SideFlipMode } = require('../dist/typescript/core/attractor-engine');

async function testHemisphereFix() {
  console.log('🧪 Testing Hemisphere Transition Fix');
  console.log('=====================================');
  
  const engine = createAttractorEngine('javascript');
  
  // Test parameters designed to force hemisphere transitions
  const constants = {
    start: createQuaternion(0.01, 0.99, 0.01, 0.01), // Start very close to equator
    wind: createQuaternion(0.9999, 0.0001, 0.00005, 0.00002), // Very small wind
    additive: createVector3D(0.2, 0, 0), // Large additive to force transitions
    mode: SideFlipMode.PLAIN_FLIP // Use plain flip mode for simplicity
  };
  
  const renderParams = {
    batchSize: 50,
    projectionType: 'simple',
    cameraRotation: createQuaternion(1, 0, 0, 0),
    imageWidth: 800,
    imageHeight: 600
  };
  
  console.log('📋 Test Parameters:');
  console.log(`  Start: (${constants.start.w.toFixed(3)}, ${constants.start.x.toFixed(3)}, ${constants.start.y.toFixed(3)}, ${constants.start.z.toFixed(3)})`);
  console.log(`  Wind: (${constants.wind.w.toFixed(3)}, ${constants.wind.x.toFixed(3)}, ${constants.wind.y.toFixed(3)}, ${constants.wind.z.toFixed(3)})`);
  console.log(`  Additive: (${constants.additive.x.toFixed(3)}, ${constants.additive.y.toFixed(3)}, ${constants.additive.z.toFixed(3)})`);
  console.log(`  Mode: ${constants.mode}`);
  
  try {
    console.log('\n🔄 Generating points...');
    const result = await engine.generateBatch(constants, renderParams);
    
    console.log(`✅ Generated ${result.points.length} points`);
    
    // Analyze side distribution
    const sideCounts = { positive: 0, negative: 0, undefined: 0 };
    const sideTransitions = [];
    let lastSide = null;
    
    console.log('\n📊 Side Analysis:');
    console.log('Iter | Side | Quaternion w        | Transition');
    console.log('-----|------|---------------------|-----------');
    
    result.points.forEach((point, i) => {
      const side = point.side;
      
      // Count sides
      if (side === 1) sideCounts.positive++;
      else if (side === -1) sideCounts.negative++;
      else sideCounts.undefined++;
      
      // Check for transitions
      const transition = (lastSide !== null && lastSide !== side) ? 'YES' : 'NO';
      if (transition === 'YES') {
        sideTransitions.push({ iteration: i, from: lastSide, to: side });
      }
      lastSide = side;
      
      // Show first 20 points and any transitions
      if (i < 20 || transition === 'YES') {
        console.log(`${i.toString().padStart(4)} | ${(side || '?').toString().padStart(4)} | ${(point.x || 0).toFixed(6).padStart(19)} | ${transition}`);
      }
    });
    
    console.log('\n📈 Results:');
    console.log(`  Positive hemisphere: ${sideCounts.positive} points`);
    console.log(`  Negative hemisphere: ${sideCounts.negative} points`);
    console.log(`  Undefined side: ${sideCounts.undefined} points`);
    console.log(`  Total transitions: ${sideTransitions.length}`);
    
    if (sideTransitions.length > 0) {
      console.log('\n🎉 SUCCESS: Hemisphere transitions detected!');
      console.log('  Transition details:');
      sideTransitions.forEach(t => {
        console.log(`    Iteration ${t.iteration}: ${t.from} → ${t.to}`);
      });
    } else {
      console.log('\n⚠️  No hemisphere transitions detected');
      console.log('  This might indicate the fix needs more work');
    }
    
    // Check if we have both positive and negative sides
    const hasBothSides = sideCounts.positive > 0 && sideCounts.negative > 0;
    if (hasBothSides) {
      console.log('\n🎨 COLOR SCHEME: Both hemispheres detected - should see blue AND magenta colors!');
    } else {
      console.log('\n🎨 COLOR SCHEME: Only one hemisphere - will only see blue OR magenta colors');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testHemisphereFix().catch(console.error);
}

module.exports = { testHemisphereFix };
