import {
  BookOpenText,
  Check,
  ChevronDown,
  CircleCheck,
  Clapperboard,
  FolderKanban,
  Menu,
  Play,
  Save,
  ScrollText,
  Settings,
  Sparkles,
  Upload,
  UserRound,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import { navItems } from '../data/seed.js'

const icons = { FolderKanban, Workflow, ScrollText, UserRound, Clapperboard, Zap, CircleCheck, Upload }

export function Sidebar({ active, onChange, mobileOpen, onClose }) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <div className="brand">
        <span className="brand-mark"><i /><i /><i /></span>
        <span>漫剧工坊</span>
        <button className="mobile-close" onClick={onClose} aria-label="关闭导航"><X size={18} /></button>
      </div>
      <nav className="side-nav" aria-label="工作区导航">
        {navItems.map((item) => {
          const Icon = icons[item.icon]
          return (
            <button
              key={item.id}
              className={active === item.id ? 'active' : ''}
              onClick={() => { onChange(item.id); onClose() }}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="sidebar-foot">
        <div className="local-first"><span className="status-dot ok" />本地优先</div>
        <small>数据保存在当前设备</small>
      </div>
    </aside>
  )
}

export function Topbar({ title, saveState, onRun, onSettings, onMenu }) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" onClick={onMenu} aria-label="打开导航"><Menu size={20} /></button>
      <button className="project-switcher">
        <span>{title}</span><ChevronDown size={15} />
      </button>
      <div className="save-state"><CircleCheck size={16} />{saveState}</div>
      <div className="top-actions">
        <button className="icon-button" onClick={onSettings} aria-label="服务设置"><Settings size={19} /></button>
        <button className="primary-button" onClick={onRun}><Play size={16} fill="currentColor" />运行下一步</button>
      </div>
    </header>
  )
}

export function WorkflowSteps({ active = 3 }) {
  const items = [
    ['剧本结构', '已完成'],
    ['角色锚点', '已完成'],
    ['镜头接力', active === 3 ? '进行中' : '待开始'],
  ]
  return (
    <div className="workflow-steps">
      {items.map(([title, state], index) => (
        <div className={`workflow-step ${index + 1 <= active ? 'active' : ''}`} key={title}>
          <span className="step-number">{index + 1 < active ? <Check size={16} /> : index + 1}</span>
          <span><strong>{title}</strong><small>{state}</small></span>
          {index < items.length - 1 ? <i className="step-line" /> : null}
        </div>
      ))}
    </div>
  )
}

export function PageIntro({ title, description, action }) {
  return (
    <div className="page-intro">
      <div><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  )
}

export function BottomRail({ shots, onQueue, onOpenQueue }) {
  const completed = shots.filter((shot) => shot.status === 'done').length
  const active = shots.filter((shot) => shot.status === 'running').length
  const pct = Math.round((completed / shots.length) * 100)
  const groupCount = Math.ceil(shots.length / 3)
  const totalDuration = shots.at(-1)?.end || 0
  return (
    <footer className="bottom-rail">
      <div className="bottom-summary"><BookOpenText size={18} /><strong>{shots.length} 段</strong><span>·</span><span>{groupCount} 个镜头组</span><span>·</span><span>预计 {totalDuration} 秒</span></div>
      <button className="queue-progress" onClick={onOpenQueue}>
        <span>生成队列</span><strong>{completed + active}/{shots.length}</strong>
        <i><b style={{ width: `${pct}%` }} /></i><em>{pct}%</em>
      </button>
      <button className="primary-button queue-button" onClick={onQueue}><Sparkles size={17} />加入生成队列</button>
    </footer>
  )
}

export function SaveButton({ onClick, children = '保存' }) {
  return <button className="secondary-button" onClick={onClick}><Save size={16} />{children}</button>
}
