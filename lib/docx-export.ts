import {
  AlignmentType,
  BorderStyle,
  Document,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
  Tab,
  TabStopPosition,
  TabStopType,
} from "docx";

import type {
  StructuredCv,
  StructuredEmail,
  StructuredLetter,
} from "@/lib/document-types";
import type { ExportDocumentType } from "@/lib/export-utils";

const BODY_SIZE = 21; // 10.5pt
const SMALL_SIZE = 20; // 10pt
const TITLE_SIZE = 44; // 22pt
const HEADLINE_SIZE = 24; // 12pt
const SECTION_SIZE = 22; // 11pt

const bulletNumbering = {
  reference: "cv-bullets",
  levels: [
    {
      level: 0,
      format: LevelFormat.BULLET,
      text: "•",
      alignment: AlignmentType.LEFT,
      style: {
        paragraph: {
          indent: { left: 720, hanging: 360 },
        },
      },
    },
  ],
};

function spacer(after = 120) {
  return new Paragraph({ spacing: { after } });
}

function sectionHeading(title: string) {
  return new Paragraph({
    border: {
      bottom: {
        color: "BFBFBF",
        space: 4,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    spacing: { before: 280, after: 140 },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: SECTION_SIZE,
        color: "333333",
      }),
    ],
  });
}

function bodyParagraph(text: string, options?: { bold?: boolean; after?: number }) {
  return new Paragraph({
    spacing: { after: options?.after ?? 120 },
    children: [
      new TextRun({
        text,
        bold: options?.bold,
        size: BODY_SIZE,
        color: "333333",
      }),
    ],
  });
}

function buildCvDocument(cv: StructuredCv): Document {
  const children: Paragraph[] = [
    new Paragraph({
      spacing: { after: 80 },
      border: {
        bottom: {
          color: "171717",
          space: 6,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
      children: [
        new TextRun({
          text: cv.name,
          bold: true,
          size: TITLE_SIZE,
          color: "171717",
        }),
      ],
    }),
  ];

  if (cv.headline) {
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: cv.headline,
            bold: true,
            size: HEADLINE_SIZE,
            color: "4D4D4D",
          }),
        ],
      })
    );
  }

  if (cv.contact.length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: cv.contact.join("   ·   "),
            size: SMALL_SIZE,
            color: "666666",
          }),
        ],
      })
    );
  }

  if (cv.summary) {
    children.push(sectionHeading("Profil"));
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: cv.summary,
            size: BODY_SIZE,
            color: "404040",
          }),
        ],
      })
    );
  }

  for (const section of cv.sections) {
    children.push(sectionHeading(section.title));

    for (const entry of section.entries) {
      if (entry.title || entry.subtitle) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 60 },
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TabStopPosition.MAX,
              },
            ],
            children: [
              ...(entry.title
                ? [
                    new TextRun({
                      text: entry.title,
                      bold: true,
                      size: BODY_SIZE,
                      color: "171717",
                    }),
                  ]
                : []),
              ...(entry.title && entry.subtitle
                ? [new TextRun({ children: [new Tab()] })]
                : []),
              ...(entry.subtitle
                ? [
                    new TextRun({
                      text: entry.subtitle,
                      size: SMALL_SIZE,
                      color: "666666",
                      italics: !entry.title,
                    }),
                  ]
                : []),
            ],
          })
        );
      }

      if (entry.content) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: entry.content,
                size: BODY_SIZE,
                color: "404040",
              }),
            ],
          })
        );
      }

      if (entry.bullets) {
        for (const bullet of entry.bullets) {
          children.push(
            new Paragraph({
              numbering: { reference: "cv-bullets", level: 0 },
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: bullet,
                  size: BODY_SIZE,
                  color: "404040",
                }),
              ],
            })
          );
        }
      }

      children.push(spacer(80));
    }
  }

  return new Document({
    numbering: { config: [bulletNumbering] },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080,
              right: 1080,
              bottom: 1080,
              left: 1080,
            },
          },
        },
        children,
      },
    ],
  });
}

function buildLetterDocument(letter: StructuredLetter): Document {
  const children: Paragraph[] = [
    bodyParagraph(letter.senderName, { bold: true, after: 40 }),
  ];

  for (const line of letter.senderContact ?? []) {
    children.push(bodyParagraph(line, { after: 40 }));
  }

  children.push(spacer(240));
  children.push(bodyParagraph(letter.date, { after: 240 }));

  for (const line of letter.recipient.split("\n")) {
    children.push(bodyParagraph(line, { after: 60 }));
  }

  children.push(spacer(200));
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "Objet : ", bold: true, size: BODY_SIZE }),
        new TextRun({ text: letter.subject, size: BODY_SIZE }),
      ],
    })
  );

  children.push(bodyParagraph(letter.salutation, { after: 200 }));

  for (const paragraph of letter.paragraphs) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: paragraph,
            size: BODY_SIZE,
            color: "333333",
          }),
        ],
      })
    );
  }

  children.push(spacer(120));
  children.push(bodyParagraph(letter.closing, { after: 240 }));
  children.push(bodyParagraph(letter.senderName, { bold: true }));

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });
}

function buildEmailDocument(email: StructuredEmail): Document {
  const children: Paragraph[] = [
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "Objet : ", bold: true, size: BODY_SIZE }),
        new TextRun({ text: email.subject, size: BODY_SIZE }),
      ],
    }),
    bodyParagraph(email.greeting, { after: 200 }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: email.body,
          size: BODY_SIZE,
          color: "333333",
        }),
      ],
    }),
  ];

  for (const line of email.closing.split("\n")) {
    children.push(bodyParagraph(line, { after: 80 }));
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });
}

export function buildDocxDocument(
  type: ExportDocumentType,
  document: StructuredCv | StructuredLetter | StructuredEmail
): Document {
  switch (type) {
    case "cv":
      return buildCvDocument(document as StructuredCv);
    case "letter":
      return buildLetterDocument(document as StructuredLetter);
    case "email":
      return buildEmailDocument(document as StructuredEmail);
  }
}

export async function buildDocxBuffer(
  type: ExportDocumentType,
  document: StructuredCv | StructuredLetter | StructuredEmail
): Promise<Buffer> {
  const doc = buildDocxDocument(type, document);
  return Packer.toBuffer(doc);
}
