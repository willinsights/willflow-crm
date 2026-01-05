/**
 * Authentication Middleware for WillFlow CRM
 * Protects API routes and validates JWT tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Extract token from request headers or cookies
 */
export function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const token = request.cookies.get('auth_token')?.value;
  return token || null;
}

/**
 * Verify authentication and return user payload
 */
export function authenticate(request: NextRequest): JWTPayload | null {
  const token = extractToken(request);
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Middleware wrapper for protected API routes
 */
export function withAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse> | NextResponse,
  options?: {
    roles?: string[];
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado. Por favor, faça login.' },
        { status: 401 }
      );
    }

    // Check role if specified
    if (options?.roles && !options.roles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para acessar este recurso.' },
        { status: 403 }
      );
    }

    return handler(request, user);
  };
}

/**
 * Optional auth - returns user if authenticated, otherwise continues
 */
export function withOptionalAuth(
  handler: (request: NextRequest, user: JWTPayload | null) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = authenticate(request);
    return handler(request, user);
  };
}

export default {
  extractToken,
  authenticate,
  withAuth,
  withOptionalAuth,
};
