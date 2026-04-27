# 3D航母建模与网页展示项目方案

## 一、项目架构

### 整体架构
```
┌─────────────────────────────────────────────────┐
│                  网页前端                        │
│  ┌─────────────────┐      ┌─────────────────┐  │
│  │   航母3D展示区   │  ←→  │   控制面板       │  │
│  │  (Three.js)     │      │  (HTML/CSS/JS)  │  │
│  └─────────────────┘      └─────────────────┘  │
│                              ↓                 │
│                         前端交互逻辑            │
│                              ↓                 │
│                     3D航母状态变化              │
└─────────────────────────────────────────────────┘
```

### 技术栈
| 层面 | 技术 | 作用 |
|------|------|------|
| 3D展示 | Three.js | 在网页中显示可交互的航母3D模型 |
| 3D建模 | Blender / SketchUp | 建立航母模型，导出为.gltf或.glb格式 |
| 网页结构 | HTML + CSS | 页面布局、样式 |
| 业务逻辑 | JavaScript | 用户交互、控制3D模型状态 |

## 二、项目文件结构
```
your-project/
├── index.html          # 主页面
├── model/
│   └── carrier.glb     # 航母模型文件
└── js/
    └── main.js         # 脚本文件
```

## 三、核心实现步骤

### 1. 3D建模与模型准备
- **导出格式**：推荐使用.glb或.gltf格式（专为WebGL设计，高效轻量）
- **导出注意事项**：
  - Blender中启用Import-Export: glTF 2.0 format插件
  - 格式选择glTF Binary (.glb)
  - 变换方向选择Y Up（Three.js默认Y轴向上）
- **模型资源**：
  - CG美术之家：提供现成航母模型，约3-13MB
  - Sketchfab：国际主流平台，模型质量高，部分免费

### 2. Three.js网页实现
- **场景搭建**：创建Three.js场景、相机和渲染器
- **模型加载**：使用GLTFLoader加载航母模型
- **交互控制**：添加轨道控制，支持旋转、缩放和平移
- **光源配置**：设置环境光和方向光，增强3D效果
- **响应式设计**：适配不同屏幕尺寸

### 3. 模型与网页联动机制
- **联动方式**：
  - 更换纹理/颜色：航母甲板灯光变红/变黄
  - 显示/隐藏物体：显示预警机起飞、防空导弹升起
  - 旋转/移动物体：雷达旋转、舰载机移动到弹射位
  - 切换模型状态：替换为"战备状态"模型
- **推荐方案**：使用更换纹理/颜色 + 显示/隐藏物体的组合，效果足够好且实现难度适中

### 4. 部署与运行
- **本地服务器**：
  - Python：`python -m http.server`
  - Node.js：`npx http-server`
- **访问方式**：浏览器打开 `http://localhost:8000`
- **兼容性**：支持Chrome、Firefox、Edge等现代浏览器

## 四、核心代码示例

### index.html
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D航母展示</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }
        #container {
            display: flex;
            height: 100vh;
        }
        #canvas-container {
            flex: 1;
            position: relative;
        }
        #control-panel {
            width: 300px;
            background-color: #333;
            color: white;
            padding: 20px;
            overflow-y: auto;
        }
        #control-panel h2 {
            margin-bottom: 20px;
            text-align: center;
        }
        .control-group {
            margin-bottom: 20px;
        }
        .control-group label {
            display: block;
            margin-bottom: 5px;
        }
        .control-group button {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .control-group button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="canvas-container"></div>
        <div id="control-panel">
            <h2>航母控制</h2>
            <div class="control-group">
                <label>灯光状态</label>
                <button onclick="changeLight('green')">正常状态</button>
                <button onclick="changeLight('yellow')">警戒状态</button>
                <button onclick="changeLight('red')">战斗状态</button>
            </div>
            <div class="control-group">
                <label>舰载机状态</label>
                <button onclick="toggleAircraft('show')">显示舰载机</button>
                <button onclick="toggleAircraft('hide')">隐藏舰载机</button>
                <button onclick="launchAircraft()">起飞舰载机</button>
            </div>
            <div class="control-group">
                <label>雷达状态</label>
                <button onclick="toggleRadar('start')">启动雷达</button>
                <button onclick="toggleRadar('stop')">停止雷达</button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/GLTFLoader.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### js/main.js
```javascript
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
```

## 五、项目亮点
- **视觉冲击力**：Three.js实时3D效果，可交互旋转、缩放
- **国防科技感**：航母模型本身就是国防象征，结合3D效果更具震撼力
- **纯前端实现**：无需后端服务器，浏览器打开即可运行
- **交互性强**：通过控制面板可以控制航母的各种状态
- **扩展性好**：可根据需要添加更多交互功能和视觉效果

## 六、实施建议
1. **准备模型**：使用Blender建模或下载现成模型，导出为.glb格式
2. **创建文件**：按照文件结构创建index.html和js/main.js文件
3. **加载模型**：将航母模型放在model目录下，命名为carrier.glb
4. **启动服务器**：在项目目录下运行本地服务器
5. **测试运行**：浏览器打开 `http://localhost:8000` 查看效果
6. **优化调整**：根据测试结果调整模型和交互效果

通过以上步骤，你可以完成一个纯前端的3D航母网页展示项目，展现国防科技感和创新能力。