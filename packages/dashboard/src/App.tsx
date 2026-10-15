import { useState, useEffect } from 'react';

interface Stats {
  bridgesCount: number;
  channelsCount: number;
  contactsCount: number;
}

export function App() {
  const [stats, setStats] = useState<Stats>({ bridgesCount: 0, channelsCount: 0, contactsCount: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'bridges' | 'channels' | 'contacts'>('overview');
  const [font, setFont] = useState<'roboto' | 'inter' | 'outfit' | 'hacker'>(() => {
    return (localStorage.getItem('sb_font') as any) || 'roboto';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('sb_theme') as any) || 'dark';
  });

  const [logs] = useState<string[]>([
    'Switchbridge Core initialized.',
    'SQLite storage engine ready (WAL mode).',
    'WebSocket stream listening on /ws/feed.',
  ]);

  const [isFontMorphing, setIsFontMorphing] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', font);
    localStorage.setItem('sb_font', font);

    setIsFontMorphing(true);
    const timer = setTimeout(() => setIsFontMorphing(false), 320);
    return () => clearTimeout(timer);
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
    <div className={`dashboard-container ${isFontMorphing ? 'font-morphing' : ''}`}>
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
                <button
                  type="button"
                  className={`font-btn ${font === 'hacker' ? 'active' : ''}`}
                  onClick={() => setFont('hacker')}
                  title="Share Tech Mono / Fira Code - Cyberpunk Terminal Font"
                >
                  💻 Hacker Mono
                </button>
              </div>

              <div className="theme-toggle-group">
                <button
                  type="button"
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                  title="Switch to Light Theme"
                >
                  ☀️ Light
                </button>
                <button
                  type="button"
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                  title="Switch to Dark Theme"
                >
                  🌙 Dark
                </button>
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
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>[{new Date().toLocaleTimeString()}]</span> {log}
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
