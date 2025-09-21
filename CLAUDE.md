# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# @movk/nuxt 项目配置

## 项目概览

- **项目名称**: @movk/nuxt
- **项目类型**: Nuxt 4.x 模块
- **主要功能**: auto-form 组件、API 封装、主题管理、i18n 支持
- **包管理器**: pnpm 10.17.0
- **版本**: 0.0.0 (开发阶段)
- **许可证**: MIT

## 技术栈

### 核心框架

- **Vue 3** + **TypeScript** + **Nuxt 4.x**
- **@nuxt/ui** - UI 组件库
- **Zod** - 数据验证与类型推断
- **@nuxtjs/i18n** - 国际化支持
- **@vueuse/core** - Vue 组合函数库

### 核心依赖

- **@movk/core** - 核心工具库 (优先使用其 isEmpty 函数)
- **@nuxt/image** - 图片处理
- **nuxt-auth-utils** - 认证工具
- **@iconify-json/lucide** - 图标库

## 项目结构

```
├── src/runtime/           # 运行时代码
│   ├── components/        # 组件目录
│   │   └── auto-form/    # 自动表单组件
│   ├── composables/      # 组合函数
│   ├── types/           # TypeScript 类型定义
│   └── utils/           # 工具函数
├── playground/          # 开发测试环境
│   ├── app/            # 测试应用
│   └── nuxt.config.ts  # Nuxt 配置
├── test/               # 测试文件 (仅模块级测试)
└── dist/               # 构建输出
```

## 开发规范

### 代码约定

- 使用 `@movk/core` 的 `isEmpty` 函数进行空值检查
- 遵循 `@antfu/eslint-config` 代码风格
- 组件前缀默认为 `M` (可配置)
- 优先使用组合式 API

### 测试策略

- 基于模块级测试文档的核心测试
- **排除端到端浏览器测试**
- 使用 Vitest 进行单元测试
- TypeScript 类型检查必须通过

### 国际化

- 默认语言: `zh_cn` (简体中文)
- 支持语言: `zh_cn`, `en`
- 策略: `no_prefix`

## 常用命令

```bash
# 开发
pnpm dev                # 启动开发环境
pnpm dev:prepare        # 准备开发环境

# 构建与测试
pnpm build              # 构建模块
pnpm test               # 运行测试
pnpm test:watch         # 监控测试
pnpm typecheck          # 类型检查

# 代码质量
pnpm lint               # ESLint 检查
pnpm lint:fix           # 自动修复 ESLint 问题

# 其他
pnpm clean              # 清理构建文件
pnpm release            # 发布版本
```

## IDE 配置

项目已配置以下开发工具支持：

### ESLint 配置

- 使用 `@antfu/eslint-config` + Nuxt ESLint 模块
- 支持 Vue、TypeScript、JSON、YAML 等文件格式
- 配置了格式化和代码修复
- 禁用 `no-console` 规则

### VS Code 配置

- **i18n 支持**: 配置 i18n-ally 插件，默认显示中文
- **格式化**: 禁用 Prettier，使用 ESLint 进行格式化和修复
- **TailwindCSS 支持**:
  - 支持 `ui` 属性的 TailwindCSS 类名补全
  - 为不同目录配置独立的 TailwindCSS 上下文
- **图标支持**: 启用 Iconify 插件的内联预览和注释

## AI 助手专用指令

### 编码原则

1. **依赖管理**: 优先使用 `@movk/core` 提供的工具函数
2. **空值检查**: 统一使用 `@movk/core` 的 `isEmpty` 函数
3. **组件开发**: 遵循 Nuxt 4.x 和 Vue 3 最佳实践
4. **类型安全**: 充分利用 TypeScript 和 Zod 进行类型检查
5. **国际化**: 所有用户界面文本需要支持 i18n

### 模块架构

**核心模块**: `/src/module.ts`

- 配置选项: `prefix` (组件前缀), `i18n` (国际化开关)
- 依赖管理: 自动配置 @nuxt/ui、@nuxt/image、nuxt-auth-utils 等
- 组件注册: 自动注册 `/src/runtime/components` 下的组件
- 类型系统: 扩展 Nuxt 应用类型，提供 `$createApiFetcher` 等全局方法

**运行时核心**:

- **API 层**: `/src/runtime/plugins/api.factory.ts` - API 请求工厂
- **组合函数**: `/src/runtime/composables/` - 可复用逻辑
- **类型定义**: `/src/runtime/types/` - TypeScript 类型系统
- **工具函数**: `/src/runtime/utils/` - 通用工具

**AutoForm 组件系统**:

- 主组件: `/src/runtime/components/auto-form/AutoForm.vue`
- 类型定义: `/src/runtime/types/auto-form.ts`
- 工具函数: `/src/runtime/utils/auto-form.ts`
- 常量配置: `/src/runtime/constants/auto-form.ts`

### 开发约定

- 新组件应放置在 `src/runtime/components/` 下
- 组合函数应放置在 `src/runtime/composables/` 下
- 类型定义应放置在 `src/runtime/types/` 下
- 测试文件应放置在 `test/` 下，遵循模块级测试原则
- 所有导出的类型都应该有适当的 TypeScript 文档注释

### 特殊注意事项

- 当前项目处于开发阶段 (version 0.0.0)
- playground/ 目录用于模块开发和测试
- 模块需要与 Nuxt 4.x 兼容
- 支持可选的 i18n 集成 (通过配置启用)

## 继承规则

本项目继承全局 `.claude/CLAUDE.md` 中定义的所有规则和协议，包括：

- RIPER-5 操作规程
- 核心交互标准 (简体中文交流)
- 工具路由规则
- MCP 工具集成
