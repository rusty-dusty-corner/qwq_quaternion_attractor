#!/usr/bin/env node

/**
 * Parameter Experimenter for Quaternion Attractor
 * 
 * This tool allows you to take interesting parameters and experiment with:
 * 1. Different rendering projections (Simple, Stereographic)
 * 2. Various camera rotations
 * 3. Different image sizes and scaling
 * 4. Different point counts
 * 5. Parameter variations and mutations
 * 
 * Perfect for exploring the parameter space around interesting findings.
 */

const path = require('path');
const fs = require('fs');

// Import the attractor engine and image renderer
const { JavaScriptAttractorEngine } = require('../dist/typescript/core/js-engine');
const { createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/typescript/core/attractor-engine');
const { SimplePNGRenderer } = require('../dist/typescript/node/image-renderer');

class ParameterExperimenter {
  constructor() {
    this.engine = new JavaScriptAttractorEngine();
    this.experiments = [];
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
   * Generate camera rotation variations
   */
  generateCameraRotationVariations(baseRotation, count = 8) {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      // Different rotation angles and axes
      const angle = (i / count) * Math.PI * 2; // Full rotation around
      const axisVariation = this.generateSmallRotationQuaternion(0.3);
      
      variations.push({
        angle: angle,
        rotation: axisVariation,
        description: `Camera rotation ${i + 1}/${count} (${(angle * 180 / Math.PI).toFixed(1)}°)`
      });
    }
    
    return variations;
  }

  /**
   * Generate projection variations
   */
  generateProjectionVariations() {
    return [
      {
        type: 'simple',
        description: 'Simple Projection',
        projectionType: ProjectionType.SIMPLE
      },
      {
        type: 'stereographic',
        description: 'Stereographic Projection',
        projectionType: ProjectionType.STEREOGRAPHIC
      }
    ];
  }

  /**
   * Generate image size variations
   */
  generateImageSizeVariations() {
    return [
      { width: 800, height: 600, description: 'Standard (800x600)' },
      { width: 1200, height: 800, description: 'Wide (1200x800)' },
      { width: 1000, height: 1000, description: 'Square (1000x1000)' },
      { width: 1600, height: 900, description: 'HD (1600x900)' },
      { width: 600, height: 800, description: 'Portrait (600x800)' }
    ];
  }

  /**
   * Generate point count variations
   */
  generatePointCountVariations(baseCount) {
    const variations = [
      Math.floor(baseCount * 0.5),   // Half
      Math.floor(baseCount * 0.75),  // Three quarters
      Math.floor(baseCount * 1.25),  // 25% more
      Math.floor(baseCount * 1.5),   // 50% more
      Math.floor(baseCount * 2.0),   // Double
      Math.floor(baseCount * 3.0)    // Triple
    ];
    
    return variations.filter(count => count > 100 && count < 50000); // Reasonable range
  }

  /**
   * Generate parameter mutation
   */
  generateParameterMutation(baseParameters, mutationStrength = 0.1) {
    const mutated = JSON.parse(JSON.stringify(baseParameters)); // Deep copy
    
    // Mutate different aspects randomly
    const mutationType = Math.floor(Math.random() * 4);
    
    switch (mutationType) {
      case 0: // Mutate wind
        mutated.wind = this.generateSmallRotationQuaternion(0.1 * mutationStrength);
        break;
      case 1: // Mutate additive
        mutated.additive = this.generatePhyllotaxisVector(0.1 * mutationStrength);
        break;
      case 2: // Mutate start
        mutated.start = this.generateRandomQuaternion(0.5 * mutationStrength);
        break;
      case 3: // Mutate camera rotation
        mutated.cameraRotation = this.generateSmallRotationQuaternion(0.2 * mutationStrength);
        break;
    }
    
    return mutated;
  }

  /**
   * Generate single experiment image
   */
  async generateExperimentImage(experimentIndex, parameters, outputDir, description) {
    console.log(`\n🧪 Experiment ${experimentIndex}: ${description}`);
    
    try {
      const { constants, renderParams } = this.convertParameters(parameters);
      
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
      const filename = `exp_${experimentIndex.toString().padStart(3, '0')}_${modeName}_${projectionName}_${batchSize}pts.png`;
      
      const imagePath = path.join(outputDir, filename);
      const renderer = new SimplePNGRenderer(imageConfig);
      
      console.log(`🖼️  Rendering to PNG...`);
      const renderResult = await renderer.renderPointsToPNG(result.points, imagePath);
      
      console.log(`💾 PNG saved: ${filename}`);
      
      return {
        experimentIndex,
        filename,
        imagePath,
        description,
        parameters,
        result: renderResult,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Error in experiment ${experimentIndex}:`, error.message);
      return null;
    }
  }

  /**
   * Experiment with camera rotations
   */
  async experimentCameraRotations(baseParameters, outputDir) {
    console.log(`\n🔄 Experimenting with camera rotations...`);
    
    const cameraVariations = this.generateCameraRotationVariations(baseParameters.cameraRotation);
    const results = [];
    
    for (let i = 0; i < cameraVariations.length; i++) {
      const variation = cameraVariations[i];
      const experimentParams = {
        ...baseParameters,
        cameraRotation: variation.rotation
      };
      
      const result = await this.generateExperimentImage(
        i + 1,
        experimentParams,
        outputDir,
        variation.description
      );
      
      if (result) {
        results.push(result);
        this.experiments.push(result);
      }
    }
    
    return results;
  }

  /**
   * Experiment with different projections
   */
  async experimentProjections(baseParameters, outputDir) {
    console.log(`\n📐 Experimenting with different projections...`);
    
    const projectionVariations = this.generateProjectionVariations();
    const results = [];
    
    for (let i = 0; i < projectionVariations.length; i++) {
      const variation = projectionVariations[i];
      const experimentParams = {
        ...baseParameters,
        projectionType: variation.type
      };
      
      const result = await this.generateExperimentImage(
        i + 1,
        experimentParams,
        outputDir,
        variation.description
      );
      
      if (result) {
        results.push(result);
        this.experiments.push(result);
      }
    }
    
    return results;
  }

  /**
   * Experiment with different image sizes
   */
  async experimentImageSizes(baseParameters, outputDir) {
    console.log(`\n🖼️  Experimenting with different image sizes...`);
    
    const sizeVariations = this.generateImageSizeVariations();
    const results = [];
    
    for (let i = 0; i < sizeVariations.length; i++) {
      const variation = sizeVariations[i];
      const experimentParams = {
        ...baseParameters,
        imageSize: {
          width: variation.width,
          height: variation.height
        }
      };
      
      const result = await this.generateExperimentImage(
        i + 1,
        experimentParams,
        outputDir,
        variation.description
      );
      
      if (result) {
        results.push(result);
        this.experiments.push(result);
      }
    }
    
    return results;
  }

  /**
   * Experiment with different point counts
   */
  async experimentPointCounts(baseParameters, outputDir) {
    console.log(`\n🎯 Experimenting with different point counts...`);
    
    const pointCountVariations = this.generatePointCountVariations(baseParameters.batchSize);
    const results = [];
    
    for (let i = 0; i < pointCountVariations.length; i++) {
      const pointCount = pointCountVariations[i];
      const experimentParams = {
        ...baseParameters,
        batchSize: pointCount
      };
      
      const result = await this.generateExperimentImage(
        i + 1,
        experimentParams,
        outputDir,
        `${pointCount.toLocaleString()} points`
      );
      
      if (result) {
        results.push(result);
        this.experiments.push(result);
      }
    }
    
    return results;
  }

  /**
   * Experiment with parameter mutations
   */
  async experimentParameterMutations(baseParameters, outputDir, mutationCount = 10) {
    console.log(`\n🧬 Experimenting with parameter mutations...`);
    
    const results = [];
    
    for (let i = 0; i < mutationCount; i++) {
      const mutationStrength = 0.05 + (i / mutationCount) * 0.2; // 0.05 to 0.25
      const mutatedParams = this.generateParameterMutation(baseParameters, mutationStrength);
      
      const result = await this.generateExperimentImage(
        i + 1,
        mutatedParams,
        outputDir,
        `Parameter mutation ${i + 1} (strength: ${mutationStrength.toFixed(2)})`
      );
      
      if (result) {
        results.push(result);
        this.experiments.push(result);
      }
    }
    
    return results;
  }

  /**
   * Run comprehensive parameter experiments
   */
  async runComprehensiveExperiments(baseParameters, outputDir) {
    console.log(`\n🧪 Running comprehensive parameter experiments...`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const experimentDir = path.join(outputDir, `parameter_experiments_${timestamp}`);
    
    if (!fs.existsSync(experimentDir)) {
      fs.mkdirSync(experimentDir, { recursive: true });
    }
    
    console.log(`📁 Experiment directory: ${experimentDir}`);
    
    // Run different types of experiments
    const cameraResults = await this.experimentCameraRotations(baseParameters, experimentDir);
    const projectionResults = await this.experimentProjections(baseParameters, experimentDir);
    const sizeResults = await this.experimentImageSizes(baseParameters, experimentDir);
    const pointCountResults = await this.experimentPointCounts(baseParameters, experimentDir);
    const mutationResults = await this.experimentParameterMutations(baseParameters, experimentDir, 8);
    
    // Save experiment summary
    await this.saveExperimentSummary(experimentDir, baseParameters, {
      camera: cameraResults,
      projections: projectionResults,
      sizes: sizeResults,
      pointCounts: pointCountResults,
      mutations: mutationResults
    });
    
    console.log(`\n🎉 Comprehensive experiments complete!`);
    console.log(`📊 Total experiments: ${this.experiments.length}`);
    console.log(`📁 All results saved to: ${experimentDir}`);
    
    return experimentDir;
  }

  /**
   * Save experiment summary
   */
  async saveExperimentSummary(outputDir, baseParameters, experimentResults) {
    const summary = {
      timestamp: new Date().toISOString(),
      tool: 'Parameter Experimenter',
      baseParameters,
      experiments: {
        camera: experimentResults.camera.length,
        projections: experimentResults.projections.length,
        sizes: experimentResults.sizes.length,
        pointCounts: experimentResults.pointCounts.length,
        mutations: experimentResults.mutations.length
      },
      totalExperiments: this.experiments.length,
      results: this.experiments
    };
    
    const summaryPath = path.join(outputDir, 'experiment_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📋 Experiment summary saved to: ${summaryPath}`);
  }

  /**
   * Load parameters from file
   */
  loadParametersFromFile(filePath) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Handle different file formats
      if (data.parameters) {
        return data.parameters;
      } else if (data.start && data.wind && data.additive) {
        return data;
      } else if (data.images && data.images.length > 0) {
        // Collection file - return first image parameters
        return data.images[0].parameters;
      }
      
      throw new Error('Unknown parameter file format');
    } catch (error) {
      console.error(`❌ Error loading parameters from ${filePath}:`, error.message);
      return null;
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const experimenter = new ParameterExperimenter();
  
  // Create output directory
  const outputDir = path.join(__dirname, '..', 'output', 'parameter_experiments');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Look for interesting parameter files
  const randomParamsDir = path.join(__dirname, '..', 'output', 'random_parameters');
  const enhancedBatchDir = path.join(__dirname, '..', 'output', 'enhanced_batch');
  
  let parameterFile = null;
  
  // Try to find the most recent parameter collection
  if (fs.existsSync(enhancedBatchDir)) {
    const collections = fs.readdirSync(enhancedBatchDir).filter(dir => 
      fs.statSync(path.join(enhancedBatchDir, dir)).isDirectory()
    ).sort().reverse();
    
    if (collections.length > 0) {
      const collectionPath = path.join(enhancedBatchDir, collections[0], 'batch_summary.json');
      if (fs.existsSync(collectionPath)) {
        parameterFile = collectionPath;
      }
    }
  }
  
  if (!parameterFile && fs.existsSync(randomParamsDir)) {
    const collections = fs.readdirSync(randomParamsDir).filter(dir => 
      fs.statSync(path.join(randomParamsDir, dir)).isDirectory()
    ).sort().reverse();
    
    if (collections.length > 0) {
      const collectionPath = path.join(randomParamsDir, collections[0], 'collection_summary.json');
      if (fs.existsSync(collectionPath)) {
        parameterFile = collectionPath;
      }
    }
  }
  
  if (!parameterFile) {
    console.error('❌ No parameter files found. Please run random-parameter-generator.js or enhanced-batch-generator.js first.');
    return;
  }
  
  console.log(`📁 Using parameter file: ${parameterFile}`);
  
  // Load base parameters
  const baseParameters = experimenter.loadParametersFromFile(parameterFile);
  
  if (!baseParameters) {
    console.error('❌ Failed to load parameters from file.');
    return;
  }
  
  console.log(`🎯 Base parameters loaded successfully`);
  console.log(`   Mode: ${experimenter.getModeName(baseParameters.mode)}`);
  console.log(`   Points: ${baseParameters.batchSize.toLocaleString()}`);
  console.log(`   Image: ${baseParameters.imageSize.width}x${baseParameters.imageSize.height}`);
  console.log(`   Projection: ${baseParameters.projectionType}`);
  
  // Run comprehensive experiments
  const experimentDir = await experimenter.runComprehensiveExperiments(baseParameters, outputDir);
  
  console.log(`\n🎯 PARAMETER EXPERIMENTATION COMPLETE!`);
  console.log(`=====================================`);
  console.log(`📁 All results saved to: ${experimentDir}`);
  console.log(`📊 Total experiments: ${experimenter.experiments.length}`);
  
  console.log(`\n🎯 NEXT STEPS`);
  console.log(`=============`);
  console.log(`1. Review all experimental variations`);
  console.log(`2. Identify the most interesting results`);
  console.log(`3. Use AI vision analysis to compare different experiments`);
  console.log(`4. Document findings and select parameters for further work`);
  console.log(`5. Create a gallery of the best experimental results`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ParameterExperimenter };
