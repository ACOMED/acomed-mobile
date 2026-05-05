// authService.ts
// Handles authentication against the ACOMED backend.
//
// AsyncStorage keys:
//   acomed_token  → JWT string
//   acomed_user   → serialised User object

import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL    = 'https://api.acomed.tech';
const TOKEN_KEY   = 'acomed_token';
const USER_KEY    = 'acomed_user';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface LoginResult {
  success: true;
  user: AuthUser;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Sends credentials to POST /api/auth/login.
 * On success, persists the token and user to AsyncStorage.
 * Throws an Error with a user-facing message on failure.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (networkErr) {
    console.error('[authService] Network error:', networkErr);
    throw new Error('Unable to reach the server. Check your connection and try again.');
  }

  if (response.status === 401) {
    throw new Error('Incorrect email or password.');
  }

  if (!response.ok) {
    throw new Error(`Server error (${response.status}). Please try again later.`);
  }

  const body = await response.json();

  const token = body.token;
  const user = body.user;

  if (!body.success || !token || !user) {
    throw new Error('Unexpected response from server. Please contact support.');
  }

  const normalizedUser: AuthUser = {
    id: user.id,
    tenant_id: user.tenant_id || '',
    full_name: user.full_name || user.name || '',
    email: user.email,
    role: user.role,
  };

  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(normalizedUser)),
  ]);

  console.log('[authService] Login successful for', normalizedUser.email);
  return { success: true, user: normalizedUser };
}
/**
 * Returns the stored JWT token, or null if no session exists.
 */
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.error('[authService] getToken failed:', err);
    return null;
  }
}

/**
 * Returns the stored user object, or null if no session exists.
 */
export async function getUser(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch (err) {
    console.error('[authService] getUser failed:', err);
    return null;
  }
}

/**
 * Returns true if a valid token is present in local storage.
 * (Token validity is not verified against the server here — network-free check.)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return token !== null && token.length > 0;
}

/**
 * Removes the token and user from AsyncStorage, effectively logging out.
 */
export async function logout(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    console.log('[authService] Logged out — local session cleared.');
  } catch (err) {
    console.error('[authService] logout failed:', err);
  }
}
