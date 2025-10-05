import { GroqVisionAnalyzer } from '../typescript/node/groq-vision-analyzer';
import * as path from 'path';

/**
 * Simple test script to verify Groq Vision API integration
 */
async function testGroqIntegration() {
  console.log('🧪 Testing Groq Vision API Integration');
  console.log('=====================================\n');

  try {
    // Initialize the analyzer
    const analyzer = new GroqVisionAnalyzer();
    console.log('✅ Groq Vision Analyzer initialized successfully\n');

    // Test with the basic attractor image
    const testImagePath = path.join(__dirname, '../../output/png_examples/basic_attractor.png');
    
    console.log(`📸 Testing with image: ${path.basename(testImagePath)}`);
    console.log('🔄 Sending request to Groq API...\n');

    // Simple analysis test
    const result = await analyzer.analyzeImage(testImagePath, {
      prompt: 'Describe this mathematical visualization in 2-3 sentences. What kind of pattern do you see?',
      maxTokens: 200,
      temperature: 0.5,
    });

    if (result.success) {
      console.log('✅ Analysis successful!');
      console.log(`📊 Model: ${result.model}`);
      console.log(`⏰ Timestamp: ${result.timestamp.toISOString()}`);
      console.log(`📝 Analysis:\n${result.analysis}\n`);
      
      // Save the test result
      const outputPath = path.join(__dirname, '../../output/groq_test_result.json');
      await analyzer.saveAnalysisResults(result, outputPath);
      console.log(`💾 Test result saved to: ${outputPath}`);
      
    } else {
      console.log('❌ Analysis failed:');
      console.log(`Error: ${result.error}`);
      console.log(`Model: ${result.model}`);
      console.log(`Timestamp: ${result.timestamp.toISOString()}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testGroqIntegration().catch(console.error);
}

export { testGroqIntegration };
