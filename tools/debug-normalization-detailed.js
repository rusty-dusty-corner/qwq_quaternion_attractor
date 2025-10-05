#!/usr/bin/env node

/**
 * Detailed Normalization Debug Tool
 * 
 * This tool specifically debugs the statistics-based normalization by:
 * 1. Simulating the exact statistics calculation from the image renderer
 * 2. Comparing fixed vs statistics-based normalization
 * 3. Showing exactly how the same mathematical point gets different visual coordinates
 */

const path = require('path');
const fs = require('fs');

class NormalizationDebugger {
  constructor() {
    this.results = [];
  }

  /**
   * Simulate the statistics calculation from the image renderer
   */
  calculateStatistics(points) {
    let minR = Infinity, minG = Infinity, minB = Infinity;
    let maxR = -Infinity, maxG = -Infinity, maxB = -Infinity;
    let sumR = 0, sumG = 0, sumB = 0;
    let count = 0;

    // First pass: find min, max, and mean
    for (const point of points) {
      // Simulate how points are converted to RGB values
      const r = Math.abs(point.x) * 255;
      const g = Math.abs(point.y) * 255;
      const b = Math.abs(point.z) * 255;

      if (r > 0 || g > 0 || b > 0) {
        minR = Math.min(minR, r);
        minG = Math.min(minG, g);
        minB = Math.min(minB, b);
        
        maxR = Math.max(maxR, r);
        maxG = Math.max(maxG, g);
        maxB = Math.max(maxB, b);
        
        sumR += r;
        sumG += g;
        sumB += b;
        count++;
      }
    }

    if (count === 0) {
      return {
        min: { r: 0, g: 0, b: 0 },
        max: { r: 0, g: 0, b: 0 },
        mean: { r: 0, g: 0, b: 0 },
        stdev: { r: 0, g: 0, b: 0 }
      };
    }

    const meanR = sumR / count;
    const meanG = sumG / count;
    const meanB = sumB / count;

    // Second pass: calculate standard deviation
    let sumVarR = 0, sumVarG = 0, sumVarB = 0;
    for (const point of points) {
      const r = Math.abs(point.x) * 255;
      const g = Math.abs(point.y) * 255;
      const b = Math.abs(point.z) * 255;

      if (r > 0 || g > 0 || b > 0) {
        sumVarR += (r - meanR) * (r - meanR);
        sumVarG += (g - meanG) * (g - meanG);
        sumVarB += (b - meanB) * (b - meanB);
      }
    }

    return {
      min: { r: minR, g: minG, b: minB },
      max: { r: maxR, g: maxG, b: maxB },
      mean: { r: meanR, g: meanG, b: meanB },
      stdev: {
        r: Math.sqrt(sumVarR / count),
        g: Math.sqrt(sumVarG / count),
        b: Math.sqrt(sumVarB / count)
      }
    };
  }

  /**
   * Statistics-based normalization (problematic)
   */
  normalizeWithStatistics(value, min, max) {
    if (max === min) return 0;
    return ((value - min) / (max - min)) * 255;
  }

  /**
   * Fixed normalization (like browser renderer)
   */
  normalizeFixed(value) {
    // Convert from [-1, 1] range to [0, 255] range
    return ((value + 1) / 2) * 255;
  }

  /**
   * Debug normalization for a specific point count
   */
  debugNormalization(pointCount, points) {
    console.log(`\n🔍 Debugging ${pointCount} points normalization...`);
    
    // Calculate statistics
    const stats = this.calculateStatistics(points);
    console.log(`📊 Statistics:`, {
      min: { r: stats.min.r.toFixed(2), g: stats.min.g.toFixed(2), b: stats.min.b.toFixed(2) },
      max: { r: stats.max.r.toFixed(2), g: stats.max.g.toFixed(2), b: stats.max.b.toFixed(2) },
      mean: { r: stats.mean.r.toFixed(2), g: stats.mean.g.toFixed(2), b: stats.mean.b.toFixed(2) }
    });

    // Test with a specific convergence point
    const testPoint = points[points.length - 1]; // Last point (convergence)
    console.log(`🎯 Test point (convergence): (${testPoint.x.toFixed(6)}, ${testPoint.y.toFixed(6)}, ${testPoint.z.toFixed(6)})`);

    // Convert to RGB values
    const r = Math.abs(testPoint.x) * 255;
    const g = Math.abs(testPoint.y) * 255;
    const b = Math.abs(testPoint.z) * 255;

    // Apply both normalizations
    const statsNormalized = {
      r: this.normalizeWithStatistics(r, stats.min.r, stats.max.r),
      g: this.normalizeWithStatistics(g, stats.min.g, stats.max.g),
      b: this.normalizeWithStatistics(b, stats.min.b, stats.max.b)
    };

    const fixedNormalized = {
      r: this.normalizeFixed(testPoint.x),
      g: this.normalizeFixed(testPoint.y),
      b: this.normalizeFixed(testPoint.z)
    };

    console.log(`📐 Statistics-based normalization: (${statsNormalized.r.toFixed(2)}, ${statsNormalized.g.toFixed(2)}, ${statsNormalized.b.toFixed(2)})`);
    console.log(`📐 Fixed normalization: (${fixedNormalized.r.toFixed(2)}, ${fixedNormalized.g.toFixed(2)}, ${fixedNormalized.b.toFixed(2)})`);

    // Calculate difference
    const difference = {
      r: Math.abs(statsNormalized.r - fixedNormalized.r),
      g: Math.abs(statsNormalized.g - fixedNormalized.g),
      b: Math.abs(statsNormalized.b - fixedNormalized.b)
    };

    console.log(`⚠️  Difference: (${difference.r.toFixed(2)}, ${difference.g.toFixed(2)}, ${difference.b.toFixed(2)})`);

    const result = {
      pointCount,
      testPoint,
      stats,
      statsNormalized,
      fixedNormalized,
      difference,
      maxDifference: Math.max(difference.r, difference.g, difference.b)
    };

    this.results.push(result);
    return result;
  }

