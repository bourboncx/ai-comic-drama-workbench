import { useMemo, useState } from 'react'
import {
  Check,
  ChevronRight,
  Circle,
  CircleAlert,
  ExternalLink,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipForward,
  Workflow,
} from 'lucide-react'
import { workflowNodeDefinitions } from '../data/workflow.js'
import { PageIntro } from './AppChrome.jsx'

const sourceLinks = {
  'MoneyPrinterTurbo': 'https://github.com/harry0703/MoneyPrinterTurbo',
  'NarratoAI': 'https://github.com/linyqh/NarratoAI',
  'FunClip': 'https://github.com/modelscope/FunClip',
  'VideoLingo': 'https://github.com/Huanshere/VideoLingo',
  'InstantID': 'https://github.com/instantX-research/InstantID',
  'PuLID': 'https://github.com/ToTheBeginning/PuLID',
}

const statusText = { idle: '待运行', queued: '已排队', running: '运行中', done: '已完成', skipped: '已跳过', error: '需处理' }

function NodeStatus({ status }) {
  if (status === 'done') return <Check size={14} />
  if (status === 'running') return <LoaderCircle className="spin" size={14} />
  if (status === 'skipped') return <SkipForward size={13} />
  if (status === 'error') return <CircleAlert size={14} />
  return <Circle size={11} />
}

export default function WorkflowView({ workflow, setWorkflow, running, onRun, onPause, onReset, notify }) {
  const [selectedId, setSelectedId] = useState('video')
  const selectedDefinition = workflowNodeDefinitions.find((node) => node.id === selectedId) || workflowNodeDefinitions[0]
  const selectedState = workflow.find((node) => node.id === selectedId)
  const groups = useMemo(() => [...new Set(workflowNodeDefinitions.map((node) => node.group))], [])
  const enabledCount = workflow.filter((node) => node.enabled).length
  const completedCount = workflow.filter((node) => node.status === 'done' || node.status === 'skipped').length

  const updateNode = (patch) => {
    setWorkflow((current) => current.map((node) => node.id === selectedId ? { ...node, ...patch } : node))
  }

  const toggleNode = () => {
    if (selectedDefinition.required) {
      notify('这是主工作流必需节点，不能关闭；可以切换为人工处理引擎。', 'error')
      return
    }
    const enabled = !selectedState.enabled
    updateNode({ enabled, status: enabled ? 'idle' : 'skipped', progress: 0 })
    notify(`${selectedDefinition.title}已${enabled ? '启用' : '关闭'}，下游将使用回退策略。`, 'success')
  }

  return (
    <div className="standard-page workflow-page">
      <PageIntro
        title="完整短剧工作流"
        description="主流程开箱即用；增强节点可随时关闭，关闭后自动采用对应回退策略。"
        action={<div className="page-actions"><button className="secondary-button" onClick={onReset}><RotateCcw size={16} />重置状态</button>{running ? <button className="primary-button" onClick={onPause}><Pause size={16} />暂停</button> : <button className="primary-button" onClick={onRun}><Play size={16} fill="currentColor" />运行完整工作流</button>}</div>}
      />
      <div className="workflow-summary-rail">
        <span><Workflow size={18} /><strong>{enabledCount}</strong> 个启用节点</span>
        <i><b style={{ width: `${Math.round(completedCount / workflow.length * 100)}%` }} /></i>
        <span><strong>{completedCount}</strong> / {workflow.length} 已处理</span>
      </div>
      <div className="workflow-layout">
        <section className="workflow-canvas">
          {groups.map((group) => (
            <div className="workflow-group" key={group}>
              <h3>{group}</h3>
              <div className="workflow-node-list">
                {workflowNodeDefinitions.filter((node) => node.group === group).map((definition, index, list) => {
                  const state = workflow.find((node) => node.id === definition.id)
                  return (
                    <div className="workflow-node-wrap" key={definition.id}>
                      <button className={`workflow-node ${selectedId === definition.id ? 'selected' : ''} ${!state.enabled ? 'disabled' : ''} ${state.status}`} onClick={() => setSelectedId(definition.id)}>
                        <span className="node-status"><NodeStatus status={state.status} /></span>
                        <span className="node-copy"><strong>{definition.title}</strong><small>{definition.source}</small></span>
                        <em>{definition.required ? '必需' : state.enabled ? '已启用' : '已关闭'}</em>
                        <ChevronRight size={16} />
                        {state.status === 'running' ? <i className="node-progress"><b style={{ width: `${state.progress}%` }} /></i> : null}
                      </button>
                      {index < list.length - 1 ? <span className="node-connector" /> : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
        <aside className="workflow-inspector">
          <header><div><span>{selectedDefinition.group}</span><h2>{selectedDefinition.title}</h2></div><em className={selectedDefinition.required ? 'required' : 'optional'}>{selectedDefinition.required ? '主流程必需' : '可选增强'}</em></header>
          <p className="node-description">{selectedDefinition.description}</p>
          {!selectedDefinition.required ? <label className="node-toggle"><span><strong>启用此节点</strong><small>关闭不会中断下游流程</small></span><button className={selectedState.enabled ? 'on' : ''} onClick={toggleNode} aria-label={`启用${selectedDefinition.title}`}><i /></button></label> : null}
          <label className="stacked-field"><span>执行引擎</span><select value={selectedState.engine} onChange={(event) => updateNode({ engine: event.target.value })}>{selectedDefinition.engines.map((engine) => <option value={engine.id} key={engine.id}>{engine.name}</option>)}</select></label>
          <div className="node-fallback"><strong>回退策略</strong><p>{selectedDefinition.fallback}</p></div>
          <div className="node-runtime"><span>当前状态</span><strong className={selectedState.status}>{statusText[selectedState.status]}</strong></div>
          <div className="node-source">
            <div><Settings2 size={16} /><span><strong>能力来源</strong><small>{selectedDefinition.source}</small></span></div>
            {Object.entries(sourceLinks).filter(([name]) => selectedDefinition.source.includes(name)).map(([name, link]) => <a href={link} target="_blank" rel="noreferrer" key={name}>{name}<ExternalLink size={13} /></a>)}
          </div>
          <div className="workflow-rule"><strong>节点规则</strong><p>{selectedDefinition.required ? '失败时工作流暂停，产物保留；修复或改用人工引擎后从本节点继续。' : '失败时可重试、跳过或关闭；已经完成的上游节点不会重跑。'}</p></div>
        </aside>
      </div>
    </div>
  )
}
