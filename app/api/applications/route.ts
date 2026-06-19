import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        company: true,
        jobTitle: true,
        createdAt: true,
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Erreur liste candidatures :", error);
    return NextResponse.json(
      { error: "Impossible de charger l'historique." },
      { status: 500 }
    );
  }
}
