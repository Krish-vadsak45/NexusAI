"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Search,
  Star,
  Copy,
  GitFork,
  Trash2,
  Eye,
  Plus,
  ArrowRight,
  Clock,
  User as UserIcon,
  Tag,
  ChevronRight,
  History,
  Info,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Template {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  category: string;
  userId: { _id: string; name: string; image?: string };
  versions: any[];
  currentVersion: number;
  ratingSum: number;
  ratingCount: number;
  createdAt: string;
}

interface TemplateLibraryProps {
  category: string;
  onSelectCallback: (content: string, metadata?: any) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TemplateLibrary({
  category,
  onSelectCallback,
  open,
  onOpenChange,
}: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 'public', 'mine'
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/templates`, {
        params: { category, search, filter },
      });
      setTemplates(data.templates);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, search, filter]);

  const handleSelect = (template: Template) => {
    // Get latest version content
    const latest = template.versions[template.versions.length - 1]; // Simplified
    onSelectCallback(latest.content, latest.metadata);
    toast.success(`Loaded template: ${template.title}`);
    onOpenChange?.(false);
  };

  const handleFork = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.post(`/api/templates/${templateId}/fork`);
      toast.success("Template forked successfully");
      fetchTemplates(); // Refresh to see the fork
    } catch (error) {
      toast.error("Failed to fork template");
    }
  };

  const handleDelete = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await axios.delete(`/api/templates/${templateId}`);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const renderRating = (sum: number, count: number) => {
    if (count === 0)
      return <span className="text-xs text-muted-foreground">No ratings</span>;
    const avg = (sum / count).toFixed(1);
    return (
      <div className="flex items-center space-x-1">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        <span className="text-xs font-medium">
          {avg} ({count})
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl">
        <div className="flex flex-1 overflow-hidden bg-background">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/30 hidden md:flex flex-col p-6 gap-6">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight">
                Library
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-none">
                Browse and manage prompt templates.
              </DialogDescription>
            </div>

            <nav className="flex flex-col gap-2">
              <Button
                variant={filter === "all" ? "secondary" : "ghost"}
                className="justify-start gap-2"
                onClick={() => setFilter("all")}
              >
                <Eye className="h-4 w-4" />
                All Templates
              </Button>
              <Button
                variant={filter === "mine" ? "secondary" : "ghost"}
                className="justify-start gap-2"
                onClick={() => setFilter("mine")}
              >
                <UserIcon className="h-4 w-4" />
                My Templates
              </Button>
              <Button
                variant={filter === "public" ? "secondary" : "ghost"}
                className="justify-start gap-2"
                onClick={() => setFilter("public")}
              >
                <Star className="h-4 w-4 text-yellow-500" />
                Community
              </Button>
            </nav>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                >
                  #writing
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                >
                  #seo
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                >
                  #blogging
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                >
                  #scripts
                </Badge>
              </div>
            </div>

            <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs font-medium text-primary mb-1 italic">
                Pro Tip
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Fork community templates to customize them for your own needs.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            <DialogHeader className="p-6 border-b bg-background z-10">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prompts, tags, or authors..."
                    className="pl-10 h-11 bg-muted/50 border-none ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary/20 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[140px] md:hidden">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="mine">Mine</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchTemplates}
                    disabled={loading}
                    className="rounded-lg h-11 w-11"
                  >
                    <History
                      className={cn("h-4 w-4", loading && "animate-spin")}
                    />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1">
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-[220px] rounded-2xl bg-muted/50 animate-pulse border border-muted"
                      />
                    ))
                  ) : templates.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        No templates found
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs mt-1">
                        Try adjusting your search or filters to find what you're
                        looking for.
                      </p>
                    </div>
                  ) : (
                    templates.map((template) => (
                      <Card
                        key={template._id}
                        className="group cursor-pointer border-muted-foreground/10 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col relative overflow-hidden bg-card/50"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        {/* Gradient border effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <CardHeader className="pb-3 relative space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1.5 overflow-hidden flex-1">
                              <CardTitle className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                {template.title}
                              </CardTitle>
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1.5 py-0 uppercase tracking-tighter font-bold bg-primary/10 text-primary border-none"
                                >
                                  {template.category.replace("-", " ")}
                                </Badge>
                                {template.isPublic && (
                                  <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-none text-[9px] px-1.5 py-0 uppercase tracking-tighter">
                                    Community
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="bg-muted p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pb-4 flex-1 relative">
                          <p className="text-[11px] text-muted-foreground line-clamp-3 h-12 leading-relaxed mb-4">
                            {template.description ||
                              "No description provided for this template."}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            {template.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-muted-foreground/5"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </CardContent>

                        <Separator className="bg-muted-foreground/5" />

                        <CardFooter className="py-3 px-4 flex items-center justify-between text-[11px] bg-muted/10 relative">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-primary/80 to-purple-500/80 flex items-center justify-center text-[9px] text-white font-bold ring-1 ring-background">
                              {template.userId?.name?.charAt(0) || "U"}
                            </div>
                            <span className="font-semibold text-foreground/60 truncate max-w-[70px]">
                              {template.userId?.name || "User"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderRating(
                              template.ratingSum,
                              template.ratingCount,
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Detailed Preview Modal */}
        {selectedTemplate && (
          <Dialog
            open={!!selectedTemplate}
            onOpenChange={(val) => !val && setSelectedTemplate(null)}
          >
            <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl rounded-2xl">
              <div className="bg-primary/5 p-8 border-b relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 rounded-full"
                  onClick={() => setSelectedTemplate(null)}
                >
                  <Plus className="h-5 w-5 rotate-45" />
                </Button>

                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
                    {selectedTemplate.category.replace("-", " ")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />v
                    {selectedTemplate.currentVersion} •{" "}
                    {formatDistanceToNow(new Date(selectedTemplate.createdAt))}{" "}
                    ago
                  </span>
                </div>

                <DialogTitle className="text-3xl font-black tracking-tight mb-2 text-foreground">
                  {selectedTemplate.title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                  {selectedTemplate.description ||
                    "Create high-quality content using this pre-configured AI prompt template."}
                </DialogDescription>

                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted border flex items-center justify-center text-xs font-bold shrink-0">
                      {selectedTemplate.userId?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col gap-0">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
                        Created By
                      </span>
                      <span className="text-xs font-semibold">
                        {selectedTemplate.userId?.name || "System"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 text-yellow-600">
                      <Star className="h-4 w-4 fill-yellow-500" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
                        Community Rating
                      </span>
                      <span className="text-xs font-semibold">
                        {selectedTemplate.ratingSum > 0
                          ? (
                              selectedTemplate.ratingSum /
                              selectedTemplate.ratingCount
                            ).toFixed(1)
                          : "0.0"}
                        <span className="text-muted-foreground font-normal ml-1">
                          ({selectedTemplate.ratingCount} reviews)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-8 grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground capitalize">
                        <FileText className="h-4 w-4 text-primary" />
                        Prompt Configuration
                      </div>
                      <div className="bg-muted p-5 rounded-xl border relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-3 top-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const content =
                              selectedTemplate.versions[
                                selectedTemplate.versions.length - 1
                              ]?.content;
                            navigator.clipboard.writeText(content);
                            toast.success("Copied to clipboard");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-auto scrollbar-hide">
                          {
                            selectedTemplate.versions[
                              selectedTemplate.versions.length - 1
                            ]?.content
                          }
                        </pre>
                      </div>
                    </div>

                    {selectedTemplate.tags.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                          <Tag className="w-3 h-3" />
                          Tags
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-muted border-none hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-muted/30 p-5 rounded-xl border border-dashed flex flex-col gap-4">
                      <div className="text-sm font-bold flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Details
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs py-1 border-b border-muted transition-colors hover:bg-muted/50">
                          <span className="text-muted-foreground">
                            Visibility
                          </span>
                          <span className="font-semibold">
                            {selectedTemplate.isPublic ? "Public" : "Private"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-muted transition-colors hover:bg-muted/50">
                          <span className="text-muted-foreground">Version</span>
                          <span className="font-semibold">
                            v{selectedTemplate.currentVersion}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs py-1 transition-colors hover:bg-muted/50">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-semibold uppercase tracking-tighter">
                            AI Tool
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <Button
                        onClick={() => handleSelect(selectedTemplate)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl group"
                      >
                        Use Template
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="gap-2 h-11 rounded-xl"
                          onClick={(e) => handleFork(selectedTemplate._id, e)}
                        >
                          <GitFork className="h-4 w-4" />
                          Fork
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2 h-11 rounded-xl text-destructive hover:bg-destructive/5"
                          onClick={(e) => {
                            handleDelete(selectedTemplate._id, e);
                            setSelectedTemplate(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 bg-muted/20 border-t text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">
                  Prompt Template Library v1.0
                </p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
