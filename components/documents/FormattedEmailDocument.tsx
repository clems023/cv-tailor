import type { StructuredEmail } from "@/lib/document-types";

import { DocumentShell } from "./DocumentShell";

interface FormattedEmailDocumentProps {
  email: StructuredEmail;
}

export function FormattedEmailDocument({ email }: FormattedEmailDocumentProps) {
  return (
    <DocumentShell variant="email">
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <div className="space-y-4 border-b border-neutral-200 pb-4">
          <div className="grid grid-cols-[72px_1fr] gap-2 text-[10pt]">
            <span className="font-semibold text-neutral-500">Objet</span>
            <span className="text-neutral-900">{email.subject}</span>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-[10.5pt] leading-7 text-neutral-800">
          <p>{email.greeting}</p>
          <p className="whitespace-pre-line">{email.body}</p>
          <p className="whitespace-pre-line">{email.closing}</p>
        </div>
      </div>
    </DocumentShell>
  );
}
