"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/FileUpload";

interface JobOfferInputProps {
  jobOffer: string;
  originalCv: string;
  originalLetter: string;
  onJobOfferChange: (value: string) => void;
  onCvChange: (value: string) => void;
  onLetterChange: (value: string) => void;
  disabled?: boolean;
}

export function JobOfferInput({
  jobOffer,
  originalCv,
  originalLetter,
  onJobOfferChange,
  onCvChange,
  onLetterChange,
  disabled,
}: JobOfferInputProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="job-offer">Offre d&apos;emploi</Label>
        <Textarea
          id="job-offer"
          placeholder="Collez ici le texte de l'offre d'emploi…"
          value={jobOffer}
          onChange={(e) => onJobOfferChange(e.target.value)}
          disabled={disabled}
          rows={8}
        />
      </div>

      <div className="space-y-2">
        <FileUpload
          id="cv-upload"
          label="CV original"
          onTextExtracted={onCvChange}
          disabled={disabled}
        />
        <Textarea
          id="original-cv"
          placeholder="Collez ici votre CV ou importez un fichier…"
          value={originalCv}
          onChange={(e) => onCvChange(e.target.value)}
          disabled={disabled}
          rows={10}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="letter-upload">
          Lettre de motivation originale{" "}
          <span className="font-normal text-muted-foreground">(optionnelle)</span>
        </Label>
        <FileUpload
          id="letter-upload"
          label=""
          onTextExtracted={onLetterChange}
          disabled={disabled}
        />
        <Textarea
          id="original-letter"
          placeholder="Collez une lettre existante à adapter, ou laissez vide pour en générer une nouvelle…"
          value={originalLetter}
          onChange={(e) => onLetterChange(e.target.value)}
          disabled={disabled}
          rows={8}
        />
      </div>
    </div>
  );
}
