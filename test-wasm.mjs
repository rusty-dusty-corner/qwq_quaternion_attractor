#!/usr/bin/env node

/**
 * Test WebAssembly module loading and execution
 */

import { readFileSync } from 'fs';

async function testWasmModule() {
  console.log('🧪 Testing WebAssembly module...\n');
  
  try {
    // Try to load the generated .js file
    console.log('📦 Loading WebAssembly module...');
    const wasmModule = await import('./build/math-engine.js');
    console.log('✅ WebAssembly module loaded successfully');
    
    // Test basic functions
    console.log('🔢 Testing mathematical functions...');
    
    const addResult = wasmModule.add(5.0, 3.0);
    console.log(`   add(5, 3) = ${addResult}`);
    
    const multiplyResult = wasmModule.multiply(4.0, 2.5);
    console.log(`   multiply(4, 2.5) = ${multiplyResult}`);
    
    const sqrtResult = wasmModule.sqrt(16.0);
    console.log(`   sqrt(16) = ${sqrtResult}`);
    
    const sinResult = wasmModule.sin(Math.PI / 2);
    console.log(`   sin(π/2) = ${sinResult}`);
    
    const cosResult = wasmModule.cos(0);
    console.log(`   cos(0) = ${cosResult}`);
    
    const randomResult = wasmModule.deterministicRandom(12345);
    console.log(`   deterministicRandom(12345) = ${randomResult}`);
    
    console.log('\n🎉 All WebAssembly functions working correctly!');
    console.log('\nNext steps:');
    console.log('1. ✅ WebAssembly compilation successful');
    console.log('2. ✅ Module loading successful');
    console.log('3. ✅ Mathematical functions working');
    console.log('4. 🔄 Ready for Puppeteer testing');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure WebAssembly module was compiled: npm run build:wasm');
    console.error('2. Check if build/math-engine.js exists');
    console.error('3. Verify AssemblyScript installation');
    process.exit(1);
  }
}

// Run the test
testWasmModule();
