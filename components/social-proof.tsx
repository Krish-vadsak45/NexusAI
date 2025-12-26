export function SocialProof() {
  const stats = [
    { value: "20 days", label: "saved on daily builds.", company: "NETFLIX" },
    { value: "98% faster", label: "time to market.", company: "TripAdvisor" },
    { value: "300% increase", label: "in SEO.", company: "box" },
    { value: "6x faster", label: "to build + deploy.", company: "ebay" },
  ];

  return (
    <section className="border-y border-border bg-secondary py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="space-y-1">
                <div className="text-2xl font-bold md:text-3xl">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
              <div className="mt-2 font-mono text-xs font-bold tracking-wider">
                {stat.company}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
