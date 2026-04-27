import { ArticleWriter } from "@/features/ai-tools/components/ArticleWriter";
import { BackgroundRemoval } from "@/features/ai-tools/components/BackgroundRemoval";
import { CodeGenerator } from "@/features/ai-tools/components/CodeGenerator";
import { ImageGeneration } from "@/features/ai-tools/components/ImageGeneration";
import { ObjectRemoval } from "@/features/ai-tools/components/ObjectRemoval";
import { ResumeReviewer } from "@/features/ai-tools/components/ResumeReviewer";
import { TextSummarizer } from "@/features/ai-tools/components/TextSummarizer";
import { TitleGenerator } from "@/features/ai-tools/components/TitleGenerator";
import { notFound } from "next/navigation";
import { VideoRepurposer } from "@/features/ai-tools/components/VideoRepurposer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { slug } = await params;

  switch (slug) {
    case "article-writer":
      return <ArticleWriter />;
    case "title-generator":
      return <TitleGenerator />;
    case "image-generation":
      return <ImageGeneration />;
    case "background-removal":
      return <BackgroundRemoval />;
    case "object-removal":
      return <ObjectRemoval />;
    case "video-repurposer":
      return <VideoRepurposer />;
    case "resume-reviewer":
      return <ResumeReviewer />;
    case "text-summarizer":
      return <TextSummarizer />;
    case "code-generator":
      return <CodeGenerator />;
    default:
      return notFound();
  }
}
