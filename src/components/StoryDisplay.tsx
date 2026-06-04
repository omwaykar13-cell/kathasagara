type Story = {
  title: string;
  subtitle: string;
  source: string;
  sections: { heading: string; body: string }[];
  moral: string;
  sanskrit_verse: { verse: string; translation: string };
};

export function StoryDisplay({ story }: { story: Story }) {
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
    </article>
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
