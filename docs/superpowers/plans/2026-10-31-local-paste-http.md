# 本地粘贴 HTTP 接口实施计划

> **给执行代理：** 必须逐项执行本计划。每一步使用复选框跟踪，并在每个任务完成后运行该任务列出的验证。

**目标：** 在 Edge-Drop 中增加可选的 `127.0.0.1` 文本粘贴 HTTP 服务，支持 `POST /paste` 和默认文本过滤的 `GET /list`。

**架构：** 主进程使用 Node 内置 `http` 模块承载服务，通过依赖注入访问现有 `ItemStore`，不新增 renderer IPC。设置更新和应用生命周期统一调用服务的启动、停止、重绑定方法；文本写入继续复用现有存储去重、持久化和状态推送路径。

**技术栈：** Electron 主进程、Node `http`、TypeScript、Vitest、现有 Zustand/React 设置页。

**规格：** `docs/superpowers/specs/2026-10-31-local-paste-http-design.md`

## 全局约束

- 只支持 `type: "text"`；图片、文件和其他过滤类型不在本次实现范围内。
- 服务只能绑定 `127.0.0.1`，默认端口 `18765`，允许端口范围 `1024..65535`。
- `GET /list` 未提供 `filter` 时按 `filter=text` 处理，并返回完整文本。
- API 写入只更新面板历史，不写入操作系统剪贴板或模拟 Ctrl+V。
- 长文本必须通过 `ItemStore.getFullText()` 展开，不能返回 renderer 的 300 字预览。
- 不新增第三方依赖，不改变现有文件路径只保存引用的语义。

---

### 任务 1：增加设置字段与规范化

**文件：**
- 修改：`shared/types.ts:139-250`
- 修改：`electron/store/settings.ts:14-45`
- 测试：`tests/pasteApiSettings.test.ts`

**接口：**
- 新增 `Settings.pasteApiEnabled` 和 `Settings.pasteApiPort`。
- 新增导出的 `PASTE_API_DEFAULT_PORT = 18765`，供设置默认值和服务使用。
- `normalizeSettings()` 将端口钳制到 `1024..65535`，无效值恢复默认端口。

- [ ] **步骤 1：先写会失败的设置测试**

```ts
it('defaults the local paste API to disabled on port 18765', () => {
  expect(DEFAULT_SETTINGS.pasteApiEnabled).toBe(false)
  expect(DEFAULT_SETTINGS.pasteApiPort).toBe(18765)
})

it('repairs invalid paste API ports', () => {
  expect(normalizeSettings({ pasteApiPort: 80 }).pasteApiPort).toBe(18765)
  expect(normalizeSettings({ pasteApiPort: 70000 }).pasteApiPort).toBe(18765)
  expect(normalizeSettings({ pasteApiPort: 'bad' as any }).pasteApiPort).toBe(18765)
  expect(normalizeSettings({ pasteApiPort: 23456 }).pasteApiPort).toBe(23456)
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`npx vitest run tests/pasteApiSettings.test.ts`

预期：因 `Settings` 尚无新字段而失败。

- [ ] **步骤 3：实现字段和规范化**

在 `shared/types.ts` 的 `Settings`、`DEFAULT_SETTINGS` 中加入字段；在
`normalizeSettings` 中使用有限数值判断、四舍五入并验证端口范围。

- [ ] **步骤 4：运行测试确认通过**

运行：`npx vitest run tests/pasteApiSettings.test.ts`

预期：通过。

- [ ] **步骤 5：提交**

```text
git add shared/types.ts electron/store/settings.ts tests/pasteApiSettings.test.ts
git commit -m "feat: add local paste API settings"
```

### 任务 2：实现纯主进程 HTTP 服务

**文件：**
- 创建：`electron/main/pasteApi.ts`
- 测试：`tests/pasteApi.test.ts`

**接口：**

```ts
export interface PasteApiDeps {
  addText: (content: string) => void | Promise<void>
  listText: () => Array<{ content: string; type: 'text' }>
}

