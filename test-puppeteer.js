#!/usr/bin/env node

/**
 * Test script to verify Puppeteer works in nix-shell environment
 * Run this after entering nix-shell to test the setup
 */

const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('🧪 Testing Puppeteer in nix-shell environment...\n');
  
  try {
    // Test browser launch
    console.log('🚀 Launching Chromium...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    console.log('✅ Browser launched successfully');
    
    // Test page creation
    console.log('📄 Creating new page...');
    const page = await browser.newPage();
    console.log('✅ Page created successfully');
    
    // Test navigation
    console.log('🌐 Testing navigation...');
    await page.goto('data:text/html,<h1>Puppeteer Test</h1><p>If you can see this, Puppeteer is working!</p>');
    console.log('✅ Navigation successful');
    
    // Test content evaluation
    console.log('🔍 Testing content evaluation...');
    const title = await page.title();
    const content = await page.evaluate(() => document.body.textContent);
    console.log('✅ Content evaluation successful');
    console.log(`   Page title: "${title}"`);
    console.log(`   Page content: "${content.trim()}"`);
    
    // Test screenshot (optional)
    console.log('📸 Testing screenshot capability...');
    const screenshot = await page.screenshot({ 
      type: 'png',
      fullPage: true 
    });
    console.log(`✅ Screenshot captured (${screenshot.length} bytes)`);
    
    // Cleanup
    await browser.close();
    console.log('✅ Browser closed successfully');
    
    console.log('\n🎉 All tests passed! Puppeteer is working correctly in nix-shell.');
    console.log('\nNext steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run build:wasm');
    console.log('3. Run: npm test');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure you are in nix-shell: nix-shell');
    console.error('2. Check if Chromium is available: which chromium');
    console.error('3. Verify environment variables: echo $PUPPETEER_EXECUTABLE_PATH');
    process.exit(1);
  }
}

// Run the test
testPuppeteer();
