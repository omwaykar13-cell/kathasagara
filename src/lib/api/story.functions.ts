import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  topic: z.string().min(2).max(200),
  lens: z.enum(["child", "scholar", "modern", "spiritual", "dramatic"]),
});

const LENS_PROMPTS: Record<string, string> = {
  child:
    "Retell this for a curious 8-year-old child. Use simple words, vivid imagery, gentle wonder, and short sentences. Make it feel like a bedtime story whispered by a grandmother.",
  scholar:
    "Retell this for a scholar of Indic studies. Use precise Sanskrit terms (with transliteration), cite the source text (Ramayana, Mahabharata, Puranas, Vedas) where the episode appears, and note philosophical and symbolic significance.",
  modern:
    "Retell this for a modern professional. Draw parallels to contemporary life — workplace dilemmas, relationships, ambition, ethics. Make the ancient lesson feel urgently relevant today.",
  spiritual:
    "Retell this as a spiritual seeker's lesson. Focus on dharma, karma, inner transformation, the nature of self, and the meditative truth hidden in the narrative.",
  dramatic:
    "Retell this as a cinematic, dramatic narrative — vivid scenes, dialogue, tension, sweeping descriptions of battlefields, palaces, forests. Make it feel like an epic film unfolding.",
};

export const generateStory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Vyasa, a master storyteller of Indian mythology — drawing from the Ramayana, Mahabharata, Bhagavata Purana, Shiva Purana, Vedas, and regional folklore. You tell stories that are historically grounded in the texts yet alive with feeling.

${LENS_PROMPTS[data.lens]}

Respond in JSON with this exact shape:
{
  "title": "evocative title of the story",
  "subtitle": "one-line essence",
  "source": "the text or tradition this comes from (e.g. 'Mahabharata, Vana Parva')",
  "sections": [
    { "heading": "section heading", "body": "2-4 paragraphs of rich narrative" }
  ],
  "moral": "the deeper teaching, in 2-3 sentences",
  "sanskrit_verse": { "verse": "a short relevant shloka in Devanagari (optional, empty string if none fits)", "translation": "english translation" }
}

Aim for 4-6 sections. Be authentic to the source tradition — do not invent characters or events. Only return valid JSON, no markdown fences.`;

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
          { role: "user", content: `Topic: ${data.topic}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 429) {
      throw new Error("Too many requests — please wait a moment and try again.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted. Please add credits to your Lovable workspace.");
    }
    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error", response.status, text);
      throw new Error("The storyteller is resting. Please try again shortly.");
    }

    const json = await response.json();
    const content: string = json.choices?.[0]?.message?.content ?? "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("The story arrived in an unreadable form. Please try again.");
    }
    return parsed as {
      title: string;
      subtitle: string;
      source: string;
      sections: { heading: string; body: string }[];
      moral: string;
      sanskrit_verse: { verse: string; translation: string };
    };
  });
