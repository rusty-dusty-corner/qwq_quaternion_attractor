#!/usr/bin/env node

/**
 * Mass Image Generator for Quaternion Attractor
 * 
 * This tool generates a large number of images to build a comprehensive dataset
 * for analysis. We need many samples before we can determine what parameters
 * are actually best.
 */

const path = require('path');
const fs = require('fs');

// Import the attractor engine and image renderer
const { JavaScriptAttractorEngine } = require('../dist/typescript/core/js-engine');
const { createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/typescript/core/attractor-engine');
const { SimplePNGRenderer } = require('../dist/typescript/node/image-renderer');

class MassImageGenerator {
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
   * Generate random parameters with good variety
   */
  generateRandomParameters() {
    const parameters = {
      start: this.generateRandomQuaternion(0.5),
      wind: this.generateSmallRotationQuaternion(0.05),
      additive: this.generatePhyllotaxisVector(0.1),
      mode: this.getRandomSideFlipMode(),
      batchSize: this.getRandomPointCount(),
      imageSize: this.getRandomImageSize(),
      projectionType: this.getRandomProjectionType(),
      cameraRotation: this.generateSmallRotationQuaternion(0.2)
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
   * Get random point count (staying within engine limits)
   */
  getRandomPointCount() {
    // Use different ranges for variety, staying under 10,000 limit
    const ranges = [
      [500, 2000],    // Low range
      [2000, 5000],   // Medium range  
      [5000, 8000],   // High range
      [8000, 10000]   // Very high range
    ];
    
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
  }

  /**
   * Get random image size
   */
  getRandomImageSize() {
    const sizes = [
      { width: 800, height: 600 },   // Standard
      { width: 1000, height: 800 },  // Wide
      { width: 900, height: 900 },   // Square
      { width: 1200, height: 900 },  // HD
      { width: 700, height: 900 }    // Portrait
    ];
    
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  /**
   * Get random projection type
   */
  getRandomProjectionType() {
    return Math.random() > 0.5 ? 'simple' : 'stereographic';
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
   * Generate a single image
   */
  async generateImage(index, outputDir) {
    console.log(`\n🎲 Generating image ${index}...`);
    
    try {
      const parameters = this.generateRandomParameters();
      const { constants, renderParams } = this.convertParameters(parameters);
      
      console.log(`🎯 Parameters: ${this.getModeName(parameters.mode)}, ${parameters.batchSize} points, ${parameters.projectionType}`);
      
      console.log(`🎯 Generating ${renderParams.batchSize.toLocaleString()} points...`);
      const result = this.engine.generateBatch(constants, renderParams);
      
      console.log(`✅ Generated ${result.points.length.toLocaleString()} points`);
      
      // Create image renderer
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
        blurRadius: 1.5,
        normalizationMode: 'logarithmic'
      };
      
      const modeName = this.getModeName(parameters.mode).toLowerCase().replace(/\s+/g, '_');
      const projectionName = parameters.projectionType.toLowerCase();
      const batchSize = parameters.batchSize;
      const filename = `mass_${index.toString().padStart(4, '0')}_${modeName}_${projectionName}_${batchSize}pts.png`;
      
      const imagePath = path.join(outputDir, filename);
      const renderer = new SimplePNGRenderer(imageConfig);
      
      console.log(`🖼️  Rendering to PNG...`);
      const renderResult = await renderer.renderPointsToPNG(result.points, imagePath);
      
      console.log(`💾 PNG saved: ${filename}`);
      console.log(`📊 Statistics: min(${renderResult.statistics.min.r.toFixed(1)}, ${renderResult.statistics.min.g.toFixed(1)}, ${renderResult.statistics.min.b.toFixed(1)}) max(${renderResult.statistics.max.r.toFixed(1)}, ${renderResult.statistics.max.g.toFixed(1)}, ${renderResult.statistics.max.b.toFixed(1)})`);
      
      return {
        index,
        filename,
        imagePath,
        parameters,
        result: renderResult,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Error generating image ${index}:`, error.message);
      return null;
    }
  }

  /**
   * Generate mass collection of images
   */
  async generateMassCollection(count = 100) {
    console.log(`🎲 Mass Image Generator`);
    console.log(`========================`);
    console.log(`Generating ${count} random attractor images for comprehensive dataset...`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '..', 'output', 'mass_generation', timestamp);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`📁 Output directory: ${outputDir}`);
    
    const startTime = Date.now();
    let successCount = 0;
    
    // Generate images
    for (let i = 1; i <= count; i++) {
      const imageResult = await this.generateImage(i, outputDir);
      
      if (imageResult) {
        this.generatedImages.push(imageResult);
        successCount++;
        
        // Progress update every 10 images
        if (i % 10 === 0) {
          const elapsed = Date.now() - startTime;
          const rate = i / (elapsed / 1000);
          console.log(`\n📊 Progress: ${i}/${count} images (${successCount} successful) - Rate: ${rate.toFixed(1)} images/sec`);
        }
      }
    }
    
    // Save collection summary
    await this.saveCollectionSummary(outputDir, count, successCount, startTime);
    
    const totalTime = Date.now() - startTime;
    
    console.log(`\n🎉 Mass generation complete!`);
    console.log(`📊 Generated ${successCount}/${count} images successfully`);
    console.log(`⏱️  Total time: ${Math.round(totalTime / 1000)}s`);
    console.log(`📈 Average rate: ${(successCount / (totalTime / 1000)).toFixed(1)} images/sec`);
    console.log(`📁 All images saved to: ${outputDir}`);
    
    return outputDir;
  }

  /**
   * Save collection summary
   */
  async saveCollectionSummary(outputDir, requestedCount, successCount, startTime) {
    const totalTime = Date.now() - startTime;
    
    const summary = {
      timestamp: new Date().toISOString(),
      tool: 'Mass Image Generator',
      requestedCount,
      successCount,
      successRate: (successCount / requestedCount * 100).toFixed(1) + '%',
      totalTime: totalTime,
      averageRate: (successCount / (totalTime / 1000)).toFixed(1) + ' images/sec',
      images: this.generatedImages,
      statistics: this.calculateCollectionStatistics()
    };
    
    const summaryPath = path.join(outputDir, 'mass_generation_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📋 Collection summary saved to: ${summaryPath}`);
  }

  /**
   * Calculate collection statistics
   */
  calculateCollectionStatistics() {
    const stats = {
      modeDistribution: {},
      projectionDistribution: {},
      pointCountRanges: {
        low: 0,      // 500-2000
        medium: 0,   // 2000-5000
        high: 0,     // 5000-8000
        veryHigh: 0  // 8000-10000
      },
      imageSizeDistribution: {},
      colorRangeStats: {
        min: { r: Infinity, g: Infinity, b: Infinity },
        max: { r: -Infinity, g: -Infinity, b: -Infinity },
        avgMax: { r: 0, g: 0, b: 0 }
      }
    };
    
    this.generatedImages.forEach(image => {
      // Mode distribution
      const modeName = this.getModeName(image.parameters.mode);
      stats.modeDistribution[modeName] = (stats.modeDistribution[modeName] || 0) + 1;
      
      // Projection distribution
      const projectionName = image.parameters.projectionType;
      stats.projectionDistribution[projectionName] = (stats.projectionDistribution[projectionName] || 0) + 1;
      
      // Point count ranges
      const pointCount = image.parameters.batchSize;
      if (pointCount >= 500 && pointCount < 2000) stats.pointCountRanges.low++;
      else if (pointCount >= 2000 && pointCount < 5000) stats.pointCountRanges.medium++;
      else if (pointCount >= 5000 && pointCount < 8000) stats.pointCountRanges.high++;
      else if (pointCount >= 8000 && pointCount <= 10000) stats.pointCountRanges.veryHigh++;
      
      // Image size distribution
      const sizeKey = `${image.parameters.imageSize.width}x${image.parameters.imageSize.height}`;
      stats.imageSizeDistribution[sizeKey] = (stats.imageSizeDistribution[sizeKey] || 0) + 1;
      
      // Color range statistics
      const renderStats = image.result.statistics;
      stats.colorRangeStats.min.r = Math.min(stats.colorRangeStats.min.r, renderStats.min.r);
      stats.colorRangeStats.min.g = Math.min(stats.colorRangeStats.min.g, renderStats.min.g);
      stats.colorRangeStats.min.b = Math.min(stats.colorRangeStats.min.b, renderStats.min.b);
      stats.colorRangeStats.max.r = Math.max(stats.colorRangeStats.max.r, renderStats.max.r);
      stats.colorRangeStats.max.g = Math.max(stats.colorRangeStats.max.g, renderStats.max.g);
      stats.colorRangeStats.max.b = Math.max(stats.colorRangeStats.max.b, renderStats.max.b);
      
      stats.colorRangeStats.avgMax.r += renderStats.max.r;
      stats.colorRangeStats.avgMax.g += renderStats.max.g;
      stats.colorRangeStats.avgMax.b += renderStats.max.b;
    });
    
    // Calculate averages
    const count = this.generatedImages.length;
    if (count > 0) {
      stats.colorRangeStats.avgMax.r /= count;
      stats.colorRangeStats.avgMax.g /= count;
      stats.colorRangeStats.avgMax.b /= count;
    }
    
    return stats;
  }

  /**
   * Print collection statistics
   */
  printCollectionStatistics() {
    console.log(`\n📊 Collection Statistics`);
    console.log(`=========================`);
    
    const stats = this.calculateCollectionStatistics();
    
    console.log(`🎯 Mode Distribution:`);
    Object.entries(stats.modeDistribution).forEach(([mode, count]) => {
      console.log(`  ${mode}: ${count} images`);
    });
    
    console.log(`\n📐 Projection Distribution:`);
    Object.entries(stats.projectionDistribution).forEach(([projection, count]) => {
      console.log(`  ${projection}: ${count} images`);
    });
    
    console.log(`\n📏 Point Count Ranges:`);
    Object.entries(stats.pointCountRanges).forEach(([range, count]) => {
      console.log(`  ${range}: ${count} images`);
    });
    
    console.log(`\n🖼️  Image Size Distribution:`);
    Object.entries(stats.imageSizeDistribution).forEach(([size, count]) => {
      console.log(`  ${size}: ${count} images`);
    });
    
    console.log(`\n🎨 Color Range Statistics:`);
    console.log(`  Min: (${stats.colorRangeStats.min.r.toFixed(1)}, ${stats.colorRangeStats.min.g.toFixed(1)}, ${stats.colorRangeStats.min.b.toFixed(1)})`);
    console.log(`  Max: (${stats.colorRangeStats.max.r.toFixed(1)}, ${stats.colorRangeStats.max.g.toFixed(1)}, ${stats.colorRangeStats.max.b.toFixed(1)})`);
    console.log(`  Avg Max: (${stats.colorRangeStats.avgMax.r.toFixed(1)}, ${stats.colorRangeStats.avgMax.g.toFixed(1)}, ${stats.colorRangeStats.avgMax.b.toFixed(1)})`);
  }
}

/**
 * Main execution function
 */
async function main() {
  const generator = new MassImageGenerator();
  
  // Get count from command line argument or use default
  const count = process.argv[2] ? parseInt(process.argv[2]) : 100;
  
  console.log(`🚀 Starting mass image generation...`);
  console.log(`Target: ${count} images for comprehensive dataset`);
  
  const outputDir = await generator.generateMassCollection(count);
  
  // Print statistics
  generator.printCollectionStatistics();
  
  console.log(`\n🎯 MASS GENERATION COMPLETE!`);
  console.log(`=============================`);
  console.log(`📁 All results saved to: ${outputDir}`);
  console.log(`📊 Generated: ${generator.generatedImages.length} images`);
  
  console.log(`\n🎯 NEXT STEPS`);
  console.log(`=============`);
  console.log(`1. Review the generated images for visual patterns`);
  console.log(`2. Run AI analysis on the new images`);
  console.log(`3. Identify the most interesting parameter combinations`);
  console.log(`4. Use organized results for further research`);
  console.log(`5. Generate even more images if needed`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MassImageGenerator };

