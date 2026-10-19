import React, { useState, useEffect } from 'react';
import { translations, Lang } from './i18n';
import { RoleMappingEditor, OidcRoleMappingConfig } from './RoleMappingEditor';

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('sb_lang') as Lang) || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('sb_lang', lang);
  }, [lang]);

  const t = translations[lang];

  const [authMode, setAuthMode] = useState<'builtin' | 'none' | 'oidc'>('builtin');
  const [activeInfoKey, setActiveInfoKey] = useState<'builtin' | 'none' | 'oidc' | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OIDC state
  const [issuerUrl, setIssuerUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [testingOidc, setTestingOidc] = useState(false);
  const [oidcTestResult, setOidcTestResult] = useState<{
    success: boolean;
    issuer?: string;
    authEndpoint?: string;
    tokenEndpoint?: string;
    error?: string;
  } | null>(null);
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  // Role Mapping configuration state
  const [roleMappingConfig, setRoleMappingConfig] = useState<OidcRoleMappingConfig>({
    enabled: true,
    claimPath: 'realm_access.roles',
    rules: [
      { id: '1', oidcRole: 'admin', switchbridgeRole: 'admin' },
      { id: '2', oidcRole: 'operator', switchbridgeRole: 'operator' },
    ],
    defaultRole: 'deny',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrefillDevKeycloak = () => {
    setIssuerUrl('http://localhost:8180/realms/switchbridge');
    setClientId('switchbridge');
    setClientSecret('switchbridge-secret');
    setOidcTestResult(null);
  };

  const handleCopyRedirectUri = () => {
    const uri = `${window.location.origin}${import.meta.env.BASE_URL}`;
    navigator.clipboard?.writeText(uri);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  const handleTestOidc = async () => {
    if (!issuerUrl.trim()) {
      setError(t.errOidcRequired);
      return;
    }
    setError(null);
    setTestingOidc(true);
    setOidcTestResult(null);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/setup/oidc/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issuerUrl: issuerUrl.trim(), clientId: clientId.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect to OIDC discovery');
      }
      setOidcTestResult({
        success: true,
        issuer: data.issuer,
        authEndpoint: data.authorizationEndpoint,
        tokenEndpoint: data.tokenEndpoint,
      });
    } catch (err: any) {
      setOidcTestResult({
        success: false,
        error: err.message || t.errNetwork,
      });
    } finally {
      setTestingOidc(false);
    }
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveInfoKey(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authMode === 'builtin') {
      if (!username.trim()) {
        setError(t.errEnterUsername);
        return;
      }
      if (!password) {
        setError(t.errEnterPassword);
        return;
      }
      if (password.length < 6) {
        setError(t.errPasswordLength);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.errPasswordMismatch);
        return;
      }
    } else if (authMode === 'oidc') {
      if (!issuerUrl.trim() || !clientId.trim()) {
        setError(t.errOidcRequired);
        return;
      }
    }

    setLoading(true);
    try {
      const roleMappingData = authMode === 'oidc' ? roleMappingConfig : undefined;

      const res = await fetch(`${import.meta.env.BASE_URL}api/setup/rbac`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: authMode,
          admin: authMode === 'builtin' ? { username, email, password } : undefined,
          oidc: authMode === 'oidc' ? {
            issuerUrl,
            clientId,
            clientSecret,
            roleMapping: roleMappingData,
          } : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'FAILED TO CONFIGURE RBAC');
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || t.errNetwork);
    } finally {
      setLoading(false);
    }
  };

  const activeInfo = activeInfoKey ? t.intel[activeInfoKey] : null;

  return (
    <div className="setup-container">
      {/* Intel Briefing Modal */}
      {activeInfo && (
        <div 
          className="info-modal-backdrop"
          onClick={() => setActiveInfoKey(null)}
        >
          <div 
            className="info-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="info-modal-header">
              <div className="info-modal-title">
                <span className="info-modal-icon">?</span>
                <span>{t.intelModalTitle} {activeInfo.title}</span>
              </div>
              <button
                type="button"
                className="info-modal-close"
                onClick={() => setActiveInfoKey(null)}
                title="CLOSE [ESC]"
              >
                ✕
              </button>
            </div>

            <div className="info-modal-body">
              <div className="info-modal-badge">{activeInfo.badge}</div>
              <p className="info-modal-summary">{activeInfo.summary}</p>

              <div className="info-modal-section-title">{t.intelCapabilities}</div>
              <ul className="info-modal-list">
                {activeInfo.bullets.map((b, i) => (
                  <li key={i}>
                    <span className="info-modal-bullet">►</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="info-modal-best-for">
                <span className="best-for-label">{t.intelRecommendedCase}</span>
                <span className="best-for-text">{activeInfo.bestFor}</span>
              </div>
            </div>

            <div className="info-modal-footer">
              <button
                type="button"
                className="info-modal-action-btn"
                onClick={() => setActiveInfoKey(null)}
              >
                {t.intelCloseBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="setup-card">
        {/* Wizard Header with Language Selector */}
        <div className="setup-header">
          <div className="setup-header-top-row">
            <div className="setup-badge">{t.setupBadge}</div>
            
            {/* Retro Language Switcher */}
            <div className="customizer-bar lang-switcher">
              <span className="customizer-label">{t.langLabel}</span>
              <button
                type="button"
                className={`font-btn ${lang === 'ru' ? 'active' : ''}`}
                onClick={() => setLang('ru')}
              >
                RU
              </button>
              <button
                type="button"
                className={`font-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
          </div>

          <h1 className="setup-title">{t.setupTitle}</h1>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="setup-description">
            {t.setupDescription}
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
                <span className="option-name">{t.optionBuiltinTitle}</span>
              </label>

              <div className="option-actions-group">
                <button
                  type="button"
                  className="info-help-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoKey('builtin');
                  }}
                  title="VIEW INTEL"
                >
                  ?
                </button>
                <span className="option-badge recommended">{t.badgeRecommended}</span>
              </div>
            </div>

            {authMode === 'builtin' && (
              <div className="subform-box" onClick={(e) => e.stopPropagation()}>
                <div className="subform-title">{t.subformAdminTitle}</div>
                <div className="form-group">
                  <label>{t.adminUsernameLabel}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.adminUsernamePlaceholder}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t.adminEmailLabel}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.adminEmailPlaceholder}
                  />
                </div>

                <div className="form-group-grid">
                  <div className="form-group">
                    <label>{t.adminPasswordLabel}</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.confirmPasswordLabel}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
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
                <span className="option-name">{t.optionNoneTitle}</span>
              </label>

              <div className="option-actions-group">
                <button
                  type="button"
                  className="info-help-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoKey('none');
                  }}
                  title="VIEW INTEL"
                >
                  ?
                </button>
                <span className="option-badge neutral">{t.badgeZeroConfig}</span>
              </div>
            </div>
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
                <span className="option-name">{t.optionOidcTitle}</span>
              </label>

              <div className="option-actions-group">
                <button
                  type="button"
                  className="info-help-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoKey('oidc');
                  }}
                  title="VIEW INTEL"
                >
                  ?
                </button>
                <span className="option-badge enterprise">{t.badgeEnterprise}</span>
              </div>
            </div>

            {authMode === 'oidc' && (
              <div className="subform-box" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div className="subform-title" style={{ margin: 0 }}>{t.subformOidcTitle}</div>
                  <button
                    type="button"
                    className="font-btn active"
                    onClick={handlePrefillDevKeycloak}
                    style={{ fontSize: '0.65rem', padding: '4px 8px', letterSpacing: '0.05em' }}
                  >
                    {t.oidcPrefillDevBtn}
                  </button>
                </div>

                <div className="form-group">
                  <label>{t.issuerUrlLabel}</label>
                  <input
                    type="url"
                    value={issuerUrl}
                    onChange={(e) => {
                      setIssuerUrl(e.target.value);
                      setOidcTestResult(null);
                    }}
                    placeholder="http://localhost:8180/realms/switchbridge"
                    required
                  />
                </div>

                <div className="form-group-grid">
                  <div className="form-group">
                    <label>{t.clientIdLabel}</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => {
                        setClientId(e.target.value);
                        setOidcTestResult(null);
                      }}
                      placeholder="switchbridge"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.clientSecretLabel}</label>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => {
                        setClientSecret(e.target.value);
                        setOidcTestResult(null);
                      }}
                      placeholder="switchbridge-secret"
                    />
                  </div>
                </div>

                {/* Redirect URI helper box */}
                <div style={{
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px dashed #00f0ff',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: '#ffffff', fontSize: '0.62rem', letterSpacing: '0.05em' }}>{t.oidcRedirectUriHint}</span>
                    <span style={{ color: '#00f0ff', fontFamily: 'var(--font-mono, monospace)', fontWeight: 'bold' }}>
                      {typeof window !== 'undefined' ? `${window.location.origin}${import.meta.env.BASE_URL}` : 'http://localhost:5173/switchbridge/'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="font-btn active"
                    onClick={handleCopyRedirectUri}
                    style={{ fontSize: '0.65rem', padding: '4px 10px' }}
                  >
                    {copiedRedirect ? t.oidcCopied : t.oidcCopyBtn}
                  </button>
                </div>

                {/* Test Connection Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <button
                    type="button"
                    className="font-btn"
                    onClick={handleTestOidc}
                    disabled={testingOidc || !issuerUrl.trim()}
                    style={{
                      borderColor: '#00f0ff',
                      color: '#00f0ff',
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {testingOidc ? t.oidcTestingBtn : `► ${t.oidcTestBtn}`}
                  </button>
                </div>

                {/* Test Connection Result Box */}
                {oidcTestResult && (
                  <div style={{
                    marginTop: 12,
                    padding: '12px 14px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    lineHeight: '1.6',
                    border: oidcTestResult.success ? '2px solid #38ef7d' : '2px solid #ff0077',
                    background: oidcTestResult.success ? 'rgba(56, 239, 125, 0.12)' : 'rgba(255, 0, 119, 0.15)',
                    boxShadow: oidcTestResult.success ? '0 0 10px rgba(56, 239, 125, 0.2)' : '0 0 10px rgba(255, 0, 119, 0.2)',
                  }}>
                    {oidcTestResult.success ? (
                      <div>
                        <div style={{ color: '#38ef7d', fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>✓</span>
                          <span>{t.oidcTestSuccess}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4 }}>
                          <div style={{ color: '#ffffff', fontSize: '0.72rem' }}>
                            <span style={{ color: '#00f0ff', fontWeight: 'bold', marginRight: 6 }}>ISSUER:</span>
                            <span style={{ color: '#e2e8f0' }}>{oidcTestResult.issuer}</span>
                          </div>
                          <div style={{ color: '#ffffff', fontSize: '0.72rem' }}>
                            <span style={{ color: '#00f0ff', fontWeight: 'bold', marginRight: 6 }}>AUTH:</span>
                            <span style={{ color: '#e2e8f0' }}>{oidcTestResult.authEndpoint}</span>
                          </div>
                          <div style={{ color: '#ffffff', fontSize: '0.72rem' }}>
                            <span style={{ color: '#00f0ff', fontWeight: 'bold', marginRight: 6 }}>TOKEN:</span>
                            <span style={{ color: '#e2e8f0' }}>{oidcTestResult.tokenEndpoint}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#ff3366' }}>
                        <span style={{ fontWeight: 'bold' }}>✕ {t.oidcTestFailed} </span>
                        <span style={{ color: '#ffffff' }}>{oidcTestResult.error}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* OIDC Role Mapping Section - Appears when test connection succeeds */}
                {oidcTestResult?.success && (
                  <RoleMappingEditor
                    lang={lang}
                    initialMapping={roleMappingConfig}
                    onChange={setRoleMappingConfig}
                    isStandalone={false}
                  />
                )}
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
              {loading ? t.submitSaving : t.submitBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
