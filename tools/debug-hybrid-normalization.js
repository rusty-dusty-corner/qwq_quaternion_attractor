#!/usr/bin/env node

/**
 * Hybrid Normalization Debug Tool
 * 
 * This tool tests a hybrid approach combining:
 * 1. Your advanced logarithmic + sigmoid approach
 * 2. Fixed mathematical parameters (not data-dependent)
 * 3. Best of both worlds: sophisticated transformation + consistency
 */

const path = require('path');
const fs = require('fs');

class HybridNormalizationDebugger {
  constructor() {
    this.results = [];
  }

  /**
   * Fixed logarithmic normalization (your approach but with fixed parameters)
   */
  normalizeFixedLogarithmic(value) {
    // Step 1: Logarithmic transformation
    const logValue = Math.log(Math.abs(value) * 255 + 1);
    
    // Step 2: Fixed middle point (based on typical attractor data)
    const fixedMiddle = 4.5; // Typical log value for attractor data
    
    // Step 3: Calculate error from fixed middle point
    const error = logValue - fixedMiddle;
    
    // Step 4: Fixed normalization factor (based on typical stdev)
    const fixedStdev = 1.0; // Typical stdev for log values
    const normalizedError = error / fixedStdev;
    
    // Step 5: Apply sigmoid function
    const sigmoidOutput = this.sigmoid(normalizedError);
    
    // Step 6: Map to 8-bit RGB (0-255)
    return Math.round(sigmoidOutput * 255);
  }

  /**
   * Your advanced approach (data-dependent)
   */
  normalizeAdvancedLogarithmic(value, stats) {
    const logValue = Math.log(Math.abs(value) * 255 + 1);
    const error = logValue - stats.middle;
    const normalizedError = error / stats.stdev;
    const sigmoidOutput = this.sigmoid(normalizedError);
    return Math.round(sigmoidOutput * 255);
  }

  /**
   * Current statistics-based normalization
   */
  normalizeCurrent(value, min, max) {
    if (max === min) return 0;
    return Math.round(((value - min) / (max - min)) * 255);
  }

  /**
   * Fixed mathematical normalization (browser-style)
   */
  normalizeFixed(value) {
    return Math.round(((value + 1) / 2) * 255);
  }

  /**
   * Sigmoid function
   */
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Calculate advanced statistics (for comparison)
   */
  calculateAdvancedStatistics(points) {
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

    return {
      r: this.calculateLogStats(logValues.r),
      g: this.calculateLogStats(logValues.g),
      b: this.calculateLogStats(logValues.b)
    };
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
    
    const variance = logValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / logValues.length;
    const stdev = Math.sqrt(variance);

    return { min, max, mean, middle: mean, stdev };
  }

