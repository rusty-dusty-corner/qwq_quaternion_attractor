#!/usr/bin/env node

/**
 * Quick test of the improved browser interface
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testImprovedInterface() {
  console.log('🧪 Testing Improved Browser Interface...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    const launchOptions = {
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    
    const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/hg1ralccfffgzqzpi2spwb1pgbbxfxnb-chromium-140.0.7339.207/bin/chromium';
    if (require('fs').existsSync(chromiumPath)) {
      launchOptions.executablePath = chromiumPath;
    }
    
    browser = await puppeteer.launch(launchOptions);
    page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1000 });
    
    // Navigate to interface
    await page.goto('http://localhost:8080', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Test 1: Random seed button
    console.log('🎲 Testing random seed button...');
    const initialSeed = await page.evaluate(() => document.getElementById('seed').value);
    await page.click('#randomSeed');
    await new Promise(resolve => setTimeout(resolve, 500));
    const newSeed = await page.evaluate(() => document.getElementById('seed').value);
    
    console.log(`   Initial seed: ${initialSeed}`);
    console.log(`   New seed: ${newSeed}`);
    console.log(`   ✅ Random seed working: ${newSeed !== initialSeed ? 'YES' : 'NO'}`);
    
    // Test 2: Generation with timeout
    console.log('🎨 Testing generation with improved timeout...');
    await page.click('#generate');
    
    // Wait for generation to complete or timeout
    try {
      await page.waitForFunction(
        () => {
          const loading = document.getElementById('loading');
          const imageContainer = document.getElementById('imageContainer');
          return loading.style.display === 'none' && imageContainer.style.display !== 'none';
        },
        { timeout: 25000 } // 25 second timeout
      );
      
      console.log('   ✅ Generation completed successfully!');
      
      // Check if image is displayed
      const imageSrc = await page.evaluate(() => {
        const img = document.getElementById('attractorImage');
        return img ? img.src : null;
      });
      
      console.log(`   ✅ Image generated: ${imageSrc ? 'YES' : 'NO'}`);
      if (imageSrc) {
        console.log(`   ✅ Image data length: ${imageSrc.length} characters`);
      }
      
    } catch (timeoutError) {
      console.log('   ⏰ Generation timed out, checking error state...');
      
      // Check for error message
      const errorVisible = await page.evaluate(() => {
        const error = document.getElementById('error');
        return error && error.style.display !== 'none';
      });
      
      console.log(`   ✅ Error handling: ${errorVisible ? 'Error shown' : 'No error shown'}`);
    }
    
    // Take final screenshot
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'improved-interface-test.png'),
      fullPage: true 
    });
    
    console.log('\n🎉 Improved interface test completed!');
    console.log('📁 Screenshot saved: improved-interface-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testImprovedInterface();
