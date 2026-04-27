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
    root = tk.Tk()
    root.title("智能哨兵模拟系统")
    root.geometry("1000x700")
    
    # 创建主窗口
    app = MainWindow(root)
    
    # 运行主循环
    root.mainloop()


if __name__ == "__main__":
    main()
