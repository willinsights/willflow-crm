import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Create project_media table if not exists
export async function POST(request: NextRequest) {
  try {
    // Try to create the table using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS project_media (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "projectId" TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        thumbnail TEXT,
        duration TEXT,
        status TEXT DEFAULT 'active',
        "order" INTEGER DEFAULT 0,
        "addedBy" TEXT,
        "addedByName" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS project_media_projectId_idx ON project_media("projectId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS project_media_type_idx ON project_media(type)
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS project_media_status_idx ON project_media(status)
    `);

    return NextResponse.json({
      success: true,
      message: 'Table project_media created successfully'
    });
  } catch (error: any) {
    console.error('Error creating project_media table:', error);

    // If table already exists, that's OK
    if (error.message?.includes('already exists')) {
      return NextResponse.json({
        success: true,
        message: 'Table project_media already exists'
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
        WHERE table_name = 'project_media'
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
