import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import EditTrainerForm from "@/components/dashboard/EditTrainerForm";

interface Params {
  id: string;
}

export default async function AdminEditTrainerPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const resolvedParams = await params;
  const trainer = await prisma.trainer.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (!trainer) {
    notFound();
  }

  return <EditTrainerForm trainer={trainer} />;
}
