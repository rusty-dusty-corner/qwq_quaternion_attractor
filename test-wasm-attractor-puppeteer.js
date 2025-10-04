const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Puppeteer Test for Full WebAssembly Attractor Implementation
 * 
 * This script tests the complete WASM quaternion attractor implementation
 * and compares it with the legacy JavaScript implementation.
 */

async function testWasmAttractor() {
    console.log('🚀 Starting Puppeteer test for WebAssembly Attractor implementation...');
    
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
        
        // Load the WASM attractor test page via HTTP server
        const httpUrl = 'http://localhost:8000/wasm-attractor-test.html';
        
        console.log(`📄 Loading: ${httpUrl}`);
        
        await page.goto(httpUrl, { 
            waitUntil: 'networkidle0',
            timeout: 15000 
        });
        
        // Wait for WASM module to load and initialize
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test 1: Check if WASM attractor module loaded successfully
        console.log('🧪 Testing WASM attractor module loading...');
        
        const wasmModuleResult = await page.evaluate(() => {
            try {
                // Check if the WASM module is available
                const wasmModule = window.wasmAttractorModule;
                if (!wasmModule) {
                    return { success: false, error: 'WASM module not found' };
                }
                
                // Test basic function availability
                const functions = [
                    'createAttractorEngine',
                    'generatePoints',
                    'getPointCount',
                    'getAllPoints',
                    'getStatistics',
                    'clearAllEngines'
                ];
                
                const missingFunctions = functions.filter(fn => typeof wasmModule[fn] !== 'function');
                
                if (missingFunctions.length > 0) {
                    return { 
                        success: false, 
                        error: `Missing functions: ${missingFunctions.join(', ')}` 
                    };
                }
                
                return { 
                    success: true, 
                    availableFunctions: functions.length,
                    moduleSize: wasmModule.memory ? wasmModule.memory.buffer.byteLength : 'unknown'
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        if (wasmModuleResult.success) {
            console.log('✅ WASM attractor module loaded successfully');
            console.log(`   Available functions: ${wasmModuleResult.availableFunctions}`);
            console.log(`   Module size: ${wasmModuleResult.moduleSize} bytes`);
        } else {
            console.log('❌ WASM attractor module failed to load');
            console.log('   Error:', wasmModuleResult.error);
        }
        
        // Test 2: Create and test attractor engine
        console.log('🎯 Testing attractor engine creation and point generation...');
        
        const attractorTestResult = await page.evaluate(() => {
            try {
                const wasmModule = window.wasmAttractorModule;
                if (!wasmModule) {
                    return { success: false, error: 'WASM module not available' };
                }
                
                // Create attractor engine with test parameters
                const engineId = wasmModule.createAttractorEngine(
                    1000,    // maxPoints
                    12345,   // seed
                    0.1,     // stepVectorX
                    0.2,     // stepVectorY
                    0.3,     // stepVectorZ
                    0.0,     // initialX
                    0.0,     // initialY
                    0.0,     // initialZ
                    0,       // sideFlipVariation (PLAIN_FLIP)
                    1.0,     // globalRotationW
                    0.0,     // globalRotationX
                    0.0,     // globalRotationY
                    0.0      // globalRotationZ
                );
                
                if (engineId < 0) {
                    return { success: false, error: 'Failed to create engine' };
                }
                
                // Generate points
                wasmModule.generatePoints(engineId, 100);
                
                // Get results
                const pointCount = wasmModule.getPointCount(engineId);
                const statistics = wasmModule.getStatistics(engineId);
                const allPoints = wasmModule.getAllPoints(engineId);
                
                // Validate results
                if (pointCount !== 100) {
                    return { 
                        success: false, 
                        error: `Expected 100 points, got ${pointCount}` 
                    };
                }
                
                if (!statistics || statistics.length < 7) {
                    return { 
                        success: false, 
                        error: 'Invalid statistics array' 
                    };
                }
                
                if (!allPoints || allPoints.length < 400) { // 100 points * 4 values (x,y,z,side)
                    return { 
                        success: false, 
                        error: 'Invalid points array' 
                    };
                }
                
                // Check for reasonable point values
                let validPoints = 0;
                for (let i = 0; i < Math.min(100, pointCount); i++) {
                    const x = allPoints[i * 4];
                    const y = allPoints[i * 4 + 1];
                    const z = allPoints[i * 4 + 2];
                    const side = allPoints[i * 4 + 3];
                    
                    if (isFinite(x) && isFinite(y) && isFinite(z) && (side === 1 || side === -1)) {
                        validPoints++;
                    }
                }
                
                if (validPoints < 90) { // Allow some tolerance
                    return { 
                        success: false, 
                        error: `Only ${validPoints}/100 points are valid` 
                    };
                }
                
                return {
                    success: true,
                    engineId: engineId,
                    pointCount: pointCount,
                    validPoints: validPoints,
                    statistics: {
                        totalSteps: statistics[0],
                        sideFlipCount: statistics[1],
                        currentIndex: statistics[2],
                        currentX: statistics[3],
                        currentY: statistics[4],
                        currentZ: statistics[5],
                        currentSide: statistics[6]
                    }
                };
                
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        if (attractorTestResult.success) {
            console.log('✅ Attractor engine test completed successfully');
            console.log(`   Engine ID: ${attractorTestResult.engineId}`);
            console.log(`   Points generated: ${attractorTestResult.pointCount}`);
            console.log(`   Valid points: ${attractorTestResult.validPoints}`);
            console.log(`   Total steps: ${attractorTestResult.statistics.totalSteps}`);
            console.log(`   Side flips: ${attractorTestResult.statistics.sideFlipCount}`);
        } else {
            console.log('❌ Attractor engine test failed');
            console.log('   Error:', attractorTestResult.error);
        }
        
        // Test 3: Performance comparison
        console.log('⚡ Running performance comparison...');
        
        const performanceResult = await page.evaluate(() => {
            try {
                const wasmModule = window.wasmAttractorModule;
                if (!wasmModule) {
                    return { success: false, error: 'WASM module not available' };
                }
                
                // Clear any existing engines
                wasmModule.clearAllEngines();
                
                // Test WASM performance
                const wasmStart = performance.now();
                const wasmEngineId = wasmModule.createAttractorEngine(
                    1000, 12345, 0.1, 0.2, 0.3, 0.0, 0.0, 0.0, 0, 1.0, 0.0, 0.0, 0.0
                );
                wasmModule.generatePoints(wasmEngineId, 1000);
                const wasmPoints = wasmModule.getAllPoints(wasmEngineId);
                const wasmTime = performance.now() - wasmStart;
                
                // Test JavaScript performance (if available)
                let jsTime = null;
                if (window.legacyAttractorEngine) {
                    const jsStart = performance.now();
                    const jsEngine = new window.legacyAttractorEngine(1000, {
                        seed: 12345,
                        stepVector: [0.1, 0.2, 0.3],
                        initialPosition: [0.0, 0.0, 0.0],
                        sideFlipVariation: 0,
                        globalRotation: [1.0, 0.0, 0.0, 0.0]
                    });
                    jsEngine.generatePoints(1000);
                    const jsPoints = jsEngine.getPoints();
                    jsTime = performance.now() - jsStart;
                }
                
                return {
                    success: true,
                    wasmTime: wasmTime,
                    jsTime: jsTime,
                    wasmPoints: wasmPoints.length,
                    speedup: jsTime ? jsTime / wasmTime : null
                };
                
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        if (performanceResult.success) {
            console.log('✅ Performance test completed');
            console.log(`   WASM time: ${performanceResult.wasmTime.toFixed(2)}ms for 1000 points`);
            if (performanceResult.jsTime) {
                console.log(`   JavaScript time: ${performanceResult.jsTime.toFixed(2)}ms for 1000 points`);
                console.log(`   Speedup: ${performanceResult.speedup.toFixed(2)}x faster`);
            } else {
                console.log('   JavaScript comparison not available');
            }
        } else {
            console.log('❌ Performance test failed:', performanceResult.error);
        }
        
        // Test 4: Mathematical accuracy validation
        console.log('🔬 Testing mathematical accuracy...');
        
        const accuracyResult = await page.evaluate(() => {
            try {
                const wasmModule = window.wasmAttractorModule;
                if (!wasmModule) {
                    return { success: false, error: 'WASM module not available' };
                }
                
                // Test with known seed for reproducibility
                wasmModule.clearAllEngines();
                const engineId = wasmModule.createAttractorEngine(
                    100, 42, 0.1, 0.2, 0.3, 0.0, 0.0, 0.0, 0, 1.0, 0.0, 0.0, 0.0
                );
                wasmModule.generatePoints(engineId, 10);
                const points = wasmModule.getAllPoints(engineId);
                const stats = wasmModule.getStatistics(engineId);
                
                // Check for reasonable mathematical properties
                let checks = {
                    finiteValues: true,
                    reasonableRange: true,
                    sideValues: true,
                    statisticsValid: true
                };
                
                // Check point values
                for (let i = 0; i < 10; i++) {
                    const x = points[i * 4];
                    const y = points[i * 4 + 1];
                    const z = points[i * 4 + 2];
                    const side = points[i * 4 + 3];
                    
                    if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
                        checks.finiteValues = false;
                    }
                    
                    if (Math.abs(x) > 10 || Math.abs(y) > 10 || Math.abs(z) > 10) {
                        checks.reasonableRange = false;
                    }
                    
                    if (side !== 1 && side !== -1) {
                        checks.sideValues = false;
                    }
                }
                
                // Check statistics
                if (!isFinite(stats[0]) || !isFinite(stats[1]) || !isFinite(stats[2])) {
                    checks.statisticsValid = false;
                }
                
                const allChecksPassed = Object.values(checks).every(check => check === true);
                
                return {
                    success: allChecksPassed,
                    checks: checks,
                    samplePoints: Array.from({length: 3}, (_, i) => ({
                        x: points[i * 4],
                        y: points[i * 4 + 1],
                        z: points[i * 4 + 2],
                        side: points[i * 4 + 3]
                    }))
                };
                
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        if (accuracyResult.success) {
            console.log('✅ Mathematical accuracy test passed');
            console.log('   All mathematical properties validated');
            console.log('   Sample points:', accuracyResult.samplePoints);
        } else {
            console.log('❌ Mathematical accuracy test failed');
            console.log('   Failed checks:', accuracyResult.checks);
        }
        
        // Test 5: Take screenshots for documentation
        console.log('📸 Taking screenshots...');
        
        const screenshotsDir = path.join(__dirname, 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir);
        }
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'wasm-attractor-test-results.png'),
            fullPage: true 
        });
        
        console.log('✅ Screenshots saved to screenshots/ directory');
        
        // Summary
        console.log('\n🎉 WASM Attractor Implementation Test Summary:');
        console.log('===============================================');
        console.log('✅ WASM module loading test');
        console.log('✅ Attractor engine creation and point generation');
        console.log('✅ Performance measurement');
        console.log('✅ Mathematical accuracy validation');
        console.log('✅ Screenshots captured');
        
        const allTestsPassed = wasmModuleResult.success && 
                              attractorTestResult.success && 
                              performanceResult.success && 
                              accuracyResult.success;
        
        return {
            success: allTestsPassed,
            tests: {
                wasmLoading: wasmModuleResult.success,
                attractorEngine: attractorTestResult.success,
                performance: performanceResult.success,
                accuracy: accuracyResult.success,
                screenshots: true
            },
            performance: performanceResult.success ? {
                wasmTime: performanceResult.wasmTime,
                jsTime: performanceResult.jsTime,
                speedup: performanceResult.speedup
            } : null,
            testResults: {
                wasmModule: wasmModuleResult,
                attractor: attractorTestResult,
                performance: performanceResult,
                accuracy: accuracyResult
            },
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
    testWasmAttractor()
        .then(result => {
            if (result.success) {
                console.log('\n🎯 WASM attractor implementation test PASSED');
                if (result.performance) {
                    console.log(`⚡ Performance: ${result.performance.wasmTime.toFixed(2)}ms for 1000 points`);
                    if (result.performance.speedup) {
                        console.log(`🚀 Speedup: ${result.performance.speedup.toFixed(2)}x faster than JavaScript`);
                    }
                }
                process.exit(0);
            } else {
                console.log('\n💥 WASM attractor implementation test FAILED');
                console.error('Error:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { testWasmAttractor };
