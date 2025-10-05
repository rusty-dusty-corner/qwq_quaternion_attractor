# 🧪 Experimental WebAssembly Implementation

**Status:** Experimental - Working but not production-ready  
**Purpose:** Alternative WASM approach to quaternion attractor computation  
**Performance:** 5-9x speedup over JavaScript implementation

---

## 🎯 **What This Is**

This is an **experimental WebAssembly implementation** of the quaternion attractor using AssemblyScript. It's a complete, working alternative to the main TypeScript implementation, but it's kept in experimental because:

- **Research Focus**: Exploring WASM performance benefits
- **Alternative Approach**: Different architecture than main implementation
- **Experimental Status**: Not integrated into main production workflow
- **Learning Project**: Demonstrates WASM integration techniques

---

## 📁 **Structure**

```
experimental/wasm/
├── src/
│   ├── wasm/                 # AssemblyScript source code
│   │   ├── attractor-engine.ts    # Main attractor computation
│   │   ├── quaternion-math.ts     # Mathematical utilities
│   │   ├── deterministic-random.ts # Random number generation
│   │   └── function-api.ts        # WASM function interface
│   └── typescript/           # TypeScript wrapper code
├── build/                    # Compiled WASM files
│   ├── attractor-engine.wasm # Compiled WebAssembly
│   ├── attractor-engine.js   # JavaScript wrapper
│   └── *.wat                # WebAssembly text format
├── examples/                 # Usage examples
├── tests/                    # Test suite
├── *.html                   # Browser test interfaces
└── README.md                # This file
```

---

## 🚀 **Quick Start**

### **Build WASM**
```bash
cd experimental/wasm/
npm install
npm run build
```

### **Test in Browser**
```bash
# Open browser test interface
open wasm-attractor-test.html

# Or simple test
open wasm-test.html
```

### **Test in Node.js**
```bash
# Run comprehensive tests
node test-wasm.mjs

# Run simple test
node test-wasm-simple.mjs
```

---

## 🧪 **Testing & Validation**

### **Browser Testing**
- **Main Interface**: `wasm-attractor-test.html` - Full interactive interface
- **Simple Test**: `wasm-test.html` - Basic functionality test
- **Debug Interface**: `debug-wasm.html` - Debugging tools

### **Node.js Testing**
- **Comprehensive**: `test-wasm.mjs` - Full test suite
- **Simple**: `test-wasm-simple.mjs` - Basic functionality
- **Puppeteer**: `test-wasm-puppeteer.js` - Automated browser testing

### **Performance Testing**
```bash
# Run performance benchmarks
node test-wasm.mjs

# Expected results:
# WASM: 0.60ms, JS: 5.70ms, 9.50x speedup
# WASM: 0.50ms, JS: 2.70ms, 5.40x speedup
```

---

## 🔬 **Technical Details**

### **AssemblyScript Features**
- **Memory Management**: Manual memory allocation and cleanup
- **Type Safety**: Full TypeScript-like type checking
- **Performance**: Near-native execution speed
- **Size**: Compact binary output

### **WASM Integration**
- **Browser**: Direct WebAssembly loading
- **Node.js**: WebAssembly module support
- **Interop**: JavaScript ↔ WASM function calls
- **Memory**: Shared memory between JS and WASM

### **Mathematical Implementation**
- **Quaternion Math**: Full quaternion operations in WASM
- **Attractor Algorithm**: Optimized attractor computation
- **Random Generation**: Deterministic random number generation
- **Performance**: 5-9x faster than JavaScript equivalent

---

## 📊 **Performance Comparison**

### **Benchmark Results**
```
JavaScript Implementation:
- 500 points: ~1,650 pts/sec
- 1000 points: ~2,500 pts/sec
- 5000 points: ~16,667 pts/sec (but worse visual quality)

WASM Implementation:
- 500 points: ~9,500 pts/sec (9.50x speedup)
- 1000 points: ~13,500 pts/sec (5.40x speedup)
- Visual quality: Consistent across all point counts
```

### **Advantages**
- ✅ **Speed**: 5-9x performance improvement
- ✅ **Consistency**: Visual quality doesn't degrade with high point counts
- ✅ **Memory**: Efficient memory usage
- ✅ **Portability**: Works in browser and Node.js

### **Limitations**
- ❌ **Complexity**: More complex build process
- ❌ **Debugging**: Harder to debug than JavaScript
- ❌ **Integration**: Requires additional build steps
- ❌ **Maintenance**: AssemblyScript learning curve

---

## 🔄 **Integration with Main Project**

### **Current Status**
- **Main Implementation**: `src/typescript/` (production)
- **Experimental WASM**: `experimental/wasm/` (research)
- **Legacy Debug Scripts**: `legacy/wasm-debug-scripts/` (historical)

### **How They Relate**
1. **Main TypeScript**: Primary production implementation
2. **Experimental WASM**: Performance research and alternative approach
3. **Legacy Scripts**: Historical debugging tools (preserved for reference)

### **Future Integration**
This experimental implementation could potentially:
- Replace main implementation if performance benefits justify complexity
- Provide performance benchmarks for main implementation optimization
- Serve as reference for WASM integration techniques
- Inspire optimization of main TypeScript code

---

## 🛠️ **Development**

### **Build Process**
```bash
# Install dependencies
npm install

# Build WASM
asc src/wasm/attractor-engine.ts -b build/attractor-engine.wasm -t build/attractor-engine.wat --optimize --sourceMap

# Test build
node test-wasm.mjs
```

### **File Structure**
- **Source**: `src/wasm/` - AssemblyScript source code
- **Build**: `build/` - Compiled WASM and JavaScript files
- **Tests**: `test-*.js` - Various test implementations
- **HTML**: `*.html` - Browser test interfaces

---

## 📚 **Documentation References**

- **Main Project**: `README_DEVELOPER.md`
- **Legacy Code**: `legacy/README.md`
- **Experimental Overview**: `experimental/README.md`
- **Project Status**: `docs/current/NEXT_DAY_DEVELOPER_GUIDE.md`

---

## 🎯 **Conclusion**

This experimental WASM implementation demonstrates the performance potential of WebAssembly for mathematical computations. While it's not integrated into the main production workflow, it serves as:

- **Performance Benchmark**: Shows what's possible with WASM optimization
- **Learning Resource**: Demonstrates WASM integration techniques
- **Research Tool**: Platform for exploring performance optimizations
- **Alternative Approach**: Different architectural solution to the same problem

**🎯 Use this for performance research and WASM learning. The main production code remains in `src/typescript/` for stability and maintainability.**
