import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";

const SUPPORTED_SPECIALIZATIONS = [
  "cardiology",
  "dermatology",
  "neurology",
  "orthopedics",
  "gastroenterology",
  "psychiatry",
] as const;

const SPECIALIZATION_ALIASES: Record<
  string,
  (typeof SUPPORTED_SPECIALIZATIONS)[number]
> = {
  cardiologist: "cardiology",
  cardiac: "cardiology",
  skin: "dermatology",
  neurologist: "neurology",
  orthopedic: "orthopedics",
  orthopaedics: "orthopedics",
  orthopaedic: "orthopedics",
  gastro: "gastroenterology",
  gastroenterologist: "gastroenterology",
  psychiatrist: "psychiatry",
  mentalhealth: "psychiatry",
};

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface SymptomAnalysisResult {
  specialization: string | null;
  urgency: "low" | "medium" | "high";
  reason?: string;
}

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function toCanonicalSpecialization(value: string | null | undefined) {
  if (!value) return null;

  const cleaned = value.toLowerCase().trim();
  if ((SUPPORTED_SPECIALIZATIONS as readonly string[]).includes(cleaned)) {
    return cleaned;
  }

  const token = normalizeToken(cleaned);
  if (SPECIALIZATION_ALIASES[token]) {
    return SPECIALIZATION_ALIASES[token];
  }

  return null;
}

function extractJsonObject(rawText: string) {
  const trimmed = rawText.trim();

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export async function analyzeSymptoms(message: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const normalizedMessage = message?.trim();
  if (!normalizedMessage || normalizedMessage.length < 5) {
    throw new Error("Please provide a longer symptom description");
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
You are a medical triage assistant.

Your job is to determine which medical specialist the patient should see.

Return ONLY JSON.

Example format:
{
 "specialization": "cardiology",
 "urgency": "low",
 "reason": "brief explanation"
}

Available specializations:
cardiology
dermatology
neurology
orthopedics
gastroenterology
psychiatry

Rules:
- specialization must be one of the available specializations.
- urgency must be one of: low, medium, high.
- reason should be short and plain text.

Patient symptoms:
${normalizedMessage}
`,
          },
        ],
      },
    ],
  });

  const text =
    typeof response.text === "function" ? response.text : response.text;
  const parsed = JSON.parse(extractJsonObject(text || "{}"));

  const specialization = toCanonicalSpecialization(parsed?.specialization);
  const urgency: "low" | "medium" | "high" =
    parsed?.urgency === "high" || parsed?.urgency === "medium"
      ? parsed.urgency
      : "low";

  const result: SymptomAnalysisResult = {
    specialization,
    urgency,
    reason:
      typeof parsed?.reason === "string" ? parsed.reason.trim() : undefined,
  };

  return result;
}
