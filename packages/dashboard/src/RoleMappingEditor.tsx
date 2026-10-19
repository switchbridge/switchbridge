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
    return [
      { id: '1', oidcRole: 'admin', switchbridgeRole: 'admin' },
      { id: '2', oidcRole: 'operator', switchbridgeRole: 'operator' },
    ];
  });
  const [defaultRole, setDefaultRole] = useState<'viewer' | 'deny'>(initialMapping?.defaultRole || 'deny');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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
    <div className="role-mapping-container">
      {/* Header & Mode Switcher */}
      <div className="role-mapping-header">
        <div className="role-mapping-title">{t.roleMappingTitle}</div>

        {!isStandalone && (
          <div className="role-mapping-mode-buttons">
            <button
              type="button"
              className={`role-mapping-mode-btn ${enabled ? 'active' : ''}`}
              onClick={() => handleToggleEnabled(true)}
            >
              {t.roleMappingConfigureOption}
            </button>
            <button
              type="button"
              className={`role-mapping-mode-btn ${!enabled ? 'active' : ''}`}
              onClick={() => handleToggleEnabled(false)}
            >
              {t.roleMappingSkipOption}
            </button>
          </div>
        )}
      </div>

      <p className="role-mapping-description">
        {t.roleMappingDescription}
      </p>

      {!enabled && !isStandalone ? (
        <div className="mapping-sync-note" style={{ borderColor: 'var(--drifter-cyan)', color: 'var(--drifter-cyan)' }}>
          {t.roleMappingSkippedInfo}
        </div>
      ) : (
        <div>
          {/* Claim Path Selector */}
          <div className="role-mapping-claim-box">
            <label>{t.roleMappingClaimPathLabel}</label>
            <div className="role-mapping-claim-input-row">
              <input
                type="text"
                className="role-mapping-claim-input"
                value={claimPath}
                onChange={(e) => handleClaimPathChange(e.target.value)}
                placeholder={t.roleMappingClaimPathPlaceholder}
              />
              <div className="role-mapping-chips">
                <button
                  type="button"
                  className={`role-mapping-chip ${claimPath === 'realm_access.roles' ? 'active' : ''}`}
                  onClick={() => handleClaimPathChange('realm_access.roles')}
                  title="Keycloak Realm Roles"
                >
                  {t.roleMappingClaimKeycloakBtn}
                </button>
                <button
                  type="button"
                  className={`role-mapping-chip ${claimPath === 'groups' ? 'active' : ''}`}
                  onClick={() => handleClaimPathChange('groups')}
                  title="Authentik or Okta groups"
                >
                  {t.roleMappingClaimAuthentikBtn}
                </button>
                <button
                  type="button"
                  className={`role-mapping-chip ${claimPath === 'roles' ? 'active' : ''}`}
                  onClick={() => handleClaimPathChange('roles')}
                  title="Standard OIDC roles"
                >
                  {t.roleMappingClaimRolesBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Two-Column Mapping Canvas */}
          <div className="mapping-canvas">
            {/* Table Header */}
            <div className="mapping-canvas-header">
              <div>{t.roleMappingLeftHeader}</div>
              <div></div>
              <div>{t.roleMappingRightHeader}</div>
              <div></div>
            </div>

            {/* Rules List */}
            <div className="mapping-rules-list">
              {rules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--drifter-dim)' }}>
                  {t.roleMappingNoRules}
                </div>
              ) : (
                rules.map((rule, idx) => (
                  <div key={rule.id || idx} className="mapping-rule-row">
                    {/* Left: OIDC Group */}
                    <div>
                      <input
                        type="text"
                        className="mapping-rule-input"
                        value={rule.oidcRole}
                        onChange={(e) => handleRuleChange(rule.id, 'oidcRole', e.target.value)}
                        placeholder={t.roleMappingOidcPlaceholder}
                      />
                    </div>

                    {/* Arrow */}
                    <div className="mapping-arrow">➔</div>

                    {/* Right: Switchbridge Role & Rights */}
                    <div className="mapping-select-wrapper">
                      <select
                        className="mapping-rule-select"
                        value={rule.switchbridgeRole}
                        onChange={(e) =>
                          handleRuleChange(rule.id, 'switchbridgeRole', e.target.value as any)
                        }
                      >
                        <option value="admin">👑 ADMIN (Full Access)</option>
                        <option value="operator">🛠️ OPERATOR (Bridges & Channels)</option>
                        <option value="viewer">👁️ VIEWER (Read-Only)</option>
                      </select>
                      <div className="mapping-rule-perm-desc">
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
                        className="mapping-delete-btn"
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
            <div>
              <button
                type="button"
                className="mapping-add-btn"
                onClick={handleAddRule}
              >
                {t.roleMappingAddRuleBtn}
              </button>
            </div>
          </div>

          {/* Fallback Policy Selector */}
          <div className="mapping-fallback-box">
            <label>{t.roleMappingFallbackLabel}</label>
            <div className="mapping-fallback-options">
              <button
                type="button"
                className={`fallback-btn-deny ${defaultRole === 'deny' ? 'active' : ''}`}
                onClick={() => handleDefaultRoleChange('deny')}
              >
                {t.roleMappingFallbackDeny}
              </button>
              <button
                type="button"
                className={`fallback-btn-viewer ${defaultRole === 'viewer' ? 'active' : ''}`}
                onClick={() => handleDefaultRoleChange('viewer')}
              >
                {t.roleMappingFallbackViewer}
              </button>
            </div>
          </div>

          {/* Sync Note */}
          <div className="mapping-sync-note">
            ℹ {t.roleMappingSyncNote}
          </div>

          {/* Standalone Save Button (Settings Tab) */}
          {isStandalone && (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                className="info-modal-action-btn"
                onClick={handleSaveStandalone}
                disabled={saveLoading}
              >
                {saveLoading ? t.submitSaving : t.settingsSaveBtn}
              </button>
              {saveMessage && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: saveMessage.startsWith('Error') ? 'var(--drifter-pink)' : 'var(--drifter-mint)',
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
