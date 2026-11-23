# AGENTS.md

Nuxt 4 模块开发指南。涵盖 AutoForm、DataTable、API 集成、通用组件/Composables，以及 Vite/Vue 兼容层（不含 API 域）。

## 常用命令

```bash
pnpm dev:prepare      # 首次/修改 src 后必跑（stub + 类型 + vue playground）
pnpm dev              # Nuxt playground (playgrounds/play)
pnpm dev:vue          # 纯 Vite + Vue playground (playgrounds/vue)
pnpm dev:vue:build    # 校验 Vue 模式构建
pnpm build            # 模块构建
pnpm typecheck        # 全项目类型检查
pnpm lint / pnpm lint:fix
pnpm test             # Vitest 单元与组件测试（单测指定: pnpm test -- <file>）
pnpm test:pack        # 打包并在隔离项目中验证
pnpm docs:build       # 文档预渲染检查
```

## 架构与分层

- **目录职责**：
  - `src/module.ts` / `src/unplugin.ts`：Nuxt 模块 / Vue 模式 unplugin 入口
  - `src/runtime/domains/`：业务逻辑核心与私有子组件，对外主组件保持薄壳
  - `src/runtime/composables/` & `src/runtime/components/`：公开能力入口
  - `src/runtime/vue/`：Vue 兼容层桩与配置
  - `src/utils/` vs `src/runtime/utils/`：前者为构建期工具（**禁止在 runtime 引入**）；两模式共享纯函数置于后者
- **依赖分界**：依赖 Nuxt/Nitro 运行时（API、上传下载、`nuxt-auth-utils`）仅归属 `domains/api/`，禁止纳入 Vue 模式。

## 关键规范与禁忌

### 样式与图标
- **Tailwind 入口**：`src/runtime/index.css` 不含 `@import "tailwindcss"`，由使用方 CSS 显式 `@import "@movk/nuxt"`；全项目仅允许单一 Tailwind 入口。
- **图标注入**：Nuxt 模式只挂 `icon:clientBundleIcons` 钩子（严禁写 `icon.clientBundle.icons`）；Vue 模式经 `filterResolvableIcons` 后写入 `ui.icon.clientBundle.icons`。

### Vite/Vue 兼容层维护清单
- **新增组件/Composable 必同步**：
  - 引入新 `U*` 组件：登记至 `src/unplugin.ts` 的 `UI_COMPONENTS`。
  - 新增 Composable 或公开导出（含 re-export）：显式登记至 `src/unplugin.ts` 的 `MOVK_COMPOSABLES`。
  - 新增未导出的 `#imports` 符号：补齐 `src/runtime/vue/stubs/movk-extra.ts`。
- **类型与依赖锁定**：
  - `reka-ui` 直接依赖版本必须与 `@nuxt/ui` 内部版本严格一致。
  - 保留 DatePicker/Calendar 相关的类型收窄写法，避免声明发射报错 (TS2883)。
- **改动验证**：修改模板、插件、stub 或组件后，必跑 `pnpm dev:prepare && pnpm dev:vue:build`。

### 类型与默认值
- **类型导出最小化**：内部合并类型（如 `ResolvedEndpointConfig`、`MovkApiFullConfig`、`ApiFetchContext`）禁止对外暴露。
- **类型推断优先**：回调参数使用索引访问与 contextual typing 派生，避免手写冗余类型。
- **配置透传**：`<UApp>` 可配置字段默认置空，过滤 `undefined` 后传入；模块依赖默认值需影响依赖收集时使用函数写入 `nuxt.options`。

## 文档与 Playground

- **文档规范 (`docs/`)**：
  - 静态标量用 `::component-code`（多层级加 `prettier: true`）；复杂交互/Schema 驱动用 `::component-example` 并置于 `docs/app/components/content/examples/<scope>/`。
  - 转发事件须手动补充至 Emits 表格。
- **Playground 示例**：一页演示一项能力，穷举公开 props/events/slots，兼作文档素材。
- **功能变更同步面**：新增或修改功能需同步：
  1. `docs/content/docs/` 组件/功能文档
  2. `docs/app/components/content/examples/` 示例
  3. `playgrounds/play/app/pages/` 示例页面
  4. `README.md` 与 SEO/站点描述（如涉及）
