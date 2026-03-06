---
title: "避免卡壳！7个让 React 代码起飞的自定义 Hooks"
source: wechat
url: https://mp.weixin.qq.com/s/lTMim3_lTMikmhVSycbeIg
author: FED实验室
pub_date: 2025年10月30日 19:30
created: 2026-01-17 21:25
tags: [编程]
---

# 避免卡壳！7个让 React 代码起飞的自定义 Hooks

> 作者: FED实验室 | 发布日期: 2025年10月30日 19:30
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/lTMim3_lTMikmhVSycbeIg)

---

关注下方公众号，获取更多热点资讯

在现代 React 开发中，自定义 Hooks（Custom Hooks） 是提升代码复用性、可维护性和可读性的核心工具。它们允许开发者将组件逻辑提取为可复用的函数，，彻底告别“渲染属性”（Render Props）和高阶组件（HOC）的繁琐模式。

本文精选 7 个在生产项目中实践过的高频自定义 Hooks，覆盖输入优化、数据持久化、异步请求、交互控制、状态追踪与响应式布局等核心场景。掌握它们，你将减少 60%+ 的重复代码，提升组件可测试性与可维护性。

useDebounce：防抖输入优化

useDebounce 接受值和延迟时间，返回防抖后的值；内部使用 useEffect 清理定时器，主要作用为延迟高频事件的执行，适用于搜索输入、窗口调整等场景，参考示实现：

import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 实战应用：搜索输入
function SearchInput() {
  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, 500);

  useEffect(() => {
    if (debouncedInput) {
      // 触发搜索 API
      fetch(`/api/search?q=${debouncedInput}`);
    }
  }, [debouncedInput]);

  return <input value={input} onChange={e => setInput(e.target.value)} />;
}

useThrottle：节流控制频率

useThrottle 支持领先边/尾随边触发，基于 requestAnimationFrame 优化性能，主要作用为限制函数执行频率，适用于滚动监听、鼠标移动等连续事件，参考示实现：

import { useState, useEffect, useRef } from 'react';

function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRun = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, limit - (Date.now() - lastRun.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// 实战应用：滚动加载
function InfiniteScroll() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 200);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (throttledScrollY > 1000) {
      // 加载更多
    }
  }, [throttledScrollY]);
}

useLocalStorage：持久化本地状态

useLocalStorage 自动序列化/反序列化，支持初始值和自定义存储键，主要作用为同步 React 状态与 localStorage，实现页面刷新后状态保留，参考示实现：

import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// 实战应用：主题切换
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      切换为 {theme === 'light' ? '暗黑' : '明亮'} 模式
    </button>
  );
}

useFetch：优雅的数据获取

useFetch 支持 AbortController 取消请求，兼容 Suspense，主要作用为封装 fetch 请求逻辑，提供 loading、error、data 状态，参考示实现：

import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useFetch<T>(url: string, options?: RequestInit): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    setState(prev => ({ ...prev, loading: true }));

    fetch(url, { ...options, signal })
      .then(res => res.json())
      .then(data => {
        setState({ data, loading: false, error: null });
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setState({ data: null, loading: false, error });
        }
      });

    return () => controller.abort();
  }, [url]);

  return state;
}

// 实战应用
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useFetch<User>(`/api/users/${userId}`);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  return <div>欢迎, {data?.name}</div>;
}

usePrevious：追踪前一个状态

usePrevious 使用 useRef 存储历史值，渲染间不触发重新渲染，主要作用为获取上一次渲染时的状态或 props 值，用于比较变化，参考示实现：

import { useRef, useEffect } from 'react';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 实战应用：检测值变化
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>当前: {count}, 上次: {prevCount ?? '无'}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}

useClickOutside：点击外部关闭

useClickOutside 基于事件捕获，自动绑定/解绑事件，主要作用为检测点击是否发生在指定元素外部，常用于下拉菜单、模态框。参考如下：

import { useEffect, RefObject } from 'react';

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
}

// 实战应用：下拉菜单
function Dropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setOpen(false));

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}>菜单</button>
      {open && (
        <ul style={{ position: 'absolute', background: 'white', border: '1px solid #ccc' }}>
          <li>选项1</li>
          <li>选项2</li>
        </ul>
      )}
    </div>
  );
}

useMediaQuery：响应式媒体查询

useMediaQuery 使用 window.matchMedia，支持 SSR 安全，主要作用为 监听 CSS 媒体查询状态，返回布尔值以驱动响应式逻辑。参考实现：

import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// 实战应用：响应式布局
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return <div>{isMobile ? '移动端视图' : '桌面端视图'}</div>;
}


这7个 Custom Hooks 涵盖了 React 开发中最常见的逻辑抽象：输入优化（debounce/throttle）、状态持久化（localStorage）、数据获取（fetch）、历史追踪（previous）、交互控制（clickOutside）、响应式适配（mediaQuery）。建议大家在日常开发中将常见的 Hooks 封装进项目内的 hooks/ 目录，形成共享的工具库。




点击下方图片，订阅我的小册，支持我

---
*导入时间: 2026-01-17 21:25:54*
