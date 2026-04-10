import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const token = localStorage.getItem('s_token');
        if (!token) throw new Error("Not authenticated");

        const res = await fetch(`http://localhost:3001/api/missions/${id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error('Mission not found or access denied');
        
        const data = await res.json();
        setMission(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [id]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied successfully!`);
  };

  const downloadAll = () => {
    if (!mission) return;

    const content = `SENTINEL ASSEMBLY MISSION REPORT
================================================
Title       : ${mission.title}
Personality : ${mission.personality || 'professional'}
Date        : ${new Date(mission.created_at).toLocaleString()}
Loops       : ${mission.total_attempts}
Confidence  : ${mission.confidence}%

FACT SHEET
----------
${JSON.stringify(mission.fact_sheet, null, 2)}

BLOG POST
---------
${mission.blog_content}

SOCIAL THREAD
-------------
${Array.isArray(mission.social_content) 
  ? mission.social_content.map((p, i) => `POST ${i+1}:\n${p}`).join('\n\n')
  : mission.social_content}

EMAIL TEASER
------------
${mission.email_content}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sentinel-Mission-${mission.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="full-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f0' }}>
        Loading mission details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-page" style={{ color: 'red', textAlign: 'center', paddingTop: '100px' }}>
        {error}<br />
        <button onClick={() => navigate('/history')} style={{ marginTop: '20px' }}>Back to History</button>
      </div>
    );
  }

  return (
    <div className="full-page" style={{ padding: '30px 20px', overflow: 'auto' }}>
      <button 
        onClick={() => navigate('/history')}
        style={{ 
          position: 'fixed', top: '25px', left: '25px', 
          background: 'transparent', border: '1px solid #0f0', 
          color: '#0f0', padding: '10px 20px', cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        ← Back to Mission History
      </button>

      <div style={{ maxWidth: '1100px', margin: '0 auto', marginTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#fff', fontSize: '32px', margin: 0, letterSpacing: '-0.02em' }}>
            {mission.title}
          </h1>
          <button onClick={downloadAll} className="btn-primary">
            Download Full Report
          </button>
        </div>

        {/* Meta Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ color: '#0f0', marginBottom: '15px' }}>Mission Metadata</h3>
            <p><strong>Personality:</strong> {mission.personality || 'Professional'}</p>
            <p><strong>Date:</strong> {new Date(mission.created_at).toLocaleDateString('en-GB')}</p>
            <p><strong>Loops:</strong> {mission.total_attempts} attempts</p>
            <p><strong>Final Confidence:</strong> <span style={{ color: '#0f0', fontWeight: 'bold' }}>{mission.confidence}%</span></p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ color: '#0f0', marginBottom: '15px' }}>Ground Truth (Fact Sheet)</h3>
            <pre style={{ 
              background: '#0a0a0a', padding: '18px', borderRadius: '8px', 
              fontSize: '13px', overflow: 'auto', maxHeight: '280px', color: '#ccc' 
            }}>
              {JSON.stringify(mission.fact_sheet, null, 2)}
            </pre>
          </div>
        </div>

        {/* Blog */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#0f0', marginBottom: '15px' }}>📝 Blog Post</h2>
          <div className="card" style={{ padding: '30px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
            {mission.blog_content}
            <button 
              onClick={() => copyToClipboard(mission.blog_content, "Blog Post")}
              style={{ marginTop: '20px' }}
            >
              Copy Blog
            </button>
          </div>
        </div>

        {/* Social Thread */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#0f0', marginBottom: '15px' }}>📱 Social Thread</h2>
          <div className="card" style={{ padding: '25px' }}>
            {Array.isArray(mission.social_content) ? (
              mission.social_content.map((post, index) => (
                <div key={index} style={{ 
                  marginBottom: '20px', 
                  padding: '16px', 
                  background: '#111', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #0f0'
                }}>
                  <strong>POST {index + 1}</strong><br />
                  {post}
                </div>
              ))
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap' }}>{mission.social_content}</pre>
            )}
            <button onClick={() => copyToClipboard(JSON.stringify(mission.social_content, null, 2), "Social Thread")}>
              Copy Entire Thread
            </button>
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ color: '#0f0', marginBottom: '15px' }}>✉️ Email Teaser</h2>
          <div className="card" style={{ padding: '30px', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
            {mission.email_content}
            <button 
              onClick={() => copyToClipboard(mission.email_content, "Email Teaser")}
              style={{ marginTop: '20px' }}
            >
              Copy Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}