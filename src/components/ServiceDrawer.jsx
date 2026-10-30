import { useEffect, useMemo, useState } from 'react'
import { Blocks, Check, Cloud, HardDrive, KeyRound, LoaderCircle, RotateCw, Save, ShieldCheck, X } from 'lucide-react'
import { providerCatalog } from '../data/seed.js'
import { getCredentials, getIntegrations, saveCredentials, saveIntegrations, testIntegration, testService } from '../lib/api.js'

const credentialLabels = {
  minimax: 'MiniMax H3', google: 'Google Gemini Omni', runway: 'Runway', byteplus: 'BytePlus / Seedance', kling: '可灵 Kling', vidu: 'Vidu', openai: 'OpenAI 兼容', custom: '自定义接口',
}

const fieldLabels = { apiKey: 'API Key', accessKey: 'Access Key', secretKey: 'Secret Key', projectId: 'Project ID', location: 'Location' }
const integrationDescriptions = {
  matrixmedia: 'GUI 登录复用与 8 平台同步发布',
  moneyprinter: '配音、字幕、BGM 与成片组装',
  videolingo: '多语字幕、翻译与配音',
  narrato: '本地 TTS 与剪映草稿导出',
  funclip: 'ASR 字幕校准与片段复核',
  comfyui: '关键帧与本地视频工作流',
}

function LocalServiceCard({ name, description, value, onChange, onTest, status }) {
  return (
    <div className="local-service-card">
      <div><strong>{name}</strong><p>{description}</p></div>
      <label><span>服务地址</span><input value={value} onChange={(event) => onChange(event.target.value)} /></label>
      <button className="outline-button" onClick={onTest} disabled={status === 'testing'}>
        {status === 'testing' ? <LoaderCircle className="spin" size={15} /> : <RotateCw size={15} />}
        {status === 'success' ? '连接成功' : status === 'error' ? '重试连接' : '测试连接'}
      </button>
    </div>
  )
}

