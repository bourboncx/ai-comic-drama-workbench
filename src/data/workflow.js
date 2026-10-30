export const workflowNodeDefinitions = [
  {
    id: 'input', group: '准备', title: '主题 / 剧本输入', required: true,
    description: '人工输入主题、完整剧本或导入结构化项目。',
    engine: 'builtin-input', engines: [{ id: 'builtin-input', name: '内置输入器' }],
    fallback: '缺少主题时暂停并等待人工输入。', source: '内置',
  },
  {
    id: 'script', group: '准备', title: '剧本结构化', required: true,
    description: '生成角色、场景、剧情节拍、对白与时长结构。',
    engine: 'ollama', engines: [{ id: 'ollama', name: 'Ollama 本地模型' }, { id: 'manual-script', name: '人工确认剧本' }, { id: 'cloud-llm', name: '云端 LLM API' }],
    fallback: '模型不可用时保留原剧本，进入人工确认。', source: '内置编排',
  },
  {
    id: 'characters', group: '准备', title: '角色圣经与锚点', required: true,
    description: '从系列角色库注入固定身份版本、参考图组、服装、声线和不可漂移特征；所有集共用同一基线。',
    engine: 'builtin-characters', engines: [{ id: 'builtin-characters', name: '系列角色库 + 参考图组' }, { id: 'instantid-character', name: 'InstantID 身份注入' }, { id: 'pulid-character', name: 'PuLID 身份注入' }, { id: 'lora-character', name: '角色 LoRA' }, { id: 'provider-character', name: '云 API 角色资产 ID' }, { id: 'manual-character', name: '人工上传定妆图' }],
    fallback: '身份引擎不可用时必须使用已锁定的参考图组；缺少基准角色资产时暂停。', source: '内置角色库 / InstantID / PuLID',
  },
  {
    id: 'storyboard', group: '准备', title: '分镜与镜头组', required: true,
    description: '按目标时长拆分镜头，定义开始状态、结束状态和接力组。',
    engine: 'builtin-storyboard', engines: [{ id: 'builtin-storyboard', name: '内置分镜器' }, { id: 'ollama-storyboard', name: 'Ollama 分镜增强' }],
    fallback: '保留人工可编辑的基础分镜。', source: '内置编排',
  },
  {
    id: 'keyframes', group: '生成', title: '首尾关键帧', required: true,
    description: '为新镜头生成身份一致的首帧；需要时补充末帧约束。',
    engine: 'comfy-keyframe', engines: [{ id: 'comfy-keyframe', name: 'ComfyUI 图像工作流' }, { id: 'cloud-image', name: '云端图像 API' }, { id: 'manual-keyframe', name: '人工上传关键帧' }],
    fallback: '生成器不可用时暂停，允许人工上传后继续。', source: 'ComfyUI 适配器',
  },
  {
    id: 'video', group: '生成', title: '视频片段生成', required: true,
    description: '按照当前模型路由生成每个片段，本地模型与付费 API 平级。',
    engine: 'provider-router', engines: [{ id: 'provider-router', name: '当前视频模型路由' }, { id: 'manual-video', name: '人工导入片段' }],
    fallback: '失败片段单独重试；也可人工导入替换。', source: '内置模型路由',
  },
  {
    id: 'relay', group: '生成', title: '抽尾帧与接力', required: false, defaultEnabled: true,
    description: '抽取上一段无损尾帧，作为下一段首帧并去除重复帧。',
    engine: 'ffmpeg-relay', engines: [{ id: 'ffmpeg-relay', name: 'FFmpeg 接力' }, { id: 'independent-shots', name: '独立镜头模式' }],
    fallback: '关闭后各片段独立生成，仅在剪辑点拼接。', source: '内置 FFmpeg',
  },
  {
    id: 'continuity', group: '质检', title: '角色与接缝质检', required: false, defaultEnabled: true,
    description: '同时对比系列角色库基准与相邻尾帧，检查跨集身份、服装版本、接缝和动作突变。',
    engine: 'builtin-qc', engines: [{ id: 'builtin-qc', name: '内置 QC 指标' }, { id: 'manual-qc', name: '仅人工审核' }],
    fallback: '关闭后只给出人工检查清单，不阻断导出。', source: '内置质检',
  },
  {
    id: 'voice', group: '后期', title: '对白与配音', required: false, defaultEnabled: true,
    description: '统一角色声线，或直接保留视频模型的原生音轨。',
    engine: 'native-audio', engines: [{ id: 'native-audio', name: '保留 H3 原生音频' }, { id: 'moneyprinter-tts', name: 'MoneyPrinterTurbo TTS' }, { id: 'narrato-tts', name: 'NarratoAI 本地 TTS' }, { id: 'manual-audio', name: '人工导入音轨' }],
    fallback: '关闭后保留原片音轨；没有音轨时输出静音视频。', source: 'MoneyPrinterTurbo / NarratoAI',
  },
  {
    id: 'subtitles', group: '后期', title: '字幕生成与烧录', required: false, defaultEnabled: true,
    description: '由对白时间轴生成 SRT，也可通过 ASR 校准实际语音。',
    engine: 'script-srt', engines: [{ id: 'script-srt', name: '内置对白转 SRT' }, { id: 'moneyprinter-subtitle', name: 'MoneyPrinterTurbo 字幕' }, { id: 'funclip-asr', name: 'FunClip ASR 校准' }],
    fallback: '关闭后不生成字幕，视频流程继续。', source: 'MoneyPrinterTurbo / FunClip',
  },
  {
    id: 'bgm', group: '后期', title: '背景音乐与混音', required: false, defaultEnabled: false,
    description: '选择本地音乐或让服务生成配乐，并自动压低对白区间音量。',
    engine: 'moneyprinter-bgm', engines: [{ id: 'moneyprinter-bgm', name: 'MoneyPrinterTurbo BGM' }, { id: 'local-bgm', name: '本地音乐文件' }],
    fallback: '关闭后不添加背景音乐。', source: 'MoneyPrinterTurbo',
  },
  {
    id: 'multilingual', group: '后期', title: '多语字幕与配音', required: false, defaultEnabled: false,
    description: '字幕切分、术语校对、翻译和目标语言配音。',
    engine: 'videolingo', engines: [{ id: 'videolingo', name: 'VideoLingo' }, { id: 'manual-translation', name: '人工字幕翻译' }],
    fallback: '关闭后只输出原始语言版本。', source: 'VideoLingo',
  },
  {
    id: 'assembly', group: '交付', title: '拼接与成片', required: true,
    description: '统一帧率和编码，组合视频、声音、字幕并输出成片。',
    engine: 'ffmpeg-assembly', engines: [{ id: 'ffmpeg-assembly', name: '内置 FFmpeg' }, { id: 'moneyprinter-assembly', name: 'MoneyPrinterTurbo 成片器' }],
    fallback: 'FFmpeg 不可用时暂停，不丢失上游产物。', source: '内置 / MoneyPrinterTurbo',
  },
  {
    id: 'jianying', group: '交付', title: '剪映工程导出', required: false, defaultEnabled: false,
    description: '除 MP4 外生成可继续编辑的剪映草稿工程。',
    engine: 'narrato-jianying', engines: [{ id: 'narrato-jianying', name: 'NarratoAI 剪映草稿' }],
    fallback: '关闭后只输出标准 MP4、SRT 和项目 JSON。', source: 'NarratoAI',
  },
]

export const makeWorkflowState = () => workflowNodeDefinitions.map((node) => ({
  id: node.id,
  enabled: node.required || node.defaultEnabled !== false,
  engine: node.engine,
  status: 'idle',
  progress: 0,
}))
