#!/usr/bin/env node

/**
 * Comprehensive Riemann Projection Math Verification
 * 
 * This script verifies that our shared math functions work correctly
 * for both forward and backward projections with specific test cases.
 */

// Import our shared math functions
const { 
    stereographicProjection,
    inverseStereographicProjection,
    inverseStereographicProjectionWithSide,
    normalizeQuaternion
} = require('../dist/shared/quaternion-math');

function testForwardBackwardProjection(name, quaternion, expectedSide = null) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`Input quaternion: (${quaternion.w.toFixed(3)}, ${quaternion.x.toFixed(3)}, ${quaternion.y.toFixed(3)}, ${quaternion.z.toFixed(3)})`);
    
    // Step 1: Forward projection
    const point3D = stereographicProjection(quaternion);
    console.log(`Forward projection: (${point3D.x.toFixed(3)}, ${point3D.y.toFixed(3)}, ${point3D.z.toFixed(3)})`);
    
    // Step 2: Determine hemisphere side
    const side = quaternion.w >= 0 ? 1 : -1;
    console.log(`Hemisphere side: ${side}`);
    
    // Step 3: Backward projection (standard)
    const restoredQuaternion1 = inverseStereographicProjection(point3D);
    console.log(`Backward (standard): (${restoredQuaternion1.w.toFixed(3)}, ${restoredQuaternion1.x.toFixed(3)}, ${restoredQuaternion1.y.toFixed(3)}, ${restoredQuaternion1.z.toFixed(3)})`);
    
    // Step 4: Backward projection (hemisphere-aware)
    const restoredQuaternion2 = inverseStereographicProjectionWithSide(point3D, side);
    console.log(`Backward (hemisphere-aware): (${restoredQuaternion2.w.toFixed(3)}, ${restoredQuaternion2.x.toFixed(3)}, ${restoredQuaternion2.y.toFixed(3)}, ${restoredQuaternion2.z.toFixed(3)})`);
    
    // Step 5: Calculate differences
    const diff1 = Math.max(
        Math.abs(quaternion.w - restoredQuaternion1.w),
        Math.abs(quaternion.x - restoredQuaternion1.x),
        Math.abs(quaternion.y - restoredQuaternion1.y),
        Math.abs(quaternion.z - restoredQuaternion1.z)
    );
    
    const diff2 = Math.max(
        Math.abs(quaternion.w - restoredQuaternion2.w),
        Math.abs(quaternion.x - restoredQuaternion2.x),
        Math.abs(quaternion.y - restoredQuaternion2.y),
        Math.abs(quaternion.z - restoredQuaternion2.z)
    );
    
    console.log(`Max difference (standard): ${diff1.toExponential(3)}`);
    console.log(`Max difference (hemisphere-aware): ${diff2.toExponential(3)}`);
    
    // Step 6: Determine which is better
    const standardBetter = diff1 < diff2;
    const bestDiff = standardBetter ? diff1 : diff2;
    const bestMethod = standardBetter ? "standard" : "hemisphere-aware";
    
    console.log(`✅ Best method: ${bestMethod} (diff: ${bestDiff.toExponential(3)})`);
    
    if (bestDiff < 1e-10) {
        console.log(`✅ Perfect round-trip projection!`);
    } else if (bestDiff < 1e-6) {
        console.log(`✅ Excellent round-trip projection!`);
    } else {
        console.log(`⚠️  Round-trip projection has larger errors`);
    }
    
    return { bestDiff, bestMethod, side };
}

