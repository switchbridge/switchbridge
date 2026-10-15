import React, { useState, useEffect } from 'react';
import { translations, Lang } from './i18n';

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
                    placeholder="admin"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t.adminEmailLabel}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@switchbridge.local"
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
                <div className="subform-title">{t.subformOidcTitle}</div>
                <div className="form-group">
                  <label>{t.issuerUrlLabel}</label>
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
                    <label>{t.clientIdLabel}</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="switchbridge-app"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.clientSecretLabel}</label>
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
              {loading ? t.submitSaving : t.submitBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
