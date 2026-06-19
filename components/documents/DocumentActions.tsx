"use client";

import { Check, Copy, FileDown, Loader2, Printer } from "lucide-react";
import { type RefObject, useState } from "react";

import { Button } from "@/components/ui/button";
import type {
  StructuredCv,
  StructuredEmail,
  StructuredLetter,
} from "@/lib/document-types";
import type { ExportDocumentType, ExportFormat } from "@/lib/export-utils";

interface DocumentActionsProps {
  plainText: string;
  printTitle: string;
  documentRef: RefObject<HTMLElement | null>;
  exportType: ExportDocumentType;
  exportDocument: StructuredCv | StructuredLetter | StructuredEmail;
  jobTitle: string;
  company: string;
}

const PRINT_FONTS: Record<string, string> = {
  cv: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  letter: 'Georgia, "Times New Roman", serif',
  email: 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

async function downloadExport(
  format: ExportFormat,
  exportType: ExportDocumentType,
  exportDocument: StructuredCv | StructuredLetter | StructuredEmail,
  jobTitle: string,
  company: string
) {
  const response = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: exportType,
      document: exportDocument,
      jobTitle,
      company,
      format,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? "Erreur lors du téléchargement.");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const utf8Match = disposition?.match(/filename\*=UTF-8''([^;]+)/i);
  const asciiMatch = disposition?.match(/filename="([^"]+)"/i);
  const filename = utf8Match
    ? decodeURIComponent(utf8Match[1])
    : (asciiMatch?.[1] ?? `document.${format}`);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function DocumentActions({
  plainText,
  printTitle,
  documentRef,
  exportType,
  exportDocument,
  jobTitle,
  company,
}: DocumentActionsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload(format: ExportFormat) {
    setDownloading(format);

    try {
      await downloadExport(
        format,
        exportType,
        exportDocument,
        jobTitle,
        company
      );
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Impossible de télécharger le fichier."
      );
    } finally {
      setDownloading(null);
    }
  }

  function handlePrint() {
    const article = documentRef.current?.querySelector("article");
    if (!article) return;

    const variant = article.dataset.documentVariant ?? "letter";
    const fontFamily = PRINT_FONTS[variant] ?? PRINT_FONTS.letter;

    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>${printTitle}</title>
          <style>
            @page { size: A4; margin: 18mm; }
            body {
              margin: 0;
              font-family: ${fontFamily};
              font-size: 11pt;
              line-height: 1.55;
              color: #171717;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h1 { font-size: 22pt; margin: 0; }
            h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 0.12em; }
            h3 { font-size: 10.5pt; }
            ul { padding-left: 1.25rem; }
            p { margin: 0 0 0.75rem; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>${article.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        size="sm"
        disabled={downloading !== null}
        onClick={() => handleDownload("docx")}
      >
        {downloading === "docx" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileDown className="size-4" />
        )}
        {downloading === "docx" ? "Génération…" : "Word (.docx)"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={downloading !== null}
        onClick={() => handleDownload("pdf")}
      >
        {downloading === "pdf" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileDown className="size-4" />
        )}
        {downloading === "pdf" ? "Génération…" : "PDF"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="size-4" />
        Imprimer
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copié" : "Copier le texte"}
      </Button>
    </div>
  );
}
