#!/usr/bin/env node

/**
 * Simple Puppeteer script to take screenshots of the browser interface
 * Focuses on capturing the interface state without waiting for long operations
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  console.log('📸 Taking screenshots of Browser Quaternion Attractor Interface...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    console.log('🚀 Launching Chromium...');
    const launchOptions = {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--allow-file-access-from-files',
        '--disable-web-security'
      ]
    };
    
    const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/hg1ralccfffgzqzpi2spwb1pgbbxfxnb-chromium-140.0.7339.207/bin/chromium';
    if (require('fs').existsSync(chromiumPath)) {
      launchOptions.executablePath = chromiumPath;
    }
    
    browser = await puppeteer.launch(launchOptions);
    page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1000 });
    
    console.log('✅ Browser launched');
    
    // Navigate to interface
    console.log('🌐 Loading interface...');
    await page.goto('http://localhost:8080', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    console.log('✅ Interface loaded');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Screenshot 1: Initial state
    console.log('📸 Taking initial state screenshot...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'browser-interface-initial.png'),
      fullPage: true 
    });
    console.log('✅ Initial screenshot saved');
    
    // Screenshot 2: After clicking random seed
    console.log('📸 Testing random seed button...');
    await page.click('#randomSeed');
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'browser-interface-random-seed.png'),
      fullPage: true 
    });
    console.log('✅ Random seed screenshot saved');
    
    // Screenshot 3: After changing parameters
    console.log('📸 Testing parameter changes...');
    await page.evaluate(() => {
      document.getElementById('points').value = '1000';
      document.getElementById('scale').value = '180';
      document.getElementById('mode').value = '2';
    });
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'browser-interface-parameters-changed.png'),
      fullPage: true 
    });
    console.log('✅ Parameters changed screenshot saved');
    
    // Screenshot 4: During generation (click generate and take screenshot quickly)
    console.log('📸 Testing generation start...');
    await page.click('#generate');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'browser-interface-generation-start.png'),
      fullPage: true 
    });
    console.log('✅ Generation start screenshot saved');
    
    // Screenshot 5: Check console logs
    console.log('📝 Capturing console logs...');
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Wait a bit more and take another screenshot
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'browser-interface-generation-progress.png'),
      fullPage: true 
    });
    console.log('✅ Generation progress screenshot saved');
    
    // Save console logs
    const logsPath = path.join(screenshotsDir, 'browser-interface-console-logs.txt');
    fs.writeFileSync(logsPath, consoleLogs.join('\n'));
    console.log('✅ Console logs saved');
    
    // Screenshot 6: Final state (whatever it is)
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'browser-interface-final-state.png'),
      fullPage: true 
    });
    console.log('✅ Final state screenshot saved');
    
    // Check what elements are visible
    const elementStatus = await page.evaluate(() => {
      const loading = document.getElementById('loading');
      const imageContainer = document.getElementById('imageContainer');
      const error = document.getElementById('error');
      const generateBtn = document.getElementById('generate');
      
      return {
        loadingVisible: loading && loading.style.display !== 'none',
        imageVisible: imageContainer && imageContainer.style.display !== 'none',
        errorVisible: error && error.style.display !== 'none',
        generateBtnDisabled: generateBtn && generateBtn.disabled,
        currentSeed: document.getElementById('seed').value,
        currentPoints: document.getElementById('points').value,
        currentMode: document.getElementById('mode').value
      };
    });
    
    console.log('\n📊 Final Element Status:');
    console.log(`   Loading visible: ${elementStatus.loadingVisible}`);
    console.log(`   Image visible: ${elementStatus.imageVisible}`);
    console.log(`   Error visible: ${elementStatus.errorVisible}`);
    console.log(`   Generate button disabled: ${elementStatus.generateBtnDisabled}`);
    console.log(`   Current seed: ${elementStatus.currentSeed}`);
    console.log(`   Current points: ${elementStatus.currentPoints}`);
    console.log(`   Current mode: ${elementStatus.currentMode}`);
    
    console.log('\n🎉 Screenshot capture completed!');
    console.log(`📁 Screenshots saved in: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error.message);
    
    if (page) {
      try {
        const errorScreenshot = await page.screenshot({ type: 'png', fullPage: true });
        const errorScreenshotPath = path.join(__dirname, 'screenshots', 'browser-interface-error.png');
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
takeScreenshots();
