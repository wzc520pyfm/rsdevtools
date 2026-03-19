# rs-devtools 架构升级分析：从 iframe 到 Web Component

> 状态：规划中 | 创建时间：2026-03-18

## 背景

当前 rs-devtools 的客户端注入层（`packages/core/src/client-inject/index.ts`）采用纯 DOM 操作方式，所有 dock 面板（包括内置的 Settings、Logs、Terminals）均通过 iframe 加载。而 vite-devtools 已采用 Web Component + Vue 组件的架构，内置面板直接渲染为 Vue 组件，仅第三方扩展使用 iframe 隔离。

## 现状问题

### 1. 跨域样式无法注入

rs-devtools 的 playground 运行在 `localhost:9300`，devtools 服务运行在 `localhost:7821`。不同端口即不同源，父页面无法访问 iframe 的 `contentDocument`（返回 null），导致：

- 无法从宿主页面动态注入透明背景样式
- 面板的毛玻璃效果（`backdrop-filter: blur`）被 iframe 的不透明背景遮盖
- 只能依赖 iframe 内部 Nuxt 应用的 CSS 规则（`html.dock-frame` class）来实现透明

### 2. 首次加载白屏闪烁

每个 iframe 首次打开时需经历完整的加载流程：

```
创建 document → HTTP 请求 → 解析 HTML → 加载 JS/CSS bundle → Vue/Nuxt 初始化 → 路由匹配 → 组件渲染
```

即使已实现 iframe 缓存（`iframeCache`），首次加载仍不可避免地出现白屏。

### 3. 内存与性能开销

每个 iframe 是独立的浏览器渲染上下文，拥有独立的：

- JS 堆内存
- DOM 树与样式系统
- Vue/Nuxt 运行时实例
- 完整的应用 bundle（entry.js + vendor + 路由组件）

缓存多个 iframe 意味着内存成倍增长。

### 4. 状态同步复杂

iframe 内外是隔离的 JS 运行时，状态同步只能依赖：

- `postMessage` + 自定义消息协议
- WebSocket 中继
- URL query 参数（单向，且需刷新）

## vite-devtools 架构参考

### 关键文件

| 文件 | 作用 |
|------|------|
| `packages/core/src/client/webcomponents/components/DockPanel.vue` | 面板容器，使用 `bg-glass:75` 实现毛玻璃 |
| `packages/core/src/client/webcomponents/components/ViewEntry.vue` | 入口路由，按 dock 类型分发到不同的 View 组件 |
| `packages/core/src/client/webcomponents/components/ViewIframe.vue` | iframe 类型 dock 的渲染器 |
| `packages/core/src/client/webcomponents/components/ViewBuiltinSettings.vue` | 内置 Settings，直接渲染的 Vue 组件 |
| `packages/core/src/client/webcomponents/components/ViewBuiltinLogs.vue` | 内置 Logs，懒加载的 Vue 组件 |
| `packages/core/src/client/webcomponents/components/ViewBuiltinTerminals.vue` | 内置 Terminals，懒加载的 Vue 组件 |
| `packages/core/src/client/webcomponents/utils/PersistedDomViewsManager.ts` | iframe DOM 持久化管理，避免切换时销毁重建 |

### 架构设计

```
DockPanel (bg-glass:75, 毛玻璃容器)
  └── ViewEntry (按 type 路由)
        ├── type === '~builtin'  → Vue 组件直接渲染（Settings / Logs / Terminals）
        ├── type === 'iframe'    → ViewIframe（第三方扩展，真正的 iframe）
        ├── type === 'custom-render' → ViewCustomRenderer
        └── type === 'launcher'  → ViewLauncher
```

核心思路：**内置面板用组件渲染，第三方扩展用 iframe 隔离**。

### 好处

1. **样式可控**：组件与容器共享渲染上下文，CSS 继承链完整，毛玻璃天然透出
2. **性能优异**：无 iframe 创建开销，不加载额外 bundle，组件切换是 VDOM diff
3. **状态共享**：通过 `DocksContext` + `sharedStateToRef` 直接双向绑定
4. **调试友好**：所有组件在同一个 document context，console 输出集中

