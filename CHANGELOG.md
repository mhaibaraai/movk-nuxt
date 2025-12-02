# 📋 Changelog

## 0.1.0 (2025-12-02)

### ⚠ BREAKING CHANGES

* 项目从 @movk/nuxt-docs 文档主题完全转型为 @movk/nuxt 模块生态系统，现有文档主题用户需要重新评估迁移方案。
* - 删除了 src/runtime/core.ts 文件，核心工具函数迁移到 @movk/core 包
- 更新所有导入路径从 '#movk/core' 到 '@movk/core'
- playground 示例中的图标从 'i-tabler-mail' 更新为 'i-lucide-mail'

影响范围：
- src/runtime/components/AutoForm.vue
- src/runtime/components/auto-form-renderer/AutoFormRendererArray.vue
- src/runtime/composables/useAutoForm.ts
- src/runtime/internal/useAutoFormProvider.ts
- src/runtime/types/auto-form.ts
- src/runtime/utils/field-utils.ts
- src/runtime/utils/reactive-utils.ts
- src/runtime/utils/schema-introspector.ts
- playground/app/pages/auto-form/controls/input-menu.vue
- playground/app/pages/auto-form/examples/login.vue
* 升级了文档依赖版本和 better-sqlite3 版本，文档系统将使用新的版本特性。
* 动态插槽类型定义已更新，组件需要相应调整
* 上下文API变更，使用 useAutoFormInjector 替代 inject
* 对象工厂API调整，移除了部分高级用法

