#!/usr/bin/env node

/**
 * Test to capture console logs and debug the interface
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testConsoleLogs() {
  console.log('🔍 Testing Console Logs...\n');
  
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
    
    await page.goto('http://localhost:8080', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('\n⏳ Waiting for initialization...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🎲 Testing random seed button...');
    const initialSeed = await page.evaluate(() => document.getElementById('seed').value);
    console.log(`Initial seed: ${initialSeed}`);
    
    await page.click('#randomSeed');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newSeed = await page.evaluate(() => document.getElementById('seed').value);
    console.log(`New seed: ${newSeed}`);
    
    // Test direct function call
    console.log('\n🔧 Testing direct function call...');
    await page.evaluate(() => {
      console.log('Testing direct function call from page.evaluate');
      const seedInput = document.getElementById('seed');
      if (seedInput) {
        const randomSeed = Math.floor(Math.random() * 1000000);
        seedInput.value = randomSeed.toString();
        console.log('Direct function call result:', randomSeed);
      } else {
        console.log('Seed input not found!');
      }
    });
    
    const finalSeed = await page.evaluate(() => document.getElementById('seed').value);
    console.log(`Final seed: ${finalSeed}`);
    
    // Save console logs
    const logsPath = path.join(__dirname, 'screenshots', 'console-logs.txt');
    fs.writeFileSync(logsPath, consoleLogs.join('\n'));
    console.log(`\n📝 Console logs saved to: ${logsPath}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testConsoleLogs();
