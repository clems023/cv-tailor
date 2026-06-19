"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { ApplicationHistory } from "@/components/ApplicationHistory";
import {
  GeneratedDocuments,
  GeneratedOutput,
} from "@/components/GeneratedOutput";
import { JobOfferInput } from "@/components/JobOfferInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ApplicationWorkspace() {
  const [jobOffer, setJobOffer] = useState("");
  const [originalCv, setOriginalCv] = useState("");
  const [originalLetter, setOriginalLetter] = useState("");
  const [result, setResult] = useState<GeneratedDocuments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobOffer,
          originalCv,
          originalLetter,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Erreur lors de la génération.");
      }

      setResult({
        cv: data.cv,
        letter: data.letter,
        email: data.email,
        company: data.company,
        jobTitle: data.jobTitle,
      });
      setHistoryRefreshKey((key) => key + 1);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  const canGenerate =
    jobOffer.trim().length > 0 && originalCv.trim().length > 0;

  return (
    <div className="mx-auto grid max-w-7xl flex-1 gap-6 p-6 lg:grid-cols-[320px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <ApplicationHistory key={historyRefreshKey} />
      </aside>

      <main className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5" />
              Nouvelle candidature
            </CardTitle>
            <CardDescription>
              PDF ou texte en entrée — documents Word structurés en sortie,
              sans inventer de compétences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <JobOfferInput
              jobOffer={jobOffer}
              originalCv={originalCv}
              originalLetter={originalLetter}
              onJobOfferChange={setJobOffer}
              onCvChange={setOriginalCv}
              onLetterChange={setOriginalLetter}
              disabled={loading}
            />

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              size="lg"
              disabled={!canGenerate || loading}
              onClick={handleGenerate}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Génération en cours…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Générer
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && <GeneratedOutput result={result} />}
      </main>
    </div>
  );
}
