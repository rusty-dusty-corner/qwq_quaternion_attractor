#!/usr/bin/env node

/**
 * Debug Math Trace Script
 * 
 * This script traces the quaternion evolution step by step to verify:
 * 1. Smooth quaternion path without breaks
 * 2. Proper side transitions (from one hemisphere to another)
 * 3. Correct additive vector effect
 * 4. Minimal coordinate changes for small steps
 */

const { createQuaternion, createVector3D, multiplyQuaternions, normalizeQuaternion } = require('../dist/typescript/core/attractor-engine');

class MathTraceDebugger {
  constructor() {
    // Import math functions from shared
    this.stereographicProjection = require('../dist/shared/quaternion-math').stereographicProjection;
    this.inverseStereographicProjection = require('../dist/shared/quaternion-math').inverseStereographicProjection;
    this.inverseStereographicProjectionWithSide = require('../dist/shared/quaternion-math').inverseStereographicProjectionWithSide;
  }

  // Use shared hemisphere-aware inverse stereographic projection directly
  // No need for wrapper method - call this.inverseStereographicProjectionWithSide directly

  /**
   * Add two 3D vectors
   */
  addVector3D(a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z
    };
  }

  /**
   * Calculate 3D vector magnitude
   */
  magnitude3D(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }

  /**
   * Test 1: Identity wind (no rotation) with small additive
   */
  testIdentityWindWithSmallAdditive() {
    console.log('🧪 Test 1: Identity Wind with Small Additive');
    console.log('=============================================');

    // Create properly normalized quaternions that are NOT close to poles
    const start = normalizeQuaternion(createQuaternion(0.7, 0.3, 0.3, 0.3)); // Further from poles
    const wind = normalizeQuaternion(createQuaternion(0.9, 0.1, 0.1, 0.1)); // Small rotation
    const additive = createVector3D(0.1, 0, 0); // Moderate additive
    
    console.log('📋 Parameters:');
    console.log(`  Start: (${start.w.toFixed(3)}, ${start.x.toFixed(3)}, ${start.y.toFixed(3)}, ${start.z.toFixed(3)})`);
    console.log(`  Wind: (${wind.w.toFixed(3)}, ${wind.x.toFixed(3)}, ${wind.y.toFixed(3)}, ${wind.z.toFixed(3)})`);
    console.log(`  Additive: (${additive.x.toFixed(3)}, ${additive.y.toFixed(3)}, ${additive.z.toFixed(3)})`);
    
    let currentQuaternion = { ...start };
    
    console.log('\n🔄 Quaternion Evolution:');
    console.log('📋 Mathematical Flow:');
    console.log('  1. QSide = sign of quaternion.w (before additive)');
    console.log('  2. Apply additive vector to 3D point');
    console.log('  3. PSide = sign based on phyllotaxis distance (distance > 1.0 ? -1 : 1)');
    console.log('  4. Sphere Action = what happens when we cross unit sphere boundary');
    console.log('  5. Final Side = the side that gets stored in the point');
    console.log('');
    console.log('Iter | Quaternion w,x,y,z        | QSide | 3D Point (x,y,z) | Phyllotaxis Distance | PSide | Sphere Action | Final Side');
    console.log('-----|---------------------------|-------|-------------------|----------------------|-------|---------------|------------');
    
    for (let i = 0; i < 50; i++) {
      // Apply wind rotation (identity, so no change)
      currentQuaternion = multiplyQuaternions(currentQuaternion, wind);
      currentQuaternion = normalizeQuaternion(currentQuaternion);
      
      // Project to 3D space
      const point3D = this.stereographicProjection(currentQuaternion);
      
      // Determine side from QUATERNION PATH (before additive)
      const quaternionSide = currentQuaternion.w >= 0 ? 1 : -1;
      
      // Apply additive vector
      const modifiedPoint = this.addVector3D(point3D, additive);
      
      // Calculate distance from center of phyllotaxis sphere (0,0,0)
      const distanceFromCenter = this.magnitude3D(modifiedPoint);
      
      // With hemisphere-aware projection, normalized quaternions map to |P| ≤ 1
      // Additive vectors may push points outside, which is expected behavior
      let processedPoint = modifiedPoint;
      let finalSide = quaternionSide;
      let sphereAction = 'INSIDE';
      
      if (distanceFromCenter > 1.0) {
        sphereAction = 'OUTSIDE - ADDITIVE EFFECT';
        // Point is outside unit ball due to additive vector
        // This is normal behavior with hemisphere-aware projection
        processedPoint = modifiedPoint;
        finalSide = quaternionSide;
      } else {
        sphereAction = 'INSIDE';
      }
      
      // Use the final side (this is what gets stored in the point)
      const side = finalSide;
      
      // Project back to quaternion with the correct side
      currentQuaternion = this.inverseStereographicProjectionWithSide(processedPoint, side);
      
      const magnitude = this.magnitude3D(point3D);
      
      // Show clear breakdown of the mathematical flow
      const quatStr = `(${currentQuaternion.w.toFixed(3)},${currentQuaternion.x.toFixed(3)},${currentQuaternion.y.toFixed(3)},${currentQuaternion.z.toFixed(3)})`;
      const pointStr = `(${point3D.x.toFixed(3)},${point3D.y.toFixed(3)},${point3D.z.toFixed(3)})`;
      const distanceStr = distanceFromCenter.toFixed(3);
      const phyllotaxisSide = distanceFromCenter > 1.0 ? -1 : 1;
      
      console.log(`${i.toString().padStart(4)} | ${quatStr.padStart(25)} | ${quaternionSide.toString().padStart(5)} | ${pointStr.padStart(17)} | ${distanceStr.padStart(20)} | ${phyllotaxisSide.toString().padStart(5)} | ${sphereAction.padStart(13)} | ${side.toString().padStart(10)}`);
    }
    
    console.log('\n📊 Mathematical Analysis:');
    console.log('✅ QSide = Quaternion side (from quaternion.w sign)');
    console.log('✅ PSide = Phyllotaxis side (from distance > 1.0)');
    console.log('✅ Sphere Action = Hemisphere flipping when crossing unit sphere');
    console.log('✅ Final Side = The side that determines color (blue vs magenta)');
    console.log('');
    console.log('🎯 Key Insight: We need to see transitions from QSide=1 to QSide=-1');
    console.log('🎯 Key Insight: We need to see transitions from PSide=1 to PSide=-1');
    console.log('🎯 Key Insight: Final Side should change when we cross sphere boundary');
  }

  /**
   * Test 2: Small wind with small additive (should show gradual movement)
   */
  testSmallWindWithSmallAdditive() {
    console.log('\n🧪 Test 2: Small Wind with Small Additive');
    console.log('==========================================');

    // Create properly normalized quaternions that are NOT close to poles
    const start = normalizeQuaternion(createQuaternion(0.8, 0.2, 0.2, 0.2)); // Further from poles
    const wind = normalizeQuaternion(createQuaternion(0.95, 0.05, 0.05, 0.05)); // Small rotation
    const additive = createVector3D(0.2, 0, 0); // Moderate additive
    
    console.log('📋 Parameters:');
    console.log(`  Start: (${start.w.toFixed(3)}, ${start.x.toFixed(3)}, ${start.y.toFixed(3)}, ${start.z.toFixed(3)})`);
    console.log(`  Wind: (${wind.w.toFixed(3)}, ${wind.x.toFixed(3)}, ${wind.y.toFixed(3)}, ${wind.z.toFixed(3)})`);
    console.log(`  Additive: (${additive.x.toFixed(3)}, ${additive.y.toFixed(3)}, ${additive.z.toFixed(3)})`);
    
    let currentQuaternion = { ...start };
    let sideChanges = 0;
    let lastSide = currentQuaternion.w >= 0 ? 1 : -1;
    
    console.log('\n🔄 Quaternion Evolution:');
    console.log('Iter | w        | x        | y        | z        | Side | Change | 3D Point                    | Magnitude');
    console.log('-----|----------|----------|----------|----------|------|--------|-----------------------------|----------');
    
    for (let i = 0; i < 50; i++) {
      // Apply wind rotation
      currentQuaternion = multiplyQuaternions(currentQuaternion, wind);
      currentQuaternion = normalizeQuaternion(currentQuaternion);
      
      // Project to 3D space
      const point3D = this.stereographicProjection(currentQuaternion);
      
      // Determine side
      const side = currentQuaternion.w >= 0 ? 1 : -1;
      const sideChange = (side !== lastSide) ? 'YES' : 'NO';
      if (side !== lastSide) sideChanges++;
      lastSide = side;
      
      // Apply additive vector
      const modifiedPoint = this.addVector3D(point3D, additive);
      
      // Project back to quaternion with side preservation
      currentQuaternion = this.inverseStereographicProjectionWithSide(modifiedPoint, side);
      
      const magnitude = this.magnitude3D(point3D);
      
      console.log(`${i.toString().padStart(4)} | ${currentQuaternion.w.toFixed(6)} | ${currentQuaternion.x.toFixed(6)} | ${currentQuaternion.y.toFixed(6)} | ${currentQuaternion.z.toFixed(6)} | ${side.toString().padStart(4)} | ${sideChange.padStart(6)} | (${point3D.x.toFixed(3)}, ${point3D.y.toFixed(3)}, ${point3D.z.toFixed(3)}) | ${magnitude.toFixed(6)}`);
    }
    
    console.log(`\n📊 Side Changes: ${sideChanges}`);
  }

  /**
   * Test 3: Check if path is smooth (no jumps in quaternion space)
   */
  testSmoothPath() {
    console.log('\n🧪 Test 3: Smooth Path Verification');
    console.log('===================================');

    // Create properly normalized quaternions
    const start = normalizeQuaternion(createQuaternion(0.999, 0.001, 0.0005, 0.0002));
    const wind = normalizeQuaternion(createQuaternion(0.9999, 0.0001, 0.00005, 0.00002));
    const additive = createVector3D(0.01, 0.000001, 0.000001);
    
    let currentQuaternion = { ...start };
    let previousQuaternion = { ...start };
    let maxJump = 0;
    
    console.log('🔄 Checking for jumps in quaternion space:');
    console.log('Iter | Jump Distance | w        | x        | y        | z        | Side');
    console.log('-----|---------------|----------|----------|----------|----------|------');
    
    for (let i = 0; i < 50; i++) {
      // Apply wind rotation
      currentQuaternion = multiplyQuaternions(currentQuaternion, wind);
      currentQuaternion = normalizeQuaternion(currentQuaternion);
      
      // Project to 3D space
      const point3D = this.stereographicProjection(currentQuaternion);
      
      // Determine side
      const side = currentQuaternion.w >= 0 ? 1 : -1;
      
      // Apply additive vector
      const modifiedPoint = this.addVector3D(point3D, additive);
      
      // Project back to quaternion with side preservation
      currentQuaternion = this.inverseStereographicProjectionWithSide(modifiedPoint, side);
      
      // Calculate jump distance from previous quaternion
      const jump = Math.sqrt(
        Math.pow(currentQuaternion.w - previousQuaternion.w, 2) +
        Math.pow(currentQuaternion.x - previousQuaternion.x, 2) +
        Math.pow(currentQuaternion.y - previousQuaternion.y, 2) +
        Math.pow(currentQuaternion.z - previousQuaternion.z, 2)
      );
      
      maxJump = Math.max(maxJump, jump);
      
      console.log(`${i.toString().padStart(4)} | ${jump.toFixed(6).padStart(13)} | ${currentQuaternion.w.toFixed(6)} | ${currentQuaternion.x.toFixed(6)} | ${currentQuaternion.y.toFixed(6)} | ${currentQuaternion.z.toFixed(6)} | ${side.toString().padStart(4)}`);
      
      previousQuaternion = { ...currentQuaternion };
    }
    
    console.log(`\n📊 Maximum Jump: ${maxJump.toFixed(6)}`);
    if (maxJump < 0.1) {
      console.log('✅ Path is smooth (max jump < 0.1)');
    } else {
      console.log('⚠️  Path has large jumps (max jump >= 0.1)');
    }
  }

  /**
   * Test 4: Verify hemisphere transitions
   */
  testHemisphereTransitions() {
    console.log('\n🧪 Test 4: Hemisphere Transitions');
    console.log('=================================');

    // Create properly normalized quaternions with very small additive
    const start = normalizeQuaternion(createQuaternion(0.999, 0.001, 0.001, 0.001)); // Very close to identity
    const wind = normalizeQuaternion(createQuaternion(0.9999, 0.0001, 0.0001, 0.0001)); // Tiny normalized wind
    const additive = createVector3D(0.002, 0, 0); // Very small additive
    
    let currentQuaternion = { ...start };
    let transitions = [];
    
    console.log('🔄 Tracking hemisphere transitions:');
    console.log('Iter | w        | Side | Transition | 3D Magnitude');
    console.log('-----|----------|------|------------|--------------');
    
    for (let i = 0; i < 50; i++) {
      // Apply wind rotation
      currentQuaternion = multiplyQuaternions(currentQuaternion, wind);
      currentQuaternion = normalizeQuaternion(currentQuaternion);
      
      // Project to 3D space
      const point3D = this.stereographicProjection(currentQuaternion);
      
      // Determine side
      const side = currentQuaternion.w >= 0 ? 1 : -1;
      
      // Apply additive vector
      const modifiedPoint = this.addVector3D(point3D, additive);
      
      // Project back to quaternion with side preservation
      currentQuaternion = this.inverseStereographicProjectionWithSide(modifiedPoint, side);
      
      const magnitude = this.magnitude3D(point3D);
      
      // Check for transition
      const transition = (i > 0 && transitions.length > 0 && side !== transitions[transitions.length - 1]) ? 'YES' : 'NO';
      if (transition === 'YES') {
        transitions.push(side);
      } else if (i === 0) {
        transitions.push(side);
      }
      
      console.log(`${i.toString().padStart(4)} | ${currentQuaternion.w.toFixed(6)} | ${side.toString().padStart(4)} | ${transition.padStart(10)} | ${magnitude.toFixed(6)}`);
    }
    
    console.log(`\n📊 Total Transitions: ${transitions.length - 1}`);
    console.log(`📊 Side Sequence: ${transitions.join(' → ')}`);
  }

  /**
   * Test 5: Quaternion Normalization Check
   */
  testQuaternionNormalization() {
    console.log('\n🧪 Test 5: Quaternion Normalization Check');
    console.log('==========================================');

    console.log('📋 Testing quaternion normalization:');
    console.log('Input Quaternion | Magnitude | Normalized Quaternion | Normalized Magnitude');
    console.log('------------------|-----------|----------------------|---------------------');

    const testQuaternions = [
      { w: 1, x: 0, y: 0, z: 0 },           // Identity (already normalized)
      { w: 2, x: 0, y: 0, z: 0 },           // Scaled identity
      { w: 0.9999, x: 0.0001, y: 0.00005, z: 0.00002 }, // Close to identity
      { w: 0.5, x: 0.5, y: 0.5, z: 0.5 },  // Far from normalized
      { w: 0.1, x: 0.1, y: 0.1, z: 0.1 }   // Very small
    ];

    testQuaternions.forEach((q, i) => {
      const inputMagnitude = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
      const normalized = normalizeQuaternion(q);
      const normalizedMagnitude = Math.sqrt(normalized.w * normalized.w + normalized.x * normalized.x + normalized.y * normalized.y + normalized.z * normalized.z);
      
      console.log(`(${q.w.toFixed(3)}, ${q.x.toFixed(3)}, ${q.y.toFixed(3)}, ${q.z.toFixed(3)}) | ${inputMagnitude.toFixed(6)} | (${normalized.w.toFixed(6)}, ${normalized.x.toFixed(6)}, ${normalized.y.toFixed(6)}, ${normalized.z.toFixed(6)}) | ${normalizedMagnitude.toFixed(6)}`);
    });

    console.log('\n📊 Normalization Behavior:');
    console.log('✅ All input quaternions should be normalized to magnitude ≈ 1.0');
    console.log('✅ Wind quaternion gets normalized during iteration');
    console.log('✅ Start and camera quaternions are normalized at input');
  }
}

/**
 * Main execution function
 */
function main() {
  const mathDebugger = new MathTraceDebugger();
  
  try {
    mathDebugger.testIdentityWindWithSmallAdditive();
    mathDebugger.testSmallWindWithSmallAdditive();
    mathDebugger.testSmoothPath();
    mathDebugger.testHemisphereTransitions();
    mathDebugger.testQuaternionNormalization();
    
    console.log('\n🎯 MATH TRACE COMPLETE');
    console.log('======================');
    console.log('Check the results above to verify:');
    console.log('1. Smooth quaternion evolution');
    console.log('2. Proper side transitions');
    console.log('3. Correct additive vector effects');
    console.log('4. No unexpected jumps or breaks');
    
  } catch (error) {
    console.error('❌ Math trace failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { MathTraceDebugger };
