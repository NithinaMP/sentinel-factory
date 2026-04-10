// import { useState, useCallback } from 'react'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// import AuthPage from './pages/AuthPage.jsx'
// import UploadArea from './components/UploadArea.jsx'
// import AgentChat from './components/AgentChat.jsx'
// import CampaignPreview from './components/CampaignPreview.jsx'
// import MissionDetail from './pages/MissionDetail.jsx'   // ← Your detail page

// // Phase → progress %
// const PHASE_PROGRESS = { archivist: 22, ghostwriter: 58, prosecutor: 82 }
// const PHASE_LABEL = {
//   archivist:   'PHASE 1 — FACT EXTRACTION',
//   ghostwriter: 'PHASE 2 — CONTENT SYNTHESIS',
//   prosecutor:  'PHASE 3 — PROSECUTION AUDIT',
// }

// export default function App() {
//   // ── Auth ────────────────────────────────────────────
//   const [user,  setUser]  = useState(() => { 
//     try { return JSON.parse(localStorage.getItem('s_user')) } catch { return null } 
//   })
//   const [token, setToken] = useState(() => localStorage.getItem('s_token') || '')

//   // ── Pipeline state ──────────────────────────────────
//   const [stage,    setStage]    = useState('upload')
//   const [logs,     setLogs]     = useState([])
//   const [phase,    setPhase]    = useState(null)
//   const [progress, setProgress] = useState(0)
//   const [attempts, setAttempts] = useState(1)
//   const [result,   setResult]   = useState(null)
//   const [errMsg,   setErrMsg]   = useState('')
//   const [persona,  setPersona]  = useState('professional')

//   const addLog = useCallback(entry => setLogs(prev => [...prev, entry]), [])

//   const handleEvent = useCallback(ev => {
//     switch (ev.type) {
//       case 'pipeline_start':
//         addLog({ agent: 'system', status: 'phase', message: ev.message })
//         setProgress(4)
//         break
//       case 'phase':
//         setPhase(ev.phase)
//         setProgress(PHASE_PROGRESS[ev.phase] || 50)
//         addLog({ agent: 'system', status: 'phase', message: ev.message })
//         break
//       case 'log':
//         addLog(ev)
//         break
//       case 'factsheet':
//         addLog({ agent: 'archivist', status: 'approved', message: `Fact-Sheet locked — ${ev.data?.core_features?.length || 0} features extracted.` })
//         break
//       case 'rejected':
//         setAttempts(ev.attempt + 1)
//         addLog({ agent: 'prosecutor', status: 'rejected', message: `REJECTED — ${ev.correctionNote}` })
//         break
//       case 'approved':
//         addLog({ agent: 'prosecutor', status: 'approved', message: ev.message })
//         setProgress(96)
//         break
//       case 'complete':
//         setResult(ev)
//         setStage('done')
//         setPhase(null)
//         setProgress(100)
//         break
//       case 'error':
//         setErrMsg(ev.message)
//         setStage('error')
//         break
//       default: break
//     }
//   }, [addLog])

//   const handleStart = async ({ type, text, file, personality }) => {
//     setStage('running')
//     setLogs([])
//     setResult(null)
//     setErrMsg('')
//     setAttempts(1)
//     setProgress(2)
//     setPhase(null)
//     setPersona(personality)

//     const fd = new FormData()
//     fd.append('personality', personality)
//     if (type === 'file' && file) fd.append('document', file)
//     else fd.append('text', text)

//     try {
//       const res = await fetch('/api/run-pipeline', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       })

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}))
//         throw new Error(data.error || `Server error ${res.status}`)
//       }

//       const reader = res.body.getReader()
//       const decoder = new TextDecoder()

//       while (true) {
//         const { done, value } = await reader.read()
//         if (done) break
//         const chunk = decoder.decode(value)
//         for (const line of chunk.split('\n')) {
//           if (!line.startsWith('data: ')) continue
//           try { handleEvent(JSON.parse(line.slice(6))) } catch {}
//         }
//       }
//     } catch (err) {
//       setErrMsg(err.message)
//       setStage('error')
//     }
//   }

//   const onAuth = (u, t) => { setUser(u); setToken(t) }

//   const onLogout = () => {
//     localStorage.removeItem('s_token')
//     localStorage.removeItem('s_user')
//     setUser(null); setToken('')
//     setStage('upload'); setLogs([]); setResult(null)
//   }

//   const reset = () => {
//     setStage('upload'); setLogs([]); setResult(null)
//     setErrMsg(''); setPhase(null); setAttempts(1); setProgress(0)
//   }

