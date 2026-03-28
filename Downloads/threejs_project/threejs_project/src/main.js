import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

function hideLoadingOverlay() {
    const loadingEl = document.getElementById('loading');
    if (!loadingEl) return;
    loadingEl.classList.add('hidden');
}

// Fail-safe: hide loader even if later setup throws.
if (document.readyState !== 'loading') {
    hideLoadingOverlay();
} else {
    window.addEventListener('DOMContentLoaded', hideLoadingOverlay, { once: true });
}
window.addEventListener('load', hideLoadingOverlay, { once: true });
window.setTimeout(hideLoadingOverlay, 3000);
window.addEventListener('error', hideLoadingOverlay);

function startTourAction() {
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.classList.add('hidden');
        // Fully remove the overlay after fade so it can never block.
        window.setTimeout(() => {
            hero.style.display = 'none';
        }, 450);
    }

    // cameraAutomation is initialized later; use global ref safely.
    if (window.cameraAutomationRef) {
        window.cameraAutomationRef.isTracking = true;
    }
}

// Global fallback so inline/button handlers always work.
window.startTour = startTourAction;

// Background gradient
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');
const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
gradient.addColorStop(0, '#3d2420');
gradient.addColorStop(1, '#1a0f0a');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 512, 512);
const bgTexture = new THREE.CanvasTexture(canvas);
scene.background = bgTexture;

// Camera position
camera.position.set(3, 2.5, 3);
camera.lookAt(0, 0.5, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 4.0; 
controls.minDistance = 2;
controls.maxDistance = 8;
controls.minPolarAngle = Math.PI / 8;
controls.maxPolarAngle = Math.PI / 2.1;
controls.target.set(0, 0.5, 0);

// Enhanced Lighting with more realistic setup and environment
const ambientLight = new THREE.AmbientLight(0xff9944, 0.25);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.8);
keyLight.position.set(3, 4, 2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 4096;
keyLight.shadow.mapSize.height = 4096;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 10;
keyLight.shadow.camera.left = -3;
keyLight.shadow.camera.right = 3;
keyLight.shadow.camera.top = 3;
keyLight.shadow.camera.bottom = -3;
keyLight.shadow.bias = -0.0001;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffcc88, 0.8);
fillLight.position.set(-3, 2, -1);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xffd700, 1.2, 10);
rimLight.position.set(0, 1, -3);
scene.add(rimLight);

// Add warm overhead light
const overheadLight = new THREE.PointLight(0xffa500, 0.6, 8);
overheadLight.position.set(0, 3, 0);
overheadLight.castShadow = true;
scene.add(overheadLight);

// Add subtle colored accent lights
const warmAccent = new THREE.PointLight(0xff6b35, 0.4, 5);
warmAccent.position.set(2, 0.5, 1);
scene.add(warmAccent);

const coolAccent = new THREE.PointLight(0x4a90e2, 0.3, 5);
coolAccent.position.set(-2, 0.5, -1);
scene.add(coolAccent);

// Add environment map for reflections
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
const envMap = cubeRenderTarget.texture;
scene.environment = envMap;

// Create enhanced Ethiopian pattern with normal map
function createEthiopianPattern() {
    const canvas = document.createElement('canvas');
    const emissiveCanvas = document.createElement('canvas');
    const normalCanvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    emissiveCanvas.width = 512;
    emissiveCanvas.height = 512;
    normalCanvas.width = 512;
    normalCanvas.height = 512;
    
    const ctx = canvas.getContext('2d');
    const eCtx = emissiveCanvas.getContext('2d');
    const nCtx = normalCanvas.getContext('2d');

    // Base clay color with variation
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add texture variation
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 3;
        const opacity = Math.random() * 0.3;
        ctx.fillStyle = `rgba(92, 58, 33, ${opacity})`;
        ctx.fillRect(x, y, size, size);
    }
    
    // Emissive base (black)
    eCtx.fillStyle = '#000000';
    eCtx.fillRect(0, 0, 512, 512);
    
    // Normal map base (neutral)
    nCtx.fillStyle = '#8080ff';
    nCtx.fillRect(0, 0, 512, 512);

    function drawMotifs(color, emissiveColor, normalHeight, width) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        eCtx.strokeStyle = emissiveColor;
        eCtx.lineWidth = width;
        nCtx.strokeStyle = normalHeight;
        nCtx.lineWidth = width * 2;

        // Ethiopian cross patterns
        for (let y = 64; y < 512; y += 128) {
            for (let x = 64; x < 512; x += 128) {
                // Main diamond
                [ctx, eCtx].forEach(c => {
                    c.beginPath();
                    const size = 45;
                    c.moveTo(x, y - size);
                    c.lineTo(x + size, y);
                    c.lineTo(x, y + size);
                    c.lineTo(x - size, y);
                    c.closePath();
                    c.stroke();
                    
                    // Internal Ethiopian cross
                    c.beginPath();
                    c.moveTo(x - size/2, y);
                    c.lineTo(x + size/2, y);
                    c.moveTo(x, y - size/2);
                    c.lineTo(x, y + size/2);
                    
                    // Diagonal cross bars
                    const offset = size * 0.3;
                    c.moveTo(x - offset, y - offset);
                    c.lineTo(x + offset, y + offset);
                    c.moveTo(x + offset, y - offset);
                    c.lineTo(x - offset, y + offset);
                    c.stroke();
                });
                
                // Normal map for depth
                nCtx.beginPath();
                const size = 45;
                nCtx.moveTo(x, y - size);
                nCtx.lineTo(x + size, y);
                nCtx.lineTo(x, y + size);
                nCtx.lineTo(x - size, y);
                nCtx.closePath();
                nCtx.stroke();
            }
        }

        // Geometric border patterns
        for (let y of [25, 487]) {
            [ctx, eCtx, nCtx].forEach(c => {
                c.beginPath();
                for (let x = 0; x <= 512; x += 16) {
                    const h = 8;
                    const line = (x % 32 === 0) ? y - h : y + h;
                    c.lineTo(x, line);
                }
                c.stroke();
            });
        }
        
        // Circular motifs
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 180;
            const cx = 256 + Math.cos(angle) * radius;
            const cy = 256 + Math.sin(angle) * radius;
            
            [ctx, eCtx].forEach(c => {
                c.beginPath();
                c.arc(cx, cy, 20, 0, Math.PI * 2);
                c.stroke();
                
                // Inner star
                for (let j = 0; j < 8; j++) {
                    const starAngle = (j / 8) * Math.PI * 2;
                    c.beginPath();
                    c.moveTo(cx, cy);
                    c.lineTo(cx + Math.cos(starAngle) * 15, cy + Math.sin(starAngle) * 15);
                    c.stroke();
                }
            });
            
            // Normal map for circles
            nCtx.beginPath();
            nCtx.arc(cx, cy, 20, 0, Math.PI * 2);
            nCtx.stroke();
        }
    }

    // Draw primary terracotta patterns
    drawMotifs('#8b2500', '#220000', '#6060ff', 3);
    
    // Draw gold highlights (highly emissive)
    drawMotifs('#d4a853', '#ffffff', '#a0a0ff', 2);

    const texture = new THREE.CanvasTexture(canvas);
    const emissiveTexture = new THREE.CanvasTexture(emissiveCanvas);
    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    emissiveTexture.wrapS = emissiveTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    
    return { texture, emissiveTexture, normalTexture };
}


// Cursor Tracking Camera System with Interactive Aroma Effects
class CameraAutomation {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
        
        // Disable auto-rotation for proper cursor control
        this.controls.autoRotate = false;
        
        // Cursor tracking properties
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.cursorInfluence = 0.3; // Stronger cursor influence
        this.isTracking = true;
        
