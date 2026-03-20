import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const PRO_ACCESS_COOKIE = 'jobfit_pro_access';
const PRO_ACCESS_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface AccessPayload {
  sessionId: string;
  email: string;
  exp: number;
}

function isDevProAccessEnabled(): boolean {
  const enabledValue = String(process.env.DEV_FORCE_PRO_ACCESS || '').toLowerCase();
  const isEnabled = enabledValue === 'true' || enabledValue === '1' || enabledValue === 'yes';
  return process.env.NODE_ENV !== 'production' && isEnabled;
}

function getSigningSecret(): string {
  const secret = process.env.PAYMENT_ACCESS_SIGNING_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('PAYMENT_ACCESS_SIGNING_SECRET is missing or too short.');
  }
  return secret;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sign(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function createProAccessToken(sessionId: string, email: string): string {
  const payload: AccessPayload = {
    sessionId,
    email,
    exp: Math.floor(Date.now() / 1000) + PRO_ACCESS_TTL_SECONDS
  };

  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = sign(encodedPayload, getSigningSecret());

  return `${encodedPayload}.${signature}`;
}

export function verifyProAccessToken(token: string): AccessPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payload, signature] = parts;
  const expectedSignature = sign(payload, getSigningSecret());

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AccessPayload;
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function hasProAccess(request: NextRequest): boolean {
  if (isDevProAccessEnabled()) {
    return true;
  }

  const token = request.cookies.get(PRO_ACCESS_COOKIE)?.value;
  if (!token) {
    return false;
  }

  try {
    return Boolean(verifyProAccessToken(token));
  } catch {
    return false;
  }
}

export function getCookieMaxAgeSeconds(): number {
  return PRO_ACCESS_TTL_SECONDS;
}
