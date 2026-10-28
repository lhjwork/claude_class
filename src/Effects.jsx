import { useEffect, useState } from 'react'
import { effects } from './content.js'
import './effects.css'

function Scramble({ target = '1,284' }) {
  const [text, setText] = useState(target)
  useEffect(() => {
    let frame = 0
    const id = setInterval(() => {
      frame = (frame + 1) % 40 // 40틱 주기: 앞 15틱 섞이고 나머지는 정답 유지
      const settled = Math.floor(frame / 3)
      setText(
        frame >= 15
          ? target
          : [...target].map((c, i) => (i < settled || c === ',' ? c : '0123456789#%&'[Math.floor(Math.random() * 13)])).join(''),
      )
    }, 60)
    return () => clearInterval(id)
  }, [target])
  return <span className="scramble">{text}</span>
}

// 효과별 미리보기. 특별한 마크업이 필요한 것만 여기 적고 나머지는 CSS만으로 그림
const demos = {
  5: <div className="iso">{[0, 1, 2].map((i) => <i key={i} />)}</div>,
  6: <div className="kinetic">{[...'MOVE'].map((c, i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }}>{c}</span>)}</div>,
  7: <div className="chrome">Y2K</div>,
  8: <div className="paper"><i /><i /><i /></div>,
  9: <div className="zoom">{[0, 1, 2, 3].map((i) => <i key={i} style={{ animationDelay: `${i * -0.75}s` }} />)}</div>,
  10: <div className="vapor"><b /><i /></div>,
  11: <Scramble />,
  12: <div className="bauhaus"><i /><i /><i /></div>,
  13: <div className="brutal">저장</div>,
  15: <div className="memphis"><i /><i /><i /></div>,
  16: (
    <svg className="line" viewBox="0 0 160 70">
      <path d="M5 60 L40 40 L70 48 L105 18 L155 10" />
    </svg>
  ),
  17: (
    <svg className="poly" viewBox="0 0 160 80" preserveAspectRatio="none">
      {[
        '0,0 50,0 25,40', '50,0 25,40 80,45', '50,0 110,0 80,45', '110,0 80,45 135,38', '110,0 160,0 135,38',
        '160,0 160,80 135,38', '0,0 25,40 0,80', '25,40 0,80 60,80', '25,40 80,45 60,80', '80,45 60,80 120,80',
        '80,45 135,38 120,80', '135,38 160,80 120,80',
      ].map((pts, i) => <polygon key={i} points={pts} style={{ animationDelay: `${i * 0.2}s` }} />)}
    </svg>
  ),
  18: <div className="squash"><i /></div>,
  20: <div className="unknown">?</div>,
}

export default function Effects() {
  return (
    <div className="fx-grid">
      {effects.map(([n, name, ko, desc, use, star]) => (
        <article key={n} className="fx-card">
          <div className={`fx-stage fx-${n}`} aria-hidden="true">{demos[n] ?? <div className="shape" />}</div>
          <div className="fx-body">
            <div className="fx-title">
              <span className="fx-num">{n}</span>
              <div>
                <b>{name}</b>
                <small>{ko}</small>
              </div>
              {star && <span className="fx-star">업무도구 추천</span>}
            </div>
            <p>{desc}</p>
            {use && <p className="fx-use">쓰는 곳 · {use}</p>}
          </div>
        </article>
      ))}
    </div>
  )
}
