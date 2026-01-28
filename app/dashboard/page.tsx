"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  // Loader2 replaced by InlineLoader
  History as HistoryIcon,
  FileText,
  Type,
  Code2,
  FileType,
  Calendar,
  ArrowRight,
  X,
  ImageIcon,
  Scissors,
  Eraser,
  Video,
  Briefcase,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { InlineLoader } from "@/components/InlineLoader";
import { CldImage } from "next-cloudinary";

interface HistoryItem {
  _id: string;
  tool: string;
  title: string;
  createdAt: string;
  input: any;
  output: any;
}

export default function Dashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get("/api/history");
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getIcon = (tool: string) => {
    switch (tool) {
      case "Article Writer":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "Title Generator":
        return <Type className="h-5 w-5 text-purple-500" />;
      case "Text Summarizer":
        return <FileType className="h-5 w-5 text-orange-500" />;
      case "Code Generator":
        return <Code2 className="h-5 w-5 text-green-500" />;
      case "Image Generation":
        return <ImageIcon className="h-5 w-5 text-pink-500" />;
      case "Background Removal":
        return <Scissors className="h-5 w-5 text-indigo-500" />;
      case "Object Removal":
        return <Eraser className="h-5 w-5 text-red-500" />;
      case "Resume Reviewer":
        return <Briefcase className="h-5 w-5 text-yellow-500" />;
      case "Video Repurposer":
        return <Video className="h-5 w-5 text-cyan-500" />;
      default:
        return <HistoryIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderInput = (item: HistoryItem) => {
    const input = item.input;
    if (!input) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <span className="h-px w-4 bg-muted-foreground/50"></span>
          Input Parameters
          <span className="h-px flex-1 bg-muted-foreground/20"></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
          {Object.entries(input).map(([key, value]) => {
            if (
              key === "text" ||
              key === "prompt" ||
              key === "context" ||
              key === "jobDescription"
            )
              return null;
            return (
              <div key={key} className="flex flex-col space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {key}
                </span>
                <span className="text-sm font-medium bg-background px-2 py-1 rounded border w-fit max-w-full truncate">
                  {String(value)}
                </span>
              </div>
            );
          })}
          {(input.text ||
            input.prompt ||
            input.context ||
            input.jobDescription) && (
            <div className="col-span-1 md:col-span-2 flex flex-col space-y-1 mt-1">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {input.prompt
                  ? "Prompt"
                  : input.context
                    ? "Context"
                    : input.jobDescription
                      ? "Job Description"
                      : "Input Text"}
              </span>
              <div className="text-sm bg-background p-3 rounded-md border whitespace-pre-wrap max-h-40 overflow-y-auto shadow-sm">
                {input.text ||
                  input.prompt ||
                  input.context ||
                  input.jobDescription}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOutput = (item: HistoryItem) => {
    let content;

    if (item.tool === "Article Writer") {
      content = (
        <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-6 rounded-lg border shadow-sm">
          <ReactMarkdown>{item.output.article || ""}</ReactMarkdown>
        </div>
      );
    } else if (item.tool === "Title Generator") {
      content = (
        <ul className="grid gap-3 sm:grid-cols-2">
          {Array.isArray(item.output) &&
            item.output.map((title: any, idx: number) => (
              <li
                key={idx}
                className="p-4 bg-background rounded-lg border shadow-sm flex items-start gap-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {idx + 1}
                </span>
                <span className="font-medium leading-tight">{title.title}</span>
              </li>
            ))}
        </ul>
      );
    } else if (item.tool === "Code Generator") {
      content = (
        <div className="space-y-4">
          <div className="relative rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
              <span className="text-xs font-medium text-muted-foreground">
                Generated Code
              </span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono">
              <code>{item.output.code}</code>
            </pre>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
              Explanation
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              {item.output.explanation}
            </p>
          </div>
        </div>
      );
    } else if (item.tool === "Text Summarizer") {
      content = (
        <div className="bg-background p-6 rounded-lg border shadow-sm">
          <p className="text-sm leading-relaxed">{item.output}</p>
        </div>
      );
    } else if (item.tool === "Image Generation") {
      content = (
        <div className="relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden border shadow-sm bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.output}
            alt={item.title}
            className="object-contain w-full h-full"
          />
        </div>
      );
    } else if (
      item.tool === "Background Removal" ||
      item.tool === "Object Removal"
    ) {
      content = (
        <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden border shadow-sm bg-[url('https://media.istockphoto.com/id/1226478932/vector/checkered-transparent-background-vector-seamless-pattern.jpg?s=612x612&w=0&k=20&c=O_70rQ835194uX2b_coI3Xj8jD7D9Kq_zSc8Jg6_z9E=')] bg-repeat">
          {item.output.publicId ? (
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
        </div>
      );
    } else if (item.tool === "Resume Reviewer") {
      content = (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-background rounded-lg border shadow-sm">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground uppercase font-bold">
                Score
              </div>
              <div className="text-3xl font-bold text-primary">
                {item.output.score}/100
              </div>
            </div>
          </div>
          <div className="bg-background p-6 rounded-lg border shadow-sm">
            <h4 className="font-semibold mb-2">Summary</h4>
            <p className="text-sm text-muted-foreground">
              {item.output.summary}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-100 dark:border-green-900/50">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                Strengths
              </h4>
              <ul className="list-disc list-inside text-sm text-green-600 dark:text-green-300 space-y-1">
                {item.output.strengths?.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-100 dark:border-red-900/50">
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                Weaknesses
              </h4>
              <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 space-y-1">
                {item.output.weaknesses?.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    } else if (item.tool === "Video Repurposer") {
      content = (
        <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-6 rounded-lg border shadow-sm">
          <ReactMarkdown>{item.output || ""}</ReactMarkdown>
        </div>
      );
    } else {
      content = (
        <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto border">
          {JSON.stringify(item.output, null, 2)}
        </pre>
      );
    }

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <span className="h-px w-4 bg-muted-foreground/50"></span>
          Generated Output
          <span className="h-px flex-1 bg-muted-foreground/20"></span>
        </h3>
        {content}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <InlineLoader className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here is your recent activity.
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg border-muted bg-muted/10">
          <HistoryIcon className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No history yet</h3>
          <p className="text-sm text-muted-foreground">
            Start using the tools to see your generated content here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <Dialog key={item._id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {item.tool}
                    </CardTitle>
                    {getIcon(item.tool)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold truncate mb-1">
                      {item.title}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 border-b shrink-0">
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    {getIcon(item.tool)}
                    {item.title}
                  </DialogTitle>
                  <DialogDescription>
                    Generated on {new Date(item.createdAt).toLocaleString()}{" "}
                    using {item.tool}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/10">
                  {renderInput(item)}
                  {renderOutput(item)}
                </div>

                <DialogFooter className="p-4 border-t bg-muted/20 shrink-0 sm:justify-between items-center">
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    ID: {item._id}
                  </div>
                  <DialogClose asChild>
                    <Button
                      size="lg"
                      className="w-full sm:w-auto min-w-[150px]"
                    >
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
