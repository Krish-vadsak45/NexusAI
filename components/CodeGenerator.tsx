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
  Code2,
  // Loader2 removed - using InlineLoader
  Copy,
  Check,
  Terminal,
  Sparkles,
  Download,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { InlineLoader } from "./InlineLoader";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ProjectSelector } from "@/components/ProjectSelector";
import { TemplateLibrary } from "@/components/templates/TemplateLibrary";
import { SaveTemplateDialog } from "@/components/templates/SaveTemplateDialog";

export function CodeGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [generatedCode, setGeneratedCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [activeTab, setActiveTab] = useState<"code" | "explanation">("code");
  const [copied, setCopied] = useState(false);

  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  const handleTemplateSelect = (content: string, metadata?: any) => {
    setPrompt(content);
    if (metadata?.language) setLanguage(metadata.language);
  };

  const handleGenerate = async () => {
    if (!selectedProjectId || selectedProjectId === "none") {
      toast.error("Please select a project to continue");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Please describe the code you want to generate");
      return;
    }

    setIsLoading(true);
    setGeneratedCode("");
    setExplanation("");
    setActiveTab("code");

    try {
      const response = await axios.post("/api/ai/CodeGenerator", {
        prompt,
        language,
      });

      setGeneratedCode(response.data.content.code);
      setExplanation(response.data.content.explanation);

      // Save to history
      await axios.post("/api/history", {
        tool: "Code Generator",
        title: prompt.substring(0, 50) + "...",
        input: { prompt, language },
        output: response.data.content,
        projectId: selectedProjectId === "none" ? undefined : selectedProjectId,
      });

      toast.success("Code generated and saved!");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to generate code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedCode) return;

    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      c: "c",
      cpp: "cpp",
      react: "jsx",
      sql: "sql",
      html: "html",
    };

    const extension = extensions[language] || "txt";
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-code.${extension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("File downloaded successfully");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 h-full">
      <TemplateLibrary
        open={showTemplateLibrary}
        onOpenChange={setShowTemplateLibrary}
        category="code-generator"
        onSelectCallback={handleTemplateSelect}
      />

      <SaveTemplateDialog
        open={showSaveTemplate}
        onOpenChange={setShowSaveTemplate}
        category="code-generator"
        content={prompt}
        metadata={{ language }}
      />
      <div className="space-y-6">
        <Card className="h-full flex flex-col">
          <div className="p-4 space-y-2">
            <Label>Save to Project</Label>
            <ProjectSelector
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            />
          </div>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                Code Requirements
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateLibrary(true)}
              >
                Templates
              </Button>
            </div>
            <CardDescription>
              Describe the functionality or component you need.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Requirement Prompt</Label>
                {prompt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveTemplate(true)}
                  >
                    Save Template
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="e.g., Create a React hook for handling local storage with expiration..."
                className="min-h-[250px] resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Programming Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="html">HTML/CSS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <InlineLoader className="mr-2 h-4 w-4" />
                  Generating Code...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Code
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                Generated Output
              </CardTitle>
              <CardDescription>
                Your AI-generated code and explanation.
              </CardDescription>
            </div>
            {generatedCode && (
              <div className="flex items-center gap-2">
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant={activeTab === "code" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("code")}
                    className="h-7 text-xs"
                  >
                    <Code2 className="mr-1.5 h-3.5 w-3.5" />
                    Code
                  </Button>
                  <Button
                    variant={
                      activeTab === "explanation" ? "secondary" : "ghost"
                    }
                    size="sm"
                    onClick={() => setActiveTab("explanation")}
                    className="h-7 text-xs"
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Explain
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px] relative group">
            {generatedCode ? (
              <div className="relative h-full flex flex-col">
                {activeTab === "code" ? (
                  <>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleDownload}
                        className="h-8"
                      >
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopy}
                        className="h-8"
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-3 w-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="h-full rounded-lg overflow-hidden border bg-[#1d1f21]">
                      <SyntaxHighlighter
                        language={language === "react" ? "jsx" : language}
                        style={atomDark}
                        customStyle={{
                          margin: 0,
                          padding: "1.5rem",
                          height: "100%",
                          fontSize: "0.875rem",
                          lineHeight: "1.5",
                          background: "transparent",
                        }}
                        wrapLongLines={true}
                      >
                        {generatedCode}
                      </SyntaxHighlighter>
                    </div>
                  </>
                ) : (
                  <div className="h-full p-6 rounded-lg border bg-muted/30 overflow-auto prose dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-2">
                      Code Explanation
                    </h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                      {explanation || "No explanation available."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg border-muted">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Code2 className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">No code generated yet</p>
                <p className="text-sm text-center max-w-xs">
                  Describe your requirements and select a language to generate
                  code.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
