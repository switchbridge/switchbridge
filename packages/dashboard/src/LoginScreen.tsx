import React, { useState } from 'react';
import { translations, Lang } from './i18n';

export interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
}

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('sb_lang') as Lang) || 'ru';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('sb_lang', newLang);
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

  return (
    <div className="setup-container">
      <div className="setup-card" style={{ maxWidth: 540 }}>
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

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="setup-description">
            {t.loginDescription}
          </div>

          {error && (
            <div className="setup-error-banner">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <div className="subform-box" style={{ marginTop: 0, marginBottom: 20 }}>
            <div className="form-group">
              <label>{t.loginUsernameLabel}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.loginUsernamePlaceholder}
                autoFocus
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
            className="setup-submit-btn"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? t.loginSubmitting : t.loginSubmitBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
