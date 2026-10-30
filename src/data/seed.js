export const navItems = [
  { id: 'project', label: '项目', icon: 'FolderKanban' },
  { id: 'workflow', label: '流程', icon: 'Workflow' },
  { id: 'script', label: '剧本', icon: 'ScrollText' },
  { id: 'characters', label: '角色', icon: 'UserRound' },
  { id: 'storyboard', label: '分镜', icon: 'Clapperboard' },
  { id: 'generate', label: '生成', icon: 'Zap' },
  { id: 'quality', label: '质检', icon: 'CircleCheck' },
  { id: 'export', label: '导出', icon: 'Upload' },
]

export const providerCatalog = {
  script: [
    { id: 'ollama', name: 'Ollama', mode: 'local', models: ['qwen3.5:9b', 'qwen2.5:7b', 'qwen3.6:35b-a3b'], baseUrl: 'http://127.0.0.1:11434', credential: null },
    { id: 'openai-compatible', name: 'OpenAI 兼容接口', mode: 'cloud', models: ['自定义模型'], baseUrl: 'https://api.openai.com/v1', credential: 'openai' },
    { id: 'custom-script', name: '自定义 HTTP', mode: 'custom', models: ['自定义模型'], baseUrl: 'http://127.0.0.1:8000/v1', credential: 'custom' },
  ],
  video: [
    {
      id: 'comfy-h3', name: 'MiniMax H3 · 本地', mode: 'local', runtime: 'local', adapter: 'comfyui', status: 'stable',
      models: ['MiniMax H3 FL2VA', 'MiniMax H3 Ref2VA'], baseUrl: 'http://127.0.0.1:8188', credential: null,
      durations: [4, 5, 6, 8, 10, 12, 15], resolutions: ['验证 544×960', '最终 768×1344', '最高 2K'],
      capabilities: ['首尾帧接力', '多参考图', '原生音频', '4–15 秒', '最高 2K'],
    },
    {
      id: 'comfy-wan', name: 'Wan 3.0 · 本地', mode: 'local', runtime: 'local', adapter: 'comfyui', status: 'stable',
      models: ['Wan 3.0 I2V', 'Wan 3.0 Reference-to-Video', 'Wan 3.0 Video Edit'], baseUrl: 'http://127.0.0.1:8188', credential: null,
      durations: [5, 10, 15, 30], resolutions: ['验证 544×960', '最终 720×1280', '最高 1080p'],
      capabilities: ['最长 30 秒', '多角色参考', '参考视频', '视频编辑'],
    },
    {
      id: 'comfy-hunyuan15', name: 'HunyuanVideo 1.5 · 本地', mode: 'local', runtime: 'local', adapter: 'comfyui', status: 'stable',
      models: ['HunyuanVideo 1.5 I2V 720p', 'HunyuanVideo 1.5 T2V 720p', 'HunyuanVideo 1.5 I2V Distilled'], baseUrl: 'http://127.0.0.1:8188', credential: null,
      durations: [5], resolutions: ['验证 544×960', '720p'],
      capabilities: ['图生视频', '文生视频', 'LoRA', 'ComfyUI'],
    },
    {
      id: 'minimax', name: 'MiniMax H3 · API', mode: 'cloud', runtime: 'api', adapter: 'minimax-h3', status: 'stable',
      models: ['MiniMax H3 2K', 'MiniMax H3 Context IR', 'MiniMax H3 Regenerate 2K'], baseUrl: 'https://api.minimax.io', credential: 'minimax',
      durations: [4, 5, 6, 8, 10, 12, 15], resolutions: ['服务商默认', '1080p', '2K'],
      capabilities: ['首尾帧接力', '多参考图', '原生音频', '4–15 秒', '最高 2K'],
    },
    {
      id: 'byteplus', name: 'Seedance 2.5 · API', mode: 'cloud', runtime: 'api', adapter: 'seedance', status: 'stable',
      models: ['Seedance 2.5'], baseUrl: 'https://ark.ap-southeast.bytepluses.com', credential: 'byteplus',
      durations: [5, 10, 15, 30], resolutions: ['服务商默认', '1080p'],
      capabilities: ['30 秒叙事', '多参考', '局部编辑', '原生音频'],
    },
    {
      id: 'kling', name: '可灵 3.0 / Omni · API', mode: 'cloud', runtime: 'api', adapter: 'kling', status: 'stable',
      models: ['Kling 3.0 Omni', 'Kling 3.0', 'Kling 3.0 Turbo'], baseUrl: 'https://api.klingai.com', credential: 'kling',
      durations: [3, 5, 10, 15], resolutions: ['服务商默认', '1080p'],
      capabilities: ['首尾帧', '多镜头', '多人共指', '原生音频'],
    },
    {
      id: 'kling4-preview', name: '可灵 4.0 · Preview API', mode: 'cloud', runtime: 'api', adapter: 'kling', status: 'preview',
      models: ['Kling 4.0 Preview'], baseUrl: 'https://api.klingai.com', credential: 'kling',
      durations: [5, 10, 15, 30], resolutions: ['服务商默认', '1080p'],
      capabilities: ['最长 30 秒', '多关键帧', 'Omni 引用', '原生音频'],
    },
    {
      id: 'vidu-drama', name: 'Vidu Q3 Drama · API', mode: 'cloud', runtime: 'api', adapter: 'vidu', status: 'stable',
      models: ['Vidu Q3 Drama', 'Vidu Q3 Pro', 'Vidu Q3 Mix'], baseUrl: 'https://api.vidu.com', credential: 'vidu',
      durations: [5, 8, 10, 16], resolutions: ['服务商默认', '1080p'],
      capabilities: ['漫剧专项', '对白表演', '角色站位', '参考生成', '原生音频'],
    },
    {
      id: 'vidu-q4-preview', name: 'Vidu Q4 · Preview API', mode: 'cloud', runtime: 'api', adapter: 'vidu', status: 'preview',
      models: ['Vidu Q4 Preview'], baseUrl: 'https://api.vidu.com', credential: 'vidu',
      durations: [4, 8, 12, 16], resolutions: ['服务商默认', '1080p', '4K'],
      capabilities: ['最高 4K', '音画同步', '多参考生成', '镜头控制'],
    },
    {
      id: 'runway', name: 'Runway Gen-4.5 · API', mode: 'cloud', runtime: 'api', adapter: 'runway', status: 'stable',
      models: ['Gen-4.5', 'Runway Model Router'], baseUrl: 'https://api.dev.runwayml.com', credential: 'runway',
      durations: [5, 10], resolutions: ['服务商默认', '720p', '1080p'],
      capabilities: ['复杂运动', '摄影机调度', '图生视频', '文生视频'],
    },
    {
      id: 'google-omni', name: 'Google Gemini Omni Flash · API', mode: 'cloud', runtime: 'api', adapter: 'google-omni', status: 'stable',
      models: ['Gemini Omni 1.1 Flash', 'Gemini Omni Flash'], baseUrl: 'https://generativelanguage.googleapis.com', credential: 'google',
      durations: [4, 6, 8], resolutions: ['服务商默认', '1080p'],
      capabilities: ['视频生成', '对话式编辑', '图/视频输入', '原生音频'],
    },
    {
      id: 'custom-video', name: '自定义 HTTP · API', mode: 'custom', runtime: 'custom', adapter: 'openai-compatible', status: 'custom',
      models: ['自定义模型'], baseUrl: 'http://127.0.0.1:9000', credential: 'custom',
      durations: [5, 10, 15], resolutions: ['服务商默认'], capabilities: ['自定义协议映射'],
    },
  ],
}

