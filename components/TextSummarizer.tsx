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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Loader2,
  Copy,
  Check,
  AlignLeft,
  List,
  Sparkles,
  ArrowRight,
  Target,
  ListTodo,
  Baby,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export function TextSummarizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [length, setLength] = useState("medium");
  const [format, setFormat] = useState("paragraph");
  const [focus, setFocus] = useState("standard");
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to summarize");
      return;
    }

    setIsLoading(true);
    setSummary("");

    try {
      const response = await axios.post("/api/ai/TextSummarizer", {
        text: inputText,
        length,
        format,
        focus,
      });

      setSummary(response.data.summary);

      // Save to history
      await axios.post("/api/history", {
        tool: "Text Summarizer",
        title: inputText.substring(0, 50) + "...",
        input: { text: inputText, length, format, focus },
        output: response.data.summary,
      });

      toast.success("Text summarized and saved!");
    } catch (error: any) {
      console.error("Summarization error:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to generate summary. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Summary copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2 h-full">
      <div className="space-y-6">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Input Text
            </CardTitle>
            <CardDescription>
              Paste your article, document, or text below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
              <Textarea
                placeholder="Enter or paste your text here..."
                className="flex-1 resize-none p-4"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex justify-end text-xs text-muted-foreground">
                {wordCount} words
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
              <div className="space-y-2">
                <Label>Focus</Label>
                <Select value={focus} onValueChange={setFocus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" /> Standard
                      </div>
                    </SelectItem>
                    <SelectItem value="action-items">
                      <div className="flex items-center gap-2">
                        <ListTodo className="h-4 w-4" /> Action Items
                      </div>
                    </SelectItem>
                    <SelectItem value="eli5">
                      <div className="flex items-center gap-2">
                        <Baby className="h-4 w-4" /> Simplified
                      </div>
                    </SelectItem>
                    <SelectItem value="key-takeaways">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" /> Key Takeaways
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraph">
                      <div className="flex items-center gap-2">
                        <AlignLeft className="h-4 w-4" /> Paragraph
                      </div>
                    </SelectItem>
                    <SelectItem value="bullet-points">
                      <div className="flex items-center gap-2">
                        <List className="h-4 w-4" /> Bullet Points
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full mt-20"
              onClick={handleSummarize}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Summarize Text
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
              <AlignLeft className="h-5 w-5 text-primary" />
              Summary Result
            </CardTitle>
            <CardDescription>
              AI-generated summary of your content.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {summary ? (
              <div className="h-full p-4 rounded-lg bg-muted/30 border text-sm leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg border-muted min-h-[300px]">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <ArrowRight className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">No summary yet</p>
                <p className="text-sm text-center max-w-xs">
                  Enter text and click summarize to see the result here.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between border-t pt-6">
            <div className="text-sm text-muted-foreground">
              {summary ? `${summary.split(/\s+/).length} words` : ""}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!summary}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Summary
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
