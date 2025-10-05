# 🧪 Experimental Code

**Purpose:** This directory contains experimental implementations, prototypes, and research code that are not part of the main production system.

---

## 📁 **Directory Structure**

```
experimental/
├── wasm/                  # Experimental WebAssembly implementation
│   ├── src/              # AssemblyScript source code
│   ├── build/            # Compiled WASM files
│   ├── examples/         # WASM usage examples
│   ├── tests/            # WASM test files
│   └── *.html           # Browser test interfaces
└── README.md             # This file
```

---

## 🎯 **What's Here**

### **🧪 Experimental WASM Implementation**
- **Location**: `experimental/wasm/`
- **Status**: Working but experimental
- **Purpose**: Alternative WebAssembly approach to quaternion attractor
- **Performance**: 5-9x speedup over JavaScript implementation

### **📋 Experimental Guidelines**

This directory is for:
- **Prototypes** - Early implementations testing new approaches
- **Research Code** - Experimental algorithms and techniques
- **Alternative Implementations** - Different ways to solve the same problem
- **Performance Experiments** - Code focused on optimization research
- **Learning Projects** - Code written while exploring new technologies

---

## 🚀 **How to Use Experimental Code**

### **WASM Implementation**
```bash
# Build experimental WASM
cd experimental/wasm/
npm install
npm run build

# Test in browser
open wasm-attractor-test.html

# Run Node.js tests
node test-wasm.mjs
```

### **Integration with Main Project**
The experimental WASM code can be used alongside the main TypeScript implementation:
- **Main Project**: `src/typescript/` (production code)
- **Experimental WASM**: `experimental/wasm/` (research code)
- **Legacy Code**: `legacy/` (historical reference)

---

## 🔬 **Current Experiments**

### **WASM Quaternion Attractor**
- **File**: `experimental/wasm/src/wasm/attractor-engine.ts`
- **Status**: Working with 5-9x performance improvement
- **Features**: 
  - AssemblyScript → WebAssembly compilation
  - Browser and Node.js compatibility
  - Comprehensive test suite
  - Performance benchmarking

---

## 📚 **Documentation**

- **WASM Implementation**: See `experimental/wasm/README.md` (if exists)
- **Main Project**: See `README_DEVELOPER.md`
- **Legacy Code**: See `legacy/README.md`

---

## 🎯 **Future Experiments**

This directory is ready for:
- **New Algorithm Experiments** - Alternative mathematical approaches
- **Performance Research** - Optimization techniques
- **Integration Experiments** - New ways to combine components
- **Technology Exploration** - Testing new frameworks or languages

---

**🎯 Use this directory for experimental code that pushes the boundaries of the project. Keep the main codebase stable while exploring new possibilities here.**
