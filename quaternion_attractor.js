/**
 * Quaternion Attractor Visualization
 * 
 * This implementation follows the mathematical description:
 * 1. Quaternions as points on the 4D unit sphere S³
 * 2. Stereographic projection from half-spheres to 3D balls
 * 3. Additive operations with side flipping when leaving unit ball
 * 4. Mapping back to S³ for phyllotaxis-like patterns
 */

class QuaternionAttractor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.animationId = null;
        this.isAnimating = false;
        
        this.setupEventListeners();
        this.setupCanvas();
    }
    
    setupCanvas() {
        // Set up canvas for high DPI displays
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    setupEventListeners() {
        // Update value displays for all sliders
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueSpan = document.getElementById(e.target.id + 'Value');
                if (valueSpan) {
                    valueSpan.textContent = parseFloat(e.target.value).toFixed(3);
                }
            });
        });
        
        // Button event listeners
        document.getElementById('randomizeBtn').addEventListener('click', () => this.randomizeParameters());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearPoints());
        document.getElementById('generateBtn').addEventListener('click', () => this.generatePoints());
        document.getElementById('animateBtn').addEventListener('click', () => this.toggleAnimation());
        
        // Window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    /**
     * Normalize a quaternion to unit length
     */
    normalizeQuaternion(q) {
        const [w, x, y, z] = q;
        const length = Math.sqrt(w*w + x*x + y*y + z*z);
        if (length === 0) return [1, 0, 0, 0];
        return [w/length, x/length, y/length, z/length];
    }
    
    /**
     * Stereographic projection from 4D sphere to 3D space
     * Projects a quaternion (w,x,y,z) to 3D coordinates
     * Uses the north pole (1,0,0,0) as projection center
     */
    stereographicProjection(quaternion) {
        const [w, x, y, z] = quaternion;
        
        // Avoid division by zero at the north pole
        if (Math.abs(1 - w) < 1e-10) {
            return [0, 0, 0]; // Project north pole to origin
        }
        
        const scale = 1 / (1 - w);
        return [x * scale, y * scale, z * scale];
    }
    
    /**
     * Inverse stereographic projection from 3D to 4D sphere
     * Maps 3D point back to quaternion on S³
     */
    inverseStereographicProjection(x, y, z) {
        const r2 = x*x + y*y + z*z;
        const w = (r2 - 1) / (r2 + 1);
        const scale = 2 / (r2 + 1);
        
        return [w, x * scale, y * scale, z * scale];
    }
    
    /**
     * Apply rotation quaternion to a 3D vector
     */
    rotateVector(vector, rotationQuat) {
        const [qw, qx, qy, qz] = rotationQuat;
        const [vx, vy, vz] = vector;
        
        // Convert vector to quaternion for rotation
        const vQuat = [0, vx, vy, vz];
        
        // Apply rotation: q * v * q^-1
        const rotated = this.quaternionMultiply(
            this.quaternionMultiply(rotationQuat, vQuat),
            this.quaternionConjugate(rotationQuat)
        );
        
        return [rotated[1], rotated[2], rotated[3]];
    }
    
    /**
     * Quaternion multiplication
     */
    quaternionMultiply(q1, q2) {
        const [w1, x1, y1, z1] = q1;
        const [w2, x2, y2, z2] = q2;
        
        return [
            w1*w2 - x1*x2 - y1*y2 - z1*z2,
            w1*x2 + x1*w2 + y1*z2 - z1*y2,
            w1*y2 - x1*z2 + y1*w2 + z1*x2,
            w1*z2 + x1*y2 - y1*x2 + z1*w2
        ];
    }
    
    /**
     * Quaternion conjugate
     */
    quaternionConjugate(q) {
        return [q[0], -q[1], -q[2], -q[3]];
    }
    
    /**
     * Get current parameter values from UI
     */
    getParameters() {
        return {
            initial: {
                x: parseFloat(document.getElementById('initX').value),
                y: parseFloat(document.getElementById('initY').value),
                z: parseFloat(document.getElementById('initZ').value),
                side: parseInt(document.getElementById('initSide').value)
            },
            step: {
                a: parseFloat(document.getElementById('stepA').value),
                b: parseFloat(document.getElementById('stepB').value),
                c: parseFloat(document.getElementById('stepC').value)
            },
            rotation: {
                w: parseFloat(document.getElementById('rotW').value),
                x: parseFloat(document.getElementById('rotX').value),
                y: parseFloat(document.getElementById('rotY').value),
                z: parseFloat(document.getElementById('rotZ').value)
            },
            visualization: {
                numPoints: parseInt(document.getElementById('numPoints').value),
                pointSize: parseFloat(document.getElementById('pointSize').value),
                speed: parseFloat(document.getElementById('speed').value)
            }
        };
    }
    
    /**
     * Generate points using the quaternion attractor algorithm
     */
    generatePoints() {
        const params = this.getParameters();
        this.points = [];
        
        // Normalize rotation quaternion
        const rotationQuat = this.normalizeQuaternion([
            params.rotation.w, params.rotation.x, params.rotation.y, params.rotation.z
        ]);
        
        // Initialize state
        let state = {
            x: params.initial.x,
            y: params.initial.y,
            z: params.initial.z,
            side: params.initial.side
        };
        
        // Generate points
        for (let i = 0; i < params.visualization.numPoints; i++) {
            // Apply additive operation: (x,y,z) + (a,b,c) * side
            const newX = state.x + params.step.a * state.side;
            const newY = state.y + params.step.b * state.side;
            const newZ = state.z + params.step.c * state.side;
            
            // Check if point is outside unit ball
            const distance = Math.sqrt(newX*newX + newY*newY + newZ*newZ);
            
            if (distance > 1) {
                // Flip side and continue from the same position
                state.side = -state.side;
            } else {
                // Update position
                state.x = newX;
                state.y = newY;
                state.z = newZ;
            }
            
            // Map back to 4D sphere using inverse stereographic projection
            const quaternion = this.inverseStereographicProjection(state.x, state.y, state.z);
            
            // Apply rotation and project to 2D for display
            const rotated = this.rotateVector([state.x, state.y, state.z], rotationQuat);
            
            // Store point with metadata
            this.points.push({
                x: rotated[0],
                y: rotated[1],
                z: rotated[2],
                side: state.side,
                quaternion: quaternion,
                original: { x: state.x, y: state.y, z: state.z }
            });
        }
        
        this.render();
    }
    
    /**
     * Render points on canvas
     */
    render() {
        const params = this.getParameters();
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = Math.min(centerX, centerY) * 0.8;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw points
        this.points.forEach((point, index) => {
            const x = centerX + point.x * scale;
            const y = centerY + point.y * scale;
            
            // Color based on side and z-coordinate
            const alpha = Math.max(0.1, Math.min(1, Math.abs(point.z) + 0.3));
            const hue = point.side > 0 ? 200 : 320; // Blue for +1, Magenta for -1
            const saturation = 80;
            const lightness = 50 + point.z * 30;
            
            this.ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, params.visualization.pointSize, 0, 2 * Math.PI);
            this.ctx.fill();
        });
        
        // Draw center cross
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 10, centerY);
        this.ctx.lineTo(centerX + 10, centerY);
        this.ctx.moveTo(centerX, centerY - 10);
        this.ctx.lineTo(centerX, centerY + 10);
        this.ctx.stroke();
    }
    
    /**
     * Randomize all parameters
     */
    randomizeParameters() {
        // Randomize initial position
        document.getElementById('initX').value = (Math.random() - 0.5) * 2;
        document.getElementById('initY').value = (Math.random() - 0.5) * 2;
        document.getElementById('initZ').value = (Math.random() - 0.5) * 2;
        document.getElementById('initSide').value = Math.random() > 0.5 ? 1 : -1;
        
        // Randomize step vector
        document.getElementById('stepA').value = (Math.random() - 0.5) * 0.2;
        document.getElementById('stepB').value = (Math.random() - 0.5) * 0.2;
        document.getElementById('stepC').value = (Math.random() - 0.5) * 0.2;
        
        // Randomize rotation quaternion
        const randomQuat = this.normalizeQuaternion([
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ]);
        document.getElementById('rotW').value = randomQuat[0];
        document.getElementById('rotX').value = randomQuat[1];
        document.getElementById('rotY').value = randomQuat[2];
        document.getElementById('rotZ').value = randomQuat[3];
        
        // Update displays
        document.querySelectorAll('input[type="range"]').forEach(input => {
            const valueSpan = document.getElementById(input.id + 'Value');
            if (valueSpan) {
                valueSpan.textContent = parseFloat(input.value).toFixed(3);
            }
        });
    }
    
    /**
     * Clear all points
     */
    clearPoints() {
        this.points = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Toggle animation
     */
    toggleAnimation() {
        if (this.isAnimating) {
            cancelAnimationFrame(this.animationId);
            this.isAnimating = false;
            document.getElementById('animateBtn').textContent = 'Start Animation';
        } else {
            this.isAnimating = true;
            document.getElementById('animateBtn').textContent = 'Stop Animation';
            this.animate();
        }
    }
    
    /**
     * Animation loop
     */
    animate() {
        if (!this.isAnimating) return;
        
        // Slightly modify rotation quaternion for animation
        const params = this.getParameters();
        const time = Date.now() * 0.001 * params.visualization.speed;
        
        // Create animated rotation
        const animatedRotation = this.normalizeQuaternion([
            Math.cos(time * 0.1),
            Math.sin(time * 0.1) * 0.3,
            Math.sin(time * 0.15) * 0.2,
            Math.cos(time * 0.2) * 0.1
        ]);
        
        // Update rotation sliders
        document.getElementById('rotW').value = animatedRotation[0];
        document.getElementById('rotX').value = animatedRotation[1];
        document.getElementById('rotY').value = animatedRotation[2];
        document.getElementById('rotZ').value = animatedRotation[3];
        
        // Update displays
        document.getElementById('rotWValue').textContent = animatedRotation[0].toFixed(3);
        document.getElementById('rotXValue').textContent = animatedRotation[1].toFixed(3);
        document.getElementById('rotYValue').textContent = animatedRotation[2].toFixed(3);
        document.getElementById('rotZValue').textContent = animatedRotation[3].toFixed(3);
        
        // Re-render with new rotation
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuaternionAttractor();
});
