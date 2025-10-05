#!/usr/bin/env node

/**
 * High Point Count Generator for Quaternion Attractor
 * 
 * This tool specializes in generating images with very high point counts (20,000+)
 * to explore different color distributions and visual effects.
 * 
 * Features:
 * - Support for 20,000+ point counts
 * - Optimized rendering for high-density images
 * - Different color distribution analysis
 * - Performance monitoring
 */

const path = require('path');
const fs = require('fs');

// Import the attractor engine and image renderer
const { JavaScriptAttractorEngine } = require('../dist/typescript/core/js-engine');
const { createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/typescript/core/attractor-engine');
const { SimplePNGRenderer } = require('../dist/typescript/node/image-renderer');

class HighPointCountGenerator {
  constructor() {
    this.engine = new JavaScriptAttractorEngine();
    this.generatedImages = [];
  }

  /**
   * Generate small rotation quaternion (close to unit quaternion)
   */
  generateSmallRotationQuaternion(maxAngle = 0.1) {
    const angle = Math.random() * maxAngle;
    const axisX = (Math.random() - 0.5) * 2;
    const axisY = (Math.random() - 0.5) * 2;
    const axisZ = (Math.random() - 0.5) * 2;
    
    const axisLength = Math.sqrt(axisX * axisX + axisY * axisY + axisZ * axisZ);
    const normalizedX = axisX / axisLength;
    const normalizedY = axisY / axisLength;
    const normalizedZ = axisZ / axisLength;
    
    const halfAngle = angle / 2;
    const w = Math.cos(halfAngle);
    const x = normalizedX * Math.sin(halfAngle);
    const y = normalizedY * Math.sin(halfAngle);
    const z = normalizedZ * Math.sin(halfAngle);
    
    return createQuaternion(w, x, y, z);
  }

  /**
   * Generate phyllotaxis vector based on golden ratio
   */
  generatePhyllotaxisVector(variationPercent = 0.1) {
    const phi = 1.618033988749895;
    
    const baseA = 1 / phi;
    const baseB = 1 / (phi * phi);
    const baseC = 1 / (phi * phi * phi);
    
    const variation = variationPercent;
    const a = baseA * (1 + (Math.random() - 0.5) * 2 * variation);
    const b = baseB * (1 + (Math.random() - 0.5) * 2 * variation);
    const c = baseC * (1 + (Math.random() - 0.5) * 2 * variation);
    
    return createVector3D(a, b, c);
  }

  /**
   * Generate random quaternion with controlled magnitude
   */
  generateRandomQuaternion(maxMagnitude = 1.0) {
    const magnitude = Math.random() * maxMagnitude;
    const angle1 = Math.random() * 2 * Math.PI;
    const angle2 = Math.random() * 2 * Math.PI;
    const angle3 = Math.random() * 2 * Math.PI;
    
    const w = magnitude * Math.cos(angle1);
    const x = magnitude * Math.sin(angle1) * Math.cos(angle2);
    const y = magnitude * Math.sin(angle1) * Math.sin(angle2) * Math.cos(angle3);
    const z = magnitude * Math.sin(angle1) * Math.sin(angle2) * Math.sin(angle3);
    
    return createQuaternion(w, x, y, z);
  }

  /**
   * Generate high point count parameters
   */
  generateHighPointCountParameters(pointCount, options = {}) {
    const {
      imageSize = { width: 1200, height: 800 }, // Larger images for high point counts
      windVariation = 0.05,
      phyllotaxisVariation = 0.1,
      cameraRotationVariation = 0.15
    } = options;

    const parameters = {
      start: this.generateRandomQuaternion(0.5),
      wind: this.generateSmallRotationQuaternion(windVariation),
      additive: this.generatePhyllotaxisVector(phyllotaxisVariation),
      mode: this.getRandomSideFlipMode(),
      batchSize: pointCount,
      imageSize,
      projectionType: this.getRandomProjectionType(),
      cameraRotation: this.generateSmallRotationQuaternion(cameraRotationVariation)
    };

    return parameters;
  }

  /**
   * Get random side flip mode
   */
  getRandomSideFlipMode() {
    const modes = [
      SideFlipMode.PLAIN_FLIP,
      SideFlipMode.FLIP_SMALLEST,
      SideFlipMode.FLIP_ALL_EXCEPT_LARGEST
    ];
    return modes[Math.floor(Math.random() * modes.length)];
  }

  /**
   * Get random projection type
   */
  getRandomProjectionType() {
    const types = [
      ProjectionType.SIMPLE,
      ProjectionType.STEREOGRAPHIC
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Convert parameters to engine format
   */
  convertParameters(parameterData) {
    const constants = {
      start: createQuaternion(
        parameterData.start.w,
        parameterData.start.x,
        parameterData.start.y,
        parameterData.start.z
      ),
      wind: createQuaternion(
        parameterData.wind.w,
        parameterData.wind.x,
        parameterData.wind.y,
        parameterData.wind.z
      ),
      additive: createVector3D(
        parameterData.additive.x,
        parameterData.additive.y,
        parameterData.additive.z
      ),
      mode: parameterData.mode
    };

    const renderParams = {
      batchSize: parameterData.batchSize,
      projectionType: parameterData.projectionType === 'simple' ? ProjectionType.SIMPLE : ProjectionType.STEREOGRAPHIC,
      cameraRotation: createQuaternion(
        parameterData.cameraRotation.w,
        parameterData.cameraRotation.x,
        parameterData.cameraRotation.y,
        parameterData.cameraRotation.z
      )
    };

    return { constants, renderParams };
  }

  /**
   * Get mode name for display
   */
  getModeName(mode) {
    switch (mode) {
      case SideFlipMode.PLAIN_FLIP: return 'Plain Flip';
      case SideFlipMode.FLIP_SMALLEST: return 'Flip Smallest';
      case SideFlipMode.FLIP_ALL_EXCEPT_LARGEST: return 'Flip All Except Largest';
      default: return 'Unknown';
    }
  }

  /**
   * Generate high point count image with performance monitoring
   */
  async generateHighPointCountImage(index, pointCount, outputDir, options = {}) {
    console.log(`\n🚀 Generating high point count image ${index} (${pointCount.toLocaleString()} points)...`);
    
    const startTime = Date.now();
    
    try {
      const parameters = this.generateHighPointCountParameters(pointCount, options);
      const { constants, renderParams } = this.convertParameters(parameters);
      
      console.log(`🎯 Generating ${renderParams.batchSize.toLocaleString()} points...`);
      const generationStart = Date.now();
      const result = this.engine.generateBatch(constants, renderParams);
      const generationTime = Date.now() - generationStart;
      
      console.log(`✅ Generated ${result.points.length.toLocaleString()} points in ${generationTime}ms`);
      console.log(`📊 Generation rate: ${Math.round(result.points.length / (generationTime / 1000)).toLocaleString()} pts/sec`);
      
      // Create image renderer with optimized settings for high point counts
      const baseScale = 150.0;
      const baseSize = 800;
      const scaleFactor = parameters.imageSize.width / baseSize;
      const scale = baseScale * scaleFactor;
      
      const imageConfig = {
        width: parameters.imageSize.width,
        height: parameters.imageSize.height,
        scale: scale,
        offsetX: parameters.imageSize.width / 2,
        offsetY: parameters.imageSize.height / 2,
        blurRadius: 1.0, // Reduced blur for high point counts to preserve detail
        normalizationMode: 'logarithmic'
      };
      
      const modeName = this.getModeName(parameters.mode).toLowerCase().replace(/\s+/g, '_');
      const projectionName = parameters.projectionType.toLowerCase();
      const filename = `high_points_${index.toString().padStart(3, '0')}_${pointCount.toLocaleString()}_${modeName}_${projectionName}.png`;
      
      const imagePath = path.join(outputDir, filename);
      const renderer = new SimplePNGRenderer(imageConfig);
      
      console.log(`🖼️  Rendering to PNG...`);
      const renderStart = Date.now();
      const renderResult = await renderer.renderPointsToPNG(result.points, imagePath);
      const renderTime = Date.now() - renderStart;
      const totalTime = Date.now() - startTime;
      
      console.log(`💾 PNG saved: ${filename}`);
      console.log(`⏱️  Render time: ${renderTime}ms, Total time: ${totalTime}ms`);
      console.log(`📊 Statistics: min(${renderResult.statistics.min.r.toFixed(1)}, ${renderResult.statistics.min.g.toFixed(1)}, ${renderResult.statistics.min.b.toFixed(1)}) max(${renderResult.statistics.max.r.toFixed(1)}, ${renderResult.statistics.max.g.toFixed(1)}, ${renderResult.statistics.max.b.toFixed(1)})`);
      
      return {
        index,
        filename,
        imagePath,
        pointCount,
        parameters,
        result: renderResult,
        performance: {
          generationTime,
          renderTime,
          totalTime,
          generationRate: Math.round(result.points.length / (generationTime / 1000)),
          renderRate: Math.round(result.points.length / (renderTime / 1000))
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Error generating high point count image ${index}:`, error.message);
      return null;
    }
  }

  /**
   * Generate series of high point count images
   */
  async generateHighPointCountSeries(pointCounts = [5000, 10000, 15000, 20000, 25000], outputDir) {
    console.log(`🚀 High Point Count Generator`);
    console.log(`=============================`);
    console.log(`Generating images with point counts: ${pointCounts.join(', ')}`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const seriesDir = path.join(outputDir, `high_point_series_${timestamp}`);
    
    if (!fs.existsSync(seriesDir)) {
      fs.mkdirSync(seriesDir, { recursive: true });
    }
    
    console.log(`📁 Output directory: ${seriesDir}`);
    
    const results = [];
    
    // Generate images for each point count
    for (let i = 0; i < pointCounts.length; i++) {
      const pointCount = pointCounts[i];
      const result = await this.generateHighPointCountImage(i + 1, pointCount, seriesDir);
      
      if (result) {
        results.push(result);
        this.generatedImages.push(result);
      }
    }
    
    // Save series summary
    await this.saveSeriesSummary(seriesDir, pointCounts, results);
    
    console.log(`\n🎉 High point count series complete!`);
    console.log(`📊 Generated ${results.length} images`);
    console.log(`📁 All images saved to: ${seriesDir}`);
    
    return seriesDir;
  }

  /**
   * Generate high point count variations of existing parameters
   */
  async generateHighPointCountVariations(baseParameters, pointCounts = [10000, 15000, 20000, 25000], outputDir) {
    console.log(`🔄 Generating high point count variations...`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const variationsDir = path.join(outputDir, `high_point_variations_${timestamp}`);
    
    if (!fs.existsSync(variationsDir)) {
      fs.mkdirSync(variationsDir, { recursive: true });
    }
    
    console.log(`📁 Variations directory: ${variationsDir}`);
    
    const results = [];
    
    for (let i = 0; i < pointCounts.length; i++) {
      const pointCount = pointCounts[i];
      const variationParams = { ...baseParameters, batchSize: pointCount };
      
      console.log(`\n🎨 Creating variation with ${pointCount.toLocaleString()} points...`);
      
      const { constants, renderParams } = this.convertParameters(variationParams);
      const result = this.engine.generateBatch(constants, renderParams);
      
      // Create image renderer
      const baseScale = 150.0;
      const baseSize = 800;
      const scaleFactor = variationParams.imageSize.width / baseSize;
      const scale = baseScale * scaleFactor;
      
      const imageConfig = {
        width: variationParams.imageSize.width,
        height: variationParams.imageSize.height,
        scale: scale,
        offsetX: variationParams.imageSize.width / 2,
        offsetY: variationParams.imageSize.height / 2,
        blurRadius: 1.0,
        normalizationMode: 'logarithmic'
      };
      
      const modeName = this.getModeName(variationParams.mode).toLowerCase().replace(/\s+/g, '_');
      const projectionName = variationParams.projectionType.toLowerCase();
      const filename = `variation_${pointCount.toLocaleString()}_${modeName}_${projectionName}.png`;
      
      const imagePath = path.join(variationsDir, filename);
      const renderer = new SimplePNGRenderer(imageConfig);
      
      const renderResult = await renderer.renderPointsToPNG(result.points, imagePath);
      
      console.log(`✅ Generated variation: ${filename}`);
      
      results.push({
        pointCount,
        filename,
        imagePath,
        parameters: variationParams,
        result: renderResult,
        timestamp: new Date().toISOString()
      });
    }
    
    // Save variations summary
    const summaryPath = path.join(variationsDir, 'variations_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      baseParameters,
      pointCounts,
      variations: results
    }, null, 2));
    
    console.log(`📋 Variations summary saved to: ${summaryPath}`);
    
    return variationsDir;
  }

  /**
   * Save series summary
   */
  async saveSeriesSummary(outputDir, pointCounts, results) {
    const summary = {
      timestamp: new Date().toISOString(),
      tool: 'High Point Count Generator',
      pointCounts,
      totalImages: results.length,
      images: results,
      performance: this.calculatePerformanceStats(results),
      statistics: this.calculateSeriesStatistics(results)
    };
    
    const summaryPath = path.join(outputDir, 'high_point_series_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📋 Series summary saved to: ${summaryPath}`);
  }

  /**
   * Calculate performance statistics
   */
  calculatePerformanceStats(results) {
    const stats = {
      generationRates: [],
      renderRates: [],
      totalTimes: [],
      averageGenerationRate: 0,
      averageRenderRate: 0,
      averageTotalTime: 0
    };
    
    results.forEach(result => {
      if (result.performance) {
        stats.generationRates.push(result.performance.generationRate);
        stats.renderRates.push(result.performance.renderRate);
        stats.totalTimes.push(result.performance.totalTime);
      }
    });
    
    if (stats.generationRates.length > 0) {
      stats.averageGenerationRate = Math.round(stats.generationRates.reduce((a, b) => a + b, 0) / stats.generationRates.length);
      stats.averageRenderRate = Math.round(stats.renderRates.reduce((a, b) => a + b, 0) / stats.renderRates.length);
      stats.averageTotalTime = Math.round(stats.totalTimes.reduce((a, b) => a + b, 0) / stats.totalTimes.length);
    }
    
    return stats;
  }

  /**
   * Calculate series statistics
   */
  calculateSeriesStatistics(results) {
    const stats = {
      pointCountRange: { min: Infinity, max: -Infinity },
      modeDistribution: {},
      projectionDistribution: {},
      imageSizeRange: { width: { min: Infinity, max: -Infinity }, height: { min: Infinity, max: -Infinity } }
    };
    
    results.forEach(result => {
      stats.pointCountRange.min = Math.min(stats.pointCountRange.min, result.pointCount);
      stats.pointCountRange.max = Math.max(stats.pointCountRange.max, result.pointCount);
      
      const modeName = this.getModeName(result.parameters.mode);
      stats.modeDistribution[modeName] = (stats.modeDistribution[modeName] || 0) + 1;
      
      const projectionName = result.parameters.projectionType;
      stats.projectionDistribution[projectionName] = (stats.projectionDistribution[projectionName] || 0) + 1;
      
      stats.imageSizeRange.width.min = Math.min(stats.imageSizeRange.width.min, result.parameters.imageSize.width);
      stats.imageSizeRange.width.max = Math.max(stats.imageSizeRange.width.max, result.parameters.imageSize.width);
      stats.imageSizeRange.height.min = Math.min(stats.imageSizeRange.height.min, result.parameters.imageSize.height);
      stats.imageSizeRange.height.max = Math.max(stats.imageSizeRange.height.max, result.parameters.imageSize.height);
    });
    
    return stats;
  }

  /**
   * Print performance summary
   */
  printPerformanceSummary() {
    console.log(`\n📊 Performance Summary`);
    console.log(`=====================`);
    
    const performance = this.calculatePerformanceStats(this.generatedImages);
    
    console.log(`⚡ Average Generation Rate: ${performance.averageGenerationRate.toLocaleString()} pts/sec`);
    console.log(`🖼️  Average Render Rate: ${performance.averageRenderRate.toLocaleString()} pts/sec`);
    console.log(`⏱️  Average Total Time: ${performance.averageTotalTime}ms`);
    
    console.log(`\n📈 Point Count Performance:`);
    this.generatedImages.forEach(img => {
      if (img.performance) {
        console.log(`  ${img.pointCount.toLocaleString()} points: ${img.performance.generationRate.toLocaleString()} pts/sec, ${img.performance.totalTime}ms total`);
      }
    });
  }
}

/**
 * Main execution function
 */
async function main() {
  const generator = new HighPointCountGenerator();
  
  // Create output directory
  const outputDir = path.join(__dirname, '..', 'output', 'high_point_counts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`🚀 Starting high point count generation...`);
  
  // Generate series of high point count images
  const pointCounts = [5000, 10000, 15000, 20000, 25000]; // As requested: 20,000+ points
  const seriesDir = await generator.generateHighPointCountSeries(pointCounts, outputDir);
  
  // Print performance summary
  generator.printPerformanceSummary();
  
  console.log(`\n🎯 HIGH POINT COUNT GENERATION COMPLETE!`);
  console.log(`=======================================`);
  console.log(`📁 All results saved to: ${seriesDir}`);
  console.log(`📊 Generated: ${generator.generatedImages.length} high point count images`);
  console.log(`🎨 Point counts tested: ${pointCounts.join(', ')}`);
  
  console.log(`\n🎯 NEXT STEPS`);
  console.log(`=============`);
  console.log(`1. Review the high point count images for different color distributions`);
  console.log(`2. Compare visual effects between different point counts`);
  console.log(`3. Use interesting parameter sets for further experimentation`);
  console.log(`4. Test different rendering projections and camera rotations`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { HighPointCountGenerator };
