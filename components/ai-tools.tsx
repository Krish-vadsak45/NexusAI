import { Brain, Sparkles, Wand2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AITools() {
  const tools = [
    {
      icon: Brain,
      title: "AI Article Writer",
      description:
        "Generate high-quality, engaging articles on any topic with our AI writing technology.",
    },
    {
      icon: Sparkles,
      title: "Blog Title Generator",
      description:
        "Find the perfect, catchy title for your blog posts with our AI-powered generator.",
    },
    {
      icon: Wand2,
      title: "AI Image Generation",
      description:
        "Create stunning visuals with our AI image generation tool, Experience the power of AI.",
    },
    {
      icon: Zap,
      title: "Background Removal",
      description:
        "Effortlessly remove backgrounds from your images with our AI-driven tool.",
    },
    {
      icon: Zap,
      title: "Object Removal",
      description:
        "Remove unwanted objects from your images seamlessly with our AI object removal tool.",
    },
    {
      icon: Zap,
      title: "Resume Reviewer",
      description:
        "Get your resume reviewed by AI to improve your chances of landing your dream job.",
    },
  ];

  return (
    <section className="container mx-auto px-6 py-20 md:px-8 md:py-32 lg:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Powerful AI Tools
        </h2>
        <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
          Harness the power of artificial intelligence to supercharge your
          development workflow
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-8">
        {tools.map((tool, index) => (
          <Card
            key={index}
            className="group relative overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <CardContent className="relative p-6 lg:p-8">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <tool.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight">
                {tool.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
