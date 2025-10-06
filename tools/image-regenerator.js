#!/usr/bin/env node

/**
 * Image Regenerator for Quaternion Attractor
 * 
 * This tool regenerates images from parameter files. It can:
 * - Regenerate a single image from its parameter file
 * - Regenerate multiple images from parameter files in a directory
 * - Modify parameters (like point count, image size) before regeneration
 * - Batch regenerate all images in a collection
 */

const path = require('path');
const fs = require('fs');

// Import the attractor engine and image renderer
const { JavaScriptAttractorEngine } = require('../dist/typescript/core/js-engine');
const { createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/typescript/core/attractor-engine');
const { SimplePNGRenderer } = require('../dist/typescript/node/image-renderer');

class ImageRegenerator {
  constructor() {
    this.engine = new JavaScriptAttractorEngine();
  }

  /**
   * Load parameter file
   */
  loadParameterFile(parameterPath) {
    try {
      const parameterData = JSON.parse(fs.readFileSync(parameterPath, 'utf8'));
      console.log(`📋 Loaded parameters from: ${path.basename(parameterPath)}`);
      console.log(`🎯 Mode: ${parameterData.constants.modeName}`);
      console.log(`📊 Points: ${parameterData.renderParams.batchSize.toLocaleString()}`);
      console.log(`📐 Projection: ${parameterData.renderParams.projectionType}`);
      return parameterData;
    } catch (error) {
      console.error(`❌ Error loading parameter file ${parameterPath}:`, error.message);
      return null;
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
   * Generate filename for regenerated image
   */
  generateFilename(parameterData, outputDir, options = {}) {
    const modeName = parameterData.constants.modeName.toLowerCase().replace(/\s+/g, '_');
    const projectionName = parameterData.renderParams.projectionType.toLowerCase();
    const batchSize = options.pointCount || parameterData.renderParams.batchSize;
    const imageSize = options.imageSize || parameterData.renderParams.imageSize;
    
    const prefix = options.prefix || 'regenerated';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    const filename = `${prefix}_${timestamp}_${modeName}_${projectionName}_${batchSize}pts_${imageSize.width}x${imageSize.height}.png`;
    return path.join(outputDir, filename);
  }

  /**
   * Regenerate image from parameter file
   */
  async regenerateImage(parameterPath, outputDir, options = {}) {
    console.log(`\n🔄 Regenerating image from: ${path.basename(parameterPath)}`);
    
    try {
      const parameterData = this.loadParameterFile(parameterPath);
      if (!parameterData) {
        return null;
      }

      // Apply modifications if specified
      if (options.pointCount) {
        parameterData.renderParams.batchSize = options.pointCount;
        console.log(`🎯 Modified point count to: ${options.pointCount.toLocaleString()}`);
      }
      
      if (options.imageSize) {
        parameterData.renderParams.imageSize = options.imageSize;
        console.log(`🎯 Modified image size to: ${options.imageSize.width}x${options.imageSize.height}`);
      }

      const { constants, renderParams } = this.convertParameters(parameterData);
      
      console.log(`🎯 Generating ${renderParams.batchSize.toLocaleString()} points...`);
      const result = this.engine.generateBatch(constants, renderParams);
      
      console.log(`✅ Generated ${result.points.length.toLocaleString()} points`);
      
      // Create image renderer
      const baseScale = 150.0;
      const baseSize = 800;
      const imageSize = parameterData.renderParams.imageSize;
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
      
      const outputPath = this.generateFilename(parameterData, outputDir, options);
      const renderer = new SimplePNGRenderer(imageConfig);
      
      console.log(`🖼️  Rendering to PNG...`);
      const renderResult = await renderer.renderPointsToPNG(result.points, outputPath);
      
      const filename = path.basename(outputPath);
      console.log(`💾 PNG saved: ${filename}`);
      console.log(`📊 Statistics: min(${renderResult.statistics.min.r.toFixed(1)}, ${renderResult.statistics.min.g.toFixed(1)}, ${renderResult.statistics.min.b.toFixed(1)}) max(${renderResult.statistics.max.r.toFixed(1)}, ${renderResult.statistics.max.g.toFixed(1)}, ${renderResult.statistics.max.b.toFixed(1)})`);
      
      return {
        filename,
        outputPath,
        parameterData,
        result: renderResult,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Error regenerating image from ${parameterPath}:`, error.message);
      return null;
    }
  }

  /**
   * Find all parameter files in a directory
   */
  findParameterFiles(directory) {
    try {
      const files = fs.readdirSync(directory);
      const parameterFiles = files.filter(file => 
        file.endsWith('_params.json') || 
        (file.endsWith('.json') && !file.includes('summary') && !file.includes('groq'))
      );
      
      console.log(`📋 Found ${parameterFiles.length} parameter files in ${directory}`);
      return parameterFiles.map(file => path.join(directory, file));
    } catch (error) {
      console.error(`❌ Error reading directory ${directory}:`, error.message);
      return [];
    }
  }

  /**
   * Regenerate all images from parameter files in a directory
   */
  async regenerateBatch(parameterDirectory, outputDir, options = {}) {
    console.log(`\n🔄 Batch Regeneration`);
    console.log(`====================`);
    console.log(`Parameter directory: ${parameterDirectory}`);
    console.log(`Output directory: ${outputDir}`);
    
    const parameterFiles = this.findParameterFiles(parameterDirectory);
    
    if (parameterFiles.length === 0) {
      console.log(`❌ No parameter files found in ${parameterDirectory}`);
      return [];
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const startTime = Date.now();
    const regeneratedImages = [];
    let successCount = 0;

    for (let i = 0; i < parameterFiles.length; i++) {
      const parameterFile = parameterFiles[i];
      console.log(`\n📋 Processing ${i + 1}/${parameterFiles.length}: ${path.basename(parameterFile)}`);
      
      const result = await this.regenerateImage(parameterFile, outputDir, options);
      
      if (result) {
        regeneratedImages.push(result);
        successCount++;
      }

      // Progress update every 10 images
      if ((i + 1) % 10 === 0) {
        const elapsed = Date.now() - startTime;
        const rate = (i + 1) / (elapsed / 1000);
        console.log(`\n📊 Progress: ${i + 1}/${parameterFiles.length} (${successCount} successful) - Rate: ${rate.toFixed(1)} images/sec`);
      }
    }

    const totalTime = Date.now() - startTime;
    
    console.log(`\n🎉 Batch regeneration complete!`);
    console.log(`📊 Regenerated ${successCount}/${parameterFiles.length} images successfully`);
    console.log(`⏱️  Total time: ${Math.round(totalTime / 1000)}s`);
    console.log(`📈 Average rate: ${(successCount / (totalTime / 1000)).toFixed(1)} images/sec`);
    console.log(`📁 All regenerated images saved to: ${outputDir}`);

    return regeneratedImages;
  }

  /**
   * Regenerate specific interesting images with variations
   */
  async regenerateInterestingVariations(parameterDirectory, outputDir) {
    console.log(`\n🎨 Regenerating Interesting Variations`);
    console.log(`=====================================`);
    
    // Define variations to test
    const variations = [
      { name: 'high_points', pointCount: 15000, suffix: '15k' },
      { name: 'ultra_high', pointCount: 20000, suffix: '20k' },
      { name: 'large_image', imageSize: { width: 1600, height: 1200 }, suffix: 'large' },
      { name: 'square_hd', imageSize: { width: 1200, height: 1200 }, suffix: 'square' }
    ];

    const interestingFiles = [
      'mass_0935_flip_smallest_simple_9071pts_params.json',
      'mass_0977_flip_smallest_simple_9105pts_params.json',
      'mass_0154_flip_all_except_largest_simple_8894pts_params.json',
      'mass_0251_flip_all_except_largest_simple_9656pts_params.json'
    ];

    const allResults = [];

    for (const filename of interestingFiles) {
      const parameterPath = path.join(parameterDirectory, filename);
      
      if (!fs.existsSync(parameterPath)) {
        console.log(`⚠️  Parameter file not found: ${filename}`);
        continue;
      }

      console.log(`\n🎯 Processing ${filename}...`);

      for (const variation of variations) {
        console.log(`\n🔄 Generating variation: ${variation.name}`);
        
        const variationOptions = {
          prefix: `variation_${variation.suffix}`,
          ...(variation.pointCount && { pointCount: variation.pointCount }),
          ...(variation.imageSize && { imageSize: variation.imageSize })
        };

        const result = await this.regenerateImage(parameterPath, outputDir, variationOptions);
        
        if (result) {
          allResults.push({
            ...result,
            variation: variation.name,
            originalFile: filename
          });
        }
      }
    }

    console.log(`\n🎉 Variation generation complete!`);
    console.log(`📊 Generated ${allResults.length} variation images`);
    
    return allResults;
  }
}

/**
 * Main execution function
 */
async function main() {
  const regenerator = new ImageRegenerator();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`🔄 Image Regenerator`);
    console.log(`===================`);
    console.log(`Usage:`);
    console.log(`  node image-regenerator.js <command> [options]`);
    console.log(``);
    console.log(`Commands:`);
    console.log(`  single <parameter-file> <output-dir>     Regenerate single image`);
    console.log(`  batch <parameter-dir> <output-dir>       Regenerate all images in directory`);
    console.log(`  variations <parameter-dir> <output-dir>  Generate variations of interesting images`);
    console.log(``);
    console.log(`Examples:`);
    console.log(`  node image-regenerator.js single output/mass_generation/2025-10-05T16-19-57-373Z/mass_0935_flip_smallest_simple_9071pts_params.json output/regenerated`);
    console.log(`  node image-regenerator.js batch output/mass_generation/2025-10-05T16-19-57-373Z output/regenerated`);
    console.log(`  node image-regenerator.js variations output/mass_generation/2025-10-05T16-19-57-373Z output/variations`);
    return;
  }

  const command = args[0];
  const parameterPath = args[1];
  const outputDir = args[2];

  if (!parameterPath || !outputDir) {
    console.error(`❌ Missing required arguments. Use 'node image-regenerator.js' for usage help.`);
    return;
  }

  console.log(`🚀 Starting image regeneration...`);
  console.log(`Command: ${command}`);
  console.log(`Parameter source: ${parameterPath}`);
  console.log(`Output directory: ${outputDir}`);

  let results = [];

  switch (command) {
    case 'single':
      results = [await regenerator.regenerateImage(parameterPath, outputDir)];
      break;
      
    case 'batch':
      results = await regenerator.regenerateBatch(parameterPath, outputDir);
      break;
      
    case 'variations':
      results = await regenerator.regenerateInterestingVariations(parameterPath, outputDir);
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      return;
  }

  const successCount = results.filter(r => r !== null).length;
  
  console.log(`\n🎯 REGENERATION COMPLETE!`);
  console.log(`=========================`);
  console.log(`📁 All results saved to: ${outputDir}`);
  console.log(`📊 Successfully regenerated: ${successCount} images`);
  
  console.log(`\n🎯 NEXT STEPS`);
  console.log(`=============`);
  console.log(`1. Review the regenerated images`);
  console.log(`2. Compare with original images`);
  console.log(`3. Use parameter files for further experimentation`);
  console.log(`4. Run AI analysis on the new images`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ImageRegenerator };
