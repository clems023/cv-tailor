import PDFDocument from "pdfkit";

import type {
  StructuredCv,
  StructuredEmail,
  StructuredLetter,
} from "@/lib/document-types";
import type { ExportDocumentType } from "@/lib/export-utils";

const PAGE_WIDTH = 595.28;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function createPdfBuffer(
  write: (doc: PDFKit.PDFDocument) => void
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    write(doc);
    doc.end();
  });
}

function writeSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.6);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#333333")
    .text(title.toUpperCase(), { width: CONTENT_WIDTH });
  const lineY = doc.y + 2;
  doc
    .strokeColor("#BFBFBF")
    .lineWidth(0.5)
    .moveTo(MARGIN, lineY)
    .lineTo(PAGE_WIDTH - MARGIN, lineY)
    .stroke();
  doc.moveDown(0.4);
}

function writeCvPdf(doc: PDFKit.PDFDocument, cv: StructuredCv) {
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#171717")
    .text(cv.name, { width: CONTENT_WIDTH });

  if (cv.headline) {
    doc.moveDown(0.2);
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#4D4D4D").text(cv.headline);
  }

  if (cv.contact.length > 0) {
    doc.moveDown(0.3);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#666666")
      .text(cv.contact.join("   ·   "), { width: CONTENT_WIDTH });
  }

  doc.moveDown(0.2);
  doc
    .strokeColor("#171717")
    .lineWidth(1)
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_WIDTH - MARGIN, doc.y)
    .stroke();
  doc.moveDown(0.5);

  if (cv.summary) {
    writeSectionTitle(doc, "Profil");
    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor("#404040")
      .text(cv.summary, { width: CONTENT_WIDTH, align: "justify" });
  }

  for (const section of cv.sections) {
    writeSectionTitle(doc, section.title);

    for (const entry of section.entries) {
      if (entry.title || entry.subtitle) {
        doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#171717");
        if (entry.title && entry.subtitle) {
          doc.text(entry.title, { continued: true, width: CONTENT_WIDTH });
          doc.font("Helvetica").fontSize(10).fillColor("#666666");
          doc.text(`   ${entry.subtitle}`, { width: CONTENT_WIDTH });
        } else if (entry.title) {
          doc.text(entry.title, { width: CONTENT_WIDTH });
        } else if (entry.subtitle) {
          doc.font("Helvetica").fontSize(10).fillColor("#666666");
          doc.text(entry.subtitle, { width: CONTENT_WIDTH });
        }
      }

      if (entry.content) {
        doc.moveDown(0.15);
        doc
          .font("Helvetica")
          .fontSize(10.5)
          .fillColor("#404040")
          .text(entry.content, { width: CONTENT_WIDTH, align: "justify" });
      }

      if (entry.bullets?.length) {
        doc.moveDown(0.1);
        doc.font("Helvetica").fontSize(10.5).fillColor("#404040").list(
          entry.bullets,
          MARGIN + 8,
          doc.y,
          { width: CONTENT_WIDTH - 16, bulletRadius: 2 }
        );
      }

      doc.moveDown(0.3);
    }
  }
}

function writeLetterPdf(doc: PDFKit.PDFDocument, letter: StructuredLetter) {
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#333333");
  doc.text(letter.senderName);

  for (const line of letter.senderContact ?? []) {
    doc.font("Helvetica").fontSize(10.5).fillColor("#666666").text(line);
  }

  doc.moveDown(1.2);
  doc.font("Helvetica").fontSize(10.5).fillColor("#333333").text(letter.date);
  doc.moveDown(1);

  for (const line of letter.recipient.split("\n")) {
    doc.text(line);
  }

  doc.moveDown(1);
  doc.font("Helvetica-Bold").text("Objet : ", { continued: true });
  doc.font("Helvetica").text(letter.subject);
  doc.moveDown(1);
  doc.text(letter.salutation);
  doc.moveDown(0.6);

  for (const paragraph of letter.paragraphs) {
    doc.text(paragraph, { width: CONTENT_WIDTH, align: "justify" });
    doc.moveDown(0.5);
  }

  doc.moveDown(0.4);
  doc.text(letter.closing);
  doc.moveDown(1);
  doc.font("Helvetica-Bold").text(letter.senderName);
}

function writeEmailPdf(doc: PDFKit.PDFDocument, email: StructuredEmail) {
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#333333");
  doc.text("Objet : ", { continued: true });
  doc.font("Helvetica").text(email.subject);
  doc.moveDown(0.8);
  doc.text(email.greeting);
  doc.moveDown(0.6);
  doc.text(email.body, { width: CONTENT_WIDTH, align: "justify" });
  doc.moveDown(0.6);
  doc.text(email.closing, { width: CONTENT_WIDTH });
}

export async function buildPdfBuffer(
  type: ExportDocumentType,
  document: StructuredCv | StructuredLetter | StructuredEmail
): Promise<Buffer> {
  return createPdfBuffer((doc) => {
    switch (type) {
      case "cv":
        writeCvPdf(doc, document as StructuredCv);
        break;
      case "letter":
        writeLetterPdf(doc, document as StructuredLetter);
        break;
      case "email":
        writeEmailPdf(doc, document as StructuredEmail);
        break;
    }
  });
}
