import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id]/files - Lista arquivos do projeto
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const projectId = params.id;

    // Buscar arquivos do projeto (mock por enquanto)
    // Em produção, criar tabela ProjectFiles no schema.prisma
    const files: any[] = [];

    return NextResponse.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar arquivos' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/files - Upload de arquivo
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const projectId = params.id;

    // Obter formData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tamanho (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Arquivo muito grande (máx. 100MB)' },
        { status: 400 }
      );
    }

    // Em produção, fazer upload para S3/CloudStorage:
    // const buffer = Buffer.from(await file.arrayBuffer());
    // const uploadResult = await uploadToS3(buffer, file.name, file.type);

    // Em produção, salvar no banco:
    // const projectFile = await prisma.projectFile.create({
    //   data: {
    //     projectId,
    //     name: file.name,
    //     url: uploadResult.url,
    //     size: file.size,
    //     mimeType: file.type,
    //     category: getCategoryFromMimeType(file.type),
    //     description: description || '',
    //   }
    // });

    // Mock response por enquanto
    const projectFile = {
      id: `file-${Date.now()}`,
      projectId,
      name: file.name,
      url: `/uploads/${file.name}`, // Mock URL
      size: file.size,
      mimeType: file.type,
      category: getCategoryFromMimeType(file.type),
      description: description || '',
      uploadedAt: new Date().toISOString(),
    };

    console.log('✅ Arquivo uploaded (mock):', projectFile);

    return NextResponse.json({
      success: true,
      file: projectFile,
      message: `Arquivo "${file.name}" enviado com sucesso!`
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/files?fileId=xxx - Deletar arquivo
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'ID do arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Em produção, deletar do S3 e do banco:
    // await deleteFromS3(file.url);
    // await prisma.projectFile.delete({ where: { id: fileId } });

    console.log('✅ Arquivo deletado (mock):', fileId);

    return NextResponse.json({
      success: true,
      message: 'Arquivo deletado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar arquivo' },
      { status: 500 }
    );
  }
}

// Helper function
function getCategoryFromMimeType(mimeType: string): string {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
    return 'document';
  }
  return 'other';
}
