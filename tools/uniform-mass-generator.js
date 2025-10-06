#!/usr/bin/env node

/**
 * Uniform Mass Generator for Quaternion Attractor
 * 
 * This tool generates a large number of images using uniform parameter sampling
 * for systematic parameter space exploration.
 * 
 * Key Features:
 * - Uses uniform parameter generator for mathematically sound sampling
 * - Generates images with corresponding parameter files
 * - Systematic coverage of entire parameter space
 * - Foundation for optimization algorithms and research applications
 */

const path = require('path');
const fs = require('fs');

// Import the attractor engine and image renderer
const { JavaScriptAttractorEngine } = require('../dist/typescript/core/js-engine');
const { createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/typescript/core/attractor-engine');
const { SimplePNGRenderer } = require('../dist/typescript/node/image-renderer');
const { UniformParameterGenerator } = require('./uniform-parameter-generator');

class UniformMassGenerator {
  constructor() {
    this.engine = new JavaScriptAttractorEngine();
    this.parameterGenerator = new UniformParameterGenerator();
    this.generatedImages = [];
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
   * Convert parameters to engine format
   */
  convertParameters(parameterData) {
    const constants = {
      start: createQuaternion(
        parameterData.constants.start.w,
        parameterData.constants.start.x,
        parameterData.constants.start.y,
        parameterData.constants.start.z
      ),
      wind: createQuaternion(
        parameterData.constants.wind.w,
        parameterData.constants.wind.x,
        parameterData.constants.wind.y,
        parameterData.constants.wind.z
      ),
      additive: createVector3D(
        parameterData.constants.additive.x,
        parameterData.constants.additive.y,
        parameterData.constants.additive.z
      ),
      mode: parameterData.constants.mode
    };

    const renderParams = {
      batchSize: parameterData.renderParams.batchSize,
      projectionType: parameterData.renderParams.projectionType === 'simple' ? ProjectionType.SIMPLE : ProjectionType.STEREOGRAPHIC,
      cameraRotation: createQuaternion(
        parameterData.renderParams.cameraRotation.w,
        parameterData.renderParams.cameraRotation.x,
        parameterData.renderParams.cameraRotation.y,
        parameterData.renderParams.cameraRotation.z
      )
    };

    return { constants, renderParams };
  }

  /**
   * Save parameter file with matching prefix
   */
  saveParameterFile(parameters, baseFilename, outputDir) {
    const parameterFilename = baseFilename.replace('.png', '_params.json');
    const parameterPath = path.join(outputDir, parameterFilename);
    
    // Create a clean parameter object for saving
    const parameterData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        tool: 'Uniform Mass Generator',
        version: '1.0.0',
        samplingMethod: 'uniform'
      },
      constants: {
        start: {
          w: parameters.start.w,
          x: parameters.start.x,
          y: parameters.start.y,
          z: parameters.start.z
        },
        wind: {
          w: parameters.wind.w,
          x: parameters.wind.x,
          y: parameters.wind.y,
          z: parameters.wind.z
        },
        additive: {
          x: parameters.additive.x,
          y: parameters.additive.y,
          z: parameters.additive.z
        },
        mode: parameters.mode,
        modeName: this.getModeName(parameters.mode)
      },
      renderParams: {
        batchSize: parameters.batchSize,
        projectionType: parameters.projectionType,
        imageSize: parameters.imageSize,
        cameraRotation: {
          w: parameters.cameraRotation.w,
          x: parameters.cameraRotation.x,
          y: parameters.cameraRotation.y,
          z: parameters.cameraRotation.z
        }
      }
    };
    
    fs.writeFileSync(parameterPath, JSON.stringify(parameterData, null, 2));
    return parameterFilename;
  }

  /**
   * Generate a single image from uniform parameters
   */
  async generateImage(index, parameterSet, outputDir) {
    console.log(`\n🎲 Generating uniform image ${index}...`);
    
    try {
      // parameterSet is already in the correct format from uniform parameter generator
      const constants = {
        start: createQuaternion(
          parameterSet.start.w,
          parameterSet.start.x,
          parameterSet.start.y,
          parameterSet.start.z
        ),
        wind: createQuaternion(
          parameterSet.wind.w,
          parameterSet.wind.x,
          parameterSet.wind.y,
          parameterSet.wind.z
        ),
        additive: createVector3D(
          parameterSet.additive.x,
          parameterSet.additive.y,
          parameterSet.additive.z
        ),
        mode: parameterSet.mode
      };

      const renderParams = {
        batchSize: parameterSet.batchSize,
        projectionType: parameterSet.projectionType === 'simple' ? ProjectionType.SIMPLE : ProjectionType.STEREOGRAPHIC,
        cameraRotation: createQuaternion(
          parameterSet.cameraRotation.w,
          parameterSet.cameraRotation.x,
          parameterSet.cameraRotation.y,
          parameterSet.cameraRotation.z
        )
      };
      
      // Get mode name for display
      const modeName = this.getModeName(parameterSet.mode);
      console.log(`🎯 Parameters: ${modeName}, ${renderParams.batchSize} points, ${parameterSet.projectionType}`);
      
      console.log(`🎯 Generating ${renderParams.batchSize.toLocaleString()} points...`);
      const result = this.engine.generateBatch(constants, renderParams);
      
      console.log(`✅ Generated ${result.points.length.toLocaleString()} points`);
      
      // Create image renderer
      const baseScale = 150.0;
      const baseSize = 800;
      const imageSize = parameterSet.imageSize;
      const scaleFactor = imageSize.width / baseSize;
      const scale = baseScale * scaleFactor;
      
      const imageConfig = {
        width: imageSize.width,
        height: imageSize.height,
        scale: scale,
        offsetX: imageSize.width / 2,
        offsetY: imageSize.height / 2,
        blurRadius: 0.75,
        normalizationMode: 'logarithmic'
      };
      
      const modeNameDisplay = modeName.toLowerCase().replace(/\s+/g, '_');
      const projectionName = parameterSet.projectionType.toLowerCase();
      const batchSize = parameterSet.batchSize;
      const filename = `uniform_${index.toString().padStart(4, '0')}_${modeNameDisplay}_${projectionName}_${batchSize}pts.png`;
      
      const imagePath = path.join(outputDir, filename);
      const renderer = new SimplePNGRenderer(imageConfig);
      
      console.log(`🖼️  Rendering to PNG...`);
      const renderResult = await renderer.renderPointsToPNG(result.points, imagePath);
      
      console.log(`💾 PNG saved: ${filename}`);
      
      // Save parameter file with matching prefix
      const parameterFilename = this.saveParameterFile(parameterSet, filename, outputDir);
      console.log(`📋 Parameters saved: ${parameterFilename}`);
      
      console.log(`📊 Statistics: min(${renderResult.statistics.min.r.toFixed(1)}, ${renderResult.statistics.min.g.toFixed(1)}, ${renderResult.statistics.min.b.toFixed(1)}) max(${renderResult.statistics.max.r.toFixed(1)}, ${renderResult.statistics.max.g.toFixed(1)}, ${renderResult.statistics.max.b.toFixed(1)})`);
      
      return {
        index,
        filename,
        parameterFilename,
        imagePath,
        parameterPath: path.join(outputDir, parameterFilename),
        parameterSet,
        result: renderResult,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Error generating uniform image ${index}:`, error.message);
      return null;
    }
  }

  /**
   * Generate mass collection of images using uniform parameters
   */
  async generateUniformMassCollection(count = 1000) {
    console.log(`🎲 Uniform Mass Generator`);
    console.log(`=========================`);
    console.log(`Generating ${count} images with uniform parameter sampling...`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '..', 'output', 'uniform_mass_generation', timestamp);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`📁 Output directory: ${outputDir}`);
    
    // Generate uniform parameters
    console.log(`\n🎯 Generating uniform parameters...`);
    const parameterSets = this.parameterGenerator.generateParameterBatch(count);
    
    const startTime = Date.now();
    let successCount = 0;
    
    // Generate images
    for (let i = 0; i < count; i++) {
      const imageResult = await this.generateImage(i + 1, parameterSets[i], outputDir);
      
      if (imageResult) {
        this.generatedImages.push(imageResult);
        successCount++;
        
        // Progress update every 10 images
        if ((i + 1) % 10 === 0) {
          const elapsed = Date.now() - startTime;
          const rate = (i + 1) / (elapsed / 1000);
          console.log(`\n📊 Progress: ${i + 1}/${count} images (${successCount} successful) - Rate: ${rate.toFixed(1)} images/sec`);
        }
      }
    }
    
    // Save collection summary
    await this.saveCollectionSummary(outputDir, count, successCount, startTime, parameterSets);
    
    const totalTime = Date.now() - startTime;
    
    console.log(`\n🎉 Uniform mass generation complete!`);
    console.log(`📊 Generated ${successCount}/${count} images successfully`);
    console.log(`📋 Generated ${successCount} parameter files`);
    console.log(`⏱️  Total time: ${Math.round(totalTime / 1000)}s`);
    console.log(`📈 Average rate: ${(successCount / (totalTime / 1000)).toFixed(1)} images/sec`);
    console.log(`📁 All files saved to: ${outputDir}`);
    
    return outputDir;
  }

  /**
   * Save collection summary
   */
  async saveCollectionSummary(outputDir, requestedCount, successCount, startTime, parameterSets) {
    const totalTime = Date.now() - startTime;
    
    const summary = {
      timestamp: new Date().toISOString(),
      tool: 'Uniform Mass Generator',
      requestedCount,
      successCount,
      successRate: (successCount / requestedCount * 100).toFixed(1) + '%',
      totalTime: totalTime,
      averageRate: (successCount / (totalTime / 1000)).toFixed(1) + ' images/sec',
      samplingMethod: 'uniform',
      images: this.generatedImages,
      parameterStatistics: this.parameterGenerator.calculateParameterStatistics(parameterSets),
      imageStatistics: this.calculateImageStatistics()
    };
    
    const summaryPath = path.join(outputDir, 'uniform_mass_generation_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📋 Collection summary saved to: ${summaryPath}`);
  }

  /**
   * Calculate image collection statistics
   */
  calculateImageStatistics() {
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
      const modeName = this.getModeName(image.parameterSet.mode);
      stats.modeDistribution[modeName] = (stats.modeDistribution[modeName] || 0) + 1;
      
      // Projection distribution
      const projectionName = image.parameterSet.projectionType;
      stats.projectionDistribution[projectionName] = (stats.projectionDistribution[projectionName] || 0) + 1;
      
      // Point count ranges
      const pointCount = image.parameterSet.batchSize;
      if (pointCount >= 500 && pointCount < 2000) stats.pointCountRanges.low++;
      else if (pointCount >= 2000 && pointCount < 5000) stats.pointCountRanges.medium++;
      else if (pointCount >= 5000 && pointCount < 8000) stats.pointCountRanges.high++;
      else if (pointCount >= 8000 && pointCount <= 10000) stats.pointCountRanges.veryHigh++;
      
      // Image size distribution
      const imageSize = image.parameterSet.imageSize;
      const sizeKey = `${imageSize.width}x${imageSize.height}`;
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
    console.log(`\n📊 Uniform Mass Generation Statistics`);
    console.log(`=====================================`);
    
    if (this.generatedImages.length === 0) {
      console.log('No images generated yet.');
      return;
    }
    
    const imageStats = this.calculateImageStatistics();
    
    console.log(`🎯 Mode Distribution:`);
    Object.entries(imageStats.modeDistribution).forEach(([mode, count]) => {
      console.log(`  ${mode}: ${count} images`);
    });
    
    console.log(`\n📐 Projection Distribution:`);
    Object.entries(imageStats.projectionDistribution).forEach(([projection, count]) => {
      console.log(`  ${projection}: ${count} images`);
    });
    
    console.log(`\n📏 Point Count Ranges:`);
    Object.entries(imageStats.pointCountRanges).forEach(([range, count]) => {
      console.log(`  ${range}: ${count} images`);
    });
    
    console.log(`\n🖼️  Image Size Distribution:`);
    Object.entries(imageStats.imageSizeDistribution).forEach(([size, count]) => {
      console.log(`  ${size}: ${count} images`);
    });
    
    console.log(`\n🎨 Color Range Statistics:`);
    console.log(`  Min: (${imageStats.colorRangeStats.min.r.toFixed(1)}, ${imageStats.colorRangeStats.min.g.toFixed(1)}, ${imageStats.colorRangeStats.min.b.toFixed(1)})`);
    console.log(`  Max: (${imageStats.colorRangeStats.max.r.toFixed(1)}, ${imageStats.colorRangeStats.max.g.toFixed(1)}, ${imageStats.colorRangeStats.max.b.toFixed(1)})`);
    console.log(`  Avg Max: (${imageStats.colorRangeStats.avgMax.r.toFixed(1)}, ${imageStats.colorRangeStats.avgMax.g.toFixed(1)}, ${imageStats.colorRangeStats.avgMax.b.toFixed(1)})`);
  }
}

/**
 * Main execution function
 */
async function main() {
  const generator = new UniformMassGenerator();
  
  // Get count from command line argument or use default
  const count = process.argv[2] ? parseInt(process.argv[2]) : 100;
  
  if (isNaN(count) || count <= 0) {
    console.error('❌ Invalid count. Please provide a positive integer.');
    process.exit(1);
  }
  
  console.log(`🚀 Starting uniform mass generation...`);
  console.log(`Target: ${count} images with uniform parameter sampling`);
  
  const outputDir = await generator.generateUniformMassCollection(count);
  
  // Print statistics
  generator.printCollectionStatistics();
  
  console.log(`\n🎯 UNIFORM MASS GENERATION COMPLETE!`);
  console.log(`===================================`);
  console.log(`📁 All results saved to: ${outputDir}`);
  console.log(`📊 Generated: ${generator.generatedImages.length} images`);
  console.log(`📋 Generated: ${generator.generatedImages.length} parameter files`);
  console.log(`🎲 Sampling method: Uniform (systematic parameter space exploration)`);
  
  console.log(`\n🎯 NEXT STEPS`);
  console.log(`=============`);
  console.log(`1. Review the generated images for visual patterns`);
  console.log(`2. Analyze parameter distributions for uniformity validation`);
  console.log(`3. Use AI analysis to identify high-quality parameter regions`);
  console.log(`4. Use for optimization algorithms and research applications`);
  console.log(`5. Generate larger batches (10,000+) for comprehensive exploration`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { UniformMassGenerator };
