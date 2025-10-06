#!/usr/bin/env node

/**
 * Debug Stereographic Projection Mapping
 * 
 * This script traces the stereographic projection and inverse projection
 * to understand exactly where we are in the cube and how the mapping works.
 */

const { 
  createQuaternion, 
  createVector3D,
  stereographicProjection, 
  inverseStereographicProjection,
  normalizeQuaternion,
  magnitude3D
} = require('../dist/shared/quaternion-math');

class StereographicDebugger {
  
  /**
   * Test 1: Trace quaternion to 3D mapping
   */
  testQuaternionTo3DMapping() {
    console.log('🧪 Test 1: Quaternion to 3D Mapping');
    console.log('====================================');
    
    const testQuaternions = [
      { name: 'Identity', q: createQuaternion(1, 0, 0, 0) },
      { name: 'Very Close to Identity', q: createQuaternion(0.999, 0.001, 0.001, 0.001) },
      { name: 'Close to Identity', q: createQuaternion(0.99, 0.01, 0.01, 0.01) },
      { name: 'Medium Distance', q: createQuaternion(0.9, 0.1, 0.1, 0.1) },
      { name: 'Far from Identity', q: createQuaternion(0.5, 0.5, 0.5, 0.5) },
      { name: 'Equator', q: createQuaternion(0, 0, 0, 1) },
      { name: 'Negative W', q: createQuaternion(-0.5, 0.5, 0.5, 0.5) }
    ];
    
    console.log('Quaternion | Magnitude | 3D Point (x,y,z) | 3D Magnitude | Inside Unit Sphere?');
    console.log('-----------|-----------|-------------------|--------------|---------------------');
    
    for (const test of testQuaternions) {
      const normalized = normalizeQuaternion(test.q);
      const point3D = stereographicProjection(normalized);
      const magnitude = magnitude3D(point3D);
      const insideSphere = magnitude <= 1.0 ? 'YES' : 'NO';
      
      const quatStr = `(${normalized.w.toFixed(3)},${normalized.x.toFixed(3)},${normalized.y.toFixed(3)},${normalized.z.toFixed(3)})`;
      const pointStr = `(${point3D.x.toFixed(3)},${point3D.y.toFixed(3)},${point3D.z.toFixed(3)})`;
      
      console.log(`${test.name.padStart(11)} | ${quatStr.padStart(25)} | ${pointStr.padStart(17)} | ${magnitude.toFixed(6).padStart(12)} | ${insideSphere.padStart(19)}`);
    }
  }
  
  /**
   * Test 2: Trace 3D to quaternion mapping
   */
  test3DToQuaternionMapping() {
    console.log('\n🧪 Test 2: 3D to Quaternion Mapping');
    console.log('====================================');
    
    const testPoints = [
      { name: 'Origin', point: createVector3D(0, 0, 0) },
      { name: 'Inside Sphere', point: createVector3D(0.5, 0.3, 0.2) },
      { name: 'On Sphere Surface', point: createVector3D(1, 0, 0) },
      { name: 'Outside Sphere', point: createVector3D(2, 1, 1) },
      { name: 'Far Outside', point: createVector3D(10, 5, 3) }
    ];
    
    console.log('3D Point (x,y,z) | 3D Magnitude | Quaternion w,x,y,z | Quat Magnitude | Valid?');
    console.log('------------------|--------------|-------------------|----------------|--------');
    
    for (const test of testPoints) {
      const quaternion = inverseStereographicProjection(test.point);
      const quatMagnitude = Math.sqrt(quaternion.w*quaternion.w + quaternion.x*quaternion.x + quaternion.y*quaternion.y + quaternion.z*quaternion.z);
      const isValid = Math.abs(quatMagnitude - 1.0) < 1e-6 ? 'YES' : 'NO';
      
      const pointStr = `(${test.point.x.toFixed(3)},${test.point.y.toFixed(3)},${test.point.z.toFixed(3)})`;
      const quatStr = `(${quaternion.w.toFixed(3)},${quaternion.x.toFixed(3)},${quaternion.y.toFixed(3)},${quaternion.z.toFixed(3)})`;
      
      console.log(`${pointStr.padStart(17)} | ${magnitude3D(test.point).toFixed(6).padStart(12)} | ${quatStr.padStart(19)} | ${quatMagnitude.toFixed(6).padStart(14)} | ${isValid.padStart(6)}`);
    }
  }
  
  /**
   * Test 3: Round-trip mapping (quaternion -> 3D -> quaternion)
   */
  testRoundTripMapping() {
    console.log('\n🧪 Test 3: Round-trip Mapping (Quaternion -> 3D -> Quaternion)');
    console.log('==============================================================');
    
    const testQuaternions = [
      { name: 'Identity', q: createQuaternion(1, 0, 0, 0) },
      { name: 'Close to Identity', q: createQuaternion(0.99, 0.01, 0.01, 0.01) },
      { name: 'Medium Distance', q: createQuaternion(0.8, 0.2, 0.1, 0.1) },
      { name: 'Far from Identity', q: createQuaternion(0.5, 0.5, 0.5, 0.5) }
    ];
    
    console.log('Original Quaternion | 3D Point | Reconstructed Quaternion | Match?');
    console.log('--------------------|----------|---------------------------|-------');
    
    for (const test of testQuaternions) {
      const normalized = normalizeQuaternion(test.q);
      const point3D = stereographicProjection(normalized);
      const reconstructed = inverseStereographicProjection(point3D);
      
      // Check if they match (within tolerance)
      const wDiff = Math.abs(normalized.w - reconstructed.w);
      const xDiff = Math.abs(normalized.x - reconstructed.x);
      const yDiff = Math.abs(normalized.y - reconstructed.y);
      const zDiff = Math.abs(normalized.z - reconstructed.z);
      const matches = wDiff < 1e-6 && xDiff < 1e-6 && yDiff < 1e-6 && zDiff < 1e-6;
      
      const origStr = `(${normalized.w.toFixed(3)},${normalized.x.toFixed(3)},${normalized.y.toFixed(3)},${normalized.z.toFixed(3)})`;
      const pointStr = `(${point3D.x.toFixed(3)},${point3D.y.toFixed(3)},${point3D.z.toFixed(3)})`;
      const reconStr = `(${reconstructed.w.toFixed(3)},${reconstructed.x.toFixed(3)},${reconstructed.y.toFixed(3)},${reconstructed.z.toFixed(3)})`;
      
      console.log(`${test.name.padStart(18)} | ${pointStr.padStart(8)} | ${reconStr.padStart(25)} | ${matches ? 'YES' : 'NO'}`);
    }
  }
  
