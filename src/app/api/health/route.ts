import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * GET /api/health
 * 
 * Returns 200 OK if the service is healthy
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      service: 'audiovisual-crm',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      storage: 'in-memory'
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
