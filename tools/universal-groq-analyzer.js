#!/usr/bin/env node

/**
 * 🎯 Universal Groq Image Analysis Tool
 * 
 * A flexible, command-line tool for analyzing any image with custom instructions.
 * Supports single images, multiple images, comparisons, and directory analysis.
 * 
 * Usage Examples:
 * 
 * # Analyze single image with custom prompt
 * node tools/universal-groq-analyzer.js analyze image.png "What colors do you see in this attractor pattern?"
 * 
 * # Compare two images
 * node tools/universal-groq-analyzer.js compare image1.png image2.png "Compare these attractor patterns"
 * 
 * # Analyze directory with custom instruction
 * node tools/universal-groq-analyzer.js directory ./screenshots "Do you see any UI buttons or controls?"
 * 
 * # Quick analysis with preset prompts
 * node tools/universal-groq-analyzer.js quick image.png attractor-colors
 * 
 * # Save results to file
 * node tools/universal-groq-analyzer.js analyze image.png "Analyze this" --output results.json
 */

const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Preset analysis prompts for common tasks
 */
const PRESET_PROMPTS = {
  'attractor-colors': `
Analyze the color patterns in this quaternion attractor image:
1. What are the dominant colors and their distribution?
2. How do the colors vary across the pattern?
3. Are there any color gradients or transitions?
4. What do the colors tell us about the mathematical structure?
5. Are there any unusual or interesting color combinations?
Focus specifically on color analysis and visual aesthetics.`,

  'ui-elements': `
Analyze this screenshot for user interface elements:
1. What buttons, inputs, or controls are visible?
2. What is the current state of the interface (loading, error, success)?
3. Are there any error messages or notifications?
4. What text or labels can you read?
5. How does the interface layout look?
6. Are there any visual indicators of functionality?
Focus on identifying UI components and interface state.`,

  'mathematical-patterns': `
Analyze the mathematical patterns in this visualization:
1. What geometric structures do you observe?
2. Are there any symmetries or repeating patterns?
3. What is the complexity and fractal-like properties?
4. How does the pattern evolve or change?
5. What mathematical concepts might be represented?
6. Are there any unusual or interesting mathematical features?
Provide a detailed mathematical analysis.`,

  'visual-comparison': `
Compare these images and identify:
1. What are the main differences between them?
2. Which elements are similar or identical?
3. How do the visual patterns differ?
4. Which image appears more complex or interesting?
5. What might these differences indicate about the underlying system?
6. Any evolutionary or progressive changes?
Focus on detailed visual comparison and differences.`,

  'screenshot-analysis': `
Analyze this screenshot comprehensively:
1. What type of application or interface is this?
2. What functionality appears to be working or broken?
3. Are there any error states or loading indicators?
4. What can you infer about the user experience?
5. Are there any visual problems or issues?
6. What is the overall quality and design?
Provide a complete technical and UX analysis.`
};

/**
 * Universal Groq Image Analyzer
 */
