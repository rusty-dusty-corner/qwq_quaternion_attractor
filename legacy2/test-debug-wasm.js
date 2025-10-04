const puppeteer = require('puppeteer');

async function testDebugWasm() {
    console.log('🔍 Testing WASM debug page...');
    
    let browser;
    try {
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/hg1ralccfffgzqzpi2spwb1pgbbxfxnb-chromium-140.0.7339.207/bin/chromium';
        
        browser = await puppeteer.launch({
            headless: false,
            executablePath: executablePath,
            defaultViewport: { width: 1200, height: 800 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Capture console logs
        page.on('console', msg => {
            console.log(`Browser ${msg.type()}: ${msg.text()}`);
        });
        
        // Load debug page
        await page.goto('http://localhost:8000/debug-wasm.html', { 
            waitUntil: 'networkidle0',
            timeout: 10000 
        });
        
        // Wait for test to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get the output
        const output = await page.evaluate(() => {
            const outputDiv = document.getElementById('output');
            return outputDiv ? outputDiv.innerHTML : 'No output found';
        });
        
        console.log('📄 Debug output:');
        console.log(output);
        
        // Check if test was successful (ignore 404 errors for now)
        const success = output.includes('Engine created with ID:') && 
                       output.includes('Generated') && 
                       output.includes('Retrieved');
        
        if (success) {
            console.log('✅ WASM debug test PASSED');
        } else {
            console.log('❌ WASM debug test FAILED');
        }
        
        return { success, output };
        
    } catch (error) {
        console.error('❌ Debug test failed:', error);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
if (require.main === module) {
    testDebugWasm()
        .then(result => {
            if (result.success) {
                console.log('\n🎯 WASM is working correctly!');
                process.exit(0);
            } else {
                console.log('\n💥 WASM has issues');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { testDebugWasm };