        // Aroma effect properties
        this.aromaIntensity = 0;
        this.aromaParticles = [];
        this.clickAromaBurst = []; // Click-triggered aroma bursts
        this.cursorAromaSource = new THREE.Vector3(); // Cursor position in 3D space
        this.initCursorTracking();
        this.initAromaEffects();
    }
    
    initCursorTracking() {
        // Track mouse movement
        window.addEventListener('mousemove', (event) => {
            if (!this.isTracking) return;
            
            this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update cursor 3D position for aroma source
            this.updateCursorAromaSource(event);
            
            // Direct cursor control - update orbit controls
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position.clone().sub(this.controls.target));
            
            // Adjust angles based on cursor movement
            spherical.theta -= this.targetMouseX * 0.05;
            spherical.phi += this.targetMouseY * 0.05;
            
            // Clamp phi to prevent flipping
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            // Apply new position
            const newPosition = new THREE.Vector3().setFromSpherical(spherical).add(this.controls.target);
            this.camera.position.copy(newPosition);
            this.controls.update();
        });
        
        // Touch support for mobile
        window.addEventListener('touchmove', (event) => {
            if (!this.isTracking || event.touches.length === 0) return;
            
            this.targetMouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            this.targetMouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            
            // Update cursor 3D position for aroma source
            this.updateCursorAromaSource({ clientX: event.touches[0].clientX, clientY: event.touches[0].clientY });
            
            // Direct cursor control for touch
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position.clone().sub(this.controls.target));
            
            spherical.theta -= this.targetMouseX * 0.05;
            spherical.phi += this.targetMouseY * 0.05;
            
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            const newPosition = new THREE.Vector3().setFromSpherical(spherical).add(this.controls.target);
            this.camera.position.copy(newPosition);
            this.controls.update();
        });
        
        // Mouse wheel for zoom
        window.addEventListener('wheel', (event) => {
            if (!this.isTracking) return;
            
            event.preventDefault();
            const zoomSpeed = 0.1;
            const distance = this.camera.position.distanceTo(this.controls.target);
            
            if (event.deltaY < 0) {
                // Zoom in
                const newDistance = Math.max(1, distance - zoomSpeed);
                const direction = this.camera.position.clone().sub(this.controls.target).normalize();
                this.camera.position.copy(this.controls.target).add(direction.multiplyScalar(newDistance));
            } else {
                // Zoom out
                const newDistance = Math.min(8, distance + zoomSpeed);
                const direction = this.camera.position.clone().sub(this.controls.target).normalize();
                this.camera.position.copy(this.controls.target).add(direction.multiplyScalar(newDistance));
            }
            
            this.controls.update();
        });
        
        // Click and drag for manual orbit control
        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;
        
        window.addEventListener('mousedown', (event) => {
            isDragging = true;
            previousMouseX = event.clientX;
            previousMouseY = event.clientY;
            
            // Trigger aroma burst on click
            this.createAromaBurst(event);
        });
        
        window.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        window.addEventListener('mousemove', (event) => {
            if (!isDragging) return;
            
            const deltaX = event.clientX - previousMouseX;
            const deltaY = event.clientY - previousMouseY;
            
            // Manual orbit control
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position.clone().sub(this.controls.target));
            
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            const newPosition = new THREE.Vector3().setFromSpherical(spherical).add(this.controls.target);
            this.camera.position.copy(newPosition);
            this.controls.update();
            
            previousMouseX = event.clientX;
            previousMouseY = event.clientY;
        });
    }
    
    updateCursorAromaSource(event) {
        // Convert mouse position to 3D world coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // Create a plane at y=0 to intersect with
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const plane = new THREE.Mesh(planeGeometry);
        plane.position.y = 0;
        
        const intersects = raycaster.intersectObject(plane);
        if (intersects.length > 0) {
            this.cursorAromaSource.copy(intersects[0].point);
        } else {
            // Fallback: project cursor to ground plane
            const direction = raycaster.ray.direction.normalize();
            const distance = -raycaster.ray.origin.y / direction.y;
            this.cursorAromaSource.copy(raycaster.ray.origin).add(direction.multiplyScalar(distance));
        }
    }
    
    createAromaBurst(event) {
        // Create a burst of aroma particles at cursor position
        this.updateCursorAromaSource(event);
        
        // Create aroma particles
        for (let i = 0; i < 50; i++) {
            const particle = {
                position: this.cursorAromaSource.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    Math.random() * 0.05 + 0.02,
                    (Math.random() - 0.5) * 0.1
                ),
                life: 0,
                maxLife: 2 + Math.random() * 2,
                size: Math.random() * 0.02 + 0.01,
                color: this.getRandomAromaColor(),
                type: 'aroma'
            };
            this.clickAromaBurst.push(particle);
        }
        
        // Create smoke particles at same location
        for (let i = 0; i < 30; i++) {
            const particle = {
                position: this.cursorAromaSource.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.08,
                    Math.random() * 0.03 + 0.01,
                    (Math.random() - 0.5) * 0.08
                ),
                life: 0,
                maxLife: 3 + Math.random() * 2,
                size: Math.random() * 0.025 + 0.015,
                color: new THREE.Color(0.8, 0.8, 0.8), // Gray smoke
                type: 'smoke'
            };
            this.clickAromaBurst.push(particle);
        }
    }
    
    getRandomAromaColor() {
        const colors = [
            new THREE.Color(0.40, 0.24, 0.12), // Dark roast
            new THREE.Color(0.34, 0.20, 0.10), // Espresso brown
            new THREE.Color(0.30, 0.18, 0.09), // Deep buna
            new THREE.Color(0.45, 0.28, 0.14), // Medium roast
            new THREE.Color(0.24, 0.14, 0.07)  // Extra dark roast
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getRandomSmokeColor() {
        const colors = [
            new THREE.Color(0.9, 0.9, 0.9), // Light gray
            new THREE.Color(0.8, 0.8, 0.8), // Medium gray
            new THREE.Color(0.7, 0.7, 0.7), // Dark gray
            new THREE.Color(0.85, 0.85, 0.85) // Light smoke
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    initAromaEffects() {
        // Create combined aroma and smoke particle system
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = [];
        const particleColors = [];
        const particleSizes = [];
        
        for (let i = 0; i < 400; i++) { // Increased for both aroma and smoke
            particlePositions.push(
                Math.random() * 10 - 5,
                Math.random() * 4,
                Math.random() * 10 - 5
            );
            
            // Mix of aroma colors and smoke colors
            if (i < 250) {
                // Aroma particles (warm colors)
                const colorChoice = Math.random();
                if (colorChoice < 0.4) {
                    particleColors.push(0.8, 0.6, 0.3); // Coffee brown
                } else if (colorChoice < 0.7) {
                    particleColors.push(0.9, 0.7, 0.4); // Golden amber
                } else {
                    particleColors.push(0.7, 0.5, 0.3); // Deep spice
                }
            } else {
                // Smoke particles (gray colors)
                const grayShade = 0.7 + Math.random() * 0.2;
                particleColors.push(grayShade, grayShade, grayShade);
            }
            
            particleSizes.push(Math.random() * 3 + 1);
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
        particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(particleSizes, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.aromaPoints = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(this.aromaPoints);
    }
    
    update() {
        // Smooth mouse following for visual effects
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
        
        // Update aroma intensity based on proximity to coffee elements
        const distanceToCups = cups.reduce((min, cup) => {
            const dist = this.camera.position.distanceTo(cup.position);
            return Math.min(min, dist);
        }, Infinity);
        const distanceToCenser = this.camera.position.distanceTo(new THREE.Vector3(-0.9, 0.15, 0.3));
        const distanceToFire = this.camera.position.distanceTo(new THREE.Vector3(-0.5, 0.3, -0.3));
        const distanceToCursor = this.camera.position.distanceTo(this.cursorAromaSource);
        const minDistance = Math.min(distanceToCups, distanceToCenser, distanceToFire, distanceToCursor);
        
        // Stronger aroma when cursor is near
        this.aromaIntensity = Math.max(0, 1 - (minDistance / 4));
        
        // Add cursor proximity boost
        const cursorBoost = Math.max(0, 1 - (distanceToCursor / 2));
        this.aromaIntensity = Math.min(1, this.aromaIntensity + cursorBoost * 0.5);
        
        this.updateAromaEffects();
        this.updateClickAromaBursts();
    }
    
    updateClickAromaBursts() {
        // Update click-triggered aroma and smoke bursts
        const delta = 0.016; // Assuming 60fps
        
        for (let i = this.clickAromaBurst.length - 1; i >= 0; i--) {
            const particle = this.clickAromaBurst[i];
            particle.life += delta;
            
            if (particle.life >= particle.maxLife) {
                this.clickAromaBurst.splice(i, 1);
                continue;
            }
            
            // Update particle position with different behavior for aroma vs smoke
            particle.position.add(particle.velocity.clone().multiplyScalar(delta));
            
            if (particle.type === 'smoke') {
                // Smoke particles rise slower and spread more
                particle.velocity.y -= 0.005; // Less gravity
                particle.velocity.multiplyScalar(0.995); // Less damping
                particle.velocity.x += (Math.random() - 0.5) * 0.008; // More horizontal spread
                particle.velocity.z += (Math.random() - 0.5) * 0.008;
            } else {
                // Aroma particles behave as before
                particle.velocity.y -= 0.01; // More gravity
                particle.velocity.multiplyScalar(0.98); // More damping
                particle.position.x += (Math.random() - 0.5) * 0.005;
                particle.position.z += (Math.random() - 0.5) * 0.005;
            }
        }
    }
    
    updateAromaEffects() {
        if (this.aromaPoints) {
            this.aromaPoints.material.opacity = this.aromaIntensity * 0.3;
            
            // Animate aroma particles
            const positions = this.aromaPoints.geometry.attributes.position.array;
            const time = Date.now() * 0.001;
            
            for (let i = 0; i < positions.length; i += 3) {
                const offsetX = Math.sin(time + i) * 0.01 * this.aromaIntensity;
                const offsetY = Math.cos(time * 0.7 + i) * 0.02 * this.aromaIntensity;
                const offsetZ = Math.sin(time * 0.5 + i) * 0.01 * this.aromaIntensity;
                
                positions[i] += offsetX;
                positions[i + 1] += offsetY;
                positions[i + 2] += offsetZ;
                
                // Attract some particles toward cursor
                if (Math.random() < 0.1) {
                    const particlePos = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
                    const toCursor = this.cursorAromaSource.clone().sub(particlePos).normalize().multiplyScalar(0.02);
                    positions[i] += toCursor.x;
                    positions[i + 1] += toCursor.y;
                    positions[i + 2] += toCursor.z;
                }
                
                // Wrap particles around bounds
                if (Math.abs(positions[i]) > 5) positions[i] *= -0.9;
                if (Math.abs(positions[i + 1]) > 2) positions[i + 1] *= -0.9;
                if (Math.abs(positions[i + 2]) > 5) positions[i + 2] *= -0.9;
            }
            
            this.aromaPoints.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    toggleTracking() {
        this.isTracking = !this.isTracking;
        console.log('Cursor tracking:', this.isTracking ? 'ON' : 'OFF');
    }
}

// Create authentic Ethiopian Jebena to traditional specifications
function createJebena() {
    const group = new THREE.Group();

    // Authentic Ethiopian Jebena shape - perfectly round belly, long slender neck
    const bodyPoints = [];
    
    // Bottom base (slight flat area so it stands)
    bodyPoints.push(new THREE.Vector2(0, 0));
    bodyPoints.push(new THREE.Vector2(0.04, 0));
    
    // Smooth perfectly round belly
    const bellyRadius = 0.22;
    const bellyCenterY = 0.22;
    for(let i = 0; i <= 20; i++) {
        const t = i / 20;
        // Start from angle -PI/2 (bottom) to approx PI/4 (shoulder)
        const angle = -Math.PI / 2 + t * (3 * Math.PI / 4);
        const x = Math.max(0.04, Math.cos(angle) * bellyRadius); // Don't go inside the base radius
        const y = bellyCenterY + Math.sin(angle) * bellyRadius;
        
        // Add a slight tapering near the shoulder
        const shoulderErosion = Math.max(0, (t - 0.7) * 0.1);
        
        bodyPoints.push(new THREE.Vector2(x - shoulderErosion, y));
    }
    
    // Neck transition (tapering down smoothly)
    bodyPoints.push(new THREE.Vector2(0.06, 0.42));
    
    // Long slender neck
    bodyPoints.push(new THREE.Vector2(0.045, 0.48));
    bodyPoints.push(new THREE.Vector2(0.04, 0.58));
    bodyPoints.push(new THREE.Vector2(0.038, 0.68));
    bodyPoints.push(new THREE.Vector2(0.04, 0.73));
    
    // Small flared pouring rim
    bodyPoints.push(new THREE.Vector2(0.05, 0.75));
    bodyPoints.push(new THREE.Vector2(0.065, 0.76));
    
    const bodyGeometry = new THREE.LatheGeometry(bodyPoints, 64);
    
    // Create traditional clay texture with blackened finish from repeated use
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 1024;
    textureCanvas.height = 1024;
    const ctx = textureCanvas.getContext('2d');

    // Black base with white cultural style patterns
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 1024, 1024);

    // Add subtle black texture variations
    for (let i = 0; i < 4000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const size = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.15;
        const shade = 10 + Math.random() * 15;
        ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade - 5}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add traditional Ethiopian cross patterns in subtle gray
    ctx.strokeStyle = '#d4d4d0';
    ctx.lineWidth = 2;
    const crossSpacing = 180;
    for (let y = crossSpacing; y < 1024; y += crossSpacing) {
        for (let x = crossSpacing; x < 1024; x += crossSpacing) {
            const size = 25;
            // Diamond shape
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size, y);
            ctx.lineTo(x, y + size);
            ctx.lineTo(x - size, y);
            ctx.closePath();
            ctx.stroke();
            // Inner cross
            ctx.beginPath();
            ctx.moveTo(x - size/2, y);
            ctx.lineTo(x + size/2, y);
            ctx.moveTo(x, y - size/2);
            ctx.lineTo(x, y + size/2);
            ctx.stroke();
        }
    }

    const texture = new THREE.CanvasTexture(textureCanvas);

    // White cultural material - clean and elegant
    const jebenaMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.05,
    });

    const body = new THREE.Mesh(bodyGeometry, jebenaMaterial);
    body.position.y = 0;
    body.castShadow = true;
    body.receiveShadow = true;

    // Authentic prominent pouring spout from the middle belly
    // Spout angles upwards and outwards
    const spoutCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.18, 0.25, 0),       // Base attached to belly
        new THREE.Vector3(0.28, 0.28, 0),       // Curving out
        new THREE.Vector3(0.35, 0.35, 0),       // Curving up
        new THREE.Vector3(0.38, 0.42, 0)        // Tip
    ]);
    
    const spoutGeometry = new THREE.TubeGeometry(spoutCurve, 20, 0.025, 12, false);
    const spout = new THREE.Mesh(spoutGeometry, jebenaMaterial);
    
    // Taper the spout geometry vertices to be thinner at the tip
    const spoutPositions = spoutGeometry.attributes.position;
    for (let i = 0; i < spoutPositions.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(spoutPositions, i);
        // Distance along the X axis roughly corresponds to the length of the spout
        const ratio = (v.x - 0.18) / 0.2;
        if (ratio > 0) {
            // Squeeze the Y and Z coordinates linearly towards the center
            v.y -= (v.y - 0.35) * (ratio * 0.4);
            v.z *= (1 - ratio * 0.4);
            spoutPositions.setXYZ(i, v.x, v.y, v.z);
        }
    }
    spoutGeometry.computeVertexNormals();

    spout.castShadow = true;
    spout.receiveShadow = true;

    // Long curved handle reaching from upper neck to middle belly
    const handleCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.04, 0.65, 0),     // Attach to upper neck
        new THREE.Vector3(-0.25, 0.65, 0),     // Control point top out
        new THREE.Vector3(-0.25, 0.35, 0),     // Control point bottom out
        new THREE.Vector3(-0.19, 0.25, 0)      // Attach to middle belly
    );
    
    const handleGeometry = new THREE.TubeGeometry(handleCurve, 32, 0.015, 12, false);
    const handle = new THREE.Mesh(handleGeometry, jebenaMaterial);
    handle.castShadow = true;
    handle.receiveShadow = true;

    // Optional simple grass lid / stopper (often used to seal the top)
    const stopperGeometry = new THREE.CylinderGeometry(0.015, 0.03, 0.04, 16);
    const stopperMaterial = new THREE.MeshStandardMaterial({
        color: 0x827357, // Dried grass/straw color
        roughness: 0.9,
    });
    const stopper = new THREE.Mesh(stopperGeometry, stopperMaterial);
    stopper.position.y = 0.77;
    stopper.castShadow = true;

    // Group the parts
    group.add(body, spout, handle, stopper);

    return { group, material: jebenaMaterial, position: new THREE.Vector3(-0.2, 0, -0.3) };
}

