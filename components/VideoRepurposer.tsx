"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CldUploadWidget } from "next-cloudinary";
import axios from "axios";

export function VideoRepurposer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoName, setVideoName] = useState<string>("");

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      context: formData.get("context"),
      tone: formData.get("tone"),
      videoUrl: videoUrl,
    };

    try {
      const res = await axios.post("/api/ai/VideoRepurposer", data);

      setResult(res.data.content);

      await axios.post("/api/history", {
        tool: "Video Repurposer",
        title: data.title as string,
        input: {
          title: data.title,
          context: data.context,
          tone: data.tone,
          videoUrl: data.videoUrl,
        },
        output: res.data.content,
      });

      toast.success("Content generated successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-6 w-6"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>AI Video Repurposer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Title / Idea</label>
              <Input
                name="title"
                placeholder="e.g., How to learn coding in 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Upload Video (Optional)
              </label>
              <div className="flex items-center gap-4">
                {uploadPreset ? (
                  <CldUploadWidget
                    uploadPreset={uploadPreset}
                    onSuccess={(result: any) => {
                      setVideoUrl(result.info.secure_url);
                      setVideoName(result.info.original_filename);
                      toast.success("Video uploaded successfully!");
                    }}
                    options={{
                      resourceType: "video",
                      clientAllowedFormats: ["mp4", "mov", "avi"],
                      maxFileSize: 100000000, // 100MB limit for demo
                    }}
                  >
                    {({ open }) => (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => open()}
                        className="w-full border-dashed"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {videoName
                          ? `Uploaded: ${videoName}`
                          : "Upload Video to Cloudinary"}
                      </Button>
                    )}
                  </CldUploadWidget>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      toast.error(
                        "Configuration Error: Missing NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env file"
                      )
                    }
                    className="w-full border-dashed border-red-300 bg-red-50 hover:bg-red-100 text-red-600"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Configure Cloudinary Preset
                  </Button>
                )}
              </div>
              {videoUrl && (
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <Video className="h-3 w-3 mr-1" /> Video ready for analysis
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Key Points / Rough Notes
              </label>
              <Textarea
                name="context"
                placeholder="Paste your rough notes, transcript, or key takeaways here..."
                className="h-32"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select name="tone" defaultValue="Exciting">
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exciting">Exciting & Viral</SelectItem>
                  <SelectItem value="Professional">
                    Professional & Educational
                  </SelectItem>
                  <SelectItem value="Funny">Funny & Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
                  Content...
                </>
              ) : (
                "Repurpose Content"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Viral Titles */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Viral Title Options</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.titles.map((t: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <span>{t}</span>
                    <CopyButton text={t} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* YouTube Description */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>YouTube Description</CardTitle>
              <CopyButton text={result.youtube.description} />
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm h-64 overflow-y-auto p-2 border rounded">
                {result.youtube.description}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.youtube.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shorts Script */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Shorts/Reels Script</CardTitle>
              <CopyButton text={result.shortsScript} />
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm h-64 overflow-y-auto p-2 border rounded">
                {result.shortsScript}
              </div>
            </CardContent>
          </Card>

          {/* Social Posts */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <h4 className="font-semibold">Twitter Thread</h4>{" "}
                  <CopyButton text={result.social.twitter} />
                </div>
                <div className="whitespace-pre-wrap text-sm p-3 bg-muted rounded h-48 overflow-y-auto">
                  {result.social.twitter}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <h4 className="font-semibold">LinkedIn Post</h4>{" "}
                  <CopyButton text={result.social.linkedin} />
                </div>
                <div className="whitespace-pre-wrap text-sm p-3 bg-muted rounded h-48 overflow-y-auto">
                  {result.social.linkedin}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
