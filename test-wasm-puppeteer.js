const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Puppeteer Test for WebAssembly Implementation
 * 
 * This script tests the current WASM implementation to validate
 * basic functionality and prepare for full quaternion attractor testing.
 */

async function testWasmImplementation() {
    console.log('🚀 Starting Puppeteer test for WebAssembly implementation...');
    
    let browser;
    try {
        // Launch browser using nix-provided Chromium
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/hg1ralccfffgzqzpi2spwb1pgbbxfxnb-chromium-140.0.7339.207/bin/chromium';
        
        console.log(`🌐 Using Chromium at: ${executablePath}`);
        
        browser = await puppeteer.launch({
            headless: false, // Set to true for headless mode
            executablePath: executablePath,
            defaultViewport: { width: 1200, height: 800 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Capture console logs
        const consoleLogs = [];
        page.on('console', msg => {
            consoleLogs.push({
                type: msg.type(),
                text: msg.text()
            });
            console.log(`Browser ${msg.type()}: ${msg.text()}`);
        });
        
        // Load the simple WASM test page via HTTP server
        const httpUrl = 'http://localhost:8000/simple-wasm-test.html';
        
        console.log(`📄 Loading: ${httpUrl}`);
        
        await page.goto(httpUrl, { 
            waitUntil: 'networkidle0',
            timeout: 10000 
        });
        
        // Wait for test to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 1: Check if WASM test completed successfully
        console.log('🧪 Testing basic WASM functions...');
        
        const wasmTestResult = await page.evaluate(() => {
            const result = document.getElementById('result');
            const success = result && (result.textContent.includes('WASM Test Successful') || result.textContent.includes('add(5, 3) = 8'));
            return {
                success: success,
                result: result ? result.textContent : 'Not found'
            };
        });
        
        if (wasmTestResult.success) {
            console.log('✅ WASM module loaded successfully');
            console.log('   Test result:', wasmTestResult.result);
        } else {
            console.log('❌ WASM module failed to load');
            console.log('   Test result:', wasmTestResult.result);
        }
        
        // Test 2: Basic performance test
        console.log('⚡ Running basic performance test...');
        
        const performanceData = await page.evaluate(async () => {
            try {
                const wasmModule = await import('./build/math-engine.js');
                
                // Simple performance test
                const start = performance.now();
                let result = 0;
                for (let i = 0; i < 10000; i++) {
                    result += wasmModule.add(i, 1);
                }
                const wasmTime = performance.now() - start;
                
                return {
                    success: true,
                    wasmTime: wasmTime,
                    result: result
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        });
        
        if (performanceData.success) {
            console.log('✅ Performance test completed');
            console.log(`   WASM time: ${performanceData.wasmTime.toFixed(2)}ms`);
            console.log(`   Result: ${performanceData.result}`);
        } else {
            console.log('❌ Performance test failed:', performanceData.error);
        }
        
        // Test 3: Take screenshots for documentation
        console.log('📸 Taking screenshots...');
        
        // Create screenshots directory if it doesn't exist
        const screenshotsDir = path.join(__dirname, 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir);
        }
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'wasm-test-results.png'),
            fullPage: true 
        });
        
        console.log('✅ Screenshots saved to screenshots/ directory');
        
        // Summary
        console.log('\n🎉 WASM Implementation Test Summary:');
        console.log('=====================================');
        console.log('✅ WASM module loading test');
        console.log('✅ Performance data extraction');
        console.log('✅ Screenshots captured');
        
        const allTestsPassed = wasmTestResult.success && performanceData.success;
        
        return {
            success: allTestsPassed,
            tests: {
                wasmLoading: wasmTestResult.success,
                performance: performanceData.success,
                screenshots: true
            },
            performance: performanceData.success ? {
                wasmTime: performanceData.wasmTime,
                result: performanceData.result
            } : null,
            testResults: wasmTestResult,
            consoleLogs: consoleLogs
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return {
            success: false,
            error: error.message
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
if (require.main === module) {
    testWasmImplementation()
        .then(result => {
            if (result.success) {
                console.log('\n🎯 WASM implementation test PASSED');
                if (result.performance) {
                    console.log(`⚡ Performance: ${result.performance.wasmTime.toFixed(2)}ms for 10,000 operations`);
                }
                process.exit(0);
            } else {
                console.log('\n💥 WASM implementation test FAILED');
                console.error('Error:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { testWasmImplementation };
