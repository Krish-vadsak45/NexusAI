import { ArticleWriter } from "@/components/ArticleWriter";
import { BackgroundRemoval } from "@/components/BackgroundRemoval";
import { CodeGenerator } from "@/components/CodeGenerator";
import { ImageGeneration } from "@/components/ImageGeneration";
import { ObjectRemoval } from "@/components/ObjectRemoval";
import { ResumeReviewer } from "@/components/ResumeReviewer";
import { TextSummarizer } from "@/components/TextSummarizer";
import { TitleGenerator } from "@/components/TitleGenerator";
import { notFound } from "next/navigation";
import { VideoRepurposer } from "@/components/VideoRepurposer";

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
