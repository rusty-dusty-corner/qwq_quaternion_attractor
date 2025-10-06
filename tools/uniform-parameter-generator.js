#!/usr/bin/env node

/**
 * Uniform Parameter Generator for Quaternion Attractor
 * 
 * This tool generates parameters using mathematically sound uniform sampling
 * techniques for systematic parameter space exploration.
 * 
 * Key Features:
 * - Uniform sampling on 4D sphere for quaternions (start, wind, camera rotation)
 * - Uniform sampling in 3D ball with squared distance distribution for additive vectors
 * - Complete coverage of parameter space without bias
 * - Foundation for optimization algorithms and systematic exploration
 */

const path = require('path');
const fs = require('fs');

// Import the attractor engine components
const { createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/typescript/core/attractor-engine');

class UniformParameterGenerator {
  constructor() {
    this.generatedParameters = [];
  }

  /**
   * Generate uniform random point on 4D sphere (for quaternions)
   * Uses rejection sampling with distance filtering to ensure uniform distribution
   */
  generateUniformQuaternion() {
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      // Generate 4 random floats between -1 and 1
      const w = (Math.random() - 0.5) * 2; // Range: [-1, 1]
      const x = (Math.random() - 0.5) * 2; // Range: [-1, 1]
      const y = (Math.random() - 0.5) * 2; // Range: [-1, 1]
      const z = (Math.random() - 0.5) * 2; // Range: [-1, 1]
      
      // Calculate distance from origin
      const distance = Math.sqrt(w * w + x * x + y * y + z * z);
      
      // Reject if outside valid range (artifacts filtering)
      if (distance > 1.0 || distance < 0.1) {
        attempts++;
        continue; // Discard and try again
      }
      
      // Normalize to unit quaternion (uniform on 4D sphere)
      const normalizedW = w / distance;
      const normalizedX = x / distance;
      const normalizedY = y / distance;
      const normalizedZ = z / distance;
      
      return createQuaternion(normalizedW, normalizedX, normalizedY, normalizedZ);
    }
    
    // Fallback if too many rejections (should be extremely rare)
    console.warn('Warning: Maximum attempts reached for uniform quaternion generation, using fallback');
    return createQuaternion(1, 0, 0, 0); // Unit quaternion fallback
  }

  /**
   * Generate uniform random point in 3D ball with squared distance distribution
   * Creates more points near center (good for attractor dynamics)
   */
  generateUniformAdditiveVector() {
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      // Generate 3 random floats between -1 and 1
      const x = (Math.random() - 0.5) * 2; // Range: [-1, 1]
      const y = (Math.random() - 0.5) * 2; // Range: [-1, 1]
      const z = (Math.random() - 0.5) * 2; // Range: [-1, 1]
      
      // Calculate distance from origin
      const distance = Math.sqrt(x * x + y * y + z * z);
      
      // Reject if outside unit ball
      if (distance > 1.0) {
        attempts++;
        continue; // Discard and try again
      }
      
      // Handle edge case of zero distance
      if (distance < 1e-10) {
        return createVector3D(0, 0, 0);
      }
      
      // Normalize to unit sphere
      const normalizedX = x / distance;
      const normalizedY = y / distance;
      const normalizedZ = z / distance;
      
      // Apply squared distance distribution
      // This creates more points near center (good for attractor dynamics)
      const squaredDistance = distance * distance;
      
      // Reconstruct vector with squared distance
      const finalX = normalizedX * squaredDistance;
      const finalY = normalizedY * squaredDistance;
      const finalZ = normalizedZ * squaredDistance;
      
      return createVector3D(finalX, finalY, finalZ);
    }
    
    // Fallback if too many rejections (should be extremely rare)
    console.warn('Warning: Maximum attempts reached for uniform additive vector generation, using fallback');
    return createVector3D(0, 0, 0); // Zero vector fallback
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
   * Get random point count (uniform in range)
   */
  getRandomPointCount() {
    // Uniform distribution in range [500, 10000]
    const minPoints = 500;
    const maxPoints = 10000;
    return Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints;
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
    // For now, only simple projection works reliably
    // TODO: Fix stereographic projection bug
    return 'simple';
    
    // Future implementation:
    // return Math.random() > 0.5 ? 'simple' : 'stereographic';
  }

  /**
   * Generate uniform random parameters
   */
  generateUniformParameters() {
    const parameters = {
      start: this.generateUniformQuaternion(),
      wind: this.generateUniformQuaternion(),
      additive: this.generateUniformAdditiveVector(),
      mode: this.getRandomSideFlipMode(),
      batchSize: this.getRandomPointCount(),
      imageSize: this.getRandomImageSize(),
      projectionType: this.getRandomProjectionType(),
      cameraRotation: this.generateUniformQuaternion()
    };

    return parameters;
  }

  /**
   * Generate multiple parameter sets
   */
  generateParameterBatch(count = 100) {
    console.log(`🎲 Uniform Parameter Generator`);
    console.log(`============================`);
    console.log(`Generating ${count} uniform parameter sets...`);
    
    const startTime = Date.now();
    const parameters = [];
    
    for (let i = 0; i < count; i++) {
      if (i % 10 === 0) {
        console.log(`📊 Generating parameter set ${i + 1}/${count}...`);
      }
      
      const paramSet = this.generateUniformParameters();
      parameters.push(paramSet);
    }
    
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Generated ${count} parameter sets in ${totalTime}ms`);
    console.log(`📈 Average rate: ${(count / (totalTime / 1000)).toFixed(1)} parameters/sec`);
    
    return parameters;
  }

  /**
   * Save parameters to JSON file
   */
  saveParameters(parameters, outputPath) {
    const parameterData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        tool: 'Uniform Parameter Generator',
        version: '1.0.0',
        samplingMethod: 'uniform',
        count: parameters.length
      },
      parameters: parameters.map(param => ({
        constants: {
          start: {
            w: param.start.w,
            x: param.start.x,
            y: param.start.y,
            z: param.start.z
          },
          wind: {
            w: param.wind.w,
            x: param.wind.x,
            y: param.wind.y,
            z: param.wind.z
          },
          additive: {
            x: param.additive.x,
            y: param.additive.y,
            z: param.additive.z
          },
          mode: param.mode,
          modeName: this.getModeName(param.mode)
        },
        renderParams: {
          batchSize: param.batchSize,
          projectionType: param.projectionType,
          imageSize: param.imageSize,
          cameraRotation: {
            w: param.cameraRotation.w,
            x: param.cameraRotation.x,
            y: param.cameraRotation.y,
            z: param.cameraRotation.z
          }
        }
      })),
      statistics: this.calculateParameterStatistics(parameters)
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(parameterData, null, 2));
    console.log(`💾 Parameters saved to: ${outputPath}`);
    
    return parameterData;
  }

  /**
   * Calculate parameter statistics for validation
   */
  calculateParameterStatistics(parameters) {
    const stats = {
      modeDistribution: {},
      projectionDistribution: {},
      pointCountStats: {
        min: Infinity,
        max: -Infinity,
        mean: 0
      },
      imageSizeDistribution: {},
      quaternionStats: {
        start: { magnitude: { min: Infinity, max: -Infinity, mean: 0 } },
        wind: { magnitude: { min: Infinity, max: -Infinity, mean: 0 } },
        cameraRotation: { magnitude: { min: Infinity, max: -Infinity, mean: 0 } }
      },
      additiveStats: {
        magnitude: { min: Infinity, max: -Infinity, mean: 0 },
        distanceDistribution: { nearCenter: 0, midRange: 0, farFromCenter: 0 }
      }
    };
    
    parameters.forEach(param => {
      // Mode distribution
      const modeName = this.getModeName(param.mode);
      stats.modeDistribution[modeName] = (stats.modeDistribution[modeName] || 0) + 1;
      
      // Projection distribution
      stats.projectionDistribution[param.projectionType] = (stats.projectionDistribution[param.projectionType] || 0) + 1;
      
      // Point count statistics
      stats.pointCountStats.min = Math.min(stats.pointCountStats.min, param.batchSize);
      stats.pointCountStats.max = Math.max(stats.pointCountStats.max, param.batchSize);
      stats.pointCountStats.mean += param.batchSize;
      
      // Image size distribution
      const sizeKey = `${param.imageSize.width}x${param.imageSize.height}`;
      stats.imageSizeDistribution[sizeKey] = (stats.imageSizeDistribution[sizeKey] || 0) + 1;
      
      // Quaternion magnitude statistics
      const quaternionMagnitude = (q) => Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
      
      ['start', 'wind', 'cameraRotation'].forEach(quatName => {
        const magnitude = quaternionMagnitude(param[quatName]);
        stats.quaternionStats[quatName].magnitude.min = Math.min(stats.quaternionStats[quatName].magnitude.min, magnitude);
        stats.quaternionStats[quatName].magnitude.max = Math.max(stats.quaternionStats[quatName].magnitude.max, magnitude);
        stats.quaternionStats[quatName].magnitude.mean += magnitude;
      });
      
      // Additive vector statistics
      const additiveMagnitude = Math.sqrt(param.additive.x * param.additive.x + param.additive.y * param.additive.y + param.additive.z * param.additive.z);
      stats.additiveStats.magnitude.min = Math.min(stats.additiveStats.magnitude.min, additiveMagnitude);
      stats.additiveStats.magnitude.max = Math.max(stats.additiveStats.magnitude.max, additiveMagnitude);
      stats.additiveStats.magnitude.mean += additiveMagnitude;
      
      // Distance distribution analysis
      if (additiveMagnitude < 0.3) {
        stats.additiveStats.distanceDistribution.nearCenter++;
      } else if (additiveMagnitude < 0.7) {
        stats.additiveStats.distanceDistribution.midRange++;
      } else {
        stats.additiveStats.distanceDistribution.farFromCenter++;
      }
    });
    
    // Calculate means
    const count = parameters.length;
    stats.pointCountStats.mean /= count;
    ['start', 'wind', 'cameraRotation'].forEach(quatName => {
      stats.quaternionStats[quatName].magnitude.mean /= count;
    });
    stats.additiveStats.magnitude.mean /= count;
    
    return stats;
  }

  /**
   * Print parameter statistics
   */
  printStatistics(statistics) {
    console.log(`\n📊 Parameter Statistics`);
    console.log(`======================`);
    
    console.log(`🎯 Mode Distribution:`);
    Object.entries(statistics.modeDistribution).forEach(([mode, count]) => {
      console.log(`  ${mode}: ${count} parameters`);
    });
    
    console.log(`\n📐 Projection Distribution:`);
    Object.entries(statistics.projectionDistribution).forEach(([projection, count]) => {
      console.log(`  ${projection}: ${count} parameters`);
    });
    
    console.log(`\n📏 Point Count Statistics:`);
    console.log(`  Min: ${statistics.pointCountStats.min.toLocaleString()}`);
    console.log(`  Max: ${statistics.pointCountStats.max.toLocaleString()}`);
    console.log(`  Mean: ${statistics.pointCountStats.mean.toFixed(0)}`);
    
    console.log(`\n🖼️  Image Size Distribution:`);
    Object.entries(statistics.imageSizeDistribution).forEach(([size, count]) => {
      console.log(`  ${size}: ${count} parameters`);
    });
    
    console.log(`\n🔄 Quaternion Magnitude Statistics:`);
    ['start', 'wind', 'cameraRotation'].forEach(quatName => {
      const mag = statistics.quaternionStats[quatName].magnitude;
      console.log(`  ${quatName}: min(${mag.min.toFixed(3)}) max(${mag.max.toFixed(3)}) mean(${mag.mean.toFixed(3)})`);
    });
    
    console.log(`\n📐 Additive Vector Statistics:`);
    const addMag = statistics.additiveStats.magnitude;
    console.log(`  Magnitude: min(${addMag.min.toFixed(3)}) max(${addMag.max.toFixed(3)}) mean(${addMag.mean.toFixed(3)})`);
    
    const dist = statistics.additiveStats.distanceDistribution;
    console.log(`  Distance Distribution:`);
    console.log(`    Near center (<0.3): ${dist.nearCenter} (${(dist.nearCenter / (dist.nearCenter + dist.midRange + dist.farFromCenter) * 100).toFixed(1)}%)`);
    console.log(`    Mid range (0.3-0.7): ${dist.midRange} (${(dist.midRange / (dist.nearCenter + dist.midRange + dist.farFromCenter) * 100).toFixed(1)}%)`);
    console.log(`    Far from center (>0.7): ${dist.farFromCenter} (${(dist.farFromCenter / (dist.nearCenter + dist.midRange + dist.farFromCenter) * 100).toFixed(1)}%)`);
  }
}

/**
 * Main execution function
 */
async function main() {
  const generator = new UniformParameterGenerator();
  
  // Get count from command line argument or use default
  const count = process.argv[2] ? parseInt(process.argv[2]) : 100;
  
  if (isNaN(count) || count <= 0) {
    console.error('❌ Invalid count. Please provide a positive integer.');
    process.exit(1);
  }
  
  console.log(`🚀 Starting uniform parameter generation...`);
  console.log(`Target: ${count} uniform parameter sets`);
  
  // Generate parameters
  const parameters = generator.generateParameterBatch(count);
  
  // Create output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(__dirname, '..', 'output', 'uniform_parameters', timestamp);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save parameters
  const outputPath = path.join(outputDir, 'uniform_parameters.json');
  const parameterData = generator.saveParameters(parameters, outputPath);
  
  // Print statistics
  generator.printStatistics(parameterData.statistics);
  
  console.log(`\n🎯 UNIFORM PARAMETER GENERATION COMPLETE!`);
  console.log(`=========================================`);
  console.log(`📁 All parameters saved to: ${outputDir}`);
  console.log(`📊 Generated: ${count} uniform parameter sets`);
  console.log(`📋 Sampling method: Uniform (mathematically sound)`);
  
  console.log(`\n🎯 NEXT STEPS`);
  console.log(`=============`);
  console.log(`1. Use these parameters for systematic image generation`);
  console.log(`2. Analyze parameter distributions for uniformity validation`);
  console.log(`3. Generate images using uniform-mass-generator.js`);
  console.log(`4. Use for optimization algorithms and research applications`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { UniformParameterGenerator };