// Create traditional Ethiopian fire holder (charcoal stove/brazier) with fire
function createFireHolder() {
    const group = new THREE.Group();
    
    // Fire holder base - traditional clay/iron brazier
    const baseGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.15, 32);
    const baseMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2a1810, // Dark clay/iron color
        roughness: 0.8,
        metalness: 0.1,
        clearcoat: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.075;
    base.castShadow = true;
    base.receiveShadow = true;
    
    // Fire holder bowl - where charcoal sits
    const bowlGeometry = new THREE.CylinderGeometry(0.22, 0.25, 0.12, 32);
    const bowlMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a0f0a, // Darker interior
        roughness: 0.9,
        metalness: 0.05
    });
    const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
    bowl.position.y = 0.19;
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    
    // Fire holder rim - decorative edge
    const rimGeometry = new THREE.TorusGeometry(0.25, 0.02, 16, 32);
    const rimMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x3a2820, // Slightly lighter rim
        roughness: 0.7,
        metalness: 0.15
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 0.25;
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    rim.receiveShadow = true;
    
    // Traditional legs/supports
    const legGeometry = new THREE.CylinderGeometry(0.015, 0.02, 0.2, 16);
    const legMaterial = baseMaterial;
    
    const legPositions = [
        { x: 0.15, z: 0.15 },
        { x: -0.15, z: 0.15 },
        { x: 0.15, z: -0.15 },
        { x: -0.15, z: -0.15 }
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, 0.1, pos.z);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
    });
    
    // Charcoal pieces inside
    const charcoalGeometry = new THREE.BoxGeometry(0.03, 0.02, 0.03);
    const charcoalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0a0808, // Very dark charcoal
        roughness: 0.95,
        metalness: 0.02
    });
    
    // Add multiple charcoal pieces
    for (let i = 0; i < 12; i++) {
        const charcoal = new THREE.Mesh(charcoalGeometry, charcoalMaterial);
        charcoal.position.set(
            (Math.random() - 0.5) * 0.3,
            0.22 + Math.random() * 0.03,
            (Math.random() - 0.5) * 0.3
        );
        charcoal.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        charcoal.castShadow = true;
        charcoal.receiveShadow = true;
        group.add(charcoal);
    }
    
    // Fire glow light
    const fireLight = new THREE.PointLight(0xff6600, 2, 3);
    fireLight.position.set(0, 0.3, 0);
    fireLight.castShadow = true;
    fireLight.shadow.mapSize.width = 512;
    fireLight.shadow.mapSize.height = 512;
    group.add(fireLight);
    
    // Ember glow
    const emberGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const emberMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4411,
        transparent: true,
        opacity: 0.3
    });
    const emberGlow = new THREE.Mesh(emberGeometry, emberMaterial);
    emberGlow.position.y = 0.25;
    group.add(emberGlow);
    
    group.add(base, bowl, rim);
    
    return { 
        group, 
        fireParticles: null,
        fireLight, 
        emberGlow,
        position: new THREE.Vector3(-0.5, 0, -0.3)
    };
}

