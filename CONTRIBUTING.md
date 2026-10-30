# 贡献指南

感谢你愿意改进漫剧工坊。

## 可以贡献什么

- 视频模型、剧本模型和 TTS 服务适配器；
- ComfyUI 工作流与参数映射；
- 尾帧接力、重复帧检测和 FFmpeg 拼接实现；
- 人脸身份、动作连续性和镜头接缝质检；
- 角色库、系列资产和批量剧集能力；
- 文档、测试、可访问性和界面改进。

## 本地开发

```powershell
npm install
npm run dev
```

提交前运行：

```powershell
npm run check
```

## 提交约定

建议使用简洁的 Conventional Commits 风格：

```text
feat: add provider adapter
fix: prevent unsupported duration selection
docs: explain local credential storage
```

一个 Pull Request 尽量只解决一个清晰问题，并说明改动、原因、验证方式，以及是否依赖外部模型、账号或 API Key。

## 安全与隐私

- 不要提交真实 API Key、Cookie、手机号、账号分组或生成内容；
- 不要把 `config/*.local.json`、`.env`、`output/` 加入提交；
- 新增外部服务时，应由本机服务端读取凭据，浏览器端只接收掩码；
- 对第三方平台的发布操作必须由用户明确触发，默认优先保存草稿。

## 第三方代码

引入第三方代码前必须说明来源、版本和许可证。优先使用独立 HTTP API、Sidecar 或可选依赖，避免直接复制大型项目源码。
