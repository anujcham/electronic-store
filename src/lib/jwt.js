import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'electrovault_jwt_default_secret_key_change_in_prod_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'electrovault_jwt_refresh_secret_key_change_in_prod_2026';

const accessSecretKey = new TextEncoder().encode(JWT_SECRET);
const refreshSecretKey = new TextEncoder().encode(JWT_REFRESH_SECRET);

export const COOKIE_NAMES = {
  CUSTOMER_ACCESS: 'ev_access_token',
  CUSTOMER_REFRESH: 'ev_refresh_token',
  ADMIN_ACCESS: 'ev_admin_access_token',
  ADMIN_REFRESH: 'ev_admin_refresh_token',
};

// Lifecycles in seconds
export const TOKEN_MAX_AGE = {
  ACCESS: 15 * 60, // 15 minutes
  ADMIN_REFRESH: 2 * 60 * 60, // 2 hours
  CUSTOMER_REFRESH: 7 * 24 * 60 * 60, // 7 days
};

/**
 * Sign a short-lived Access Token (15 mins by default)
 */
export async function signAccessToken(payload, expiresIn = '15m') {
  return await new SignJWT({ ...payload, tokenType: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(accessSecretKey);
}

/**
 * Sign a Refresh Token (7 days for user, 2 hours for admin)
 */
export async function signRefreshToken(payload, expiresIn = '7d') {
  return await new SignJWT({ ...payload, tokenType: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(refreshSecretKey);
}

/**
 * Verify an Access Token
 */
export async function verifyAccessToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, accessSecretKey);
    if (payload.tokenType !== 'access') return null;
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Verify a Refresh Token
 */
export async function verifyRefreshToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, refreshSecretKey);
    if (payload.tokenType !== 'refresh') return null;
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Extract token from Request (supports both Authorization: Bearer <token> and HttpOnly cookie)
 */
export function extractTokenFromRequest(request, cookieName = COOKIE_NAMES.CUSTOMER_ACCESS) {
  try {
    // 1. Check Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const headerToken = authHeader.substring(7).trim();
      if (headerToken) return headerToken;
    }

    // 2. Check cookies
    if (request.cookies && typeof request.cookies.get === 'function') {
      const cookieVal = request.cookies.get(cookieName)?.value;
      if (cookieVal) return cookieVal;
    }
  } catch (err) {
    console.error('Error extracting token:', err);
  }
  return null;
}

/**
 * Set secure HttpOnly cookies on a NextResponse
 */
export function setAuthCookies(response, { accessToken, refreshToken, isAdmin = false }) {
  const isProd = process.env.NODE_ENV === 'production';
  const accessCookie = isAdmin ? COOKIE_NAMES.ADMIN_ACCESS : COOKIE_NAMES.CUSTOMER_ACCESS;
  const refreshCookie = isAdmin ? COOKIE_NAMES.ADMIN_REFRESH : COOKIE_NAMES.CUSTOMER_REFRESH;
  const refreshMaxAge = isAdmin ? TOKEN_MAX_AGE.ADMIN_REFRESH : TOKEN_MAX_AGE.CUSTOMER_REFRESH;

  if (accessToken) {
    response.cookies.set({
      name: accessCookie,
      value: accessToken,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_MAX_AGE.ACCESS,
    });
  }

  if (refreshToken) {
    response.cookies.set({
      name: refreshCookie,
      value: refreshToken,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: refreshMaxAge,
    });
  }

  return response;
}

/**
 * Clear authentication cookies on logout
 */
export function clearAuthCookies(response, { isAdmin = false }) {
  const isProd = process.env.NODE_ENV === 'production';
  const accessCookie = isAdmin ? COOKIE_NAMES.ADMIN_ACCESS : COOKIE_NAMES.CUSTOMER_ACCESS;
  const refreshCookie = isAdmin ? COOKIE_NAMES.ADMIN_REFRESH : COOKIE_NAMES.CUSTOMER_REFRESH;

  response.cookies.set({
    name: accessCookie,
    value: '',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: refreshCookie,
    value: '',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

