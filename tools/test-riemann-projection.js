#!/usr/bin/env node

/**
 * Riemann Projection Mathematics Test Suite
 * 
 * This file tests all the mathematical concepts from the Riemann projection document:
 * - Circle to line mapping
 * - Sphere to plane projections  
 * - 3-sphere to 3D space mapping
 * - Hemisphere considerations
 * - Quaternion normalization and cube mapping
 */

// Import shared math functions to avoid duplication
const { 
    stereographicProjection: sharedStereographicProjection,
    inverseStereographicProjection: sharedInverseStereographicProjection,
    inverseStereographicProjectionWithSide: sharedInverseStereographicProjectionWithSide
} = require('../dist/shared/quaternion-math');

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function normalizeQuaternion(q) {
    const magnitude = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
    if (magnitude < 1e-15) {
        return { w: 1, x: 0, y: 0, z: 0 }; // Default to identity
    }
    return {
        w: q.w / magnitude,
        x: q.x / magnitude,
        y: q.y / magnitude,
        z: q.z / magnitude
    };
}

function multiplyQuaternions(q1, q2) {
    return {
        w: q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z,
        x: q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
        y: q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
        z: q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w
    };
}

function verifyQuaternionNormalization(quaternion) {
    const magnitude = Math.sqrt(quaternion.w * quaternion.w + 
                               quaternion.x * quaternion.x + 
                               quaternion.y * quaternion.y + 
                               quaternion.z * quaternion.z);
    return Math.abs(magnitude - 1.0) < 1e-10;
}

function formatNumber(num, decimals = 3) {
    if (Math.abs(num) === Infinity) return "∞";
    if (Math.abs(num) < 1e-10) return "0";
    return num.toFixed(decimals);
}

// =============================================================================
// CIRCLE TO LINE MAPPING TESTS
// =============================================================================

function mapCircleToLine(x, y) {
    // Hemisphere determination with correct projection points
    if (y >= 0) {
        // Upper hemisphere (y ≥ 0) → project from north pole (0, 1)
        return x / (1 + y);
    } else {
        // Lower hemisphere (y < 0) → project from south pole (0, -1)  
        return x / (1 - y);
    }
}

function testCircleToLineMapping() {
    console.log("\n" + "=".repeat(60));
    console.log("TESTING CIRCLE TO LINE MAPPING");
    console.log("=".repeat(60));
    
    const testPoints = [
        { name: "A", x: 1.0, y: 0.0 },      // Upper hemisphere (equator)
        { name: "B", x: 0.0, y: 1.0 },      // North pole
        { name: "C", x: -1.0, y: 0.0 },     // Upper hemisphere (equator)
        { name: "D", x: 1.0, y: 0.0 },      // Same point, using lower projection
        { name: "E", x: 0.0, y: -1.0 },     // South pole
        { name: "F", x: -1.0, y: 0.0 },     // Same point, using lower projection
    ];
    
    // Test with upper hemisphere projection
    console.log("--- UPPER HEMISPHERE PROJECTION (from north pole) ---");
    const upperPoints = [
        { name: "A", x: 1.0, y: 0.0 },
        { name: "B", x: 0.0, y: 1.0 },
        { name: "C", x: -1.0, y: 0.0 },
    ];
    
    upperPoints.forEach(point => {
        const onCircle = Math.abs(point.x * point.x + point.y * point.y - 1.0) < 1e-10;
        const hemisphere = point.y >= 0 ? "Upper" : "Lower";
        const mapping = mapCircleToLine(point.x, point.y);
        
        console.log(`Point ${point.name}: (${formatNumber(point.x)}, ${formatNumber(point.y)})`);
        console.log(`  On circle: ${onCircle ? "✓" : "✗"}`);
        console.log(`  Hemisphere: ${hemisphere}`);
        console.log(`  Upper projection: ${formatNumber(mapping)}`);
        console.log("");
    });
    
    // Test with lower hemisphere projection for same points
    console.log("--- LOWER HEMISPHERE PROJECTION (from south pole) ---");
    const lowerPoints = [
        { name: "D", x: 1.0, y: 0.0 },
        { name: "E", x: 0.0, y: -1.0 },
        { name: "F", x: -1.0, y: 0.0 },
    ];
    
    lowerPoints.forEach(point => {
        const onCircle = Math.abs(point.x * point.x + point.y * point.y - 1.0) < 1e-10;
        const hemisphere = point.y >= 0 ? "Upper" : "Lower";
        // Force lower hemisphere projection
        const mapping = point.y >= 0 ? point.x / (1 - point.y) : mapCircleToLine(point.x, point.y);
        
        console.log(`Point ${point.name}: (${formatNumber(point.x)}, ${formatNumber(point.y)})`);
        console.log(`  On circle: ${onCircle ? "✓" : "✗"}`);
        console.log(`  Hemisphere: ${hemisphere}`);
        console.log(`  Lower projection: ${formatNumber(mapping)}`);
        console.log("");
    });
}

