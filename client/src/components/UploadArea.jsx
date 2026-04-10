import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';   // ← Added this

const PERSONAS = [
  { id: 'professional', icon: '◈', name: 'Corporate Executive', desc: 'Formal · data-driven · authoritative' },
  { id: 'hype',         icon: '◉', name: 'Hype Beast',          desc: 'Energetic · viral · FOMO-driven' },
  { id: 'minimalist',   icon: '◎', name: 'The Minimalist',      desc: 'Clean · concise · zero fluff' },
]

const SAMPLE = `Product: NovaSpark AI Writing Assistant v2.0
Launch Date: May 15, 2026
Pricing: Free tier | Pro $29/month | Team $99/month

Core Features:
- Real-time grammar and style suggestions powered by GPT-4o
- Supports 27 languages with native-level tone adaptation
- Plagiarism detection across 50 billion web pages
- One-click export: Google Docs, Notion, Microsoft Word
- Team collaboration: tracked changes, version history, comments

Technical Specs:
- Response time: under 200ms (average)
- Uptime SLA: 99.9%
- Data encryption: AES-256 at rest and in transit
- API rate limit: 1,000 requests/hour (Pro plan)

Target Audience: Content marketers, SaaS companies, indie bloggers, enterprise writing teams.

Value Proposition: NovaSpark reduces content creation time by 70% while guaranteeing brand voice consistency — proven across 10,000+ beta users in a 6-month trial.`

