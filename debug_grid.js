/**
 * Debug script to test the phyllotaxis grid generation
 * Run with: node debug_grid.js
 */

// Golden ratio
const phi = (1 + Math.sqrt(5)) / 2;

// Mathematical functions
function normalizeQuaternion(q) {
    const [w, x, y, z] = q;
    const length = Math.sqrt(w*w + x*x + y*y + z*z);
    if (length === 0) return [1, 0, 0, 0];
    return [w/length, x/length, y/length, z/length];
}

function stereographicProjection(quaternion) {
    const [w, x, y, z] = quaternion;
    if (Math.abs(1 - w) < 1e-10) {
        return [0, 0, 0];
    }
    const scale = 1 / (1 - w);
    return [x * scale, y * scale, z * scale];
}

function inverseStereographicProjection(x, y, z) {
    const r2 = x*x + y*y + z*z;
    if (r2 < 1e-10) {
        return [1, 0, 0, 0];
    }
    const w = (r2 - 1) / (r2 + 1);
    const scale = 2 / (r2 + 1);
    return [w, x * scale, y * scale, z * scale];
}

function rotateVector(vector, rotationQuat) {
    const [qw, qx, qy, qz] = rotationQuat;
    const [vx, vy, vz] = vector;
    
    const vQuat = [0, vx, vy, vz];
    
    const rotated = quaternionMultiply(
        quaternionMultiply(rotationQuat, vQuat),
        quaternionConjugate(rotationQuat)
    );
    
    return [rotated[1], rotated[2], rotated[3]];
}

function quaternionMultiply(q1, q2) {
    const [w1, x1, y1, z1] = q1;
    const [w2, x2, y2, z2] = q2;
    
    return [
        w1*w2 - x1*x2 - y1*y2 - z1*z2,
        w1*x2 + x1*w2 + y1*z2 - z1*y2,
        w1*y2 - x1*z2 + y1*w2 + z1*x2,
        w1*z2 + x1*y2 - y1*x2 + z1*w2
    ];
}

function quaternionConjugate(q) {
    return [q[0], -q[1], -q[2], -q[3]];
}

// Test the phyllotaxis algorithm
function testPhyllotaxisAlgorithm() {
    console.log('🌻 Testing Phyllotaxis Algorithm');
    console.log('================================');
    
    // Parameters - using proper phyllotaxis values with randomness
    const params = {
        initial: { x: 0, y: 0, z: 0, side: 1 },
        step: { 
            a: 1/phi, 
            b: 1/(phi*phi), 
            c: 1/(phi*phi*phi) 
        },
        rotation: { w: 1, x: 0, y: 0, z: 0 },
        numPoints: 100
    };
    
    console.log('Parameters:');
    console.log(`  Initial: [${params.initial.x}, ${params.initial.y}, ${params.initial.z}] side:${params.initial.side}`);
    console.log(`  Step: [${params.step.a.toFixed(3)}, ${params.step.b.toFixed(3)}, ${params.step.c.toFixed(3)}]`);
    console.log(`  Points: ${params.numPoints}`);
    
    const points = [];
    let state = { ...params.initial };
    let sideFlips = 0;
    let uniquePositions = new Set();
    
    console.log('\nGenerating points:');
    
    for (let i = 0; i < params.numPoints; i++) {
        // Current position
        const currentX = state.x;
        const currentY = state.y;
        const currentZ = state.z;
        
        // Calculate step vector
        const stepX = params.step.a * state.side;
        const stepY = params.step.b * state.side;
        const stepZ = params.step.c * state.side;
        
        // New position after step
        const newX = currentX + stepX;
        const newY = currentY + stepY;
        const newZ = currentZ + stepZ;
        
        // Check if new position is outside unit ball
        const newDistance = Math.sqrt(newX*newX + newY*newY + newZ*newZ);
        
        if (newDistance > 1) {
            // Find intersection point on unit sphere
            const a = stepX*stepX + stepY*stepY + stepZ*stepZ;
            const b = 2 * (currentX*stepX + currentY*stepY + currentZ*stepZ);
            const c = currentX*currentX + currentY*currentY + currentZ*currentZ - 1;
            
            const discriminant = b*b - 4*a*c;
            
            if (discriminant >= 0) {
                const t1 = (-b + Math.sqrt(discriminant)) / (2*a);
                const t2 = (-b - Math.sqrt(discriminant)) / (2*a);
                
                const t = Math.max(0, Math.min(1, Math.min(t1, t2)));
                
                // Intersection point on unit sphere
                const intersectionX = currentX + t * stepX;
                const intersectionY = currentY + t * stepY;
                const intersectionZ = currentZ + t * stepZ;
                
                // Continue from intersection point in opposite direction
                const remainingStepX = (1 - t) * stepX;
                const remainingStepY = (1 - t) * stepY;
                const remainingStepZ = (1 - t) * stepZ;
                
                // Flip side and continue from intersection point
                state.side = -state.side;
                state.x = intersectionX - remainingStepX * state.side;
                state.y = intersectionY - remainingStepY * state.side;
                state.z = intersectionZ - remainingStepZ * state.side;
                
                sideFlips++;
            } else {
                // Fallback: just flip side and stay at current position
                state.side = -state.side;
            }
        } else {
            // Update position normally
            state.x = newX;
            state.y = newY;
            state.z = newZ;
        }
        
        // Track unique positions
        const posKey = `${state.x.toFixed(2)},${state.y.toFixed(2)},${state.z.toFixed(2)}`;
        uniquePositions.add(posKey);
        
        // Store point
        points.push({
            iteration: i,
            x: state.x,
            y: state.y,
            z: state.z,
            side: state.side,
            distance: Math.sqrt(state.x*state.x + state.y*state.y + state.z*state.z),
            sideFlipped: newDistance > 1
        });
        
        // Log first 10 points
        if (i < 10) {
            console.log(`  ${i}: [${state.x.toFixed(3)}, ${state.y.toFixed(3)}, ${state.z.toFixed(3)}] side:${state.side} dist:${Math.sqrt(state.x*state.x + state.y*state.y + state.z*state.z).toFixed(3)} ${newDistance > 1 ? 'FLIP' : ''}`);
        }
    }
    
    console.log('\nResults:');
    console.log(`  Total points: ${points.length}`);
    console.log(`  Side flips: ${sideFlips}`);
    console.log(`  Unique positions: ${uniquePositions.size}`);
    
    // Check if we're getting movement
    const xRange = Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x));
    const yRange = Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y));
    const zRange = Math.max(...points.map(p => p.z)) - Math.min(...points.map(p => p.z));
    
    console.log(`  X range: ${xRange.toFixed(3)}`);
    console.log(`  Y range: ${yRange.toFixed(3)}`);
    console.log(`  Z range: ${zRange.toFixed(3)}`);
    
    if (xRange < 0.01 && yRange < 0.01 && zRange < 0.01) {
        console.log('  ❌ PROBLEM: Points are not moving!');
    } else {
        console.log('  ✅ Points are moving properly');
    }
    
    // Show last 5 points
    console.log('\nLast 5 points:');
    points.slice(-5).forEach((point, i) => {
        const idx = points.length - 5 + i;
        console.log(`  ${idx}: [${point.x.toFixed(3)}, ${point.y.toFixed(3)}, ${point.z.toFixed(3)}] side:${point.side}`);
    });
}

// Run the test
testPhyllotaxisAlgorithm();
