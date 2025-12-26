import { Zap, Users, Lock, BarChart } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Zap,
      title: "Faster iteration. More innovation.",
      description:
        "The platform for rapid progress. Let your team focus on shipping features instead of managing infrastructure with automated CI/CD, built-in testing, and integrated collaboration.",
    },
    {
      icon: Users,
      title: "Make teamwork seamless.",
      description:
        "Tools for your team and stakeholders to share feedback and iterate faster. Collaborate in real-time with powerful review tools and instant previews.",
    },
    {
      icon: Lock,
      title: "Enterprise-grade security.",
      description:
        "Built with security at its core. SOC 2 compliant with advanced DDoS protection, automatic SSL, and fine-grained access controls to keep your data safe.",
    },
    {
      icon: BarChart,
      title: "Insights that drive growth.",
      description:
        "Real-time analytics and performance monitoring. Understand your users, optimize your applications, and make data-driven decisions with comprehensive dashboards.",
    },
  ];

  return (
    <section className="container mx-auto px-6 py-20 md:px-8 md:py-32 lg:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Everything you need to ship faster
        </h2>
        <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
          A complete development platform with all the tools and services you
          need to build, deploy, and scale your applications.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:mt-20 lg:gap-10">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 lg:p-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight lg:text-2xl">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
