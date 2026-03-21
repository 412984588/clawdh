import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import nextPlugin from './node_modules/.pnpm/node_modules/@next/eslint-plugin-next/dist/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    // 忽略构建产物和依赖
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'coverage/**'],
  },
  {
    // TypeScript 解析器（全部 ts/tsx 文件）
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
  },
  {
    // 生产源码严格规则（排除测试文件、scripts、logger）
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/__tests__/**', 'src/**/logger.ts'],
    rules: {
      // 禁止 as any，鼓励精确类型
      '@typescript-eslint/no-explicit-any': 'warn',
      // 禁止 console.log，允许 warn/error（生产日志规范）
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // 无障碍 lint 规则（初始全部 warn，逐步升级为 error）
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: Object.fromEntries(
      Object.entries(jsxA11y.configs.recommended.rules).map(([key, val]) => [
        key,
        val === 'error' ? 'warn' : val,
      ])
    ),
  },
  {
    // 全局注册 Next.js 插件，让 next build 在读取 eslint.config.mjs 本身时也能检测到插件
    plugins: { '@next/next': nextPlugin },
    settings: {
      next: {
        rootDir: __dirname,
      },
    },
    // Next 内部会直接遍历 completeConfig.rules，这里提供一个显式 rules 对象避免 build 阶段报错
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    // Next.js 官方规则仅作用于应用源码
    files: ['src/**/*.{ts,tsx}'],
    rules: nextPlugin.flatConfig.recommended.rules,
  },
]

export default eslintConfig
