import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession, deleteSession, getUserById } from './database';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  return 'surya-yoga-super-secure-key-12345';
})();
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface SessionPayload {
  userId: number;
  sessionId: string;
  email: string;
  username: string;
}

export function generateSessionToken(userId: number, email: string, username: string): { token: string; sessionId: string; expiresAt: Date } {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  const payload: SessionPayload = {
    userId,
    sessionId,
    email,
    username
  };
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  
  // Store session in database
  createSession(userId, sessionId, expiresAt);
  
  return { token, sessionId, expiresAt };
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    
    // Check if session exists and is valid in database
    const session = getSession(decoded.sessionId);
    if (!session) {
      return null;
    }
    
    // Check if user still exists
    const user = getUserById(decoded.userId);
    if (!user || !user.is_verified) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function invalidateSession(sessionId: string): boolean {
  return deleteSession(sessionId);
}

export function setAuthCookie(response: NextResponse, token: string, expiresAt: Date): NextResponse {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.SECURE_COOKIE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.suryayoga.ge' : undefined
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete('auth-token');
  return response;
}

export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export function requireAuth(request: NextRequest): { session: SessionPayload } | NextResponse {
  const session = getSessionFromRequest(request);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  return { session };
}