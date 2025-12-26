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
import {
  Download,
  ImageIcon,
  Loader2,
  Scissors,
  Upload,
  X,
  RefreshCw,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import axios from "axios";
import { CldImage } from "next-cloudinary";
import { Input } from "./ui/input";

export function BackgroundRemoval() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [mode, setMode] = useState<"remove" | "replace">("remove");
  const [bgPrompt, setBgPrompt] = useState("");
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

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;
    if (mode === "replace" && !bgPrompt) {
      toast.error("Please describe the new background");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post("/api/ai/BackgroundRemoval", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProcessedImage(response.data.url);
      if (response.data.publicId) {
        setPublicId(response.data.publicId);
      }
      toast.success(
        mode === "remove"
          ? "Background removed successfully!"
          : "Background replaced successfully!"
      );
    } catch (error: any) {
      console.error("Background processing error:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to process image. Please try again."
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
      link.download = `removed-bg-${Date.now()}.png`;
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
    setBgPrompt("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 h-full">
      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Upload an image to remove or replace its background automatically.
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
                Remove Background
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "replace"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMode("replace")}
              >
                Replace Background
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

            {mode === "replace" && (
              <div className="space-y-2">
                <Label htmlFor="bgPrompt">New Background Description</Label>
                <Input
                  id="bgPrompt"
                  placeholder="e.g., A sunny beach, a modern office, outer space..."
                  value={bgPrompt}
                  onChange={(e) => setBgPrompt(e.target.value)}
                  disabled={!selectedImage}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleRemoveBackground}
              disabled={
                isLoading || !selectedImage || (mode === "replace" && !bgPrompt)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {mode === "remove" ? (
                    <Scissors className="mr-2 h-4 w-4" />
                  ) : (
                    <Palette className="mr-2 h-4 w-4" />
                  )}
                  {mode === "remove"
                    ? "Remove Background"
                    : "Replace Background"}
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
          <CardContent className="flex-1 flex items-center justify-center min-h-[400px] bg-[url('https://media.istockphoto.com/id/1226478932/vector/checkered-transparent-background-vector-seamless-pattern.jpg?s=612x612&w=0&k=20&c=O_70rQ835194uX2b_coI3Xj8jD7D9Kq_zSc8Jg6_z9E=')] bg-repeat rounded-lg m-4 border-2 border-dashed border-muted relative overflow-hidden">
            {isLoading ? (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">
                  Removing background...
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
                  removeBackground={mode === "remove"}
                  replaceBackground={mode === "replace" ? bgPrompt : undefined}
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
              <div className="flex flex-col items-center justify-center text-muted-foreground bg-background/90 p-8 rounded-xl">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Scissors className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">No image processed yet</p>
                <p className="text-sm">
                  Upload an image and click remove background to see the result.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
