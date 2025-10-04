#!/usr/bin/env node

/**
 * Screenshot script for WASM Quaternion Attractor
 * Captures beautiful screenshots of the attractor in action
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureWasmAttractorScreenshot() {
  console.log('📸 Capturing WASM Quaternion Attractor Screenshot...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser
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
    }
    
    browser = await puppeteer.launch(launchOptions);
    console.log('✅ Browser launched successfully');
    
    // Create new page
    console.log('📄 Creating new page...');
    page = await browser.newPage();
    
    // Set larger viewport for better screenshots
    await page.setViewport({ width: 1400, height: 1000 });
    console.log('✅ Page created with viewport 1400x1000');
    
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
    
    // Wait for WASM module to load
    console.log('⏳ Waiting for WASM module initialization...');
    await page.waitForFunction(
      () => window.wasmAttractorModule !== undefined,
      { timeout: 30000 }
    );
    console.log('✅ WASM module loaded');
    
    // Wait for all status indicators to be green
    console.log('⏳ Waiting for all systems to initialize...');
    await page.waitForFunction(
      () => {
        const loadingStatus = document.getElementById('loading-status');
        const engineStatus = document.getElementById('engine-status');
        const performanceStatus = document.getElementById('performance-status');
        
        return loadingStatus && loadingStatus.textContent.includes('✅') &&
               engineStatus && engineStatus.textContent.includes('✅') &&
               performanceStatus && performanceStatus.textContent.includes('✅');
      },
      { timeout: 30000 }
    );
    console.log('✅ All systems initialized');
    
    // Generate points to make the visualization interesting
    console.log('🎯 Generating attractor points...');
    await page.click('#generate-btn');
    
    // Wait for generation to complete and animation to settle
    console.log('⏳ Waiting for point generation and visualization...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate more points for a richer visualization
    console.log('🎯 Generating additional points...');
    await page.click('#generate-btn');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take a full page screenshot
    console.log('📸 Capturing full page screenshot...');
    const fullPageScreenshot = await page.screenshot({ 
      type: 'png',
      fullPage: true
    });
    
    // Take a canvas-only screenshot
    console.log('📸 Capturing canvas screenshot...');
    const canvasScreenshot = await page.evaluate(() => {
      const canvas = document.getElementById('attractor-canvas');
      if (!canvas) return null;
      
      // Convert canvas to data URL
      return canvas.toDataURL('image/png');
    });
    
    // Save full page screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullPagePath = path.join(__dirname, `screenshots/wasm-attractor-fullpage-${timestamp}.png`);
    const canvasPath = path.join(__dirname, `screenshots/wasm-attractor-canvas-${timestamp}.png`);
    
    // Ensure screenshots directory exists
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    fs.writeFileSync(fullPagePath, fullPageScreenshot);
    console.log(`✅ Full page screenshot saved: ${fullPagePath} (${fullPageScreenshot.length} bytes)`);
    
    // Save canvas screenshot
    if (canvasScreenshot) {
      const canvasBuffer = Buffer.from(canvasScreenshot.split(',')[1], 'base64');
      fs.writeFileSync(canvasPath, canvasBuffer);
      console.log(`✅ Canvas screenshot saved: ${canvasPath} (${canvasBuffer.length} bytes)`);
    }
    
    // Get some stats about the visualization
    const stats = await page.evaluate(() => {
      const canvas = document.getElementById('attractor-canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      let pointCount = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) {
          pointCount++;
        }
      }
      
      const wasmModule = window.wasmAttractorModule;
      let engineStats = null;
      if (wasmModule && wasmModule.getStatistics) {
        try {
          const engines = wasmModule.getAllEngines();
          if (engines && engines.length > 0) {
            engineStats = wasmModule.getStatistics(engines[0]);
          }
        } catch (e) {
          // Ignore errors
        }
      }
      
      return {
        canvasSize: `${canvas.width}x${canvas.height}`,
        visiblePoints: pointCount,
        engineStats: engineStats
      };
    });
    
    console.log('\n📊 Screenshot Statistics:');
    console.log('========================');
    console.log(`Canvas size: ${stats.canvasSize}`);
    console.log(`Visible points: ${stats.visiblePoints}`);
    if (stats.engineStats) {
      console.log(`Total steps: ${stats.engineStats[0]}`);
      console.log(`Side flips: ${stats.engineStats[1]}`);
      console.log(`Current position: (${stats.engineStats[3].toFixed(3)}, ${stats.engineStats[4].toFixed(3)}, ${stats.engineStats[5].toFixed(3)})`);
    }
    
    console.log('\n🎉 Screenshot capture complete!');
    console.log('📁 Screenshots saved to:');
    console.log(`   📸 Full page: ${fullPagePath}`);
    console.log(`   🎨 Canvas only: ${canvasPath}`);
    
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error.message);
    console.error('\nStack trace:', error.stack);
    
    // Take error screenshot if page exists
    if (page) {
      try {
        const errorScreenshot = await page.screenshot({ type: 'png', fullPage: true });
        const errorScreenshotPath = path.join(__dirname, 'screenshots/wasm-attractor-error.png');
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

// Run the screenshot capture
captureWasmAttractorScreenshot();
