"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineLoader } from "./InlineLoader";
import {
  // Loader2 removed - using InlineLoader
  Copy,
  Wand2,
  FileText,
  Sparkles,
  Share2,
  Search,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { ProjectSelector } from "@/components/ProjectSelector";

// Define the structure of our AI response
interface GeneratedData {
  article: string;
  seo: {
    title: string;
    description: string;
    tags: string[];
  };
  social: {
    twitter: string;
    linkedin: string;
  };
  summary: string | string[];
}

const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  keywords: z.string().optional(),
  tone: z.enum(["professional", "casual", "enthusiastic", "witty"], {
    required_error: "Tone is required",
  }),
  length: z.enum(["short", "medium", "long"], {
    required_error: "Length is required",
  }),
  language: z.enum(["english", "spanish", "french", "german"], {
    required_error: "Language is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function ArticleWriter() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<GeneratedData | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "article" | "seo" | "social" | "summary"
  >("article");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      keywords: "",
      tone: "professional",
      length: "medium",
      language: "english",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!selectedProjectId || selectedProjectId === "none") {
      toast.error("Please select a project to continue");
      return;
    }
    setIsLoading(true);
    setData(null);

    try {
      const response = await axios.post("/api/ai/ArticleWriter", values);
      setData(response.data.content);

      // Save to history
      await axios.post("/api/history", {
        tool: "Article Writer",
        title: values.topic,
        input: values,
        output: response.data.content,
        projectId: selectedProjectId === "none" ? undefined : selectedProjectId,
      });

      toast.success("Content generated and saved!");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.error ||
          "Failed to generate content. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 h-full">
      {/* Left Sidebar - Controls */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="h-full border-muted-foreground/20 shadow-sm">
          <div className="p-4 space-y-2">
            <Label>Save to Project</Label>
            <ProjectSelector
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Content Studio
            </CardTitle>
            <CardDescription>
              Generate articles, SEO metadata, and social posts in one click.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              id="article-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="topic">Topic / Title</Label>
                <Input
                  id="topic"
                  placeholder="e.g., The Future of AI"
                  {...register("topic")}
                />
                {errors.topic && (
                  <p className="text-sm text-red-500">{errors.topic.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., AI, Tech, Future"
                  {...register("keywords")}
                />
                {errors.keywords && (
                  <p className="text-sm text-red-500">
                    {errors.keywords.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Controller
                    name="tone"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger id="tone">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">
                            Professional
                          </SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="enthusiastic">
                            Enthusiastic
                          </SelectItem>
                          <SelectItem value="witty">Witty</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.tone && (
                    <p className="text-sm text-red-500">
                      {errors.tone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <Controller
                    name="length"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger id="length">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.length && (
                    <p className="text-sm text-red-500">
                      {errors.length.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.language && (
                  <p className="text-sm text-red-500">
                    {errors.language.message}
                  </p>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all"
              type="submit"
              form="article-form"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <InlineLoader className="mr-2 h-4 w-4" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Full Package
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right Side - Results */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="h-full flex flex-col border-muted-foreground/20 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {activeTab === "article" && (
                  <FileText className="h-5 w-5 text-blue-500" />
                )}
                {activeTab === "seo" && (
                  <Search className="h-5 w-5 text-green-500" />
                )}
                {activeTab === "social" && (
                  <Share2 className="h-5 w-5 text-purple-500" />
                )}
                {activeTab === "summary" && (
                  <ListChecks className="h-5 w-5 text-orange-500" />
                )}
                Generated Results
              </CardTitle>

              {/* Custom Tabs */}
              <div className="flex p-1 bg-muted rounded-lg overflow-x-auto">
                <button
                  onClick={() => setActiveTab("article")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    activeTab === "article"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Article
                </button>
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    activeTab === "summary"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab("seo")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    activeTab === "seo"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  SEO Data
                </button>
                <button
                  onClick={() => setActiveTab("social")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === "social"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Social Media
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 min-h-[500px]">
            {data ? (
              <div className="h-full">
                {/* ARTICLE TAB */}
                {activeTab === "article" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(data.article, "Article")}
                      >
                        <Copy className="mr-2 h-4 w-4" /> Copy Article
                      </Button>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none p-6 rounded-lg bg-muted/30 border border-border">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-3xl font-bold mb-6 text-foreground"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-2xl font-semibold mb-4 mt-8 text-foreground border-b pb-2"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-xl font-semibold mb-3 mt-6 text-foreground"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              className="mb-4 leading-7 text-foreground/90"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc pl-6 mb-4 space-y-2"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="pl-1" {...props} />
                          ),
                        }}
                      >
                        {data.article}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* SUMMARY TAB */}
                {activeTab === "summary" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="p-6 rounded-lg border bg-card shadow-sm">
                      <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-full">
                            <ListChecks className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              Key Takeaways
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Quick summary of the main points
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              Array.isArray(data.summary)
                                ? data.summary.join("\n")
                                : data.summary,
                              "Summary",
                            )
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="text-base leading-relaxed space-y-2">
                          {(Array.isArray(data.summary)
                            ? data.summary
                            : (data.summary || "").split("\n")
                          ).map((line, i) => {
                            if (!line.trim()) return null;
                            return (
                              <div key={i} className="flex gap-3 items-start">
                                {Array.isArray(data.summary) ||
                                line.trim().startsWith("-") ||
                                line.trim().startsWith("•") ? (
                                  <>
                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                                    <span>{line.replace(/^[-•]\s*/, "")}</span>
                                  </>
                                ) : (
                                  <p>{line}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEO TAB */}
                {activeTab === "seo" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid gap-4">
                      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">Meta Title</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(data.seo.title, "Title")
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-blue-600 dark:text-blue-400 font-medium text-lg">
                          {data.seo.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {data.seo.title.length} characters
                        </p>
                      </div>

                      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">
                            Meta Description
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(
                                data.seo.description,
                                "Description",
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {data.seo.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {data.seo.description.length} characters
                        </p>
                      </div>

                      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">
                            Keywords & Tags
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(data.seo.tags.join(", "), "Tags")
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.seo.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SOCIAL TAB */}
                {activeTab === "social" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="p-4 rounded-lg border bg-card shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-black text-white p-1.5 rounded-full">
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 fill-current"
                            >
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </div>
                          <h3 className="font-semibold">Twitter Thread</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              data.social.twitter,
                              "Twitter thread",
                            )
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                        {data.social.twitter}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border bg-card shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#0077b5] text-white p-1.5 rounded-md">
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 fill-current"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          </div>
                          <h3 className="font-semibold">LinkedIn Post</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              data.social.linkedin,
                              "LinkedIn post",
                            )
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                        {data.social.linkedin}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground border-2 border-dashed rounded-lg border-muted bg-muted/10">
                <div className="p-6 rounded-full bg-muted/50 mb-6">
                  <Sparkles className="h-10 w-10 text-primary/50" />
                </div>
                <p className="text-xl font-semibold text-foreground/80">
                  Ready to Create
                </p>
                <p className="text-sm max-w-xs text-center mt-2">
                  Enter your topic and let our AI generate a complete content
                  package for you.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
