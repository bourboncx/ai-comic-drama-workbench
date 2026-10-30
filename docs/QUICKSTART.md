# 快速开始

## 环境要求

- Windows 10 / 11；
- Node.js 18 或更高版本；
- npm；
- 建议安装 FFmpeg；
- 按需安装 Ollama、ComfyUI 或 MatrixMedia GUI。

云 API 模型不要求本机显卡。本地模型所需显存取决于具体模型、量化方式、分辨率和工作流。

## 启动应用

最简单的方式是双击项目根目录：

```text
启动漫剧工坊.bat
```

或运行：

```powershell
npm install
npm run dev
```

打开 <http://127.0.0.1:4173>。

## 配置剧本模型

默认使用 Ollama：

```powershell
ollama serve
ollama pull qwen3.5:9b
```

在“剧本”页面选择 Ollama 与对应模型。也可以使用 OpenAI 兼容接口或自定义 HTTP 服务。

## 配置本地视频模型

1. 启动 ComfyUI；
2. 确认地址为 `http://127.0.0.1:8188`；
3. 在“服务与模型 → 本地服务”中测试连接；
4. 导入 MiniMax H3、Wan 3.0 或 HunyuanVideo 1.5 对应工作流；
5. 在项目设置中选择本地模型和硬件档位。

当前仓库尚未内置模型权重和完整 ComfyUI 工作流文件。

## 配置云 API

```powershell
Copy-Item config/keys.example.json config/keys.local.json
```

在页面中打开“服务与模型 → 凭据”，选择提供方并保存。也可以使用环境变量，例如：

```powershell
$env:MINIMAX_API_KEY = "..."
$env:RUNWAY_API_KEY = "..."
$env:VIDU_API_KEY = "..."
```

完整变量名见 `README.md` 和 `config/keys.example.json`。

## 配置 MatrixMedia

1. 从其官方仓库或 Release 安装并启动 MatrixMedia GUI；
2. 在 MatrixMedia 中完成媒体账号登录；
3. 在本项目节点引擎中启用 MatrixMedia；
4. 保持地址 `http://127.0.0.1:30088`；
5. 进入导出页勾选发布平台。

默认保存草稿，不会自动直接发布。

## 常见问题

### 页面能运行，但不会生成真实视频

当前生成队列包含可交互的演示状态机。需要继续接入所选提供方的任务提交、状态轮询、结果下载和失败恢复逻辑。

### FFmpeg 显示不可用

安装 FFmpeg，并确保 `ffmpeg` 命令在系统 `PATH` 中可用，然后重新启动应用。

### MatrixMedia 显示 GUI 未连接

确认 MatrixMedia GUI 正在运行，并检查 `http://127.0.0.1:30088/platforms` 是否可访问。