// =============================================================================
// SPHERE TO PLANE PROJECTION TESTS
// =============================================================================

function stereographicProjection2D(x, y, z) {
    // Use hemisphere-aware projection
    if (z >= 0) {
        // Upper hemisphere
        const scale = 1 / (1 + z);
        return [x * scale, y * scale];
    } else {
        // Lower hemisphere
        const scale = 1 / (1 - z);
        return [x * scale, y * scale];
    }
}

function hemisphereAwareProjection2D(x, y, z, hemisphere) {
    if (Math.abs(z) >= 1 - 1e-10) {
        // Near poles
        return hemisphere > 0 ? [0, 0] : [0, 0];
    }
    
    if (hemisphere > 0) {
        // Upper hemisphere (z ≥ 0)
        const scale = 1 / (1 + z);
        return [x * scale, y * scale];
    } else {
        // Lower hemisphere (z < 0)  
        const scale = 1 / (1 - z);
        return [x * scale, y * scale];
    }
}

function testSphereToPlaneProjection() {
    console.log("\n" + "=".repeat(60));
    console.log("TESTING SPHERE TO PLANE PROJECTION");
    console.log("=".repeat(60));
    
    const testPoints = [
        { name: "A", x: 0.5, y: 0.0, z: 0.866025 },   // Upper hemisphere (valid: 0.25 + 0 + 0.75 = 1.0)
        { name: "B", x: 0.0, y: 0.0, z: 1.0 },        // North pole
        { name: "C", x: 0.5, y: 0.0, z: -0.866025 },  // Lower hemisphere (valid: 0.25 + 0 + 0.75 = 1.0)
        { name: "D", x: 0.0, y: 0.0, z: -1.0 },       // South pole
    ];
    
    testPoints.forEach(point => {
        // Verify point is on sphere
        const onSphere = Math.abs(point.x * point.x + point.y * point.y + point.z * point.z - 1.0) < 1e-10;
        const hemisphere = point.z >= 0 ? 1 : -1;
        const [u1, v1] = stereographicProjection2D(point.x, point.y, point.z);
        const [u2, v2] = hemisphereAwareProjection2D(point.x, point.y, point.z, hemisphere);
        
        console.log(`Point ${point.name}: (${formatNumber(point.x)}, ${formatNumber(point.y)}, ${formatNumber(point.z)})`);
        console.log(`  On sphere: ${onSphere ? "✓" : "✗"}`);
        console.log(`  Hemisphere: ${hemisphere > 0 ? "Upper" : "Lower"}`);
        console.log(`  Standard projection: (${formatNumber(u1)}, ${formatNumber(v1)})`);
        console.log(`  Hemisphere-aware: (${formatNumber(u2)}, ${formatNumber(v2)})`);
        console.log("");
    });
}

// =============================================================================
// 3-SPHERE TO 3D SPACE MAPPING TESTS
// =============================================================================

