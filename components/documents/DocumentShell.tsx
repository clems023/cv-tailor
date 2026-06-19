import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DocumentShellProps {
  children: ReactNode;
  className?: string;
  variant?: "cv" | "letter" | "email";
}

export function DocumentShell({
  children,
  className,
  variant = "cv",
}: DocumentShellProps) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4 print:border-0 print:bg-white print:p-0">
      <article
        data-document-variant={variant}
        className={cn(
          "mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white px-10 py-12 text-[11pt] leading-relaxed text-neutral-900 shadow-sm print:min-h-0 print:max-w-none print:px-0 print:py-0 print:shadow-none",
          variant === "letter" && "font-serif",
          variant === "cv" && "font-sans",
          variant === "email" && "font-sans",
          className
        )}
      >
        {children}
      </article>
    </div>
  );
}
