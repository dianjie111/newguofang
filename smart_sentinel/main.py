#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
边境 / 重要设施智能哨兵模拟系统
主程序入口
"""

import tkinter as tk
from ui.main_window import MainWindow


def main():
    """主函数"""
    try:
        root = tk.Tk()
        root.title("智能哨兵模拟系统")
        root.geometry("1000x700")
        
        # 创建主窗口
        app = MainWindow(root)
        
        # 运行主循环
        root.mainloop()
    except Exception as e:
        print(f"启动系统时出错: {e}")
        print("请确保模型文件已正确下载并放置在 models 目录中。")
        print("详细信息请参考 models/README.md 文件。")


if __name__ == "__main__":
    main()
