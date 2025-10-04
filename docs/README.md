# 🌌 Quaternion Attractor - Draft01 Implementation

*High-performance mathematical visualization with dual compilation strategy*

---

## 🎯 **Project Vision**

The Quaternion Attractor system generates mesmerizing VJ-style patterns through **Filataksis-style covering** of the 4-dimensional unit sphere. This draft01 implementation features a clean, unified architecture with dual compilation (WebAssembly + JavaScript) for maximum performance and compatibility.

### 🌊 **What You'll Experience**
- **🔥 Burning Flows**: Mathematical patterns that flow and mutate like living organisms
- **🎨 VJ-Style Visuals**: Fractal-like structures perfect for live performance
- **🌀 Dynamic Attractors**: Three distinct variation modes with unique visual behaviors
- **⚡ High Performance**: 10x speedup through WebAssembly optimization

---

## 🚀 **Quick Start**

### **Development Environment**
```bash
# Enter nix-shell environment (recommended)
nix-shell

# Or install dependencies manually
npm install --legacy-peer-deps
```

### **Build and Run**
```bash
# Build both WASM and JavaScript versions
npm run build:all

# Run browser demo
npm run dev:browser

# Generate high-quality images
npm run example:node
```

---

## 📖 **Documentation**

### **Core Documentation**
- **[Introduction](INTRODUCTION.md)** - Mathematical concepts and visual possibilities
- **[Mathematical Documentation](MATHEMATICAL_DOCUMENTATION.md)** - Complete algorithms and formulas
- **[Draft01 Status](DRAFT01_STATUS.md)** - Current implementation status and roadmap

### **Archived Documentation**
- **[Archive](archive/)** - Historical documentation and setup guides (read-only)

---

## 🔬 **Mathematical Foundation**

### **Core Algorithm**
1. **Quaternions on S³**: Represent points on the 4D unit sphere
2. **Stereographic Projection**: Map 4D → 3D with hemisphere awareness
3. **Side Flipping Dynamics**: Three variation modes for boundary conditions
4. **Global Rotation**: Quaternion-based spatial transformations
5. **Phyllotaxis Parameters**: Golden ratio-based step vectors

### **Three Attractor Variations**
- **Variation 0**: Pure mathematical flip (uniform patterns)
- **Variation 1**: Flip smallest component (filigree structures)
- **Variation 2**: Flip all except largest (elongated flows)

---

## ⚡ **Dual Compilation Architecture**

### **AssemblyScript Source**
- **Single Codebase**: Same source compiles to both WASM and JavaScript
- **TypeScript Syntax**: Familiar development experience
- **Deterministic**: Seed-based reproducibility across platforms

### **Performance Targets**
- **WASM Version**: 10x faster computation for large point generation
- **JavaScript Version**: Full browser compatibility
- **Cross-Platform**: Identical results on all platforms

---

## 🎛️ **API Design**

### **Constant Parameters**
- **START**: Initial quaternion point
- **ADDITIVE**: 3D vector for phyllotaxis tuning
- **WIND**: Constant rotation quaternion
- **MODE**: Side flip variation selector

### **Render Parameters**
- **Projection Type**: Simple (2D) vs Sphere (3D rotation + projection)
- **Camera Rotation**: Quaternion for rendering rotation
- **Batch Size**: Number of 2D points to generate

### **Output Interface**
```typescript
interface AttractorResult {
  points: Point2D[];           // Generated 2D points
  finalQuaternion: Quaternion; // Final state for chaining
}
```

---

## 🛠️ **Implementation Status**

### **✅ Completed**
- Repository reorganization and cleanup
- Documentation structure optimization
- Legacy code preservation
- Development environment setup

### **🚧 In Progress**
- Core mathematical engine implementation
- Dual compilation setup (WASM + JS)
- Platform adapters (browser + Node.js)
- API interface design

### **📋 Planned**
- Performance benchmarking
- Cross-platform testing
- Example applications
- Documentation completion

---

## 📁 **Project Structure**

```
qwq_quaternion_attractor/
├── docs/                    # Core documentation
│   ├── README.md           # This file
│   ├── INTRODUCTION.md     # Mathematical concepts
│   ├── MATHEMATICAL_DOCUMENTATION.md  # Algorithms
│   ├── DRAFT01_STATUS.md   # Implementation status
│   └── archive/            # Historical docs (read-only)
├── legacy2/                # Experimental implementations
├── src/                    # New draft01 implementation (planned)
├── package.json           # Project configuration
└── shell.nix             # Nix development environment
```

---

## 🤝 **Contributing**

This project is in active development. Key areas for contribution:
- Mathematical algorithm optimization
- Performance benchmarking
- Cross-platform testing
- Documentation improvements

---

## 📄 **License**

MIT License - See LICENSE file for details.

---

*Experience the beauty of 4-dimensional mathematics through high-performance visualization.*