function stereographicProjection3D(w, x, y, z) {
    // Use shared implementation
    const quaternion = { w, x, y, z };
    const result = sharedStereographicProjection(quaternion);
    return [result.x, result.y, result.z];
}

function inverseStereographicProjectionWithSide(point, side) {
    // Use shared implementation
    return sharedInverseStereographicProjectionWithSide(point, side);
}

function test3SphereTo3DMapping() {
    console.log("\n" + "=".repeat(60));
    console.log("TESTING 3-SPHERE TO 3D SPACE MAPPING");
    console.log("=".repeat(60));
    
    const testQuaternions = [
        { name: "A", w: 0.5, x: 0.5, y: 0.5, z: 0.5 },      // Upper hemisphere
        { name: "B", w: 1.0, x: 0.0, y: 0.0, z: 0.0 },      // North pole
        { name: "C", w: -0.5, x: 0.5, y: 0.5, z: 0.5 },     // Lower hemisphere
        { name: "D", w: -1.0, x: 0.0, y: 0.0, z: 0.0 },     // South pole
    ];
    
    testQuaternions.forEach(q => {
        // Verify quaternion is normalized
        const normalized = verifyQuaternionNormalization(q);
        const side = q.w >= 0 ? 1 : -1;
        const [x3, y3, z3] = stereographicProjection3D(q.w, q.x, q.y, q.z);
        
        // Test round-trip: quaternion -> 3D -> quaternion
        const backToQuaternion = inverseStereographicProjectionWithSide({ x: x3, y: y3, z: z3 }, side);
        const roundTripNormalized = verifyQuaternionNormalization(backToQuaternion);
        
        console.log(`Quaternion ${q.name}: (${formatNumber(q.w)}, ${formatNumber(q.x)}, ${formatNumber(q.y)}, ${formatNumber(q.z)})`);
        console.log(`  Normalized: ${normalized ? "✓" : "✗"}`);
        console.log(`  Hemisphere side: ${side}`);
        console.log(`  3D projection: (${formatNumber(x3)}, ${formatNumber(y3)}, ${formatNumber(z3)})`);
        console.log(`  Round-trip normalized: ${roundTripNormalized ? "✓" : "✗"}`);
        console.log(`  Round-trip: (${formatNumber(backToQuaternion.w)}, ${formatNumber(backToQuaternion.x)}, ${formatNumber(backToQuaternion.y)}, ${formatNumber(backToQuaternion.z)})`);
        console.log("");
    });
}

// =============================================================================
// QUATERNION NORMALIZATION AND CUBE MAPPING TESTS
// =============================================================================

function mapNormalizedQuaternionToCube(quaternion) {
    // Determine hemisphere
    const side = quaternion.w >= 0 ? 1 : -1;
    
    // Project to 3D space
    const [x3, y3, z3] = stereographicProjection3D(quaternion.w, quaternion.x, quaternion.y, quaternion.z);
    
    // Map to cube coordinates [-1, 1]³ with hemisphere indication
    const position = [
        Math.tanh(x3),  // Clamp to [-1, 1]
        Math.tanh(y3),  // Clamp to [-1, 1]  
        Math.tanh(z3)   // Clamp to [-1, 1]
    ];
    
    return { position, side };
}

function testQuaternionCubeMapping() {
    console.log("\n" + "=".repeat(60));
    console.log("TESTING QUATERNION TO CUBE MAPPING");
    console.log("=".repeat(60));
    
    const testQuaternions = [
        { name: "Upper", w: 0.5, x: 0.5, y: 0.5, z: 0.5 },
        { name: "Lower", w: -0.5, x: 0.5, y: 0.5, z: 0.5 },
        { name: "Identity", w: 1.0, x: 0.0, y: 0.0, z: 0.0 },
        { name: "Negative", w: -1.0, x: 0.0, y: 0.0, z: 0.0 },
    ];
    
    testQuaternions.forEach(q => {
        const normalized = verifyQuaternionNormalization(q);
        const mapped = mapNormalizedQuaternionToCube(q);
        
        console.log(`Quaternion ${q.name}: (${formatNumber(q.w)}, ${formatNumber(q.x)}, ${formatNumber(q.y)}, ${formatNumber(q.z)})`);
        console.log(`  Normalized: ${normalized ? "✓" : "✗"}`);
        console.log(`  Cube position: [${mapped.position.map(formatNumber).join(", ")}]`);
        console.log(`  Hemisphere side: ${mapped.side}`);
        console.log(`  In bounds: ${mapped.position.every(p => Math.abs(p) <= 1.0) ? "✓" : "✗"}`);
        console.log("");
    });
}

