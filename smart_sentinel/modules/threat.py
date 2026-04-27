#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
威胁等级评估模块
根据目标类型、数量、时间等因素评估威胁等级
"""

import datetime


class ThreatAssessor:
    """威胁评估器类"""
    
    def __init__(self):
        """初始化威胁评估器"""
        # 目标威胁权重
        self.target_weights = {
            'person': 2.0,
            'car': 1.5,
            'bus': 1.8,
            'motorbike': 1.2,
            'bicycle': 0.8,
            'bird': 0.2,
            'cat': 0.2,
            'dog': 0.3,
            'cow': 0.4,
            'horse': 0.4,
            'sheep': 0.3,
            'aeroplane': 1.0,
            'boat': 0.9,
            'bottle': 0.1,
            'chair': 0.1,
            'diningtable': 0.1,
            'pottedplant': 0.1,
            'sofa': 0.1,
            'train': 1.0,
            'tvmonitor': 0.1
        }
        
        # 时间权重
        self.time_weights = {
            'night': 1.5,  # 夜间
            'dawn': 1.3,   # 黎明
            'dusk': 1.3,   # 黄昏
            'day': 1.0     # 白天
        }
    
    def get_time_period(self):
        """
        获取当前时间所属的时间段
        
        Returns:
            时间段字符串: 'night', 'dawn', 'dusk', 'day'
        """
        now = datetime.datetime.now()
        hour = now.hour
        
        if 0 <= hour < 6:
            return 'night'
        elif 6 <= hour < 9:
            return 'dawn'
        elif 17 <= hour < 20:
            return 'dusk'
        else:
            return 'day'
    
    def assess_threat(self, detections):
        """
        评估威胁等级
        
        Args:
            detections: 检测结果列表
            
        Returns:
            威胁等级: 'high', 'medium', 'low', 'none'
            威胁分数: 用于排序和参考
        """
        if not detections:
            return 'none', 0.0
        
        # 计算目标威胁分数
        target_score = 0.0
        person_count = 0
        vehicle_count = 0
        
        for detection in detections:
            class_name = detection['class']
            confidence = detection['confidence']
            
            # 计算单个目标的威胁分数
            weight = self.target_weights.get(class_name, 0.1)
            target_score += weight * confidence
            
            # 统计人员和车辆数量
            if class_name == 'person':
                person_count += 1
            elif class_name in ['car', 'bus', 'motorbike']:
                vehicle_count += 1
        
        # 获取时间权重
        time_period = self.get_time_period()
        time_weight = self.time_weights.get(time_period, 1.0)
        
        # 计算最终威胁分数
        final_score = target_score * time_weight
        
        # 根据分数确定威胁等级
        if final_score >= 5.0 or (person_count >= 3) or (vehicle_count >= 2):
            return 'high', final_score
        elif final_score >= 2.0 or (person_count >= 1) or (vehicle_count >= 1):
            return 'medium', final_score
        elif final_score >= 0.5:
            return 'low', final_score
        else:
            return 'none', final_score
    
    def get_threat_description(self, threat_level, detections):
        """
        获取威胁等级的描述
        
        Args:
            threat_level: 威胁等级
            detections: 检测结果列表
            
        Returns:
            威胁描述字符串
        """
        if threat_level == 'none':
            return '未发现明显威胁'
        
        # 统计目标数量
        target_counts = {}
        for detection in detections:
            class_name = detection['class']
            if class_name in target_counts:
                target_counts[class_name] += 1
            else:
                target_counts[class_name] = 1
        
        # 构建描述
        description_parts = []
        for class_name, count in target_counts.items():
            if count == 1:
                description_parts.append(f"1个{self._get_chinese_name(class_name)}")
            else:
                description_parts.append(f"{count}个{self._get_chinese_name(class_name)}")
        
        targets_desc = '，'.join(description_parts)
        
        if threat_level == 'high':
            return f"发现{targets_desc}，威胁等级高"
        elif threat_level == 'medium':
            return f"发现{targets_desc}，威胁等级中等"
        elif threat_level == 'low':
            return f"发现{targets_desc}，威胁等级低"
        else:
            return '威胁等级未知'
    
    def _get_chinese_name(self, class_name):
        """
        获取目标类别的中文名称
        
        Args:
            class_name: 英文类别名称
            
        Returns:
            中文类别名称
        """
        chinese_names = {
            'person': '人员',
            'car': '汽车',
            'bus': '公交车',
            'motorbike': '摩托车',
            'bicycle': '自行车',
            'bird': '鸟类',
            'cat': '猫',
            'dog': '狗',
            'cow': '牛',
            'horse': '马',
            'sheep': '羊',
            'aeroplane': '飞机',
            'boat': '船只',
            'bottle': '瓶子',
            'chair': '椅子',
            'diningtable': '餐桌',
            'pottedplant': '盆栽',
            'sofa': '沙发',
            'train': '火车',
            'tvmonitor': '显示器'
        }
        return chinese_names.get(class_name, class_name)
