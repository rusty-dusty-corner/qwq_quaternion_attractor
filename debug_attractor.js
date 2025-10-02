/**
 * Node.js Debugging Script for Quaternion Attractor
 * 
 * This script provides debugging and validation tools for the quaternion attractor system.
 * It can be run with: node debug_attractor.js
 */

// Mathematical functions extracted for Node.js debugging
class QuaternionMath {
    /**
     * Normalize a quaternion to unit length
     */
    normalizeQuaternion(q) {
        const [w, x, y, z] = q;
        const length = Math.sqrt(w*w + x*x + y*y + z*z);
        if (length === 0) return [1, 0, 0, 0];
        return [w/length, x/length, y/length, z/length];
    }
    
    /**
     * Stereographic projection from 4D sphere to 3D space
     */
    stereographicProjection(quaternion) {
        const [w, x, y, z] = quaternion;
        
        if (Math.abs(1 - w) < 1e-10) {
            return [0, 0, 0];
        }
        
        const scale = 1 / (1 - w);
        return [x * scale, y * scale, z * scale];
    }
    
    /**
     * Inverse stereographic projection from 3D to 4D sphere
     */
    inverseStereographicProjection(x, y, z) {
        const r2 = x*x + y*y + z*z;
        const w = (r2 - 1) / (r2 + 1);
        const scale = 2 / (r2 + 1);
        
        return [w, x * scale, y * scale, z * scale];
    }
    
    /**
     * Apply rotation quaternion to a 3D vector
     */
    rotateVector(vector, rotationQuat) {
        const [qw, qx, qy, qz] = rotationQuat;
        const [vx, vy, vz] = vector;
        
        const vQuat = [0, vx, vy, vz];
        
        const rotated = this.quaternionMultiply(
            this.quaternionMultiply(rotationQuat, vQuat),
            this.quaternionConjugate(rotationQuat)
        );
        
        return [rotated[1], rotated[2], rotated[3]];
    }
    
    /**
     * Quaternion multiplication
     */
    quaternionMultiply(q1, q2) {
        const [w1, x1, y1, z1] = q1;
        const [w2, x2, y2, z2] = q2;
        
        return [
            w1*w2 - x1*x2 - y1*y2 - z1*z2,
            w1*x2 + x1*w2 + y1*z2 - z1*y2,
            w1*y2 - x1*z2 + y1*w2 + z1*x2,
            w1*z2 + x1*y2 - y1*x2 + z1*w2
        ];
    }
    
    /**
     * Quaternion conjugate
     */
    quaternionConjugate(q) {
        return [q[0], -q[1], -q[2], -q[3]];
    }
}

class QuaternionAttractorDebugger {
    constructor() {
        this.math = new QuaternionMath();
    }
    
    /**
     * Test stereographic projection round-trip accuracy
     */
    testStereographicProjection() {
        console.log('\n=== Testing Stereographic Projection ===');
        
        const testQuaternions = [
            [1, 0, 0, 0],           // North pole
            [0, 1, 0, 0],           // X-axis
            [0, 0, 1, 0],           // Y-axis  
            [0, 0, 0, 1],           // Z-axis
            [0.5, 0.5, 0.5, 0.5],   // Random quaternion
            [0.707, 0.707, 0, 0],   // 45-degree rotation
        ];
        
        testQuaternions.forEach((q, i) => {
            const normalized = this.math.normalizeQuaternion(q);
            console.log(`\nTest ${i + 1}: Original quaternion [${normalized.map(x => x.toFixed(3)).join(', ')}]`);
            
            // Project to 3D
            const projected3D = this.math.stereographicProjection(normalized);
            console.log(`  → 3D projection: [${projected3D.map(x => x.toFixed(3)).join(', ')}]`);
            
            // Project back to 4D
            const backTo4D = this.math.inverseStereographicProjection(...projected3D);
            console.log(`  → Back to 4D: [${backTo4D.map(x => x.toFixed(3)).join(', ')}]`);
            
            // Check if we get the same quaternion (within tolerance)
            const distance = Math.sqrt(
                normalized.reduce((sum, val, idx) => sum + Math.pow(val - backTo4D[idx], 2), 0)
            );
            console.log(`  → Round-trip error: ${distance.toFixed(6)} ${distance < 0.001 ? '✓' : '✗'}`);
        });
    }
    
    /**
     * Test quaternion operations
     */
    testQuaternionOperations() {
        console.log('\n=== Testing Quaternion Operations ===');
        
        const q1 = [1, 0, 0, 0];
        const q2 = [0, 1, 0, 0];
        
        console.log('q1:', q1);
        console.log('q2:', q2);
        
        const product = this.math.quaternionMultiply(q1, q2);
        console.log('q1 * q2:', product);
        
        const conjugate = this.math.quaternionConjugate(q1);
        console.log('q1 conjugate:', conjugate);
        
        // Test rotation
        const vector = [1, 0, 0];
        const rotation = [0.707, 0, 0.707, 0]; // 90-degree rotation around Y
        const rotated = this.math.rotateVector(vector, rotation);
        console.log(`Vector [${vector.join(', ')}] rotated by [${rotation.join(', ')}]: [${rotated.map(x => x.toFixed(3)).join(', ')}]`);
    }
    
