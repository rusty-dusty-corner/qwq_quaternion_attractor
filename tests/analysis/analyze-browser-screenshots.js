#!/usr/bin/env node

/**
 * Groq Vision API Analysis for Browser Interface Screenshots
 * Analyzes the new browser interface screenshots to understand functionality and issues
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

async function analyzeBrowserScreenshots() {
  console.log('🔍 Analyzing Browser Interface Screenshots with Groq Vision API...\n');
  
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const results = [];
  
  // Define the screenshots to analyze
  const screenshotsToAnalyze = [
    {
      file: 'browser-interface-initial.png',
      description: 'Initial state of the browser interface'
    },
    {
      file: 'browser-interface-random-seed.png',
      description: 'Interface after clicking random seed button'
    },
    {
      file: 'browser-interface-parameters-changed.png',
      description: 'Interface after changing parameters (points, scale, mode)'
    },
    {
      file: 'browser-interface-generation-start.png',
      description: 'Interface when generation starts (loading state)'
    },
    {
      file: 'browser-interface-generation-progress.png',
      description: 'Interface during generation progress'
    },
    {
      file: 'browser-interface-final-state.png',
      description: 'Final state of the interface after generation attempt'
    },
    {
      file: 'browser-interface-test-error.png',
      description: 'Error state from the comprehensive test'
    }
  ];
  
  for (const screenshot of screenshotsToAnalyze) {
    const screenshotPath = path.join(screenshotsDir, screenshot.file);
    
    if (!fs.existsSync(screenshotPath)) {
      console.log(`⚠️  Screenshot not found: ${screenshot.file}`);
      continue;
    }
    
    console.log(`📸 Analyzing: ${screenshot.file}`);
    console.log(`   Description: ${screenshot.description}`);
    
    try {
      // Read the image file
      const imageBuffer = fs.readFileSync(screenshotPath);
      const base64Image = imageBuffer.toString('base64');
      
      // Create the analysis prompt
      const analysisPrompt = `
Analyze this screenshot of a Quaternion Attractor Browser Interface. Please provide a detailed analysis covering:

1. **Interface Elements**: What UI elements are visible (buttons, inputs, displays)?
2. **Visual State**: What is the current state of the interface (loading, error, success)?
3. **Functionality**: What appears to be working or not working?
4. **Visual Quality**: How does the interface look (design, layout, colors)?
5. **Issues**: Any obvious problems or errors visible?
6. **Attractor Visualization**: Is there any mathematical visualization visible? If so, describe it.
7. **Technical Assessment**: What can you infer about the technical implementation?

Focus on:
- Whether the interface is functional
- If any attractor visualizations are present
- Any error states or loading indicators
- The overall user experience
- Technical implementation quality

Be specific and detailed in your analysis.
      `;
      
      // Call Groq Vision API
      const response = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt
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
        max_tokens: 2000,
        temperature: 0.1
      });
      
      const analysis = response.choices[0].message.content;
      
      console.log(`   ✅ Analysis completed`);
      console.log(`   📝 Analysis length: ${analysis.length} characters`);
      
      // Store the result
      results.push({
        file: screenshot.file,
        description: screenshot.description,
        analysis: analysis,
        timestamp: new Date().toISOString()
      });
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ Analysis failed: ${error.message}`);
      results.push({
        file: screenshot.file,
        description: screenshot.description,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Save results to file
  const resultsPath = path.join(screenshotsDir, 'browser_interface_analysis_results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('📊 Analysis Summary:');
  console.log('==================');
  console.log(`✅ Screenshots analyzed: ${results.filter(r => !r.error).length}`);
  console.log(`❌ Analysis failures: ${results.filter(r => r.error).length}`);
  console.log(`📁 Results saved to: ${resultsPath}`);
  
  // Print summary of each analysis
  console.log('\n📋 Analysis Summary:');
  console.log('====================');
  
  for (const result of results) {
    if (result.error) {
      console.log(`❌ ${result.file}: ${result.error}`);
    } else {
      // Extract key points from analysis
      const analysis = result.analysis;
      const hasVisualization = analysis.toLowerCase().includes('visualization') || 
                              analysis.toLowerCase().includes('attractor') ||
                              analysis.toLowerCase().includes('image');
      const hasError = analysis.toLowerCase().includes('error') || 
                      analysis.toLowerCase().includes('failed') ||
                      analysis.toLowerCase().includes('problem');
      const hasLoading = analysis.toLowerCase().includes('loading') || 
                        analysis.toLowerCase().includes('generating');
      
      console.log(`📸 ${result.file}:`);
      console.log(`   Visualization: ${hasVisualization ? '✅ YES' : '❌ NO'}`);
      console.log(`   Error State: ${hasError ? '⚠️  YES' : '✅ NO'}`);
      console.log(`   Loading State: ${hasLoading ? '⏳ YES' : '✅ NO'}`);
      console.log(`   Analysis: ${analysis.substring(0, 100)}...`);
      console.log('');
    }
  }
  
  return results;
}

// Run the analysis
analyzeBrowserScreenshots().catch(console.error);
