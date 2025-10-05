#!/usr/bin/env node

/**
 * Debug Random Parameters
 * 
 * This tool helps debug the random parameter generation and PNG creation process
 */

const path = require('path');
const fs = require('fs');

// Import the attractor engine and image renderer
const { JavaScriptAttractorEngine } = require('../dist/typescript/core/js-engine');
const { createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/typescript/core/attractor-engine');

class RandomParameterDebugger {
  constructor() {
    this.engine = new JavaScriptAttractorEngine();
  }

  /**
   * Test a single parameter set
   */
  async testParameterSet(parameterData) {
    console.log(`\n🧪 Testing parameter set...`);
    console.log(`Mode: ${parameterData.mode} (type: ${typeof parameterData.mode})`);
    console.log(`Projection: ${parameterData.projectionType} (type: ${typeof parameterData.projectionType})`);
    
    try {
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
        mode: parameterData.mode // Mode belongs in constants
      };

      const renderParams = {
        batchSize: parameterData.batchSize,
        projectionType: parameterData.projectionType === 'simple' ? ProjectionType.SIMPLE : ProjectionType.SPHERE,
        cameraRotation: createQuaternion(
          parameterData.cameraRotation.w,
          parameterData.cameraRotation.x,
          parameterData.cameraRotation.y,
          parameterData.cameraRotation.z
        )
      };

      console.log(`✅ Parameters converted successfully`);
      console.log(`Constants:`, constants);
      console.log(`Render params:`, renderParams);
      
      // Test parameter validation
      const validation = this.engine.validateParameters(constants, renderParams);
      console.log(`Validation result:`, validation);
      
      if (!validation.isValid) {
        console.log(`❌ Validation failed:`, validation.errors);
        return false;
      }
      
      // Generate points
      console.log(`🎯 Generating ${renderParams.batchSize} points...`);
      const result = this.engine.generateBatch(constants, renderParams);
      console.log(`✅ Generated ${result.points.length} points successfully`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ Error:`, error.message);
      return false;
    }
  }

  /**
   * Test all parameter sets from collection
   */
  async testCollection(collectionPath) {
    console.log(`🧪 Random Parameter Debugger`);
    console.log(`=============================`);
    console.log(`Loading collection from: ${collectionPath}`);
    
    const collectionData = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
    console.log(`📊 Found ${collectionData.images.length} parameter sets`);
    
    let successCount = 0;
    
    for (const imageData of collectionData.images) {
      console.log(`\n--- Testing Image ${imageData.index} ---`);
      const success = await this.testParameterSet(imageData.parameters);
      if (success) {
        successCount++;
      }
    }
    
    console.log(`\n📊 Results: ${successCount}/${collectionData.images.length} parameter sets worked`);
  }
}

/**
 * Main execution
 */
async function main() {
  // Find the most recent parameter collection
  const randomParamsDir = path.join(__dirname, '..', 'output', 'random_parameters');
  const collections = fs.readdirSync(randomParamsDir).filter(dir => 
    fs.statSync(path.join(randomParamsDir, dir)).isDirectory()
  ).sort().reverse(); // Most recent first
  
  if (collections.length === 0) {
    console.error('❌ No random parameter collections found. Run random-parameter-generator.js first.');
    return;
  }
  
  const latestCollection = collections[0];
  const collectionPath = path.join(randomParamsDir, latestCollection, 'collection_summary.json');
  
  console.log(`📁 Using latest parameter collection: ${latestCollection}`);
  
  const debugTool = new RandomParameterDebugger();
  await debugTool.testCollection(collectionPath);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RandomParameterDebugger };
