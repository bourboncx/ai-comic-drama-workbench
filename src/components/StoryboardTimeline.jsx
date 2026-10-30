import { Check, Clock3, LoaderCircle } from 'lucide-react'

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

function StatusIcon({ status }) {
  if (status === 'done') return <Check size={11} />
  if (status === 'running') return <LoaderCircle size={11} className="spin" />
  return <Clock3 size={10} />
}

export default function StoryboardTimeline({ shots, selectedId, onSelect }) {
  const groups = Array.from({ length: Math.ceil(shots.length / 3) }, (_, index) => shots.slice(index * 3, index * 3 + 3))
  return (
    <section className="timeline-panel" aria-label="90 秒分镜时间轴">
      <div className="timeline-groups">
        {groups.map((group, groupIndex) => (
          <div className="timeline-group" key={groupIndex}>
            <div className="group-heading">
              <strong>镜头组 {groupIndex + 1}</strong>
              <span>{formatTime(group[0].start)}–{formatTime(group[group.length - 1].end)}</span>
            </div>
            <div className="clip-row">
              {group.map((shot) => (
                <button
                  key={shot.id}
                  className={`clip-button ${selectedId === shot.id ? 'selected' : ''} ${shot.status}`}
                  onClick={() => onSelect(shot.id)}
                  aria-label={`${shot.id} ${formatTime(shot.start)} 到 ${formatTime(shot.end)}`}
                >
                  <span className="clip-thumb" style={{ backgroundPosition: `${20 + shot.index * 3}% center` }}>
                    <span className="clip-status"><StatusIcon status={shot.status} /></span>
                  </span>
                  <small>C{String(shot.index + 1).padStart(2, '0')}</small>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="time-axis">
        {groups.map((group) => <span key={group[0].id}>{formatTime(group[0].start)}</span>)}
        <span>{formatTime(shots[shots.length - 1].end)}</span>
      </div>
    </section>
  )
}
