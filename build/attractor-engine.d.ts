/** Exported memory */
export declare const memory: WebAssembly.Memory;
/** Exported table */
export declare const table: WebAssembly.Table;
// Exported runtime interface
export declare function __new(size: number, id: number): number;
export declare function __pin(ptr: number): number;
export declare function __unpin(ptr: number): void;
export declare function __collect(): void;
export declare const __rtti_base: number;
/**
 * src/wasm/quaternion-math/normalizeQuaternion
 * @param q `~lib/typedarray/Float32Array`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function normalizeQuaternion(q: Float32Array): Float32Array;
/**
 * src/wasm/quaternion-math/quaternionMultiply
 * @param q1 `~lib/typedarray/Float32Array`
 * @param q2 `~lib/typedarray/Float32Array`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function quaternionMultiply(q1: Float32Array, q2: Float32Array): Float32Array;
/**
 * src/wasm/quaternion-math/stereographicProjection
 * @param q `~lib/typedarray/Float32Array`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function stereographicProjection(q: Float32Array): Float32Array;
/**
 * src/wasm/quaternion-math/inverseStereographicProjection
 * @param p `~lib/typedarray/Float32Array`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function inverseStereographicProjection(p: Float32Array): Float32Array;
/**
 * src/wasm/quaternion-math/rotateVector
 * @param v `~lib/typedarray/Float32Array`
 * @param q `~lib/typedarray/Float32Array`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function rotateVector(v: Float32Array, q: Float32Array): Float32Array;
/**
 * src/wasm/quaternion-math/distance3D
 * @param p1 `~lib/typedarray/Float32Array`
 * @param p2 `~lib/typedarray/Float32Array`
 * @returns `f32`
 */
export declare function distance3D(p1: Float32Array, p2: Float32Array): number;
/**
 * src/wasm/quaternion-math/magnitude3D
 * @param v `~lib/typedarray/Float32Array`
 * @returns `f32`
 */
export declare function magnitude3D(v: Float32Array): number;
/**
 * src/wasm/function-api/createAttractorEngine
 * @param maxPoints `i32`
 * @param seed `i32`
 * @param stepVectorX `f32`
 * @param stepVectorY `f32`
 * @param stepVectorZ `f32`
 * @param initialX `f32`
 * @param initialY `f32`
 * @param initialZ `f32`
 * @param sideFlipVariation `i32`
 * @param globalRotationW `f32`
 * @param globalRotationX `f32`
 * @param globalRotationY `f32`
 * @param globalRotationZ `f32`
 * @returns `i32`
 */
export declare function createAttractorEngine(maxPoints: number, seed: number, stepVectorX: number, stepVectorY: number, stepVectorZ: number, initialX: number, initialY: number, initialZ: number, sideFlipVariation: number, globalRotationW: number, globalRotationX: number, globalRotationY: number, globalRotationZ: number): number;
/**
 * src/wasm/function-api/generatePoints
 * @param engineId `i32`
 * @param count `i32`
 */
export declare function generatePoints(engineId: number, count: number): void;
/**
 * src/wasm/function-api/getPointCount
 * @param engineId `i32`
 * @returns `i32`
 */
export declare function getPointCount(engineId: number): number;
/**
 * src/wasm/function-api/getPointRange
 * @param engineId `i32`
 * @param start `i32`
 * @param count `i32`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function getPointRange(engineId: number, start: number, count: number): Float32Array;
/**
 * src/wasm/function-api/getAllPoints
 * @param engineId `i32`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function getAllPoints(engineId: number): Float32Array;
/**
 * src/wasm/function-api/getStatistics
 * @param engineId `i32`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function getStatistics(engineId: number): Float32Array;
/**
 * src/wasm/function-api/getCurrentState
 * @param engineId `i32`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function getCurrentState(engineId: number): Float32Array;
/**
 * src/wasm/function-api/updateConfig
 * @param engineId `i32`
 * @param seed `i32`
 * @param stepVectorX `f32`
 * @param stepVectorY `f32`
 * @param stepVectorZ `f32`
 * @param initialX `f32`
 * @param initialY `f32`
 * @param initialZ `f32`
 * @param sideFlipVariation `i32`
 * @param globalRotationW `f32`
 * @param globalRotationX `f32`
 * @param globalRotationY `f32`
 * @param globalRotationZ `f32`
 */
export declare function updateConfig(engineId: number, seed: number, stepVectorX: number, stepVectorY: number, stepVectorZ: number, initialX: number, initialY: number, initialZ: number, sideFlipVariation: number, globalRotationW: number, globalRotationX: number, globalRotationY: number, globalRotationZ: number): void;
/**
 * src/wasm/function-api/resetEngine
 * @param engineId `i32`
 */
export declare function resetEngine(engineId: number): void;
/**
 * src/wasm/function-api/getEngineCount
 * @returns `i32`
 */
export declare function getEngineCount(): number;
/**
 * src/wasm/function-api/clearAllEngines
 */
export declare function clearAllEngines(): void;
/** src/wasm/function-api/SIDE_FLIP_PLAIN */
export declare const SIDE_FLIP_PLAIN: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/function-api/SIDE_FLIP_SMALLEST */
export declare const SIDE_FLIP_SMALLEST: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/function-api/SIDE_FLIP_ALL_EXCEPT_LARGEST */
export declare const SIDE_FLIP_ALL_EXCEPT_LARGEST: {
  /** @type `i32` */
  get value(): number
};
