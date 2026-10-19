import { OidcRoleMappingConfig } from './config.js';

export interface OidcDiscovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
  end_session_endpoint?: string;
}

export interface OidcUserInfo {
  id: string;
  username: string;
  email: string | null;
  name?: string;
  roles: string[];
}

/**
 * In Docker environments, localhost:8180 might point to the container itself
 * instead of the Keycloak container or host.
 * This helper resolves URLs for backend-to-backend fetch calls.
 */
export function resolveInternalUrl(url: string): string {
  if (url.includes('localhost:8180') || url.includes('127.0.0.1:8180')) {
    return url
      .replace('http://localhost:8180', 'http://keycloak:8080')
      .replace('http://127.0.0.1:8180', 'http://keycloak:8080');
  }
  return url;
}

/**
 * Safely extract nested claim values like 'realm_access.roles', 'groups', 'roles', etc.
 */
export function extractClaimValue(payload: any, path: string): string[] {
  if (!payload || typeof payload !== 'object' || !path) return [];
  const parts = path.trim().split('.');
  let current: any = payload;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }

  const result: string[] = [];
  if (Array.isArray(current)) {
    for (const item of current) {
      if (typeof item === 'string' && item.trim()) {
        result.push(item.trim());
      }
    }
  } else if (typeof current === 'string' && current.trim()) {
    result.push(current.trim());
  }
  return result;
}

/**
 * Fetch and validate OpenID Connect discovery document (.well-known/openid-configuration)
 */
export async function fetchOidcDiscovery(issuerUrl: string): Promise<OidcDiscovery> {
  const cleanIssuer = issuerUrl.trim().replace(/\/+$/, '');
  const discoveryPath = `${cleanIssuer}/.well-known/openid-configuration`;
  
  let res: Response | null = null;
  let lastError: Error | null = null;

  const urlsToTry = [discoveryPath];
  const internalResolved = resolveInternalUrl(discoveryPath);
  if (internalResolved !== discoveryPath) {
    urlsToTry.push(internalResolved);
  }

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        res = response;
        break;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!res) {
    throw new Error(`Failed to reach OIDC Discovery endpoint: ${lastError?.message || 'Connection failed'}`);
  }

  const data = (await res.json()) as OidcDiscovery;
  if (!data.authorization_endpoint || !data.token_endpoint) {
    throw new Error('Invalid OIDC discovery response: authorization_endpoint or token_endpoint is missing');
  }

  return data;
}

/**
 * Exchange authorization code for tokens and retrieve user information
 */
