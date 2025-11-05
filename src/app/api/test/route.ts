import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const stats = storage.getStats();

    return NextResponse.json({
      success: true,
      message: 'APIs funcionando!',
      stats,
      timestamp: new Date().toISOString(),
      apiEndpoints: {
        projects: '/api/projects',
        clients: '/api/clients',
        categories: '/api/categories',
        users: '/api/users'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro no servidor'
    }, { status: 500 });
  }
}
