export default function AuditTrail({ trail }) {
  if (!trail || trail.length === 0) return null

  return (
    <div className="output-card" style={{ marginBottom: 14 }}>
      <div className="output-card-stripe" style={{ background: 'var(--purple)' }} />
      <div className="output-card-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="font-m" style={{ fontSize: 10, color: 'var(--purple)', letterSpacing: '0.12em' }}>AUDIT-TRAIL</span>
          <span className="font-d" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Prosecution Record</span>
        </div>
        <span className="chip chip-purple">
          {trail.length} loop{trail.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="output-card-body">
        {trail.map((step, i) => (
          <div key={i}>
            <div className={`audit-item ${step.status === 'approved' ? 'audit-approved' : 'audit-rejected'}`}>
              {/* Circle number */}
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step.status === 'approved' ? 'rgba(0,255,136,0.12)' : 'rgba(255,51,85,0.12)',
                fontFamily: 'var(--fm)', fontSize: 12, fontWeight: 600,
                color: step.status === 'approved' ? 'var(--green)' : 'var(--red)',
                border: `1px solid ${step.status === 'approved' ? 'rgba(0,255,136,0.25)' : 'rgba(255,51,85,0.25)'}`,
              }}>
                {i + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: step.correctionNote && step.status !== 'approved' ? 5 : 0 }}>
                  <span className="font-m" style={{ fontSize: 11, fontWeight: 600, color: step.status === 'approved' ? 'var(--green)' : 'var(--red)' }}>
                    {step.status === 'approved' ? '✓ APPROVED' : '✗ REJECTED'}
                  </span>
                  {step.confidence && (
                    <span className="chip chip-dim" style={{ fontSize: 9 }}>{step.confidence}% confidence</span>
                  )}
                  <span className="font-m" style={{ fontSize: 9, color: 'var(--text-3)', marginLeft: 'auto' }}>
                    Attempt {step.attempt || i + 1}
                  </span>
                </div>

                {step.correctionNote && step.status !== 'approved' && (
                  <div className="font-m" style={{ fontSize: 10, color: '#ff8899', lineHeight: 1.55, marginTop: 3 }}>
                    Prosecutor: "
                    {step.correctionNote.length > 130
                      ? step.correctionNote.slice(0, 130) + '...'
                      : step.correctionNote}
                    "
                  </div>
                )}
              </div>
            </div>

            {/* Connector line between steps */}
            {i < trail.length - 1 && <div className="audit-connector" />}
          </div>
        ))}
      </div>
    </div>
  )
}