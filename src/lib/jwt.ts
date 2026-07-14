import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'stayfinder_super_secret_jwt_key_2026';

export interface JWTPayload {
  userId: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export function signToken(payload: JWTPayload): string {
  // Sign token, valid for 7 days
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
