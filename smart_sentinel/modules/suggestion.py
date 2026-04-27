#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
处置建议输出模块
根据威胁等级生成具体行动建议
"""


class SuggestionGenerator:
    """处置建议生成器类"""
    
    def __init__(self):
        """初始化建议生成器"""
        # 不同威胁等级的建议模板
        self.suggestions = {
            'high': [
                '立即派员核查',
                '启动应急响应机制',
                '加强周边警戒',
                '准备应对可能的突发事件',
                '向上级报告情况'
            ],
            'medium': [
                '持续观察目标动向',
                '做好警戒准备',
                '必要时派员核查',
                '记录目标特征和数量'
            ],
            'low': [
                '保持关注',
                '定期巡查',
                '记录观察情况'
            ],
            'none': [
                '继续正常警戒',
                '定期巡查'
            ]
        }
    
    def generate_suggestions(self, threat_level, detections, location=None):
        """
        生成处置建议
        
        Args:
            threat_level: 威胁等级
            detections: 检测结果列表
            location: 位置信息（可选）
            
        Returns:
            建议列表
        """
        base_suggestions = self.suggestions.get(threat_level, self.suggestions['none'])
        
        # 根据目标类型和数量添加特定建议
        specific_suggestions = self._get_specific_suggestions(detections, location)
        
        # 合并建议，去重
        all_suggestions = base_suggestions + specific_suggestions
        unique_suggestions = []
        seen = set()
        for suggestion in all_suggestions:
            if suggestion not in seen:
                seen.add(suggestion)
                unique_suggestions.append(suggestion)
        
        return unique_suggestions
    
    def _get_specific_suggestions(self, detections, location):
        """
        根据目标类型和数量生成特定建议
        
        Args:
            detections: 检测结果列表
            location: 位置信息
            
        Returns:
            特定建议列表
        """
        suggestions = []
        
        # 统计目标数量
        target_counts = {}
        for detection in detections:
            class_name = detection['class']
            if class_name in target_counts:
                target_counts[class_name] += 1
            else:
                target_counts[class_name] = 1
        
        # 针对人员的建议
        if 'person' in target_counts:
            person_count = target_counts['person']
            if person_count >= 3:
                suggestions.append('注意人员聚集情况，可能存在群体性活动')
            elif person_count >= 1:
                suggestions.append('观察人员行为特征，确认是否有异常举动')
        
        # 针对车辆的建议
        vehicle_count = 0
        for vehicle in ['car', 'bus', 'motorbike']:
            if vehicle in target_counts:
                vehicle_count += target_counts[vehicle]
        
        if vehicle_count >= 2:
            suggestions.append('注意车辆集群情况，可能存在协同行动')
        elif vehicle_count >= 1:
            suggestions.append('记录车辆特征和牌照信息')
        
        # 针对位置的建议
        if location:
            suggestions.append(f'重点关注{location}方向的目标动向')
        
        return suggestions
    
    def format_suggestions(self, suggestions):
        """
        格式化建议为可读字符串
        
        Args:
            suggestions: 建议列表
            
        Returns:
            格式化后的建议字符串
        """
        if not suggestions:
            return '无建议'
        
        formatted = '处置建议：\n'
        for i, suggestion in enumerate(suggestions, 1):
            formatted += f'{i}. {suggestion}\n'
        
        return formatted