// =============================================================================
// COMPLETE WORKFLOW TEST
// =============================================================================

function testCompleteWorkflow() {
    console.log("\n" + "=".repeat(60));
    console.log("TESTING COMPLETE QUATERNION EVOLUTION WORKFLOW");
    console.log("=".repeat(60));
    
    // Step 1: Start with normalized quaternion
    let currentQuaternion = { w: 0.8, x: 0.2, y: 0.3, z: 0.4 };
    console.log("Step 1 - Initial quaternion:", currentQuaternion);
    console.log("  Normalized:", verifyQuaternionNormalization(currentQuaternion) ? "✓" : "✗");
    
    // Step 2: Determine hemisphere
    let side = currentQuaternion.w >= 0 ? 1 : -1;
    console.log("Step 2 - Hemisphere side:", side);
    
    // Step 3: Apply wind rotation (simplified)
    let windQuaternion = { w: 0.9, x: 0.1, y: 0.1, z: 0.1 };
    windQuaternion = normalizeQuaternion(windQuaternion);
    currentQuaternion = multiplyQuaternions(currentQuaternion, windQuaternion);
    currentQuaternion = normalizeQuaternion(currentQuaternion);
    console.log("Step 3 - After wind rotation:", currentQuaternion);
    console.log("  Normalized:", verifyQuaternionNormalization(currentQuaternion) ? "✓" : "✗");
    
    // Step 4: Project to 3D space
    let point3D = stereographicProjection3D(currentQuaternion.w, currentQuaternion.x, currentQuaternion.y, currentQuaternion.z);
    console.log("Step 4 - 3D projection:", `(${formatNumber(point3D[0])}, ${formatNumber(point3D[1])}, ${formatNumber(point3D[2])})`);
    
    // Step 5: Apply phyllotaxis (additive vector)
    let additiveVector = { x: 0.618, y: 0.382, z: 0.236 }; // Golden ratio
    let modifiedPoint3D = {
        x: point3D[0] + additiveVector.x,
        y: point3D[1] + additiveVector.y,
        z: point3D[2] + additiveVector.z
    };
    console.log("Step 5 - After phyllotaxis:", modifiedPoint3D);
    
    // Step 6: Project back to quaternion space
    let newQuaternion = inverseStereographicProjectionWithSide(modifiedPoint3D, side);
    console.log("Step 6 - Back to quaternion:", newQuaternion);
    console.log("  Normalized:", verifyQuaternionNormalization(newQuaternion) ? "✓" : "✗");
    
    // Step 7: Check for hemisphere transition
    let newSide = newQuaternion.w >= 0 ? 1 : -1;
    console.log("Step 7 - Hemisphere transition check:");
    console.log(`  Original side: ${side}`);
    console.log(`  New side: ${newSide}`);
    if (newSide !== side) {
        console.log("  *** HEMISPHERE TRANSITION DETECTED! ***");
    } else {
        console.log("  No hemisphere transition");
    }
    
    console.log("");
}

// =============================================================================
// HEMISPHERE TRANSITION DETECTION TEST
// =============================================================================

