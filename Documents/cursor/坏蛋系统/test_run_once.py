#!/usr/bin/env python3
from visible_agents import VisibleAgentSystem

def main():
    print("🧪 开始单次测试运行...")
    try:
        system = VisibleAgentSystem()
        system.run_one_session()
        print("✅ 测试运行完成。")
    except Exception as e:
        print(f"❌ 测试运行出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
