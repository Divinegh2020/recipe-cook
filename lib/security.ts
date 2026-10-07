import crypto from 'node:crypto';

export function createAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashAccessToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function safeEqualHex(a: string, b: string) {
  const aa = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}