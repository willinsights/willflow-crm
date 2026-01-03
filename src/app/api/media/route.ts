import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all media from all projects (for Uploads page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // filter by type
    const projectId = searchParams.get('projectId'); // filter by project
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      status
    };

    if (type && type !== 'all') {
      where.type = type;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const [media, total] = await Promise.all([
      prisma.projectMedia.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.projectMedia.count({ where })
    ]);

    // Get project info for each media
    const projectIds = [...new Set(media.map(m => m.projectId))];
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        title: true,
        customId: true,
        client: {
          select: { name: true }
        }
      }
    });

    const projectMap = new Map(projects.map(p => [p.id, p]));

    // Enrich media with project info
    const enrichedMedia = media.map(m => ({
      ...m,
      project: projectMap.get(m.projectId) || null
    }));

    // Count by type
    const typeStats = await prisma.projectMedia.groupBy({
      by: ['type'],
      where: { status: 'active' },
      _count: true
    });

    return NextResponse.json({
      success: true,
      data: enrichedMedia,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + media.length < total,
        stats: {
          total: await prisma.projectMedia.count({ where: { status: 'active' } }),
          byType: typeStats.reduce((acc, s) => {
            acc[s.type] = s._count;
            return acc;
          }, {} as Record<string, number>)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
