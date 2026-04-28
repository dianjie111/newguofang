import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

let scene, camera, renderer, controls;
let carrier;
let water, waterVertices;
let splashParticles, splashParticleSystem;
let foamParticles, foamParticleSystem;
let carrierInitialY = 0;
let ripples = [];
let rippleId = 0;

function init() {
    scene = new THREE.Scene();
    const skyColor = new THREE.Color(0x87CEEB);
    scene.background = skyColor;
    scene.fog = new THREE.Fog(skyColor, 100, 300);
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 25, 50);
    
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 5, 0);
    controls.maxPolarAngle = Math.PI / 2.2;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight1.position.set(30, 50, 30);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;
    directionalLight1.shadow.camera.near = 0.5;
    directionalLight1.shadow.camera.far = 300;
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-20, 30, -20);
    scene.add(directionalLight2);
    
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.3);
    scene.add(hemisphereLight);
    
    createWater();
    createCarrier();
    createSplashParticles();
    createFoamParticles();
    
    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function createCarrier() {
    const loader = new FBXLoader();
    loader.load('public/军舰.fbx', function(object) {
        carrier = object;
        
        const box = new THREE.Box3().setFromObject(carrier);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 15 / maxDim;
        carrier.scale.set(scale, scale, scale);
        
        carrierInitialY = -center.y * scale;
        carrier.position.set(-center.x * scale, carrierInitialY, -center.z * scale);
        
        carrier.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            mat.needsUpdate = true;
                            mat.flatShading = false;
                        });
                    } else {
                        child.material.needsUpdate = true;
                        child.material.flatShading = false;
                    }
                }
            }
        });
        
        scene.add(carrier);
        console.log('军舰模型加载成功');
        console.log('模型尺寸:', size);
        console.log('缩放比例:', scale);
        
        fitCameraToObject(carrier);
    }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function(error) {
        console.error('模型加载失败:', error);
        createPlaceholderCarrier();
    });
}

function fitCameraToObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
    cameraZ *= 1.8;
    camera.position.set(center.x, center.y + cameraZ * 0.5, center.z + cameraZ);
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();
}

function createPlaceholderCarrier() {
    const carrierGeometry = new THREE.BoxGeometry(12, 0.5, 5);
    const carrierMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    carrier = new THREE.Mesh(carrierGeometry, carrierMaterial);
    carrier.position.set(0, 0, 0);
    carrierInitialY = 0;
    scene.add(carrier);
    
    const deckGeometry = new THREE.BoxGeometry(10, 0.1, 4);
    const deckMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.set(0, 0.3, 0);
    carrier.add(deck);
    
    const islandGeometry = new THREE.BoxGeometry(1, 2, 1.5);
    const islandMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.set(3, 1.3, 0);
    carrier.add(island);
}

function createWater() {
    const waterGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    
    const waterMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1e90ff, 
        transparent: true, 
        opacity: 0.85, 
        side: THREE.DoubleSide,
        shininess: 150,
        specular: 0xaaaaaa
    });
    
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1.5;
    water.receiveShadow = true;
    scene.add(water);
    
    waterVertices = [];
    
    for (let i = 0; i < water.geometry.attributes.position.count; i++) {
        const x = water.geometry.attributes.position.getX(i);
        const y = water.geometry.attributes.position.getY(i);
        const z = water.geometry.attributes.position.getZ(i);
        waterVertices.push({ x, y, z, originalY: y });
    }
}

