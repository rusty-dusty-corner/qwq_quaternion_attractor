# 🕰️ WASM Debug Scripts (Legacy)

**Date Moved:** January 5, 2025  
**Status:** Legacy - Debugging functionality integrated into main system

---

## 📁 **What's Here**

This directory contains **old WASM debugging and testing scripts** that were used during development of the WebAssembly implementation.

### **Files**
- `debug_attractor.js` - Node.js debugging script for quaternion attractor
- `debug_grid.js` - Grid debugging utilities
- `enhanced_debug.js` - Enhanced debugging features
- `improved_mirror_math.js` - Mirror math debugging utilities

---

## 🚀 **Use Current WASM Implementation Instead**

### **❌ Old Way (Don't Use)**
```bash
# These old debug scripts are no longer needed
node debug_attractor.js
node debug_grid.js
```

### **✅ New Way (Use This)**
```bash
# Current WASM implementation is in legacy2/
npm run build:assembly

# Test WASM functionality
node legacy2/test-wasm.mjs
node legacy2/test-wasm-simple.mjs

# Browser testing
open legacy2/wasm-attractor-test.html
```

---

## 🔄 **Migration Benefits**

### **Old Debug Scripts Problems**
- ❌ **Standalone scripts** - Not integrated with main system
- ❌ **Manual debugging** - Required manual script execution
- ❌ **Limited functionality** - Basic debugging only
- ❌ **No integration** - Separate from main codebase

### **New Integrated System Benefits**
- ✅ **Integrated debugging** - Built into main WASM implementation
- ✅ **Automated testing** - Comprehensive test suite
- ✅ **Browser integration** - Full browser compatibility
- ✅ **Performance monitoring** - Built-in performance metrics
- ✅ **Error handling** - Proper error reporting and recovery

---

## 📋 **What Was Moved**

### **From `legacy2/legacy/`**
- `debug_attractor.js` - Main debugging script
- `debug_grid.js` - Grid debugging utilities  
- `enhanced_debug.js` - Enhanced debugging features
- `improved_mirror_math.js` - Mirror math debugging

---

## 🎯 **Why This Code Exists**

This legacy code is preserved for:
- **Reference** - Understanding debugging approaches used during development
- **Historical context** - Seeing how WASM debugging evolved
- **Fallback** - If specific debugging features are needed
- **Learning** - Examples of WASM debugging techniques

---

## 📚 **Documentation**

- **Current WASM**: See `legacy2/README.md` (if exists)
- **WASM Testing**: See `legacy2/test-*.js` files
- **Project Status**: See `README_DEVELOPER.md`

---

**🎯 Use the current WASM implementation in `legacy2/` for all WASM development. This legacy code is preserved for reference only.**
