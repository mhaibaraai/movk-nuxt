# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Nuxt 模块项目 `@movk/nuxt`，提供了自动表单生成、API 请求封装、主题管理等功能。项目采用 monorepo 结构，包含主模块和 playground 示例应用。

## 开发命令

### 构建和打包
- `pnpm build` - 构建模块
- `pnpm prepack` - 预打包 (自动运行 build)

### 开发环境
- `pnpm dev` - 启动开发模式 (包含 prepare 和 playground)
- `pnpm dev:prepare` - 准备开发环境 (stub build + prepare playground)
- `pnpm dev:build` - 构建 playground

### 代码质量
- `pnpm lint` - 运行 ESLint 检查
- `pnpm lint:fix` - 自动修复 ESLint 问题
- `pnpm typecheck` - TypeScript 类型检查 (包含 playground)

### 测试
- `pnpm test` - 运行测试套件
- `pnpm test:watch` - 监听模式运行测试
- `pnpm test:types` - 仅运行类型检查

### 工具命令
- `pnpm clean` - 清理构建文件
- `pnpm up` - 更新依赖
- `pnpm release` - 发布新版本

## 项目架构

### 核心模块结构
```
src/
├── module.ts              # 主模块定义，配置组件、插件、类型等
└── runtime/               # 运行时代码
    ├── components/        # Auto Form 组件套件
    ├── composables/       # 组合式函数 (API、表单上下文、主题)
    ├── types/            # TypeScript 类型定义
    ├── shared/           # 共享工具函数
    ├── utils/            # 工具函数
    ├── plugins/          # Nuxt 插件
    ├── constants/        # 常量定义
    └── i18n/             # 国际化配置
```

### 核心功能模块

1. **Auto Form 系统** (`src/runtime/components/auto-form/`, `src/runtime/shared/auto-form.ts`)
   - 基于 Zod Schema 的自动表单生成
   - 支持嵌套对象、字段验证、自定义控件
   - 提供类型安全的表单工厂 `createAutoFormZ`

2. **API 管理系统** (`src/runtime/composables/useApiFetch.ts`, `src/runtime/plugins/api.factory.ts`)
   - 封装了 Nuxt 的 `$fetch` 和 `useFetch`
   - 支持 API 配置文件 (`ApiProfile`) 管理
   - 提供统一的请求/响应处理

3. **主题管理** (`src/runtime/composables/useThemeManager.ts`)
   - 主题切换和管理功能

### 依赖关系
- 基于 Nuxt 4.x 和 Vue 3
- 核心依赖：`@nuxt/ui`、`@vueuse/core`、`zod/v4`、`@movk/core` 、 `lru-cache`
- 可选依赖：`@nuxtjs/i18n` (当启用 i18n 选项时)

### 模块配置
主模块通过 `movk` 配置键进行配置：
- `prefix`: 组件前缀 (默认 'M')
- `i18n`: 是否启用国际化支持

### 开发注意事项

1. **命名约定**
   - 组件使用 PascalCase: `AutoForm.vue`
   - 组合式函数使用 camelCase: `useApiFetch`
   - 类型文件包含清晰的接口定义

2. **类型系统**
   - 项目全面采用 TypeScript
   - Zod 用于运行时验证和类型推导
   - 自定义类型定义在 `src/runtime/types/` 中

3. **测试策略**
   - 使用 Vitest 进行单元测试
   - 测试文件位于 `test/` 目录
   - 包含性能基准测试

4. **Playground 应用**
   - 位于 `playground/` 目录
   - 用于开发和测试模块功能
   - 配置了示例 API 端点和国际化