function createSplashParticles() {
    const splashCount = 200;
    const splashGeometry = new THREE.BufferGeometry();
    const splashPositions = new Float32Array(splashCount * 3);
    const splashVelocities = new Float32Array(splashCount * 3);
    const splashLifetimes = new Float32Array(splashCount);
    
    for (let i = 0; i < splashCount; i++) {
        splashPositions[i * 3] = 0;
        splashPositions[i * 3 + 1] = -100;
        splashPositions[i * 3 + 2] = 0;
        splashVelocities[i * 3] = (Math.random() - 0.5) * 2;
        splashVelocities[i * 3 + 1] = Math.random() * 3 + 1;
        splashVelocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
        splashLifetimes[i] = 0;
    }
    
    splashGeometry.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));
    splashGeometry.setAttribute('velocity', new THREE.BufferAttribute(splashVelocities, 3));
    splashGeometry.setAttribute('lifetime', new THREE.BufferAttribute(splashLifetimes, 1));
    
    const splashMaterial = new THREE.PointsMaterial({
        color: 0x87CEEB,
        size: 0.15,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true
    });
    
    splashParticleSystem = new THREE.Points(splashGeometry, splashMaterial);
    scene.add(splashParticleSystem);
    splashParticles = { count: splashCount, velocities: splashVelocities, lifetimes: splashLifetimes };
}

function createFoamParticles() {
    const foamCount = 500;
    const foamGeometry = new THREE.BufferGeometry();
    const foamPositions = new Float32Array(foamCount * 3);
    
    for (let i = 0; i < foamCount; i++) {
        foamPositions[i * 3] = (Math.random() - 0.5) * 180;
        foamPositions[i * 3 + 1] = -1.3 + Math.random() * 0.2;
        foamPositions[i * 3 + 2] = (Math.random() - 0.5) * 180;
    }
    
    foamGeometry.setAttribute('position', new THREE.BufferAttribute(foamPositions, 3));
    
    const foamMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });
    
    foamParticleSystem = new THREE.Points(foamGeometry, foamMaterial);
    scene.add(foamParticleSystem);
    foamParticles = { count: foamCount, positions: foamPositions };
}

function updateWater() {
    if (!water) return;
    
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < waterVertices.length; i++) {
        const vertex = waterVertices[i];
        
        let waveY = 0;
        
        waveY += Math.sin(vertex.x * 0.02 + time * 0.4) * 0.5;
        waveY += Math.sin(vertex.z * 0.02 + time * 0.3) * 0.4;
        waveY += Math.sin(vertex.x * 0.015 + time * 0.5) * 0.3;
        waveY += Math.sin(vertex.z * 0.015 + time * 0.35) * 0.25;
        waveY += Math.sin((vertex.x + vertex.z) * 0.01 + time * 0.6) * 0.2;
        waveY += Math.sin((vertex.x - vertex.z) * 0.008 + time * 0.45) * 0.15;
        waveY += Math.sin(vertex.x * 0.03 + time * 0.7) * 0.1;
        waveY += Math.sin(vertex.z * 0.03 + time * 0.55) * 0.08;
        
        const localRandom = Math.sin(vertex.x * 0.1 + vertex.z * 0.1 + time) * 0.05;
        waveY += localRandom;
        
        for (const ripple of ripples) {
            const dx = vertex.x - ripple.x;
            const dz = vertex.z - ripple.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const waveLen = ripple.radius * 0.5;
            
            if (dist > ripple.radius + waveLen || dist < ripple.radius - waveLen) continue;
            
            const wave = Math.sin((dist - ripple.radius) / waveLen * Math.PI + ripple.phase) * ripple.amplitude;
            waveY += wave * ripple.intensity;
        }
        
        vertex.y = vertex.originalY + waveY;
        water.geometry.attributes.position.setY(i, vertex.y);
    }
    
    water.geometry.attributes.position.needsUpdate = true;
    water.geometry.computeVertexNormals();
    
    const opacity = 0.8 + Math.sin(time * 0.5) * 0.1;
    water.material.opacity = opacity;
    
    const hueShift = Math.sin(time * 0.2) * 0.02;
    water.material.color.setHSL(0.57 + hueShift, 0.8, 0.55);
}

