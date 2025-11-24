`@movk/nuxt` 是一个**模块化的 Nuxt 工具套件**，而不仅仅是 `AutoForm`。`AutoForm` 只是目前最成熟的核心功能。

基于您的**扩展规划**和**模块化架构**愿景，重新调整了文档的顶层设计。这份新的文档框架将从“单功能工具库”升级为“综合性工程套件”，为未来的 `AutoTable` 和 `UseApi` 预留架构空间，并强调通用组件（如 `DatePicker`）的独立价值。

-----

# `@movk/nuxt` 综合文档撰写全案 (v2.0)

## 一、 核心战略定位

  * **定位**：**Nuxt 4 模块化工程套件** (Modular Engineering Suite)。
  * **核心叙事**：不仅仅是一个表单库，而是一套旨在提升 Nuxt 开发效率的工具集。它遵循“渐进式采用”原则——你可以只用它的日期处理，也可以只用它的 UI 组件，或者使用全自动化的 AutoForm/AutoTable 系统。
  * **架构隐喻**：`@movk/nuxt` 是一个工具箱。
      * **AutoForm** 是其中的“电动螺丝刀”（核心大杀器）。
      * **Components** (如 DatePicker) 是通用的“钻头”（可独立使用）。
      * **Composables** (如 useDateFormatter) 是“润滑油”（通用逻辑）。
      * **AutoTable** (规划中) 将是未来的“电锯”。

-----

## 二、 文档站点地图 (SiteMap)

侧边栏结构需要体现**模块化**，避免将所有内容都折叠在 AutoForm 下。

### 1\. 概览 (Introduction)

  * **关于 `@movk/nuxt`**:
      * 项目愿景：打造高效的 Nuxt 开发生态。
      * **模块化架构**：解释 Core、Components、Systems (AutoForm/AutoTable) 的分层关系。
  * **安装 (Installation)**:
      * 基础安装 `npm i @movk/nuxt`。
      * 配置 `nuxt.config.ts`（模块注册）。
      * 依赖说明 (`@nuxt/ui`, `zod`, `@internationalized/date`)。
  * **路线图 (Roadmap)**:
      * ✅ **AutoForm**: Schema 驱动的表单系统。
      * 🚧 **AutoTable**: (Coming Soon) 自动化数据表格。
      * 🚧 **UseApi**: (Coming Soon) 标准化 API 调用封装。

### 2\. 通用组件库 (Standalone Components)

*此章节强调组件的独立性，即“不用 AutoForm 也能用这些组件”。*

  * **基础输入增强**:
      * `MWithCopy`: 带复制功能的输入框。
      * `MWithClear`: 带一键清除的输入框。
      * `MWithPasswordToggle`: 带显隐切换的密码框。
      * `MWithCharacterLimit`: 带字数统计限制的输入框。
  * **高级交互组件**:
      * `MDatePicker`: 基于国际化标准的日期选择器（单选/范围/多选）。
      * `MColorChooser`: 颜色选择器封装。
      * `MStarRating`: 星级评分组件。

### 3\. 核心系统：AutoForm (Core System)

*此章节是目前最丰满的部分，保持原有的深度。*

  * **快速上手**: 5分钟实现登录注册表单。
  * **Schema 定义 (`afz`)**: Zod 的增强与元数据注入。
  * **字段类型 (Field Types)**:
      * String / Number / Boolean.
      * Enum / Select / Radio.
      * Nested Object (嵌套对象与折叠).
      * Array (动态增删).
  * **布局系统 (Layout System)**:
      * 基础布局与 Grid.
      * Accordion & Tabs.
      * Layout Component (`$layout`) 的原理。
  * **进阶指南 (Advanced)**:
      * 依赖联动 (Dependencies).
      * 异步验证 (Async Validation).
      * 自定义渲染器 (Renderer)。

### 4\. 通用组合式函数 (Composables)

*提取通用的逻辑工具，服务于未来的 AutoTable 和 UseApi。*

  * **`useDateFormatter`**:
      * 强大的日期格式化、解析、范围处理工具。
      * 基于 `@internationalized/date` 的封装。
  * *(预留位置)* **`useApi`**: (Coming Soon)
  * *(预留位置)* **`useTable`**: (Coming Soon)

### 5\. 开发者指南 (Contributing)

  * **架构设计**: 解释 `schema-introspector` 如何工作。
  * **扩展开发**: 如何为 AutoForm 编写一个新的 `Control` 或 `Layout`。

-----

## 三、 关键章节撰写策略

### 1\. 强调“模块化”的写法

在介绍独立组件时，务必展示**不依赖 AutoForm** 的代码示例。

  * **错误写法**：（只展示在 Schema 中的用法）
  * **正确写法**：
    ```vue
    <template>
      <MDatePicker v-model="date" label-format="iso" />
      <MWithCopy v-model="apiKey" />
    </template>
    ```
    *数据来源：参考 `playground/app/pages/components/*.vue` 下的独立示例文件。*

### 2\. 预热“未来功能”

在文档中适当位置“埋点”，让用户对未来功能保持期待，同时展示架构的连贯性。

  * **在 `AutoForm` 章节**：提到“未来的 `AutoTable` 将复用相同的 Zod Schema 定义，实现定义一次，既生成表单又生成表格”。
  * **在 `Composables` 章节**：提到“`useApi` 将与 `AutoForm` 的提交逻辑无缝集成，处理加载状态和错误回显”。

### 3\. `useDateFormatter` 的独立文档

这是一个高质量的通用工具，值得单独写一篇文档。

  * **功能点**：格式化 (format)、解析 (parse)、相对时间、时区处理。
  * **代码引用**：`src/runtime/composables/useDateFormatter.ts`。
  * **价值**：即使不使用表单，用户也可能为了这个日期处理工具而安装库。

### 4\. 架构图解 (Architecture Diagram)

建议在“简介”或“原理”部分加入架构图，展示各模块关系：

```mermaid
graph TD
    UserConfig[nuxt.config.ts] --> Module[Movk Nuxt Module]
    Module --> Components[UI Components]
    Module --> Composables[Composables]
    
    subgraph "Core Systems"
        AutoForm[AutoForm System]
        AutoTable[AutoTable System (Planned)]
    end
    
    Components --> AutoForm
    Composables --> AutoForm
    
    Components --> AutoTable
    
    subgraph "Standalone Usage"
        MDatePicker
        MStarRating
        useDateFormatter
    end
    
    Components -.-> MDatePicker
    Composables -.-> useDateFormatter
```

-----

## 四、 示例文档片段：介绍页

**标题：@movk/nuxt - 构建现代 Nuxt 应用的工程化套件**

**简介**
`@movk/nuxt` 是一个为 Nuxt 4 设计的模块化工具套件。它采用**分层架构**设计，旨在通过高度抽象的自动化系统（如 AutoForm）解决重复性工作，同时提供高质量的独立组件（如 DatePicker）和组合式函数以满足定制化需求。

**主要特性**

  * 🧩 **模块化设计**：按需使用。你可以只使用它的 UI 组件，或者启用全套自动化系统。
  * 📝 **AutoForm 系统**：基于 Zod Schema 的“定义即渲染”表单解决方案。
  * 🛠 **独立组件库**：内置 `MDatePicker`、`MStarRating` 等 10+ 个通用 UI 组件，开箱即用。
  * ⚡ **未来规划**：`AutoTable`（自动表格）与 `UseApi`（API 治理）正在开发中。

-----

框架完全契合您提到的“扩展规划”和“模块化架构”，既照顾了当下的核心功能，又为项目的长远发展留出了文档空间。
