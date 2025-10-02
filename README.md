# Quaternion Attractor Visualization

A mathematical visualization system that explores phyllotaxis-like patterns on the 4-dimensional unit sphere using stereographic projection and side-flipping dynamics.

## 🔬 Mathematical Concept

This project implements a fascinating mathematical system that:

1. **Represents quaternions as points on the 4D unit sphere S³**
2. **Uses stereographic projection** to map half-spheres to 3D unit balls
3. **Applies additive operations** with automatic side flipping when points leave the unit ball
4. **Generates phyllotaxis-like patterns** through the interplay of projection and dynamics

### Key Mathematical Operations

- **Stereographic Projection**: Maps quaternions from S³ to 3D space, avoiding the north pole singularity
- **Side Flipping**: When points exceed distance 1 from origin, flip the `side` flag to continue in the opposite 3D space
- **Quaternion Rotation**: Apply rotation quaternions for 2D projection display
- **Inverse Projection**: Map 3D points back to the 4D sphere

## 🚀 Usage

### Browser Visualization

1. Open `index.html` in any modern web browser
2. Adjust parameters using the interactive sliders:
   - **Initial Position**: Starting coordinates (x, y, z, side)
   - **Step Vector**: Additive parameters (a, b, c) for phyllotaxis tuning
   - **Rotation Quaternion**: Viewing angle for 2D projection
   - **Visualization Settings**: Point count, size, animation speed
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

- **Mathematical Accuracy**: Implements proper stereographic projection with singularity handling
- **Interactive Controls**: Real-time parameter adjustment with live visualization
- **Animation Support**: Dynamic rotation and parameter evolution
- **Debugging Tools**: Comprehensive validation and parameter tuning
- **Modern UI**: Responsive design with glass-morphism effects
- **High-DPI Support**: Crisp rendering on all display types

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

## 📈 Parameter Tuning

Use the debugging script to find optimal phyllotaxis parameters:

1. **Equal Steps** (a=b=c): Uniform coverage in all directions
2. **Dominant Axes**: Emphasize specific directions (X, Y, or Z dominant)
3. **Varied Steps**: Create asymmetric patterns
4. **Small Steps**: Fine-grained coverage for detailed patterns

The system automatically handles side flipping to maintain points within the unit ball while creating beautiful, phyllotaxis-like distributions on the 4D sphere.

## 🎨 Visualization

Points are color-coded based on:
- **Side**: Blue (+1) vs Magenta (-1) for which half-sphere
- **Z-coordinate**: Brightness indicates depth
- **Distance**: Alpha transparency shows proximity to origin

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the mathematical accuracy or visualization quality.
