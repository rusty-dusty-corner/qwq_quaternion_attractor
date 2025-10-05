# 🕰️ Legacy Code Archive

**Purpose:** This directory contains historical code that has been replaced by newer implementations.

---

## 📁 **Directory Structure**

```
legacy/
├── groq-analysis/           # Old Groq Vision API analysis code
├── wasm-debug-scripts/      # Old WASM debugging and testing scripts  
├── experimental-code/       # Experimental implementations and prototypes
└── README.md               # This file
```

---

## 🔄 **Migration Status**

### **✅ Groq Analysis Code**
- **Status**: Migrated to Universal Groq Analyzer
- **New Tool**: `tools/universal-groq-analyzer.js`
- **Reason**: Replaced with flexible, persistent analysis system

### **✅ WASM Debug Scripts**
- **Status**: Migrated to integrated WASM implementation
- **New Location**: `legacy2/src/wasm/` (active WASM code)
- **Reason**: Debugging functionality integrated into main system

### **📦 Experimental Code**
- **Status**: Reserved for future experimental implementations
- **Purpose**: Placeholder for prototypes and research code

---

## 🚀 **Current Active Code**

### **Analysis Tools**
```bash
# Use the new universal Groq analyzer
npm run groq:quick -- image.png attractor-colors
npm run groq:compare -- img1.png img2.png "Compare patterns"
```

### **WASM Implementation**
```bash
# Active WASM code is in legacy2/
npm run build:assembly
```

---

## 📚 **Documentation**

- **Groq Analysis**: See `legacy/groq-analysis/README.md`
- **WASM Debug**: See `legacy/wasm-debug-scripts/README.md`
- **Current Tools**: See `tools/README_UNIVERSAL_GROQ_ANALYZER.md`
- **Project Status**: See `README_DEVELOPER.md`

---

**🎯 This legacy code is preserved for reference only. Use the current active implementations for all development work.**
