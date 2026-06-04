import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  word: z.string().min(1).max(80),
});

export const lookupWord = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a trilingual lexicographer specializing in words from Indian mythology, Sanskrit, and everyday usage. Given a word (in any of English, Hindi, Marathi, or transliterated Sanskrit), return its meaning in English, Hindi (Devanagari), and Marathi (Devanagari).

Respond ONLY in valid JSON, no markdown fences, with this exact shape:
{
  "word": "the word as the user wrote it",
  "transliteration": "IAST or simple roman transliteration if applicable, else empty string",
  "english": { "meaning": "concise definition", "example": "one short example sentence" },
  "hindi":   { "meaning": "अर्थ देवनागरी में",  "example": "एक छोटा उदाहरण वाक्य" },
  "marathi": { "meaning": "अर्थ देवनागरी में (मराठी)", "example": "एक लहान उदाहरण वाक्य" },
  "mythological_note": "if the word has mythological or scriptural significance, 1-2 sentences; else empty string"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Word: ${data.word}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 429) throw new Error("Too many requests — please wait a moment.");
    if (response.status === 402) throw new Error("AI credits exhausted.");
    if (!response.ok) {
      console.error("AI gateway error", response.status, await response.text());
      throw new Error("The dictionary is unavailable. Please try again shortly.");
    }

    const json = await response.json();
    const content: string = json.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(content) as {
        word: string;
        transliteration: string;
        english: { meaning: string; example: string };
        hindi: { meaning: string; example: string };
        marathi: { meaning: string; example: string };
        mythological_note: string;
      };
    } catch {
      throw new Error("The definition arrived unreadable. Please try again.");
    }
  });
