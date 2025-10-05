const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testESModules() {
    console.log('🧪 Testing ES module loading...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            console.log(`📱 Browser: ${msg.text()}`);
        });
        
        // Capture network errors
        page.on('requestfailed', request => {
            console.log(`❌ Request failed: ${request.url()} - ${request.failure().errorText}`);
        });
        
        console.log('🌐 Navigating to simple interface...');
        await page.goto('http://localhost:8080/index-simple.html', { 
            waitUntil: 'networkidle2',
            timeout: 10000 
        });
        
        console.log('⏳ Waiting for interface to load...');
        await page.waitForTimeout(3000);
        
        // Test random seed button
        console.log('🎲 Testing random seed button...');
        await page.click('#randomSeed');
        await page.waitForTimeout(1000);
        
        // Check if seed value changed
        const seedValue = await page.$eval('#seed', el => el.value);
        console.log(`🎲 Seed value after click: ${seedValue}`);
        
        // Test generate button
        console.log('🎨 Testing generate button...');
        await page.click('#generate');
        await page.waitForTimeout(5000);
        
        // Check for any error messages
        const errorVisible = await page.$eval('#error', el => el.style.display !== 'none');
        if (errorVisible) {
            const errorText = await page.$eval('#error', el => el.textContent);
            console.log(`❌ Error displayed: ${errorText}`);
        }
        
        // Take screenshot
        const screenshotPath = path.join(__dirname, 'screenshots', 'es-modules-test.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
        
        console.log('✅ ES module test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testESModules().catch(console.error);