// Create ornate brass censer with smoking incense (enhanced)
function createCenser() {
    const group = new THREE.Group();
    
    // Enhanced brass material with more realistic properties
    const brassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xb8860b,
        roughness: 0.25,
        metalness: 0.85,
        clearcoat: 0.3,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.8
    });
    
    // More ornate censer bowl
    const bowlGeometry = new THREE.SphereGeometry(0.18, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const bowl = new THREE.Mesh(bowlGeometry, brassMaterial);
    bowl.position.y = 0.12;
    bowl.scale.set(1, 0.5, 1);
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    
    // More decorative rim
    const rimGeometry = new THREE.TorusGeometry(0.18, 0.025, 24, 48);
    const rim = new THREE.Mesh(rimGeometry, brassMaterial);
    rim.position.y = 0.14;
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    
    // Ornate base with more detail
    const baseGeometry = new THREE.CylinderGeometry(0.15, 0.22, 0.1, 24);
    const base = new THREE.Mesh(baseGeometry, brassMaterial);
    base.position.y = 0;
    base.castShadow = true;
    
    // More decorative feet
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const footGeometry = new THREE.ConeGeometry(0.025, 0.05, 12);
        const foot = new THREE.Mesh(footGeometry, brassMaterial);
        foot.position.set(
            Math.cos(angle) * 0.18,
            -0.05,
            Math.sin(angle) * 0.18
        );
        foot.rotation.x = Math.PI;
        foot.castShadow = true;
        group.add(foot);
    }
    
    // Enhanced chain handles
    const chainMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xb8860b,
        roughness: 0.15,
        metalness: 0.95
    });
    
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        
        // Main chain
        const chainGeometry = new THREE.CylinderGeometry(0.006, 0.006, 0.25, 12);
        const chain = new THREE.Mesh(chainGeometry, chainMaterial);
        chain.position.set(
            Math.cos(angle) * 0.18,
            0.25,
            Math.sin(angle) * 0.18
        );
        chain.rotation.z = Math.cos(angle) * 0.4;
        chain.rotation.x = Math.sin(angle) * 0.4;
        group.add(chain);
        
        // Chain rings
        for (let j = 0; j < 3; j++) {
            const ringGeometry = new THREE.TorusGeometry(0.015, 0.002, 8, 16);
            const ring = new THREE.Mesh(ringGeometry, chainMaterial);
            ring.position.set(
                Math.cos(angle) * 0.18,
                0.15 + j * 0.05,
                Math.sin(angle) * 0.18
            );
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
        }
    }
    
    group.add(bowl, rim, base);
    
    return { group, position: new THREE.Vector3(-0.9, 0, 0.3) };
}

// Create authentic Ethiopian coffee cup (Sini) to traditional specifications
function createCup() {
    const group = new THREE.Group();

    // Authentic Sini shape - thicker base, elegant curve, handleless
    const cupPoints = [
        new THREE.Vector2(0, 0),          // exact center
        new THREE.Vector2(0.025, 0),      // base flat radius
        new THREE.Vector2(0.025, 0.005),  // base rim thickness
        new THREE.Vector2(0.02, 0.008),   // pinch in above base
        new THREE.Vector2(0.025, 0.015),  // outward curve starts
        new THREE.Vector2(0.045, 0.05),   // smooth belly curve
        new THREE.Vector2(0.055, 0.08),   // upper waist
        new THREE.Vector2(0.065, 0.12),   // flaring towards the top
        new THREE.Vector2(0.065, 0.13),   // top rim inside edge
        new THREE.Vector2(0.06, 0.11),    // inner drop
        new THREE.Vector2(0.05, 0.08),    // inner belly
        new THREE.Vector2(0.035, 0.05),   // inner bottom
        new THREE.Vector2(0.01, 0.02),    // lower inner bottom
        new THREE.Vector2(0, 0.02)        // exact center inner
    ];
    const cupGeometry = new THREE.LatheGeometry(cupPoints, 64);
    
    // Authentic white porcelain material - slightly translucent and highly reflective
    const cupMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.02,      // Extremely smooth porcelain
        metalness: 0.0,       // No metalness
        clearcoat: 1.0,       // Maximum gloss
        clearcoatRoughness: 0.02,
        transmission: 0.2,    // Slight translucency typical of porcelain
        thickness: 0.02,
        ior: 1.5              // Glass/Porcelain index of refraction
    });
    
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    cup.position.y = 0.0; // Sits flat
    cup.castShadow = true;
    cup.receiveShadow = true;
    
    // Create traditional Ethiopian Sini patterns
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 1024;
    patternCanvas.height = 1024;
    const ctx = patternCanvas.getContext('2d');
    
    // Pure white porcelain background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add subtle porcelain texture
    for (let i = 0; i < 600; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const size = Math.random() * 1.5;
        const opacity = Math.random() * 0.03;
        ctx.fillStyle = `rgba(250, 250, 250, ${opacity})`;
        ctx.fillRect(x, y, size, size);
    }
    
    // Traditional Ethiopian floral pattern for Sini
    function drawTraditionalSiniFlower(ctx, x, y, scale, primaryColor, secondaryColor, goldColor) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Delicate stem with subtle gradient
        const stemGradient = ctx.createLinearGradient(-1.5, 0, 1.5, 20);
        stemGradient.addColorStop(0, secondaryColor);
        stemGradient.addColorStop(0.5, primaryColor);
        stemGradient.addColorStop(1, secondaryColor);
        ctx.fillStyle = stemGradient;
        ctx.fillRect(-1.5, 0, 3, 20);

        // Delicate leaves with proper anatomy
        ctx.fillStyle = secondaryColor;
        
        // Left leaf with fine vein
        ctx.beginPath();
        ctx.moveTo(-5, 10);
        ctx.quadraticCurveTo(-12, 5, -5, 0);
        ctx.quadraticCurveTo(-9, 5, -5, 10);
        ctx.fill();
        
        // Fine leaf vein
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(-5, 10);
        ctx.lineTo(-8, 5);
        ctx.stroke();

        // Right leaf with fine vein
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.moveTo(5, 10);
        ctx.quadraticCurveTo(12, 5, 5, 0);
        ctx.quadraticCurveTo(9, 5, 5, 10);
        ctx.fill();
        
        // Fine leaf vein
        ctx.beginPath();
        ctx.moveTo(5, 10);
        ctx.lineTo(8, 5);
        ctx.stroke();

        // Traditional 6-petal flower with gradient
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const petalX = Math.cos(angle) * 8;
            const petalY = Math.sin(angle) * 8 - 6;
            
            const petalGradient = ctx.createRadialGradient(petalX, petalY, 0, petalX, petalY, 5);
            petalGradient.addColorStop(0, primaryColor);
            petalGradient.addColorStop(0.8, secondaryColor);
            petalGradient.addColorStop(1, primaryColor);
            ctx.fillStyle = petalGradient;
            
            ctx.beginPath();
            ctx.arc(petalX, petalY, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Center with gradient
        const centerGradient = ctx.createRadialGradient(0, -6, 0, 0, -6, 3);
        centerGradient.addColorStop(0, goldColor);
        centerGradient.addColorStop(0.5, secondaryColor);
        centerGradient.addColorStop(1, goldColor);
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(0, -6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Delicate center highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-1, -7, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Traditional Ethiopian colors for Sini
    const primaryColor = '#c41e3a'; // Traditional Ethiopian red
    const secondaryColor = '#1abc9c'; // Traditional Ethiopian teal
    const goldColor = '#f39c12'; // Traditional Ethiopian gold
    
    // Traditional pattern arrangement for Sini
    const scale = 0.9; // Smaller scale for smaller cup
    const spacing = 140; // Tighter spacing
    
    // Row 1 - traditional placement
    drawTraditionalSiniFlower(ctx, 120, 150, scale, primaryColor, secondaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 120 + spacing, 150, scale, secondaryColor, primaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 120 + spacing * 2, 150, scale, primaryColor, secondaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 120 + spacing * 3, 150, scale, secondaryColor, primaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 120 + spacing * 4, 150, scale, primaryColor, secondaryColor, goldColor);
    
    // Row 2 - offset pattern
    drawTraditionalSiniFlower(ctx, 190, 150 + spacing, scale, secondaryColor, primaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 190 + spacing, 150 + spacing, scale, primaryColor, secondaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 190 + spacing * 2, 150 + spacing, scale, secondaryColor, primaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 190 + spacing * 3, 150 + spacing, scale, primaryColor, secondaryColor, goldColor);
    
    // Row 3 - return to original alignment
    drawTraditionalSiniFlower(ctx, 120, 150 + spacing * 2, scale, primaryColor, secondaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 120 + spacing, 150 + spacing * 2, scale, secondaryColor, primaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 120 + spacing * 2, 150 + spacing * 2, scale, primaryColor, secondaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 120 + spacing * 3, 150 + spacing * 2, scale, secondaryColor, primaryColor, goldColor);
    drawTraditionalSiniFlower(ctx, 120 + spacing * 4, 150 + spacing * 2, scale, primaryColor, secondaryColor, goldColor);

    const patternTexture = new THREE.CanvasTexture(patternCanvas);
    
    // Apply traditional pattern to Sini with high-quality porcelain finish
    const patternedCupMaterial = new THREE.MeshPhysicalMaterial({
        map: patternTexture,
        color: 0xffffff,
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        ior: 1.45,
        reflectivity: 0.5,
        envMapIntensity: 1.2
    });
    
    cup.material = patternedCupMaterial;

    // Coffee for the ceremony - small amount for few sips
    const coffeeGeometry = new THREE.CylinderGeometry(0.062, 0.062, 0.004, 64); // Thinner layer
    const coffeeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x110804,
        roughness: 0.02,
        metalness: 0.0,
        clearcoat: 1.0,
        ior: 1.33,
        envMapIntensity: 1.0
    });
    const coffee = new THREE.Mesh(coffeeGeometry, coffeeMaterial);
    coffee.position.y = 0.122; // Adjusted to sit inside the new cup shape
    coffee.castShadow = true;
    coffee.receiveShadow = true;
    
    // Traditional coffee foam (crema) - more realistic texture
    const foamGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.001, 64);
    const foamMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x8b5a2b,
        roughness: 0.6,
        transparent: true,
        opacity: 0.55,
        envMapIntensity: 0.5
    });
    const foam = new THREE.Mesh(foamGeometry, foamMaterial);
    foam.position.y = 0.123;
    foam.castShadow = true;
    foam.receiveShadow = true;

    // Traditional gold rim
    const rimGeometry = new THREE.TorusGeometry(0.065, 0.003, 32, 128);
    const rimMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x5c3a21,
        roughness: 0.35,
        metalness: 0.25,
        clearcoat: 1.0,
        envMapIntensity: 2.0
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 0.13;
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    rim.receiveShadow = true;
    
    // Traditional saucer for Sini
    const saucerGeometry = new THREE.CylinderGeometry(0.1, 0.11, 0.015, 64); 
    const saucerMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.05,
        clearcoat: 1.0,
    });
    const saucer = new THREE.Mesh(saucerGeometry, saucerMaterial);
    saucer.position.y = 0.005;
    saucer.castShadow = true;
    saucer.receiveShadow = true;
    
    // Saucer rim
    const saucerRimGeometry = new THREE.TorusGeometry(0.11, 0.004, 32, 128);
    const saucerRim = new THREE.Mesh(saucerRimGeometry, rimMaterial);
    saucerRim.position.y = 0.015;
    saucerRim.rotation.x = Math.PI / 2;
    saucerRim.castShadow = true;
    saucerRim.receiveShadow = true;

    group.add(cup, coffee, foam, rim, saucer, saucerRim);
    
    return { group, position: new THREE.Vector3(0.85, 0, 0.25) };
}

