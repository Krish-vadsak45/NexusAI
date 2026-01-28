"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Sparkles,
  Zap,
  // Loader2 replaced by InlineLoader
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Share2,
  PenTool,
  ArrowRight,
  Lock,
  Copy,
  User,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  Calendar,
  Clock,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { InlineLoader } from "@/components/InlineLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface CampaignState {
  title: string | null;
  article: string | null;
  imageUrl: string | null;
  socialPost: string | null;
  twitterThread: string[] | null;
}

export default function NexusStudioPage() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Titles, 2: Article, 3: Image, 4: Social, 5: Done
  const [campaign, setCampaign] = useState<CampaignState>({
    title: null,
    article: null,
    imageUrl: null,
    socialPost: null,
    twitterThread: null,
  });

  const [selectedOptions, setSelectedOptions] = useState({
    title: true,
    article: false,
    image: false,
    social: false,
    twitter: false,
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data } = await axios.get("/api/profile");
        const planId = data.user?.subscription?.planId;
        // Verify access (allow 'pro' and 'premium')
        if (planId && ["pro", "premium"].includes(planId)) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Failed to check subscription:", error);
        setHasAccess(false);
      }
    };
    checkAccess();
  }, []);

  if (hasAccess === null) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center text-white">
        <InlineLoader className="h-8 w-8" />
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-black/95 text-white p-6 md:p-12 font-sans flex items-center justify-center">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-zinc-900 border border-zinc-800">
            <Lock className="h-10 w-10 text-amber-500" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-500 to-amber-600">
              Nexus Studio Pro
            </h1>
            <p className="text-gray-400 text-lg">
              The All-in-One Creation Engine is exclusively available to Pro &
              Premium plan subscribers. Upgrade your workspace to unlock massive
              content scaling.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left p-6 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
              <span>Unlimited Campaigns</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
              <span>AI Image Generation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
              <span>Viral Headlines</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
              <span>Full Blog Articles</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              asChild
              className="bg-amber-600 hover:bg-amber-500 text-white px-8"
            >
              <Link href="/#pricing">Upgrade Plan</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800 text-white"
            >
              <Link href="/dashboard">Go Back</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: "title", label: "Ideating Headlines", icon: PenTool },
    { id: "article", label: "Drafting Content", icon: FileText },
    { id: "image", label: "Designing Visuals", icon: ImageIcon },
    { id: "social", label: "Crafting Socials", icon: Share2 },
    { id: "twitter", label: "Thread Weaver", icon: Twitter },
  ];

  const toggleOption = (key: keyof typeof selectedOptions) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    if (!Object.values(selectedOptions).some(Boolean)) {
      toast.error("Please select at least one option to generate");
      return;
    }

    setIsGenerating(true);
    setCampaign({
      title: null,
      article: null,
      imageUrl: null,
      socialPost: null,
      twitterThread: null,
    });

    try {
      let currentTitle = topic;

      // Step 1: Generate Title
      if (selectedOptions.title) {
        setCurrentStep(1);
        const titleRes = await axios.post("/api/ai/TitleGenerator", {
          topic: topic,
          keywords: "",
        });

        const firstItem = titleRes.data.titles[0];
        const rawTitle =
          typeof firstItem === "string" ? firstItem : firstItem?.title;
        const generatedTitle =
          rawTitle?.replace(/^\d+\.\s*/, "").replace(/"/g, "") || topic;

        currentTitle = generatedTitle;
        setCampaign((prev) => ({ ...prev, title: generatedTitle }));
      } else {
        setCampaign((prev) => ({ ...prev, title: topic }));
      }

      // Step 2: Generate Article
      if (selectedOptions.article) {
        setCurrentStep(2);
        const articleRes = await axios.post("/api/ai/ArticleWriter", {
          topic: currentTitle,
          keywords: topic,
          tone: "Professional",
          length: "Medium",
          language: "English",
        });

        // Debugging: log the full response
        console.log("Article Response:", articleRes.data);

        // Handle the nested structure { context: { article: "..." } }
        const articleContent =
          articleRes.data.content?.article ||
          articleRes.data.article ||
          "Failed to generate article content.";
        setCampaign((prev) => ({ ...prev, article: articleContent }));
      }

      // Step 3: Generate Image
      if (selectedOptions.image) {
        setCurrentStep(3);
        const imageRes = await axios.post("/api/ai/ImageGeneration", {
          prompt: `Editorial illustration for an article titled "${currentTitle}", ${topic}, modern, minimalist, high quality, 4k`,
          style: "Digital Art",
          size: "1024x1024",
        });
        const imgUrl =
          imageRes.data.url || imageRes.data.images?.[0] || imageRes.data[0];
        setCampaign((prev) => ({ ...prev, imageUrl: imgUrl }));
      }

      // Step 4: Generate Social Post
      if (selectedOptions.social) {
        setCurrentStep(4);
        const socialRes = await axios.post("/api/ai/ArticleWriter", {
          topic: `Write a viral LinkedIn post about: ${currentTitle}`,
          keywords: "viral, engaging",
          tone: "Enthusiastic",
          length: "Short",
          language: "English",
        });

        // Debugging: log the full response
        console.log("Social Response:", socialRes.data);

        // Handle the nested structure { context: { article: "..." } } -- Note: ArticleWriter returns 'article' field even for social prompt
        const socialContent =
          socialRes.data.content?.article ||
          socialRes.data.article ||
          "Failed to generate social content.";
        setCampaign((prev) => ({ ...prev, socialPost: socialContent }));
      }

      // Step 5: Generate Twitter Thread
      if (selectedOptions.twitter) {
        setCurrentStep(5);
        const twitterRes = await axios.post("/api/ai/ArticleWriter", {
          topic: `Write a viral Twitter thread (5-7 tweets) about: ${currentTitle}. Separate each tweet with '|||'. Do not number them manually.`,
          keywords: "thread, hook, value",
          tone: "Casual & Punchy",
          length: "Short",
          language: "English",
        });

        let threadRaw =
          twitterRes.data.content?.article || twitterRes.data.article || "";
        // Clean up formatting triggers
        threadRaw = threadRaw
          .replace(/Tweet \d+:/g, "")
          .replace(/\n\n/g, "|||");

        // Split by delimiter or double newlines (fallback)
        let threadArray = threadRaw
          .split("|||")
          .map((t: string) => t.trim())
          .filter((t: string) => t.length > 0);

        // Fallback if AI didn't use delimiter
        if (threadArray.length < 2) {
          threadArray = threadRaw
            .split("\n")
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 10);
        }

        setCampaign((prev) => ({ ...prev, twitterThread: threadArray }));
      }

      setCurrentStep(6); // Completion
      toast.success("Campaign generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong during generation. Please try again.");
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/95 text-white p-6 md:p-12 font-sans selection:bg-amber-500/30">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-500">
          <Zap className="h-4 w-4 fill-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Nexus Studio
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          The{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-600">
            All-in-One
          </span>{" "}
          Creation Engine
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl">
          Turn a single idea into a full-scale content campaign in seconds.
          Generates titles, articles, visuals, and social posts simultaneously.
        </p>
      </div>

      {/* Step Selection - New Feature */}
      <div className="max-w-3xl mx-auto mb-12 flex flex-wrap justify-center gap-4">
        {steps.map((step) => {
          const isSelected =
            selectedOptions[step.id as keyof typeof selectedOptions];
          return (
            <button
              key={step.id}
              onClick={() =>
                toggleOption(step.id as keyof typeof selectedOptions)
              }
              disabled={isGenerating}
              className={`
                        flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all
                        ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                            : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                        }
                    `}
            >
              <div
                className={`
                        w-4 h-4 rounded-full border flex items-center justify-center
                        ${
                          isSelected
                            ? "border-amber-500 bg-amber-500"
                            : "border-gray-600"
                        }
                    `}
              >
                {isSelected && <CheckCircle2 className="h-3 w-3 text-black" />}
              </div>
              {step.label}
            </button>
          );
        })}
      </div>

      {/* Input Section */}
      <div className="max-w-3xl mx-auto mb-20 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-20 transition duration-1000 group-hover:opacity-100"></div>
        <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-xl p-2 shadow-2xl">
          <div className="pl-4 pr-3 text-gray-500">
            <Sparkles className="h-6 w-6" />
          </div>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What do you want to create? e.g. 'The Future of Quantum Computing'"
            className="flex-1 border-none bg-transparent text-lg h-14 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isGenerating}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            size="lg"
            className="h-12 px-8 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-all"
          >
            {isGenerating ? (
              <>
                <InlineLoader className="mr-2 h-4 w-4" />
                Creating...
              </>
            ) : (
              <>
                Ignite Studio
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress View */}
      {isGenerating && (
        <div className="max-w-2xl mx-auto mb-20">
          <div className="grid grid-cols-4 gap-4">
            {steps.map((step, index) => {
              const isActive = currentStep === index + 1;
              const isCompleted = currentStep > index + 1;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div
                    className={`
                                h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                ${
                                  isActive
                                    ? "border-amber-500 bg-amber-500/20 text-amber-500 scale-110"
                                    : isCompleted
                                      ? "border-green-500 bg-green-500 text-white"
                                      : "border-white/10 bg-white/5 text-gray-600"
                                }
                            `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isActive ? (
                      <InlineLoader className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isActive || isCompleted ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Grid */}
      {campaign.title && (
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 1. Title & Social (Left Col) */}
            <div className="md:col-span-4 space-y-6">
              {/* Title Card */}
              <Card className="bg-zinc-900/50 border-white/10 overflow-hidden">
                <div className="p-1 bg-gradient-to-r from-amber-500/20 to-transparent"></div>
                <CardContent className="p-6">
                  <Badge
                    variant="outline"
                    className="mb-4 border-amber-500/30 text-amber-500"
                  >
                    Viral Headline
                  </Badge>
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
                    {campaign.title}
                  </h2>
                </CardContent>
              </Card>

              {/* Social Post */}
              {selectedOptions.social && (
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden h-full flex flex-col">
                  {/* LinkedIn-style Header */}
                  <div className="p-4 border-b border-zinc-800 flex items-start justify-between bg-zinc-900">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        AI
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Nexus Assistant
                        </div>
                        <div className="text-xs text-zinc-400">
                          Content Strategist • Just Now
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-white"
                      onClick={() =>
                        campaign.socialPost &&
                        copyToClipboard(campaign.socialPost)
                      }
                      disabled={!campaign.socialPost}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content Area */}
                  <CardContent className="p-4 flex-1 bg-zinc-900">
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                      {campaign.socialPost ? (
                        <ReactMarkdown>{campaign.socialPost}</ReactMarkdown>
                      ) : (
                        <div className="space-y-3 animate-pulse">
                          <div className="h-3 bg-zinc-800 rounded w-full" />
                          <div className="h-3 bg-zinc-800 rounded w-5/6" />
                          <div className="h-3 bg-zinc-800 rounded w-4/6" />
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Social Actions Footer */}
                  <div className="p-3 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-zinc-400 hover:text-blue-400 gap-2"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> Like
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-zinc-400 hover:text-blue-400 gap-2"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Comment
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-zinc-400 hover:text-blue-400 gap-2"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                  </div>
                </Card>
              )}

              {/* Twitter Thread - Stacked below LinkedIn */}
              {selectedOptions.twitter && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-blue-500/20 text-blue-400 bg-blue-500/10"
                    >
                      <Twitter className="h-3 w-3 mr-1" />
                      Viral Thread
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-zinc-400 hover:text-white"
                      onClick={() =>
                        campaign.twitterThread &&
                        copyToClipboard(campaign.twitterThread.join("\n\n"))
                      }
                      disabled={!campaign.twitterThread}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Thread
                    </Button>
                  </div>

                  <div className="relative pl-4 space-y-6">
                    {/* Connecting Line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent"></div>

                    {campaign.twitterThread
                      ? campaign.twitterThread.map((tweet, i) => (
                          <div key={i} className="relative flex gap-4 group">
                            <div className="relative z-10 shrink-0 h-10 w-10 rounded-full bg-black border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-colors">
                              {i + 1}
                            </div>
                            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 shadow-sm">
                              {tweet}
                            </div>
                          </div>
                        ))
                      : // Loading State for Thread
                        [1, 2, 3].map((_, i) => (
                          <div
                            key={i}
                            className="relative flex gap-4 animate-pulse"
                          >
                            <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800" />
                            <div className="flex-1 h-20 bg-zinc-900 border border-zinc-800 rounded-xl" />
                          </div>
                        ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Main Article (Center Col) */}
            <div className="md:col-span-8 space-y-6">
              {/* Image Banner */}
              {selectedOptions.image && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/10 group">
                  {campaign.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={campaign.imageUrl}
                      alt="Generated Cover"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                      <span className="text-gray-600 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Creating Digital Art...
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="backdrop-blur-md bg-black/50 text-white border border-white/10"
                    >
                      Download HD
                    </Button>
                  </div>
                </div>
              )}

              {/* Blog Content */}
              {selectedOptions.article && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden min-h-[500px]">
                  {/* Article Metadata Header */}
                  <div className="border-b border-zinc-800 bg-zinc-900/50 p-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>By Nexus AI</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>5 min read</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-zinc-700 hover:bg-zinc-800"
                      onClick={() =>
                        campaign.article && copyToClipboard(campaign.article)
                      }
                      disabled={!campaign.article}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Text
                    </Button>
                  </div>

                  {/* Article Content */}
                  <div className="p-8 md:p-12 bg-zinc-900">
                    <div className="prose prose-invert prose-lg max-w-none text-zinc-300 selection:bg-amber-500/20">
                      {campaign.article ? (
                        <ReactMarkdown>{campaign.article}</ReactMarkdown>
                      ) : (
                        <div className="space-y-6 animate-pulse mt-4">
                          <div className="h-4 bg-zinc-800 rounded w-full" />
                          <div className="h-4 bg-zinc-800 rounded w-11/12" />
                          <div className="h-4 bg-zinc-800 rounded w-full" />
                          <div className="h-32 bg-zinc-800/50 rounded w-full my-8" />
                          <div className="h-4 bg-zinc-800 rounded w-full" />
                          <div className="h-4 bg-zinc-800 rounded w-4/5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
