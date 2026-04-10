import { useState, useEffect } from 'react';
import AuditTrail from '../components/AuditTrail.jsx';
import CampaignPreview from '../components/CampaignPreview.jsx';

export default function MissionDetailPage({ missionId, token, onBack }) {
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('results');

  useEffect(() => {
    const loadMission = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/missions/${missionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Mission not found');
        }

        const data = await res.json();
        setMission(data);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (missionId && token) loadMission();
  }, [missionId, token]);

  // Loading state
  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#050a14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#0f0' }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 4 }} />
        <p className="font-m" style={{ marginTop: 20, fontSize: 13 }}>Retrieving mission intelligence...</p>
      </div>
    );
  }

  // Error state (beautiful)
  if (error || !mission) {
    return (
      <div style={{ height: '100vh', background: '#050a14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f66' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚠</div>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Mission not found</h2>
        <p style={{ color: '#aaa', maxWidth: 340, textAlign: 'center', lineHeight: 1.5 }}>
          This mission may have been deleted or you don't have access.
        </p>
        <button 
          className="btn-primary" 
          style={{ marginTop: 40, padding: '14px 32px' }}
          onClick={onBack}
        >
          ← Back to Sentinel Assembly
        </button>
      </div>
    );
  }

  const drafts = {
    blog: mission.blog_content || '',
    social: mission.social_content || '',
    email: mission.email_content || '',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#050a14', overflow: 'hidden' }}>

      {/* Top Bar */}
      <div className="app-topbar">
        <button onClick={onBack} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          ← Back to Assembly
        </button>
        <div className="font-d" style={{ fontSize: 18, color: '#fff' }}>{mission.title}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span className="chip chip-green">{mission.confidence}% CONFIDENCE</span>
          <span className="chip chip-dim">{mission.total_attempts} LOOPS</span>
        </div>
      </div>

      {/* Meta Bar */}
      <div style={{
        background: 'rgba(7,13,26,0.95)',
        padding: '14px 32px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <span className="chip chip-dim">
          {new Date(mission.created_at).toLocaleDateString('en-IN')}
        </span>
        <span className="chip" style={{ background: 'rgba(0,255,136,0.1)', color: '#0f0' }}>
          {mission.personality || 'professional'}
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'rgba(3,5,8,0.9)',
        padding: '0 32px',
        borderBottom: '1px solid var(--border)',
        display: 'flex'
      }}>
        {[
          { id: 'results', label: 'CAMPAIGN RESULTS' },
          { id: 'audit', label: 'AUDIT TRAIL' },
          { id: 'factsheet', label: 'FACT SHEET' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '16px 28px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '3px solid #0f0' : '3px solid transparent',
              color: tab === t.id ? '#fff' : 'var(--text-2)',
              fontSize: 13,
              fontWeight: tab === t.id ? 700 : 400,
              letterSpacing: '0.06em',
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        {tab === 'results' && (
          <CampaignPreview
            drafts={drafts}
            factSheet={mission.fact_sheet || {}}
            auditTrail={mission.audit_trail || []}
            totalAttempts={mission.total_attempts}
            confidence={mission.confidence || 95}
            personality={mission.personality}
          />
        )}

        {tab === 'audit' && (
          <div style={{ maxWidth: 900 }}>
            <AuditTrail trail={mission.audit_trail || []} />
          </div>
        )}

        {tab === 'factsheet' && (
          <div className="card" style={{ padding: 28 }}>
            <pre style={{
              background: '#0a0a0a',
              padding: 24,
              borderRadius: 12,
              fontSize: 13,
              lineHeight: 1.7,
              color: '#ccc',
              overflow: 'auto',
              maxHeight: '70vh'
            }}>
              {JSON.stringify(mission.fact_sheet, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}