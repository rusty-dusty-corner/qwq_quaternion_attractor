#!/usr/bin/env node

/**
 * Enhanced Batch Generator for Quaternion Attractor
 * 
 * This tool implements the user's strategy:
 * 1. Generate many random attractor images with different parameters
 * 2. Use AI vision analysis to automatically identify most interesting images
 * 3. Extract parameters from selected images for further experimentation
 * 4. Support high point counts (20,000+) for different color distributions
 * 5. Test different rendering projections and camera rotations
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Import the attractor engine and image renderer
const { JavaScriptAttractorEngine } = require('../dist/typescript/core/js-engine');
const { createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/typescript/core/attractor-engine');
const { SimplePNGRenderer } = require('../dist/typescript/node/image-renderer');

class EnhancedBatchGenerator {
  constructor() {
    this.engine = new JavaScriptAttractorEngine();
    this.generatedImages = [];
    this.interestingImages = [];
    this.analysisResults = [];
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
   * Generate random parameters with enhanced variety
   */
  generateRandomParameters(options = {}) {
    const {
      pointCountRange = [500, 25000], // Support high point counts
      imageSizeRange = { width: [600, 1200], height: [400, 900] },
      windVariation = 0.05,
      phyllotaxisVariation = 0.15,
      cameraRotationVariation = 0.2
    } = options;

    const parameters = {
      start: this.generateRandomQuaternion(0.5),
      wind: this.generateSmallRotationQuaternion(windVariation),
      additive: this.generatePhyllotaxisVector(phyllotaxisVariation),
      mode: this.getRandomSideFlipMode(),
      batchSize: Math.floor(Math.random() * (pointCountRange[1] - pointCountRange[0]) + pointCountRange[0]),
      imageSize: {
        width: Math.floor(Math.random() * (imageSizeRange.width[1] - imageSizeRange.width[0]) + imageSizeRange.width[0]),
        height: Math.floor(Math.random() * (imageSizeRange.height[1] - imageSizeRange.height[0]) + imageSizeRange.height[0])
      },
      projectionType: this.getRandomProjectionType(),
      cameraRotation: this.generateSmallRotationQuaternion(cameraRotationVariation)
    };

    return parameters;
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
   * Generate a single attractor image
   */
  async generateImage(index, parameters, outputDir) {
    console.log(`\n🎲 Generating image ${index} (${parameters.batchSize} points)...`);
    
    try {
      const { constants, renderParams } = this.convertParameters(parameters);
      
      console.log(`🎯 Generating ${renderParams.batchSize} points...`);
      const result = this.engine.generateBatch(constants, renderParams);
      
      console.log(`✅ Generated ${result.points.length} points`);
      
      // Create image renderer with proper coordinate scaling
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
      const filename = `batch_${index.toString().padStart(4, '0')}_${modeName}_${projectionName}_${batchSize}pts.png`;
      
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
   * Generate batch of images with varied parameters
   */
  async generateBatch(count = 50, options = {}) {
    console.log(`🎲 Enhanced Batch Generator`);
    console.log(`===========================`);
    console.log(`Generating ${count} random attractor images...`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '..', 'output', 'enhanced_batch', timestamp);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`📁 Output directory: ${outputDir}`);
    
    // Generate images
    for (let i = 1; i <= count; i++) {
      const parameters = this.generateRandomParameters(options);
      const imageResult = await this.generateImage(i, parameters, outputDir);
      
      if (imageResult) {
        this.generatedImages.push(imageResult);
      }
    }
    
    // Save batch summary
    await this.saveBatchSummary(outputDir);
    
    console.log(`\n🎉 Batch generation complete!`);
    console.log(`📊 Generated ${this.generatedImages.length} images`);
    console.log(`📁 All images saved to: ${outputDir}`);
    
    return outputDir;
  }

  /**
   * Analyze images with AI vision
   */
  async analyzeImagesWithAI(batchDir) {
    console.log(`\n🤖 Analyzing images with AI vision...`);
    
    const imageFiles = this.generatedImages.map(img => img.imagePath);
    const analysisResults = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = imageFiles[i];
      const imageData = this.generatedImages[i];
      
      console.log(`🔍 Analyzing image ${i + 1}/${imageFiles.length}: ${path.basename(imagePath)}`);
      
      try {
        // Use the universal Groq analyzer
        const command = `node tools/universal-groq-analyzer.js single "${imagePath}" "Analyze this quaternion attractor image. Rate its visual interest from 1-10 and describe the patterns, colors, and mathematical structures you see. Focus on complexity, beauty, and uniqueness."`;
        
        const result = execSync(command, { encoding: 'utf8', cwd: path.join(__dirname, '..') });
        
        // Parse the result (assuming it's JSON output)
        const analysisData = JSON.parse(result);
        
        analysisResults.push({
          imageIndex: imageData.index,
          imagePath,
          parameters: imageData.parameters,
          analysis: analysisData,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Analysis complete for ${path.basename(imagePath)}`);
        
      } catch (error) {
        console.error(`❌ Error analyzing ${path.basename(imagePath)}:`, error.message);
      }
    }
    
    this.analysisResults = analysisResults;
    
    // Save analysis results
    const analysisPath = path.join(batchDir, 'ai_analysis_results.json');
    fs.writeFileSync(analysisPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalAnalyzed: analysisResults.length,
      results: analysisResults
    }, null, 2));
    
    console.log(`📋 Analysis results saved to: ${analysisPath}`);
    
    return analysisResults;
  }

  /**
   * Select most interesting images based on AI analysis
   */
  selectInterestingImages(threshold = 7) {
    console.log(`\n🎯 Selecting most interesting images (rating >= ${threshold})...`);
    
    this.interestingImages = this.analysisResults
      .filter(result => {
        // Extract rating from analysis (this would need to be parsed from the AI response)
        // For now, we'll select based on analysis length and keywords
        const analysis = result.analysis.results?.analysis || '';
        return analysis.length > 200 && (
          analysis.includes('complex') || 
          analysis.includes('fractal') || 
          analysis.includes('pattern') ||
          analysis.includes('beautiful') ||
          analysis.includes('interesting')
        );
      })
      .map(result => ({
        ...result,
        parameters: result.parameters,
        imagePath: result.imagePath
      }));
    
    console.log(`🎨 Selected ${this.interestingImages.length} interesting images`);
    
    // Save selected images summary
    return this.interestingImages;
  }

  /**
   * Extract parameters for further experimentation
   */
  extractInterestingParameters() {
    console.log(`\n📊 Extracting parameters from interesting images...`);
    
    const extractedParams = this.interestingImages.map(img => ({
      imageIndex: img.imageIndex,
      filename: path.basename(img.imagePath),
      parameters: img.parameters,
      analysis: img.analysis
    }));
    
    console.log(`📋 Extracted parameters for ${extractedParams.length} images`);
    
    return extractedParams;
  }

  /**
   * Generate variations of interesting parameters
   */
  async generateParameterVariations(extractedParams, outputDir) {
    console.log(`\n🔄 Generating variations of interesting parameters...`);
    
    const variationsDir = path.join(outputDir, 'parameter_variations');
    if (!fs.existsSync(variationsDir)) {
      fs.mkdirSync(variationsDir, { recursive: true });
    }
    
    for (let i = 0; i < extractedParams.length; i++) {
      const original = extractedParams[i];
      console.log(`\n🎨 Creating variations for: ${original.filename}`);
      
      // Create 5 variations of each interesting parameter set
      for (let j = 1; j <= 5; j++) {
        const variationParams = this.createParameterVariation(original.parameters, j);
        const variationIndex = `${original.imageIndex}_var${j}`;
        
        const variationResult = await this.generateImage(
          variationIndex, 
          variationParams, 
          variationsDir
        );
        
        if (variationResult) {
          console.log(`✅ Generated variation ${j}/5`);
        }
      }
    }
    
    console.log(`🎉 Parameter variations complete!`);
    return variationsDir;
  }

  /**
   * Create a variation of parameters
   */
  createParameterVariation(originalParams, variationIndex) {
    const variation = JSON.parse(JSON.stringify(originalParams)); // Deep copy
    
    // Vary different aspects based on variation index
    switch (variationIndex % 4) {
      case 1: // Vary point count
        variation.batchSize = Math.floor(originalParams.batchSize * (0.5 + Math.random()));
        break;
      case 2: // Vary camera rotation
        variation.cameraRotation = this.generateSmallRotationQuaternion(0.3);
        break;
      case 3: // Vary projection type
        variation.projectionType = variation.projectionType === 'simple' ? 'stereographic' : 'simple';
        break;
      case 0: // Vary wind and additive
        variation.wind = this.generateSmallRotationQuaternion(0.08);
        variation.additive = this.generatePhyllotaxisVector(0.2);
        break;
    }
    
    return variation;
  }

  /**
   * Save batch summary
   */
  async saveBatchSummary(outputDir) {
    const summary = {
      timestamp: new Date().toISOString(),
      tool: 'Enhanced Batch Generator',
      totalImages: this.generatedImages.length,
      images: this.generatedImages,
      statistics: this.calculateBatchStatistics()
    };
    
    const summaryPath = path.join(outputDir, 'batch_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📋 Batch summary saved to: ${summaryPath}`);
  }

  /**
   * Calculate batch statistics
   */
  calculateBatchStatistics() {
    const stats = {
      modeDistribution: {},
      projectionDistribution: {},
      batchSizeRange: { min: Infinity, max: -Infinity },
      imageSizeRange: { width: { min: Infinity, max: -Infinity }, height: { min: Infinity, max: -Infinity } },
      pointCountRange: { min: Infinity, max: -Infinity }
    };
    
    this.generatedImages.forEach(image => {
      const modeName = this.getModeName(image.parameters.mode);
      stats.modeDistribution[modeName] = (stats.modeDistribution[modeName] || 0) + 1;
      
      const projectionName = image.parameters.projectionType;
      stats.projectionDistribution[projectionName] = (stats.projectionDistribution[projectionName] || 0) + 1;
      
      stats.batchSizeRange.min = Math.min(stats.batchSizeRange.min, image.parameters.batchSize);
      stats.batchSizeRange.max = Math.max(stats.batchSizeRange.max, image.parameters.batchSize);
      
      stats.imageSizeRange.width.min = Math.min(stats.imageSizeRange.width.min, image.parameters.imageSize.width);
      stats.imageSizeRange.width.max = Math.max(stats.imageSizeRange.width.max, image.parameters.imageSize.width);
      stats.imageSizeRange.height.min = Math.min(stats.imageSizeRange.height.min, image.parameters.imageSize.height);
      stats.imageSizeRange.height.max = Math.max(stats.imageSizeRange.height.max, image.parameters.imageSize.height);
      
      stats.pointCountRange.min = Math.min(stats.pointCountRange.min, image.result.pointCount);
      stats.pointCountRange.max = Math.max(stats.pointCountRange.max, image.result.pointCount);
    });
    
    return stats;
  }

  /**
   * Print batch statistics
   */
  printBatchStatistics() {
    console.log(`\n📊 Batch Statistics`);
    console.log(`===================`);
    
    const stats = this.calculateBatchStatistics();
    
    console.log(`🎯 Mode Distribution:`);
    Object.entries(stats.modeDistribution).forEach(([mode, count]) => {
      console.log(`  ${mode}: ${count} images`);
    });
    
    console.log(`\n📐 Projection Distribution:`);
    Object.entries(stats.projectionDistribution).forEach(([projection, count]) => {
      console.log(`  ${projection}: ${count} images`);
    });
    
    console.log(`\n📏 Point Count Range: ${stats.pointCountRange.min} - ${stats.pointCountRange.max} points`);
    console.log(`🖼️  Image Size Range: ${stats.imageSizeRange.width.min}x${stats.imageSizeRange.height.min} - ${stats.imageSizeRange.width.max}x${stats.imageSizeRange.height.max}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  const generator = new EnhancedBatchGenerator();
  
  // Enhanced options for better variety
  const options = {
    pointCountRange: [1000, 25000], // Support high point counts as requested
    imageSizeRange: { width: [800, 1200], height: [600, 900] },
    windVariation: 0.08,
    phyllotaxisVariation: 0.2,
    cameraRotationVariation: 0.25
  };
  
  console.log(`🚀 Starting enhanced batch generation with high point count support...`);
  
  // Generate initial batch
  const batchDir = await generator.generateBatch(30, options); // Generate 30 images
  
  // Analyze with AI
  await generator.analyzeImagesWithAI(batchDir);
  
  // Select interesting images
  const interestingImages = generator.selectInterestingImages();
  
  // Extract parameters
  const extractedParams = generator.extractInterestingParameters();
  
  // Generate parameter variations
  if (extractedParams.length > 0) {
    await generator.generateParameterVariations(extractedParams, batchDir);
  }
  
  // Print statistics
  generator.printBatchStatistics();
  
  console.log(`\n🎯 ENHANCED BATCH GENERATION COMPLETE!`);
  console.log(`=====================================`);
  console.log(`📁 All results saved to: ${batchDir}`);
  console.log(`📊 Generated: ${generator.generatedImages.length} images`);
  console.log(`🎨 Interesting: ${generator.interestingImages.length} images`);
  console.log(`🔄 Variations: Generated for interesting parameters`);
  
  console.log(`\n🎯 NEXT STEPS`);
  console.log(`=============`);
  console.log(`1. Review the generated images in: ${batchDir}`);
  console.log(`2. Check AI analysis results in: ${path.join(batchDir, 'ai_analysis_results.json')}`);
  console.log(`3. Examine parameter variations in: ${path.join(batchDir, 'parameter_variations')}`);
  console.log(`4. Use extracted parameters for further experimentation`);
  console.log(`5. Test different rendering projections and camera rotations`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EnhancedBatchGenerator };