// Create image display plane with automatic swapping
function createImageDisplay() {
    const textureLoader = new THREE.TextureLoader();
    
    // Array of images - using relative path for browser access
    const images = [
        './src/assets/image/Copilot_20260327_113450.png',   // relative path for browser
        './src/assets/image/Copilot_20260327_113450.png',   // placeholder for additional images
        './src/assets/image/Copilot_20260327_113450.png'    // placeholder for additional images
    ];
    
    let currentIndex = 0;
    
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(4, 3);
    
    // Create material with initial texture and error handling
    const material = new THREE.MeshBasicMaterial({ 
        map: textureLoader.load(
            images[currentIndex],
            // onLoad callback
            (texture) => {
                console.log('Image loaded successfully!');
            },
            // onProgress callback
            (progress) => {
                console.log('Loading progress:', progress);
            },
            // onError callback
            (error) => {
                console.error('Error loading image:', error);
                // Create a fallback colored material
                material.color.set(0x444444);
                material.needsUpdate = true;
            }
        ),
        transparent: true,
        opacity: 0.9
    });
    
    const plane = new THREE.Mesh(geometry, material);
    
    // Position the plane in the background
    plane.position.set(0, 1.5, -2.5);
    plane.rotation.x = 0; // Face forward
    
    // Function to update texture
    function updateTexture() {
        textureLoader.load(
            images[currentIndex],
            (texture) => {
                plane.material.map = texture;
                plane.material.needsUpdate = true;
                console.log('Texture updated successfully!');
            },
            undefined,
            (error) => {
                console.error('Error updating texture:', error);
            }
        );
    }
    
    // Automate swapping every 5 seconds
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        updateTexture();
    }, 5000);
    
    return plane;
}

// Create enhanced woven basket with red and green pattern
function createBasket() {
    const group = new THREE.Group();
    
    // Enhanced basket shape
    const basketGeometry = new THREE.CylinderGeometry(0.32, 0.38, 0.45, 48);
    
    // Create more detailed red and green woven pattern
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Base beige color
    ctx.fillStyle = '#f5e6d3';
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Enhanced red and green woven pattern with more detail
    const colors = ['#dc143c', '#228b22', '#8b4513', '#daa520', '#cd853f'];
    
    // More intricate horizontal weave
    for (let y = 0; y < 1024; y += 12) {
        for (let x = 0; x < 1024; x += 24) {
            const colorIndex = Math.floor((x + y + Math.random() * 15) / 36) % colors.length;
            ctx.fillStyle = colors[colorIndex];
            const width = 20 + Math.random() * 8;
            const height = 8 + Math.random() * 4;
            ctx.fillRect(x + Math.random() * 4, y + Math.random() * 2, width, height);
        }
    }
    
    // More intricate vertical weave
    for (let x = 0; x < 1024; x += 12) {
        for (let y = 0; y < 1024; y += 24) {
            const colorIndex = Math.floor((x + y + Math.random() * 15) / 36) % colors.length;
            ctx.fillStyle = colors[colorIndex];
            const width = 8 + Math.random() * 4;
            const height = 20 + Math.random() * 8;
            ctx.fillRect(x + Math.random() * 2, y + Math.random() * 4, width, height);
        }
    }
    
    // Add accent patterns
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const size = 10 + Math.random() * 25;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x, y, size, size);
        ctx.globalAlpha = 1.0;
    }
    
    const basketTexture = new THREE.CanvasTexture(canvas);
    
    const basketMaterial = new THREE.MeshPhysicalMaterial({
        map: basketTexture,
        roughness: 0.8,
        metalness: 0.05
    });
    
    const basket = new THREE.Mesh(basketGeometry, basketMaterial);
    basket.position.set(-1.3, 0.22, -0.4);
    basket.castShadow = true;
    basket.receiveShadow = true;
    
    // Enhanced basket rim
    const rimGeometry = new THREE.TorusGeometry(0.38, 0.025, 24, 48);
    const rim = new THREE.Mesh(rimGeometry, basketMaterial);
    rim.position.set(-1.3, 0.44, -0.4);
    rim.rotation.x = Math.PI / 2;
    
    // Add decorative handles
    for (let i = 0; i < 2; i++) {
        const angle = (i === 0 ? 0 : Math.PI);
        const handleGeometry = new THREE.TorusGeometry(0.08, 0.015, 12, 24);
        const handle = new THREE.Mesh(handleGeometry, basketMaterial);
        handle.position.set(
            -1.3 + Math.cos(angle) * 0.38,
            0.44,
            -0.4 + Math.sin(angle) * 0.38
        );
        handle.rotation.x = Math.PI / 2;
        handle.rotation.z = angle;
        group.add(handle);
    }
    
    group.add(basket, rim);
    
    return group;
}

// Create enhanced coffee beans with better distribution
function createCoffeeBeans() {
    const group = new THREE.Group();
    
    const beanGeometry = new THREE.SphereGeometry(0.015, 8, 6);
    beanGeometry.scale(1.2, 0.8, 1);
    
    const beanMaterial = new THREE.MeshStandardMaterial({
        color: 0x2b170b,
        roughness: 0.9,
        metalness: 0.04
    });
    
    // Create more coffee beans with better distribution
    const numBeans = 40;
    
    for (let i = 0; i < numBeans; i++) {
        const bean = new THREE.Mesh(beanGeometry, beanMaterial);
        
        // Distribute beans in realistic patterns
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.3 + Math.random() * 0.8;
        
        bean.position.set(
            Math.cos(angle) * radius,
            0.02 + Math.random() * 0.05,
            Math.sin(angle) * radius
        );
        
        // More realistic rotation
        bean.rotation.x = Math.random() * Math.PI;
        bean.rotation.y = Math.random() * Math.PI;
        bean.rotation.z = Math.random() * Math.PI;
        
        // Vary bean sizes slightly
        const scale = 0.8 + Math.random() * 0.4;
        bean.scale.set(scale, scale, scale);
        
        bean.castShadow = true;
        bean.receiveShadow = true;
        group.add(bean);
    }
    
    // Add some beans around the jebena base
    for (let i = 0; i < 8; i++) {
        const bean = new THREE.Mesh(beanGeometry, beanMaterial);
        
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.25 + Math.random() * 0.15;
        
        bean.position.set(
            Math.cos(angle) * radius,
            0.01,
            Math.sin(angle) * radius
        );
        
        bean.rotation.x = Math.random() * Math.PI;
        bean.rotation.y = Math.random() * Math.PI;
        bean.rotation.z = Math.random() * Math.PI;
        
        const scale = 0.9 + Math.random() * 0.2;
        bean.scale.set(scale, scale, scale);
        
        bean.castShadow = true;
        bean.receiveShadow = true;
        group.add(bean);
    }
    
    // Add some beans near the censer
    for (let i = 0; i < 5; i++) {
        const bean = new THREE.Mesh(beanGeometry, beanMaterial);
        
        bean.position.set(
            -0.9 + (Math.random() - 0.5) * 0.3,
            0.01,
            0.3 + (Math.random() - 0.5) * 0.3
        );
        
        bean.rotation.x = Math.random() * Math.PI;
        bean.rotation.y = Math.random() * Math.PI;
        bean.rotation.z = Math.random() * Math.PI;
        
        bean.castShadow = true;
        bean.receiveShadow = true;
        group.add(bean);
    }
    
    return group;
}