  /**
   * Compare results across different point counts
   */
  compareNormalizationResults() {
    console.log('\n📊 NORMALIZATION COMPARISON');
    console.log('='.repeat(60));

    if (this.results.length < 2) {
      console.log('❌ Need at least 2 results to compare');
      return;
    }

    console.log('\n🎯 Same Mathematical Point, Different Visual Coordinates:');
    console.log('Point Count | Stats-Based (R,G,B) | Fixed (R,G,B) | Max Diff');
    console.log('-'.repeat(60));

    this.results.forEach(result => {
      const stats = result.statsNormalized;
      const fixed = result.fixedNormalized;
      const maxDiff = result.maxDifference;
      
      console.log(`${result.pointCount.toString().padStart(10)} | (${stats.r.toFixed(1)},${stats.g.toFixed(1)},${stats.b.toFixed(1)}) | (${fixed.r.toFixed(1)},${fixed.g.toFixed(1)},${fixed.b.toFixed(1)}) | ${maxDiff.toFixed(1)}`);
    });

    // Check if the same mathematical point produces different visual coordinates
    const firstResult = this.results[0];
    const lastResult = this.results[this.results.length - 1];

    console.log('\n🔍 Critical Analysis:');
    console.log(`Same convergence point: (${firstResult.testPoint.x.toFixed(6)}, ${firstResult.testPoint.y.toFixed(6)}, ${firstResult.testPoint.z.toFixed(6)})`);
    
    const statsDiff = {
      r: Math.abs(firstResult.statsNormalized.r - lastResult.statsNormalized.r),
      g: Math.abs(firstResult.statsNormalized.g - lastResult.statsNormalized.g),
      b: Math.abs(firstResult.statsNormalized.b - lastResult.statsNormalized.b)
    };

    const maxStatsDiff = Math.max(statsDiff.r, statsDiff.g, statsDiff.b);
    
    console.log(`Statistics-based visual difference: (${statsDiff.r.toFixed(2)}, ${statsDiff.g.toFixed(2)}, ${statsDiff.b.toFixed(2)})`);
    console.log(`Maximum visual difference: ${maxStatsDiff.toFixed(2)}`);

    if (maxStatsDiff > 10) {
      console.log('🚨 CRITICAL: Same mathematical point produces significantly different visual coordinates!');
      console.log('   This confirms the statistics-based normalization bug.');
    } else if (maxStatsDiff > 1) {
      console.log('⚠️  WARNING: Same mathematical point produces different visual coordinates.');
      console.log('   This suggests the statistics-based normalization bug.');
    } else {
      console.log('✅ Visual coordinates are consistent across point counts.');
    }
  }

  /**
   * Save detailed debug results
   */
  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `debug-normalization-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'output', 'debug', filename);
    
    // Ensure output directory exists
    const outputDir = path.dirname(filepath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const debugData = {
      timestamp: new Date().toISOString(),
      tool: 'Detailed Normalization Debugger',
      results: this.results,
      summary: {
        totalTests: this.results.length,
        pointCounts: this.results.map(r => r.pointCount),
        maxDifferences: this.results.map(r => r.maxDifference),
        hasNormalizationBug: this.results.some(r => r.maxDifference > 10)
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(debugData, null, 2));
    console.log(`\n💾 Debug results saved to: ${filepath}`);
    
    return filepath;
  }
}

/**
 * Generate sample points for testing
 */
function generateSamplePoints(pointCount) {
  const points = [];
  
  // Generate points that simulate attractor behavior
  // Start with some random points, then converge to a specific point
  const convergencePoint = { x: 0.3, y: -0.2, z: 0.1 };
  
  for (let i = 0; i < pointCount; i++) {
    let point;
    
    if (i < pointCount * 0.8) {
      // Random points for most of the sequence
      point = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2
      };
    } else {
      // Converge to the specific point
      const progress = (i - pointCount * 0.8) / (pointCount * 0.2);
      const noise = (1 - progress) * 0.1;
      
      point = {
        x: convergencePoint.x + (Math.random() - 0.5) * noise,
        y: convergencePoint.y + (Math.random() - 0.5) * noise,
        z: convergencePoint.z + (Math.random() - 0.5) * noise
      };
    }
    
    points.push(point);
  }
  
  return points;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Detailed Normalization Debugger');
  console.log('===================================');
  
  const debugTool = new NormalizationDebugger();
  
  // Test different point counts
  const pointCounts = [500, 1000, 2000, 5000];
  
  for (const pointCount of pointCounts) {
    try {
      const points = generateSamplePoints(pointCount);
      await debugTool.debugNormalization(pointCount, points);
    } catch (error) {
      console.error(`❌ Error debugging ${pointCount} points:`, error.message);
    }
  }
  
  // Compare results
  debugTool.compareNormalizationResults();
  
  // Save results
  const filepath = debugTool.saveResults();
  
  console.log('\n🎯 SUMMARY');
  console.log('==========');
  console.log('Normalization debug analysis complete.');
  console.log('If the same mathematical convergence point produces different visual coordinates');
  console.log('across different point counts, this confirms the statistics normalization bug.');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NormalizationDebugger };
