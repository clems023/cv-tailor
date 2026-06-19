"use client";

import { useRef } from "react";

import { DocumentActions } from "@/components/documents/DocumentActions";
import { FormattedCvDocument } from "@/components/documents/FormattedCvDocument";
import { FormattedEmailDocument } from "@/components/documents/FormattedEmailDocument";
import { FormattedLetterDocument } from "@/components/documents/FormattedLetterDocument";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  StructuredCv,
  StructuredDocuments,
  StructuredEmail,
  StructuredLetter,
} from "@/lib/document-types";
import {
  cvToPlainText,
  emailToPlainText,
  letterToPlainText,
} from "@/lib/document-types";
import type { ExportDocumentType } from "@/lib/export-utils";

export type GeneratedDocuments = StructuredDocuments;

interface GeneratedOutputProps {
  result: GeneratedDocuments;
}

function DocumentPanel({
  plainText,
  printTitle,
  exportType,
  exportDocument,
  jobTitle,
  company,
  children,
}: {
  plainText: string;
  printTitle: string;
  exportType: ExportDocumentType;
  exportDocument: StructuredCv | StructuredLetter | StructuredEmail;
  jobTitle: string;
  company: string;
  children: React.ReactNode;
}) {
  const documentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4">
      <DocumentActions
        plainText={plainText}
        printTitle={printTitle}
        documentRef={documentRef}
        exportType={exportType}
        exportDocument={exportDocument}
        jobTitle={jobTitle}
        company={company}
      />
      <div ref={documentRef}>{children}</div>
    </div>
  );
}

export function GeneratedOutput({ result }: GeneratedOutputProps) {
  const printBase = `${result.jobTitle} — ${result.company}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {result.jobTitle} — {result.company}
        </CardTitle>
        <CardDescription>
          Aperçu mis en forme — téléchargez en Word ou PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cv">
          <TabsList>
            <TabsTrigger value="cv">CV adapté</TabsTrigger>
            <TabsTrigger value="letter">Lettre</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          <TabsContent value="cv" className="mt-4">
            <DocumentPanel
              plainText={cvToPlainText(result.cv)}
              printTitle={`CV — ${printBase}`}
              exportType="cv"
              exportDocument={result.cv}
              jobTitle={result.jobTitle}
              company={result.company}
            >
              <FormattedCvDocument cv={result.cv} />
            </DocumentPanel>
          </TabsContent>
          <TabsContent value="letter" className="mt-4">
            <DocumentPanel
              plainText={letterToPlainText(result.letter)}
              printTitle={`Lettre — ${printBase}`}
              exportType="letter"
              exportDocument={result.letter}
              jobTitle={result.jobTitle}
              company={result.company}
            >
              <FormattedLetterDocument letter={result.letter} />
            </DocumentPanel>
          </TabsContent>
          <TabsContent value="email" className="mt-4">
            <DocumentPanel
              plainText={emailToPlainText(result.email)}
              printTitle={`Email — ${printBase}`}
              exportType="email"
              exportDocument={result.email}
              jobTitle={result.jobTitle}
              company={result.company}
            >
              <FormattedEmailDocument email={result.email} />
            </DocumentPanel>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