export async function exchangeOidcCode(params: {
  issuerUrl: string;
  clientId: string;
  clientSecret?: string;
  code: string;
  redirectUri: string;
  claimPath?: string;
}): Promise<OidcUserInfo> {
  const discovery = await fetchOidcDiscovery(params.issuerUrl);
  const tokenUrl = resolveInternalUrl(discovery.token_endpoint);

  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'authorization_code');
  bodyParams.append('code', params.code);
  bodyParams.append('client_id', params.clientId);
  if (params.clientSecret) {
    bodyParams.append('client_secret', params.clientSecret);
  }
  bodyParams.append('redirect_uri', params.redirectUri);

  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: bodyParams.toString(),
    signal: AbortSignal.timeout(8000),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code');
  }

  const accessToken = tokenData.access_token;
  const idToken = tokenData.id_token;

  let userInfo: any = {};

  // Try userinfo endpoint first if available
  if (discovery.userinfo_endpoint && accessToken) {
    try {
      const userinfoUrl = resolveInternalUrl(discovery.userinfo_endpoint);
      const uRes = await fetch(userinfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });
      if (uRes.ok) {
        userInfo = await uRes.json();
      }
    } catch {
      // Fall back to ID token payload
    }
  }

  // Parse ID token payload if userinfo didn't provide complete info
  if (idToken && (!userInfo.preferred_username || !userInfo.sub)) {
    try {
      const parts = idToken.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        userInfo = { ...payload, ...userInfo };
      }
    } catch {}
  }

  const rolesSet = new Set<string>();
  const customClaimPath = params.claimPath?.trim();

  const extractFromPayload = (payload: any) => {
    if (!payload || typeof payload !== 'object') return;

    // 1. Explicit administrator-configured claim path
    if (customClaimPath) {
      const customValues = extractClaimValue(payload, customClaimPath);
      customValues.forEach((val) => rolesSet.add(val));
    }

    // 2. Standard Keycloak realm roles
    if (payload.realm_access?.roles && Array.isArray(payload.realm_access.roles)) {
      payload.realm_access.roles.forEach((r: any) => typeof r === 'string' && rolesSet.add(r));
    }
    // 3. Keycloak client/resource roles
    if (payload.resource_access?.[params.clientId]?.roles && Array.isArray(payload.resource_access[params.clientId].roles)) {
      payload.resource_access[params.clientId].roles.forEach((r: any) => typeof r === 'string' && rolesSet.add(r));
    }
    // 4. Authentik / Okta / Azure AD standard groups or roles
    if (Array.isArray(payload.groups)) {
      payload.groups.forEach((g: any) => typeof g === 'string' && rolesSet.add(g));
    }
    if (Array.isArray(payload.roles)) {
      payload.roles.forEach((r: any) => typeof r === 'string' && rolesSet.add(r));
    }
    if (Array.isArray(payload.user_roles)) {
      payload.user_roles.forEach((r: any) => typeof r === 'string' && rolesSet.add(r));
    }
  };

  // Inspect access token payload
  if (accessToken) {
    try {
      const parts = accessToken.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        extractFromPayload(payload);
      }
    } catch {}
  }

  // Inspect ID token payload
  if (idToken) {
    try {
      const parts = idToken.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        extractFromPayload(payload);
      }
    } catch {}
  }

  // Inspect userinfo payload
  extractFromPayload(userInfo);

  const username = userInfo.preferred_username || userInfo.username || userInfo.sub || userInfo.email;
  if (!username) {
    throw new Error('Unable to extract username from OIDC token/userinfo claims');
  }

  return {
    id: userInfo.sub || username,
    username: String(username).toLowerCase(),
    email: userInfo.email || null,
    name: userInfo.name || userInfo.given_name || undefined,
    roles: Array.from(rolesSet),
  };
}

/**
 * Evaluates Switchbridge user role based strictly on administrator-configured mapping rules.
 * No hidden heuristics, no automatic admin for random first users.
 */
export function evaluateUserRole(
  rawRoles: string[],
  mapping?: OidcRoleMappingConfig
): 'admin' | 'operator' | 'viewer' | 'deny' {
  // If mapping is disabled (administrator chose to skip/defer mapping in wizard):
  if (!mapping || !mapping.enabled) {
    return mapping?.defaultRole || 'viewer';
  }

  const normalizedUserRoles = rawRoles.map((r: string) => String(r).trim().toLowerCase());

  // Check explicit rules configured by administrator
  if (mapping.rules && Array.isArray(mapping.rules) && mapping.rules.length > 0) {
    const matchedRoles: ('admin' | 'operator' | 'viewer')[] = [];

    for (const rule of mapping.rules) {
      if (!rule.oidcRole) continue;
      const targetRole = rule.oidcRole.trim().toLowerCase();
      if (normalizedUserRoles.includes(targetRole)) {
        matchedRoles.push(rule.switchbridgeRole);
      }
    }

    // Role priority: admin > operator > viewer
    if (matchedRoles.includes('admin')) return 'admin';
    if (matchedRoles.includes('operator')) return 'operator';
    if (matchedRoles.includes('viewer')) return 'viewer';

    // No rule matched -> enforce configured fallback policy
    return mapping.defaultRole || 'deny';
  }

  // Fallback for legacy configuration format (adminRoles / operatorRoles)
  const adminMatches = (mapping.adminRoles || []).map((r: string) => r.trim().toLowerCase());
  const operatorMatches = (mapping.operatorRoles || []).map((r: string) => r.trim().toLowerCase());

  if (adminMatches.length > 0 && normalizedUserRoles.some((r: string) => adminMatches.includes(r))) {
    return 'admin';
  }
  if (operatorMatches.length > 0 && normalizedUserRoles.some((r: string) => operatorMatches.includes(r))) {
    return 'operator';
  }

  return mapping.defaultRole || 'deny';
}
