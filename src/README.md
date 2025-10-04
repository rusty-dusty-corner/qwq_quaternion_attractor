# 📁 Source Code Structure - Draft01 Implementation

*Clean architecture with unified API interface and dual compilation strategy*

---

## 🏗️ **Directory Structure**

```
src/
├── assembly/              # AssemblyScript source code
│   ├── math/             # Core mathematical functions
│   ├── attractor/        # Attractor algorithm implementation
│   └── types/            # AssemblyScript type definitions
├── typescript/           # TypeScript wrappers and adapters
│   ├── core/            # Core API interfaces and types
│   ├── browser/         # Browser-specific adapter
│   └── node/            # Node.js-specific adapter
└── examples/            # Example applications and usage
```

---

## 🎯 **Core API Interface**

### **Key Design Principles**

1. **Separation of Concerns**: Clear distinction between mathematical core and visualization
2. **Dual Compilation**: Same AssemblyScript source compiles to both WASM and JavaScript
3. **Type Safety**: Full TypeScript support with comprehensive type definitions
4. **Validation**: Built-in parameter validation and error handling
5. **Extensibility**: Easy to add new projection types and side flip variations

### **API Components**

#### **Constant Parameters** (Mathematical Core)
```typescript
interface AttractorConstants {
  start: Quaternion;        // START - initial point
  additive: Vector3D;       // ADDITIVE - phyllotaxis tuning
  wind: Quaternion;         // WIND - constant rotation
  mode: SideFlipMode;       // MODE - side flip variation
}
```

#### **Render Parameters** (Visualization)
```typescript
interface RenderParameters {
  projectionType: ProjectionType;  // Simple vs Sphere projection
  cameraRotation: Quaternion;      // Rendering rotation
  batchSize: number;               // Points per generation
}
```

#### **Output Results**
```typescript
interface AttractorResult {
  points: Point2D[];           // Generated 2D points
  finalQuaternion: Quaternion; // Final state for chaining
  metadata?: GenerationMetadata; // Optional performance data
}
```

---

## 🚀 **Quick Start**

### **Basic Usage**
```typescript
import { generateAttractorPoints } from './typescript/core/attractor-engine';

// Generate 100 points with default parameters
const result = await generateAttractorPoints(100);
console.log(`Generated ${result.points.length} points`);
```

### **Custom Parameters**
```typescript
import { 
  generateAttractorPoints, 
  SideFlipMode, 
  ProjectionType,
  createQuaternion,
  createVector3D 
} from './typescript/core/attractor-engine';

const result = await generateAttractorPoints(200, {
  // Custom constants
  mode: SideFlipMode.FLIP_SMALLEST,
  additive: createVector3D(0.05, 0.08, 0.12)
}, {
  // Custom render parameters
  projectionType: ProjectionType.SPHERE,
  batchSize: 200
});
```

### **Animation Generation**
```typescript
import { generateAnimationFrames } from './typescript/core/attractor-engine';

// Generate 10 frames with 25 points each
const frames = await generateAnimationFrames(10, 25);
console.log(`Generated ${frames.length} animation frames`);
```

---

## 🔧 **Implementation Status**

### **✅ Completed**
- **Core API Interface**: Complete type definitions and interfaces
- **Engine Architecture**: Abstract base class and factory pattern
- **Parameter Validation**: Comprehensive validation system
- **Usage Examples**: Complete examples for all major use cases
- **Documentation**: Comprehensive API documentation

### **🚧 In Progress**
- **AssemblyScript Implementation**: Core mathematical functions
- **WASM Engine**: High-performance WebAssembly implementation
- **JavaScript Fallback**: Universal compatibility engine
- **Platform Adapters**: Browser and Node.js specific implementations

### **📋 Planned**
- **Build System**: Dual compilation configuration
- **Testing Framework**: Unit tests and integration tests
- **Performance Benchmarks**: WASM vs JavaScript comparison
- **Example Applications**: Browser demo and Node.js CLI tool

---

## 📚 **API Reference**

### **Core Types**

- **`Quaternion`**: 4D quaternion representation (w, x, y, z)
- **`Vector3D`**: 3D vector representation (x, y, z)
- **`Point2D`**: 2D point for rendering (x, y, color?, alpha?)
- **`SideFlipMode`**: Enum for side flip variations (0, 1, 2)
- **`ProjectionType`**: Enum for projection methods (simple, sphere)

### **Main Interfaces**

- **`AttractorEngine`**: Main engine interface with generateBatch() method
- **`AttractorConstants`**: Mathematical core parameters
- **`RenderParameters`**: Visualization parameters
- **`AttractorResult`**: Generation output with points and metadata

### **Factory Functions**

- **`createAttractorEngine(config)`**: Create engine with specific configuration
- **`createDefaultEngine()`**: Create engine with default WASM + JS fallback
- **`generateAttractorPoints(count, constants?, renderParams?)`**: Quick generation
- **`generateAnimationFrames(frameCount, pointsPerFrame, constants?, renderParams?)`**: Animation generation

### **Utility Functions**

- **`createQuaternion(w, x, y, z)`**: Create normalized quaternion
- **`createVector3D(x, y, z)`**: Create 3D vector
- **`createPoint2D(x, y, color?, alpha?)`**: Create 2D point
- **`normalizeQuaternion(q)`**: Normalize quaternion to unit length
- **`multiplyQuaternions(q1, q2)`**: Multiply two quaternions

---

## 🎯 **Design Goals**

### **Performance**
- **10x speedup** through WebAssembly compilation
- **Memory efficient** for large point generation
- **Deterministic** results across all platforms

### **Compatibility**
- **Universal** JavaScript fallback for all environments
- **Type safe** with comprehensive TypeScript support
- **Cross-platform** identical results everywhere

### **Usability**
- **Simple API** for basic usage
- **Flexible parameters** for advanced customization
- **Comprehensive validation** with helpful error messages
- **Rich examples** for all use cases

---

## 🔄 **Next Steps**

1. **Implement AssemblyScript mathematical functions**
2. **Create WASM compilation pipeline**
3. **Build JavaScript fallback engine**
4. **Add platform-specific adapters**
5. **Create example applications**
6. **Add comprehensive testing**

---

*This API interface provides the foundation for the entire draft01 implementation, ensuring clean separation of concerns and maximum flexibility for both performance and compatibility.*
