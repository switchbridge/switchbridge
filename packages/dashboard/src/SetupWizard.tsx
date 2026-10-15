import React, { useState } from 'react';

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [authMode, setAuthMode] = useState<'builtin' | 'none' | 'oidc'>('builtin');
  const [username, setUsername] = useState('admin');
  const [email, setEmail] = useState('admin@switchbridge.local');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OIDC state
  const [issuerUrl, setIssuerUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authMode === 'builtin') {
      if (!username.trim()) {
        setError('PLEASE ENTER ADMIN USERNAME');
        return;
      }
      if (!password) {
        setError('PLEASE ENTER ADMIN PASSWORD');
        return;
      }
      if (password.length < 6) {
        setError('PASSWORD MUST BE AT LEAST 6 CHARACTERS');
        return;
      }
      if (password !== confirmPassword) {
        setError('PASSWORDS DO NOT MATCH');
        return;
      }
    } else if (authMode === 'oidc') {
      if (!issuerUrl.trim() || !clientId.trim()) {
        setError('PLEASE ENTER OIDC ISSUER URL AND CLIENT ID');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/setup/rbac`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: authMode,
          admin: authMode === 'builtin' ? { username, email, password } : undefined,
          oidc: authMode === 'oidc' ? { issuerUrl, clientId, clientSecret } : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'FAILED TO CONFIGURE RBAC');
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || 'NETWORK ERROR OCCURRED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        {/* Wizard Header */}
        <div className="setup-header">
          <div className="setup-badge">⚡ BOOTSTRAP_V1</div>
          <h1 className="setup-title">/// INITIAL_SETUP_WIZARD_</h1>
          <p className="setup-step">
            [ STEP 01/03 :: ACCESS_CONTROL_&amp;_RBAC_ENGINE ]
          </p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="setup-description">
            SELECT AUTHENTICATION &amp; PERMISSION MODEL FOR THIS SWITCHBRIDGE NODE:
          </div>

          {/* Option 1: Builtin Local RBAC (Recommended) */}
          <div
            className={`wizard-option-card ${authMode === 'builtin' ? 'selected' : ''}`}
            onClick={() => setAuthMode('builtin')}
          >
            <div className="option-header-row">
              <label className="option-radio-label">
                <input
                  type="radio"
                  name="authMode"
                  value="builtin"
                  checked={authMode === 'builtin'}
                  onChange={() => setAuthMode('builtin')}
                />
                <span className="option-name">01 // BUILTIN_LOCAL_RBAC</span>
              </label>
              <span className="option-badge recommended">RECOMMENDED</span>
            </div>
            <p className="option-desc">
              Standalone user management stored directly in the database. 
              Supports 3 roles: ADMIN (Full Control), OPERATOR (Bridges &amp; Contacts), VIEWER (Read Only).
            </p>

            {authMode === 'builtin' && (
              <div className="subform-box" onClick={(e) => e.stopPropagation()}>
                <div className="subform-title">[ CONFIGURE_ROOT_ADMIN_ACCOUNT ]</div>
                <div className="form-group">
                  <label>ADMIN_USERNAME</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ADMIN_EMAIL</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@switchbridge.local"
                  />
                </div>

                <div className="form-group-grid">
                  <div className="form-group">
                    <label>ADMIN_PASSWORD (MIN 6 CHARS)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CONFIRM_PASSWORD</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Option 2: No Authentication */}
          <div
            className={`wizard-option-card ${authMode === 'none' ? 'selected' : ''}`}
            onClick={() => setAuthMode('none')}
          >
            <div className="option-header-row">
              <label className="option-radio-label">
                <input
                  type="radio"
                  name="authMode"
                  value="none"
                  checked={authMode === 'none'}
                  onChange={() => setAuthMode('none')}
                />
                <span className="option-name">02 // NO_AUTHENTICATION (OPEN_LAN)</span>
              </label>
              <span className="option-badge neutral">ZERO_CONFIG</span>
            </div>
            <p className="option-desc">
              Direct access without passwords. Recommended only for private homelabs, 
              local dev environments, or when Switchbridge is secured behind Cloudflare Access / Authelia.
            </p>
          </div>

          {/* Option 3: Enterprise OIDC / SSO */}
          <div
            className={`wizard-option-card ${authMode === 'oidc' ? 'selected' : ''}`}
            onClick={() => setAuthMode('oidc')}
          >
            <div className="option-header-row">
              <label className="option-radio-label">
                <input
                  type="radio"
                  name="authMode"
                  value="oidc"
                  checked={authMode === 'oidc'}
                  onChange={() => setAuthMode('oidc')}
                />
                <span className="option-name">03 // ENTERPRISE_SSO (OIDC)</span>
              </label>
              <span className="option-badge enterprise">ENTERPRISE</span>
            </div>
            <p className="option-desc">
              Delegate user authentication and group-role mapping to an external Identity Provider 
              (Keycloak, Authentik, Okta, Google Workspace).
            </p>

            {authMode === 'oidc' && (
              <div className="subform-box" onClick={(e) => e.stopPropagation()}>
                <div className="subform-title">[ OIDC_PROVIDER_SETTINGS ]</div>
                <div className="form-group">
                  <label>ISSUER_DISCOVERY_URL</label>
                  <input
                    type="url"
                    value={issuerUrl}
                    onChange={(e) => setIssuerUrl(e.target.value)}
                    placeholder="https://auth.company.com/realms/main"
                    required
                  />
                </div>
                <div className="form-group-grid">
                  <div className="form-group">
                    <label>CLIENT_ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="switchbridge-app"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CLIENT_SECRET (OPTIONAL)</label>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="wizard-error-box">
              <span>! ERROR: {error}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="setup-actions">
            <button
              type="submit"
              className="wizard-submit-btn"
              disabled={loading}
            >
              {loading ? 'SAVING_CONFIG...' : 'CONFIRM_RBAC_CONFIGURATION ►'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
