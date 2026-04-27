// 全局变量
let scene, camera, renderer, controls;
let carrier, aircraft, radar, missile, ciws, sonar;
let radarRotating = false;
let ciwsActive = false;
let sonarActive = false;
let ecmActive = false;
let missiles = [];

// 初始化函数
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e3a5f);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 15);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth - 320, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // 添加轨道控制
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 15, 10);
    scene.add(directionalLight);
    
    // 添加点光源（用于导弹尾焰）
    const missileLight = new THREE.PointLight(0xff0000, 1, 10);
    scene.add(missileLight);
    
    // 创建航母模型（简化版）
    createCarrier();
    
    // 添加水面效果
    createWater();
    
    // 响应窗口大小变化
    window.addEventListener('resize', onWindowResize, false);
    
    // 开始动画循环
    animate();
}

// 创建航母模型（简化版）
function createCarrier() {
    // 航母主体
    const carrierGeometry = new THREE.BoxGeometry(12, 0.5, 5);
    const carrierMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    carrier = new THREE.Mesh(carrierGeometry, carrierMaterial);
    carrier.position.set(0, 0, 0);
    scene.add(carrier);
    
    // 飞行甲板
    const deckGeometry = new THREE.BoxGeometry(10, 0.1, 4);
    const deckMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.set(0, 0.3, 0);
    carrier.add(deck);
    
    // 舰岛
    const islandGeometry = new THREE.BoxGeometry(1, 2, 1.5);
    const islandMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.set(3, 1.3, 0);
    carrier.add(island);
    
    // 雷达
    const radarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
    const radarMaterial = new THREE.MeshPhongMaterial({ color: 0x00aaff });
    radar = new THREE.Mesh(radarGeometry, radarMaterial);
    radar.position.set(3, 2.3, 0);
    carrier.add(radar);
    
    // 近防系统
    const ciwsGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 32);
    const ciwsMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    ciws = new THREE.Mesh(ciwsGeometry, ciwsMaterial);
    ciws.position.set(-4, 0.4, 2);
    carrier.add(ciws);
    
    // 声呐
    sonar = new THREE.Object3D();
    const sonarGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sonarMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.3 });
    const sonarMesh = new THREE.Mesh(sonarGeometry, sonarMaterial);
    sonar.add(sonarMesh);
    sonar.position.set(0, -2, 0);
    carrier.add(sonar);
    sonar.visible = false;
    
    // 舰载机
    const aircraftGeometry = new THREE.BoxGeometry(1, 0.2, 0.8);
    const aircraftMaterial = new THREE.MeshPhongMaterial({ color: 0x00aaff });
    aircraft = new THREE.Mesh(aircraftGeometry, aircraftMaterial);
    aircraft.position.set(0, 0.4, 0);
    carrier.add(aircraft);
    
    // 导弹
    const missileGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16);
    const missileMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    missile = new THREE.Mesh(missileGeometry, missileMaterial);
    missile.position.set(-3, 0.4, 0);
    carrier.add(missile);
}

// 创建水面效果
function createWater() {
    const waterGeometry = new THREE.PlaneGeometry(100, 100);
    const waterMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4169E1, 
        transparent: true, 
        opacity: 0.7, 
        side: THREE.DoubleSide 
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.3;
    scene.add(water);
}

// 窗口大小变化处理
function onWindowResize() {
    camera.aspect = (window.innerWidth - 320) / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth - 320, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    // 旋转雷达
    if (radarRotating && radar) {
        radar.rotation.y += 0.05;
    }
    
    // 近防系统旋转
    if (ciwsActive && ciws) {
        ciws.rotation.y += 0.1;
    }
    
    // 声呐脉冲效果
    if (sonarActive && sonar) {
        const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
        sonar.scale.set(scale, scale, scale);
    }
    
    // 导弹飞行
    updateMissiles();
    
    controls.update();
    renderer.render(scene, camera);
}

// 更新导弹位置
function updateMissiles() {
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        missile.position.y += 0.2;
        missile.position.z += 0.3;
        
        // 导弹飞出视野后移除
        if (missile.position.y > 20) {
            scene.remove(missile);
            missiles.splice(i, 1);
        }
    }
}

// 改变航母状态
function changeStatus(status) {
    if (!carrier) return;
    
    // 改变航母灯光颜色
    carrier.traverse(function (child) {
        if (child.material) {
            if (status === 'normal') {
                if (child === radar) {
                    child.material.color.set(0x00aaff);
                }
            } else if (status === 'alert') {
                if (child === radar) {
                    child.material.color.set(0xffff00);
                }
            } else if (status === 'combat') {
                if (child === radar) {
                    child.material.color.set(0xff0000);
                }
            }
        }
    });
}