export class PasteApiServer {
  constructor(deps: PasteApiDeps)
  start(port: number): Promise<void>
  stop(): Promise<void>
  reconfigure(enabled: boolean, port: number): Promise<void>
  isRunning(): boolean
}
```

- [ ] **步骤 1：先写 HTTP 行为测试**

使用内存 `PasteApiDeps`，启动服务后通过 Node `http.request` 覆盖：

```ts
it('POST /paste accepts text and calls addText', async () => { /* assert 200 and captured body */ })
it('rejects unsupported POST types with 400 JSON', async () => { /* type=image */ })
it('GET /list defaults to text and returns complete content', async () => { /* long content */ })
it('accepts GET /list?filter=text', async () => { /* assert same list */ })
it('rejects unsupported filters, methods, and paths', async () => { /* 400/405/404 */ })
```

- [ ] **步骤 2：运行测试确认失败**

运行：`npx vitest run tests/pasteApi.test.ts`

预期：因 `electron/main/pasteApi.ts` 尚不存在而失败。

- [ ] **步骤 3：实现最小服务**

使用 `http.createServer` 和 `new URL(req.url, 'http://127.0.0.1')`：

1. 只路由 `/paste` 和 `/list`。
2. `/paste` 只接受 JSON、非空字符串 `content`、`type === 'text'`。
3. 请求体按 UTF-8 累积并限制在 2 MiB；超过限制返回 `413`。
4. 文本超过 500,000 个 JavaScript 字符返回 `413`。
5. `/list` 的缺省过滤值为 `text`，其他过滤值返回 `400`。
6. 所有响应使用 JSON，未知路径返回 `404`，错误方法返回 `405`。
7. `start()` 调用 `server.listen(port, '127.0.0.1')`；监听错误拒绝 Promise，调用方可保持应用运行。
8. `stop()` 对未启动服务安全，并等待 `close` 完成；`reconfigure()` 先停止旧服务再按开关启动新服务。

- [ ] **步骤 4：运行测试确认通过**

运行：`npx vitest run tests/pasteApi.test.ts`

预期：全部通过。

- [ ] **步骤 5：提交**

```text
git add electron/main/pasteApi.ts tests/pasteApi.test.ts
git commit -m "feat: add loopback paste HTTP server"
```

### 任务 3：接入 ItemStore 与应用生命周期

**文件：**
- 修改：`electron/main/state.ts`
- 修改：`electron/main/ipc.ts`
- 修改：`electron/main/index.ts`
- 修改：`tests/pasteApi.test.ts` 或新增 `tests/pasteApiLifecycle.test.ts`

**接口：**
- 在 `state.ts` 增加 `addTextToHistory(content: string): boolean`，构造现有 `ItemData` 文本字段，调用 `store.add(data, loadSettings().historyLimit)`，成功时调用 `pushState.items({ reason: 'usage' })`。
- 在 `state.ts` 增加 `listTextHistory(): Array<{ content: string; type: 'text' }>`，遍历 `store.list()`，只保留 `kind === 'text'`，用 `store.getFullText(id)` 返回完整文本。
- 在 `index.ts` 创建单例 `PasteApiServer`，初始化后按设置启动，`before-quit` 停止。
- 在 `ipc.ts` 的 `settings:update` 保存设置后调用服务 `reconfigure(next.pasteApiEnabled, next.pasteApiPort)`，异步错误只记录并发出一次错误 toast，不阻塞设置响应。

- [ ] **步骤 1：先写接入测试**

验证文本 API 写入后 `ItemStore` 产生文本项目、重复文本走现有去重、长文本列表读取完整内容，以及设置更新能够触发服务重绑。

- [ ] **步骤 2：运行接入测试确认失败**

运行：`npx vitest run tests/pasteApi.test.ts tests/pasteApiSettings.test.ts`

预期：因 state/lifecycle 导出和调用尚不存在而失败。

- [ ] **步骤 3：实现接入**

复用 `shared/linkText.ts` 的 URL 判断和现有颜色正则语义；不读取或写入系统剪贴板。应用退出顺序中先停止 API，再继续已有 watcher、计时器和存储清理。

- [ ] **步骤 4：运行测试确认通过**

运行：`npx vitest run tests/pasteApi.test.ts tests/pasteApiSettings.test.ts`

预期：通过。

- [ ] **步骤 5：提交**

```text
git add electron/main/state.ts electron/main/ipc.ts electron/main/index.ts tests
git commit -m "feat: wire paste API into app lifecycle"
```

### 任务 4：在行为设置中增加控件

**文件：**
- 修改：`src/components/Settings.tsx:488-620`
- 修改：`src/styles/settings.css`（仅在现有设置控件不足时增加最小输入样式）
- 测试：`tests/pasteApiSettings.test.ts`

**接口：**
- 开关调用 `patch({ pasteApiEnabled: value })`。
- 端口输入只允许数字，编辑时保持本地值，失焦/回车时钳制到 `1024..65535` 并调用 `patch({ pasteApiPort })`。
- 关闭服务时端口输入禁用；描述显示 `127.0.0.1:<port>`。

- [ ] **步骤 1：先写设置页结构测试**

断言 `Settings.tsx` 使用新字段、显示 `127.0.0.1`、端口范围和对应 `patch` 调用。

- [ ] **步骤 2：运行测试确认失败**

运行：`npx vitest run tests/pasteApiSettings.test.ts`

预期：源码断言失败，因为设置页尚无 API 控件。

- [ ] **步骤 3：实现控件**

在 Behaviour 的 General & Startup 组增加一行 API 开关；启用时在同一行下方显示端口数字输入，沿用现有 `.set-row` 布局和控件风格，不新增独立设置页面。

- [ ] **步骤 4：运行测试确认通过**

运行：`npx vitest run tests/pasteApiSettings.test.ts`

预期：通过。

- [ ] **步骤 5：提交**

```text
git add src/components/Settings.tsx src/styles/settings.css tests/pasteApiSettings.test.ts
git commit -m "feat: add paste API settings controls"
```

### 任务 5：全量验证与收尾

**文件：** 无新增功能文件；必要时只修复本次改动引起的类型或测试问题。

- [ ] **步骤 1：运行聚焦测试**

```text
npx vitest run tests/pasteApi.test.ts tests/pasteApiSettings.test.ts
```

- [ ] **步骤 2：运行类型检查**

```text
npm run typecheck
```

- [ ] **步骤 3：运行完整测试**

```text
npm test
```

记录任何与本次改动无关的既有环境失败，不将其误报为本功能通过。

- [ ] **步骤 4：检查最终差异**

```text
git diff HEAD~4 --stat
git status --short
```

确认没有生成临时文件、没有修改图片/文件存储语义，且工作树只包含本功能提交。
