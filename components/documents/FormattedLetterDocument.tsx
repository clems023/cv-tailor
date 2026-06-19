import type { StructuredLetter } from "@/lib/document-types";

import { DocumentShell } from "./DocumentShell";

interface FormattedLetterDocumentProps {
  letter: StructuredLetter;
}

export function FormattedLetterDocument({ letter }: FormattedLetterDocumentProps) {
  return (
    <DocumentShell variant="letter">
      <header className="space-y-1 text-[10.5pt] text-neutral-800">
        <p className="font-semibold">{letter.senderName}</p>
        {letter.senderContact?.map((line) => (
          <p key={line} className="text-neutral-600">
            {line}
          </p>
        ))}
      </header>

      <p className="mt-8 text-[10.5pt] text-neutral-700">{letter.date}</p>

      <div className="mt-8 whitespace-pre-line text-[10.5pt] text-neutral-800">
        {letter.recipient}
      </div>

      <p className="mt-8 text-[10.5pt]">
        <span className="font-semibold">Objet : </span>
        {letter.subject}
      </p>

      <p className="mt-8 text-[10.5pt] text-neutral-800">{letter.salutation}</p>

      <div className="mt-6 space-y-4 text-[10.5pt] leading-7 text-neutral-800">
        {letter.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-justify">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-8 text-[10.5pt] text-neutral-800">
        <p>{letter.closing}</p>
        <p className="mt-6 font-semibold">{letter.senderName}</p>
      </div>
    </DocumentShell>
  );
}