// 切换舰载机状态
function toggleAircraft(action) {
    if (!aircraft) return;
    
    if (action === 'show') {
        aircraft.visible = true;
    } else if (action === 'hide') {
        aircraft.visible = false;
    }
}

// 起飞舰载机
function launchAircraft() {
    if (!aircraft) return;
    
    // 简单的起飞动画
    let position = 0;
    const interval = setInterval(() => {
        position += 0.1;
        aircraft.position.y = position;
        aircraft.position.z = position * 2;
        
        if (position > 5) {
            clearInterval(interval);
            // 重置位置
            setTimeout(() => {
                aircraft.position.y = 0.4;
                aircraft.position.z = 0;
            }, 2000);
        }
    }, 50);
}

// 回收舰载机
function recoverAircraft() {
    if (!aircraft) return;
    
    // 简单的回收动画
    aircraft.position.y = 5;
    aircraft.position.z = 10;
    
    let position = 10;
    const interval = setInterval(() => {
        position -= 0.1;
        aircraft.position.y = 5 - (position / 2);
        aircraft.position.z = position;
        
        if (position < 0) {
            clearInterval(interval);
            aircraft.position.y = 0.4;
            aircraft.position.z = 0;
        }
    }, 50);
}

// 发射导弹
function fireMissile() {
    if (!missile) return;
    
    // 创建导弹实例
    const missileGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16);
    const missileMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    const newMissile = new THREE.Mesh(missileGeometry, missileMaterial);
    newMissile.position.copy(missile.position);
    newMissile.rotation.copy(missile.rotation);
    scene.add(newMissile);
    missiles.push(newMissile);
    
    // 播放发射动画
    let scale = 1;
    const interval = setInterval(() => {
        scale *= 0.95;
        missile.scale.set(scale, scale, scale);
        
        if (scale < 0.1) {
            clearInterval(interval);
            missile.scale.set(1, 1, 1);
        }
    }, 20);
}

// 切换近防系统
function toggleCIWS() {
    ciwsActive = !ciwsActive;
    if (ciws) {
        ciws.material.color.set(ciwsActive ? 0xff0000 : 0x888888);
    }
}

// 激活电子对抗
function activateECM() {
    ecmActive = !ecmActive;
    
    // 创建电子对抗效果
    if (ecmActive) {
        const ecmGeometry = new THREE.SphereGeometry(3, 32, 32);
        const ecmMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffff00, 
            transparent: true, 
            opacity: 0.3 
        });
        const ecm = new THREE.Mesh(ecmGeometry, ecmMaterial);
        ecm.position.copy(carrier.position);
        scene.add(ecm);
        
        // 动画效果
        let scale = 1;
        const interval = setInterval(() => {
            scale += 0.05;
            ecm.scale.set(scale, scale, scale);
            ecm.material.opacity = 0.3 / scale;
            
            if (scale > 5) {
                clearInterval(interval);
                scene.remove(ecm);
            }
        }, 50);
    }
}

// 切换雷达状态
function toggleRadar(action) {
    if (action === 'start') {
        radarRotating = true;
        if (radar) {
            radar.material.color.set(0x00aaff);
        }
    } else if (action === 'stop') {
        radarRotating = false;
        if (radar) {
            radar.material.color.set(0x666666);
        }
    }
}

// 切换声呐系统
function toggleSonar() {
    sonarActive = !sonarActive;
    if (sonar) {
        sonar.visible = sonarActive;
    }
}

// 编队控制
function formFormation(type) {
    // 这里可以实现不同编队的逻辑
    console.log(`Formation: ${type}`);
    
    // 简单的编队动画效果
    let angle = 0;
    const interval = setInterval(() => {
        angle += 0.05;
        
        if (type === 'wedge') {
            // 楔形编队
            carrier.position.x = Math.sin(angle) * 2;
            carrier.position.z = Math.cos(angle) * 2;
        } else if (type === 'line') {
            // 线性编队
            carrier.position.x = Math.sin(angle) * 3;
            carrier.position.z = 0;
        } else if (type === 'circle') {
            // 环形编队
            carrier.position.x = Math.sin(angle) * 4;
            carrier.position.z = Math.cos(angle) * 4;
        }
        
        if (angle > Math.PI * 2) {
            clearInterval(interval);
            carrier.position.set(0, 0, 0);
        }
    }, 50);
}

// 初始化
window.onload = init;