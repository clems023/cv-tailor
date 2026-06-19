import { NextRequest, NextResponse } from "next/server";

import { generateApplication } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobOffer, originalCv, originalLetter } = body;

    if (!jobOffer?.trim() || !originalCv?.trim()) {
      return NextResponse.json(
        { error: "L'offre et le CV sont obligatoires." },
        { status: 400 }
      );
    }

    const trimmedLetter = originalLetter?.trim() ?? "";

    const generated = await generateApplication({
      jobOffer: jobOffer.trim(),
      originalCv: originalCv.trim(),
      originalLetter: trimmedLetter || undefined,
    });

    const application = await prisma.application.create({
      data: {
        company: generated.company,
        jobTitle: generated.jobTitle,
        jobOffer: jobOffer.trim(),
        originalCv: originalCv.trim(),
        originalLetter: trimmedLetter,
        generatedCv: JSON.stringify(generated.cv),
        generatedLetter: JSON.stringify(generated.letter),
        generatedEmail: JSON.stringify(generated.email),
      },
    });

    return NextResponse.json({
      ...generated,
      id: application.id,
    });
  } catch (error) {
    console.error("Erreur génération :", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors de la génération des documents.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
