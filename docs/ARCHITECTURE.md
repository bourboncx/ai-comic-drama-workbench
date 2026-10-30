# 架构与数据流

## 总览

漫剧工坊采用本机 Web 应用架构：

```text
React / Vite UI
      │
      ▼
Express 本机服务 127.0.0.1:4173
      ├── 本机配置与凭据掩码
      ├── Ollama / ComfyUI / FFmpeg
      ├── 云模型 API 适配器
      ├── 开源 Sidecar / HTTP 引擎
      └── MatrixMedia GUI HTTP API
```

浏览器负责项目编辑、流程编排和状态展示；敏感凭据、文件路径和第三方请求由本机服务端处理。

## 前端

- `src/App.jsx`：应用状态、视图切换、队列演示与项目持久化；
- `src/components/WorkspaceViews.jsx`：项目、剧本、角色、生成、质检和导出页面；
- `src/components/WorkflowView.jsx`：可关闭工作流节点；
- `src/components/ServiceDrawer.jsx`：本地服务、节点引擎、云模型和凭据配置；
- `src/data/seed.js`：模型目录、能力约束和默认项目。

## 本机服务端

`server.mjs` 同时提供 Vite 开发中间件或生产静态服务、本机配置读写、服务连通性测试、模型能力校验、开源引擎 localhost 代理和 MatrixMedia 发布代理。

## 配置

可提交模板：

- `config/keys.example.json`
- `config/integrations.example.json`

本机私有文件：

- `config/keys.local.json`
- `config/integrations.local.json`

私有文件不会进入版本控制。

## 角色一致性

尾帧接力只负责相邻片段的画面连续。跨集角色一致性由系列角色库负责：锁定身份版本、保存参考图、绑定服装与声线、注入系列基线，并在生成后同时比较角色基准与相邻尾帧。

## 建议的真实任务接口

后续提供方适配器建议统一为：

```text
createTask(input) → providerTaskId
getTask(providerTaskId) → queued | running | succeeded | failed
downloadResult(providerTaskId) → local artifact
cancelTask(providerTaskId)
```

统一任务层负责重试、超时、预算、并发、取消和产物校验；提供方适配器只处理请求映射与响应归一化。
