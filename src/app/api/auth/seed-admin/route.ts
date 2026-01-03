import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';

// POST /api/auth/seed-admin - Create or update admin user
export async function POST(request: NextRequest) {
  try {
    const adminEmail = 'geral@in-sights.pt';
    const adminPassword = 'Insights26@';
    const hashedPassword = hashPassword(adminPassword);

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      // Update existing admin
      const updatedAdmin = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          isActive: true,
          mustChangePassword: false,
          role: 'admin',
          canViewFinance: true,
          canEditProjects: true,
          canViewAllProjects: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Admin atualizado com sucesso',
        data: updatedAdmin,
      });
    } else {
      // Create new admin
      const newAdmin = await prisma.user.create({
        data: {
          name: 'Admin IN-SIGHTS',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          mustChangePassword: false,
          canViewFinance: true,
          canEditProjects: true,
          canViewAllProjects: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Admin criado com sucesso',
        data: newAdmin,
      });
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar admin:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar/atualizar admin' },
      { status: 500 }
    );
  }
}

// GET - Also allows seeding via GET for easy browser access
export async function GET(request: NextRequest) {
  return POST(request);
}
