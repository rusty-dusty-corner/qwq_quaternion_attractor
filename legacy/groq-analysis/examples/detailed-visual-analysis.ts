import { GroqVisionAnalyzer } from '../typescript/node/groq-vision-analyzer';
import * as path from 'path';

/**
 * Detailed visual analysis focused on color patterns, point distributions,
 * and visual characteristics that could help improve the code
 */
async function detailedVisualAnalysis() {
  console.log('🎨 Detailed Visual Analysis for Code Improvement');
  console.log('===============================================\n');

  try {
    const analyzer = new GroqVisionAnalyzer();
    console.log('✅ Groq Vision Analyzer initialized\n');

    const outputDir = path.join(__dirname, '../../output/png_examples');
    const results: any[] = [];

    // 1. Analyze color patterns and point distributions in variations
    console.log('🎨 Analysis 1: Color Patterns and Point Distributions');
    console.log('----------------------------------------------------');
    
    const variationImages = [
      'variations/plain_flip.png',
      'variations/flip_smallest.png', 
      'variations/flip_all_except_largest.png'
    ];

    for (const imagePath of variationImages) {
      const fullPath = path.join(outputDir, imagePath);
      console.log(`\n📸 Analyzing: ${path.basename(imagePath)}`);
      
      const result = await analyzer.analyzeImage(fullPath, {
        prompt: `Analyze this quaternion attractor image with focus on visual characteristics that could help improve code generation:

1. **Color Distribution**: Describe the color patterns, intensity gradients, and color density distribution across the image
2. **Point Distribution**: Analyze how points are distributed - are they clustered, sparse, dense, or uniform?
3. **Geometric Patterns**: Identify specific shapes, curves, lines, or geometric structures
4. **Visual Complexity**: Rate the visual complexity and describe what makes it complex or simple
5. **Symmetry Analysis**: Identify any symmetries, reflections, or rotational patterns
6. **Edge Effects**: Describe what happens at the edges and boundaries of the pattern
7. **Density Variations**: Note areas of high vs low point density and transitions between them
8. **Code Improvement Insights**: Based on the visual analysis, suggest what parameters or algorithms might need adjustment to improve the visual output

Be very specific about visual elements that could indicate issues with the mathematical generation or rendering process.`,
        maxTokens: 1200,
        temperature: 0.4,
      });

      if (result.success) {
        console.log('✅ Analysis successful!');
        console.log(`📝 Key Insights:\n${result.analysis?.substring(0, 300)}...\n`);
        results.push({ type: 'variation', image: imagePath, result });
      } else {
        console.log('❌ Analysis failed:', result.error);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 2. Analyze performance scaling effects
    console.log('\n📊 Analysis 2: Performance Scaling Effects');
    console.log('------------------------------------------');
    
    const performanceImages = [
      'performance/performance_500.png',
      'performance/performance_1000.png',
      'performance/performance_2000.png',
      'performance/performance_5000.png'
    ];

    for (const imagePath of performanceImages) {
      const fullPath = path.join(outputDir, imagePath);
      console.log(`\n📸 Analyzing: ${path.basename(imagePath)}`);
      
      const result = await analyzer.analyzeImage(fullPath, {
        prompt: `Analyze this quaternion attractor performance test image to understand how point count affects visual quality:

1. **Point Density**: How dense are the points? Is there good coverage or sparse areas?
2. **Visual Quality**: Does the pattern look complete, fragmented, or under-sampled?
3. **Pattern Clarity**: Can you clearly see the mathematical structure or is it obscured?
4. **Rendering Quality**: Are there any visual artifacts, aliasing, or rendering issues?
5. **Optimal Point Count**: Based on the visual quality, does this seem like too few, too many, or optimal number of points?
6. **Performance vs Quality Trade-off**: What would you recommend for balancing performance and visual quality?
7. **Missing Details**: What mathematical features might be missing due to insufficient sampling?

Focus on practical insights for optimizing the point generation algorithm.`,
        maxTokens: 800,
        temperature: 0.3,
      });

      if (result.success) {
        console.log('✅ Analysis successful!');
        console.log(`📝 Performance Insights:\n${result.analysis?.substring(0, 250)}...\n`);
        results.push({ type: 'performance', image: imagePath, result });
      } else {
        console.log('❌ Analysis failed:', result.error);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 3. Analyze animation frame evolution
    console.log('\n🎬 Analysis 3: Animation Frame Evolution');
    console.log('---------------------------------------');
    
    const animationFrames = [
      'animation/frame_000.png',
      'animation/frame_003.png',
      'animation/frame_007.png'
    ];

    for (const imagePath of animationFrames) {
      const fullPath = path.join(outputDir, imagePath);
      console.log(`\n📸 Analyzing: ${path.basename(imagePath)}`);
      
      const result = await analyzer.analyzeImage(fullPath, {
        prompt: `Analyze this animation frame of a quaternion attractor to understand temporal evolution:

1. **Frame Content**: What do you see in this specific frame? Is it empty, sparse, or populated?
2. **Evolution Stage**: Does this look like an early, middle, or late stage of the animation?
3. **Point Development**: How are points developing over time? Are they appearing, moving, or accumulating?
4. **Pattern Formation**: Is a pattern emerging, stable, or changing?
5. **Animation Quality**: Does this frame contribute well to a smooth animation sequence?
6. **Temporal Sampling**: Is the frame rate appropriate for capturing the dynamics?
7. **Visual Continuity**: How does this frame relate to the overall animation flow?

Focus on insights for improving the animation generation and temporal sampling.`,
        maxTokens: 600,
        temperature: 0.4,
      });

      if (result.success) {
        console.log('✅ Analysis successful!');
        console.log(`📝 Animation Insights:\n${result.analysis?.substring(0, 200)}...\n`);
        results.push({ type: 'animation', image: imagePath, result });
      } else {
        console.log('❌ Analysis failed:', result.error);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 4. Comparative analysis for code improvement insights
    console.log('\n🔍 Analysis 4: Comparative Analysis for Code Improvement');
    console.log('-------------------------------------------------------');
    
    const comparisonResult = await analyzer.compareImages([
      path.join(outputDir, 'variations/plain_flip.png'),
      path.join(outputDir, 'variations/flip_smallest.png'),
      path.join(outputDir, 'variations/flip_all_except_largest.png')
    ], {
      prompt: `Compare these three quaternion attractor variations to identify code improvement opportunities:

1. **Algorithm Differences**: What visual differences suggest different mathematical algorithms or parameters?
2. **Rendering Quality**: Which variation has the best visual quality and why?
3. **Pattern Completeness**: Which shows the most complete mathematical structure?
4. **Visual Artifacts**: Are there any rendering issues, aliasing, or visual problems?
5. **Parameter Optimization**: Based on the visual differences, what parameters might need tuning?
6. **Code Suggestions**: What specific improvements would you recommend for the generation algorithm?
7. **Best Practices**: Which variation demonstrates the best practices for mathematical visualization?

Provide actionable insights for improving the quaternion attractor generation code.`,
      maxTokens: 1500,
      temperature: 0.3,
    });

    if (comparisonResult.success) {
      console.log('✅ Comparative analysis successful!');
      console.log(`📝 Code Improvement Insights:\n${comparisonResult.analysis?.substring(0, 400)}...\n`);
      results.push({ type: 'comparison', result: comparisonResult });
    } else {
      console.log('❌ Comparative analysis failed:', comparisonResult.error);
    }

    // Save all results
    const outputPath = path.join(outputDir, 'detailed_visual_analysis_results.json');
    await analyzer.saveAnalysisResults(results, outputPath);
    
    console.log('🎉 Detailed Visual Analysis completed!');
    console.log(`📁 Results saved to: ${outputPath}`);
    console.log('\n📋 Summary of Analysis Types:');
    console.log('- Variation analysis: Color patterns and point distributions');
    console.log('- Performance analysis: Scaling effects and optimal point counts');
    console.log('- Animation analysis: Temporal evolution and frame quality');
    console.log('- Comparative analysis: Code improvement recommendations');

  } catch (error) {
    console.error('❌ Error in detailed visual analysis:', error);
    process.exit(1);
  }
}

// Run the analysis if this file is executed directly
if (require.main === module) {
  detailedVisualAnalysis().catch(console.error);
}

export { detailedVisualAnalysis };
