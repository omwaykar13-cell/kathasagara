import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { generateStory } from "@/lib/api/story.functions";
import { StoryDisplay } from "@/components/StoryDisplay";
import heroImage from "@/assets/hero-myth.jpg";
import { DictionaryButton } from "@/components/DictionaryDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kathāsāgara — Tales from the Ocean of Indian Myth" },
      {
        name: "description",
        content:
          "Summon any tale from the Ramayana, Mahabharata, and Puranas — retold for a child, a scholar, a seeker, or a modern soul.",
      },
      { property: "og:title", content: "Kathāsāgara — Tales from the Ocean of Indian Myth" },
      {
        property: "og:description",
        content: "AI-told stories of gods, sages, and demons — narrated in the lens of your choosing.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Tiro+Devanagari+Sanskrit&display=swap",
      },
    ],
  }),
  component: Index,
});

const LENSES = [
  { id: "child", label: "For a Child", hint: "Wonder & simplicity" },
  { id: "scholar", label: "For a Scholar", hint: "Sanskrit & sources" },
  { id: "modern", label: "For Today", hint: "Modern parallels" },
  { id: "spiritual", label: "For the Seeker", hint: "Dharma & inner truth" },
  { id: "dramatic", label: "As Cinema", hint: "Epic & vivid" },
] as const;

const SUGGESTIONS = [
  "Arjuna's doubt on the battlefield",
  "Why Ganesha has an elephant's head",
  "The churning of the ocean of milk",
  "Karna's tragic loyalty",
  "Shiva drinking the halahala poison",
  "Hanuman's leap to Lanka",
];

function Index() {
  const [topic, setTopic] = useState("");
  const [lens, setLens] = useState<(typeof LENSES)[number]["id"]>("dramatic");
  const fetchStory = useServerFn(generateStory);

  const mutation = useMutation({
    mutationFn: (vars: { topic: string; lens: typeof lens }) =>
      fetchStory({ data: vars }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    mutation.mutate({ topic: topic.trim(), lens });
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt=""
            width={1920}
            height={1080}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
          <p className="font-deva text-primary/80 text-lg mb-4">कथासागर</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display mb-6 leading-[1.05]">
            <span className="text-gradient-divine">Kathāsāgara</span>
          </h1>
          <p className="text-lg md:text-2xl text-foreground/85 font-serif italic max-w-2xl mx-auto leading-relaxed">
            The ocean of stories. Summon any tale from the Vedas, the epics, and the
            Puranas — narrated in the voice you need to hear it in.
          </p>

          <form onSubmit={handleSubmit} className="mt-12 max-w-2xl mx-auto">
            <div className="bg-card/80 backdrop-blur-md border-ornate rounded-xl p-6 animate-glow">
              <label className="block text-xs uppercase tracking-[0.3em] text-primary/80 mb-3 text-left">
                Choose a topic, character, or moment
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why did Shiva dance the Tandava?"
                className="w-full bg-input/60 border border-border rounded-md px-4 py-3 text-lg font-serif text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/60"
              />

              <div className="mt-5 text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-3">
                  Through which lens?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {LENSES.map((l) => (
                    <button
                      type="button"
                      key={l.id}
                      onClick={() => setLens(l.id)}
                      className={`p-3 rounded-md border text-left transition-all ${
                        lens === l.id
                          ? "border-primary bg-primary/15 shadow-[0_0_20px_oklch(0.78_0.16_70/0.25)]"
                          : "border-border bg-secondary/30 hover:border-primary/50"
                      }`}
                    >
                      <div className="font-serif text-sm md:text-base text-foreground">
                        {l.label}
                      </div>
                      <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                        {l.hint}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending || !topic.trim()}
                className="mt-6 w-full bg-gradient-to-r from-saffron via-accent to-vermilion text-accent-foreground font-display text-lg tracking-wide py-4 rounded-md hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_40px_-10px_oklch(0.55_0.22_30/0.5)]"
              >
                {mutation.isPending ? "Vyasa is composing…" : "✦  Tell me the story  ✦"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="text-xs md:text-sm font-serif italic text-muted-foreground hover:text-primary border border-border/60 hover:border-primary/50 px-3 py-1.5 rounded-full transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-24">
        {mutation.isPending && (
          <div className="text-center py-16">
            <div className="inline-block w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-6" />
            <p className="font-serif italic text-muted-foreground text-lg">
              The conch is sounded. The story rises from the ocean…
            </p>
          </div>
        )}

        {mutation.isError && (
          <div className="border border-destructive/40 bg-destructive/10 rounded-lg p-6 text-center">
            <p className="font-serif text-foreground">
              {(mutation.error as Error)?.message ?? "Something went wrong."}
            </p>
          </div>
        )}

        {mutation.data && <StoryDisplay story={mutation.data} />}
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground font-serif">
        <p>
          ॥ सत्यमेव जयते ॥ &nbsp;·&nbsp; Stories drawn from the eternal traditions of Bhārata
        </p>
      </footer>

      <DictionaryButton />

    </main>
  );
}
