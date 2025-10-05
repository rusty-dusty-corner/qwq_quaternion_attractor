/**
 * Tests for AssemblyScript Quaternion Math Functions
 */

import { 
  normalizeQuaternion,
  quaternionMultiply,
  stereographicProjection,
  inverseStereographicProjection,
  rotateVector,
  magnitude3D
} from '../../src/wasm/quaternion-math';

describe('Quaternion Math Functions', () => {
  
  describe('normalizeQuaternion', () => {
    test('should normalize a quaternion to unit length', () => {
      const q = new Float32Array([2, 3, 4, 5]);
      const normalized = normalizeQuaternion(q);
      
      const length = Math.sqrt(
        normalized[0]*normalized[0] + 
        normalized[1]*normalized[1] + 
        normalized[2]*normalized[2] + 
        normalized[3]*normalized[3]
      );
      
      expect(length).toBeCloseTo(1, 6);
    });
    
    test('should handle zero quaternion', () => {
      const q = new Float32Array([0, 0, 0, 0]);
      const normalized = normalizeQuaternion(q);
      
      expect(normalized[0]).toBe(1);
      expect(normalized[1]).toBe(0);
      expect(normalized[2]).toBe(0);
      expect(normalized[3]).toBe(0);
    });
  });
  
  describe('quaternionMultiply', () => {
    test('should multiply quaternions correctly', () => {
      const q1 = new Float32Array([1, 0, 0, 0]); // Identity
      const q2 = new Float32Array([0, 1, 0, 0]); // i
      
      const result = quaternionMultiply(q1, q2);
      
      expect(result[0]).toBeCloseTo(0, 6);
      expect(result[1]).toBeCloseTo(1, 6);
      expect(result[2]).toBeCloseTo(0, 6);
      expect(result[3]).toBeCloseTo(0, 6);
    });
    
    test('should be associative', () => {
      const q1 = new Float32Array([0.5, 0.5, 0.5, 0.5]);
      const q2 = new Float32Array([0.3, 0.3, 0.3, 0.3]);
      const q3 = new Float32Array([0.7, 0.7, 0.7, 0.7]);
      
      const result1 = quaternionMultiply(quaternionMultiply(q1, q2), q3);
      const result2 = quaternionMultiply(q1, quaternionMultiply(q2, q3));
      
      for (let i = 0; i < 4; i++) {
        expect(result1[i]).toBeCloseTo(result2[i], 6);
      }
    });
  });
  
  describe('stereographicProjection', () => {
    test('should project north pole to origin', () => {
      const northPole = new Float32Array([1, 0, 0, 0]);
      const projected = stereographicProjection(northPole);
      
      expect(projected[0]).toBeCloseTo(0, 6);
      expect(projected[1]).toBeCloseTo(0, 6);
      expect(projected[2]).toBeCloseTo(0, 6);
    });
    
    test('should project unit quaternions correctly', () => {
      const q = new Float32Array([0, 1, 0, 0]);
      const projected = stereographicProjection(q);
      
      expect(projected[0]).toBeCloseTo(1, 6);
      expect(projected[1]).toBeCloseTo(0, 6);
      expect(projected[2]).toBeCloseTo(0, 6);
    });
  });
  
  describe('inverseStereographicProjection', () => {
    test('should project origin back to north pole', () => {
      const origin = new Float32Array([0, 0, 0]);
      const quaternion = inverseStereographicProjection(origin);
      
      expect(quaternion[0]).toBeCloseTo(1, 6);
      expect(quaternion[1]).toBeCloseTo(0, 6);
      expect(quaternion[2]).toBeCloseTo(0, 6);
      expect(quaternion[3]).toBeCloseTo(0, 6);
    });
  });
  
  describe('round-trip projection', () => {
    test('should maintain accuracy through projection cycle', () => {
      const original = new Float32Array([0.6, 0.8, 0, 0]);
      
      const projected = stereographicProjection(original);
      const backToQuat = inverseStereographicProjection(projected);
      
      for (let i = 0; i < 4; i++) {
        expect(backToQuat[i]).toBeCloseTo(original[i], 6);
      }
    });
  });
  
  describe('magnitude3D', () => {
    test('should calculate vector magnitude correctly', () => {
      const v = new Float32Array([3, 4, 0]);
      const magnitude = magnitude3D(v);
      
      expect(magnitude).toBeCloseTo(5, 6);
    });
    
    test('should handle zero vector', () => {
      const v = new Float32Array([0, 0, 0]);
      const magnitude = magnitude3D(v);
      
      expect(magnitude).toBeCloseTo(0, 6);
    });
  });
});
