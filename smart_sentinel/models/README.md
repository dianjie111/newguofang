# 模型说明

## 目标检测模型

本系统使用 MobileNetSSD 模型进行目标检测，这是一个轻量级的目标检测模型，适合在普通办公电脑上运行。

### 模型文件

需要以下两个文件：
1. `MobileNetSSD_deploy.prototxt` - 模型结构文件
2. `MobileNetSSD_deploy.caffemodel` - 模型权重文件

### 下载方法

可以从以下链接下载预训练模型：
- [MobileNetSSD_deploy.prototxt](https://github.com/chuanqi305/MobileNet-SSD/blob/master/deploy.prototxt)
- [MobileNetSSD_deploy.caffemodel](https://github.com/chuanqi305/MobileNet-SSD/releases/download/v1.0/MobileNetSSD_deploy.caffemodel)

### 支持的目标类别

模型支持检测以下20种目标：
- background
- aeroplane
- bicycle
- bird
- boat
- bottle
- bus
- car
- cat
- chair
- cow
- diningtable
- dog
- horse
- motorbike
- person
- pottedplant
- sheep
- sofa
- train
- tvmonitor
