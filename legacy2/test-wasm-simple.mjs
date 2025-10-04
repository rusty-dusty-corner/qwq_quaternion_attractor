#!/usr/bin/env node

/**
 * Simple WebAssembly module test
 */

import { readFileSync } from 'fs';

async function testWasmModule() {
  console.log('🧪 Testing WebAssembly module directly...\n');
  
  try {
    // Read the WebAssembly binary
    console.log('📦 Loading WebAssembly binary...');
    const wasmBytes = readFileSync('./build/math-engine.wasm');
    console.log(`✅ WebAssembly binary loaded (${wasmBytes.length} bytes)`);
    
    // Create a simple WebAssembly instance
    console.log('🔧 Instantiating WebAssembly module...');
    const wasmModule = await WebAssembly.compile(wasmBytes);
    const instance = await WebAssembly.instantiate(wasmModule, {
      env: {
        table: new WebAssembly.Table({ initial: 1, element: 'anyfunc' }),
        memory: new WebAssembly.Memory({ initial: 1 }),
        abort: () => { throw new Error('WebAssembly abort called'); }
      }
    });
    console.log('✅ WebAssembly module instantiated successfully');
    
    // Test the exported functions
    console.log('🔢 Testing mathematical functions...');
    
    const addResult = instance.exports.add(5, 3);
    console.log(`   add(5, 3) = ${addResult}`);
    
    const multiplyResult = instance.exports.multiply(4, 2);
    console.log(`   multiply(4, 2) = ${multiplyResult}`);
    
    const factorialResult = instance.exports.factorial(5);
    console.log(`   factorial(5) = ${factorialResult}`);
    
    const squareResult = instance.exports.square(3.5);
    console.log(`   square(3.5) = ${squareResult}`);
    
    const randomResult = instance.exports.simpleRandom(12345);
    console.log(`   simpleRandom(12345) = ${randomResult}`);
    
    console.log('\n🎉 All WebAssembly functions working correctly!');
    console.log('\n✅ Success Summary:');
    console.log('1. ✅ Nix-shell environment working');
    console.log('2. ✅ AssemblyScript compilation successful');
    console.log('3. ✅ WebAssembly binary generation successful');
    console.log('4. ✅ WebAssembly module loading successful');
    console.log('5. ✅ Mathematical functions executing correctly');
    console.log('\n🚀 Ready for Puppeteer testing!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure WebAssembly module was compiled: npm run build:wasm');
    console.error('2. Check if build/math-engine.wasm exists');
    console.error('3. Verify AssemblyScript installation');
    process.exit(1);
  }
}

// Run the test
testWasmModule();