// Update woven mat with enhanced colors and tassels
function createMesob() {
    const group = new THREE.Group();
    
    // Main base
    const geometry = new THREE.CylinderGeometry(1.5, 1.6, 0.18, 64);
    
    // Create enhanced organic woven pattern from reference
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    // Base color from reference - warmer tone
    ctx.fillStyle = '#f5e6d3';
    ctx.fillRect(0, 0, 2048, 2048);
    
    // Enhanced organic woven pattern with more accurate colors
    const colors = ['#dc143c', '#228b22', '#ffd700', '#ffffff', '#daa520', '#cd853f', '#8b4513'];
    
    // More organic, less geometric weave with higher density and fiber-like texture
    for (let y = 0; y < 2048; y += 15) {
        for (let x = 0; x < 2048; x += 30) {
            const colorIndex = Math.floor((x + y + Math.random() * 50) / 100) % colors.length;
            ctx.fillStyle = colors[colorIndex];
            
            // Draw "fibers" instead of blocks
            ctx.beginPath();
            const w = 30 + Math.random() * 20;
            const h = 10 + Math.random() * 8;
            ctx.roundRect(x + Math.random() * 5, y + Math.random() * 5, w, h, 5);
            ctx.fill();
            
            // Add subtle shadow/depth to each fiber
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    
    // Vertical threads
    for (let x = 0; x < 2048; x += 30) {
        for (let y = 0; y < 2048; y += 15) {
            const colorIndex = (Math.floor((x + y) / 150) + 1) % colors.length;
            ctx.fillStyle = colors[colorIndex];
            
            ctx.beginPath();
            const w = 10 + Math.random() * 8;
            const h = 30 + Math.random() * 20;
            ctx.roundRect(x + Math.random() * 5, y + Math.random() * 5, w, h, 5);
            ctx.fill();
        }
    }
    
    // Add "aging" and dirt to the weave
    for (let i = 0; i < 20000; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 2048;
        const size = Math.random() * 3 + 1;
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
        ctx.fillRect(x, y, size, size);
    }
    
    // Enhanced decorative border with gold/brown patterns
    ctx.strokeStyle = '#5c4033';
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, 2028, 2028);
    
    const wovenTexture = new THREE.CanvasTexture(canvas);
    wovenTexture.anisotropy = 16;
    
    const material = new THREE.MeshPhysicalMaterial({
        map: wovenTexture,
        roughness: 0.9,
        metalness: 0.0,
        bumpScale: 0.05,
        envMapIntensity: 0.5
    });
    
    const mesob = new THREE.Mesh(geometry, material);
    mesob.position.y = -0.09;
    mesob.castShadow = true;
    mesob.receiveShadow = true;

    // Hyper-realistic tassels
    const tasselColors = ['#dc143c', '#228b22', '#ffd700', '#ffffff'];
    
    for (let i = 0; i < 48; i++) { // More tassels
        const angle = (i / 48) * Math.PI * 2;
        const tasselColor = tasselColors[i % tasselColors.length];
        
        const tasselGroup = new THREE.Group();
        
        // Tassel head (round knot)
        const knotGeo = new THREE.SphereGeometry(0.02, 8, 8);
        const tasselMat = new THREE.MeshStandardMaterial({ color: tasselColor, roughness: 0.8 });
        const knot = new THREE.Mesh(knotGeo, tasselMat);
        tasselGroup.add(knot);
        
        // Fringes (multiple thin cylinders)
        for (let j = 0; j < 12; j++) {
            const fringeGeo = new THREE.CylinderGeometry(0.001, 0.001, 0.12, 4);
            const fringe = new THREE.Mesh(fringeGeo, tasselMat);
            fringe.position.y = -0.06;
            fringe.rotation.z = (Math.random() - 0.5) * 0.4;
            fringe.rotation.x = (Math.random() - 0.5) * 0.4;
            tasselGroup.add(fringe);
        }
        
        tasselGroup.position.set(Math.cos(angle) * 1.55, -0.1, Math.sin(angle) * 1.55);
        group.add(tasselGroup);
    }

    // Decorative edge
    const ringGeometry = new THREE.TorusGeometry(1.55, 0.025, 16, 64);
    const ringMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x8b6f47,
        roughness: 0.8,
        metalness: 0.05
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0;
    ring.castShadow = true;

    group.add(mesob, ring);
    return group;
}

// Background Elements

function createKetemaFloor() {
    const floorGeometry = new THREE.PlaneGeometry(25, 25);

    // Create a dark earthy floor texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base dark dirt/shadow color
    ctx.fillStyle = '#1a1f14';
    ctx.fillRect(0, 0, 1024, 1024);

    // Create grass in patches so it does not cover every space
    const grassPatches = [
        { x: 260, y: 260, r: 250 },
        { x: 760, y: 340, r: 230 },
        { x: 520, y: 760, r: 260 }
    ];

    // Draw blades mostly inside patch zones, with occasional sparse blades outside
    for (let i = 0; i < 90000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const isInPatch = grassPatches.some((p) => {
            const dx = x - p.x;
            const dy = y - p.y;
            return (dx * dx + dy * dy) < (p.r * p.r);
        });

        // Keep only a little grass in uncovered areas
        if (!isInPatch && Math.random() > 0.08) continue;

        const length = 10 + Math.random() * 45;
        const angle = -Math.PI/2 + (Math.random() - 0.5) * 0.5; // Mostly vertical

        // Use a mix of lush greens, dried straw, and dark soil tones
        const hue = 80 + Math.random() * 40;
        const sat = 30 + Math.random() * 40;
        const light = 15 + Math.random() * 25;

        ctx.strokeStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        ctx.lineWidth = 0.5 + Math.random() * 1.5;

        ctx.beginPath();
        ctx.moveTo(x, y);
        const cp1x = x + (Math.random() - 0.5) * 10;
        const cp1y = y - length * 0.3;
        const endX = x + (Math.random() - 0.5) * 15;
        const endY = y - length;
        ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
        ctx.stroke();
    }

    // Add some "clover" and small flower highlights
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        ctx.fillStyle = Math.random() > 0.8 ? '#ffffff' : '#ffd700';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    const floorTexture = new THREE.CanvasTexture(canvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);

    const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.9,
    });

    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.3; // Right below the mesob
    floorMesh.receiveShadow = true;

    return floorMesh;
}

