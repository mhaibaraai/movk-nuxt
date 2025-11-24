# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个名为 `@movk/nuxt` 的 Nuxt 模块，提供基于 Zod Schema 的自动表单生成功能。项目使用 TypeScript 开发，构建在 Nuxt 4 和 Nuxt UI 之上。

**扩展规划**：
- 当前核心功能：AutoForm 自动表单系统
- 计划扩展：AutoTable 自动表格组件、UseApi 等常用 composables
- 模块化架构：支持多组件和工具函数的灵活扩展

## 开发命令

### 核心开发命令
- `pnpm dev` - 启动 playground 开发服务器
- `pnpm build` - 构建模块
- `pnpm dev:prepare` - 准备开发环境（构建模块并准备 playground）
- `pnpm docs` - 启动文档开发服务器

### 代码质量
- `pnpm lint` - 运行 ESLint 检查
- `pnpm lint:fix` - 自动修复 ESLint 问题
- `pnpm typecheck` - 运行 TypeScript 类型检查
- `pnpm test` - 运行 Vitest 测试

### 发布相关
- `pnpm release` - 发布新版本（使用 release-it）
- `pnpm clean` - 清理构建文件（使用 `scripts/rm.ts` 脚本）

### 文档相关
- `pnpm docs` - 启动文档开发服务器
- `pnpm docs:build` - 构建文档网站

## 架构概览

### 模块结构
- `src/module.ts` - Nuxt 模块定义和配置
- `src/runtime/` - 运行时代码
  - `components/` - 组件定义
  - `composables/` - 组合式函数
  - `types/` - TypeScript 类型定义
  - `utils/` - 工具函数

### 核心功能

**AutoForm 系统**：
- 基于 Zod Schema 自动生成表单界面
- 支持布局字段（`$layout`）进行复杂表单布局
- 提供丰富的控件类型映射
- 支持响应式表单状态管理

**主要组件**：
- `AutoForm` - 主表单组件
- `AutoFormRenderer*` - 字段渲染器组件
- 多种输入增强组件（WithClear、WithPasswordToggle 等）

### 类型系统
- 使用 Zod 进行表单验证和类型定义
- 完整的 TypeScript 类型推断
- 支持自定义控件映射和元数据配置

## 开发指南

### 添加新控件
1. 在 `src/runtime/components/input/` 下创建新的输入增强组件
2. 在 `src/runtime/types/auto-form.ts` 中更新类型定义
3. 在 `src/runtime/composables/useAutoForm.ts` 中注册默认控件

### 模块配置
模块支持以下配置选项：
- `prefix` - 组件前缀（默认：'M'）

### Playground 开发
- playground 目录包含模块的使用示例
- 使用 `pnpm dev` 启动 playground 进行测试
- 示例展示了各种表单控件的使用方式

### 文档系统
- `docs/` 目录包含完整的文档网站
- 使用 Nuxt Content 构建，支持 MDC 语法
- 基于 `@movk/nuxt-docs` 主题扩展
- 包含组件文档自动生成功能

## 依赖关系

### 核心依赖
- `@nuxt/ui` - UI 组件库
- `zod` - 表单验证和类型定义
- `@movk/core` - 核心工具库
- `@internationalized/date` - 国际化日期处理

### 开发依赖
- `@nuxt/module-builder` - 模块构建工具
- `vitest` - 测试框架
- `vue-tsc` - Vue TypeScript 检查
- `@nuxt/eslint` - ESLint 配置

## CI/CD 和工具

### GitHub Actions
- 自动化测试、构建和发布流程
- 包含 lint、typecheck、test 和 build 步骤

### 清理脚本
- `scripts/rm.ts` - 智能清理脚本，可删除 node_modules、.nuxt、dist 等构建文件
- 支持批处理操作和错误处理

## Zod v4 规范

### 必须使用的新 API

使用专用函数替代旧的字符串验证方法:

**✅ 正确写法 (Zod v4)**
```typescript
// Email 验证
const emailSchema = z.email()

// URL 验证
const urlSchema = z.url()

// UUID 验证
const uuidSchema = z.uuid()

// ISO datetime 验证
const datetimeSchema = z.iso.datetime()

// ISO date 验证
const dateSchema = z.iso.date()

// ISO time 验证
const timeSchema = z.iso.time()

// IP 地址验证
const ipSchema = z.ip()

// JWT 验证
const jwtSchema = z.jwt()
```

**❌ 禁止写法 (已弃用)**
```typescript
// 不要使用 string().email()
const emailSchema = z.string().email()

// 不要使用 string().url()
const urlSchema = z.string().url()

// 不要使用 string().uuid()
const uuidSchema = z.string().uuid()
```

### 其他 v4 变更

- 枚举类型:使用 `z.enum(nativeEnum)` 替代 `z.nativeEnum()`
- Promise 类型:已弃用 `z.promise()`,直接 `await` 后再验证
- Record 类型:使用 `z.enum` 作为 key 时会进行完整性检查
- 函数验证:`z.function()` 不再返回 Zod schema,使用 `.implement()` 方法

### 参考文档

- 官方文档: https://zod.dev/api

## 文档撰写

- 使用来自 https://docs.mhaibaraai.cn/llms.txt 的 Movk Nuxt Docs 文档
- 使用 Nuxt UI 文档来自 https://ui.nuxt.com/llms.txt
