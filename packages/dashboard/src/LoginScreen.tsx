import React, { useState, useEffect } from 'react';
import { translations, Lang } from './i18n';

export interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
}

interface LoginScreenProps {
  authMode?: string | null;
  onLoginSuccess: (user: User) => void;
}

export function LoginScreen({ authMode, onLoginSuccess }: LoginScreenProps) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('sb_lang') as Lang) || 'ru';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoRedirecting, setSsoRedirecting] = useState(false);
  const [ssoProcessing, setSsoProcessing] = useState(false);
  const [showLocalFallback, setShowLocalFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedAuthMode, setDetectedAuthMode] = useState<string | null>(authMode || null);

  const t = translations[lang];

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('sb_lang', newLang);
  };

  // If authMode wasn't provided, fetch from setup status
  useEffect(() => {
    if (!detectedAuthMode) {
      fetch(`${import.meta.env.BASE_URL}api/setup/status`)
        .then((res) => res.json())
        .then((data) => {
          if (data.authMode) {
            setDetectedAuthMode(data.authMode);
          }
        })
        .catch(() => {});
    }
  }, [detectedAuthMode]);

  // Check for OIDC authorization code in URL query params (?code=...&state=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      // Clear URL params without reloading page
      window.history.replaceState({}, document.title, window.location.pathname);
      handleExchangeCode(code);
    }
  }, []);

  const handleExchangeCode = async (code: string) => {
    setSsoProcessing(true);
    setError(null);
    try {
      const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}`;
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/oidc/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to exchange SSO authorization code');
      }

      localStorage.setItem('sb_auth_token', data.token);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || t.errNetwork);
    } finally {
      setSsoProcessing(false);
    }
  };

  const handleSsoLogin = async () => {
    setSsoRedirecting(true);
    setError(null);
    try {
      const redirectUri = encodeURIComponent(`${window.location.origin}${import.meta.env.BASE_URL}`);
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/oidc/url?redirectUri=${redirectUri}`);
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to initialize OIDC authorization');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || t.errNetwork);
      setSsoRedirecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError(t.loginErrRequired);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error === 'INVALID_CREDENTIALS' ? t.loginErrFailed : (data.error || t.errNetwork));
      }

      localStorage.setItem('sb_auth_token', data.token);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || t.errNetwork);
    } finally {
      setLoading(false);
    }
  };

  const isOidc = detectedAuthMode === 'oidc';

  return (
    <div className="setup-container">
      <div className="setup-card" style={{ maxWidth: 620 }}>
        {/* Header */}
        <div className="setup-header">
          <div className="setup-header-top-row">
            <div className="setup-badge">{t.loginBadge}</div>

            {/* Language Switcher */}
            <div className="customizer-bar lang-switcher">
              <span className="customizer-label">{t.langLabel}</span>
              <button
                type="button"
                className={`font-btn ${lang === 'ru' ? 'active' : ''}`}
                onClick={() => handleLangChange('ru')}
              >
                RU
              </button>
              <button
                type="button"
                className={`font-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => handleLangChange('en')}
              >
                EN
              </button>
            </div>
          </div>

          <h1 className="setup-title">{t.loginTitle}</h1>
        </div>

        <div className="setup-form">
          <div className="setup-description">
            {t.loginDescription}
          </div>

          {error && (
            <div className="setup-error-banner">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          {ssoProcessing && (
            <div style={{
              padding: '16px',
              marginBottom: '18px',
              border: '1px solid var(--drifter-cyan)',
              background: 'rgba(0, 229, 255, 0.08)',
              color: 'var(--drifter-cyan)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8rem',
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}>
              <span style={{ display: 'inline-block', marginRight: '8px' }}>⚡</span>
              {t.loginSsoCallbackProcessing}
            </div>
          )}

          {/* OIDC Primary Button */}
          {isOidc && (
            <div style={{ marginBottom: showLocalFallback ? 20 : 8 }}>
              <button
                type="button"
                className="wizard-submit-btn"
                onClick={handleSsoLogin}
                disabled={ssoRedirecting || ssoProcessing}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(0, 255, 136, 0.2))',
                  borderColor: 'var(--drifter-cyan)',
                  color: 'var(--drifter-cyan)',
                  boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)',
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  cursor: (ssoRedirecting || ssoProcessing) ? 'wait' : 'pointer',
                }}
              >
                {ssoRedirecting ? t.loginSsoRedirecting : t.loginSsoBtn}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowLocalFallback(!showLocalFallback)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--drifter-text-dim)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    letterSpacing: '0.05em',
                  }}
                >
                  {showLocalFallback ? `[-] ${t.loginLocalFallbackHide}` : `[+] ${t.loginLocalFallbackToggle}`}
                </button>
              </div>
            </div>
          )}

          {/* Username/Password Form: Shown by default for builtin/none, or conditionally for OIDC fallback */}
          {(!isOidc || showLocalFallback) && (
            <form onSubmit={handleSubmit}>
              <div className="subform-box" style={{ marginTop: 0, marginBottom: 20 }}>
                <div className="form-group">
                  <label>{t.loginUsernameLabel}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.loginUsernamePlaceholder}
                    autoFocus={!isOidc}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>{t.loginPasswordLabel}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.loginPasswordPlaceholder}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="wizard-submit-btn"
                disabled={loading}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {loading ? t.loginSubmitting : t.loginSubmitBtn}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
