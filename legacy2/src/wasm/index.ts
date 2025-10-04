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
  magnitude3D
} from './quaternion-math';

// Export function-based API for attractor engine
export {
  createAttractorEngine,
  generatePoints,
  getPointCount,
  getPointRange,
  getAllPoints,
  getStatistics,
  getCurrentState,
  updateConfig,
  resetEngine,
  getEngineCount,
  clearAllEngines,
  SIDE_FLIP_PLAIN,
  SIDE_FLIP_SMALLEST,
  SIDE_FLIP_ALL_EXCEPT_LARGEST
} from './function-api';
