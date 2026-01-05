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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ImageIcon, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import axios from "axios";

export function ImageGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    prompt: "",
    style: "realistic",
    resolution: "1024x1024",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnhancePrompt = async () => {
    if (!formData.prompt) {
      toast.error("Please enter a prompt to enhance");
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await axios.post("/api/ai/enhance-prompt", {
        prompt: formData.prompt,
      });

      setFormData((prev) => ({
        ...prev,
        prompt: response.data.enhancedPrompt,
      }));
      toast.success("Prompt enhanced!");
    } catch (error) {
      toast.error("Failed to enhance prompt");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.prompt) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const response = await axios.post("/api/ai/ImageGeneration", {
        prompt: formData.prompt,
        style: formData.style,
        size: formData.resolution,
      });

      setGeneratedImage(response.data.url);

      await axios.post("/api/history", {
        tool: "Image Generation",
        title: formData.prompt,
        input: {
          prompt: formData.prompt,
          style: formData.style,
          resolution: formData.resolution,
        },
        output: response.data.url,
      });

      toast.success("Image generated successfully!");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to generate image. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 h-full">
      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Image Configuration
            </CardTitle>
            <CardDescription>
              Describe the image you want to generate in detail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt">Prompt</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-primary"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !formData.prompt}
                >
                  {isEnhancing ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-3 w-3" />
                  )}
                  Enhance Prompt
                </Button>
              </div>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder="A futuristic city with flying cars at sunset, cyberpunk style..."
                className="h-32 resize-none"
                value={formData.prompt}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value) => handleSelectChange("style", value)}
                >
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="digital-art">Digital Art</SelectItem>
                    <SelectItem value="oil-painting">Oil Painting</SelectItem>
                    <SelectItem value="3d-render">3D Render</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Aspect Ratio</Label>
                <Select
                  value={formData.resolution}
                  onValueChange={(value) =>
                    handleSelectChange("resolution", value)
                  }
                >
                  <SelectTrigger id="resolution">
                    <SelectValue placeholder="Select ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">Square (1:1)</SelectItem>
                    <SelectItem value="1216x832">Landscape (3:2)</SelectItem>
                    <SelectItem value="832x1216">Portrait (2:3)</SelectItem>
                    <SelectItem value="1344x768">Wide (16:9)</SelectItem>
                    <SelectItem value="768x1344">Tall (9:16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  Generate Image
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
              Generated Result
            </CardTitle>
            {generatedImage && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[400px] bg-muted/20 rounded-lg m-4 border-2 border-dashed border-muted relative overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">
                  Creating your masterpiece...
                </p>
              </div>
            ) : generatedImage ? (
              <div className="relative w-full h-full min-h-[400px]">
                <Image
                  src={generatedImage}
                  alt={formData.prompt}
                  fill
                  className="object-contain rounded-lg"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <ImageIcon className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">No image generated yet</p>
                <p className="text-sm">
                  Enter a prompt and click generate to see the magic happen.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
