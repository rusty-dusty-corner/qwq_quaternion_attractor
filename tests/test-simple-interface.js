#!/usr/bin/env node

/**
 * Test the simple interface
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testSimpleInterface() {
  console.log('🧪 Testing Simple Interface...\n');
  
  let browser;
  let page;
  
  try {
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
    
    // Capture console logs
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      console.log(`Browser: [${msg.type()}] ${msg.text()}`);
    });
    
    await page.goto('http://localhost:8080/index-simple.html', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('\n⏳ Waiting for initialization...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n🎲 Testing random seed button...');
    const initialSeed = await page.evaluate(() => document.getElementById('seed').value);
    console.log(`Initial seed: ${initialSeed}`);
    
    await page.click('#randomSeed');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newSeed = await page.evaluate(() => document.getElementById('seed').value);
    console.log(`New seed: ${newSeed}`);
    console.log(`✅ Random seed working: ${newSeed !== initialSeed ? 'YES' : 'NO'}`);
    
    console.log('\n🎨 Testing generation...');
    await page.click('#generate');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Take screenshot
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'simple-interface-test.png'),
      fullPage: true 
    });
    
    // Save console logs
    const logsPath = path.join(screenshotsDir, 'simple-interface-logs.txt');
    fs.writeFileSync(logsPath, consoleLogs.join('\n'));
    
    console.log('\n🎉 Simple interface test completed!');
    console.log('📁 Screenshot: simple-interface-test.png');
    console.log('📁 Logs: simple-interface-logs.txt');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testSimpleInterface();
