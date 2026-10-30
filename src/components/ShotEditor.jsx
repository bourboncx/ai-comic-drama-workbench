import { ChevronLeft, ChevronRight, Play, RefreshCw, Save } from 'lucide-react'

const count = (text) => `${text.length}/500`
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

function Field({ label, value, onChange, rows = 2, maxLength = 500 }) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      <textarea rows={rows} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />
      <small>{count(value)}</small>
    </label>
  )
}

export default function ShotEditor({ shot, onChange, onPrevious, onNext, onGenerate, onRelay, onSave }) {
  return (
    <section className="shot-editor">
      <div className="shot-editor-head">
        <h2>{shot.id} · {formatTime(shot.start)}–{formatTime(shot.end)}</h2>
        <div><button className="icon-button" onClick={onPrevious} aria-label="上一段"><ChevronLeft size={18} /></button><button className="icon-button" onClick={onNext} aria-label="下一段"><ChevronRight size={18} /></button></div>
      </div>
      <div className="shot-editor-body">
        <div className="editor-fields">
          <Field label="画面提示词" value={shot.prompt} rows={3} onChange={(value) => onChange('prompt', value)} />
          <div className="field-pair">
            <Field label="开始状态" value={shot.startState} onChange={(value) => onChange('startState', value)} />
            <Field label="结束状态" value={shot.endState} onChange={(value) => onChange('endState', value)} />
          </div>
          <Field label="台词" value={shot.dialogue} onChange={(value) => onChange('dialogue', value)} maxLength={200} />
          <div className="editor-actions">
            <button className="primary-button" onClick={onGenerate}><Play size={16} fill="currentColor" />生成首段</button>
            <button className="secondary-button" onClick={onRelay}><RefreshCw size={16} />从尾帧接力</button>
            <button className="secondary-button" onClick={onSave}><Save size={16} />保存分镜</button>
          </div>
        </div>
        <figure className="preview-frame">
          <img src="/rainy-letter-keyframe.png" alt="雨夜来信角色关键帧预览" />
          <figcaption><span>角色锚点 · 林夏</span><small>关键帧预览</small></figcaption>
        </figure>
      </div>
    </section>
  )
}