//   if (!user || !token) return <AuthPage onAuth={onAuth} />

//   return (
//     <Router>
//       <Routes>
//         {/* Main Pipeline Flow */}
//         <Route 
//           path="/" 
//           element={
//             stage === 'upload' ? (
//               <UploadArea
//                 onStart={handleStart}
//                 user={user}
//                 token={token}
//                 onLogout={onLogout}
//               />
//             ) : (
//               <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
//                 {/* Top bar */}
//                 <div className="app-topbar">
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//                     <span className="font-d" style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
//                       SENTINEL <span style={{ color: 'var(--green)' }}>ASSEMBLY</span>
//                     </span>
//                     {phase && (
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                         <div className="dot dot-amber" />
//                         <span className="font-m" style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em' }}>
//                           {PHASE_LABEL[phase]}
//                         </span>
//                       </div>
//                     )}
//                     {stage === 'done' && (
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                         <div className="dot dot-green" />
//                         <span className="font-m" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.1em' }}>MISSION COMPLETE</span>
//                       </div>
//                     )}
//                   </div>

//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                     {attempts > 1 && <span className="chip chip-red">Loop #{attempts}</span>}
//                     <span className="chip chip-dim font-m" style={{ fontSize: 9 }}>{logs.length} events</span>
//                     <button className="btn-ghost" onClick={reset}>↺ New Mission</button>
//                     <button className="btn-ghost" onClick={onLogout}>logout</button>
//                   </div>
//                 </div>

//                 <div className="progress-track">
//                   <div className="progress-fill" style={{ width: `${progress}%` }} />
//                 </div>

//                 <div className="app-shell">
//                   <div className="sidebar">
//                     <div className="sidebar-inner">
//                       <div className="section-label">◈ Agent Operations Room</div>
//                       <AgentChat logs={logs} currentPhase={phase} attempts={attempts} />
//                     </div>
//                   </div>

