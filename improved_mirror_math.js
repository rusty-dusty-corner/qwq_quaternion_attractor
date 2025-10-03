/**
 * Improved Mirror Math for Quaternion Attractor
 * 
 * This implements proper sphere reflection mathematics:
 * - Point A: Inside sphere (current position)
 * - Point B: Outside sphere (new position after step)
 * - Point C: On sphere (intersection point)
 * - Point D: Mirrored point (reflection of B across the sphere)
 */

class ImprovedMirrorMath {
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
     * FIXED: Proper handling of north pole singularity
     */
    stereographicProjection(quaternion) {
        const [w, x, y, z] = quaternion;
        
        // Handle north pole singularity properly
        if (Math.abs(1 - w) < 1e-10) {
            return [0, 0, 0]; // North pole projects to origin
        }
        
        const scale = 1 / (1 - w);
        return [x * scale, y * scale, z * scale];
    }
    
    /**
     * Inverse stereographic projection from 3D to 4D sphere
     * FIXED: Handle the north pole case properly
     */
    inverseStereographicProjection(x, y, z) {
        const r2 = x*x + y*y + z*z;
        
        // Handle the case where we're projecting back to north pole
        if (r2 < 1e-10) {
            return [1, 0, 0, 0]; // Return north pole
        }
        
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
    
    /**
     * IMPROVED MIRROR MATH: Proper sphere reflection
     * 
     * Given:
     * - Point A (inside sphere): current position
     * - Point B (outside sphere): new position after step
     * - Point C (on sphere): intersection point
     * - Point D (mirrored): reflection of B across the sphere
     * 
     * The reflection formula is: D = C + (C - B) = 2*C - B
     * This ensures D is the same distance from C as B, but on the opposite side
     */
    applyMirrorReflection(currentPos, stepVector, side) {
        const [currentX, currentY, currentZ] = currentPos;
        const [stepX, stepY, stepZ] = stepVector;
        
        // Calculate new position after step
        const newX = currentX + stepX * side;
        const newY = currentY + stepY * side;
        const newZ = currentZ + stepZ * side;
        
        // Check if new position is outside unit ball
        const newDistance = Math.sqrt(newX*newX + newY*newY + newZ*newZ);
        
        if (newDistance > 1) {
            // Find intersection point C on unit sphere
            // Solve: ||current + t*step|| = 1
            // This gives us: (currentX + t*stepX)² + (currentY + t*stepY)² + (currentZ + t*stepZ)² = 1
            
            const a = stepX*stepX + stepY*stepY + stepZ*stepZ;
            const b = 2 * (currentX*stepX + currentY*stepY + currentZ*stepZ);
            const c = currentX*currentX + currentY*currentY + currentZ*currentZ - 1;
            
            const discriminant = b*b - 4*a*c;
            
            if (discriminant >= 0) {
                const t1 = (-b + Math.sqrt(discriminant)) / (2*a);
                const t2 = (-b - Math.sqrt(discriminant)) / (2*a);
                
                // Choose the t that gives us the intersection point (0 < t < 1)
                const t = Math.max(0, Math.min(1, Math.min(t1, t2)));
                
                // Point C: Intersection point on unit sphere
                const intersectionX = currentX + t * stepX * side;
                const intersectionY = currentY + t * stepY * side;
                const intersectionZ = currentZ + t * stepZ * side;
                
                // Point B: The position that would have been outside
                const outsideX = newX;
                const outsideY = newY;
                const outsideZ = newZ;
                
                // Point D: Mirrored point using proper reflection formula
                // D = 2*C - B (reflection of B across the sphere at point C)
                const mirroredX = 2 * intersectionX - outsideX;
                const mirroredY = 2 * intersectionY - outsideY;
                const mirroredZ = 2 * intersectionZ - outsideZ;
                
                // Flip side and return mirrored position
                return {
                    position: [mirroredX, mirroredY, mirroredZ],
                    side: -side,
                    intersection: [intersectionX, intersectionY, intersectionZ],
                    reflected: true
                };
            } else {
                // Fallback: just flip side and stay at current position
                return {
                    position: [currentX, currentY, currentZ],
                    side: -side,
                    intersection: null,
                    reflected: false
                };
            }
        } else {
            // No mirror needed, update position normally
            return {
                position: [newX, newY, newZ],
                side: side,
                intersection: null,
                reflected: false
            };
        }
    }
    
    /**
     * Generate attractor points with improved mirror math
     */
    generateAttractorPoints(params = {}) {
        const defaultParams = {
            initial: { x: 0, y: 0, z: 0, side: 1 },
            step: { a: 0.1, b: 0.1, c: 0.1 },
            rotation: { w: 1, x: 0, y: 0, z: 0 },
            numPoints: 100
        };
        
        const config = { ...defaultParams, ...params };
        console.log('\n=== Generating Attractor Points with Improved Mirror Math ===');
        console.log('Parameters:', JSON.stringify(config, null, 2));
        
        const points = [];
        let state = { ...config.initial };
        let sideFlips = 0;
        let reflections = 0;
        let maxDistance = 0;
        
        for (let i = 0; i < config.numPoints; i++) {
            // Current position
            const currentPos = [state.x, state.y, state.z];
            const stepVector = [config.step.a, config.step.b, config.step.c];
            
            // Apply improved mirror math
            const result = this.applyMirrorReflection(currentPos, stepVector, state.side);
            
            // Update state
            state.x = result.position[0];
            state.y = result.position[1];
            state.z = result.position[2];
            state.side = result.side;
            
            if (result.side !== config.initial.side && i > 0) {
                sideFlips++;
            }
            
            if (result.reflected) {
                reflections++;
            }
            
            const distance = Math.sqrt(state.x*state.x + state.y*state.y + state.z*state.z);
            maxDistance = Math.max(maxDistance, distance);
            
            // Map to 4D sphere
            const quaternion = this.inverseStereographicProjection(state.x, state.y, state.z);
            
            // Apply rotation
            const rotationQuat = this.normalizeQuaternion([
                config.rotation.w, config.rotation.x, config.rotation.y, config.rotation.z
            ]);
            const rotated = this.rotateVector([state.x, state.y, state.z], rotationQuat);
            
            points.push({
                iteration: i,
                state: { ...state },
                quaternion: quaternion,
                rotated: rotated,
                distance: distance,
                side: state.side,
                reflected: result.reflected,
                intersection: result.intersection
            });
        }
        
        console.log(`\nGenerated ${points.length} points`);
        console.log(`Side flips: ${sideFlips}`);
        console.log(`Reflections: ${reflections}`);
        console.log(`Max distance from origin: ${maxDistance.toFixed(3)}`);
        
        // Show first 10 points
        console.log('\nFirst 10 points:');
        points.slice(0, 10).forEach((point, i) => {
            const reflectionFlag = point.reflected ? ' (REFLECTED)' : '';
            console.log(`${i + 1}: State[${point.state.x.toFixed(3)}, ${point.state.y.toFixed(3)}, ${point.state.z.toFixed(3)}] Side:${point.side} → 2D[${point.rotated[0].toFixed(3)}, ${point.rotated[1].toFixed(3)}]${reflectionFlag}`);
        });
        
        return points;
    }
    
    /**
     * Test the improved mirror math with various scenarios
     */
    testMirrorMath() {
        console.log('\n=== Testing Improved Mirror Math ===');
        
        // Test 1: Simple case - point near boundary
        console.log('\n1. Testing point near boundary:');
        const result1 = this.applyMirrorReflection([0.8, 0.8, 0.8], [0.1, 0.1, 0.1], 1);
        console.log(`Input: [0.8, 0.8, 0.8] + [0.1, 0.1, 0.1] * 1`);
        console.log(`Result: [${result1.position.map(x => x.toFixed(3)).join(', ')}] side:${result1.side} reflected:${result1.reflected}`);
        
        // Test 2: Point that should reflect
        console.log('\n2. Testing point that should reflect:');
        const result2 = this.applyMirrorReflection([0.9, 0.9, 0.9], [0.2, 0.2, 0.2], 1);
        console.log(`Input: [0.9, 0.9, 0.9] + [0.2, 0.2, 0.2] * 1`);
        console.log(`Result: [${result2.position.map(x => x.toFixed(3)).join(', ')}] side:${result2.side} reflected:${result2.reflected}`);
        
        // Test 3: Point that should not reflect
        console.log('\n3. Testing point that should not reflect:');
        const result3 = this.applyMirrorReflection([0.3, 0.3, 0.3], [0.1, 0.1, 0.1], 1);
        console.log(`Input: [0.3, 0.3, 0.3] + [0.1, 0.1, 0.1] * 1`);
        console.log(`Result: [${result3.position.map(x => x.toFixed(3)).join(', ')}] side:${result3.side} reflected:${result3.reflected}`);
    }
}

// Test the improved mirror math
if (require.main === module) {
    const mirrorMath = new ImprovedMirrorMath();
    
    // Test stereographic projection
    console.log('=== Testing Stereographic Projection ===');
    const testQuat = [1, 0, 0, 0];
    const projected = mirrorMath.stereographicProjection(testQuat);
    const backTo4D = mirrorMath.inverseStereographicProjection(...projected);
    console.log(`North pole: [${testQuat.join(', ')}] → [${projected.join(', ')}] → [${backTo4D.map(x => x.toFixed(3)).join(', ')}]`);
    
    // Test mirror math
    mirrorMath.testMirrorMath();
    
    // Test attractor generation
    mirrorMath.generateAttractorPoints({
        initial: { x: 0.8, y: 0.8, z: 0.8, side: 1 },
        step: { a: 0.1, b: 0.1, c: 0.1 },
        numPoints: 20
    });
}

module.exports = ImprovedMirrorMath;
