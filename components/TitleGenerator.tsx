"use client";

import { useState } from "react";
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
import { Copy, Loader2, Sparkles, Check, TrendingUp, Info } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Badge } from "@/components/ui/badge";

interface TitleData {
  title: string;
  score: number;
  tags: string[];
  reasoning: string;
}

export function TitleGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<TitleData[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    topic: "",
    tone: "catchy",
    category: "General",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.topic) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);
    setGeneratedTitles([]);

    try {
      const response = await axios.post("/api/ai/TitleGenerator", formData);

      if (response.data.titles && Array.isArray(response.data.titles)) {
        setGeneratedTitles(response.data.titles);
        toast.success("Titles generated successfully!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.error ||
          "Failed to generate titles. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Title copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 h-full">
      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Title Configuration
            </CardTitle>
            <CardDescription>
              Enter your topic to generate catchy headlines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Keyword</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g., Digital Marketing"
                value={formData.topic}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => handleSelectChange("tone", value)}
              >
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="catchy">Catchy & Viral</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="seo">SEO Optimized</SelectItem>
                  <SelectItem value="question">Question Based</SelectItem>
                  <SelectItem value="dramatic">Dramatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Titles
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Generated Titles
            </CardTitle>
            <CardDescription>
              Click on a title to copy it to your clipboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[600px] pr-2">
            {generatedTitles.length > 0 ? (
              <div className="space-y-4">
                {generatedTitles.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all group relative"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <p className="text-base font-semibold leading-tight">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.reasoning}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                            item.score >= 90
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : item.score >= 75
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          <TrendingUp className="h-3 w-3" />
                          {item.score}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(item.title, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-[10px] px-2 h-5 font-normal"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-md border-muted">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Sparkles className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">No titles generated yet</p>
                <p className="text-sm">
                  Enter a topic and click generate to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
