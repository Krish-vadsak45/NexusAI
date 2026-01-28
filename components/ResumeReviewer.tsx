"use client";

import { useState, useRef } from "react";
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
  FileText,
  // Loader2 removed - using InlineLoader
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { InlineLoader } from "./InlineLoader";
import axios from "axios";
import { useUploadThing } from "@/lib/uploadthing";
import { ProjectSelector } from "@/components/ProjectSelector";

interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export function ResumeReviewer() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      toast.success("uploaded successfully!");
    },
    onUploadError: () => {
      toast.error("error occurred while uploading");
    },
    // onUploadBegin: ({ file }) => {
    //   toast.info("upload has begun for", file);
    // },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File | undefined) => {
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedProjectId || selectedProjectId === "none") {
      toast.error("Please select a project to continue");
      return;
    }
    if (!selectedFile) return;

    setIsLoading(true);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (jobDescription) {
        formData.append("jobDescription", jobDescription);
      }
      const resp = await startUpload([selectedFile]);

      if (!resp || resp.length === 0) {
        throw new Error("Failed to upload resume");
      }

      const fileUrl = resp[0].url;

      const response = await axios.post("/api/ai/ResumeReviewer", {
        fileUrl,
        jobDescription,
        fileType: selectedFile.type,
      });

      setAnalysis(response.data);

      await axios.post("/api/history", {
        tool: "Resume Reviewer",
        title: `Resume Analysis: ${selectedFile.name}`,
        input: {
          fileName: selectedFile.name,
          jobDescription: jobDescription.substring(0, 100) + "...",
        },
        output: response.data,
        projectId: selectedProjectId === "none" ? undefined : selectedProjectId,
      });

      toast.success("Resume analyzed successfully!");
    } catch (error: any) {
      console.error("Resume analysis error:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to analyze resume. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 h-full">
      <div className="space-y-6">
        <Card className="p-4 space-y-2">
          <div>
            <Label>Save to Project</Label>
            <ProjectSelector
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Resume
            </CardTitle>
            <CardDescription>
              Upload your resume (PDF, DOCX) for AI-powered analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer ${
                selectedFile ? "border-primary/50 bg-muted/20" : "border-muted"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div className="flex items-center justify-between p-4 bg-background rounded-md border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium truncate max-w-[200px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      Click or drag resume here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF, DOCX, TXT (Max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-desc">
                Target Job Description (Optional)
              </Label>
              <Textarea
                id="job-desc"
                placeholder="Paste the job description here to get tailored feedback..."
                className="h-32 resize-none"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={isLoading || !selectedFile}
            >
              {isLoading ? (
                <>
                  <InlineLoader className="mr-2 h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Trophy className="mr-2 h-4 w-4" />
                  Analyze Resume
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
              <Briefcase className="h-5 w-5 text-primary" />
              Analysis Report
            </CardTitle>
            <CardDescription>
              Detailed feedback and actionable insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[600px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
                <InlineLoader className="h-12 w-12" />
                <p className="text-muted-foreground animate-pulse">
                  Scanning your resume...
                </p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Overall Score
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {analysis.score}/100
                    </p>
                  </div>
                  <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center text-xl font-bold">
                    {analysis.score}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex gap-2"
                        >
                          <span className="text-green-500">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" /> Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex gap-2"
                        >
                          <span className="text-red-500">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold flex items-center gap-2 text-blue-600">
                    <Trophy className="h-4 w-4" /> Recommended Improvements
                  </h3>
                  <ul className="space-y-2">
                    {analysis.improvements.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md text-blue-700 dark:text-blue-300"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-md border-muted">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">No resume analyzed yet</p>
                <p className="text-sm">Upload your resume to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
