import type { StructuredCv } from "@/lib/document-types";

import { DocumentShell } from "./DocumentShell";

interface FormattedCvDocumentProps {
  cv: StructuredCv;
}

export function FormattedCvDocument({ cv }: FormattedCvDocumentProps) {
  return (
    <DocumentShell variant="cv">
      <header className="border-b-2 border-neutral-900 pb-4">
        <h1 className="text-[22pt] font-bold tracking-tight text-neutral-900">
          {cv.name}
        </h1>
        {cv.headline && (
          <p className="mt-1 text-[12pt] font-medium text-neutral-700">
            {cv.headline}
          </p>
        )}
        {cv.contact.length > 0 && (
          <p className="mt-3 text-[10pt] text-neutral-600">
            {cv.contact.join("  ·  ")}
          </p>
        )}
      </header>

      {cv.summary && (
        <section className="mt-6">
          <h2 className="mb-2 text-[11pt] font-bold uppercase tracking-[0.12em] text-neutral-800">
            Profil
          </h2>
          <p className="text-[10.5pt] leading-6 text-neutral-700">{cv.summary}</p>
        </section>
      )}

      {cv.sections.map((section) => (
        <section key={section.title} className="mt-6">
          <h2 className="mb-3 border-b border-neutral-300 pb-1 text-[11pt] font-bold uppercase tracking-[0.12em] text-neutral-800">
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.entries.map((entry, index) => (
              <div key={`${section.title}-${index}`}>
                {entry.title && (
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[10.5pt] font-semibold text-neutral-900">
                      {entry.title}
                    </h3>
                    {entry.subtitle && (
                      <span className="text-[10pt] text-neutral-600">
                        {entry.subtitle}
                      </span>
                    )}
                  </div>
                )}
                {!entry.title && entry.subtitle && (
                  <p className="text-[10pt] text-neutral-600">{entry.subtitle}</p>
                )}
                {entry.content && (
                  <p className="mt-1 text-[10.5pt] text-neutral-700">
                    {entry.content}
                  </p>
                )}
                {entry.bullets && entry.bullets.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[10.5pt] text-neutral-700">
                    {entry.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </DocumentShell>
  );
}
