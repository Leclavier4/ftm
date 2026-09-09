import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { WORLDS, ALL_LABS, TOTAL_XP, RANKS, rankFor, checkFlag, cyrb53 } from './curriculum.js'
import { EXAM, PASS, TOTAL, shuffled } from './exam.js'

const STORAGE_KEY = 'ftm.progress.v1'

// ---------- Persistance (localStorage, jamais bloquante) ----------

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // stockage indisponible (mode privé, quota...) — on continue sans planter
  }
}

function useProgress() {
  const [progress, setProgress] = useState(loadProgress)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const capture = useCallback((labId) => {
    setProgress((p) => (p[labId] ? p : { ...p, [labId]: true }))
  }, [])

  const reset = useCallback(() => setProgress({}), [])

  // Enregistre un score d'examen : garde le meilleur essai, ne "dé-réussit" jamais.
  const recordExam = useCallback((score) => {
    setProgress((p) => ({
      ...p,
      examBest: Math.max(p.examBest || 0, score),
      examPassed: !!p.examPassed || score >= PASS,
    }))
  }, [])

  const setStudentName = useCallback((name) => {
    setProgress((p) => ({ ...p, studentName: name }))
  }, [])

  return { progress, capture, reset, recordExam, setStudentName }
}

// ---------- Helpers de progression ----------

function computeWorldsMeta(progress) {
  let prevComplete = true
  return WORLDS.map((world) => {
    const total = world.labs.length
    const done = world.labs.filter((l) => progress[l.id]).length
    const complete = done === total
    const locked = !prevComplete
    prevComplete = prevComplete && complete
    return { world, total, done, complete, locked }
  })
}

function getRankInfo(xp) {
  const percent = TOTAL_XP > 0 ? xp / TOTAL_XP : 0
  const current = rankFor(xp)
  const idx = RANKS.indexOf(current)
  const next = RANKS[idx + 1] || null
  let toNextPercent = 1
  if (next) {
    const span = next.minPercent - current.minPercent
    toNextPercent = span > 0 ? Math.min(1, Math.max(0, (percent - current.minPercent) / span)) : 1
  }
  return { current, next, idx, percent, toNextPercent }
}

// ---------- Mascotte Byte ----------

