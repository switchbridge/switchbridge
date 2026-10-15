import { useState, useEffect } from 'react';
import { SetupWizard } from './SetupWizard';

interface Stats {
  bridgesCount: number;
  channelsCount: number;
  contactsCount: number;
}

export function App() {
  const [stats, setStats] = useState<Stats>({ bridgesCount: 0, channelsCount: 0, contactsCount: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'bridges' | 'channels' | 'contacts'>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('sb_pixel_theme') as any) || 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sb_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);

  useEffect(() => {
    localStorage.setItem('sb_sidebar_open', String(sidebarOpen));
  }, [sidebarOpen]);

  const [logs] = useState<string[]>([
    'CORE_BOOT :: OK [WAL_MODE_ENABLED]',
    'SQLITE_STORAGE :: /app/.data/switchbridge.sqlite',
    'WEBSOCKET_STREAM :: LISTENING_FEED_PORT_3000',
    'CADDY_EDGE_REVERSE_PROXY :: /switchbridge ACTIVE',
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sb_pixel_theme', theme);
  }, [theme]);

  const checkSetupStatus = () => {
    fetch(`${import.meta.env.BASE_URL}api/setup/status`)
      .then((res) => res.json())
      .then((data) => {
        setIsInitialized(Boolean(data.initialized));
      })
      .catch(() => {
        // Fallback for standalone preview
        setIsInitialized(true);
      });
  };

  useEffect(() => {
    checkSetupStatus();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      fetch(`${import.meta.env.BASE_URL}api/stats`)
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(() => {});
    }
  }, [isInitialized]);

  const handleNavClick = (tab: 'overview' | 'bridges' | 'channels' | 'contacts') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && (window.innerWidth <= 900 || window.matchMedia('(orientation: portrait)').matches)) {
      setSidebarOpen(false);
    }
  };

  // If system is uninitialized, present the Initial Setup Wizard
  if (isInitialized === false) {
    return <SetupWizard onComplete={() => checkSetupStatus()} />;
  }

  // Brief loading placeholder while checking status
  if (isInitialized === null) {
    return (
      <div className="setup-container">
        <div style={{ color: 'var(--drifter-cyan)', fontFamily: 'var(--font-pixel)', fontSize: '0.8rem' }}>
          /// LOADING_SWITCHBRIDGE_NODE...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Backdrop for portrait / mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
          title="CLOSE SIDEBAR"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="logo">
          <div className="logo-badge">⚡</div>
          <span className="logo-text">SWITCHBRIDGE</span>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            title="COLLAPSE SIDEBAR"
          >
            ◄
          </button>
        </div>

        <ul className="nav-links">
          <li 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleNavClick('overview')}
          >
            01 // OVERVIEW
          </li>
          <li 
            className={`nav-item ${activeTab === 'bridges' ? 'active' : ''}`}
            onClick={() => handleNavClick('bridges')}
          >
            02 // BRIDGES
          </li>
          <li 
            className={`nav-item ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => handleNavClick('channels')}
          >
            03 // CHANNELS
          </li>
          <li 
            className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => handleNavClick('contacts')}
          >
            04 // CONTACTS
          </li>
          <li 
            className="nav-item"
            style={{ marginTop: 'auto', borderColor: 'var(--drifter-pink)', color: 'var(--drifter-pink)' }}
            onClick={async () => {
              await fetch(`${import.meta.env.BASE_URL}api/setup/reset`, { method: 'POST' });
              checkSetupStatus();
            }}
            title="RESET INITIAL SETUP FOR TESTING"
          >
            ⚙ // RE-RUN SETUP
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "COLLAPSE MENU" : "EXPAND MENU"}
          >
            <span className="hamburger-icon">☰</span>
            <span>MENU</span>
          </button>


          <div className="header-actions">
            <div className="customizer-bar">
              <span className="customizer-label">THEME:</span>
              <button
                type="button"
                className={`font-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                🌙 NIGHT
              </button>
              <button
                type="button"
                className={`font-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                ☀️ DAY
              </button>
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
              <span className="stat-label">CHANNELS</span>
              <span className="stat-slot">SLOT_02</span>
            </div>
            <div className="stat-value">{stats.channelsCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header-row">
              <span className="stat-label">CONTACTS</span>
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
          <div className="table-container">
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
          </div>
        </section>
      </main>
    </div>
  );
}
