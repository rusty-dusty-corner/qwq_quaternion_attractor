#!/usr/bin/env node

/**
 * Advanced Normalization Debug Tool
 * 
 * This tool tests the proposed advanced normalization approach:
 * 1. Logarithmic transformation: log(x+1)
 * 2. Middle point calculation (mean as grey level)
 * 3. Error-based normalization relative to middle point
 * 4. Sigmoid function for smooth transformation
 * 5. 8-bit RGB mapping
 */

const path = require('path');
const fs = require('fs');

class AdvancedNormalizationDebugger {
  constructor() {
    this.results = [];
  }

  /**
   * Calculate advanced statistics with logarithmic transformation
   */
  calculateAdvancedStatistics(points) {
    // Convert points to RGB values and apply logarithmic transformation
    const logValues = { r: [], g: [], b: [] };
    
    for (const point of points) {
      const r = Math.abs(point.x) * 255;
      const g = Math.abs(point.y) * 255;
      const b = Math.abs(point.z) * 255;

      if (r > 0 || g > 0 || b > 0) {
        logValues.r.push(Math.log(r + 1));
        logValues.g.push(Math.log(g + 1));
        logValues.b.push(Math.log(b + 1));
      }
    }

    // Calculate statistics for logarithmic values
    const stats = {
      r: this.calculateLogStats(logValues.r),
      g: this.calculateLogStats(logValues.g),
      b: this.calculateLogStats(logValues.b)
    };

    return stats;
  }

  /**
   * Calculate statistics for logarithmic values
   */
  calculateLogStats(logValues) {
    if (logValues.length === 0) {
      return { min: 0, max: 0, mean: 0, middle: 0, stdev: 0 };
    }

    const min = Math.min(...logValues);
    const max = Math.max(...logValues);
    const mean = logValues.reduce((sum, val) => sum + val, 0) / logValues.length;
    
    // Calculate standard deviation
    const variance = logValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / logValues.length;
    const stdev = Math.sqrt(variance);

    // Middle point (mean as grey level)
    const middle = mean;

    return { min, max, mean, middle, stdev };
  }

  /**
   * Sigmoid function
   */
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Advanced normalization using logarithmic transformation and sigmoid
   */
  normalizeAdvanced(value, stats) {
    // Step 1: Logarithmic transformation
    const logValue = Math.log(value + 1);
    
    // Step 2: Calculate error from middle point
    const error = logValue - stats.middle;
    
    // Step 3: Normalize error by standard deviation (or range)
    const normalizedError = error / stats.stdev;
    
    // Step 4: Apply sigmoid function
    const sigmoidOutput = this.sigmoid(normalizedError);
    
    // Step 5: Map to 8-bit RGB (0-255)
    return Math.round(sigmoidOutput * 255);
  }

  /**
   * Current statistics-based normalization (for comparison)
   */
  normalizeCurrent(value, min, max) {
    if (max === min) return 0;
    return Math.round(((value - min) / (max - min)) * 255);
  }

  /**
   * Fixed normalization (browser-style)
   */
  normalizeFixed(value) {
    return Math.round(((value + 1) / 2) * 255);
  }

