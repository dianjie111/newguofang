# 3D航母展示项目

## 项目结构

```
carrier-3d-web/
├── index.html          # 主页面
├── css/
│   └── style.css       # CSS样式文件
├── js/
│   └── main.js         # JavaScript脚本文件
└── model/
    └── carrier.glb     # 航母模型文件（需要自行添加）
```

## 运行方法

1. **准备模型文件**：
   - 在Blender中创建航母模型并导出为.glb格式
   - 或从CG美术之家、Sketchfab等网站下载现成的航母模型
   - 将模型文件命名为`carrier.glb`并放入`model`目录

2. **启动本地服务器**：
   - 使用Python：`python -m http.server`
   - 或使用Node.js：`npx http-server`

3. **访问项目**：
   - 浏览器打开 `http://localhost:8000`

## 功能说明

- **灯光控制**：可以切换航母的灯光状态（正常、警戒、战斗）
- **舰载机控制**：可以显示/隐藏舰载机，以及控制舰载机起飞
- **雷达控制**：可以启动/停止雷达旋转
- **模型交互**：可以通过鼠标旋转、缩放和平移模型

## 技术栈

- **前端**：HTML5, CSS3, JavaScript
- **3D渲染**：Three.js
- **模型格式**：GLB (glTF Binary)

## 注意事项

- 确保模型文件路径正确：`model/carrier.glb`
- 使用现代浏览器访问（Chrome, Firefox, Edge）
- 本地服务器需要正确配置，确保能够加载模型文件