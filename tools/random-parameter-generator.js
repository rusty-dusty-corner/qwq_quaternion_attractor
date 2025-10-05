#!/usr/bin/env node

/**
 * Random Parameter Generator for Quaternion Attractor
 * 
 * This tool generates PNG images with random input parameters to:
 * 1. Explore the full range of the quaternion attractor system
 * 2. Test the robustness of the logarithmic normalization fix
 * 3. Discover new and interesting mathematical patterns
 * 4. Generate a diverse collection of attractor images
 */

const path = require('path');
const fs = require('fs');

// Import the attractor engine
const { JavaScriptAttractorEngine } = require('../dist/typescript/core/js-engine');
const { createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/typescript/core/attractor-engine');

class RandomParameterGenerator {
  constructor() {
    this.engine = new JavaScriptAttractorEngine();
    this.generatedImages = [];
  }

  /**
   * Generate random quaternion with controlled magnitude
   */
  generateRandomQuaternion(maxMagnitude = 1.0) {
    // Generate random components with controlled magnitude
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
   * Generate small rotation quaternion (close to unit quaternion)
   * This is for the wind parameter - should be small rotations
   */
  generateSmallRotationQuaternion(maxAngle = 0.1) {
    // Generate small random rotation around random axis
    const angle = Math.random() * maxAngle; // Small angle in radians
    const axisX = (Math.random() - 0.5) * 2; // Random axis direction
    const axisY = (Math.random() - 0.5) * 2;
    const axisZ = (Math.random() - 0.5) * 2;
    
    // Normalize axis
    const axisLength = Math.sqrt(axisX * axisX + axisY * axisY + axisZ * axisZ);
    const normalizedX = axisX / axisLength;
    const normalizedY = axisY / axisLength;
    const normalizedZ = axisZ / axisLength;
    
    // Create rotation quaternion
    const halfAngle = angle / 2;
    const w = Math.cos(halfAngle);
    const x = normalizedX * Math.sin(halfAngle);
    const y = normalizedY * Math.sin(halfAngle);
    const z = normalizedZ * Math.sin(halfAngle);
    
    return createQuaternion(w, x, y, z);
  }

  /**
   * Generate random vector with controlled magnitude
   */
  generateRandomVector(maxMagnitude = 1.0) {
    const magnitude = Math.random() * maxMagnitude;
    const angle1 = Math.random() * 2 * Math.PI;
    const angle2 = Math.random() * 2 * Math.PI;
    
    const x = magnitude * Math.sin(angle1) * Math.cos(angle2);
    const y = magnitude * Math.sin(angle1) * Math.sin(angle2);
    const z = magnitude * Math.cos(angle1);
    
    return createVector3D(x, y, z);
  }

  /**
   * Generate phyllotaxis vector based on golden ratio
   * a ≈ 1/φ, b ≈ 1/φ², c ≈ 1/φ³ where φ = 1.618...
   */
  generatePhyllotaxisVector(variationPercent = 0.1) {
    const phi = 1.618033988749895; // Golden ratio
    
    // Base phyllotaxis values
    const baseA = 1 / phi;           // ≈ 0.618
    const baseB = 1 / (phi * phi);   // ≈ 0.382
    const baseC = 1 / (phi * phi * phi); // ≈ 0.236
    
    // Add random variation (±10% by default)
    const variation = variationPercent;
    const a = baseA * (1 + (Math.random() - 0.5) * 2 * variation);
    const b = baseB * (1 + (Math.random() - 0.5) * 2 * variation);
    const c = baseC * (1 + (Math.random() - 0.5) * 2 * variation);
    
    return createVector3D(a, b, c);
  }

  /**
   * Generate random parameters for attractor generation
   */
  generateRandomParameters() {
    const parameters = {
      // Random starting quaternion (small magnitude for stability)
      start: this.generateRandomQuaternion(0.5),
      
      // Small wind quaternion (close to unit quaternion for small rotations)
      wind: this.generateSmallRotationQuaternion(0.05), // Very small rotations
      
      // Phyllotaxis additive vector (golden ratio based)
      additive: this.generatePhyllotaxisVector(0.1), // ±10% variation around golden ratio
      
      // Random side flip mode
      mode: this.getRandomSideFlipMode(),
      
      // Random batch size (500-3000 points)
      batchSize: Math.floor(Math.random() * 2500) + 500,
      
      // Random image size (600x400 to 1000x800)
      imageSize: {
        width: Math.floor(Math.random() * 400) + 600,
        height: Math.floor(Math.random() * 400) + 400
      },
      
      // Random projection type
      projectionType: this.getRandomProjectionType(),
      
      // Small camera rotation (for rendering, not core algorithm)
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
   * Generate a single random attractor image
   */
  async generateRandomImage(index, outputDir) {
    console.log(`\n🎲 Generating random image ${index}...`);
    
    const parameters = this.generateRandomParameters();
    
    // Log parameters for analysis
    console.log(`📊 Parameters:`);
    console.log(`  Start: (${parameters.start.w.toFixed(3)}, ${parameters.start.x.toFixed(3)}, ${parameters.start.y.toFixed(3)}, ${parameters.start.z.toFixed(3)})`);
    console.log(`  Wind: (${parameters.wind.w.toFixed(3)}, ${parameters.wind.x.toFixed(3)}, ${parameters.wind.y.toFixed(3)}, ${parameters.wind.z.toFixed(3)})`);
    console.log(`  Additive: (${parameters.additive.x.toFixed(3)}, ${parameters.additive.y.toFixed(3)}, ${parameters.additive.z.toFixed(3)})`);
    console.log(`  Mode: ${this.getModeName(parameters.mode)}`);
    console.log(`  Batch Size: ${parameters.batchSize}`);
    console.log(`  Image Size: ${parameters.imageSize.width}x${parameters.imageSize.height}`);
    console.log(`  Projection: ${this.getProjectionName(parameters.projectionType)}`);

    try {
      // Generate attractor points
      const result = this.engine.generateBatch(parameters, parameters);
      
      console.log(`✅ Generated ${result.points.length} points`);
      console.log(`🎯 Final quaternion: (${result.finalQuaternion.w.toFixed(3)}, ${result.finalQuaternion.x.toFixed(3)}, ${result.finalQuaternion.y.toFixed(3)}, ${result.finalQuaternion.z.toFixed(3)})`);
      
      // Create filename with parameters
      const filename = this.generateFilename(index, parameters);
      const filepath = path.join(outputDir, filename);
      
      // For now, we'll save the parameters and result data
      // The actual PNG generation would need to be integrated with the image renderer
      const imageData = {
        index,
        filename,
        parameters,
        result: {
          pointCount: result.points.length,
          finalQuaternion: result.finalQuaternion,
          samplePoints: result.points.slice(0, 10) // First 10 points for analysis
        },
        timestamp: new Date().toISOString()
      };
      
      this.generatedImages.push(imageData);
      
      console.log(`💾 Saved data for: ${filename}`);
      
      return imageData;
      
    } catch (error) {
      console.error(`❌ Error generating image ${index}:`, error.message);
      return null;
    }
  }

  /**
   * Generate descriptive filename
   */
  generateFilename(index, parameters) {
    const modeName = this.getModeName(parameters.mode).toLowerCase().replace(/\s+/g, '_');
    const projectionName = this.getProjectionName(parameters.projectionType).toLowerCase();
    const batchSize = parameters.batchSize;
    
    return `random_${index.toString().padStart(3, '0')}_${modeName}_${projectionName}_${batchSize}pts.json`;
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
   * Get projection name for display
   */
  getProjectionName(projectionType) {
    switch (projectionType) {
      case ProjectionType.SIMPLE: return 'Simple';
      case ProjectionType.STEREOGRAPHIC: return 'Stereographic';
      default: return 'Unknown';
    }
  }

  /**
   * Generate multiple random images
   */
  async generateRandomCollection(count = 10) {
    console.log(`🎲 Random Parameter Generator`);
    console.log(`=============================`);
    console.log(`Generating ${count} random attractor images...`);
    
    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '..', 'output', 'random_parameters', timestamp);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`📁 Output directory: ${outputDir}`);
    
    // Generate random images
    for (let i = 1; i <= count; i++) {
      await this.generateRandomImage(i, outputDir);
    }
    
    // Save collection summary
    await this.saveCollectionSummary(outputDir);
    
    console.log(`\n🎉 Random collection generation complete!`);
    console.log(`📊 Generated ${this.generatedImages.length} images`);
    console.log(`📁 All data saved to: ${outputDir}`);
    
    return outputDir;
  }

  /**
   * Save collection summary
   */
  async saveCollectionSummary(outputDir) {
    const summary = {
      timestamp: new Date().toISOString(),
      tool: 'Random Parameter Generator',
      totalImages: this.generatedImages.length,
      images: this.generatedImages,
      statistics: this.calculateCollectionStatistics()
    };
    
    const summaryPath = path.join(outputDir, 'collection_summary.json');
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
      batchSizeRange: { min: Infinity, max: -Infinity },
      imageSizeRange: { width: { min: Infinity, max: -Infinity }, height: { min: Infinity, max: -Infinity } },
      pointCountRange: { min: Infinity, max: -Infinity }
    };
    
    this.generatedImages.forEach(image => {
      // Mode distribution
      const modeName = this.getModeName(image.parameters.mode);
      stats.modeDistribution[modeName] = (stats.modeDistribution[modeName] || 0) + 1;
      
      // Projection distribution
      const projectionName = this.getProjectionName(image.parameters.projectionType);
      stats.projectionDistribution[projectionName] = (stats.projectionDistribution[projectionName] || 0) + 1;
      
      // Batch size range
      stats.batchSizeRange.min = Math.min(stats.batchSizeRange.min, image.parameters.batchSize);
      stats.batchSizeRange.max = Math.max(stats.batchSizeRange.max, image.parameters.batchSize);
      
      // Image size range
      stats.imageSizeRange.width.min = Math.min(stats.imageSizeRange.width.min, image.parameters.imageSize.width);
      stats.imageSizeRange.width.max = Math.max(stats.imageSizeRange.width.max, image.parameters.imageSize.width);
      stats.imageSizeRange.height.min = Math.min(stats.imageSizeRange.height.min, image.parameters.imageSize.height);
      stats.imageSizeRange.height.max = Math.max(stats.imageSizeRange.height.max, image.parameters.imageSize.height);
      
      // Point count range
      stats.pointCountRange.min = Math.min(stats.pointCountRange.min, image.result.pointCount);
      stats.pointCountRange.max = Math.max(stats.pointCountRange.max, image.result.pointCount);
    });
    
    return stats;
  }

  /**
   * Analyze parameter patterns
   */
  analyzeParameterPatterns() {
    console.log(`\n📊 Parameter Pattern Analysis`);
    console.log(`=============================`);
    
    const stats = this.calculateCollectionStatistics();
    
    console.log(`🎯 Mode Distribution:`);
    Object.entries(stats.modeDistribution).forEach(([mode, count]) => {
      console.log(`  ${mode}: ${count} images`);
    });
    
    console.log(`\n📐 Projection Distribution:`);
    Object.entries(stats.projectionDistribution).forEach(([projection, count]) => {
      console.log(`  ${projection}: ${count} images`);
    });
    
    console.log(`\n📏 Batch Size Range: ${stats.batchSizeRange.min} - ${stats.batchSizeRange.max} points`);
    console.log(`🖼️  Image Size Range: ${stats.imageSizeRange.width.min}x${stats.imageSizeRange.height.min} - ${stats.imageSizeRange.width.max}x${stats.imageSizeRange.height.max}`);
    console.log(`🎯 Point Count Range: ${stats.pointCountRange.min} - ${stats.pointCountRange.max} points`);
  }
}

/**
 * Main execution
 */
async function main() {
  const generator = new RandomParameterGenerator();
  
  // Generate random collection
  const outputDir = await generator.generateRandomCollection(15);
  
  // Analyze patterns
  generator.analyzeParameterPatterns();
  
  console.log(`\n🎯 NEXT STEPS`);
  console.log(`=============`);
  console.log(`1. Review the generated parameter data in: ${outputDir}`);
  console.log(`2. Select interesting parameter combinations`);
  console.log(`3. Generate actual PNG images using the selected parameters`);
  console.log(`4. Analyze the visual patterns with Groq Vision`);
  console.log(`5. Document any new or interesting mathematical behaviors`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RandomParameterGenerator };
