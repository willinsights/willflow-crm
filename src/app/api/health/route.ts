import { NextResponse } from 'next/server';

// Helper para timeout de Promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ]);
}

/**
 * Health check endpoint
 * GET /api/health
 *
 * Returns 200 OK if the service is healthy
 */
export async function GET() {
  let dbStatus = 'unknown';
  let dbError: string | undefined;

  // Verificar conexão com banco de dados
  try {
    const { prisma } = await import('@/lib/prisma');
    await withTimeout(prisma.$queryRaw`SELECT 1`, 3000);
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'unavailable';
    dbError = error instanceof Error ? error.message : 'Connection failed';
    console.log('⚠️ Database health check failed:', dbError);
  }

  try {
    return NextResponse.json({
      status: 'ok',
      service: 'audiovisual-crm',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        error: dbError
      },
      fallback: dbStatus !== 'connected' ? 'Using mock data' : undefined
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
