import { useState, useEffect } from 'react';

interface Stats {
  bridgesCount: number;
  channelsCount: number;
  contactsCount: number;
}

export function App() {
  const [stats, setStats] = useState<Stats>({ bridgesCount: 0, channelsCount: 0, contactsCount: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'bridges' | 'channels' | 'contacts'>('overview');
  const [pixelFont, setPixelFont] = useState<'silkscreen' | 'arcade' | 'vt323'>('silkscreen');

  const [logs] = useState<string[]>([
    'CORE_BOOT :: OK [WAL_MODE_ENABLED]',
    'SQLITE_STORAGE :: /app/.data/switchbridge.sqlite',
    'WEBSOCKET_STREAM :: LISTENING_FEED_PORT_3000',
    'CADDY_EDGE_REVERSE_PROXY :: /switchbridge ACTIVE',
  ]);

  useEffect(() => {
    let fontVal = "'Silkscreen', monospace";
    if (pixelFont === 'arcade') fontVal = "'Press Start 2P', monospace";
    if (pixelFont === 'vt323') fontVal = "'VT323', monospace";
    document.documentElement.style.setProperty('--font-pixel', fontVal);
  }, [pixelFont]);

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
          <span className="logo-text">SWITCHBRIDGE</span>
        </div>

        <ul className="nav-links">
          <li 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            01 // OVERVIEW
          </li>
          <li 
            className={`nav-item ${activeTab === 'bridges' ? 'active' : ''}`}
            onClick={() => setActiveTab('bridges')}
          >
            02 // BRIDGES
          </li>
          <li 
            className={`nav-item ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => setActiveTab('channels')}
          >
            03 // CHANNELS
          </li>
          <li 
            className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            04 // CONTACTS
          </li>
        </ul>

        {/* Wireframe HUD box (Hyper Light Drifter reference) */}
        <div className="wireframe-box">
          <div className="wireframe-title">
            <span>SYS_TOPOLOGY</span>
            <span className="keycap-badge">2D_MAP</span>
          </div>
          <svg className="wireframe-canvas" viewBox="0 0 200 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Grid background */}
            <rect x="10" y="10" width="180" height="70" stroke="#36224e" strokeWidth="1" strokeDasharray="4 2" />
            {/* Nodes */}
            <rect x="25" y="25" width="40" height="20" stroke="#ff0077" strokeWidth="2" fill="#08040d" />
            <text x="45" y="38" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">TG_BOT</text>

            <rect x="135" y="25" width="40" height="20" stroke="#00f0ff" strokeWidth="2" fill="#08040d" />
            <text x="155" y="38" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">DC_SRV</text>

            <rect x="80" y="55" width="40" height="20" stroke="#38ef7d" strokeWidth="2" fill="#08040d" />
            <text x="100" y="68" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">N8N_HUB</text>

            {/* Connecting lines */}
            <line x1="65" y1="35" x2="135" y2="35" stroke="#ff0077" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="45" y1="45" x2="80" y2="65" stroke="#38ef7d" strokeWidth="1.5" />
            <line x1="155" y1="45" x2="120" y2="65" stroke="#00f0ff" strokeWidth="1.5" />
          </svg>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>/// ENGINE OVERVIEW_</h1>
            <p>OMNICHANNEL_MESSAGE_ROUTER // NODE_STATUS: 200_OK</p>
          </div>

          <div className="header-actions">
            <div className="customizer-bar">
              <span className="customizer-label">FONT:</span>
              <button
                type="button"
                className={`font-btn ${pixelFont === 'silkscreen' ? 'active' : ''}`}
                onClick={() => setPixelFont('silkscreen')}
              >
                SILKSCREEN
              </button>
              <button
                type="button"
                className={`font-btn ${pixelFont === 'arcade' ? 'active' : ''}`}
                onClick={() => setPixelFont('arcade')}
              >
                8-BIT
              </button>
              <button
                type="button"
                className={`font-btn ${pixelFont === 'vt323' ? 'active' : ''}`}
                onClick={() => setPixelFont('vt323')}
              >
                VT323
              </button>
            </div>

            <div className="keycap-badge">
              LIVE_STAND
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header-row">
              <span className="stat-label">ACTIVE_BRIDGES</span>
              <span className="stat-slot">SLOT_01</span>
            </div>
            <div className="stat-value">{stats.bridgesCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header-row">
              <span className="stat-label">CONNECTED_CHANNELS</span>
              <span className="stat-slot">SLOT_02</span>
            </div>
            <div className="stat-value">{stats.channelsCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header-row">
              <span className="stat-label">UNIFIED_CONTACTS</span>
              <span className="stat-slot">SLOT_03</span>
            </div>
            <div className="stat-value">{stats.contactsCount}</div>
          </div>
        </div>

        {/* Live Event Stream */}
        <section className="section-card">
          <div className="section-header">
            <h2>[ EVENT_FEED_STREAM ]</h2>
            <span className="stat-slot">SYS_LOG_V1</span>
          </div>
          <div className="live-feed-box">
            {logs.map((log, index) => (
              <div key={index} className="feed-line">
                <span className="feed-prompt">&gt;</span>
                <span className="feed-time">[{new Date().toLocaleTimeString()}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bridges Table Preview */}
        <section className="section-card">
          <div className="section-header">
            <h2>[ CONFIGURED_BRIDGE_LINKS ]</h2>
            <span className="stat-slot">TABLE_01</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>BRIDGE_ID</th>
                <th>PLATFORMS</th>
                <th>ENDPOINTS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TELEGRAM_SUPPORT &lt;--&gt; DISCORD_HELP</td>
                <td>TELEGRAM, DISCORD</td>
                <td>2_ENDPOINTS</td>
                <td>
                  <span className="status-badge-pixel">ONLINE</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
