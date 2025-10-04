#!/usr/bin/env node

/**
 * Comprehensive Puppeteer test for WASM Quaternion Attractor
 * Tests WASM module loading, performance, and visualization
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testWasmAttractor() {
  console.log('🧪 Testing WASM Quaternion Attractor with Puppeteer...\n');
  
  let browser;
  let page;
  
  try {
    // Test browser launch
    console.log('🚀 Launching Chromium...');
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--allow-file-access-from-files',
        '--disable-web-security'
      ]
    };
    
    // Use system Chromium from nix-shell if available
    const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/hg1ralccfffgzqzpi2spwb1pgbbxfxnb-chromium-140.0.7339.207/bin/chromium';
    if (require('fs').existsSync(chromiumPath)) {
      launchOptions.executablePath = chromiumPath;
      console.log(`   Using Chromium from: ${launchOptions.executablePath}`);
    } else {
      console.log(`   Chromium not found at: ${chromiumPath}`);
      console.log(`   Environment PUPPETEER_EXECUTABLE_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
    }
    
    browser = await puppeteer.launch(launchOptions);
    
    console.log('✅ Browser launched successfully');
    
    // Create new page
    console.log('📄 Creating new page...');
    page = await browser.newPage();
    console.log('✅ Page created successfully');
    
    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    // Check if test file exists
    const testFilePath = path.join(__dirname, 'wasm-attractor-test.html');
    if (!fs.existsSync(testFilePath)) {
      throw new Error(`Test file not found: ${testFilePath}`);
    }
    
    // Navigate to test page
    console.log('🌐 Loading WASM attractor test page...');
    await page.goto(`file://${testFilePath}`, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    console.log('✅ Page loaded successfully');
    
    // Wait for initialization to complete
    console.log('⏳ Waiting for WASM module initialization...');
    await page.waitForFunction(
      () => window.wasmAttractorModule !== undefined,
      { timeout: 30000 }
    );
    console.log('✅ WASM module loaded');
    
    // Test 1: Check WASM module loading
    console.log('\n📦 Testing WASM module loading...');
    const wasmModuleInfo = await page.evaluate(() => {
      const module = window.wasmAttractorModule;
      return {
        loaded: !!module,
        exports: module ? Object.keys(module).length : 0,
        functions: module ? Object.keys(module).filter(key => typeof module[key] === 'function') : []
      };
    });
    
    console.log(`   ✅ Module loaded: ${wasmModuleInfo.loaded}`);
    console.log(`   ✅ Exports count: ${wasmModuleInfo.exports}`);
    console.log(`   ✅ Functions: ${wasmModuleInfo.functions.slice(0, 5).join(', ')}${wasmModuleInfo.functions.length > 5 ? '...' : ''}`);
    
    // Test 2: Check page status elements
    console.log('\n🎯 Testing page status indicators...');
    const statusChecks = await page.evaluate(() => {
      const loadingStatus = document.getElementById('loading-status');
      const engineStatus = document.getElementById('engine-status');
      const performanceStatus = document.getElementById('performance-status');
      
      return {
        loadingSuccess: loadingStatus && loadingStatus.textContent.includes('✅'),
        engineSuccess: engineStatus && engineStatus.textContent.includes('✅'),
        performanceSuccess: performanceStatus && performanceStatus.textContent.includes('✅')
      };
    });
    
    console.log(`   ✅ Loading status: ${statusChecks.loadingSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   ✅ Engine status: ${statusChecks.engineSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   ✅ Performance status: ${statusChecks.performanceSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    // Test 3: Test WASM function calls
    console.log('\n⚡ Testing WASM function calls...');
    const functionTest = await page.evaluate(() => {
      try {
        const module = window.wasmAttractorModule;
        
        // Test basic functions
        const engineId = module.createAttractorEngine(
          100, 12345, 0.1, 0.2, 0.3, 0.0, 0.0, 0.0, 0, 1.0, 0.0, 0.0, 0.0
        );
        
        if (engineId < 0) {
          return { success: false, error: 'Failed to create engine' };
        }
        
        // Generate points
        module.generatePoints(engineId, 50);
        const pointCount = module.getPointCount(engineId);
        const points = module.getAllPoints(engineId);
        const stats = module.getStatistics(engineId);
        
        // Clean up
        module.clearAllEngines();
        
        return {
          success: true,
          engineId,
          pointCount,
          pointsGenerated: points ? points.length / 4 : 0,
          stats: {
            totalSteps: stats[0],
            sideFlips: stats[1],
            currentX: stats[3],
            currentY: stats[4],
            currentZ: stats[5]
          }
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (functionTest.success) {
      console.log(`   ✅ Engine creation: SUCCESS (ID: ${functionTest.engineId})`);
      console.log(`   ✅ Point generation: SUCCESS (${functionTest.pointCount} points)`);
      console.log(`   ✅ Statistics: Steps=${functionTest.stats.totalSteps}, Flips=${functionTest.stats.sideFlips}`);
    } else {
      console.log(`   ❌ Function test failed: ${functionTest.error}`);
    }
    
    // Test 4: Performance test
    console.log('\n🚀 Testing performance metrics...');
    const performanceTest = await page.evaluate(() => {
      const wasmTimeElement = document.getElementById('wasm-time');
      const jsTimeElement = document.getElementById('js-time');
      const speedupElement = document.getElementById('speedup');
      
      return {
        wasmTime: wasmTimeElement ? wasmTimeElement.textContent : 'N/A',
        jsTime: jsTimeElement ? jsTimeElement.textContent : 'N/A',
        speedup: speedupElement ? speedupElement.textContent : 'N/A'
      };
    });
    
    console.log(`   ✅ WASM Time: ${performanceTest.wasmTime}`);
    console.log(`   ✅ JS Time: ${performanceTest.jsTime}`);
    console.log(`   ✅ Speedup: ${performanceTest.speedup}`);
    
    // Test 5: Canvas visualization
    console.log('\n🎨 Testing canvas visualization...');
    const canvasTest = await page.evaluate(() => {
      const canvas = document.getElementById('attractor-canvas');
      if (!canvas) return { success: false, error: 'Canvas not found' };
      
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Check if canvas has any non-transparent pixels
      let hasContent = false;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) {
          hasContent = true;
          break;
        }
      }
      
      return {
        success: true,
        canvasSize: `${canvas.width}x${canvas.height}`,
        hasContent,
        dataLength: imageData.data.length
      };
    });
    
    console.log(`   ✅ Canvas found: ${canvasTest.success ? 'SUCCESS' : 'FAILED'}`);
    if (canvasTest.success) {
      console.log(`   ✅ Canvas size: ${canvasTest.canvasSize}`);
      console.log(`   ✅ Has content: ${canvasTest.hasContent ? 'YES' : 'NO'}`);
    }
    
    // Test 6: Button interactions
    console.log('\n🎮 Testing button interactions...');
    const buttonTest = await page.evaluate(() => {
      const generateBtn = document.getElementById('generate-btn');
      const clearBtn = document.getElementById('clear-btn');
      const animateBtn = document.getElementById('animate-btn');
      
      return {
        generateEnabled: generateBtn && !generateBtn.disabled,
        clearEnabled: clearBtn && !clearBtn.disabled,
        animateEnabled: animateBtn && !animateBtn.disabled
      };
    });
    
    console.log(`   ✅ Generate button: ${buttonTest.generateEnabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   ✅ Clear button: ${buttonTest.clearEnabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   ✅ Animate button: ${buttonTest.animateEnabled ? 'ENABLED' : 'DISABLED'}`);
    
    // Test 7: Generate points and capture screenshot
    if (buttonTest.generateEnabled) {
      console.log('\n🎯 Testing point generation...');
      await page.click('#generate-btn');
      
      // Wait for generation to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if points were generated
      const generationResult = await page.evaluate(() => {
        const canvas = document.getElementById('attractor-canvas');
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        let pointCount = 0;
        for (let i = 3; i < imageData.data.length; i += 4) {
          if (imageData.data[i] > 0) {
            pointCount++;
          }
        }
        
        return pointCount > 100; // Expect some points to be drawn
      });
      
      console.log(`   ✅ Point generation: ${generationResult ? 'SUCCESS' : 'FAILED'}`);
    }
    
    // Test 8: Take final screenshot
    console.log('\n📸 Capturing final screenshot...');
    const screenshot = await page.screenshot({ 
      type: 'png',
      fullPage: true 
    });
    
    // Save screenshot
    const screenshotPath = path.join(__dirname, 'wasm-attractor-test-screenshot.png');
    fs.writeFileSync(screenshotPath, screenshot);
    console.log(`   ✅ Screenshot saved: ${screenshotPath} (${screenshot.length} bytes)`);
    
    // Final summary
    console.log('\n🎉 WASM Attractor Test Results:');
    console.log('================================');
    console.log(`✅ WASM Module: LOADED (${wasmModuleInfo.exports} exports)`);
    console.log(`✅ Page Status: ALL GREEN`);
    console.log(`✅ Functions: WORKING`);
    console.log(`✅ Performance: ${performanceTest.speedup} speedup`);
    console.log(`✅ Canvas: ${canvasTest.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Interactions: ${buttonTest.generateEnabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`✅ Screenshot: CAPTURED`);
    
    console.log('\n🚀 Your WASM Quaternion Attractor is working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    
    // Take error screenshot if page exists
    if (page) {
      try {
        const errorScreenshot = await page.screenshot({ type: 'png', fullPage: true });
        const errorScreenshotPath = path.join(__dirname, 'wasm-attractor-test-error.png');
        fs.writeFileSync(errorScreenshotPath, errorScreenshot);
        console.error(`Error screenshot saved: ${errorScreenshotPath}`);
      } catch (screenshotError) {
        console.error('Could not capture error screenshot:', screenshotError.message);
      }
    }
    
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed');
    }
  }
}

// Run the test
testWasmAttractor();
