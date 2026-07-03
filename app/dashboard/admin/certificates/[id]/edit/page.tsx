import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import EditCertificateForm from "@/components/dashboard/EditCertificateForm";

interface Params {
  id: string;
}

export default async function AdminEditCertificatePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "TRAINER")) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { id: resolvedParams.id },
    include: {
      student: { include: { user: { select: { name: true } } } },
      course: { select: { title: true } },
    },
  });

  if (!certificate) {
    notFound();
  }

  return <EditCertificateForm certificate={certificate} />;
}
