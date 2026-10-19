import { useState } from 'react';
import { Lang, translations } from './i18n';

export interface RoleMappingRule {
  id: string;
  oidcRole: string;
  switchbridgeRole: 'admin' | 'operator' | 'viewer';
  permissions?: string[];
}

export interface OidcRoleMappingConfig {
  enabled: boolean;
  claimPath?: string;
  rules?: RoleMappingRule[];
  defaultRole?: 'viewer' | 'deny';
}

interface RoleMappingEditorProps {
  lang: Lang;
  initialMapping?: OidcRoleMappingConfig | null;
  onChange?: (mapping: OidcRoleMappingConfig) => void;
  isStandalone?: boolean; // True when shown in Settings tab, false in Setup Wizard
}

export function RoleMappingEditor({
  lang,
  initialMapping,
  onChange,
  isStandalone = false,
}: RoleMappingEditorProps) {
  const t = translations[lang];

  const [enabled, setEnabled] = useState<boolean>(initialMapping?.enabled ?? true);
  const [claimPath, setClaimPath] = useState<string>(initialMapping?.claimPath || 'realm_access.roles');
  const [rules, setRules] = useState<RoleMappingRule[]>(() => {
    if (initialMapping?.rules && initialMapping.rules.length > 0) {
      return initialMapping.rules;
    }
    // Default starter rules for smooth onboarding
    return [
      { id: '1', oidcRole: 'admin', switchbridgeRole: 'admin' },
      { id: '2', oidcRole: 'operator', switchbridgeRole: 'operator' },
    ];
  });
  const [defaultRole, setDefaultRole] = useState<'viewer' | 'deny'>(initialMapping?.defaultRole || 'deny');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Notify parent component on state change
  const triggerChange = (
    newEnabled: boolean,
    newClaimPath: string,
    newRules: RoleMappingRule[],
    newDefaultRole: 'viewer' | 'deny'
  ) => {
    if (onChange) {
      onChange({
        enabled: newEnabled,
        claimPath: newClaimPath,
        rules: newRules,
        defaultRole: newDefaultRole,
      });
    }
  };

  const handleToggleEnabled = (val: boolean) => {
    setEnabled(val);
    triggerChange(val, claimPath, rules, defaultRole);
  };

  const handleClaimPathChange = (val: string) => {
    setClaimPath(val);
    triggerChange(enabled, val, rules, defaultRole);
  };

  const handleDefaultRoleChange = (val: 'viewer' | 'deny') => {
    setDefaultRole(val);
    triggerChange(enabled, claimPath, rules, val);
  };

  const handleAddRule = () => {
    const newRule: RoleMappingRule = {
      id: String(Date.now()),
      oidcRole: '',
      switchbridgeRole: 'operator',
    };
    const updated = [...rules, newRule];
    setRules(updated);
    triggerChange(enabled, claimPath, updated, defaultRole);
  };

  const handleRemoveRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    triggerChange(enabled, claimPath, updated, defaultRole);
  };

  const handleRuleChange = (
    id: string,
    field: 'oidcRole' | 'switchbridgeRole',
    val: string
  ) => {
    const updated = rules.map((r) => {
      if (r.id === id) {
        return { ...r, [field]: val };
      }
      return r;
    });
    setRules(updated);
    triggerChange(enabled, claimPath, updated, defaultRole);
  };

  const handleSaveStandalone = async () => {
    setSaveLoading(true);
    setSaveMessage(null);
    try {
      const token = localStorage.getItem('sb_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${import.meta.env.BASE_URL}api/settings/role-mapping`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          enabled,
          claimPath,
          rules,
          defaultRole,
        }),
      });

      if (res.ok) {
        setSaveMessage(t.settingsSaved);
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        const err = await res.json();
        setSaveMessage(`Error: ${err.message || err.error}`);
      }
    } catch (e: any) {
      setSaveMessage(`Error: ${e.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 18,
        padding: '16px',
        border: '1px solid var(--drifter-border)',
        background: 'var(--drifter-black)',
      }}
    >
      {/* Header & Mode Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div className="subform-title" style={{ margin: 0, color: 'var(--drifter-cyan)' }}>
          {t.roleMappingTitle}
        </div>

        {!isStandalone && (
          <div className="customizer-bar" style={{ gap: 4 }}>
            <button
              type="button"
              className={`font-btn ${enabled ? 'active' : ''}`}
              onClick={() => handleToggleEnabled(true)}
              style={{ fontSize: '0.62rem', padding: '5px 10px' }}
            >
              {t.roleMappingConfigureOption}
            </button>
            <button
              type="button"
              className={`font-btn ${!enabled ? 'active' : ''}`}
              onClick={() => handleToggleEnabled(false)}
              style={{ fontSize: '0.62rem', padding: '5px 10px' }}
            >
              {t.roleMappingSkipOption}
            </button>
          </div>
        )}
      </div>

      <p style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: 14, lineHeight: '1.4' }}>
        {t.roleMappingDescription}
      </p>

      {!enabled && !isStandalone ? (
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(0, 240, 255, 0.06)',
            border: '1px dashed var(--drifter-cyan)',
            color: '#00f0ff',
            fontSize: '0.72rem',
            lineHeight: '1.5',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          {t.roleMappingSkippedInfo}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Claim Path Selector */}
          <div
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '0.68rem',
                color: 'var(--drifter-cyan)',
                fontWeight: 'bold',
                marginBottom: 6,
                letterSpacing: '0.05em',
              }}
            >
              {t.roleMappingClaimPathLabel}
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                value={claimPath}
                onChange={(e) => handleClaimPathChange(e.target.value)}
                placeholder={t.roleMappingClaimPathPlaceholder}
                style={{ flex: '1 1 220px', minWidth: 200, marginBottom: 0 }}
              />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="font-btn"
                  onClick={() => handleClaimPathChange('realm_access.roles')}
                  style={{ fontSize: '0.62rem', padding: '4px 8px' }}
                  title="Keycloak Realm Roles"
                >
                  {t.roleMappingClaimKeycloakBtn}
                </button>
                <button
                  type="button"
                  className="font-btn"
                  onClick={() => handleClaimPathChange('groups')}
                  style={{ fontSize: '0.62rem', padding: '4px 8px' }}
                  title="Authentik or Okta groups"
                >
                  {t.roleMappingClaimAuthentikBtn}
                </button>
                <button
                  type="button"
                  className="font-btn"
                  onClick={() => handleClaimPathChange('roles')}
                  style={{ fontSize: '0.62rem', padding: '4px 8px' }}
                  title="Standard OIDC roles"
                >
                  {t.roleMappingClaimRolesBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Two-Column Mapping Canvas */}
          <div
            style={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 1fr) 28px minmax(180px, 1.2fr) 40px',
                gap: 8,
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                color: '#a0aec0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>{t.roleMappingLeftHeader}</div>
              <div></div>
              <div>{t.roleMappingRightHeader}</div>
              <div></div>
            </div>

            {/* Rules List */}
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rules.length === 0 ? (
                <div
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    color: '#718096',
                    fontStyle: 'italic',
                  }}
                >
                  {t.roleMappingNoRules}
                </div>
              ) : (
                rules.map((rule, idx) => (
                  <div
                    key={rule.id || idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(140px, 1fr) 28px minmax(180px, 1.2fr) 40px',
                      gap: 8,
                      alignItems: 'center',
                      padding: '8px 10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {/* Left: OIDC Group */}
                    <div>
                      <input
                        type="text"
                        value={rule.oidcRole}
                        onChange={(e) => handleRuleChange(rule.id, 'oidcRole', e.target.value)}
                        placeholder={t.roleMappingOidcPlaceholder}
                        style={{
                          marginBottom: 0,
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          borderColor: rule.oidcRole.trim() ? 'var(--drifter-cyan)' : 'var(--drifter-border)',
                        }}
                      />
                    </div>

                    {/* Arrow */}
                    <div
                      style={{
                        textAlign: 'center',
                        color: 'var(--drifter-cyan)',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}
                    >
                      ➔
                    </div>

                    {/* Right: Switchbridge Role & Rights */}
                    <div>
                      <select
                        value={rule.switchbridgeRole}
                        onChange={(e) =>
                          handleRuleChange(rule.id, 'switchbridgeRole', e.target.value as any)
                        }
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          background: 'var(--drifter-black)',
                          color: '#ffffff',
                          border: '1px solid var(--drifter-cyan)',
                          marginBottom: 4,
                        }}
                      >
                        <option value="admin">👑 ADMIN (Full Access)</option>
                        <option value="operator">🛠️ OPERATOR (Bridges & Channels)</option>
                        <option value="viewer">👁️ VIEWER (Read-Only)</option>
                      </select>
                      <div
                        style={{
                          fontSize: '0.62rem',
                          color: '#a0aec0',
                          paddingLeft: 2,
                        }}
                      >
                        {rule.switchbridgeRole === 'admin' && t.roleAdminDesc}
                        {rule.switchbridgeRole === 'operator' && t.roleOperatorDesc}
                        {rule.switchbridgeRole === 'viewer' && t.roleViewerDesc}
                      </div>
                    </div>

                    {/* Delete Rule */}
                    <div style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule.id)}
                        className="font-btn"
                        style={{
                          color: '#ff0077',
                          borderColor: '#ff0077',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                        }}
                        title="Delete rule"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Rule Button */}
            <div
              style={{
                padding: '8px 12px 12px 12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <button
                type="button"
                className="font-btn"
                onClick={handleAddRule}
                style={{
                  color: 'var(--drifter-cyan)',
                  borderColor: 'var(--drifter-cyan)',
                  fontSize: '0.7rem',
                  padding: '6px 14px',
                  fontWeight: 'bold',
                }}
              >
                {t.roleMappingAddRuleBtn}
              </button>
            </div>
          </div>

          {/* Fallback Policy Selector */}
          <div
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '0.68rem',
                color: 'var(--drifter-cyan)',
                fontWeight: 'bold',
                marginBottom: 8,
                letterSpacing: '0.05em',
              }}
            >
              {t.roleMappingFallbackLabel}
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`font-btn ${defaultRole === 'deny' ? 'active' : ''}`}
                onClick={() => handleDefaultRoleChange('deny')}
                style={{
                  fontSize: '0.68rem',
                  padding: '6px 12px',
                  borderColor: defaultRole === 'deny' ? '#ff0077' : undefined,
                  color: defaultRole === 'deny' ? '#ff0077' : undefined,
                }}
              >
                {t.roleMappingFallbackDeny}
              </button>
              <button
                type="button"
                className={`font-btn ${defaultRole === 'viewer' ? 'active' : ''}`}
                onClick={() => handleDefaultRoleChange('viewer')}
                style={{ fontSize: '0.68rem', padding: '6px 12px' }}
              >
                {t.roleMappingFallbackViewer}
              </button>
            </div>
          </div>

          {/* Sync Note */}
          <div
            style={{
              fontSize: '0.68rem',
              color: '#38ef7d',
              fontFamily: 'var(--font-mono, monospace)',
              padding: '8px 12px',
              background: 'rgba(56, 239, 125, 0.08)',
              borderLeft: '3px solid #38ef7d',
            }}
          >
            ℹ {t.roleMappingSyncNote}
          </div>

          {/* Standalone Save Button (Settings Tab) */}
          {isStandalone && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                className="font-btn active"
                onClick={handleSaveStandalone}
                disabled={saveLoading}
                style={{
                  fontSize: '0.75rem',
                  padding: '8px 20px',
                  borderColor: 'var(--drifter-cyan)',
                  color: 'var(--drifter-cyan)',
                  fontWeight: 'bold',
                }}
              >
                {saveLoading ? t.submitSaving : t.settingsSaveBtn}
              </button>
              {saveMessage && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: saveMessage.startsWith('Error') ? '#ff0077' : '#38ef7d',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 'bold',
                  }}
                >
                  {saveMessage}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