class UniversalGroqAnalyzer {
  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
  }

  /**
   * Analyze a single image with custom prompt
   */
  async analyzeImage(imagePath, prompt, options = {}) {
    console.log(`🔍 Analyzing: ${path.basename(imagePath)}`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
    
    try {
      // Validate image exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image not found: ${imagePath}`);
      }

      // Read and encode image
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Call Groq Vision API
      const response = await groq.chat.completions.create({
        model: options.model || "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: options.maxTokens || 1500,
        temperature: options.temperature || 0.3
      });

      const analysis = response.choices[0].message.content;
      
      console.log(`✅ Analysis completed`);
      console.log(`📊 Analysis length: ${analysis.length} characters\n`);

      return {
        success: true,
        imagePath: imagePath,
        prompt: prompt,
        analysis: analysis,
        timestamp: new Date().toISOString(),
        model: options.model || "meta-llama/llama-4-scout-17b-16e-instruct"
      };

    } catch (error) {
      console.error(`❌ Analysis failed: ${error.message}`);
      return {
        success: false,
        imagePath: imagePath,
        prompt: prompt,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Compare multiple images
   */
  async compareImages(imagePaths, prompt, options = {}) {
    console.log(`🔍 Comparing ${imagePaths.length} images`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
    
    try {
      // Validate all images exist
      for (const imagePath of imagePaths) {
        if (!fs.existsSync(imagePath)) {
          throw new Error(`Image not found: ${imagePath}`);
        }
      }

      // Read and encode all images
      const imageContents = imagePaths.map(imagePath => {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        return {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${base64Image}`
          }
        };
      });

      // Call Groq Vision API with multiple images
      const response = await groq.chat.completions.create({
        model: options.model || "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              ...imageContents
            ]
          }
        ],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.3
      });

      const analysis = response.choices[0].message.content;
      
      console.log(`✅ Comparison completed`);
      console.log(`📊 Analysis length: ${analysis.length} characters\n`);

      return {
        success: true,
        imagePaths: imagePaths,
        prompt: prompt,
        analysis: analysis,
        timestamp: new Date().toISOString(),
        model: options.model || "meta-llama/llama-4-scout-17b-16e-instruct"
      };

    } catch (error) {
      console.error(`❌ Comparison failed: ${error.message}`);
      return {
        success: false,
        imagePaths: imagePaths,
        prompt: prompt,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze all images in a directory
   */
  async analyzeDirectory(directoryPath, prompt, options = {}) {
    console.log(`🔍 Analyzing directory: ${directoryPath}`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
    
    try {
      const files = fs.readdirSync(directoryPath);
      const imageFiles = files.filter(file => 
        file.toLowerCase().endsWith('.png') || 
        file.toLowerCase().endsWith('.jpg') || 
        file.toLowerCase().endsWith('.jpeg')
      );

      if (imageFiles.length === 0) {
        throw new Error(`No image files found in directory: ${directoryPath}`);
      }

      console.log(`📸 Found ${imageFiles.length} images to analyze\n`);

      const results = [];
      
      for (const file of imageFiles) {
        const fullPath = path.join(directoryPath, file);
        const result = await this.analyzeImage(fullPath, prompt, options);
        results.push(result);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`📊 Directory analysis completed: ${successCount}/${results.length} successful\n`);

      return {
        success: true,
        directoryPath: directoryPath,
        prompt: prompt,
        results: results,
        summary: {
          totalImages: imageFiles.length,
          successfulAnalyses: successCount,
          failedAnalyses: results.length - successCount
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Directory analysis failed: ${error.message}`);
      return {
        success: false,
        directoryPath: directoryPath,
        prompt: prompt,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Save results to file
   */
  async saveResults(results, outputPath) {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        tool: "Universal Groq Image Analyzer",
        results: results
      };

      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(`💾 Results saved to: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to save results: ${error.message}`);
    }
  }

  /**
   * Generate persistent analysis filename based on original image and analysis type
   */
  generateAnalysisFilename(imagePath, analysisType, prompt) {
    const dir = path.dirname(imagePath);
    const ext = path.extname(imagePath);
    const basename = path.basename(imagePath, ext);
    
    // Create a hash of the prompt for uniqueness (first 8 chars)
    const promptHash = require('crypto')
      .createHash('md5')
      .update(prompt)
      .digest('hex')
      .substring(0, 8);
    
    // Generate filename: original_name.groq_vision_analysis_type_hash.json
    const analysisFilename = `${basename}.groq_vision_${analysisType}_${promptHash}.json`;
    return path.join(dir, analysisFilename);
  }

  /**
   * Check if analysis already exists for given image and prompt
   */
  analysisExists(imagePath, analysisType, prompt) {
    const analysisFile = this.generateAnalysisFilename(imagePath, analysisType, prompt);
    return fs.existsSync(analysisFile);
  }

  /**
   * Load existing analysis if it exists
   */
  loadExistingAnalysis(imagePath, analysisType, prompt) {
    const analysisFile = this.generateAnalysisFilename(imagePath, analysisType, prompt);
    
    if (fs.existsSync(analysisFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
        console.log(`📁 Found existing analysis: ${path.basename(analysisFile)}`);
        console.log(`📅 Created: ${data.timestamp}`);
        return data;
      } catch (error) {
        console.log(`⚠️  Failed to load existing analysis: ${error.message}`);
      }
    }
    
    return null;
  }

  /**
   * Save persistent analysis alongside original image
   */
  async savePersistentAnalysis(results, imagePath, analysisType, prompt) {
    const analysisFile = this.generateAnalysisFilename(imagePath, analysisType, prompt);
    
    const data = {
      timestamp: new Date().toISOString(),
      tool: "Universal Groq Image Analyzer",
      originalImage: imagePath,
      analysisType: analysisType,
      prompt: prompt,
      results: results,
      metadata: {
        imageSize: fs.statSync(imagePath).size,
        analysisFile: analysisFile
      }
    };

    try {
      fs.writeFileSync(analysisFile, JSON.stringify(data, null, 2));
      console.log(`💾 Persistent analysis saved: ${path.basename(analysisFile)}`);
      return analysisFile;
    } catch (error) {
      console.error(`❌ Failed to save persistent analysis: ${error.message}`);
      return null;
    }
  }

  /**
   * Analyze with persistent storage (skip if exists, unless --force)
   */
  async analyzeWithPersistence(imagePath, prompt, options = {}) {
    const analysisType = options.analysisType || 'single';
    
    // Check if analysis already exists (unless --force)
    if (!options.force && this.analysisExists(imagePath, analysisType, prompt)) {
      const existing = this.loadExistingAnalysis(imagePath, analysisType, prompt);
      if (existing) {
        console.log(`✅ Using existing analysis (use --force to re-analyze)\n`);
        return existing;
      }
    }

    // Perform new analysis
    const results = await this.analyzeImage(imagePath, prompt, options);
    
    // Save persistent analysis
    if (results.success) {
      await this.savePersistentAnalysis(results, imagePath, analysisType, prompt);
    }
    
    return results;
  }

  /**
   * Compare with persistent storage
   */
  async compareWithPersistence(imagePaths, prompt, options = {}) {
    const analysisType = 'comparison';
    
    // Generate comparison filename
    const comparisonFile = this.generateAnalysisFilename(imagePaths[0], analysisType, prompt);
    
    // Check if comparison already exists (unless --force)
    if (!options.force && fs.existsSync(comparisonFile)) {
      try {
        const existing = JSON.parse(fs.readFileSync(comparisonFile, 'utf8'));
        console.log(`📁 Found existing comparison: ${path.basename(comparisonFile)}`);
        console.log(`📅 Created: ${existing.timestamp}`);
        console.log(`✅ Using existing comparison (use --force to re-analyze)\n`);
        return existing;
      } catch (error) {
        console.log(`⚠️  Failed to load existing comparison: ${error.message}`);
      }
    }

    // Perform new comparison
    const results = await this.compareImages(imagePaths, prompt, options);
    
    // Save persistent comparison
    if (results.success) {
      const data = {
        timestamp: new Date().toISOString(),
        tool: "Universal Groq Image Analyzer",
        imagePaths: imagePaths,
        analysisType: analysisType,
        prompt: prompt,
        results: results,
        metadata: {
          comparisonFile: comparisonFile,
          imageCount: imagePaths.length
        }
      };

      try {
        fs.writeFileSync(comparisonFile, JSON.stringify(data, null, 2));
        console.log(`💾 Persistent comparison saved: ${path.basename(comparisonFile)}`);
      } catch (error) {
        console.error(`❌ Failed to save persistent comparison: ${error.message}`);
      }
    }
    
    return results;
  }

  /**
   * List all analysis files for an image
   */
  listAnalysesForImage(imagePath) {
    const dir = path.dirname(imagePath);
    const ext = path.extname(imagePath);
    const basename = path.basename(imagePath, ext);
    
    try {
      const files = fs.readdirSync(dir);
      const analysisFiles = files.filter(file => 
        file.startsWith(`${basename}.groq_vision_`) && file.endsWith('.json')
      );
      
      if (analysisFiles.length === 0) {
        console.log(`📭 No analysis files found for ${path.basename(imagePath)}`);
        return [];
      }
      
      console.log(`📋 Analysis files for ${path.basename(imagePath)}:`);
      analysisFiles.forEach(file => {
        const fullPath = path.join(dir, file);
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          console.log(`  📄 ${file}`);
          console.log(`     📅 ${data.timestamp}`);
          console.log(`     🎯 ${data.analysisType || 'single'}`);
          console.log(`     📝 ${data.prompt?.substring(0, 60)}...`);
          console.log('');
        } catch (error) {
          console.log(`  📄 ${file} (corrupted)`);
        }
      });
      
      return analysisFiles;
    } catch (error) {
      console.error(`❌ Failed to list analyses: ${error.message}`);
      return [];
    }
  }

  /**
   * Print results to console
   */
  printResults(results) {
    console.log('\n🎯 ANALYSIS RESULTS');
    console.log('==================');

    if (results.success === false) {
      console.log(`❌ Analysis failed: ${results.error}`);
      return;
    }

    if (results.results && results.summary) {
      // Directory analysis results
      console.log(`📁 Directory: ${results.directoryPath}`);
      console.log(`📊 Summary: ${results.summary.successfulAnalyses}/${results.summary.totalImages} successful`);
      
      results.results.forEach((result, index) => {
        if (result.success) {
          console.log(`\n✅ Image ${index + 1}: ${path.basename(result.imagePath)}`);
          console.log(`📝 ${result.analysis.substring(0, 200)}...`);
        } else {
          console.log(`\n❌ Image ${index + 1}: ${path.basename(result.imagePath)} - ${result.error}`);
        }
      });
    } else if (results.imagePaths) {
      // Comparison results
      console.log(`🔍 Comparison of ${results.imagePaths.length} images:`);
      results.imagePaths.forEach((imagePath, index) => {
        console.log(`   ${index + 1}. ${path.basename(imagePath)}`);
      });
      console.log(`\n📝 Analysis:\n${results.analysis || results.results?.analysis}`);
    } else if (results.imagePath) {
      // Single image results
      console.log(`🖼️  Image: ${path.basename(results.imagePath)}`);
      console.log(`📝 Analysis:\n${results.analysis || results.results?.analysis}`);
    } else {
      // Fallback for other result types
      console.log(`📝 Analysis:\n${results.analysis || results.results?.analysis || 'No analysis available'}`);
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
🎯 Universal Groq Image Analysis Tool

Usage:
  node tools/universal-groq-analyzer.js <command> <arguments> [options]

Commands:
  analyze <image> <prompt>     - Analyze single image with custom prompt (persistent)
  compare <image1> <image2> <prompt> - Compare two images (persistent)
  directory <path> <prompt>    - Analyze all images in directory
  quick <image> <preset>      - Quick analysis with preset prompt (persistent)
  list <image>                - List all analysis files for an image
  presets                     - List available preset prompts

Examples:
  # Persistent analysis (saves alongside original image)
  node tools/universal-groq-analyzer.js analyze image.png "What colors do you see?"
  node tools/universal-groq-analyzer.js quick image.png attractor-colors
  
  # Comparison (saves comparison file)
  node tools/universal-groq-analyzer.js compare img1.png img2.png "Compare these patterns"
  
  # Directory analysis
  node tools/universal-groq-analyzer.js directory ./screenshots "Do you see buttons?"
  
  # List existing analyses
  node tools/universal-groq-analyzer.js list image.png

Options:
  --force                     - Force re-analysis even if exists
  --output <file>             - Save results to additional JSON file
  --model <model>             - Specify Groq model
  --tokens <number>           - Max tokens (default: 1500)
  --temperature <number>      - Temperature (default: 0.3)

Preset Prompts:
${Object.keys(PRESET_PROMPTS).map(key => `  ${key}`).join('\n')}

Persistent Analysis:
  Analysis files are automatically saved alongside original images:
  - basic_attractor.png → basic_attractor.groq_vision_single_a1b2c3d4.json
  - performance_500.png → performance_500.groq_vision_comparison_e5f6g7h8.json
  
  Use --force to re-analyze even if file exists.
`);
    process.exit(1);
  }

  const command = args[0];
  const options = {};
  
  // Parse options
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--force') {
      options.force = true;
      args.splice(i, 1);
      i -= 1;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[i + 1];
      args.splice(i, 2);
      i -= 2;
    } else if (args[i] === '--model' && args[i + 1]) {
      options.model = args[i + 1];
      args.splice(i, 2);
      i -= 2;
    } else if (args[i] === '--tokens' && args[i + 1]) {
      options.maxTokens = parseInt(args[i + 1]);
      args.splice(i, 2);
      i -= 2;
    } else if (args[i] === '--temperature' && args[i + 1]) {
      options.temperature = parseFloat(args[i + 1]);
      args.splice(i, 2);
      i -= 2;
    }
  }

  return { command, args: args.slice(1), options };
}

/**
 * Main function
 */
async function main() {
  console.log('🎯 Universal Groq Image Analysis Tool');
  console.log('=====================================\n');

  const { command, args, options } = parseArguments();
  const analyzer = new UniversalGroqAnalyzer();

  try {
    let results;

    switch (command) {
      case 'analyze':
        if (args.length < 2) {
          throw new Error('Usage: analyze <image> <prompt>');
        }
        results = await analyzer.analyzeWithPersistence(args[0], args[1], options);
        break;

      case 'compare':
        if (args.length < 3) {
          throw new Error('Usage: compare <image1> <image2> <prompt>');
        }
        results = await analyzer.compareWithPersistence([args[0], args[1]], args[2], options);
        break;

      case 'directory':
        if (args.length < 2) {
          throw new Error('Usage: directory <path> <prompt>');
        }
        results = await analyzer.analyzeDirectory(args[0], args[1], options);
        break;

      case 'quick':
        if (args.length < 2) {
          throw new Error('Usage: quick <image> <preset>');
        }
        const preset = PRESET_PROMPTS[args[1]];
        if (!preset) {
          throw new Error(`Unknown preset: ${args[1]}. Available: ${Object.keys(PRESET_PROMPTS).join(', ')}`);
        }
        results = await analyzer.analyzeWithPersistence(args[0], preset, options);
        break;

      case 'list':
        if (args.length < 1) {
          throw new Error('Usage: list <image>');
        }
        analyzer.listAnalysesForImage(args[0]);
        return;

      case 'presets':
        console.log('📋 Available Preset Prompts:');
        console.log('============================');
        Object.entries(PRESET_PROMPTS).forEach(([key, prompt]) => {
          console.log(`\n${key}:`);
          console.log(prompt.substring(0, 200) + '...');
        });
        return;

      default:
        throw new Error(`Unknown command: ${command}`);
    }

    // Print results
    analyzer.printResults(results);

    // Save results if requested
    if (options.output) {
      await analyzer.saveResults(results, options.output);
    }

    console.log('\n🎉 Analysis completed successfully!');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { UniversalGroqAnalyzer, PRESET_PROMPTS };
