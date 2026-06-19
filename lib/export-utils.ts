export type ExportDocumentType = "cv" | "letter" | "email";
export type ExportFormat = "docx" | "pdf";

const LABELS: Record<ExportDocumentType, string> = {
  cv: "CV",
  letter: "Lettre",
  email: "Email",
};

function sanitizeFilenamePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/[^\x20-\x7E]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .trim();
}

export function buildExportFilename(
  type: ExportDocumentType,
  jobTitle: string,
  company: string,
  format: ExportFormat
): string {
  const title = sanitizeFilenamePart(jobTitle) || "Candidature";
  const org = sanitizeFilenamePart(company) || "Entreprise";
  return `${LABELS[type]} - ${title} - ${org}.${format}`;
}

export function buildContentDisposition(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, "-");
  const encoded = encodeURIComponent(filename).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
