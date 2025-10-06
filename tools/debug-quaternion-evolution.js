#!/usr/bin/env node

/**
 * Debug Quaternion Evolution
 * 
 * This script traces how the quaternion w component evolves during generation
 * to understand why we're not getting mixed sides.
 */

const { createQuaternion, multiplyQuaternions, normalizeQuaternion } = require('../dist/typescript/core/attractor-engine');

function debugQuaternionEvolution() {
  console.log('🔄 Debugging Quaternion Evolution');
  console.log('=================================');

  // Test parameters
  const start = createQuaternion(0.5, 0.3, 0.2, 0.1);
  const wind = createQuaternion(-0.8, 0.1, 0.05, 0.02);
  
  console.log('📋 Test Parameters:');
  console.log(`  Start: (${start.w.toFixed(3)}, ${start.x.toFixed(3)}, ${start.y.toFixed(3)}, ${start.z.toFixed(3)})`);
  console.log(`  Wind: (${wind.w.toFixed(3)}, ${wind.x.toFixed(3)}, ${wind.y.toFixed(3)}, ${wind.z.toFixed(3)})`);
  
  let currentQuaternion = { ...start };
  
  console.log('\n🔄 Quaternion Evolution:');
  console.log('Iteration | w        | x        | y        | z        | Side | Magnitude');
  console.log('----------|----------|----------|----------|----------|------|----------');
  
  for (let i = 0; i < 20; i++) {
    // Apply wind rotation
    currentQuaternion = multiplyQuaternions(currentQuaternion, wind);
    currentQuaternion = normalizeQuaternion(currentQuaternion);
    
    // Calculate side and magnitude
    const side = currentQuaternion.w >= 0 ? 1 : -1;
    const magnitude = Math.sqrt(currentQuaternion.w * currentQuaternion.w + 
                               currentQuaternion.x * currentQuaternion.x + 
                               currentQuaternion.y * currentQuaternion.y + 
                               currentQuaternion.z * currentQuaternion.z);
    
    console.log(`${i.toString().padStart(9)} | ${currentQuaternion.w.toFixed(6)} | ${currentQuaternion.x.toFixed(6)} | ${currentQuaternion.y.toFixed(6)} | ${currentQuaternion.z.toFixed(6)} | ${side.toString().padStart(4)} | ${magnitude.toFixed(6)}`);
  }
  
  // Test with different wind quaternions
  console.log('\n🧪 Testing Different Wind Quaternions:');
  console.log('=====================================');
  
  const testWinds = [
    { name: 'Small negative w', quat: createQuaternion(-0.1, 0.1, 0.05, 0.02) },
    { name: 'Large negative w', quat: createQuaternion(-0.9, 0.1, 0.05, 0.02) },
    { name: 'Mixed components', quat: createQuaternion(-0.5, -0.3, 0.2, 0.1) },
    { name: 'All negative', quat: createQuaternion(-0.5, -0.3, -0.2, -0.1) }
  ];
  
  testWinds.forEach((testWind, windIndex) => {
    console.log(`\n${testWind.name}:`);
    console.log(`Wind: (${testWind.quat.w.toFixed(3)}, ${testWind.quat.x.toFixed(3)}, ${testWind.quat.y.toFixed(3)}, ${testWind.quat.z.toFixed(3)})`);
    
    let testQuat = { ...start };
    let sideCounts = { positive: 0, negative: 0 };
    
    for (let i = 0; i < 20; i++) {
      testQuat = multiplyQuaternions(testQuat, testWind.quat);
      testQuat = normalizeQuaternion(testQuat);
      
      const side = testQuat.w >= 0 ? 1 : -1;
      if (side === 1) sideCounts.positive++;
      else sideCounts.negative++;
    }
    
    console.log(`  Side distribution: +1=${sideCounts.positive}, -1=${sideCounts.negative}`);
    console.log(`  Final quaternion: (${testQuat.w.toFixed(3)}, ${testQuat.x.toFixed(3)}, ${testQuat.y.toFixed(3)}, ${testQuat.z.toFixed(3)})`);
  });
}

// Run the debug
debugQuaternionEvolution();

