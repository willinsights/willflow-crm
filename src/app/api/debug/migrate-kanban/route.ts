import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Create kanban_columns table if not exists
export async function POST(request: NextRequest) {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS kanban_columns (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        phase TEXT NOT NULL,
        "statusKey" TEXT NOT NULL,
        "customName" TEXT,
        color TEXT,
        "order" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(phase, "statusKey")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS kanban_columns_phase_idx ON kanban_columns(phase)
    `);

    return NextResponse.json({
      success: true,
      message: 'Table kanban_columns created successfully'
    });
  } catch (error: any) {
    console.error('Error creating kanban_columns table:', error);

    if (error.message?.includes('already exists')) {
      return NextResponse.json({
        success: true,
        message: 'Table kanban_columns already exists'
      });
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create table' },
      { status: 500 }
    );
  }
}

// GET - Check if table exists
export async function GET(request: NextRequest) {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'kanban_columns'
      )
    `);

    return NextResponse.json({
      success: true,
      tableExists: (result as any)[0]?.exists || false
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
