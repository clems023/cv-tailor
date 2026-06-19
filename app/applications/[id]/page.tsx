import Link from "next/link";
import { notFound } from "next/navigation";

import { GeneratedOutput } from "@/components/GeneratedOutput";
import { buttonVariants } from "@/components/ui/button";
import { parseStoredDocuments } from "@/lib/document-types";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{application.jobTitle}</h1>
          <p className="text-muted-foreground">{application.company}</p>
        </div>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Retour
        </Link>
      </div>

      <GeneratedOutput result={parseStoredDocuments(application)} />
    </div>
  );
}
