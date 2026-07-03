import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admins only" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, backgroundImage, orientation, font } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Template name is required" } },
        { status: 400 }
      );
    }

    const org = await prisma.organization.findFirst({ select: { id: true } });

    const newTemplate = await prisma.certificateTemplate.create({
      data: {
        name,
        backgroundImage: backgroundImage || "https://res.cloudinary.com/demo/image/upload/v1620000000/certificate-bg.png",
        orientation: orientation || "landscape",
        font: font || "Inter",
        version: 1,
        active: true,
        status: "ACTIVE",
        organizationId: org?.id || null,
      },
    });

    // Log Audit Trail
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "CREATE",
        table: "CertificateTemplate",
        recordId: newTemplate.id,
        metadata: { templateName: name },
      },
    });

    return NextResponse.json({ success: true, data: { template: newTemplate } }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/templates] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create template" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admins only" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Template ID is required" } },
        { status: 400 }
      );
    }

    const template = await prisma.certificateTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Template not found" } },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete verification logs linked to certificates of this template
      await tx.verificationLog.deleteMany({
        where: { certificate: { templateId: id } },
      });
      // 2. Delete email logs linked to certificates of this template
      await tx.emailLog.deleteMany({
        where: { certificate: { templateId: id } },
      });
      // 3. Delete certificates linked to template
      await tx.certificate.deleteMany({
        where: { templateId: id },
      });
      // 4. Nullify template assignments on courses
      await tx.course.updateMany({
        where: { templateId: id },
        data: { templateId: null },
      });
      // 5. Delete template
      await tx.certificateTemplate.delete({
        where: { id },
      });
      // 6. Log admin action
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "DELETE",
          table: "CertificateTemplate",
          recordId: id as any,
          metadata: { templateName: template.name },
        },
      });
    });

    return NextResponse.json({ success: true, message: "Template deleted successfully" });
  } catch (error: any) {
    console.error("[DELETE /api/templates] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to delete template" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admins only" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, backgroundImage, orientation, font, active } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Template ID and name are required" } },
        { status: 400 }
      );
    }

    const updatedTemplate = await prisma.certificateTemplate.update({
      where: { id },
      data: {
        name,
        backgroundImage: backgroundImage || undefined,
        orientation: orientation || undefined,
        font: font || undefined,
        active: active !== undefined ? !!active : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "UPDATE",
        table: "CertificateTemplate",
        recordId: id,
        metadata: { templateName: name },
      },
    });

    return NextResponse.json({ success: true, data: { template: updatedTemplate } });
  } catch (error: any) {
    console.error("[PUT /api/templates] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update template" } },
      { status: 500 }
    );
  }
}


