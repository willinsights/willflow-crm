import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - List all media for a project
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;

    const media = await prisma.projectMedia.findMany({
      where: { projectId },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Error fetching project media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

// POST - Add new media to a project
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();

    const { type, title, url, description, thumbnail, duration, addedBy, addedByName } = body;

    if (!type || !title || !url) {
      return NextResponse.json(
        { success: false, error: 'Type, title and URL are required' },
        { status: 400 }
      );
    }

    // Get max order for this project
    const maxOrder = await prisma.projectMedia.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const newMedia = await prisma.projectMedia.create({
      data: {
        projectId,
        type,
        title,
        url,
        description: description || null,
        thumbnail: thumbnail || null,
        duration: duration || null,
        addedBy: addedBy || null,
        addedByName: addedByName || null,
        order: (maxOrder?.order ?? -1) + 1,
        status: 'active'
      }
    });

    // Log activity
    try {
      await prisma.projectActivity.create({
        data: {
          projectId,
          action: 'media_added',
          field: 'media',
          newValue: JSON.stringify({ type, title, url }),
          userId: addedBy || 'system',
          userName: addedByName || 'Sistema'
        }
      });
    } catch (e) {
      // Activity log is optional
    }

    return NextResponse.json({
      success: true,
      data: newMedia
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create media' },
      { status: 500 }
    );
  }
}

// PUT - Update media
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const body = await request.json();
    const { mediaId, ...updates } = body;

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: 'Media ID is required' },
        { status: 400 }
      );
    }

    const updatedMedia = await prisma.projectMedia.update({
      where: { id: mediaId },
      data: updates
    });

    return NextResponse.json({
      success: true,
      data: updatedMedia
    });
  } catch (error) {
    console.error('Error updating project media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

// DELETE - Remove media
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: 'Media ID is required' },
        { status: 400 }
      );
    }

    await prisma.projectMedia.delete({
      where: { id: mediaId }
    });

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
