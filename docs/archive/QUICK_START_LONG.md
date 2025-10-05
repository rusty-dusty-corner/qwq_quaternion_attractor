# ⚡ Quick Start Guide - Quaternion Attractor

**For:** Developers who need to get up and running immediately  
**Time:** 5 minutes to working state

---

## 🚀 **5-Minute Setup**

```bash
# 1. Enter nix environment (if not already)
nix-shell

# 2. Install dependencies
npm install

# 3. Build the project
npm run build:typescript

# 4. Test that everything works
npm run example:png

# 5. Check generated output
ls -la output/png_examples/
```

**Expected Result:** You should see PNG files generated successfully.

---

## 🎯 **What Just Happened?**

You just ran the **complete quaternion attractor pipeline**:
1. **Mathematical Engine**: Generated attractor points using quaternion math
2. **PNG Rendering**: Converted points to beautiful PNG images
3. **Performance Stats**: Showed generation and rendering times

---

## 🔍 **Quick Project Overview**

### **What This Project Does**
- **Generates**: Mathematical attractor patterns using quaternion mathematics
- **Renders**: Points to PNG images with customizable parameters
- **Supports**: Multiple algorithms (plain flip, flip smallest, flip all except largest)
- **Exports**: High-quality PNG images with statistics

### **Current Status**
- ✅ **TypeScript Engine**: Fully working
- ✅ **PNG Rendering**: Fully working  
- ✅ **Node.js Examples**: Fully working
- ❌ **Browser Integration**: Has ES module issues
- ❌ **WebAssembly**: Working but isolated in `legacy2/`

---

## 🛠️ **Available Commands**

```bash
# Development
npm run build:typescript    # Build TypeScript code
npm run clean              # Clean build artifacts

# Examples
npm run example:png        # Generate PNG examples
npm run example:api        # Run API usage examples
npm run example:groq       # Run Groq vision analysis

# Testing
npm run test              # Run tests (if configured)
npm run lint              # Run linter

# Analysis
npm run analyze:detailed  # Detailed visual analysis
npm run analyze:screenshots # Analyze legacy screenshots
```

---

## 📁 **Key Directories**

```
src/
├── typescript/core/       # 🎯 Main engine implementation
├── typescript/node/       # 🎯 PNG rendering system
├── examples/              # 🎯 Working examples
└── assembly/              # 🚧 Planned WebAssembly (empty)

legacy2/                   # 🎯 Working WebAssembly implementation
├── src/wasm/             # WebAssembly source code
├── build/                # Compiled WASM files
└── examples/             # Working WASM examples

docs/                      # 📚 Documentation
├── analysis/             # Analysis reports
└── archive/              # Archived documentation

output/                    # 📊 Generated outputs
└── png_examples/         # Generated PNG images
```

---

## 🎨 **Try These Examples**

### **1. Basic PNG Generation**
```bash
npm run example:png
```
**Result:** Creates multiple PNG files in `output/png_examples/`

### **2. API Usage Example**
```bash
npm run example:api
```
**Result:** Shows how to use the engine programmatically

### **3. Performance Test**
```bash
npm run example:png
```
**Look for:** Performance stats showing points/sec generation rate

---

## 🔧 **Customization**

### **Modify Parameters**
Edit `src/examples/png-generation-example.ts`:
```typescript
const constants = {
  start: createQuaternion(0.8, 0.1, 0.2, 0.3),
  additive: createVector3D(0.1, 0.1, 0.1),
  wind: createQuaternion(0.9, 0.05, 0.05, 0.05),
  mode: SideFlipMode.FLIP_SMALLEST
};
```

### **Change Rendering Options**
```typescript
const renderParams = {
  projectionType: ProjectionType.SIMPLE,
  cameraRotation: createQuaternion(1.0, 0.0, 0.0, 0.0),
  batchSize: 2000  // Number of points to generate
};
```

---

## 🚨 **Known Issues**

### **Browser Integration**
- **Problem**: ES module loading issues
- **Status**: Planned fix in unified architecture
- **Workaround**: Use Node.js examples for now

### **WebAssembly Integration**
- **Problem**: Isolated in `legacy2/` directory
- **Status**: Will be integrated in unified architecture
- **Workaround**: Use TypeScript engine for now

---

## 📚 **Next Steps**

### **For Immediate Development**
1. **Read**: `NEXT_DAY_DEVELOPER_GUIDE.md` for full context
2. **Understand**: Current architecture in `PROJECT_STRUCTURE_ANALYSIS.md`
3. **Plan**: Implementation using `IMPLEMENTATION_PLAN.md`

### **For Long-term Development**
1. **Follow**: The 4-week implementation plan
2. **Focus**: On Phase 1 (Foundation) first
3. **Maintain**: Backward compatibility throughout

---

## 🆘 **Troubleshooting**

### **Build Fails**
```bash
# Clean and rebuild
npm run clean
npm run build:typescript
```

### **Examples Don't Work**
```bash
# Check if build succeeded
ls -la dist/

# Rebuild if needed
npm run build:typescript
```

### **Nix Environment Issues**
```bash
# Exit and re-enter nix shell
exit
nix-shell
```

---

## 🎯 **Success Indicators**

You're ready to continue development if:
- ✅ `npm run example:png` works without errors
- ✅ PNG files are generated in `output/png_examples/`
- ✅ Performance stats are displayed
- ✅ You understand the current architecture

---

*You're now ready to dive deeper into the project! Read `NEXT_DAY_DEVELOPER_GUIDE.md` for the full development context.*