export const videoProvidersByRuntime = {
  local: providerCatalog.video.filter((provider) => provider.runtime === 'local'),
  api: providerCatalog.video.filter((provider) => provider.runtime === 'api'),
  custom: providerCatalog.video.filter((provider) => provider.runtime === 'custom'),
}

export const hardwareProfiles = [
  { id: 'gpu-8gb', name: '本地 GPU · 8GB', resolution: '草稿 480×854', steps: 4, concurrency: 1, note: '最低显存模式，优先验证接力链路' },
  { id: 'gpu-12gb', name: '本地 GPU · 12–16GB', resolution: '验证 544×960', steps: 8, concurrency: 1, note: '适合当前 RTX 4080 Laptop 12GB' },
  { id: 'gpu-24gb', name: '本地 GPU · 24GB+', resolution: '最终 768×1344', steps: 8, concurrency: 1, note: '可提高分辨率与量化精度' },
  { id: 'cloud-api', name: '云端 API', resolution: '服务商默认', steps: 8, concurrency: 3, note: '并发数受账号限流和预算约束' },
  { id: 'manual', name: '手动配置', resolution: '验证 544×960', steps: 8, concurrency: 1, note: '完全按用户参数执行' },
]

const scenePrompts = [
  '雨夜的老巷入口，少女撑着红伞快步走入画面，远处灯笼在雨幕中虚化。',
  '少女在湿润的青石路上放慢脚步，听见身后若有若无的脚步声。',
  '少女停下并回头望向镜头，红伞略微倾斜，眼神警觉而克制。',
  '一封被雨水打湿的旧信从门缝滑出，少女蹲下拾起。',
  '特写：信封上写着她失踪多年的姐姐名字，指尖微微发抖。',
  '雨夜的老巷，暖黄的路灯下，少女撑着红色雨伞回眸，浅景深，电影级光影，细腻的 3D 动漫风格，情绪克制而温柔。',
  '少女进入废弃照相馆，玻璃橱窗倒映出陌生人影。',
  '她擦去旧相框上的灰尘，发现童年合影中多了一个陌生孩子。',
  '门外雷声响起，陌生影子从橱窗边快速掠过。',
  '少女追出照相馆，雨幕中只剩一把被遗弃的黑伞。',
  '黑伞下压着第二封信，里面是一张今日拍摄的照片。',
  '照片中的少女正站在照相馆门口，而拍摄角度来自她身后。',
  '她猛然转身，巷子空无一人，只有红灯笼在风中摇摆。',
  '远处传来姐姐熟悉的哼唱，少女循声跑向巷子尽头。',
  '尽头木门缓缓开启，暖光中出现一个模糊的女人身影。',
  '少女站在门外不敢靠近，手里的旧信被雨水彻底浸透。',
  '女人伸出手，露出与少女相同的红绳手链。',
  '少女跨进门内，木门合拢；镜头停在雨中的红伞上。',
]