## 升级方案

### 方案 A：完整迁移到 Web Component 架构（推荐）

将 `client-inject/index.ts` 从纯 DOM 操作改为 Web Component + Vue 组件渲染。

**改动范围：**

- `packages/core/src/client-inject/index.ts` → 重构为 Web Component 入口
- 新增 `packages/core/src/client/webcomponents/` 目录，参考 vite-devtools 结构
- 内置 dock 页面（`dock/settings`、`dock/logs`、`dock/terminals`）改为 Vue 组件
- 第三方 iframe 类型 dock 保持不变
- 构建配置需要支持 Web Component 打包

**优点：** 架构统一，长期维护性好，和 vite-devtools 对齐  
**缺点：** 改动量大，需要引入 Vue 运行时到注入脚本中，增加注入脚本体积

**预估工作量：** 3-5 天

### 方案 B：仅内置面板改为同源 inline 渲染

保持 `client-inject/index.ts` 的纯 DOM 操作模式，但将内置面板（Settings、Logs、Terminals）从 iframe 改为直接在面板 DOM 中用原生 JS 渲染。

**改动范围：**

- `client-inject/index.ts` 中为 `~builtin` 类型 dock 新增内联渲染逻辑
- 用原生 DOM API 实现简版 Settings / Logs / Terminals UI
- 或引入轻量模板库（如 lit-html）

**优点：** 不需要引入 Vue，注入脚本体积可控  
**缺点：** 原生 DOM 实现复杂 UI 维护成本高，功能可能比 Nuxt 版本简化

**预估工作量：** 2-3 天

### 方案 C：确保 iframe 内容透明（最小改动）

保持现有 iframe 架构不变，通过确保 iframe 内 Nuxt 应用的 CSS 正确生效来实现透明。

**已完成的改动：**

- `packages/rspack/src/app/styles/global.css` 中为 `html.dock-frame` 添加了完整的透明规则
- `client-inject/index.ts` 中实现了 iframe 缓存系统，消除切换闪烁

**待确认：**

- 需要 `pnpm build` 重新构建后验证 CSS 是否生效
- `color-scheme: normal` 是否会影响 dark mode 下的其他样式
- 如果 `.bg-dots` 样式优先级高于 `!important`（不太可能），需要在 UnoCSS 层面排除

**优点：** 改动最小，风险最低  
**缺点：** 不解决根本架构问题，iframe 的内存/性能/状态同步问题依然存在

**预估工作量：** 已基本完成，需验证

## iframe 使用的注意事项（备忘）

| 问题 | 说明 | 应对 |
|------|------|------|
| 跨域限制 | 不同端口即不同源，`contentDocument` 返回 null | 只能靠 iframe 内部 CSS |
| `color-scheme` | `dark` 模式下浏览器会给 canvas 填深色底 | 设置 `color-scheme: normal` |
| `background` 简写 vs 分写 | `background-color: transparent` 不清除 `background-image` | 用 `background: transparent` 简写 |
| `allowtransparency` | HTML 属性，某些浏览器需要 | iframe 元素添加此属性 |
| 首次加载开销 | 完整 Nuxt bundle 需要加载 | iframe 缓存 + preload |
| 内存倍增 | 每个 iframe 独立 JS 堆 | 限制同时缓存的 iframe 数量 |
| 焦点陷阱 | Tab 键在 iframe 边界行为不一致 | 需要手动管理焦点 |

## 建议

短期采用 **方案 C**（已基本完成），先确保现有体验可接受。

中长期推荐 **方案 A**，与 vite-devtools 架构对齐，从根本上解决 iframe 带来的各类问题。可以在后续版本中分步推进：

1. 先搭建 Web Component 基础框架
2. 将 Settings 面板迁移为 Vue 组件（最简单的内置面板）
3. 逐步迁移 Logs、Terminals
4. 最后处理第三方 dock 的兼容
