import { Activity, Bot, ChevronRight, CircleDashed, Film, Server, Settings2, SlidersHorizontal, Terminal } from 'lucide-react'
import { providerCatalog, videoProvidersByRuntime } from '../data/seed.js'

function SelectRow({ label, value, onChange, children }) {
  return <label className="setting-row"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{children}</select></label>
}

const serviceMeta = {
  ollama: { label: 'Ollama', icon: Bot },
  comfyui: { label: 'ComfyUI', icon: Server },
  ffmpeg: { label: 'FFmpeg', icon: Terminal },
}

function ServiceRow({ id, service, onTest }) {
  const meta = serviceMeta[id]
  const Icon = meta.icon
  return (
    <button className="service-row" onClick={() => onTest(id)}>
      <Icon size={18} />
      <span>{meta.label}</span>
      <em className={service.state}><i />{service.label}</em>
      <ChevronRight size={16} />
    </button>
  )
}

export default function Inspector({ project, onSettingsChange, services, onTestService, onOpenServices, shot }) {
  const selectedProvider = providerCatalog.video.find((item) => item.id === project.settings.videoProvider) || providerCatalog.video[0]
  const isLocalProvider = selectedProvider.runtime === 'local'
  const qcItems = [
    ['角色身份一致性', shot.qc.identity],
    ['锚点一致性', shot.qc.anchor],
    ['动作连贯性', shot.qc.motion],
  ]
  return (
    <aside className="inspector">
      <section>
        <h3>生成设置</h3>
        <SelectRow label="运行方式" value={selectedProvider.mode} onChange={() => onOpenServices()}>
          <option value="local">本地模型</option><option value="cloud">云端 API</option><option value="custom">自定义</option>
        </SelectRow>
        <SelectRow label="服务" value={project.settings.videoProvider} onChange={(value) => onSettingsChange('videoProvider', value)}>
          <optgroup label="本地模型">
            {videoProvidersByRuntime.local.map((provider) => <option value={provider.id} key={provider.id}>{provider.name}</option>)}
          </optgroup>
          <optgroup label="云端 API">
            {videoProvidersByRuntime.api.map((provider) => <option value={provider.id} key={provider.id}>{provider.name}</option>)}
          </optgroup>
          <optgroup label="自定义适配器">
            {videoProvidersByRuntime.custom.map((provider) => <option value={provider.id} key={provider.id}>{provider.name}</option>)}
          </optgroup>
        </SelectRow>
        <SelectRow label="模型" value={project.settings.videoModel} onChange={(value) => onSettingsChange('videoModel', value)}>
          {selectedProvider.models.map((model) => <option value={model} key={model}>{model}</option>)}
        </SelectRow>
        <SelectRow label="单段时长" value={project.clipDuration} onChange={(value) => onSettingsChange('clipDuration', Number(value), true)}>
          {selectedProvider.durations.map((duration) => <option value={duration} key={duration}>{duration} 秒</option>)}
        </SelectRow>
        <SelectRow label="画面比例" value={project.aspectRatio} onChange={(value) => onSettingsChange('aspectRatio', value, true)}>
          <option>9:16</option><option>16:9</option><option>1:1</option>
        </SelectRow>
        <SelectRow label="分辨率" value={project.settings.resolution} onChange={(value) => onSettingsChange('resolution', value)}>
          {selectedProvider.resolutions.map((resolution) => <option key={resolution}>{resolution}</option>)}
        </SelectRow>
        {isLocalProvider ? <SelectRow label="采样步数" value={project.settings.steps} onChange={(value) => onSettingsChange('steps', Number(value))}>
          <option value="4">4</option><option value="8">8</option><option value="12">12</option>
        </SelectRow> : null}
        <div className="model-profile">
          <div><span>{isLocalProvider ? '本地执行' : selectedProvider.runtime === 'api' ? 'API 托管' : '自定义路由'}</span><em className={selectedProvider.status}>{selectedProvider.status === 'preview' ? '预览版' : selectedProvider.status === 'stable' ? '正式版' : '自定义'}</em></div>
          <p>{selectedProvider.capabilities.join(' · ')}</p>
        </div>
      </section>
      <section className="service-section">
        <div className="section-heading"><h3>服务连接</h3><button onClick={onOpenServices}><Settings2 size={16} />配置</button></div>
        {Object.entries(services).map(([id, service]) => <ServiceRow key={id} id={id} service={service} onTest={onTestService} />)}
        <button className="outline-button wide" onClick={onOpenServices}><SlidersHorizontal size={16} />配置服务与凭据</button>
      </section>
      <section className="qc-section">
        <h3>接缝质检</h3>
        {qcItems.map(([label, state]) => (
          <div className="qc-row" key={label}><Activity size={17} /><span>{label}</span><em className={state}><i />{state === 'pass' ? '通过' : state === 'fail' ? '需重试' : '待检测'}</em></div>
        ))}
        <div className="filmstrip-head"><span>接缝预览</span><small>24 帧</small></div>
        <div className="filmstrip">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ backgroundPosition: `${index * 8}% center` }} />)}</div>
        <div className="filmstrip-axis"><span>1</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
      </section>
      <div className="inspector-note"><Film size={16} /><span>首段生成后，这里会显示尾帧锚点与接缝结果。</span></div>
    </aside>
  )
}
