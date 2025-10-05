#!/usr/bin/env node

/**
 * Debug Statistics Normalization Tool
 * 
 * This tool helps debug the statistics-based normalization bug by:
 * 1. Generating attractor points with different point counts
 * 2. Analyzing the statistics calculation in detail
 * 3. Comparing normalization results across different point counts
 * 4. Identifying where the visual inconsistencies occur
 */

const path = require('path');
const fs = require('fs');

// Import the attractor engine
const { JavaScriptAttractorEngine, createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/browser/typescript/core/attractor-engine');

class StatisticsDebugger {
  constructor() {
    this.engine = new JavaScriptAttractorEngine();
    this.results = [];
  }

  /**
   * Generate attractor points and analyze statistics
   */
  async debugPointCount(pointCount) {
    console.log(`\n🔍 Debugging ${pointCount} points...`);
    
    const constants = {
      start: createQuaternion(0.1, 0.2, 0.3, 0.4),
      wind: createQuaternion(0.99, 0.01, 0.01, 0.01),
      additive: createVector3D(0.1, 0.1, 0.1),
      mode: SideFlipMode.FLIP_SMALLEST
    };

    const renderParams = {
      batchSize: pointCount,
      imageSize: { width: 800, height: 600 },
      projectionType: ProjectionType.SIMPLE,
      cameraRotation: createQuaternion(1, 0, 0, 0)
    };

    // Generate points
    const result = this.engine.generateBatch(constants, renderParams);
    
    // Analyze the points
    const analysis = this.analyzePoints(result.points);
    
    // Store results
    const debugResult = {
      pointCount,
      totalPoints: result.points.length,
      analysis,
      samplePoints: result.points.slice(0, 10), // First 10 points for inspection
      finalQuaternion: result.finalQuaternion
    };
    
    this.results.push(debugResult);
    
    console.log(`✅ Generated ${result.points.length} points`);
    console.log(`📊 Analysis:`, analysis);
    
    return debugResult;
  }

  /**
   * Analyze generated points to understand the data distribution
   */
  analyzePoints(points) {
    if (points.length === 0) {
      return { error: 'No points generated' };
    }

    // Extract coordinates
    const xCoords = points.map(p => p.x);
    const yCoords = points.map(p => p.y);
    const zCoords = points.map(p => p.z);

    // Calculate statistics for each dimension
    const xStats = this.calculateStats(xCoords);
    const yStats = this.calculateStats(yCoords);
    const zStats = this.calculateStats(zCoords);

    // Analyze convergence behavior
    const convergenceAnalysis = this.analyzeConvergence(points);

    return {
      dimensions: {
        x: xStats,
        y: yStats,
        z: zStats
      },
      convergence: convergenceAnalysis,
      totalPoints: points.length
    };
  }

  /**
   * Calculate basic statistics for a set of values
   */
  calculateStats(values) {
    if (values.length === 0) return { min: 0, max: 0, mean: 0, stdev: 0 };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdev = Math.sqrt(variance);

    return { min, max, mean, stdev };
  }

  /**
   * Analyze convergence behavior
   */
  analyzeConvergence(points) {
    if (points.length < 10) return { status: 'insufficient_data' };

    // Check if points are converging to a specific area
    const last10Points = points.slice(-10);
    const first10Points = points.slice(0, 10);

    const last10Center = {
      x: last10Points.reduce((sum, p) => sum + p.x, 0) / 10,
      y: last10Points.reduce((sum, p) => sum + p.y, 0) / 10,
      z: last10Points.reduce((sum, p) => sum + p.z, 0) / 10
    };

    const first10Center = {
      x: first10Points.reduce((sum, p) => sum + p.x, 0) / 10,
      y: first10Points.reduce((sum, p) => sum + p.y, 0) / 10,
      z: first10Points.reduce((sum, p) => sum + p.z, 0) / 10
    };

    // Calculate distance between centers
    const distance = Math.sqrt(
      Math.pow(last10Center.x - first10Center.x, 2) +
      Math.pow(last10Center.y - first10Center.y, 2) +
      Math.pow(last10Center.z - first10Center.z, 2)
    );

    // Check if points are clustering (low standard deviation in last 10 points)
    const last10Spread = {
      x: this.calculateStats(last10Points.map(p => p.x)).stdev,
      y: this.calculateStats(last10Points.map(p => p.y)).stdev,
      z: this.calculateStats(last10Points.map(p => p.z)).stdev
    };

    const avgSpread = (last10Spread.x + last10Spread.y + last10Spread.z) / 3;

    return {
      first10Center,
      last10Center,
      centerDistance: distance,
      last10Spread,
      avgSpread,
      isConverging: avgSpread < 0.1, // Arbitrary threshold
      convergenceStrength: avgSpread < 0.05 ? 'strong' : avgSpread < 0.1 ? 'moderate' : 'weak'
    };
  }

  /**
   * Compare results across different point counts
   */
  compareResults() {
    console.log('\n📊 COMPARISON ANALYSIS');
    console.log('='.repeat(50));

    if (this.results.length < 2) {
      console.log('❌ Need at least 2 results to compare');
      return;
    }

    // Compare convergence centers
    console.log('\n🎯 Convergence Center Comparison:');
    this.results.forEach(result => {
      const center = result.analysis.convergence.last10Center;
      console.log(`${result.pointCount} points: (${center.x.toFixed(4)}, ${center.y.toFixed(4)}, ${center.z.toFixed(4)})`);
    });

    // Compare coordinate ranges
    console.log('\n📏 Coordinate Range Comparison:');
    this.results.forEach(result => {
      const x = result.analysis.dimensions.x;
      const y = result.analysis.dimensions.y;
      console.log(`${result.pointCount} points: X[${x.min.toFixed(4)}, ${x.max.toFixed(4)}] Y[${y.min.toFixed(4)}, ${y.max.toFixed(4)}]`);
    });

    // Check for consistency
    console.log('\n🔍 Consistency Analysis:');
    const firstResult = this.results[0];
    const lastResult = this.results[this.results.length - 1];
    
    const firstCenter = firstResult.analysis.convergence.last10Center;
    const lastCenter = lastResult.analysis.convergence.last10Center;
    
    const centerDistance = Math.sqrt(
      Math.pow(lastCenter.x - firstCenter.x, 2) +
      Math.pow(lastCenter.y - firstCenter.y, 2) +
      Math.pow(lastCenter.z - firstCenter.z, 2)
    );

    console.log(`Center distance between ${firstResult.pointCount} and ${lastResult.pointCount} points: ${centerDistance.toFixed(6)}`);
    
    if (centerDistance > 0.01) {
      console.log('⚠️  WARNING: Significant difference in convergence centers!');
      console.log('   This suggests the statistics normalization bug is affecting convergence behavior.');
    } else {
      console.log('✅ Convergence centers are consistent across point counts.');
    }
  }

  /**
   * Save detailed debug results to file
   */
  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `debug-statistics-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'output', 'debug', filename);
    
    // Ensure output directory exists
    const outputDir = path.dirname(filepath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const debugData = {
      timestamp: new Date().toISOString(),
      tool: 'Statistics Normalization Debugger',
      results: this.results,
      summary: {
        totalTests: this.results.length,
        pointCounts: this.results.map(r => r.pointCount),
        convergenceConsistency: this.analyzeConvergenceConsistency()
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(debugData, null, 2));
    console.log(`\n💾 Debug results saved to: ${filepath}`);
    
    return filepath;
  }

  /**
   * Analyze convergence consistency across all results
   */
  analyzeConvergenceConsistency() {
    if (this.results.length < 2) return { status: 'insufficient_data' };

    const centers = this.results.map(r => r.analysis.convergence.last10Center);
    const distances = [];
    
    for (let i = 1; i < centers.length; i++) {
      const distance = Math.sqrt(
        Math.pow(centers[i].x - centers[0].x, 2) +
        Math.pow(centers[i].y - centers[0].y, 2) +
        Math.pow(centers[i].z - centers[0].z, 2)
      );
      distances.push(distance);
    }

    const maxDistance = Math.max(...distances);
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

    return {
      maxDistance,
      avgDistance,
      isConsistent: maxDistance < 0.01,
      consistencyLevel: maxDistance < 0.005 ? 'high' : maxDistance < 0.01 ? 'medium' : 'low'
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Statistics Normalization Debugger');
  console.log('=====================================');
  
  const debugger = new StatisticsDebugger();
  
  // Test different point counts
  const pointCounts = [500, 1000, 2000, 5000];
  
  for (const pointCount of pointCounts) {
    try {
      await debugger.debugPointCount(pointCount);
    } catch (error) {
      console.error(`❌ Error debugging ${pointCount} points:`, error.message);
    }
  }
  
  // Compare results
  debugger.compareResults();
  
  // Save results
  const filepath = debugger.saveResults();
  
  console.log('\n🎯 SUMMARY');
  console.log('==========');
  console.log('Debug analysis complete. Check the saved JSON file for detailed results.');
  console.log('If convergence centers differ significantly across point counts,');
  console.log('this confirms the statistics normalization bug is affecting the mathematical behavior.');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { StatisticsDebugger };
