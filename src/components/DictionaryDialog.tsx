import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { lookupWord } from "@/lib/api/dictionary.functions";
import { BookOpen, X } from "lucide-react";

export function DictionaryButton() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const fetchWord = useServerFn(lookupWord);

  const mutation = useMutation({
    mutationFn: (w: string) => fetchWord({ data: { word: w } }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = word.trim();
    if (w) mutation.mutate(w);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open trilingual dictionary"
        className="fixed bottom-4 left-4 z-50 group flex items-center gap-2 px-4 py-3 rounded-full bg-card border border-primary/40 shadow-[0_0_30px_-5px_oklch(0.6_0.18_45/0.5)] backdrop-blur-sm hover:border-primary transition"
      >
        <span className="absolute -inset-0.5 bg-gradient-to-r from-saffron via-gold to-vermilion rounded-full opacity-50 group-hover:opacity-80 blur-sm transition -z-10" />
        <BookOpen className="w-4 h-4 text-primary" />
        <span className="font-display text-sm tracking-wide text-foreground">शब्दकोश · Dictionary</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-float-up"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-parchment border-ornate rounded-xl p-6 md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/60 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <p className="font-deva text-primary/80 text-sm mb-1">शब्दकोश</p>
              <h2 className="text-3xl md:text-4xl font-display text-gradient-divine">Trilingual Dictionary</h2>
              <p className="text-sm text-muted-foreground italic font-serif mt-2">
                A word, three tongues — English · हिन्दी · मराठी
              </p>
            </div>

            <form onSubmit={submit} className="flex gap-2 mb-6">
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Enter a word (e.g. Dharma, माया, धर्म)"
                className="flex-1 bg-input/60 border border-border rounded-md px-4 py-3 font-serif text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <button
                type="submit"
                disabled={mutation.isPending || !word.trim()}
                className="px-5 py-3 rounded-md bg-gradient-to-r from-saffron via-accent to-vermilion text-accent-foreground font-display tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? "…" : "Look up"}
              </button>
            </form>

            {mutation.isError && (
              <p className="text-center font-serif text-destructive">
                {(mutation.error as Error)?.message}
              </p>
            )}

            {mutation.isPending && (
              <div className="text-center py-10">
                <div className="inline-block w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {mutation.data && (
              <div className="space-y-5">
                <div className="text-center border-b border-primary/20 pb-4">
                  <p className="font-display text-3xl text-primary">{mutation.data.word}</p>
                  {mutation.data.transliteration && (
                    <p className="text-sm italic text-muted-foreground mt-1">
                      {mutation.data.transliteration}
                    </p>
                  )}
                </div>

                {(["english", "hindi", "marathi"] as const).map((lang) => {
                  const entry = mutation.data![lang];
                  const labels = { english: "English", hindi: "हिन्दी (Hindi)", marathi: "मराठी (Marathi)" };
                  const isDeva = lang !== "english";
                  return (
                    <div key={lang} className="bg-secondary/40 border border-primary/15 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-primary/70 mb-2">
                        {labels[lang]}
                      </p>
                      <p className={`text-foreground/90 font-serif text-lg ${isDeva ? "font-deva" : ""}`}>
                        {entry.meaning}
                      </p>
                      {entry.example && (
                        <p className={`mt-2 text-sm italic text-muted-foreground ${isDeva ? "font-deva" : ""}`}>
                          “{entry.example}”
                        </p>
                      )}
                    </div>
                  );
                })}

                {mutation.data.mythological_note && (
                  <div className="border-y border-primary/20 py-4 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-2">Mythic Note</p>
                    <p className="font-serif italic text-foreground/85">
                      {mutation.data.mythological_note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
