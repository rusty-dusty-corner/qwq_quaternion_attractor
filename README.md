[You can see demo at](https://raw.githack.com/rusty-dusty-corner/qwq_quaternion_attractor/main/index.html)

# Quaternion Attractor Visualization

A mesmerizing mathematical visualization system that generates VJ-style, fractal-like patterns through Filataksis-style covering of the 4-dimensional unit sphere. Experience living, breathing mathematical art that flows, mutates, and creates stunning visual effects.

## 📖 Introduction

For a comprehensive introduction to the mathematical concepts and visual possibilities, see **[INTRODUCTION.md](INTRODUCTION.md)**.

This project implements a complete **Filataksis-style covering algorithm** that creates:
- 🌊 **Flowing patterns** that shift and mutate like living organisms
- 🎨 **VJ-style visuals** with fractal-like structures and mosaic grids
- 🔥 **Burning flows** of mathematical beauty that never repeat
- 🌀 **Dynamic attractors** with three distinct variation modes

## 🔬 Mathematical Concept

This project implements a fascinating mathematical system that:

1. **Represents quaternions as points on the 4D unit sphere S³**
2. **Uses stereographic projection** to map half-spheres to 3D unit balls
3. **Applies additive operations** with automatic side flipping when points leave the unit ball
4. **Generates phyllotaxis-like patterns** through the interplay of projection and dynamics

### Key Mathematical Operations

- **Hemisphere-Aware Stereographic Projection**: Maps quaternions from S³ to 3D space with full north/south hemisphere support
- **Advanced Side Flipping**: Three variation modes when points exceed the unit ball boundary
- **Global Quaternion Rotation**: Integrated rotation that affects the core algorithm dynamics
- **Filataksis-Style Covering**: Creates uniform, low-discrepancy distributions on the 4D sphere

## 🚀 Usage

### Browser Visualization

1. Open `index.html` in any modern web browser
2. Adjust parameters using the interactive sliders:
   - **Initial Position**: Starting coordinates (x, y, z, side)
   - **Step Vector**: Additive parameters (a, b, c) for phyllotaxis tuning
   - **Rotation Quaternion**: Global rotation affecting core algorithm dynamics
   - **Side Flip Variation**: Choose between three distinct attractor behaviors
   - **Visualization Settings**: Point count, size, animation speed, projection modes
3. Click "Generate Points" to create the attractor pattern
4. Use "Randomize Parameters" to explore different configurations
5. Try "Start Animation" for dynamic visualization

### Node.js Debugging

Run the debugging suite to validate mathematical operations and tune parameters:

```bash
# Run all debugging tests
node debug_attractor.js

# Or use npm scripts
npm run debug
npm test
```

The debugging script provides:
- ✅ **Stereographic projection validation** (round-trip accuracy)
- ✅ **Quaternion operations testing** (multiplication, conjugation, rotation)
- ✅ **Side flipping behavior analysis**
- ✅ **Phyllotaxis parameter optimization**

## 📊 Debugging Output

The Node.js debugging script analyzes:

- **Projection Accuracy**: Tests round-trip projection errors
- **Coverage Analysis**: Measures how well different parameter sets cover the 3D space
- **Side Flip Patterns**: Tracks when and why side flips occur
- **Parameter Optimization**: Compares different (a,b,c) step vectors for better phyllotaxis coverage

Example output:
```
=== Testing Phyllotaxis Parameters ===
--- Test 1: Equal steps ---
Coverage - X: 1.000, Y: 1.000, Z: 1.000
Total coverage: 3.000

--- Test 2: Y-dominant ---
Coverage - X: 0.800, Y: 1.600, Z: 0.800
Total coverage: 3.200
```

## 🎯 Key Features

### Mathematical Excellence
- **100% Specification Compliant**: Full Filataksis-style covering implementation
- **Hemisphere-Aware Projection**: Complete north/south sphere support with perfect round-trip accuracy
- **Three Side-Flip Variations**: Plain flip, smallest-component flip, and largest-component preservation
- **Global Rotation Integration**: Quaternion rotation affects core algorithm dynamics

### Visual Experience
- **VJ-Style Patterns**: Mesmerizing flows, burns, and fractal-like structures
- **Living Mathematics**: Patterns that shift, mutate, and evolve like living organisms
- **Mosaic Grid Effects**: Beautiful geometric patterns that emerge from mathematical precision
- **Real-Time Evolution**: Watch patterns unfold step-by-step or in rapid clouds

### Interactive Features
- **Full Parameter Control**: Adjust every aspect of the mathematical system
- **Multiple Animation Modes**: Snake mode (step-by-step) and Cloud mode (rapid evolution)
- **Projection Options**: Simple and advanced projection modes for different visual effects
- **Modern UI**: Glass-morphism design with responsive controls

## 🔧 Technical Implementation

### Files Structure

- `index.html` - Main visualization interface
- `quaternion_attractor.js` - Core mathematical implementation
- `debug_attractor.js` - Node.js debugging and validation suite
- `package.json` - Node.js project configuration

### Mathematical Functions

- `stereographicProjection()` - 4D → 3D projection
- `inverseStereographicProjection()` - 3D → 4D projection  
- `quaternionMultiply()` - Quaternion multiplication
- `rotateVector()` - 3D vector rotation
- `normalizeQuaternion()` - Unit quaternion normalization

## 📈 Side Flip Variations & Effects

The system offers three distinct variation modes that create completely different visual behaviors:

### **Variation 0: Plain Flip**
- **Behavior**: Only flips the hemisphere side, no coordinate modification
- **Visual Effect**: Uniform, balanced patterns across the sphere
- **Use Case**: Clean, mathematical precision with maximum coverage

### **Variation 1: Flip Smallest Component**
- **Behavior**: Flips only the coordinate with smallest absolute value
- **Visual Effect**: Creates weak attractor patterns near coordinate planes
- **Use Case**: Delicate, filigree-like structures with subtle geometric bias

### **Variation 2: Flip All Except Largest**
- **Behavior**: Flips all coordinates except the one with largest absolute value
- **Visual Effect**: Elongated patterns along dominant axes, stretched geometries
- **Use Case**: Dramatic, VJ-style flows with strong directional emphasis

## 🎨 Visual Modes & Effects

### **Snake Mode** (4 points, 1 per frame)
- Watch the mathematical calculation unfold step-by-step
- Perfect for understanding the algorithm mechanics
- See how each iteration builds the final pattern

### **Cloud Mode** (1000+ points, 50+ per frame)
- Experience rapid pattern evolution and mutation
- See the full attractor behavior emerge
- Ideal for VJ-style visual effects and live performance

## 🎨 Visualization

Points are color-coded based on:
- **Side**: Blue (+1) vs Magenta (-1) for which half-sphere
- **Z-coordinate**: Brightness indicates depth
- **Distance**: Alpha transparency shows proximity to origin

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the mathematical accuracy or visualization quality.