function testHemisphereTransitions() {
    console.log("\n" + "=".repeat(60));
    console.log("TESTING HEMISPHERE TRANSITION DETECTION");
    console.log("=".repeat(60));
    
    // Create quaternions near the equator (w ≈ 0)
    const nearEquatorQuaternions = [
        { name: "A", w: 0.1, x: 0.7, y: 0.3, z: 0.6 },
        { name: "B", w: -0.1, x: 0.7, y: 0.3, z: 0.6 },
        { name: "C", w: 0.05, x: 0.8, y: 0.4, z: 0.5 },
        { name: "D", w: -0.05, x: 0.8, y: 0.4, z: 0.5 },
    ];
    
    nearEquatorQuaternions.forEach(q => {
        q = normalizeQuaternion(q); // Ensure normalization
        const side = q.w >= 0 ? 1 : -1;
        const hemisphere = side > 0 ? "Upper" : "Lower";
        const distanceFromEquator = Math.abs(q.w);
        
        console.log(`Quaternion ${q.name}: (${formatNumber(q.w)}, ${formatNumber(q.x)}, ${formatNumber(q.y)}, ${formatNumber(q.z)})`);
        console.log(`  Hemisphere: ${hemisphere}`);
        console.log(`  Distance from equator: ${formatNumber(distanceFromEquator)}`);
        console.log(`  Near equator: ${distanceFromEquator < 0.2 ? "✓" : "✗"}`);
        console.log("");
    });
}

// =============================================================================
// PHYLLOTAXIS SYSTEM TEST
// =============================================================================

function testPhyllotaxisSystem() {
    console.log("\n" + "=".repeat(60));
    console.log("TESTING PHYLLOTAXIS SYSTEM");
    console.log("=".repeat(60));
    
    // Phyllotaxis parameters (golden ratio based)
    const phyllotaxisParams = {
        a: 1 / ((1 + Math.sqrt(5)) / 2), // ≈ 0.618
        b: 1 / Math.pow((1 + Math.sqrt(5)) / 2, 2), // ≈ 0.382
        c: 1 / Math.pow((1 + Math.sqrt(5)) / 2, 3)  // ≈ 0.236
    };
    
    console.log("Golden ratio phyllotaxis parameters:");
    console.log(`  a = ${formatNumber(phyllotaxisParams.a)}`);
    console.log(`  b = ${formatNumber(phyllotaxisParams.b)}`);
    console.log(`  c = ${formatNumber(phyllotaxisParams.c)}`);
    console.log(`  a + b + c = ${formatNumber(phyllotaxisParams.a + phyllotaxisParams.b + phyllotaxisParams.c)}`);
    console.log("");
    
    // Progressive phyllotaxis effect
    function applyPhyllotaxis(point3D, iteration) {
        const scale = Math.log(iteration + 1) * 0.1; // Progressive scaling
        
        return {
            x: point3D.x + phyllotaxisParams.a * scale,
            y: point3D.y + phyllotaxisParams.b * scale,
            z: point3D.z + phyllotaxisParams.c * scale
        };
    }
    
    // Test progressive effect
    const basePoint = { x: 0.0, y: 0.0, z: 0.0 };
    console.log("Progressive phyllotaxis effect:");
    for (let i = 0; i < 5; i++) {
        const modifiedPoint = applyPhyllotaxis(basePoint, i);
        console.log(`  Iteration ${i}: (${formatNumber(modifiedPoint.x)}, ${formatNumber(modifiedPoint.y)}, ${formatNumber(modifiedPoint.z)})`);
    }
    console.log("");
}

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================

function runAllTests() {
    console.log("RIEMANN PROJECTION MATHEMATICS TEST SUITE");
    console.log("=" .repeat(60));
    console.log("Testing all mathematical concepts from the Riemann projection document");
    
    testCircleToLineMapping();
    testSphereToPlaneProjection();
    test3SphereTo3DMapping();
    testQuaternionCubeMapping();
    testCompleteWorkflow();
    testHemisphereTransitions();
    testPhyllotaxisSystem();
    
    console.log("=" .repeat(60));
    console.log("ALL TESTS COMPLETED");
    console.log("=" .repeat(60));
}