function Byte({ mood = 'idle', size = 64 }) {
  const cheer = mood === 'cheer'
  return (
    <svg
      className={`byte-svg ${cheer ? 'byte-cheer' : 'byte-idle'}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="byteGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#37E0A6" />
          <stop offset="100%" stopColor="#8B7CF0" />
        </linearGradient>
        <filter id="byteHalo" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        filter="url(#byteHalo)"
        d="M50 8 C25 8 10 28 10 52 V88 L24 76 L38 88 L50 78 L62 88 L76 76 L90 88 V52 C90 28 75 8 50 8 Z"
        fill="url(#byteGrad)"
      />
      {cheer ? (
        <>
          <rect x="29" y="40" width="11" height="14" rx="3" fill="#0A0E17" />
          <rect x="60" y="40" width="11" height="14" rx="3" fill="#0A0E17" />
          <path d="M31 64 Q50 82 69 64" stroke="#0A0E17" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="30" y="44" width="10" height="10" rx="2" fill="#0A0E17" />
          <rect x="60" y="44" width="10" height="10" rx="2" fill="#0A0E17" />
          <rect x="38" y="66" width="24" height="4" rx="2" fill="#0A0E17" />
        </>
      )}
    </svg>
  )
}

// ---------- Blason Vertex Académie ----------

function VertexMark({ size = 72 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1C4A7A" /><stop offset="1" stopColor="#0C2340" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="94" height="94" rx="22" fill="url(#vg)" />
      <path d="M50 24 L75 74 L25 74 Z" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
      <line x1="50" y1="27" x2="50" y2="74" stroke="#C79A3B" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="50" cy="24" r="7" fill="#C79A3B" />
      <circle cx="25" cy="74" r="4.5" fill="#9FB2C6" />
      <circle cx="75" cy="74" r="4.5" fill="#9FB2C6" />
    </svg>
  )
}

// Utilise le logo fourni (public/vertex-academie.png) s'il charge, sinon le blason SVG de secours.
function VertexLogo({ size = 72 }) {
  const [broken, setBroken] = useState(false)
  if (broken) return <VertexMark size={size} />
  return (
    <img
      src="/vertex-academie.png"
      alt="Vertex Académie"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
      onError={() => setBroken(true)}
    />
  )
}

// Sceau doré du certificat (rosette SVG portant le rang atteint).
function CertSeal({ rank }) {
  const points = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 * Math.PI) / 180
    return { x: 50 + Math.cos(angle) * 38, y: 50 + Math.sin(angle) * 38 }
  })
  return (
    <div className="cert-seal-wrap">
      <svg width="82" height="82" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="sealGrad" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#E9C568" />
            <stop offset="100%" stopColor="#C79A3B" />
          </radialGradient>
        </defs>
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="8.5" fill="url(#sealGrad)" />
        ))}
        <circle cx="50" cy="50" r="33" fill="url(#sealGrad)" stroke="#0C2340" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="26" fill="none" stroke="#0C2340" strokeWidth="1" />
        <text x="50" y="47" textAnchor="middle" fontSize="9" fill="#0C2340" fontFamily="'Playfair Display', serif" fontWeight="700">
          VERTEX
        </text>
        <text x="50" y="59" textAnchor="middle" fontSize="6.5" fill="#0C2340" fontFamily="'Inter', sans-serif">
          ACADÉMIE
        </text>
      </svg>
      <span className="cert-seal-rank">
        {rank.emoji} {rank.name}
      </span>
    </div>
  )
}

// ---------- Confetti + Toast ----------

function Confetti({ triggerId }) {
  const pieces = useMemo(() => {
    if (!triggerId) return []
    const colors = ['#37E0A6', '#8B7CF0', '#F0B429', '#57C7F2', '#FF6B81']
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      duration: 1.3 + Math.random() * 1.3,
      color: colors[i % colors.length],
      rotate: Math.round(Math.random() * 360),
      drift: Math.round((Math.random() - 0.5) * 120),
    }))
  }, [triggerId])

  if (!triggerId || pieces.length === 0) return null

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={`${triggerId}-${p.id}`}
          className="confetti-piece"
          style={{
            left: p.left + '%',
            background: p.color,
            animationDelay: p.delay + 's',
            animationDuration: p.duration + 's',
            '--drift': p.drift + 'px',
            '--rot': p.rotate + 'deg',
          }}
        />
      ))}
    </div>
  )
}

// ---------- Fil d'Ariane ----------

function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="breadcrumb-item">
          {it.onClick ? (
            <button type="button" className="breadcrumb-link" onClick={it.onClick}>
              {it.label}
            </button>
          ) : (
            <span className="breadcrumb-current">{it.label}</span>
          )}
          {i < items.length - 1 && <span className="breadcrumb-sep">/</span>}
        </span>
      ))}
    </nav>
  )
}

// ---------- Barre du haut ----------

function TopBar({ rankInfo, xp, onReset, onLogoClick }) {
  const { current, toNextPercent } = rankInfo
  const rankLevel = RANKS.indexOf(current)
  return (
    <header className="topbar no-print">
      <button type="button" className="logo" onClick={onLogoClick} aria-label="Retour à l'accueil">
        <span className="logo-mark">👾</span>
        <span className="logo-text">
          FTM <span className="logo-accent">Academy</span>
        </span>
      </button>
      <div className="rank-chip">
        <span className="rank-emoji">{current.emoji}</span>
        <span className="rank-text">
          <span className="rank-line1">
            lvl {rankLevel} · {current.name}
          </span>
          <span className="rank-line2">{xp} XP</span>
        </span>
        <span className="rank-bar" title={`${Math.round(toNextPercent * 100)}% vers le rang suivant`}>
          <span className="rank-bar-fill" style={{ width: `${Math.round(toNextPercent * 100)}%` }} />
        </span>
      </div>
      <button type="button" className="reset-btn" onClick={onReset} title="Réinitialiser la progression" aria-label="Réinitialiser la progression">
        ↺
      </button>
    </header>
  )
}

// ---------- Accueil ----------

function Hero({ progress, onStart }) {
  const firstIncomplete = useMemo(() => ALL_LABS.find((l) => !progress[l.id]), [progress])
  const started = useMemo(() => ALL_LABS.some((l) => progress[l.id]), [progress])
  const allDone = !firstIncomplete

  return (
    <section className="hero">
      <div className="hero-text">
        <p className="prompt-line">
          root@ftm:~$ <span className="cursor">▋</span>
        </p>
        <h1 className="hero-title">
          Apprends à hacker.
          <br />
          Un flag à la fois.
        </h1>
        <p className="hero-sub">
          9 mondes, 29 labs, du niveau 0 au niveau <strong>God</strong>. Une seule règle : tout se passe dans TON
          labo.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => firstIncomplete && onStart(firstIncomplete)}
          disabled={allDone}
        >
          {allDone ? '> parcours terminé — bravo !' : started ? '> continuer' : '> commencer au niveau 0'}
        </button>
      </div>
      <div className="hero-mascot">
        <Byte mood="idle" size={128} />
        <div className="speech-bubble">Prêt·e à commencer&nbsp;? 👾</div>
      </div>
    </section>
  )
}

function WorldCard({ meta, index, onOpen }) {
  const { world, total, done, complete, locked } = meta
  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  let status = 'unlocked'
  if (locked) status = 'locked'
  else if (complete) status = 'complete'

  return (
    <button
      type="button"
      className={`world-card world-card--${status}`}
      style={{ '--accent': world.accent }}
      onClick={() => !locked && onOpen(world.id)}
      disabled={locked}
    >
      <span className="world-card-emoji">{world.emoji}</span>
      <span className="world-card-body">
        <span className="world-card-id">monde_{index}</span>
        <span className="world-card-name">{world.name}</span>
        <span className="world-card-tagline">{world.tagline}</span>
        <span className="world-card-progress">
          <span className="world-card-bar">
            <span className="world-card-bar-fill" style={{ width: `${percent}%` }} />
          </span>
          <span className="world-card-count">
            {done}/{total}
          </span>
        </span>
      </span>
      <span className="world-card-status" aria-hidden="true">
        {status === 'locked' ? '🔒' : status === 'complete' ? '✓' : '▸'}
      </span>
    </button>
  )
}

// ---------- Carte examen final (accueil) ----------

function ExamCard({ allDone, examPassed, examBest, onStart, onCertificate }) {
  if (!allDone) {
    return (
      <div className="exam-card exam-card--locked">
        <span className="exam-card-icon" aria-hidden="true">🔒</span>
        <div className="exam-card-body">
          <span className="exam-card-title">Examen final</span>
          <span className="exam-card-desc">Termine les 9 mondes pour débloquer l'examen final</span>
        </div>
      </div>
    )
  }

  if (examPassed) {
    return (
      <div className="exam-card exam-card--passed">
        <span className="exam-card-icon" aria-hidden="true">✅</span>
        <div className="exam-card-body">
          <span className="exam-card-title">Examen final — réussi</span>
          <span className="exam-card-desc">
            Meilleur score {examBest}/{TOTAL}
          </span>
        </div>
        <button type="button" className="btn btn-primary" onClick={onCertificate}>
          Voir / générer mon certificat
        </button>
      </div>
    )
  }

  return (
    <div className="exam-card exam-card--available">
      <span className="exam-card-icon" aria-hidden="true">🎓</span>
      <div className="exam-card-body">
        <span className="exam-card-title">Examen final</span>
        <span className="exam-card-desc">
          15 questions · réussite à 11/15{examBest ? ` · meilleur essai ${examBest}/${TOTAL}` : ''}
        </span>
      </div>
      <button type="button" className="btn btn-primary" onClick={onStart}>
        🎓 Passer l'examen final
      </button>
    </div>
  )
}

// ---------- Vue monde ----------

function WorldView({ world, progress, onOpenLab, onBackHome }) {
  return (
    <section className="world-view">
      <Breadcrumb items={[{ label: 'Accueil', onClick: onBackHome }, { label: world.name }]} />
      <header className="world-view-header" style={{ '--accent': world.accent }}>
        <span className="world-view-emoji">{world.emoji}</span>
        <div>
          <h2>{world.name}</h2>
          <p className="world-view-tagline">{world.tagline}</p>
        </div>
      </header>
      <p className="world-view-intro">{world.intro}</p>
      <ol className="lab-list">
        {world.labs.map((lab, i) => {
          const done = !!progress[lab.id]
          return (
            <li key={lab.id}>
              <button type="button" className={`lab-row ${done ? 'lab-row--done' : ''}`} onClick={() => onOpenLab(lab.id)}>
                <span className="lab-num">{done ? '✓' : String(i + 1).padStart(2, '0')}</span>
                <span className="lab-title-block">
                  <span className="lab-title">{lab.title}</span>
                  <span className="lab-tagline">{lab.tagline}</span>
                </span>
                <span className="lab-meta">
                  +{lab.xp} XP · {lab.est}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

// ---------- Vue lab ----------

function LabView({ world, lab, captured, onCapture, onBackHome, onBackWorld, onNextLab, nextLab }) {
  const [revealedHints, setRevealedHints] = useState(0)
  const [flagInput, setFlagInput] = useState('')
  const [status, setStatus] = useState('idle') // idle | error | success

  useEffect(() => {
    setRevealedHints(0)
    setFlagInput('')
    setStatus('idle')
  }, [lab.id])

  const success = captured || status === 'success'

  function handleSubmit(e) {
    e.preventDefault()
    if (success) return
    if (checkFlag(flagInput, lab.flagHash)) {
      setStatus('success')
      onCapture(lab.id)
    } else {
      setStatus('error')
    }
  }

  return (
    <section className="lab-view">
      <Breadcrumb
        items={[
          { label: 'Accueil', onClick: onBackHome },
          { label: world.name, onClick: onBackWorld },
          { label: lab.title },
        ]}
      />
      <header className="lab-view-header" style={{ '--accent': world.accent }}>
        <p className="lab-view-world">
          {world.emoji} {world.name}
        </p>
        <h2>{lab.title}</h2>
        <p className="lab-view-tagline">{lab.tagline}</p>
        <p className="lab-view-meta">
          +{lab.xp} XP · {lab.est}
        </p>
      </header>

      <div className="terminal-panel">
        <div className="terminal-bar">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
          <span className="terminal-bar-label">briefing — {lab.id}</span>
        </div>
        <div className="terminal-body">
          <p className="lab-intro">{lab.intro}</p>

          <p className="section-label">// objectifs</p>
          <ul className="objectives">
            {lab.objectives.map((o, i) => (
              <li key={i}>
                <span className="checkbox">[x]</span> {o}
              </li>
            ))}
          </ul>

          <p className="section-label">// marche à suivre</p>
          <ol className="steps">
            {lab.steps.map((s, i) => (
              <li key={i}>
                <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="step-text">{s}</span>
              </li>
            ))}
          </ol>

          <div className="run-block">
            <a className="btn btn-run" href={lab.download} download>
              ⬇ télécharger {lab.id}.py
            </a>
            <p className="run-note">
              <code>$ python3 {lab.id}.py</code> — exécute-le APRÈS la tâche : il pose une question et ne révèle le
              flag que si tu l'as vraiment faite.
            </p>
          </div>

          <p className="section-label">// indices</p>
          <div className="hints-block">
            {lab.hints.length === 0 ? (
              <p className="muted">Aucun indice pour ce lab — tu es prêt·e.</p>
            ) : (
              <>
                {revealedHints > 0 && (
                  <ul className="hints-list">
                    {lab.hints.slice(0, revealedHints).map((h, i) => (
                      <li key={i}>💡 {h}</li>
                    ))}
                  </ul>
                )}
                {revealedHints < lab.hints.length && (
                  <button type="button" className="btn btn-ghost" onClick={() => setRevealedHints((n) => n + 1)}>
                    révéler l'indice {revealedHints + 1}/{lab.hints.length}
                  </button>
                )}
              </>
            )}
          </div>

          <p className="section-label">// soumettre le flag</p>
          <div className="flag-zone">
            {success ? (
              <div className="flag-success">
                <Byte mood="cheer" size={72} />
                <div>
                  <p className="success-msg">{lab.success}</p>
                  {nextLab ? (
                    <button type="button" className="btn btn-primary" onClick={() => onNextLab(nextLab)}>
                      lab suivant →
                    </button>
                  ) : (
                    <p className="success-final">C'était le dernier lab. Niveau God atteint. 👑</p>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flag-form">
                <div className="flag-input-row">
                  <input
                    id={`flag-input-${lab.id}`}
                    className="flag-input"
                    placeholder="FTM{...}"
                    value={flagInput}
                    onChange={(e) => {
                      setFlagInput(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button type="submit" className="btn btn-primary">
                    valider
                  </button>
                </div>
                {status === 'error' && (
                  <p className="flag-error">
                    ✗ Flag incorrect. As-tu bien exécuté <code>python3 {lab.id}.py</code> après avoir fait la tâche ?
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Vue examen final ----------

function ExamView({ onBackHome, onCertificate, recordExam }) {
  const [questions, setQuestions] = useState(() => shuffled(EXAM))
  const [answers, setAnswers] = useState({})
  const [mode, setMode] = useState('answering') // answering | corrected
  const [score, setScore] = useState(0)

  function selectAnswer(qid, idx) {
    if (mode === 'corrected') return
    setAnswers((a) => ({ ...a, [qid]: idx }))
  }

  function handleValidate(e) {
    e.preventDefault()
    const s = questions.reduce((acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0)
    setScore(s)
    setMode('corrected')
    recordExam(s)
  }

  function handleRestart() {
    setQuestions(shuffled(EXAM))
    setAnswers({})
    setMode('answering')
    setScore(0)
  }

  const answeredCount = Object.keys(answers).length
  const passed = score >= PASS

  return (
    <section className="exam-view">
      <Breadcrumb items={[{ label: 'Accueil', onClick: onBackHome }, { label: 'Examen final' }]} />
      <header className="exam-header">
        <p className="section-label">// examen final</p>
        <h2>Examen final</h2>
        <p className="exam-sub">15 questions · réussite à 11/15 · tu peux réessayer</p>
      </header>

      <form onSubmit={handleValidate}>
        <ol className="exam-list">
          {questions.map((q, i) => {
            const chosen = answers[q.id]
            return (
              <li key={q.id} className="exam-q">
                <p className="exam-q-module">{q.module}</p>
                <p className="exam-q-text">
                  <span className="exam-q-num">{String(i + 1).padStart(2, '0')}</span> {q.q}
                </p>
                <div className="exam-options">
                  {q.options.map((opt, oi) => {
                    let cls = 'exam-option'
                    if (mode === 'corrected') {
                      if (oi === q.answer) cls += ' exam-option--correct'
                      else if (oi === chosen) cls += ' exam-option--wrong'
                    } else if (chosen === oi) cls += ' exam-option--selected'
                    return (
                      <label key={oi} className={cls}>
                        <input
                          type="radio"
                          name={q.id}
                          checked={chosen === oi}
                          onChange={() => selectAnswer(q.id, oi)}
                          disabled={mode === 'corrected'}
                        />
                        <span>{opt}</span>
                      </label>
                    )
                  })}
                </div>
                {mode === 'corrected' && (
                  <p className={`exam-explain ${chosen === q.answer ? 'exam-explain--ok' : 'exam-explain--ko'}`}>
                    {chosen === q.answer ? '✓ ' : '✗ '}
                    {q.explain}
                  </p>
                )}
              </li>
            )
          })}
        </ol>

        {mode === 'answering' && (
          <div className="exam-actions">
            <p className="exam-progress">
              {answeredCount}/{TOTAL} répondues
            </p>
            <button type="submit" className="btn btn-primary btn-lg" disabled={answeredCount < TOTAL}>
              valider mes réponses
            </button>
          </div>
        )}
      </form>

      {mode === 'corrected' && (
        <div className={`exam-result ${passed ? 'exam-result--pass' : 'exam-result--fail'}`}>
          <p className="exam-score">
            {score}/{TOTAL}
          </p>
          {passed ? (
            <>
              <p className="exam-result-msg">✓ Réussi !</p>
              <button type="button" className="btn btn-primary btn-lg" onClick={onCertificate}>
                🎓 générer mon certificat
              </button>
            </>
          ) : (
            <>
              <p className="exam-result-msg">Pas encore — révise et réessaie</p>
              <button type="button" className="btn btn-ghost btn-lg" onClick={handleRestart}>
                recommencer
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

// ---------- Vue certificat ----------

function CertificateView({ progress, xp, onSetName, onBackHome }) {
  const [showForm, setShowForm] = useState(!progress.studentName)
  const [nameInput, setNameInput] = useState(progress.studentName || '')

  function handleGenerate(e) {
    e.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed) return
    onSetName(trimmed)
    setShowForm(false)
  }

  if (showForm) {
    return (
      <section className="cert-form-view">
        <Breadcrumb items={[{ label: 'Accueil', onClick: onBackHome }, { label: 'Certificat' }]} />
        <div className="cert-form-card">
          <VertexLogo size={56} />
          <h2>Génère ton certificat</h2>
          <form onSubmit={handleGenerate}>
            <label htmlFor="student-name">Ton nom complet (tel qu'il figurera sur le certificat)</label>
            <input
              id="student-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Prénom Nom"
              autoComplete="off"
              autoFocus
            />
            <button type="submit" className="btn btn-primary" disabled={!nameInput.trim()}>
              générer
            </button>
          </form>
        </div>
      </section>
    )
  }

  const name = progress.studentName || ''
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const rank = rankFor(xp)
  const score = progress.examBest || 0
  const code = 'VTX-' + cyrb53(name + dateStr).toUpperCase().slice(0, 8)

  return (
    <section className="cert-view">
      <div className="cert-toolbar no-print">
        <Breadcrumb items={[{ label: 'Accueil', onClick: onBackHome }, { label: 'Certificat' }]} />
        <div className="cert-toolbar-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setShowForm(true)}>
            modifier le nom
          </button>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            🖨 Imprimer / Enregistrer en PDF
          </button>
        </div>
      </div>

      <div className="certificate">
        <div className="cert-border">
          <header className="cert-header">
            <VertexLogo size={64} />
            <div className="cert-brand">
              <span className="cert-brand-name">VERTEX ACADÉMIE</span>
              <span className="cert-brand-sub">Cybersecurity Training</span>
            </div>
          </header>

          <h1 className="cert-title">Certificat de fin de formation</h1>

          <div className="cert-body">
            <p className="cert-line">Ce présent certificat atteste que</p>
            <p className="cert-name">{name}</p>
            <p className="cert-line">a suivi et validé avec succès le parcours</p>
            <p className="cert-program">« FTM Academy — Cybersécurité, du niveau 0 au niveau God »</p>
            <p className="cert-result">
              Examen final réussi avec un score de {score}/15.
              <span className="cert-rank">
                Rang : {rank.name} {rank.emoji}
              </span>
            </p>
          </div>

          <div className="cert-modules">
            {WORLDS.map((w) => (
              <p className="cert-module" key={w.id}>
                ✓ {w.name} — {w.tagline}
              </p>
            ))}
          </div>

          <footer className="cert-footer">
            <div className="cert-footer-left">
              <p className="cert-date">Délivré le {dateStr}</p>
              <div className="cert-sig">
                <span className="cert-sig-line">Chabmane — Vertex Global</span>
              </div>
              <p className="cert-code">Code de vérification : {code}</p>
            </div>
            <CertSeal rank={rank} />
          </footer>

          <p className="cert-banner">Prêt pour le niveau supérieur.</p>
        </div>
      </div>
    </section>
  )
}

// ---------- Pied de page ----------

function Footer() {
  return (
    <footer className="footer no-print">
      <p>
        <span className="prompt-inline">root@ftm:~$</span> règle d'or — on ne teste jamais un système sans
        autorisation. Tout se passe dans TON labo.
      </p>
      <p className="footer-flags">
        flags : <code>{'FTM{...}'}</code>
      </p>
    </footer>
  )
}

// ---------- App ----------

export default function App() {
  const { progress, capture, reset, recordExam, setStudentName } = useProgress()
  const [view, setView] = useState({ name: 'home' })
  const [confettiId, setConfettiId] = useState(0)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const worldsMeta = useMemo(() => computeWorldsMeta(progress), [progress])
  const xp = useMemo(() => ALL_LABS.reduce((sum, l) => sum + (progress[l.id] ? l.xp : 0), 0), [progress])
  const rankInfo = useMemo(() => getRankInfo(xp), [xp])
  const allWorldsDone = useMemo(() => worldsMeta.every((m) => m.complete), [worldsMeta])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const goHome = useCallback(() => setView({ name: 'home' }), [])
  const goWorld = useCallback((worldId) => setView({ name: 'world', worldId }), [])
  const goLab = useCallback((worldId, labId) => setView({ name: 'lab', worldId, labId }), [])
  const goExam = useCallback(() => setView({ name: 'exam' }), [])
  const goCertificate = useCallback(() => setView({ name: 'certificate' }), [])

  const fireCapture = useCallback((labId, xpAmount) => {
    setToast(`+${xpAmount} XP · flag capturé`)
    setConfettiId(Date.now())
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const handleCapture = useCallback(
    (labId) => {
      const lab = ALL_LABS.find((l) => l.id === labId)
      capture(labId)
      if (lab) fireCapture(labId, lab.xp)
    },
    [capture, fireCapture]
  )

  const handleReset = useCallback(() => {
    if (window.confirm("Réinitialiser toute ta progression ? Cette action est irréversible.")) {
      reset()
      goHome()
    }
  }, [reset, goHome])

  const handleHeroStart = useCallback(
    (lab) => {
      if (!lab) return
      goLab(lab.worldId, lab.id)
    },
    [goLab]
  )

  const homeContent = (
    <>
      <Hero progress={progress} onStart={handleHeroStart} />
      <div className="worlds-list">
        {worldsMeta.map((meta, i) => (
          <WorldCard key={meta.world.id} meta={meta} index={i} onOpen={goWorld} />
        ))}
      </div>
      <ExamCard
        allDone={allWorldsDone}
        examPassed={!!progress.examPassed}
        examBest={progress.examBest || 0}
        onStart={goExam}
        onCertificate={goCertificate}
      />
    </>
  )

  let content = null

  if (view.name === 'home') {
    content = homeContent
  } else if (view.name === 'world') {
    const world = WORLDS.find((w) => w.id === view.worldId)
    if (world) {
      content = <WorldView world={world} progress={progress} onOpenLab={(labId) => goLab(world.id, labId)} onBackHome={goHome} />
    }
  } else if (view.name === 'lab') {
    const world = WORLDS.find((w) => w.id === view.worldId)
    const lab = world?.labs.find((l) => l.id === view.labId)
    if (world && lab) {
      const idx = ALL_LABS.findIndex((l) => l.id === lab.id)
      const nextLab = ALL_LABS[idx + 1]
      content = (
        <LabView
          world={world}
          lab={lab}
          captured={!!progress[lab.id]}
          onCapture={handleCapture}
          onBackHome={goHome}
          onBackWorld={() => goWorld(world.id)}
          onNextLab={(nl) => goLab(nl.worldId, nl.id)}
          nextLab={nextLab}
        />
      )
    }
  } else if (view.name === 'exam') {
    if (allWorldsDone) {
      content = <ExamView onBackHome={goHome} onCertificate={goCertificate} recordExam={recordExam} />
    }
  } else if (view.name === 'certificate') {
    if (progress.examPassed) {
      content = <CertificateView progress={progress} xp={xp} onSetName={setStudentName} onBackHome={goHome} />
    }
  }

  if (!content) {
    // vue invalide ou inaccessible (id inconnu, examen/certificat pas encore débloqué) : retour à l'accueil
    content = homeContent
  }

  return (
    <div className="app">
      <TopBar rankInfo={rankInfo} xp={xp} onReset={handleReset} onLogoClick={goHome} />
      <main className="main">{content}</main>
      <Footer />
      <Confetti triggerId={confettiId} />
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      <style>{CSS}</style>
    </div>
  )
}

// ---------- CSS ----------

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root {
  --bg: #0A0E17;
  --panel: #121826;
  --panel-2: #0E1420;
  --line: #232B3B;
  --ink: #E7ECF5;
  --muted: #8B95AB;
  --violet: #8B7CF0;
  --violet-2: #6C5CE7;
  --green: #37E0A6;
  --coral: #FF6B81;
  --gold: #F0B429;
  --cyan: #57C7F2;
  --radius: 10px;
  --font-title: 'Space Grotesk', 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  /* Palette Vertex Académie — réservée au certificat (contraste formel voulu) */
  --vertex-navy: #12385F;
  --vertex-navy-dark: #0C2340;
  --vertex-gold: #C79A3B;
  --vertex-ink: #1B2A3A;
  --vertex-paper: #FFFFFF;
  --vertex-paper-warm: #F6F3EC;
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;
}

* { box-sizing: border-box; }

html, body { margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
}

#root { min-height: 100vh; }

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: var(--bg);
  background-image:
    linear-gradient(rgba(139,124,240,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,124,240,0.05) 1px, transparent 1px),
    radial-gradient(ellipse 900px 500px at 15% -5%, rgba(55,224,166,0.14), transparent 60%),
    radial-gradient(ellipse 900px 600px at 100% 10%, rgba(139,124,240,0.14), transparent 60%);
  background-size: 42px 42px, 42px 42px, auto, auto;
  overflow-x: hidden;
}

.main { flex: 1; width: 100%; max-width: 900px; margin: 0 auto; padding: 24px 20px 60px; }

button { font-family: inherit; cursor: pointer; }
code { font-family: var(--font-mono); }

/* ---------- Topbar ---------- */

.topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: 16px;
  padding: 14px 20px;
  background: rgba(10,14,23,0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}

.logo {
  background: none; border: none; display: flex; align-items: center; gap: 8px;
  font-family: var(--font-title); font-weight: 700; font-size: 1.05rem; color: var(--ink);
  padding: 4px 0;
}
.logo-mark { font-size: 1.3rem; }
.logo-accent { color: var(--green); }

.rank-chip {
  margin-left: auto;
  display: flex; align-items: center; gap: 10px;
  background: var(--panel); border: 1px solid var(--line); border-radius: 999px;
  padding: 6px 14px 6px 10px;
}
.rank-emoji { font-size: 1.2rem; }
.rank-text { display: flex; flex-direction: column; line-height: 1.15; font-family: var(--font-mono); }
.rank-line1 { font-size: 0.72rem; color: var(--ink); font-weight: 500; }
.rank-line2 { font-size: 0.68rem; color: var(--muted); }
.rank-bar { width: 60px; height: 5px; background: var(--line); border-radius: 999px; overflow: hidden; }
.rank-bar-fill { height: 100%; background: linear-gradient(90deg, var(--green), var(--violet)); }

.reset-btn {
  background: var(--panel); border: 1px solid var(--line); color: var(--muted);
  width: 34px; height: 34px; border-radius: 8px; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  transition: color 0.15s, border-color 0.15s;
}
.reset-btn:hover { color: var(--coral); border-color: var(--coral); }

/* ---------- Prompts / bloc terminal générique ---------- */

.prompt-line { font-family: var(--font-mono); color: var(--green); font-size: 0.9rem; margin: 0 0 12px; }
.prompt-inline { font-family: var(--font-mono); color: var(--green); }
.cursor { animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }

/* ---------- Hero ---------- */

.hero {
  display: flex; align-items: center; justify-content: space-between; gap: 32px;
  padding: 48px 0 40px; flex-wrap: wrap;
}
.hero-text { flex: 1 1 380px; min-width: 280px; }
.hero-title {
  font-family: var(--font-title); font-weight: 700; font-size: clamp(1.9rem, 4vw, 2.8rem);
  line-height: 1.15; margin: 0 0 14px; color: var(--ink);
}
.hero-sub { color: var(--muted); font-size: 1rem; line-height: 1.5; margin: 0 0 22px; max-width: 46ch; }
.hero-mascot { flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 12px; }

.speech-bubble {
  font-family: var(--font-mono); font-size: 0.78rem; color: var(--ink);
  background: var(--panel); border: 1px solid var(--line); border-radius: 10px;
  padding: 8px 12px; position: relative;
}

/* ---------- Boutons ---------- */

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: var(--font-mono); font-weight: 500; font-size: 0.85rem;
  border-radius: 8px; border: 1px solid transparent; padding: 10px 18px;
  text-decoration: none; transition: transform 0.1s, filter 0.15s, background 0.15s;
  color: var(--ink);
}
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary { background: var(--green); color: #06140F; border-color: var(--green); font-weight: 600; }
.btn-primary:hover:not(:disabled) { filter: brightness(1.08); }

.btn-lg { padding: 13px 24px; font-size: 0.95rem; }

.btn-run {
  background: var(--green); color: #06140F; border-color: var(--green); font-weight: 600;
}
.btn-run:hover { filter: brightness(1.08); }

.btn-ghost {
  background: transparent; border-color: var(--line); color: var(--cyan);
}
.btn-ghost:hover { border-color: var(--cyan); }

/* ---------- Liste des mondes ---------- */

.worlds-list { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }

.world-card {
  --accent: var(--violet);
  display: flex; align-items: center; gap: 16px;
  background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 16px 18px; text-align: left; width: 100%;
  transition: border-color 0.15s, transform 0.1s;
}
.world-card--unlocked, .world-card--complete { }
.world-card--unlocked:hover, .world-card--complete:hover { border-color: var(--accent); transform: translateY(-1px); }
.world-card--locked { opacity: 0.45; cursor: not-allowed; }

.world-card-emoji {
  font-size: 1.8rem; flex: 0 0 auto;
  width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; background: color-mix(in srgb, var(--accent) 18%, transparent);
}

.world-card-body { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.world-card-id { font-family: var(--font-mono); font-size: 0.68rem; color: var(--accent); }
.world-card-name { font-family: var(--font-title); font-weight: 600; font-size: 1.05rem; color: var(--ink); }
.world-card-tagline { font-size: 0.85rem; color: var(--muted); }
.world-card-progress { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.world-card-bar { flex: 1; max-width: 160px; height: 5px; background: var(--line); border-radius: 999px; overflow: hidden; }
.world-card-bar-fill { height: 100%; background: var(--accent); }
.world-card-count { font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); }

.world-card-status { font-size: 1.1rem; color: var(--accent); flex: 0 0 auto; }

/* ---------- Vue monde ---------- */

.breadcrumb { font-family: var(--font-mono); font-size: 0.78rem; color: var(--muted); margin-bottom: 18px; }
.breadcrumb-item { display: inline; }
.breadcrumb-link { background: none; border: none; color: var(--cyan); font-family: inherit; font-size: inherit; padding: 0; }
.breadcrumb-link:hover { text-decoration: underline; }
.breadcrumb-current { color: var(--ink); }
.breadcrumb-sep { margin: 0 8px; color: var(--line); }

.world-view-header {
  --accent: var(--violet);
  display: flex; align-items: center; gap: 16px; margin-bottom: 14px;
}
.world-view-emoji {
  font-size: 2rem; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;
  border-radius: 12px; background: color-mix(in srgb, var(--accent) 18%, transparent); flex: 0 0 auto;
}
.world-view-header h2 { font-family: var(--font-title); margin: 0 0 2px; font-size: 1.5rem; }
.world-view-tagline { margin: 0; color: var(--accent); font-size: 0.9rem; font-family: var(--font-mono); }
.world-view-intro { color: var(--muted); line-height: 1.6; margin-bottom: 24px; max-width: 68ch; }

.lab-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.lab-row {
  width: 100%; display: flex; align-items: center; gap: 16px; text-align: left;
  background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px;
  transition: border-color 0.15s;
}
.lab-row:hover { border-color: var(--cyan); }
.lab-row--done { border-color: var(--green); }
.lab-num {
  font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem; color: var(--muted);
  width: 28px; flex: 0 0 auto; text-align: center;
}
.lab-row--done .lab-num { color: var(--green); }
.lab-title-block { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.lab-title { font-weight: 600; font-family: var(--font-title); }
.lab-tagline { font-size: 0.82rem; color: var(--muted); }
.lab-meta { font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); white-space: nowrap; }

/* ---------- Vue lab ---------- */

.lab-view-header { --accent: var(--violet); margin-bottom: 20px; }
.lab-view-world { font-family: var(--font-mono); color: var(--accent); font-size: 0.82rem; margin: 0 0 4px; }
.lab-view-header h2 { font-family: var(--font-title); margin: 0 0 4px; font-size: 1.6rem; }
.lab-view-tagline { margin: 0 0 6px; color: var(--muted); }
.lab-view-meta { font-family: var(--font-mono); font-size: 0.78rem; color: var(--ink); margin: 0; }

.terminal-panel {
  background: var(--panel-2); border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2), 0 20px 60px -30px rgba(55,224,166,0.15);
}
.terminal-bar {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  background: var(--panel); border-bottom: 1px solid var(--line);
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-red { background: #FF5F57; }
.dot-yellow { background: #FEBC2E; }
.dot-green { background: #28C840; }
.terminal-bar-label { margin-left: 8px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }

.terminal-body { padding: 20px 22px 26px; }
.lab-intro { color: var(--ink); line-height: 1.65; margin: 0 0 22px; }

.section-label {
  font-family: var(--font-mono); color: var(--green); font-size: 0.8rem; font-weight: 700;
  margin: 24px 0 10px; letter-spacing: 0.02em;
}
.section-label:first-of-type { margin-top: 0; }

.objectives { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.objectives li { font-family: var(--font-mono); font-size: 0.88rem; color: var(--ink); display: flex; gap: 8px; }
.checkbox { color: var(--green); font-weight: 700; }

.steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; counter-reset: step; }
.steps li { display: flex; gap: 12px; align-items: baseline; }
.step-num {
  font-family: var(--font-mono); font-size: 0.78rem; color: var(--violet); font-weight: 700;
  flex: 0 0 auto; min-width: 22px;
}
.step-text { color: var(--ink); line-height: 1.55; }
.step-text code { background: rgba(139,124,240,0.12); padding: 1px 6px; border-radius: 4px; color: var(--cyan); }

.run-block {
  margin-top: 22px; padding: 16px; background: rgba(55,224,166,0.06);
  border: 1px dashed rgba(55,224,166,0.35); border-radius: 10px;
  display: flex; flex-direction: column; gap: 10px; align-items: flex-start;
}
.run-note { margin: 0; color: var(--muted); font-size: 0.83rem; line-height: 1.5; }
.run-note code { color: var(--green); background: rgba(55,224,166,0.1); padding: 1px 6px; border-radius: 4px; }

.hints-block { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
.hints-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.hints-list li {
  font-size: 0.88rem; color: var(--ink); background: var(--panel); border: 1px solid var(--line);
  border-radius: 8px; padding: 10px 12px; line-height: 1.5;
}
.muted { color: var(--muted); font-size: 0.88rem; margin: 0; }

.flag-zone { margin-top: 6px; }
.flag-form { display: flex; flex-direction: column; gap: 10px; }
.flag-input-row { display: flex; gap: 10px; flex-wrap: wrap; }
.flag-input {
  flex: 1; min-width: 220px; font-family: var(--font-mono); font-size: 0.95rem; color: var(--green);
  background: #06090F; border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px;
}
.flag-input:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px rgba(55,224,166,0.15); }
.flag-input::placeholder { color: #3E4A5E; }
.flag-error { color: var(--coral); font-size: 0.85rem; margin: 0; }
.flag-error code { color: var(--coral); }

.flag-success { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.success-msg { font-weight: 600; color: var(--green); margin: 0 0 10px; font-family: var(--font-title); }
.success-final { color: var(--gold); font-family: var(--font-mono); font-size: 0.85rem; margin: 0; }

/* ---------- Mascotte ---------- */

.byte-svg { display: block; }
.byte-idle { animation: floaty 3.2s ease-in-out infinite; }
.byte-cheer { animation: bounce 0.7s ease-in-out infinite; }
@keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes bounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.04); } }

/* ---------- Confetti ---------- */

.confetti-layer { position: fixed; inset: 0; pointer-events: none; z-index: 60; overflow: hidden; }
.confetti-piece {
  position: absolute; top: -10px; width: 8px; height: 14px; opacity: 0.9;
  animation-name: confetti-fall; animation-timing-function: ease-in; animation-fill-mode: forwards;
}
@keyframes confetti-fall {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--drift), 105vh) rotate(var(--rot)); opacity: 0; }
}

/* ---------- Toast ---------- */

.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: var(--panel); border: 1px solid var(--green); color: var(--green);
  font-family: var(--font-mono); font-size: 0.85rem; padding: 10px 18px; border-radius: 999px;
  box-shadow: 0 10px 30px -10px rgba(55,224,166,0.4); z-index: 70;
  animation: toast-in 0.25s ease-out;
}
@keyframes toast-in { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }

/* ---------- Footer ---------- */

.footer {
  border-top: 1px solid var(--line); padding: 20px; text-align: center;
  font-size: 0.8rem; color: var(--muted); line-height: 1.6;
}
.footer p { margin: 4px 0; }
.footer-flags code { color: var(--green); }

/* ---------- Carte examen final (accueil) ---------- */

.exam-card {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 18px 20px; margin-top: 14px;
}
.exam-card-icon {
  font-size: 1.7rem; flex: 0 0 auto; width: 52px; height: 52px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px; background: rgba(255,255,255,0.04);
}
.exam-card-body { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 200px; }
.exam-card-title { font-family: var(--font-title); font-weight: 600; font-size: 1.02rem; color: var(--ink); }
.exam-card-desc { font-size: 0.85rem; color: var(--muted); }
.exam-card--locked { opacity: 0.5; }
.exam-card--available { border-color: var(--gold); box-shadow: 0 0 0 1px rgba(240,180,41,0.15); }
.exam-card--available .exam-card-icon { background: rgba(240,180,41,0.14); }
.exam-card--passed { border-color: var(--green); }
.exam-card--passed .exam-card-icon { background: rgba(55,224,166,0.14); }

/* ---------- Vue examen ---------- */

.exam-header { margin-bottom: 22px; }
.exam-header h2 { font-family: var(--font-title); margin: 4px 0; font-size: 1.5rem; }
.exam-sub { color: var(--muted); font-family: var(--font-mono); font-size: 0.85rem; margin: 0; }

.exam-list { list-style: none; margin: 0 0 24px; padding: 0; display: flex; flex-direction: column; gap: 16px; }
.exam-q { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px 18px; }
.exam-q-module {
  font-family: var(--font-mono); font-size: 0.68rem; color: var(--violet); margin: 0 0 6px;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.exam-q-text { font-weight: 600; margin: 0 0 12px; color: var(--ink); line-height: 1.45; }
.exam-q-num { color: var(--muted); font-family: var(--font-mono); margin-right: 6px; }
.exam-options { display: flex; flex-direction: column; gap: 8px; }
.exam-option {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px;
  background: var(--panel-2); border: 1px solid var(--line); border-radius: 8px;
  font-size: 0.9rem; color: var(--ink); cursor: pointer; transition: border-color 0.15s;
}
.exam-option:hover { border-color: var(--cyan); }
.exam-option input { accent-color: var(--cyan); }
.exam-option--selected { border-color: var(--cyan); }
.exam-option--correct { border-color: var(--green); background: rgba(55,224,166,0.08); }
.exam-option--wrong { border-color: var(--coral); background: rgba(255,107,129,0.08); }
.exam-explain { margin: 10px 0 0; font-size: 0.83rem; line-height: 1.5; }
.exam-explain--ok { color: var(--green); }
.exam-explain--ko { color: var(--coral); }

.exam-actions { display: flex; align-items: center; gap: 14px; justify-content: center; flex-direction: column; }
.exam-progress { font-family: var(--font-mono); color: var(--muted); font-size: 0.85rem; margin: 0; }

.exam-result { text-align: center; padding: 26px; border-radius: 12px; border: 1px solid var(--line); background: var(--panel); margin-top: 8px; }
.exam-score { font-family: var(--font-title); font-size: 2.2rem; font-weight: 700; margin: 0 0 6px; }
.exam-result-msg { font-family: var(--font-mono); margin: 0 0 16px; }
.exam-result--pass { border-color: var(--green); }
.exam-result--pass .exam-score, .exam-result--pass .exam-result-msg { color: var(--green); }
.exam-result--fail { border-color: var(--coral); }
.exam-result--fail .exam-score, .exam-result--fail .exam-result-msg { color: var(--coral); }

/* ---------- Formulaire du certificat ---------- */

.cert-form-view { max-width: 520px; margin: 30px auto; }
.cert-form-card {
  background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
  padding: 32px 28px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;
}
.cert-form-card h2 { font-family: var(--font-title); margin: 0; color: var(--ink); }
.cert-form-card form { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.cert-form-card label { font-size: 0.85rem; color: var(--muted); text-align: left; }
.cert-form-card input {
  font-family: var(--font-body); font-size: 1rem; padding: 12px 14px; border-radius: 8px;
  border: 1px solid var(--line); background: #06090F; color: var(--ink);
}
.cert-form-card input:focus { outline: none; border-color: var(--gold); }

/* ---------- Vue certificat (Vertex Académie — style formel, contraste assumé) ---------- */

.cert-view { max-width: 1050px; margin: 0 auto; }
.cert-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
.cert-toolbar-actions { display: flex; gap: 10px; }

.certificate {
  background: var(--vertex-paper); color: var(--vertex-ink); font-family: var(--font-body);
  aspect-ratio: 297 / 210; width: 100%; max-width: 1050px; margin: 0 auto;
  border-radius: 4px; box-shadow: 0 30px 80px -30px rgba(12,35,64,0.55);
  padding: 14px; box-sizing: border-box;
}
.cert-border {
  height: 100%; box-sizing: border-box;
  border: 3px solid var(--vertex-navy); outline: 1px solid var(--vertex-gold); outline-offset: -8px;
  padding: 26px 44px; display: flex; flex-direction: column; align-items: center; text-align: center;
  background: linear-gradient(180deg, var(--vertex-paper) 0%, var(--vertex-paper-warm) 100%);
}

.cert-header { display: flex; align-items: center; gap: 14px; margin-bottom: 2px; }
.cert-brand { display: flex; flex-direction: column; align-items: flex-start; }
.cert-brand-name {
  font-family: var(--font-serif); font-weight: 700; font-size: 1.3rem; color: var(--vertex-navy);
  letter-spacing: 0.12em;
}
.cert-brand-sub { font-size: 0.68rem; color: var(--vertex-gold); letter-spacing: 0.08em; text-transform: uppercase; }

.cert-title {
  font-family: var(--font-serif); font-weight: 700; font-size: 1.75rem; color: var(--vertex-navy-dark);
  margin: 10px 0 4px; position: relative; padding-bottom: 12px;
}
.cert-title::after {
  content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 90px; height: 3px; background: var(--vertex-gold);
}

.cert-body { margin: 12px 0 4px; }
.cert-line { margin: 2px 0; font-size: 0.94rem; color: var(--vertex-ink); }
.cert-name { font-family: var(--font-serif); font-weight: 800; font-size: 2.05rem; color: var(--vertex-navy); margin: 6px 0; }
.cert-program { font-family: var(--font-serif); font-weight: 600; font-style: italic; font-size: 1.02rem; color: var(--vertex-navy-dark); margin: 6px 0; }
.cert-result { font-size: 0.9rem; margin: 8px 0 2px; color: var(--vertex-ink); }
.cert-rank { font-weight: 600; color: var(--vertex-gold); margin-left: 8px; }

.cert-modules {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4px 28px;
  margin: 12px auto 8px; max-width: 780px; width: 100%; text-align: left;
}
.cert-module { font-size: 0.76rem; color: var(--vertex-ink); margin: 0; }

.cert-footer {
  margin-top: auto; width: 100%; display: flex; align-items: flex-end; justify-content: space-between;
  padding-top: 10px; border-top: 1px solid rgba(199,154,59,0.4);
}
.cert-footer-left { text-align: left; }
.cert-date { font-size: 0.76rem; color: var(--vertex-ink); margin: 0 0 10px; }
.cert-sig { border-top: 1px solid var(--vertex-gold); padding-top: 4px; margin-bottom: 6px; width: 200px; }
.cert-sig-line { font-family: var(--font-serif); font-style: italic; font-size: 0.85rem; color: var(--vertex-navy); }
.cert-code { font-family: var(--font-mono); font-size: 0.68rem; color: var(--vertex-navy); margin: 0; letter-spacing: 0.03em; }

.cert-seal-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.cert-seal-rank { font-family: var(--font-mono); font-size: 0.66rem; color: var(--vertex-navy); }

.cert-banner { margin-top: 8px; font-family: var(--font-serif); font-style: italic; font-size: 0.84rem; color: var(--vertex-gold); }

/* ---------- Responsive ---------- */

@media (max-width: 640px) {
  .hero { flex-direction: column; align-items: flex-start; padding: 32px 0 28px; }
  .hero-mascot { align-self: center; }
  .rank-chip { padding: 5px 10px; gap: 6px; }
  .rank-bar { width: 40px; }
  .rank-line1, .rank-line2 { font-size: 0.65rem; }
  .topbar { gap: 8px; padding: 12px 14px; }
  .logo-text { display: none; }
  .world-card { padding: 12px; gap: 12px; }
  .terminal-body { padding: 16px 14px 22px; }
  .exam-card { padding: 14px; gap: 12px; }
  .cert-border { padding: 18px 20px; }
  .cert-modules { grid-template-columns: 1fr; }
  .cert-name { font-size: 1.5rem; }
  .certificate { aspect-ratio: auto; }
}

/* ---------- Accessibilité : mouvement réduit ---------- */

@media (prefers-reduced-motion: reduce) {
  .cursor, .byte-idle, .byte-cheer, .confetti-piece, .toast { animation: none !important; }
}

/* ---------- Impression : n'imprimer que le certificat, en A4 paysage ---------- */

@media print {
  body * { visibility: hidden !important; }
  .certificate, .certificate * { visibility: visible !important; }
  .certificate { position: absolute; inset: 0; margin: 0; box-shadow: none; width: 100%; height: 100%; }
  .no-print { display: none !important; }
  @page { size: A4 landscape; margin: 12mm; }
}
`
