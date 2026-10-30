export async function getCredentials() {
  const response = await fetch('/api/credentials')
  if (!response.ok) throw new Error('读取凭据失败')
  return response.json()
}

export async function saveCredentials(provider, values, remove = []) {
  const response = await fetch('/api/credentials', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, values, remove }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || '保存凭据失败')
  return result
}

export async function testService(type, baseUrl) {
  const response = await fetch('/api/services/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, baseUrl }),
  })
  return response.json()
}

export async function getVideoProviders() {
  const response = await fetch('/api/video/providers')
  if (!response.ok) throw new Error('读取视频模型目录失败')
  return response.json()
}

export async function validateVideoProvider(providerId, duration, resolution) {
  const response = await fetch('/api/video/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId, duration, resolution }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || '模型配置校验失败')
  return result
}

export async function getIntegrations() {
  const response = await fetch('/api/integrations')
  if (!response.ok) throw new Error('读取工作流引擎配置失败')
  return response.json()
}

export async function saveIntegrations(integrations) {
  const response = await fetch('/api/integrations', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ integrations }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || '保存工作流引擎失败')
  return result
}

export async function testIntegration(id, baseUrl) {
  const response = await fetch('/api/integrations/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, baseUrl }),
  })
  return response.json()
}

export async function getMediaPlatforms() {
  const response = await fetch('/api/media/platforms')
  const result = await response.json()
  if (!response.ok) throw Object.assign(new Error(result.error || 'MatrixMedia GUI 未连接'), { data: result })
  return result
}

export async function publishToMedia(payload) {
  const response = await fetch('/api/media/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || result.message || '同步发布失败')
  return result
}
