# AGENTS.md

This file provides guidance for AI coding agents working on this repository.

## 项目概述

`@movk/nuxt` 是一个 Nuxt 4 模块，提供 Schema 驱动的 AutoForm（基于 Zod v4）、API 集成系统（useApiFetch + 进度监控）、独立 UI 组件和通用 Composables。

**peerDependencies**：`@nuxt/ui >=4.6.0`、`zod >=4.3.6`

**moduleDependencies**（模块会自动校验版本）：

| 模块 | 最低版本 |
| --- | --- |
| `@vueuse/nuxt` | >=14.2.1 |
| `@nuxt/image` | >=2.0.0 |
| `@nuxt/ui` | >=4.6.0 |
| `nuxt-auth-utils` | >=0.5.29 |

## 常用命令

```bash
# 开发前必须先执行（生成 stub 和类型）
pnpm dev:prepare

# 启动默认 playground
pnpm dev

# 启动 dashboard playground
pnpm dev:dashboard

# 构建模块
pnpm build

# 类型检查（覆盖 src + 两个 playground + docs）
pnpm typecheck

# Lint
pnpm lint
pnpm lint:fix

# 单元测试
pnpm test

# 运行单个测试文件
pnpm test -- useDateFormatter

# 启动文档站
pnpm docs

# 清理构建产物
pnpm clean
```

**重要**：修改 `src/` 后，如果 playground 未热更新，需重新执行 `pnpm dev:prepare`。
