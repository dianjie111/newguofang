#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
主窗口模块
实现系统的主要用户界面
"""

import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import cv2
import numpy as np
from modules.detection import ObjectDetector
from modules.threat import ThreatAssessor
from modules.suggestion import SuggestionGenerator
from modules.logger import Logger


class MainWindow:
    """主窗口类"""
    
    def __init__(self, root):
        """
        初始化主窗口
        
        Args:
            root: Tkinter根窗口
        """
        self.root = root
        self.image = None
        self.detections = []
        self.threat_level = 'none'
        self.threat_score = 0.0
        self.suggestions = []
        
        # 初始化模块
        self.detector = ObjectDetector()
        self.assessor = ThreatAssessor()
        self.generator = SuggestionGenerator()
        self.logger = Logger()
        
        # 创建界面
        self.create_widgets()
    
    def create_widgets(self):
        """创建界面组件"""
        # 主框架
        main_frame = tk.Frame(self.root, padx=10, pady=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 顶部按钮区域
        button_frame = tk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=5)
        
        # 上传图像按钮
        upload_btn = tk.Button(button_frame, text="上传图像", command=self.upload_image, width=15)
        upload_btn.pack(side=tk.LEFT, padx=5)
        
        # 分析按钮
        analyze_btn = tk.Button(button_frame, text="分析图像", command=self.analyze_image, width=15)
        analyze_btn.pack(side=tk.LEFT, padx=5)
        
        # 查看日志按钮
        log_btn = tk.Button(button_frame, text="查看日志", command=self.view_logs, width=15)
        log_btn.pack(side=tk.LEFT, padx=5)
        
        # 位置输入
        location_frame = tk.Frame(button_frame)
        location_frame.pack(side=tk.RIGHT, padx=5)
        
        tk.Label(location_frame, text="位置:").pack(side=tk.LEFT)
        self.location_var = tk.StringVar()
        location_entry = tk.Entry(location_frame, textvariable=self.location_var, width=20)
        location_entry.pack(side=tk.LEFT)
        
        # 中间显示区域
        display_frame = tk.Frame(main_frame)
        display_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # 图像显示区域
        image_frame = tk.Frame(display_frame, borderwidth=1, relief=tk.SUNKEN)
        image_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        self.image_label = tk.Label(image_frame, text="请上传图像", bg="#f0f0f0", relief=tk.SUNKEN)
        self.image_label.pack(fill=tk.BOTH, expand=True)
        
        # 结果显示区域
        result_frame = tk.Frame(display_frame, width=300, borderwidth=1, relief=tk.SUNKEN)
        result_frame.pack(side=tk.RIGHT, fill=tk.BOTH, padx=5)
        result_frame.pack_propagate(False)
        
        # 威胁等级显示
        threat_frame = tk.Frame(result_frame, pady=10)
        threat_frame.pack(fill=tk.X, padx=10)
        
        tk.Label(threat_frame, text="威胁等级:", font=('Arial', 10, 'bold')).pack(anchor=tk.W)
        self.threat_var = tk.StringVar(value="未分析")
        self.threat_label = tk.Label(threat_frame, textvariable=self.threat_var, fg="blue")
        self.threat_label.pack(anchor=tk.W, pady=2)
        
        # 威胁分数显示
        score_frame = tk.Frame(result_frame, pady=10)
        score_frame.pack(fill=tk.X, padx=10)
        
        tk.Label(score_frame, text="威胁分数:", font=('Arial', 10, 'bold')).pack(anchor=tk.W)
        self.score_var = tk.StringVar(value="0.0")
        score_label = tk.Label(score_frame, textvariable=self.score_var)
        score_label.pack(anchor=tk.W, pady=2)
        
        # 处置建议显示
        suggestion_frame = tk.Frame(result_frame, pady=10)
        suggestion_frame.pack(fill=tk.BOTH, expand=True, padx=10)
        
        tk.Label(suggestion_frame, text="处置建议:", font=('Arial', 10, 'bold')).pack(anchor=tk.W)
        
        self.suggestion_text = tk.Text(suggestion_frame, height=10, wrap=tk.WORD)
        self.suggestion_text.pack(fill=tk.BOTH, expand=True, pady=2)
        self.suggestion_text.insert(tk.END, "请上传并分析图像")
        self.suggestion_text.config(state=tk.DISABLED)
    
    def upload_image(self):
        """上传图像"""
        file_path = filedialog.askopenfilename(
            filetypes=[("Image files", "*.jpg *.jpeg *.png *.bmp"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                # 读取图像
                self.image = cv2.imread(file_path)
                if self.image is None:
                    messagebox.showerror("错误", "无法读取图像文件")
                    return
                
                # 显示图像
                self._display_image(self.image)
                
                # 重置结果
                self.detections = []
                self.threat_level = 'none'
                self.threat_score = 0.0
                self.suggestions = []
                
                self.threat_var.set("未分析")
                self.score_var.set("0.0")
                
                self.suggestion_text.config(state=tk.NORMAL)
                self.suggestion_text.delete(1.0, tk.END)
                self.suggestion_text.insert(tk.END, "请点击分析图像按钮")
                self.suggestion_text.config(state=tk.DISABLED)
                
            except Exception as e:
                messagebox.showerror("错误", f"上传图像时出错: {e}")
    
    def analyze_image(self):
        """分析图像"""
        if self.image is None:
            messagebox.showinfo("提示", "请先上传图像")
            return
        
        try:
            # 目标检测
            self.detections = self.detector.detect(self.image)
            
            # 威胁评估
            self.threat_level, self.threat_score = self.assessor.assess_threat(self.detections)
            
            # 生成处置建议
            location = self.location_var.get() if self.location_var.get() else None
            self.suggestions = self.generator.generate_suggestions(
                self.threat_level, self.detections, location
            )
            
            # 显示结果
            self._display_results()
            
            # 记录日志
            self.logger.log_analysis(
                self.image, self.detections, self.threat_level, 
                self.threat_score, self.suggestions, location
            )
            
        except Exception as e:
            messagebox.showerror("错误", f"分析图像时出错: {e}")
    
    def view_logs(self):
        """查看日志"""
        logs = self.logger.get_logs()
        
        if not logs:
            messagebox.showinfo("提示", "暂无日志记录")
            return
        
        # 创建日志查看窗口
        log_window = tk.Toplevel(self.root)
        log_window.title("日志记录")
        log_window.geometry("800x600")
        
        # 创建列表框
        log_listbox = tk.Listbox(log_window, width=100, height=20)
        log_listbox.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 填充日志列表
        for i, log in enumerate(logs):
            timestamp = log['timestamp']
            threat_level = log['threat_level']
            location = log.get('location', '未知位置')
            log_listbox.insert(tk.END, f"{i+1}. {timestamp} - {location} - 威胁等级: {threat_level}")
        
        # 查看详情按钮
        def view_details():
            selected = log_listbox.curselection()
            if not selected:
                return
            
            log = logs[selected[0]]
            
            # 创建详情窗口
            detail_window = tk.Toplevel(log_window)
            detail_window.title("日志详情")
            detail_window.geometry("600x400")
            
            # 显示详情
            detail_text = tk.Text(detail_window, wrap=tk.WORD)
            detail_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            
            detail_text.insert(tk.END, f"时间: {log['timestamp']}\n")
            detail_text.insert(tk.END, f"位置: {log.get('location', '未知位置')}\n")
            detail_text.insert(tk.END, f"威胁等级: {log['threat_level']}\n")
            detail_text.insert(tk.END, f"威胁分数: {log['threat_score']}\n\n")
            
            detail_text.insert(tk.END, "检测结果:\n")
            for detection in log['detections']:
                detail_text.insert(tk.END, f"- {detection['class']}: 置信度 {detection['confidence']:.2f}\n")
            
            detail_text.insert(tk.END, "\n处置建议:\n")
            for suggestion in log['suggestions']:
                detail_text.insert(tk.END, f"- {suggestion}\n")
            
            detail_text.config(state=tk.DISABLED)
        
        view_btn = tk.Button(log_window, text="查看详情", command=view_details)
        view_btn.pack(pady=10)
    
    def _display_image(self, image):
        """显示图像"""
        # 调整图像大小以适应窗口
        h, w = image.shape[:2]
        max_size = 500
        if w > max_size or h > max_size:
            scale = min(max_size / w, max_size / h)
            new_w = int(w * scale)
            new_h = int(h * scale)
            image = cv2.resize(image, (new_w, new_h))
        
        # 转换为RGB格式
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # 转换为PIL图像
        pil_image = Image.fromarray(image_rgb)
        
        # 转换为Tkinter图像
        tk_image = ImageTk.PhotoImage(pil_image)
        
        # 更新标签
        self.image_label.config(image=tk_image, text="")
        self.image_label.image = tk_image  # 保持引用
    
    def _display_results(self):
        """显示分析结果"""
        # 显示检测结果
        if self.detections:
            image_with_detections = self.detector.draw_detections(self.image, self.detections)
            self._display_image(image_with_detections)
        
        # 显示威胁等级
        threat_color = {
            'high': 'red',
            'medium': 'orange',
            'low': 'yellow',
            'none': 'green'
        }.get(self.threat_level, 'black')
        
        threat_text = {
            'high': '高',
            'medium': '中等',
            'low': '低',
            'none': '无'
        }.get(self.threat_level, '未知')
        
        self.threat_var.set(threat_text)
        self.threat_label.config(fg=threat_color)
        
        # 显示威胁分数
        self.score_var.set(f"{self.threat_score:.2f}")
        
        # 显示处置建议
        self.suggestion_text.config(state=tk.NORMAL)
        self.suggestion_text.delete(1.0, tk.END)
        
        if self.suggestions:
            for i, suggestion in enumerate(self.suggestions, 1):
                self.suggestion_text.insert(tk.END, f"{i}. {suggestion}\n")
        else:
            self.suggestion_text.insert(tk.END, "无建议")
        
        self.suggestion_text.config(state=tk.DISABLED)