function main() {
    console.log("=".repeat(80));
    console.log("COMPREHENSIVE RIEMANN PROJECTION MATH VERIFICATION");
    console.log("=".repeat(80));
    
    // Test cases covering different scenarios
    const testCases = [
        {
            name: "Upper hemisphere - away from pole",
            quaternion: { w: 0.5, x: 0.5, y: 0.5, z: 0.5 }
        },
        {
            name: "Lower hemisphere - away from pole", 
            quaternion: { w: -0.5, x: 0.5, y: 0.5, z: 0.5 }
        },
        {
            name: "Upper hemisphere - close to pole",
            quaternion: { w: 0.9, x: 0.1, y: 0.1, z: 0.1 }
        },
        {
            name: "Lower hemisphere - close to pole",
            quaternion: { w: -0.9, x: 0.1, y: 0.1, z: 0.1 }
        },
        {
            name: "Upper hemisphere - very close to pole",
            quaternion: { w: 0.99, x: 0.01, y: 0.01, z: 0.01 }
        },
        {
            name: "Lower hemisphere - very close to pole",
            quaternion: { w: -0.99, x: 0.01, y: 0.01, z: 0.01 }
        },
        {
            name: "Identity quaternion (north pole)",
            quaternion: { w: 1.0, x: 0.0, y: 0.0, z: 0.0 }
        },
        {
            name: "Negative identity (south pole)",
            quaternion: { w: -1.0, x: 0.0, y: 0.0, z: 0.0 }
        },
        {
            name: "Equator - upper hemisphere",
            quaternion: { w: 0.0, x: 1.0, y: 0.0, z: 0.0 }
        },
        {
            name: "Equator - lower hemisphere",
            quaternion: { w: 0.0, x: -1.0, y: 0.0, z: 0.0 }
        }
    ];
    
    let totalTests = 0;
    let perfectTests = 0;
    let excellentTests = 0;
    let hemisphereUpperCount = 0;
    let hemisphereLowerCount = 0;
    let standardBetterCount = 0;
    let hemisphereBetterCount = 0;
    
    for (const testCase of testCases) {
        const result = testForwardBackwardProjection(testCase.name, testCase.quaternion);
        totalTests++;
        
        if (result.bestDiff < 1e-10) {
            perfectTests++;
        } else if (result.bestDiff < 1e-6) {
            excellentTests++;
        }
        
        if (result.side > 0) {
            hemisphereUpperCount++;
        } else {
            hemisphereLowerCount++;
        }
        
        if (result.bestMethod === "standard") {
            standardBetterCount++;
        } else {
            hemisphereBetterCount++;
        }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("VERIFICATION SUMMARY");
    console.log("=".repeat(80));
    
    console.log(`📊 Total tests: ${totalTests}`);
    console.log(`✅ Perfect round-trip (< 1e-10): ${perfectTests}/${totalTests} (${(perfectTests/totalTests*100).toFixed(1)}%)`);
    console.log(`✅ Excellent round-trip (< 1e-6): ${excellentTests}/${totalTests} (${(excellentTests/totalTests*100).toFixed(1)}%)`);
    
    console.log(`\n🌐 Hemisphere distribution:`);
    console.log(`   Upper hemisphere: ${hemisphereUpperCount}/${totalTests} (${(hemisphereUpperCount/totalTests*100).toFixed(1)}%)`);
    console.log(`   Lower hemisphere: ${hemisphereLowerCount}/${totalTests} (${(hemisphereLowerCount/totalTests*100).toFixed(1)}%)`);
    
    console.log(`\n🔄 Best projection method:`);
    console.log(`   Standard projection: ${standardBetterCount}/${totalTests} (${(standardBetterCount/totalTests*100).toFixed(1)}%)`);
    console.log(`   Hemisphere-aware projection: ${hemisphereBetterCount}/${totalTests} (${(hemisphereBetterCount/totalTests*100).toFixed(1)}%)`);
    
    console.log(`\n🎯 Conclusion:`);
    if (perfectTests === totalTests) {
        console.log(`🎉 ALL TESTS PERFECT! Riemann projection math is working flawlessly.`);
    } else if (excellentTests === totalTests) {
        console.log(`✅ ALL TESTS EXCELLENT! Riemann projection math is working very well.`);
    } else {
        console.log(`⚠️  Some tests show larger errors. Review implementation.`);
    }
    
    console.log("=".repeat(80));
}

// Run the verification
main();