//                   <div className="main-content">
//                     {stage === 'running' && !result && (
//                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 36 }}>
//                         {/* Your existing running UI with orbs */}
//                         <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
//                           {[
//                             { color: 'var(--blue)',  active: phase === 'archivist'   },
//                             { color: 'var(--amber)', active: phase === 'ghostwriter' },
//                             { color: 'var(--red)',   active: phase === 'prosecutor'  },
//                           ].map((orb, i) => (
//                             <div key={i} style={{ position: 'relative' }}>
//                               <div style={{
//                                 width: 60, height: 60, borderRadius: '50%',
//                                 background: orb.active ? `${orb.color}15` : 'rgba(255,255,255,0.025)',
//                                 border: `1px solid ${orb.active ? orb.color + '55' : 'rgba(255,255,255,0.07)'}`,
//                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                               }}>
//                                 <div style={{
//                                   width: 18, height: 18, borderRadius: '50%',
//                                   background: orb.active ? orb.color : 'rgba(255,255,255,0.08)',
//                                   boxShadow: orb.active ? `0 0 14px ${orb.color}` : 'none',
//                                 }} />
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                         <div style={{ textAlign: 'center' }}>
//                           <div className="font-d" style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
//                             {PHASE_LABEL[phase] || 'Initializing agents...'}
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {stage === 'error' && (
//                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, textAlign: 'center' }}>
//                         <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,51,85,0.1)', border: '1px solid rgba(255,51,85,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚠</div>
//                         <div>
//                           <div className="font-d" style={{ color: 'var(--red)', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>PIPELINE FAILURE</div>
//                           <div style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 460, lineHeight: 1.65 }}>{errMsg}</div>
//                         </div>
//                         <button className="btn-primary" onClick={reset}>↺ Retry Mission</button>
//                       </div>
//                     )}

//                     {result && (
//                       <CampaignPreview
//                         drafts={result.drafts}
//                         factSheet={result.factSheet}
//                         auditTrail={result.auditTrail}
//                         totalAttempts={result.totalAttempts}
//                         confidence={result.confidence || 95}
//                         personality={persona}
//                       />
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )
//           }
//         />

//         {/* Mission Detail Page */}
//         <Route path="/history/:id" element={<MissionDetail />} />
//       </Routes>
//     </Router>
//   )
// }





import { useState, useCallback } from 'react'
import AuthPage          from './pages/AuthPage.jsx'
import MissionDetailPage from './pages/MissionDetailPage.jsx'
import UploadArea        from './components/UploadArea.jsx'
import AgentChat         from './components/AgentChat.jsx'
import CampaignPreview   from './components/CampaignPreview.jsx'

const PHASE_PROGRESS = { archivist: 22, ghostwriter: 58, prosecutor: 82 }
const PHASE_LABEL    = {
  archivist:   'PHASE 1 — FACT EXTRACTION',
  ghostwriter: 'PHASE 2 — CONTENT SYNTHESIS',
  prosecutor:  'PHASE 3 — PROSECUTION AUDIT',
}

export default function App() {
  // ── Auth ─────────────────────────────────────────────
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem('s_user')) } catch { return null } })
  const [token, setToken] = useState(() => localStorage.getItem('s_token') || '')

  // ── Navigation ────────────────────────────────────────
  // stage: 'upload' | 'running' | 'done' | 'error' | 'missionDetail'
  const [stage,    setStage]    = useState('upload')
  const [detailId, setDetailId] = useState(null)

  // ── Pipeline ──────────────────────────────────────────
  const [logs,     setLogs]     = useState([])
  const [phase,    setPhase]    = useState(null)
  const [progress, setProgress] = useState(0)
  const [attempts, setAttempts] = useState(1)
  const [result,   setResult]   = useState(null)
  const [errMsg,   setErrMsg]   = useState('')
  const [persona,  setPersona]  = useState('professional')

  const addLog = useCallback(entry => setLogs(prev => [...prev, entry]), [])

  const handleEvent = useCallback(ev => {
    switch (ev.type) {
      case 'pipeline_start':
        addLog({ agent: 'system', status: 'phase', message: ev.message })
        setProgress(4)
        break
      case 'phase':
        setPhase(ev.phase)
        setProgress(PHASE_PROGRESS[ev.phase] || 50)
        addLog({ agent: 'system', status: 'phase', message: ev.message })
        break
      case 'log':
        addLog(ev)
        break
      case 'factsheet':
        addLog({ agent: 'archivist', status: 'approved', message: `Fact-Sheet locked — ${ev.data?.core_features?.length || 0} features, ${ev.data?.technical_specs?.length || 0} specs extracted.` })
        break
      case 'rejected':
        setAttempts(ev.attempt + 1)
        addLog({ agent: 'prosecutor', status: 'rejected', message: `REJECTED — ${ev.correctionNote}` })
        break
      case 'approved':
        addLog({ agent: 'prosecutor', status: 'approved', message: ev.message })
        setProgress(96)
        break
      case 'complete':
        setResult(ev)
        setStage('done')
        setPhase(null)
        setProgress(100)
        break
      case 'error':
        setErrMsg(ev.message)
        setStage('error')
        break
    }
  }, [addLog])

  const handleStart = async ({ type, text, file, personality }) => {
    setStage('running')
    setLogs([]); setResult(null); setErrMsg('')
    setAttempts(1); setProgress(2); setPhase(null)
    setPersona(personality)

    const fd = new FormData()
    fd.append('personality', personality)
    if (type === 'file' && file) fd.append('document', file)
    else fd.append('text', text)

    try {
      const res = await fetch('/api/run-pipeline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || `Server error ${res.status}`)
      }
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue
          try { handleEvent(JSON.parse(line.slice(6))) } catch {}
        }
      }
    } catch (err) {
      setErrMsg(err.message)
      setStage('error')
    }
  }

  const onAuth    = (u, t) => { setUser(u); setToken(t) }
  const onLogout  = () => {
    localStorage.removeItem('s_token')
    localStorage.removeItem('s_user')
    setUser(null); setToken(''); setStage('upload')
    setLogs([]); setResult(null)
  }
  const reset     = () => {
    setStage('upload'); setLogs([]); setResult(null)
    setErrMsg(''); setPhase(null); setAttempts(1); setProgress(0)
  }

  // ── View a past mission ───────────────────────────────
  const onViewMission = (id) => {
    setDetailId(id)
    setStage('missionDetail')
  }
  const onBackFromDetail = () => {
    setDetailId(null)
    setStage('upload')
  }

  /* ── RENDER ─────────────────────────────────────────── */

  // Not logged in
  if (!user || !token) return <AuthPage onAuth={onAuth} />

  // Mission detail page
  // if (stage === 'missionDetail' && detailId) {
  //   return (
  //     <MissionDetailPage
  //       missionId={detailId}
  //       token={token}
  //       onBack={onBackFromDetail}
  //     />
  //   )
  // }
    // Mission Detail View
  if (stage === 'missionDetail' && detailId) {
    return (
      <MissionDetailPage
        missionId={detailId}
        token={token}
        onBack={() => {
          setDetailId(null);
          setStage('upload');
        }}
      />
    );
  }

  // Upload screen
  if (stage === 'upload') {
    return (
      <UploadArea
        onStart={handleStart}
        user={user}
        token={token}
        onLogout={onLogout}
        onViewMission={onViewMission}
      />
    )
  }
  // Inside App component, after the other if conditions:

  // Mission Detail View
  if (stage === 'missionDetail' && detailId) {
    return (
      <MissionDetailPage
        missionId={detailId}
        token={token}
        onBack={() => {
          setDetailId(null);
          setStage('upload');
        }}
      />
    );
  }

  // Pipeline running / done / error
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Top bar */}
      <div className="app-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="font-d" style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
            SENTINEL <span style={{ color: 'var(--green)' }}>ASSEMBLY</span>
          </span>
          <div style={{ width: 1, height: 18, background: 'var(--border-hi)' }} />

          {phase && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="dot dot-amber" />
              <span className="font-m" style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em' }}>
                {PHASE_LABEL[phase]}
              </span>
            </div>
          )}
          {stage === 'done' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="dot dot-green" />
              <span className="font-m" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.1em' }}>MISSION COMPLETE</span>
            </div>
          )}
          {stage === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="dot dot-red" />
              <span className="font-m" style={{ fontSize: 10, color: 'var(--red)', letterSpacing: '0.1em' }}>PIPELINE FAILURE</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {attempts > 1 && <span className="chip chip-amber">Loop #{attempts}</span>}
          <span className="chip chip-dim font-m" style={{ fontSize: 9 }}>{logs.length} events</span>
          <button className="btn-ghost" onClick={reset}>↺ New Mission</button>
          <button className="btn-ghost" onClick={onLogout}>logout</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Shell */}
      <div className="app-shell">

        {/* Left — Agent Room */}
        <div className="sidebar">
          <div className="sidebar-inner">
            <div className="section-label">◈ Agent Operations Room</div>
            <AgentChat logs={logs} currentPhase={phase} attempts={attempts} />
          </div>
        </div>

        {/* Right — Output */}
        <div className="main-content">

          {/* Running, no result */}
          {stage === 'running' && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 36 }}>
              <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                {[
                  { color: 'var(--blue)',  active: phase === 'archivist'   },
                  { color: 'var(--amber)', active: phase === 'ghostwriter' },
                  { color: 'var(--red)',   active: phase === 'prosecutor'  },
                ].map((orb, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: orb.active ? `${orb.color}14` : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${orb.active ? orb.color + '55' : 'rgba(255,255,255,0.07)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.5s',
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: orb.active ? orb.color : 'rgba(255,255,255,0.08)',
                        boxShadow: orb.active ? `0 0 14px ${orb.color}` : 'none',
                        transition: 'all 0.5s',
                      }} />
                    </div>
                    {orb.active && (
                      <div className="orb-ring" style={{ color: orb.color }} />
                    )}
                    {i < 2 && (
                      <div style={{ position: 'absolute', top: '50%', left: '100%', width: 28, height: 1, background: 'rgba(255,255,255,0.06)', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="font-d" style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  {PHASE_LABEL[phase] || 'Initializing agents...'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Agents collaborating in real-time</div>
                <div className="font-m" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 10 }}>
                  ← Watch the Agent Operations Room for live updates
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {stage === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,51,85,0.1)', border: '1px solid rgba(255,51,85,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚠</div>
              <div>
                <div className="font-d" style={{ color: 'var(--red)', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>PIPELINE FAILURE</div>
                <div style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 460, lineHeight: 1.65 }}>{errMsg}</div>
                <div className="font-m" style={{ color: 'var(--text-3)', fontSize: 10, marginTop: 14, lineHeight: 1.9 }}>
                  → Verify OPENROUTER_API_KEY in server/.env<br />
                  → Confirm server is running: node index.js<br />
                  → Check https://sentinel-factory.onrender.com/api/health
                </div>
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }} onClick={reset}>↺ Retry Mission</button>
            </div>
          )}

          {/* Results */}
          {result && (
            <CampaignPreview
              drafts={result.drafts}
              factSheet={result.factSheet}
              auditTrail={result.auditTrail}
              totalAttempts={result.totalAttempts}
              confidence={result.confidence || 95}
              personality={persona}
            />
          )}

        </div>
      </div>
    </div>
  )
}