#!/usr/bin/env node

/**
 * Complete Strategy Executor for Quaternion Attractor
 * 
 * This tool implements the complete user strategy:
 * 1. Generate many random attractor images with different parameters
 * 2. Select most interesting images using AI vision analysis
 * 3. Extract parameters from selected images for further experimentation
 * 4. Test different rendering projections and camera rotations
 * 5. Generate high point count variations (20,000+ points)
 * 6. Create comprehensive documentation and galleries
 * 
 * This is the main orchestrator that coordinates all the other tools.
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

class CompleteStrategyExecutor {
  constructor() {
    this.strategyResults = {
      batchGeneration: null,
      aiAnalysis: null,
      interestingSelection: null,
      parameterExperiments: null,
      highPointCounts: null,
      finalGallery: null
    };
  }

  /**
   * Step 1: Generate many random attractor images
   */
  async step1_GenerateRandomImages(count = 50, options = {}) {
    console.log(`\n🎯 STEP 1: Generating ${count} random attractor images...`);
    console.log(`=====================================================`);
    
    try {
      // Run the enhanced batch generator
      const command = `node tools/enhanced-batch-generator.js`;
      console.log(`🚀 Executing: ${command}`);
      
      const result = execSync(command, { 
        encoding: 'utf8', 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      
      // Find the generated batch directory
      const outputDir = path.join(__dirname, '..', 'output', 'enhanced_batch');
      const collections = fs.readdirSync(outputDir).filter(dir => 
        fs.statSync(path.join(outputDir, dir)).isDirectory()
      ).sort().reverse();
      
      if (collections.length > 0) {
        const batchDir = path.join(outputDir, collections[0]);
        this.strategyResults.batchGeneration = batchDir;
        console.log(`✅ Step 1 complete! Batch directory: ${batchDir}`);
        return batchDir;
      } else {
        throw new Error('No batch directory found');
      }
      
    } catch (error) {
      console.error(`❌ Error in Step 1:`, error.message);
      throw error;
    }
  }

  /**
   * Step 2: Analyze images with AI vision to identify interesting ones
   */
  async step2_AnalyzeWithAI(batchDir) {
    console.log(`\n🎯 STEP 2: Analyzing images with AI vision...`);
    console.log(`=============================================`);
    
    try {
      // Check if AI analysis already exists
      const analysisFile = path.join(batchDir, 'ai_analysis_results.json');
      
      if (!fs.existsSync(analysisFile)) {
        console.log(`🤖 Running AI analysis on generated images...`);
        
        // Find all PNG files in the batch directory
        const pngFiles = fs.readdirSync(batchDir)
          .filter(file => file.endsWith('.png'))
          .map(file => path.join(batchDir, file));
        
        console.log(`📊 Found ${pngFiles.length} images to analyze`);
        
        // Analyze each image with AI
        const analysisResults = [];
        for (let i = 0; i < pngFiles.length; i++) {
          const imagePath = pngFiles[i];
          const filename = path.basename(imagePath);
          
          console.log(`🔍 Analyzing ${i + 1}/${pngFiles.length}: ${filename}`);
          
          try {
            const command = `node tools/universal-groq-analyzer.js single "${imagePath}" "Analyze this quaternion attractor image. Rate its visual interest from 1-10 and describe the patterns, colors, and mathematical structures you see. Focus on complexity, beauty, uniqueness, and fractal-like properties. Provide a detailed analysis of the visual patterns and mathematical behavior."`;
            
            const result = execSync(command, { encoding: 'utf8', cwd: path.join(__dirname, '..') });
            const analysisData = JSON.parse(result);
            
            analysisResults.push({
              imagePath,
              filename,
              analysis: analysisData,
              timestamp: new Date().toISOString()
            });
            
            console.log(`✅ Analysis complete for ${filename}`);
            
          } catch (error) {
            console.error(`❌ Error analyzing ${filename}:`, error.message);
          }
        }
        
        // Save analysis results
        const analysisSummary = {
          timestamp: new Date().toISOString(),
          totalAnalyzed: analysisResults.length,
          results: analysisResults
        };
        
        fs.writeFileSync(analysisFile, JSON.stringify(analysisSummary, null, 2));
        console.log(`📋 Analysis results saved to: ${analysisFile}`);
        
        this.strategyResults.aiAnalysis = analysisResults;
        
      } else {
        console.log(`📋 AI analysis already exists, loading from file...`);
        const analysisData = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
        this.strategyResults.aiAnalysis = analysisData.results;
      }
      
      console.log(`✅ Step 2 complete! Analyzed ${this.strategyResults.aiAnalysis.length} images`);
      return this.strategyResults.aiAnalysis;
      
    } catch (error) {
      console.error(`❌ Error in Step 2:`, error.message);
      throw error;
    }
  }

  /**
   * Step 3: Select most interesting images based on AI analysis
   */
  async step3_SelectInterestingImages(analysisResults) {
    console.log(`\n🎯 STEP 3: Selecting most interesting images...`);
    console.log(`===============================================`);
    
    try {
      const interestingImages = [];
      
      // Analyze each result and score based on AI response
      for (const result of analysisResults) {
        const analysis = result.analysis?.results?.analysis || '';
        
        // Simple scoring based on keywords and response length
        let score = 0;
        
        // Positive indicators
        if (analysis.includes('complex') || analysis.includes('fractal')) score += 3;
        if (analysis.includes('beautiful') || analysis.includes('stunning')) score += 2;
        if (analysis.includes('pattern') || analysis.includes('symmetry')) score += 2;
        if (analysis.includes('interesting') || analysis.includes('unique')) score += 2;
        if (analysis.includes('mathematical') || analysis.includes('geometric')) score += 1;
        if (analysis.length > 300) score += 1; // Detailed analysis
        
        // Negative indicators
        if (analysis.includes('simple') || analysis.includes('basic')) score -= 1;
        if (analysis.includes('black') || analysis.includes('empty')) score -= 2;
        if (analysis.includes('no visible') || analysis.includes('cannot see')) score -= 3;
        
        // Only include images with positive scores
        if (score > 2) {
          interestingImages.push({
            ...result,
            interestScore: score,
            analysis: analysis
          });
        }
      }
      
      // Sort by interest score
      interestingImages.sort((a, b) => b.interestScore - a.interestScore);
      
      // Take top 10 most interesting
      const topInteresting = interestingImages.slice(0, 10);
      
      console.log(`🎨 Selected ${topInteresting.length} interesting images:`);
      topInteresting.forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.filename} (score: ${img.interestScore})`);
      });
      
      this.strategyResults.interestingSelection = topInteresting;
      console.log(`✅ Step 3 complete! Selected ${topInteresting.length} interesting images`);
      
      return topInteresting;
      
    } catch (error) {
      console.error(`❌ Error in Step 3:`, error.message);
      throw error;
    }
  }

  /**
   * Step 4: Extract parameters and run comprehensive experiments
   */
  async step4_ExtractAndExperiment(interestingImages) {
    console.log(`\n🎯 STEP 4: Extracting parameters and running experiments...`);
    console.log(`=========================================================`);
    
    try {
      // Create experiment output directory
      const outputDir = path.join(__dirname, '..', 'output', 'strategy_experiments');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Load parameters from the batch generation results
      const batchDir = this.strategyResults.batchGeneration;
      const batchSummaryPath = path.join(batchDir, 'batch_summary.json');
      
      if (!fs.existsSync(batchSummaryPath)) {
        throw new Error('Batch summary not found');
      }
      
      const batchSummary = JSON.parse(fs.readFileSync(batchSummaryPath, 'utf8'));
      const batchImages = batchSummary.images;
      
      // Extract parameters for interesting images
      const extractedParameters = [];
      
      for (const interesting of interestingImages) {
        // Find corresponding batch image
        const batchImage = batchImages.find(img => 
          path.basename(img.imagePath) === interesting.filename
        );
        
        if (batchImage) {
          extractedParameters.push({
            filename: interesting.filename,
            parameters: batchImage.parameters,
            interestScore: interesting.interestScore,
            analysis: interesting.analysis
          });
        }
      }
      
      console.log(`📊 Extracted parameters for ${extractedParameters.length} images`);
      
      // Run parameter experiments for the most interesting image
      if (extractedParameters.length > 0) {
        const mostInteresting = extractedParameters[0];
        console.log(`🎨 Running experiments with most interesting image: ${mostInteresting.filename}`);
        
        // Create parameter file for experimenter
        const paramFile = path.join(outputDir, 'interesting_parameters.json');
        fs.writeFileSync(paramFile, JSON.stringify({
          timestamp: new Date().toISOString(),
          sourceImage: mostInteresting.filename,
          parameters: mostInteresting.parameters,
          interestScore: mostInteresting.interestScore,
          analysis: mostInteresting.analysis
        }, null, 2));
        
        // Run parameter experimenter
        console.log(`🧪 Running comprehensive parameter experiments...`);
        const command = `node tools/parameter-experimenter.js`;
        
        // Temporarily copy the parameter file to where experimenter expects it
        const tempParamFile = path.join(__dirname, '..', 'output', 'random_parameters', 'temp_collection', 'collection_summary.json');
        fs.mkdirSync(path.dirname(tempParamFile), { recursive: true });
        fs.writeFileSync(tempParamFile, JSON.stringify({
          timestamp: new Date().toISOString(),
          images: extractedParameters.map(p => ({
            index: 1,
            parameters: p.parameters
          }))
        }, null, 2));
        
        try {
          execSync(command, { 
            encoding: 'utf8', 
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
          });
          
          // Find the experiment results
          const experimentDir = path.join(__dirname, '..', 'output', 'parameter_experiments');
          const experiments = fs.readdirSync(experimentDir).filter(dir => 
            fs.statSync(path.join(experimentDir, dir)).isDirectory()
          ).sort().reverse();
          
          if (experiments.length > 0) {
            this.strategyResults.parameterExperiments = path.join(experimentDir, experiments[0]);
          }
          
        } finally {
          // Clean up temp file
          if (fs.existsSync(tempParamFile)) {
            fs.unlinkSync(tempParamFile);
            fs.rmdirSync(path.dirname(tempParamFile));
          }
        }
      }
      
      console.log(`✅ Step 4 complete! Parameter experiments finished`);
      return extractedParameters;
      
    } catch (error) {
      console.error(`❌ Error in Step 4:`, error.message);
      throw error;
    }
  }

  /**
   * Step 5: Generate high point count variations
   */
  async step5_GenerateHighPointCounts() {
    console.log(`\n🎯 STEP 5: Generating high point count variations...`);
    console.log(`=================================================`);
    
    try {
      console.log(`🚀 Running high point count generator...`);
      const command = `node tools/high-point-count-generator.js`;
      
      execSync(command, { 
        encoding: 'utf8', 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      
      // Find the high point count results
      const outputDir = path.join(__dirname, '..', 'output', 'high_point_counts');
      const series = fs.readdirSync(outputDir).filter(dir => 
        fs.statSync(path.join(outputDir, dir)).isDirectory()
      ).sort().reverse();
      
      if (series.length > 0) {
        this.strategyResults.highPointCounts = path.join(outputDir, series[0]);
        console.log(`✅ Step 5 complete! High point count series: ${this.strategyResults.highPointCounts}`);
      }
      
      return this.strategyResults.highPointCounts;
      
    } catch (error) {
      console.error(`❌ Error in Step 5:`, error.message);
      throw error;
    }
  }

  /**
   * Step 6: Create final gallery and documentation
   */
  async step6_CreateFinalGallery() {
    console.log(`\n🎯 STEP 6: Creating final gallery and documentation...`);
    console.log(`===================================================`);
    
    try {
      const galleryDir = path.join(__dirname, '..', 'output', 'final_strategy_gallery');
      if (!fs.existsSync(galleryDir)) {
        fs.mkdirSync(galleryDir, { recursive: true });
      }
      
      // Collect all interesting images
      const galleryImages = [];
      
      // Add interesting images from batch generation
      if (this.strategyResults.interestingSelection) {
        for (const img of this.strategyResults.interestingSelection) {
          const sourcePath = img.imagePath;
          const destPath = path.join(galleryDir, `interesting_${path.basename(sourcePath)}`);
          
          if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
            galleryImages.push({
              filename: path.basename(destPath),
              source: 'interesting_selection',
              interestScore: img.interestScore,
              analysis: img.analysis
            });
          }
        }
      }
      
      // Add high point count images
      if (this.strategyResults.highPointCounts) {
        const highPointDir = this.strategyResults.highPointCounts;
        const highPointFiles = fs.readdirSync(highPointDir).filter(file => file.endsWith('.png'));
        
        for (const file of highPointFiles) {
          const sourcePath = path.join(highPointDir, file);
          const destPath = path.join(galleryDir, `high_points_${file}`);
          
          fs.copyFileSync(sourcePath, destPath);
          galleryImages.push({
            filename: path.basename(destPath),
            source: 'high_point_counts',
            description: `High point count variation: ${file}`
          });
        }
      }
      
      // Create gallery documentation
      const galleryDoc = {
        timestamp: new Date().toISOString(),
        strategy: 'Complete Quaternion Attractor Exploration',
        description: 'Gallery of most interesting images discovered through systematic parameter exploration',
        totalImages: galleryImages.length,
        images: galleryImages,
        results: {
          batchGeneration: this.strategyResults.batchGeneration,
          aiAnalysis: this.strategyResults.aiAnalysis?.length || 0,
          interestingSelection: this.strategyResults.interestingSelection?.length || 0,
          parameterExperiments: this.strategyResults.parameterExperiments,
          highPointCounts: this.strategyResults.highPointCounts
        }
      };
      
      const galleryPath = path.join(galleryDir, 'gallery_summary.json');
      fs.writeFileSync(galleryPath, JSON.stringify(galleryDoc, null, 2));
      
      // Create README for the gallery
      const readmeContent = `# 🎨 Quaternion Attractor Strategy Gallery

**Generated:** ${new Date().toISOString()}

## 🎯 Strategy Overview

This gallery contains the results of a comprehensive exploration strategy for the quaternion attractor system:

1. **Random Generation**: Generated ${galleryDoc.results.aiAnalysis} random images with varied parameters
2. **AI Analysis**: Used AI vision to analyze and score visual interest
3. **Selection**: Selected ${galleryDoc.results.interestingSelection} most interesting images
4. **Experimentation**: Ran comprehensive parameter experiments
5. **High Point Counts**: Generated images with 20,000+ points
6. **Gallery Creation**: Compiled final results

## 📊 Results Summary

- **Total Images**: ${galleryImages.length}
- **Interesting Images**: ${this.strategyResults.interestingSelection?.length || 0}
- **High Point Count Images**: ${galleryImages.filter(img => img.source === 'high_point_counts').length}
- **Parameter Experiments**: ${this.strategyResults.parameterExperiments ? 'Completed' : 'Not completed'}

## 🎨 Image Categories

### Interesting Selection
${galleryImages.filter(img => img.source === 'interesting_selection').map(img => 
  `- \`${img.filename}\` (Score: ${img.interestScore})`
).join('\n')}

### High Point Count Variations
${galleryImages.filter(img => img.source === 'high_point_counts').map(img => 
  `- \`${img.filename}\` - ${img.description}`
).join('\n')}

## 🎯 Next Steps

1. Review all images in this gallery
2. Select the most promising parameter combinations
3. Use these parameters for further research and experimentation
4. Test different rendering projections and camera rotations
5. Explore mathematical properties of the selected patterns

## 📁 Directory Structure

- \`interesting_*\`: Images selected as most interesting by AI analysis
- \`high_points_*\`: High point count variations (20,000+ points)
- \`gallery_summary.json\`: Complete metadata and analysis results

---

*Generated by Complete Strategy Executor - Quaternion Attractor Exploration System*
`;

      const readmePath = path.join(galleryDir, 'README.md');
      fs.writeFileSync(readmePath, readmeContent);
      
      this.strategyResults.finalGallery = galleryDir;
      
      console.log(`✅ Step 6 complete! Final gallery created: ${galleryDir}`);
      console.log(`📊 Gallery contains ${galleryImages.length} images`);
      
      return galleryDir;
      
    } catch (error) {
      console.error(`❌ Error in Step 6:`, error.message);
      throw error;
    }
  }

  /**
   * Execute the complete strategy
   */
  async executeCompleteStrategy() {
    console.log(`🚀 COMPLETE STRATEGY EXECUTOR`);
    console.log(`=============================`);
    console.log(`Implementing comprehensive quaternion attractor exploration strategy...`);
    console.log(`This will generate many images, analyze them with AI, and create experiments.`);
    
    const startTime = Date.now();
    
    try {
      // Step 1: Generate random images
      const batchDir = await this.step1_GenerateRandomImages(50);
      
      // Step 2: Analyze with AI
      const analysisResults = await this.step2_AnalyzeWithAI(batchDir);
      
      // Step 3: Select interesting images
      const interestingImages = await this.step3_SelectInterestingImages(analysisResults);
      
      // Step 4: Extract parameters and experiment
      const extractedParams = await this.step4_ExtractAndExperiment(interestingImages);
      
      // Step 5: Generate high point counts
      const highPointDir = await this.step5_GenerateHighPointCounts();
      
      // Step 6: Create final gallery
      const galleryDir = await this.step6_CreateFinalGallery();
      
      const totalTime = Date.now() - startTime;
      
      console.log(`\n🎉 COMPLETE STRATEGY EXECUTION FINISHED!`);
      console.log(`=========================================`);
      console.log(`⏱️  Total execution time: ${Math.round(totalTime / 1000)}s`);
      console.log(`📊 Results:`);
      console.log(`   - Random images generated: ${analysisResults.length}`);
      console.log(`   - Interesting images selected: ${interestingImages.length}`);
      console.log(`   - Parameter experiments: ${this.strategyResults.parameterExperiments ? 'Completed' : 'Not completed'}`);
      console.log(`   - High point count images: ${highPointDir ? 'Generated' : 'Not generated'}`);
      console.log(`   - Final gallery: ${galleryDir}`);
      
      console.log(`\n🎯 FINAL RESULTS`);
      console.log(`================`);
      console.log(`📁 Main gallery: ${galleryDir}`);
      console.log(`📋 Gallery documentation: ${path.join(galleryDir, 'README.md')}`);
      console.log(`📊 Complete metadata: ${path.join(galleryDir, 'gallery_summary.json')}`);
      
      console.log(`\n🎯 NEXT STEPS FOR RESEARCH`);
      console.log(`=========================`);
      console.log(`1. Review the final gallery to identify the most promising patterns`);
      console.log(`2. Use the selected parameters for further mathematical analysis`);
      console.log(`3. Test different rendering projections and camera rotations`);
      console.log(`4. Explore the mathematical properties of interesting patterns`);
      console.log(`5. Document findings and create research reports`);
      
      return {
        success: true,
        totalTime,
        results: this.strategyResults
      };
      
    } catch (error) {
      console.error(`\n❌ STRATEGY EXECUTION FAILED:`, error.message);
      console.error(`Stack trace:`, error.stack);
      
      return {
        success: false,
        error: error.message,
        results: this.strategyResults
      };
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const executor = new CompleteStrategyExecutor();
  
  console.log(`🎯 Starting complete strategy execution...`);
  console.log(`This will take several minutes to complete all steps.`);
  
  const result = await executor.executeCompleteStrategy();
  
  if (result.success) {
    console.log(`\n✅ Strategy execution completed successfully!`);
    process.exit(0);
  } else {
    console.log(`\n❌ Strategy execution failed: ${result.error}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CompleteStrategyExecutor };
