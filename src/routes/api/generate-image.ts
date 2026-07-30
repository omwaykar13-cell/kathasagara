import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt } = (await request.json()) as { prompt?: string };
        if (!prompt || prompt.trim().length < 3) {
          return new Response("Missing prompt", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai/gpt-image-2",
            prompt: `Traditional Indian mythological art illustration, in the style of a richly detailed Pahari/Tanjore painting with gold leaf accents, saffron, vermilion and deep indigo palette, ornate borders, devotional and epic mood. Scene: ${prompt}`,
            quality: "low",
            size: "1024x1024",
            n: 1,
            stream: true,
            partial_images: 1,
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          console.error("Image gateway error", upstream.status, detail);
          if (upstream.status === 429) {
            return new Response("Too many requests — please wait a moment and try again.", {
              status: 429,
            });
          }
          if (upstream.status === 402) {
            return new Response("AI credits exhausted. Please add credits to your workspace.", {
              status: 402,
            });
          }
          return new Response("The painter is resting. Please try again shortly.", { status: 502 });
        }


        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});