export const makeShots = (duration = 90, clipDuration = 5) => Array.from({ length: Math.ceil(duration / clipDuration) }, (_, index) => {
  const prompt = scenePrompts[index] || `延续上一镜头的角色、场景和光线，完成第 ${index + 1} 段叙事动作，并在自然停顿点结束。`
  const group = Math.floor(index / 3) + 1
  const clip = (index % 3) + 1
  const start = index * clipDuration
  const end = Math.min(start + clipDuration, duration)
  return {
    id: `S${String(group).padStart(2, '0')}-C${String(clip).padStart(2, '0')}`,
    index,
    group,
    clip,
    start,
    end,
    duration: end - start,
    prompt,
    startState: index === 5 ? '少女走在雨中的巷子里，背对镜头，手持红伞，缓慢前行。' : index === 0 ? '少女站在巷口，背对镜头，手持红伞。' : '继承上一段尾帧，人物、服装、光线与机位保持一致。',
    endState: index === 5 ? '少女停下脚步，回头看向镜头，眼神略带惊讶与温柔。' : clip === 3 ? '动作在自然停顿点结束，为下一镜头剪切留出余量。' : '动作尚未完成，保留向下一段延续的运动趋势。',
    dialogue: index === 5 ? '……' : index === 2 ? '谁在那里？' : index === 14 ? '姐姐……是你吗？' : '',
    status: 'draft',
    progress: 0,
    qc: { identity: 'pending', anchor: 'pending', motion: 'pending' },
  }
})

export const defaultProject = {
  title: '雨夜来信',
  series: {
    name: '雨夜来信系列',
    bibleVersion: 'SERIES-1.0',
    visualModelFamily: 'MiniMax H3 / ComfyUI',
    styleFingerprint: 'cinematic-3d-rain-v1',
    identityThreshold: 0.78,
    reviewPolicy: '低于阈值暂停并人工复核',
  },
  duration: 90,
  clipDuration: 5,
  aspectRatio: '9:16',
  style: '电影感 3D 动画',
  inputMode: 'theme',
  theme: '一个女孩在雨夜收到失踪姐姐寄来的信，循着线索走进一条会改变记忆的老巷。',
  sourceScript: '',
  characters: [
    { id: 'char-1', name: '林夏', role: '主角', description: '23 岁，黑发低髻，深绿色雨衣，红绳手链；克制、敏锐，遇险时不轻易慌张。', locked: true, identityVersion: 'LINXIA-ID-v1', identityEngine: 'reference-pack', referenceCount: 6, referenceTarget: 8, wardrobeVersion: '雨衣-v1', voiceId: 'linxia-zh-v1', negativePrompt: '发色变化、年龄变化、五官漂移、红绳缺失', faceThreshold: 0.82, calibrationStatus: 'passed' },
    { id: 'char-2', name: '林秋', role: '姐姐', description: '28 岁，与林夏眉眼相似，米色长外套，神情温柔但带有距离感。', locked: false, identityVersion: 'LINQIU-ID-v1', identityEngine: 'instantid', referenceCount: 3, referenceTarget: 8, wardrobeVersion: '米色外套-v1', voiceId: 'linqiu-zh-v1', negativePrompt: '与林夏混脸、年龄过小、外套颜色变化', faceThreshold: 0.8, calibrationStatus: 'needs-review' },
  ],
  settings: {
    hardwareProfile: 'gpu-12gb',
    concurrency: 1,
    scriptProvider: 'ollama',
    scriptModel: 'qwen3.5:9b',
    videoProvider: 'comfy-h3',
    videoModel: 'MiniMax H3 FL2VA',
    resolution: '验证 544×960',
    steps: 8,
    seedMode: '镜头固定',
  },
}
