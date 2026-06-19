import { NextRequest, NextResponse } from "next/server";

import {
  extractTextFromBuffer,
  isSupportedFileType,
} from "@/lib/parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier fourni." },
        { status: 400 }
      );
    }

    if (!isSupportedFileType(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez un fichier PDF ou DOCX." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromBuffer(buffer, file.type);

    if (!text) {
      return NextResponse.json(
        { error: "Impossible d'extraire du texte du fichier." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Erreur parsing :", error);
    return NextResponse.json(
      { error: "Erreur lors de l'extraction du texte." },
      { status: 500 }
    );
  }
}
