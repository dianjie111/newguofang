// 全局变量
let scene, camera, renderer, controls;
let carrier, aircraft, radar;
let radarRotating = false;

// 初始化函数
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth - 300, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // 添加轨道控制
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
    
    // 加载航母模型
    const loader = new THREE.GLTFLoader();
    loader.load(
        'model/carrier.glb',
        function (gltf) {
            carrier = gltf.scene;
            scene.add(carrier);
            
            // 调整模型位置和缩放
            carrier.position.set(0, 0, 0);
            carrier.scale.set(0.5, 0.5, 0.5);
            
            // 查找舰载机和雷达
            carrier.traverse(function (child) {
                if (child.name === 'aircraft') {
                    aircraft = child;
                }
                if (child.name === 'radar') {
                    radar = child;
                }
            });
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened', error);
        }
    );
    
    // 添加地面
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x4169E1, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);
    
    // 响应窗口大小变化
    window.addEventListener('resize', onWindowResize, false);
    
    // 开始动画循环
    animate();
}

// 窗口大小变化处理
function onWindowResize() {
    camera.aspect = (window.innerWidth - 300) / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth - 300, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    // 旋转雷达
    if (radarRotating && radar) {
        radar.rotation.y += 0.05;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// 改变灯光状态
function changeLight(status) {
    if (!carrier) return;
    
    carrier.traverse(function (child) {
        if (child.name === 'light') {
            if (status === 'green') {
                child.material.color.set(0x00ff00);
            } else if (status === 'yellow') {
                child.material.color.set(0xffff00);
            } else if (status === 'red') {
                child.material.color.set(0xff0000);
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
                aircraft.position.y = 0;
                aircraft.position.z = 0;
            }, 2000);
        }
    }, 50);
}

// 切换雷达状态
function toggleRadar(action) {
    if (action === 'start') {
        radarRotating = true;
    } else if (action === 'stop') {
        radarRotating = false;
    }
}

// 初始化
window.onload = init;