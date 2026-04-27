#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日志记录与保存模块
保存每次分析的时间、图片、结果，便于追溯
"""

import os
import json
import datetime
import cv2


class Logger:
    """日志记录器类"""
    
    def __init__(self, log_dir='logs'):
        """
        初始化日志记录器
        
        Args:
            log_dir: 日志存储目录
        """
        self.log_dir = log_dir
        self.image_dir = os.path.join(log_dir, 'images')
        
        # 创建目录
        os.makedirs(self.log_dir, exist_ok=True)
        os.makedirs(self.image_dir, exist_ok=True)
    
    def log_analysis(self, image, detections, threat_level, threat_score, suggestions, location=None):
        """
        记录分析结果
        
        Args:
            image: 分析的图像
            detections: 检测结果
            threat_level: 威胁等级
            threat_score: 威胁分数
            suggestions: 处置建议
            location: 位置信息（可选）
            
        Returns:
            日志文件路径
        """
        # 生成时间戳
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # 保存图像
        image_filename = f'{timestamp}.jpg'
        image_path = os.path.join(self.image_dir, image_filename)
        cv2.imwrite(image_path, image)
        
        # 构建日志数据
        log_data = {
            'timestamp': datetime.datetime.now().isoformat(),
            'image_path': image_filename,
            'location': location,
            'detections': detections,
            'threat_level': threat_level,
            'threat_score': float(threat_score),
            'suggestions': suggestions
        }
        
        # 保存日志文件
        log_filename = f'{timestamp}.json'
        log_path = os.path.join(self.log_dir, log_filename)
        
        with open(log_path, 'w', encoding='utf-8') as f:
            json.dump(log_data, f, ensure_ascii=False, indent=2)
        
        return log_path
    
    def get_logs(self, limit=10):
        """
        获取最近的日志
        
        Args:
            limit: 返回的日志数量限制
            
        Returns:
            日志列表
        """
        # 获取所有日志文件
        log_files = [f for f in os.listdir(self.log_dir) if f.endswith('.json')]
        
        # 按时间戳排序
        log_files.sort(reverse=True)
        
        # 读取日志数据
        logs = []
        for log_file in log_files[:limit]:
            log_path = os.path.join(self.log_dir, log_file)
            try:
                with open(log_path, 'r', encoding='utf-8') as f:
                    log_data = json.load(f)
                    log_data['log_file'] = log_file
                    logs.append(log_data)
            except Exception as e:
                print(f"读取日志文件 {log_file} 时出错: {e}")
        
        return logs
    
    def get_log_image(self, image_filename):
        """
        获取日志对应的图像
        
        Args:
            image_filename: 图像文件名
            
        Returns:
            图像数据，如果文件不存在返回None
        """
        image_path = os.path.join(self.image_dir, image_filename)
        if os.path.exists(image_path):
            return cv2.imread(image_path)
        return None
