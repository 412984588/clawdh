import json
import sys

def analyze_json_file(filepath):
    print(f"正在分析: {filepath} ...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if isinstance(data, dict):
            keys = list(data.keys())
            print(f"  - 根键: {keys}")
            for key in keys:
                if isinstance(data[key], list):
                    print(f"  - '{key}' 列表长度: {len(data[key])}")
                    if len(data[key]) > 0:
                        print(f"  - 示例条目: {json.dumps(data[key][0], ensure_ascii=False)[:100]}...")
        elif isinstance(data, list):
            print(f"  - 列表长度: {len(data)}")
    except Exception as e:
        print(f"  - 错误: {e}")

if __name__ == "__main__":
    analyze_json_file("verified_platforms.json")
    print("-" * 30)
    analyze_json_file("pending_platforms.json")