  /**
   * Test 4: Find quaternions that map inside unit sphere
   */
  testFindInsideSphereQuaternions() {
    console.log('\n🧪 Test 4: Find Quaternions That Map Inside Unit Sphere');
    console.log('========================================================');
    
    console.log('Testing different w values to find what maps inside unit sphere...');
    console.log('w value | Quaternion | 3D Point | 3D Magnitude | Inside?');
    console.log('--------|------------|----------|--------------|--------');
    
    for (let w = 0.99; w <= 1.0; w += 0.001) {
      const x = Math.sqrt(1 - w*w) / Math.sqrt(3); // Equal x,y,z components
      const y = x;
      const z = x;
      
      const quaternion = createQuaternion(w, x, y, z);
      const normalized = normalizeQuaternion(quaternion);
      const point3D = stereographicProjection(normalized);
      const magnitude = magnitude3D(point3D);
      const inside = magnitude <= 1.0 ? 'YES' : 'NO';
      
      const quatStr = `(${normalized.w.toFixed(3)},${normalized.x.toFixed(3)},${normalized.y.toFixed(3)},${normalized.z.toFixed(3)})`;
      const pointStr = `(${point3D.x.toFixed(3)},${point3D.y.toFixed(3)},${point3D.z.toFixed(3)})`;
      
      if (magnitude <= 1.0) {
        console.log(`${w.toFixed(3).padStart(7)} | ${quatStr.padStart(10)} | ${pointStr.padStart(8)} | ${magnitude.toFixed(6).padStart(12)} | ${inside.padStart(6)}`);
      }
    }
  }
  
  /**
   * Test 5: Cube boundary analysis
   */
  testCubeBoundaryAnalysis() {
    console.log('\n🧪 Test 5: Cube Boundary Analysis');
    console.log('==================================');
    
    console.log('Testing what happens at cube boundaries...');
    console.log('Cube Point | 3D Magnitude | Inside Sphere? | Quaternion | Valid?');
    console.log('-----------|---------------|----------------|------------|--------');
    
    const cubePoints = [
      { name: 'Center', point: createVector3D(0, 0, 0) },
      { name: 'Face Center', point: createVector3D(1, 0, 0) },
      { name: 'Edge Center', point: createVector3D(1, 1, 0) },
      { name: 'Corner', point: createVector3D(1, 1, 1) },
      { name: 'Inside', point: createVector3D(0.5, 0.5, 0.5) }
    ];
    
    for (const test of cubePoints) {
      const magnitude = magnitude3D(test.point);
      const insideSphere = magnitude <= 1.0 ? 'YES' : 'NO';
      const quaternion = inverseStereographicProjection(test.point);
      const quatMagnitude = Math.sqrt(quaternion.w*quaternion.w + quaternion.x*quaternion.x + quaternion.y*quaternion.y + quaternion.z*quaternion.z);
      const valid = Math.abs(quatMagnitude - 1.0) < 1e-6 ? 'YES' : 'NO';
      
      const pointStr = `(${test.point.x.toFixed(1)},${test.point.y.toFixed(1)},${test.point.z.toFixed(1)})`;
      const quatStr = `(${quaternion.w.toFixed(3)},${quaternion.x.toFixed(3)},${quaternion.y.toFixed(3)},${quaternion.z.toFixed(3)})`;
      
      console.log(`${test.name.padStart(10)} | ${pointStr.padStart(11)} | ${magnitude.toFixed(6).padStart(13)} | ${insideSphere.padStart(14)} | ${quatStr.padStart(10)} | ${valid.padStart(6)}`);
    }
  }
  
  /**
   * Run all tests
   */
  runAllTests() {
    console.log('🔍 STEREOGRAPHIC PROJECTION DEBUGGING');
    console.log('=====================================\n');
    
    this.testQuaternionTo3DMapping();
    this.test3DToQuaternionMapping();
    this.testRoundTripMapping();
    this.testFindInsideSphereQuaternions();
    this.testCubeBoundaryAnalysis();
    
    console.log('\n🎯 DEBUGGING COMPLETE');
    console.log('=====================');
    console.log('Key insights:');
    console.log('1. Stereographic projection maps quaternion sphere to infinite 3D plane');
    console.log('2. Only quaternions very close to (1,0,0,0) map to points near origin');
    console.log('3. Most quaternions map to points far from origin (outside unit sphere)');
    console.log('4. The unit sphere in 3D corresponds to a small region around (1,0,0,0) in quaternion space');
  }
}

// Run the debugger
const stereographicDebugger = new StereographicDebugger();
stereographicDebugger.runAllTests();
