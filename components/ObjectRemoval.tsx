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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  ImageIcon,
  // Loader2 removed - using InlineLoader
  Eraser,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";
import { InlineLoader } from "./InlineLoader";
import { toast } from "sonner";
import Image from "next/image";
import axios from "axios";
import { CldImage } from "next-cloudinary";
import { ProjectSelector } from "@/components/ProjectSelector";

export function ObjectRemoval() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [objectDescription, setObjectDescription] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [mode, setMode] = useState<"remove" | "replace">("remove");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedFile(file);
      setProcessedImage(null);
      setPublicId(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedFile(file);
      setProcessedImage(null);
      setPublicId(null);
    }
  };

  const handleRemoveObject = async () => {
    if (!selectedProjectId || selectedProjectId === "none") {
      toast.error("Please select a project to continue");
      return;
    }
    if (!selectedFile) return;
    if (!objectDescription) {
      toast.error("Please describe the object to process");
      return;
    }
    if (mode === "replace" && !replaceWith) {
      toast.error("Please describe what to replace the object with");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post("/api/ai/ObjectRemoval", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.publicId) {
        setPublicId(response.data.publicId);
      }

      await axios.post("/api/history", {
        tool: "Object Removal",
        title:
          mode === "remove"
            ? `Remove: ${objectDescription}`
            : `Replace: ${objectDescription} with ${replaceWith}`,
        input: {
          mode,
          objectDescription,
          replaceWith,
          originalImage: selectedFile.name,
        },
        output: {
          publicId: response.data.publicId,
          mode,
          objectDescription,
          replaceWith,
          url: response.data.url,
        },
        projectId: selectedProjectId === "none" ? undefined : selectedProjectId,
      });

      toast.success(
        mode === "remove"
          ? "Object removed successfully!"
          : "Object replaced successfully!",
      );
    } catch (error: any) {
      console.error("Object processing error:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to process object. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!processedImage) return;

    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `object-removed-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setProcessedImage(null);
    setPublicId(null);
    setObjectDescription("");
    setReplaceWith("");
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
              Upload Image
            </CardTitle>
            <CardDescription>
              Upload an image and describe what you want to remove or replace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex p-1 bg-muted rounded-lg">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "remove"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMode("remove")}
              >
                Remove Object
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "replace"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMode("replace")}
              >
                Replace Object
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer ${
                selectedImage ? "border-primary/50 bg-muted/20" : "border-muted"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !selectedImage && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              {selectedImage ? (
                <div className="relative aspect-video w-full max-h-[300px] mx-auto">
                  <Image
                    src={selectedImage}
                    alt="Selected"
                    fill
                    className="object-contain rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
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
                      Click or drag image here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports JPG, PNG, WEBP (Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="object">
                Object to {mode === "remove" ? "Remove" : "Replace"}
              </Label>
              <Input
                id="object"
                placeholder={
                  mode === "remove"
                    ? "e.g., The red car, the person on the left..."
                    : "e.g., The red car"
                }
                value={objectDescription}
                onChange={(e) => setObjectDescription(e.target.value)}
                disabled={!selectedImage}
              />
            </div>

            {mode === "replace" && (
              <div className="space-y-2">
                <Label htmlFor="replaceWith">Replace with</Label>
                <Input
                  id="replaceWith"
                  placeholder="e.g., A blue truck"
                  value={replaceWith}
                  onChange={(e) => setReplaceWith(e.target.value)}
                  disabled={!selectedImage}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleRemoveObject}
              disabled={
                isLoading ||
                !selectedImage ||
                !objectDescription ||
                (mode === "replace" && !replaceWith)
              }
            >
              {isLoading ? (
                <>
                  <InlineLoader className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                <>
                  {mode === "remove" ? (
                    <Eraser className="mr-2 h-4 w-4" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {mode === "remove" ? "Remove Object" : "Replace Object"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Result
            </CardTitle>
            {processedImage && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[400px] bg-muted/20 rounded-lg m-4 border-2 border-dashed border-muted relative overflow-hidden">
            {isLoading ? (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
                <InlineLoader className="h-12 w-12" />
                <p className="text-muted-foreground animate-pulse">
                  Removing object...
                </p>
              </div>
            ) : null}

            {publicId ? (
              <div className="relative w-full h-full min-h-[400px]">
                <CldImage
                  src={publicId}
                  alt="Processed"
                  fill
                  className="object-contain rounded-lg"
                  remove={mode === "remove" ? objectDescription : undefined}
                  replace={
                    mode === "replace"
                      ? [objectDescription, replaceWith]
                      : undefined
                  }
                />
              </div>
            ) : processedImage ? (
              <div className="relative w-full h-full min-h-[400px]">
                <Image
                  src={processedImage}
                  alt="Processed"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Eraser className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">No image processed yet</p>
                <p className="text-sm">
                  Upload an image and describe the object to remove.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
