import { useEffect, useState } from 'react'
import { course, parts, worksheetFields, buildPrompt } from './content.js'
import Effects from './Effects.jsx'

const chapters = parts.flatMap((p) => p.chapters)
// "4. 업무 설명하는 법" → ["4", "업무 설명하는 법"]
const split = (title) => title.split(/\.\s(.+)/)

// 체크리스트·워크시트 값을 브라우저에 저장 (사생활 모드 등에서 실패해도 동작)
function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])
  return [value, setValue]
}

function useHashChapter() {
  const read = () => chapters.find((c) => c.id === location.hash.slice(1)) ?? chapters[0]
  const [chapter, setChapter] = useState(read)
  useEffect(() => {
    const onHash = () => {
      setChapter(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return chapter
}

function CopyBox({ title, text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="prompt">
      <div className="prompt-head">
        <span>{title}</span>
        <button onClick={copy}>{copied ? '복사됨 ✓' : '복사'}</button>
      </div>
      <pre>{text}</pre>
    </div>
  )
}

function Checklist({ id, items }) {
  const [done, setDone] = useStored(`check:${id}`, [])
  const toggle = (i) => setDone(done.includes(i) ? done.filter((x) => x !== i) : [...done, i])
  return (
    <ul className="check">
      {items.map((item, i) => (
        <li key={i}>
          <label>
            <input type="checkbox" checked={done.includes(i)} onChange={() => toggle(i)} />
            <span>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

function Worksheet() {
  const [values, setValues] = useStored('worksheet', {})
  return (
    <div className="worksheet">
      {worksheetFields.map(([key, label, placeholder]) => (
        <label key={key}>
          <span>{label}</span>
          <textarea
            rows={2}
            value={values[key] ?? ''}
            placeholder={placeholder}
            onChange={(e) => setValues({ ...values, [key]: e.target.value })}
          />
        </label>
      ))}
      <CopyBox title="Claude에게 보낼 첫 요청 (자동 생성)" text={buildPrompt(values)} />
    </div>
  )
}

function Block({ b }) {
  switch (b.t) {
    case 'p':
      return <p>{b.text}</p>
    case 'h':
      return <h3>{b.text}</h3>
    case 'tip':
      return <div className="callout tip"><b>팁</b>{b.text}</div>
    case 'warn':
      return <div className="callout warn"><b>주의</b>{b.text}</div>
    case 'steps':
      return (
        <ol className="steps">
          {b.items.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      )
    case 'check':
      return <Checklist id={b.id} items={b.items} />
    case 'prompt':
      return <CopyBox title={b.title} text={b.text} />
    case 'worksheet':
      return <Worksheet />
    case 'effects':
      return <Effects />
    case 'table':
      return (
        <div className="table-wrap">
          <table>
            <thead><tr>{b.head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>
              {b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      )
    case 'compare':
      return (
        <div className="compare">
          <div className="bad"><b>이렇게 말하면</b><pre>{b.bad}</pre></div>
          <div className="good"><b>이렇게 바꿔요</b><pre>{b.good}</pre></div>
          <p className="why">{b.why}</p>
        </div>
      )
    case 'faq':
      return (
        <div className="faq">
          {b.items.map(([q, a], i) => (
            <details key={i}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      )
    default:
      return null
  }
}

export default function App() {
  const chapter = useHashChapter()
  const idx = chapters.indexOf(chapter)
  const prev = chapters[idx - 1]
  const next = chapters[idx + 1]

  return (
    <div className="layout">
      <nav className="sidebar">
        <a className="brand" href={`#${chapters[0].id}`}>
          <strong>{course.title}</strong>
          <small>{course.subtitle}</small>
        </a>
        <div className="progress">
          <div className="progress-text">
            <span>진도</span>
            <b>{Math.round(((idx + 1) / chapters.length) * 100)}%</b>
          </div>
          <div className="track"><div className="fill" style={{ width: `${((idx + 1) / chapters.length) * 100}%` }} /></div>
        </div>
        {parts.map((p) => (
          <div key={p.id} className="nav-part">
            <div className="nav-label">{p.label}</div>
            {p.chapters.map((c) => (
              <a key={c.id} href={`#${c.id}`} className={c === chapter ? 'active' : ''}>
                <span className="num">{split(c.title)[0]}</span>
                {split(c.title)[1]}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <main>
        <header className="chapter-head">
          <span className="time">{chapter.time}</span>
          <h1>
            <span className="num big">{split(chapter.title)[0]}</span>
            {split(chapter.title)[1]}
          </h1>
          <p className="summary">{chapter.summary}</p>
        </header>
        {chapter.blocks.map((b, i) => <Block key={`${chapter.id}-${i}`} b={b} />)}
        <footer className="pager">
          {prev ? <a href={`#${prev.id}`}>← {prev.title}</a> : <span />}
          {next ? <a href={`#${next.id}`}>{next.title} →</a> : <span />}
        </footer>
      </main>
    </div>
  )
}
