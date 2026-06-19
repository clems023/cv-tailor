import { GoogleGenerativeAI } from "@google/generative-ai";

import type { StructuredDocuments } from "@/lib/document-types";

export interface GenerationInput {
  jobOffer: string;
  originalCv: string;
  originalLetter?: string;
}

export type GenerationResult = StructuredDocuments;

const SYSTEM_PROMPT = `Tu es un assistant expert en recrutement et rédaction de candidatures.

Ta mission : adapter un CV, une lettre de motivation et rédiger un email d'accompagnement pour une offre d'emploi donnée.

RÈGLES STRICTES :
1. Extrais les mots-clés de l'offre (compétences, missions, valeurs).
2. Réorganise les expériences du CV par pertinence pour le poste.
3. Reformule les bullet points avec le vocabulaire de l'offre.
4. Rédige une lettre personnalisée (entreprise, poste, motivations).
5. Rédige un email court et professionnel.
6. NE JAMAIS inventer de compétences, expériences, diplômes ou réalisations absentes du CV original.
7. Si une compétence demandée n'est pas dans le CV, ne la mentionne pas ou indique indirectement une compétence transférable déjà présente.
8. Conserve la structure logique du CV original (sections, rubriques) en l'adaptant au poste.
9. Si aucune lettre originale n'est fournie, rédige une lettre complète à partir du CV et de l'offre.
10. Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni texte autour.

Format JSON attendu :
{
  "company": "Nom de l'entreprise",
  "jobTitle": "Intitulé du poste",
  "cv": {
    "name": "Prénom Nom",
    "headline": "Titre professionnel adapté au poste",
    "contact": ["email@exemple.com", "+33 6 00 00 00 00", "Paris"],
    "summary": "Résumé professionnel en 2-3 phrases",
    "sections": [
      {
        "title": "Expérience professionnelle",
        "entries": [
          {
            "title": "Intitulé du poste — Entreprise",
            "subtitle": "Jan 2022 – Présent · Ville",
            "bullets": ["Réalisation reformulée", "Autre point clé"]
          }
        ]
      }
    ]
  },
  "letter": {
    "senderName": "Prénom Nom",
    "senderContact": ["email@exemple.com", "téléphone"],
    "date": "19 juin 2026",
    "recipient": "Madame, Monsieur,\\nService Recrutement\\nNom Entreprise",
    "subject": "Candidature au poste de ...",
    "salutation": "Madame, Monsieur,",
    "paragraphs": ["Paragraphe 1...", "Paragraphe 2...", "Paragraphe 3..."],
    "closing": "Cordialement,"
  },
  "email": {
    "subject": "Candidature — Poste chez Entreprise",
    "greeting": "Bonjour,",
    "body": "Corps de l'email en 3-5 phrases maximum.",
    "closing": "Cordialement,\\nPrénom Nom"
  }
}`;

function buildUserPrompt(input: GenerationInput): string {
  const letterSection = input.originalLetter?.trim()
    ? `LETTRE DE MOTIVATION ORIGINALE :\n${input.originalLetter.trim()}`
    : "LETTRE DE MOTIVATION ORIGINALE : (non fournie — rédige une lettre complète à partir du CV et de l'offre)";

  return `OFFRE D'EMPLOI :
${input.jobOffer}

CV ORIGINAL :
${input.originalCv}

${letterSection}

Génère le JSON structuré avec company, jobTitle, cv, letter et email.`;
}

function parseJsonResponse(text: string): GenerationResult {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as Partial<GenerationResult>;

  if (
    !parsed.cv ||
    !parsed.letter ||
    !parsed.email ||
    !parsed.company ||
    !parsed.jobTitle
  ) {
    throw new Error("Réponse Gemini incomplète : champs JSON manquants.");
  }

  return {
    cv: parsed.cv,
    letter: parsed.letter,
    email: parsed.email,
    company: parsed.company,
    jobTitle: parsed.jobTitle,
  };
}

export async function generateApplication(
  input: GenerationInput
): Promise<GenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Clé API Gemini manquante. Ajoutez GEMINI_API_KEY dans .env.local"
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(input)}` }],
      },
    ],
  });

  const text = result.response.text();
  if (!text) {
    throw new Error("Gemini n'a retourné aucune réponse.");
  }

  return parseJsonResponse(text);
}