  /**
   * Debug normalization for a specific point count
   */
  debugAdvancedNormalization(pointCount, points) {
    console.log(`\n🔍 Advanced Normalization Debug - ${pointCount} points...`);
    
    // Calculate advanced statistics
    const advancedStats = this.calculateAdvancedStatistics(points);
    console.log(`📊 Advanced Statistics (Logarithmic):`);
    console.log(`  R: min=${advancedStats.r.min.toFixed(3)}, max=${advancedStats.r.max.toFixed(3)}, mean=${advancedStats.r.mean.toFixed(3)}, middle=${advancedStats.r.middle.toFixed(3)}, stdev=${advancedStats.r.stdev.toFixed(3)}`);
    console.log(`  G: min=${advancedStats.g.min.toFixed(3)}, max=${advancedStats.g.max.toFixed(3)}, mean=${advancedStats.g.mean.toFixed(3)}, middle=${advancedStats.g.middle.toFixed(3)}, stdev=${advancedStats.g.stdev.toFixed(3)}`);
    console.log(`  B: min=${advancedStats.b.min.toFixed(3)}, max=${advancedStats.b.max.toFixed(3)}, mean=${advancedStats.b.mean.toFixed(3)}, middle=${advancedStats.b.middle.toFixed(3)}, stdev=${advancedStats.b.stdev.toFixed(3)}`);

    // Test with convergence point
    const testPoint = points[points.length - 1];
    console.log(`🎯 Test point (convergence): (${testPoint.x.toFixed(6)}, ${testPoint.y.toFixed(6)}, ${testPoint.z.toFixed(6)})`);

    // Convert to RGB values
    const r = Math.abs(testPoint.x) * 255;
    const g = Math.abs(testPoint.y) * 255;
    const b = Math.abs(testPoint.z) * 255;

    // Apply different normalizations
    const advancedNormalized = {
      r: this.normalizeAdvanced(r, advancedStats.r),
      g: this.normalizeAdvanced(g, advancedStats.g),
      b: this.normalizeAdvanced(b, advancedStats.b)
    };

    // Calculate current statistics for comparison
    const currentStats = this.calculateCurrentStatistics(points);
    const currentNormalized = {
      r: this.normalizeCurrent(r, currentStats.min.r, currentStats.max.r),
      g: this.normalizeCurrent(g, currentStats.min.g, currentStats.max.g),
      b: this.normalizeCurrent(b, currentStats.min.b, currentStats.max.b)
    };

    const fixedNormalized = {
      r: this.normalizeFixed(testPoint.x),
      g: this.normalizeFixed(testPoint.y),
      b: this.normalizeFixed(testPoint.z)
    };

    console.log(`📐 Advanced normalization: (${advancedNormalized.r}, ${advancedNormalized.g}, ${advancedNormalized.b})`);
    console.log(`📐 Current normalization: (${currentNormalized.r}, ${currentNormalized.g}, ${currentNormalized.b})`);
    console.log(`📐 Fixed normalization: (${fixedNormalized.r}, ${fixedNormalized.g}, ${fixedNormalized.b})`);

    // Calculate differences
    const advancedVsCurrent = {
      r: Math.abs(advancedNormalized.r - currentNormalized.r),
      g: Math.abs(advancedNormalized.g - currentNormalized.g),
      b: Math.abs(advancedNormalized.b - currentNormalized.b)
    };

    const advancedVsFixed = {
      r: Math.abs(advancedNormalized.r - fixedNormalized.r),
      g: Math.abs(advancedNormalized.g - fixedNormalized.g),
      b: Math.abs(advancedNormalized.b - fixedNormalized.b)
    };

    console.log(`⚠️  Advanced vs Current: (${advancedVsCurrent.r}, ${advancedVsCurrent.g}, ${advancedVsCurrent.b})`);
    console.log(`⚠️  Advanced vs Fixed: (${advancedVsFixed.r}, ${advancedVsFixed.g}, ${advancedVsFixed.b})`);

    const result = {
      pointCount,
      testPoint,
      advancedStats,
      currentStats,
      advancedNormalized,
      currentNormalized,
      fixedNormalized,
      advancedVsCurrent,
      advancedVsFixed,
      maxAdvancedVsCurrent: Math.max(advancedVsCurrent.r, advancedVsCurrent.g, advancedVsCurrent.b),
      maxAdvancedVsFixed: Math.max(advancedVsFixed.r, advancedVsFixed.g, advancedVsFixed.b)
    };

    this.results.push(result);
    return result;
  }

  /**
   * Calculate current statistics (for comparison)
   */
  calculateCurrentStatistics(points) {
    let minR = Infinity, minG = Infinity, minB = Infinity;
    let maxR = -Infinity, maxG = -Infinity, maxB = -Infinity;

    for (const point of points) {
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
      }
    }

