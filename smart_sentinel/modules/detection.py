#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
目标检测与分类模块
使用OpenCV进行图像分析，识别目标类型
"""

import cv2
import numpy as np


class ObjectDetector:
    """目标检测器类"""
    
    def __init__(self):
        """初始化检测器"""
        # 加载预训练模型
        self.net = cv2.dnn.readNetFromCaffe(
            'models/MobileNetSSD_deploy.prototxt',
            'models/MobileNetSSD_deploy.caffemodel'
        )
        
        # 类别标签
        self.classes = [
            'background', 'aeroplane', 'bicycle', 'bird', 'boat',
            'bottle', 'bus', 'car', 'cat', 'chair', 'cow',
            'diningtable', 'dog', 'horse', 'motorbike', 'person',
            'pottedplant', 'sheep', 'sofa', 'train', 'tvmonitor'
        ]
        
        # 颜色映射
        self.colors = np.random.uniform(0, 255, size=(len(self.classes), 3))
    
    def detect(self, image):
        """
        检测图像中的目标
        
        Args:
            image: 输入图像
            
        Returns:
            检测结果列表，每个元素包含：类别、置信度、边界框
        """
        try:
            # 获取图像尺寸
            (h, w) = image.shape[:2]
            
            # 预处理图像
            blob = cv2.dnn.blobFromImage(
                cv2.resize(image, (300, 300)), 0.007843, (300, 300), 127.5
            )
            
            # 前向传播
            self.net.setInput(blob)
            detections = self.net.forward()
            
            # 处理检测结果
            results = []
            for i in range(detections.shape[2]):
                confidence = detections[0, 0, i, 2]
                
                # 过滤低置信度结果
                if confidence > 0.5:
                    class_id = int(detections[0, 0, i, 1])
                    class_name = self.classes[class_id]
                    
                    # 计算边界框
                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    (startX, startY, endX, endY) = box.astype('int')
                    
                    # 添加到结果列表
                    results.append({
                        'class': class_name,
                        'confidence': float(confidence),
                        'box': (startX, startY, endX, endY)
                    })
            
            return results
        except Exception as e:
            print(f"检测过程中出错: {e}")
            return []
    
    def draw_detections(self, image, detections):
        """
        在图像上绘制检测结果
        
        Args:
            image: 输入图像
            detections: 检测结果
            
        Returns:
            绘制后的图像
        """
        image_copy = image.copy()
        
        for detection in detections:
            class_name = detection['class']
            confidence = detection['confidence']
            (startX, startY, endX, endY) = detection['box']
            
            # 绘制边界框
            color = self.colors[self.classes.index(class_name)]
            cv2.rectangle(image_copy, (startX, startY), (endX, endY), color, 2)
            
            # 绘制标签
            label = f"{class_name}: {confidence:.2f}"
            y = startY - 10 if startY - 10 > 10 else startY + 10
            cv2.putText(image_copy, label, (startX, y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        return image_copy