function createRipple(x, z) {
    const ripple = {
        id: rippleId++,
        x: x,
        z: z,
        radius: 0,
        maxRadius: 8 + Math.random() * 4,
        amplitude: 0.15 + Math.random() * 0.1,
        intensity: 1,
        phase: 0,
        speed: 0.3 + Math.random() * 0.2
    };
    ripples.push(ripple);
}

function updateRipples() {
    const time = Date.now() * 0.001;
    
    for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += ripple.speed;
        ripple.phase += 0.2;
        ripple.intensity = Math.max(0, 1 - ripple.radius / ripple.maxRadius);
        
        if (ripple.radius >= ripple.maxRadius) {
            ripples.splice(i, 1);
        }
    }
    
    if (carrier && Math.random() < 0.05) {
        const offsetX = (Math.random() - 0.5) * 6;
        const offsetZ = (Math.random() - 0.5) * 3;
        createRipple(carrier.position.x + offsetX, carrier.position.z + offsetZ);
    }
}

function updateCarrierWaves() {
    if (!carrier) return;
    
    const time = Date.now() * 0.001;
    const carrierPos = carrier.position;
    
    const waveY = Math.sin(time * 0.8) * 0.4 + Math.sin(time * 1.3) * 0.2;
    const waveRoll = Math.sin(time * 1.2) * 0.08 + Math.sin(time * 0.7) * 0.04;
    const wavePitch = Math.sin(time * 0.9) * 0.05 + Math.sin(time * 1.5) * 0.03;
    
    carrierPos.y = carrierInitialY + waveY;
    carrier.rotation.x = wavePitch;
    carrier.rotation.z = waveRoll;
}

function updateSplashParticles() {
    if (!splashParticleSystem || !carrier) return;
    
    const time = Date.now() * 0.001;
    const positions = splashParticleSystem.geometry.attributes.position.array;
    const velocities = splashParticles.velocities;
    const lifetimes = splashParticles.lifetimes;
    const carrierPos = carrier.position;
    
    for (let i = 0; i < splashParticles.count; i++) {
        if (lifetimes[i] <= 0) {
            if (Math.random() < 0.02) {
                positions[i * 3] = carrierPos.x + (Math.random() - 0.5) * 8;
                positions[i * 3 + 1] = carrierPos.y - 0.5;
                positions[i * 3 + 2] = carrierPos.z + (Math.random() - 0.5) * 4;
                velocities[i * 3] = (Math.random() - 0.5) * 1.5;
                velocities[i * 3 + 1] = Math.random() * 2 + 0.5;
                velocities[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
                lifetimes[i] = Math.random() * 1 + 0.5;
            }
        } else {
            positions[i * 3] += velocities[i * 3] * 0.05;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.05;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.05;
            velocities[i * 3 + 1] -= 0.1;
            lifetimes[i] -= 0.016;
            
            if (lifetimes[i] < 0) {
                positions[i * 3 + 1] = -100;
            }
        }
    }
    
    splashParticleSystem.geometry.attributes.position.needsUpdate = true;
}

function updateFoamParticles() {
    if (!foamParticleSystem) return;
    
    const time = Date.now() * 0.001;
    const positions = foamParticleSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < foamParticles.count; i++) {
        positions[i * 3] += Math.sin(time + i * 0.1) * 0.02;
        positions[i * 3 + 1] = -1.3 + Math.sin(time * 2 + i * 0.05) * 0.1;
        positions[i * 3 + 2] += Math.cos(time + i * 0.15) * 0.02;
        
        if (positions[i * 3] > 90) positions[i * 3] = -90;
        if (positions[i * 3] < -90) positions[i * 3] = 90;
        if (positions[i * 3 + 2] > 90) positions[i * 3 + 2] = -90;
        if (positions[i * 3 + 2] < -90) positions[i * 3 + 2] = 90;
    }
    
    foamParticleSystem.geometry.attributes.position.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    updateWater();
    updateRipples();
    updateCarrierWaves();
    updateSplashParticles();
    updateFoamParticles();
    
    controls.update();
    renderer.render(scene, camera);
}

init();