function createTraditionalWall() {
    // Curved backdrop wall
    const wallGeometry = new THREE.CylinderGeometry(8, 8, 8, 64, 1, true, -Math.PI/2, Math.PI);
    
    // Woven/Mud Texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Mud base color - richer, multi-toned
    const wallGradient = ctx.createLinearGradient(0, 0, 0, 1024);
    wallGradient.addColorStop(0, '#5d4638');
    wallGradient.addColorStop(1, '#3d2b1f');
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Mud/texture noise with layering
    for (let layer = 0; layer < 3; layer++) {
        for (let i = 0; i < 30000; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const darkness = Math.random() * 15;
            const size = 2 + Math.random() * 4;
            ctx.fillStyle = `rgba(${60 - darkness}, ${45 - darkness}, ${35 - darkness}, 0.4)`;
            ctx.fillRect(x, y, size, size);
        }
    }
    
    // Add straw/fiber textures into the mud wall
    ctx.lineWidth = 1;
    for (let i = 0; i < 10000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const l = 5 + Math.random() * 15;
        const a = Math.random() * Math.PI * 2;
        ctx.strokeStyle = `rgba(180, 150, 100, ${Math.random() * 0.15})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
    }
    
    // Draw a dark skirting board / lower wall
    ctx.fillStyle = '#1a0f08';
    ctx.fillRect(0, 850, 1024, 174);

    const wallTexture = new THREE.CanvasTexture(canvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.repeat.set(3, 1);
    
    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 1.0,
        side: THREE.DoubleSide
    });
    
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    wallMesh.position.set(0, 3.5, 0); // Center in scene
    wallMesh.receiveShadow = true;
    
    return wallMesh;
}

function createGlowingHearth() {
    const group = new THREE.Group();
    
    // Three stones forming the hearth (Guje)
    const stoneMaterials = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 1.0 });
    const stoneGeo = new THREE.DodecahedronGeometry(0.3, 1);
    
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const stone = new THREE.Mesh(stoneGeo, stoneMaterials);
        stone.position.set(Math.cos(angle) * 0.4, 0.1, Math.sin(angle) * 0.4);
        stone.rotation.set(Math.random(), Math.random(), Math.random());
        stone.castShadow = true;
        stone.scale.set(1, 0.6, 1);
        group.add(stone);
    }
    
    // Glowing embers inside the stones
    const embersGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
    const embersMat = new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.8 });
    const embersMesh = new THREE.Mesh(embersGeo, embersMat);
    embersMesh.position.y = 0.05;
    group.add(embersMesh);
    
    // Fire light
    const fireLight = new THREE.PointLight(0xff5500, 1.5, 6);
    fireLight.position.y = 0.5;
    group.add(fireLight);
    
    // Return both group and light so we can animate the flicker
    return { group, light: fireLight };
}

function createWindowBackdrop() {
    const group = new THREE.Group();
    
    // Arched window frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 });
    const sideGeo = new THREE.BoxGeometry(0.2, 3, 0.2);
    
    const leftFrame = new THREE.Mesh(sideGeo, frameMat);
    leftFrame.position.set(-1.1, 1.5, 0);
    const rightFrame = new THREE.Mesh(sideGeo, frameMat);
    rightFrame.position.set(1.1, 1.5, 0);
    
    const archGeo = new THREE.TorusGeometry(1.1, 0.1, 16, 32, Math.PI);
    const archTop = new THREE.Mesh(archGeo, frameMat);
    archTop.position.set(0, 3, 0);
    
    group.add(leftFrame, rightFrame, archTop);
    
    return group;
}


function createSefed() {
    const group = new THREE.Group();
    // Large flat woven basket for winnowing with realistic texture
    const geo = new THREE.CylinderGeometry(0.6, 0.58, 0.04, 32);
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#deb887';
    ctx.fillRect(0, 0, 512, 512);
    
    // Spiral weave pattern
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(256, 256, i * 12, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    const mat = new THREE.MeshStandardMaterial({ 
        map: new THREE.CanvasTexture(canvas),
        roughness: 0.8 
    });
    const basket = new THREE.Mesh(geo, mat);
    basket.castShadow = true;
    basket.receiveShadow = true;
    group.add(basket);
    return group;
}

// Create incense smoke system
class IncenseSmokeSystem {
    constructor() {
        this.particles = [];
        this.group = new THREE.Group();

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(200, 200, 200, 0.8)');
        grad.addColorStop(0.5, 'rgba(150, 150, 150, 0.4)');
        grad.addColorStop(1, 'rgba(100, 100, 100, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        const smokeTexture = new THREE.CanvasTexture(canvas);

        const material = new THREE.SpriteMaterial({
            map: smokeTexture,
            color: 0xdddddd,
            transparent: true,
            opacity: 0.15, // Thinner smoke
            blending: THREE.NormalBlending, // More realistic than additive for smoke
            depthWrite: false
        });

        for (let i = 0; i < 100; i++) { // More particles
            const particle = new THREE.Sprite(material.clone());
            particle.visible = false;
            particle.userData = {
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 0,
                offset: Math.random() * Math.PI * 2,
                wobbleSpeed: 2 + Math.random() * 2
            };
            this.particles.push(particle);
            this.group.add(particle);
        }

        this.spawnTimer = 0;
        this.activeIndex = 0;
    }

    spawn(position) {
        const particle = this.particles[this.activeIndex];
        particle.visible = true;
        particle.position.copy(position);
        particle.position.x += (Math.random() - 0.5) * 0.05;
        particle.position.z += (Math.random() - 0.5) * 0.05;

        const scale = 0.02 + Math.random() * 0.03;
        particle.scale.set(scale, scale, scale);

        particle.userData.velocity.set(
            (Math.random() - 0.5) * 0.02,
            0.15 + Math.random() * 0.1,
            (Math.random() - 0.5) * 0.02
        );
        particle.userData.life = 0;
        particle.userData.maxLife = 3 + Math.random() * 2;
        particle.material.opacity = 0.2 + Math.random() * 0.2;

        this.activeIndex = (this.activeIndex + 1) % this.particles.length;
    }

    update(delta) {
        this.spawnTimer += delta;
        for (const particle of this.particles) {
            if (!particle.visible) continue;

            particle.userData.life += delta;
            const lifeRatio = particle.userData.life / particle.userData.maxLife;

            if (lifeRatio >= 1) {
                particle.visible = false;
                continue;
            }

            const wobble = Math.sin(particle.userData.life * 2 + particle.userData.offset) * 0.01;
            particle.position.x += (particle.userData.velocity.x + wobble) * delta;
            particle.position.y += particle.userData.velocity.y * delta;
            particle.position.z += (particle.userData.velocity.z + wobble * 0.5) * delta;

            particle.material.opacity = (1 - lifeRatio) * 0.3;
            const scale = particle.scale.x * (1 + delta * 0.2);
            particle.scale.set(scale, scale, scale);
        }
    }
}

// Enhanced Steam particle system with better physics
class SteamSystem {
    constructor() {
        this.particles = [];
        this.group = new THREE.Group();

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        const steamTexture = new THREE.CanvasTexture(canvas);

        const material = new THREE.SpriteMaterial({
            map: steamTexture,
            color: 0xfffaf5,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        for (let i = 0; i < 120; i++) {
            const particle = new THREE.Sprite(material.clone());
            particle.visible = false;
            particle.userData = {
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 0,
                offset: Math.random() * Math.PI * 2,
                turbulence: Math.random() * 0.5 + 0.5
            };
            this.particles.push(particle);
            this.group.add(particle);
        }

        this.spawnTimer = 0;
        this.activeIndex = 0;
    }

    spawn(position) {
        const particle = this.particles[this.activeIndex];
        particle.visible = true;
        particle.position.copy(position);
        particle.position.x += (Math.random() - 0.5) * 0.15;
        particle.position.z += (Math.random() - 0.5) * 0.15;

        const scale = 0.025 + Math.random() * 0.05;
        particle.scale.set(scale, scale, scale);

        particle.userData.velocity.set(
            (Math.random() - 0.5) * 0.15,
            0.4 + Math.random() * 0.3,
            (Math.random() - 0.5) * 0.15
        );
        particle.userData.life = 0;
        particle.userData.maxLife = 2.5 + Math.random() * 2;
        particle.material.opacity = 0.15 + Math.random() * 0.25;

        this.activeIndex = (this.activeIndex + 1) % this.particles.length;
    }

    update(delta) {
        this.spawnTimer += delta;
        for (const particle of this.particles) {
            if (!particle.visible) continue;

            particle.userData.life += delta;
            const lifeRatio = particle.userData.life / particle.userData.maxLife;

            if (lifeRatio >= 1) {
                particle.visible = false;
                continue;
            }

            const turbulence = particle.userData.turbulence;
            const wobble = Math.sin(particle.userData.life * 4 + particle.userData.offset) * 0.03 * turbulence;
            const spiral = Math.sin(particle.userData.life * 2) * 0.02;
            
            particle.position.x += (particle.userData.velocity.x + wobble + spiral) * delta;
            particle.position.y += particle.userData.velocity.y * delta;
            particle.position.z += (particle.userData.velocity.z + wobble * 0.5) * delta;

            particle.material.opacity = (1 - lifeRatio) * 0.3;
            const scale = particle.scale.x * (1 + delta * 0.4);
            particle.scale.set(scale, scale, scale);
        }
    }
}

// Create traditional Ethiopian wooden coffee tray (Rekebot)
function createRekebot() {
    const group = new THREE.Group();
    const boardGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.8);
    const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.y = 0.05;
    board.castShadow = true;
    board.receiveShadow = true;
    
    const legGeometry = new THREE.CylinderGeometry(0.04, 0.03, 0.05, 8);
    const legPositions = [{ x: 0.5, z: 0.3 }, { x: -0.5, z: 0.3 }, { x: 0.5, z: -0.3 }, { x: -0.5, z: -0.3 }];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, boardMaterial);
        leg.position.set(pos.x, 0.025, pos.z);
        leg.castShadow = true;
        group.add(leg);
    });
    
    group.add(board);
    return { group, position: new THREE.Vector3(0.85, 0, 0.2) };
}

// Create Fandisha (Popcorn) in a traditional bowl
function createFandisha() {
    const group = new THREE.Group();
    const bowlGeometry = new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const bowlMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, side: THREE.DoubleSide });
    const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
    bowl.position.y = 0.2;
    bowl.castShadow = true;
    group.add(bowl);
    
    const kernelGeometry = new THREE.DodecahedronGeometry(0.015, 1); // More vertices for smoothness
    const kernelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xfffdd0, 
        roughness: 0.4, // Popcorn kernels have a slight sheen
    });
    for (let i = 0; i < 150; i++) { // More kernels
        const kernel = new THREE.Mesh(kernelGeometry, kernelMaterial);
        const radius = Math.random() * 0.18;
        const angle = Math.random() * Math.PI * 2;
        kernel.position.set(
            Math.cos(angle) * radius,
            0.1 + Math.random() * 0.12 - (radius * 0.4),
            Math.sin(angle) * radius
        );
        kernel.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const s = 0.8 + Math.random() * 0.6;
        kernel.scale.set(s * (1 + Math.random()*0.2), s * (1 + Math.random()*0.2), s * (1 + Math.random()*0.2));
        kernel.castShadow = true;
        group.add(kernel);
    }
    return { group, position: new THREE.Vector3(1.1, 0, 0.8) }; // Better position
}

// Create traditional Mukecha and Zenezena (Mortar and Pestle)
function createMukecha() {
    const group = new THREE.Group();
    const mortarGeometry = new THREE.CylinderGeometry(0.18, 0.15, 0.4, 32);
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const mortar = new THREE.Mesh(mortarGeometry, woodMaterial);
    mortar.position.y = 0.2;
    mortar.castShadow = true;
    mortar.receiveShadow = true;
    
    const hollowGeometry = new THREE.CylinderGeometry(0.14, 0.12, 0.1, 32);
    const hollowMaterial = new THREE.MeshStandardMaterial({ color: 0x2a1708 });
    const hollow = new THREE.Mesh(hollowGeometry, hollowMaterial);
    hollow.position.y = 0.36;
    
    const pestleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 16);
    const pestle = new THREE.Mesh(pestleGeometry, woodMaterial);
    pestle.position.set(0.05, 0.4, 0);
    pestle.rotation.z = Math.PI / 8;
    pestle.castShadow = true;
    
    group.add(mortar, hollow, pestle);
    group.scale.set(0.6, 0.6, 0.6); // Smaller size
    return { group, position: new THREE.Vector3(-1.1, 0, 0.6) };
}

// Initialize camera automation
const cameraAutomation = new CameraAutomation(camera, controls);
window.cameraAutomationRef = cameraAutomation;

// Add keyboard controls for tracking
window.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        cameraAutomation.toggleTracking();
    }
});

// Add all elements
const ceremonyGroup = new THREE.Group();
scene.add(ceremonyGroup);

const { group: rekebot, position: rekebotPos } = createRekebot();
// Move Rekebot to a central-ish focal position
rekebot.position.set(0.6, 0, 0.2);
ceremonyGroup.add(rekebot);

const { group: jebena, position: jebenaPos } = createJebena();
// Position Jebena slightly off-center on the Rekebot
jebena.position.set(0.2, 0.1, 0.2); // sit on top of the Rekebot (y=0.1)
jebena.rotation.y = -Math.PI / 4; // Angle it nicely
jebena.scale.set(0.4, 0.4, 0.4); // Even smaller
jebena.castShadow = true;
jebena.receiveShadow = true;
ceremonyGroup.add(jebena);

const { group: fandisha, position: fandishaPos } = createFandisha();
const { group: mukecha, position: mukechaPos } = createMukecha();
const { group: censer, position: censerPos } = createCenser();
const { group: fireHolder, fireLight, emberGlow, position: fireHolderPos } = createFireHolder();

fandisha.position.copy(fandishaPos);
ceremonyGroup.add(fandisha);

mukecha.position.copy(mukechaPos);
ceremonyGroup.add(mukecha);

censer.position.copy(censerPos);
censer.castShadow = true;
censer.receiveShadow = true;
ceremonyGroup.add(censer);

fireHolder.position.copy(fireHolderPos);
fireHolder.castShadow = true;
fireHolder.receiveShadow = true;
ceremonyGroup.add(fireHolder);

// Create multiple Sini cups for communal coffee ceremony
const cups = [];
const cupPositions = [
    { x: 0.5, z: 0.1 },  
    { x: 0.7, z: 0.1 },   
    { x: 0.9, z: 0.1 },   
    { x: 0.5, z: 0.3 },  
    { x: 0.7, z: 0.3 },
    { x: 0.9, z: 0.3 }
];

for (let i = 0; i < cupPositions.length; i++) {
    const { group: cup, position: cupPos } = createCup();
    
    // Position each cup at its designated location on the Rekebot
    cup.position.set(cupPositions[i].x, 0.08, cupPositions[i].z); // y=0.08 rests them perfectly on Rekebot
    
    // Add slight rotation for variety
    cup.rotation.y = (Math.random() - 0.5) * 0.3;
    
    cup.castShadow = true;
    cup.receiveShadow = true;
    ceremonyGroup.add(cup);
    cups.push(cup);
}

const mesob = createMesob();
mesob.castShadow = true;
mesob.receiveShadow = true;
ceremonyGroup.add(mesob);

const basket = createBasket();
basket.castShadow = true;
basket.receiveShadow = true;
ceremonyGroup.add(basket);

// Add Background Environment Elements
const floor = createKetemaFloor();
scene.add(floor);

const wall = createTraditionalWall();
scene.add(wall);

// Add AO-like floor shadows to ground things on the Ketema
const shadowGeo = new THREE.CircleGeometry(0.8, 32);
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });

const rekebotShadow = new THREE.Mesh(shadowGeo, shadowMat);
rekebotShadow.rotation.x = -Math.PI / 2;
rekebotShadow.position.set(0.6, -0.29, 0.2);
ceremonyGroup.add(rekebotShadow);

const mukechaShadow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), shadowMat);
mukechaShadow.rotation.x = -Math.PI / 2;
mukechaShadow.position.set(-1.1, -0.29, 0.6);
ceremonyGroup.add(mukechaShadow);

const windowBackdrop = createWindowBackdrop();
scene.add(windowBackdrop);

const { group: hearth, light: hearthLight } = createGlowingHearth();
hearth.position.set(-1.8, 0, 1.2); // Back left corner
scene.add(hearth);

// Ceremony Rotation
ceremonyGroup.rotation.y = Math.PI / 4; // Rotate only the ceremony items

const imageDisplay = createImageDisplay();
scene.add(imageDisplay);

// Add automatic rotation to the background image
imageDisplay.userData = { rotationSpeed: 0.002 };

const coffeeBeans = createCoffeeBeans();
coffeeBeans.castShadow = true;
coffeeBeans.receiveShadow = true;
ceremonyGroup.add(coffeeBeans);

// Steam from cups - multiple sources
const steamSystems = [];
cups.forEach((cup, index) => {
    const steam = new SteamSystem();
    steam.group.position.copy(cup.position);
    steam.group.position.y += 0.25;
    ceremonyGroup.add(steam.group);
    steamSystems.push(steam);
});

// Incense smoke from censer
const incenseSmoke = new IncenseSmokeSystem();
incenseSmoke.group.position.copy(censerPos);
incenseSmoke.group.position.y += 0.15;
ceremonyGroup.add(incenseSmoke.group);

// Round Manager
class RoundManager {
    constructor() {
        this.rounds = [
            { en: 'Abol', am: 'አቦል' },
            { en: 'Tona', am: 'ቶና' },
            { en: 'Bereka', am: 'በረካ' }
        ];
        this.currentIndex = -1;
        this.accumulatedRotation = 0;
        this.lastAngle = controls.getAzimuthalAngle();
        this.ui = document.getElementById('round-info');
        this.uiEn = document.getElementById('round-name-en');
        this.uiAm = document.getElementById('round-name-am');
        
        // Show first round immediately
        this.nextRound();
    }

    update() {
        const currentAngle = controls.getAzimuthalAngle();
        let delta = currentAngle - this.lastAngle;
        
        // Handle PI jump
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        
        this.accumulatedRotation += Math.abs(delta);
        this.lastAngle = currentAngle;

        if (this.accumulatedRotation >= Math.PI * 2) {
            this.accumulatedRotation -= Math.PI * 2;
            this.nextRound();
        }
    }

    nextRound() {
        this.currentIndex = (this.currentIndex + 1) % this.rounds.length;
        const round = this.rounds[this.currentIndex];
        
        // Premium transition
        this.ui.classList.remove('visible');
        
        setTimeout(() => {
            this.uiEn.textContent = round.en;
            this.uiAm.textContent = round.am;
            this.ui.classList.add('visible');
        }, 1000);
    }
}

let roundManager;
setTimeout(() => {
   roundManager = new RoundManager();
}, 2000); // Wait for scene to settle

// Animation Loop
const clock = new THREE.Clock();
let flickerTime = 0;
let fireFlickerTime = 0;
let sceneRotation = 0;

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // Auto-rotate the entire scene
    sceneRotation += 0.005; // Rotation speed
    scene.rotation.y = sceneRotation;

    // Update fire effects
    fireFlickerTime += delta;
    const fireIntensity = 1.5 + Math.sin(fireFlickerTime * 8) * 0.3;
    fireLight.intensity = fireIntensity;
    
    // Also flicker the background hearth fire
    if (typeof hearthLight !== 'undefined') {
        const hearthIntensity = 1.0 + Math.sin(fireFlickerTime * 10) * 0.4;
        hearthLight.intensity = hearthIntensity;
    }
    
    // Fire particles removed (keep light + ember glow only)
    // Animate ember glow
    emberGlow.material.opacity = 0.2 + Math.sin(fireFlickerTime * 12) * 0.1;

    // Rotate background image automatically
    imageDisplay.rotation.z += imageDisplay.userData.rotationSpeed;

    if (Math.random() < 0.15) {
        steamSystems.forEach((steam, index) => {
            // Stagger steam spawning for more natural effect
            if (Math.random() < 0.3) {
                steam.spawn(cups[index].position);
            }
        });
    }
    steamSystems.forEach(steam => steam.update(delta));
    
    if (Math.random() < 0.1) {
        incenseSmoke.spawn(censerPos);
    }
    incenseSmoke.update(delta);

    // Remove jebena glow effect since jebena was removed

    flickerTime += delta;
    keyLight.intensity = 1.8 + Math.sin(flickerTime * 8) * 0.05;

    controls.update();
    if (roundManager) roundManager.update();
    
    // Update camera automation
    cameraAutomation.update();
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
hideLoadingOverlay();

// Hero CTA
const heroEl = document.querySelector('.hero');
const startTourBtn = document.getElementById('start-tour-btn');
if (heroEl && startTourBtn) {
    startTourBtn.addEventListener('click', () => {
        startTourAction();
    });
}

animate();
