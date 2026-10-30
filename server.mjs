import express from 'express'
import { createServer as createViteServer } from 'vite'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { providerCatalog } from './src/data/seed.js'

const root = path.dirname(fileURLToPath(import.meta.url))
const keyFile = path.join(root, 'config', 'keys.local.json')
const integrationFile = path.join(root, 'config', 'integrations.local.json')
const production = process.argv.includes('--production')
const app = express()
const port = Number(process.env.PORT || 4173)

app.use(express.json({ limit: '1mb' }))

const PROVIDER_FIELDS = {
  minimax: ['apiKey'],
  openai: ['apiKey'],
  google: ['apiKey', 'projectId', 'location'],
  runway: ['apiKey'],
  byteplus: ['apiKey'],
  kling: ['apiKey', 'accessKey', 'secretKey'],
  vidu: ['apiKey'],
  custom: ['apiKey'],
}

const CREDENTIAL_ENV = {
  minimax: { apiKey: 'MINIMAX_API_KEY' },
  openai: { apiKey: 'OPENAI_API_KEY' },
  google: { apiKey: 'GOOGLE_API_KEY', projectId: 'GOOGLE_CLOUD_PROJECT', location: 'GOOGLE_CLOUD_LOCATION' },
  runway: { apiKey: 'RUNWAY_API_KEY' },
  byteplus: { apiKey: 'BYTEPLUS_API_KEY' },
  kling: { apiKey: 'KLING_API_KEY', accessKey: 'KLING_ACCESS_KEY', secretKey: 'KLING_SECRET_KEY' },
  vidu: { apiKey: 'VIDU_API_KEY' },
  custom: { apiKey: 'CUSTOM_VIDEO_API_KEY' },
}

const INTEGRATION_CATALOG = {
  matrixmedia: { name: 'MatrixMedia 矩媒', mode: 'api', healthPath: '/platforms' },
  moneyprinter: { name: 'MoneyPrinterTurbo', mode: 'api', healthPath: '/docs' },
  videolingo: { name: 'VideoLingo', mode: 'api', healthPath: '/status' },
  narrato: { name: 'NarratoAI', mode: 'sidecar', healthPath: '' },
  funclip: { name: 'FunClip', mode: 'sidecar', healthPath: '' },
  comfyui: { name: 'ComfyUI', mode: 'api', healthPath: '/system_stats' },
}

const emptyIntegrationStore = () => ({
  version: 1,
  updatedAt: null,
  integrations: {
    matrixmedia: { enabled: false, baseUrl: 'http://127.0.0.1:30088', mode: 'api' },
    moneyprinter: { enabled: false, baseUrl: 'http://127.0.0.1:8080', mode: 'api' },
    videolingo: { enabled: false, baseUrl: 'http://127.0.0.1:8000', mode: 'api' },
    narrato: { enabled: false, baseUrl: '', mode: 'sidecar' },
    funclip: { enabled: false, baseUrl: '', mode: 'sidecar' },
    comfyui: { enabled: true, baseUrl: 'http://127.0.0.1:8188', mode: 'api' },
  },
})

async function readIntegrationStore() {
  try {
    const value = JSON.parse(await fs.readFile(integrationFile, 'utf8'))
    return { ...emptyIntegrationStore(), ...value, integrations: { ...emptyIntegrationStore().integrations, ...(value.integrations || {}) } }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    const initial = emptyIntegrationStore()
    await fs.writeFile(integrationFile, `${JSON.stringify(initial, null, 2)}\n`, 'utf8')
    return initial
  }
}

const emptyKeyStore = () => ({
  version: 1,
  updatedAt: null,
  credentials: Object.fromEntries(
    Object.entries(PROVIDER_FIELDS).map(([provider, fields]) => [
      provider,
      Object.fromEntries(fields.map((field) => [field, ''])),
    ]),
  ),
})

async function readKeyStore() {
  try {
    const value = JSON.parse(await fs.readFile(keyFile, 'utf8'))
    return { ...emptyKeyStore(), ...value, credentials: { ...emptyKeyStore().credentials, ...(value.credentials || {}) } }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    const initial = emptyKeyStore()
    await fs.mkdir(path.dirname(keyFile), { recursive: true })
    await fs.writeFile(keyFile, JSON.stringify(initial, null, 2), 'utf8')
    return initial
  }
}