  /**
   * Debug all normalization approaches
   */
  debugHybridNormalization(pointCount, points) {
    console.log(`\n🔍 Hybrid Normalization Debug - ${pointCount} points...`);
    
    // Calculate statistics for advanced approach
    const advancedStats = this.calculateAdvancedStatistics(points);
    
    // Test with convergence point
    const testPoint = points[points.length - 1];
    console.log(`🎯 Test point (convergence): (${testPoint.x.toFixed(6)}, ${testPoint.y.toFixed(6)}, ${testPoint.z.toFixed(6)})`);

    // Apply all normalization methods
    const fixedLogNormalized = {
      r: this.normalizeFixedLogarithmic(testPoint.x),
      g: this.normalizeFixedLogarithmic(testPoint.y),
      b: this.normalizeFixedLogarithmic(testPoint.z)
    };

    const advancedLogNormalized = {
      r: this.normalizeAdvancedLogarithmic(testPoint.x, advancedStats.r),
      g: this.normalizeAdvancedLogarithmic(testPoint.y, advancedStats.g),
      b: this.normalizeAdvancedLogarithmic(testPoint.z, advancedStats.b)
    };

    // Calculate current statistics for comparison
    const currentStats = this.calculateCurrentStatistics(points);
    const currentNormalized = {
      r: this.normalizeCurrent(Math.abs(testPoint.x) * 255, currentStats.min.r, currentStats.max.r),
      g: this.normalizeCurrent(Math.abs(testPoint.y) * 255, currentStats.min.g, currentStats.max.g),
      b: this.normalizeCurrent(Math.abs(testPoint.z) * 255, currentStats.min.b, currentStats.max.b)
    };

    const fixedNormalized = {
      r: this.normalizeFixed(testPoint.x),
      g: this.normalizeFixed(testPoint.y),
      b: this.normalizeFixed(testPoint.z)
    };

    console.log(`📐 Fixed Log normalization: (${fixedLogNormalized.r}, ${fixedLogNormalized.g}, ${fixedLogNormalized.b})`);
    console.log(`📐 Advanced Log normalization: (${advancedLogNormalized.r}, ${advancedLogNormalized.g}, ${advancedLogNormalized.b})`);
    console.log(`📐 Current normalization: (${currentNormalized.r}, ${currentNormalized.g}, ${currentNormalized.b})`);
    console.log(`📐 Fixed normalization: (${fixedNormalized.r}, ${fixedNormalized.g}, ${fixedNormalized.b})`);

    const result = {
      pointCount,
      testPoint,
      fixedLogNormalized,
      advancedLogNormalized,
      currentNormalized,
      fixedNormalized,
      advancedStats
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
   * Compare all normalization approaches
   */
  compareHybridResults() {
    console.log('\n📊 HYBRID NORMALIZATION COMPARISON');
    console.log('='.repeat(90));

    if (this.results.length < 2) {
      console.log('❌ Need at least 2 results to compare');
      return;
    }

    console.log('\n🎯 Same Mathematical Point, All Normalization Methods:');
    console.log('Point Count | Fixed Log | Advanced Log | Current | Fixed');
    console.log('-'.repeat(90));

    this.results.forEach(result => {
      const fixedLog = result.fixedLogNormalized;
      const advancedLog = result.advancedLogNormalized;
      const current = result.currentNormalized;
      const fixed = result.fixedNormalized;
      
      console.log(`${result.pointCount.toString().padStart(10)} | (${fixedLog.r},${fixedLog.g},${fixedLog.b}) | (${advancedLog.r},${advancedLog.g},${advancedLog.b}) | (${current.r},${current.g},${current.b}) | (${fixed.r},${fixed.g},${fixed.b})`);
    });

    // Check consistency across point counts
    console.log('\n🔍 Consistency Analysis:');
    const firstResult = this.results[0];
    const lastResult = this.results[this.results.length - 1];

    const fixedLogConsistency = {
      r: Math.abs(firstResult.fixedLogNormalized.r - lastResult.fixedLogNormalized.r),
      g: Math.abs(firstResult.fixedLogNormalized.g - lastResult.fixedLogNormalized.g),
      b: Math.abs(firstResult.fixedLogNormalized.b - lastResult.fixedLogNormalized.b)
    };

    const advancedLogConsistency = {
      r: Math.abs(firstResult.advancedLogNormalized.r - lastResult.advancedLogNormalized.r),
      g: Math.abs(firstResult.advancedLogNormalized.g - lastResult.advancedLogNormalized.g),
      b: Math.abs(firstResult.advancedLogNormalized.b - lastResult.advancedLogNormalized.b)
    };

    const currentConsistency = {
      r: Math.abs(firstResult.currentNormalized.r - lastResult.currentNormalized.r),
      g: Math.abs(firstResult.currentNormalized.g - lastResult.currentNormalized.g),
      b: Math.abs(firstResult.currentNormalized.b - lastResult.currentNormalized.b)
    };

    const fixedConsistency = {
      r: Math.abs(firstResult.fixedNormalized.r - lastResult.fixedNormalized.r),
      g: Math.abs(firstResult.fixedNormalized.g - lastResult.fixedNormalized.g),
      b: Math.abs(firstResult.fixedNormalized.b - lastResult.fixedNormalized.b)
    };

    const maxFixedLogConsistency = Math.max(fixedLogConsistency.r, fixedLogConsistency.g, fixedLogConsistency.b);
    const maxAdvancedLogConsistency = Math.max(advancedLogConsistency.r, advancedLogConsistency.g, advancedLogConsistency.b);
    const maxCurrentConsistency = Math.max(currentConsistency.r, currentConsistency.g, currentConsistency.b);
    const maxFixedConsistency = Math.max(fixedConsistency.r, fixedConsistency.g, fixedConsistency.b);

    console.log(`Fixed Log consistency: (${fixedLogConsistency.r}, ${fixedLogConsistency.g}, ${fixedLogConsistency.b}) - Max: ${maxFixedLogConsistency}`);
    console.log(`Advanced Log consistency: (${advancedLogConsistency.r}, ${advancedLogConsistency.g}, ${advancedLogConsistency.b}) - Max: ${maxAdvancedLogConsistency}`);
    console.log(`Current consistency: (${currentConsistency.r}, ${currentConsistency.g}, ${currentConsistency.b}) - Max: ${maxCurrentConsistency}`);
    console.log(`Fixed consistency: (${fixedConsistency.r}, ${fixedConsistency.g}, ${fixedConsistency.b}) - Max: ${maxFixedConsistency}`);

    // Find the most consistent approach
    const consistencies = [
      { name: 'Fixed Log', value: maxFixedLogConsistency },
      { name: 'Advanced Log', value: maxAdvancedLogConsistency },
      { name: 'Current', value: maxCurrentConsistency },
      { name: 'Fixed', value: maxFixedConsistency }
    ];

    const mostConsistent = consistencies.reduce((min, curr) => curr.value < min.value ? curr : min);

    console.log(`\n🏆 Most consistent approach: ${mostConsistent.name} (max difference: ${mostConsistent.value})`);

    if (maxFixedLogConsistency === 0) {
      console.log('✅ Fixed Log normalization is PERFECTLY consistent across point counts!');
    }
  }

  /**
   * Save detailed debug results
   */
  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `debug-hybrid-normalization-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'output', 'debug', filename);
    
    const outputDir = path.dirname(filepath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const debugData = {
      timestamp: new Date().toISOString(),
      tool: 'Hybrid Normalization Debugger',
      approach: 'Fixed Logarithmic + Sigmoid vs Data-Dependent Approaches',
      results: this.results,
      summary: {
        totalTests: this.results.length,
        pointCounts: this.results.map(r => r.pointCount)
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(debugData, null, 2));
    console.log(`\n💾 Hybrid debug results saved to: ${filepath}`);
    
    return filepath;
  }
}

/**
 * Generate sample points for testing
 */
function generateSamplePoints(pointCount) {
  const points = [];
  const convergencePoint = { x: 0.3, y: -0.2, z: 0.1 };
  
  for (let i = 0; i < pointCount; i++) {
    let point;
    
    if (i < pointCount * 0.7) {
      const magnitude = Math.random() * 2;
      const angle = Math.random() * 2 * Math.PI;
      point = {
        x: magnitude * Math.cos(angle),
        y: magnitude * Math.sin(angle),
        z: (Math.random() - 0.5) * 2
      };
    } else {
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
  console.log('🔍 Hybrid Normalization Debugger');
  console.log('=================================');
  console.log('Testing: Fixed Log + Sigmoid vs Data-Dependent Approaches');
  
  const debugTool = new HybridNormalizationDebugger();
  
  const pointCounts = [500, 1000, 2000, 5000];
  
  for (const pointCount of pointCounts) {
    try {
      const points = generateSamplePoints(pointCount);
      await debugTool.debugHybridNormalization(pointCount, points);
    } catch (error) {
      console.error(`❌ Error debugging ${pointCount} points:`, error.message);
    }
  }
  
  debugTool.compareHybridResults();
  const filepath = debugTool.saveResults();
  
  console.log('\n🎯 SUMMARY');
  console.log('==========');
  console.log('Hybrid normalization analysis complete.');
  console.log('The fixed logarithmic approach should provide both sophistication');
  console.log('and consistency across different point counts.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { HybridNormalizationDebugger };
