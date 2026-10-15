import { useState, useEffect } from 'react';

interface Stats {
  bridgesCount: number;
  channelsCount: number;
  contactsCount: number;
}

export function App() {
  const [stats, setStats] = useState<Stats>({ bridgesCount: 0, channelsCount: 0, contactsCount: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'bridges' | 'channels' | 'contacts'>('overview');
  const [logs] = useState<string[]>([
    'Switchbridge Core initialized.',
    'SQLite storage engine ready (WAL mode).',
    'WebSocket stream listening on /ws/feed.',
  ]);

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
          <div className="badge-status">
            <span className="pulse-dot"></span>
            System Online
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
