/**
 * Main AssemblyScript entry point
 * 
 * Exports all WASM modules and provides unified interface
 */

// Export all mathematical functions
export {
  normalizeQuaternion,
  quaternionMultiply,
  stereographicProjection,
  inverseStereographicProjection,
  rotateVector,
  distance3D,
  magnitude3D,
  type Quaternion,
  type Point3D,
  type Vector3D
} from './quaternion-math';

// Export random number generator
export { DeterministicRandom } from './deterministic-random';

// Export attractor engine
export {
  AttractorEngine,
  SideFlipVariation,
  type AttractorConfig,
  type AttractorPoint
} from './attractor-engine';