* ✨ feat: 增强 AutoForm 类型系统，支持插槽额外参数传递 ([3e30379](https://github.com/mhaibaraai/movk-nuxt/commit/3e303799b9d65309ff75d3f8ba642821a88e3b42))
* ✨ feat: 条件渲染支持和上下文系统重构 ([2ed2f49](https://github.com/mhaibaraai/movk-nuxt/commit/2ed2f49351b18d38c49bd277b7e5ee8e670f8028))
* ♻️ refactor: 简化对象工厂实现并优化类型定义 ([a275996](https://github.com/mhaibaraai/movk-nuxt/commit/a275996d251b933e675068d1a1413b62cf6a3b01))

### ✨ Features

* **api:** 更新 API 配置与请求处理，新增文件下载功能 ([4fdb67a](https://github.com/mhaibaraai/movk-nuxt/commit/4fdb67afeb75e3d324b8679c9fe2cdfe9407199c))
* **auth:** 集成 Nuxt UI 并重构登录表单组件 ([a3e2258](https://github.com/mhaibaraai/movk-nuxt/commit/a3e2258e3ad725f66711fd6503980e5f2578c217))
* **auto-form:** 修复对象字段的 hidden 属性处理 ([4b5dcdc](https://github.com/mhaibaraai/movk-nuxt/commit/4b5dcdcdc7669682c7471c5aacc89ea1f6c81bff))
* **auto-form:** 删除不再使用的文件并优化组件结构 ([fe8a2cd](https://github.com/mhaibaraai/movk-nuxt/commit/fe8a2cd6b743fef013474cad977d05c1f24242f0))
* **auto-form:** 增强嵌套字段的折叠功能 ([b0137e3](https://github.com/mhaibaraai/movk-nuxt/commit/b0137e3583d0276dac001bd7b2585ba615c6f830))
* **auto-form:** 增强表单控件映射与插槽支持 ([3aa72f3](https://github.com/mhaibaraai/movk-nuxt/commit/3aa72f3acc1587577acf010781290a86a76994e5))
* **auto-form:** 增强表单配置与验证功能 ([1a8d263](https://github.com/mhaibaraai/movk-nuxt/commit/1a8d2639103d1497910cd584731c4bb20d88d791))
* **auto-form:** 实现三段优先级控件解析与类型安全增强 ([d968fa9](https://github.com/mhaibaraai/movk-nuxt/commit/d968fa9e58a1d9495751d41c10804b8e3a5e6c20))
* **auto-form:** 支持全局字段元数据配置与嵌套字段提示优化 ([36fcc58](https://github.com/mhaibaraai/movk-nuxt/commit/36fcc5812b838749f1e9f448af3a4b6ccf20fac7))
* **auto-form:** 支持控件条件渲染与自定义类型注册 ([784fc57](https://github.com/mhaibaraai/movk-nuxt/commit/784fc57f78a261e41e8a8789a4606d1e164936dc))
* **auto-form:** 添加 AutoForm 组件及相关功能 ([4f564f9](https://github.com/mhaibaraai/movk-nuxt/commit/4f564f94f632b65b2144b7e65eb99de50c91920b))
* **auto-form:** 添加响应式schema支持和动态属性解析 ([6635bd1](https://github.com/mhaibaraai/movk-nuxt/commit/6635bd15eb7aa01aed6da50d2d2e89b38e0264e8))
* **auto-form:** 添加字段过渡动画支持并优化条件渲染逻辑 ([dda976e](https://github.com/mhaibaraai/movk-nuxt/commit/dda976e8216756d4cedc222b1d5b6ced5477027d))
* **auto-form:** 添加对象字段的 UAccordion 折叠面板包装功能 ([80a9ac1](https://github.com/mhaibaraai/movk-nuxt/commit/80a9ac1f1915ebb547c4df37be60a59a165166fc))
* **auto-form:** 添加错误信息显示支持与优化字段配置 ([7173c6c](https://github.com/mhaibaraai/movk-nuxt/commit/7173c6c50d8a3c299e88f6154f881caac10ff286))
* **auto-form:** 重构控件映射与类型系统 ([bbfd8e6](https://github.com/mhaibaraai/movk-nuxt/commit/bbfd8e6e4fbb066e261a6125d50fde710a03eff2))
* **auto-form:** 重构组件架构并添加层级表单支持 ([9661f7d](https://github.com/mhaibaraai/movk-nuxt/commit/9661f7d31e64f7cb5ebbeb4281fc133aa69dfb15))
* AutoForm 支持自定义提交按钮属性 ([7dec62a](https://github.com/mhaibaraai/movk-nuxt/commit/7dec62af5c5f5c83f1db9dbfcf05e1d5940dc7af))
* **components:** 为 StarRating 组件添加键盘导航和无障碍支持 ([fa2e776](https://github.com/mhaibaraai/movk-nuxt/commit/fa2e776afbeddbe911bf48b47f0af64074183ef2))
* **components:** 为 StarRating 组件添加键盘导航和无障碍支持 ([b8cf419](https://github.com/mhaibaraai/movk-nuxt/commit/b8cf419aee83cc6265b5ec5eb1965c052b7e730b))
* **docs:** 新增 ColorChooser 和 StarRating 字段示例组件 ([323bb06](https://github.com/mhaibaraai/movk-nuxt/commit/323bb066a08debd69594bcf5651ac94ec8ae1294))
* **docs:** 新增 components 分类及示例组件 ([914e568](https://github.com/mhaibaraai/movk-nuxt/commit/914e568b23832f11b048fe4ff72b62cb886326b3))
* **docs:** 新增 Object 字段类型示例组件 ([81de8b9](https://github.com/mhaibaraai/movk-nuxt/commit/81de8b9efb64ea802f85124b7714ee1b15709f88))
* implement AutoFormArrayRenderer component ([3004848](https://github.com/mhaibaraai/movk-nuxt/commit/300484805657fb65d5e258e46750536a611429a0))
* **theme:** 实现动态主题同步与图标适配功能 ([6c15bca](https://github.com/mhaibaraai/movk-nuxt/commit/6c15bcad27e8c6ef9c5ea3d71eebd9af1709a3b8))
* 支持 inputDate 和 inputTime 日期输入控件 ([90cefe0](https://github.com/mhaibaraai/movk-nuxt/commit/90cefe02ce471c0fd1f1bfc253de0d648f0530c4))
* 新增 inputDate、inputTime 和 ISO 日期时间字段支持 ([e1be52e](https://github.com/mhaibaraai/movk-nuxt/commit/e1be52e0ab20d11d875a0bc8563014f37fe6a802))
* 添加完整基础示例页面 ([13608cc](https://github.com/mhaibaraai/movk-nuxt/commit/13608cc119edd8d6bfdb50eef39f71688b4610f2))
* 添加完整的 README 项目介绍 ([46880c0](https://github.com/mhaibaraai/movk-nuxt/commit/46880c048e6b1a2a414a7014ef31b82c58085f66))
* 重构项目从文档主题到模块生态系统 ([e1894d5](https://github.com/mhaibaraai/movk-nuxt/commit/e1894d57c7ebac75c612193a23d4f785932b3606))

### 🐛 Bug Fixes

* **docs:** 修复 StarRating 示例组件的垂直布局 ([baec6be](https://github.com/mhaibaraai/movk-nuxt/commit/baec6bef49c75abd077791cd5e3d3e477190848d))
* **docs:** 修正构建脚本使用正确的 pnpm workspace 命令 ([09ea17a](https://github.com/mhaibaraai/movk-nuxt/commit/09ea17a64f395af26752ba342c65dd7e4ae3e74f))
* 修复 enum 字段控件属性合并逻辑 ([66ed695](https://github.com/mhaibaraai/movk-nuxt/commit/66ed69506f6bf2c93ac2a20a7358fe82975687e5))
* 修复 toDate 方法的跨时区兼容性问题 ([1d219a9](https://github.com/mhaibaraai/movk-nuxt/commit/1d219a99b832519b7de472e9b145a234d36b478c))
* 修复 useDateFormatter 时区配置问题 ([23d8beb](https://github.com/mhaibaraai/movk-nuxt/commit/23d8beb8615c38067b50c393999a1c805f45b1af))
* 修复移动端表单布局响应式问题 ([c50eac4](https://github.com/mhaibaraai/movk-nuxt/commit/c50eac4f17132a6e475987de617578f6b097c3e8))

### 📝 Documentation

* **auto-form:** 重构文档结构,优化内容组织 ([59528cc](https://github.com/mhaibaraai/movk-nuxt/commit/59528cc47db6706a73d53f03fe727c5abdccca94))
* **components:** 补充 StarRating 组件键盘导航文档 ([1ea979d](https://github.com/mhaibaraai/movk-nuxt/commit/1ea979db6eefce1e1f7ff0c2f390b8810d3b9d22))
* **examples:** 优化示例组件布局和展示效果 ([50eff8b](https://github.com/mhaibaraai/movk-nuxt/commit/50eff8b0ced8831f3d31e806d59e0bd6873cb021))
* 优化字段类型文档排版结构 ([1c3fa2f](https://github.com/mhaibaraai/movk-nuxt/commit/1c3fa2fe7c42d21d65b2eb9e2a770a7224efc6d6))
* 优化文档内容和示例展示 ([50e188b](https://github.com/mhaibaraai/movk-nuxt/commit/50e188bf857c27b6be91133b1f6d690f773bc9a0))
* 优化文档格式并添加 changelog 组件 ([0bdaae5](https://github.com/mhaibaraai/movk-nuxt/commit/0bdaae59634dc42754c38e08be43d0843e64d8ec))
* 优化文档站点配置 ([5d1f1b3](https://github.com/mhaibaraai/movk-nuxt/commit/5d1f1b3901ffc22e63538198da043f28f810672d))
* 完善 Enum、Array、Object 字段 API 参数文档 ([71cf3f2](https://github.com/mhaibaraai/movk-nuxt/commit/71cf3f2664f2ca67e80e16ad78589f2f85fa65a4))
* 完善 String 和 Number 字段类型文档 ([b268ef1](https://github.com/mhaibaraai/movk-nuxt/commit/b268ef14bf29ccc32d5ac976d78c2bf13b8b142f))
* 完善项目快速开始和安装指南 ([6e52d49](https://github.com/mhaibaraai/movk-nuxt/commit/6e52d49854fc192870d3961bb592c55a6af54f5e))
* 撰写 AutoForm 核心概念文档 ([1476c16](https://github.com/mhaibaraai/movk-nuxt/commit/1476c162435328229bf1b425ee67b6c0b5190534))
* 新增日期时间字段完整示例和文档 ([b44ce01](https://github.com/mhaibaraai/movk-nuxt/commit/b44ce0161926582ca6c537777a59558245838fa1))
* 更新文档使用新的日期字段 API ([40c2f51](https://github.com/mhaibaraai/movk-nuxt/commit/40c2f51003671925aafd604a2e7f820da26bca68))
* 更新文档导航链接指向核心概念页面 ([edf6558](https://github.com/mhaibaraai/movk-nuxt/commit/edf6558fe30b02ece6821dc82ad392c58a5403b7))
* 更新文档站点 OG 图片 ([844a12d](https://github.com/mhaibaraai/movk-nuxt/commit/844a12dfe4ec4ab84f0ea80ee1c739da953fa396))
* 更新文档站点 OG 图片 ([a2e4490](https://github.com/mhaibaraai/movk-nuxt/commit/a2e449073ce41179e3a2ef5245dd6ade7942c3b8))
* 添加文档站点 OG 图片 ([8656135](https://github.com/mhaibaraai/movk-nuxt/commit/86561358f8827fcac31355f394a6319c7b1dfcb4))
* 精简文档内容并优化配置 ([3636c8b](https://github.com/mhaibaraai/movk-nuxt/commit/3636c8ba359009118b362d5ca6c62b59503bc374))
* 补充所有字段类型文档和示例组件 ([1f77316](https://github.com/mhaibaraai/movk-nuxt/commit/1f773160e52013e2d5b3363d68bdabde1d308353))
* 重构文档体系,优化内容组织和架构说明 ([3ae7f4d](https://github.com/mhaibaraai/movk-nuxt/commit/3ae7f4db18bfa3148676ed5cc542d3abbfd50488))
* 重构文档结构和示例组件 ([efe41cd](https://github.com/mhaibaraai/movk-nuxt/commit/efe41cd3df42ddbf9990b59cce6f895af6b24a87))

### 💄 Styles

* 优化 UI 配置和布局样式 ([fef5b18](https://github.com/mhaibaraai/movk-nuxt/commit/fef5b1892a2ec0594d08d92605986b4e14a7aa41))
* 更新文档主题配置 ([810b78b](https://github.com/mhaibaraai/movk-nuxt/commit/810b78b7653d7a14cdfa82a8ba2877cb50627601))
* 移除 AutoFormRendererNested 中未使用的类型导入 ([0f0a26b](https://github.com/mhaibaraai/movk-nuxt/commit/0f0a26bc8627eb93b40c02c73f2e722070aa5078))

### ♻️ Code Refactoring

* **auto-form:** 优化字段上下文缓存与响应式值解析逻辑 ([babb2bd](https://github.com/mhaibaraai/movk-nuxt/commit/babb2bd1904825e58975c187f9f6439d6f3bcac7))
* **auto-form:** 优化字段渲染逻辑，移除冗余属性 ([2b078f0](https://github.com/mhaibaraai/movk-nuxt/commit/2b078f0703a72eb1e1d7205766e88e8ef5def25a))
* **auto-form:** 优化数组和嵌套组件的渲染逻辑 ([fe8e2c3](https://github.com/mhaibaraai/movk-nuxt/commit/fe8e2c312f8bc659def17663624cf4bce9142ae5))
* **auto-form:** 优化表单模式和插槽结构 ([96ad242](https://github.com/mhaibaraai/movk-nuxt/commit/96ad242caca40b579a460c4f2bfc6771f567e013))
* **auto-form:** 重构字段上下文处理和响应式值解析逻辑 ([5264546](https://github.com/mhaibaraai/movk-nuxt/commit/5264546712d62a501fe7b856ce55f08933579fe7))
* **auto-form:** 重构嵌套字段渲染与折叠面板实现 ([7789eca](https://github.com/mhaibaraai/movk-nuxt/commit/7789eca3215b62d2eebe3e66922df86a7d1a2659))
* **auto-form:** 重构嵌套字段渲染机制，使用 UCollapsible 替代 UAccordion ([ed9fe08](https://github.com/mhaibaraai/movk-nuxt/commit/ed9fe08a01e6d60b9635b802adb9701b79da6bbe))
* **auto-form:** 重构控件解析和可见性逻辑 ([26f3185](https://github.com/mhaibaraai/movk-nuxt/commit/26f318587416ee9e24ec0e6b7c114b7d39370246))
* **auto-form:** 重构类型定义与控件创建逻辑 ([396c084](https://github.com/mhaibaraai/movk-nuxt/commit/396c0848df2b1c0c4f615e0558fe2dddcb539c71))
* **auto-form:** 重构表单类型定义和API调用方式 ([e85ca5b](https://github.com/mhaibaraai/movk-nuxt/commit/e85ca5bc250d16ba10dd082b3de429cd780b9e6c))
* **components:** 优化组件代码格式 ([9bdda32](https://github.com/mhaibaraai/movk-nuxt/commit/9bdda32d1f8fd480cc9706fc7f8be09016945235))
* **docs:** 优化文档配置和组件结构 ([7e83d25](https://github.com/mhaibaraai/movk-nuxt/commit/7e83d2579fa172d66cba3129c21f13b3dd2ee036))
* **docs:** 优化示例组件和文档结构 ([03e8b0b](https://github.com/mhaibaraai/movk-nuxt/commit/03e8b0bd7249a94e40de27dee17dcb1822cb9c23))
* **docs:** 简化文档导航结构 ([81204dd](https://github.com/mhaibaraai/movk-nuxt/commit/81204ddbbd96f83ea9dcbd86b1f5a695f31f1292))
* **docs:** 重构文档目录结构 ([7b2ca46](https://github.com/mhaibaraai/movk-nuxt/commit/7b2ca46f149c2304d9c14a6db2e0909c49f1acc1))
* **module:** 重构模块依赖管理与类型系统 ([15b0ced](https://github.com/mhaibaraai/movk-nuxt/commit/15b0ced2a0055421d7b62ae001e1ff79a22a17b1))
* 优化 release-it 配置 ([0da7bf7](https://github.com/mhaibaraai/movk-nuxt/commit/0da7bf78151cb009b826822b3167aeb4df8fde25))
* 优化文档配置和结构 ([2d13e79](https://github.com/mhaibaraai/movk-nuxt/commit/2d13e79239f678dc720cb05eb467f93a55e71bd5))
* 将组件 Props 类型定义提取到独立文件 ([d4a6c1e](https://github.com/mhaibaraai/movk-nuxt/commit/d4a6c1eb945501d406262251dc36c4147dc722d7))
* 提取独立的 Zod AutoForm 元数据类型定义 ([b29b9c8](https://github.com/mhaibaraai/movk-nuxt/commit/b29b9c8bde71023c179041a94630059ff43e08db))
* 移除不必要的异步组件和类型注释 ([0298cf2](https://github.com/mhaibaraai/movk-nuxt/commit/0298cf2d27752d167c0b53029e47e10c17cc4702))
* 迁移核心工具到 @movk/core 包，更新导入路径 ([f96826f](https://github.com/mhaibaraai/movk-nuxt/commit/f96826f3fbce24e3f25d7a2b10670cc780069c4c))
* 重组控件默认值分类，补充文档资源引用 ([04cd211](https://github.com/mhaibaraai/movk-nuxt/commit/04cd2115eae0197520701eb1ac22b5e0eb43fa38))

### ✅ Tests

* add useDateFormatter tests and fix vitest coverage dependency ([29434f2](https://github.com/mhaibaraai/movk-nuxt/commit/29434f258d15a6ee0a60a99839f9c37040071fcb))

### 👷 CI

* 优化 GitHub Actions 配置 ([32a4504](https://github.com/mhaibaraai/movk-nuxt/commit/32a45044f909751d2fe8acd97a46205daea0bb51))
* 在 CI 流程中添加 dev:prepare 步骤 ([5bd590c](https://github.com/mhaibaraai/movk-nuxt/commit/5bd590c90c3650744b44c7ea47eacd0955264026))

### 🔧 Chores

* **deps:** 更新 pnpm 及相关依赖版本 ([fbd0af4](https://github.com/mhaibaraai/movk-nuxt/commit/fbd0af494e68ab6b83a172e56a1d82fa0913a723))
* **deps:** 更新依赖锁定文件 ([5216d3c](https://github.com/mhaibaraai/movk-nuxt/commit/5216d3c51b6c61af06e6fbca013b9118dcda792e))
* **deps:** 更新依赖项，升级多个包至最新版本并调整样式导入 ([4c18709](https://github.com/mhaibaraai/movk-nuxt/commit/4c18709171e06e5096e103423020e2a8920a5b9d))
* **deps:** 更新核心依赖至最新版本 ([8356070](https://github.com/mhaibaraai/movk-nuxt/commit/8356070370d8c80d67fb7a327b141fc7b776dc20))
* **docs:** 在文档构建前自动执行 dev:prepare ([6a45426](https://github.com/mhaibaraai/movk-nuxt/commit/6a454261971ce63e37fd0e5b424d64dcc0ade459))
* 优化 changelog 生成配置 ([c51a95b](https://github.com/mhaibaraai/movk-nuxt/commit/c51a95b32da0d1db44bc23c8a044e85b26f8e4f7))
* 升级 @movk/core 到 v1.0.1 ([b09af2c](https://github.com/mhaibaraai/movk-nuxt/commit/b09af2c0b9f7adc2d3b344bf4b8d37fce99efec9))
* 升级 @movk/nuxt-docs 到 1.3.5 版本 ([eafb1f1](https://github.com/mhaibaraai/movk-nuxt/commit/eafb1f1fcb299b41543c4e59a1c07edf57ba0aea))
* 升级 @movk/nuxt-docs 到 v1.3.6，better-sqlite3 到 v12.4.6 ([d43fd0d](https://github.com/mhaibaraai/movk-nuxt/commit/d43fd0db210384191f8dbf6ad79f7da9bda4c0f2))
* 升级 pnpm 到 10.23.0 版本并更新依赖 ([0ec4e3c](https://github.com/mhaibaraai/movk-nuxt/commit/0ec4e3c45563cc8f595ad0db385ed226c2f8e209))
* 升级依赖并优化配置 ([8bc34d5](https://github.com/mhaibaraai/movk-nuxt/commit/8bc34d5761ecbbfd6c7e958cdc24961a73666880))
* 升级文档主题依赖并优化命令 ([ab30382](https://github.com/mhaibaraai/movk-nuxt/commit/ab303824803b9eb3773ea5fc9374bfece2877462))
* 更新 @movk/core 依赖至 0.0.5，优化 API 请求处理 ([74af1b9](https://github.com/mhaibaraai/movk-nuxt/commit/74af1b91ea5ff4f8eb8086c7680dea493221cad0))
* 更新 ESLint 配置，调整 pnpm 工作区和 VSCode 设置，添加新的样式文件和组件 ([dbf4044](https://github.com/mhaibaraai/movk-nuxt/commit/dbf40442a68cef192962c1e17a74d0eb358f9e5a))
* 更新 pnpm 依赖版本并优化 AutoForm 组件 ([8cce090](https://github.com/mhaibaraai/movk-nuxt/commit/8cce090b8acbd69e3df5c6a740aee7b87fc4a528))
* 更新 pnpm 依赖版本并优化 AutoForm 组件 ([88a7f1e](https://github.com/mhaibaraai/movk-nuxt/commit/88a7f1e9f88019d9b45451f851afab050419c94b))
* 更新依赖和清理临时文件 ([50467e0](https://github.com/mhaibaraai/movk-nuxt/commit/50467e078c8c1c4081ec31fccd77f2e4c7a62990))
* 更新依赖版本 ([0e96499](https://github.com/mhaibaraai/movk-nuxt/commit/0e96499b9a6713f450e0f6fce6e5d2b7524cbe92))
* 更新依赖版本并优化 AutoForm 组件 ([9272183](https://github.com/mhaibaraai/movk-nuxt/commit/9272183614838ca5f502faadfb927d49e5660442))
* 更新依赖项并优化 API 配置 ([1bb0322](https://github.com/mhaibaraai/movk-nuxt/commit/1bb03221e07a13aa522f902da2eef74ba6efecb8))
* 更新项目依赖包 ([2680945](https://github.com/mhaibaraai/movk-nuxt/commit/2680945197b4ff0788649415e405843b7b403c0b))
* 更新项目元信息并清理临时文件 ([f41ad3f](https://github.com/mhaibaraai/movk-nuxt/commit/f41ad3f784c24b74dedda47d1145797b7319c33f))
* 添加 .claude 目录到 .gitignore ([58eef65](https://github.com/mhaibaraai/movk-nuxt/commit/58eef6534b3449c3de321db1ec8b4333e177b8b9))
* 清空快速开始文档，准备后续补充内容 ([caa3eff](https://github.com/mhaibaraai/movk-nuxt/commit/caa3effb0e9f1fc4a8a15b261baf50c152911937))
* 移除 taze 依赖及相关脚本 ([319c246](https://github.com/mhaibaraai/movk-nuxt/commit/319c246e8f2290c792873c2ba63a805d6b9c8320))
* 移除不再使用的组合函数和优化 API 配置 ([5a10a48](https://github.com/mhaibaraai/movk-nuxt/commit/5a10a48b9c2f937391aac5fbaee89db5f748a231))
* 简化 playground 的 TypeScript 配置 ([fe80a7a](https://github.com/mhaibaraai/movk-nuxt/commit/fe80a7afdf535092d78d124abe11665357ca1768))
* 调整 release-it 依赖与配置 ([0d61429](https://github.com/mhaibaraai/movk-nuxt/commit/0d61429531ca5769b845a38851605cf7342b8df4))
