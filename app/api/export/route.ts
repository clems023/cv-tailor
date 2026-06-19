import { NextRequest, NextResponse } from "next/server";

import type {
  StructuredCv,
  StructuredEmail,
  StructuredLetter,
} from "@/lib/document-types";
import { buildDocxBuffer } from "@/lib/docx-export";
import {
  buildContentDisposition,
  buildExportFilename,
  type ExportDocumentType,
  type ExportFormat,
} from "@/lib/export-utils";
import { buildPdfBuffer } from "@/lib/pdf-export";

function isExportType(value: unknown): value is ExportDocumentType {
  return value === "cv" || value === "letter" || value === "email";
}

function isExportFormat(value: unknown): value is ExportFormat {
  return value === "docx" || value === "pdf";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, document, jobTitle, company, format: rawFormat } = body;

    if (!isExportType(type) || !document || typeof document !== "object") {
      return NextResponse.json(
        { error: "Type de document ou contenu invalide." },
        { status: 400 }
      );
    }

    const format: ExportFormat =
      isExportFormat(rawFormat) ? rawFormat : "docx";

    const payload = document as
      | StructuredCv
      | StructuredLetter
      | StructuredEmail;

    const buffer =
      format === "pdf"
        ? await buildPdfBuffer(type, payload)
        : await buildDocxBuffer(type, payload);

    const filename = buildExportFilename(
      type,
      typeof jobTitle === "string" ? jobTitle : "Candidature",
      typeof company === "string" ? company : "Entreprise",
      format
    );

    const contentType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": buildContentDisposition(filename),
      },
    });
  } catch (error) {
    console.error("Erreur export document :", error);
    return NextResponse.json(
      { error: "Impossible de générer le document." },
      { status: 500 }
    );
  }
}
