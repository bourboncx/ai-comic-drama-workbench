import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { BottomRail, PageIntro, Sidebar, Topbar, WorkflowSteps } from './components/AppChrome.jsx'
import Inspector from './components/Inspector.jsx'
import ServiceDrawer from './components/ServiceDrawer.jsx'
import ShotEditor from './components/ShotEditor.jsx'
import StoryboardTimeline from './components/StoryboardTimeline.jsx'
import WorkflowView from './components/WorkflowView.jsx'
import {
  CharactersView,
  ExportView,
  GenerateView,
  ProjectView,
  QualityView,
  ScriptView,
} from './components/WorkspaceViews.jsx'
import { defaultProject, makeShots, providerCatalog } from './data/seed.js'
import { makeWorkflowState } from './data/workflow.js'
import { usePersistedState } from './hooks/usePersistedState.js'
import { testService } from './lib/api.js'

const initialServices = {
  ollama: { state: 'error', label: '未连接' },
  comfyui: { state: 'warning', label: '未配置' },
  ffmpeg: { state: 'pending', label: '检测中' },
}

function Toast({ toast }) {
  if (!toast) return null
  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? XCircle : Info
  return <div className={`toast ${toast.type}`}><Icon size={18} /><span>{toast.message}</span></div>
}

export default function App() {
  const [activeView, setActiveView] = useState('storyboard')
  const [project, setProject] = usePersistedState('comic-workbench-project-v2', defaultProject)
  const [shots, setShots] = usePersistedState('comic-workbench-shots-v2', makeShots(defaultProject.duration, defaultProject.clipDuration))
  const [workflow, setWorkflow] = usePersistedState('comic-workbench-workflow-v1', makeWorkflowState())
  const [endpoints, setEndpoints] = usePersistedState('comic-workbench-endpoints', { ollama: 'http://127.0.0.1:11434', comfyui: 'http://127.0.0.1:8188' })
  const [selectedId, setSelectedId] = useState(() => shots[5]?.id || shots[0].id)
  const [services, setServices] = useState(initialServices)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [queueRunning, setQueueRunning] = useState(false)
  const [workflowRunning, setWorkflowRunning] = useState(false)
  const [toast, setToast] = useState(null)
  const [saveState, setSaveState] = useState('已保存')

  const notify = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  useEffect(() => {
    const needsSeriesMigration = !project.series || project.characters.some((character) => !character.identityVersion)
    if (!needsSeriesMigration) return
    setProject((current) => ({
      ...current,
      series: { ...defaultProject.series, ...(current.series || {}) },
      characters: current.characters.map((character, index) => ({
        ...(defaultProject.characters[index] || {
          identityVersion: `CHAR-${index + 1}-ID-v1`, identityEngine: 'reference-pack', referenceCount: 0, referenceTarget: 8,
          wardrobeVersion: '基础造型-v1', voiceId: '未绑定', negativePrompt: '五官漂移、年龄变化、发色变化、服装变化',
          faceThreshold: 0.78, calibrationStatus: 'needs-review', referenceFiles: [],
        }),
        ...character,
      })),
    }))
  }, [project, setProject])

  useEffect(() => {
    const provider = providerCatalog.video.find((item) => item.id === project.settings.videoProvider)
    if (provider && provider.models.includes(project.settings.videoModel) && provider.durations.includes(project.clipDuration)) return
    const fallback = provider || providerCatalog.video[0]
    setProject((current) => ({
      ...current,
      clipDuration: fallback.durations.includes(current.clipDuration) ? current.clipDuration : fallback.durations[0],
      settings: { ...current.settings, videoProvider: fallback.id, videoModel: fallback.models[0] },
    }))
  }, [project.settings.videoModel, project.settings.videoProvider, project.clipDuration, setProject])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    testService('ffmpeg', '').then((result) => setServices((current) => ({ ...current, ffmpeg: { state: result.ok ? 'success' : 'error', label: result.ok ? '可用' : '不可用' } })))
  }, [])

  useEffect(() => {
    if (!queueRunning) return undefined
    const timer = setInterval(() => {
      setShots((current) => {
        const runningIndex = current.findIndex((shot) => shot.status === 'running')
        const nextIndex = runningIndex >= 0 ? runningIndex : current.findIndex((shot) => shot.status === 'queued')
        if (nextIndex < 0) {
          setQueueRunning(false)
          notify('生成队列演示已完成', 'success')
          return current
        }
        const next = [...current]
        const target = next[nextIndex]
        if (target.status !== 'running') {
          next[nextIndex] = { ...target, status: 'running', progress: 8 }
          return next
        }
        const progress = Math.min(100, target.progress + 7)
        next[nextIndex] = progress >= 100
          ? { ...target, status: 'done', progress: 100, qc: { identity: 'pass', anchor: 'pass', motion: 'pass' } }
          : { ...target, progress }
        return next
      })
    }, 420)
    return () => clearInterval(timer)
  }, [notify, queueRunning, setShots])

  useEffect(() => {
    if (!workflowRunning) return undefined
    const timer = setTimeout(() => {
      const runningIndex = workflow.findIndex((node) => node.status === 'running')
      if (runningIndex >= 0) {
        setWorkflow((current) => current.map((node, index) => {
          if (index !== runningIndex) return node
          const progress = Math.min(100, node.progress + 20)
          return { ...node, progress, status: progress >= 100 ? 'done' : 'running' }
        }))
        return
      }
      const queuedIndex = workflow.findIndex((node) => node.status === 'queued')
      if (queuedIndex >= 0) {
        setWorkflow((current) => current.map((node, index) => index === queuedIndex ? { ...node, status: 'running', progress: 10 } : node))
        return
      }
      setWorkflowRunning(false)
      notify('完整工作流已跑通：关闭的增强节点已自动跳过。', 'success')
    }, 260)
    return () => clearTimeout(timer)
  }, [notify, setWorkflow, workflow, workflowRunning])

  const selectedShot = useMemo(() => shots.find((shot) => shot.id === selectedId) || shots[0], [selectedId, shots])
  const selectedIndex = selectedShot.index

  const markSaving = useCallback(() => {
    setSaveState('保存中…')
    setTimeout(() => setSaveState('已保存'), 350)
  }, [])

  const updateShot = (field, value) => {
    setShots((current) => current.map((shot) => shot.id === selectedId ? { ...shot, [field]: value } : shot))
    markSaving()
  }

  const updateSetting = (field, value, atRoot = false) => {
    setProject((current) => {
      if (atRoot) return { ...current, [field]: value }
      if (field === 'videoProvider') {
        const provider = providerCatalog.video.find((item) => item.id === value)
        const cloudSettings = provider.runtime === 'api'
          ? { hardwareProfile: 'cloud-api', concurrency: 3, resolution: '服务商默认' }
          : provider.runtime === 'local' && current.settings.hardwareProfile === 'cloud-api'
            ? { hardwareProfile: 'manual', concurrency: 1, resolution: '验证 544×960' }
            : {}
        return {
          ...current,
          clipDuration: provider.durations.includes(current.clipDuration) ? current.clipDuration : provider.durations[0],
          settings: { ...current.settings, ...cloudSettings, videoProvider: value, videoModel: provider.models[0] },
        }
      }
      return { ...current, settings: { ...current.settings, [field]: value } }
    })
    markSaving()
  }

  const serviceResult = (type, result) => setServices((current) => ({ ...current, [type]: { state: result.ok ? 'success' : 'error', label: result.ok ? '已连接' : type === 'comfyui' ? '未配置' : '未连接' } }))

  const runServiceTest = async (type) => {
    setServices((current) => ({ ...current, [type]: { state: 'pending', label: '检测中' } }))
    const result = await testService(type, endpoints[type] || '')
    serviceResult(type, result)
    notify(result.message, result.ok ? 'success' : 'error')
  }

  const queueAll = () => {
    setShots((current) => current.map((shot) => shot.status === 'done' ? shot : { ...shot, status: 'queued', progress: 0 }))
    setQueueRunning(true)
    setActiveView('generate')
    notify(`${shots.length} 个片段已加入演示队列`, 'success')
  }

  const queueSelected = (relay = false) => {
    if (relay && selectedShot.clip === 1) {
      notify('镜头组首段应使用“生成首段”', 'error')
      return
    }
    setShots((current) => current.map((shot) => shot.id === selectedId ? { ...shot, status: 'queued', progress: 0 } : shot))
    setQueueRunning(true)
    notify(`${selectedShot.id} 已加入${relay ? '接力' : '首段'}生成队列`, 'success')
  }

  const generateStoryboard = () => {
    setShots(makeShots(project.duration, project.clipDuration))
    setSelectedId('S01-C01')
    setActiveView('storyboard')
    notify(`已生成 ${Math.ceil(project.duration / project.clipDuration)} 段结构化分镜`, 'success')
  }

  const applyProjectSpec = () => {
    const rebuilt = makeShots(project.duration, project.clipDuration)
    setQueueRunning(false)
    setShots(rebuilt)
    setSelectedId(rebuilt[0].id)
    setActiveView('storyboard')
    notify(`已按 ${project.duration} 秒 / 每段 ${project.clipDuration} 秒重建为 ${rebuilt.length} 段`, 'success')
  }

  const runNext = () => {
    const order = ['project', 'workflow', 'script', 'characters', 'storyboard', 'generate', 'quality', 'export']
    const index = order.indexOf(activeView)
    if (activeView === 'storyboard') {
      queueAll()
      return
    }
    setActiveView(order[Math.min(index + 1, order.length - 1)])
  }

  const clearQueue = () => {
    setQueueRunning(false)
    setShots((current) => current.map((shot) => ({ ...shot, status: 'draft', progress: 0, qc: { identity: 'pending', anchor: 'pending', motion: 'pending' } })))
    notify('演示队列已重置', 'info')
  }

  const runWorkflow = () => {
    setWorkflow((current) => current.map((node) => ({
      ...node,
      status: node.enabled ? 'queued' : 'skipped',
      progress: 0,
    })))
    setWorkflowRunning(true)
    setActiveView('workflow')
    notify('工作流已启动；增强节点关闭时会自动走回退路径。', 'success')
  }

  const resetWorkflow = () => {
    setWorkflowRunning(false)
    setWorkflow((current) => current.map((node) => ({ ...node, status: node.enabled ? 'idle' : 'skipped', progress: 0 })))
    notify('工作流运行状态已重置，节点开关与引擎选择已保留。', 'info')
  }

  let content
  if (activeView === 'project') content = <ProjectView project={project} setProject={setProject} notify={notify} onApplySpec={applyProjectSpec} />
  if (activeView === 'workflow') content = <WorkflowView workflow={workflow} setWorkflow={setWorkflow} running={workflowRunning} onRun={runWorkflow} onPause={() => setWorkflowRunning(false)} onReset={resetWorkflow} notify={notify} />
  if (activeView === 'script') content = <ScriptView project={project} setProject={setProject} onGenerate={generateStoryboard} notify={notify} />
  if (activeView === 'characters') content = <CharactersView project={project} setProject={setProject} notify={notify} />
  if (activeView === 'generate') content = <GenerateView shots={shots} onToggleQueue={() => setQueueRunning((value) => !value)} onClearQueue={clearQueue} notify={notify} />
  if (activeView === 'quality') content = <QualityView shots={shots} />
  if (activeView === 'export') content = <ExportView shots={shots} workflow={workflow} project={project} notify={notify} onOpenServices={() => setDrawerOpen(true)} />
  if (activeView === 'storyboard') content = (
    <div className="storyboard-page">
      <div className="storyboard-title-row">
        <PageIntro title={`${project.duration} 秒短剧工作台`} description={`默认按每段 ${project.clipDuration} 秒推进，可在项目设置中按硬件或 API 能力调整。`} />
        <WorkflowSteps />
      </div>
      <StoryboardTimeline shots={shots} selectedId={selectedId} onSelect={setSelectedId} />
      <div className="workbench-grid">
        <ShotEditor
          shot={selectedShot}
          onChange={updateShot}
          onPrevious={() => setSelectedId(shots[Math.max(0, selectedIndex - 1)].id)}
          onNext={() => setSelectedId(shots[Math.min(shots.length - 1, selectedIndex + 1)].id)}
          onGenerate={() => queueSelected(false)}
          onRelay={() => queueSelected(true)}
          onSave={() => notify(`${selectedShot.id} 分镜已保存`, 'success')}
        />
        <Inspector project={project} onSettingsChange={updateSetting} services={services} onTestService={runServiceTest} onOpenServices={() => setDrawerOpen(true)} shot={selectedShot} />
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <Sidebar active={activeView} onChange={setActiveView} mobileOpen={mobileNav} onClose={() => setMobileNav(false)} />
      <div className="app-main">
        <Topbar title={project.title} saveState={saveState} onRun={runNext} onSettings={() => setDrawerOpen(true)} onMenu={() => setMobileNav(true)} />
        <main className="main-content">{content}</main>
        <BottomRail shots={shots} onQueue={queueAll} onOpenQueue={() => setActiveView('generate')} />
      </div>
      <ServiceDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} endpoints={endpoints} setEndpoints={setEndpoints} onServiceResult={serviceResult} notify={notify} />
      <Toast toast={toast} />
    </div>
  )
}
