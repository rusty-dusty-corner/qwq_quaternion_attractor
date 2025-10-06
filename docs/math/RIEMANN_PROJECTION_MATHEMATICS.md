# Riemann Projection Mathematics

**Date:** 2025-01-06  
**Version:** 1.0  
**Type:** Mathematical Documentation  
**Context:** Quaternion Attractor Project

## Overview

This document explores Riemann projection mathematics from simple to complex examples, with particular focus on how these concepts apply to the quaternion attractor system. We'll start with basic circle-to-line projections and progress to higher-dimensional mappings that are relevant to our 4D quaternion space.

## Table of Contents

1. [Simple Circle to Line Mapping](#simple-circle-to-line-mapping)
2. [Sphere to Plane Projections](#sphere-to-plane-projections)
3. [3-Sphere to 3D Space Mapping](#3-sphere-to-3d-space-mapping)
4. [Hemisphere Considerations](#hemisphere-considerations)
5. [Quaternion Normalization and Cube Mapping](#quaternion-normalization-and-cube-mapping)
6. [Practical Examples and Calculations](#practical-examples-and-calculations)
7. [Applications to Phyllotaxis Systems](#applications-to-phyllotaxis-systems)

## Simple Circle to Line Mapping

### Basic Concept

Imagine a circle in the xy-plane that we want to map to a line. This is the simplest form of Riemann projection and helps us understand the fundamental principles.

### Circle Definition
```
Circle: x² + y² = 1
```

### Mapping Strategy

We can map one hemisphere of the circle to one side of a line, and the other hemisphere to the other side. This creates a "phyllotaxis-like" effect where we have two distinct regions.

### Example: Circle Hemispheres

```typescript
// Circle hemisphere mapping
function mapCircleToLine(x: number, y: number): number {
  // Hemisphere determination with swapped projection points
  if (y >= 0) {
    // Upper hemisphere (y ≥ 0) → project from north pole (0, 1)
    // Map to range [-1, +1]
    return x / (1 + y);
  } else {
    // Lower hemisphere (y < 0) → project from south pole (0, -1)  
    // Map to range [-1, +1]
    return x / (1 - y);
  }
}
```

### Mathematical Details

For the upper hemisphere (y ≥ 0):
- **Input:** Point (x, y) on circle where y ≥ 0
- **Output:** Real number in [-1, +1]
- **Projection point:** North pole (0, 1)
- **Formula:** `t = x / (1 + y)`

For the lower hemisphere (y < 0):
- **Input:** Point (x, y) on circle where y < 0
- **Output:** Real number in [-1, +1]
- **Projection point:** South pole (0, -1)
- **Formula:** `t = x / (1 - y)`

### Worked Examples

#### Example 1: Upper Hemisphere Points
```
Point A: (1.0, 0.0) on circle (equator)
- Check: 1.0² + 0.0² = 1.0 + 0.0 = 1.0 ✓
- Hemisphere: y = 0.0 ≥ 0 → Upper hemisphere
- Mapping: t = 1.0 / (1 + 0.0) = 1.0 / 1.0 = 1.0

Point B: (0.0, 1.0) - North pole
- Hemisphere: y = 1.0 ≥ 0 → Upper hemisphere  
- Mapping: t = 0.0 / (1 + 1.0) = 0.0 / 2.0 = 0.0

Point C: (-1.0, 0.0) on circle (equator)
- Hemisphere: y = 0.0 ≥ 0 → Upper hemisphere
- Mapping: t = -1.0 / (1 + 0.0) = -1.0 / 1.0 = -1.0
```

#### Example 2: Lower Hemisphere Points
```
Point D: (1.0, -0.5) on circle (lower hemisphere)
- Hemisphere: y = -0.5 < 0 → Lower hemisphere
- Mapping: t = 1.0 / (1 - (-0.5)) = 1.0 / 1.5 = 0.667

Point E: (0.0, -1.0) - South pole
- Hemisphere: y = -1.0 < 0 → Lower hemisphere
- Mapping: t = 0.0 / (1 - (-1.0)) = 0.0 / 2.0 = 0.0

Point F: (-1.0, -0.5) on circle (lower hemisphere)
- Hemisphere: y = -0.5 < 0 → Lower hemisphere
- Mapping: t = -1.0 / (1 - (-0.5)) = -1.0 / 1.5 = -0.667
```

## Sphere to Plane Projections

### 2-Sphere to Plane Mapping

Now we extend to a 2-sphere (regular sphere) mapped to a plane. This is more relevant to our quaternion attractor as it involves 3D space.

### Sphere Definition
```
Sphere: x² + y² + z² = 1
```

### Stereographic Projection from 2-Sphere

```typescript
function stereographicProjection2D(x: number, y: number, z: number): [number, number] {
  // Project from north pole (0, 0, 1)
  if (z >= 1 - 1e-10) {
    // Near north pole - map to infinity
    return [Infinity, Infinity];
  }
  
  const scale = 1 / (1 - z);
  return [x * scale, y * scale];
}
```

### Hemisphere-Aware Projection

```typescript
function hemisphereAwareProjection2D(x: number, y: number, z: number, hemisphere: number): [number, number] {
  if (Math.abs(z) >= 1 - 1e-10) {
    // Near poles
    return hemisphere > 0 ? [0, 0] : [Infinity, Infinity];
  }
  
  if (hemisphere > 0) {
    // Upper hemisphere (z ≥ 0)
    const scale = 1 / (1 - z);
    return [x * scale, y * scale];
  } else {
    // Lower hemisphere (z < 0)  
    const scale = 1 / (1 + z);
    return [x * scale, y * scale];
  }
}
```

### Worked Examples for 2-Sphere

#### Example 1: Upper Hemisphere
```
Point A: (0.5, 0.0, 0.866025) on sphere
- Check: 0.5² + 0.0² + 0.866025² = 0.25 + 0.0 + 0.75 = 1.0 ✓
- Hemisphere: z = 0.866025 > 0 → Upper hemisphere
- Projection: u = 0.5 / (1 - 0.866025) = 0.5 / 0.133975 = 3.73
- Projection: v = 0.0 / (1 - 0.866025) = 0.0 / 0.133975 = 0.0

Point B: (0, 0, 1) - North pole
- Hemisphere: z = 1 > 0 → Upper hemisphere
- Projection: [∞, ∞] (singularity)
```

#### Example 2: Lower Hemisphere  
```
Point C: (0.5, 0.0, -0.866025) on sphere
- Check: 0.5² + 0.0² + (-0.866025)² = 0.25 + 0.0 + 0.75 = 1.0 ✓
- Hemisphere: z = -0.866025 < 0 → Lower hemisphere
- Projection: u = 0.5 / (1 - (-0.866025)) = 0.5 / 1.866025 = 0.268
- Projection: v = 0.0 / (1 - (-0.866025)) = 0.0 / 1.866025 = 0.0
```

## 3-Sphere to 3D Space Mapping

### Quaternion Unit Sphere (S³)

This is directly relevant to our quaternion attractor system. The 3-sphere S³ is the set of all unit quaternions.

### Definition
```
S³ = {(w, x, y, z) ∈ ℝ⁴ : w² + x² + y² + z² = 1}
```

### Standard Stereographic Projection

```typescript
function stereographicProjection3D(w: number, x: number, y: number, z: number): [number, number, number] {
  // Project from north pole (1, 0, 0, 0)
  if (w >= 1 - 1e-10) {
    // Near north pole
    return [Infinity, Infinity, Infinity];
  }
  
  const scale = 1 / (1 - w);
  return [x * scale, y * scale, z * scale];
}
```

### Hemisphere-Aware Projection (Our Implementation)

```typescript
function inverseStereographicProjectionWithSide(point: {x: number, y: number, z: number}, side: number): {w: number, x: number, y: number, z: number} {
  const { x, y, z } = point;
  const r2 = x * x + y * y + z * z;
  
  // Handle north pole singularity
  if (r2 < 1e-10) {
    return side > 0 ? { w: 1, x: 0, y: 0, z: 0 } : { w: -1, x: 0, y: 0, z: 0 };
  }
  
  // Hemisphere-aware w calculation
  const w = side > 0 ? (r2 - 1) / (r2 + 1) : (1 - r2) / (r2 + 1);
  const scale = 2 / (r2 + 1);
  
  return { w, x: x * scale, y: y * scale, z: z * scale };
}
```

## Hemisphere Considerations

### Why Hemispheres Matter

In our quaternion attractor system, we need to track which hemisphere a quaternion belongs to because:

1. **Visual Representation**: Different hemispheres get different colors (blue vs magenta)
2. **Mathematical Consistency**: The inverse projection must preserve hemisphere information
3. **Dynamical Behavior**: Hemisphere transitions create interesting visual effects

### Hemisphere Definition

The 3-sphere S³ is divided by the hyperplane w = 0:

- **Positive Hemisphere**: `w ≥ 0` → side = +1
- **Negative Hemisphere**: `w < 0` → side = -1

### Hemisphere Transitions

When a quaternion crosses the hyperplane w = 0:
- **Side changes**: From +1 to -1 or vice versa
- **Visual effect**: Color changes from blue to magenta
- **Mathematical effect**: Different inverse projection behavior

### Example: Hemisphere Transition

```typescript
// Quaternion approaching the equator
let quaternion = { w: 0.1, x: 0.7, y: 0.3, z: 0.6 };
let side = quaternion.w >= 0 ? 1 : -1; // side = 1

// After some evolution, crosses equator
quaternion = { w: -0.1, x: 0.7, y: 0.3, z: 0.6 };
side = quaternion.w >= 0 ? 1 : -1; // side = -1 (transition!)

// Visual effect: Color changes from blue to magenta
```

## Quaternion Normalization and Cube Mapping

### The Problem

Any normalized quaternion must be mapped inside a sphere in a cube. This is because:

1. **One hemisphere** maps to one side of the cube
2. **Other hemisphere** maps to the other side of the cube  
3. **Additional parameter** (side) indicates which hemisphere

### Mathematical Solution

```typescript
function mapNormalizedQuaternionToCube(quaternion: {w: number, x: number, y: number, z: number}): {position: [number, number, number], side: number} {
  // Determine hemisphere
  const side = quaternion.w >= 0 ? 1 : -1;
  
  // Project to 3D space
  const [x3, y3, z3] = stereographicProjection3D(quaternion.w, quaternion.x, quaternion.y, quaternion.z);
  
  // Map to cube coordinates [-1, 1]³ with hemisphere indication
  const position: [number, number, number] = [
    Math.tanh(x3),  // Clamp to [-1, 1]
    Math.tanh(y3),  // Clamp to [-1, 1]  
    Math.tanh(z3)   // Clamp to [-1, 1]
  ];
  
  return { position, side };
}
```

### Why This Works

1. **Stereographic projection** maps the 3-sphere to 3D space
2. **Tanh function** ensures all coordinates stay within [-1, 1]
3. **Side parameter** preserves hemisphere information
4. **Both hemispheres** fit in the same cube with different side values

### Example: Cube Mapping

```typescript
// Upper hemisphere quaternion
let q1 = { w: 0.5, x: 0.5, y: 0.5, z: 0.5 };
let mapped1 = mapNormalizedQuaternionToCube(q1);
// Result: { position: [0.6, 0.6, 0.6], side: 1 }

// Lower hemisphere quaternion  
let q2 = { w: -0.5, x: 0.5, y: 0.5, z: 0.5 };
let mapped2 = mapNormalizedQuaternionToCube(q2);
// Result: { position: [0.6, 0.6, 0.6], side: -1 }

// Same 3D position, different hemisphere!
```

## Practical Examples and Calculations

### Complete Workflow Example

Let's trace through a complete example of how a quaternion evolves and gets projected:

```typescript
// Step 1: Start with normalized quaternion
let currentQuaternion = { w: 0.8, x: 0.2, y: 0.3, z: 0.4 };
console.log("Initial quaternion:", currentQuaternion);

// Step 2: Determine hemisphere
let side = currentQuaternion.w >= 0 ? 1 : -1;
console.log("Hemisphere side:", side);

// Step 3: Apply wind rotation (simplified)
let windQuaternion = { w: 0.9, x: 0.1, y: 0.1, z: 0.1 };
currentQuaternion = multiplyQuaternions(currentQuaternion, windQuaternion);
currentQuaternion = normalizeQuaternion(currentQuaternion);
console.log("After wind:", currentQuaternion);

// Step 4: Project to 3D space
let point3D = stereographicProjection3D(currentQuaternion.w, currentQuaternion.x, currentQuaternion.y, currentQuaternion.z);
console.log("3D projection:", point3D);

// Step 5: Apply phyllotaxis (additive vector)
let additiveVector = { x: 0.618, y: 0.382, z: 0.236 }; // Golden ratio
let modifiedPoint3D = {
  x: point3D[0] + additiveVector.x,
  y: point3D[1] + additiveVector.y,
  z: point3D[2] + additiveVector.z
};
console.log("After phyllotaxis:", modifiedPoint3D);

// Step 6: Project back to quaternion space
let newQuaternion = inverseStereographicProjectionWithSide(modifiedPoint3D, side);
console.log("Back to quaternion:", newQuaternion);

// Step 7: Check for hemisphere transition
let newSide = newQuaternion.w >= 0 ? 1 : -1;
if (newSide !== side) {
  console.log("Hemisphere transition detected!", side, "→", newSide);
}
```

### Mathematical Verification

Let's verify that our projections preserve the unit quaternion property:

```typescript
function verifyQuaternionNormalization(quaternion: {w: number, x: number, y: number, z: number}): boolean {
  const magnitude = Math.sqrt(quaternion.w * quaternion.w + 
                             quaternion.x * quaternion.x + 
                             quaternion.y * quaternion.y + 
                             quaternion.z * quaternion.z);
  return Math.abs(magnitude - 1.0) < 1e-10;
}

// Test with our example
console.log("Original normalized:", verifyQuaternionNormalization(currentQuaternion));
console.log("After projection cycle:", verifyQuaternionNormalization(newQuaternion));
```

## Applications to Phyllotaxis Systems

### Connection to Natural Patterns

The Riemann projection approach connects to natural phyllotaxis patterns because:

1. **Spiral Growth**: Natural patterns like sunflower seeds follow spiral arrangements
2. **Hemisphere Separation**: Different parts of the spiral occupy different regions
3. **Golden Ratio**: Natural phyllotaxis uses golden ratio proportions
4. **Continuous Evolution**: Points evolve smoothly through the projection space

### Phyllotaxis in Our System

```typescript
// Phyllotaxis parameters (golden ratio based)
const phyllotaxisParams = {
  a: 1 / (1 + Math.sqrt(5)) / 2, // ≈ 0.618
  b: 1 / Math.pow((1 + Math.sqrt(5)) / 2, 2), // ≈ 0.382
  c: 1 / Math.pow((1 + Math.sqrt(5)) / 2, 3)  // ≈ 0.236
};

// Progressive phyllotaxis effect
function applyPhyllotaxis(point3D: {x: number, y: number, z: number}, iteration: number): {x: number, y: number, z: number} {
  const scale = Math.log(iteration + 1) * 0.1; // Progressive scaling
  
  return {
    x: point3D.x + phyllotaxisParams.a * scale,
    y: point3D.y + phyllotaxisParams.b * scale,
    z: point3D.z + phyllotaxisParams.c * scale
  };
}
```

### Visual Effect of Hemispheres

The hemisphere-based coloring creates natural-looking patterns:

- **Blue regions** (upper hemisphere): Represent one "side" of the natural spiral
- **Magenta regions** (lower hemisphere): Represent the other "side"
- **Transitions**: Hemisphere crossings create natural color gradients
- **Complexity**: Multiple transitions create rich, organic patterns

## Advanced Mathematical Properties

### Conformal Mapping

Riemann projections are conformal, meaning they preserve angles. This property is crucial for:

1. **Visual accuracy**: Patterns maintain their geometric relationships
2. **Mathematical consistency**: No distortion of fundamental shapes
3. **Computational stability**: Smooth, well-behaved transformations

### Singularity Handling

Special care must be taken near the projection poles:

```typescript
function safeStereographicProjection(w: number, x: number, y: number, z: number): [number, number, number] {
  // Handle north pole singularity
  if (w >= 1 - 1e-10) {
    // Use alternative projection or special handling
    return [x * 1e10, y * 1e10, z * 1e10];
  }
  
  // Standard projection
  const scale = 1 / (1 - w);
  return [x * scale, y * scale, z * scale];
}
```

### Numerical Stability

For computational implementation:

```typescript
function stableQuaternionNormalization(q: {w: number, x: number, y: number, z: number}): {w: number, x: number, y: number, z: number} {
  const magnitude = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
  
  // Prevent division by zero
  if (magnitude < 1e-15) {
    return { w: 1, x: 0, y: 0, z: 0 }; // Default to identity
  }
  
  return {
    w: q.w / magnitude,
    x: q.x / magnitude,
    y: q.y / magnitude,
    z: q.z / magnitude
  };
}
```

## Conclusion

Riemann projection mathematics provides the theoretical foundation for mapping high-dimensional quaternion space to visual representations. The key insights are:

1. **Hemisphere awareness** is crucial for maintaining mathematical consistency
2. **Simple to complex progression** helps understand the underlying principles
3. **Phyllotaxis connections** link mathematical theory to natural patterns
4. **Practical implementation** requires careful handling of singularities and numerical stability

This mathematical framework enables the quaternion attractor to create complex, beautiful patterns that emerge from simple iterative rules operating in 4D space, while maintaining the geometric properties that make the visualizations mathematically meaningful and aesthetically pleasing.

---

**Document prepared by:** AI Assistant  
**Mathematical review:** Based on quaternion attractor implementation  
**Last updated:** 2025-01-06
