import { GroqVisionAnalyzer } from '../typescript/node/groq-vision-analyzer';
import * as path from 'path';

/**
 * Example script demonstrating how to use Groq Vision API to analyze
 * quaternion attractor PNG images
 */
async function main() {
  console.log('🔍 Groq Vision Analysis Example for Quaternion Attractors');
  console.log('========================================================\n');

  try {
    // Initialize the analyzer
    const analyzer = new GroqVisionAnalyzer();
    console.log('✅ Groq Vision Analyzer initialized\n');

    // Define paths to your generated PNG images
    const outputDir = path.join(__dirname, '../../output/png_examples');
    const basicImage = path.join(outputDir, 'basic_attractor.png');
    const variationsDir = path.join(outputDir, 'variations');
    const animationDir = path.join(outputDir, 'animation');

    // Example 1: Analyze a single image
    console.log('📸 Example 1: Analyzing single image');
    console.log('-----------------------------------');
    
    if (require('fs').existsSync(basicImage)) {
      const result = await analyzer.analyzeImage(basicImage, {
        prompt: 'Analyze this quaternion attractor visualization. Focus on the mathematical patterns, symmetries, and visual complexity.',
        maxTokens: 800,
        temperature: 0.5,
      });

      if (result.success) {
        console.log('✅ Analysis successful!');
        console.log(`📊 Model: ${result.model}`);
        console.log(`🖼️  Image: ${path.basename(result.imagePath)}`);
        console.log(`📝 Analysis:\n${result.analysis}\n`);
      } else {
        console.log('❌ Analysis failed:', result.error);
      }
    } else {
      console.log('⚠️  Basic attractor image not found, skipping single image analysis');
    }

    // Example 2: Analyze all variation images
    console.log('🔄 Example 2: Analyzing variation images');
    console.log('---------------------------------------');
    
    if (require('fs').existsSync(variationsDir)) {
      const variationResults = await analyzer.analyzeDirectory(variationsDir, {
        prompt: 'Analyze this quaternion attractor variation. Compare it to typical attractor patterns and describe the unique mathematical characteristics.',
        maxTokens: 600,
        temperature: 0.6,
      });

      console.log(`📊 Analyzed ${variationResults.length} variation images:`);
      variationResults.forEach((result, index) => {
        if (result.success) {
          console.log(`\n✅ Variation ${index + 1}: ${path.basename(result.imagePath)}`);
          console.log(`📝 Analysis: ${result.analysis?.substring(0, 200)}...`);
        } else {
          console.log(`\n❌ Variation ${index + 1} failed: ${result.error}`);
        }
      });

      // Save variation results
      const variationOutputPath = path.join(outputDir, 'variation_analysis_results.json');
      await analyzer.saveAnalysisResults(variationResults, variationOutputPath);
    } else {
      console.log('⚠️  Variations directory not found, skipping variation analysis');
    }

    // Example 3: Compare multiple images
    console.log('\n🔍 Example 3: Comparing multiple images');
    console.log('--------------------------------------');
    
    const comparisonImages = [
      path.join(variationsDir, 'plain_flip.png'),
      path.join(variationsDir, 'flip_smallest.png'),
      path.join(variationsDir, 'flip_all_except_largest.png'),
    ];

    // Check if all comparison images exist
    const existingImages = comparisonImages.filter(img => require('fs').existsSync(img));
    
    if (existingImages.length >= 2) {
      const comparisonResult = await analyzer.compareImages(existingImages, {
        prompt: 'Compare these quaternion attractor variations. Analyze the differences in mathematical structure, visual complexity, and pattern characteristics.',
        maxTokens: 1200,
        temperature: 0.7,
      });

      if (comparisonResult.success) {
        console.log('✅ Comparison analysis successful!');
        console.log(`📊 Model: ${comparisonResult.model}`);
        console.log(`🖼️  Images: ${existingImages.map(img => path.basename(img)).join(', ')}`);
        console.log(`📝 Comparative Analysis:\n${comparisonResult.analysis}\n`);
      } else {
        console.log('❌ Comparison analysis failed:', comparisonResult.error);
      }
    } else {
      console.log('⚠️  Not enough variation images found for comparison');
    }

    // Example 4: Analyze animation frames
    console.log('🎬 Example 4: Analyzing animation frames');
    console.log('--------------------------------------');
    
    if (require('fs').existsSync(animationDir)) {
      // Analyze first few animation frames
      const animationFiles = require('fs').readdirSync(animationDir)
        .filter((file: string) => file.endsWith('.png'))
        .slice(0, 3); // Analyze first 3 frames

      if (animationFiles.length > 0) {
        const animationResults = await analyzer.analyzeDirectory(animationDir, {
          prompt: 'Analyze this animation frame of a quaternion attractor. Describe the temporal evolution and dynamic patterns you observe.',
          maxTokens: 500,
          temperature: 0.6,
        });

        console.log(`📊 Analyzed ${animationResults.length} animation frames:`);
        animationResults.forEach((result, index) => {
          if (result.success) {
            console.log(`\n✅ Frame ${index + 1}: ${path.basename(result.imagePath)}`);
            console.log(`📝 Analysis: ${result.analysis?.substring(0, 150)}...`);
          } else {
            console.log(`\n❌ Frame ${index + 1} failed: ${result.error}`);
          }
        });

        // Save animation results
        const animationOutputPath = path.join(outputDir, 'animation_analysis_results.json');
        await analyzer.saveAnalysisResults(animationResults, animationOutputPath);
      }
    } else {
      console.log('⚠️  Animation directory not found, skipping animation analysis');
    }

    // Example 5: Custom analysis with specific focus
    console.log('\n🎯 Example 5: Custom mathematical analysis');
    console.log('------------------------------------------');
    
    if (require('fs').existsSync(basicImage)) {
      const customResult = await analyzer.analyzeImage(basicImage, {
        prompt: `As a mathematician specializing in dynamical systems and quaternion algebra, analyze this attractor visualization:

1. Identify the type of attractor (strange, periodic, fixed point, etc.)
2. Describe the fractal dimension and self-similarity properties
3. Analyze the symmetry groups present in the pattern
4. Estimate the Lyapunov exponents based on the visual complexity
5. Suggest mathematical parameters that might generate similar patterns
6. Compare this to known attractors (Lorenz, Rössler, etc.)

Provide a rigorous mathematical analysis suitable for a research paper.`,
        maxTokens: 1500,
        temperature: 0.3, // Lower temperature for more focused analysis
      });

      if (customResult.success) {
        console.log('✅ Custom mathematical analysis successful!');
        console.log(`📝 Mathematical Analysis:\n${customResult.analysis}\n`);
        
        // Save custom analysis
        const customOutputPath = path.join(outputDir, 'mathematical_analysis_results.json');
        await analyzer.saveAnalysisResults(customResult, customOutputPath);
      } else {
        console.log('❌ Custom analysis failed:', customResult.error);
      }
    }

    console.log('🎉 Groq Vision Analysis Example completed!');
    console.log('📁 Check the output directory for saved analysis results');

  } catch (error) {
    console.error('❌ Error running Groq Vision Analysis Example:', error);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runGroqVisionAnalysisExample };
