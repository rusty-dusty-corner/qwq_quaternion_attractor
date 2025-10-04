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
/** src/wasm/attractor-engine/SideFlipVariation */
export declare enum SideFlipVariation {
  /** @type `i32` */
  PLAIN_FLIP,
  /** @type `i32` */
  FLIP_SMALLEST,
  /** @type `i32` */
  FLIP_ALL_EXCEPT_LARGEST,
}
