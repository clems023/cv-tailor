import mammoth from "mammoth";

export type SupportedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const SUPPORTED_TYPES: SupportedMimeType[] = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function isSupportedFileType(mimeType: string): mimeType is SupportedMimeType {
  return SUPPORTED_TYPES.includes(mimeType as SupportedMimeType);
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: SupportedMimeType
): Promise<string> {
  if (mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text.trim();
  }

  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}
