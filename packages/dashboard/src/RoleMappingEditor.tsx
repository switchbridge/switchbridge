import { useState, useEffect } from 'react';
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
  discoveredRoles?: string[]; // Automatically discovered roles from OIDC
  onChange?: (mapping: OidcRoleMappingConfig) => void;
  isStandalone?: boolean; // True in Settings tab, false in Setup Wizard
}

export function RoleMappingEditor({
  lang,
  initialMapping,
  discoveredRoles = [],
  onChange,
  isStandalone = false,
}: RoleMappingEditorProps) {
  const t = translations[lang];

  const [enabled, setEnabled] = useState<boolean>(initialMapping?.enabled ?? true);
  const [internalDiscoveredRoles, setInternalDiscoveredRoles] = useState<string[]>(discoveredRoles);

  const [rules, setRules] = useState<RoleMappingRule[]>(() => {
    if (initialMapping?.rules && initialMapping.rules.length > 0) {
      return initialMapping.rules;
    }
    // If discovered roles are passed, auto-populate mapping rules for them
    if (discoveredRoles && discoveredRoles.length > 0) {
      return discoveredRoles.map((roleName, index) => {
        const lower = roleName.toLowerCase();
        let mappedRole: 'admin' | 'operator' | 'viewer' = 'viewer';
        if (lower.includes('admin')) mappedRole = 'admin';
        else if (lower.includes('operat') || lower.includes('devops') || lower.includes('manage')) mappedRole = 'operator';
        return {
          id: String(index + 1),
          oidcRole: roleName,
          switchbridgeRole: mappedRole,
        };
      });
    }
    // Default starter rules
    return [
      { id: '1', oidcRole: 'admin', switchbridgeRole: 'admin' },
      { id: '2', oidcRole: 'operator', switchbridgeRole: 'operator' },
      { id: '3', oidcRole: 'viewer', switchbridgeRole: 'viewer' },
    ];
  });

  const [defaultRole, setDefaultRole] = useState<'viewer' | 'deny'>(initialMapping?.defaultRole || 'deny');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Close info modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowInfoModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync internal discovered roles if prop updates
  useEffect(() => {
    if (discoveredRoles && discoveredRoles.length > 0) {
      setInternalDiscoveredRoles(discoveredRoles);
    }
  }, [discoveredRoles]);

  // In standalone mode, fetch current settings and discovered roles if not provided
  useEffect(() => {
    if (isStandalone && internalDiscoveredRoles.length === 0) {
      fetch(`${import.meta.env.BASE_URL}api/settings/role-mapping`)
        .then((res) => res.json())
        .then((data) => {
          if (data.discoveredRoles && Array.isArray(data.discoveredRoles)) {
            setInternalDiscoveredRoles(data.discoveredRoles);
          }
        })
        .catch(() => {});
    }
  }, [isStandalone]);

  const triggerChange = (
    newEnabled: boolean,
    newRules: RoleMappingRule[],
    newDefaultRole: 'viewer' | 'deny'
  ) => {
    if (onChange) {
      onChange({
        enabled: newEnabled,
        rules: newRules,
        defaultRole: newDefaultRole,
      });
    }
  };

  const handleToggleEnabled = (val: boolean) => {
    setEnabled(val);
    triggerChange(val, rules, defaultRole);
  };

  const handleDefaultRoleChange = (val: 'viewer' | 'deny') => {
    setDefaultRole(val);
    triggerChange(enabled, rules, val);
  };

  const handleAddRule = (roleName = '') => {
    const newRule: RoleMappingRule = {
      id: String(Date.now()),
      oidcRole: roleName,
      switchbridgeRole: roleName.toLowerCase().includes('admin')
        ? 'admin'
        : roleName.toLowerCase().includes('operat')
        ? 'operator'
        : 'viewer',
    };
    const updated = [...rules, newRule];
    setRules(updated);
    triggerChange(enabled, updated, defaultRole);
  };

  const handleRemoveRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    triggerChange(enabled, updated, defaultRole);
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
    triggerChange(enabled, updated, defaultRole);
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

  const allDiscovered = internalDiscoveredRoles.length > 0
    ? internalDiscoveredRoles
    : ['admin', 'operator', 'viewer'];

  return (
    <div className="role-mapping-container">
      {/* Intel Briefing Modal */}
      {showInfoModal && (
        <div
          className="info-modal-backdrop"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="info-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="info-modal-header">
              <div className="info-modal-title">
                <span className="info-modal-icon">?</span>
                <span>{t.intelModalTitle} {t.intel.roleMapping.title}</span>
              </div>
              <button
                type="button"
                className="info-modal-close"
                onClick={() => setShowInfoModal(false)}
                title="CLOSE [ESC]"
              >
                ✕
              </button>
            </div>

            <div className="info-modal-body">
              <div className="info-modal-badge">{t.intel.roleMapping.badge}</div>
              <p className="info-modal-summary">{t.intel.roleMapping.summary}</p>

              <div className="info-modal-section-title">{t.intelCapabilities}</div>
              <ul className="info-modal-list">
                {t.intel.roleMapping.bullets.map((b, i) => (
                  <li key={i}>
                    <span className="info-modal-bullet">►</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="info-modal-best-for">
                <span className="best-for-label">{t.intelRecommendedCase}</span>
                <span className="best-for-text">{t.intel.roleMapping.bestFor}</span>
              </div>
            </div>

            <div className="info-modal-footer">
              <button
                type="button"
                className="info-modal-action-btn"
                onClick={() => setShowInfoModal(false)}
              >
                {t.intelCloseBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Row: Title on Left, [?] & [RBAC] badge on Right (matching option-header-row style) */}
      <div className="role-mapping-header-row">
        <div className="role-mapping-title">{t.roleMappingTitle}</div>

        <div className="option-actions-group">
          <button
            type="button"
            className="info-help-btn"
            onClick={() => setShowInfoModal(true)}
            title="VIEW INTEL"
          >
            ?
          </button>
          <span className="option-badge enterprise">{t.badgeRbac}</span>
        </div>
      </div>

      {/* Mode Switcher */}
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

      {!enabled && !isStandalone ? (
        <div className="mapping-sync-note" style={{ borderColor: 'var(--drifter-cyan)', color: 'var(--drifter-cyan)' }}>
          {t.roleMappingSkippedInfo}
        </div>
      ) : (
        <div>
          {/* Datalist for discovered roles autocomplete */}
          <datalist id="discovered-roles-datalist">
            {allDiscovered.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>

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
                        list="discovered-roles-datalist"
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
                onClick={() => handleAddRule('')}
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
