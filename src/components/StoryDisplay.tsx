import { useEffect, useState, useCallback } from "react";
import { streamImage } from "@/lib/streamImage";

type Section = { heading: string; body: string; image_prompt?: string };

type Story = {
  title: string;
  subtitle: string;
  source: string;
  sections: Section[];
  moral: string;
  sanskrit_verse: { verse: string; translation: string };
};

export function StoryDisplay({ story }: { story: Story }) {
  // Generate scene illustrations one at a time, in narrative order.
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);

  return (
    <article className="bg-parchment border-ornate rounded-lg p-8 md:p-14 animate-float-up">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-3">{story.source}</p>
        <h2 className="text-4xl md:text-6xl font-display text-gradient-divine mb-4 leading-tight">
          {story.title}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground italic font-serif">{story.subtitle}</p>
        <div className="flex justify-center mt-6">
          <Divider />
        </div>
      </div>

      <div className="space-y-10 max-w-3xl mx-auto">
        {story.sections.map((s, i) => (
          <section key={i}>
            <h3 className="text-2xl md:text-3xl font-display text-primary mb-3 flex items-baseline gap-3">
              <span className="text-accent text-sm">❖</span>
              {s.heading}
            </h3>
            {s.body.split(/\n+/).map((p, j) => (
              <p key={j} className="text-foreground/90 leading-relaxed text-lg font-serif mb-4">
                {p}
              </p>
            ))}
            {s.image_prompt && (
              <SceneImage
                prompt={s.image_prompt}
                caption={s.heading}
                turn={i <= activeIndex}
                onSettled={() => setActiveIndex((prev) => (prev === i ? i + 1 : prev))}
                onOpen={(src) => setLightbox({ src, caption: s.heading })}
              />
            )}
          </section>
        ))}
      </div>

      {story.sanskrit_verse?.verse && (
        <div className="my-12 max-w-3xl mx-auto text-center border-y border-primary/20 py-8">
          <p className="font-deva text-2xl md:text-3xl text-primary leading-relaxed mb-4 whitespace-pre-line">
            {story.sanskrit_verse.verse}
          </p>
          <p className="text-muted-foreground italic font-serif">
            — {story.sanskrit_verse.translation}
          </p>
        </div>
      )}

      <div className="mt-10 max-w-3xl mx-auto bg-secondary/40 border border-primary/20 rounded-lg p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-2">The Teaching</p>
        <p className="text-foreground/90 leading-relaxed font-serif text-lg">{story.moral}</p>
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-label={lightbox.caption}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out"
        >
          <figure className="max-w-3xl w-full">
            <img
              src={lightbox.src}
              alt={lightbox.caption}
              className="w-full rounded-lg border-ornate"
            />
            <figcaption className="mt-3 text-center font-serif italic text-muted-foreground">
              {lightbox.caption} — tap anywhere to close
            </figcaption>
          </figure>
        </div>
      )}
    </article>
  );
}

function SceneImage({
  prompt,
  caption,
  turn,
  onSettled,
  onOpen,
}: {
  prompt: string;
  caption: string;
  turn: boolean;
  onSettled: () => void;
  onOpen: (src: string) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsFinal(false);
    try {
      await streamImage("/api/generate-image", prompt, (dataUrl, final) => {
        setSrc(dataUrl);
        if (final) setIsFinal(true);
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      onSettled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  useEffect(() => {
    if (!turn) return;
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, nonce]);

  return (
    <figure className="my-8">
      <div className="relative overflow-hidden rounded-lg border-ornate bg-secondary/30 aspect-square max-w-lg mx-auto">
        {src ? (
          <button
            type="button"
            onClick={() => isFinal && onOpen(src)}
            className="block w-full h-full cursor-zoom-in"
            aria-label={`View illustration: ${caption}`}
          >
            <img
              src={src}
              alt={`Illustration of ${caption}`}
              className={`w-full h-full object-cover transition-[filter] duration-700 ${
                isFinal ? "blur-0" : "blur-2xl scale-105"
              }`}
            />
          </button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
            {error ? (
              <>
                <p className="font-serif italic text-muted-foreground text-sm">{error}</p>
                <button
                  type="button"
                  onClick={() => setNonce((n) => n + 1)}
                  className="text-xs uppercase tracking-[0.2em] text-primary border border-primary/40 rounded-full px-4 py-2 hover:bg-primary/10 transition"
                >
                  Paint again
                </button>
              </>
            ) : (
              <>
                <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="font-serif italic text-muted-foreground text-sm">
                  {loading ? "The scene is being painted…" : "Awaiting the painter's brush…"}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <figcaption className="mt-3 flex items-center justify-center gap-3 text-center">
        <span className="font-serif italic text-sm text-muted-foreground">{caption}</span>
        {isFinal && (
          <button
            type="button"
            onClick={() => setNonce((n) => n + 1)}
            className="text-[10px] uppercase tracking-[0.2em] text-primary/80 border border-primary/30 rounded-full px-3 py-1 hover:bg-primary/10 transition"
          >
            ✦ Repaint
          </button>
        )}
      </figcaption>
    </figure>
  );
}

function Divider() {
  return (
    <svg width="120" height="14" viewBox="0 0 120 14" className="text-primary/60">
      <path
        d="M0 7 L45 7 M75 7 L120 7"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="60" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="60" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}