    return {
      min: { r: minR, g: minG, b: minB },
      max: { r: maxR, g: maxG, b: maxB }
    };
  }

  /**
   * Compare results across different point counts
   */
  compareAdvancedResults() {
    console.log('\n📊 ADVANCED NORMALIZATION COMPARISON');
    console.log('='.repeat(80));

    if (this.results.length < 2) {
      console.log('❌ Need at least 2 results to compare');
      return;
    }

    console.log('\n🎯 Same Mathematical Point, Different Normalization Methods:');
    console.log('Point Count | Advanced (R,G,B) | Current (R,G,B) | Fixed (R,G,B)');
    console.log('-'.repeat(80));

    this.results.forEach(result => {
      const advanced = result.advancedNormalized;
      const current = result.currentNormalized;
      const fixed = result.fixedNormalized;
      
      console.log(`${result.pointCount.toString().padStart(10)} | (${advanced.r},${advanced.g},${advanced.b}) | (${current.r},${current.g},${current.b}) | (${fixed.r},${fixed.g},${fixed.b})`);
    });

    // Check consistency across point counts
    console.log('\n🔍 Consistency Analysis:');
    const firstResult = this.results[0];
    const lastResult = this.results[this.results.length - 1];

    const advancedConsistency = {
      r: Math.abs(firstResult.advancedNormalized.r - lastResult.advancedNormalized.r),
      g: Math.abs(firstResult.advancedNormalized.g - lastResult.advancedNormalized.g),
      b: Math.abs(firstResult.advancedNormalized.b - lastResult.advancedNormalized.b)
    };

    const currentConsistency = {
      r: Math.abs(firstResult.currentNormalized.r - lastResult.currentNormalized.r),
      g: Math.abs(firstResult.currentNormalized.g - lastResult.currentNormalized.g),
      b: Math.abs(firstResult.currentNormalized.b - lastResult.currentNormalized.b)
    };

    const maxAdvancedConsistency = Math.max(advancedConsistency.r, advancedConsistency.g, advancedConsistency.b);
    const maxCurrentConsistency = Math.max(currentConsistency.r, currentConsistency.g, currentConsistency.b);

    console.log(`Advanced normalization consistency: (${advancedConsistency.r}, ${advancedConsistency.g}, ${advancedConsistency.b}) - Max: ${maxAdvancedConsistency}`);
    console.log(`Current normalization consistency: (${currentConsistency.r}, ${currentConsistency.g}, ${currentConsistency.b}) - Max: ${maxCurrentConsistency}`);

    if (maxAdvancedConsistency < maxCurrentConsistency) {
      console.log('✅ Advanced normalization is MORE consistent across point counts!');
    } else if (maxAdvancedConsistency > maxCurrentConsistency) {
      console.log('⚠️  Advanced normalization is LESS consistent across point counts.');
    } else {
      console.log('🔄 Advanced and current normalization have similar consistency.');
    }
  }

  /**
   * Save detailed debug results
   */
  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `debug-advanced-normalization-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'output', 'debug', filename);
    
    // Ensure output directory exists
    const outputDir = path.dirname(filepath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const debugData = {
      timestamp: new Date().toISOString(),
      tool: 'Advanced Normalization Debugger',
      approach: 'Logarithmic transformation + Middle point + Sigmoid',
      results: this.results,
      summary: {
        totalTests: this.results.length,
        pointCounts: this.results.map(r => r.pointCount),
        maxAdvancedVsCurrent: this.results.map(r => r.maxAdvancedVsCurrent),
        maxAdvancedVsFixed: this.results.map(r => r.maxAdvancedVsFixed)
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(debugData, null, 2));
    console.log(`\n💾 Advanced debug results saved to: ${filepath}`);
    
    return filepath;
  }
}

/**
 * Generate sample points for testing
 */
function generateSamplePoints(pointCount) {
  const points = [];
  
  // Generate points that simulate attractor behavior with logarithmic distribution
  const convergencePoint = { x: 0.3, y: -0.2, z: 0.1 };
  
  for (let i = 0; i < pointCount; i++) {
    let point;
    
    if (i < pointCount * 0.7) {
      // Random points with logarithmic-like distribution
      const magnitude = Math.random() * 2;
      const angle = Math.random() * 2 * Math.PI;
      point = {
        x: magnitude * Math.cos(angle),
        y: magnitude * Math.sin(angle),
        z: (Math.random() - 0.5) * 2
      };
    } else {
      // Converge to the specific point
      const progress = (i - pointCount * 0.7) / (pointCount * 0.3);
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
  console.log('🔍 Advanced Normalization Debugger');
  console.log('===================================');
  console.log('Testing: Logarithmic + Middle Point + Sigmoid approach');
  
  const debugTool = new AdvancedNormalizationDebugger();
  
  // Test different point counts
  const pointCounts = [500, 1000, 2000, 5000];
  
  for (const pointCount of pointCounts) {
    try {
      const points = generateSamplePoints(pointCount);
      await debugTool.debugAdvancedNormalization(pointCount, points);
    } catch (error) {
      console.error(`❌ Error debugging ${pointCount} points:`, error.message);
    }
  }
  
  // Compare results
  debugTool.compareAdvancedResults();
  
  // Save results
  const filepath = debugTool.saveResults();
  
  console.log('\n🎯 SUMMARY');
  console.log('==========');
  console.log('Advanced normalization analysis complete.');
  console.log('The logarithmic + sigmoid approach should provide better handling');
  console.log('of the wide dynamic range in attractor data.');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AdvancedNormalizationDebugger };