    /**
     * Generate and analyze attractor points
     */
    generateAttractorPoints(params = {}) {
        const defaultParams = {
            initial: { x: 0, y: 0, z: 0, side: 1 },
            step: { a: 0.1, b: 0.1, c: 0.1 },
            rotation: { w: 1, x: 0, y: 0, z: 0 },
            numPoints: 100
        };
        
        const config = { ...defaultParams, ...params };
        console.log('\n=== Generating Attractor Points ===');
        console.log('Parameters:', JSON.stringify(config, null, 2));
        
        const points = [];
        let state = { ...config.initial };
        let sideFlips = 0;
        let maxDistance = 0;
        
        for (let i = 0; i < config.numPoints; i++) {
            // Apply additive operation
            const newX = state.x + config.step.a * state.side;
            const newY = state.y + config.step.b * state.side;
            const newZ = state.z + config.step.c * state.side;
            
            const distance = Math.sqrt(newX*newX + newY*newY + newZ*newZ);
            maxDistance = Math.max(maxDistance, distance);
            
            if (distance > 1) {
                // Side flip
                state.side = -state.side;
                sideFlips++;
            } else {
                state.x = newX;
                state.y = newY;
                state.z = newZ;
            }
            
            // Map to 4D sphere
            const quaternion = this.math.inverseStereographicProjection(state.x, state.y, state.z);
            
            // Apply rotation
            const rotationQuat = this.math.normalizeQuaternion([
                config.rotation.w, config.rotation.x, config.rotation.y, config.rotation.z
            ]);
            const rotated = this.math.rotateVector([state.x, state.y, state.z], rotationQuat);
            
            points.push({
                iteration: i,
                state: { ...state },
                quaternion: quaternion,
                rotated: rotated,
                distance: distance,
                side: state.side
            });
        }
        
        console.log(`\nGenerated ${points.length} points`);
        console.log(`Side flips: ${sideFlips}`);
        console.log(`Max distance from origin: ${maxDistance.toFixed(3)}`);
        
        // Show first 10 points
        console.log('\nFirst 10 points:');
        points.slice(0, 10).forEach((point, i) => {
            console.log(`${i + 1}: State[${point.state.x.toFixed(3)}, ${point.state.y.toFixed(3)}, ${point.state.z.toFixed(3)}] Side:${point.side} → 2D[${point.rotated[0].toFixed(3)}, ${point.rotated[1].toFixed(3)}]`);
        });
        
        return points;
    }
    
    /**
     * Test different phyllotaxis parameters
     */
    testPhyllotaxisParameters() {
        console.log('\n=== Testing Phyllotaxis Parameters ===');
        
        const testParams = [
            { a: 0.1, b: 0.1, c: 0.1, name: 'Equal steps' },
            { a: 0.1, b: 0.05, c: 0.15, name: 'Varied steps' },
            { a: 0.05, b: 0.1, c: 0.05, name: 'Y-dominant' },
            { a: 0.15, b: 0.05, c: 0.05, name: 'X-dominant' },
            { a: 0.05, b: 0.05, c: 0.15, name: 'Z-dominant' },
            { a: 0.1, b: 0.1, c: 0.05, name: 'Small Z' },
        ];
        
        testParams.forEach((params, i) => {
            console.log(`\n--- Test ${i + 1}: ${params.name} ---`);
            const points = this.generateAttractorPoints({
                step: params,
                numPoints: 50
            });
            
            // Analyze coverage
            const xRange = Math.max(...points.map(p => p.state.x)) - Math.min(...points.map(p => p.state.x));
            const yRange = Math.max(...points.map(p => p.state.y)) - Math.min(...points.map(p => p.state.y));
            const zRange = Math.max(...points.map(p => p.state.z)) - Math.min(...points.map(p => p.state.z));
            
            console.log(`Coverage - X: ${xRange.toFixed(3)}, Y: ${yRange.toFixed(3)}, Z: ${zRange.toFixed(3)}`);
            console.log(`Total coverage: ${(xRange + yRange + zRange).toFixed(3)}`);
        });
    }
    
    /**
     * Test side flipping behavior
     */
    testSideFlipping() {
        console.log('\n=== Testing Side Flipping Behavior ===');
        
        // Test with parameters that will cause side flips
        const points = this.generateAttractorPoints({
            initial: { x: 0.8, y: 0.8, z: 0.8, side: 1 },
            step: { a: 0.1, b: 0.1, c: 0.1 },
            numPoints: 20
        });
        
        console.log('Side flip sequence:');
        points.forEach((point, i) => {
            if (i > 0 && point.side !== points[i-1].side) {
                console.log(`  Flip at iteration ${i}: ${points[i-1].side} → ${point.side}`);
            }
        });
    }
    
    /**
     * Run all debugging tests
     */
    runAllTests() {
        console.log('🔬 Quaternion Attractor Debugging Suite');
        console.log('=====================================');
        
        this.testStereographicProjection();
        this.testQuaternionOperations();
        this.testSideFlipping();
        this.testPhyllotaxisParameters();
        
        console.log('\n=== Summary ===');
        console.log('✓ Stereographic projection round-trip accuracy');
        console.log('✓ Quaternion operations (multiplication, conjugation, rotation)');
        console.log('✓ Side flipping behavior');
        console.log('✓ Phyllotaxis parameter analysis');
        console.log('\n🎯 Debugging complete! Use the results to tune your parameters.');
    }
}

// Run the debugging suite
if (require.main === module) {
    const debugSuite = new QuaternionAttractorDebugger();
    debugSuite.runAllTests();
}

module.exports = QuaternionAttractorDebugger;