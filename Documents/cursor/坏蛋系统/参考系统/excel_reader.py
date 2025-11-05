#!/usr/bin/env python3
"""
Excel文件读取工具
用于读取和分析金融平台数据
"""

import pandas as pd
import json
import sys
import os

def read_excel_file(file_path):
    """读取Excel文件并转换为JSON格式"""
    try:
        # 读取Excel文件
        df = pd.read_excel(file_path)

        # 转换为字典格式
        data = df.to_dict('records')

        # 获取列名
        columns = df.columns.tolist()

        print(f"成功读取Excel文件: {file_path}")
        print(f"总行数: {len(data)}")
        print(f"列名: {columns}")

        return {
            'success': True,
            'data': data,
            'columns': columns,
            'total_rows': len(data)
        }

    except Exception as e:
        print(f"读取Excel文件失败: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def save_to_json(data, output_path):
    """保存数据到JSON文件"""
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"数据已保存到: {output_path}")
        return True
    except Exception as e:
        print(f"保存JSON文件失败: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("使用方法: python excel_reader.py <Excel文件路径>")
        sys.exit(1)

    excel_file = sys.argv[1]
    output_file = excel_file.replace('.xlsx', '_data.json')

    result = read_excel_file(excel_file)

    if result['success']:
        save_to_json(result, output_file)
    else:
        print("读取失败:", result['error'])
        sys.exit(1)