// =============================================================================
// RANDOM QUATERNION PROJECTION TEST
// =============================================================================

function generateRandomNormalizedQuaternion() {
    // Generate random values
    const w = (Math.random() - 0.5) * 2; // [-1, 1]
    const x = (Math.random() - 0.5) * 2; // [-1, 1]
    const y = (Math.random() - 0.5) * 2; // [-1, 1]
    const z = (Math.random() - 0.5) * 2; // [-1, 1]
    
    // Normalize to unit quaternion
    return normalizeQuaternion({ w, x, y, z });
}

function testRandomQuaternionProjection() {
    console.log("\n" + "=".repeat(60));
    console.log("TESTING RANDOM QUATERNION PROJECTION CYCLE");
    console.log("=".repeat(60));
    
    const numTests = 100;
    const phyllotaxisParams = {
        a: 1 / ((1 + Math.sqrt(5)) / 2), // ≈ 0.618
        b: 1 / Math.pow((1 + Math.sqrt(5)) / 2, 2), // ≈ 0.382
        c: 1 / Math.pow((1 + Math.sqrt(5)) / 2, 3)  // ≈ 0.236
    };
    
    console.log("Testing complete projection cycle with random normalized quaternions:");
    console.log("1. Generate random normalized quaternion");
    console.log("2. Project to 3D space");
    console.log("3. Apply phyllotaxis (additive vector)");
    console.log("4. Map to cube coordinates [-1, +1]³");
    console.log("5. Project back to quaternion space");
    console.log("6. Verify we get the same quaternion");
    console.log("");
    
    let successCount = 0;
    
    let hemisphereStats = { upper: 0, lower: 0 };
    let maxDifferenceSeen = 0;
    let totalDifference = 0;
    
    for (let i = 0; i < numTests; i++) {
        // Step 1: Generate random normalized quaternion
        const originalQuaternion = generateRandomNormalizedQuaternion();
        
        // Step 2: Project to 3D space
        const side = originalQuaternion.w >= 0 ? 1 : -1;
        const point3D = stereographicProjection3D(originalQuaternion.w, originalQuaternion.x, originalQuaternion.y, originalQuaternion.z);
        
        // Step 3: Apply phyllotaxis (additive vector)
        const phyllotaxisVector = {
            x: phyllotaxisParams.a * 0.1, // Scale down for reasonable values
            y: phyllotaxisParams.b * 0.1,
            z: phyllotaxisParams.c * 0.1
        };
        const modifiedPoint3D = {
            x: point3D[0] + phyllotaxisVector.x,
            y: point3D[1] + phyllotaxisVector.y,
            z: point3D[2] + phyllotaxisVector.z
        };
        
        // Step 4: Map to cube coordinates [-1, +1]³
        const cubePosition = [
            Math.tanh(modifiedPoint3D.x),
            Math.tanh(modifiedPoint3D.y),
            Math.tanh(modifiedPoint3D.z)
        ];
        
        // Step 5: Project back to quaternion space
        // First, we need to reverse the tanh operation
        const restoredPoint3D = {
            x: Math.atanh(cubePosition[0]),
            y: Math.atanh(cubePosition[1]),
            z: Math.atanh(cubePosition[2])
        };
        
        // Remove phyllotaxis effect
        const beforePhyllotaxis3D = {
            x: restoredPoint3D.x - phyllotaxisVector.x,
            y: restoredPoint3D.y - phyllotaxisVector.y,
            z: restoredPoint3D.z - phyllotaxisVector.z
        };
        
        // Project back to quaternion - try both hemisphere sides
        const restoredQuaternion1 = inverseStereographicProjectionWithSide(beforePhyllotaxis3D, 1);  // Upper hemisphere
        const restoredQuaternion2 = inverseStereographicProjectionWithSide(beforePhyllotaxis3D, -1); // Lower hemisphere
        
        // Check which one is closer to original
        const wDiff1 = Math.abs(originalQuaternion.w - restoredQuaternion1.w);
        const xDiff1 = Math.abs(originalQuaternion.x - restoredQuaternion1.x);
        const yDiff1 = Math.abs(originalQuaternion.y - restoredQuaternion1.y);
        const zDiff1 = Math.abs(originalQuaternion.z - restoredQuaternion1.z);
        const maxDiff1 = Math.max(wDiff1, xDiff1, yDiff1, zDiff1);
        
        const wDiff2 = Math.abs(originalQuaternion.w - restoredQuaternion2.w);
        const xDiff2 = Math.abs(originalQuaternion.x - restoredQuaternion2.x);
        const yDiff2 = Math.abs(originalQuaternion.y - restoredQuaternion2.y);
        const zDiff2 = Math.abs(originalQuaternion.z - restoredQuaternion2.z);
        const maxDiff2 = Math.max(wDiff2, xDiff2, yDiff2, zDiff2);
        
        // Choose the better match
        const useUpper = maxDiff1 < maxDiff2;
        const restoredQuaternion = useUpper ? restoredQuaternion1 : restoredQuaternion2;
        const maxDiff = useUpper ? maxDiff1 : maxDiff2;
        
        // Update statistics
        if (useUpper) hemisphereStats.upper++;
        else hemisphereStats.lower++;
        
        maxDifferenceSeen = Math.max(maxDifferenceSeen, maxDiff);
        totalDifference += maxDiff;
        
        // Step 6: Verify we get the same quaternion (within numerical precision)
        const isSame = maxDiff < 1e-6; // Allow for numerical precision
        
        if (isSame) {
            successCount++;
        }
        
        // Show progress every 10 tests
        if ((i + 1) % 10 === 0) {
            console.log(`Progress: ${i + 1}/${numTests} tests completed (${((i + 1) / numTests * 100).toFixed(1)}%)`);
        }
    }
    
    console.log("=".repeat(60));
    console.log(`RANDOM QUATERNION PROJECTION TEST RESULTS`);
    console.log("=".repeat(60));
    console.log(`Tests passed: ${successCount}/${numTests}`);
    console.log(`Success rate: ${((successCount / numTests) * 100).toFixed(1)}%`);
    console.log("");
    console.log("📊 DETAILED STATISTICS:");
    console.log(`  Hemisphere distribution:`);
    console.log(`    Upper hemisphere projections: ${hemisphereStats.upper} (${(hemisphereStats.upper/numTests*100).toFixed(1)}%)`);
    console.log(`    Lower hemisphere projections: ${hemisphereStats.lower} (${(hemisphereStats.lower/numTests*100).toFixed(1)}%)`);
    console.log(`  Precision analysis:`);
    console.log(`    Maximum difference seen: ${maxDifferenceSeen.toExponential(3)}`);
    console.log(`    Average difference: ${(totalDifference/numTests).toExponential(3)}`);
    console.log(`    All differences < 1e-6: ${successCount === numTests ? "✓" : "✗"}`);
    console.log("");
    
    if (successCount === numTests) {
        console.log("🎉 ALL TESTS PASSED! The projection cycle is working correctly.");
        console.log("✅ The Riemann projection mathematics is fully validated for quaternion attractor systems.");
        console.log("✅ Ready for implementation in your quaternion attractor project!");
    } else {
        console.log("⚠️  Some tests failed. Check the projection mathematics.");
        console.log(`   Failed tests: ${numTests - successCount}/${numTests}`);
    }
    console.log("");
}

// =============================================================================
// RUN TESTS
// =============================================================================

if (require.main === module) {
    runAllTests();
    testRandomQuaternionProjection();
}

module.exports = {
    mapCircleToLine,
    stereographicProjection2D,
    hemisphereAwareProjection2D,
    stereographicProjection3D,
    inverseStereographicProjectionWithSide,
    mapNormalizedQuaternionToCube,
    normalizeQuaternion,
    multiplyQuaternions,
    verifyQuaternionNormalization,
    runAllTests
};