export default function ServiceDrawer({ open, onClose, endpoints, setEndpoints, onServiceResult, notify }) {
  const [tab, setTab] = useState('local')
  const [credentials, setCredentials] = useState(null)
  const [credentialValues, setCredentialValues] = useState({})
  const [provider, setProvider] = useState('minimax')
  const [testing, setTesting] = useState({})
  const [saving, setSaving] = useState(false)
  const [integrations, setIntegrations] = useState(null)

  const selectedFields = useMemo(() => credentials?.credentials?.[provider] || {}, [credentials, provider])

  useEffect(() => {
    if (!open) return
    Promise.all([getCredentials(), getIntegrations()])
      .then(([credentialData, integrationData]) => { setCredentials(credentialData); setIntegrations(integrationData) })
      .catch((error) => notify(error.message, 'error'))
  }, [open, notify])

  const runTest = async (type, url) => {
    setTesting((current) => ({ ...current, [type]: 'testing' }))
    const result = await testService(type, url)
    setTesting((current) => ({ ...current, [type]: result.ok ? 'success' : 'error' }))
    onServiceResult(type, result)
    notify(result.message, result.ok ? 'success' : 'error')
  }

  const saveKey = async () => {
    const values = credentialValues[provider] || {}
    if (!Object.values(values).some((value) => value.trim())) {
      notify('请输入要保存或替换的值', 'error')
      return
    }
    setSaving(true)
    try {
      await saveCredentials(provider, values)
      setCredentials(await getCredentials())
      setCredentialValues((current) => ({ ...current, [provider]: {} }))
      notify(`${credentialLabels[provider]} 凭据已保存`, 'success')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const clearKey = async (field) => {
    setSaving(true)
    try {
      await saveCredentials(provider, {}, [field])
      setCredentials(await getCredentials())
      notify(`${fieldLabels[field]} 已清除`, 'success')
    } finally {
      setSaving(false)
    }
  }

  const patchIntegration = (id, patch) => setIntegrations((current) => ({
    ...current,
    integrations: { ...current.integrations, [id]: { ...current.integrations[id], ...patch } },
  }))

  const saveEngineConfig = async () => {
    setSaving(true)
    try {
      await saveIntegrations(integrations.integrations)
      setIntegrations(await getIntegrations())
      notify('工作流引擎配置已保存到本机 JSON', 'success')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const runIntegrationTest = async (id) => {
    const item = integrations.integrations[id]
    setTesting((current) => ({ ...current, [`integration-${id}`]: 'testing' }))
    const result = await testIntegration(id, item.baseUrl)
    setTesting((current) => ({ ...current, [`integration-${id}`]: result.ok ? 'success' : 'error' }))
    notify(result.message, result.ok ? 'success' : 'error')
  }

  return (
    <>
      <button className={`drawer-backdrop ${open ? 'visible' : ''}`} onClick={onClose} aria-label="关闭服务配置" />
      <aside className={`service-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <header><div><h2>服务与模型</h2><p>本地优先，按需切换云端模型</p></div><button className="icon-button" onClick={onClose}><X size={20} /></button></header>
        <div className="drawer-tabs">
          <button className={tab === 'local' ? 'active' : ''} onClick={() => setTab('local')}><HardDrive size={16} />本地服务</button>
          <button className={tab === 'engines' ? 'active' : ''} onClick={() => setTab('engines')}><Blocks size={16} />节点引擎</button>
          <button className={tab === 'cloud' ? 'active' : ''} onClick={() => setTab('cloud')}><Cloud size={16} />云端模型</button>
          <button className={tab === 'keys' ? 'active' : ''} onClick={() => setTab('keys')}><KeyRound size={16} />凭据</button>
        </div>
        <div className="drawer-content">
          {tab === 'local' ? (
            <div className="drawer-section">
              <div className="info-banner"><ShieldCheck size={18} /><span>默认只连接本机环回地址，项目数据不离开当前设备。</span></div>
              <LocalServiceCard name="Ollama" description="剧本、分镜与提示词结构化" value={endpoints.ollama} onChange={(value) => setEndpoints((current) => ({ ...current, ollama: value }))} onTest={() => runTest('ollama', endpoints.ollama)} status={testing.ollama} />
              <LocalServiceCard name="ComfyUI" description="MiniMax H3 / Wan 3.0 / HunyuanVideo 1.5 本地执行器" value={endpoints.comfyui} onChange={(value) => setEndpoints((current) => ({ ...current, comfyui: value }))} onTest={() => runTest('comfyui', endpoints.comfyui)} status={testing.comfyui} />
              <LocalServiceCard name="FFmpeg" description="抽尾帧、去重、拼接与编码" value="系统 PATH" onChange={() => {}} onTest={() => runTest('ffmpeg', '')} status={testing.ffmpeg} />
              <button className="primary-button wide" onClick={() => { localStorage.setItem('comic-workbench-endpoints', JSON.stringify(endpoints)); notify('本地服务地址已保存', 'success') }}><Save size={16} />保存本地配置</button>
            </div>
          ) : null}
          {tab === 'engines' ? (
            <div className="drawer-section">
              <div className="credential-path"><span>本地引擎配置文件</span><code>{integrations?.path || '读取中…'}</code></div>
              <p className="section-copy">这些能力嵌入工作流节点，不会形成另一套流程。未启用或连接失败时，节点按页面中的回退策略继续。</p>
              <div className="integration-list">
                {integrations ? Object.entries(integrations.catalog).map(([id, meta]) => {
                  const item = integrations.integrations[id]
                  const state = testing[`integration-${id}`]
                  return (
                    <article className="integration-card" key={id}>
                      <header><span><strong>{meta.name}</strong><small>{integrationDescriptions[id]}</small></span><label className="mini-switch"><input type="checkbox" checked={item.enabled} onChange={(event) => patchIntegration(id, { enabled: event.target.checked })} /><i /></label></header>
                      <div><input value={item.baseUrl} placeholder={meta.mode === 'sidecar' ? '本机安装目录或 Sidecar 地址' : 'http://127.0.0.1:端口'} onChange={(event) => patchIntegration(id, { baseUrl: event.target.value })} /><button className="outline-button" onClick={() => runIntegrationTest(id)} disabled={state === 'testing'}>{state === 'testing' ? <LoaderCircle className="spin" size={14} /> : <RotateCw size={14} />}{state === 'success' ? '已连接' : '测试'}</button></div>
                    </article>
                  )
                }) : <p className="section-copy">正在读取引擎配置…</p>}
              </div>
              <button className="primary-button wide" disabled={saving || !integrations} onClick={saveEngineConfig}>{saving ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />}保存引擎配置</button>
            </div>
          ) : null}
          {tab === 'cloud' ? (
            <div className="drawer-section">
              <div className="info-banner"><Cloud size={18} /><span>以下模型都在服务商侧运行，不占用本机 GPU；凭据由服务端从环境变量或本机 JSON 读取。</span></div>
              <p className="section-copy">同一套分镜数据通过适配器映射到不同模型。首尾帧、参考图、时长与分辨率会在提交前按提供方能力校验。</p>
              <div className="provider-list">
                {providerCatalog.video.filter((item) => item.runtime === 'api').map((item) => (
                  <button key={item.id} onClick={() => { setProvider(item.credential || 'custom'); setTab('keys') }}>
                    <span><strong>{item.name}<i className={`provider-status ${item.status}`}>{item.status === 'preview' ? 'Preview' : '正式'}</i></strong><small>{item.models.join(' · ')}</small><small>{item.capabilities.join(' · ')}</small></span>
                    <em>{Object.values(credentials?.credentials?.[item.credential] || {}).some((field) => field.configured) ? <><Check size={13} />已配置</> : '配置凭据'}</em>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {tab === 'keys' ? (
            <div className="drawer-section">
              <div className="credential-path"><span>本地凭据文件</span><code>{credentials?.path || '读取中…'}</code></div>
              <label className="stacked-field"><span>提供方</span><select value={provider} onChange={(event) => setProvider(event.target.value)}>{Object.entries(credentialLabels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
              <div className="credential-fields">
                {Object.entries(selectedFields).map(([field, state]) => {
                  const secret = /key|secret/i.test(field)
                  return (
                    <label className="stacked-field" key={`${provider}-${field}`}>
                      <span>{fieldLabels[field] || field}<em>{state.configured ? `${state.display} · ${state.source}` : '未配置'}</em></span>
                      <div className="credential-input"><input type={secret ? 'password' : 'text'} value={credentialValues[provider]?.[field] || ''} placeholder={state.source?.startsWith('env:') ? '环境变量优先；可另存 JSON 备用' : state.configured ? '输入新值可替换' : `输入 ${fieldLabels[field] || field}`} onChange={(event) => setCredentialValues((current) => ({ ...current, [provider]: { ...(current[provider] || {}), [field]: event.target.value } }))} />{state.configured && !state.source?.startsWith('env:') ? <button onClick={() => clearKey(field)}>清除</button> : null}</div>
                    </label>
                  )
                })}
              </div>
              <button className="primary-button wide" disabled={saving} onClick={saveKey}>{saving ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />}保存到 JSON</button>
              <p className="security-note">服务端优先读取环境变量，其次读取本机 JSON。JSON 已加入 .gitignore；页面始终只接收掩码和来源，不回传完整密钥。</p>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}
