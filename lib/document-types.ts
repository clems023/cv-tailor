export interface CvEntry {
  title?: string;
  subtitle?: string;
  bullets?: string[];
  content?: string;
}

export interface CvSection {
  title: string;
  entries: CvEntry[];
}

export interface StructuredCv {
  name: string;
  headline?: string;
  contact: string[];
  summary?: string;
  sections: CvSection[];
}

export interface StructuredLetter {
  senderName: string;
  senderContact?: string[];
  date: string;
  recipient: string;
  subject: string;
  salutation: string;
  paragraphs: string[];
  closing: string;
}

export interface StructuredEmail {
  subject: string;
  greeting: string;
  body: string;
  closing: string;
}

export interface StructuredDocuments {
  cv: StructuredCv;
  letter: StructuredLetter;
  email: StructuredEmail;
  company: string;
  jobTitle: string;
}

function isStructuredCv(value: unknown): value is StructuredCv {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "sections" in value
  );
}

function isStructuredLetter(value: unknown): value is StructuredLetter {
  return (
    typeof value === "object" &&
    value !== null &&
    "paragraphs" in value &&
    "salutation" in value
  );
}

function isStructuredEmail(value: unknown): value is StructuredEmail {
  return (
    typeof value === "object" &&
    value !== null &&
    "subject" in value &&
    "body" in value
  );
}

export function parseStoredCv(raw: string): StructuredCv | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isStructuredCv(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function parseStoredLetter(raw: string): StructuredLetter | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isStructuredLetter(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function parseStoredEmail(raw: string): StructuredEmail | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isStructuredEmail(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function cvToPlainText(cv: StructuredCv): string {
  const lines: string[] = [cv.name];
  if (cv.headline) lines.push(cv.headline);
  if (cv.contact.length) lines.push(cv.contact.join(" · "));
  lines.push("");

  if (cv.summary) {
    lines.push("PROFIL", cv.summary, "");
  }

  for (const section of cv.sections) {
    lines.push(section.title.toUpperCase());
    for (const entry of section.entries) {
      if (entry.title) lines.push(entry.title);
      if (entry.subtitle) lines.push(entry.subtitle);
      if (entry.content) lines.push(entry.content);
      entry.bullets?.forEach((bullet) => lines.push(`• ${bullet}`));
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

export function letterToPlainText(letter: StructuredLetter): string {
  const lines = [
    letter.senderName,
    ...(letter.senderContact ?? []),
    "",
    letter.date,
    "",
    letter.recipient,
    `Objet : ${letter.subject}`,
    "",
    letter.salutation,
    "",
    ...letter.paragraphs,
    "",
    letter.closing,
    letter.senderName,
  ];
  return lines.join("\n").trim();
}

export function emailToPlainText(email: StructuredEmail): string {
  return [
    `Objet : ${email.subject}`,
    "",
    email.greeting,
    "",
    email.body,
    "",
    email.closing,
  ]
    .join("\n")
    .trim();
}

function legacyCvFallback(text: string): StructuredCv {
  return {
    name: "CV adapté",
    contact: [],
    sections: [{ title: "Contenu", entries: [{ content: text }] }],
  };
}

function legacyLetterFallback(text: string): StructuredLetter {
  return {
    senderName: "",
    date: "",
    recipient: "",
    subject: "",
    salutation: "",
    paragraphs: text.split(/\n\n+/).filter(Boolean),
    closing: "",
  };
}

function legacyEmailFallback(text: string): StructuredEmail {
  const lines = text.split("\n").filter(Boolean);
  const subject = lines[0]?.replace(/^Objet\s*:\s*/i, "") ?? "Candidature";
  return {
    subject,
    greeting: lines[1] ?? "",
    body: lines.slice(2).join("\n"),
    closing: "",
  };
}

export function parseStoredDocuments(stored: {
  generatedCv: string;
  generatedLetter: string;
  generatedEmail: string;
  company: string;
  jobTitle: string;
}): StructuredDocuments {
  return {
    company: stored.company,
    jobTitle: stored.jobTitle,
    cv: parseStoredCv(stored.generatedCv) ?? legacyCvFallback(stored.generatedCv),
    letter:
      parseStoredLetter(stored.generatedLetter) ??
      legacyLetterFallback(stored.generatedLetter),
    email:
      parseStoredEmail(stored.generatedEmail) ??
      legacyEmailFallback(stored.generatedEmail),
  };
}
