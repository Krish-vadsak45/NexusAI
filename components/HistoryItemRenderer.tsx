"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy, Download, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CldImage } from "next-cloudinary";
import { useState } from "react";
import { toast } from "sonner";

interface HistoryItem {
  _id: string;
  tool: string;
  title: string;
  createdAt: string;
  input: any;
  output: any;
}

interface HistoryItemRendererProps {
  item: HistoryItem;
}

export function HistoryItemRenderer({ item }: HistoryItemRendererProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download");
    }
  };

  if (item.tool === "Article Writer") {
    return (
      <div className="relative group">
        <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="icon"
            className="mt-2 mr-2 bg-background/80 backdrop-blur-sm"
            onClick={() => handleCopy(item.output.article, item._id)}
          >
            {copiedId === item._id ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-background p-8 rounded-xl border shadow-sm">
          <ReactMarkdown>{item.output.article || ""}</ReactMarkdown>
        </div>
      </div>
    );
  } else if (item.tool === "Image Generation") {
    const imageUrl =
      typeof item.output === "string" ? item.output : item.output.url;
    return (
      <div className="group relative aspect-square w-full max-w-md mx-auto rounded-xl overflow-hidden border shadow-sm bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={item.title}
          className="object-contain w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownload(imageUrl, "generated-image.png")}
          >
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </div>
    );
  } else if (item.tool === "Title Generator") {
    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {Array.isArray(item.output) &&
          item.output.map((title: any, idx: number) => (
            <li
              key={idx}
              className="group p-4 bg-background rounded-xl border shadow-sm flex items-start justify-between gap-3 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleCopy(title.title, `${item._id}-${idx}`)}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-medium leading-tight text-foreground/90">
                  {title.title}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2"
              >
                {copiedId === `${item._id}-${idx}` ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </li>
          ))}
      </ul>
    );
  } else if (item.tool === "Code Generator") {
    return (
      <div className="space-y-4">
        <div className="relative rounded-xl border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
            <span className="text-xs font-medium text-muted-foreground font-mono">
              generated_code.{item.input.language || "txt"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-xs"
              onClick={() => handleCopy(item.output.code, item._id)}
            >
              {copiedId === item._id ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy Code
            </Button>
          </div>
          <SyntaxHighlighter
            language={(item.input.language || "javascript").toLowerCase()}
            style={atomDark}
            customStyle={{
              margin: 0,
              padding: "1.5rem",
              fontSize: "0.875rem",
              lineHeight: "1.5",
            }}
            wrapLines={true}
            showLineNumbers={true}
          >
            {item.output.code}
          </SyntaxHighlighter>
        </div>

        {item.output.explanation && (
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              Explanation & Logic
            </h4>
            <p className="text-sm text-blue-600/90 dark:text-blue-300/90 leading-relaxed">
              {item.output.explanation}
            </p>
          </div>
        )}
      </div>
    );
  } else if (item.tool === "Text Summarizer") {
    return (
      <div className="relative group bg-background p-6 rounded-xl border shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleCopy(item.output, item._id)}
        >
          {copiedId === item._id ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">
          Summary
        </h4>
        <p className="text-sm leading-relaxed text-foreground/90">
          {item.output}
        </p>
      </div>
    );
  } else if (item.tool === "Image Generation") {
    return (
      <div className="group relative aspect-square w-full max-w-md mx-auto rounded-xl overflow-hidden border shadow-sm bg-muted/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.output}
          alt={item.title}
          className="object-contain w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownload(item.output, "generated-image.png")}
          >
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </div>
    );
  } else if (
    item.tool === "Background Removal" ||
    item.tool === "Object Removal"
  ) {
    const isCloudinary = !!item.output.publicId;
    return (
      <div className="group relative aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden border shadow-sm bg-[url('https://media.istockphoto.com/id/1226478932/vector/checkered-transparent-background-vector-seamless-pattern.jpg?s=612x612&w=0&k=20&c=O_70rQ835194uX2b_coI3Xj8jD7D9Kq_zSc8Jg6_z9E=')] bg-repeat">
        {isCloudinary ? (
          <CldImage
            src={item.output.publicId}
            alt={item.title}
            fill
            className="object-contain"
            removeBackground={
              item.tool === "Background Removal" &&
              item.output.mode === "remove"
            }
            replaceBackground={
              item.tool === "Background Removal" &&
              item.output.mode === "replace"
                ? item.output.prompt
                : undefined
            }
            remove={
              item.tool === "Object Removal" && item.output.mode === "remove"
                ? item.output.objectDescription
                : undefined
            }
            replace={
              item.tool === "Object Removal" && item.output.mode === "replace"
                ? [item.output.objectDescription, item.output.replaceWith]
                : undefined
            }
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.output.url}
            alt={item.title}
            className="object-contain w-full h-full"
          />
        )}
        {!isCloudinary && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleDownload(item.output.url, "edited-image.png")
              }
            >
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </div>
        )}
      </div>
    );
  } else if (item.tool === "Resume Reviewer") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-background to-muted/20 rounded-xl border shadow-sm">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-8 border-primary/20">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-primary">
                {item.output.score}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Score
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-lg text-foreground/90">
              AI Analysis Summary
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.output.summary}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50/50 dark:bg-green-950/20 p-6 rounded-xl border border-green-100 dark:border-green-900/50 hover:bg-green-50/80 transition-colors">
            <h4 className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400 mb-4">
              <Check className="h-5 w-5" />
              Strengths
            </h4>
            <ul className="space-y-3">
              {item.output.strengths?.map((s: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-green-700/90 dark:text-green-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50/50 dark:bg-red-950/20 p-6 rounded-xl border border-red-100 dark:border-red-900/50 hover:bg-red-50/80 transition-colors">
            <h4 className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400 mb-4">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                <X className="h-3 w-3" />
              </div>
              Weaknesses
            </h4>
            <ul className="space-y-3">
              {item.output.weaknesses?.map((s: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-red-700/90 dark:text-red-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  } else if (item.tool === "Video Repurposer") {
    return (
      <div className="relative group">
        <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="icon"
            className="mt-2 mr-2 bg-background/80 backdrop-blur-sm"
            onClick={() => handleCopy(item.output, item._id)}
          >
            {copiedId === item._id ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-background p-8 rounded-xl border shadow-sm">
          <ReactMarkdown>{item.output || ""}</ReactMarkdown>
        </div>
      </div>
    );
  } else {
    return (
      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto border font-mono">
        {JSON.stringify(item.output, null, 2)}
      </pre>
    );
  }
}
