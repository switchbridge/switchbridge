import { useState, useEffect } from 'react';

interface Stats {
  bridgesCount: number;
  channelsCount: number;
  contactsCount: number;
}

export function App() {
  const [stats, setStats] = useState<Stats>({ bridgesCount: 0, channelsCount: 0, contactsCount: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'bridges' | 'channels' | 'contacts'>('overview');
  const [font, setFont] = useState<'roboto' | 'inter' | 'outfit'>(() => {
    return (localStorage.getItem('sb_font') as any) || 'roboto';
  });
  const [theme, setTheme] = useState<'cyber-cyan' | 'slate-dark' | 'emerald-matrix' | 'sunset-glow'>(() => {
    return (localStorage.getItem('sb_theme') as any) || 'cyber-cyan';
  });

  const [logs] = useState<string[]>([
    'Switchbridge Core initialized.',
    'SQLite storage engine ready (WAL mode).',
    'WebSocket stream listening on /ws/feed.',
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', font);
    localStorage.setItem('sb_font', font);
  }, [font]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sb_theme', theme);
  }, [theme]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {
        // Fallback for standalone preview
      });
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-badge">⚡</div>
          <span>Switchbridge</span>
        </div>
        <ul className="nav-links">
          <li 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </li>
          <li 
            className={`nav-item ${activeTab === 'bridges' ? 'active' : ''}`}
            onClick={() => setActiveTab('bridges')}
          >
            🔄 Bridges
          </li>
          <li 
            className={`nav-item ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => setActiveTab('channels')}
          >
            💬 Channels
          </li>
          <li 
            className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            👥 Contacts
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>Engine Overview</h1>
            <p>Standalone omnichannel orchestration dashboard</p>
          </div>

          <div className="header-actions">
            <div className="customizer-bar">
              <div className="customizer-group">
                <span className="customizer-label">Font:</span>
                <button
                  type="button"
                  className={`font-btn ${font === 'roboto' ? 'active' : ''}`}
                  onClick={() => setFont('roboto')}
                  title="Google Roboto font"
                >
                  Roboto
                </button>
                <button
                  type="button"
                  className={`font-btn ${font === 'inter' ? 'active' : ''}`}
                  onClick={() => setFont('inter')}
                  title="Inter font"
                >
                  Inter
                </button>
                <button
                  type="button"
                  className={`font-btn ${font === 'outfit' ? 'active' : ''}`}
                  onClick={() => setFont('outfit')}
                  title="Outfit font"
                >
                  Outfit
                </button>
              </div>

              <div className="theme-dots">
                <button
                  type="button"
                  className={`theme-dot ${theme === 'cyber-cyan' ? 'active' : ''}`}
                  style={{ background: 'linear-gradient(135deg, #00e5ff, #8b5cf6)' }}
                  onClick={() => setTheme('cyber-cyan')}
                  title="Cyber Cyan Theme"
                />
                <button
                  type="button"
                  className={`theme-dot ${theme === 'slate-dark' ? 'active' : ''}`}
                  style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)' }}
                  onClick={() => setTheme('slate-dark')}
                  title="Slate Dark Theme"
                />
                <button
                  type="button"
                  className={`theme-dot ${theme === 'emerald-matrix' ? 'active' : ''}`}
                  style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                  onClick={() => setTheme('emerald-matrix')}
                  title="Emerald Matrix Theme"
                />
                <button
                  type="button"
                  className={`theme-dot ${theme === 'sunset-glow' ? 'active' : ''}`}
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #fb923c)' }}
                  onClick={() => setTheme('sunset-glow')}
                  title="Sunset Glow Theme"
                />
              </div>
            </div>

          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Active Bridges</div>
            <div className="stat-value">{stats.bridgesCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Connected Channels</div>
            <div className="stat-value">{stats.channelsCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unified Contacts</div>
            <div className="stat-value">{stats.contactsCount}</div>
          </div>
        </div>

        {/* Live Message Stream */}
        <section className="section-card">
          <div className="section-header">
            <h2>Live Event Stream</h2>
          </div>
          <div className="live-feed-box">
            {logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '6px' }}>
                <span style={{ color: 'var(--accent-cyan)' }}>[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>
        </section>

        {/* Bridges Table Preview */}
        <section className="section-card">
          <div className="section-header">
            <h2>Configured Bridge Links</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Bridge Name</th>
                <th>Platforms</th>
                <th>Endpoints</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Telegram Support &lt;-&gt; Discord #help</td>
                <td>Telegram, Discord</td>
                <td>2 endpoints</td>
                <td><span style={{ color: 'var(--success)' }}>Active</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