export default function UploadArea({ onStart, user, token, onLogout }) {
  const navigate = useNavigate();   // ← Added this

  const [mode,        setMode]      = useState('text')
  const [text,        setText]      = useState('')
  const [file,        setFile]      = useState(null)
  const [drag,        setDrag]      = useState(false)
  const [persona,     setPersona]   = useState('professional')
  const [showHistory, setHistory]   = useState(false)
  const [missions,    setMissions]  = useState([])
  const [loadingH,    setLoadingH]  = useState(false)
  const fileRef = useRef()

  const canStart = (mode === 'text' && text.trim().length > 40) || (mode === 'file' && file)

  const fetchHistory = async () => {
    if (!showHistory) {
      setLoadingH(true)
      try {
        const res = await fetch('/api/missions', { 
          headers: { Authorization: `Bearer ${token}` } 
        })
        const data = await res.json()
        setMissions(Array.isArray(data) ? data : [])
      } catch { 
        setMissions([]) 
      }
      setLoadingH(false)
    }
    setHistory(h => !h)
  }

  // New function: Open full detail page when clicking a history item
  const openMissionDetail = (missionId) => {
    navigate(`/history/${missionId}`);
    setHistory(false); // Close drawer after clicking
  }

  const onFile = f => { if (f) setFile(f) }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── History drawer ─────────────────────────────────── */}
      <div style={{
        width: showHistory ? 290 : 0, flexShrink: 0, overflow: 'hidden',
        transition: 'width 0.32s cubic-bezier(0.16,1,0.3,1)',
        borderRight: '1px solid var(--border)',
        background: 'rgba(7,13,26,0.85)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ minWidth: 290, padding: '18px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span className="section-label" style={{ margin: 0 }}>Mission History</span>
            <button className="btn-icon" onClick={() => setHistory(false)}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingH ? (
              <div style={{ textAlign: 'center', paddingTop: 32 }}>
                <div className="spinner" style={{ color: 'var(--green)', margin: '0 auto' }} />
              </div>
            ) : missions.length === 0 ? (
              <div className="font-m" style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', paddingTop: 32, lineHeight: 1.8 }}>
                No missions yet.<br />Run your first pipeline<br />to see history here.
              </div>
            ) : (
              missions.map(m => (
                <div 
                  key={m.id} 
                  className="history-item"
                  onClick={() => openMissionDetail(m.id)}   // ← This makes it clickable
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                    <div className="dot dot-green" />
                    <span className="font-d" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <span className="chip chip-dim">{m.personality}</span>
                    <span className="chip chip-dim">{m.total_attempts} loop{m.total_attempts > 1 ? 's' : ''}</span>
                    <span className="chip chip-green">{m.confidence}%</span>
                    <span className="chip chip-dim">{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Main upload area ────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 24px', position: 'relative' }}>

        {/* Top right controls */}
        <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-ghost" onClick={fetchHistory}>
            {showHistory ? '✕ Close' : `◫ History`}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: '1px solid var(--border-hi)', borderRadius: 7 }}>
            <div className="dot dot-green" />
            <span className="font-m" style={{ fontSize: 11, color: 'var(--text-2)' }}>{user?.name}</span>
            <span style={{ color: 'var(--border-hi)', margin: '0 2px' }}>|</span>
            <button onClick={onLogout} className="font-m" style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 10, letterSpacing: '0.08em' }}>
              logout
            </button>
          </div>
        </div>

        {/* Brand hero + Personality selector + Input card remain exactly the same as you had */}
        {/* ... (I kept your full main content unchanged) ... */}

        <div className="anim-up" style={{ textAlign: 'center', maxWidth: 560, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 16 }}>
            <div className="dot dot-green" />
            <span className="font-m" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.2em' }}>
              AUTONOMOUS · SELF-CORRECTING · TRUSTWORTHY
            </span>
            <div className="dot dot-green" />
          </div>
          <h1 className="font-d" style={{ fontSize: 'clamp(40px,7vw,64px)', fontWeight: 800, lineHeight: 0.93, letterSpacing: '-0.025em', color: '#fff' }}>
            SENTINEL
          </h1>
          <h1 className="font-d" style={{ fontSize: 'clamp(40px,7vw,64px)', fontWeight: 800, lineHeight: 0.93, letterSpacing: '-0.025em', color: 'var(--green)', marginBottom: 18 }}>
            ASSEMBLY
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 300, lineHeight: 1.65 }}>
            Three AI agents argue, audit, and approve your content<br />
            until it's 100% hallucination-free and brand-safe.
          </p>
        </div>

        <div className="anim-up-1" style={{ width: '100%', maxWidth: 560, marginBottom: 18 }}>
          <div className="section-label">Ghostwriter Personality</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {PERSONAS.map(p => (
              <div key={p.id} className={`persona-card ${persona === p.id ? 'selected' : ''}`} onClick={() => setPersona(p.id)}>
                <div style={{ fontSize: 20, marginBottom: 7, color: persona === p.id ? 'var(--green)' : 'var(--text-3)' }}>{p.icon}</div>
                <div className="font-d" style={{ fontSize: 12, fontWeight: 600, color: persona === p.id ? 'var(--text)' : 'var(--text-2)', marginBottom: 3 }}>{p.name}</div>
                <div className="font-m" style={{ fontSize: 9, color: persona === p.id ? 'var(--text-2)' : 'var(--text-3)', lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card anim-up-2" style={{ width: '100%', maxWidth: 560, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span className="section-label" style={{ margin: 0 }}>Mission Input</span>
            <div className="tabs" style={{ width: 'auto' }}>
              <button className={`tab-item ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>Paste Text</button>
              <button className={`tab-item ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>Upload File</button>
            </div>
          </div>

          {mode === 'text' ? (
            <>
              <textarea
                className="textarea"
                placeholder="Paste your product document, technical spec, press release, or any source text here..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <button
                onClick={() => setText(SAMPLE)}
                style={{
                  marginTop: 6, width: '100%', padding: '7px',
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--text-3)', fontFamily: 'var(--fm)',
                  fontSize: 10, cursor: 'pointer', transition: 'all 0.18s',
                  letterSpacing: '0.12em',
                }}
                onMouseEnter={e => { e.target.style.color = 'var(--green)'; e.target.style.borderColor = 'rgba(0,255,136,0.3)' }}
                onMouseLeave={e => { e.target.style.color = 'var(--text-3)'; e.target.style.borderColor = 'var(--border)' }}
              >
                ↓ LOAD SAMPLE DOCUMENT
              </button>
            </>
          ) : (
            <div
              className={`drop-zone ${drag ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]) }}
              onClick={() => fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept=".txt,.md" hidden onChange={e => onFile(e.target.files[0])} />
              {file ? (
                <>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>📄</div>
                  <div className="font-m" style={{ color: 'var(--green)', fontSize: 13 }}>{file.name}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · Ready</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 30, marginBottom: 10, opacity: 0.25 }}>⬆</div>
                  <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Drop .txt or .md file here</div>
                  <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>or click to browse</div>
                </>
              )}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ marginTop: 18 }}
            disabled={!canStart}
            onClick={() => onStart({ type: mode, text, file, personality: persona })}
          >
            ⚡ ACTIVATE SENTINEL ASSEMBLY
          </button>

          <div className="font-m" style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-3)', marginTop: 12, letterSpacing: '0.12em' }}>
            OPENROUTER FREE · 3-AGENT PIPELINE · HALLUCINATION GUARD · AUTO-SAVED TO HISTORY
          </div>
        </div>
      </div>
    </div>
  )
}





// import { useState, useRef } from 'react'

// const PERSONAS = [
//   { id: 'professional', icon: '◈', name: 'Corporate Executive', desc: 'Formal · data-driven · authoritative' },
//   { id: 'hype',         icon: '◉', name: 'Hype Beast',          desc: 'Energetic · viral · FOMO-driven' },
//   { id: 'minimalist',   icon: '◎', name: 'The Minimalist',      desc: 'Clean · concise · zero fluff' },
// ]

// const SAMPLE = `Product: NovaSpark AI Writing Assistant v2.0
// Launch Date: May 15, 2026
// Pricing: Free tier | Pro $29/month | Team $99/month

// Core Features:
// - Real-time grammar and style suggestions powered by GPT-4o
// - Supports 27 languages with native-level tone adaptation
// - Plagiarism detection across 50 billion web pages
// - One-click export: Google Docs, Notion, Microsoft Word
// - Team collaboration: tracked changes, version history, comments

// Technical Specs:
// - Response time: under 200ms (average)
// - Uptime SLA: 99.9%
// - Data encryption: AES-256 at rest and in transit
// - API rate limit: 1,000 requests/hour (Pro plan)

// Target Audience: Content marketers, SaaS companies, indie bloggers, enterprise writing teams.

// Value Proposition: NovaSpark reduces content creation time by 70% while guaranteeing brand voice consistency — proven across 10,000+ beta users in a 6-month trial.`

// export default function UploadArea({ onStart, user, token, onLogout }) {
//   const [mode,        setMode]      = useState('text')
//   const [text,        setText]      = useState('')
//   const [file,        setFile]      = useState(null)
//   const [drag,        setDrag]      = useState(false)
//   const [persona,     setPersona]   = useState('professional')
//   const [showHistory, setHistory]   = useState(false)
//   const [missions,    setMissions]  = useState([])
//   const [loadingH,    setLoadingH]  = useState(false)
//   const fileRef = useRef()

//   const canStart = (mode === 'text' && text.trim().length > 40) || (mode === 'file' && file)

//   const fetchHistory = async () => {
//     if (!showHistory) {
//       setLoadingH(true)
//       try {
//         const res = await fetch('/api/missions', { headers: { Authorization: `Bearer ${token}` } })
//         const data = await res.json()
//         setMissions(Array.isArray(data) ? data : [])
//       } catch { setMissions([]) }
//       setLoadingH(false)
//     }
//     setHistory(h => !h)
//   }

//   const onFile = f => { if (f) setFile(f) }

//   return (
//     <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

//       {/* ── History drawer ─────────────────────────────────── */}
//       <div style={{
//         width: showHistory ? 290 : 0, flexShrink: 0, overflow: 'hidden',
//         transition: 'width 0.32s cubic-bezier(0.16,1,0.3,1)',
//         borderRight: '1px solid var(--border)',
//         background: 'rgba(7,13,26,0.85)',
//         display: 'flex', flexDirection: 'column',
//       }}>
//         <div style={{ minWidth: 290, padding: '18px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//             <span className="section-label" style={{ margin: 0 }}>Mission History</span>
//             <button className="btn-icon" onClick={() => setHistory(false)}>✕</button>
//           </div>

//           <div style={{ flex: 1, overflowY: 'auto' }}>
//             {loadingH ? (
//               <div style={{ textAlign: 'center', paddingTop: 32 }}>
//                 <div className="spinner" style={{ color: 'var(--green)', margin: '0 auto' }} />
//               </div>
//             ) : missions.length === 0 ? (
//               <div className="font-m" style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', paddingTop: 32, lineHeight: 1.8 }}>
//                 No missions yet.<br />Run your first pipeline<br />to see history here.
//               </div>
//             ) : (
//               missions.map(m => (
//                 <div key={m.id} className="history-item">
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
//                     <div className="dot dot-green" />
//                     <span className="font-d" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                       {m.title}
//                     </span>
//                   </div>
//                   <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
//                     <span className="chip chip-dim">{m.personality}</span>
//                     <span className="chip chip-dim">{m.total_attempts} loop{m.total_attempts > 1 ? 's' : ''}</span>
//                     <span className="chip chip-green">{m.confidence}%</span>
//                     <span className="chip chip-dim">{new Date(m.created_at).toLocaleDateString()}</span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ── Main upload area ────────────────────────────────── */}
//       <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 24px', position: 'relative' }}>

//         {/* Top right controls */}
//         <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
//           <button className="btn-ghost" onClick={fetchHistory}>
//             {showHistory ? '✕ Close' : `◫ History`}
//           </button>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: '1px solid var(--border-hi)', borderRadius: 7 }}>
//             <div className="dot dot-green" />
//             <span className="font-m" style={{ fontSize: 11, color: 'var(--text-2)' }}>{user?.name}</span>
//             <span style={{ color: 'var(--border-hi)', margin: '0 2px' }}>|</span>
//             <button onClick={onLogout} className="font-m" style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 10, letterSpacing: '0.08em' }}>
//               logout
//             </button>
//           </div>
//         </div>

//         {/* Brand hero */}
//         <div className="anim-up" style={{ textAlign: 'center', maxWidth: 560, marginBottom: 40 }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 16 }}>
//             <div className="dot dot-green" />
//             <span className="font-m" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.2em' }}>
//               AUTONOMOUS · SELF-CORRECTING · TRUSTWORTHY
//             </span>
//             <div className="dot dot-green" />
//           </div>
//           <h1 className="font-d" style={{ fontSize: 'clamp(40px,7vw,64px)', fontWeight: 800, lineHeight: 0.93, letterSpacing: '-0.025em', color: '#fff' }}>
//             SENTINEL
//           </h1>
//           <h1 className="font-d" style={{ fontSize: 'clamp(40px,7vw,64px)', fontWeight: 800, lineHeight: 0.93, letterSpacing: '-0.025em', color: 'var(--green)', marginBottom: 18 }}>
//             ASSEMBLY
//           </h1>
//           <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 300, lineHeight: 1.65 }}>
//             Three AI agents argue, audit, and approve your content<br />
//             until it's 100% hallucination-free and brand-safe.
//           </p>
//         </div>

//         {/* Personality selector */}
//         <div className="anim-up-1" style={{ width: '100%', maxWidth: 560, marginBottom: 18 }}>
//           <div className="section-label">Ghostwriter Personality</div>
//           <div style={{ display: 'flex', gap: 8 }}>
//             {PERSONAS.map(p => (
//               <div key={p.id} className={`persona-card ${persona === p.id ? 'selected' : ''}`} onClick={() => setPersona(p.id)}>
//                 <div style={{ fontSize: 20, marginBottom: 7, color: persona === p.id ? 'var(--green)' : 'var(--text-3)' }}>{p.icon}</div>
//                 <div className="font-d" style={{ fontSize: 12, fontWeight: 600, color: persona === p.id ? 'var(--text)' : 'var(--text-2)', marginBottom: 3 }}>{p.name}</div>
//                 <div className="font-m" style={{ fontSize: 9, color: persona === p.id ? 'var(--text-2)' : 'var(--text-3)', lineHeight: 1.5 }}>{p.desc}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Input card */}
//         <div className="card anim-up-2" style={{ width: '100%', maxWidth: 560, padding: 24 }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//             <span className="section-label" style={{ margin: 0 }}>Mission Input</span>
//             <div className="tabs" style={{ width: 'auto' }}>
//               <button className={`tab-item ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>Paste Text</button>
//               <button className={`tab-item ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>Upload File</button>
//             </div>
//           </div>

//           {mode === 'text' ? (
//             <>
//               <textarea
//                 className="textarea"
//                 placeholder="Paste your product document, technical spec, press release, or any source text here..."
//                 value={text}
//                 onChange={e => setText(e.target.value)}
//               />
//               <button
//                 onClick={() => setText(SAMPLE)}
//                 style={{
//                   marginTop: 6, width: '100%', padding: '7px',
//                   background: 'transparent', border: '1px solid var(--border)',
//                   borderRadius: 6, color: 'var(--text-3)', fontFamily: 'var(--fm)',
//                   fontSize: 10, cursor: 'pointer', transition: 'all 0.18s',
//                   letterSpacing: '0.12em',
//                 }}
//                 onMouseEnter={e => { e.target.style.color = 'var(--green)'; e.target.style.borderColor = 'rgba(0,255,136,0.3)' }}
//                 onMouseLeave={e => { e.target.style.color = 'var(--text-3)'; e.target.style.borderColor = 'var(--border)' }}
//               >
//                 ↓ LOAD SAMPLE DOCUMENT
//               </button>
//             </>
//           ) : (
//             <div
//               className={`drop-zone ${drag ? 'drag-over' : ''}`}
//               onDragOver={e => { e.preventDefault(); setDrag(true) }}
//               onDragLeave={() => setDrag(false)}
//               onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]) }}
//               onClick={() => fileRef.current.click()}
//             >
//               <input ref={fileRef} type="file" accept=".txt,.md" hidden onChange={e => onFile(e.target.files[0])} />
//               {file ? (
//                 <>
//                   <div style={{ fontSize: 30, marginBottom: 10 }}>📄</div>
//                   <div className="font-m" style={{ color: 'var(--green)', fontSize: 13 }}>{file.name}</div>
//                   <div style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · Ready</div>
//                 </>
//               ) : (
//                 <>
//                   <div style={{ fontSize: 30, marginBottom: 10, opacity: 0.25 }}>⬆</div>
//                   <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Drop .txt or .md file here</div>
//                   <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>or click to browse</div>
//                 </>
//               )}
//             </div>
//           )}

//           <button
//             className="btn-primary"
//             style={{ marginTop: 18 }}
//             disabled={!canStart}
//             onClick={() => onStart({ type: mode, text, file, personality: persona })}
//           >
//             ⚡ ACTIVATE SENTINEL ASSEMBLY
//           </button>

//           <div className="font-m" style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-3)', marginTop: 12, letterSpacing: '0.12em' }}>
//             OPENROUTER FREE · 3-AGENT PIPELINE · HALLUCINATION GUARD · AUTO-SAVED TO HISTORY
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



