import { GroqVisionAnalyzer } from '../typescript/node/groq-vision-analyzer';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Analyze legacy screenshots from Puppeteer tests to understand
 * the differences between legacy and current implementations
 */
async function analyzeLegacyScreenshots() {
  console.log('📸 Analyzing Legacy Screenshots for Development Insights');
  console.log('======================================================\n');

  try {
    const analyzer = new GroqVisionAnalyzer();
    console.log('✅ Groq Vision Analyzer initialized\n');

    const screenshotsDir = path.join(__dirname, '../../screenshots');
    const results: any[] = [];

    // Check what screenshots are available
    console.log('🔍 Discovering available screenshots...');
    const screenshotFiles = fs.readdirSync(screenshotsDir)
      .filter(file => file.endsWith('.png'))
      .sort();

    console.log(`📁 Found ${screenshotFiles.length} screenshots:`);
    screenshotFiles.forEach(file => {
      const filePath = path.join(screenshotsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   📸 ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
    });

    // 1. Analyze legacy implementation screenshots
    console.log('\n🕰️ Analysis 1: Legacy Implementation Screenshots');
    console.log('-----------------------------------------------');
    
    const legacyScreenshots = screenshotFiles.filter(file => 
      file.includes('legacy') || file.includes('initial') || file.includes('randomized')
    );

    for (const screenshot of legacyScreenshots) {
      const fullPath = path.join(screenshotsDir, screenshot);
      console.log(`\n📸 Analyzing: ${screenshot}`);
      
      const result = await analyzer.analyzeImage(fullPath, {
        prompt: `Analyze this legacy quaternion attractor implementation screenshot. Focus on:

1. **Visual Quality**: How does the overall visual quality compare to modern implementations?
2. **Pattern Complexity**: What mathematical patterns and structures are visible?
3. **Rendering Quality**: Are there any rendering artifacts, aliasing, or visual issues?
4. **Point Distribution**: How are points distributed across the canvas?
5. **Color and Styling**: What color scheme and visual styling is used?
6. **Performance Indicators**: Based on the visual density, what can you infer about performance?
7. **Implementation Insights**: What does this tell us about the underlying algorithm?
8. **Comparison Value**: How does this compare to what we'd expect from a modern implementation?

Provide insights that could help improve the current draft01 implementation.`,
        maxTokens: 1000,
        temperature: 0.4,
      });

      if (result.success) {
        console.log('✅ Analysis successful!');
        console.log(`📝 Key Insights:\n${result.analysis?.substring(0, 300)}...\n`);
        results.push({ type: 'legacy', image: screenshot, result });
      } else {
        console.log('❌ Analysis failed:', result.error);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 2. Analyze WASM implementation screenshots
    console.log('\n⚡ Analysis 2: WASM Implementation Screenshots');
    console.log('---------------------------------------------');
    
    const wasmScreenshots = screenshotFiles.filter(file => 
      file.includes('wasm') || file.includes('test-results')
    );

    for (const screenshot of wasmScreenshots) {
      const fullPath = path.join(screenshotsDir, screenshot);
      console.log(`\n📸 Analyzing: ${screenshot}`);
      
      const result = await analyzer.analyzeImage(fullPath, {
        prompt: `Analyze this WebAssembly (WASM) quaternion attractor implementation screenshot. Focus on:

1. **WASM Performance**: What visual indicators suggest good or poor WASM performance?
2. **Mathematical Accuracy**: Are the mathematical patterns correct and well-formed?
3. **Visual Complexity**: How complex and interesting are the generated patterns?
4. **Rendering Efficiency**: Is the rendering smooth and artifact-free?
5. **Point Generation**: How well are points generated and distributed?
6. **UI/UX Quality**: How does the user interface and user experience look?
7. **Technical Implementation**: What does this reveal about the WASM implementation quality?
8. **Improvement Opportunities**: What specific areas need improvement?

Compare this to what we know about the current draft01 implementation issues.`,
        maxTokens: 1000,
        temperature: 0.4,
      });

      if (result.success) {
        console.log('✅ Analysis successful!');
        console.log(`📝 Key Insights:\n${result.analysis?.substring(0, 300)}...\n`);
        results.push({ type: 'wasm', image: screenshot, result });
      } else {
        console.log('❌ Analysis failed:', result.error);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 3. Compare legacy vs WASM implementations
    if (legacyScreenshots.length > 0 && wasmScreenshots.length > 0) {
      console.log('\n🔄 Analysis 3: Legacy vs WASM Comparison');
      console.log('---------------------------------------');
      
      const comparisonImages = [
        path.join(screenshotsDir, legacyScreenshots[0]),
        path.join(screenshotsDir, wasmScreenshots[0])
      ];

      const comparisonResult = await analyzer.compareImages(comparisonImages, {
        prompt: `Compare these two quaternion attractor implementations - one legacy and one WASM. Analyze:

1. **Visual Quality Comparison**: Which implementation produces better visual results?
2. **Pattern Complexity**: Which shows more interesting mathematical patterns?
3. **Performance Indicators**: What visual clues suggest better performance?
4. **Rendering Quality**: Which has better rendering quality and fewer artifacts?
5. **Mathematical Accuracy**: Which appears more mathematically correct?
6. **Implementation Maturity**: Which looks more polished and complete?
7. **Development Insights**: What can we learn for improving the draft01 implementation?
8. **Best Practices**: What should we adopt from the better implementation?

Provide actionable insights for the draft01 development.`,
        maxTokens: 1200,
        temperature: 0.3,
      });

      if (comparisonResult.success) {
        console.log('✅ Comparison analysis successful!');
        console.log(`📝 Comparison Insights:\n${comparisonResult.analysis?.substring(0, 400)}...\n`);
        results.push({ type: 'comparison', result: comparisonResult });
      } else {
        console.log('❌ Comparison analysis failed:', comparisonResult.error);
      }
    }

    // 4. Analyze error screenshots (if any)
    console.log('\n🚨 Analysis 4: Error Screenshots');
    console.log('--------------------------------');
    
    const errorScreenshots = screenshotFiles.filter(file => 
      file.includes('error') || file.includes('failed')
    );

    for (const screenshot of errorScreenshots) {
      const fullPath = path.join(screenshotsDir, screenshot);
      console.log(`\n📸 Analyzing: ${screenshot}`);
      
      const result = await analyzer.analyzeImage(fullPath, {
        prompt: `Analyze this error screenshot from a quaternion attractor implementation. Focus on:

1. **Error Identification**: What specific errors or issues are visible?
2. **Failure Points**: Where did the implementation fail?
3. **Debugging Information**: What debugging information is available?
4. **Root Cause Analysis**: What might have caused these errors?
5. **Prevention Strategies**: How could these errors be prevented in draft01?
6. **Error Handling**: What error handling improvements are needed?
7. **Development Process**: What does this reveal about the development process?
8. **Quality Assurance**: What testing improvements are needed?

Provide insights for improving error handling and debugging in the draft01 implementation.`,
        maxTokens: 800,
        temperature: 0.3,
      });

      if (result.success) {
        console.log('✅ Error analysis successful!');
        console.log(`📝 Error Insights:\n${result.analysis?.substring(0, 250)}...\n`);
        results.push({ type: 'error', image: screenshot, result });
      } else {
        console.log('❌ Error analysis failed:', result.error);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Save all results
    const outputPath = path.join(screenshotsDir, 'legacy_screenshot_analysis_results.json');
    await analyzer.saveAnalysisResults(results, outputPath);
    
    console.log('🎉 Legacy Screenshot Analysis completed!');
    console.log(`📁 Results saved to: ${outputPath}`);
    console.log('\n📋 Summary of Analysis Types:');
    console.log('- Legacy implementation analysis: Understanding historical approach');
    console.log('- WASM implementation analysis: Performance and quality assessment');
    console.log('- Legacy vs WASM comparison: Identifying best practices');
    console.log('- Error analysis: Learning from failures and debugging');

    // Generate development recommendations
    console.log('\n🎯 Development Recommendations for draft01:');
    console.log('==========================================');
    console.log('Based on the analysis, consider these improvements:');
    console.log('1. Study the legacy implementation for proven patterns');
    console.log('2. Adopt WASM performance optimizations where applicable');
    console.log('3. Implement robust error handling and debugging');
    console.log('4. Focus on visual quality and mathematical accuracy');
    console.log('5. Use these insights to fix the under-sampling issues identified earlier');

  } catch (error) {
    console.error('❌ Error in legacy screenshot analysis:', error);
    process.exit(1);
  }
}

// Run the analysis if this file is executed directly
if (require.main === module) {
  analyzeLegacyScreenshots().catch(console.error);
}

export { analyzeLegacyScreenshots };
