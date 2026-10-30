import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  FileJson,
  Film,
  ImagePlus,
  Library,
  LoaderCircle,
  LockKeyhole,
  Mic2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Save,
  Send,
  Share2,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  WandSparkles,
} from 'lucide-react'
import { hardwareProfiles, providerCatalog, videoProvidersByRuntime } from '../data/seed.js'
import { getMediaPlatforms, publishToMedia } from '../lib/api.js'
import { PageIntro, SaveButton } from './AppChrome.jsx'

export function ProjectView({ project, setProject, notify, onApplySpec }) {
  const clipCount = Math.ceil(project.duration / project.clipDuration)
  const plannedDuration = clipCount * project.clipDuration
  const profile = hardwareProfiles.find((item) => item.id === project.settings.hardwareProfile) || hardwareProfiles[1]
  const videoProvider = providerCatalog.video.find((item) => item.id === project.settings.videoProvider) || providerCatalog.video[0]
  const isCloudVideo = videoProvider.runtime === 'api'
  const usesLocalGpu = videoProvider.runtime === 'local'
  const setProfile = (profileId) => {
    const selected = hardwareProfiles.find((item) => item.id === profileId)
    setProject((current) => ({ ...current, settings: { ...current.settings, hardwareProfile: profileId, resolution: selected.resolution, steps: selected.steps, concurrency: selected.concurrency } }))
  }
  const setVideoProvider = (providerId) => {
    const selected = providerCatalog.video.find((item) => item.id === providerId)
    setProject((current) => ({
      ...current,
      clipDuration: selected.durations.includes(current.clipDuration) ? current.clipDuration : selected.durations[0],
      settings: {
        ...current.settings,
        videoProvider: providerId,
        videoModel: selected.models[0],
        ...(selected.runtime === 'api'
          ? { hardwareProfile: 'cloud-api', concurrency: 3, resolution: '服务商默认' }
          : selected.runtime === 'local' && current.settings.hardwareProfile === 'cloud-api'
            ? { hardwareProfile: 'manual', concurrency: 1, resolution: '验证 544×960' }
            : {}),
      },
    }))
  }
  return (
    <div className="standard-page">
      <PageIntro title="项目设置" description="定义短剧规格，所有分镜会继承这里的基础约束。" />
      <div className="open-form project-form">
        <label><span>项目名称</span><input value={project.title} onChange={(e) => setProject((p) => ({ ...p, title: e.target.value }))} /></label>
        <div className="form-columns">
          <label><span>目标成片时长</span><input type="number" min="15" max="600" step="5" value={project.duration} onChange={(e) => setProject((p) => ({ ...p, duration: Math.max(15, Number(e.target.value) || 15) }))} /></label>
          <label><span>单段生成时长</span><select value={project.clipDuration} onChange={(e) => setProject((p) => ({ ...p, clipDuration: Number(e.target.value) }))}>{videoProvider.durations.map((duration) => <option value={duration} key={duration}>{duration} 秒</option>)}</select></label>
          <label><span>画面比例</span><select value={project.aspectRatio} onChange={(e) => setProject((p) => ({ ...p, aspectRatio: e.target.value }))}><option>9:16</option><option>16:9</option><option>1:1</option></select></label>
        </div>
        <div className="form-columns provider-row">
          <label><span>视频生成服务</span><select value={project.settings.videoProvider} onChange={(e) => setVideoProvider(e.target.value)}>
            <optgroup label="本地模型">{videoProvidersByRuntime.local.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</optgroup>
            <optgroup label="云端 API">{videoProvidersByRuntime.api.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</optgroup>
            <optgroup label="自定义适配器">{videoProvidersByRuntime.custom.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</optgroup>
          </select></label>
          <label><span>视频模型</span><select value={project.settings.videoModel} onChange={(e) => setProject((p) => ({ ...p, settings: { ...p.settings, videoModel: e.target.value } }))}>{videoProvider.models.map((model) => <option value={model} key={model}>{model}</option>)}</select></label>
          <label><span>运行方式</span><input value={isCloudVideo ? '付费云 API · 不占用本机显存' : usesLocalGpu ? '本机模型 · 按显存选档' : '自定义服务适配器'} readOnly /></label>
        </div>
        <div className={`form-columns hardware-row ${!usesLocalGpu ? 'cloud-runtime' : ''}`}>
          {usesLocalGpu ? <label><span>本机硬件 / 运行档位</span><select value={project.settings.hardwareProfile} onChange={(e) => setProfile(e.target.value)}>{hardwareProfiles.filter((item) => item.id !== 'cloud-api').map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label> : <label><span>资源来源</span><input value={isCloudVideo ? '由 API 服务商托管' : '由自定义适配器决定'} readOnly /></label>}
          <label><span>同时生成任务</span><input type="number" min="1" max="10" value={project.settings.concurrency} onChange={(e) => setProject((p) => ({ ...p, settings: { ...p.settings, concurrency: Math.max(1, Number(e.target.value) || 1) } }))} /></label>
          <label><span>{isCloudVideo ? '输出规格' : '推荐分辨率'}</span><input value={project.settings.resolution} onChange={(e) => setProject((p) => ({ ...p, settings: { ...p.settings, resolution: e.target.value } }))} /></label>
        </div>
        <div className="provider-capabilities"><span>{videoProvider.status === 'preview' ? '预览版' : videoProvider.status === 'stable' ? '正式版' : '自定义'}</span>{videoProvider.capabilities.map((capability) => <em key={capability}>{capability}</em>)}</div>
        <label><span>整体风格</span><input value={project.style} onChange={(e) => setProject((p) => ({ ...p, style: e.target.value }))} /></label>
        <div className="spec-summary">
          <div><strong>{clipCount}</strong><span>生成片段</span></div><i>×</i><div><strong>{project.clipDuration}s</strong><span>每段</span></div><i>=</i><div><strong>{plannedDuration}s</strong><span>计划时长</span></div>
          <p>{isCloudVideo ? '云 API 不读取本机 GPU 或显存，片段时长、并发和输出规格以服务商能力为准' : usesLocalGpu ? profile.note : '自定义适配器由用户配置运行位置与资源'}{plannedDuration !== project.duration ? `；末段将裁切 ${plannedDuration - project.duration} 秒以对齐目标时长。` : '；当前时长可整除，无需裁切末段。'}</p>
        </div>
        <div className="inline-notice"><ShieldCheck size={18} /><span>{isCloudVideo ? '当前为云 API：不要求本机显存，只需在服务设置中配置凭据名称或本地 JSON 密钥。' : usesLocalGpu ? '当前为本地模型：显存仅用于推荐模型与画质档位，不是项目硬性要求。' : '当前为自定义适配器：连接位置和鉴权方式由用户配置。'} 应用规格后会同步重建分镜、时间轴和队列。</span></div>
        <div className="page-actions"><SaveButton onClick={() => notify('项目设置已保存', 'success')}>保存项目</SaveButton><button className="primary-button" onClick={onApplySpec}><RefreshCw size={16} />应用规格并重建分镜</button></div>
      </div>
    </div>
  )
}

export function ScriptView({ project, setProject, onGenerate, notify }) {
  const provider = providerCatalog.script.find((item) => item.id === project.settings.scriptProvider) || providerCatalog.script[0]
  return (
    <div className="standard-page">
      <PageIntro title="剧本与结构" description="输入一句主题或完整剧本，再由模型整理为可执行的 5 秒分镜。" action={<button className="primary-button" onClick={onGenerate}><WandSparkles size={16} />生成分镜结构</button>} />
      <div className="script-layout">
        <section className="open-form script-input">
          <div className="segmented"><button className={project.inputMode === 'theme' ? 'active' : ''} onClick={() => setProject((p) => ({ ...p, inputMode: 'theme' }))}>输入主题</button><button className={project.inputMode === 'script' ? 'active' : ''} onClick={() => setProject((p) => ({ ...p, inputMode: 'script' }))}>粘贴剧本</button></div>
          <label><span>{project.inputMode === 'theme' ? '故事主题' : '完整剧本'}</span><textarea rows="13" value={project.inputMode === 'theme' ? project.theme : project.sourceScript} onChange={(e) => setProject((p) => ({ ...p, [p.inputMode === 'theme' ? 'theme' : 'sourceScript']: e.target.value }))} placeholder="写下人物、冲突和结局…" /></label>
          <div className="prompt-hints"><span>结构建议</span><button onClick={() => setProject((p) => ({ ...p, theme: `${p.theme}\n前 5 秒设置强钩子，中段反转，结尾留下下一集悬念。` }))}>强钩子</button><button onClick={() => setProject((p) => ({ ...p, theme: `${p.theme}\n控制为两名主要角色与三个核心场景。` }))}>控制角色</button></div>
        </section>
        <aside className="script-settings">
          <h3>剧本模型</h3>
          <label><span>服务</span><select value={project.settings.scriptProvider} onChange={(e) => setProject((p) => ({ ...p, settings: { ...p.settings, scriptProvider: e.target.value, scriptModel: providerCatalog.script.find((item) => item.id === e.target.value).models[0] } }))}>{providerCatalog.script.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span>模型</span><select value={project.settings.scriptModel} onChange={(e) => setProject((p) => ({ ...p, settings: { ...p.settings, scriptModel: e.target.value } }))}>{provider.models.map((model) => <option key={model}>{model}</option>)}</select></label>
          <label><span>JSON 结构</span><select><option>短剧分镜 v1</option></select></label>
          <div className="schema-preview"><FileJson size={20} /><span><strong>{Math.ceil(project.duration / project.clipDuration)} 个片段</strong><small>{project.duration} 秒成片 · 每段 {project.clipDuration} 秒</small></span></div>
          <button className="outline-button wide" onClick={() => notify('结构模板已保存', 'success')}><Save size={16} />保存模型设置</button>
        </aside>
      </div>
    </div>
  )
}

export function CharactersView({ project, setProject, notify }) {
  const series = project.series || { name: `${project.title}系列`, bibleVersion: 'SERIES-1.0', visualModelFamily: project.settings.videoModel, styleFingerprint: 'series-style-v1', identityThreshold: 0.78, reviewPolicy: '低于阈值暂停并人工复核' }
  const characterDefaults = { identityVersion: 'CHAR-ID-v1', identityEngine: 'reference-pack', referenceCount: 0, referenceTarget: 8, wardrobeVersion: '基础造型-v1', voiceId: '未绑定', negativePrompt: '五官漂移、年龄变化、发色变化、服装变化', faceThreshold: series.identityThreshold, calibrationStatus: 'needs-review', referenceFiles: [] }
  const getCharacter = (character) => ({ ...characterDefaults, ...character })
  const setSeries = (field, value) => setProject((p) => ({ ...p, series: { ...(p.series || series), [field]: value } }))
  const addCharacter = () => setProject((p) => ({ ...p, characters: [...p.characters, { ...characterDefaults, id: `char-${Date.now()}`, name: '新角色', role: '配角', description: '补充脸型、五官、发型、体态、服装和不可变化特征。', identityVersion: `CHAR-${p.characters.length + 1}-ID-v1`, locked: false }] }))
  const update = (id, field, value) => setProject((p) => ({ ...p, characters: p.characters.map((character) => character.id === id ? { ...character, [field]: value } : character) }))
  const remove = (id) => setProject((p) => ({ ...p, characters: p.characters.filter((character) => character.id !== id) }))
  const addReferenceFiles = (id, files) => {
    const names = [...files].map((file) => file.name)
    setProject((p) => ({ ...p, characters: p.characters.map((character) => character.id === id ? { ...character, referenceFiles: [...(character.referenceFiles || []), ...names].slice(0, 12), referenceCount: Math.min(12, (character.referenceCount || 0) + names.length), calibrationStatus: 'needs-review' } : character) }))
    notify(`已登记 ${names.length} 张参考图；接入文件存储后将写入角色资产目录。`, 'success')
  }
  const newIdentityVersion = (character) => {
    const current = getCharacter(character)
    const match = current.identityVersion.match(/^(.*-v)(\d+)$/i)
    const nextVersion = match ? `${match[1]}${Number(match[2]) + 1}` : `${current.identityVersion}-v2`
    update(character.id, 'identityVersion', nextVersion)
    update(character.id, 'locked', false)
    update(character.id, 'calibrationStatus', 'needs-review')
    notify(`${character.name} 已创建新身份版本 ${nextVersion}，旧版本不会被覆盖。`, 'success')
  }
  const calibrate = () => {
    setProject((p) => ({ ...p, characters: p.characters.map((character) => ({ ...character, calibrationStatus: (character.referenceCount || 0) >= 3 ? 'passed' : 'needs-review' })) }))
    notify('身份校准集已模拟完成；参考图不足 3 张的角色仍需复核。', 'success')
  }
  const readyCount = project.characters.filter((item) => getCharacter(item).locked && getCharacter(item).calibrationStatus === 'passed').length
  return (
    <div className="standard-page character-library-page">
      <PageIntro title="系列角色库" description="角色身份是系列资产，不属于某一集。几十集统一引用同一版本，变更时新建版本而不覆盖历史。" action={<div className="page-actions"><button className="secondary-button" onClick={calibrate}><RefreshCw size={16} />生成身份校准集</button><button className="primary-button" onClick={addCharacter}><Plus size={16} />添加角色</button></div>} />
      <section className="series-bible">
        <div className="series-bible-title"><Library size={22} /><span><strong>系列一致性基线</strong><small>每集生成前自动注入；生成后以它作为跨集比较基准</small></span><em>{readyCount}/{project.characters.length} 角色可用</em></div>
        <div className="form-columns">
          <label><span>系列名称</span><input value={series.name} onChange={(e) => setSeries('name', e.target.value)} /></label>
          <label><span>角色圣经版本</span><input value={series.bibleVersion} onChange={(e) => setSeries('bibleVersion', e.target.value)} /></label>
          <label><span>视觉模型族</span><input value={series.visualModelFamily} onChange={(e) => setSeries('visualModelFamily', e.target.value)} /></label>
          <label><span>风格指纹</span><input value={series.styleFingerprint} onChange={(e) => setSeries('styleFingerprint', e.target.value)} /></label>
          <label><span>全局身份阈值</span><input type="number" min="0.5" max="0.99" step="0.01" value={series.identityThreshold} onChange={(e) => setSeries('identityThreshold', Number(e.target.value))} /></label>
          <label><span>低分处理</span><select value={series.reviewPolicy} onChange={(e) => setSeries('reviewPolicy', e.target.value)}><option>低于阈值暂停并人工复核</option><option>自动重试一次后复核</option><option>只警告，不阻断</option></select></label>
        </div>
      </section>
      <div className="identity-rule"><LockKeyhole size={18} /><span><strong>跨集规则</strong><small>固定身份版本 + 多角度参考图 + 服装版本 + 声线 ID + 模型绑定。尾帧只解决镜头接缝，不能替代角色身份锚点。</small></span></div>
      <div className="character-list">
        {project.characters.map((rawCharacter, index) => {
          const character = getCharacter(rawCharacter)
          const pct = Math.min(100, Math.round(character.referenceCount / character.referenceTarget * 100))
          return (
            <article className="character-row character-identity-card" key={character.id}>
              <div className="character-avatar">{index === 0 ? <img src="/rainy-letter-keyframe.png" alt={`${character.name}主身份参考`} /> : <UserRound size={26} />}<span>主参考</span></div>
              <div className="character-main">
                <div className="character-card-head"><div className="form-columns"><label><span>姓名</span><input value={character.name} onChange={(e) => update(character.id, 'name', e.target.value)} /></label><label><span>角色</span><input value={character.role} onChange={(e) => update(character.id, 'role', e.target.value)} /></label></div><em className={character.calibrationStatus}>{character.calibrationStatus === 'passed' ? '校准通过' : '需要复核'}</em></div>
                <label><span>身份锁定描述</span><textarea rows="2" value={character.description} onChange={(e) => update(character.id, 'description', e.target.value)} /></label>
                <div className="identity-fields">
                  <label><span>身份版本</span><input value={character.identityVersion} onChange={(e) => update(character.id, 'identityVersion', e.target.value)} /></label>
                  <label><span>身份引擎</span><select value={character.identityEngine} onChange={(e) => update(character.id, 'identityEngine', e.target.value)}><option value="reference-pack">参考图组</option><option value="instantid">InstantID</option><option value="pulid">PuLID</option><option value="character-lora">角色 LoRA</option><option value="provider-id">云 API 角色 ID</option></select></label>
                  <label><span>身份阈值</span><input type="number" min="0.5" max="0.99" step="0.01" value={character.faceThreshold} onChange={(e) => update(character.id, 'faceThreshold', Number(e.target.value))} /></label>
                  <label><span>服装版本</span><input value={character.wardrobeVersion} onChange={(e) => update(character.id, 'wardrobeVersion', e.target.value)} /></label>
                  <label><span><Mic2 size={12} />声线 ID</span><input value={character.voiceId} onChange={(e) => update(character.id, 'voiceId', e.target.value)} /></label>
                </div>
                <label><span>身份负面约束</span><input value={character.negativePrompt} onChange={(e) => update(character.id, 'negativePrompt', e.target.value)} /></label>
                <div className="reference-pack"><div><span>参考图组 · 正面 / 左右 45° / 侧面 / 全身 / 3 种表情</span><strong>{character.referenceCount}/{character.referenceTarget}</strong></div><i><b style={{ width: `${pct}%` }} /></i><label className="reference-upload"><ImagePlus size={14} />添加参考图<input type="file" accept="image/*" multiple onChange={(e) => addReferenceFiles(character.id, e.target.files)} /></label></div>
              </div>
              <div className="character-actions"><button className={character.locked ? 'locked' : ''} onClick={() => update(character.id, 'locked', !character.locked)}><ShieldCheck size={17} />{character.locked ? '版本已锁定' : '锁定此版本'}</button><button onClick={() => newIdentityVersion(character)}><Plus size={16} />新建版本</button><button disabled={character.locked} title={character.locked ? '锁定版本不可删除' : '删除角色'} onClick={() => remove(character.id)}><Trash2 size={17} /></button></div>
            </article>
          )
        })}
      </div>
      <div className="identity-gate"><ShieldCheck size={19} /><div><strong>入集门禁：{readyCount === project.characters.length ? '已通过' : '尚未通过'}</strong><span>只有“版本已锁定”且“身份校准通过”的角色可以启动批量剧集生成；单个镜头低于角色阈值时暂停该镜头，不污染后续集。</span></div><button className="secondary-button" onClick={() => notify('系列角色库已保存在当前项目', 'success')}><Save size={16} />保存角色库</button></div>
    </div>
  )
}

export function GenerateView({ shots, onToggleQueue, onClearQueue, notify }) {
  const running = shots.some((shot) => shot.status === 'running')
  return (
    <div className="standard-page">
      <PageIntro title="生成队列" description="每个片段独立重试；完成后自动抽取尾帧并解锁下一段。" action={<div className="page-actions"><button className="secondary-button" onClick={onClearQueue}><RefreshCw size={16} />重置演示</button><button className="primary-button" onClick={onToggleQueue}>{running ? <><Pause size={16} />暂停队列</> : <><Play size={16} fill="currentColor" />开始队列</>}</button></div>} />
      <div className="queue-table">
        <div className="queue-table-head"><span>片段</span><span>提示词</span><span>模式</span><span>进度</span><span>状态</span></div>
        {shots.map((shot) => (
          <button className="queue-row" key={shot.id} onClick={() => notify(`${shot.id} 任务详情将在模型接入后显示`, 'info')}>
            <strong>{shot.id}</strong><span>{shot.prompt}</span><em>{shot.clip === 1 ? '首段' : '尾帧接力'}</em><div className="mini-progress"><i style={{ width: `${shot.progress}%` }} /></div><b className={shot.status}>{shot.status === 'done' ? '已完成' : shot.status === 'running' ? '生成中' : shot.status === 'queued' ? '排队中' : '草稿'}</b>
          </button>
        ))}
      </div>
    </div>
  )
}

export function QualityView({ shots }) {
  return (
    <div className="standard-page">
      <PageIntro title="角色与接缝质检" description="身份、锚点和动作连续性分别判断，失败时只回退当前片段。" />
      <div className="quality-summary">
        <div><CircleCheck size={21} /><strong>{shots.filter((s) => s.status === 'done').length}</strong><span>已生成</span></div>
        <div><CircleAlert size={21} /><strong>{shots.filter((s) => Object.values(s.qc).includes('fail')).length}</strong><span>需重试</span></div>
        <div><LoaderCircle size={21} /><strong>{shots.filter((s) => Object.values(s.qc).includes('pending')).length}</strong><span>待检测</span></div>
      </div>
      <div className="qc-table">
        <div className="qc-table-head"><span>接缝</span><span>角色身份</span><span>尾帧锚点</span><span>动作连续</span><span>处理</span></div>
        {shots.slice(1).map((shot) => <div className="qc-table-row" key={shot.id}><strong>{shots[shot.index - 1].id} → {shot.id}</strong>{['identity', 'anchor', 'motion'].map((key) => <span className={shot.qc[key]} key={key}><i />{shot.qc[key] === 'pass' ? '通过' : '待检测'}</span>)}<button>查看 24 帧</button></div>)}
      </div>
    </div>
  )
}

const fallbackMediaPlatforms = [
  { code: 'dy', name: '抖音' },
  { code: 'sph', name: '视频号' },
  { code: 'blbl', name: '哔哩哔哩' },
  { code: 'bjh', name: '百家号' },
  { code: 'tt', name: '头条' },
  { code: 'ks', name: '快手' },
  { code: 'xhs', name: '小红书' },
  { code: 'fqsp', name: '番茄视频' },
]

export function ExportView({ shots, workflow = [], project, notify, onOpenServices }) {
  const [format, setFormat] = useState('mp4')
  const [syncPublish, setSyncPublish] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [platforms, setPlatforms] = useState(fallbackMediaPlatforms)
  const [matrixStatus, setMatrixStatus] = useState('checking')
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState(null)
  const [mediaForm, setMediaForm] = useState(() => ({
    file: `output/${project.title}.mp4`,
    title: project.title,
    shortTitle: project.title.slice(0, 16),
    description: project.theme || '',
    tags: 'AI漫剧 短剧',
    phone: '',
    creativeStatement: 'ai_generated',
    draft: true,
  }))
  const enabledFeatures = workflow.filter((node) => node.enabled && ['voice', 'subtitles', 'bgm', 'multilingual', 'jianying'].includes(node.id))
  const featureNames = { voice: '配音', subtitles: '字幕', bgm: '背景音乐', multilingual: '多语版本', jianying: '剪映工程' }

  const checkMatrixMedia = async () => {
    setMatrixStatus('checking')
    try {
      const result = await getMediaPlatforms()
      setPlatforms(result.platforms?.length ? result.platforms : fallbackMediaPlatforms)
      setMatrixStatus('connected')
    } catch (error) {
      if (error.data?.platforms?.length) setPlatforms(error.data.platforms)
      setMatrixStatus('offline')
    }
  }

  useEffect(() => { checkMatrixMedia() }, [])

  const togglePlatform = (code) => setSelectedPlatforms((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code])
  const patchMediaForm = (field, value) => setMediaForm((current) => ({ ...current, [field]: value }))

  const createExport = async () => {
    if (!syncPublish) {
      notify('导出任务已模拟创建', 'success')
      return
    }
    if (!selectedPlatforms.length) {
      notify('请至少勾选一个发布平台', 'error')
      return
    }
    if (!mediaForm.phone.trim()) {
      notify('请输入 MatrixMedia 中对应的账号分组或手机号', 'error')
      return
    }
    setPublishing(true)
    setPublishResult(null)
    try {
      const result = await publishToMedia({ ...mediaForm, platforms: selectedPlatforms })
      setPublishResult(result)
      notify(result.message || `已提交 ${selectedPlatforms.length} 个平台`, 'success')
    } catch (error) {
      setPublishResult({ success: false, message: error.message })
      notify(error.message, 'error')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="standard-page">
      <PageIntro title="拼接与导出" description="统一帧率、去除重复首帧，再组合配音、字幕和最终编码。" />
      <div className="export-layout">
        <section className="export-preview"><img src="/rainy-letter-keyframe.png" alt="雨夜来信成片封面" /><button><Play fill="currentColor" size={20} /></button><div><strong>雨夜来信</strong><span>00:00 / 01:30</span></div></section>
        <section className="open-form export-settings">
          <h3>导出设置</h3>
          <label><span>交付格式</span><select value={format} onChange={(e) => setFormat(e.target.value)}><option value="mp4">MP4 · H.264</option><option value="mov">MOV · ProRes</option><option value="bundle">项目包 · MP4 + SRT + JSON</option>{workflow.find((node) => node.id === 'jianying')?.enabled ? <option value="jianying">剪映草稿工程</option> : null}</select></label>
          <label><span>帧率</span><select><option>24 FPS</option></select></label>
          <label><span>音频</span><select><option>AAC · 48 kHz</option></select></label>
          <label className="check-row"><input type="checkbox" defaultChecked /><span>自动删除接力重复首帧</span></label>
          <label className="check-row"><input type="checkbox" defaultChecked /><span>拼接前执行接缝质检</span></label>
          <div className="export-feature-list"><span>随工作流交付</span><div>{enabledFeatures.length ? enabledFeatures.map((node) => <em key={node.id}><Check size={12} />{featureNames[node.id]}</em>) : <small>仅成片视频</small>}</div></div>
          <div className="export-readiness"><Film size={18} /><span><strong>{shots.filter((s) => s.status === 'done').length}/{shots.length} 段可用</strong><small>模型接入前可测试页面工作流，暂不生成真实文件。</small></span></div>
          <button className="primary-button wide" disabled={publishing} onClick={createExport}>{syncPublish ? <Send size={16} /> : <Upload size={16} />}{publishing ? '正在提交发布…' : syncPublish ? `导出并同步到 ${selectedPlatforms.length} 个平台` : '创建导出任务'}</button>
        </section>
      </div>
      <section className={`media-publish-panel ${syncPublish ? 'enabled' : ''}`}>
        <header>
          <div className="media-publish-title"><Share2 size={21} /><span><strong>导出后同步发布</strong><small>复用 MatrixMedia GUI 登录态，通过本机 HTTP API 分发到 8 个媒体平台</small></span></div>
          <div className="matrix-status-actions">
            <em className={matrixStatus}><i />{matrixStatus === 'connected' ? 'GUI 已连接' : matrixStatus === 'checking' ? '正在检测' : 'GUI 未连接'}</em>
            <button className="outline-button" onClick={checkMatrixMedia}><RefreshCw size={15} />重试</button>
            <label className="media-master-switch"><input type="checkbox" checked={syncPublish} onChange={(event) => setSyncPublish(event.target.checked)} /><i /><span>{syncPublish ? '已启用' : '未启用'}</span></label>
          </div>
        </header>
        {syncPublish ? (
          <div className="media-publish-body">
            <div className="matrix-notice"><ShieldCheck size={18} /><span>默认保存到各平台草稿箱。请先启动 MatrixMedia GUI，并在其中完成账号登录；本项目不会读取平台密码或 Cookie。</span><button onClick={onOpenServices}>配置连接</button></div>
            <div className="media-platform-grid">
              {platforms.map((platform) => {
                const selected = selectedPlatforms.includes(platform.code)
                return <button type="button" className={selected ? 'selected' : ''} key={platform.code} onClick={() => togglePlatform(platform.code)}><i>{platform.name.slice(0, 1)}</i><span><strong>{platform.name}</strong><small>{platform.code}</small></span><em>{selected ? <Check size={15} /> : null}</em></button>
              })}
            </div>
            <div className="media-publish-form">
              <label className="wide-field"><span>成片路径或 URL</span><input value={mediaForm.file} onChange={(event) => patchMediaForm('file', event.target.value)} placeholder="output/成片.mp4 或 https://…" /></label>
              <label><span>账号分组 / 手机号</span><input value={mediaForm.phone} onChange={(event) => patchMediaForm('phone', event.target.value)} placeholder="与 MatrixMedia 账号树一致" /></label>
              <label><span>发布标题</span><input value={mediaForm.title} onChange={(event) => patchMediaForm('title', event.target.value)} /></label>
              <label><span>视频号短标题</span><input value={mediaForm.shortTitle} maxLength="16" onChange={(event) => patchMediaForm('shortTitle', event.target.value)} /></label>
              <label><span>标签</span><input value={mediaForm.tags} onChange={(event) => patchMediaForm('tags', event.target.value)} placeholder="空格或逗号分隔" /></label>
              <label><span>创作声明</span><select value={mediaForm.creativeStatement} onChange={(event) => patchMediaForm('creativeStatement', event.target.value)}><option value="ai_generated">AI 生成</option><option value="fiction">虚构演绎</option><option value="none">无标注</option><option value="self_made_no_repost">自制禁转载</option></select></label>
              <label className="wide-field"><span>发布简介</span><textarea rows="3" value={mediaForm.description} onChange={(event) => patchMediaForm('description', event.target.value)} /></label>
              <label className="draft-check"><input type="checkbox" checked={mediaForm.draft} onChange={(event) => patchMediaForm('draft', event.target.checked)} /><span>先保存到平台草稿箱，确认后再发布</span></label>
            </div>
            {publishResult ? <div className={`publish-result ${publishResult.success === false ? 'error' : 'success'}`}><strong>{publishResult.success === false ? '提交失败' : '已提交 MatrixMedia 队列'}</strong><span>{publishResult.message}</span></div> : null}
            <p className="matrix-attribution">MatrixMedia 位于 <code>vendor/MatrixMedia</code>，以独立 GUI 运行；集成仅调用其本机 HTTP API。源项目采用 GPL-2.0，<a href="https://github.com/hanliang97/MatrixMedia" target="_blank" rel="noreferrer">查看项目与许可</a>。</p>
          </div>
        ) : <p className="media-publish-collapsed">保持关闭时只导出本地文件，不影响原有工作流。</p>}
      </section>
    </div>
  )
}
