# Composables 测试文档

## 📊 测试覆盖概览

| Composable | 测试文件 | 测试用例 | 状态 | 测试类型 |
|-----------|---------|---------|------|----------|
| `useDateFormatter` | ✅ | 27 | 通过 | 单元测试 |
| `useApiFetch` | ✅ | 13 | 通过 | 单元测试 |
| `useApiAuth` | ✅ | 14 | 通过 | 单元测试 |
| `useAutoForm` | ✅ | 44 | 通过 | 单元测试 |
| `useClientApiFetch` | ✅ | 19 | 通过 | 单元测试 |
| `useUploadWithProgress` | ⚠️ | 1 | 通过 | 导入验证 |
| `useDownloadWithProgress` | ⚠️ | 1 | 通过 | 导入验证 |

**总计**: 7 个测试文件 | 119 个测试用例 | 全部通过 ✅

## 🎯 测试策略

### 单元测试（Unit Tests）

对于纯逻辑 composables，使用完整的单元测试：

- **useDateFormatter**: 日期格式化、转换、工具方法
- **useApiFetch**: API 请求封装、选项传递、hooks 合并
- **useApiAuth**: 登录流程、token 提取、session 管理
- **useAutoForm**: Schema 驱动表单生成、元数据传递
- **useClientApiFetch**: 客户端专用请求封装

### 集成测试（Integration Tests）

对于依赖浏览器 API 的 composables，需要 E2E 测试：

- **useUploadWithProgress**: 需要 XMLHttpRequest API
- **useDownloadWithProgress**: 需要 Fetch API + ReadableStream

> ⚠️ **注意**: `useUploadWithProgress` 和 `useDownloadWithProgress` 只有基础的导入验证测试。完整的功能测试应该在 Playwright/Cypress 等 E2E 测试框架中进行。

## 🔧 Mock 策略

### 只 Mock Nuxt 运行时

```typescript
// ✅ Mock Nuxt 特定的运行时
vi.mock('#imports')
vi.mock('#app')
vi.mock('#components')
```

### 使用真实的工具包

```typescript
// ✅ 使用真实的 @movk/core（纯函数工具库）
import { getPath, isObject, extractFilename } from '@movk/core'
```

### 部分 Mock 有副作用的函数

```typescript
// ✅ 只 mock 有 DOM 副作用的函数
vi.mock('@movk/core', async () => {
  const actual = await vi.importActual('@movk/core')
  return {
    ...actual,
    triggerDownload: vi.fn() // 只 mock 这一个函数
  }
})
```

## 🚀 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test test/composables/useDateFormatter.test.ts

# 生成覆盖率报告
pnpm vitest --coverage

# Watch 模式（开发时）
pnpm test --watch
```

## 📝 测试详情

### useDateFormatter (27 tests)

- ✅ 初始化配置
- ✅ 格式化方法（format, formatRange, formatArray）
- ✅ 转换方法（toISO, toDate, toTimestamp, parse）
- ✅ 工具方法（getToday, getStartOfWeek, getEndOfMonth）
- ✅ 查询方法（getDayOfWeek, isWeekend, isSameDay）
- ✅ 批量转换（convertToISO, convertToFormatted）

### useApiFetch (13 tests)

- ✅ 参数传递（URL, method, body, query, headers）
- ✅ API 选项提取（skipBusinessCheck, transform）
- ✅ 端点切换
- ✅ Hooks 合并（onRequest, onResponse, onResponseError）
- ✅ 响应式 URL 支持

### useApiAuth (14 tests)

- ✅ 基础登录流程
- ✅ Token 提取（多种格式）
- ✅ 用户信息获取
- ✅ 自定义 token 提取器
- ✅ 自定义 session 构建器
- ✅ 端点切换
- ✅ 认证配置（Bearer, Custom token type）
- ✅ 错误处理

### useAutoForm (44 tests)

- ✅ 基础字段工厂（string, number, boolean, file）
- ✅ 日期时间（calendarDate, inputDate, inputTime）
- ✅ ISO 字符串（datetime, date, time）
- ✅ Zod v4 验证（email, url, uuid）
- ✅ 集合类型（array, tuple, enum）
- ✅ 对象类型（object, looseObject, strictObject）
- ✅ 元数据传递机制（链式调用保持元数据）
- ✅ 布局系统
- ✅ 默认控件配置

### useClientApiFetch (19 tests)

- ✅ 客户端专用配置（server: false, lazy: true）
- ✅ 响应式 URL 支持
- ✅ API 选项集成
- ✅ Hooks 集成
- ✅ 请求配置选项（query, headers, watch）
- ✅ 使用场景验证

### useUploadWithProgress (1 test)

- ✅ 导入验证
- ⚠️ 完整测试待实现（需要 E2E 环境）

### useDownloadWithProgress (1 test)

- ✅ 导入验证
- ⚠️ 完整测试待实现（需要 E2E 环境）

## 🔮 待改进

1. **E2E 测试**: 为 `useUploadWithProgress` 和 `useDownloadWithProgress` 添加 Playwright 测试
2. **覆盖率**: 提高工具函数的测试覆盖率
3. **性能测试**: 添加性能基准测试

## 📚 参考

- [Vitest 文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Nuxt Testing](https://nuxt.com/docs/getting-started/testing)