const mask = (value) => {
  if (!value) return ''
  if (value.length <= 6) return '••••••'
  return `${value.slice(0, 3)}••••${value.slice(-4)}`
}

const getCredentialValue = (store, provider, field) => {
  const envName = CREDENTIAL_ENV[provider]?.[field]
  return (envName && process.env[envName]) || store.credentials?.[provider]?.[field] || ''
}

const hasProviderCredential = (store, provider) => {
  if (provider === 'kling') {
    return Boolean(getCredentialValue(store, provider, 'apiKey') || (getCredentialValue(store, provider, 'accessKey') && getCredentialValue(store, provider, 'secretKey')))
  }
  return Boolean(getCredentialValue(store, provider, 'apiKey'))
}

app.get('/api/credentials', async (_req, res) => {
  try {
    const store = await readKeyStore()
    const credentials = Object.fromEntries(
      Object.entries(PROVIDER_FIELDS).map(([provider, fields]) => [
        provider,
        Object.fromEntries(fields.map((field) => {
          const envName = CREDENTIAL_ENV[provider]?.[field]
          const envValue = envName ? process.env[envName] || '' : ''
          const jsonValue = store.credentials?.[provider]?.[field] || ''
          const value = envValue || jsonValue
          const isSecret = /key|secret/i.test(field)
          return [field, { configured: Boolean(value), display: isSecret ? mask(value) : value, source: envValue ? `env:${envName}` : jsonValue ? 'keys.local.json' : null }]
        })),
      ]),
    )
    res.json({ path: keyFile, updatedAt: store.updatedAt, credentials })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/video/providers', async (_req, res) => {
  try {
    const store = await readKeyStore()
    const providers = providerCatalog.video.map((provider) => {
      const configured = provider.runtime !== 'api' || hasProviderCredential(store, provider.credential)
      return { ...provider, configured }
    })
    res.json({ providers, groups: { local: '本地模型', api: '云端 API', custom: '自定义适配器' } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/video/validate', async (req, res) => {
  try {
    const { providerId, duration, resolution } = req.body || {}
    const provider = providerCatalog.video.find((item) => item.id === providerId)
    if (!provider) return res.status(400).json({ ok: false, message: '未知视频模型适配器' })
    const errors = []
    if (duration && !provider.durations.includes(Number(duration))) errors.push(`不支持 ${duration} 秒片段`)
    if (resolution && !provider.resolutions.includes(resolution)) errors.push(`不支持输出规格：${resolution}`)
    if (provider.runtime === 'api') {
      const store = await readKeyStore()
      const configured = hasProviderCredential(store, provider.credential)
      if (!configured) errors.push(`未配置 ${provider.credential} 凭据`)
    }
    res.status(errors.length ? 400 : 200).json({ ok: errors.length === 0, runtime: provider.runtime, adapter: provider.adapter, errors, message: errors.length ? errors.join('；') : '模型配置校验通过' })
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message })
  }
})

app.put('/api/credentials', async (req, res) => {
  try {
    const { provider, values = {}, remove = [] } = req.body || {}
    const allowed = PROVIDER_FIELDS[provider]
    if (!allowed) return res.status(400).json({ error: '不支持的凭据提供方' })
    const store = await readKeyStore()
    const next = { ...(store.credentials[provider] || {}) }
    for (const field of allowed) {
      if (typeof values[field] === 'string' && values[field].trim()) next[field] = values[field].trim()
      if (remove.includes(field)) next[field] = ''
    }
    store.credentials[provider] = next
    store.updatedAt = new Date().toISOString()
    await fs.writeFile(keyFile, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
    res.json({ ok: true, updatedAt: store.updatedAt })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/integrations', async (_req, res) => {
  try {
    const store = await readIntegrationStore()
    res.json({ path: integrationFile, catalog: INTEGRATION_CATALOG, ...store })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/integrations', async (req, res) => {
  try {
    const incoming = req.body?.integrations || {}
    const store = await readIntegrationStore()
    for (const id of Object.keys(INTEGRATION_CATALOG)) {
      if (!incoming[id]) continue
      store.integrations[id] = {
        ...store.integrations[id],
        enabled: Boolean(incoming[id].enabled),
        baseUrl: typeof incoming[id].baseUrl === 'string' ? incoming[id].baseUrl.trim() : store.integrations[id].baseUrl,
        mode: INTEGRATION_CATALOG[id].mode,
      }
    }
    store.updatedAt = new Date().toISOString()
    await fs.writeFile(integrationFile, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
    res.json({ ok: true, updatedAt: store.updatedAt })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

function isLocalUrl(rawUrl) {
  try {
    const url = new URL(rawUrl)
    return ['http:', 'https:'].includes(url.protocol) && ['127.0.0.1', 'localhost', '::1'].includes(url.hostname)
  } catch {
    return false
  }
}

async function proxyIntegrationJson(id, endpoint, options = {}, timeoutMs = 3500) {
  const store = await readIntegrationStore()
  const integration = store.integrations[id]
  if (!integration?.enabled) throw new Error(`${INTEGRATION_CATALOG[id]?.name || id} 尚未启用`)
  if (!isLocalUrl(integration.baseUrl)) throw new Error('集成服务必须使用本机地址')
  const response = await fetchWithTimeout(`${integration.baseUrl.replace(/\/$/, '')}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  }, timeoutMs)
  const text = await response.text()
  let body
  try { body = text ? JSON.parse(text) : {} } catch { body = { message: text } }
  if (!response.ok) throw new Error(body.message || body.detail || `HTTP ${response.status}`)
  return body
}

app.post('/api/integrations/test', async (req, res) => {
  const { id, baseUrl } = req.body || {}
  const meta = INTEGRATION_CATALOG[id]
  if (!meta) return res.status(400).json({ ok: false, message: '未知能力包' })
  if (meta.mode === 'sidecar') return res.json({ ok: Boolean(baseUrl), message: baseUrl ? 'Sidecar 路径已配置' : '需要安装或填写 Sidecar 路径' })
  if (!isLocalUrl(baseUrl)) return res.status(400).json({ ok: false, message: '当前只测试本机服务地址' })
  try {
    const response = await fetchWithTimeout(`${baseUrl.replace(/\/$/, '')}${meta.healthPath}`)
    res.json({ ok: response.status < 500, message: response.status < 500 ? '连接成功' : `HTTP ${response.status}` })
  } catch (error) {
    res.json({ ok: false, message: error.name === 'AbortError' ? '连接超时' : '无法连接' })
  }
})

app.post('/api/oss/moneyprinter/videos', async (req, res) => {
  try { res.json(await proxyIntegrationJson('moneyprinter', '/api/v1/videos', { method: 'POST', body: JSON.stringify(req.body) })) }
  catch (error) { res.status(502).json({ error: error.message }) }
})

app.get('/api/oss/moneyprinter/tasks/:taskId', async (req, res) => {
  try { res.json(await proxyIntegrationJson('moneyprinter', `/api/v1/tasks/${encodeURIComponent(req.params.taskId)}`)) }
  catch (error) { res.status(502).json({ error: error.message }) }
})

app.post('/api/oss/videolingo/input', async (req, res) => {
  try { res.json(await proxyIntegrationJson('videolingo', '/input', { method: 'POST', body: JSON.stringify(req.body) })) }
  catch (error) { res.status(502).json({ error: error.message }) }
})

app.post('/api/oss/videolingo/run', async (req, res) => {
  try { res.json(await proxyIntegrationJson('videolingo', '/run', { method: 'POST', body: JSON.stringify(req.body) })) }
  catch (error) { res.status(502).json({ error: error.message }) }
})

const MEDIA_PLATFORMS = [
  { code: 'dy', name: '抖音' },
  { code: 'sph', name: '视频号' },
  { code: 'blbl', name: '哔哩哔哩' },
  { code: 'bjh', name: '百家号' },
  { code: 'tt', name: '头条' },
  { code: 'ks', name: '快手' },
  { code: 'xhs', name: '小红书' },
  { code: 'fqsp', name: '番茄视频' },
]

app.get('/api/media/platforms', async (_req, res) => {
  try {
    const result = await proxyIntegrationJson('matrixmedia', '/platforms')
    res.json({ connected: true, ...result })
  } catch (error) {
    res.status(503).json({ connected: false, platforms: MEDIA_PLATFORMS, error: error.message })
  }
})

app.get('/api/media/creative-statements', async (_req, res) => {
  try { res.json(await proxyIntegrationJson('matrixmedia', '/creative-statements')) }
  catch (error) { res.status(503).json({ error: error.message }) }
})

app.post('/api/media/publish', async (req, res) => {
  try {
    const payload = req.body || {}
    const allowedPlatforms = new Set(MEDIA_PLATFORMS.map((item) => item.code))
    const platforms = Array.isArray(payload.platforms) ? payload.platforms : []
    if (!platforms.length) return res.status(400).json({ error: '请至少选择一个发布平台' })
    if (platforms.some((item) => !allowedPlatforms.has(typeof item === 'string' ? item : item?.platform))) return res.status(400).json({ error: '包含不支持的发布平台' })
    if (!String(payload.title || '').trim()) return res.status(400).json({ error: '发布标题不能为空' })
    if (!String(payload.file || '').trim()) return res.status(400).json({ error: '成片路径不能为空' })
    const file = /^https?:\/\//i.test(payload.file) || path.isAbsolute(payload.file) ? payload.file : path.resolve(root, payload.file)
    if (!/^https?:\/\//i.test(file)) {
      try { await fs.access(file) } catch { return res.status(400).json({ error: `未找到成片文件：${file}` }) }
    }
    const result = await proxyIntegrationJson('matrixmedia', '/publish', {
      method: 'POST',
      body: JSON.stringify({ ...payload, file, platforms }),
    }, 30000)
    res.status(result.success === false ? 502 : 200).json(result)
  } catch (error) {
    res.status(502).json({ error: error.message })
  }
})

app.get('/api/oss/videolingo/status', async (_req, res) => {
  try { res.json(await proxyIntegrationJson('videolingo', '/status')) }
  catch (error) { res.status(502).json({ error: error.message }) }
})

async function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

function checkFfmpeg() {
  return new Promise((resolve) => {
    const child = spawn('ffmpeg', ['-version'], { windowsHide: true })
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk.toString() })
    child.on('error', () => resolve({ ok: false, message: '未找到 FFmpeg' }))
    child.on('close', (code) => resolve({
      ok: code === 0,
      message: code === 0 ? output.split(/\r?\n/)[0] : 'FFmpeg 检查失败',
    }))
  })
}

app.post('/api/services/test', async (req, res) => {
  const { type, baseUrl } = req.body || {}
  try {
    if (type === 'ffmpeg') return res.json(await checkFfmpeg())
    if (!isLocalUrl(baseUrl)) return res.status(400).json({ ok: false, message: '第一版仅允许测试本机地址' })
    const endpoint = type === 'ollama' ? '/api/tags' : type === 'comfyui' ? '/system_stats' : ''
    if (!endpoint) return res.status(400).json({ ok: false, message: '未知服务类型' })
    const response = await fetchWithTimeout(`${baseUrl.replace(/\/$/, '')}${endpoint}`)
    res.json({ ok: response.ok, message: response.ok ? '连接成功' : `HTTP ${response.status}` })
  } catch (error) {
    res.json({ ok: false, message: error.name === 'AbortError' ? '连接超时' : '无法连接' })
  }
})

app.get('/api/health', async (_req, res) => {
  const ffmpeg = await checkFfmpeg()
  res.json({ ok: true, ffmpeg })
})

if (production) {
  app.use(express.static(path.join(root, 'dist')))
  app.use((_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')))
} else {
  const vite = await createViteServer({ root, server: { middlewareMode: true }, appType: 'spa' })
  app.use(vite.middlewares)
}

app.listen(port, '127.0.0.1', () => {
  console.log(`漫剧工坊运行于 http://127.0.0.1:${port}`)
})
